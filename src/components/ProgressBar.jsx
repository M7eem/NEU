import './ProgressBar.css';

export default function ProgressBar({ value, total, showLabel = true, size = 'md' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`progress-bar-wrap ${size}`}>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className="progress-bar-label">
          {value} / {total} &nbsp;({pct}%)
        </span>
      )}
    </div>
  );
}
