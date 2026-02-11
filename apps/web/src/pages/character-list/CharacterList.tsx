import { Link } from 'react-router-dom';
import type { Character } from '../../types';
// import { sampleCharacters } from '../../data/sampleData'; // サンプルデータを使う場合はコメントを外す
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
  // TODO: キャラクターデータを配列で定義してください
  // 例: const characters: Character[] = [{ id: "usako", name: "うさこ", description: "主人公・ミステリアス担当..." }, ...]
  // または: const characters = sampleCharacters; // サンプルデータを使用
  
  return (
    <div className="character-list">
      <h1>キャラクター紹介</h1>
      
      <div className="character-grid">
        {/* TODO: ここにキャラクターのカードを表示してください */}
        {/* 例: characters.map((character) => ( ... )) */}
        
        {/* サンプル表示 */}
        <div className="character-card sample">
          <h2>サンプルキャラクター</h2>
          <p>ここにキャラクターの説明が入ります</p>
          <Link to="/character/sample">
            <button>レポートを見る</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CharacterList;
