// Unit tests for GameState class
// This file can be run with Node.js or a testing framework like Jest

// Import the GameState class and constants
const {
    GameState,
    CELL_STATES,
    GAME_PHASES,
    ERROR_TYPES,
    GameError
} = require('./script.js');

// Simple test runner for Node.js environment
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(description, testFn) {
        this.tests.push({ description, testFn });
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
                }
            },
            toThrow: (expectedError) => {
                let threw = false;
                let error = null;
                try {
                    actual();
                } catch (e) {
                    threw = true;
                    error = e;
                }
                if (!threw) {
                    throw new Error('Expected function to throw an error');
                }
                if (expectedError && !(error instanceof expectedError)) {
                    throw new Error(`Expected error of type ${expectedError.name}, but got ${error.constructor.name}`);
                }
            },
            toHaveLength: (expected) => {
                if (actual.length !== expected) {
                    throw new Error(`Expected length ${expected}, but got ${actual.length}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, but got ${actual}`);
                }
            },
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Expected falsy value, but got ${actual}`);
                }
            }
        };
    }

    run() {
        console.log('Running GameState tests...\n');
        
        for (const { description, testFn } of this.tests) {
            try {
                testFn();
                console.log(`✓ ${description}`);
                this.passed++;
            } catch (error) {
                console.log(`✗ ${description}`);
                console.log(`  Error: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

// Create test runner instance
const runner = new TestRunner();

// Test GameState initialization
runner.test('GameState should initialize with default values', () => {
    const gameState = new GameState();
    const state = gameState.getState();
    
    runner.expect(state.boardSize).toBe(5);
    runner.expect(state.maxRounds).toBe(8);
    runner.expect(state.currentRound).toBe(1);
    runner.expect(state.gamePhase).toBe(GAME_PHASES.WAITING);
    runner.expect(state.playerMoves).toHaveLength(0);
    runner.expect(state.computerMoves).toHaveLength(0);
    runner.expect(state.completedLines).toHaveLength(0);
    runner.expect(state.gameStarted).toBeFalsy();
    runner.expect(state.gameEnded).toBeFalsy();
});

// Test board initialization
runner.test('GameState should initialize empty board correctly', () => {
    const gameState = new GameState();
    const state = gameState.getState();
    
    runner.expect(state.board).toHaveLength(5);
    runner.expect(state.board[0]).toHaveLength(5);
    
    // Check all cells are empty
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            runner.expect(state.board[row][col]).toBe(CELL_STATES.EMPTY);
        }
    }
});

// Test game start
runner.test('startGame should set correct initial state', () => {
    const gameState = new GameState();
    gameState.startGame();
    const state = gameState.getState();
    
    runner.expect(state.gameStarted).toBeTruthy();
    runner.expect(state.gamePhase).toBe(GAME_PHASES.PLAYER_TURN);
    runner.expect(state.currentRound).toBe(1);
});

// Test valid position checking
runner.test('isValidPosition should work correctly', () => {
    const gameState = new GameState();
    
    runner.expect(gameState.isValidPosition(0, 0)).toBeTruthy();
    runner.expect(gameState.isValidPosition(4, 4)).toBeTruthy();
    runner.expect(gameState.isValidPosition(2, 3)).toBeTruthy();
    runner.expect(gameState.isValidPosition(-1, 0)).toBeFalsy();
    runner.expect(gameState.isValidPosition(0, -1)).toBeFalsy();
    runner.expect(gameState.isValidPosition(5, 0)).toBeFalsy();
    runner.expect(gameState.isValidPosition(0, 5)).toBeFalsy();
});

// Test cell empty checking
runner.test('isCellEmpty should work correctly', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    runner.expect(gameState.isCellEmpty(0, 0)).toBeTruthy();
    runner.expect(gameState.isCellEmpty(4, 4)).toBeTruthy();
    
    // Make a move and check
    gameState.makePlayerMove(0, 0);
    runner.expect(gameState.isCellEmpty(0, 0)).toBeFalsy();
});

// Test player move
runner.test('makePlayerMove should work correctly', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    const result = gameState.makePlayerMove(1, 2);
    const state = gameState.getState();
    
    runner.expect(result).toBeTruthy();
    runner.expect(state.board[1][2]).toBe(CELL_STATES.PLAYER);
    runner.expect(state.playerMoves).toHaveLength(1);
    runner.expect(state.playerMoves[0]).toEqual({ row: 1, col: 2, round: 1 });
    runner.expect(state.gamePhase).toBe(GAME_PHASES.COMPUTER_TURN);
});

// Test computer move
runner.test('makeComputerMove should work correctly', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    // Make player move first
    gameState.makePlayerMove(0, 0);
    
    const result = gameState.makeComputerMove(1, 1);
    const state = gameState.getState();
    
    runner.expect(result).toBeTruthy();
    runner.expect(state.board[1][1]).toBe(CELL_STATES.COMPUTER);
    runner.expect(state.computerMoves).toHaveLength(1);
    runner.expect(state.computerMoves[0]).toEqual({ row: 1, col: 1, round: 1 });
    runner.expect(state.currentRound).toBe(2);
    runner.expect(state.gamePhase).toBe(GAME_PHASES.PLAYER_TURN);
});

