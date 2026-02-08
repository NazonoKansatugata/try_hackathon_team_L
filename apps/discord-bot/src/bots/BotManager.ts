import { CharacterBot } from './CharacterBot.js';
import { characters, botConfig } from '../config/index.js';
import { CharacterType } from '../types/index.js';
import { OllamaClient } from '../ollama/client.js';
import { PromptBuilder } from '../llm/promptBuilder.js';
import { ConversationHistory } from '../conversation/history.js';

/**
 * 複数のBotを管理するマネージャークラス
 */
export class BotManager {
  private bots: Map<CharacterType, CharacterBot> = new Map();
  private isRunning: boolean = false;
  private ollamaClient: OllamaClient;
  private conversationHistory: ConversationHistory;

  constructor() {
    this.ollamaClient = new OllamaClient();
    this.conversationHistory = new ConversationHistory(20);
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
   * 指定チャンネルにメッセージを送信
   */
  async sendMessage(characterType: CharacterType, content: string): Promise<void> {
    const bot = this.getBot(characterType);
    if (!bot) {
      console.error(`❌ Bot ${characterType} が見つかりません`);
      return;
    }

    await bot.sendMessage(botConfig.channelId, content);
  }

  /**
   * テストメッセージを送信
   */
  async sendTestMessages(): Promise<void> {
    console.log('📨 テストメッセージを送信中...');

    await this.sendMessage('usako', 'よろしく...');
    await this.sleep(2000);

    await this.sendMessage('nekoko', 'わーい！みんなよろしくね～！');
    await this.sleep(2000);

    await this.sendMessage('keroko', 'こんにちは。けろこです。');

    console.log('✅ テストメッセージの送信が完了しました');
  }

  /**
   * LLMを使った会話生成テスト
   */
  async testLLMConversation(): Promise<void> {
    console.log('\n🧪 LLM会話生成テストを開始...\n');

    // 初期メッセージ
    await this.sendMessage('nekoko', 'ねえねえ、今日は何して遊ぶ〜？');
    this.conversationHistory.addMessage('nekoko', 'ねえねえ、今日は何して遊ぶ〜？');
    await this.sleep(3000);

    // うさこが応答（LLM生成）
    await this.generateAndSendMessage('usako');
    await this.sleep(3000);

    // けろこが応答（LLM生成）
    await this.generateAndSendMessage('keroko');
    await this.sleep(3000);

    // ねここが応答（LLM生成）
    await this.generateAndSendMessage('nekoko');

    console.log('\n✅ LLM会話生成テストが完了しました');
  }

  /**
   * LLMで発言を生成してDiscordに送信
   */
  async generateAndSendMessage(
    characterType: CharacterType,
    theme?: string
  ): Promise<void> {
    try {
      console.log(`🤔 ${characterType} が考え中...`);

      // プロンプト構築
      const prompt = PromptBuilder.buildConversationPrompt(
        characterType,
        this.conversationHistory.getRecent(10),
        theme
      );

      // LLMで生成（maxTokens指定なし = 設定ファイルのデフォルト値を使用）
      const generatedText = await this.ollamaClient.generate(prompt);

      // Discord に送信
      await this.sendMessage(characterType, generatedText);

      // 履歴に追加
      this.conversationHistory.addMessage(characterType, generatedText);

    } catch (error) {
      console.error(`❌ ${characterType} の発言生成に失敗:`, error);
      
      // フォールバック（LLM失敗時のデフォルト発言）
      const fallbackMessages = {
        usako: '...',
        nekoko: 'えっと...何だっけ？',
        keroko: 'すみません、少し考え中です。',
      };
      
      await this.sendMessage(characterType, fallbackMessages[characterType]);
    }
  }

  /**
   * 全Botのシャットダウン
   */
  async shutdown(): Promise<void> {
    console.log('🛑 全Botをシャットダウン中...');
    this.isRunning = false;

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
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
