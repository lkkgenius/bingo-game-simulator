/**
 * Unit tests for BaseProbabilityCalculator
 * Tests the shared base functionality for probability calculators
 */

// Import dependencies
let BaseProbabilityCalculator, CONSTANTS, Utils;
if (typeof require !== 'undefined') {
  BaseProbabilityCalculator = require('./baseProbabilityCalculator.js');
  const common = require('./common.js');
  CONSTANTS = common.CONSTANTS;
  Utils = common.Utils;
} else {
  // Browser environment
  BaseProbabilityCalculator = window.BaseProbabilityCalculator;
  CONSTANTS = window.CONSTANTS;
  Utils = window.Utils;
}

/**
 * Concrete implementation for testing abstract base class
 */
class TestProbabilityCalculator extends BaseProbabilityCalculator {
  calculateMoveValue(board, row, col) {
    if (!this.isValidMove(board, row, col)) {
      return -1;
    }

    const testBoard = this.copyBoard(board);
    testBoard[row][col] = this.CELL_STATES.PLAYER;

    let value = 0;
    value += this.calculateBasicCompletionValue(testBoard, row, col);
    value += this.calculateCooperativeValue(board, row, col);
    value += this.calculatePotentialValue(testBoard, row, col);

    if (this.isCenterPosition(row, col)) {
      value += this.WEIGHTS.CENTER_BONUS;
    }

    return value;
  }
}

/**
 * Test runner for BaseProbabilityCalculator
 */
