import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy, 
  query,
  addDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../../firebase"; // 設定ファイルをインポート
import type { Question, Report, Theme } from "../../types";

// ... 既存の初期化コード ...

/**
 * 🗑 レポートを削除
 */
export const deleteReport = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "reports", id));
    console.log("削除成功:", id);
  } catch (error) {
    console.error("削除エラー:", error);
    throw error;
  }
};

/**
 * 🗑 テーマを削除
 */
export const deleteTheme = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "themes", id));
  } catch (error) {
    console.error("削除エラー:", error);
    throw error;
  }
};

/**
 * 📦 すべてのレポートを取得（管理画面用）
 * ※ useReportsとは違い、キャラ絞り込みなしで新しい順に取得
 */
export const getAllReports = async (): Promise<Report[]> => {
  const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // 日付変換処理などは既存と同様に行う
    date: doc.data().timestamp?.toDate().toLocaleDateString() || "",
  })) as unknown as Report[];
};

/**
 * 📚 すべてのテーマを取得（既存のものがあればそれでOK）
 */
export const getAllThemes = async (): Promise<Theme[]> => {
  const snapshot = await getDocs(collection(db, "themes"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Theme[];
};

export const getAllQuestions = async (): Promise<Question[]> => {
  const snapshot = await getDocs(collection(db, "questions"));
  return snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
  })) as unknown as Question[];
}

export const addQuestion = async (question: Omit<Question, "id">): Promise<void> => {
  await addDoc(collection(db, "questions"), question);
};

export const updateQuestion = async (id: string, question: Partial<Question>): Promise<void> => {
  const docRef = doc(db, "questions", id);
  await updateDoc(docRef, question);
}

export const deleteQuestion = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "questions", id));
}

/**
 * 🔄 問題一覧のリアルタイムリスナーを設定
 * @param callback - 問題一覧が更新される度に呼ばれるコールバック関数
 * @returns アンサブスクライブ関数（クリーンアップ時に呼ぶ）
 */
export const subscribeToQuestions = (callback: (questions: Question[]) => void): (() => void) => {
  const unsubscribe = onSnapshot(collection(db, "questions"), (snapshot) => {
    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as unknown as Question[];
    callback(questions);
  }, (error) => {
    console.error("問題リスナーエラー:", error);
  });

  return unsubscribe;
};