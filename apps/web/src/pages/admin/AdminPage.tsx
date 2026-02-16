import { useEffect, useState } from "react";
import { getAllReports, getAllThemes, getAllQuestions, deleteQuestion, deleteTheme, deleteReport, addQuestion, updateQuestion} from "./fetchData";
import type { Report, Theme, Question} from "../../types";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"reports" | "themes" | "questions">("reports");
    const [reports, setReports] = useState<Report[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [inputQuestion, setInputQuestion] = useState("");
    const [inputAnswer, setInputAnswer] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fetchedReports, fetchedThemes, fetchedQuestions] = await Promise.all([
                getAllReports(),
                getAllThemes(),
                getAllQuestions()
            ]);
            setReports(fetchedReports);
            setThemes(fetchedThemes);
            setQuestions(fetchedQuestions);
        } catch (error) {
            console.error("データ取得失敗", error);
            alert("データの読み込みに失敗しました。")
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: "report" | "theme" | "question") => {
        if (!window.confirm("本当に削除しますか？")) return;

        try {
            if (type === "report") {
                await deleteReport(id);
                setReports(reports.filter((r) => r.id !== id));
            } else if (type === "theme") {
                await deleteTheme(id);
                setThemes(themes.filter((t) => t.id !== id));
            } else {
              await deleteQuestion(id);
              setQuestions(questions.filter((q) => q.id !== id));
            }
            alert("削除しました");
        } catch (error) {
            alert("削除に失敗しました");
        }
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("送信しようとしています:", { inputQuestion, inputAnswer});
      if (inputQuestion === "" || inputAnswer === "") {
        alert("問題文と正解の両方を入力してください！");
        return;
      }

      try {
        if (editingId) {
          await updateQuestion(editingId, {questionText: inputQuestion, questionAnswer: inputAnswer });
          alert("更新しました！");
        } else {
          await addQuestion({ questionText: inputQuestion, questionAnswer: inputAnswer});
          alert("追加しました");
        }

        const newQuestions = await getAllQuestions();
        setQuestions(newQuestions);
        resetForm();
      } catch (error) {
        console.error(error);
        alert("保存に失敗しました");
      }
    };

    const startEdit = (q: Question) => {
      setEditingId(q.id);
      setInputQuestion(q.questionText);
      setInputAnswer(q.questionAnswer);
    };

    const resetForm = () => {
      setEditingId(null);
      setInputQuestion("");
      setInputAnswer("");
    }

    if (loading) return <div className="p-8">読み込み中...</div>

    return (
    <div className="admin-container" style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" , backgroundColor: '#ffffff', color: "#333333", minHeight: "100vh"}}>
      <h1>🔧 おしゃべりうさこ部 管理画面</h1>

      {/* --- 1. タブ切り替えボタン --- */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("reports")}
          disabled={activeTab === "reports"}
          style={{ padding: "0.5rem 1rem", cursor: "pointer", fontWeight: activeTab === "reports" ? "bold" : "normal" }}
        >
          📝 日報管理 ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("themes")}
          disabled={activeTab === "themes"}
          style={{ padding: "0.5rem 1rem", cursor: "pointer", fontWeight: activeTab === "themes" ? "bold" : "normal" }}
        >
          🎨 テーマ管理 ({themes.length})
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          disabled={activeTab === "questions"}
          style={{ padding: "0.5rem 1rem", cursor: "pointer", fontWeight: activeTab === "questions" ? "bold" : "normal" }}
        >
          ❓ 問題管理 ({questions.length})
        </button>
      </div>

      {/* --- 2. 問題管理用フォーム (questionsタブのときだけ表示) --- */}
      {activeTab === "questions" && (
        <div style={{ marginBottom: "2rem", background: "#f9f9f9", padding: "1.5rem", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3 style={{ marginTop: 0 }}>
            {editingId ? "✏️ 問題を編集" : "➕ 新しい問題を追加"}
          </h3>
          <form onSubmit={handleSaveQuestion} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.3rem" }}>問題文</label>
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                style={{ padding: "0.5rem", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
                placeholder="例：うさこの好きな色は？"
                required
              />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <label style={{ 
                display: "flex", alignItems: "center", gap: "0.5rem", 
                cursor: "pointer", padding: "0.5rem 1rem", 
                border: "1px solid #ff4d4f", borderRadius: "20px",
                background: inputAnswer === "o" ? "#ff4d4f" : "white",
                color: inputAnswer === "o" ? "white" : "#ff4d4f",
                fontWeight: "bold"
              }}>
              <input 
                type="radio" 
                name="answer" 
                value="o" 
                checked={inputAnswer === "o"}
                onChange={(e) => setInputAnswer(e.target.value)}
                style={{ display: "none" }} // ラジオボタン自体は隠す
              />
              ◯ (正解)
              </label>

              <label style={{ 
                display: "flex", alignItems: "center", gap: "0.5rem", 
                cursor: "pointer", padding: "0.5rem 1rem", 
                border: "1px solid #2196F3", borderRadius: "20px",
                background: inputAnswer === "x" ? "#2196F3" : "white",
                color: inputAnswer === "x" ? "white" : "#2196F3",
                fontWeight: "bold"
              }}>
                <input 
                  type="radio" 
                  name="answer" 
                  value="x" 
                  checked={inputAnswer === "x"}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  style={{ display: "none" }}
                />
                ✕ (不正解)
              </label>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="submit"
                style={{ padding: "0.5rem 1rem", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                {editingId ? "更新する" : "追加する"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ padding: "0.5rem 1rem", background: "#999", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* --- 3. リスト表示エリア --- */}
      <div className="list-area">

        {/* A. レポート一覧 */}
        {activeTab === "reports" && (
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
            <thead style={{ background: "#f0f0f0" }}>
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
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(report.id, "report")}
                      style={{ background: "#ff4d4f", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center" }}>データがありません</td></tr>}
            </tbody>
          </table>
        )}

        {/* B. テーマ一覧 */}
        {activeTab === "themes" && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {themes.map((theme) => (
              <li key={theme.id} style={{ borderBottom: "1px solid #ccc", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
                <span>{theme.title}</span>
                <button
                  onClick={() => handleDelete(theme.id, "theme")}
                  style={{ background: "#ff4d4f", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}
                >
                  削除
                </button>
              </li>
            ))}
            {themes.length === 0 && <p style={{ textAlign: "center" }}>データがありません</p>}
          </ul>
        )}

        {/* C. 問題一覧 */}
        {activeTab === "questions" && (
          <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
            <thead style={{ background: "#e0f7fa" }}>
              <tr>
                <th>問題文</th>
                <th>正解</th>
                <th style={{ width: "160px" }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.questionText}</td>
                  <td style={{ textAlign: "center", fontSize: "1.5rem"}}>
                    {q.questionAnswer === "o" ? "◯" : "✕"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => startEdit(q)}
                      style={{ marginRight: "0.5rem", background: "#2196F3", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer" }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, "question")}
                      style={{ background: "#ff4d4f", color: "white", border: "none", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer" }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "2rem" }}>
                    問題がまだ登録されていません。<br />
                    上のフォームから追加してください！
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}