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
  reportThreshold: number;
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
 * Qwen3-TTS設定
 */
export interface Qwen3TTSConfig {
  modelName: string;  // "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
  deviceMap: string;  // "cuda:0" or "cpu"
  dtype: string;      // "torch.bfloat16" or "torch.float16"
  enabled: boolean;
}

/**
 * 音声プロファイル (Qwen3 CustomVoice用)
 */
export interface VoiceProfile {
  speaker: string;    // Qwen3スピーカー: "Vivian", "Serena", "Ryan" など
  language: string;   // "Japanese", "English", "Auto"
  instruct?: string;  // 音声命令（オプション）
  pitch?: number;     // 音の高さ調整（オプション、将来用）
  speed?: number;     // 話す速度調整（オプション、将来用）
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
