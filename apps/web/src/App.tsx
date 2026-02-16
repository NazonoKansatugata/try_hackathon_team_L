import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CharacterList from './pages/character-list/CharacterList';
import CharacterReports from './pages/character-reports/CharacterReports';
import ThemeForm from './pages/theme-form/ThemeForm';
import AdminPage from "./pages/admin/AdminPage"
import './App.css';

/**
 * メインアプリケーションコンポーネント
 * 
 * ルーティング設定:
 * - / : キャラクター一覧画面
 * - /character/:characterId : キャラクター別レポート画面
 * - /add-theme : テーマ追加フォーム画面
 */
function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<CharacterList />} />
          <Route path="/character/:characterId" element={<CharacterReports />} />
          <Route path="/add-theme" element={<ThemeForm />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
