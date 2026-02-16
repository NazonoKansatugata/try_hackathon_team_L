import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebase"; // Firebase設定ファイルからインポート
import type { Report } from "../../types";

export const useReports = (characterId: string | undefined) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // キャラクターIDがない場合は何もしない
    if (!characterId) {
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        // Firestoreの参照を取得
        const reportsRef = collection(db, "reports");
        
        // クエリの構築
        // ※以前のfirestore.tsの実装に合わせて 'characterType' で検索しています
        const q = query(
          reportsRef,
          where("characterType", "==", characterId),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        
        // データを型に合わせて変換
        const fetchedReports: Report[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id, // FirestoreのIDは文字列
            characterId: data.characterType,
            title: `日記 (${data.timestamp?.toDate().toLocaleDateString()})`, // タイトルがない場合は生成
            content: data.content,
            date: data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate().toLocaleDateString() 
              : "日付不明", 
            // 必要な他のフィールドがあればここに追加
            name: data.characterName,
          } as unknown as Report; // 型定義に合わせてキャスト
        });

        setReports(fetchedReports);
      } catch (err) {
        console.error("レポート取得エラー:", err);
        setError("日記の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [characterId]);

  return { reports, loading, error };
};