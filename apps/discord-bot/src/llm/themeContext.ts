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
    const scenarioPrompt = `テーマ「${this.theme.title}」を舞台にした、うさこ、ねここ、けろこ3人の物語を生成してください。

キャラクター設定：
- うさこ：無口で寡黙だが、物語の主人公として3人を自然に導く。ミステリアスながらもしっかりしている
- ねここ：明るく元気。砕けた口調で雰囲気を盛り上げ、3人の絆を深める。ムードメーカーとしての役割
- けろこ：物知りで知識が豊富。控えめながら確かな視点で、隠れた真実や別の可能性を指摘する

【物語の構成要素】
必ず以下の要素を含む物語にしてください：
1. 導入：3人が状況に直面し、それぞれが異なる反応を示す
2. ハプニング：予期しない出来事や障害が発生し、状況が一変する
3. 盛り上がりどころ：3人が協力し、困難に立ち向かい、葛藤や試練を乗り越えるクライマックス
4. 結末：3人の経験を通じた成長や、新たな理解への到達

この3人が「${this.theme.title}」という状況で体験する物語をJSON形式で作成してください。

JSON構造:
{
  story: {
    title: "ストーリーのタイトル",
    setting: "物語の舞台や状況",
    events: [各イベント],
    turning_points: [各ターニングポイント],
    characterDynamics: "3人の関係性の変化と絆の深まり",
    narrative: "物語全体の流れと感動の要素"
  }
}

JSON形式で物語を生成してください。`;

    try {
      console.log('🧠 テーマの会話シナリオを生成中...');
      this.scenario = await this.ollamaClient.generate(scenarioPrompt);
      console.log('✅ シナリオ生成完了');
    } catch (error) {
      console.error('❌ シナリオ生成失敗、デフォルト使用:', error);
      // デフォルトシナリオにフォールバック
      this.scenario = `テーマ「${this.theme.title}」について、3人がそれぞれの視点から意見を交わし、最終的に共通の理解に達するシナリオです。`;
    }
  }

  /**
   * 会話履歴を踏まえてシナリオを更新
   */
  async updateScenario(recentMessages: string): Promise<void> {
    const updatePrompt = `テーマ「${this.theme.title}」を舞台にしたうさこ、ねここ、けろこ3人の物語が進行しています。

【現在の物語】
${this.scenario}

【これまでの会話・出来事】
${recentMessages}

【物語更新の指針】
上記の物語と会話の流れを踏まえて、物語がどのように次へ展開するべきか考慮してください。
特に以下の点を意識してください：
1. ハプニングや転機を適切に配置し、物語に緊張度を保つ
2. 3人の個性と役割が活きるような相互作用を作る
3. 盛り上がりどころへ向けて着実に物語を進める
4. キャラクターの成長や心情の変化を描く

JSON形式で物語の続きを生成してください。
{
  storyUpdate: {
    nextEvents: [各イベント],
    upcoming_turning_points: [次のターニングポイント],
    narrativeShift: "物語の流れがどう変わるか",
    characterGrowth: "各キャラクターの成長や気づき",
    nextPhase: "物語が次に向かう方向と緊張感の高まり"
  }
}`;

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
    return `【物語の舞台】
テーマ: ${this.theme.title}
説明: ${this.theme.description}
カテゴリ: ${this.theme.category}
関連キーワード: ${this.theme.keywords.join('、')}

【物語の登場人物】
3人の主人公たちが、このテーマの世界で冒険し、成長していく物語です：

1. うさこ（主人公・リーダー）
   - 性格：無口で寡黙、ミステリアスだがしっかりもの
   - 役割：物語のリーダー。短い言葉で3人を導き、話題を提示する
   - 成長：ミステリアスな立場から、次第に仲間たちと心を通わせていく

2. ねここ（ムードメーカー）
   - 性格：明るく元気、砕けた口調で親しみやすい
   - 役割：物語を盛り上げ、重い雰囲気を変える。3人の絆を強くする
   - 成長：単なるムードメーカーから、深い思いやりを持つようになる

3. けろこ（知識者）
   - 性格：物知りで知識が豊富。控えめながら確かな知見を持つ
   - 役割：物語に奥行きを与え、隠れた真実や別の視点を提供
   - 成長：知識だけでなく、直感や感情の大切さを学んでいく

この3人が「${this.theme.title}」という世界で出会う出来事、経験、葛藤、成長を描く物語を展開してください。`;
  }

  /**
   * シナリオをプロンプトに含める
   */
  getScenarioPrompt(): string {
    if (!this.scenario) {
      return '';
    }

    return `【物語の流れ】
うさこ、ねここ、けろこの3人が経験する物語の流れ：

${this.scenario}

【各キャラクターの発言・行動時のポイント】

うさこ（無口で寡黙な主人公）：
- 短めの発言で物語を牽引する（「...」や「。」で控えめに）
- 他のキャラクターを導き、決断を促す
- ミステリアスさを保ちながらも、時折優しさや想いを見せる

ねここ（明るいムードメーカー）：
- 元気で砕けた口調で、雰囲気を盛り上げる（「〜！」「〜♪」など）
- 3人の絆を強くする心温まる言葉を発する
- 時に深い思慮も示し、成長を表現

けろこ（物知りな存在）：
- 知識や情報で物語に奥行きを与える
- 控えめながら確かな視点を提供
- 隠れた真実や別の可能性に気づき、物語を深める

上記のガイドに沿い、3人のキャラクターが自分の性質と役割を保ちながら、
自然で感動的な物語の展開を心がけてください。`;
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

