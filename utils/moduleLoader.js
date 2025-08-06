/**
 * Module Loader - Implements code splitting and lazy loading
 * Optimizes performance by loading components only when needed
 */

// Logger 初始化
let logger;
if (typeof window !== 'undefined' && window.logger) {
    logger = window.logger;
} else if (typeof require !== 'undefined') {
    try {
        const { logger: prodLogger } = require('../production-logger.js');
        logger = prodLogger;
    } catch (e) {
        // Fallback if production-logger is not available
        logger = null;
    }
}

class ModuleLoader {
  constructor() {
    this.loadedModules = new Map();
    this.loadingPromises = new Map();
    this.dependencies = new Map();
    this.loadOrder = [];
    
    // Define module dependencies
    this.setupDependencies();
  }

  /**
   * Setup module dependencies
   */
  setupDependencies() {
    this.dependencies.set('utils/common.js', []);
    this.dependencies.set('lineDetector.js', ['utils/common.js']);
    this.dependencies.set('probabilityCalculator.js', ['utils/common.js', 'lineDetector.js']);
    this.dependencies.set('probabilityCalculator.enhanced.js', ['utils/common.js', 'lineDetector.js']);
    this.dependencies.set('gameBoard.js', ['utils/common.js']);
    this.dependencies.set('gameEngine.js', ['utils/common.js', 'lineDetector.js', 'probabilityCalculator.js']);
    this.dependencies.set('algorithmComparison.js', ['probabilityCalculator.js', 'probabilityCalculator.enhanced.js']);
    this.dependencies.set('performance-monitor.js', ['utils/common.js']);
    this.dependencies.set('aiLearningSystem.js', ['utils/common.js', 'gameEngine.js']);
  }

  /**
   * Load a module with its dependencies
   * @param {string} modulePath - Path to the module
   * @returns {Promise} Promise that resolves when module is loaded
   */
  async loadModule(modulePath) {
    // Return cached module if already loaded
    if (this.loadedModules.has(modulePath)) {
      return this.loadedModules.get(modulePath);
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(modulePath)) {
      return this.loadingPromises.get(modulePath);
    }

    // Create loading promise
    const loadingPromise = this._loadModuleWithDependencies(modulePath);
    this.loadingPromises.set(modulePath, loadingPromise);

    try {
      const module = await loadingPromise;
      this.loadedModules.set(modulePath, module);
      this.loadingPromises.delete(modulePath);
      return module;
    } catch (error) {
      this.loadingPromises.delete(modulePath);
      throw error;
    }
  }

  /**
   * Load module with its dependencies
   * @private
   */
  async _loadModuleWithDependencies(modulePath) {
    // Load dependencies first
    const deps = this.dependencies.get(modulePath) || [];
    await Promise.all(deps.map(dep => this.loadModule(dep)));

    // Load the module itself
    return this._loadScript(modulePath);
  }

  /**
   * Load a script dynamically
   * @private
   */
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if running in Node.js environment
      if (typeof window === 'undefined') {
        try {
          const module = require(`./${src}`);
          resolve(module);
        } catch (error) {
          reject(error);
        }
        return;
      }

