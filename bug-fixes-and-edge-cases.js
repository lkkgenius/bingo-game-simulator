/**
 * Bug Fixes and Edge Case Handler
 * Comprehensive system for handling edge cases and fixing potential bugs
 */

class BugFixHandler {
  constructor() {
    this.fixedIssues = new Set();
    this.edgeCaseHandlers = new Map();
    this.validationRules = new Map();
    this.isInitialized = false;

    this.init();
  }

  /**
   * Initialize bug fix handler
   */
  init() {
    if (this.isInitialized) return;

    try {
      this.setupValidationRules();
      this.setupEdgeCaseHandlers();
      this.applyPreventiveFixes();
      this.setupGlobalErrorHandling();

      this.isInitialized = true;
      console.log('Bug fix handler initialized');
    } catch (error) {
      console.error('Failed to initialize bug fix handler:', error);
    }
  }

  /**
   * Setup validation rules
   */
  setupValidationRules() {
    // Game state validation
    this.validationRules.set('gameState', {
      validate: state => {
        if (!state) return { valid: false, error: 'Game state is null' };
        if (!state.board || !Array.isArray(state.board)) {
          return { valid: false, error: 'Invalid board structure' };
        }
        if (state.board.length !== 5) {
          return { valid: false, error: 'Board must be 5x5' };
        }
        for (let row of state.board) {
          if (!Array.isArray(row) || row.length !== 5) {
            return { valid: false, error: 'Invalid row structure' };
          }
          for (let cell of row) {
            if (![0, 1, 2].includes(cell)) {
              return { valid: false, error: 'Invalid cell value' };
            }
          }
        }
        return { valid: true };
      },
      fix: state => {
        if (!state) {
          return this.createDefaultGameState();
        }
        if (!state.board || !Array.isArray(state.board)) {
          state.board = Array(5)
            .fill()
            .map(() => Array(5).fill(0));
        }
        // Fix board dimensions
        if (state.board.length !== 5) {
          state.board = Array(5)
            .fill()
            .map(() => Array(5).fill(0));
        }
        // Fix row dimensions and cell values
        for (let i = 0; i < 5; i++) {
          if (!Array.isArray(state.board[i]) || state.board[i].length !== 5) {
            state.board[i] = Array(5).fill(0);
          }
          for (let j = 0; j < 5; j++) {
            if (![0, 1, 2].includes(state.board[i][j])) {
              state.board[i][j] = 0;
            }
          }
        }
        return state;
      }
    });

    // Move validation
    this.validationRules.set('move', {
      validate: (row, col, board) => {
        if (typeof row !== 'number' || typeof col !== 'number') {
          return { valid: false, error: 'Row and column must be numbers' };
        }
        if (row < 0 || row >= 5 || col < 0 || col >= 5) {
          return { valid: false, error: 'Move out of bounds' };
        }
        if (!board || !board[row] || board[row][col] !== 0) {
          return { valid: false, error: 'Cell is not empty' };
        }
        return { valid: true };
      },
      fix: (row, col, board) => {
        // Find nearest valid position
        row = Math.max(0, Math.min(4, Math.round(row)));
        col = Math.max(0, Math.min(4, Math.round(col)));

        // If position is occupied, find nearest empty cell
        if (board && board[row] && board[row][col] !== 0) {
          const emptyCell = this.findNearestEmptyCell(row, col, board);
          if (emptyCell) {
            return emptyCell;
          }
        }

        return { row, col };
      }
    });

    // Suggestion validation
    this.validationRules.set('suggestion', {
      validate: suggestion => {
        if (!suggestion || typeof suggestion !== 'object') {
          return { valid: false, error: 'Invalid suggestion object' };
        }
        if (
          typeof suggestion.row !== 'number' ||
          typeof suggestion.col !== 'number'
        ) {
          return { valid: false, error: 'Invalid suggestion coordinates' };
        }
        if (
          suggestion.row < 0 ||
          suggestion.row >= 5 ||
          suggestion.col < 0 ||
          suggestion.col >= 5
        ) {
          return { valid: false, error: 'Suggestion out of bounds' };
        }
        if (typeof suggestion.value !== 'number' || isNaN(suggestion.value)) {
          return { valid: false, error: 'Invalid suggestion value' };
        }
        return { valid: true };
      },
      fix: suggestion => {
        if (!suggestion || typeof suggestion !== 'object') {
          return { row: 2, col: 2, value: 0, confidence: 0.5 };
        }

        return {
          row: Math.max(0, Math.min(4, Math.round(suggestion.row || 2))),
          col: Math.max(0, Math.min(4, Math.round(suggestion.col || 2))),
          value: isNaN(suggestion.value) ? 0 : Number(suggestion.value),
          confidence: Math.max(0, Math.min(1, suggestion.confidence || 0.5)),
          reasoning: suggestion.reasoning || '預設建議'
        };
      }
    });
  }

