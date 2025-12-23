export enum GameMode {
  TRAINING = 'TRAINING',
  SINGLE_PLAYER = 'SINGLE_PLAYER',
  HEAD_TO_HEAD = 'HEAD_TO_HEAD',
  TIME_TRIAL = 'TIME_TRIAL',
}

export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  MIXED = 0, // Represents all
}

export enum AppScreen {
  MENU = 'MENU',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  GAME = 'GAME',
  RESULTS = 'RESULTS',
}

export interface Country {
  id: string;
  name: string;
  difficulty: Difficulty;
  imageUrl: string;
  hints?: string;
}

export interface GameResult {
  mode: GameMode;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  player2Score?: number; // For Head to Head
  totalTime?: number; // For Time Trial (in milliseconds)
  winner?: 'Player 1' | 'Player 2' | 'Draw';
  trainingHistory?: Country[]; // List of countries viewed in training
}