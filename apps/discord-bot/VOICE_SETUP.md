# Discord音声配信機能セットアップガイド

## 🎤 概要

Qwen3 TTSを使用して、キャラクターの発言を音声でDiscord音声チャンネルに配信する機能を実装しました。

## 🔧 必要な環境

1. **Ollama + Qwen3 TTS対応モデル**
   - Ollamaがインストールされていること
   - TTS APIエンドポイントが利用可能であること

2. **FFmpeg**
   - 音声処理に必要
   - `ffmpeg-static`パッケージで自動インストール

3. **Discord音声チャンネル**
   - Botが参加できる音声チャンネル

## 📦 インストール

1. **依存関係のインストール**

```bash
cd apps/discord-bot
npm install
```

新たに追加されるパッケージ：
- `@discordjs/voice`: Discord音声機能
- `prism-media`: 音声コーデック
- `ffmpeg-static`: FFmpeg
- `libsodium-wrappers`: 音声暗号化

## ⚙️ 設定

### 1. 環境変数の設定

`.env`ファイルに以下を追加：

```bash
# === 音声配信設定 ===
# TTS APIのURL（Ollamaのエンドポイント）
TTS_API_URL=http://localhost:11434

# TTS機能を有効化（true/false）
TTS_ENABLED=true

# 音声チャンネルID（Discordから取得）
VOICE_CHANNEL_ID=your_voice_channel_id_here

# 音声チャンネル配信を有効化（true/false）
VOICE_CHANNEL_ENABLED=true
```

### 2. Discord音声チャンネルIDの取得方法

1. Discordで開発者モードを有効化
   - ユーザー設定 → 詳細設定 → 開発者モード ON

2. 音声チャンネルを右クリック → IDをコピー

3. `.env`の`VOICE_CHANNEL_ID`に貼り付け

### 3. Qwen3 TTS APIの準備

**注意**: 現在のコードは想定されるTTS APIエンドポイントの例です。
実際のQwen3 TTS APIの仕様に合わせて調整が必要です。

想定されるAPIエンドポイント：
```
POST http://localhost:11434/api/tts
```

リクエスト形式：
```json
{
  "text": "読み上げるテキスト",
  "voice_id": "ja-JP-female-1",
  "pitch": 1.0,
  "speed": 1.0,
  "volume": 0.8
}
```

## 🎯 キャラクター別音声プロファイル

デフォルトの音声設定：

| キャラクター | pitch | speed | volume | voiceId |
|------------|-------|-------|--------|---------|
| うさこ     | 1.3   | 1.0   | 0.8    | ja-JP-female-1 |
| ねここ     | 1.1   | 0.95  | 0.85   | ja-JP-female-2 |
| けろこ     | 0.9   | 1.15  | 0.9    | ja-JP-female-3 |

## 🚀 使い方

### 1. 通常起動（音声配信有効）

```bash
npm run dev
```

起動時のログ例：
```
✅ 全Botのログインが完了しました
✅ Ollamaに接続しました
🔊 音声チャンネルに接続中...
✅ 音声チャンネル接続完了
✅ TTS APIに接続しました
```

### 2. テキストのみ（音声配信無効）

`.env`で設定：
```bash
TTS_ENABLED=false
```

または

```bash
VOICE_CHANNEL_ENABLED=false
```

## 🎛️ カスタマイズ

### 音声プロファイルの変更

[src/tts/voiceManager.ts](src/tts/voiceManager.ts#L17-L35)で調整可能：

```typescript
private readonly voiceProfiles: Record<CharacterType, VoiceProfile> = {
  usako: {
    pitch: 1.3,    // 音の高さ (0.5 ~ 2.0)
    speed: 1.0,    // 話す速度 (0.5 ~ 2.0)
    volume: 0.8,   // 音量 (0.0 ~ 1.0)
    voiceId: 'ja-JP-female-1',
  },
  // ...
};
```

### TTS APIエンドポイントの調整

実際のQwen3 TTS APIに合わせて[src/tts/ttsClient.ts](src/tts/ttsClient.ts)を修正：

```typescript
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
```

## 🔍 トラブルシューティング

### 音声が再生されない

1. **TTS APIの接続確認**
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **FFmpegのインストール確認**
   ```bash
   ffmpeg -version
   ```

3. **Botの権限確認**
   - Discord Botに「音声接続」「発言」権限があるか
   - 音声チャンネルIDが正しいか

4. **ログを確認**
   ```
   ❌ TTS API error: 404 Not Found
   ```
   → TTS APIエンドポイントが間違っている

   ```
   ⚠️ TTS APIへの接続に失敗しました
   ```
   → OllamaまたはTTSサービスが起動していない

### 音声が途切れる

- ネットワーク帯域を確認
- `volume`パラメータを調整
- LLMの生成速度を改善

### エラーログの意味

| ログ | 意味 | 対処法 |
|------|------|--------|
| `❌ TTS生成エラー` | TTS API呼び出し失敗 | API URLと設定を確認 |
| `❌ AudioPlayerエラー` | 音声再生エラー | FFmpegとDiscord接続を確認 |
| `⚠️ 音声配信機能は無効化されます` | 初期化失敗 | 設定とチャンネルIDを確認 |

## 📊 動作の流れ

1. **初期化**
   - VoiceManagerを作成
   - 音声チャンネルに接続
   - TTS API接続テスト

2. **メッセージ送信**
   - テキストメッセージをDiscordに送信
   - 同時にTTS APIで音声生成
   - 音声キューに追加

3. **音声再生**
   - キューから順次取り出し
   - AudioPlayerで再生
   - 次のキューを処理

## 🎨 実装ファイル

| ファイル | 役割 |
|---------|------|
| [tts/ttsClient.ts](src/tts/ttsClient.ts) | Qwen3 TTS API呼び出し |
| [tts/voiceManager.ts](src/tts/voiceManager.ts) | Discord音声管理 |
| [types/index.ts](src/types/index.ts) | 型定義追加 |
| [config/index.ts](src/config/index.ts) | 設定追加 |
| [bots/BotManager.ts](src/bots/BotManager.ts) | 音声機能統合 |

## 🔮 今後の拡張案

- [ ] 感情に応じた音声パラメータ自動調整
- [ ] 音声エフェクト追加
- [ ] ポッドキャスト生成機能
- [ ] 音声コマンド対応（STT統合）
- [ ] Web UIで音声プレビュー機能

---

## 📝 備考

- この実装は**Qwen3 TTSのAPI仕様が公開されていることを前提**としています
- 実際のAPI仕様に合わせて`ttsClient.ts`の調整が必要です
- 音声配信はリソースを消費するため、適切に有効/無効を切り替えてください
