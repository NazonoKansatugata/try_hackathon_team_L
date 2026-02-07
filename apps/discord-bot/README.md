# Discord Bot - おしゃべりうさこ部

3つのキャラクター（うさこ・ねここ・けろこ）がDiscord上で会話するBotシステム。

## 🏗️ アーキテクチャ

- **1プロセスで3つのBotクライアントを管理**
- 各キャラクターは独立したDiscord Botアカウント
- TypeScript + discord.js で実装

## 📁 ディレクトリ構成

```
discord-bot/
├─ src/
│  ├─ index.ts           # エントリーポイント
│  ├─ bots/
│  │  ├─ CharacterBot.ts # Bot基底クラス
│  │  └─ BotManager.ts   # Bot管理クラス
│  ├─ config/
│  │  └─ index.ts        # 設定管理
│  └─ types/
│     └─ index.ts        # 型定義
├─ package.json
├─ tsconfig.json
└─ .env                  # 環境変数（要作成）
```

## 🚀 セットアップ

### 1. Discord Bot アカウントの作成

3つのBotアカウントを作成する必要があります：

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 各キャラクター用に3つのアプリケーションを作成
   - うさこ Bot
   - ねここ Bot
   - けろこ Bot
3. それぞれで以下の設定を実施：
   - Bot タブから Bot を追加
   - **MESSAGE CONTENT INTENT** を有効化（重要！）
   - Token をコピー

### 2. Bot の招待

各Botに必要な権限：
- Send Messages
- Read Messages/View Channels
- Read Message History

OAuth2 URL Generator で招待URLを生成し、同じサーバーに招待してください。

### 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

以下の値を設定：

```env
# 各BotのToken
USAKO_BOT_TOKEN=your_usako_token
NEKOKO_BOT_TOKEN=your_nekoko_token
KEROKO_BOT_TOKEN=your_keroko_token

# サーバーとチャンネルID
GUILD_ID=your_server_id
CHANNEL_ID=your_channel_id
```

### 4. 依存関係のインストール

```bash
npm install
```

### 5. 起動

開発モード（ホットリロード）：

```bash
npm run dev
```

本番モード：

```bash
npm run build
npm start
```

## 🧪 テスト

起動後、5秒待機してから各キャラクターが1回ずつテストメッセージを送信します：

- うさこ: 「よろしく...」
- ねここ: 「わーい！みんなよろしくね～！」
- けろこ: 「こんにちは。けろこです。」

## 📝 現在の実装状況

### ✅ 完了
- [x] 3つのBot同時ログイン機能
- [x] Bot基底クラス (`CharacterBot`)
- [x] Bot管理クラス (`BotManager`)
- [x] 設定管理
- [x] 型定義
- [x] メッセージ送信機能
- [x] 基本的なエラーハンドリング

### 🚧 未実装（今後の課題）
- [ ] Ollama連携（LLMによる応答生成）
- [ ] 自律会話システム（10:00〜18:00）
- [ ] 会話ログの保存
- [ ] 人間の介入への対応
- [ ] コマンドシステム（テーマ指定など）
- [ ] けろこの人格切り替え機能
- [ ] コンテキスト管理

## 🔧 トラブルシューティング

### Bot がログインできない
- Tokenが正しいか確認
- `.env` ファイルが正しい場所にあるか確認

### メッセージが送信されない
- Bot が対象チャンネルにアクセスできる権限があるか確認
- `CHANNEL_ID` が正しいか確認
- Discord Developer Portal で **MESSAGE CONTENT INTENT** が有効か確認

### 型エラーが出る
```bash
npm run type-check
```

## 📚 次のステップ

1. **Ollama連携の実装** - LLMによる応答生成
2. **会話システムの実装** - 自律的な会話フロー
3. **データベース連携** - 会話ログの永続化

詳細は[企画書](../../README.md)を参照。
