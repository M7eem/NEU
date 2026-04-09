import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useQuestions } from '../hooks/useQuestions';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import './Exam.css';

export default function Exam() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'all';
  const lectureId = searchParams.get('lectureId') || 'all';
  const status = searchParams.get('status') || 'all';

  const { progress, saveAnswer, getQuestionStatus } = useProgress();
  const questions = useQuestions({ type, lectureId, status, progress });

  const [index, setIndex] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  const current = questions[index];
  const currentStatus = current ? getQuestionStatus(current.id) : null;
  const answeredCount = useMemo(
    () => questions.filter(q => progress[q.id]).length,
    [questions, progress]
  );

  function handleAnswer(questionId, userAnswer, isCorrect) {
    if (isCorrect !== null) {
      saveAnswer(questionId, userAnswer, isCorrect);
    } else {
      // SAQ — mark as answered with null correct status
      saveAnswer(questionId, userAnswer, false);
    }
  }

  function handleNext() {
    if (index < questions.length - 1) setIndex(i => i + 1);
  }

  function handlePrev() {
    if (index > 0) setIndex(i => i - 1);
  }

  function handleSkip() {
    setSkipped(prev => new Set([...prev, current.id]));
    handleNext();
  }

  if (questions.length === 0) {
    return (
      <main className="page">
        <div className="exam-empty card">
          <h2>No questions found</h2>
          <p className="text-secondary mt-sm">
            No questions match your selected filters. Try adjusting your session settings.
          </p>
          <Link to="/start" className="btn btn-secondary mt-lg">
            Back to Filters
          </Link>
        </div>
      </main>
    );
  }

  const isLast = index === questions.length - 1;
  const alreadyAnswered = currentStatus === 'correct' || currentStatus === 'incorrect';

  return (
    <main className="page">
      <div className="exam-topbar">
        <span className="exam-counter">
          Question {index + 1} of {questions.length}
        </span>
        <Link to="/start" className="btn btn-ghost">
          Exit
        </Link>
      </div>

      <div className="exam-progress mt-sm">
        <ProgressBar value={answeredCount} total={questions.length} size="sm" showLabel={false} />
      </div>

      <div className="mt-lg">
        {current && (
          <QuestionCard
            key={current.id}
            question={current}
            onAnswer={handleAnswer}
            status={currentStatus}
          />
        )}
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
    </main>
  );
}
