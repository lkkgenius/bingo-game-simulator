// Import base class and common utilities
let BaseProbabilityCalculator, EnhancedCONSTANTS;
if (typeof require !== 'undefined') {
  BaseProbabilityCalculator = require('./utils/baseProbabilityCalculator.js');
  const common = require('./utils/common.js');
  EnhancedCONSTANTS = common.CONSTANTS;
} else if (typeof window !== 'undefined') {
  BaseProbabilityCalculator = window.BaseProbabilityCalculator;
  EnhancedCONSTANTS = window.CONSTANTS;
}

/**
 * LRU 緩存類實現
 * 使用 Map 實現 LRU (Least Recently Used) 緩存策略
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;

    // 獲取值
    const value = this.cache.get(key);

    // 刪除舊位置
    this.cache.delete(key);

    // 放到最新位置
    this.cache.set(key, value);

    return value;
  }

  set(key, value) {
    // 如果已存在，先刪除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果達到容量上限，刪除最舊的項目
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    // 添加到最新位置
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

/**
 * EnhancedProbabilityCalculator - 增強版機率計算器
 * 專注於最大化完成三條連線的機會，使用交叉點優先策略和接近完成的線優先處理
 * 優化版本：實作更高效的緩存策略和延遲計算機制
 *
 * @class EnhancedProbabilityCalculator
 * @extends BaseProbabilityCalculator
 * @version 1.0.0
 */
class EnhancedProbabilityCalculator extends BaseProbabilityCalculator {
  constructor() {
    // Initialize with enhanced algorithm weights
    super(EnhancedCONSTANTS.ALGORITHM_WEIGHTS.ENHANCED);

    // Enhanced-specific caching with LRU strategy
    this._valueCache = new LRUCache(
      EnhancedCONSTANTS.PERFORMANCE.CACHE_SIZE.VALUE_CACHE
    );
    this._lineCache = new LRUCache(
      EnhancedCONSTANTS.PERFORMANCE.CACHE_SIZE.LINE_CACHE
    );
    this._boardAnalysisCache = new LRUCache(
      EnhancedCONSTANTS.PERFORMANCE.CACHE_SIZE.BOARD_ANALYSIS_CACHE
    );

    // Pre-compute optimization data
    this._allPossibleLines = this._precomputeAllLines();
    this._intersectionPoints = this._precomputeIntersectionPoints();

    // Batch processing configuration
    this._batchQueue = [];
    this._isBatchProcessing = false;
    this._batchProcessDelay = EnhancedCONSTANTS.PERFORMANCE.BATCH_DELAY;
  }

