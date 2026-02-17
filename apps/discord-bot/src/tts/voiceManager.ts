import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnection,
  AudioPlayer,
  entersState,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import { CharacterType, VoiceProfile } from '../types/index.js';
import { TTSClient } from './ttsClient.js';
import { Readable } from 'stream';

/**
 * Discord音声チャンネル管理クラス
 * キャラクターごとの音声プロファイルを管理し、TTS音声を配信
 */
export class VoiceManager {
  private ttsClient: TTSClient;
  private connection: VoiceConnection | null = null;
  private audioPlayer: AudioPlayer;
  private isPlaying: boolean = false;
  private audioQueue: Array<{ text: string; profile: VoiceProfile }> = [];

  // キャラクターごとの音声プロファイル（Qwen3-TTS CustomVoice対応）
  private readonly voiceProfiles: Record<CharacterType, VoiceProfile> = {
    usako: {
      speaker: 'Vivian',      // 明るい若い女性 - うさこのキャラに最適
      language: 'Japanese',
      instruct: '明るくポジティブな少女のように話してください',
    },
    nekoko: {
      speaker: 'Serena',      // 優しい若い女性 - ねここのキャラに最適
      language: 'Japanese',
      instruct: '優しく穏やかな少女のように話してください',
    },
    keroko: {
      speaker: 'Ryan',        // ダイナミック男性 - けろこのキャラに最適
      language: 'Japanese',
      instruct: 'やや低めで元気な男性らしく話してください',
    },
  };

  // ボリューム調整（キャラクターごと）
  private readonly volumeProfiles: Record<CharacterType, number> = {
    usako: 0.8,   // 標準
    nekoko: 0.85, // やや大きめ
    keroko: 0.9,  // 大きめ
  };

  constructor() {
    this.ttsClient = new TTSClient();
    this.audioPlayer = createAudioPlayer();
    this.setupAudioPlayer();
  }

  /**
   * オーディオプレイヤーのイベント設定
   */
  private setupAudioPlayer(): void {
    this.audioPlayer.on('stateChange', (oldState, newState) => {
      console.log(`🎵 AudioPlayer状態変化: ${oldState.status} → ${newState.status}`);
      
      if (newState.status === AudioPlayerStatus.Idle) {
        this.isPlaying = false;
        // キューに次の音声があれば再生
        this.processQueue();
      } else if (newState.status === AudioPlayerStatus.Playing) {
        this.isPlaying = true;
      }
    });

    this.audioPlayer.on('error', (error) => {
      console.error('❌ AudioPlayerエラー:', error);
      this.isPlaying = false;
      this.processQueue();
    });
  }

  /**
   * 音声チャンネルに接続
   */
  async connect(voiceChannel: VoiceChannel): Promise<void> {
    if (this.connection) {
      console.log('⚠️ すでに音声チャンネルに接続済み');
      return;
    }

    try {
      console.log(`🔊 音声チャンネルに接続: ${voiceChannel.name}`);
      console.log(`   チャンネルID: ${voiceChannel.id}`);
      console.log(`   サーバーID: ${voiceChannel.guild.id}`);

      this.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
        selfMute: false,
      });

      // 接続状態の変化を監視
      this.connection.on('stateChange', (oldState, newState) => {
        console.log(`🔌 VoiceConnection状態変化: ${oldState.status} → ${newState.status}`);
        if (newState.status === VoiceConnectionStatus.Disconnected) {
          console.log('⚠️ 音声接続が切断されました');
        }
      });

      this.connection.on('error', (error) => {
        console.error('❌ VoiceConnection エラー:', error);
      });

      console.log('⏳ 音声チャンネル接続待機中...');
      console.log(`   現在の状態: ${this.connection.state.status}`);

      // 接続完了を待つ（タイムアウトを60秒に延長）
      await entersState(this.connection, VoiceConnectionStatus.Ready, 60_000);

      // オーディオプレイヤーをサブスクライブ
      this.connection.subscribe(this.audioPlayer);

