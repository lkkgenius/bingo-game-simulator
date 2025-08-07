/**
 * BaseProbabilityCalculator - Abstract base class for probability calculators
 * 
 * This class provides common functionality shared between different probability
 * calculation algorithms, reducing code duplication and ensuring consistency.
 * 
 * Features:
 * - Common board validation and manipulation methods
 * - Shared line detection logic
 * - Consistent move evaluation structure
 * - Reusable caching mechanisms
 * - Standard error handling
 * 
 * @abstract
 * @class BaseProbabilityCalculator
 * @version 1.0.0
 */

// Import common utilities
let CONSTANTS, Utils;
if (typeof require !== 'undefined') {
  const common = require('./common.js');
  CONSTANTS = common.CONSTANTS;
  Utils = common.Utils;
} else if (typeof window !== 'undefined' && window.CONSTANTS) {
  CONSTANTS = window.CONSTANTS;
  Utils = window.Utils;
}

class BaseProbabilityCalculator {
  /**
   * Create base probability calculator instance
   * @param {Object} weights - Algorithm-specific weights
   */
  constructor(weights = CONSTANTS.ALGORITHM_WEIGHTS.STANDARD) {
    // Board configuration
    this.BOARD_SIZE = CONSTANTS.BOARD_SIZE;
    this.CELL_STATES = CONSTANTS.CELL_STATES;
    this.LINE_TYPES = CONSTANTS.LINE_TYPES;
    
    // Algorithm weights
    this.WEIGHTS = { ...weights };
    
    // Performance optimization
    this._initializeCache();
    this._initializePerformanceMetrics();
  }

  /**
   * Initialize caching system
   * @private
   */
  _initializeCache() {
    this._valueCache = new Map();
    this._lineCache = new Map();
    this._maxCacheSize = CONSTANTS.PERFORMANCE.CACHE_SIZE.VALUE_CACHE;
  }

