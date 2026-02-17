/**
 * お題データ
 */
export interface Theme {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
}

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
  kerokoPersonality: KerokoPersonality;
}

/**
 * Ollama設定
 */
export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature: number;
  topP: number;
  repeatPenalty: number;
  maxTokens: number;
}

/**
 * LLM生成リクエスト
 */
export interface GenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    repeat_penalty?: number;
    num_predict?: number;
  };
}

/**
 * LLM生成レスポンス
 */
export interface GenerateResponse {
  model: string;
  created_at: string;
  response: string;
  thinking?: string;  // qwen3のthinking mode対応
  done: boolean;
  done_reason?: string;
}

/**
 * 日報レポート
 */
export interface DailyReport {
  id?: string;
  characterType: CharacterType;
  characterName: string;
  content: string;
  timestamp: Date;
  messageCount: number;
}

/**
 * TTS設定
 */
export interface TTSConfig {
  apiUrl: string;
  enabled: boolean;
}

/**
 * 音声プロファイル
 */
export interface VoiceProfile {
  pitch: number;      // 音の高さ (0.5 ~ 2.0)
  speed: number;      // 話す速度 (0.5 ~ 2.0)
  volume: number;     // 音量 (0.0 ~ 1.0)
  voiceId: string;    // Qwen3の音声ID
}

/**
 * TTS リクエスト
 */
export interface TTSRequest {
  text: string;
  voiceProfile: VoiceProfile;
}

/**
 * 音声チャンネル設定
 */
export interface VoiceChannelConfig {
  channelId: string;
  enabled: boolean;
}
