import { Client, GatewayIntentBits, Message, TextChannel, VoiceChannel } from 'discord.js';
import { CharacterConfig, CharacterType } from '../types/index.js';
import { VoiceManager } from '../tts/voiceManager.js';
import { ttsConfig } from '../config/index.js';

/**
 * キャラクターBot基底クラス
 */
export class CharacterBot {
  private client: Client;
  private config: CharacterConfig;
  private isReady: boolean = false;
  private onHumanMessage?: (username: string, content: string, channelId: string) => void;
  private voiceManager: VoiceManager | null = null;

  constructor(config: CharacterConfig) {
    this.config = config;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    this.setupEventHandlers();

    // TTS機能が有効な場合のみVoiceManagerを初期化
    if (ttsConfig.enabled) {
      this.voiceManager = new VoiceManager();
    }
  }

  /**
   * イベントハンドラーのセットアップ
   */
  private setupEventHandlers(): void {
    this.client.on('ready', () => {
      console.log(`✅ ${this.config.displayName} (${this.client.user?.tag}) がログインしました`);
      this.isReady = true;
    });

    this.client.on('messageCreate', (message) => {
      this.handleMessage(message);
    });

    this.client.on('error', (error) => {
      console.error(`❌ ${this.config.displayName} でエラーが発生:`, error);
    });
  }

  /**
   * メッセージハンドラー
   */
  private handleMessage(message: Message): void {
    // 自分自身のメッセージは無視
    if (message.author.id === this.client.user?.id) {
      return;
    }

    // Botのメッセージは無視（他のキャラクターBotは別途処理）
    // 人間のメッセージの場合、コールバックを呼ぶ
    if (!message.author.bot) {
      // うさこBotのみログを残す
      if (this.config.type === 'usako') {
        console.log(`📝 [${this.config.displayName}が観測] ${message.author.username}: ${message.content}`);
      }
      
      if (this.onHumanMessage) {
        this.onHumanMessage(message.author.username, message.content, message.channelId);
      }
    }
  }

  /**
   * 人間のメッセージを受け取った際のコールバックを設定
   */
  setOnHumanMessage(callback: (username: string, content: string, channelId: string) => void): void {
    this.onHumanMessage = callback;
  }

  /**
   * Bot起動
   */
  async login(): Promise<void> {
    try {
      await this.client.login(this.config.token);
    } catch (error) {
      console.error(`❌ ${this.config.displayName} のログインに失敗:`, error);
      throw error;
    }
  }

  /**
   * メッセージ送信
   */
  async sendMessage(channelId: string, content: string): Promise<void> {
    if (!this.isReady) {
      console.warn(`⚠️ ${this.config.displayName} はまだ準備ができていません`);
      return;
    }

    // 空メッセージチェック
    if (!content || content.trim().length === 0) {
      console.error(`❌ ${this.config.displayName} が空メッセージを送信しようとしました`);
      return;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send(content);
      }
    } catch (error) {
      console.error(`❌ ${this.config.displayName} のメッセージ送信に失敗:`, error);
    }
  }

  /**
   * Bot情報取得
   */
  getConfig(): CharacterConfig {
    return this.config;
  }

  /**
   * クライアント取得
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * 準備完了チェック
   */
  isClientReady(): boolean {
    return this.isReady;
  }

  /**
   * 音声チャンネルに接続
   */
  async connectToVoiceChannel(guildId: string, channelId: string): Promise<void> {
    if (!this.voiceManager) {
      return;
    }

    try {
      console.log(`🔊 [${this.config.displayName}] 音声チャンネルに接続中...`);

      const guild = await this.client.guilds.fetch(guildId);
      const voiceChannel = await guild.channels.fetch(channelId);

      if (!voiceChannel || !voiceChannel.isVoiceBased()) {
        throw new Error('音声チャンネルが見つかりません');
      }

      await this.voiceManager.connect(voiceChannel as any, this.client);
      console.log(`✅ [${this.config.displayName}] 音声チャンネル接続完了`);
    } catch (error) {
      console.error(`❌ [${this.config.displayName}] 音声チャンネル接続エラー:`, error);
      console.warn(`⚠️ [${this.config.displayName}] 音声配信機能は無効化されます`);
    }
  }

  /**
   * 音声で読み上げ（TTS）
   * @param content 読み上げるテキスト
   * @param characterType 発話するキャラクタータイプ（指定がない場合は自分のタイプ）
   */
  async speak(content: string, characterType?: CharacterType): Promise<void> {
    if (!this.voiceManager) {
      return;
    }

    try {
      await this.voiceManager.speak(content, characterType || this.config.type);
    } catch (error) {
      console.error(`❌ [${this.config.displayName}] 音声配信エラー:`, error);
    }
  }

  /**
   * Bot停止
   */
  async shutdown(): Promise<void> {
    console.log(`🛑 ${this.config.displayName} をシャットダウンします`);
    
    // 音声接続を切断
    if (this.voiceManager) {
      this.voiceManager.disconnect();
    }
    
    await this.client.destroy();
    this.isReady = false;
  }
}