      console.log('✅ 音声チャンネル接続完了');
    } catch (error) {
      console.error('❌ 音声チャンネル接続エラー:', error);
      if (this.connection) {
        console.log(`   最終状態: ${this.connection.state.status}`);
        if (this.connection.state.status === 'signalling') {
          console.log('💡 ヒント: 以下を確認してください:');
          console.log('   1. Discord Developer PortalでBotに「VOICE_STATES」intentsが有効か');
          console.log('   2. Botがサーバーに招待されているか');
          console.log('   3. Botに音声チャンネルへの「接続」「発言」権限があるか');
          console.log('   4. ファイアウォールがUDP通信をブロックしていないか');
        }
      }
      this.disconnect();
      throw error;
    }
  }

  /**
   * 音声チャンネルから切断
   */
  disconnect(): void {
    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
      console.log('🔇 音声チャンネルから切断');
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }

  /**
   * テキストを音声として再生（キューに追加）
   */
  async speak(text: string, characterType: CharacterType): Promise<void> {
    const profile = this.voiceProfiles[characterType];
    
    console.log(`🎤 [${characterType}] 音声キューに追加: "${text}"`);
    
    // キューに追加
    this.audioQueue.push({ text, profile });
    
    // 再生中でなければキュー処理開始
    if (!this.isPlaying) {
      await this.processQueue();
    }
  }

  /**
   * キューを処理して音声を順次再生
   */
  private async processQueue(): Promise<void> {
    if (this.audioQueue.length === 0 || this.isPlaying) {
      return;
    }

    if (!this.connection) {
      console.warn('⚠️ 音声チャンネルに接続されていません');
      this.audioQueue = [];
      return;
    }

    const item = this.audioQueue.shift();
    if (!item) return;

    try {
      // キャラクターのボリュームを取得
      const characterType = Object.keys(this.voiceProfiles).find(
        ch => JSON.stringify(this.voiceProfiles[ch as CharacterType]) === JSON.stringify(item.profile)
      ) as CharacterType | undefined;
      const volume = characterType ? this.volumeProfiles[characterType] : 0.8;

      // TTSで音声生成
      const audioStream = await this.ttsClient.textToSpeech(item.text, item.profile);
      
      // オーディオリソース作成
      const resource = createAudioResource(audioStream, {
        inlineVolume: true,
      });

      // ボリューム調整
      resource.volume?.setVolume(volume);

      // 再生
      this.audioPlayer.play(resource);
      console.log(`▶️ 音声再生開始 (ボリューム: ${volume})`);
    } catch (error) {
      console.error('❌ 音声再生エラー:', error);
      this.isPlaying = false;
      
      // エラーが発生しても次のキューを処理
      await this.processQueue();
    }
  }

  /**
   * 接続状態を取得
   */
  isConnected(): boolean {
    return this.connection !== null && 
           this.connection.state.status === VoiceConnectionStatus.Ready;
  }

  /**
   * キューの長さを取得
   */
  getQueueLength(): number {
    return this.audioQueue.length;
  }

  /**
   * TTS APIの接続テスト（実際に音声を再生）
   */
  async testTTSConnection(): Promise<boolean> {
    try {
      console.log('🔍 Qwen3-TTS接続テスト中（音声再生あり）...');
      
      // 各キャラクターの音声を短くテスト
      await this.speak('テストです', 'usako');
      
      console.log('✅ TTS接続テスト成功 - 音声を再生しました');
      return true;
    } catch (error) {
      console.error('❌ TTS接続テスト失敗:', error);
      return false;
    }
  }

  /**
   * 音声プロファイルを取得
   */
  getVoiceProfile(characterType: CharacterType): VoiceProfile {
    return { ...this.voiceProfiles[characterType] };
  }

  /**
   * 音声プロファイルをカスタマイズ
   */
  setVoiceProfile(characterType: CharacterType, profile: Partial<VoiceProfile>): void {
    this.voiceProfiles[characterType] = {
      ...this.voiceProfiles[characterType],
      ...profile,
    };
    console.log(`🎛️ [${characterType}] 音声プロファイル更新:`, this.voiceProfiles[characterType]);
  }
}
