import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import { CharacterConfig } from '../types/index.js';

/**
 * キャラクターBot基底クラス
 */
export class CharacterBot {
  private client: Client;
  private config: CharacterConfig;
  private isReady: boolean = false;

  constructor(config: CharacterConfig) {
    this.config = config;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.setupEventHandlers();
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
    // ここでは基本的なログ記録のみ
    if (!message.author.bot) {
      console.log(`📝 [${this.config.displayName}が観測] ${message.author.username}: ${message.content}`);
    }
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

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel && channel.isTextBased()) {
        await (channel as TextChannel).send(content);
        console.log(`💬 [${this.config.displayName}] ${content}`);
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
   * 準備完了チェック
   */
  isClientReady(): boolean {
    return this.isReady;
  }

  /**
   * Bot停止
   */
  async shutdown(): Promise<void> {
    console.log(`🛑 ${this.config.displayName} をシャットダウンします`);
    await this.client.destroy();
    this.isReady = false;
  }
}
