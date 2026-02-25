// ============================================================
// ScoreScreen - Classement avec position du joueur
// Ce fichier est COMPLET
// ============================================================

interface ScoreScreenProps {
  rankings: { name: string; score: number }[]
  playerName: string
}

function ScoreScreen({ rankings, playerName }: ScoreScreenProps) {
  return (
    <div className="phase-container score-screen">
      <h2 className="leaderboard-title">Classement</h2>
      <div className="leaderboard">
        {rankings.map((ranking, index) => (
          <div
            key={ranking.name}
            className={`leaderboard-item${ranking.name === playerName ? ' is-me' : ''}`}
          >
            <span className="leaderboard-rank">{index + 1}</span>
            <span className="leaderboard-name">{ranking.name}</span>
            <span className="leaderboard-score">{ranking.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScoreScreen
