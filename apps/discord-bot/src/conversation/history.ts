import { ConversationMessage, CharacterType } from '../types/index.js';

/**
 * 会話履歴マネージャー
 */
export class ConversationHistory {
  private messages: ConversationMessage[] = [];
  private maxMessages: number;

  constructor(maxMessages: number = 20) {
    this.maxMessages = maxMessages;
  }

  /**
   * メッセージを追加
   */
  addMessage(
    characterType: CharacterType,
    content: string,
    isHuman: boolean = false
  ): void {
    const message: ConversationMessage = {
      id: this.generateId(),
      characterType,
      content,
      timestamp: new Date(),
      isHuman,
    };

    this.messages.push(message);

    // 最大件数を超えたら古いものから削除
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    console.log(`📝 履歴追加: [${isHuman ? 'ユーザー' : characterType}] ${content}`);
  }

  /**
   * 最新N件の履歴を取得
   */
  getRecent(count?: number): ConversationMessage[] {
    const targetCount = count || this.messages.length;
    return this.messages.slice(-targetCount);
  }

  /**
   * 全履歴を取得
   */
  getAll(): ConversationMessage[] {
    return [...this.messages];
  }

  /**
   * 履歴をクリア
   */
  clear(): void {
    this.messages = [];
    console.log('🗑️ 会話履歴をクリアしました');
  }

  /**
   * 履歴の件数を取得
   */
  getCount(): number {
    return this.messages.length;
  }

  /**
   * 最後のメッセージを取得
   */
  getLastMessage(): ConversationMessage | undefined {
    return this.messages[this.messages.length - 1];
  }

  /**
   * IDを生成
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
