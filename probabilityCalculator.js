// Import base class and common utilities
let BaseProbabilityCalculator, ProbConstants;
if (typeof require !== 'undefined') {
  BaseProbabilityCalculator = require('./utils/baseProbabilityCalculator.js');
  const common = require('./utils/common.js');
  ProbConstants = common.CONSTANTS;
} else if (typeof window !== 'undefined') {
  // Wait for BaseProbabilityCalculator to be available
  if (!window.BaseProbabilityCalculator) {
    // If BaseProbabilityCalculator is not available, wait for it
    console.warn('BaseProbabilityCalculator not yet available, deferring initialization');
    // Exit early to prevent errors
    if (typeof window.deferredProbabilityCalculator === 'undefined') {
      window.deferredProbabilityCalculator = true;
    }
  } else {
    BaseProbabilityCalculator = window.BaseProbabilityCalculator;
    ProbConstants = window.CONSTANTS;
  }
}

/**
 * ProbabilityCalculator - 標準機率計算器
 * 
 * 這個類別負責分析遊戲狀態並提供移動建議，核心功能包括：
 * - 計算每個可能移動的價值分數
 * - 分析連線完成的機率和潛力
 * - 評估合作連線的價值（玩家與電腦合作）
 * - 提供最佳移動建議和理由說明
 * - 支持不同的評估策略和權重配置
 * 
 * 演算法特點：
 * - 基於啟發式評估函數
 * - 考慮即時完成和潛在價值
 * - 支持合作模式的特殊邏輯
 * - 使用緩存機制提升性能
 * 
 * 評估因素：
 * - 直接完成連線的價值最高
 * - 幫助完成混合連線有中等價值
 * - 增加未來連線潛力有基礎價值
 * - 戰略位置（如中心）有額外獎勵
 * 
 * @class ProbabilityCalculator
 * @extends BaseProbabilityCalculator
 * @version 1.0.0
 */
class ProbabilityCalculator extends BaseProbabilityCalculator {
  /**
   * 創建標準機率計算器實例
   * 初始化評估參數和配置
   */
  constructor() {
    // Initialize with standard algorithm weights
    super(ProbConstants.ALGORITHM_WEIGHTS.STANDARD);
  }

  /**
   * 計算特定移動的價值分數（優化版本）
   * 
   * 這是核心評估函數，分析在指定位置放置玩家棋子的價值。
   * 評估考慮多個因素：直接完成連線、合作潛力、戰略位置等。
   * 
   * 評估流程：
   * 1. 驗證移動的有效性
   * 2. 檢查緩存以避免重複計算
   * 3. 分析各個方向的連線價值
   * 4. 計算合作連線的潛力
   * 5. 添加位置獎勵
   * 6. 緩存結果並返回
   * 
   * @param {number[][]} board - 當前遊戲板狀態（5x5 二維陣列）
   * @param {number} row - 移動的行位置（0-4）
   * @param {number} col - 移動的列位置（0-4）
   * @returns {number} 移動的價值分數（-1 表示無效移動，>=0 表示有效價值）
   */
  calculateMoveValue(board, row, col) {
    const startTime = performance.now();
    
    // Validate move using base class method
    if (!this.isValidMove(board, row, col)) {
      return -1;
    }

    // Check cache using base class method
    const cacheKey = `${row}-${col}-${this.getBoardHash(board)}`;
    const cachedValue = this._getCachedValue(cacheKey);
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // Create test board with simulated move
    const testBoard = this.copyBoard(board);
    testBoard[row][col] = this.CELL_STATES.PLAYER;
    
    let totalValue = 0;
    
    // Calculate completion value using base class method
    totalValue += this.calculateBasicCompletionValue(testBoard, row, col);
    
    // Calculate cooperative value using base class method
    totalValue += this.calculateCooperativeValue(board, row, col);
    
    // Calculate potential value using base class method
    totalValue += this.calculatePotentialValue(testBoard, row, col);
    
    // Center position bonus
    if (this.isCenterPosition(row, col)) {
      totalValue += this.WEIGHTS.CENTER_BONUS;
    }
    
    // Cache result using base class method
    this._setCachedValue(cacheKey, totalValue);
    
    // Record performance metrics
    this._recordCalculationTime(startTime);
    
    return totalValue;
  }
}

// 如果在Node.js環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProbabilityCalculator;
}

// 在瀏覽器環境中，將 ProbabilityCalculator 添加到全局作用域
if (typeof window !== 'undefined') {
    window.ProbabilityCalculator = ProbabilityCalculator;
}