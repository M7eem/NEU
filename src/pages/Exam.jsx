import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useQuestions } from '../hooks/useQuestions';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import lectures from '../data/lectures.json';
import './Exam.css';

export default function Exam() {
  const [type, setType] = useState('all');
  const [lectureId, setLectureId] = useState('all');
  const [status, setStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { progress, saveAnswer, getQuestionStatus } = useProgress();
  const questions = useQuestions({ type, lectureId, status, progress });

  const [index, setIndex] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  // Reset to first question when filters change
  useEffect(() => {
    setIndex(0);
    setSkipped(new Set());
  }, [type, lectureId, status]);

  const current = questions[index];
  const currentStatus = current ? getQuestionStatus(current.id) : null;
  const answeredCount = useMemo(
    () => questions.filter(q => progress[q.id]).length,
    [questions, progress]
  );

  function handleAnswer(questionId, userAnswer, isCorrect) {
    saveAnswer(questionId, userAnswer, isCorrect !== null ? isCorrect : false);
  }

  function handleNext() {
    if (index < questions.length - 1) setIndex(i => i + 1);
  }

  function handlePrev() {
    if (index > 0) setIndex(i => i - 1);
  }

  function handleSkip() {
    setSkipped(prev => new Set([...prev, current.id]));
    if (index < questions.length - 1) setIndex(i => i + 1);
  }

  const alreadyAnswered = currentStatus === 'correct' || currentStatus === 'incorrect';
  const isLast = index === questions.length - 1;

  return (
    <div className="exam-layout">

      {/* Mobile sidebar toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle filters"
      >
        {sidebarOpen ? 'Close Filters' : 'Filters'}
      </button>

      {/* Sidebar */}
      <aside className={`exam-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-inner">

          <div className="sidebar-section">
            <div className="section-header">Question Type</div>
            {[
              { value: 'all', label: 'All Types' },
              { value: 'MCQ', label: 'MCQ' },
              { value: 'OSPE', label: 'OSPE' },
              { value: 'SAQ', label: 'SAQ' },
            ].map(opt => (
              <label key={opt.value} className="sidebar-radio">
                <input
                  type="radio"
                  name="type"
                  value={opt.value}
                  checked={type === opt.value}
                  onChange={() => { setType(opt.value); setSidebarOpen(false); }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="section-header">Lecture</div>
            <select
              className="sidebar-select"
              value={lectureId}
              onChange={e => { setLectureId(e.target.value); setSidebarOpen(false); }}
            >
              <option value="all">All Lectures</option>
              {lectures.map(lec => (
                <option key={lec.id} value={lec.id}>{lec.name}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <div className="section-header">Show</div>
            {[
              { value: 'all', label: 'All questions' },
              { value: 'unsolved', label: 'Unsolved only' },
              { value: 'incorrect', label: 'Incorrect only' },
            ].map(opt => (
              <label key={opt.value} className="sidebar-radio">
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={status === opt.value}
                  onChange={() => { setStatus(opt.value); setSidebarOpen(false); }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="sidebar-stats">
            <div className="sidebar-stats-count">
              {answeredCount} / {questions.length} answered
            </div>
            <ProgressBar value={answeredCount} total={questions.length} size="sm" showLabel={false} />
          </div>

          <div className="sidebar-links">
            <Link to="/" className="sidebar-link">Home</Link>
            <Link to="/progress" className="sidebar-link">Progress</Link>
          </div>

        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="exam-main">
        <div className="exam-topbar">
          <span className="exam-counter">
            {questions.length === 0
              ? 'No questions'
              : `Question ${index + 1} of ${questions.length}`}
          </span>
        </div>

        {questions.length === 0 ? (
          <div className="exam-empty card mt-lg">
            <h2>No questions match these filters</h2>
            <p className="text-secondary mt-sm">
              Try changing the type, lecture, or show filter on the left.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-md">
              <QuestionCard
                key={current?.id}
                question={current}
                onAnswer={handleAnswer}
                status={currentStatus}
              />
            </div>

            <div className="exam-nav mt-lg">
              <button
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={index === 0}
              >
                Previous
              </button>

              <div className="exam-nav-right">
                {!alreadyAnswered && current?.type !== 'SAQ' && (
                  <button className="btn btn-ghost" onClick={handleSkip}>
                    Skip
                  </button>
                )}
                {isLast ? (
                  <Link to="/progress" className="btn btn-primary">
                    Finish
                  </Link>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!alreadyAnswered && !skipped.has(current?.id)}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
