import type { Character} from '../types';

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