  /**
   * Initialize performance metrics
   * @private
   */
  _initializePerformanceMetrics() {
    this._performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      calculationTime: []
    };
  }

  /**
   * Abstract method - must be implemented by subclasses
   * @abstract
   * @param {number[][]} board - Game board
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {number} Move value
   */
  calculateMoveValue(board, row, col) {
    throw new Error('calculateMoveValue must be implemented by subclass');
  }

  /**
   * Validate move position
   * @param {number[][]} board - Game board
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {boolean} Whether move is valid
   */
  isValidMove(board, row, col) {
    return Utils.isValidPosition(row, col, this.BOARD_SIZE) &&
           Utils.isCellEmpty(board, row, col);
  }

  /**
   * Check if position is center
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {boolean} Whether position is center
   */
  isCenterPosition(row, col) {
    return Utils.isCenterPosition(row, col, this.BOARD_SIZE);
  }

  /**
   * Copy board safely
   * @param {number[][]} board - Original board
   * @returns {number[][]} Copied board
   */
  copyBoard(board) {
    return Utils.copyBoard(board);
  }

  /**
   * Get empty cells from board
   * @param {number[][]} board - Game board
   * @returns {Array} Array of empty cell positions
   */
  getEmptyCells(board) {
    return Utils.getEmptyCells(board);
  }

  /**
   * Get board hash for caching
   * @param {number[][]} board - Game board
   * @returns {string} Board hash
   */
  getBoardHash(board) {
    return Utils.getBoardHash(board);
  }

  /**
   * Get line cells for specific line type
   * @param {number} row - Reference row
   * @param {number} col - Reference column
   * @param {string} lineType - Line type
   * @returns {Array} Array of cell positions
   */
  getLineCells(row, col, lineType) {
    return Utils.getLineCells(row, col, lineType, this.BOARD_SIZE);
  }

  /**
   * Get relevant line types for position
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {Array} Array of relevant line types
   */
  getRelevantLines(row, col) {
    return Utils.getRelevantLineTypes(row, col, this.BOARD_SIZE);
  }

  /**
   * Check if line is complete
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {boolean} Whether line is complete
   */
  isLineComplete(board, cells) {
    return Utils.isLineComplete(board, cells);
  }

  /**
   * Count filled cells in line
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {number} Number of filled cells
   */
  countFilledCells(board, cells) {
    return Utils.countFilledCells(board, cells);
  }

  /**
   * Count empty cells in line
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {number} Number of empty cells
   */
  countEmptyCells(board, cells) {
    return Utils.countEmptyCells(board, cells);
  }

  /**
   * Check line completion for specific position and type
   * @param {number[][]} board - Game board
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @param {string} lineType - Line type
   * @returns {boolean} Whether line would be complete
   */
  checkLineCompletion(board, row, col, lineType) {
    const cells = this.getLineCells(row, col, lineType);
    return this.isLineComplete(board, cells);
  }

  /**
   * Simulate all possible moves
   * @param {number[][]} board - Current game board
   * @returns {Array} Array of move evaluations
   */
  simulateAllPossibleMoves(board) {
    const moves = [];
    const emptyCells = this.getEmptyCells(board);
    
    for (const { row, col } of emptyCells) {
      const value = this.calculateMoveValue(board, row, col);
      moves.push({
        row,
        col,
        value,
        position: `(${row}, ${col})`
      });
    }
    
    // Sort by value (descending)
    moves.sort((a, b) => b.value - a.value);
    
    return moves;
  }

  /**
   * Get best move suggestion
   * @param {number[][]} board - Current game board
   * @returns {Object|null} Best move suggestion or null
   */
  getBestSuggestion(board) {
    const allMoves = this.simulateAllPossibleMoves(board);
    
    if (allMoves.length === 0) {
      return null;
    }
    
    const bestMove = allMoves[0];
    
    return {
      row: bestMove.row,
      col: bestMove.col,
      value: bestMove.value,
      position: bestMove.position,
      confidence: this.calculateConfidence(allMoves),
      alternatives: allMoves.slice(1, 4) // Top 3 alternatives
    };
  }

  /**
   * Calculate confidence level
   * @param {Array} moves - Array of move evaluations
   * @returns {string} Confidence level
   */
  calculateConfidence(moves) {
    return Utils.calculateConfidenceLevel(moves, this.WEIGHTS);
  }

  /**
   * Cache management - get cached value
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  _getCachedValue(key) {
    if (this._valueCache.has(key)) {
      this._performanceMetrics.cacheHits++;
      return this._valueCache.get(key);
    }
    
    this._performanceMetrics.cacheMisses++;
    return undefined;
  }

  /**
   * Cache management - set cached value
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  _setCachedValue(key, value) {
    // Implement LRU eviction
    if (this._valueCache.size >= this._maxCacheSize) {
      const firstKey = this._valueCache.keys().next().value;
      this._valueCache.delete(firstKey);
    }
    
    this._valueCache.set(key, value);
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this._valueCache.clear();
    this._lineCache.clear();
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    const totalCalculations = this._performanceMetrics.cacheHits + this._performanceMetrics.cacheMisses;
    const cacheHitRate = totalCalculations > 0 ? 
      (this._performanceMetrics.cacheHits / totalCalculations * 100).toFixed(2) : 0;
    
    const avgCalculationTime = this._performanceMetrics.calculationTime.length > 0 ?
      this._performanceMetrics.calculationTime.reduce((sum, time) => sum + time, 0) / 
      this._performanceMetrics.calculationTime.length : 0;
    
    return {
      cacheHitRate: `${cacheHitRate}%`,
      cacheHits: this._performanceMetrics.cacheHits,
      cacheMisses: this._performanceMetrics.cacheMisses,
      averageCalculationTime: `${avgCalculationTime.toFixed(2)}ms`,
      cacheSize: this._valueCache.size
    };
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    this._performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      calculationTime: []
    };
  }

  /**
   * Record calculation time for performance monitoring
   * @param {number} startTime - Start time in milliseconds
   */
  _recordCalculationTime(startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this._performanceMetrics.calculationTime.push(duration);
    
    // Limit array size to prevent memory issues
    if (this._performanceMetrics.calculationTime.length > 100) {
      this._performanceMetrics.calculationTime.shift();
    }
  }

  /**
   * Validate board format
   * @param {number[][]} board - Board to validate
   * @returns {boolean} Whether board is valid
   */
  isValidBoard(board) {
    return Utils.isValidBoard(board, this.BOARD_SIZE);
  }

  /**
   * Calculate basic line completion value
   * @param {number[][]} testBoard - Test board with simulated move
   * @param {number} row - Move row
   * @param {number} col - Move column
   * @returns {number} Line completion value
   */
  calculateBasicCompletionValue(testBoard, row, col) {
    let value = 0;
    const relevantLines = this.getRelevantLines(row, col);
    
    for (const lineType of relevantLines) {
      if (this.checkLineCompletion(testBoard, row, col, lineType)) {
        value += this.WEIGHTS.COMPLETE_LINE;
      }
    }
    
    return value;
  }

  /**
   * Calculate cooperative line value (mixed player/computer lines)
   * @param {number[][]} board - Current board
   * @param {number} row - Move row
   * @param {number} col - Move column
   * @returns {number} Cooperative value
   */
  calculateCooperativeValue(board, row, col) {
    let value = 0;
    const relevantLines = this.getRelevantLines(row, col);
    
    for (const lineType of relevantLines) {
      const cells = this.getLineCells(row, col, lineType);
      const filledCount = this.countFilledCells(board, cells);
      const emptyCount = this.countEmptyCells(board, cells);
      
      // If line has some filled cells and empty cells, it has cooperative potential
      if (filledCount > 0 && emptyCount > 0) {
        if (filledCount === 4) {
          // One cell away from completion
          value += this.WEIGHTS.COOPERATIVE_LINE * 2;
        } else if (filledCount >= 2) {
          // Multiple cells filled
          value += this.WEIGHTS.COOPERATIVE_LINE;
        } else {
          // Single cell filled
          value += this.WEIGHTS.COOPERATIVE_LINE * 0.5;
        }
      }
    }
    
    return value;
  }

  /**
   * Calculate potential line value
   * @param {number[][]} testBoard - Test board with simulated move
   * @param {number} row - Move row
   * @param {number} col - Move column
   * @returns {number} Potential value
   */
  calculatePotentialValue(testBoard, row, col) {
    let value = 0;
    const relevantLines = this.getRelevantLines(row, col);
    
    for (const lineType of relevantLines) {
      const cells = this.getLineCells(row, col, lineType);
      const filledCount = this.countFilledCells(testBoard, cells);
      const emptyCount = this.countEmptyCells(testBoard, cells);
      
      // Potential increases with more filled cells
      if (emptyCount > 0) {
        value += (filledCount + 1) * this.WEIGHTS.POTENTIAL_LINE;
      }
    }
    
    return value;
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseProbabilityCalculator;
} else if (typeof window !== 'undefined') {
  window.BaseProbabilityCalculator = BaseProbabilityCalculator;
}