import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy, 
  query,
} from "firebase/firestore";
import { db } from "../../firebase"; // 設定ファイルをインポート
import type { Report, Theme } from "../../types";

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