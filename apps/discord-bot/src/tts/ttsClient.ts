import { TTSRequest, VoiceProfile } from '../types/index.js';
import { Readable } from 'stream';

/**
 * Qwen3 TTS APIクライアント
 * 音声合成を行うためのクライアント
 */
export class TTSClient {
  private apiUrl: string;

  constructor(apiUrl: string = 'http://localhost:11434') {
    this.apiUrl = apiUrl;
  }

  /**
   * テキストを音声データ（PCM）に変換
   * @param text 読み上げるテキスト
   * @param voiceProfile 音声プロファイル
   * @returns 音声データのストリーム
   */
  async textToSpeech(text: string, voiceProfile: VoiceProfile): Promise<Readable> {
    try {
      console.log(`🎤 TTS生成開始: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
      const request: TTSRequest = {
        text,
        voiceProfile,
      };

      // Qwen3 TTS API呼び出し
      // 注意: この部分は実際のQwen3 TTS APIの仕様に合わせて調整が必要
      const response = await fetch(`${this.apiUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          voice_id: request.voiceProfile.voiceId,
          pitch: request.voiceProfile.pitch,
          speed: request.voiceProfile.speed,
          volume: request.voiceProfile.volume,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('TTS API response body is null');
      }

      console.log(`✅ TTS生成完了`);

      // Node.js ReadableStreamをReadableに変換
      return Readable.fromWeb(response.body as any);
    } catch (error) {
      console.error('❌ TTS生成エラー:', error);
      throw error;
    }
  }

  /**
   * フォールバック: テキストを音声に変換できない場合のダミー音声生成
   * （開発・テスト用）
   */
  async generateSilence(duration: number = 1000): Promise<Readable> {
    console.log(`🔇 無音データ生成 (${duration}ms)`);
    
    // 48kHz, 2ch, 16bitのPCMフォーマットで無音データを生成
    const sampleRate = 48000;
    const channels = 2;
    const bytesPerSample = 2;
    const samples = Math.floor((duration / 1000) * sampleRate);
    const bufferSize = samples * channels * bytesPerSample;
    
    const silenceBuffer = Buffer.alloc(bufferSize, 0);
    
    return Readable.from(silenceBuffer);
  }

  /**
   * APIの接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('TTS API接続テスト失敗:', error);
      return false;
    }
  }
}
