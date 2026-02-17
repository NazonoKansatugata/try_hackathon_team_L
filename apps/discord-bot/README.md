# Discord Bot - おしゃべりうさこ部

3つのキャラクター（うさこ・ねここ・けろこ）がDiscord上で自律的に会話するBotシステム。

**主な特徴**
- 🤖 Ollama（LLM）による自然な会話生成
- 📊 リアルタイム会話品質スコア評価
- 🔄 動的シナリオ更新による会話の活性化
- 🛡️ 4段階のエラー復旧システム
- 📝 自動日報生成機能

## 🏗️ アーキテクチャ

- **1プロセスで3つのBotクライアントを管理**
- 各キャラクターは独立したDiscord Botアカウント
- TypeScript + discord.js で実装
- Ollama（ローカルLLM）で応答生成
- Firebase/Firestoreでテーマ管理・日報保存

## 📁 ディレクトリ構成

```
discord-bot/
├─ src/
│  ├─ index.ts                          # エントリーポイント
│  ├─ analysis/
│  │  └─ conversationQualityAnalyzer.ts # 会話品質スコア分析
│  ├─ bots/
│  │  ├─ CharacterBot.ts                # Bot基底クラス
│  │  ├─ BotManager.ts                  # Bot管理クラス
│  │  └─ errorRecoveryManager.ts        # エラー復旧管理
│  ├─ config/
│  │  └─ index.ts                       # 設定管理
│  ├─ conversation/
│  │  └─ history.ts                     # 会話履歴管理
│  ├─ firebase/
│  │  └─ firestore.ts                   # Firebase連携
│  ├─ llm/
│  │  ├─ promptBuilder.ts               # プロンプト構築
│  │  ├─ reportPromptBuilder.ts         # 日報用プロンプト
│  │  ├─ themeContext.ts                # テーマコンテキスト
│  │  └─ themeContextFactory.ts         # セッション管理
│  ├─ ollama/
│  │  └─ client.ts                      # Ollama APIクライアント
│  └─ types/
│     └─ index.ts                       # 型定義
├─ package.json
├─ tsconfig.json
└─ .env                                 # 環境変数（要作成）
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

# Ollama設定
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b

# Firebase設定（Firestoreからテーマを取得）
# Firebase Admin SDKの認証情報を設定
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
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

## 🧪 起動と動作

### 起動方法

開発モード（ホットリロード）：

```bash
npm run dev
```

本番モード：

```bash
npm run build
npm start
```

### 動作フロー

1. **初期化フェーズ（約5秒）**
   - 3つのBotクライアントが順次ログイン
   - Ollama（LLM）への接続確認
   - Firebase初期化
   - 人間のメッセージハンドラー設定

2. **テーマ取得**
   - Firestoreからランダムなテーマを取得
   - テーマに基づいた会話シナリオを自動生成
   - テーマ情報とシナリオをコンソールに表示

3. **自律会話開始**
   - うさこが最初の発言を開始
   - 3つのキャラクターがランダムに交代しながら会話
   - 各ターンで会話品質スコアを計算・表示
   - スコアに応じてシナリオを動的に更新

4. **会話中の監視**
   - リアルタイムで会話品質を評価
   - エラーが発生した場合は段階的に復旧を試みる
   - 人間が介入した場合は自動的に会話に統合

5. **日報生成（30ターン到達時）**
   - うさこが終了メッセージを送信
   - 各キャラクターの視点から日記を生成
   - Firestoreに保存
   - 会話履歴をクリアして終了

### コンソール出力例

```
🤖 5秒後に自律会話を開始します...

🎨 【テーマ情報】
   タイトル: 秋のキャンプ
   説明: 3人で秋のキャンプに出かける

📝 【生成されたシナリオ】
   紅葉が美しい秋の森でキャンプをする3人...

💬 シナリオに基づいて会話を開始します...

🤔 usako が考え中...

📊 【会話評価】
   品質スコア: 75.5%
   会話状態: ✅ つながっている
   📐 類似度分析:
      直前2発言の類似度: 38.2%
      理想値との差: 0.02
      キャラ多様性: 2/3キャラ
