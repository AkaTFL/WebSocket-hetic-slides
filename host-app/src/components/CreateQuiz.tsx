// ============================================================
// CreateQuiz - Formulaire de creation d'un quiz
// A IMPLEMENTER : construire le formulaire dynamique
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'

interface CreateQuizProps {
  /** Callback appele quand le formulaire est soumis */
  onSubmit: (title: string, questions: QuizQuestion[]) => void
}

function CreateQuiz({ onSubmit }: CreateQuizProps) {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: crypto.randomUUID(),
      text: '',
      choices: ['', '', '', ''],
      correctIndex: 0,
      timerSec: 20,
    },
  ])

  const updateQuestion = (questionId: string, updater: (q: QuizQuestion) => QuizQuestion) => {
    setQuestions((prev) =>
      prev.map((question) => (question.id === questionId ? updater(question) : question))
    )
  }

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: '',
        choices: ['', '', '', ''],
        correctIndex: 0,
        timerSec: 20,
      },
    ])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((question) => question.id !== questionId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      alert('Le titre du quiz est obligatoire.')
      return
    }

    if (questions.length === 0) {
      alert('Ajoutez au moins une question.')
      return
    }

    const hasInvalidQuestion = questions.some((question) => {
      const hasText = question.text.trim().length > 0
      const hasAllChoices = question.choices.length === 4 && question.choices.every((choice) => choice.trim().length > 0)
      return !hasText || !hasAllChoices
    })

    if (hasInvalidQuestion) {
      alert('Chaque question doit avoir un texte et 4 choix remplis.')
      return
    }

    onSubmit(trimmedTitle, questions)
  }

  return (
    <div className="phase-container">
      <h1>Creer un Quiz</h1>

      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="quiz-title">Titre du quiz</label>
          <input
            id="quiz-title"
            type="text"
            placeholder="Ex: Culture generale"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {questions.map((question, questionIndex) => (
          <div key={question.id} className="question-card">
            <div className="question-card-header">
              <h3>Question {questionIndex + 1}</h3>
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeQuestion(question.id)}
                disabled={questions.length === 1}
              >
                Supprimer
              </button>
            </div>

            <div className="form-group">
              <label>Texte de la question</label>
              <input
                type="text"
                placeholder="Ex: Quelle est la capitale du Portugal ?"
                value={question.text}
                onChange={(e) =>
                  updateQuestion(question.id, (current) => ({ ...current, text: e.target.value }))
                }
              />
            </div>

            <div className="choices-inputs">
              {question.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex} className="choice-input-group">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctIndex === choiceIndex}
                    onChange={() =>
                      updateQuestion(question.id, (current) => ({ ...current, correctIndex: choiceIndex }))
                    }
                  />
                  <input
                    type="text"
                    placeholder={`Choix ${choiceIndex + 1}`}
                    value={choice}
                    onChange={(e) =>
                      updateQuestion(question.id, (current) => {
                        const nextChoices = [...current.choices]
                        nextChoices[choiceIndex] = e.target.value
                        return { ...current, choices: nextChoices }
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Temps (secondes)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={question.timerSec}
                onChange={(e) =>
                  updateQuestion(question.id, (current) => ({
                    ...current,
                    timerSec: Number(e.target.value) || 20,
                  }))
                }
              />
            </div>
          </div>
        ))}

        <button type="button" className="btn-add-question" onClick={addQuestion}>
          + Ajouter une question
        </button>

        <button type="submit" className="btn-primary">
          Creer le quiz
        </button>
      </form>
    </div>
  )
}

export default CreateQuiz
