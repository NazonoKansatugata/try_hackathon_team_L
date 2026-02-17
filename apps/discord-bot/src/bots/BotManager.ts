import { CharacterBot } from './CharacterBot.js';
import { characters, botConfig, ttsConfig, voiceChannelConfig } from '../config/index.js';
import { CharacterType, DailyReport } from '../types/index.js';
import { OllamaClient } from '../ollama/client.js';
import { PromptBuilder } from '../llm/promptBuilder.js';
import { ConversationHistory } from '../conversation/history.js';
import { initializeFirebase, getRandomTheme, saveDailyReport } from '../firebase/firestore.js';
import { ThemeContextFactory, ThemeContextSession } from '../llm/themeContextFactory.js';
import { ReportPromptBuilder } from '../llm/reportPromptBuilder.js';
import { ConversationQualityAnalyzer } from '../analysis/conversationQualityAnalyzer.js';
import { ErrorRecoveryManager } from './errorRecoveryManager.js';
import { VoiceManager } from '../tts/voiceManager.js';

/**
 * 複数のBotを管理するマネージャークラス
 */
export class BotManager {
  private bots: Map<CharacterType, CharacterBot> = new Map();
  private isRunning: boolean = false;
  private isConversationActive: boolean = false;
  private conversationTurnCount: number = 0;

  private readonly REPORT_THRESHOLD = 30; // レポート生成する会話数(いづれ消す)
  private ollamaClient: OllamaClient;
  private conversationHistory: ConversationHistory;
  private themeContextSession: ThemeContextSession | null = null;
  private errorRecoveryManager: ErrorRecoveryManager;
  private isGenerating: boolean = false;
  private shouldCancelGeneration: boolean = false;
  private humanInterventionData: { username: string; content: string } | null = null;
  private voiceManager: VoiceManager | null = null;

  constructor() {
    this.ollamaClient = new OllamaClient();
    this.conversationHistory = new ConversationHistory();
    this.errorRecoveryManager = new ErrorRecoveryManager();
    
    // TTS機能が有効な場合のみVoiceManagerを初期化
    if (ttsConfig.enabled) {
      this.voiceManager = new VoiceManager(ttsConfig.apiUrl);
    }
  }

  /**
   * 全Botの初期化とログイン
   */
  async initialize(): Promise<void> {
    console.log('🚀 Botマネージャーを初期化中...');

    try {
      // 各キャラクターのBotを作成
      for (const config of characters) {
        const bot = new CharacterBot(config);
        this.bots.set(config.type, bot);
      }

      // 順次ログイン（並列だとレート制限に引っかかる可能性あり）
      for (const [type, bot] of this.bots) {
        await bot.login();
        // 少し待機
        await this.sleep(1000);
      }

      this.isRunning = true;
      console.log('✅ 全Botのログインが完了しました');

      // 準備完了まで待機
      await this.waitForAllBotsReady();
      console.log('✅ 全Botの準備が完了しました');

      // Ollama接続確認
      console.log('🔌 Ollamaに接続中...');
      const isOllamaHealthy = await this.ollamaClient.healthCheck();
      if (!isOllamaHealthy) {
        console.warn('⚠️ Ollamaへの接続に失敗しました。LLM機能は使用できません。');
      } else {
        console.log('✅ Ollamaに接続しました');
      }

      // Firebase初期化
      console.log('🔥 Firebaseを初期化中...');
      initializeFirebase();
      console.log('✅ Firebaseを初期化しました');

      // うさこBotのみに人間のメッセージハンドラーを設定（重複防止）
      const usakoBot = this.bots.get('usako');
      if (usakoBot) {
        usakoBot.setOnHumanMessage((username, content, channelId) => {
          this.handleHumanMessage(username, content, channelId);
        });
        console.log('✅ 人間のメッセージハンドラーを設定しました（うさこBotのみ）');
      }

      // 音声チャンネルに接続
      if (this.voiceManager && voiceChannelConfig.enabled && voiceChannelConfig.channelId) {
        await this.connectToVoiceChannel();
      }

    } catch (error) {
      console.error('❌ Botの初期化に失敗しました:', error);
      await this.shutdown();
      throw error;
    }
  }

