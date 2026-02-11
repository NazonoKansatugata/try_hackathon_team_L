import { Theme } from '../types/index.js';
import { OllamaClient } from '../ollama/client.js';

/**
 * テーマコンテキストプロンプト生成
 * 会話中に読み込まれるプロンプト層
 */
export class ThemeContext {
  private theme: Theme;
  private scenario: string | null = null;
  private ollamaClient: OllamaClient;

  constructor(theme: Theme) {
    this.theme = theme;
    this.ollamaClient = new OllamaClient();
  }

  /**
   * AIにテーマの会話シナリオを生成させる
   */
  async generateScenario(): Promise<void> {
    const scenarioPrompt = `テーマ「${this.theme.title}」について、3人のキャラクターの会話展開を簡潔に示してください。

以下の流れで各1〜2文ずつ：
1. 会話開始：話題の入り口
2. 展開：議論や情報交換
3. 盛り上がり：興奮や深い考察
4. 終局：まとめ

全体5文程度。`;

    try {
      console.log('🧠 テーマの会話シナリオを生成中...');
      this.scenario = await this.ollamaClient.generate(scenarioPrompt);
      console.log('✅ シナリオ生成完了');
    } catch (error) {
      console.error('❌ シナリオ生成失敗、デフォルト使用:', error);
      // デフォルトシナリオにフォールバック
      this.scenario = `テーマ「${this.theme.title}」について、3人がそれぞれの視点から意見を交わし、最終的に共通の理解に達するシナリオ、です。`;
    }
  }

  /**
   * 会話履歴を踏まえてシナリオを更新
   */
  async updateScenario(recentMessages: string): Promise<void> {
    const updatePrompt = `テーマ「${this.theme.title}」についての会話が進行しています。

【現在のシナリオ】
${this.scenario}

【直近の会話】
${recentMessages}

上記の会話の流れを踏まえて、今後どのように会話を展開すべきか、新しいシナリオを簡潔に示してください（5文程度）。`;

    try {
      console.log('🔄 会話シナリオを更新中...');
      this.scenario = await this.ollamaClient.generate(updatePrompt);
      console.log('✅ シナリオ更新完了');
    } catch (error) {
      console.error('❌ シナリオ更新失敗、現在のシナリオを維持:', error);
      // 更新失敗時は現在のシナリオを維持
    }
  }

  /**
   * テーマのシステムプロンプット
   */
  getSystemPrompt(): string {
    return `【会話のテーマ】
テーマ: ${this.theme.title}
説明: ${this.theme.description}
カテゴリ: ${this.theme.category}
関連キーワード: ${this.theme.keywords.join('、')}

このテーマに沿いながら、自然な会話を心がけてください。
会話がテーマから大きく外れるのは避けてください。`;
  }

  /**
   * シナリオをプロンプトに含める
   */
  getScenarioPrompt(): string {
    if (!this.scenario) {
      return '';
    }

    return `【会話展開ガイドライン】
このテーマについて、以下の流れで会話が展開される予定です。
現在の発言がどの段階に適切か判断し、自然にストーリーを進めてください。

${this.scenario}

上記を参考にしつつ、不自然にならないよう流れに従った発言をしてください。`;
  }

  /**
   * テーマに基づいてプロンプトを拡張
   */
  expandPrompt(basePrompt: string): string {
    const systemPrompt = this.getSystemPrompt();
    const scenarioPrompt = this.getScenarioPrompt();
    
    return `${systemPrompt}\n\n${scenarioPrompt}\n\n${basePrompt}`;
  }

  /**
   * テーマ情報を取得
   */
  getTheme(): Theme {
    return this.theme;
  }

  /**
   * シナリオを取得
   */
  getScenario(): string | null {
    return this.scenario;
  }
}

