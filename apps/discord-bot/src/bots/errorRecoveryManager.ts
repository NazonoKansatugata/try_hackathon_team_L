import { CharacterType } from '../types/index.js';

/**
 * エラー復旧戦略の管理
 */
export interface ErrorRecoveryState {
  consecutiveFailures: number;
  lastFailureTime: Date | null;
  isRecovering: boolean;
  currentAttempt: number;
}

/**
 * 段階的なエラー復旧マネージャー
 * - レベル1: 3秒待機して再試行
 * - レベル2: 10秒待機 + 別キャラに切り替え
 * - レベル3: 新しいテーマに切り替え
 * - レベル4: 会話停止
 */
export class ErrorRecoveryManager {
  private state: ErrorRecoveryState = {
    consecutiveFailures: 0,
    lastFailureTime: null,
    isRecovering: false,
    currentAttempt: 0,
  };

  private readonly RECOVERY_STAGES = {
    LEVEL_1: { waitMs: 3000, maxAttempts: 2, description: '短い待機後に再試行' },
    LEVEL_2: { waitMs: 10000, maxAttempts: 2, description: 'キャラ交代を試みる' },
    LEVEL_3: { waitMs: 15000, maxAttempts: 1, description: 'テーマ切り替え' },
    LEVEL_4: { waitMs: 0, maxAttempts: 0, description: '会話停止' },
  };

  /**
   * エラーが発生した時の処理
   */
  recordFailure(): void {
    this.state.consecutiveFailures++;
    this.state.lastFailureTime = new Date();
    this.state.currentAttempt = 0;

    console.error(
      `⚠️ エラー記録: ${this.state.consecutiveFailures}回目の連続失敗`
    );
  }

  /**
   * 成功時にカウンターをリセット
   */
  recordSuccess(): void {
    if (this.state.consecutiveFailures > 0) {
      console.log(
        `✅ エラーから回復しました（${this.state.consecutiveFailures}回のエラースルー後）`
      );
    }
    this.state.consecutiveFailures = 0;
    this.state.currentAttempt = 0;
    this.state.isRecovering = false;
  }

  /**
   * 現在のエラーレベルを取得
   */
  getErrorLevel(): 1 | 2 | 3 | 4 {
    if (this.state.consecutiveFailures <= 2) return 1;
    if (this.state.consecutiveFailures <= 4) return 2;
    if (this.state.consecutiveFailures <= 5) return 3;
    return 4;
  }

  /**
   * 復旧可能かチェック
   */
  isRecoverable(): boolean {
    const level = this.getErrorLevel();
    return level < 4;
  }

  /**
   * 恢復アクションを取得
   */
  getRecoveryAction(): {
    waitMs: number;
    action: 'retry' | 'switch-character' | 'switch-theme' | 'stop';
    description: string;
  } {
    const level = this.getErrorLevel();

    if (level === 1) {
      return {
        waitMs: this.RECOVERY_STAGES.LEVEL_1.waitMs,
        action: 'retry',
        description: this.RECOVERY_STAGES.LEVEL_1.description,
      };
    }

    if (level === 2) {
      return {
        waitMs: this.RECOVERY_STAGES.LEVEL_2.waitMs,
        action: 'switch-character',
        description: this.RECOVERY_STAGES.LEVEL_2.description,
      };
    }

    if (level === 3) {
      return {
        waitMs: this.RECOVERY_STAGES.LEVEL_3.waitMs,
        action: 'switch-theme',
        description: this.RECOVERY_STAGES.LEVEL_3.description,
      };
    }

    return {
      waitMs: 0,
      action: 'stop',
      description: this.RECOVERY_STAGES.LEVEL_4.description,
    };
  }

  /**
   * 別キャラを選択
   */
  selectAlternativeCharacter(
    lastCharacter: CharacterType
  ): CharacterType {
    const characters: CharacterType[] = ['usako', 'nekoko', 'keroko'];
    const alternatives = characters.filter(c => c !== lastCharacter);
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  /**
   * 状態情報を取得
   */
  getState(): ErrorRecoveryState {
    return { ...this.state };
  }

  /**
   * 状態をリセット
   */
  reset(): void {
    this.state = {
      consecutiveFailures: 0,
      lastFailureTime: null,
      isRecovering: false,
      currentAttempt: 0,
    };
  }
}
