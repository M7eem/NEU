import { useState, useCallback } from 'react';
import questions from '../data/questions.json';
import lectures from '../data/lectures.json';

const STORAGE_KEY = 'neu_progress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage unavailable
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(() => loadProgress());

  const saveAnswer = useCallback((questionId, userAnswer, correct) => {
    setProgress(prev => {
      const next = {
        ...prev,
        [questionId]: { userAnswer, correct, timestamp: Date.now() },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const getQuestionStatus = useCallback(
    (questionId) => {
      const entry = progress[questionId];
      if (!entry) return 'unanswered';
      return entry.correct ? 'correct' : 'incorrect';
    },
    [progress]
  );

  const getPreviousAnswer = useCallback(
    (questionId) => progress[questionId]?.userAnswer ?? null,
    [progress]
  );

  const getStats = useCallback(() => {
    const total = questions.length;
    const answered = Object.keys(progress).length;
    const correct = Object.values(progress).filter(e => e.correct).length;

    const byType = {};
    const byLecture = {};

    for (const q of questions) {
      if (!byType[q.type]) byType[q.type] = { total: 0, answered: 0, correct: 0 };
      byType[q.type].total++;

      if (!byLecture[q.lectureId]) byLecture[q.lectureId] = { total: 0, answered: 0, correct: 0 };
      byLecture[q.lectureId].total++;

      const entry = progress[q.id];
      if (entry) {
        byType[q.type].answered++;
        byLecture[q.lectureId].answered++;
        if (entry.correct) {
          byType[q.type].correct++;
          byLecture[q.lectureId].correct++;
        }
      }
    }

    const byLectureNamed = {};
    for (const lec of lectures) {
      byLectureNamed[lec.id] = {
        name: lec.name,
        subject: lec.subject,
        ...(byLecture[lec.id] || { total: 0, answered: 0, correct: 0 }),
      };
    }

    return { total, answered, correct, byType, byLecture: byLectureNamed };
  }, [progress]);

  const getIncorrectQuestions = useCallback(() => {
    return questions.filter(q => progress[q.id] && !progress[q.id].correct);
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress({});
    saveProgress({});
  }, []);

  return {
    progress,
    saveAnswer,
    getQuestionStatus,
    getPreviousAnswer,
    getStats,
    getIncorrectQuestions,
    resetProgress,
  };
}
