import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './ResultPage.css';

function ResultPage() {
  const location = useLocation();
  const state = location.state as { percentage: number; correctCount: number; totalCount: number } | undefined;

  // 80%以上なら管理者権限を付与
  useEffect(() => {
    if (state && state.percentage >= 80) {
      localStorage.setItem('isAdmin', 'true');
    }
  }, [state]);

  if (!state) {
    return (
      <div className="result-page">
        <h1>結果</h1>
        <p className="error">結果データが見つかりません。</p>
        <Link to="/question">
          <button className="back-btn">もう一度挑戦する</button>
        </Link>
      </div>
    );
  }

  const { percentage, correctCount, totalCount } = state;

  return (
    <div className="result-page">
      <h1>結果</h1>

      <div className="result-card">
        <div className="score-display">
          <div className="percentage">{percentage}%</div>
          <div className="correct-info">{totalCount}問中 {correctCount}問正解</div>
        </div>

        <div className="feedback">
          {percentage === 100 && <p className="excellent">あなたはうさこを知り尽くしています！権限を与えるに相応しいでしょう！</p>}
          {percentage >= 80 && percentage < 100 && <p className="very-good">うさこをよく知ってくれていますね。権限を与えても問題はないでしょう。</p>}
          {percentage >= 60 && percentage < 80 && <p className="good">良い成績です。ですが権限を与えるにはまだ足りないかもしれません。</p>}
          {percentage >= 40 && percentage < 60 && <p className="fair">まずまずですね。頑張ってうさこをもっと知ってみましょう。</p>}
          {percentage < 40 && <p className="needs-work">もっと頑張りましょう。あなたはまだうさこに関する知識が足りないようです。</p>}
        </div>
      </div>

      <div className="actions">
        <Link to="/question">
          <button className="retry-btn">もう一度挑戦する</button>
        </Link>
        <Link to="/">
          <button className="home-btn">ホームに戻る</button>
        </Link>
      </div>
    </div>
  );
}

export default ResultPage;
