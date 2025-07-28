/**
 * Performance Regression Test Suite
 * Tests to ensure performance doesn't degrade over time
 */

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  gameInitialization: 100,
  moveCalculation: 50,
  lineDetection: 30,
  boardRender: 20,
  algorithmSwitch: 25
};

// Performance baseline data
const BASELINE_SCORES = {
  lighthouse: {
    performance: 85,
    accessibility: 90,
    bestPractices: 85,
    seo: 90
  }
};

describe('Performance Regression Tests', () => {
  let performanceMonitor;
  let gameEngine;
  let gameBoard;
  
  beforeEach(() => {
    // Initialize performance monitoring
    if (typeof PerformanceMonitor !== 'undefined') {
      performanceMonitor = new PerformanceMonitor();
      performanceMonitor.startMonitoring();
    }
    
    // Initialize game components
    if (typeof GameEngine !== 'undefined') {
      gameEngine = new GameEngine();
    }
    
    if (typeof GameBoard !== 'undefined') {
      gameBoard = new GameBoard();
    }
  });
  
  test('Game initialization should complete within threshold', () => {
    const startTime = performance.now();
    
    if (gameEngine) {
      gameEngine.startGame();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Game initialization took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.gameInitialization);
  });
  
  test('Move calculation should be fast enough', () => {
    if (!gameEngine) {
      console.log('GameEngine not available, skipping test');
      return;
    }
    
    gameEngine.startGame();
    
    const startTime = performance.now();
    const bestMove = gameEngine.calculateBestMove();
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    
    console.log(`Move calculation took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.moveCalculation);
    expect(bestMove).toBeTruthy();
  });
  
  test('Line detection should be efficient', () => {
    if (typeof LineDetector === 'undefined') {
      console.log('LineDetector not available, skipping test');
      return;
    }
    
    const lineDetector = new LineDetector();
    const testBoard = [
      [1, 1, 1, 1, 1],
      [0, 2, 0, 2, 0],
      [2, 0, 1, 0, 2],
      [0, 2, 0, 2, 0],
      [2, 0, 2, 0, 1]
    ];
    
    const startTime = performance.now();
    const lines = lineDetector.getAllLines(testBoard);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    
    console.log(`Line detection took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.lineDetection);
    expect(lines).toBeTruthy();
  });
  
  test('Board rendering should be fast', () => {
    if (!gameBoard) {
      console.log('GameBoard not available, skipping test');
      return;
    }
    
    const startTime = performance.now();
    
    // Simulate board updates
    for (let i = 0; i < 10; i++) {
      gameBoard.updateCell(i % 5, Math.floor(i / 5), i % 3);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Board rendering took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.boardRender);
  });
  
  test('Algorithm switching should be responsive', () => {
    if (typeof ProbabilityCalculator === 'undefined' || 
        typeof EnhancedProbabilityCalculator === 'undefined') {
      console.log('Probability calculators not available, skipping test');
      return;
    }
    
    const standardCalc = new ProbabilityCalculator();
    const enhancedCalc = new EnhancedProbabilityCalculator();
    const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));
    
    const startTime = performance.now();
    
    // Simulate algorithm switching
    standardCalc.getBestSuggestion(emptyBoard);
    enhancedCalc.getBestSuggestion(emptyBoard);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Algorithm switching took ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.algorithmSwitch);
  });
  
  test('Memory usage should be reasonable', () => {
    if (!performanceMonitor) {
      console.log('PerformanceMonitor not available, skipping test');
      return;
    }
    
    const initialMemory = performanceMonitor.getMemoryUsage();
    
    // Simulate game operations
    if (gameEngine) {
      gameEngine.startGame();
      
      // Play several rounds
      for (let i = 0; i < 5; i++) {
        gameEngine.processPlayerTurn(i % 5, Math.floor(i / 5));
        gameEngine.processComputerTurn((i + 1) % 5, Math.floor((i + 1) / 5));
      }
    }
    
    const finalMemory = performanceMonitor.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    console.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB`);
    
    // Memory increase should be reasonable (less than 10MB for a simple game)
    expect(memoryIncrease).toBeLessThan(10);
  });
  
  test('Performance metrics should meet baseline', () => {
    if (!performanceMonitor) {
      console.log('PerformanceMonitor not available, skipping test');
      return;
    }
    
    const metrics = performanceMonitor.getMetrics();
    
    console.log('Performance metrics:', metrics);
    
    // Check if metrics exist and are reasonable
    if (metrics.averageFrameTime) {
      expect(metrics.averageFrameTime).toBeLessThan(16.67); // 60 FPS
    }
    
    if (metrics.memoryUsage) {
      expect(metrics.memoryUsage).toBeLessThan(50); // Less than 50MB
    }
  });
  
  test('Large board operations should scale well', () => {
    if (typeof LineDetector === 'undefined') {
      console.log('LineDetector not available, skipping test');
      return;
    }
    
    const lineDetector = new LineDetector();
    
    // Test with multiple board configurations
    const testBoards = [];
    for (let i = 0; i < 100; i++) {
      const board = Array(5).fill().map(() => 
        Array(5).fill().map(() => Math.floor(Math.random() * 3))
      );
      testBoards.push(board);
    }
    
    const startTime = performance.now();
    
    testBoards.forEach(board => {
      lineDetector.getAllLines(board);
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const averageTime = duration / testBoards.length;
    
    console.log(`Average line detection time: ${averageTime.toFixed(2)}ms`);
    expect(averageTime).toBeLessThan(5); // Should be very fast for 5x5 board
  });
});

// Export for use in CI/CD
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PERFORMANCE_THRESHOLDS,
    BASELINE_SCORES
  };
}