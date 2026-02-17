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
   * テキスト生成（ストリーミング対応）
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
      stream: true, // ストリーミングモードを有効化
      options: {
        temperature: options?.temperature ?? ollamaConfig.temperature,
        top_p: options?.topP ?? ollamaConfig.topP,
        repeat_penalty: options?.repeatPenalty ?? ollamaConfig.repeatPenalty,
        num_predict: options?.maxTokens ?? ollamaConfig.maxTokens,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30 * 60 * 1000); // 30分タイムアウト

    try {
      console.log(`🌐 Ollama API を呼び出し中 (${new Date().toLocaleTimeString()})...`);
      const startTime = Date.now();

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      // ストリーミングレスポンスを読み取り
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let fullThinking = '';
      let tokenCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line) as GenerateResponse;
            
            // レスポンステキストを蓄積
            if (data.response) {
              fullResponse += data.response;
              tokenCount++;
            }
            
            // thinking modeのテキストも蓄積
            if (data.thinking) {
              fullThinking += data.thinking;
            }

            // 進行状況を表示（10トークンごと）
            if (tokenCount % 10 === 0 && tokenCount > 0) {
              process.stdout.write('.');
            }

          } catch (e) {
            // JSON パースエラーは無視（不完全なチャンクの可能性）
            continue;
          }
        }
      }

      // タイムアウトをクリア（ストリーミング完了後）
      clearTimeout(timeoutId);

      console.log(); // 改行

      // qwen3のthinking modeに対応
      let generatedText = fullResponse.trim();
      if (!generatedText && fullThinking) {
        generatedText = fullThinking.trim();
      }

      if (!generatedText) {
        console.error('❌ Ollamaが空の応答を返しました。トークン数を増やしてください。');
      }

      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`⏱️ 生成処理完了 (合計${totalDuration}秒、${tokenCount}トークン)`);

      return generatedText;

    } catch (error) {
      clearTimeout(timeoutId);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // タイムアウトかどうかを判定
      const isTimeout = 
        errorMessage.includes('timeout') || 
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ESOCKETTIMEDOUT') ||
        errorMessage.includes('ERR_HTTP_REQUEST_TIMEOUT') ||
        error instanceof Error && error.name === 'AbortError';
      
      if (isTimeout) {
        console.error('⏱️ === Ollama 生成タイムアウト ===');
        console.error('❌ 生成処理が長時間かかっています（30分以上）');
        console.error(`エラー詳細: ${errorMessage}`);
      } else {
        console.error('❌ Ollama生成エラー:', errorMessage);
      }
      
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
