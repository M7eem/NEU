import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import ProgressBar from '../components/ProgressBar';
import './Progress.css';

export default function Progress() {
  const { getStats, getIncorrectQuestions, resetProgress } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const stats = getStats();
  const incorrectList = getIncorrectQuestions();

  const types = ['MCQ', 'OSPE', 'SAQ'];

  function handleReset() {
    if (confirmReset) {
      resetProgress();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  }

  return (
    <main className="page">
      <div className="flex-between">
        <h1>Progress</h1>
        <Link to="/start" className="btn btn-primary">
          New Session
        </Link>
      </div>

      {/* Overall */}
      <section className="card mt-xl">
        <div className="section-header">Overall</div>
        <ProgressBar value={stats.answered} total={stats.total} size="lg" />
        <div className="progress-detail-row mt-md">
          <span className="text-secondary text-sm">{stats.correct} correct</span>
          <span className="text-secondary text-sm">
            {stats.answered - stats.correct} incorrect
          </span>
          <span className="text-secondary text-sm">
            {stats.total - stats.answered} remaining
          </span>
        </div>
      </section>

      {/* By type */}
      <section className="card mt-md">
        <div className="section-header">By Question Type</div>
        <div className="progress-type-list">
          {types.map(type => {
            const t = stats.byType[type] || { total: 0, answered: 0, correct: 0 };
            return (
              <div key={type} className="progress-type-row">
                <div className="flex-between mb-sm">
                  <span className={`badge badge-${type.toLowerCase()}`}>{type}</span>
                  <span className="text-sm text-secondary">
                    {t.answered}/{t.total}
                  </span>
                </div>
                <ProgressBar value={t.answered} total={t.total} size="sm" showLabel={false} />
              </div>
            );
          })}
        </div>
      </section>

      {/* By lecture */}
      <section className="card mt-md">
        <div className="section-header">By Lecture</div>
        <div className="progress-lecture-list">
          {Object.entries(stats.byLecture).map(([id, lec]) => (
            <div key={id} className="progress-lecture-row">
              <div className="flex-between mb-sm">
                <span className="progress-lecture-name">{lec.name}</span>
                <span className="text-sm text-secondary">
                  {lec.answered}/{lec.total}
                </span>
              </div>
              <ProgressBar value={lec.answered} total={lec.total} size="sm" showLabel={false} />
            </div>
          ))}
        </div>
      </section>

      {/* Incorrect answers */}
      {incorrectList.length > 0 && (
        <section className="card mt-md">
          <div className="section-header">
            Incorrect Answers ({incorrectList.length})
          </div>
          <div className="incorrect-list">
            {incorrectList.map(q => (
              <div key={q.id} className="incorrect-item">
                <span className={`badge badge-${q.type.toLowerCase()}`}>{q.type}</span>
                <span className="incorrect-question">{q.question}</span>
              </div>
            ))}
          </div>
          <div className="mt-md">
            <Link
              to={`/exam?type=all&lectureId=all&status=incorrect`}
              className="btn btn-secondary"
            >
              Retry Incorrect Questions
            </Link>
          </div>
        </section>
      )}

      {/* Reset */}
      <section className="card mt-md progress-reset-section">
        <div className="section-header">Reset</div>
        <p className="text-secondary text-sm">
          This will permanently clear all your progress and cannot be undone.
        </p>
        <div className="mt-md">
          {confirmReset ? (
            <div className="reset-confirm">
              <span className="text-sm text-secondary">Are you sure?</span>
              <button className="btn btn-danger" onClick={handleReset}>
                Yes, reset everything
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={handleReset}>
              Reset Progress
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
