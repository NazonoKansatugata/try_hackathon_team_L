import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../../types';
import { sampleCharacters } from '../../data/sampleData';
import usakoDefault from '../../assets/usako.png';
import nekokoDefault from '../../assets/nekoko.png';
import kerokoDefault from '../../assets/keroko.png';
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

  // 環境変数から画像パスを読み取り（無ければデフォルト画像を使用）
  const env = (import.meta as any).env || {};
  const usakoImg = env.VITE_USAKO_IMAGE ?? usakoDefault;
  const nekokoImg = env.VITE_NEKOKO_IMAGE ?? nekokoDefault;
  const kerokoImg = env.VITE_KEROKO_IMAGE ?? kerokoDefault;
  const imageMap: Record<string, string> = {
    usako: usakoImg,
    nekoko: nekokoImg,
    keroko: kerokoImg,
  };

  const [selected, setSelected] = useState<Character | null>(usako ?? null);

  return (
    <div className="character-list">
      <h1>キャラクター紹介</h1>
      <div className="character-container">
        <div className="main">
          <div className="character-preview">
            {selected ? (
              <div className="preview-inner">
                <img src={imageMap[selected.id]} alt={selected.name} className="preview-avatar" />
                <div className="preview-body">
                  <h2>{selected.name}</h2>
                  <p>{selected.description}</p>
                  <Link to={`/character/${selected.id}`}>
                    <button>レポートを見る</button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="placeholder">右側のタッチパネルからキャラクターを選択してください</p>
            )}
          </div>
        </div>

        <aside className="character-sidebar" aria-label="キャラクター選択パネル">
          {usako && (
            <div
              className={`character-card touch-panel small-card ${selected?.id === 'usako' ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(usako)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(usako); } }}
            >
              <div className="card-header">
                <img src={usakoImg} alt={usako.name} className="avatar" />
                <h2>{usako.name}</h2>
              </div>
              <p>{usako.description}</p>
              <Link to={`/character/${usako.id}`}>
                <button>レポートを見る</button>
              </Link>
            </div>
          )} 

          {nekoko && (
            <div
              className={`character-card touch-panel small-card ${selected?.id === 'nekoko' ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(nekoko)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(nekoko); } }}
            >
              <div className="card-header">
                <img src={nekokoImg} alt={nekoko.name} className="avatar" />
                <h2>{nekoko.name}</h2>
              </div>
              <p>{nekoko.description}</p>
              <Link to={`/character/${nekoko.id}`}>
                <button>レポートを見る</button>
              </Link>
            </div>
          )} 

          {keroko && (
            <div
              className={`character-card touch-panel small-card ${selected?.id === 'keroko' ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(keroko)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(keroko); } }}
            >
              <div className="card-header">
                <img src={kerokoImg} alt={keroko.name} className="avatar" />
                <h2>{keroko.name}</h2>
              </div>
              <p>{keroko.description}</p>
              <Link to={`/character/${keroko.id}`}>
                <button>レポートを見る</button>
              </Link>
            </div>
          )} 
        </aside>
      </div>
    </div>
  );
}

export default CharacterList;
