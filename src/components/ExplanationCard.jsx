import './ExplanationCard.css';

export default function ExplanationCard({ question, userAnswer, isCorrect }) {
  const hasDualAnswer =
    question.suggestedAnswer &&
    question.suggestedAnswer !== question.sourceAnswer;

  const isSAQ = question.type === 'SAQ';
  const cardClass = isSAQ ? 'neutral' : (isCorrect ? 'correct' : 'wrong');

  return (
    <div className={`explanation-card ${cardClass}`}>
      {!isSAQ && (
        <div className="explanation-verdict">
          {isCorrect ? 'Correct' : 'Incorrect'}
        </div>
      )}

      {question.type === 'MCQ' || question.type === 'OSPE' ? (
        <div className="explanation-answers">
          <div className="explanation-answer-row">
            <span className="answer-label">Your answer:</span>
            <span className={`answer-value ${isCorrect ? 'text-correct' : 'text-wrong'}`}>
              {userAnswer}
            </span>
          </div>
          {!isCorrect && (
            <div className="explanation-answer-row">
              <span className="answer-label">Correct answer:</span>
              <span className="answer-value text-correct">{question.correctAnswer}</span>
            </div>
          )}
          {hasDualAnswer && (
            <>
              <hr className="explanation-divider" />
              <div className="explanation-dual-notice">
                <div className="dual-notice-title">Answer discrepancy noted</div>
                <div className="explanation-answer-row">
                  <span className="answer-label">Source file answer:</span>
                  <span className="answer-value">{question.sourceAnswer}</span>
                </div>
                <div className="explanation-answer-row">
                  <span className="answer-label">Suggested correct answer:</span>
                  <span className="answer-value text-correct">{question.suggestedAnswer}</span>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      {question.type === 'SAQ' && (
        <div className="explanation-saq-answer">
          <div className="answer-label mb-sm">Model answer:</div>
          <p className="saq-model-answer">{question.correctAnswer}</p>
          {question.sourceAnswer && question.sourceAnswer !== question.correctAnswer && (
            <div className="explanation-dual-notice mt-md">
              <div className="dual-notice-title">Source file answer:</div>
              <p className="saq-source-answer">{question.sourceAnswer}</p>
            </div>
          )}
        </div>
      )}

      {question.explanation && (
        <>
          <hr className="explanation-divider" />
          <div className="explanation-text-label">Explanation</div>
          <p className="explanation-text">{question.explanation}</p>
        </>
      )}
    </div>
  );
}
