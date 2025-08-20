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
let BaseProbConstants, BaseProbUtils;
if (typeof require !== 'undefined') {
  const common = require('./common.js');
  BaseProbConstants = common.CONSTANTS;
  BaseProbUtils = common.Utils;
} else if (typeof window !== 'undefined' && window.CONSTANTS) {
  BaseProbConstants = window.CONSTANTS;
  BaseProbUtils = window.Utils;
}

class BaseProbabilityCalculator {
  /**
   * Create base probability calculator instance
   * @param {Object} weights - Algorithm-specific weights
   */
  constructor(weights) {
    // Use imported constants or fallback values
    const constants = BaseProbConstants || {
      BOARD_SIZE: 5,
      CELL_STATES: { EMPTY: 0, PLAYER: 1, COMPUTER: 2 },
      LINE_TYPES: {
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical',
        DIAGONAL_MAIN: 'diagonal-main',
        DIAGONAL_ANTI: 'diagonal-anti'
      },
      ALGORITHM_WEIGHTS: {
        STANDARD: {
          COMPLETE_LINE: 100,
          COOPERATIVE_LINE: 50,
          POTENTIAL_LINE: 10,
          CENTER_BONUS: 5
        }
      },
      PERFORMANCE: { CACHE_SIZE: { VALUE_CACHE: 200 } }
    };

    const utils = BaseProbUtils || {
      isValidPosition: (row, col, boardSize) =>
        row >= 0 && row < boardSize && col >= 0 && col < boardSize,
      isCellEmpty: (board, row, col) => board[row] && board[row][col] === 0,
      copyBoard: board => board.map(row => [...row]),
      getEmptyCells: board => {
        const empty = [];
        for (let r = 0; r < board.length; r++) {
          for (let c = 0; c < board[r].length; c++) {
            if (board[r][c] === 0) empty.push({ row: r, col: c });
          }
        }
        return empty;
      },
      getBoardHash: board => board.flat().join(''),
      isCenterPosition: (row, col, boardSize) =>
        row === Math.floor(boardSize / 2) && col === Math.floor(boardSize / 2),
      getLineCells: (row, col, lineType, boardSize) => {
        const cells = [];
        switch (lineType) {
          case 'horizontal':
            for (let c = 0; c < boardSize; c++) cells.push([row, c]);
            break;
          case 'vertical':
            for (let r = 0; r < boardSize; r++) cells.push([r, col]);
            break;
          case 'diagonal-main':
            for (let i = 0; i < boardSize; i++) cells.push([i, i]);
            break;
          case 'diagonal-anti':
            for (let i = 0; i < boardSize; i++)
              cells.push([i, boardSize - 1 - i]);
            break;
        }
        return cells;
      },
      getRelevantLineTypes: (row, col, boardSize) => {
        const lines = ['horizontal', 'vertical'];
        if (row === col) lines.push('diagonal-main');
        if (row + col === boardSize - 1) lines.push('diagonal-anti');
        return lines;
      },
      isLineComplete: (board, cells) =>
        cells.every(([r, c]) => board[r][c] !== 0),
      countFilledCells: (board, cells) =>
        cells.filter(([r, c]) => board[r][c] !== 0).length,
      countEmptyCells: (board, cells) =>
        cells.filter(([r, c]) => board[r][c] === 0).length,
      calculateConfidenceLevel: (moves, weights) => {
        if (moves.length < 2) return 'high';
        const diff = moves[0].value - moves[1].value;
        if (diff >= weights.COMPLETE_LINE) return 'very-high';
        if (diff >= weights.COOPERATIVE_LINE) return 'high';
        if (diff >= weights.POTENTIAL_LINE) return 'medium';
        return 'low';
      },
      isValidBoard: (board, expectedSize) => {
        if (!Array.isArray(board) || board.length !== expectedSize)
          return false;
        return board.every(
          row => Array.isArray(row) && row.length === expectedSize
        );
      }
    };

    // Store utils for use in methods
    this.Utils = utils;

    // Board configuration
    this.BOARD_SIZE = constants.BOARD_SIZE;
    this.CELL_STATES = constants.CELL_STATES;
    this.LINE_TYPES = constants.LINE_TYPES;

    // Algorithm weights
    this.WEIGHTS = { ...(weights || constants.ALGORITHM_WEIGHTS.STANDARD) };

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
    this._maxCacheSize =
      (BaseProbConstants &&
        BaseProbConstants.PERFORMANCE &&
        BaseProbConstants.PERFORMANCE.CACHE_SIZE &&
        BaseProbConstants.PERFORMANCE.CACHE_SIZE.VALUE_CACHE) ||
      200;
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
    return (
      this.Utils.isValidPosition(row, col, this.BOARD_SIZE) &&
      this.Utils.isCellEmpty(board, row, col)
    );
  }

