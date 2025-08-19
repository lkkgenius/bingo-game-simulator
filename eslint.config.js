// ESLint configuration for Bingo Game Simulator
module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',

        // Node.js globals (for test files)
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'writable',

        // Test framework globals
        describe: 'writable',
        test: 'writable',
        expect: 'writable',
        beforeEach: 'writable',
        afterEach: 'writable',

        // Game-specific globals
        GameEngine: 'writable',
        GameBoard: 'writable',
        LineDetector: 'writable',
        ProbabilityCalculator: 'writable',
        EnhancedProbabilityCalculator: 'writable',
        PerformanceMonitor: 'writable',
        AlgorithmComparison: 'writable',
        AILearningSystem: 'writable',
        SafeDOM: 'writable',
        SecurityUtils: 'writable',

        // Application globals
        gameEngine: 'writable',
        gameBoard: 'writable',
        performanceMonitor: 'writable',
        aiLearningSystem: 'writable',
        i18n: 'writable',
        logger: 'writable',
        gameState: 'writable',
        handleCellClick: 'writable',
        CONSTANTS: 'writable',
        standardIsIntersection: 'writable',
        enhancedIsIntersection: 'writable',

        // Loading and UI globals
        showGlobalLoading: 'writable',
        hideGlobalLoading: 'writable',
        showGameBoardLoading: 'writable',
        hideGameBoardLoading: 'writable',
        showButtonLoading: 'writable',
        hideButtonLoading: 'writable',
        updateLoadingProgress: 'writable',
        progressiveLoader: 'writable',
        initializeProgressiveLoading: 'writable',
        initializeCompatibilityCheck: 'writable',

        // Message and modal globals
        showSuccessMessage: 'writable',
        showErrorMessage: 'writable',
        showWarningMessage: 'writable',
        showErrorModal: 'writable',
        globalErrorBoundary: 'writable'
      }
    },
    rules: {
      // Only code quality rules, NO formatting rules
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-redeclare': 'off',
      'no-console': 'off',
      'no-alert': 'warn',
      
      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error'
    }
  }
];
