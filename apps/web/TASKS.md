# 初心者向けタスク：キャラクター紹介 & レポート機能

## 📋 概要

このプロジェクトでは、以下の2つの画面を完成させます：
1. **キャラクター紹介画面** - キャラクターの一覧を表示
2. **キャラクター別レポート画面** - 選択したキャラクターのレポートを表示

## 🎭 キャラクター情報

discord-botで使用されている3人のキャラクター：

### うさこ (usako)
- **役割**: 主人公・ミステリアス担当
- **性格**: 無口で寡黙だが優しい。短文で簡潔に話す。
- **特徴**: ミステリアスな雰囲気だが、案外しっかりもの。

### ねここ (nekoko)
- **役割**: ムードメーカー
- **性格**: 明るく元気で活発。話好き。
- **特徴**: 場を盛り上げるのが得意。フレンドリーで親しみやすい。

### けろこ (keroko)
- **役割**: 性格切り替え可能
- **性格**: 人格Aはおどおどして怖がり、人格Bは少しツンツンした性格。
- **特徴**: 物知りで、選択した人格によって発言傾向が変化する。

## 🗂️ ファイル構成

```
src/
├── pages/
│   ├── character-list/         # キャラクター一覧（担当者1）
│   │   ├── CharacterList.tsx
│   │   └── CharacterList.css
│   └── character-reports/      # レポート画面（担当者2）
│       ├── CharacterReports.tsx
│       └── CharacterReports.css
├── types/
│   └── index.ts               # 型定義（Character, Report）
├── data/
│   └── sampleData.ts          # サンプルデータ
├── App.tsx                     # ルーティング設定（完成済み）
└── main.tsx                    # エントリーポイント（完成済み）
```

## 🚀 開発の開始方法

1. **開発サーバーの起動**
   ```bash
   cd apps/web
   npm run dev
   ```

2. **ブラウザで確認**
   - http://localhost:5173 にアクセス

## ✅ タスク１：キャラクター一覧画面を作る

**担当フォルダ**: `src/pages/character-list/`  
**ファイル**: `CharacterList.tsx`

### やること

1. **キャラクターデータを定義する**
   ```typescript
   const characters: Character[] = [
     { 
       id: 'usako', 
       name: 'うさこ', 
       description: '主人公・ミステリアス担当。無口で寡黙だが優しい。',
     },
     { 
       id: 'nekoko', 
       name: 'ねここ', 
       description: 'ムードメーカー。明るく元気で話好き。',
     },
     { 
       id: 'keroko', 
       name: 'けろこ', 
       description: '性格切り替え可能。人格によって発言が変化する。',
     },
   ];
   // または: const characters = sampleCharacters; // サンプルデータを使用
   ```

2. **キャラクターをカード表示する**
   - `characters.map()` を使って各キャラクターをループ
   - `character-cレポート画面を作る

**担当フォルダ**: `src/pages/character-reports/`  
**ファイル**: `CharacterReports.tsx`

### やること

1. **レポートデータを定義する**
   ```typescript
   const allReports: Report[] = [
     {
       id: 1,
       characterId: 'usako',
       date: '2024-01-15',
       title: '今日の活動',
       content: '今日は素晴らしい一日だった...'
     },
     // 各キャラクターのレポートを追加
   ];
   // または: const allReports = sampleReports; // サンプルデータを使用
   ```

2. **URLパラメータから該当キャラクターのレポートを取得**
   - `characterId` は既に取得済み（`useParams` で取得）
   - `allReports.filter(r => r.characterId === characterId)` で該当キャラクターのレポートだけを抽出

3. **レポートを一覧表示する**
   - `reports.map()` を使って各レポート
     // 複数の日記を追加
   ];
   ```

2. **URLパラメータから該当キャラクターの日記を取得**
   - `characterId` は既に取得済み（`useParams` で取得）
   - `diaries.filter()` で該当キャラクターの日記だけを抽出

3. **日記を一覧表示する**
   - `diaries.map()` を使って各日記をループ
   - 日付、タイトル、内容を表示

### ヒント

- サンプル表示が既にあるので参考にしてください
- 日付は新しいものから順に表示すると良いです（`.sort()` を使用）
- キャラクター名も表示すると親切です

## 🎨 スタイリング
character-list/CharacterList.css` - グリッドレイアウトで見やすく表示
- `character-reports/CharacterReports.css` - レポートエントリを縦に並べて表示

クラス名を正しく使えば、自動で綺麗にスタイルが適用されます。

## 🔗 ルーティング

既に設定済みです：
- `/` → キャラクター一覧画面
- `/character/:characterId` → キャラクター別レポート画面

`react-router-dom` の `<Link>` コンポーネントを使って画面遷移できます。

## 💡 拡張アイデア（オプション）

以上の基本機能ができたら、以下の機能を追加してみましょう：

1. **検索・フィルター機能**
   - キャラクター名で検索
   - レポートの内容で検索

2. **ソート機能**
   - 日付順、タイトル順で並び替え

3. **画像表示**
   - キャラクター画像やレポートの画像を追加

4. **詳細画面**
   - レポートをクリックすると詳細モーダルを表示

5. **データ永続化**
   - LocalStorageやFirebaseでデータを保存

6. **人格表示（けろこ）**
   - けろこの人格A/Bを表示・切り替え
5. **データ永続化**
   - LocalStorageやFirebaseでデータを保存

## 🆘 困ったときは

- TODOコメントを確認
- サンプルコードを参考にする
- CSSのクラス名を確認する
- React DevToolsで状態を確認する

頑張ってください！ 🚀
