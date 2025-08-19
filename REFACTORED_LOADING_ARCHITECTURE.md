# Refactored Script Loading Architecture

## Overview

This document describes the refactored script loading architecture implemented for the Bingo Game Simulator. The new architecture eliminates global pollution, implements conditional loading based on environment, adds performance monitoring, and provides better error handling.

## Key Improvements

### 1. Eliminated Global Pollution

**Before:**
```html
<!-- Multiple direct script tags -->
<script src="./safe-dom.js"></script>
<script src="./production-logger.js"></script>
<script src="./security-utils.js"></script>
<!-- ... many more scripts -->

<script>
  // Global variables polluting window object
  let gameState = null;
  let gameBoard = null;
  let lineDetector = null;
  // ... more globals
</script>
```

**After:**
```html
<!-- Single script loader -->
<script src="./script-loader.js"></script>

<script>
  // Encapsulated in namespace
  const BingoApp = {
    state: { /* ... */ },
    components: { /* ... */ },
    initialize() { /* ... */ }
  };
</script>
```

### 2. Conditional Loading by Environment

The new architecture automatically detects the environment and loads appropriate modules:

**Development Mode:**
- Loads debug modules
- Enables performance monitoring
- Provides detailed logging
- Includes development tools

**Production Mode:**
- Optimized loading strategy
- Minimal logging
- Lazy loading for non-critical features
- Better performance

### 3. Performance Monitoring

Comprehensive performance monitoring tracks:
- Module loading times
- Total loading duration
- Critical path timing
- Error rates and warnings
- Performance recommendations

### 4. Enhanced Error Handling

- Automatic retry mechanisms
- Fallback implementations
- Graceful degradation
- User-friendly error messages

## Architecture Components

### 1. EnhancedScriptLoader

Main orchestrator that:
- Initializes the loading system
- Manages environment detection
- Coordinates module loading
- Handles errors and fallbacks

```javascript
const scriptLoader = new EnhancedScriptLoader();
await scriptLoader.initialize();
await scriptLoader.loadModules();
```

### 2. ConditionalModuleConfig

Manages environment-specific configurations:
- Module lists for each environment
- Loading strategies
- Feature flags

```javascript
const config = new ConditionalModuleConfig();
const modules = config.getModulesToLoad(); // Environment-specific
const strategy = config.getLoadingStrategy(); // 'progressive' or 'optimized'
```

### 3. LoadingPerformanceMonitor

Tracks and analyzes loading performance:
- Module-level timing
- Performance thresholds
- Recommendations generation
- Detailed reporting

```javascript
const monitor = new LoadingPerformanceMonitor();
monitor.startModuleLoad('gameEngine.js');
// ... loading happens ...
monitor.endModuleLoad('gameEngine.js', true);
const report = monitor.getReport();
```

### 4. Environment Detection

Automatically detects runtime environment:
- Development: localhost, debug flags
- Production: deployed environments

```javascript
const Environment = {
  isDevelopment: () => /* detection logic */,
  isProduction: () => /* detection logic */,
  getMode: () => /* returns 'development' or 'production' */
};
```

## Module Dependencies

The refactored system properly manages module dependencies:

```
Core Utilities (no dependencies)
├── safe-dom.js
├── production-logger.js
├── security-utils.js
├── error-boundary.js
└── utils/common.js

Base Components
└── utils/baseProbabilityCalculator.js (depends on: utils/common.js)

Game Core Modules
├── lineDetector.js (depends on: utils/common.js)
├── probabilityCalculator.js (depends on: utils/common.js, utils/baseProbabilityCalculator.js, lineDetector.js)
├── gameBoard.js (depends on: utils/common.js)
└── gameEngine.js (depends on: utils/common.js, lineDetector.js, probabilityCalculator.js)

Enhanced Features (lazy loaded)
├── probabilityCalculator.enhanced.js
├── algorithmComparison.js
├── aiLearningSystem.js
└── performance-monitor.js

UI Enhancements
├── i18n.js
├── accessibility-enhancements.js
├── suggestion-enhancements.js
└── bug-fixes-and-edge-cases.js

Mobile & PWA
├── mobile-touch.js
├── gesture-support.js
└── pwa-manager.js
```

