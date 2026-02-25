// ============================================================
// WaitingLobby - Ecran d'attente pour les joueurs
// Ce fichier est COMPLET
// ============================================================

interface WaitingLobbyProps {
  players: string[]
}

function WaitingLobby({ players }: WaitingLobbyProps) {
  return (
    <div className="phase-container waiting-container">
      <h1>Tu es dans la salle !</h1>
      <p className="waiting-message">En attente du host...</p>
      <p>{players.length} joueur(s) connecté(s)</p>

      <div className="player-list">
        {players.map((player) => (
          <span key={player} className="player-chip">
            {player}
          </span>
        ))}
      </div>
    </div>
  )
}

export default WaitingLobby
