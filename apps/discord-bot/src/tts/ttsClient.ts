import { VoiceProfile } from '../types/index.js';
import { Readable } from 'stream';
import { execFile } from 'child_process';
import { createReadStream, unlinkSync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Qwen3Response {
  status: string;
  output_path?: string;
  sample_rate?: number;
  duration_ms?: number;
  error?: string;
}

/**
 * Qwen3-TTS クライアント
 * Python qwen-tts パッケージを使用した音声合成
 */
export class TTSClient {
  private wrapperPyPath: string;

  constructor() {
    this.wrapperPyPath = resolve(__dirname, 'qwen3-wrapper.py');
  }

  /**
   * テキストを音声データに変換
   * @param text 読み上げるテキスト
   * @param voiceProfile 音声プロファイル（スピーカー、言語）
   * @returns 音声データのストリーム
   */
  async textToSpeech(text: string, voiceProfile: VoiceProfile): Promise<Readable> {
    const textTruncated = text.substring(0, 50);
    console.log(`🎤 TTS生成開始 [${voiceProfile.speaker}]: "${textTruncated}${text.length > 50 ? '...' : ''}"`);
    
    try {
      // Pythonラッパーを実行（output_pathは省略してPython側でtempfile自動生成）
      const args = [
        this.wrapperPyPath,
        text,
        voiceProfile.speaker,
        voiceProfile.language || 'Japanese',
        voiceProfile.instruct || 'none',
      ];
      const { stdout, stderr } = await execFileAsync('python', args);

      // 標準エラー出力を表示（進捗ログ）
      if (stderr) {
        console.log(`📌 TTS出力: ${stderr.trim()}`);
      }

      // JSONレスポンスをパース（stdoutの最後の行から取得）
      const lines = stdout.trim().split('\n');
      const jsonLine = lines[lines.length - 1];
      const result: Qwen3Response = JSON.parse(jsonLine);
      
      if (result.status !== 'success') {
        throw new Error(`TTS Error: ${result.error}`);
      }

      console.log(`✅ TTS生成完了 (${result.duration_ms}ms)`);

      // ファイルをストリームで返す
      // 完了後にファイルを削除
      const stream = createReadStream(result.output_path!);
      stream.on('end', () => {
        try {
          unlinkSync(result.output_path!);
          console.log(`🗑️ 一時ファイル削除: ${result.output_path!}`);
        } catch (err) {
          console.warn(`⚠️ 一時ファイル削除失敗: ${err}`);
        }
      });

      return stream;
    } catch (error) {
      console.error('❌ TTS生成エラー:', error);
      throw error;
    }
  }

  /**
   * フォールバック: 無音生成（テスト・デバッグ用）
   */
  async generateSilence(duration: number = 1000): Promise<Readable> {
    console.log(`🔇 無音データ生成 (${duration}ms)`);
    
    // 48kHz, 1ch, 16bitのPCMフォーマットで無音データを生成
    const sampleRate = 48000;
    const channels = 1;
    const bytesPerSample = 2;
    const samples = Math.floor((duration / 1000) * sampleRate);
    const bufferSize = samples * channels * bytesPerSample;
    
    const silenceBuffer = Buffer.alloc(bufferSize, 0);
    
    return Readable.from(silenceBuffer);
  }

  /**
   * モデルの接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Qwen3-TTSモデルの接続テスト中...');
      
      // ダミーテキストで実行
      const stream = await this.textToSpeech('テスト', {
        speaker: 'Vivian',
        language: 'Japanese',
      });
      
      // ストリームが生成されたら成功
      stream.destroy(); // すぐに破棄
      console.log('✅ Qwen3-TTS接続テスト成功');
      return true;
      
    } catch (error) {
      console.error('❌ Qwen3-TTS接続テスト エラー:', error);
      return false;
    }
  }
}
