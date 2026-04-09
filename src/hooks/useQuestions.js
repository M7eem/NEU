import { useMemo } from 'react';
import allQuestions from '../data/questions.json';

export function useQuestions({ type, lectureId, status, progress }) {
  const filtered = useMemo(() => {
    let result = [...allQuestions];

    if (type && type !== 'all') {
      result = result.filter(q => q.type === type);
    }

    if (lectureId && lectureId !== 'all') {
      result = result.filter(q => q.lectureId === lectureId);
    }

    if (status === 'unsolved') {
      result = result.filter(q => !progress[q.id]);
    } else if (status === 'incorrect') {
      result = result.filter(q => progress[q.id] && !progress[q.id].correct);
    }

    return result;
  }, [type, lectureId, status, progress]);

  return filtered;
}

export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
