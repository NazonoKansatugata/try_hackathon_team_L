/**
 * キャラクターの型定義
 */
export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

/**
 * レポートの型定義
 */
export interface Report {
  id: number;
  characterId: string;
  date: string;
  title: string;
  content: string;
}

/**
 * テーマの型定義
 */
export interface Theme {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
}