```

## 🎯 主要機能

### 🤖 自律会話システム
- **3つのキャラクターBotによる自動会話**
  - うさこ（内向的）、ねここ（明るい）、けろこ（真面目）が自律的に対話
  - Ollama（LLM）による自然な応答生成
  - Firestoreから取得したテーマに基づいた会話

### 📊 会話品質スコア評価システム
会話の質をリアルタイムで分析し、動的にシナリオを調整する高度な評価機構を実装。

#### スコア計算の要素（0-1の範囲）
1. **キャラクターの多様性** (+30%)
   - 直近3メッセージでのキャラクター切り替えを評価
   - 同じキャラが連続すると減点

2. **停滞検出** (-10%)
   - 同一キャラの連続短文化を検出
   - 20文字未満の短い発言が連続すると警告

3. **メッセージ類似度** (+20%)
   - バイグラム方式でテキスト類似度を計算
   - 理想値（40%）に近いほど高評価
   - 似すぎ・離れすぎの両方を検出

#### 会話状態の判定
- **🌟 opening** - 会話開始（3ターン未満）
- **✅ connected** - つながっている（スコア70%以上）
- **⚠️ stagnant** - 停滞（スコア40-70%）
- **🔴 disconnected** - 断絶（スコア40%未満）

#### 動的シナリオ更新
品質スコアに基づいて会話シナリオを自動更新：
- 低品質（40%未満）+ 5ターン経過 → シナリオ更新
- 中品質（60%未満）+ 15ターン経過 → シナリオ更新
- デフォルト：20ターン経過で更新

### 🛡️ エラー復旧システム
段階的なエラー復旧戦略で会話の安定性を確保。

#### 4段階の復旧レベル
1. **レベル1** - 短い待機後に再試行（3秒、最大2回）
2. **レベル2** - キャラ交代を試みる（10秒、最大2回）
3. **レベル3** - テーマ切り替え（15秒、1回）
4. **レベル4** - 会話停止

連続失敗回数に応じて自動的にレベルが上がり、適切な復旧アクションを実行します。

### 👤 人間の介入対応
- ユーザーがチャンネルにメッセージを送信すると検出
- 生成中のリクエストを自動キャンセル
- 人間の発言を会話履歴に統合し、自然に会話を継続

### 📝 日報生成機能
- 会話が30ターンに達すると各キャラの視点から日記を生成
- LLMによる自動要約と感想生成
- Firestoreに保存し、Webアプリから閲覧可能

## 📁 アーキテクチャ詳細

### 主要コンポーネント
- **BotManager** - 全体の制御と会話フロー管理
- **CharacterBot** - 各キャラクターBotの基底クラス
- **ConversationQualityAnalyzer** - 会話品質の分析エンジン
- **ErrorRecoveryManager** - エラー復旧戦略の管理
- **ThemeContextFactory** - テーマコンテキストのセッション管理
- **OllamaClient** - LLM APIクライアント
- **ConversationHistory** - 会話履歴の永続化

## 📝 現在の実装状況

### ✅ 完了
- [x] 3つのBot同時ログイン機能
- [x] Bot基底クラス・管理クラス
- [x] Ollama連携（LLMによる応答生成）
- [x] 自律会話システム
- [x] 会話品質スコア評価システム
- [x] 動的シナリオ更新機能
- [x] エラー復旧システム（4段階）
- [x] 人間の介入への対応
- [x] 会話履歴管理（無制限保持）
- [x] Firebase/Firestore連携
- [x] テーマ自動取得・コンテキスト管理
- [x] 日報生成機能
- [x] メッセージ類似度分析（バイグラム）

### 🚧 今後の拡張案
- [ ] 時間帯による自動起動・停止（10:00〜18:00）
- [ ] コマンドシステム（テーマ指定など）
- [ ] けろこの人格切り替え機能の強化
- [ ] 会話パターンの学習・最適化

## 🔧 トラブルシューティング

### Bot がログインできない
- Tokenが正しいか確認
- `.env` ファイルが正しい場所（`apps/discord-bot/`）にあるか確認
- Discord Developer Portal でBotが有効化されているか確認

### メッセージが送信されない
- Bot が対象チャンネルにアクセスできる権限があるか確認
- `CHANNEL_ID` が正しいか確認
- Discord Developer Portal で **MESSAGE CONTENT INTENT** が有効か確認
- Botが対象サーバーに招待されているか確認

### Ollama に接続できない
- Ollamaがローカルで起動しているか確認：
  ```bash
  ollama serve
  ```
- モデルがダウンロードされているか確認：
  ```bash
  ollama list
  ollama pull qwen2.5:14b
  ```
- `OLLAMA_BASE_URL` が正しいか確認（デフォルト: `http://localhost:11434`）

### Firebase エラー
- Firebase Admin SDKの認証情報が正しいか確認
- Firestoreにテーマデータが登録されているか確認
- プロジェクトIDが正しいか確認

### 会話が停滞する
- エラー復旧システムが自動的に対処します
- レベル2以上になるとキャラ交代が発生します
- レベル3でテーマが自動切り替えされます
- コンソールログで品質スコアと復旧レベルを確認

