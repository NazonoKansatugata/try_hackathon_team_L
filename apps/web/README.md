# Web フロントエンド (React + TypeScript + Vite)

キャラクター紹介とレポート機能を持つWebアプリケーションです。

## 🎭 キャラクター

discord-botで使用されている3人のキャラクター：
- **うさこ**: 主人公・ミステリアス担当（無口で寡黙）
- **ねここ**: ムードメーカー（明るく元気）
- **けろこ**: 性格切り替え可能（人格A/B）

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:5173 にアクセスしてください。

## 📚 初心者向けタスク

**[TASKS.md](./TASKS.md)** を参照してください。

このプロジェクトでは、以下の2つの画面を実装します：
- **キャラクター紹介画面** (`character-list/` - 担当者1)
- **キャラクター別レポート画面** (`character-reports/` - 担当者2)

それぞれ別のフォルダに分かれているので、並行作業が可能です。

## 🗂️ プロジェクト構成

```
src/
├── pages/              # ページコンポーネント
│   ├── character-list/        # キャラクター一覧（担当者1）
│   │   ├── CharacterList.tsx
│   │   └── CharacterList.css
│   └── character-reports/     # レポート画面（担当者2）
│       ├── CharacterReports.tsx
│       └── CharacterReports.css
├── types/              # 型定義
│   └── index.ts
├── data/               # サンプルデータ
│   └── sampleData.ts
├── App.tsx             # ルーティング設定
└── main.tsx            # エントリーポイント
```

## 🛠️ 利用可能なコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run preview  # ビルド結果のプレビュー
npm run lint     # ESLintでコードチェック
```

## 📖 技術スタック

- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **React Router** - ルーティング

---

## React + TypeScript + Vite について

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
