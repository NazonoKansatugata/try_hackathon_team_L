import { useParams, Link } from 'react-router-dom';
import { useReports } from './useReport';

/**
 * キャラクター別レポート画面
 * 
 * TODO: 初心者向けタスク
 * 1. URLパラメータからキャラクターIDを取得する（既に実装済み）
 * 2. そのキャラクターのレポートデータを定義する
 * 3. レポートのリストを表示する（日付、タイトル、内容など）
 * 4. レポートのフィルタリングや検索機能を追加する（オプション）
 */

const CHAR_CONFIG = {
  usako: { name: 'うさこ', colorClass: 'theme-usako'},
  nekoko: { name: 'ねここ', colorClass: 'theme-nekoko'},
  keroko: { name: 'けろこ', colorClass: 'theme-keroko'},
}
function CharacterReports() {
  // URLパラメータからキャラクターIDを取得
  const { characterId } = useParams<{ characterId: string }>();
  const { reports, loading, error} = useReports(characterId);
  const currentConfig = CHAR_CONFIG[characterId as keyof typeof CHAR_CONFIG] || CHAR_CONFIG.usako;

  // TODO: キャラクター情報を取得する
  // const characters: Character[] = [...]; // またはsampleCharacters
  // const character = characters.find(c => c.id === characterId);

  // TODO: レポートデータを配列で定義してください
  // 例: const allReports: Report[] = [{ id: 1, characterId: "usako", date: "2024-01-01", title: "今日の活動", content: "..." }, ...]
  // または: const allReports = sampleReports; // サンプルデータを使用
  // このキャラクターのレポートだけを取得: const reports = allReports.filter(r => r.characterId === characterId);

  return (
    // 全体をキャラごとのテーマカラークラスで包む
    <div className={`character-reports ${currentConfig.colorClass}`}>
      
      <div className="header">
        <h1>🐰 おしゃべりうさこ部 日誌 📝</h1>
      </div>

      {/* 1. キャラ切り替えタブ */}
      <div className="char-tabs">
        {Object.entries(CHAR_CONFIG).map(([id, config]) => (
          <Link 
            key={id} 
            to={`/character/${id}`} 
            className={`char-tab ${characterId === id ? 'active' : ''}`}
          >
            {config.name}
          </Link>
        ))}
      </div>

      <div className="report-list">
        {loading && <div className="loading">読み込み中...</div>}
        {error && <p className="error">{error}</p>}
        
        {!loading && reports.length === 0 && (
          <div className="empty-state">まだ日記がありません🍃</div>
        )}

        {reports.map((report) => (
          <article key={report.id} className="report-entry">
            <div className="report-meta">
              {/* 日付を強調 */}
              <span className="report-date">📅 {report.date}</span>
              
              {/* 3. おしゃべり回数の表示（データにあれば） */}
              {/* ※ Report型に messageCount を追加する必要があります */}
              {(report as any).messageCount !== undefined && (
                <span className="message-badge">
                  💬 おしゃべり: {(report as any).messageCount}回
                </span>
              )}
            </div>

            <div className="report-content">
               {/* 本文 */}
              {(report.content || "").split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default CharacterReports;
