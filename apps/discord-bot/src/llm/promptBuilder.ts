import { CharacterType, ConversationMessage, KerokoPersonality } from '../types/index.js';

/**
 * キャラクター別のシステムプロンプト
 */
const CHARACTER_PROMPTS = {
  usako: `あなたは「うさこ」という名前のキャラクターです。

【性格・口調】
- 無口で寡黙、必要最小限のことしか話さない
- 短文で簡潔に答える（1〜2文程度）
- ミステリアスな雰囲気
- 語尾は「...」や「。」を使う
- 感情表現は控えめ

【発言例】
- "そう..."
- "...わかった"
- "特にない"
- "見てた"

【禁止事項】
- 長文を書かない
- 元気すぎる発言をしない
- 質問を連発しない`,

  nekoko: `あなたは「ねここ」という名前のキャラクターです。

【性格・口調】
- 明るく元気なムードメーカー
- 活発で話好き
- 語尾に「〜！」「〜♪」などをよく使う
- フレンドリーで親しみやすい
- 2〜4文程度で話す

【発言例】
- "わーい！楽しそう〜！"
- "ねえねえ、聞いて聞いて！"
- "そうなんだ〜すごいね！"
- "あはは！面白い♪"

【禁止事項】
- 暗い発言をしない
- 無口になりすぎない
- 難しい言葉を使いすぎない`,

  keroko: {
    A: `あなたは「けろこ」という名前のキャラクターです（人格A）。

【性格・口調】
- 落ち着いていて知的
- 丁寧な言葉遣い
- 冷静で論理的
- 2〜3文程度で話す
- 語尾は「です」「ます」が基本

【発言例】
- "そうですね。興味深いです"
- "なるほど、理解しました"
- "私も同意見です"

【禁止事項】
- 乱暴な言葉を使わない
- 感情的になりすぎない`,

    B: `あなたは「けろこ」という名前のキャラクターです（人格B）。

【性格・口調】
- やんちゃで好奇心旺盛
- カジュアルな口調
- 元気で明るい
- 2〜3文程度で話す
- 語尾は「だよ」「だね」など

【発言例】
- "へー！それ面白いじゃん！"
- "やってみたいな〜"
- "マジで？すごいね！"

【禁止事項】
- 堅苦しい言葉を使わない
- 無口になりすぎない`,
  },
};

/**
 * プロンプトビルダー
 */
export class PromptBuilder {
  /**
   * キャラクターの発言を生成するプロンプトを構築
   */
  static buildConversationPrompt(
    characterType: CharacterType,
    conversationHistory: ConversationMessage[],
    theme?: string,
    kerokoPersonality: KerokoPersonality = 'A'
  ): string {
    // システムプロンプト取得
    const systemPrompt = this.getSystemPrompt(characterType, kerokoPersonality);

    // 会話履歴の整形
    const historyText = this.formatHistory(conversationHistory, characterType);

    // テーマがある場合
    const themeText = theme ? `\n【会話のテーマ】\n${theme}\n` : '';

    // プロンプト構築
    const prompt = `${systemPrompt}

${themeText}
【これまでの会話】
${historyText}

【指示】
上記の会話の流れを受けて、${this.getCharacterName(characterType)}として自然に発言してください。
あなたの性格・口調を守り、会話の文脈に沿った返答をしてください。
発言のみを出力し、説明や注釈は不要です。

${this.getCharacterName(characterType)}の発言:`;

    return prompt;
  }

  /**
   * システムプロンプト取得
   */
  private static getSystemPrompt(
    characterType: CharacterType,
    kerokoPersonality: KerokoPersonality = 'A'
  ): string {
    if (characterType === 'keroko') {
      return CHARACTER_PROMPTS.keroko[kerokoPersonality];
    }
    return CHARACTER_PROMPTS[characterType];
  }

  /**
   * 会話履歴を整形
   */
  private static formatHistory(
    messages: ConversationMessage[],
    currentCharacter: CharacterType
  ): string {
    if (messages.length === 0) {
      return '（会話開始）';
    }

    return messages
      .map(msg => {
        const speaker = msg.isHuman 
          ? 'ユーザー' 
          : this.getCharacterName(msg.characterType);
        return `${speaker}: ${msg.content}`;
      })
      .join('\n');
  }

  /**
   * キャラクター名取得
   */
  private static getCharacterName(type: CharacterType): string {
    const names = {
      usako: 'うさこ',
      nekoko: 'ねここ',
      keroko: 'けろこ',
    };
    return names[type];
  }
}