// Test round advancement
runner.test('should advance rounds correctly', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    // Play through several rounds
    for (let round = 1; round <= 3; round++) {
        gameState.makePlayerMove(round - 1, 0);
        gameState.makeComputerMove(round - 1, 1);
        
        const state = gameState.getState();
        runner.expect(state.currentRound).toBe(round + 1);
    }
});

// Test game completion
runner.test('should end game after max rounds', () => {
    const gameState = new GameState(5, 2); // Only 2 rounds for quick test
    gameState.startGame();
    
    // Play 2 complete rounds
    gameState.makePlayerMove(0, 0);
    gameState.makeComputerMove(0, 1);
    gameState.makePlayerMove(1, 0);
    gameState.makeComputerMove(1, 1);
    
    const state = gameState.getState();
    runner.expect(state.gamePhase).toBe(GAME_PHASES.GAME_OVER);
    runner.expect(state.gameEnded).toBeTruthy();
    runner.expect(gameState.isGameComplete()).toBeTruthy();
});

// Test error handling - invalid move before game start
runner.test('should throw error for moves before game starts', () => {
    const gameState = new GameState();
    
    runner.expect(() => gameState.makePlayerMove(0, 0)).toThrow(GameError);
});

// Test error handling - invalid position
runner.test('should throw error for invalid positions', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    runner.expect(() => gameState.makePlayerMove(-1, 0)).toThrow(GameError);
    runner.expect(() => gameState.makePlayerMove(5, 0)).toThrow(GameError);
});

// Test error handling - occupied cell
runner.test('should throw error for occupied cells', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    gameState.makePlayerMove(0, 0);
    runner.expect(() => gameState.makePlayerMove(0, 0)).toThrow(GameError);
});

// Test error handling - wrong phase
runner.test('should throw error for moves in wrong phase', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    // Try computer move during player turn
    runner.expect(() => gameState.makeComputerMove(0, 0)).toThrow(GameError);
    
    // Make player move, then try another player move
    gameState.makePlayerMove(0, 0);
    runner.expect(() => gameState.makePlayerMove(1, 1)).toThrow(GameError);
});

// Test reset functionality
runner.test('reset should restore initial state', () => {
    const gameState = new GameState();
    gameState.startGame();
    gameState.makePlayerMove(0, 0);
    
    gameState.reset();
    const state = gameState.getState();
    
    runner.expect(state.gameStarted).toBeFalsy();
    runner.expect(state.gamePhase).toBe(GAME_PHASES.WAITING);
    runner.expect(state.currentRound).toBe(1);
    runner.expect(state.playerMoves).toHaveLength(0);
    runner.expect(state.computerMoves).toHaveLength(0);
    runner.expect(state.board[0][0]).toBe(CELL_STATES.EMPTY);
});

// Test getEmptyCells
runner.test('getEmptyCells should return correct empty cells', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    let emptyCells = gameState.getEmptyCells();
    runner.expect(emptyCells).toHaveLength(25); // 5x5 = 25 cells
    
    gameState.makePlayerMove(0, 0);
    gameState.makeComputerMove(1, 1);
    
    emptyCells = gameState.getEmptyCells();
    runner.expect(emptyCells).toHaveLength(23); // 25 - 2 = 23 cells
});

// Test getCellState
runner.test('getCellState should return correct cell states', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    runner.expect(gameState.getCellState(0, 0)).toBe(CELL_STATES.EMPTY);
    runner.expect(gameState.getCellState(-1, 0)).toBe(null);
    
    gameState.makePlayerMove(0, 0);
    runner.expect(gameState.getCellState(0, 0)).toBe(CELL_STATES.PLAYER);
    
    gameState.makeComputerMove(1, 1);
    runner.expect(gameState.getCellState(1, 1)).toBe(CELL_STATES.COMPUTER);
});

// Test game statistics
runner.test('getGameStats should return correct statistics', () => {
    const gameState = new GameState();
    gameState.startGame();
    
    gameState.makePlayerMove(0, 0);
    gameState.makeComputerMove(1, 1);
    
    const stats = gameState.getGameStats();
    runner.expect(stats.totalRounds).toBe(8);
    runner.expect(stats.currentRound).toBe(2);
    runner.expect(stats.playerMovesCount).toBe(1);
    runner.expect(stats.computerMovesCount).toBe(1);
    runner.expect(stats.emptyCellsCount).toBe(23);
});

// Test updateCompletedLines
runner.test('updateCompletedLines should update completed lines', () => {
    const gameState = new GameState();
    const testLines = [
        { type: 'horizontal', row: 0, cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] }
    ];
    
    gameState.updateCompletedLines(testLines);
    const state = gameState.getState();
    
    runner.expect(state.completedLines).toHaveLength(1);
    runner.expect(state.completedLines[0]).toEqual(testLines[0]);
});

// Run all tests
if (require.main === module) {
    const success = runner.run();
    process.exit(success ? 0 : 1);
}

module.exports = { TestRunner };