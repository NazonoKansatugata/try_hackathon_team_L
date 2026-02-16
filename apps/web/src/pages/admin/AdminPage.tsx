import { useEffect, useState } from "react";
import { getAllReports, getAllThemes, deleteReport, deleteTheme } from "./fetchData";
import type { Report, Theme } from "../../types";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"reports" | "themes">("reports");
    const [reports, setReports] = useState<Report[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedReports, fetchedThemes] = await Promise.all([
                getAllReports(),
                getAllThemes(),
            ]);
            setReports(fetchedReports);
            setThemes(fetchedThemes);
        } catch (error) {
            console.error("データ取得失敗", error);
            alert("データの読み込みに失敗しました。")
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: "report" | "theme") => {
        if (!window.confirm("本当に削除しますか？")) return;

        try {
            if (type === "report") {
                await deleteReport(id);
                setReports(reports.filter((r) => r.id !== id));
            } else {
                await deleteTheme(id);
                setThemes(themes.filter((t) => t.id !== id));
            }
            alert("削除しました");
        } catch (error) {
            alert("削除に失敗しました");
        }
    };

    if (loading) return <div className="p-8">読み込み中...</div>

    return (
    <div className="admin-container" style={{ padding: "2rem" }}>
      <h1>🔧 おしゃべりうさこ部 管理画面</h1>

      {/* タブ切り替え */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button 
          onClick={() => setActiveTab("reports")}
          disabled={activeTab === "reports"}
        >
          📝 日報管理 ({reports.length})
        </button>
        <button 
          onClick={() => setActiveTab("themes")}
          disabled={activeTab === "themes"}
        >
          🎨 テーマ管理 ({themes.length})
        </button>
      </div>

      {/* リスト表示エリア */}
      <div className="list-area">
        {activeTab === "reports" ? (
          // --- レポート一覧 ---
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>日付</th>
                <th>キャラ</th>
                <th>内容 (冒頭)</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.date}</td>
                  <td>{report.characterId}</td>
                  <td>{report.content.substring(0, 30)}...</td>
                  <td>
                    <button onClick={() => handleDelete(report.id, "report")} style={{ background: "#ff4d4f", color: "white" }}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // --- テーマ一覧 ---
          <ul style={{ listStyle: "none", padding: 0 }}>
            {themes.map((theme) => (
              <li key={theme.id} style={{ borderBottom: "1px solid #ccc", padding: "10px", display: "flex", justifyContent: "space-between" }}>
                <span>{theme.title}</span>
                <button onClick={() => handleDelete(theme.id, "theme")} style={{ background: "#ff4d4f", color: "white" }}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}