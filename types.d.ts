/**
 * TypeScript type definitions for Bingo Game Simulator
 * This file provides type safety and better IDE support
 */

// Basic types
export type CellState = 0 | 1 | 2; // EMPTY | PLAYER | COMPUTER
export type GamePhase =
  | 'waiting'
  | 'player-turn'
  | 'computer-turn'
  | 'game-over';
export type LineType =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-main'
  | 'diagonal-anti';
export type ErrorType =
  | 'invalid-move'
  | 'cell-occupied'
  | 'game-over'
  | 'invalid-phase';
export type ConfidenceLevel = 'very-high' | 'high' | 'medium' | 'low';

// Board and position types
export type Board = CellState[][];
export type Position = { row: number; col: number };
export type CellPosition = [number, number];

// Game state types
export interface GameState {
  board: Board;
  currentRound: number;
  maxRounds: number;
  gamePhase: GamePhase;
  playerMoves: Move[];
  computerMoves: Move[];
  completedLines: Line[];
  gameStarted: boolean;
  gameEnded: boolean;
  boardSize: number;
}

export interface Move {
  row: number;
  col: number;
  round: number;
}

export interface Line {
  type: LineType;
  cells: CellPosition[];
  values?: CellState[];
  row?: number;
  col?: number;
}

// Suggestion and calculation types
export interface Suggestion {
  row: number;
  col: number;
  value: number;
  position: string;
  confidence: ConfidenceLevel;
  alternatives: Alternative[];
}

export interface Alternative {
  row: number;
  col: number;
  value: number;
}

export interface MoveEvaluation {
  row: number;
  col: number;
  value: number;
  position: string;
}

// Performance and metrics types
export interface PerformanceMetrics {
  cacheHitRate: string;
  cacheHits: number;
  cacheMisses: number;
  averageCalculationTime: string;
  cacheSize: {
    valueCache: number;
    lineCache: number;
    boardAnalysisCache?: number;
  };
}

export interface GameStats {
  currentRound: number;
  totalRounds: number;
  totalLines: number;
  completedLines: Line[];
  playerMoves: Move[];
  computerMoves: Move[];
  gamePhase: GamePhase;
  isGameComplete: boolean;
  remainingMoves: Position[];
}

// AI Learning types
export interface AILearningStats {
  currentSkillLevel: number;
  playStyle: 'aggressive' | 'defensive' | 'balanced' | 'strategic';
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'expert';
  gamesPlayed: number;
}

export interface GameData {
  board: Board;
  playerMoves: Move[];
  computerMoves: Move[];
  finalScore: number;
  completedLines: Line[];
  gameOutcome: 'excellent' | 'good' | 'average' | 'poor';
  roundsPlayed: number;
  timestamp: number;
}

// Component interfaces
export interface ILineDetector {
  checkHorizontalLines(board: Board): Line[];
  checkVerticalLines(board: Board): Line[];
  checkDiagonalLines(board: Board): Line[];
  getAllLines(board: Board): Line[];
  countCompletedLines(board: Board): number;
  isValidBoard(board: Board): boolean;
}

export interface IProbabilityCalculator {
  calculateMoveValue(board: Board, row: number, col: number): number;
  simulateAllPossibleMoves(board: Board): MoveEvaluation[];
  getBestSuggestion(board: Board): Suggestion | null;
  isValidMove(board: Board, row: number, col: number): boolean;
  isCenterPosition(row: number, col: number): boolean;
  copyBoard(board: Board): Board;
  getEmptyCells(board: Board): Position[];
}

export interface IGameEngine {
  startGame(): void;
  processPlayerTurn(row: number, col: number): void;
  processComputerTurn(row: number, col: number): void;
  isValidMove(row: number, col: number): boolean;
  getGameStats(): GameStats;
  getCurrentRound(): number;
  getCurrentPhase(): GamePhase;
  isGameComplete(): boolean;
  getBestMove(): Suggestion | null;
  reset(): void;
}

export interface IGameBoard {
  updateCell(row: number, col: number, state: CellState): void;
  updateBoard(board: Board): void;
  highlightSuggestion(
    row: number,
    col: number,
    options?: SuggestionOptions
  ): void;
  highlightLines(lines: Line[]): void;
  clearSuggestionHighlight(): void;
  clearLineHighlights(): void;
  clearAllHighlights(): void;
  reset(): void;
  setClickHandler(handler: CellClickHandler): void;
}

// Event handler types
export type CellClickHandler = (
  row: number,
  col: number,
  cellElement?: HTMLElement
) => void;
export type GameStateChangeHandler = (stats: GameStats) => void;
export type RoundCompleteHandler = (round: number, stats: GameStats) => void;
export type GameCompleteHandler = (stats: GameStats) => void;
export type ErrorHandler = (message: string) => void;

// UI and interaction types
export interface SuggestionOptions {
  confidence?: ConfidenceLevel;
  value?: number;
  alternatives?: Alternative[];
}

export interface UIState {
  isGameStarted: boolean;
  isGameEnded: boolean;
  currentPhase: GamePhase;
  currentRound: number;
  totalRounds: number;
  showSuggestions: boolean;
  algorithmType: 'standard' | 'enhanced' | 'ai-learning';
}

// Configuration types
export interface GameConfig {
  boardSize: number;
  maxRounds: number;
  enableAI: boolean;
  enableSuggestions: boolean;
  autoRandomMove: boolean;
  animationSpeed: number;
}

export interface AlgorithmWeights {
  COMPLETE_LINE: number;
  COOPERATIVE_LINE: number;
  POTENTIAL_LINE: number;
  CENTER_BONUS: number;
  INTERSECTION_BONUS?: number;
  NEAR_COMPLETE_BONUS?: number;
  MULTI_LINE_BONUS?: number;
}

// Test types
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

// Utility types
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Global declarations for browser environment
declare global {
  interface Window {
    CONSTANTS: typeof import('./utils/common.js').CONSTANTS;
    Utils: typeof import('./utils/common.js').Utils;
    GameError: typeof import('./utils/common.js').GameError;
    GameEngine: new () => IGameEngine;
    GameBoard: new (containerId: string, size?: number) => IGameBoard;
    LineDetector: new () => ILineDetector;
    ProbabilityCalculator: new () => IProbabilityCalculator;
    EnhancedProbabilityCalculator: new () => IProbabilityCalculator;
  }
}

// Module augmentation for Node.js environment
declare module 'node:fs' {
  interface Stats {
    isFile(): boolean;
    isDirectory(): boolean;
  }
}

export {};
