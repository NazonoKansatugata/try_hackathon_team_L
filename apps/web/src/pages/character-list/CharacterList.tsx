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

      {/* 上部ナビ */}
      <div className="nav-buttons-top">
        <div className="nav-left-group" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
          <button 
            type="button"
            onClick={() => setShowTutorial(true)}
            className="admin-panel-content"
            style={{ fontFamily: 'inherit', cursor: 'pointer'}}
            >
              <span className="text">使い方</span>
          </button>
          <DarkModeToggle />
        </div>
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


      {/* チュートリアル */}
      {showTutorial && (
        <div className="tutorial-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-tutorial-btn" onClick={() => setShowTutorial(false)}>
              ｘ
            </button>
            
            <div className="tutorial-content">
              <h2>おしゃべりうさこ部の歩き方</h2>
              
              <div className="tutorial-step">
                <div className="step-number">1</div>
                <div className="step-text">
                  <h3>うさこ部を知ろう！</h3>
                  <p>右側（スマホは下）のパネルからキャラをタップ！<br/>
                  性格や「好き・嫌い」をチェックしましょう。<br/>
                  <small>※「けろこ」はボタンで人格が入れ替わります。</small></p>
                </div>
              </div>

              <div className="tutorial-step">
                <div className="step-number">2</div>
                <div className="step-text">
                  <h3>日誌を読んでみよう！</h3>
                  <p>「レポートを見る」ボタンを押すと、日々の会話ログが読めます。<br/>
                  キャラごとの口調の違いを楽しんでください。</p>
                </div>
              </div>

              <div className="tutorial-step">
                <div className="step-number">3</div>
                <div className="step-text">
                  <h3>会話のテーマを提供しよう！！</h3>
                  <p>上部の「✍️ テーマを追加」から、みんなに話してほしい話題を投稿できます。<br/>
                  あなたの投稿したテーマで会話が弾むかも？</p>
                </div>
              </div>

              <div className="tutorial-step secret">
                <div className="step-number">?</div>
                <div className="step-text">
                  <h3>隠された「管理者権限」...</h3>
                  <p>「❓ 問題に答える」でクイズに挑戦しましょう。<br/>
                  <strong>正解率80%以上</strong>を叩き出すと、秘密の「⚙️ 管理画面」への入り口が開放されます！</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="primary" onClick={() => setShowTutorial(false)}>
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

              <p className="placeholder">
                キャラクターを選択してください
              </p>

            )}

          </div>

        </div>


        {/* サイドバー */}
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