  /**
   * Setup edge case handlers
   */
  setupEdgeCaseHandlers() {
    // Handle rapid clicking
    this.edgeCaseHandlers.set('rapidClicking', {
      lastClickTime: 0,
      clickCount: 0,
      handle: event => {
        const now = Date.now();
        const timeDiff =
          now - this.edgeCaseHandlers.get('rapidClicking').lastClickTime;

        if (timeDiff < 100) {
          // Less than 100ms between clicks
          this.edgeCaseHandlers.get('rapidClicking').clickCount++;
          if (this.edgeCaseHandlers.get('rapidClicking').clickCount > 3) {
            console.warn('Rapid clicking detected, throttling...');
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        } else {
          this.edgeCaseHandlers.get('rapidClicking').clickCount = 0;
        }

        this.edgeCaseHandlers.get('rapidClicking').lastClickTime = now;
        return true;
      }
    });

    // Handle memory leaks
    this.edgeCaseHandlers.set('memoryLeak', {
      intervalIds: new Set(),
      timeoutIds: new Set(),
      eventListeners: new Map(),
      handle: () => {
        // Clean up intervals
        this.edgeCaseHandlers.get('memoryLeak').intervalIds.forEach(id => {
          clearInterval(id);
        });
        this.edgeCaseHandlers.get('memoryLeak').intervalIds.clear();

        // Clean up timeouts
        this.edgeCaseHandlers.get('memoryLeak').timeoutIds.forEach(id => {
          clearTimeout(id);
        });
        this.edgeCaseHandlers.get('memoryLeak').timeoutIds.clear();

        // Clean up event listeners
        this.edgeCaseHandlers
          .get('memoryLeak')
          .eventListeners.forEach((listener, element) => {
            if (element && element.removeEventListener) {
              element.removeEventListener(listener.event, listener.handler);
            }
          });
        this.edgeCaseHandlers.get('memoryLeak').eventListeners.clear();
      }
    });

    // Handle DOM manipulation errors
    this.edgeCaseHandlers.set('domError', {
      handle: (element, operation, fallback) => {
        try {
          if (!element) {
            console.warn('DOM element is null, using fallback');
            return fallback ? fallback() : null;
          }

          if (!document.contains(element)) {
            console.warn('DOM element is not in document, recreating...');
            return fallback ? fallback() : null;
          }

          return operation(element);
        } catch (error) {
          console.error('DOM operation failed:', error);
          return fallback ? fallback() : null;
        }
      }
    });

    // Handle algorithm errors
    this.edgeCaseHandlers.set('algorithmError', {
      handle: (algorithmFn, fallbackFn, ...args) => {
        try {
          const result = algorithmFn(...args);

          // Validate result
          if (result === null || result === undefined) {
            console.warn('Algorithm returned null/undefined, using fallback');
            return fallbackFn ? fallbackFn(...args) : null;
          }

          return result;
        } catch (error) {
          console.error('Algorithm error:', error);
          return fallbackFn ? fallbackFn(...args) : null;
        }
      }
    });

    // Handle network errors
    this.edgeCaseHandlers.set('networkError', {
      retryCount: 0,
      maxRetries: 3,
      handle: async (networkFn, ...args) => {
        const handler = this.edgeCaseHandlers.get('networkError');

        try {
          const result = await networkFn(...args);
          handler.retryCount = 0; // Reset on success
          return result;
        } catch (error) {
          handler.retryCount++;

          if (handler.retryCount <= handler.maxRetries) {
            console.warn(
              `Network error, retrying (${handler.retryCount}/${handler.maxRetries}):`,
              error
            );
            // Exponential backoff
            await new Promise(resolve =>
              setTimeout(resolve, Math.pow(2, handler.retryCount) * 1000)
            );
            return this.edgeCaseHandlers
              .get('networkError')
              .handle(networkFn, ...args);
          } else {
            console.error('Network error after max retries:', error);
            handler.retryCount = 0;
            throw error;
          }
        }
      }
    });
  }

  /**
   * Apply preventive fixes
   */
  applyPreventiveFixes() {
    // Fix 1: Prevent multiple game initialization
    this.preventMultipleInitialization();

    // Fix 2: Handle missing dependencies
    this.handleMissingDependencies();

    // Fix 3: Fix timing issues
    this.fixTimingIssues();

    // Fix 4: Handle browser compatibility
    this.handleBrowserCompatibility();

    // Fix 5: Fix memory leaks
    this.preventMemoryLeaks();

    // Fix 6: Handle touch events properly
    this.fixTouchEvents();

    // Fix 7: Fix focus management
    this.fixFocusManagement();
  }

  /**
   * Prevent multiple game initialization
   */
  preventMultipleInitialization() {
    if (this.fixedIssues.has('multipleInit')) return;

    // Override initializeGame to prevent multiple calls
    if (typeof window.initializeGame === 'function') {
      const originalInit = window.initializeGame;
      let isInitializing = false;
      let isInitialized = false;

      window.initializeGame = function (...args) {
        if (isInitializing || isInitialized) {
          console.warn('Game initialization already in progress or completed');
          return;
        }

        isInitializing = true;
        try {
          const result = originalInit.apply(this, args);
          isInitialized = true;
          return result;
        } finally {
          isInitializing = false;
        }
      };
    }

    this.fixedIssues.add('multipleInit');
  }

  /**
   * Handle missing dependencies
   */
  handleMissingDependencies() {
    if (this.fixedIssues.has('missingDeps')) return;

    // Check for required globals
    const requiredGlobals = [
      'SafeDOM',
      'logger',
      'gameState',
      'LineDetector',
      'ProbabilityCalculator'
    ];

    requiredGlobals.forEach(globalName => {
      if (typeof window[globalName] === 'undefined') {
        console.warn(`Missing global: ${globalName}, creating placeholder`);

        switch (globalName) {
          case 'SafeDOM':
            window.SafeDOM = {
              createElement: (tag, attrs, text) => {
                const el = document.createElement(tag);
                if (attrs) Object.assign(el, attrs);
                if (text) el.textContent = text;
                return el;
              },
              createStructure: struct => {
                return document.createElement(struct.tag || 'div');
              }
            };
            break;
          case 'logger':
            window.logger = {
              info: console.log.bind(console),
              warn: console.warn.bind(console),
              error: console.error.bind(console),
              debug: console.debug.bind(console)
            };
            break;
        }
      }
    });

    this.fixedIssues.add('missingDeps');
  }

  /**
   * Fix timing issues
   */
  fixTimingIssues() {
    if (this.fixedIssues.has('timing')) return;

    // Ensure DOM is ready before operations
    const originalAddEventListener = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function (event, handler, options) {
      if (document.readyState === 'loading' && event === 'click') {
        document.addEventListener('DOMContentLoaded', () => {
          originalAddEventListener.call(this, event, handler, options);
        });
      } else {
        originalAddEventListener.call(this, event, handler, options);
      }
    };

    this.fixedIssues.add('timing');
  }

  /**
   * Handle browser compatibility
   */
  handleBrowserCompatibility() {
    if (this.fixedIssues.has('compatibility')) return;

    // Polyfill for requestAnimationFrame
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback) {
        return setTimeout(callback, 16);
      };
    }

