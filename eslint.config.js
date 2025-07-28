// ESLint configuration for Bingo Game Simulator
export default [
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
        
        // Node.js globals (for test files)
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        
        // Test framework globals
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        
        // Game-specific globals
        GameEngine: 'readonly',
        GameBoard: 'readonly',
        LineDetector: 'readonly',
        ProbabilityCalculator: 'readonly',
        EnhancedProbabilityCalculator: 'readonly',
        PerformanceMonitor: 'readonly',
        AlgorithmComparison: 'readonly',
        AILearningSystem: 'readonly'
      }
    },
    rules: {
      // Error prevention
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-redeclare': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      
      // Code style
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      
      // Best practices
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
    files: ['*.test.js'],
    rules: {
      'no-unused-vars': 'off' // Allow unused vars in tests
    }
  }
];