import { Theme } from '../types/index.js';

/**
 * テーマコンテキストプロンプト生成
 * 会話中に読み込まれるプロンプト層
 */
export class ThemeContext {
  private theme: Theme;

  constructor(theme: Theme) {
    this.theme = theme;
  }

  /**
   * テーマのコンテキストプロンプトを生成
   */
  getSystemPrompt(): string {
    return `【会話のテーマ】
テーマ: ${this.theme.title}
説明: ${this.theme.description}
カテゴリ: ${this.theme.category}
関連キーワード: ${this.theme.keywords.join('、')}

このテーマに沿いながら、自然な会話を心がけてください。
しかし、会話がテーマから大きく外れるのは避けてください。`;
  }

  /**
   * テーマに基づいてプロンプトを拡張
   */
  expandPrompt(basePrompt: string): string {
    return `${this.getSystemPrompt()}\n\n${basePrompt}`;
  }

  /**
   * テーマ情報を取得
   */
  getTheme(): Theme {
    return this.theme;
  }
}
