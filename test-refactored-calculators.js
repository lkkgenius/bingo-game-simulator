/**
 * Test script for refactored probability calculators
 * Verifies that the refactored calculators work correctly
 */

// Import the calculators
const ProbabilityCalculator = require('./probabilityCalculator.js');
const EnhancedProbabilityCalculator = require('./probabilityCalculator.enhanced.js');
const { CONSTANTS, Utils } = require('./utils/common.js');

/**
 * Test the refactored calculators
 */
function testRefactoredCalculators() {
  console.log('Testing Refactored Probability Calculators...\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    testStandardCalculator,
    testEnhancedCalculator,
    testCalculatorComparison,
    testPerformanceMetrics,
    testCacheEfficiency
  ];

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
    `\nRefactored Calculator Tests: ${passed} passed, ${failed} failed`
  );
  return { passed, failed };
}

/**
 * Test standard probability calculator
 */
function testStandardCalculator() {
  const calculator = new ProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // Test basic functionality
  if (!calculator.isValidMove(board, 2, 2)) {
    throw new Error('Valid move should be recognized');
  }

  // Test move value calculation
  const value = calculator.calculateMoveValue(board, 2, 2);
  if (typeof value !== 'number' || value < 0) {
    throw new Error('Move value should be a positive number');
  }

  // Test suggestion generation
  const suggestion = calculator.getBestSuggestion(board);
  if (!suggestion || typeof suggestion.row !== 'number') {
    throw new Error('Should generate valid suggestion');
  }

  // Test performance metrics
  const metrics = calculator.getPerformanceMetrics();
  if (!metrics || typeof metrics.cacheHitRate !== 'string') {
    throw new Error('Should provide performance metrics');
  }
}

/**
 * Test enhanced probability calculator
 */
function testEnhancedCalculator() {
  const calculator = new EnhancedProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // Test enhanced features
  const centerValue = calculator.calculateIntersectionValue(2, 2);
  if (typeof centerValue !== 'number') {
    throw new Error('Intersection value should be a number');
  }

  // Test near completion calculation
  const testBoard = Utils.copyBoard(board);
  // Fill most of a horizontal line
  for (let col = 0; col < 4; col++) {
    testBoard[2][col] = CONSTANTS.CELL_STATES.PLAYER;
  }

  const nearValue = calculator.calculateNearCompletionValue(testBoard, 2, 4);
  if (nearValue <= 0) {
    throw new Error('Near completion should have positive value');
  }

  // Test multi-line potential
  const multiValue = calculator.calculateMultiLinePotentialValue(
    testBoard,
    2,
    2
  );
  if (typeof multiValue !== 'number') {
    throw new Error('Multi-line potential should be a number');
  }

  // Test enhanced performance metrics
  const metrics = calculator.getPerformanceMetrics();
  if (!metrics.precomputedData) {
    throw new Error('Enhanced metrics should include precomputed data');
  }
}

/**
 * Test calculator comparison
 */
function testCalculatorComparison() {
  const standard = new ProbabilityCalculator();
  const enhanced = new EnhancedProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // Compare suggestions
  const standardSuggestion = standard.getBestSuggestion(board);
  const enhancedSuggestion = enhanced.getBestSuggestion(board);

  if (!standardSuggestion || !enhancedSuggestion) {
    throw new Error('Both calculators should provide suggestions');
  }

  // Enhanced should generally provide higher values due to additional factors
  const standardValue = standard.calculateMoveValue(board, 2, 2);
  const enhancedValue = enhanced.calculateMoveValue(board, 2, 2);

  if (typeof standardValue !== 'number' || typeof enhancedValue !== 'number') {
    throw new Error('Both calculators should return numeric values');
  }

  // Test that both use the same base functionality
  if (standard.BOARD_SIZE !== enhanced.BOARD_SIZE) {
    throw new Error('Both calculators should have same board size');
  }
}

/**
 * Test performance metrics
 */
function testPerformanceMetrics() {
  const calculator = new ProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // Generate some cache activity
  for (let i = 0; i < 10; i++) {
    calculator.calculateMoveValue(board, Math.floor(i / 5), i % 5);
  }

  const metrics = calculator.getPerformanceMetrics();

  // Should have some cache activity
  if (metrics.cacheMisses === 0) {
    throw new Error('Should have recorded cache misses');
  }

  // Test metrics structure
  if (!metrics.cacheSize || typeof metrics.cacheSize !== 'number') {
    throw new Error('Should report cache size');
  }
}

/**
 * Test cache efficiency
 */
function testCacheEfficiency() {
  const calculator = new ProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  // First calculation should be a cache miss
  const value1 = calculator.calculateMoveValue(board, 2, 2);
  const metrics1 = calculator.getPerformanceMetrics();

  // Second calculation should be a cache hit
  const value2 = calculator.calculateMoveValue(board, 2, 2);
  const metrics2 = calculator.getPerformanceMetrics();

  if (value1 !== value2) {
    throw new Error('Cached values should be identical');
  }

  if (metrics2.cacheHits <= metrics1.cacheHits) {
    throw new Error('Second calculation should increase cache hits');
  }

  // Test cache clearing
  calculator.clearCache();
  const metrics3 = calculator.getPerformanceMetrics();

  if (metrics3.cacheSize !== 0) {
    throw new Error('Cache should be cleared');
  }
}

/**
 * Performance benchmark
 */
function benchmarkCalculators() {
  console.log('\nRunning Performance Benchmark...');

  const standard = new ProbabilityCalculator();
  const enhanced = new EnhancedProbabilityCalculator();
  const board = Utils.createEmptyBoard();

  const iterations = 100;

  // Benchmark standard calculator
  const standardStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    standard.getBestSuggestion(board);
  }
  const standardTime = Date.now() - standardStart;

  // Benchmark enhanced calculator
  const enhancedStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    enhanced.getBestSuggestion(board);
  }
  const enhancedTime = Date.now() - enhancedStart;

  console.log(
    `Standard Calculator: ${standardTime}ms for ${iterations} iterations`
  );
  console.log(
    `Enhanced Calculator: ${enhancedTime}ms for ${iterations} iterations`
  );
  console.log(
    `Performance Ratio: ${(enhancedTime / standardTime).toFixed(2)}x`
  );

  // Get detailed metrics
  const standardMetrics = standard.getPerformanceMetrics();
  const enhancedMetrics = enhanced.getPerformanceMetrics();

  console.log('\nStandard Calculator Metrics:', standardMetrics);
  console.log('Enhanced Calculator Metrics:', enhancedMetrics);
}

// Run tests
if (require.main === module) {
  const results = testRefactoredCalculators();

  if (results.failed === 0) {
    benchmarkCalculators();
  }
}

module.exports = { testRefactoredCalculators };
