/**
 * Script Loading Architecture - Refactored to use ModuleLoader
 * Implements conditional loading, performance monitoring, and eliminates global pollution
 */

// Environment detection
const Environment = {
  isDevelopment: () => {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('debug=true') ||
      window.location.search.includes('dev=true')
    );
  },

  isProduction: () => {
    return !Environment.isDevelopment();
  },

  getMode: () => {
    return Environment.isDevelopment() ? 'development' : 'production';
  }
};

// Performance monitoring for script loading
class LoadingPerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: performance.now(),
      moduleLoadTimes: new Map(),
      totalLoadTime: 0,
      criticalPathTime: 0,
      errors: [],
      warnings: []
    };

    this.thresholds = {
      moduleLoadWarning: 1000, // 1 second
      moduleLoadError: 5000, // 5 seconds
      totalLoadWarning: 3000, // 3 seconds
      totalLoadError: 10000 // 10 seconds
    };
  }

  /**
   * Start timing a module load
   * @param {string} modulePath - Path to the module
   */
  startModuleLoad(modulePath) {
    this.metrics.moduleLoadTimes.set(modulePath, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
      status: 'loading'
    });
  }

  /**
   * End timing a module load
   * @param {string} modulePath - Path to the module
   * @param {boolean} success - Whether the load was successful
   * @param {Error} error - Error if load failed
   */
  endModuleLoad(modulePath, success = true, error = null) {
    const moduleMetric = this.metrics.moduleLoadTimes.get(modulePath);
    if (!moduleMetric) return;

    const endTime = performance.now();
    moduleMetric.endTime = endTime;
    moduleMetric.duration = endTime - moduleMetric.startTime;
    moduleMetric.status = success ? 'loaded' : 'failed';
    moduleMetric.error = error;

    // Check thresholds and log warnings/errors
    if (moduleMetric.duration > this.thresholds.moduleLoadError) {
      this.metrics.errors.push({
        type: 'slow-load',
        module: modulePath,
        duration: moduleMetric.duration,
        threshold: this.thresholds.moduleLoadError
      });
    } else if (moduleMetric.duration > this.thresholds.moduleLoadWarning) {
      this.metrics.warnings.push({
        type: 'slow-load',
        module: modulePath,
        duration: moduleMetric.duration,
        threshold: this.thresholds.moduleLoadWarning
      });
    }

    if (!success && error) {
      this.metrics.errors.push({
        type: 'load-error',
        module: modulePath,
        error: error.message
      });
    }
  }

  /**
   * Mark the end of critical path loading
   */
  endCriticalPath() {
    this.metrics.criticalPathTime = performance.now() - this.metrics.startTime;
  }

  /**
   * Mark the end of total loading
   */
  endTotalLoad() {
    this.metrics.totalLoadTime = performance.now() - this.metrics.startTime;

    // Check total load time thresholds
    if (this.metrics.totalLoadTime > this.thresholds.totalLoadError) {
      this.metrics.errors.push({
        type: 'total-load-slow',
        duration: this.metrics.totalLoadTime,
        threshold: this.thresholds.totalLoadError
      });
    } else if (this.metrics.totalLoadTime > this.thresholds.totalLoadWarning) {
      this.metrics.warnings.push({
        type: 'total-load-slow',
        duration: this.metrics.totalLoadTime,
        threshold: this.thresholds.totalLoadWarning
      });
    }
  }

  /**
   * Get performance report
   * @returns {Object} Performance metrics and analysis
   */
  getReport() {
    const moduleMetrics = Array.from(
      this.metrics.moduleLoadTimes.entries()
    ).map(([path, metric]) => ({
      path,
      ...metric
    }));

    const successfulLoads = moduleMetrics.filter(m => m.status === 'loaded');
    const failedLoads = moduleMetrics.filter(m => m.status === 'failed');
    const averageLoadTime =
      successfulLoads.length > 0
        ? successfulLoads.reduce((sum, m) => sum + m.duration, 0) /
          successfulLoads.length
        : 0;

    return {
      environment: Environment.getMode(),
      totalLoadTime: this.metrics.totalLoadTime,
      criticalPathTime: this.metrics.criticalPathTime,
      moduleCount: moduleMetrics.length,
      successfulLoads: successfulLoads.length,
      failedLoads: failedLoads.length,
      averageLoadTime,
      slowestModule: successfulLoads.reduce(
        (slowest, current) =>
          current.duration > (slowest?.duration || 0) ? current : slowest,
        null
      ),
      fastestModule: successfulLoads.reduce(
        (fastest, current) =>
          current.duration < (fastest?.duration || Infinity)
            ? current
            : fastest,
        null
      ),
      errors: this.metrics.errors,
      warnings: this.metrics.warnings,
      modules: moduleMetrics,
      recommendations: this.generateRecommendations(moduleMetrics)
    };
  }

  /**
   * Generate performance recommendations
   * @private
   * @param {Array} moduleMetrics - Module loading metrics
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(moduleMetrics) {
    const recommendations = [];

    // Check for slow modules
    const slowModules = moduleMetrics.filter(
      m =>
        m.duration > this.thresholds.moduleLoadWarning && m.status === 'loaded'
    );

    if (slowModules.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `${slowModules.length} modules loaded slowly. Consider code splitting or optimization.`,
        modules: slowModules.map(m => m.path)
      });
    }

    // Check for failed loads
    const failedModules = moduleMetrics.filter(m => m.status === 'failed');
    if (failedModules.length > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `${failedModules.length} modules failed to load. Check network connectivity and file paths.`,
        modules: failedModules.map(m => m.path)
      });
    }

    // Check total load time
    if (this.metrics.totalLoadTime > this.thresholds.totalLoadWarning) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message:
          'Total load time is high. Consider implementing progressive loading or reducing bundle size.',
        totalTime: this.metrics.totalLoadTime
      });
    }

    return recommendations;
  }

  /**
   * Log performance report to console (development mode only)
   */
  logReport() {
    if (!Environment.isDevelopment()) return;

    const report = this.getReport();

    console.group('🚀 Script Loading Performance Report');
    console.log('Environment:', report.environment);
    console.log('Total Load Time:', `${report.totalLoadTime.toFixed(2)}ms`);
    console.log(
      'Critical Path Time:',
      `${report.criticalPathTime.toFixed(2)}ms`
    );
    console.log(
      'Modules Loaded:',
      `${report.successfulLoads}/${report.moduleCount}`
    );

    if (report.averageLoadTime > 0) {
      console.log(
        'Average Module Load Time:',
        `${report.averageLoadTime.toFixed(2)}ms`
      );
    }

    if (report.slowestModule) {
      console.log(
        'Slowest Module:',
        report.slowestModule.path,
        `(${report.slowestModule.duration.toFixed(2)}ms)`
      );
    }

    if (report.errors.length > 0) {
      console.group('❌ Errors');
      report.errors.forEach(error => console.error(error));
      console.groupEnd();
    }

    if (report.warnings.length > 0) {
      console.group('⚠️ Warnings');
      report.warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }

    if (report.recommendations.length > 0) {
      console.group('💡 Recommendations');
      report.recommendations.forEach(rec => {
        const icon = rec.priority === 'high' ? '🔴' : '🟡';
        console.log(`${icon} ${rec.message}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }
}

// Conditional module configuration
class ConditionalModuleConfig {
  constructor() {
    this.configs = {
      development: {
        modules: [
          // Core modules (always loaded first)
          'safe-dom.js',
          'production-logger.js',
          'security-utils.js',
          'error-boundary.js',
          'utils/common.js',

          // Base probability calculator
          'utils/baseProbabilityCalculator.js',

          // Game modules
          'lineDetector.js',
          'probabilityCalculator.js',
          'gameBoard.js',
          'gameEngine.js',

          // Main script
          'script.js',

          // Development-specific modules (if available)
          'debug-probability.js',

          // Enhanced features
          'probabilityCalculator.enhanced.js',
          'algorithmComparison.js',
          'aiLearningSystem.js',

          // UI enhancements
          'i18n.js',
          'accessibility-enhancements.js',
          'suggestion-enhancements.js',
          'bug-fixes-and-edge-cases.js',

          // Performance and monitoring
          'performance-monitor.js',
          'loading-functions.js',

          // Mobile support
          'mobile-touch.js',
          'gesture-support.js',

          // PWA
          'pwa-manager.js'
        ],
        loadingStrategy: 'progressive',
        enableDebugMode: true,
        enablePerformanceMonitoring: true
      },

      production: {
        modules: [
          // Core modules (always loaded first)
          'safe-dom.js',
          'production-logger.js',
          'security-utils.js',
          'error-boundary.js',
          'utils/common.js',

          // Base probability calculator
          'utils/baseProbabilityCalculator.js',

          // Game modules
          'lineDetector.js',
          'probabilityCalculator.js',
          'gameBoard.js',
          'gameEngine.js',

          // Main script
          'script.js',

          // Enhanced features (lazy loaded)
          'probabilityCalculator.enhanced.js',
          'aiLearningSystem.js',

          // UI enhancements
          'i18n.js',
          'accessibility-enhancements.js',
          'suggestion-enhancements.js',
          'bug-fixes-and-edge-cases.js',

          // Performance optimizations
          'performance-monitor.js',
          'loading-functions.js',

          // Mobile support
          'mobile-touch.js',
          'gesture-support.js',

          // PWA
          'pwa-manager.js'
        ],
        loadingStrategy: 'optimized',
        enableDebugMode: false,
        enablePerformanceMonitoring: false
      }
    };
  }

  /**
   * Get configuration for current environment
   * @returns {Object} Environment-specific configuration
   */
  getCurrentConfig() {
    const mode = Environment.getMode();
    return this.configs[mode] || this.configs.production;
  }

  /**
   * Get modules to load for current environment
   * @returns {Array} Array of module paths
   */
  getModulesToLoad() {
    return this.getCurrentConfig().modules;
  }

  /**
   * Get loading strategy for current environment
   * @returns {string} Loading strategy name
   */
  getLoadingStrategy() {
    return this.getCurrentConfig().loadingStrategy;
  }

  /**
   * Check if debug mode is enabled
   * @returns {boolean} Whether debug mode is enabled
   */
  isDebugModeEnabled() {
    return this.getCurrentConfig().enableDebugMode;
  }

  /**
   * Check if performance monitoring is enabled
   * @returns {boolean} Whether performance monitoring is enabled
   */
  isPerformanceMonitoringEnabled() {
    return this.getCurrentConfig().enablePerformanceMonitoring;
  }
}

// Enhanced Script Loader with module loader integration
class EnhancedScriptLoader {
  constructor() {
    this.config = new ConditionalModuleConfig();
    this.performanceMonitor = new LoadingPerformanceMonitor();
    this.moduleLoader = null;
    this.progressiveLoader = null;
    this.loadingCallbacks = [];
    this.errorCallbacks = [];
    this.isInitialized = false;

    // Global namespace management
    this.globalNamespace = 'BingoGame';
    this.setupGlobalNamespace();
  }

  /**
   * Setup global namespace to prevent pollution
   */
  setupGlobalNamespace() {
    if (typeof window !== 'undefined') {
      window[this.globalNamespace] = window[this.globalNamespace] || {
        modules: {},
        components: {},
        utils: {},
        config: {},
        version: '1.0.0'
      };
    }
  }

  /**
   * Initialize the script loader
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load the module loader first
      await this.loadModuleLoader();

      // Initialize module loader instances
      this.moduleLoader = window.moduleLoader;
      this.progressiveLoader = window.progressiveLoader;

      // Setup performance monitoring integration
      this.setupPerformanceMonitoring();

      // Setup error handling
      this.setupErrorHandling();

      this.isInitialized = true;

      if (Environment.isDevelopment()) {
        console.log('🚀 Enhanced Script Loader initialized');
        console.log('Environment:', Environment.getMode());
        console.log('Debug Mode:', this.config.isDebugModeEnabled());
        console.log(
          'Performance Monitoring:',
          this.config.isPerformanceMonitoringEnabled()
        );
      }
    } catch (error) {
      console.error('Failed to initialize Enhanced Script Loader:', error);
      throw error;
    }
  }

  /**
   * Load the module loader script
   * @private
   */
  async loadModuleLoader() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.moduleLoader && window.progressiveLoader) {
        resolve();
        return;
      }

      // Check if running in Node.js environment (for tests)
      if (typeof window === 'undefined') {
        try {
          const moduleLoaderModule = require('./utils/moduleLoader.js');
          this.moduleLoader = moduleLoaderModule.moduleLoader;
          this.progressiveLoader = moduleLoaderModule.progressiveLoader;
          resolve();
        } catch (error) {
          reject(error);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = './utils/moduleLoader.js';
      script.async = true;

      script.onload = () => {
        document.head.removeChild(script);

        // Wait a bit for the module to initialize
        setTimeout(() => {
          if (window.moduleLoader && window.progressiveLoader) {
            resolve();
          } else {
            reject(new Error('Module loader failed to initialize'));
          }
        }, 100);
      };

      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error('Failed to load module loader'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Setup performance monitoring integration
   * @private
   */
  setupPerformanceMonitoring() {
    if (!this.config.isPerformanceMonitoringEnabled()) return;

    // Integrate with module loader progress tracking
    this.moduleLoader.onProgress(progress => {
      // Update performance metrics based on module loading progress
      Object.entries(progress.modules).forEach(([modulePath, moduleState]) => {
        if (
          moduleState.state === 'loading' &&
          !this.performanceMonitor.metrics.moduleLoadTimes.has(modulePath)
        ) {
          this.performanceMonitor.startModuleLoad(modulePath);
        } else if (moduleState.state === 'loaded') {
          this.performanceMonitor.endModuleLoad(modulePath, true);
        } else if (moduleState.state === 'failed') {
          this.performanceMonitor.endModuleLoad(
            modulePath,
            false,
            moduleState.error
          );
        }
      });
    });
  }

  /**
   * Setup error handling
   * @private
   */
  setupErrorHandling() {
    // Global error handler for script loading errors
    window.addEventListener('error', event => {
      if (event.filename && event.filename.includes('.js')) {
        this.handleLoadingError(
          event.filename,
          event.error || new Error(event.message)
        );
      }
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', event => {
      if (
        event.reason &&
        event.reason.message &&
        event.reason.message.includes('Failed to load')
      ) {
        this.handleLoadingError('unknown', event.reason);
      }
    });
  }

  /**
   * Handle loading errors
   * @private
   * @param {string} modulePath - Path to the failed module
   * @param {Error} error - The error that occurred
   */
  handleLoadingError(modulePath, error) {
    console.error(`Script loading error for ${modulePath}:`, error);

    // Notify error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(modulePath, error);
      } catch (callbackError) {
        console.error('Error in loading error callback:', callbackError);
      }
    });

    // Try to provide fallback or recovery
    this.attemptErrorRecovery(modulePath, error);
  }

  /**
   * Attempt to recover from loading errors
   * @private
   * @param {string} modulePath - Path to the failed module
   * @param {Error} _error - The error that occurred (unused but kept for API consistency)
   */
  attemptErrorRecovery(modulePath, _error) {
    // Define fallback strategies for critical modules
    const fallbackStrategies = {
      'probabilityCalculator.js': () => {
        // Provide a basic fallback implementation
        window.ProbabilityCalculator = class BasicProbabilityCalculator {
          calculateMoveValue() {
            return Math.random();
          }
          getBestSuggestion(board) {
            // Simple fallback: suggest center or random empty cell
            const emptyCells = [];
            for (let row = 0; row < 5; row++) {
              for (let col = 0; col < 5; col++) {
                if (board[row][col] === 0) {
                  emptyCells.push({ row, col });
                }
              }
            }
            return emptyCells.length > 0 ? emptyCells[0] : { row: 2, col: 2 };
          }
        };
        console.warn('Using fallback ProbabilityCalculator implementation');
      },

      'gameBoard.js': () => {
        // Provide a basic fallback implementation
        window.GameBoard = class BasicGameBoard {
          constructor() {
            this.size = 5;
          }
          render() {
            console.warn('GameBoard render fallback');
          }
          updateCell() {
            console.warn('GameBoard updateCell fallback');
          }
        };
        console.warn('Using fallback GameBoard implementation');
      }
    };

    const fallback = fallbackStrategies[modulePath];
    if (fallback) {
      try {
        fallback();
      } catch (fallbackError) {
        console.error('Fallback strategy failed:', fallbackError);
      }
    }
  }

  /**
   * Load all modules using the configured strategy
   */
  async loadModules() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const strategy = this.config.getLoadingStrategy();
    const modules = this.config.getModulesToLoad();

    try {
      this.performanceMonitor.startTime = performance.now();

      if (strategy === 'progressive') {
        await this.loadModulesProgressively(modules);
      } else if (strategy === 'optimized') {
        await this.loadModulesOptimized(modules);
      } else {
        // Fallback to basic loading
        await this.loadModulesBasic(modules);
      }

      this.performanceMonitor.endTotalLoad();

      // Notify completion callbacks
      this.loadingCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in loading completion callback:', error);
        }
      });

      // Log performance report in development
      if (this.config.isPerformanceMonitoringEnabled()) {
        this.performanceMonitor.logReport();
      }
    } catch (error) {
      console.error('Module loading failed:', error);
      throw error;
    }
  }

  /**
   * Load modules using progressive strategy
   * @private
   * @param {Array} modules - Modules to load
   */
  async loadModulesProgressively(modules) {
    // Use the progressive loader for staged loading
    await this.progressiveLoader.startProgressiveLoading();
    this.performanceMonitor.endCriticalPath();
  }

  /**
   * Load modules using optimized strategy (production)
   * @private
   * @param {Array} modules - Modules to load
   */
  async loadModulesOptimized(modules) {
    // Separate critical and non-critical modules
    const criticalModules = [
      'safe-dom.js',
      'production-logger.js',
      'security-utils.js',
      'error-boundary.js',
      'utils/common.js',
      'utils/baseProbabilityCalculator.js',
      'lineDetector.js',
      'probabilityCalculator.js',
      'gameBoard.js',
      'gameEngine.js',
      'script.js'
    ];

    const nonCriticalModules = modules.filter(
      m => !criticalModules.includes(m)
    );

    // Load critical modules first
    await this.moduleLoader.loadModulesInOrder(criticalModules);
    this.performanceMonitor.endCriticalPath();

    // Load non-critical modules in background
    this.moduleLoader
      .loadModulesInChunks(nonCriticalModules, 2)
      .catch(error =>
        console.warn('Non-critical modules failed to load:', error)
      );
  }

  /**
   * Load modules using basic strategy (fallback)
   * @private
   * @param {Array} modules - Modules to load
   */
  async loadModulesBasic(modules) {
    await this.moduleLoader.loadModulesInOrder(modules);
    this.performanceMonitor.endCriticalPath();
  }

  /**
   * Add callback for when loading is complete
   * @param {Function} callback - Callback function
   */
  onLoadingComplete(callback) {
    this.loadingCallbacks.push(callback);
  }

  /**
   * Add callback for loading errors
   * @param {Function} callback - Callback function
   */
  onLoadingError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Get loading status and performance metrics
   * @returns {Object} Status and metrics
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      environment: Environment.getMode(),
      config: this.config.getCurrentConfig(),
      moduleLoader: this.moduleLoader
        ? this.moduleLoader.getLoadingStatus()
        : null,
      performance: this.performanceMonitor.getReport(),
      globalNamespace: this.globalNamespace
    };
  }

  /**
   * Preload specific modules for better performance
   * @param {Array} modules - Modules to preload
   */
  async preloadModules(modules) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.moduleLoader.preloadModules(modules);
  }

  /**
   * Load a module on demand
   * @param {string} modulePath - Path to the module
   * @returns {Promise} Promise that resolves when module is loaded
   */
  async loadOnDemand(modulePath) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.moduleLoader.loadModule(modulePath);
  }
}

// Global instance
const scriptLoader = new EnhancedScriptLoader();

// Export for both environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EnhancedScriptLoader,
    ConditionalModuleConfig,
    LoadingPerformanceMonitor,
    Environment,
    scriptLoader
  };
} else if (typeof window !== 'undefined') {
  window.EnhancedScriptLoader = EnhancedScriptLoader;
  window.ConditionalModuleConfig = ConditionalModuleConfig;
  window.LoadingPerformanceMonitor = LoadingPerformanceMonitor;
  window.Environment = Environment;
  window.scriptLoader = scriptLoader;
}
