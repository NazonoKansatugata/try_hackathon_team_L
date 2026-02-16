import type { Character} from '../types';

/**
 * サンプルキャラクターデータ
 * 
 * TODO: このデータを参考にして、自分のキャラクターを追加してください
 * 参考：discord-botのキャラクター
 * - うさこ (usako): 主人公・ミステリアス担当。無口気味で短文が多い。
 * - ねここ (nekoko): ムードメーカー。元気で活発。場を盛り上げるのが得意。
 * - けろこ (keroko): 性格切り替え可能。人格Aはおどおど、人格Bはツンツン。
 */
export const sampleCharacters: Character[] = [
  {
    id: 'usako',
    name: 'うさこ',
    description: '主人公・ミステリアス担当。無口で寡黙だが優しい。短文で簡潔に話す。',
  },
  {
    id: 'nekoko',
    name: 'ねここ',
    description: 'ムードメーカー。明るく元気で話好き。会話を盛り上げるのが得意。',
  },
  {
    id: 'keroko',
    name: 'けろこ',
    description: '性格切り替え可能。人格Aはおどおどして怖がり、人格Bは少しツンツンした性格。',
  },
];