      // Browser environment
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        document.head.removeChild(script);
        resolve(true);
      };

      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Preload modules for better performance
   * @param {string[]} modules - Array of module paths to preload
   */
  async preloadModules(modules) {
    const preloadPromises = modules.map(module => {
      // Use link preload for better performance
      if (typeof document !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = module;
        link.as = 'script';
        document.head.appendChild(link);
      }
      
      return this.loadModule(module);
    });

    try {
      await Promise.all(preloadPromises);
      if (logger) {
        logger.info('Modules preloaded successfully:', modules);
      }
    } catch (error) {
      if (logger) {
        logger.warn('Some modules failed to preload:', error);
      }
    }
  }

  /**
   * Load modules in chunks to avoid blocking the main thread
   * @param {string[]} modules - Array of module paths
   * @param {number} chunkSize - Number of modules to load per chunk
   */
  async loadModulesInChunks(modules, chunkSize = 3) {
    const chunks = [];
    for (let i = 0; i < modules.length; i += chunkSize) {
      chunks.push(modules.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(module => this.loadModule(module)));
      
      // Small delay between chunks to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Get loading status of modules
   * @returns {Object} Loading status information
   */
  getLoadingStatus() {
    return {
      loaded: Array.from(this.loadedModules.keys()),
      loading: Array.from(this.loadingPromises.keys()),
      totalModules: this.dependencies.size,
      loadedCount: this.loadedModules.size,
      loadingCount: this.loadingPromises.size
    };
  }

  /**
   * Clear all loaded modules (for testing or reset)
   */
  clearCache() {
    this.loadedModules.clear();
    this.loadingPromises.clear();
  }

  /**
   * Check if module is loaded
   * @param {string} modulePath - Path to the module
   * @returns {boolean} Whether module is loaded
   */
  isModuleLoaded(modulePath) {
    return this.loadedModules.has(modulePath);
  }

  /**
   * Load critical modules first
   */
  async loadCriticalModules() {
    const criticalModules = [
      'utils/common.js',
      'lineDetector.js',
      'probabilityCalculator.js',
      'gameBoard.js',
      'gameEngine.js'
    ];

    await this.loadModulesInChunks(criticalModules, 2);
  }

  /**
   * Load optional modules (can be loaded later)
   */
  async loadOptionalModules() {
    const optionalModules = [
      'probabilityCalculator.enhanced.js',
      'algorithmComparison.js',
      'performance-monitor.js',
      'aiLearningSystem.js'
    ];

    // Load these in the background
    this.preloadModules(optionalModules).catch(error => {
      if (logger) {
        logger.warn('Optional modules failed to load:', error);
      }
    });
  }
}

// Progressive loading strategy
class ProgressiveLoader {
  constructor() {
    this.moduleLoader = new ModuleLoader();
    this.loadingStages = [
      'critical',
      'core',
      'enhanced',
      'optional'
    ];
    this.currentStage = 0;
    this.stageCallbacks = new Map();
  }

  /**
   * Start progressive loading
   */
  async startProgressiveLoading() {
    try {
      // Stage 1: Critical modules
      await this.loadStage('critical', [
        'utils/common.js'
      ]);

      // Stage 2: Core game modules
      await this.loadStage('core', [
        'lineDetector.js',
        'probabilityCalculator.js',
        'gameBoard.js'
      ]);

      // Stage 3: Enhanced features
      await this.loadStage('enhanced', [
        'gameEngine.js',
        'probabilityCalculator.enhanced.js'
      ]);

      // Stage 4: Optional features (background loading)
      this.loadStage('optional', [
        'algorithmComparison.js',
        'performance-monitor.js',
        'aiLearningSystem.js'
      ]).catch(error => {
        if (logger) {
          logger.warn('Optional features failed to load:', error);
        }
      });

    } catch (error) {
      if (logger) {
        logger.error('Progressive loading failed:', error);
      }
      throw error;
    }
  }

  /**
   * Load a specific stage
   * @param {string} stageName - Name of the stage
   * @param {string[]} modules - Modules to load in this stage
   */
  async loadStage(stageName, modules) {
    if (logger) {
      logger.info(`Loading stage: ${stageName}`);
    }
    
    try {
      await this.moduleLoader.loadModulesInChunks(modules, 2);
      
      // Trigger stage completion callback
      const callback = this.stageCallbacks.get(stageName);
      if (callback) {
        callback();
      }
      
      if (logger) {
        logger.info(`Stage ${stageName} loaded successfully`);
      }
    } catch (error) {
      if (logger) {
        logger.error(`Stage ${stageName} failed to load:`, error);
      }
      throw error;
    }
  }

  /**
   * Register callback for stage completion
   * @param {string} stageName - Name of the stage
   * @param {Function} callback - Callback function
   */
  onStageComplete(stageName, callback) {
    this.stageCallbacks.set(stageName, callback);
  }

  /**
   * Get loading progress
   * @returns {Object} Loading progress information
   */
  getProgress() {
    const status = this.moduleLoader.getLoadingStatus();
    return {
      ...status,
      currentStage: this.loadingStages[this.currentStage] || 'complete',
      progress: Math.round((status.loadedCount / status.totalModules) * 100)
    };
  }
}

// Lazy loading utilities
const LazyLoader = {
  /**
   * Create a lazy-loaded component
   * @param {string} modulePath - Path to the module
   * @param {string} componentName - Name of the component
   * @returns {Function} Lazy component factory
   */
  createLazyComponent(modulePath, componentName) {
    let componentPromise = null;
    
    return function(...args) {
      if (!componentPromise) {
        componentPromise = moduleLoader.loadModule(modulePath)
          .then(() => {
            const Component = window[componentName];
            if (!Component) {
              throw new Error(`Component ${componentName} not found in ${modulePath}`);
            }
            return Component;
          });
      }
      
      return componentPromise.then(Component => new Component(...args));
    };
  },

  /**
   * Load component on demand
   * @param {string} modulePath - Path to the module
   * @param {Function} callback - Callback when loaded
   */
  loadOnDemand(modulePath, callback) {
    moduleLoader.loadModule(modulePath)
      .then(() => callback())
      .catch(error => {
        if (logger) {
          logger.error(`Failed to load ${modulePath}:`, error);
        }
      });
  },

  /**
   * Load component when element becomes visible
   * @param {HTMLElement} element - Element to observe
   * @param {string} modulePath - Path to the module
   * @param {Function} callback - Callback when loaded
   */
  loadOnVisible(element, modulePath, callback) {
    if (!element || typeof IntersectionObserver === 'undefined') {
      // Fallback: load immediately
      this.loadOnDemand(modulePath, callback);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(element);
          this.loadOnDemand(modulePath, callback);
        }
      });
    });

    observer.observe(element);
  }
};

// Global instances
const moduleLoader = new ModuleLoader();
const progressiveLoader = new ProgressiveLoader();

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ModuleLoader, ProgressiveLoader, LazyLoader, moduleLoader, progressiveLoader };
} else if (typeof window !== 'undefined') {
  window.ModuleLoader = ModuleLoader;
  window.ProgressiveLoader = ProgressiveLoader;
  window.LazyLoader = LazyLoader;
  window.moduleLoader = moduleLoader;
  window.progressiveLoader = progressiveLoader;
}