### 型エラーが出る
```bash
npm run type-check
```

### 依存関係のエラー
```bash
rm -rf node_modules package-lock.json
npm install
```

## � 技術詳細：会話品質スコアの仕組み

### スコア計算アルゴリズム

品質スコアは以下の要素を組み合わせて0-1の範囲で計算されます。

#### 1. 基本スコア（0.5）
デフォルトで中程度の品質からスタート。

#### 2. キャラクター多様性（+0〜0.3）
```typescript
const characterDiversity = uniqueCharacters / 3;
score += characterDiversity * 0.3;
```
直近3メッセージで異なるキャラクターが発言するほど高評価。

#### 3. 停滞ペナルティ（-0.1）
同一キャラが連続して20文字未満の短い発言をすると減点：
```typescript
if (sameCharacter && shortMessages && consecutive) {
  score -= 0.1;
}
```

#### 4. 類似度スコア（+0〜0.2）
前後のメッセージの類似度を測定し、理想値（40%）との差を評価：
```typescript
const similarity = calculateBigramSimilarity(msg1, msg2);
const idealSimilarity = 0.4;
const similarityScore = 1 - Math.abs(similarity - idealSimilarity);
score += similarityScore * 0.2;
```

### バイグラム類似度

日本語テキストの類似度計算にバイグラム（2文字単位）を使用：

1. テキストを2文字ずつスライディングウィンドウで分割
2. Jaccard係数で類似度を計算：
   ```
   similarity = |intersection| / |union|
   ```

### バイグラム類似度

日本語テキストの類似度計算にバイグラム（2文字単位）を使用：

1. テキストを2文字ずつスライディングウィンドウで分割
2. Jaccard係数で類似度を計算：
   ```
   similarity = |intersection| / |union|
   ```

### 会話状態別の制御プロンプト

各状態に応じて以下のようなプロンプトをLLMに追加指示：

| 状態 | 制御プロンプト |
|------|---------------|
| **opening** | 物語の場面を自然に切り出し、テーマの世界を3人が体験していく流れを作る |
| **connected** | 無理に話題を変えず、今の流れを尊重して関係性を深める |
| **stagnant** | さりげなく新しい要素や視点を追加して、会話に奥行きを持たせる |
| **disconnected** | 前の発言とつなぐ一言を入れて、会話の流れを自然にする |

この制御プロンプトにより、LLMが会話の文脈を理解し、適切な応答を生成します。

### 会話状態マッピング

| スコア範囲 | 状態 | 説明 |
|-----------|------|------|
| 70%以上 | connected | 会話がスムーズにつながっている |
| 40-70% | stagnant | やや停滞気味 |
| 40%未満 | disconnected | 会話が断絶している |
| 3ターン未満 | opening | 会話開始フェーズ |

### シナリオ更新トリガー

品質スコアとターン数の組み合わせで判定：

```typescript
// 低品質で早期更新
if (score < 0.4 && turns >= 5) updateScenario();

// 中品質で中期更新
if (score < 0.6 && turns >= 15) updateScenario();

// デフォルト長期更新
if (turns >= 20) updateScenario();
```

これにより、会話の状態に応じて柔軟にシナリオを刷新し、停滞を防ぎます。

## �📚 次のステップ

## 📚 次のステップ・拡張案

### 実装可能な機能拡張

1. **時間帯による自動運用**
   - cron等で10:00に起動、18:00に終了
   - 時間帯に応じた挨拶メッセージ

2. **コマンドシステム**
   - `/theme [テーマ名]` でテーマを指定
   - `/score` で現在の品質スコアを表示
   - `/report` で途中経過の日報生成

3. **けろこの人格切り替え強化**
   - 会話の流れに応じて自動的に人格を切り替え
   - 真面目モード・ギャグモードの識別機能

4. **会話パターンの学習**
   - 過去の会話履歴から学習
   - 高評価だった会話パターンの再利用

5. **マルチチャンネル対応**
   - 複数のチャンネルで並行して会話
   - チャンネルごとに異なるテーマ

6. **感情分析**
   - 会話のトーンを分析
   - ポジティブ・ネガティブを可視化

7. **統計ダッシュボード**
   - 発言数、品質スコアの推移をグラフ化
   - キャラクターごとの発言傾向分析

### 技術的な改善案

- ストリーミング応答の活用（既に実装済み）
- より高精度な類似度計算アルゴリズム
- キャッシュ機能によるレスポンス高速化
- テストコードの充実

詳細は[企画書](../../README.md)を参照。
