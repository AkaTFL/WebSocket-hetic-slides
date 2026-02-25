// ============================================================
// QuizRoom - Logique d'une salle de quiz
// A IMPLEMENTER : remplir le corps de chaque methode
// ============================================================

import WebSocket from 'ws'
import type { QuizQuestion, QuizPhase, ServerMessage } from '../../packages/shared-types'
import { send, broadcast } from './utils'
import { create } from 'domain'

/** Represente un joueur connecte */
interface Player {
  id: string
  name: string
  ws: WebSocket
}


export class QuizRoom {
  /** Identifiant unique de la salle */
  readonly id: string

  /** Code a 6 caracteres que les joueurs utilisent pour rejoindre */
  readonly code: string

  /** Phase actuelle du quiz */
  phase: QuizPhase = 'lobby'

  /** WebSocket du host (presentateur) */
  hostWs: WebSocket | null = null

  /** Map des joueurs : playerId -> Player */
  players: Map<string, Player> = new Map()

  /** Liste des questions du quiz */
  questions: QuizQuestion[] = []

  /** Titre du quiz */
  title: string = ''

  /** Index de la question en cours (0-based) */
  currentQuestionIndex: number = -1

  /** Map des reponses pour la question en cours : playerId -> choiceIndex */
  answers: Map<string, number> = new Map()

  /** Map des scores cumules : playerId -> score total */
  scores: Map<string, number> = new Map()

  /** Timer ID pour le compte a rebours (pour pouvoir l'annuler) */
  timerId: ReturnType<typeof setInterval> | null = null

  /** Temps restant pour la question en cours */
  remaining: number = 0

  constructor(id: string, code: string) {
    this.id = id
    this.code = code
  }

  /**
   * Ajoute un joueur a la salle.
   * - Creer un objet Player avec un ID unique
   * - L'ajouter a this.players
   * - Initialiser son score a 0 dans this.scores
   * - Envoyer un message 'joined' a TOUS les clients (host + players)
   *   avec la liste des noms de joueurs
   * @returns l'ID du joueur cree
   */
  


  addPlayer(name: string, ws: WebSocket): string {
    const playerId = Math.random().toString(36).substring(2, 11);
    const player: Player = {
      id: playerId,
      name,
      ws,
    };

  this.players.set(playerId, player);
  this.scores.set(playerId, 0);
    
  this.broadcastToAll({type: 'joined', playerId: playerId, players: Array.from(this.players.values()).map(p => p.name)});

    return playerId
  }

  /**
   * Demarre le quiz.
   * - Verifier qu'on est en phase 'lobby'
   * - Verifier qu'il y a au moins 1 joueur
   * - Passer a la premiere question en appelant nextQuestion()
   */
  start(): void {
    if (this.phase === 'lobby' && this.players.size > 0) {
      this.nextQuestion();
    }
  }

