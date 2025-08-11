/**
 * Common utilities and shared constants for the Bingo Game Simulator
 * This module contains reusable functions and constants to reduce code duplication
 */

// Shared constants
const CONSTANTS = {
  BOARD_SIZE: 5,
  MAX_ROUNDS: 8,

  CELL_STATES: {
    EMPTY: 0,
    PLAYER: 1,
    COMPUTER: 2
  },

  GAME_PHASES: {
    WAITING: 'waiting',
    PLAYER_TURN: 'player-turn',
    COMPUTER_TURN: 'computer-turn',
    GAME_OVER: 'game-over'
  },

  LINE_TYPES: {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    DIAGONAL_MAIN: 'diagonal-main',
    DIAGONAL_ANTI: 'diagonal-anti'
  },

  ERROR_TYPES: {
    INVALID_MOVE: 'invalid-move',
    CELL_OCCUPIED: 'cell-occupied',
    GAME_OVER: 'game-over',
    INVALID_PHASE: 'invalid-phase'
  },

  // Algorithm weights for consistent configuration
  ALGORITHM_WEIGHTS: {
    STANDARD: {
      COMPLETE_LINE: 100,
      COOPERATIVE_LINE: 50,
      POTENTIAL_LINE: 10,
      CENTER_BONUS: 5
    },
    ENHANCED: {
      COMPLETE_LINE: 120,
      COOPERATIVE_LINE: 70,
      POTENTIAL_LINE: 15,
      CENTER_BONUS: 8,
      INTERSECTION_BONUS: 25,
      NEAR_COMPLETE_BONUS: 40,
      MULTI_LINE_BONUS: 30
    }
  },

  // Performance configuration
  PERFORMANCE: {
    CACHE_SIZE: {
      VALUE_CACHE: 200,
      LINE_CACHE: 100,
      BOARD_ANALYSIS_CACHE: 50
    },
    BATCH_SIZE: 5,
    BATCH_DELAY: 10,
    DEBOUNCE_DELAY: 100
  },

  // UI configuration
  UI: {
    ANIMATION_DURATION: 1000,
    SUGGESTION_PULSE_DURATION: 1500,
    ALTERNATIVE_PULSE_DURATION: 1200,
    LOADING_DELAY: 500
  }
};

