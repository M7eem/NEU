import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Start from './pages/Start';
import Exam from './pages/Exam';
import Progress from './pages/Progress';
import './styles/global.css';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<Start />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
      <footer className="site-footer">
        Made by Mohammed Baagag
      </footer>
    </BrowserRouter>
  );
}
