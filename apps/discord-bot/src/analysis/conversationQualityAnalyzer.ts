import { ConversationMessage } from '../types/index.js';

/**
 * 会話品質スコア分析エンジン
 * 会話がつながっているか、停滞していないかを判定
 */
export class ConversationQualityAnalyzer {
  /**
   * 会話品質スコアを計算（0-1）
   * - 直近3ターンの平均を計算
   * - キャラの切り替えを考慮
   * - 類似度と連続短文化を考慮
   */
  static calculateQualityScore(recentMessages: ConversationMessage[]): number {
    if (recentMessages.length < 2) return 0.5; // デフォルト中程度

    // 直近3メッセージを対象（なければ全て）
    const targetMessages = recentMessages.slice(-3);

    let score = 0.5; // 基本スコア

    // 1. キャラクターの多様性をチェック
    const characterTypes = new Set(targetMessages.map(m => m.characterType));
    const characterDiversity = characterTypes.size / 3; // 最大3キャラ
    score += characterDiversity * 0.3;

    // 2. 同一キャラの連続短文化をチェック（停滞の兆候）
    const lengths = targetMessages.map(m => m.content.length);
    if (
      targetMessages.length >= 2 &&
      targetMessages[0].characterType === targetMessages[1].characterType &&
      Math.abs(lengths[0] - lengths[1]) < 3 &&
      lengths[0] < 20 &&
      lengths[1] < 20
    ) {
      score -= 0.1; // 停滞っぽい
      console.log(
        `⚠️ 同一キャラの連続短文化を検出 (${targetMessages[0].characterType})`
      );
    }

    // 3. メッセージの類似度をチェック（理想値方式）
    const lastMessage = targetMessages[targetMessages.length - 1].content;
    const secondLastMessage =
      targetMessages.length > 1
        ? targetMessages[targetMessages.length - 2].content
        : '';

    // 理想値は0.4（似すぎもダメ、離れすぎもダメ）
    const similarity = this.calculateSimpleSimilarity(lastMessage, secondLastMessage);
    const idealSimilarity = 0.4;
    const similarityScore = 1 - Math.abs(similarity - idealSimilarity);
    score += similarityScore * 0.2;

    // 詳細ログ出力（デバッグ用）
    if (targetMessages.length >= 2) {
      console.log(`   📐 類似度分析:`);
      console.log(`      直前2発言の類似度: ${(similarity * 100).toFixed(1)}%`);
      console.log(`      理想値との差: ${Math.abs(similarity - idealSimilarity).toFixed(2)}`);
      console.log(`      キャラ多様性: ${characterTypes.size}/3キャラ`);
    }

    return Math.min(1, Math.max(0, score)); // 0-1の範囲に正規化
  }

  /**
   * シナリオ更新が必要かを判定
   */
  static shouldUpdateScenario(
    qualityScore: number,
    turnsSinceLastUpdate: number
  ): boolean {
    // 低品質 + 5ターン以上経過 = 更新必要
    if (qualityScore < 0.4 && turnsSinceLastUpdate >= 5) {
      return true;
    }

    // 中程度 + 15ターン以上経過 = 更新必要
    if (qualityScore < 0.6 && turnsSinceLastUpdate >= 15) {
      return true;
    }

    // デフォルト：20ターン以上で更新（従来ロジック）
    if (turnsSinceLastUpdate >= 20) {
      return true;
    }

    return false;
  }

  /**
   * 会話状態を判定
   */
  static evaluateConversationState(
    qualityScore: number
  ): 'connected' | 'stagnant' | 'disconnected' {
    if (qualityScore > 0.7) return 'connected';
    if (qualityScore < 0.4) return 'disconnected';
    return 'stagnant';
  }

  /**
   * テキスト類似度計算（バイグラム方式）
   * 日本語に対応した軽量な実装
   * 0-1の範囲で類似度を返す
   */
  private static calculateSimpleSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    // バイグラム（2文字グラム）を抽出
    const getBigrams = (text: string): Set<string> => {
      const result = new Set<string>();
      // テキストを正規化
      const normalized = text.toLowerCase().trim();

      // 2文字ずつスライディングウィンドウ
      for (let i = 0; i < normalized.length - 1; i++) {
        result.add(normalized.slice(i, i + 2));
      }

      return result;
    };

    const grams1 = getBigrams(text1);
    const grams2 = getBigrams(text2);

    if (grams1.size === 0 || grams2.size === 0) return 0;

    // Jaccard係数で類似度を計算
    const intersection = new Set([...grams1].filter(g => grams2.has(g)));
    const union = new Set([...grams1, ...grams2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * 会話状態に応じたプロンプト制御句を生成
   */
  static getControlPrompt(state: 'connected' | 'stagnant' | 'disconnected'): string {
    const prompts = {
      connected: `会話は自然につながっています。
無理に話題を変えず、今の流れを尊重して関係性を少し深めてください。`,

      stagnant: `同じ話題が繰り返されているようです。
さりげなく新しい要素や視点を1つ追加して、会話に奥行きを持たせてください。`,

      disconnected: `話題が急に変わったようです。
前の発言と今の発言をよくつなぐ一言を入れて、会話の流れを自然にしてください。`,
    };

    return prompts[state];
  }
}
