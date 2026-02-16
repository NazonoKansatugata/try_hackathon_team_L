/**
 * キャラクターの型定義
 */
export interface Character {
  id: string;
  name: string;
  description: string;
  profile?: CharacterProfile;
  profileVariants?: CharacterProfileVariants;
  imageUrl?: string;
}

export interface CharacterProfile {
  catchphrase?: string;
  role?: string;
  likes?: string[];
  dislikes?: string[];
}

export interface CharacterProfileVariants {
  A: CharacterProfile;
  B: CharacterProfile;
}

/**
 * レポートの型定義
 */
export interface Report {
  id: string;
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
