/**
 * キャラクターの種類
 */
export type CharacterType = 'usako' | 'nekoko' | 'keroko';

/**
 * けろこの人格タイプ
 */
export type KerokoPersonality = 'A' | 'B';

/**
 * キャラクター設定
 */
export interface CharacterConfig {
  name: string;
  type: CharacterType;
  token: string;
  displayName: string;
  description: string;
  personality: string;
}

/**
 * 会話メッセージ
 */
export interface ConversationMessage {
  id: string;
  characterType: CharacterType;
  content: string;
  timestamp: Date;
  isHuman: boolean;
}

/**
 * Bot設定
 */
export interface BotConfig {
  guildId: string;
  channelId: string;
  autoConversationStartHour: number;
  autoConversationEndHour: number;
  messageIntervalMin: number;
  messageIntervalMax: number;
}

/**
 * Ollama設定
 */
export interface OllamaConfig {
  baseUrl: string;
  model: string;
}