  /**
   * Passe a la question suivante.
   * - Annuler le timer precedent s'il existe
   * - Incrementer currentQuestionIndex
   * - Si on a depasse la derniere question, appeler broadcastLeaderboard() et return
   * - Vider la map answers
   * - Passer en phase 'question'
   * - Appeler broadcastQuestion()
   * - Demarrer le timer (setInterval toutes les secondes)
   *   qui decremente remaining et envoie un 'tick' a tous
   *   Quand remaining atteint 0, appeler timeUp()
   */
  nextQuestion(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.currentQuestionIndex++;  // OK
    
    if (this.currentQuestionIndex >= this.questions.length) {
      this.broadcastLeaderboard();
      return;
    }
    
    this.answers.clear();
    
    this.phase = 'question';
    this.remaining = this.questions[this.currentQuestionIndex].timerSec;
    this.broadcastQuestion();
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  /**
   * Traite la reponse d'un joueur.
   * - Verifier qu'on est en phase 'question'
   * - Verifier que le joueur n'a pas deja repondu
   * - Enregistrer la reponse dans this.answers
   * - Si la reponse est correcte, calculer et ajouter les points :
   *   score = 1000 + Math.round(500 * (this.remaining / question.timerSec))
   * - Si tous les joueurs ont repondu, appeler timeUp() immediatement
   */
  handleAnswer(playerId: string, choiceIndex: number): void {
    if (this.phase == 'question') {
      if (this.answers.has(playerId)) {
        return;
      }
        
      this.answers.set(playerId, choiceIndex);
      
      if (this.answers.get(playerId) === this.questions[this.currentQuestionIndex].correctIndex) {
        const score = 1000 + Math.round(500 * (this.remaining / this.questions[this.currentQuestionIndex].timerSec));
        this.scores.set(playerId, (this.scores.get(playerId) || 0) + score);
      }
      if (this.answers.size === this.players.size) {
        this.timeUp();
      }
    }
  }

  /**
   * Appelee toutes les secondes par le timer.
   * - Decrementer this.remaining
   * - Envoyer un 'tick' a tous les clients avec le temps restant
   * - Si remaining <= 0, appeler timeUp()
   */
  private tick(): void {
    this.remaining--;
    this.broadcastToAll({type: 'tick', remaining: this.remaining});
    if (this.remaining <= 0) {
      this.timeUp();
    }
  }

  /**
   * Appelee quand le temps est ecoule (ou que tout le monde a repondu).
   * - Annuler le timer
   * - Passer en phase 'results'
   * - Appeler broadcastResults()
   */
  private timeUp(): void {
    clearInterval(this.timerId!);
    this.phase = 'results';
    this.broadcastResults();
  }

  /**
   * Retourne la liste de tous les WebSocket des joueurs.
   * Utile pour broadcast.
   */
  private getPlayerWsList(): WebSocket[] {
    const list: WebSocket[] = [];
      for (const player of this.players.values()){
        list.push(player.ws);
      }
    return list;
  }

  /**
   * Envoie un message a tous les clients : host + tous les joueurs.
   */
  private broadcastToAll(message: ServerMessage): void {
    const playersWs = this.getPlayerWsList();
    playersWs.push(this.hostWs!);
    broadcast(playersWs, message);
  }

  /**
   * Envoie la question en cours a tous les clients.
   * IMPORTANT : ne pas envoyer correctIndex aux clients !
   * Le message 'question' contient : question (sans correctIndex), index, total
   */
  private broadcastQuestion(): void {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    // TODO: Creer l'objet question SANS correctIndex (utiliser destructuring)
    const { correctIndex, ...questionToSend } = currentQuestion;
    
    this.broadcastToAll({
      type: 'question',
      question: questionToSend,
      index: this.currentQuestionIndex,
      total: this.questions.length
    });
  }

  /**
   * Envoie les resultats de la question en cours.
   * - correctIndex : l'index de la bonne reponse
   * - distribution : tableau du nombre de reponses par choix [0, 5, 2, 1]
   * - scores : objet { nomJoueur: scoreTotal } pour tous les joueurs
   */
  private broadcastResults(): void {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    // TODO: Calculer la distribution des reponses
      const distribution = new Array(currentQuestion.choices.length).fill(0);
      for (const choiceIndex of this.answers.values()) {
        distribution[choiceIndex]++;
      }
    const scoresObj: { [name: string]: number } = {};
    for (const [playerId, score] of this.scores.entries()) {
      const player = this.players.get(playerId);
      if (player) {
        scoresObj[player.name] = score;
      }
    }

    this.broadcastToAll({
      type: 'results',
      correctIndex: currentQuestion.correctIndex,
      distribution: distribution,
      scores: scoresObj})
  }

  /**
   * Envoie le classement final.
   * - Trier les joueurs par score decroissant
   * - Envoyer un message 'leaderboard' avec rankings: { name, score }[]
   * - Passer en phase 'leaderboard'
   */
  broadcastLeaderboard(): void {
    const rankings = Array.from(this.players.values())
      .sort((a, b) => (this.scores.get(b.id) || 0) - (this.scores.get(a.id) || 0))
      .map(player => ({ name: player.name, score: this.scores.get(player.id) || 0 }));
      
    this.phase = 'leaderboard';
    this.broadcastToAll({type: 'leaderboard', rankings});
  }

  /**
   * Termine le quiz.
   * - Annuler le timer
   * - Passer en phase 'ended'
   * - Envoyer 'ended' a tous les clients
   */
  end(): void {
    clearInterval(this.timerId!);
    this.phase = 'ended';
    this.broadcastToAll({type: 'ended'});
  }
}