  /**
   * Check if position is center
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {boolean} Whether position is center
   */
  isCenterPosition(row, col) {
    return this.Utils.isCenterPosition(row, col, this.BOARD_SIZE);
  }

  /**
   * Copy board safely
   * @param {number[][]} board - Original board
   * @returns {number[][]} Copied board
   */
  copyBoard(board) {
    return this.Utils.copyBoard(board);
  }

  /**
   * Get empty cells from board
   * @param {number[][]} board - Game board
   * @returns {Array} Array of empty cell positions
   */
  getEmptyCells(board) {
    return this.Utils.getEmptyCells(board);
  }

  /**
   * Get board hash for caching
   * @param {number[][]} board - Game board
   * @returns {string} Board hash
   */
  getBoardHash(board) {
    return this.Utils.getBoardHash(board);
  }

  /**
   * Get line cells for specific line type
   * @param {number} row - Reference row
   * @param {number} col - Reference column
   * @param {string} lineType - Line type
   * @returns {Array} Array of cell positions
   */
  getLineCells(row, col, lineType) {
    return this.Utils.getLineCells(row, col, lineType, this.BOARD_SIZE);
  }

  /**
   * Get relevant line types for position
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {Array} Array of relevant line types
   */
  getRelevantLines(row, col) {
    return this.Utils.getRelevantLineTypes(row, col, this.BOARD_SIZE);
  }

  /**
   * Check if line is complete
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {boolean} Whether line is complete
   */
  isLineComplete(board, cells) {
    return this.Utils.isLineComplete(board, cells);
  }

  /**
   * Count filled cells in line
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {number} Number of filled cells
   */
  countFilledCells(board, cells) {
    return this.Utils.countFilledCells(board, cells);
  }

  /**
   * Count empty cells in line
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {number} Number of empty cells
   */
  countEmptyCells(board, cells) {
    return this.Utils.countEmptyCells(board, cells);
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
    return this.Utils.calculateConfidenceLevel(moves, this.WEIGHTS);
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
    const totalCalculations =
      this._performanceMetrics.cacheHits + this._performanceMetrics.cacheMisses;
    const cacheHitRate =
      totalCalculations > 0
        ? (
            (this._performanceMetrics.cacheHits / totalCalculations) *
            100
          ).toFixed(2)
        : 0;

    const avgCalculationTime =
      this._performanceMetrics.calculationTime.length > 0
        ? this._performanceMetrics.calculationTime.reduce(
            (sum, time) => sum + time,
            0
          ) / this._performanceMetrics.calculationTime.length
        : 0;

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
    return this.Utils.isValidBoard(board, this.BOARD_SIZE);
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
  // Also export to global/window if available for testing
  if (typeof global !== 'undefined' && global.window) {
    global.window.BaseProbabilityCalculator = BaseProbabilityCalculator;
  }
} else if (typeof window !== 'undefined') {
  // Only assign if not already defined to prevent redeclaration
  if (!window.BaseProbabilityCalculator) {
    window.BaseProbabilityCalculator = BaseProbabilityCalculator;
  }
}
