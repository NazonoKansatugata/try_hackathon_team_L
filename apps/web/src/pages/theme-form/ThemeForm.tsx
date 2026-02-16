import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import './ThemeForm.css';

/**
 * テーマ追加フォームページ
 * 
 * Firestoreのthemesコレクションに新しいテーマを追加するフォーム
 */
function ThemeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    keywords: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // バリデーション
      if (!formData.title.trim()) {
        throw new Error('テーマのタイトルは必須です');
      }
      if (!formData.description.trim()) {
        throw new Error('テーマの説明は必須です');
      }
      if (!formData.category.trim()) {
        throw new Error('カテゴリーは必須です');
      }

      // キーワードを配列に変換
      const keywordsArray = formData.keywords
        .split(',')
        .map((kw) => kw.trim())
        .filter((kw) => kw.length > 0);

      // Firestoreに保存
      const themesCollection = collection(db, 'themes');
      await addDoc(themesCollection, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        keywords: keywordsArray,
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: '',
        keywords: '',
      });

      // 2秒後にホームページにリダイレクト
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="theme-form-container">
      <div className="theme-form-wrapper">
        <h1>新しいテーマを追加</h1>
        <p className="subtitle">Firestoreに新しいテーマを追加できます</p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            テーマを追加しました！ホームページにリダイレクトします...
          </div>
        )}

        <form onSubmit={handleSubmit} className="theme-form">
          <div className="form-group">
            <label htmlFor="title">テーマのタイトル *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="例：春の季節"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">説明 *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="例：春の季節に関する会話トピック"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">カテゴリー *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">選択してください</option>
              <option value="季節">季節</option>
              <option value="イベント">イベント</option>
              <option value="日常">日常</option>
              <option value="ゲーム">ゲーム</option>
              <option value="学習">学習</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="keywords">キーワード (カンマ区切り)</label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="例：桜, 新生活, 卒業"
            />
            <small>カンマで区切って複数指定できます</small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-submit"
            >
              {isSubmitting ? '送信中...' : 'テーマを追加'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-cancel"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ThemeForm;
