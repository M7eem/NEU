import { useState } from 'react';
import ExplanationCard from './ExplanationCard';
import './QuestionCard.css';

export default function QuestionCard({ question, onAnswer, status }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [saqText, setSaqText] = useState('');

  const alreadyAnswered = status === 'correct' || status === 'incorrect';

  function handleChoiceClick(letter) {
    if (selected || alreadyAnswered) return;
    const isCorrect = letter === question.correctAnswer;
    setSelected(letter);
    onAnswer(question.id, letter, isCorrect);
  }

  function handleSaqReveal() {
    setRevealed(true);
    onAnswer(question.id, saqText, null);
  }

  function choiceClass(letter) {
    if (!selected && !alreadyAnswered) return 'choice';
    if (letter === question.correctAnswer) return 'choice correct';
    if (letter === selected) return 'choice wrong';
    return 'choice dimmed';
  }

  const answered = selected !== null || revealed;

  return (
    <div className="question-card">
      <div className="question-meta">
        <span className={`badge badge-${question.type.toLowerCase()}`}>{question.type}</span>
      </div>

      <p className="question-text">{question.question}</p>

      {question.image && (
        <div className="question-image-wrap">
          <img
            src={question.image}
            alt="Question illustration"
            className="question-image"
          />
        </div>
      )}

      {(question.type === 'MCQ' || question.type === 'OSPE') && (
        <div className="choices-list">
          {question.choices.map(choice => {
            const letter = choice.charAt(0);
            return (
              <button
                key={letter}
                className={choiceClass(letter)}
                onClick={() => handleChoiceClick(letter)}
                disabled={alreadyAnswered && !selected}
              >
                {choice}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'SAQ' && !revealed && (
        <div className="saq-input-wrap">
          <textarea
            className="saq-textarea"
            placeholder="Write your answer here..."
            value={saqText}
            onChange={e => setSaqText(e.target.value)}
            rows={4}
          />
          <button className="btn btn-primary mt-md" onClick={handleSaqReveal}>
            Show Answer
          </button>
        </div>
      )}

      {answered && (
        <ExplanationCard
          question={question}
          userAnswer={question.type === 'SAQ' ? saqText || '(no answer written)' : selected}
          isCorrect={
            question.type === 'SAQ'
              ? null
              : selected === question.correctAnswer
          }
        />
      )}
    </div>
  );
}
