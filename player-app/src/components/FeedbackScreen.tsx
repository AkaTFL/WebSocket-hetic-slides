// ============================================================
// FeedbackScreen - Retour correct/incorrect
// Ce fichier est COMPLET
// ============================================================

interface FeedbackScreenProps {
  correct: boolean
  score: number
}

function FeedbackScreen({ correct, score }: FeedbackScreenProps) {
  return (
    <div className="phase-container feedback-container">
      <div className={`feedback ${correct ? 'correct' : 'incorrect'}`}>
        <div className="feedback-icon" />
        <p className="feedback-text">
          {correct ? 'Bonne réponse !' : 'Mauvaise réponse'}
        </p>
        <p className="feedback-score">Score : {score} pts</p>
      </div>
    </div>
  )
}

export default FeedbackScreen
