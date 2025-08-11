/**
 * Standalone ProbabilityCalculator - 標準機率計算器
 *
 * 這個版本不依賴於任何可能有衝突的變數名稱
 *
 * @class ProbabilityCalculator
 * @version 1.0.0
 */
(function() {
  'use strict';

  // Check if dependencies are available
  if (typeof window === 'undefined' ||
      typeof window.BaseProbabilityCalculator !== 'function' ||
      typeof window.CONSTANTS !== 'object') {
    console.error('ProbabilityCalculator: Dependencies not available');
    return;
  }

  const BaseClass = window.BaseProbabilityCalculator;
  const Constants = window.CONSTANTS;

  class ProbabilityCalculator extends BaseClass {
    /**
     * 創建標準機率計算器實例
     * 初始化評估參數和配置
     */
    constructor() {
      // Initialize with standard algorithm weights
      super(Constants.ALGORITHM_WEIGHTS.STANDARD);
    }

    /**
     * 計算特定移動的價值分數（優化版本）
     *
     * 這是核心評估函數，分析在指定位置放置玩家棋子的價值。
     * 評估考慮多個因素：直接完成連線、合作潛力、戰略位置等。
     *
     * @param {number[][]} board - 當前遊戲板狀態（5x5 二維陣列）
     * @param {number} row - 移動的行位置（0-4）
     * @param {number} col - 移動的列位置（0-4）
     * @returns {number} 移動的價值分數（-1 表示無效移動，>=0 表示有效價值）
     */
    calculateMoveValue(board, row, col) {
      const startTime = performance.now();

      // Validate move
      if (!this.isValidMove(board, row, col)) {
        return -1;
      }

      // Check cache
      const cacheKey = `${row}-${col}-${this.getBoardHash(board)}`;
      const cachedValue = this._getCachedValue(cacheKey);
      if (cachedValue !== undefined) {
        return cachedValue;
      }

      // Create test board with simulated move
      const testBoard = this.copyBoard(board);
      testBoard[row][col] = this.CELL_STATES.PLAYER;

      let totalValue = 0;

      // Calculate completion value
      totalValue += this.calculateBasicCompletionValue(testBoard, row, col);

      // Calculate cooperative value
      totalValue += this.calculateCooperativeValue(board, row, col);

      // Calculate potential value
      totalValue += this.calculatePotentialValue(testBoard, row, col);

      // Center position bonus
      if (this.isCenterPosition(row, col)) {
        totalValue += this.WEIGHTS.CENTER_BONUS;
      }

      // Cache result
      this._setCachedValue(cacheKey, totalValue);

      // Record performance metrics
      this._recordCalculationTime(startTime);

      return totalValue;
    }
  }

  // Export to global scope
  window.ProbabilityCalculator = ProbabilityCalculator;
  console.log('ProbabilityCalculator loaded successfully');
})();