  /**
   * Pre-compute all possible lines for optimization
   * @private
   */
  _precomputeAllLines() {
    const lines = {
      horizontal: [],
      vertical: [],
      'diagonal-main': [],
      'diagonal-anti': []
    };

    // Pre-compute horizontal lines
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      const cells = [];
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        cells.push([row, col]);
      }
      lines.horizontal.push(cells);
    }

    // Pre-compute vertical lines
    for (let col = 0; col < this.BOARD_SIZE; col++) {
      const cells = [];
      for (let row = 0; row < this.BOARD_SIZE; row++) {
        cells.push([row, col]);
      }
      lines.vertical.push(cells);
    }

    // Pre-compute main diagonal
    const mainDiagonal = [];
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      mainDiagonal.push([i, i]);
    }
    lines['diagonal-main'].push(mainDiagonal);

    // Pre-compute anti-diagonal
    const antiDiagonal = [];
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      antiDiagonal.push([i, this.BOARD_SIZE - 1 - i]);
    }
    lines['diagonal-anti'].push(antiDiagonal);

    return lines;
  }

  /**
   * Pre-compute intersection points for optimization
   * @private
   */
  _precomputeIntersectionPoints() {
    const intersectionPoints = [];

    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        let lineCount = 2; // Default: horizontal and vertical

        // Check if on main diagonal
        if (row === col) {
          lineCount++;
        }

        // Check if on anti-diagonal
        if (row + col === this.BOARD_SIZE - 1) {
          lineCount++;
        }

        // Only consider positions that intersect more than 2 lines
        if (lineCount > 2) {
          intersectionPoints.push({ row, col, lineCount });
        }
      }
    }

    return intersectionPoints;
  }

  /**
   * Enhanced move value calculation with advanced features
   * @param {number[][]} board - Current game board
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {number} Move value score
   */
  calculateMoveValue(board, row, col) {
    const startTime = performance.now();

    // Validate move using base class method
    if (!this.isValidMove(board, row, col)) {
      return -1;
    }

    // Check cache using enhanced LRU cache
    const cacheKey = `${row}-${col}-${this.getBoardHash(board)}`;
    const cachedValue = this._valueCache.get(cacheKey);
    if (cachedValue !== undefined) {
      this._performanceMetrics.cacheHits++;
      return cachedValue;
    }

    this._performanceMetrics.cacheMisses++;

    // Create test board with simulated move
    const testBoard = this.copyBoard(board);
    testBoard[row][col] = this.CELL_STATES.PLAYER;

    let totalValue = 0;

    // Enhanced evaluation with additional factors
    totalValue += this.calculateBasicCompletionValue(testBoard, row, col);
    totalValue += this.calculateIntersectionValue(row, col);
    totalValue += this.calculateNearCompletionValue(testBoard, row, col);
    totalValue += this.calculateMultiLinePotentialValue(testBoard, row, col);
    totalValue += this.calculateCooperativeValue(board, row, col);
    totalValue += this.calculatePotentialValue(testBoard, row, col);

    // Center position bonus
    if (this.isCenterPosition(row, col)) {
      totalValue += this.WEIGHTS.CENTER_BONUS;
    }

    // Cache result using LRU cache
    this._valueCache.set(cacheKey, totalValue);

    // Record performance metrics
    this._recordCalculationTime(startTime);

    return totalValue;
  }

  /**
   * Calculate intersection point value (enhanced feature)
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {number} Intersection value
   */
  calculateIntersectionValue(row, col) {
    // Check if on main diagonal
    const isOnMainDiagonal = row === col;

    // Check if on anti-diagonal
    const isOnAntiDiagonal = row + col === this.BOARD_SIZE - 1;

    // Calculate intersection bonus
    if (isOnMainDiagonal && isOnAntiDiagonal) {
      // Center point - intersects 4 lines
      return this.WEIGHTS.INTERSECTION_BONUS * 4;
    } else if (isOnMainDiagonal || isOnAntiDiagonal) {
      // Intersects 3 lines (diagonal + horizontal + vertical)
      return this.WEIGHTS.INTERSECTION_BONUS * 3;
    }

    return 0;
  }

  /**
   * Calculate near completion value (enhanced feature)
   * @param {number[][]} testBoard - Test board with simulated move
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {number} Near completion value
   */
  calculateNearCompletionValue(testBoard, row, col) {
    const cacheKey = `near-${row}-${col}-${this.getBoardHash(testBoard)}`;
    const cachedValue = this._lineCache.get(cacheKey);

    if (cachedValue !== undefined) {
      return cachedValue;
    }

    let value = 0;
    const relevantLines = this.getRelevantLines(row, col);

    for (const lineType of relevantLines) {
      const lineCells = this.getLineCells(row, col, lineType);
      const filledCount = this.countFilledCells(testBoard, lineCells);

      // Bonus for lines close to completion
      if (filledCount === 4) {
        value += this.WEIGHTS.NEAR_COMPLETE_BONUS;
      } else if (filledCount === 3) {
        value += this.WEIGHTS.NEAR_COMPLETE_BONUS * 0.6;
      }
    }

    // Cache result
    this._lineCache.set(cacheKey, value);

    return value;
  }

  /**
   * Calculate multi-line potential value (enhanced feature)
   * @param {number[][]} testBoard - Test board with simulated move
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {number} Multi-line potential value
   */
  calculateMultiLinePotentialValue(testBoard, row, col) {
    const relevantLines = this.getRelevantLines(row, col);
    let potentialLinesCount = 0;

    for (const lineType of relevantLines) {
      const lineCells = this.getLineCells(row, col, lineType);
      const emptyCount = this.countEmptyCells(testBoard, lineCells);
      const filledCount = this.countFilledCells(testBoard, lineCells);

      // Count lines with potential
      if (emptyCount > 0 && filledCount > 0) {
        potentialLinesCount++;
      }
    }

    // Bonus for affecting multiple lines
    if (potentialLinesCount > 1) {
      return this.WEIGHTS.MULTI_LINE_BONUS * (potentialLinesCount - 1);
    }

    return 0;
  }

  /**
   * Override getLineCells to use pre-computed data
   * @param {number} row - Reference row
   * @param {number} col - Reference column
   * @param {string} lineType - Line type
   * @returns {Array} Array of cell positions
   */
  getLineCells(row, col, lineType) {
    // Use pre-computed line data for better performance
    switch (lineType) {
      case 'horizontal':
        return this._allPossibleLines.horizontal[row];

      case 'vertical':
        return this._allPossibleLines.vertical[col];

      case 'diagonal-main':
        return this._allPossibleLines['diagonal-main'][0];

      case 'diagonal-anti':
        return this._allPossibleLines['diagonal-anti'][0];

      default:
        return [];
    }
  }

  /**
   * Batch calculate move values for better performance
   * @param {number[][]} board - Current game board
   * @param {Array} moves - Array of moves to calculate
   * @param {Function} callback - Completion callback
   */
  batchCalculateMoveValues(board, moves, callback) {
    if (this._isBatchProcessing) {
      this._batchQueue.push({ board, moves, callback });
      return;
    }

    this._isBatchProcessing = true;
    const results = [];
    const totalMoves = moves.length;
    let processedMoves = 0;

    const processBatch = startIndex => {
      const batchSize = EnhancedCONSTANTS.PERFORMANCE.BATCH_SIZE;
      const endIndex = Math.min(startIndex + batchSize, totalMoves);

      for (let i = startIndex; i < endIndex; i++) {
        const { row, col } = moves[i];
        const value = this.calculateMoveValue(board, row, col);
        results.push({ row, col, value });
        processedMoves++;
      }

      if (processedMoves < totalMoves) {
        setTimeout(() => processBatch(endIndex), this._batchProcessDelay);
      } else {
        this._isBatchProcessing = false;
        callback(results);

        // Process next batch in queue
        if (this._batchQueue.length > 0) {
          const nextBatch = this._batchQueue.shift();
          this.batchCalculateMoveValues(
            nextBatch.board,
            nextBatch.moves,
            nextBatch.callback
          );
        }
      }
    };

    processBatch(0);
  }

  /**
   * Enhanced performance metrics
   * @returns {Object} Detailed performance metrics
   */
  getPerformanceMetrics() {
    const baseMetrics = super.getPerformanceMetrics();

    return {
      ...baseMetrics,
      cacheSize: {
        valueCache: this._valueCache.size,
        lineCache: this._lineCache.size,
        boardAnalysisCache: this._boardAnalysisCache.size
      },
      precomputedData: {
        allPossibleLines: Object.keys(this._allPossibleLines).length,
        intersectionPoints: this._intersectionPoints.length
      }
    };
  }

  /**
   * Clear all caches (enhanced version)
   */
  clearCache() {
    super.clearCache();
    this._valueCache.clear();
    this._lineCache.clear();
    this._boardAnalysisCache.clear();
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedProbabilityCalculator;
}

// In browser environment, add to global scope
if (typeof window !== 'undefined') {
  window.EnhancedProbabilityCalculator = EnhancedProbabilityCalculator;
}
