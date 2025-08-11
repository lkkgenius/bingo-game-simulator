/**
 * 性能監控系統測試
 */

// 模擬性能 API
global.performance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB
  }
};

global.requestAnimationFrame = callback => {
  setTimeout(callback, 16); // 模擬 60fps
  return 1;
};

global.cancelAnimationFrame = () => {};

global.window = {
  PerformanceObserver: null // 模擬不支持 PerformanceObserver
};

const PerformanceMonitor = require('./performance-monitor.js');

describe('Performance Monitor', () => {
  let monitor;

  beforeEach = () => {
    monitor = new PerformanceMonitor();
  };

  test('should initialize with default settings', () => {
    expect(monitor.isMonitoring).toBeFalsy();
    expect(monitor.metrics).toBeTruthy();
    expect(monitor.metrics.frameRate).toHaveLength(0);
    expect(monitor.metrics.memoryUsage).toHaveLength(0);
  });

  test('should start monitoring', () => {
    monitor.startMonitoring();
    expect(monitor.isMonitoring).toBeTruthy();
  });

  test('should stop monitoring', () => {
    monitor.startMonitoring();
    monitor.stopMonitoring();
    expect(monitor.isMonitoring).toBeFalsy();
  });

  test('should measure algorithm performance', () => {
    const testAlgorithm = () => {
      // 模擬算法執行
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum;
    };

    const result = monitor.measureAlgorithmPerformance(
      'test-algorithm',
      testAlgorithm
    );
    expect(result).toBe(499500); // 0+1+2+...+999 = 499500
  });

  test('should measure render performance', () => {
    const testRender = () => {
      // 模擬渲染操作
      return 'rendered';
    };

    const result = monitor.measureRenderPerformance('test-render', testRender);
    expect(result).toBe('rendered');
  });

  test('should handle performance warnings', () => {
    // 測試低幀率警告
    monitor.handlePerformanceWarning('low-framerate', 25);

    // 測試高記憶體使用警告
    monitor.handlePerformanceWarning('high-memory', 60 * 1024 * 1024);

    // 測試慢渲染警告
    monitor.handlePerformanceWarning('slow-render', 20);

    // 測試慢算法警告
    monitor.handlePerformanceWarning('slow-algorithm', 150);

    // 如果沒有拋出錯誤，測試通過
    expect(true).toBeTruthy();
  });

  test('should generate performance report', () => {
    // 添加一些模擬數據
    monitor.metrics.frameRate = [60, 58, 59, 61, 57];
    monitor.metrics.memoryUsage = [
      {
        used: 10 * 1024 * 1024,
        total: 50 * 1024 * 1024,
        limit: 100 * 1024 * 1024,
        timestamp: Date.now()
      }
    ];

    const report = monitor.generatePerformanceReport();
    expect(report).toBeTruthy();
    expect(report.frameRate).toBeGreaterThan(0);
    expect(report.memoryUsage).toBeTruthy();
  });

  test('should calculate average frame rate', () => {
    monitor.metrics.frameRate = [60, 58, 59, 61, 57];
    const avgFrameRate = monitor.calculateAverageFrameRate();
    expect(avgFrameRate).toBe(59); // (60+58+59+61+57)/5 = 59
  });

  test('should get performance stats', () => {
    monitor.metrics.frameRate = [60, 58, 59];
    monitor.metrics.memoryUsage = [
      {
        used: 10 * 1024 * 1024,
        total: 50 * 1024 * 1024,
        limit: 100 * 1024 * 1024,
        timestamp: Date.now()
      }
    ];

    const stats = monitor.getPerformanceStats();
    expect(stats).toBeTruthy();
    expect(stats.frameRate).toBeTruthy();
    expect(stats.frameRate.current).toBe(59);
    expect(stats.frameRate.average).toBeGreaterThan(0);
    expect(stats.memory).toBeTruthy();
  });

  test('should clear metrics', () => {
    monitor.metrics.frameRate = [60, 58, 59];
    monitor.metrics.memoryUsage = [{ used: 1024 }];

    monitor.clearMetrics();

    expect(monitor.metrics.frameRate).toHaveLength(0);
    expect(monitor.metrics.memoryUsage).toHaveLength(0);
  });

  test('should detect production environment', () => {
    // 模擬不同的主機名
    const originalWindow = global.window;

    // 測試本地開發環境
    global.window = { location: { hostname: 'localhost' } };
    expect(monitor.isProduction()).toBeFalsy();

    // 測試生產環境
    global.window = { location: { hostname: 'example.com' } };
    expect(monitor.isProduction()).toBeTruthy();

    // 恢復原始設置
    global.window = originalWindow;
  });

  test('should register and run algorithm tests', () => {
    const testFunction = (a, b) => a + b;

    monitor.registerAlgorithmTest('addition-test', testFunction);
    const result = monitor.runAlgorithmTest('addition-test', 5, 3);

    expect(result).toBe(8);
  });

  test('should handle algorithm test errors gracefully', () => {
    const result = monitor.runAlgorithmTest('non-existent-test', 1, 2);
    expect(result).toBe(null);
  });

  test('should suggest optimizations based on performance issues', () => {
    // 測試各種性能問題的優化建議
    monitor.suggestOptimizations('low-framerate', 25);
    monitor.suggestOptimizations('high-memory', 60 * 1024 * 1024);
    monitor.suggestOptimizations('slow-render', 20);
    monitor.suggestOptimizations('slow-algorithm', 150);

    // 如果沒有拋出錯誤，測試通過
    expect(true).toBeTruthy();
  });
});