  /**
   * 全Botの準備完了を待機
   */
  private async waitForAllBotsReady(): Promise<void> {
    const maxWaitTime = 30000; // 30秒
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const allReady = Array.from(this.bots.values()).every(bot => bot.isClientReady());
      if (allReady) {
        return;
      }
      await this.sleep(500);
    }

    throw new Error('Botの準備がタイムアウトしました');
  }

  /**
   * 指定したキャラクターのBotを取得
   */
  getBot(type: CharacterType): CharacterBot | undefined {
    return this.bots.get(type);
  }

  /**
   * 全Botを取得
   */
  getAllBots(): CharacterBot[] {
    return Array.from(this.bots.values());
  }

  /**
   * 人間のメッセージを処理
   */
  private async handleHumanMessage(username: string, content: string, channelId: string): Promise<void> {
    // 対象チャンネルかどうか確認
    if (channelId !== botConfig.channelId) {
      return;
    }

    // 自律会話中のみ介入を受け付ける
    if (!this.isConversationActive) {
      return;
    }

    console.log(`\n👤 人間が会話に介入しました: ${username}\n`);

    // 生成中の場合はキャンセルフラグを立てる
    if (this.isGenerating) {
      console.log('⚠️ 生成中のリクエストをキャンセルします...');
      this.shouldCancelGeneration = true;
    }

    // 人間の介入データを保存
    this.humanInterventionData = { username, content };
  }

  /**
   * 指定チャンネルにメッセージを送信
   */
  async sendMessage(characterType: CharacterType, content: string): Promise<void> {
    const bot = this.getBot(characterType);
    if (!bot) {
      console.error(`❌ Bot ${characterType} が見つかりません`);
      return;
    }

    // テキストメッセージを送信
    await bot.sendMessage(botConfig.channelId, content);

    // 音声でも配信（TTS有効時）
    if (this.voiceManager && voiceChannelConfig.enabled) {
      try {
        await this.voiceManager.speak(content, characterType);
      } catch (error) {
        console.error('❌ 音声配信エラー:', error);
        // 音声配信の失敗はテキストメッセージの送信を妨げない
      }
    }
  }

  /**
   * 音声チャンネルに接続
   */
  private async connectToVoiceChannel(): Promise<void> {
    if (!this.voiceManager) {
      return;
    }

    try {
      console.log('🔊 音声チャンネルに接続中...');

      // うさこBotのクライアントを使用して音声チャンネルを取得
      const usakoBot = this.bots.get('usako');
      if (!usakoBot) {
        throw new Error('うさこBotが見つかりません');
      }

      const client = usakoBot.getClient();
      const guild = await client.guilds.fetch(botConfig.guildId);
      const voiceChannel = await guild.channels.fetch(voiceChannelConfig.channelId);

      if (!voiceChannel || !voiceChannel.isVoiceBased()) {
        throw new Error('音声チャンネルが見つかりません');
      }

      // VoiceChannel型として扱う（StageChannelの可能性もあるが、VoiceManagerが対応）
      await this.voiceManager.connect(voiceChannel as any);

      // TTS接続テスト
      const isTTSHealthy = await this.voiceManager.testTTSConnection();
      if (!isTTSHealthy) {
        console.warn('⚠️ TTS APIへの接続に失敗しました。音声配信は利用できません。');
      } else {
        console.log('✅ TTS APIに接続しました');
      }
    } catch (error) {
      console.error('❌ 音声チャンネル接続エラー:', error);
      console.warn('⚠️ 音声配信機能は無効化されます');
    }
  }


  /**
   * LLMで発言を生成してDiscordに送信
   * @returns 成功したらtrue、失敗したらfalse
   */
  async generateAndSendMessage(
    characterType: CharacterType,
    theme?: string
  ): Promise<boolean> {
    // キャンセルフラグが立っていたら処理を中止
    if (this.shouldCancelGeneration) {
      console.log(`❌ ${characterType} の生成をキャンセルしました`);
      this.shouldCancelGeneration = false;
      this.isGenerating = false;
      return false;
    }

    this.isGenerating = true;

    try {
      console.log(`🤔 ${characterType} が考え中...`);
      
      // 会話品質スコアを計算
      const recentMessages = this.conversationHistory.getRecent(10);
      const qualityScore = ConversationQualityAnalyzer.calculateQualityScore(recentMessages);
      const conversationState = ConversationQualityAnalyzer.evaluateConversationState(qualityScore, recentMessages);

      // 📊 会話評価をログ出力
      console.log(`\n📊 【会話評価】`);
      console.log(`   品質スコア: ${(qualityScore * 100).toFixed(1)}%`);
      const stateLabel = conversationState === 'opening' ? '🌟 会話開始' 
        : conversationState === 'connected' ? '✅ つながっている' 
        : conversationState === 'stagnant' ? '⚠️ 停滞' 
        : '🔴 断絶';
      console.log(`   会話状態: ${stateLabel}`);

      // 次の発言者を事前に決定
      const nextSpeaker = this.selectNextCharacter(characterType);
      console.log(`   次の発言者: ${nextSpeaker}\n`);

      // プロンプト構築
      let prompt = PromptBuilder.buildConversationPrompt(
        characterType,
        recentMessages,
        nextSpeaker,
        theme,
        botConfig.kerokoPersonality
      );

      // テーマコンテキストを適用 + 会話状態をプロンプトに含める
      if (this.themeContextSession) {
        prompt = this.themeContextSession.expandPrompt(prompt);
        
        // 会話状態に応じた制御句を追加
        const controlPrompt = ConversationQualityAnalyzer.getControlPrompt(conversationState);
        console.log(`🎯 【制御プロンプト】`);
        console.log(`   ${controlPrompt.split('\n').join('\n   ')}\n`);
        prompt += `\n\n【会話状態制御】\n${controlPrompt}`;
      }

      // LLMで生成（maxTokens指定なし = 設定ファイルのデフォルト値を使用）
      const generatedText = await this.ollamaClient.generate(prompt);

      // キャンセルフラグが立ったら結果を破棄
      if (this.shouldCancelGeneration) {
        console.log(`❌ ${characterType} の生成をキャンセルしました`);
        this.shouldCancelGeneration = false;
        this.isGenerating = false;
        return false;
      }

      // Discord に送信
      await this.sendMessage(characterType, generatedText);

      // 履歴に追加
      this.conversationHistory.addMessage(characterType, generatedText);

      // 成功したのでエラーリカバリーから回復
      this.errorRecoveryManager.recordSuccess();
      
      // ターンカウンターを増やす
      this.conversationTurnCount++;
      
      // 品質スコアベースでシナリオを動的に更新
      if (this.themeContextSession) {
        const updated = await this.themeContextSession.updateScenarioIfNeeded(recentMessages);
        if (updated) {
          const sessionInfo = this.themeContextSession.getSessionInfo();
          console.log(`\n🔄 【シナリオ更新完了】`);
          console.log(`   更新回数: ${sessionInfo.updateCount}回`);
          console.log(`   前回更新からのターン数: ${sessionInfo.turnsSinceLastUpdate}\n`);
        }
      }
      
      // 会話履歴が50個に達したらレポート生成
      if (this.conversationHistory.getCount() >= this.REPORT_THRESHOLD) {
        console.log(`\n📚 会話履歴が${this.REPORT_THRESHOLD}個に達しました。日報を生成します...\n`);
        
        // レポート生成前にうさこから終了メッセージを送信
        const closingMessage = '今日はここまで...';
        await this.sendMessage('usako', closingMessage);
        this.conversationHistory.addMessage('usako', closingMessage);
        
        // セッションをクローズ
        if (this.themeContextSession) {
          this.themeContextSession.close();
          this.themeContextSession = null;
        }
        
        await this.generateDailyReports();
        // レポート生成後、会話を停止
        this.stopAutonomousConversation();
      }
      
      return true;

    } catch (error) {
      console.error(`❌ ${characterType} の発言生成に失敗:`, error);
      
      // エラーリカバリーを記録
      this.errorRecoveryManager.recordFailure();
      
      const recovery = this.errorRecoveryManager.getRecoveryAction();
      const state = this.errorRecoveryManager.getState();
      console.error(`⚠️ エラーレベル: ${this.errorRecoveryManager.getErrorLevel()} - ${recovery.description}`);
      console.error(`⚠️ 連続失敗回数: ${state.consecutiveFailures}`);
      
      // フォールバック（LLM失敗時のデフォルト発言）
      const fallbackMessages = {
        usako: '...',
        nekoko: 'えっと...何だっけ？',
        keroko: 'すみません、少し考え中です。',
      };
      
      await this.sendMessage(characterType, fallbackMessages[characterType]);
      return false;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * 自律会話を開始
   */
  async startAutonomousConversation(initialMessage?: string): Promise<void> {
    if (this.isConversationActive) {
      console.log('⚠️ 既に会話が進行中です');
      return;
    }

    this.isConversationActive = true;
    this.errorRecoveryManager.reset(); // エラーリカバリーをリセット
    this.conversationTurnCount = 0; // ターンカウンターをリセット
    console.log('🎭 自律会話を開始します...\n');

    // Firestoreからランダムなテーマを取得
    try {
      const theme = await getRandomTheme();
      console.log(`\n🎨 【テーマ情報】`);
      console.log(`   タイトル: ${theme.title}`);
      console.log(`   説明: ${theme.description}`);
      
      // セッション型のテーマコンテキストを作成（イミュータブル）
      this.themeContextSession = ThemeContextFactory.createSession(theme);
      
      // テーマの会話シナリオを生成
      await this.themeContextSession.generateScenario();
      
      console.log(`📝 【生成されたシナリオ】`);
      const scenario = this.themeContextSession.getScenario();
      if (scenario) {
        console.log(`   ${scenario.split('\n').join('\n   ')}`);
      } else {
        console.log('   シナリオが生成されませんでした');
      }
      console.log();
      
    } catch (error) {
      console.warn('⚠️ テーマ取得またはシナリオ生成に失敗しました:', error);
      this.themeContextSession = null;
    }

    // 初期メッセージまたはシナリオベースの会話開始
    // うさこを最初の発言者に固定
    let lastSpeaker: CharacterType = 'usako';
    
    if (initialMessage) {
      // 手動指定のメッセージがあれば使用
      await this.sendMessage('usako', initialMessage);
      this.conversationHistory.addMessage('usako', initialMessage);
      await this.sleep(2000);
    } else if (this.themeContextSession) {
      // シナリオが生成されている場合、うさこが最初に発言
      console.log('💬 シナリオに基づいて会話を開始します...\n');
      await this.generateAndSendMessage('usako');
      await this.sleep(2000);
    } else {
      console.log('⚠️ テーマもinitialMessageも指定されていません');
    }

    // 会話ループ
    while (this.isConversationActive && this.isRunning) {
      try {
        // 人間の介入があった場合、会話履歴を更新
        if (this.humanInterventionData) {
          const { username, content } = this.humanInterventionData;
          this.conversationHistory.addMessage('usako', content, true);
          this.humanInterventionData = null;
          
          // 少し待機してから次のキャラクターに発言させる
          await this.sleep(2000);
          
          // ランダムに選択
          lastSpeaker = this.selectNextCharacter(null);
        }

        // エラーレベルをチェック
        if (!this.errorRecoveryManager.isRecoverable()) {
          console.error(`\n🛑 エラーが回復不可能な状態になりました`);
          console.error('⚠️ 自律会話を停止します\n');
          this.stopAutonomousConversation();
          break;
        }

        // エラー復旧が必要な場合、段階的に処理
        const recovery = this.errorRecoveryManager.getRecoveryAction();
        if (recovery.action !== 'retry') {
          console.log(`\n🔄 エラー復旧: [${recovery.description}]`);
          
          if (recovery.waitMs > 0) {
            console.log(`⏳ ${recovery.waitMs}ms 待機中...`);
            await this.sleep(recovery.waitMs);
          }

          if (recovery.action === 'switch-character') {
            lastSpeaker = this.errorRecoveryManager.selectAlternativeCharacter(lastSpeaker);
            console.log(`キャラ交代 → ${lastSpeaker}`);
          } else if (recovery.action === 'switch-theme') {
            console.log('🔄 新しいテーマに切り替えを試みます...');
            try {
              const newTheme = await getRandomTheme();
              this.themeContextSession?.close();
              this.themeContextSession = ThemeContextFactory.createSession(newTheme);
              await this.themeContextSession.generateScenario();
              this.errorRecoveryManager.reset();
              console.log('✅ テーマを切り替えしました');
            } catch (e) {
              console.error('❌ テーマ切り替え失敗:', e);
            }
          }
        }

        // 前回話したキャラクター以外からランダムに選択
        const nextCharacter = this.selectNextCharacter(lastSpeaker);
        
        // LLMで発言生成＆送信
        await this.generateAndSendMessage(nextCharacter);
        
        // 次のために記憶
        lastSpeaker = nextCharacter;
        
        // 少し待機（LLM生成時間が主な間隔になる）
        await this.sleep(1500);
        
      } catch (error) {
        console.error('❌ 自律会話中にエラーが発生:', error);
        // エラーが発生しても会話を続ける
        await this.sleep(3000);
      }
    }

    // セッションをクローズ
    if (this.themeContextSession) {
      this.themeContextSession.close();
      this.themeContextSession = null;
    }

    console.log('🛑 自律会話を停止しました');
  }

  /**
   * 次に発言するキャラクターをランダムに選択
   * 前回話したキャラクター以外から選ぶ
   */
  private selectNextCharacter(lastSpeaker: CharacterType | null): CharacterType {
    const allCharacters: CharacterType[] = ['usako', 'nekoko', 'keroko'];
    
    // 前回話したキャラクターを除外
    const candidates = lastSpeaker 
      ? allCharacters.filter(c => c !== lastSpeaker)
      : allCharacters;
    
    // ランダムに選択
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  /**
   * 自律会話を停止
   */
  stopAutonomousConversation(): void {
    if (!this.isConversationActive) {
      console.log('⚠️ 会話は既に停止しています');
      return;
    }
    
    console.log('⏸️ 自律会話を停止中...');
    this.isConversationActive = false;
  }

  /**
   * 会話が進行中かどうか
   */
  isConversationRunning(): boolean {
    return this.isConversationActive;
  }

  /**
   * 全Botのシャットダウン
   */
  async shutdown(): Promise<void> {
    console.log('🛑 全Botをシャットダウン中...');
    this.isConversationActive = false;
    this.isRunning = false;

    // 音声チャンネルから切断
    if (this.voiceManager) {
      this.voiceManager.disconnect();
    }

    for (const bot of this.bots.values()) {
      await bot.shutdown();
    }

    this.bots.clear();
    console.log('✅ 全Botのシャットダウンが完了しました');
  }

  /**
   * 実行中かどうか
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * 全キャラクターの日報を生成して保存
   */
  private async generateDailyReports(): Promise<void> {
    const characterTypes: CharacterType[] = ['usako', 'nekoko', 'keroko'];
    const allMessages = this.conversationHistory.getAll();
    const conversationText = allMessages
      .map(msg => `${msg.characterType}: ${msg.content}`)
      .join('\n');

    for (const characterType of characterTypes) {
      try {
        console.log(`\n📝 ${characterType} の日報を生成中...`);
        
        const diaryPrompt = ReportPromptBuilder.buildDiaryPrompt(characterType, conversationText);
        const diaryContent = await this.ollamaClient.generate(diaryPrompt);
        
        if (diaryContent && diaryContent.trim()) {
          console.log(`✅ ${characterType} の日報を生成しました`);
          
          const report: DailyReport = {
            characterType,
            characterName: characters.find(c => c.type === characterType)?.name || characterType,
            content: diaryContent,
            timestamp: new Date(),
            messageCount: allMessages.length,
          };
          
          await saveDailyReport(report);
        } else {
          console.warn(`⚠️ ${characterType} の日報生成で空の結果が返ったため、スキップします`);
        }
      } catch (error) {
        console.error(`❌ ${characterType} の日報生成に失敗:`, error);
      }
    }

    // 会話履歴を初期化
    this.conversationHistory.clear();
  }

  /**
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
