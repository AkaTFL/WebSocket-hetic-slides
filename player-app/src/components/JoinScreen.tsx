// ============================================================
// JoinScreen - Formulaire pour rejoindre un quiz
// Ce fichier est COMPLET
// ============================================================

import { useState } from 'react'

interface JoinScreenProps {
  onJoin: (code: string, name: string) => void
  error?: string
}

function JoinScreen({ onJoin, error }: JoinScreenProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !name.trim()) return
    onJoin(code.toUpperCase(), name.trim())
  }

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <h1>Rejoindre un Quiz</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label htmlFor="quiz-code">Code du quiz</label>
        <input
          id="quiz-code"
          className="code-input"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="ABC123"
          maxLength={6}
          autoComplete="off"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="player-name">Ton pseudo</label>
        <input
          id="player-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Alice"
          maxLength={20}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={!code.trim() || !name.trim()}
      >
        Rejoindre
      </button>
    </form>
  )
}

export default JoinScreen
