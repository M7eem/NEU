import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import ProgressBar from '../components/ProgressBar';
import './Home.css';

export default function Home() {
  const { getStats } = useProgress();
  const stats = getStats();

  const types = ['MCQ', 'OSPE', 'SAQ'];

  return (
    <main className="page">
      <header className="home-header">
        <h1>NEU Exam Bank</h1>
        <p className="home-subtitle text-secondary">
          Practice questions for NEU medical students
        </p>
      </header>

      <section className="card mt-xl">
        <div className="section-header">Overall Progress</div>
        <ProgressBar value={stats.answered} total={stats.total} size="lg" />
        <div className="home-correct-note text-secondary text-sm mt-sm">
          {stats.correct} correct out of {stats.answered} answered
        </div>
      </section>

      <section className="card mt-md">
        <div className="section-header">By Question Type</div>
        <div className="grid-3">
          {types.map(type => {
            const t = stats.byType[type] || { total: 0, answered: 0, correct: 0 };
            return (
              <div className="stat-block" key={type}>
                <span className={`badge badge-${type.toLowerCase()}`}>{type}</span>
                <span className="stat-number mt-sm">
                  {t.answered}<span className="stat-total">/{t.total}</span>
                </span>
                <span className="stat-label">answered</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="home-actions mt-xl">
        <Link to="/start" className="btn btn-primary home-btn-primary">
          Start Session
        </Link>
        <Link to="/progress" className="btn btn-secondary">
          View Progress
        </Link>
      </div>
    </main>
  );
}
