// ESLint configuration for Bingo Game Simulator
module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
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
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        CustomEvent: 'readonly',
        Response: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        PerformanceObserver: 'readonly',
        MutationObserver: 'readonly',
        Node: 'readonly',
        Element: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        CSS: 'readonly',

        // Service Worker globals
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',

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
        globalErrorBoundary: 'writable',

        // Browser automation globals (for E2E tests)
        browser_click: 'readonly',
        browser_evaluate: 'readonly',
        browser_navigate: 'readonly',
        browser_take_screenshot: 'readonly',

        // Analytics
        gtag: 'readonly'
      }
    },
    rules: {
      // Error prevention
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-redeclare': 'off', // Allow redeclaring globals for test setup
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',

      // Best practices (formatting handled by Prettier)
      'no-console': 'off', // Allow console for debugging
      'no-alert': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // Security
      'no-unsafe-finally': 'error',

      // Performance
      'no-loop-func': 'warn',
      'no-inner-declarations': 'error'
    }
  },
  {
    files: [
      '*.test.js',
      'testRunner.js',
      'e2e.test.js',
      'playwright-e2e.test.js'
    ],
    rules: {
      'no-unused-vars': 'off', // Allow unused vars in tests
      'no-alert': 'off', // Allow alerts in tests
      'no-redeclare': 'off' // Allow redeclaring test globals
    }
  },
  {
    files: ['sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        URL: 'readonly'
      }
    }
  }
];
