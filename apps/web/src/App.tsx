import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CharacterList from './pages/character-list/CharacterList';
import CharacterReports from './pages/character-reports/CharacterReports';
import './App.css';

/**
 * メインアプリケーションコンポーネント
 * 
 * ルーティング設定:
 * - / : キャラクター一覧画面
 * - /character/:characterId : キャラクター別レポート画面
 */
function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<CharacterList />} />
          <Route path="/character/:characterId" element={<CharacterReports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
