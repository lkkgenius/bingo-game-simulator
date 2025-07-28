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
    return Array(size).fill().map(() => Array(size).fill(CONSTANTS.CELL_STATES.EMPTY));
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
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
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
  window.CONSTANTS = CONSTANTS;
  window.Utils = Utils;
  window.GameError = GameError;
}