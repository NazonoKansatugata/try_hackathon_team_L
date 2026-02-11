import { useParams, Link } from 'react-router-dom';
import type { Character, Report } from '../../types';
// import { sampleCharacters, sampleReports } from '../../data/sampleData'; // サンプルデータを使う場合はコメントを外す
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
function CharacterReports() {
  // URLパラメータからキャラクターIDを取得
  const { characterId } = useParams<{ characterId: string }>();

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
        <h1>{characterId} のレポート</h1>
        {/* TODO: キャラクター名を表示してください */}
      </div>

      <div className="report-list">
        {/* TODO: ここにレポートの一覧を表示してください */}
        {/* 例: reports.map((report) => ( ... )) */}
        
        {/* サンプル表示 */}
        <div className="report-entry sample">
          <div className="report-header">
            <span className="report-date">2024-01-01</span>
            <h2 className="report-title">サンプルレポート</h2>
          </div>
          <div className="report-content">
            <p>ここにレポートの内容が入ります。キャラクターの一日の活動や考えたことなどを記録します。</p>
          </div>
        </div>

        <div className="report-entry sample">
          <div className="report-header">
            <span className="report-date">2024-01-02</span>
            <h2 className="report-title">もう一つのサンプル</h2>
          </div>
          <div className="report-content">
            <p>複数のレポートエントリを表示できます。日付順に並べると良いでしょう。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterReports;
