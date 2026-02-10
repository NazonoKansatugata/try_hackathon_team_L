# ローカルLLM (Ollama) セットアップガイド

Webアプリでの開発において、モックデータではなく実際のAI応答を確認したい場合の手順です。
UIのレイアウト調整のみを行う場合は、この設定は不要です。

## 1. Ollama のインストール & 設定

### インストール
[Ollama公式サイト](https://ollama.com/) からOSに合わせてインストールしてください。

### CORS設定（必須）
WebブラウザからローカルのOllamaに接続するために、環境変数 `OLLAMA_ORIGINS="*"` を設定する必要があります。

- **Mac/Linux**: `launchctl setenv OLLAMA_ORIGINS "*"` を実行後、Ollamaを再起動。
- **Windows**: ユーザー環境変数に `OLLAMA_ORIGINS` 値 `*` を追加し、Ollamaを再起動。

## 2. モデル (Qwen 3.0) の準備

ターミナルで以下のコマンドを実行し、モデルをダウンロード・起動します。

```bash
# モデルのプル（ダウンロード）
ollama pull qwen3

# 動作確認
ollama run qwen3