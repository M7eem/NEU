import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import allQuestions from '../data/questions.json';
import lectures from '../data/lectures.json';
import './Exam.css';

// Seeded shuffle so it stays stable per session but varies between disciplines
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pre-compute counts per discipline × type
function buildCounts(questions) {
  const counts = {};
  for (const lec of lectures) {
    counts[lec.id] = { MCQ: 0, SAQ: 0, OSPE: 0, total: 0 };
  }
  for (const q of questions) {
    if (counts[q.lectureId]) {
      counts[q.lectureId][q.type] = (counts[q.lectureId][q.type] || 0) + 1;
      counts[q.lectureId].total++;
    }
  }
  return counts;
}

const COUNTS = buildCounts(allQuestions);

export default function Exam() {
  const [discipline, setDiscipline] = useState(lectures[0].id);
  const [typeFilter, setTypeFilter]  = useState('all'); // 'all' | 'MCQ' | 'SAQ' | 'OSPE'
  const [shuffleKey, setShuffleKey]  = useState(0);     // bump to re-shuffle
  const [mobileOpen, setMobileOpen]  = useState(false);

  const { progress, saveAnswer, getQuestionStatus, getPreviousAnswer } = useProgress();
  const questionRefs = useRef({});

  // Select a discipline; clicking its name gives shuffled MCQ view
  const selectDiscipline = useCallback((id, type = 'all', doShuffle = false) => {
    setDiscipline(id);
    setTypeFilter(type);
    if (doShuffle) setShuffleKey(k => k + 1);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Build the ordered question list
  const questions = useMemo(() => {
    let pool = allQuestions.filter(q => q.lectureId === discipline);
    if (typeFilter !== 'all') pool = pool.filter(q => q.type === typeFilter);

    // Clicking the discipline name gives shuffled MCQs first; sub-type click keeps source order
    if (typeFilter === 'all') {
      const mcqs  = shuffle(pool.filter(q => q.type === 'MCQ'));
      const saqs  = pool.filter(q => q.type === 'SAQ');
      const ospes = pool.filter(q => q.type === 'OSPE');
      // eslint-disable-next-line no-unused-expressions
      shuffleKey; // reference so useMemo re-runs when shuffleKey changes
      return [...mcqs, ...saqs, ...ospes];
    }
    return pool;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discipline, typeFilter, shuffleKey]);

  const answeredCount = useMemo(
    () => questions.filter(q => progress[q.id]).length,
    [questions, progress]
  );

  function scrollTo(id) {
    questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }

  const discName = lectures.find(l => l.id === discipline)?.name ?? discipline;
  const subLabel = typeFilter === 'all' ? '' : ` · ${typeFilter}`;

  return (
    <div className="exam-root">

      {/* Mobile hamburger */}
      <button
        className="sidebar-fab"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`exam-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-scroll">

          <div className="sidebar-brand">NEU Exam Bank</div>

          <nav className="sidebar-nav">
            {lectures.map(lec => {
              const c = COUNTS[lec.id];
              const isActive = discipline === lec.id;
              const types = (['MCQ', 'SAQ', 'OSPE']).filter(t => c[t] > 0);

              return (
                <div key={lec.id} className="sb-disc-group">
                  <button
                    className={`sb-disc-name ${isActive && typeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => selectDiscipline(lec.id, 'all', true)}
                  >
                    <span>{lec.name}</span>
                    <span className="sb-count">{c.total}</span>
                  </button>
                  <div className="sb-type-list">
                    {types.map(t => (
                      <button
                        key={t}
                        className={`sb-type-btn ${isActive && typeFilter === t ? 'active' : ''}`}
                        onClick={() => selectDiscipline(lec.id, t, false)}
                      >
                        <span>{t}</span>
                        <span className="sb-count sb-count-sm">{c[t]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Progress summary */}
          <div className="sidebar-progress">
            <div className="sidebar-progress-label">
              {answeredCount} / {questions.length} answered
            </div>
            <ProgressBar
              value={answeredCount}
              total={questions.length}
              size="sm"
              showLabel={false}
            />
          </div>

          {/* Question grid */}
          {questions.length > 0 && (
            <div className="sb-q-section">
              <div className="section-header">Questions</div>
              <div className="q-grid">
                {questions.map((q, i) => {
                  const st = getQuestionStatus(q.id);
                  return (
                    <button
                      key={q.id}
                      className={`q-num q-num-${st}`}
                      onClick={() => scrollTo(q.id)}
                      title={`${q.type} ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="sidebar-footer-links">
            <Link to="/progress" className="sb-footer-link">Progress →</Link>
            <span className="sb-attribution">Made by Mohammed Baagag</span>
          </div>

        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="exam-main">
        <header className="exam-header">
          <h1 className="exam-title">{discName}{subLabel}</h1>
          <span className="exam-sub">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>
        </header>

        {questions.length === 0 ? (
          <div className="exam-empty">
            <p>No questions found for this selection.</p>
          </div>
        ) : (
          <div className="questions-list">
            {questions.map(q => (
              <div
                key={q.id}
                className="question-wrapper"
                ref={el => { questionRefs.current[q.id] = el; }}
              >
                <span className={`badge badge-${q.type.toLowerCase()}`}>{q.type}</span>
                <QuestionCard
                  question={q}
                  onAnswer={(id, ans, correct) => saveAnswer(id, ans, correct ?? false)}
                  status={getQuestionStatus(q.id)}
                  previousAnswer={getPreviousAnswer(q.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
