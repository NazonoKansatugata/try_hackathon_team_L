import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CharacterList from './pages/character-list/CharacterList';
import CharacterReports from './pages/character-reports/CharacterReports';
import ThemeForm from './pages/theme-form/ThemeForm';
import QuestionForm from './pages/question-form/QuestionForm';
import ResultPage from './pages/result/ResultPage';
import AdminPage from "./pages/admin/AdminPage"
import NotFoundPage from './pages/404page/NotFoundPage';
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
          <Route path="/question" element={<QuestionForm />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
