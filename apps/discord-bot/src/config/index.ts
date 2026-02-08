import { config } from 'dotenv';
import { CharacterConfig, BotConfig, OllamaConfig } from '../types/index.js';

config();

/**
 * 環境変数の検証
 */
function validateEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
}

/**
 * キャラクター設定
 */
export const characters: CharacterConfig[] = [
  {
    name: 'うさこ',
    type: 'usako',
    token: validateEnv('USAKO_BOT_TOKEN'),
    displayName: 'うさこ',
    description: '主人公・ミステリアス担当',
    personality: '無口気味で短文が多い。ミステリアスな雰囲気を持つ。',
  },
  {
    name: 'ねここ',
    type: 'nekoko',
    token: validateEnv('NEKOKO_BOT_TOKEN'),
    displayName: 'ねここ',
    description: 'ムードメーカー',
    personality: '元気で活発。場を盛り上げるのが得意。',
  },
  {
    name: 'けろこ',
    type: 'keroko',
    token: validateEnv('KEROKO_BOT_TOKEN'),
    displayName: 'けろこ',
    description: '性格切り替え可能',
    personality: '選択した人格によって発言傾向が変化する。',
  },
];

/**
 * Bot設定
 */
export const botConfig: BotConfig = {
  guildId: validateEnv('GUILD_ID'),
  channelId: validateEnv('CHANNEL_ID'),
  autoConversationStartHour: parseInt(process.env.AUTO_CONVERSATION_START_HOUR || '10'),
  autoConversationEndHour: parseInt(process.env.AUTO_CONVERSATION_END_HOUR || '18'),
  messageIntervalMin: parseInt(process.env.MESSAGE_INTERVAL_MIN || '30'),
  messageIntervalMax: parseInt(process.env.MESSAGE_INTERVAL_MAX || '120'),
};

/**
 * Ollama設定
 */
export const ollamaConfig: OllamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'qwen3.0',
  temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.8'),
  topP: parseFloat(process.env.OLLAMA_TOP_P || '0.9'),
  repeatPenalty: parseFloat(process.env.OLLAMA_REPEAT_PENALTY || '1.1'),
  maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '150'),
};
