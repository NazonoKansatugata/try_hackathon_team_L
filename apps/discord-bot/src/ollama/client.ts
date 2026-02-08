import { ollamaConfig } from '../config/index.js';
import { GenerateRequest, GenerateResponse } from '../types/index.js';

/**
 * Ollama APIクライアント
 */
export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || ollamaConfig.baseUrl;
  }

  /**
   * テキスト生成
   */
  async generate(prompt: string, options?: {
    temperature?: number;
    topP?: number;
    repeatPenalty?: number;
    maxTokens?: number;
  }): Promise<string> {
    const request: GenerateRequest = {
      model: ollamaConfig.model,
      prompt,
      stream: false,
      options: {
        temperature: options?.temperature ?? ollamaConfig.temperature,
        top_p: options?.topP ?? ollamaConfig.topP,
        repeat_penalty: options?.repeatPenalty ?? ollamaConfig.repeatPenalty,
        num_predict: options?.maxTokens ?? ollamaConfig.maxTokens,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as GenerateResponse;
      return data.response.trim();

    } catch (error) {
      console.error('❌ Ollama生成エラー:', error);
      throw error;
    }
  }

  /**
   * Ollama接続確認
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('❌ Ollama接続エラー:', error);
      return false;
    }
  }
}
