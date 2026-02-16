import { Theme } from '../types/index.js';
import { ThemeContext } from './themeContext.js';
import { ConversationQualityAnalyzer } from '../analysis/conversationQualityAnalyzer.js';
import { ConversationMessage } from '../types/index.js';

/**
 * テーマコンテキストをイミュータブルに管理するファクトリー
 * 各会話セッションで新しいインスタンスを生成
 */
export class ThemeContextFactory {
  /**
   * 新しいテーマコンテキストを作成
   */
  static create(theme: Theme): ThemeContext {
    return new ThemeContext(theme);
  }

  /**
   * セッション情報を保持するラッパークラス
   */
  static createSession(theme: Theme): ThemeContextSession {
    return new ThemeContextSession(theme);
  }
}

/**
 * セッション型テーマコンテキスト
 * - 不変性を保証
 * - シナリオ更新の履歴を追跡
 */
export class ThemeContextSession {
  private context: ThemeContext;
  private readonly createdAt: Date;
  private turnsSinceLastUpdate: number = 0;
  private updateHistory: Array<{ turn: number; timestamp: Date }> = [];

  constructor(theme: Theme) {
    this.context = new ThemeContext(theme);
    this.createdAt = new Date();
  }

  /**
   * シナリオを生成
   */
  async generateScenario(): Promise<void> {
    await this.context.generateScenario();
    this.updateHistory.push({
      turn: 0,
      timestamp: new Date(),
    });
  }

  /**
   * 品質に基づいてシナリオを動的に更新
   */
  async updateScenarioIfNeeded(
    recentMessages: ConversationMessage[]
  ): Promise<boolean> {
    const qualityScore = ConversationQualityAnalyzer.calculateQualityScore(
      recentMessages
    );
    const shouldUpdate = ConversationQualityAnalyzer.shouldUpdateScenario(
      qualityScore,
      this.turnsSinceLastUpdate
    );

    if (shouldUpdate) {
      const state = ConversationQualityAnalyzer.evaluateConversationState(qualityScore);
      console.log(`\n🔄 シナリオ更新を開始します...`);
      console.log(`   理由: ${state} 状態を検出`);

      const recentMessagesText = recentMessages
        .slice(-10)
        .map(m => `${m.characterType}: ${m.content}`)
        .join('\n');

      await this.context.updateScenario(recentMessagesText);

      // 更新後のシナリオを表示
      const updatedScenario = this.context.getScenario();
      if (updatedScenario) {
        console.log(`\n📝 【更新されたシナリオ】`);
        console.log(`   ${updatedScenario.split('\n').join('\n   ')}`);
      }
      console.log();

      this.turnsSinceLastUpdate = 0;
      this.updateHistory.push({
        turn: recentMessages.length,
        timestamp: new Date(),
      });

      return true;
    }

    this.turnsSinceLastUpdate++;
    return false;
  }

  /**
   * 会話状態に応じたプロンプト制御を取得
   */
  getStateControlledPrompt(): string {
    // デフォルトは connected の制御句を返す
    // BotManager側で品質を計算してから渡すことを推奨
    return ConversationQualityAnalyzer.getControlPrompt('connected');
  }

  /**
   * 最新のシステムプロンプトを取得（不変）
   */
  getSystemPrompt(): string {
    return this.context.getSystemPrompt();
  }

  /**
   * シナリオプロンプトを取得（不変）
   */
  getScenarioPrompt(): string {
    return this.context.getScenarioPrompt();
  }

  /**
   * シナリオの中身を取得（不変）
   */
  getScenario(): string | null {
    return this.context.getScenario();
  }

  /**
   * プロンプト拡張（不変）
   */
  expandPrompt(basePrompt: string): string {
    return this.context.expandPrompt(basePrompt);
  }

  /**
   * セッション情報を取得
   */
  getSessionInfo(): {
    createdAt: Date;
    turnsSinceLastUpdate: number;
    updateCount: number;
    updateHistory: Array<{ turn: number; timestamp: Date }>;
  } {
    return {
      createdAt: this.createdAt,
      turnsSinceLastUpdate: this.turnsSinceLastUpdate,
      updateCount: this.updateHistory.length,
      updateHistory: [...this.updateHistory],
    };
  }

  /**
   * セッションを終了（クリーンアップ）
   */
  close(): void {
    console.log(`🔒 テーマセッションを終了`);
    console.log(
      `  更新回数: ${this.updateHistory.length}回`
    );
    console.log(
      `  経過時間: ${((Date.now() - this.createdAt.getTime()) / 1000).toFixed(0)}秒`
    );
  }
}