## Loading Strategies

### Progressive Loading (Development)

1. **Critical Path**: Core utilities and game modules
2. **Enhanced Features**: Algorithm improvements and AI
3. **UI Enhancements**: Accessibility and suggestions
4. **Optional Features**: Mobile support and PWA

### Optimized Loading (Production)

1. **Critical Modules**: Essential game functionality
2. **Background Loading**: Non-critical features loaded asynchronously
3. **On-Demand Loading**: Advanced features loaded when needed

## Usage Examples

### Basic Initialization

```javascript
// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  await BingoApp.initialize();
});
```

### On-Demand Module Loading

```javascript
// Load enhanced algorithm when needed
if (algorithm === 'enhanced' && typeof EnhancedProbabilityCalculator === 'undefined') {
  await window.scriptLoader.loadOnDemand('probabilityCalculator.enhanced.js');
}
```

### Performance Monitoring

```javascript
// Get performance report (development mode)
if (window.Environment.isDevelopment()) {
  const report = window.scriptLoader.performanceMonitor.getReport();
  console.log('Loading Performance:', report);
}
```

## Benefits

### Performance
- **Faster Initial Load**: Only critical modules loaded initially
- **Reduced Bundle Size**: Non-essential features loaded on demand
- **Better Caching**: Modular loading improves cache efficiency
- **Performance Insights**: Detailed monitoring and optimization recommendations

### Maintainability
- **Clear Dependencies**: Explicit dependency management
- **Modular Architecture**: Easy to add/remove features
- **Environment Separation**: Different configurations for dev/prod
- **Better Error Handling**: Graceful degradation and recovery

### Developer Experience
- **Debugging Support**: Enhanced logging in development
- **Performance Monitoring**: Real-time loading metrics
- **Error Recovery**: Automatic fallbacks and retries
- **Clean Namespace**: No global pollution

### User Experience
- **Faster Loading**: Progressive loading improves perceived performance
- **Better Reliability**: Fallback mechanisms ensure functionality
- **Responsive UI**: Loading indicators and progress feedback
- **Graceful Degradation**: Core functionality always available

## Migration Guide

### For Developers

1. **Remove Direct Script Tags**: Replace multiple `<script src="...">` tags with single script-loader.js
2. **Update Global References**: Move global variables into namespaced objects
3. **Use On-Demand Loading**: Load optional features when needed
4. **Implement Error Handling**: Add proper error handling for module loading

### For New Features

1. **Define Dependencies**: Add new modules to dependency configuration
2. **Choose Loading Strategy**: Decide if module should be critical or lazy-loaded
3. **Add Performance Monitoring**: Include timing for new modules
4. **Test Both Environments**: Verify functionality in dev and production modes

## Testing

The refactored architecture includes comprehensive testing:

- **Syntax Validation**: All JavaScript files are syntactically correct
- **Dependency Resolution**: Module dependencies are properly configured
- **Environment Detection**: Correct behavior in different environments
- **Performance Monitoring**: Loading metrics are collected and analyzed
- **Error Handling**: Fallback mechanisms work correctly
- **Global Pollution**: Namespace isolation is maintained

Run tests with:
```bash
node test-loading-architecture.js
```

## Future Enhancements

- **Service Worker Integration**: Cache modules for offline use
- **HTTP/2 Push**: Preload critical modules
- **Bundle Splitting**: Further optimize loading strategies
- **Dynamic Imports**: Use native ES6 dynamic imports where supported
- **WebAssembly Support**: Load WASM modules for performance-critical code

## Conclusion

The refactored script loading architecture provides a solid foundation for scalable, maintainable, and performant web applications. It eliminates common issues like global pollution while adding powerful features like conditional loading and performance monitoring.