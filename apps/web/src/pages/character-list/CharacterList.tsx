import { Link } from 'react-router-dom';
import type { Character } from '../../types';
import { sampleCharacters } from '../../data/sampleData';
import './CharacterList.css';

/**
 * キャラクター紹介画面
 * 
 * TODO: 初心者向けタスク
 * 1. キャラクターのデータを定義する（名前、説明、画像など）
 * 2. キャラクターのリストを表示する
 * 3. 各キャラクターをクリックすると、そのキャラクターのレポート画面に遷移する
 * 
 * 参考：discord-botのキャラクター
 * - うさこ: 主人公・ミステリアス担当。無口気味で短文が多い。
 * - ねここ: ムードメーカー。元気で活発。場を盛り上げるのが得意。
 * - けろこ: 性格切り替え可能。人格Aはおどおど、人格Bはツンツン。
 */
function CharacterList() {
  // サンプルキャラクターを利用
  // サンプルキャラクターを個別に取得
  const usako = sampleCharacters.find(c => c.id === 'usako');
  const nekoko = sampleCharacters.find(c => c.id === 'nekoko');
  const keroko = sampleCharacters.find(c => c.id === 'keroko');

  return (
    <div className="character-list">
      <h1>キャラクター紹介</h1>
      <div className="character-grid">
        {usako && (
          <div className="character-card touch-panel">
            <h2>{usako.name}</h2>
            <p>{usako.description}</p>
            <Link to={`/character/${usako.id}`}>
              <button>レポートを見る</button>
            </Link>
          </div>
        )}
        {nekoko && (
          <div className="character-card touch-panel">
            <h2>{nekoko.name}</h2>
            <p>{nekoko.description}</p>
            <Link to={`/character/${nekoko.id}`}>
              <button>レポートを見る</button>
            </Link>
          </div>
        )}
        {keroko && (
          <div className="character-card touch-panel">
            <h2>{keroko.name}</h2>
            <p>{keroko.description}</p>
            <Link to={`/character/${keroko.id}`}>
              <button>レポートを見る</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CharacterList;
