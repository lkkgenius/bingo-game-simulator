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
    this.dependencyGraph = new Map();
    this.loadingState = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.progressCallbacks = [];
    this.loadingStats = {
      total: 0,
      loaded: 0,
      failed: 0,
      loading: 0
    };
    
    // Define module dependencies
    this.setupDependencies();
    this.buildDependencyGraph();
  }

  /**
   * Setup module dependencies
   */
  setupDependencies() {
    // Core utilities (no dependencies)
    this.dependencies.set('safe-dom.js', []);
    this.dependencies.set('production-logger.js', []);
    this.dependencies.set('security-utils.js', []);
    this.dependencies.set('error-boundary.js', []);
    this.dependencies.set('utils/common.js', []);
    
    // Game core modules
    this.dependencies.set('lineDetector.js', ['utils/common.js']);
    this.dependencies.set('probabilityCalculator.js', ['utils/common.js', 'lineDetector.js']);
    this.dependencies.set('probabilityCalculator.enhanced.js', ['utils/common.js', 'lineDetector.js']);
    this.dependencies.set('gameBoard.js', ['utils/common.js']);
    this.dependencies.set('gameEngine.js', ['utils/common.js', 'lineDetector.js', 'probabilityCalculator.js']);
    
    // Enhanced features
    this.dependencies.set('algorithmComparison.js', ['probabilityCalculator.js', 'probabilityCalculator.enhanced.js']);
    this.dependencies.set('aiLearningSystem.js', ['utils/common.js', 'gameEngine.js']);
    
    // UI and enhancements
    this.dependencies.set('i18n.js', ['safe-dom.js']);
    this.dependencies.set('accessibility-enhancements.js', ['safe-dom.js']);
    this.dependencies.set('suggestion-enhancements.js', ['safe-dom.js']);
    this.dependencies.set('bug-fixes-and-edge-cases.js', ['safe-dom.js', 'production-logger.js']);
    
    // Performance and monitoring
    this.dependencies.set('performance-monitor.js', ['utils/common.js']);
    this.dependencies.set('loading-functions.js', ['utils/common.js']);
    
    // Mobile and PWA
    this.dependencies.set('mobile-touch.js', ['utils/common.js']);
    this.dependencies.set('gesture-support.js', ['utils/common.js']);
    this.dependencies.set('pwa-manager.js', ['utils/common.js']);
    
    // Main script (depends on core modules)
    this.dependencies.set('script.js', ['utils/common.js', 'lineDetector.js', 'probabilityCalculator.js', 'gameBoard.js', 'gameEngine.js']);
    
    // Update total count for progress tracking
    this.loadingStats.total = this.dependencies.size;
  }

  /**
   * Build dependency graph for topological sorting
   */
  buildDependencyGraph() {
    // Initialize graph
    for (const [module, deps] of this.dependencies) {
      if (!this.dependencyGraph.has(module)) {
        this.dependencyGraph.set(module, { dependencies: [], dependents: [] });
      }
      
      for (const dep of deps) {
        if (!this.dependencyGraph.has(dep)) {
          this.dependencyGraph.set(dep, { dependencies: [], dependents: [] });
        }
        
        this.dependencyGraph.get(module).dependencies.push(dep);
        this.dependencyGraph.get(dep).dependents.push(module);
      }
    }
  }

  /**
   * Calculate correct loading order using topological sort
   * @returns {string[]} Array of modules in correct loading order
   */
  calculateLoadOrder() {
    const visited = new Set();
    const visiting = new Set();
    const order = [];

    const visit = (module) => {
      if (visiting.has(module)) {
        throw new Error(`Circular dependency detected involving ${module}`);
      }
      
      if (visited.has(module)) {
        return;
      }

      visiting.add(module);
      
      const node = this.dependencyGraph.get(module);
      if (node) {
        for (const dep of node.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(module);
      visited.add(module);
      order.push(module);
    };

    for (const module of this.dependencies.keys()) {
      if (!visited.has(module)) {
        visit(module);
      }
    }

    this.loadOrder = order;
    return order;
  }

  /**
   * Set loading state for a module
   * @param {string} modulePath - Path to the module
   * @param {string} state - Loading state ('pending', 'loading', 'loaded', 'failed')
   * @param {Error} error - Error if state is 'failed'
   */
  setLoadingState(modulePath, state, error = null) {
    const previousState = this.loadingState.get(modulePath);
    
    this.loadingState.set(modulePath, {
      state,
      timestamp: Date.now(),
      error,
      attempts: this.retryAttempts.get(modulePath) || 0
    });

    // Update statistics
    if (previousState) {
      this.loadingStats[previousState.state]--;
    }
    this.loadingStats[state]++;

    // Notify progress callbacks
    this.notifyProgress();

    if (logger) {
      logger.debug(`Module ${modulePath} state changed to ${state}`, { error });
    }
  }

  /**
   * Add progress callback
   * @param {Function} callback - Callback function to receive progress updates
   */
  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }

  /**
   * Notify all progress callbacks
   */
  notifyProgress() {
    const progress = this.getLoadingProgress();
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        if (logger) {
          logger.warn('Progress callback error:', error);
        }
      }
    });
  }

  /**
   * Get detailed loading progress
   * @returns {Object} Progress information
   */
  getLoadingProgress() {
    const { total, loaded, failed, loading } = this.loadingStats;
    const pending = total - loaded - failed - loading;
    
    return {
      total,
      loaded,
      failed,
      loading,
      pending,
      percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
      isComplete: loaded + failed === total,
      hasErrors: failed > 0,
      modules: Object.fromEntries(this.loadingState)
    };
  }

  /**
   * Load a module with its dependencies and retry mechanism
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

    // Initialize loading state
    this.setLoadingState(modulePath, 'pending');

    // Create loading promise with retry mechanism
    const loadingPromise = this._loadModuleWithRetry(modulePath);
    this.loadingPromises.set(modulePath, loadingPromise);

    try {
      const module = await loadingPromise;
      this.loadedModules.set(modulePath, module);
      this.loadingPromises.delete(modulePath);
      this.setLoadingState(modulePath, 'loaded');
      return module;
    } catch (error) {
      this.loadingPromises.delete(modulePath);
      this.setLoadingState(modulePath, 'failed', error);
      throw error;
    }
  }

  /**
   * Load module with retry mechanism
   * @private
   * @param {string} modulePath - Path to the module
   * @returns {Promise} Promise that resolves when module is loaded
   */
  async _loadModuleWithRetry(modulePath) {
    let lastError;
    const maxAttempts = this.maxRetries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.retryAttempts.set(modulePath, attempt);
        this.setLoadingState(modulePath, 'loading');
        
        if (logger && attempt > 1) {
          logger.info(`Retrying module load: ${modulePath} (attempt ${attempt}/${maxAttempts})`);
        }

        const module = await this._loadModuleWithDependencies(modulePath);
        
        // Clear retry count on success
        this.retryAttempts.delete(modulePath);
        return module;
        
      } catch (error) {
        lastError = error;
        
        if (logger) {
          logger.warn(`Module load attempt ${attempt} failed for ${modulePath}:`, error.message);
        }

        // Don't retry on the last attempt
        if (attempt < maxAttempts) {
          await this._delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All attempts failed
    if (logger) {
      logger.error(`Failed to load module ${modulePath} after ${maxAttempts} attempts:`, lastError);
    }
    
    throw new Error(`Failed to load module ${modulePath} after ${maxAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Delay utility for retry mechanism
   * @private
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      loadingCount: this.loadingPromises.size,
      progress: this.getLoadingProgress(),
      loadOrder: this.loadOrder,
      dependencyGraph: Object.fromEntries(this.dependencyGraph)
    };
  }

  /**
   * Load modules in optimal order based on dependency graph
   * @param {string[]} modules - Array of module paths to load
   * @returns {Promise} Promise that resolves when all modules are loaded
   */
  async loadModulesInOrder(modules) {
    // Filter to only include requested modules and their dependencies
    const requiredModules = new Set();
    
    const addModuleAndDeps = (modulePath) => {
      if (requiredModules.has(modulePath)) return;
      
      requiredModules.add(modulePath);
      const deps = this.dependencies.get(modulePath) || [];
      deps.forEach(dep => addModuleAndDeps(dep));
    };

    modules.forEach(module => addModuleAndDeps(module));

    // Calculate load order for required modules
    const loadOrder = this.calculateLoadOrder().filter(module => 
      requiredModules.has(module)
    );

    if (logger) {
      logger.info('Loading modules in order:', loadOrder);
    }

    // Load modules in batches based on dependency levels
    const loadedInThisBatch = new Set();
    
    while (loadedInThisBatch.size < loadOrder.length) {
      const batch = [];
      
      for (const module of loadOrder) {
        if (loadedInThisBatch.has(module)) continue;
        
        // Check if all dependencies are loaded
        const deps = this.dependencies.get(module) || [];
        const allDepsLoaded = deps.every(dep => 
          this.loadedModules.has(dep) || loadedInThisBatch.has(dep)
        );
        
        if (allDepsLoaded) {
          batch.push(module);
        }
      }

      if (batch.length === 0) {
        // No progress possible - check for circular dependencies or missing modules
        const remaining = loadOrder.filter(m => !loadedInThisBatch.has(m));
        throw new Error(`Cannot resolve dependencies for modules: ${remaining.join(', ')}`);
      }

      // Load current batch in parallel
      await Promise.all(batch.map(module => this.loadModule(module)));
      batch.forEach(module => loadedInThisBatch.add(module));
    }

    return Array.from(loadedInThisBatch);
  }

  /**
   * Validate dependency graph for circular dependencies
   * @returns {Object} Validation result
   */
  validateDependencies() {
    const issues = [];
    const visited = new Set();
    const visiting = new Set();

    const checkCircular = (module, path = []) => {
      if (visiting.has(module)) {
        const cycle = [...path, module];
        issues.push({
          type: 'circular',
          cycle: cycle.slice(cycle.indexOf(module))
        });
        return;
      }

      if (visited.has(module)) return;

      visiting.add(module);
      const deps = this.dependencies.get(module) || [];
      
      for (const dep of deps) {
        if (!this.dependencies.has(dep)) {
          issues.push({
            type: 'missing',
            module,
            missingDependency: dep
          });
        } else {
          checkCircular(dep, [...path, module]);
        }
      }

      visiting.delete(module);
      visited.add(module);
    };

    for (const module of this.dependencies.keys()) {
      if (!visited.has(module)) {
        checkCircular(module);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Clear all loaded modules (for testing or reset)
   */
  clearCache() {
    this.loadedModules.clear();
    this.loadingPromises.clear();
    this.loadingState.clear();
    this.retryAttempts.clear();
    this.loadingStats = {
      total: this.dependencies.size,
      loaded: 0,
      failed: 0,
      loading: 0
    };
    this.notifyProgress();
  }

  /**
   * Get detailed module information
   * @param {string} modulePath - Path to the module
   * @returns {Object} Module information
   */
  getModuleInfo(modulePath) {
    const state = this.loadingState.get(modulePath);
    const deps = this.dependencies.get(modulePath) || [];
    const dependents = this.dependencyGraph.get(modulePath)?.dependents || [];
    
    return {
      path: modulePath,
      isLoaded: this.loadedModules.has(modulePath),
      isLoading: this.loadingPromises.has(modulePath),
      state: state?.state || 'unknown',
      dependencies: deps,
      dependents,
      attempts: state?.attempts || 0,
      lastError: state?.error?.message,
      timestamp: state?.timestamp
    };
  }

  /**
   * Get modules that can be loaded next (all dependencies satisfied)
   * @returns {string[]} Array of module paths ready to load
   */
  getReadyToLoadModules() {
    const ready = [];
    
    for (const [module, deps] of this.dependencies) {
      if (this.loadedModules.has(module) || this.loadingPromises.has(module)) {
        continue;
      }
      
      const allDepsLoaded = deps.every(dep => this.loadedModules.has(dep));
      if (allDepsLoaded) {
        ready.push(module);
      }
    }
    
    return ready;
  }

  /**
   * Force reload a module (ignoring cache)
   * @param {string} modulePath - Path to the module
   * @returns {Promise} Promise that resolves when module is reloaded
   */
  async reloadModule(modulePath) {
    // Remove from cache
    this.loadedModules.delete(modulePath);
    this.loadingState.delete(modulePath);
    this.retryAttempts.delete(modulePath);
    
    // Reload
    return this.loadModule(modulePath);
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
   * Load critical modules first with dependency validation
   */
  async loadCriticalModules() {
    const criticalModules = [
      'utils/common.js',
      'lineDetector.js',
      'probabilityCalculator.js',
      'gameBoard.js',
      'gameEngine.js'
    ];

    try {
      await this.loadModulesInChunks(criticalModules, 2);
      
      // 載入完成後執行依賴驗證
      if (typeof window !== 'undefined' && window.dependencyValidator) {
        const validationResults = await window.dependencyValidator.performRuntimeCheck();
        if (!validationResults) {
          if (logger) {
            logger.warn('關鍵模組載入後依賴驗證失敗，但繼續執行');
          }
        }
      }
    } catch (error) {
      if (logger) {
        logger.error('關鍵模組載入失敗:', error);
      }
      throw error;
    }
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
    this.stageProgress = new Map();
    
    // Setup progress tracking
    this.moduleLoader.onProgress((progress) => {
      this.updateStageProgress(progress);
    });
  }

  /**
   * Update stage progress based on module loading progress
   * @param {Object} progress - Progress information from ModuleLoader
   */
  updateStageProgress(progress) {
    const currentStageName = this.loadingStages[this.currentStage];
    if (currentStageName) {
      this.stageProgress.set(currentStageName, progress);
    }
  }

  /**
   * Start progressive loading with enhanced dependency resolution
   */
  async startProgressiveLoading() {
    try {
      // Validate dependencies first
      const validation = this.moduleLoader.validateDependencies();
      if (!validation.isValid) {
        if (logger) {
          logger.error('Dependency validation failed:', validation.issues);
        }
        throw new Error(`Dependency validation failed: ${JSON.stringify(validation.issues)}`);
      }

      // Stage 1: Critical modules (security and utilities)
      await this.loadStage('critical', [
        'safe-dom.js',
        'production-logger.js',
        'security-utils.js',
        'error-boundary.js',
        'utils/common.js'
      ]);

      // Stage 2: Core game modules
      await this.loadStage('core', [
        'lineDetector.js',
        'probabilityCalculator.js',
        'gameBoard.js',
        'gameEngine.js'
      ]);

      // Stage 3: Main application script
      await this.loadStage('enhanced', [
        'script.js',
        'i18n.js'
      ]);

      // Stage 4: Optional features (background loading)
      this.loadStage('optional', [
        'probabilityCalculator.enhanced.js',
        'algorithmComparison.js',
        'performance-monitor.js',
        'aiLearningSystem.js',
        'accessibility-enhancements.js',
        'suggestion-enhancements.js',
        'bug-fixes-and-edge-cases.js',
        'loading-functions.js',
        'mobile-touch.js',
        'gesture-support.js',
        'pwa-manager.js'
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
   * Load a specific stage using optimal dependency order
   * @param {string} stageName - Name of the stage
   * @param {string[]} modules - Modules to load in this stage
   */
  async loadStage(stageName, modules) {
    if (logger) {
      logger.info(`Loading stage: ${stageName}`);
    }
    
    try {
      this.currentStage = this.loadingStages.indexOf(stageName);
      
      // Use the enhanced loadModulesInOrder method
      await this.moduleLoader.loadModulesInOrder(modules);
      
      // Trigger stage completion callback
      const callback = this.stageCallbacks.get(stageName);
      if (callback) {
        callback(this.stageProgress.get(stageName));
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
   * Get loading progress with stage information
   * @returns {Object} Loading progress information
   */
  getProgress() {
    const status = this.moduleLoader.getLoadingStatus();
    const currentStageName = this.loadingStages[this.currentStage] || 'complete';
    
    return {
      ...status,
      currentStage: currentStageName,
      stageProgress: Object.fromEntries(this.stageProgress),
      overallProgress: Math.round((status.loadedCount / status.totalModules) * 100),
      readyToLoad: this.moduleLoader.getReadyToLoadModules(),
      validation: this.moduleLoader.validateDependencies()
    };
  }

  /**
   * Get detailed stage information
   * @returns {Object} Stage information
   */
  getStageInfo() {
    return {
      stages: this.loadingStages,
      currentStage: this.currentStage,
      currentStageName: this.loadingStages[this.currentStage] || 'complete',
      completedStages: this.loadingStages.slice(0, this.currentStage),
      remainingStages: this.loadingStages.slice(this.currentStage + 1)
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