function runBaseProbabilityCalculatorTests() {
  console.log('Running BaseProbabilityCalculator Tests...');

  const tests = [
    testConstructor,
    testBoardOperations,
    testMoveValidation,
    testLineOperations,
    testCacheOperations,
    testPerformanceMetrics,
    testMoveSimulation,
    testSuggestionGeneration,
    testAbstractMethods
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

  console.log(
    `\nBaseProbabilityCalculator Tests: ${passed} passed, ${failed} failed`
  );
  return { passed, failed };
}

/**
 * Test constructor and initialization
 */
function testConstructor() {
  const calculator = new TestProbabilityCalculator();

  // Test basic properties
  if (calculator.BOARD_SIZE !== 5) throw new Error('BOARD_SIZE should be 5');
  if (!calculator.CELL_STATES) throw new Error('CELL_STATES should be defined');
  if (!calculator.LINE_TYPES) throw new Error('LINE_TYPES should be defined');
  if (!calculator.WEIGHTS) throw new Error('WEIGHTS should be defined');

  // Test cache initialization
  if (!calculator._valueCache)
    throw new Error('Value cache should be initialized');
  if (!calculator._lineCache)
    throw new Error('Line cache should be initialized');

  // Test performance metrics initialization
  const metrics = calculator.getPerformanceMetrics();
  if (typeof metrics.cacheHits !== 'number')
    throw new Error('Cache hits should be a number');
  if (typeof metrics.cacheMisses !== 'number')
    throw new Error('Cache misses should be a number');
}

/**
 * Test board operations
 */
function testBoardOperations() {
  const calculator = new TestProbabilityCalculator();

  // Test board validation
  const validBoard = Utils.createEmptyBoard();
  if (!calculator.isValidBoard(validBoard))
    throw new Error('Valid board should pass validation');

  const invalidBoard = [[0, 1], [2]]; // Wrong dimensions
  if (calculator.isValidBoard(invalidBoard))
    throw new Error('Invalid board should fail validation');

  // Test board copying
  validBoard[1][1] = CONSTANTS.CELL_STATES.PLAYER;
  const copiedBoard = calculator.copyBoard(validBoard);
  if (copiedBoard[1][1] !== CONSTANTS.CELL_STATES.PLAYER)
    throw new Error('Board copy should preserve values');

  // Test independence of copy
  validBoard[1][1] = CONSTANTS.CELL_STATES.COMPUTER;
  if (copiedBoard[1][1] !== CONSTANTS.CELL_STATES.PLAYER)
    throw new Error('Board copy should be independent');

  // Test empty cells retrieval
  const emptyCells = calculator.getEmptyCells(validBoard);
  if (emptyCells.length !== 24) throw new Error('Should have 24 empty cells'); // 25 - 1 occupied

  // Test board hash
  const hash = calculator.getBoardHash(validBoard);
  if (typeof hash !== 'string')
    throw new Error('Board hash should be a string');
  if (hash.length !== 25)
    throw new Error('Board hash should have 25 characters');
}

/**
 * Test move validation
 */
function testMoveValidation() {
  const calculator = new TestProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // Test valid moves
  if (!calculator.isValidMove(board, 0, 0))
    throw new Error('(0,0) should be valid');
  if (!calculator.isValidMove(board, 2, 2))
    throw new Error('(2,2) should be valid');
  if (!calculator.isValidMove(board, 4, 4))
    throw new Error('(4,4) should be valid');

  // Test invalid positions
  if (calculator.isValidMove(board, -1, 0))
    throw new Error('(-1,0) should be invalid');
  if (calculator.isValidMove(board, 0, -1))
    throw new Error('(0,-1) should be invalid');
  if (calculator.isValidMove(board, 5, 0))
    throw new Error('(5,0) should be invalid');
  if (calculator.isValidMove(board, 0, 5))
    throw new Error('(0,5) should be invalid');

  // Test occupied cells
  board[1][1] = CONSTANTS.CELL_STATES.PLAYER;
  if (calculator.isValidMove(board, 1, 1))
    throw new Error('Occupied cell should be invalid');

  // Test center position detection
  if (!calculator.isCenterPosition(2, 2))
    throw new Error('(2,2) should be center');
  if (calculator.isCenterPosition(0, 0))
    throw new Error('(0,0) should not be center');
}

/**
 * Test line operations
 */
function testLineOperations() {
  const calculator = new TestProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // Test line cells retrieval
  const horizontalCells = calculator.getLineCells(
    2,
    2,
    CONSTANTS.LINE_TYPES.HORIZONTAL
  );
  if (horizontalCells.length !== 5)
    throw new Error('Horizontal line should have 5 cells');

  const verticalCells = calculator.getLineCells(
    2,
    2,
    CONSTANTS.LINE_TYPES.VERTICAL
  );
  if (verticalCells.length !== 5)
    throw new Error('Vertical line should have 5 cells');

  // Test relevant lines
  const centerLines = calculator.getRelevantLines(2, 2);
  if (centerLines.length !== 4)
    throw new Error('Center should have 4 relevant lines');

  const cornerLines = calculator.getRelevantLines(0, 0);
  if (cornerLines.length !== 3)
    throw new Error('Corner should have 3 relevant lines');

  // Test line completion
  if (calculator.isLineComplete(board, horizontalCells))
    throw new Error('Empty line should not be complete');

  // Fill horizontal line
  for (const [row, col] of horizontalCells) {
    board[row][col] = CONSTANTS.CELL_STATES.PLAYER;
  }

  if (!calculator.isLineComplete(board, horizontalCells))
    throw new Error('Filled line should be complete');

  // Test cell counting
  if (calculator.countFilledCells(board, horizontalCells) !== 5)
    throw new Error('Should count 5 filled cells');
  if (calculator.countEmptyCells(board, horizontalCells) !== 0)
    throw new Error('Should count 0 empty cells');

  // Test line completion check
  if (
    !calculator.checkLineCompletion(
      board,
      2,
      2,
      CONSTANTS.LINE_TYPES.HORIZONTAL
    )
  ) {
    throw new Error('Completed horizontal line should be detected');
  }
}

/**
 * Test cache operations
 */
function testCacheOperations() {
  const calculator = new TestProbabilityCalculator();

  // Test cache miss
  const key = 'test-key';
  const cachedValue = calculator._getCachedValue(key);
  if (cachedValue !== undefined)
    throw new Error('Cache miss should return undefined');

  // Test cache set and get
  const testValue = 42;
  calculator._setCachedValue(key, testValue);
  const retrievedValue = calculator._getCachedValue(key);
  if (retrievedValue !== testValue)
    throw new Error('Cached value should be retrievable');

  // Test cache clear
  calculator.clearCache();
  const clearedValue = calculator._getCachedValue(key);
  if (clearedValue !== undefined) throw new Error('Cache should be cleared');

  // Test cache size limit
  const maxSize = calculator._maxCacheSize;
  for (let i = 0; i <= maxSize; i++) {
    calculator._setCachedValue(`key-${i}`, i);
  }

  // First key should be evicted
  const evictedValue = calculator._getCachedValue('key-0');
  if (evictedValue !== undefined)
    throw new Error('Cache should evict old entries');
}

/**
 * Test performance metrics
 */
function testPerformanceMetrics() {
  const calculator = new TestProbabilityCalculator();

  // Initial metrics
  let metrics = calculator.getPerformanceMetrics();
  if (metrics.cacheHits !== 0)
    throw new Error('Initial cache hits should be 0');
  if (metrics.cacheMisses !== 0)
    throw new Error('Initial cache misses should be 0');

  // Generate cache miss
  calculator._getCachedValue('non-existent');
  metrics = calculator.getPerformanceMetrics();
  if (metrics.cacheMisses !== 1)
    throw new Error('Cache miss should be recorded');

  // Generate cache hit
  calculator._setCachedValue('test', 'value');
  calculator._getCachedValue('test');
  metrics = calculator.getPerformanceMetrics();
  if (metrics.cacheHits !== 1) throw new Error('Cache hit should be recorded');

  // Test metrics reset
  calculator.resetPerformanceMetrics();
  metrics = calculator.getPerformanceMetrics();
  if (metrics.cacheHits !== 0) throw new Error('Metrics should be reset');
  if (metrics.cacheMisses !== 0) throw new Error('Metrics should be reset');
}

/**
 * Test move simulation
 */
function testMoveSimulation() {
  const calculator = new TestProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // Test empty board simulation
  const moves = calculator.simulateAllPossibleMoves(board);
  if (moves.length !== 25)
    throw new Error('Empty board should have 25 possible moves');

  // Test moves are sorted by value
  for (let i = 1; i < moves.length; i++) {
    if (moves[i].value > moves[i - 1].value) {
      throw new Error('Moves should be sorted by value (descending)');
    }
  }

  // Test move structure
  const firstMove = moves[0];
  if (typeof firstMove.row !== 'number')
    throw new Error('Move should have row');
  if (typeof firstMove.col !== 'number')
    throw new Error('Move should have col');
  if (typeof firstMove.value !== 'number')
    throw new Error('Move should have value');
  if (typeof firstMove.position !== 'string')
    throw new Error('Move should have position string');

  // Test with occupied cells
  board[2][2] = CONSTANTS.CELL_STATES.PLAYER;
  const movesWithOccupied = calculator.simulateAllPossibleMoves(board);
  if (movesWithOccupied.length !== 24)
    throw new Error('Board with one occupied cell should have 24 moves');
}

/**
 * Test suggestion generation
 */
function testSuggestionGeneration() {
  const calculator = new TestProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // Test suggestion generation
  const suggestion = calculator.getBestSuggestion(board);
  if (!suggestion)
    throw new Error('Should generate suggestion for empty board');

  // Test suggestion structure
  if (typeof suggestion.row !== 'number')
    throw new Error('Suggestion should have row');
  if (typeof suggestion.col !== 'number')
    throw new Error('Suggestion should have col');
  if (typeof suggestion.value !== 'number')
    throw new Error('Suggestion should have value');
  if (typeof suggestion.confidence !== 'string')
    throw new Error('Suggestion should have confidence');
  if (!Array.isArray(suggestion.alternatives))
    throw new Error('Suggestion should have alternatives');

  // Test confidence levels
  const validConfidences = ['very-high', 'high', 'medium', 'low'];
  if (!validConfidences.includes(suggestion.confidence)) {
    throw new Error('Confidence should be valid level');
  }

  // Test alternatives
  if (suggestion.alternatives.length > 3)
    throw new Error('Should have at most 3 alternatives');

  // Test full board (no suggestions)
  const fullBoard = Array(5)
    .fill()
    .map(() => Array(5).fill(CONSTANTS.CELL_STATES.PLAYER));
  const noSuggestion = calculator.getBestSuggestion(fullBoard);
  if (noSuggestion !== null)
    throw new Error('Full board should have no suggestions');
}

/**
 * Test abstract method enforcement
 */
function testAbstractMethods() {
  // Test that base class throws error for abstract method
  try {
    const baseCalculator = new BaseProbabilityCalculator();
    baseCalculator.calculateMoveValue([[0]], 0, 0);
    throw new Error('Should have thrown error for abstract method');
  } catch (error) {
    if (!error.message.includes('must be implemented by subclass')) {
      throw new Error('Should throw specific error for abstract method');
    }
  }

  // Test that concrete implementation works
  const concreteCalculator = new TestProbabilityCalculator();
  const board = Utils.createEmptyBoard();
  const value = concreteCalculator.calculateMoveValue(board, 2, 2);
  if (typeof value !== 'number')
    throw new Error('Concrete implementation should return number');
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && require.main === module) {
  runBaseProbabilityCalculatorTests();
}

// Export for both environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runBaseProbabilityCalculatorTests,
    TestProbabilityCalculator
  };
} else if (typeof window !== 'undefined') {
  window.runBaseProbabilityCalculatorTests = runBaseProbabilityCalculatorTests;
  window.TestProbabilityCalculator = TestProbabilityCalculator;
}
