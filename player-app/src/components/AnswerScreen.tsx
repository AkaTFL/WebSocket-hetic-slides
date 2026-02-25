// ============================================================
// AnswerScreen - Boutons de reponse colores
// Ce fichier est COMPLET
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'

interface AnswerScreenProps {
  question: Omit<QuizQuestion, 'correctIndex'>
  remaining: number
  onAnswer: (choiceIndex: number) => void
  hasAnswered: boolean
}

function AnswerScreen({ question, remaining, onAnswer, hasAnswered }: AnswerScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleClick = (index: number) => {
    setSelectedIndex(index)
    onAnswer(index)
  }

  const timerClass = [
    'answer-timer',
    remaining <= 3 ? 'danger' : remaining <= 10 ? 'warning' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="answer-screen">
      <div className={timerClass}>{remaining}s</div>

      <p className="answer-question">{question.text}</p>

      <div className="answer-grid">
        {question.choices.map((choice, index) => (
          <button
            key={index}
            className={`answer-btn${selectedIndex === index ? ' selected' : ''}`}
            onClick={() => handleClick(index)}
            disabled={hasAnswered}
          >
            {choice}
          </button>
        ))}
      </div>

      {hasAnswered && (
        <p className="answered-message">Réponse envoyée !</p>
      )}
    </div>
  )
}

export default AnswerScreen
