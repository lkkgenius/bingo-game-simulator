/**
 * Common utilities unit tests
 * Tests for shared utility functions and constants
 */
const { CONSTANTS, Utils, GameError } = require('./common.js');

describe('Common Utilities', () => {
  let testBoard;
  
  beforeEach = () => {
    testBoard = Utils.createEmptyBoard();
  };

  describe('CONSTANTS', () => {
    test('should have correct board size', () => {
      expect(CONSTANTS.BOARD_SIZE).toBe(5);
    });

    test('should have correct max rounds', () => {
      expect(CONSTANTS.MAX_ROUNDS).toBe(8);
    });

    test('should have correct cell states', () => {
      expect(CONSTANTS.CELL_STATES.EMPTY).toBe(0);
      expect(CONSTANTS.CELL_STATES.PLAYER).toBe(1);
      expect(CONSTANTS.CELL_STATES.COMPUTER).toBe(2);
    });
  });

  describe('Utils.isValidPosition', () => {
    test('should validate correct positions', () => {
      expect(Utils.isValidPosition(0, 0)).toBeTruthy();
      expect(Utils.isValidPosition(2, 2)).toBeTruthy();
      expect(Utils.isValidPosition(4, 4)).toBeTruthy();
    });

    test('should reject invalid positions', () => {
      expect(Utils.isValidPosition(-1, 0)).toBeFalsy();
      expect(Utils.isValidPosition(0, -1)).toBeFalsy();
      expect(Utils.isValidPosition(5, 0)).toBeFalsy();
      expect(Utils.isValidPosition(0, 5)).toBeFalsy();
      expect(Utils.isValidPosition(10, 10)).toBeFalsy();
    });

    test('should work with custom board size', () => {
      expect(Utils.isValidPosition(2, 2, 3)).toBeTruthy();
      expect(Utils.isValidPosition(3, 3, 3)).toBeFalsy();
    });
  });

  describe('Utils.isCellEmpty', () => {
    test('should detect empty cells', () => {
      expect(Utils.isCellEmpty(testBoard, 0, 0)).toBeTruthy();
      expect(Utils.isCellEmpty(testBoard, 2, 2)).toBeTruthy();
    });

    test('should detect occupied cells', () => {
      testBoard[0][0] = CONSTANTS.CELL_STATES.PLAYER;
      testBoard[1][1] = CONSTANTS.CELL_STATES.COMPUTER;
      
      expect(Utils.isCellEmpty(testBoard, 0, 0)).toBeFalsy();
      expect(Utils.isCellEmpty(testBoard, 1, 1)).toBeFalsy();
    });

    test('should handle invalid positions', () => {
      expect(Utils.isCellEmpty(testBoard, -1, 0)).toBeFalsy();
      expect(Utils.isCellEmpty(testBoard, 5, 5)).toBeFalsy();
    });
  });

  describe('Utils.createEmptyBoard', () => {
    test('should create correct size board', () => {
      const board = Utils.createEmptyBoard();
      expect(board).toHaveLength(5);
      expect(board[0]).toHaveLength(5);
    });

    test('should create board with all empty cells', () => {
      const board = Utils.createEmptyBoard();
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          expect(board[row][col]).toBe(CONSTANTS.CELL_STATES.EMPTY);
        }
      }
    });

    test('should create custom size board', () => {
      const board = Utils.createEmptyBoard(3);
      expect(board).toHaveLength(3);
      expect(board[0]).toHaveLength(3);
    });
  });

  describe('Utils.copyBoard', () => {
    test('should create deep copy', () => {
      testBoard[0][0] = CONSTANTS.CELL_STATES.PLAYER;
      const copy = Utils.copyBoard(testBoard);
      
      expect(copy[0][0]).toBe(CONSTANTS.CELL_STATES.PLAYER);
      
      // Modify original
      testBoard[0][0] = CONSTANTS.CELL_STATES.COMPUTER;
      
      // Copy should remain unchanged
      expect(copy[0][0]).toBe(CONSTANTS.CELL_STATES.PLAYER);
    });

    test('should handle empty board', () => {
      const copy = Utils.copyBoard(testBoard);
      expect(copy).toEqual(testBoard);
      expect(copy !== testBoard).toBeTruthy(); // Different reference
    });
  });

  describe('Utils.getBoardHash', () => {
    test('should generate consistent hash', () => {
      const hash1 = Utils.getBoardHash(testBoard);
      const hash2 = Utils.getBoardHash(testBoard);
      expect(hash1).toBe(hash2);
    });

    test('should generate different hash for different boards', () => {
      const board1 = Utils.createEmptyBoard();
      const board2 = Utils.createEmptyBoard();
      board2[0][0] = CONSTANTS.CELL_STATES.PLAYER;
      
      const hash1 = Utils.getBoardHash(board1);
      const hash2 = Utils.getBoardHash(board2);
      expect(hash1 !== hash2).toBeTruthy();
    });
  });

  describe('Utils.getEmptyCells', () => {
    test('should find all empty cells in empty board', () => {
      const emptyCells = Utils.getEmptyCells(testBoard);
      expect(emptyCells).toHaveLength(25);
    });

    test('should find correct empty cells in partially filled board', () => {
      testBoard[0][0] = CONSTANTS.CELL_STATES.PLAYER;
      testBoard[1][1] = CONSTANTS.CELL_STATES.COMPUTER;
      
      const emptyCells = Utils.getEmptyCells(testBoard);
      expect(emptyCells).toHaveLength(23);
      
      // Should not include occupied cells
      const occupiedPositions = emptyCells.filter(pos => 
        (pos.row === 0 && pos.col === 0) || (pos.row === 1 && pos.col === 1)
      );
      expect(occupiedPositions).toHaveLength(0);
    });
  });

  describe('Utils.isCenterPosition', () => {
    test('should identify center position', () => {
      expect(Utils.isCenterPosition(2, 2)).toBeTruthy();
    });

    test('should reject non-center positions', () => {
      expect(Utils.isCenterPosition(0, 0)).toBeFalsy();
      expect(Utils.isCenterPosition(1, 2)).toBeFalsy();
      expect(Utils.isCenterPosition(2, 1)).toBeFalsy();
    });

    test('should work with custom board size', () => {
      expect(Utils.isCenterPosition(1, 1, 3)).toBeTruthy();
      expect(Utils.isCenterPosition(2, 2, 3)).toBeFalsy();
    });
  });

  describe('Utils.isValidBoard', () => {
    test('should validate correct board', () => {
      expect(Utils.isValidBoard(testBoard)).toBeTruthy();
    });

    test('should reject wrong size board', () => {
      const wrongSizeBoard = Array(4).fill().map(() => Array(4).fill(0));
      expect(Utils.isValidBoard(wrongSizeBoard)).toBeFalsy();
    });

    test('should reject board with invalid values', () => {
      const invalidBoard = Utils.createEmptyBoard();
      invalidBoard[0][0] = 3; // Invalid cell state
      expect(Utils.isValidBoard(invalidBoard)).toBeFalsy();
    });

    test('should reject non-array input', () => {
      expect(Utils.isValidBoard(null)).toBeFalsy();
      expect(Utils.isValidBoard(undefined)).toBeFalsy();
      expect(Utils.isValidBoard('not an array')).toBeFalsy();
    });
  });

  describe('Utils.getLineCells', () => {
    test('should get horizontal line cells', () => {
      const cells = Utils.getLineCells(2, 0, CONSTANTS.LINE_TYPES.HORIZONTAL);
      expect(cells).toHaveLength(5);
      expect(cells).toEqual([[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]]);
    });

    test('should get vertical line cells', () => {
      const cells = Utils.getLineCells(0, 2, CONSTANTS.LINE_TYPES.VERTICAL);
      expect(cells).toHaveLength(5);
      expect(cells).toEqual([[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]]);
    });

    test('should get main diagonal cells', () => {
      const cells = Utils.getLineCells(0, 0, CONSTANTS.LINE_TYPES.DIAGONAL_MAIN);
      expect(cells).toHaveLength(5);
      expect(cells).toEqual([[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]]);
    });

    test('should get anti-diagonal cells', () => {
      const cells = Utils.getLineCells(0, 4, CONSTANTS.LINE_TYPES.DIAGONAL_ANTI);
      expect(cells).toHaveLength(5);
      expect(cells).toEqual([[0, 4], [1, 3], [2, 2], [3, 1], [4, 0]]);
    });
  });

  describe('Utils.countFilledCells', () => {
    test('should count filled cells correctly', () => {
      testBoard[0][0] = CONSTANTS.CELL_STATES.PLAYER;
      testBoard[0][1] = CONSTANTS.CELL_STATES.COMPUTER;
      
      const cells = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
      expect(Utils.countFilledCells(testBoard, cells)).toBe(2);
    });

    test('should return 0 for all empty cells', () => {
      const cells = [[0, 0], [0, 1], [0, 2]];
      expect(Utils.countFilledCells(testBoard, cells)).toBe(0);
    });
  });

  describe('Utils.countEmptyCells', () => {
    test('should count empty cells correctly', () => {
      testBoard[0][0] = CONSTANTS.CELL_STATES.PLAYER;
      testBoard[0][1] = CONSTANTS.CELL_STATES.COMPUTER;
      
      const cells = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
      expect(Utils.countEmptyCells(testBoard, cells)).toBe(3);
    });

    test('should return total for all empty cells', () => {
      const cells = [[0, 0], [0, 1], [0, 2]];
      expect(Utils.countEmptyCells(testBoard, cells)).toBe(3);
    });
  });

  describe('Utils.debounce', () => {
    test('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = Utils.debounce(() => {
        callCount++;
      }, 50);
      
      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Should not have been called yet
      expect(callCount).toBe(0);
      
      // Wait for debounce delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 60);
    });
  });

  describe('Utils.throttle', () => {
    test('should throttle function calls', (done) => {
      let callCount = 0;
      const throttledFn = Utils.throttle(() => {
        callCount++;
      }, 50);
      
      // First call should execute immediately
      throttledFn();
      expect(callCount).toBe(1);
      
      // Subsequent calls should be throttled
      throttledFn();
      throttledFn();
      expect(callCount).toBe(1);
      
      // Wait for throttle delay
      setTimeout(() => {
        throttledFn();
        expect(callCount).toBe(2);
        done();
      }, 60);
    });
  });

  describe('Utils.formatDuration', () => {
    test('should format milliseconds', () => {
      expect(Utils.formatDuration(500)).toBe('500.00ms');
      expect(Utils.formatDuration(999)).toBe('999.00ms');
    });

    test('should format seconds', () => {
      expect(Utils.formatDuration(1000)).toBe('1.00s');
      expect(Utils.formatDuration(5500)).toBe('5.50s');
    });

    test('should format minutes', () => {
      expect(Utils.formatDuration(60000)).toBe('1m 0.00s');
      expect(Utils.formatDuration(125000)).toBe('2m 5.00s');
    });
  });

  describe('Utils.generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = Utils.generateId();
      const id2 = Utils.generateId();
      
      expect(id1 !== id2).toBeTruthy();
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  describe('Utils.safeJsonParse', () => {
    test('should parse valid JSON', () => {
      const obj = { test: 'value' };
      const json = JSON.stringify(obj);
      const parsed = Utils.safeJsonParse(json);
      
      expect(parsed).toEqual(obj);
    });

    test('should return default value for invalid JSON', () => {
      const defaultValue = { error: true };
      const parsed = Utils.safeJsonParse('invalid json', defaultValue);
      
      expect(parsed).toEqual(defaultValue);
    });

    test('should return null by default for invalid JSON', () => {
      const parsed = Utils.safeJsonParse('invalid json');
      expect(parsed === null).toBeTruthy();
    });
  });

  describe('Utils.safeJsonStringify', () => {
    test('should stringify valid object', () => {
      const obj = { test: 'value' };
      const json = Utils.safeJsonStringify(obj);
      
      expect(json).toBe('{"test":"value"}');
    });

    test('should return default value for circular reference', () => {
      const obj = {};
      obj.circular = obj; // Create circular reference
      
      const json = Utils.safeJsonStringify(obj, '{"error":true}');
      expect(json).toBe('{"error":true}');
    });
  });

  describe('GameError', () => {
    test('should create error with type', () => {
      const error = new GameError('Test message', CONSTANTS.ERROR_TYPES.INVALID_MOVE);
      
      expect(error.message).toBe('Test message');
      expect(error.type).toBe(CONSTANTS.ERROR_TYPES.INVALID_MOVE);
      expect(error.name).toBe('GameError');
      expect(error instanceof Error).toBeTruthy();
    });
  });
});