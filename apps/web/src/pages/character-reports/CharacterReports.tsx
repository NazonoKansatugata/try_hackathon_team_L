import { useParams, Link } from 'react-router-dom';
import type { Character, Report } from '../../types';
// import { sampleCharacters, sampleReports } from '../../data/sampleData'; // サンプルデータを使う場合はコメントを外す
import './CharacterReports.css';
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

const CHAR_NAMES: Record<string, string> = {
  usako: `うさこ`,
  nekoko: `ねここ`,
  keroko: `けろこ`,
};
function CharacterReports() {
  // URLパラメータからキャラクターIDを取得
  const { characterId } = useParams<{ characterId: string }>();

  const { reports, loading, error} = useReports(characterId);

  const characterName = characterId ? (CHAR_NAMES[characterId] || characterId) : "不明なキャラクター";


  // TODO: キャラクター情報を取得する
  // const characters: Character[] = [...]; // またはsampleCharacters
  // const character = characters.find(c => c.id === characterId);

  // TODO: レポートデータを配列で定義してください
  // 例: const allReports: Report[] = [{ id: 1, characterId: "usako", date: "2024-01-01", title: "今日の活動", content: "..." }, ...]
  // または: const allReports = sampleReports; // サンプルデータを使用
  // このキャラクターのレポートだけを取得: const reports = allReports.filter(r => r.characterId === characterId);

  return (
    <div className="character-reports">
      <div className="header">
        <Link to="/" className="back-button">
          ← キャラクター一覧に戻る
        </Link>
        <h1>{characterName} のレポート</h1>
      </div>

      <div className="report-list">
        {/* ローディング表示 */}
        {loading && <p>読み込み中...</p>}

        {/* エラー表示 */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* データがない場合 */}
        {!loading && !error && reports.length === 0 && (
          <p>まだ日記がありません。</p>
        )}

        {/* 3. レポートのリストを表示 */}
        {reports.map((report) => (
          <div key={report.id} className="report-entry">
            <div className="report-header">
              <span className="report-date">{report.date}</span>
              {/* タイトルがあれば表示、なければ日付などで代用 */}
              <h2 className="report-title">{report.title || "無題の日記"}</h2>
            </div>
            <div className="report-content">
              {/* 改行コードを <br> に変換して表示する場合の簡易実装 */}
              {(report.content || "").split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterReports;