    // Polyfill for performance.now
    if (!window.performance || !window.performance.now) {
      window.performance = window.performance || {};
      window.performance.now = function () {
        return Date.now();
      };
    }

    // Fix for older browsers without CSS.supports
    if (!window.CSS || !window.CSS.supports) {
      window.CSS = window.CSS || {};
      window.CSS.supports = function () {
        return true; // Assume support for simplicity
      };
    }

    this.fixedIssues.add('compatibility');
  }

  /**
   * Prevent memory leaks
   */
  preventMemoryLeaks() {
    if (this.fixedIssues.has('memoryLeaks')) return;

    // Override setTimeout and setInterval to track them
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    const originalClearTimeout = window.clearTimeout;
    const originalClearInterval = window.clearInterval;

    const activeTimeouts = new Set();
    const activeIntervals = new Set();

    window.setTimeout = function (callback, delay, ...args) {
      const id = originalSetTimeout.call(
        this,
        (...callbackArgs) => {
          activeTimeouts.delete(id);
          callback(...callbackArgs);
        },
        delay,
        ...args
      );
      activeTimeouts.add(id);
      return id;
    };

    window.setInterval = function (callback, delay, ...args) {
      const id = originalSetInterval.call(this, callback, delay, ...args);
      activeIntervals.add(id);
      return id;
    };

    window.clearTimeout = function (id) {
      activeTimeouts.delete(id);
      return originalClearTimeout.call(this, id);
    };

    window.clearInterval = function (id) {
      activeIntervals.delete(id);
      return originalClearInterval.call(this, id);
    };

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      activeTimeouts.forEach(id => clearTimeout(id));
      activeIntervals.forEach(id => clearInterval(id));
    });

    this.fixedIssues.add('memoryLeaks');
  }

  /**
   * Fix touch events
   */
  fixTouchEvents() {
    if (this.fixedIssues.has('touchEvents')) return;

    // Prevent double-tap zoom on game cells
    document.addEventListener(
      'touchstart',
      event => {
        if (event.target.classList.contains('game-cell')) {
          event.preventDefault();
        }
      },
      { passive: false }
    );

    // Handle touch events properly
    let lastTouchTime = 0;
    document.addEventListener('touchend', event => {
      const now = Date.now();
      if (now - lastTouchTime < 300) {
        // Prevent rapid touches
        event.preventDefault();
        return;
      }
      lastTouchTime = now;
    });

    this.fixedIssues.add('touchEvents');
  }

  /**
   * Fix focus management
   */
  fixFocusManagement() {
    if (this.fixedIssues.has('focusManagement')) return;

    // Ensure focus is visible
    document.addEventListener('focusin', event => {
      if (event.target) {
        event.target.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    });

    // Handle focus trapping in modals
    document.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        const modal = document.querySelector('.modal:not(.hidden)');
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            } else if (
              !event.shiftKey &&
              document.activeElement === lastElement
            ) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    });

    this.fixedIssues.add('focusManagement');
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      console.error('Unhandled promise rejection:', event.reason);

      // Try to recover gracefully
      if (event.reason && event.reason.message) {
        if (event.reason.message.includes('game')) {
          this.recoverGameState();
        } else if (event.reason.message.includes('network')) {
          this.handleNetworkError(event.reason);
        }
      }

      // Prevent default browser behavior
      event.preventDefault();
    });

    // Handle script errors
    window.addEventListener('error', event => {
      console.error('Script error:', event.error);

      // Try to recover based on error type
      if (event.filename && event.filename.includes('game')) {
        this.recoverGameState();
      }
    });
  }

  /**
   * Validate and fix data
   */
  validateAndFix(type, data, ...args) {
    const rule = this.validationRules.get(type);
    if (!rule) {
      console.warn(`No validation rule for type: ${type}`);
      return data;
    }

    const validation = rule.validate(data, ...args);
    if (validation.valid) {
      return data;
    }

    console.warn(`Validation failed for ${type}: ${validation.error}`);
    return rule.fix(data, ...args);
  }

  /**
   * Handle edge case
   */
  handleEdgeCase(type, ...args) {
    const handler = this.edgeCaseHandlers.get(type);
    if (!handler) {
      console.warn(`No edge case handler for type: ${type}`);
      return null;
    }

    return handler.handle(...args);
  }

  /**
   * Find nearest empty cell
   */
  findNearestEmptyCell(row, col, board) {
    const visited = new Set();
    const queue = [[row, col, 0]]; // [row, col, distance]

    while (queue.length > 0) {
      const [r, c, dist] = queue.shift();
      const key = `${r},${c}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (r >= 0 && r < 5 && c >= 0 && c < 5 && board[r][c] === 0) {
        return { row: r, col: c };
      }

      // Add neighbors
      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
      ];

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
          queue.push([nr, nc, dist + 1]);
        }
      }
    }

    return null; // No empty cell found
  }

  /**
   * Create default game state
   */
  createDefaultGameState() {
    return {
      board: Array(5)
        .fill()
        .map(() => Array(5).fill(0)),
      currentRound: 1,
      maxRounds: 8,
      gamePhase: 'waiting',
      playerMoves: [],
      computerMoves: [],
      completedLines: [],
      gameStarted: false,
      gameEnded: false
    };
  }

  /**
   * Recover game state
   */
  recoverGameState() {
    console.log('Attempting to recover game state...');

    try {
      if (window.gameState) {
        window.gameState = this.validateAndFix('gameState', window.gameState);
      } else {
        window.gameState = this.createDefaultGameState();
      }

      // Reinitialize game if needed
      if (typeof window.initializeGame === 'function') {
        window.initializeGame();
      }

      console.log('Game state recovered successfully');
    } catch (error) {
      console.error('Failed to recover game state:', error);
    }
  }

  /**
   * Handle network error
   */
  handleNetworkError(error) {
    console.log('Handling network error:', error);

    // Show user-friendly message
    if (typeof showWarningMessage === 'function') {
      showWarningMessage('網路連接出現問題，某些功能可能受影響', 5000);
    }

    // Enable offline mode if available
    if (document.body) {
      document.body.classList.add('offline-mode');
    }
  }

  /**
   * Get fix status
   */
  getFixStatus() {
    return {
      isInitialized: this.isInitialized,
      fixedIssues: Array.from(this.fixedIssues),
      availableHandlers: Array.from(this.edgeCaseHandlers.keys()),
      availableValidators: Array.from(this.validationRules.keys())
    };
  }
}

// Create global bug fix handler instance
const bugFixHandler = new BugFixHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BugFixHandler;
} else {
  window.BugFixHandler = BugFixHandler;
  window.bugFixHandler = bugFixHandler;
}