// Shared utility functions
const Utils = {
  /**
   * Validate board position
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @param {number} boardSize - Board size (default: 5)
   * @returns {boolean} Whether position is valid
   */
  isValidPosition(row, col, boardSize = CONSTANTS.BOARD_SIZE) {
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
  },

  /**
   * Check if cell is empty
   * @param {number[][]} board - Game board
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @returns {boolean} Whether cell is empty
   */
  isCellEmpty(board, row, col) {
    if (!this.isValidPosition(row, col)) {
      return false;
    }
    return board[row][col] === CONSTANTS.CELL_STATES.EMPTY;
  },

  /**
   * Create empty board
   * @param {number} size - Board size
   * @returns {number[][]} Empty board
   */
  createEmptyBoard(size = CONSTANTS.BOARD_SIZE) {
    return Array(size)
      .fill()
      .map(() => Array(size).fill(CONSTANTS.CELL_STATES.EMPTY));
  },

  /**
   * Deep copy board
   * @param {number[][]} board - Original board
   * @returns {number[][]} Copied board
   */
  copyBoard(board) {
    return board.map(row => [...row]);
  },

  /**
   * Get board hash for caching
   * @param {number[][]} board - Game board
   * @returns {string} Board hash
   */
  getBoardHash(board) {
    return board.flat().join('');
  },

  /**
   * Get empty cells from board
   * @param {number[][]} board - Game board
   * @returns {Array} Array of empty cell positions
   */
  getEmptyCells(board) {
    const emptyCells = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === CONSTANTS.CELL_STATES.EMPTY) {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells;
  },

  /**
   * Check if position is center
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @param {number} boardSize - Board size
   * @returns {boolean} Whether position is center
   */
  isCenterPosition(row, col, boardSize = CONSTANTS.BOARD_SIZE) {
    const center = Math.floor(boardSize / 2);
    return row === center && col === center;
  },

  /**
   * Validate board format
   * @param {number[][]} board - Board to validate
   * @param {number} expectedSize - Expected board size
   * @returns {boolean} Whether board is valid
   */
  isValidBoard(board, expectedSize = CONSTANTS.BOARD_SIZE) {
    if (!Array.isArray(board) || board.length !== expectedSize) {
      return false;
    }

    for (let row of board) {
      if (!Array.isArray(row) || row.length !== expectedSize) {
        return false;
      }

      for (let cell of row) {
        if (!Object.values(CONSTANTS.CELL_STATES).includes(cell)) {
          return false;
        }
      }
    }

    return true;
  },

  /**
   * Get line cells for different line types
   * @param {number} row - Reference row
   * @param {number} col - Reference column
   * @param {string} lineType - Type of line
   * @param {number} boardSize - Board size
   * @returns {Array} Array of cell positions in the line
   */
  getLineCells(row, col, lineType, boardSize = CONSTANTS.BOARD_SIZE) {
    const cells = [];

    switch (lineType) {
      case CONSTANTS.LINE_TYPES.HORIZONTAL:
        for (let c = 0; c < boardSize; c++) {
          cells.push([row, c]);
        }
        break;

      case CONSTANTS.LINE_TYPES.VERTICAL:
        for (let r = 0; r < boardSize; r++) {
          cells.push([r, col]);
        }
        break;

      case CONSTANTS.LINE_TYPES.DIAGONAL_MAIN:
        for (let i = 0; i < boardSize; i++) {
          cells.push([i, i]);
        }
        break;

      case CONSTANTS.LINE_TYPES.DIAGONAL_ANTI:
        for (let i = 0; i < boardSize; i++) {
          cells.push([i, boardSize - 1 - i]);
        }
        break;
    }

    return cells;
  },

  /**
   * Count filled cells in a line
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {number} Number of filled cells
   */
  countFilledCells(board, cells) {
    let count = 0;
    for (const [row, col] of cells) {
      if (board[row][col] !== CONSTANTS.CELL_STATES.EMPTY) {
        count++;
      }
    }
    return count;
  },

  /**
   * Count empty cells in a line
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {number} Number of empty cells
   */
  countEmptyCells(board, cells) {
    let count = 0;
    for (const [row, col] of cells) {
      if (board[row][col] === CONSTANTS.CELL_STATES.EMPTY) {
        count++;
      }
    }
    return count;
  },

  /**
   * Debounce function to prevent rapid successive calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function to limit execution frequency
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Format time duration
   * @param {number} milliseconds - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds.toFixed(2)}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(2);
      return `${minutes}m ${seconds}s`;
    }
  },

  /**
   * Generate unique ID
   * @returns {string} Unique identifier
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Safe JSON parse with error handling
   * @param {string} jsonString - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} Parsed object or default value
   */
  safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON parse error:', error);
      return defaultValue;
    }
  },

  /**
   * Safe JSON stringify with error handling
   * @param {*} obj - Object to stringify
   * @param {string} defaultValue - Default value if stringify fails
   * @returns {string} JSON string or default value
   */
  safeJsonStringify(obj, defaultValue = '{}') {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.warn('JSON stringify error:', error);
      return defaultValue;
    }
  },

  /**
   * Common line detection logic
   * @param {number[][]} board - Game board
   * @param {Array} cells - Array of cell positions
   * @returns {boolean} Whether line is complete
   */
  isLineComplete(board, cells) {
    return cells.every(
      ([row, col]) => board[row][col] !== CONSTANTS.CELL_STATES.EMPTY
    );
  },

  /**
   * Get all possible lines for a position
   * @param {number} row - Row position
   * @param {number} col - Column position
   * @param {number} boardSize - Board size
   * @returns {Array} Array of line types that pass through this position
   */
  getRelevantLineTypes(row, col, boardSize = CONSTANTS.BOARD_SIZE) {
    const lines = [
      CONSTANTS.LINE_TYPES.HORIZONTAL,
      CONSTANTS.LINE_TYPES.VERTICAL
    ];

    // Check diagonal lines
    if (row === col) {
      lines.push(CONSTANTS.LINE_TYPES.DIAGONAL_MAIN);
    }

    if (row + col === boardSize - 1) {
      lines.push(CONSTANTS.LINE_TYPES.DIAGONAL_ANTI);
    }

    return lines;
  },

  /**
   * Calculate confidence level based on value differences
   * @param {Array} moves - Array of move evaluations
   * @param {Object} weights - Algorithm weights
   * @returns {string} Confidence level
   */
  calculateConfidenceLevel(moves, weights) {
    if (moves.length < 2) {
      return 'high';
    }

    const bestValue = moves[0].value;
    const secondBestValue = moves[1].value;
    const difference = bestValue - secondBestValue;

    if (difference >= weights.COMPLETE_LINE) {
      return 'very-high';
    } else if (difference >= weights.COOPERATIVE_LINE) {
      return 'high';
    } else if (difference >= weights.POTENTIAL_LINE) {
      return 'medium';
    } else {
      return 'low';
    }
  },

  /**
   * Create a memoization wrapper for expensive functions
   * @param {Function} fn - Function to memoize
   * @param {Function} keyGenerator - Function to generate cache key
   * @param {number} maxSize - Maximum cache size
   * @returns {Function} Memoized function
   */
  memoize(fn, keyGenerator, maxSize = 100) {
    const cache = new Map();

    return function (...args) {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn.apply(this, args);

      // Implement LRU eviction
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      cache.set(key, result);
      return result;
    };
  },

  /**
   * Validate and sanitize input parameters
   * @param {*} value - Value to validate
   * @param {string} type - Expected type
   * @param {*} defaultValue - Default value if validation fails
   * @returns {*} Validated value
   */
  validateInput(value, type, defaultValue = null) {
    switch (type) {
      case 'number':
        return typeof value === 'number' && !isNaN(value)
          ? value
          : defaultValue;
      case 'string':
        return typeof value === 'string' ? value : defaultValue;
      case 'boolean':
        return typeof value === 'boolean' ? value : defaultValue;
      case 'array':
        return Array.isArray(value) ? value : defaultValue;
      case 'object':
        return value && typeof value === 'object' && !Array.isArray(value)
          ? value
          : defaultValue;
      default:
        return value !== undefined && value !== null ? value : defaultValue;
    }
  },

  /**
   * Deep clone an object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }

    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }
};

// Custom error class
class GameError extends Error {
  constructor(message, type) {
    super(message);
    this.name = 'GameError';
    this.type = type;
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONSTANTS, Utils, GameError };
} else if (typeof window !== 'undefined') {
  // Only assign if not already defined to prevent redeclaration
  if (!window.CONSTANTS) window.CONSTANTS = CONSTANTS;
  if (!window.Utils) window.Utils = Utils;
  if (!window.GameError) window.GameError = GameError;
}
