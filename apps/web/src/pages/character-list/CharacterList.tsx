import { useState } from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../../components/DarkModeToggle';
import './CharacterList.css';

import type { Character } from '../../types';
import { sampleCharacters } from '../../data/sampleData';

import usakoDefault from '../../assets/usako.png';
import nekokoDefault from '../../assets/nekoko.png';
import kerokoDefault from '../../assets/keroko.png';

import usakoIcon from '../../assets/usako-2.png';
import nekokoIcon from '../../assets/nekoko-2.png';
import kerokoIcon from '../../assets/keroko-2.png';

/**
 * キャラクター紹介画面
 */
function CharacterList() {

  // キャラクター取得
  const usako = sampleCharacters.find(c => c.id === 'usako');
  const nekoko = sampleCharacters.find(c => c.id === 'nekoko');
  const keroko = sampleCharacters.find(c => c.id === 'keroko');

  // 環境変数から画像取得
  const { VITE_USAKO_IMAGE, VITE_NEKOKO_IMAGE, VITE_KEROKO_IMAGE } = import.meta.env;

  const usakoImg = VITE_USAKO_IMAGE ?? usakoDefault;
  const nekokoImg = VITE_NEKOKO_IMAGE ?? nekokoDefault;
  const kerokoImg = VITE_KEROKO_IMAGE ?? kerokoDefault;

  const imageMap: Record<string, string> = {
    usako: usakoImg,
    nekoko: nekokoImg,
    keroko: kerokoImg,
  };

  // state
  const [selected, setSelected] = useState<Character | null>(usako ?? null);
  const [kerokoMode, setKerokoMode] = useState<'A' | 'B'>('A');
  const [isAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [showTutorial, setShowTutorial] = useState(false);

  const profile = selected?.profile;
  const kerokoVariant =
    selected?.id === 'keroko'
      ? selected.profileVariants?.[kerokoMode]
      : undefined;

  const activeProfile =
    kerokoVariant ? { ...profile, ...kerokoVariant } : profile;

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

      {/* 上部ナビ */}
      <div className="nav-buttons-top">

        <button
          className="tutorial-trigger-btn question-panel-btn"
          onClick={() => setShowTutorial(true)}
        >
          <div className="question-panel-content">
            <span className="text">使い方</span>
          </div>
        </button>

        <div className="nav-right-group">

          <DarkModeToggle />

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


      {/* チュートリアル */}
      {showTutorial && (
        <div
          className="tutorial-overlay"
          onClick={() => setShowTutorial(false)}
        >
          <div
            className="tutorial-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="close-tutorial-btn"
              onClick={() => setShowTutorial(false)}
            >
              ｘ
            </button>

            <div className="tutorial-content">

              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                おしゃべりうさこ部の歩き方
              </h2>

              <div className="tutorial-step">
                <div className="step-number">1</div>
                <div className="step-text">
                  <h3>うさこ部のキャラを知ろう！</h3>
                  <p>
                    パネルからキャラを選択してプロフィールを確認できます。
                  </p>
                </div>
              </div>

              <div className="tutorial-step">
                <div className="step-number">2</div>
                <div className="step-text">
                  <h3>日誌を読もう！</h3>
                  <p>
                    「レポートを見る」から会話ログを確認できます。
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  className="primary"
                  onClick={() => setShowTutorial(false)}
                >
                  わかった！
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* メイン */}
      <div className="character-container">

        <div className="main">

          <div className="character-preview">

            {selected ? (

              <div className="preview-inner">

                <img
                  src={imageMap[selected.id]}
                  alt={selected.name}
                  className="preview-avatar"
                />

                <h2>{selected.name}</h2>

                <p>{selected.description}</p>

                <Link to={`/character/${selected.id}`}>
                  <button className="primary">
                    レポートを見る
                  </button>
                </Link>

              </div>

            ) : (

              <p className="placeholder">
                キャラクターを選択してください
              </p>

            )}

          </div>

        </div>


        {/* サイドバー */}
        <aside className="character-sidebar">

          {usako && (
            <div
              className={`character-card ${
                selected?.id === 'usako' ? 'selected' : ''
              }`}
              onClick={() => handleSelect(usako)}
            >
              <img src={usakoIcon} alt={usako.name} />
              <h2>{usako.name}</h2>
            </div>
          )}

          {nekoko && (
            <div
              className={`character-card ${
                selected?.id === 'nekoko' ? 'selected' : ''
              }`}
              onClick={() => handleSelect(nekoko)}
            >
              <img src={nekokoIcon} alt={nekoko.name} />
              <h2>{nekoko.name}</h2>
            </div>
          )}

          {keroko && (
            <div
              className={`character-card ${
                selected?.id === 'keroko' ? 'selected' : ''
              }`}
              onClick={() => handleSelect(keroko)}
            >
              <img src={kerokoIcon} alt={keroko.name} />
              <h2>{keroko.name}</h2>
            </div>
          )}

        </aside>

      </div>

    </div>
  );
}

export default CharacterList;
