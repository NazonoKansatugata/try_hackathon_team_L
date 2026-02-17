import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Character } from '../../types';
import { sampleCharacters } from '../../data/sampleData';
import usakoDefault from '../../assets/usako.png';
import nekokoDefault from '../../assets/nekoko.png';
import kerokoDefault from '../../assets/keroko.png';
import usakoIcon from '../../assets/usako-2.png';
import nekokoIcon from '../../assets/nekoko-2.png';
import kerokoIcon from '../../assets/keroko-2.png';
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
  const { VITE_USAKO_IMAGE, VITE_NEKOKO_IMAGE, VITE_KEROKO_IMAGE } = import.meta.env;
  const usakoImg = VITE_USAKO_IMAGE ?? usakoDefault;
  const nekokoImg = VITE_NEKOKO_IMAGE ?? nekokoDefault;
  const kerokoImg = VITE_KEROKO_IMAGE ?? kerokoDefault;
  const imageMap: Record<string, string> = {
    usako: usakoImg,
    nekoko: nekokoImg,
    keroko: kerokoImg,
  };

  const [selected, setSelected] = useState<Character | null>(usako ?? null);
  const [kerokoMode, setKerokoMode] = useState<'A' | 'B'>('A');
  const [isAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [showTutorial, setShowTutorial] = useState(false);
  const profile = selected?.profile;
  const kerokoVariant = selected?.id === 'keroko' ? selected.profileVariants?.[kerokoMode] : undefined;
  const activeProfile = kerokoVariant ? { ...profile, ...kerokoVariant } : profile;

  const themeId = selected?.id ?? 'usako';

  const handleSelect = (character: Character) => {
    setSelected(character);
    if (character.id !== 'keroko') {
      setKerokoMode('A');
    }
  };

  return (
    <div className="character-list" data-theme={themeId}>
      <h1>キャラクター紹介</h1>
      <div className="nav-buttons-top">
      <button
        className="tutorial-trigger-btn question-panel-btn"
        onClick={() => setShowTutorial(true)}>
          <div className="question-panel-content">
            <span className="icon">❔</span>
          </div>
        </button>
      <div className="nav-right-group">
        {isAdmin && (
          <Link to="/admin" className="admin-panel-btn">
            <div className="admin-panel-content">
              <span className="icon">⚙️</span>
              <span className="text">管理画面へ</span>
            </div>
          </Link>
        )}
        <Link to="/add-theme" className="question-panel-btn">
          <div className="question-panel-content">
            <span className="icon">✍️</span>
            <span className="text">テーマを追加</span>
          </div>
        </Link>
        <Link to="/question" className="question-panel-btn">
          <div className="question-panel-content">
            <span className="icon">❓</span>
            <span className="text">問題に答える</span>
          </div>
        </Link>
      </div>
    </div>

      {showTutorial && (
        <div className="tutorial-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-tutorial-btn" onClick={() => setShowTutorial(false)}>
              x
            </button>
            
          </div>
        </div>
      )}
      <div className="character-container">
        <div className="main">
          <div className="character-preview">
            {selected ? (
              <div className="preview-inner">
                <div className="preview-avatar-wrap">
                  <span className="avatar-orbit" aria-hidden="true" />
                  <img src={imageMap[selected.id]} alt={selected.name} className="preview-avatar" />
                </div>
                <div className="preview-body">
                  <div className="name-row">
                    <h2>{selected.name}</h2>
                    {activeProfile?.catchphrase && (
                      <span className="catchphrase">{activeProfile.catchphrase}</span>
                    )}
                  </div>
                  {selected.id === 'keroko' && selected.profileVariants && (
                    <div className="persona-toggle" role="group" aria-label="けろこ人格切替">
                      <button
                        type="button"
                        className={`persona-btn ${kerokoMode === 'A' ? 'is-active' : ''}`}
                        onClick={() => setKerokoMode('A')}
                      >
                        A案
                      </button>
                      <button
                        type="button"
                        className={`persona-btn ${kerokoMode === 'B' ? 'is-active' : ''}`}
                        onClick={() => setKerokoMode('B')}
                      >
                        B案
                      </button>
                    </div>
                  )}
                  <div className="stat-grid" aria-label="キャラクター概要">
                    {activeProfile?.role && (
                      <div className="stat">
                        <span className="label">役割</span>
                        <span className="value">{activeProfile.role}</span>
                      </div>
                    )}
                  </div>

                  <div className="profile-block">
                    <h3>紹介</h3>
                    <p className="profile-text">{selected.description}</p>
                  </div>

                  <div className="tag-section">
                    {activeProfile?.likes && activeProfile.likes.length > 0 && (
                      <div className="tag-group">
                        <span className="tag-label">好き</span>
                        <div className="tags">
                          {activeProfile.likes.map((item) => (
                            <span key={`like-${item}`} className="tag">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeProfile?.dislikes && activeProfile.dislikes.length > 0 && (
                      <div className="tag-group">
                        <span className="tag-label">苦手</span>
                        <div className="tags">
                          {activeProfile.dislikes.map((item) => (
                            <span key={`dislike-${item}`} className="tag ghost">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to={`/character/${selected.id}`}>
                    <button className="primary">レポートを見る</button>
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
              onClick={() => handleSelect(usako)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(usako); } }}
            >
              <div className="card-header">
                <img src={usakoIcon} alt={usako.name} className="avatar" />
                <h2>{usako.name}</h2>
              </div>
            </div>
          )} 

          {nekoko && (
            <div
              className={`character-card touch-panel small-card ${selected?.id === 'nekoko' ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(nekoko)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(nekoko); } }}
            >
              <div className="card-header">
                <img src={nekokoIcon} alt={nekoko.name} className="avatar" />
                <h2>{nekoko.name}</h2>
              </div>
            </div>
          )} 

          {keroko && (
            <div
              className={`character-card touch-panel small-card ${selected?.id === 'keroko' ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(keroko)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(keroko); } }}
            >
              <div className="card-header">
                <img src={kerokoIcon} alt={keroko.name} className="avatar" />
                <h2>{keroko.name}</h2>
              </div>
            </div>
          )} 
        </aside>
      </div>
    </div>
  );
}

export default CharacterList;
