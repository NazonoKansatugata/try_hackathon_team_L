import { useState } from 'react';
import './QuestionForm.css';

function QuestionForm() {
  // 回答フォーム向けの状態

  // 複数問題を配列で管理（うさこに関する〇×問題）
  const problems = [
    {
      title: '問題1: うさこの生活リズム',
      body:
        '次の文は、うさこに関する記述です。該当するなら「〇」、該当しないなら「×」を選んでください。\n\n「うさこは夜により活動的で、昼は控えめに過ごす傾向がある。」',
    },
    {
      title: '問題2: 社交性について',
      body:
        '「うさこは人前で積極的に話すタイプである。」',
    },
    {
      title: '問題3: 好物に関する記述',
      body:
        '「うさこは甘いものが好きで、よくお菓子を食べる。」',
    },
    {
      title: '問題4: 秘密保持について',
      body:
        '「うさこは他人の秘密を守ることができる。」',
    },
  ];

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'o' | 'x' | ''>>({});

  const handleChoice = (val: 'o' | 'x') => {
    setAnswers((prev) => ({ ...prev, [current]: val }));
  };

  const handleNext = () => {
    if (!answers[current]) {
      alert('まず〇か×を選んでください。');
      return;
    }
    if (current < problems.length - 1) setCurrent((c) => c + 1);
  };

  const handlePrev = () => {
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
    // 仮保存／表示
    const summary = problems
      .map((_, i) => `問題${i + 1}: ${answers[i] === 'o' ? '〇' : '×'}`)
      .join('\n');
    alert(`全ての回答を送信しました\n\n${summary}`);
    setAnswers({});
    setCurrent(0);
  };

  return (
    <div className="question-form-page">
      <h1>設問に回答する</h1>
      <p className="hint">以下の設問に対してあなたの考えを記入してください（うさこについて）。</p>

      {/* 現在は個別の問題を下で表示しています */}

      <form className="question-form" onSubmit={handleSubmitAll}>
        <div className="question-header">
          <div className="progress">{current + 1} / {problems.length}</div>
          <h3 className="current-title">{problems[current].title}</h3>
        </div>

        <pre className="current-body">{problems[current].body}</pre>

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
            <button type="submit" className="nav primary">すべて送信</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default QuestionForm;
