import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">NEU Exam Bank</Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/progress"
            className={`navbar-link ${location.pathname === '/progress' ? 'active' : ''}`}
          >
            Progress
          </Link>
        </div>
      </div>
    </nav>
  );
}
