import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Exam from './pages/Exam';
import Progress from './pages/Progress';
import './styles/global.css';
import './App.css';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Exam />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
