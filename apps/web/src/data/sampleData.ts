import type { Character, Report } from '../types';

/**
 * サンプルキャラクターデータ
 * 
 * TODO: このデータを参考にして、自分のキャラクターを追加してください
 * 参考：discord-botのキャラクター
 * - うさこ (usako): 主人公・ミステリアス担当。無口気味で短文が多い。
 * - ねここ (nekoko): ムードメーカー。元気で活発。場を盛り上げるのが得意。
 * - けろこ (keroko): 性格切り替え可能。人格Aはおどおど、人格Bはクール。
 */
export const sampleCharacters: Character[] = [
  {
    id: 'usako',
    name: 'うさこ',
    description: '主人公・ミステリアス担当。無口で寡黙だが優しい。短文で簡潔に話す。',
    profile: {
      catchphrase: '「……あそぼ？」',
      role: 'ゲーム',
      likes: ['うまい棒'],
      dislikes: ['にんじん'],
    },
  },
  {
    id: 'nekoko',
    name: 'ねここ',
    description: 'ムードメーカー。明るく元気で話好き。会話を盛り上げるのが得意。',
    profile: {
      catchphrase: '「盛り上げ担当、参上ーっ！」',
      role: 'グラフィック',
      likes: ['チロルチョコ'],
      dislikes: ['さかな'],
    },
  },
  {
    id: 'keroko',
    name: 'けろこ',
    description: 'けろこAはおどおどして怖がり、けろこBはクールなやつ。',
    profile: {
      catchphrase: '「べ、別に怖くないし！」',
      role: 'ギーク',
      likes: ['蒲焼さん太郎'],
      dislikes: ['虫'],
    },
    profileVariants: {
      A: {
        catchphrase: '「怖いです...」',
      },
      B: {
        catchphrase: '「ふーん、そっか」',
      },
    },
  },
];

/**
 * サンプルレポートデータ
 * 
 * TODO: このデータを参考にして、各キャラクターのレポートを追加してください
 */
export const sampleReports: Report[] = [
  {
    id: 1,
    characterId: 'usako',
    date: '2024-01-15',
    title: '今日の冒険',
    content: '今日は素晴らしい一日だった。朝から天気が良く、散歩に出かけた。',
  },
  {
    id: 2,
    characterId: 'usako',
    date: '2024-01-14',
    title: '新しい発見',
    content: '図書館で面白い本を見つけた。明日も読み続けよう。',
  },
  {
    id: 3,
    characterId: 'nekoko',
    date: '2024-01-15',
    title: '友達との時間',
    content: '久しぶりに友達と会って楽しい時間を過ごした。',
  },
  {
    id: 4,
    characterId: 'keroko',
    date: '2024-01-13',
    title: '新しい挑戦',
    content: '今日は新しいことに挑戦してみた。最初は難しかったけど、楽しかった。',
  },
];
