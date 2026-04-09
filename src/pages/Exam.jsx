import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { shuffleArray } from '../hooks/useQuestions';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import allQuestions from '../data/questions.json';
import lectures from '../data/lectures.json';
import './Exam.css';

// Default: first lecture's id
const DEFAULT_LECTURE = lectures[0]?.id ?? 'all';

export default function Exam() {
  const [selectedLecture, setSelectedLecture] = useState(DEFAULT_LECTURE);
  const [selectedType, setSelectedType]       = useState('all');
  const [mcqOrder, setMcqOrder]               = useState('lecture');
  const [shuffledMCQIds, setShuffledMCQIds]   = useState(null);
  const [sidebarOpen, setSidebarOpen]         = useState(false);

  const { progress, saveAnswer, getQuestionStatus, getPreviousAnswer } = useProgress();
  const questionRefs = useRef({});

  // Regenerate shuffle whenever lecture changes or mixed is activated
  useEffect(() => {
    if (mcqOrder === 'mixed') {
      const pool = allQuestions.filter(
        q => q.type === 'MCQ' &&
             (selectedLecture === 'all' || q.lectureId === selectedLecture)
      );
      setShuffledMCQIds(shuffleArray(pool).map(q => q.id));
    } else {
      setShuffledMCQIds(null);
    }
  }, [selectedLecture, mcqOrder]);

  // Build ordered question list: MCQ → SAQ → OSPE
  const orderedQuestions = useMemo(() => {
    let filtered = allQuestions;

    if (selectedLecture !== 'all') {
      filtered = filtered.filter(q => q.lectureId === selectedLecture);
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(q => q.type === selectedType);
    }

    const mcqs  = filtered.filter(q => q.type === 'MCQ');
    const saqs  = filtered.filter(q => q.type === 'SAQ');
    const ospes = filtered.filter(q => q.type === 'OSPE');

    let orderedMCQs = mcqs;
    if (mcqOrder === 'mixed' && shuffledMCQIds) {
      const idRank = new Map(shuffledMCQIds.map((id, i) => [id, i]));
      orderedMCQs = [...mcqs].sort(
        (a, b) => (idRank.get(a.id) ?? 9999) - (idRank.get(b.id) ?? 9999)
      );
    }

    return [...orderedMCQs, ...saqs, ...ospes];
  }, [selectedLecture, selectedType, mcqOrder, shuffledMCQIds]);

  const answeredCount = useMemo(
    () => orderedQuestions.filter(q => progress[q.id]).length,
    [orderedQuestions, progress]
  );

  function handleAnswer(questionId, userAnswer, isCorrect) {
    saveAnswer(questionId, userAnswer, isCorrect !== null ? isCorrect : false);
  }

  function scrollToQuestion(id) {
    questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSidebarOpen(false);
  }

  const showMCQOrder = selectedType === 'all' || selectedType === 'MCQ';

  const lectureName = selectedLecture === 'all'
    ? 'All Lectures'
    : lectures.find(l => l.id === selectedLecture)?.name ?? selectedLecture;

  return (
    <div className="exam-root">

      {/* Mobile toggle button */}
      <button
        className="sidebar-fab"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle filters"
      >
        {sidebarOpen ? 'Close' : 'Filters'}
      </button>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`exam-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-scroll">

          {/* Lectures */}
          <section className="sidebar-section">
            <div className="section-header">Lectures</div>
            <label className="sb-radio">
              <input
                type="radio" name="lecture" value="all"
                checked={selectedLecture === 'all'}
                onChange={() => setSelectedLecture('all')}
              />
              <span>All Lectures</span>
            </label>
            {lectures.map(lec => (
              <label key={lec.id} className="sb-radio">
                <input
                  type="radio" name="lecture" value={lec.id}
                  checked={selectedLecture === lec.id}
                  onChange={() => setSelectedLecture(lec.id)}
                />
                <span>{lec.name}</span>
              </label>
            ))}
          </section>

          {/* Question type */}
          <section className="sidebar-section">
            <div className="section-header">Question Type</div>
            {[
              { value: 'all',  label: 'All Types' },
              { value: 'MCQ',  label: 'MCQ' },
              { value: 'SAQ',  label: 'SAQ' },
              { value: 'OSPE', label: 'OSPE' },
            ].map(opt => (
              <label key={opt.value} className="sb-radio">
                <input
                  type="radio" name="type" value={opt.value}
                  checked={selectedType === opt.value}
                  onChange={() => setSelectedType(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </section>

          {/* MCQ order — only when MCQ is in scope */}
          {showMCQOrder && (
            <section className="sidebar-section">
              <div className="section-header">MCQ Order</div>
              <label className="sb-radio">
                <input
                  type="radio" name="mcqOrder" value="lecture"
                  checked={mcqOrder === 'lecture'}
                  onChange={() => setMcqOrder('lecture')}
                />
                <span>By Lecture</span>
              </label>
              <label className="sb-radio">
                <input
                  type="radio" name="mcqOrder" value="mixed"
                  checked={mcqOrder === 'mixed'}
                  onChange={() => setMcqOrder('mixed')}
                />
                <span>Mixed</span>
              </label>
            </section>
          )}

          {/* Progress */}
          <section className="sidebar-section sidebar-progress">
            <div className="sidebar-progress-label">
              {answeredCount} / {orderedQuestions.length} answered
            </div>
            <ProgressBar
              value={answeredCount}
              total={orderedQuestions.length}
              size="sm"
              showLabel={false}
            />
          </section>

          {/* Question number grid */}
          {orderedQuestions.length > 0 && (
            <section className="sidebar-section">
              <div className="section-header">Questions</div>
              <div className="q-grid">
                {orderedQuestions.map((q, i) => {
                  const st = getQuestionStatus(q.id);
                  return (
                    <button
                      key={q.id}
                      className={`q-num q-num-${st}`}
                      onClick={() => scrollToQuestion(q.id)}
                      title={`Question ${i + 1} — ${q.type}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Nav links */}
          <section className="sidebar-nav-links">
            <Link to="/" className="sb-nav-link">Home</Link>
            <Link to="/progress" className="sb-nav-link">Progress</Link>
          </section>

        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="exam-main">
        <div className="exam-main-header">
          <div>
            <h2 className="exam-main-title">{lectureName}</h2>
            <span className="exam-main-sub">
              {orderedQuestions.length} question{orderedQuestions.length !== 1 ? 's' : ''}
              {selectedType !== 'all' ? ` · ${selectedType}` : ''}
            </span>
          </div>
        </div>

        {orderedQuestions.length === 0 ? (
          <div className="exam-empty card mt-lg">
            <h2>No questions match these filters</h2>
            <p className="text-secondary mt-sm">
              Try selecting a different lecture or question type.
            </p>
          </div>
        ) : (
          <div className="questions-list">
            {orderedQuestions.map((q, i) => (
              <div
                key={q.id}
                className="question-wrapper"
                ref={el => { questionRefs.current[q.id] = el; }}
              >
                <div className="question-row-header">
                  <span className="question-index">Q{i + 1}</span>
                  <span className={`badge badge-${q.type.toLowerCase()}`}>{q.type}</span>
                  {selectedLecture === 'all' && (
                    <span className="question-lec-tag">
                      {lectures.find(l => l.id === q.lectureId)?.name ?? q.lectureId}
                    </span>
                  )}
                </div>
                <QuestionCard
                  question={q}
                  onAnswer={handleAnswer}
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
