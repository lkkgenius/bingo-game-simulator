/**
 * Unit tests for common utilities
 * Tests the shared utility functions and constants
 */

// Import the common utilities
let CONSTANTS, Utils, GameError;
if (typeof require !== 'undefined') {
  const common = require('./common.js');
  CONSTANTS = common.CONSTANTS;
  Utils = common.Utils;
  GameError = common.GameError;
} else {
  // Browser environment
  CONSTANTS = window.CONSTANTS;
  Utils = window.Utils;
  GameError = window.GameError;
}

/**
 * Test runner for common utilities
 */
function runCommonUtilsTests() {
  console.log('Running Common Utils Tests...');

  const tests = [
    testConstants,
    testPositionValidation,
    testBoardOperations,
    testLineOperations,
    testCacheOperations,
    testUtilityFunctions,
    testErrorHandling,
    testPerformanceHelpers
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      test();
      console.log(`✓ ${test.name}`);
      passed++;
    } catch (error) {
      console.error(`✗ ${test.name}: ${error.message}`);
      failed++;
    }
  });

  console.log(`\nCommon Utils Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test constants are properly defined
 */
function testConstants() {
  // Test CONSTANTS structure
  if (!CONSTANTS) throw new Error('CONSTANTS not defined');
  if (CONSTANTS.BOARD_SIZE !== 5) throw new Error('BOARD_SIZE should be 5');
  if (CONSTANTS.MAX_ROUNDS !== 8) throw new Error('MAX_ROUNDS should be 8');

  // Test CELL_STATES
  if (!CONSTANTS.CELL_STATES) throw new Error('CELL_STATES not defined');
  if (CONSTANTS.CELL_STATES.EMPTY !== 0) throw new Error('EMPTY should be 0');
  if (CONSTANTS.CELL_STATES.PLAYER !== 1) throw new Error('PLAYER should be 1');
  if (CONSTANTS.CELL_STATES.COMPUTER !== 2)
    throw new Error('COMPUTER should be 2');

  // Test GAME_PHASES
  if (!CONSTANTS.GAME_PHASES) throw new Error('GAME_PHASES not defined');
  if (!CONSTANTS.GAME_PHASES.WAITING)
    throw new Error('WAITING phase not defined');
  if (!CONSTANTS.GAME_PHASES.PLAYER_TURN)
    throw new Error('PLAYER_TURN phase not defined');

  // Test LINE_TYPES
  if (!CONSTANTS.LINE_TYPES) throw new Error('LINE_TYPES not defined');
  if (!CONSTANTS.LINE_TYPES.HORIZONTAL)
    throw new Error('HORIZONTAL line type not defined');
  if (!CONSTANTS.LINE_TYPES.VERTICAL)
    throw new Error('VERTICAL line type not defined');

  // Test ALGORITHM_WEIGHTS
  if (!CONSTANTS.ALGORITHM_WEIGHTS)
    throw new Error('ALGORITHM_WEIGHTS not defined');
  if (!CONSTANTS.ALGORITHM_WEIGHTS.STANDARD)
    throw new Error('STANDARD weights not defined');
  if (!CONSTANTS.ALGORITHM_WEIGHTS.ENHANCED)
    throw new Error('ENHANCED weights not defined');
}

/**
 * Test position validation functions
 */
function testPositionValidation() {
  // Test valid positions
  if (!Utils.isValidPosition(0, 0)) throw new Error('(0,0) should be valid');
  if (!Utils.isValidPosition(2, 2)) throw new Error('(2,2) should be valid');
  if (!Utils.isValidPosition(4, 4)) throw new Error('(4,4) should be valid');

  // Test invalid positions
  if (Utils.isValidPosition(-1, 0)) throw new Error('(-1,0) should be invalid');
  if (Utils.isValidPosition(0, -1)) throw new Error('(0,-1) should be invalid');
  if (Utils.isValidPosition(5, 0)) throw new Error('(5,0) should be invalid');
  if (Utils.isValidPosition(0, 5)) throw new Error('(0,5) should be invalid');

  // Test center position
  if (!Utils.isCenterPosition(2, 2)) throw new Error('(2,2) should be center');
  if (Utils.isCenterPosition(0, 0))
    throw new Error('(0,0) should not be center');
  if (Utils.isCenterPosition(1, 2))
    throw new Error('(1,2) should not be center');
}

/**
 * Test board operations
 */
function testBoardOperations() {
  // Test empty board creation
  const board = Utils.createEmptyBoard();
  if (!Array.isArray(board)) throw new Error('Board should be an array');
  if (board.length !== 5) throw new Error('Board should have 5 rows');
  if (board[0].length !== 5) throw new Error('Board should have 5 columns');
  if (board[2][2] !== CONSTANTS.CELL_STATES.EMPTY)
    throw new Error('Board should be empty');

  // Test board copying
  board[1][1] = CONSTANTS.CELL_STATES.PLAYER;
  const copiedBoard = Utils.copyBoard(board);
  if (copiedBoard[1][1] !== CONSTANTS.CELL_STATES.PLAYER)
    throw new Error('Board copy failed');

  // Modify original to test deep copy
  board[1][1] = CONSTANTS.CELL_STATES.COMPUTER;
  if (copiedBoard[1][1] !== CONSTANTS.CELL_STATES.PLAYER)
    throw new Error('Board copy should be deep');

  // Test board validation
  if (!Utils.isValidBoard(board))
    throw new Error('Valid board should pass validation');

  const invalidBoard = [[0, 1], [2]]; // Wrong dimensions
  if (Utils.isValidBoard(invalidBoard))
    throw new Error('Invalid board should fail validation');

  // Test cell checking
  if (!Utils.isCellEmpty(board, 0, 0))
    throw new Error('Empty cell should be detected');
  if (Utils.isCellEmpty(board, 1, 1))
    throw new Error('Occupied cell should be detected');

  // Test empty cells retrieval
  const emptyCells = Utils.getEmptyCells(board);
  if (!Array.isArray(emptyCells))
    throw new Error('Empty cells should be an array');
  if (emptyCells.length !== 24) throw new Error('Should have 24 empty cells'); // 25 - 1 occupied

  // Test board hash
  const hash = Utils.getBoardHash(board);
  if (typeof hash !== 'string')
    throw new Error('Board hash should be a string');
  if (hash.length !== 25)
    throw new Error('Board hash should have 25 characters');
}

/**
 * Test line operations
 */
function testLineOperations() {
  const board = Utils.createEmptyBoard();

  // Test line cells retrieval
  const horizontalCells = Utils.getLineCells(
    2,
    2,
    CONSTANTS.LINE_TYPES.HORIZONTAL
  );
  if (horizontalCells.length !== 5)
    throw new Error('Horizontal line should have 5 cells');
  if (horizontalCells[0][0] !== 2)
    throw new Error('Horizontal line should be on row 2');

  const verticalCells = Utils.getLineCells(2, 2, CONSTANTS.LINE_TYPES.VERTICAL);
  if (verticalCells.length !== 5)
    throw new Error('Vertical line should have 5 cells');
  if (verticalCells[0][1] !== 2)
    throw new Error('Vertical line should be on column 2');

  const diagonalCells = Utils.getLineCells(
    2,
    2,
    CONSTANTS.LINE_TYPES.DIAGONAL_MAIN
  );
  if (diagonalCells.length !== 5)
    throw new Error('Diagonal line should have 5 cells');
  if (diagonalCells[2][0] !== 2 || diagonalCells[2][1] !== 2)
    throw new Error('Diagonal should pass through (2,2)');

  // Test line completion
  if (Utils.isLineComplete(board, horizontalCells))
    throw new Error('Empty line should not be complete');

  // Fill horizontal line
  for (const [row, col] of horizontalCells) {
    board[row][col] = CONSTANTS.CELL_STATES.PLAYER;
  }

  if (!Utils.isLineComplete(board, horizontalCells))
    throw new Error('Filled line should be complete');

  // Test cell counting
  if (Utils.countFilledCells(board, horizontalCells) !== 5)
    throw new Error('Should count 5 filled cells');
  if (Utils.countEmptyCells(board, horizontalCells) !== 0)
    throw new Error('Should count 0 empty cells');

  const mixedCells = Utils.getLineCells(1, 1, CONSTANTS.LINE_TYPES.HORIZONTAL);
  if (Utils.countFilledCells(board, mixedCells) !== 0)
    throw new Error('Should count 0 filled cells in empty line');
  if (Utils.countEmptyCells(board, mixedCells) !== 5)
    throw new Error('Should count 5 empty cells in empty line');

  // Test relevant line types
  const centerLines = Utils.getRelevantLineTypes(2, 2);
  if (centerLines.length !== 4)
    throw new Error('Center should have 4 relevant lines');

  const cornerLines = Utils.getRelevantLineTypes(0, 0);
  if (cornerLines.length !== 3)
    throw new Error('Corner should have 3 relevant lines');

  const edgeLines = Utils.getRelevantLineTypes(0, 2);
  if (edgeLines.length !== 2)
    throw new Error('Edge should have 2 relevant lines');
}

/**
 * Test cache operations
 */
function testCacheOperations() {
  // Test memoization
  let callCount = 0;
  const expensiveFunction = (x, y) => {
    callCount++;
    return x + y;
  };

  const memoized = Utils.memoize(expensiveFunction, (x, y) => `${x}-${y}`, 3);

  // First call should execute function
  const result1 = memoized(1, 2);
  if (result1 !== 3)
    throw new Error('Memoized function should return correct result');
  if (callCount !== 1) throw new Error('Function should be called once');

  // Second call with same args should use cache
  const result2 = memoized(1, 2);
  if (result2 !== 3) throw new Error('Cached result should be correct');
  if (callCount !== 1) throw new Error('Function should not be called again');

  // Different args should call function
  const result3 = memoized(2, 3);
  if (result3 !== 5) throw new Error('New args should return correct result');
  if (callCount !== 2)
    throw new Error('Function should be called for new args');

  // Test cache size limit
  memoized(3, 4); // callCount = 3
  memoized(4, 5); // callCount = 4, should evict first entry
  memoized(1, 2); // Should call function again since evicted
  if (callCount !== 6) throw new Error('Cache eviction should work');
}

/**
 * Test utility functions
 */
function testUtilityFunctions() {
  // Test input validation
  if (Utils.validateInput(42, 'number') !== 42)
    throw new Error('Valid number should pass');
  if (Utils.validateInput('hello', 'number', 0) !== 0)
    throw new Error('Invalid number should return default');
  if (Utils.validateInput('hello', 'string') !== 'hello')
    throw new Error('Valid string should pass');
  if (Utils.validateInput(42, 'string', 'default') !== 'default')
    throw new Error('Invalid string should return default');

  // Test deep clone
  const original = { a: 1, b: { c: 2 }, d: [3, 4] };
  const cloned = Utils.deepClone(original);

  if (cloned.a !== 1) throw new Error('Simple property should be cloned');
  if (cloned.b.c !== 2) throw new Error('Nested property should be cloned');
  if (cloned.d[0] !== 3) throw new Error('Array should be cloned');

  // Test deep clone independence
  cloned.b.c = 99;
  if (original.b.c === 99) throw new Error('Deep clone should be independent');

  // Test confidence calculation
  const moves = [{ value: 100 }, { value: 50 }, { value: 10 }];

  const confidence = Utils.calculateConfidenceLevel(
    moves,
    CONSTANTS.ALGORITHM_WEIGHTS.STANDARD
  );
  if (confidence !== 'very-high')
    throw new Error('Large difference should give very-high confidence');

  // Test debounce
  let debounceCount = 0;
  const debouncedFn = Utils.debounce(() => debounceCount++, 50);

  debouncedFn();
  debouncedFn();
  debouncedFn();

  // Should not have executed yet
  if (debounceCount !== 0)
    throw new Error('Debounced function should not execute immediately');

  // Test throttle
  let throttleCount = 0;
  const throttledFn = Utils.throttle(() => throttleCount++, 50);

  throttledFn();
  throttledFn();
  throttledFn();

  // Should execute once immediately
  if (throttleCount !== 1)
    throw new Error('Throttled function should execute once immediately');

  // Test format duration
  if (Utils.formatDuration(500) !== '500.00ms')
    throw new Error('Milliseconds should format correctly');
  if (Utils.formatDuration(1500) !== '1.50s')
    throw new Error('Seconds should format correctly');

  // Test generate ID
  const id1 = Utils.generateId();
  const id2 = Utils.generateId();
  if (typeof id1 !== 'string') throw new Error('ID should be a string');
  if (id1 === id2) throw new Error('IDs should be unique');
}

/**
 * Test error handling
 */
function testErrorHandling() {
  // Test GameError class
  const error = new GameError('Test error', 'test-type');
  if (error.name !== 'GameError')
    throw new Error('Error name should be GameError');
  if (error.message !== 'Test error')
    throw new Error('Error message should be preserved');
  if (error.type !== 'test-type')
    throw new Error('Error type should be preserved');

  // Test safe JSON operations
  const validJson = '{"test": "value"}';
  const parsed = Utils.safeJsonParse(validJson);
  if (parsed.test !== 'value')
    throw new Error('Valid JSON should parse correctly');

  const invalidJson = '{"invalid": json}';
  const defaultParsed = Utils.safeJsonParse(invalidJson, { default: true });
  if (!defaultParsed.default)
    throw new Error('Invalid JSON should return default');

  const obj = { test: 'value' };
  const stringified = Utils.safeJsonStringify(obj);
  if (stringified !== '{"test":"value"}')
    throw new Error('Object should stringify correctly');

  // Test circular reference handling
  const circular = { a: 1 };
  circular.self = circular;
  const circularStringified = Utils.safeJsonStringify(circular, '{}');
  if (circularStringified !== '{}')
    throw new Error('Circular reference should return default');
}

/**
 * Test performance helpers
 */
function testPerformanceHelpers() {
  // Test format duration with various inputs
  if (Utils.formatDuration(0) !== '0.00ms')
    throw new Error('Zero duration should format correctly');
  if (Utils.formatDuration(999) !== '999.00ms')
    throw new Error('Sub-second should format as ms');
  if (Utils.formatDuration(1000) !== '1.00s')
    throw new Error('One second should format as s');
  if (Utils.formatDuration(65000) !== '1m 5.00s')
    throw new Error('Minutes should format correctly');

  // Test ID generation uniqueness
  const ids = new Set();
  for (let i = 0; i < 100; i++) {
    ids.add(Utils.generateId());
  }
  if (ids.size !== 100) throw new Error('Generated IDs should be unique');
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && require.main === module) {
  runCommonUtilsTests();
}

// Export for both environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runCommonUtilsTests };
} else if (typeof window !== 'undefined') {
  window.runCommonUtilsTests = runCommonUtilsTests;
}
