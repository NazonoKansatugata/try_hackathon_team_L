import { useParams, Link } from 'react-router-dom';
import { useReports } from './useReport';
import { sampleCharacters } from '../../data/sampleData';
import type { Report } from '../../types';
import usakoIcon from '../../assets/usako-2.png';
import nekokoIcon from '../../assets/nekoko-2.png';
import kerokoIcon from '../../assets/keroko-2.png';
import './CharacterReports.css';

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
  usako: { name: 'うさこ', icon: usakoIcon },
  nekoko: { name: 'ねここ', icon: nekokoIcon },
  keroko: { name: 'けろこ', icon: kerokoIcon },
};

type ReportWithMessageCount = Report & { messageCount?: number };
function CharacterReports() {
  // URLパラメータからキャラクターIDを取得
  const { characterId } = useParams<{ characterId: string }>();
  const { reports, loading, error} = useReports(characterId);
  const character = sampleCharacters.find((c) => c.id === characterId) || sampleCharacters[0];

  const themeId = character?.id ?? 'usako';

  // TODO: レポートデータを配列で定義してください
  // 例: const allReports: Report[] = [{ id: 1, characterId: "usako", date: "2024-01-01", title: "今日の活動", content: "..." }, ...]
  // または: const allReports = sampleReports; // サンプルデータを使用
  // このキャラクターのレポートだけを取得: const reports = allReports.filter(r => r.characterId === characterId);

  return (
    <div className="character-reports" data-theme={themeId}>
      <header className="page-header">
        <div className="title-block">
          <p className="eyebrow">おしゃべりうさこ部 / キャラクターレポート</p>
          <h1>キャラ日誌</h1>
          <p className="subtitle">会話の雰囲気や成長のログを眺めるページです。</p>
        </div>
        <div className="top-actions">
          <Link to="/" className="ghost-btn">キャラ一覧へ</Link>
        </div>
      </header>

      <nav className="char-tabs" aria-label="キャラクター切り替え">
        {Object.entries(CHAR_CONFIG).map(([id, config]) => (
          <Link
            key={id}
            to={`/character/${id}`}
            className={`char-tab ${characterId === id ? 'active' : ''}`}
          >
            <img src={config.icon} alt={config.name} className="tab-icon" />
            <span>{config.name}</span>
          </Link>
        ))}
      </nav>

      <section className="report-section">
        <div className="report-header">
          <h3>最近の日誌</h3>
          <span className="report-count">{reports.length}件</span>
        </div>

        <div className="report-list">
          {loading && <div className="loading">読み込み中...</div>}
          {error && <p className="error">{error}</p>}

          {!loading && reports.length === 0 && (
            <div className="empty-state">まだ日記がありません🍃</div>
          )}

          {reports.map((report) => {
            const messageCount = (report as ReportWithMessageCount).messageCount;
            return (
              <article key={report.id} className="report-entry">
                <div className="report-meta">
                  <span className="report-date">📅 {report.date}</span>
                  {messageCount !== undefined && (
                    <span className="message-badge">
                      💬 おしゃべり: {messageCount}回
                    </span>
                  )}
                </div>

                <div className="report-content">
                  {(report.content || '').split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default CharacterReports;
