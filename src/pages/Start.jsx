import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import lectures from '../data/lectures.json';
import './Start.css';

export default function Start() {
  const navigate = useNavigate();
  const [type, setType] = useState('all');
  const [lectureId, setLectureId] = useState('all');
  const [questionStatus, setQuestionStatus] = useState('all');

  function handleStart() {
    const params = new URLSearchParams({ type, lectureId, status: questionStatus });
    navigate(`/exam?${params.toString()}`);
  }

  return (
    <main className="page page-narrow">
      <h1>New Session</h1>
      <p className="text-secondary mt-sm">Choose your filters and start practicing.</p>

      <section className="card mt-xl">
        <div className="section-header">Question Type</div>
        <div className="filter-radio-group">
          {[
            { value: 'all', label: 'All Types' },
            { value: 'MCQ', label: 'MCQ' },
            { value: 'OSPE', label: 'OSPE' },
            { value: 'SAQ', label: 'SAQ' },
          ].map(opt => (
            <label key={opt.value} className="filter-radio-label">
              <input
                type="radio"
                name="type"
                value={opt.value}
                checked={type === opt.value}
                onChange={() => setType(opt.value)}
                className="filter-radio-input"
              />
              <span className="filter-radio-text">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card mt-md">
        <div className="section-header">Lecture</div>
        <select
          className="filter-select"
          value={lectureId}
          onChange={e => setLectureId(e.target.value)}
        >
          <option value="all">All Lectures</option>
          {lectures.map(lec => (
            <option key={lec.id} value={lec.id}>
              {lec.name}
            </option>
          ))}
        </select>
      </section>

      <section className="card mt-md">
        <div className="section-header">Show Questions</div>
        <div className="filter-radio-group">
          {[
            { value: 'all', label: 'All questions' },
            { value: 'unsolved', label: 'Unsolved only' },
            { value: 'incorrect', label: 'Previously incorrect only' },
          ].map(opt => (
            <label key={opt.value} className="filter-radio-label">
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={questionStatus === opt.value}
                onChange={() => setQuestionStatus(opt.value)}
                className="filter-radio-input"
              />
              <span className="filter-radio-text">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="start-actions mt-xl">
        <button className="btn btn-primary" onClick={handleStart}>
          Start
        </button>
      </div>
    </main>
  );
}
