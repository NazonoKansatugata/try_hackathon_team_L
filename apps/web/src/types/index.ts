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

export interface Question {
  id: string;
  questionText: string;
  questionAnswer: string;
}

export interface WrongQuestions {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface ResultState {
  percentage: number;
  correctCount: number;
  totalCount: number;
  wrongQuestions?: WrongQuestions[];
}
