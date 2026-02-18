import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuestions } from '../admin/fetchData';
import type { Question } from '../../types';
import './QuestionForm.css';

const DEFAULT_PROBLEMS: (Question & { id: string })[] = [];

function QuestionForm() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState<(Question & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'o' | 'x' | ''>>({});

  // Fisher-Yates シャッフルアルゴリズム
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Firestore から問題をロードして、ランダムに20問選出
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const questions = await getAllQuestions();
        
        // 問題が登録されているかチェック
        if (questions && questions.length > 0) {
          // 20問以上あればランダムに20問選出、20問未満は全部使用
          const numToSelect = Math.min(20, questions.length);
          const shuffled = shuffleArray(questions);
          const selected = shuffled.slice(0, numToSelect);
          setProblems(selected as (Question & { id: string })[]);
        } else {
          // フォールバック：デフォルト問題を使用
          console.warn('登録済み問題がないため、デフォルト問題を使用します');
          const shuffled = shuffleArray(DEFAULT_PROBLEMS);
          setProblems(shuffled);
        }
      } catch (error) {
        console.error('問題の読み込みに失敗しました', error);
        // エラー時もデフォルト問題を使用
        const shuffled = shuffleArray(DEFAULT_PROBLEMS);
        setProblems(shuffled);
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, []);

  const handleChoice = (val: 'o' | 'x') => {
    setAnswers((prev) => ({ ...prev, [current]: val }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (current < problems.length - 1) setCurrent((c) => c + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmitAll = (e: React.FormEvent) => {
    e.preventDefault();
    // 未回答チェック
    const missing = problems.map((_, i) => i).filter((i) => !answers[i]);
    if (missing.length > 0) {
      alert(`未回答の問題があります: ${missing.map((i) => i + 1).join(', ')}`);
      setCurrent(missing[0]);
      return;
    }
    // 正答数を計算
    const correctCount = problems.filter((p, i) => answers[i] === p.questionAnswer).length;
    const percentage = Math.round((correctCount / problems.length) * 100);
    
    // 結果画面へ遷移
    navigate('/result', { state: { percentage, correctCount, totalCount: problems.length } });
  };

  if (loading) {
    return <div className="question-form-page"><h1>読み込み中...</h1></div>;
  }

  if (problems.length === 0) {
    return (
      <div className="question-form-page">
        <h1>エラー</h1>
        <p>問題を読み込めませんでした。管理画面から問題を登録してください。</p>
      </div>
    );
  }

  return (
    <div className="question-form-page">
      <h1>設問に回答する</h1>
      <p className="hint">以下の設問に対してあなたの考えを記入してください（うさこについて）。</p>

      {/* 現在は個別の問題を下で表示しています */}

      <form className="question-form" onSubmit={handleSubmitAll}>
        <div className="question-header">
          <div className="progress">{current + 1} / {problems.length}</div>
          <h3 className="current-title">問題{current + 1}</h3>
        </div>

        <pre className="current-body">{problems[current].questionText}</pre>

        <div className="binary-block">
          <label className={`binary-option ${answers[current] === 'o' ? 'active' : ''}`} onClick={() => handleChoice('o')}>
            <input type="radio" name={`ox-${current}`} value="o" checked={answers[current] === 'o'} readOnly />
            <span className="mark">〇</span>
            <span className="label">当てはまる</span>
          </label>

          <label className={`binary-option ${answers[current] === 'x' ? 'active' : ''}`} onClick={() => handleChoice('x')}>
            <input type="radio" name={`ox-${current}`} value="x" checked={answers[current] === 'x'} readOnly />
            <span className="mark">×</span>
            <span className="label">当てはまらない</span>
          </label>
        </div>

        <div className="nav-buttons">
          <button type="button" onClick={handlePrev} disabled={current === 0} className="nav">前へ</button>
          {current < problems.length - 1 ? (
            <button type="button" onClick={handleNext} className="nav primary">次へ</button>
          ) : (
            <button type="submit" className="nav primary">結果を見る</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default QuestionForm;
