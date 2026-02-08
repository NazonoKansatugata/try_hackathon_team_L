import {
  initializeApp,
  FirebaseApp,
} from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { firebaseConfig } from '../config/index.js';
import { Theme } from '../types/index.js';

let db: Firestore | null = null;
let firebaseApp: FirebaseApp | null = null;

/**
 * Firebaseを初期化
 */
export function initializeFirebase(): void {
  if (!db) {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    console.log('✅ Firebaseを初期化しました');
  }
}

/**
 * Firestoreから全テーマを取得
 */
export async function getAllThemes(): Promise<Theme[]> {
  if (!db) {
    throw new Error('Firestoreが初期化されていません');
  }

  try {
    const themesCollection = collection(db, 'themes');
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(themesCollection);
    
    const themes: Theme[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      themes.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        keywords: data.keywords || [],
      });
    });

    console.log(`📚 ${themes.length}個のテーマを取得しました`);
    return themes;
  } catch (error) {
    console.error('❌ テーマ取得エラー:', error);
    throw error;
  }
}

/**
 * テーマをランダムに取得
 */
export async function getRandomTheme(): Promise<Theme> {
  const themes = await getAllThemes();
  if (themes.length === 0) {
    throw new Error('利用可能なテーマがありません');
  }
  
  const randomIndex = Math.floor(Math.random() * themes.length);
  const theme = themes[randomIndex];
  console.log(`🎲 テーマを選定: "${theme.title}"`);
  return theme;
}
