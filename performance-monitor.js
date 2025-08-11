/**
 * 性能監控和優化工具
 * 監控遊戲性能並提供優化建議
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      frameRate: [],
      memoryUsage: [],
      renderTime: [],
      algorithmTime: [],
      userInteractionTime: [],
      touchLatency: [],
      batteryLevel: [],
      networkSpeed: []
    };
    this.isMonitoring = false;
    this.performanceObserver = null;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.isMobile = this.detectMobileDevice();
    this.performanceLevel = this.detectPerformanceLevel();
    this.batteryAPI = null;
    this.networkAPI = null;

    // 根據設備類型調整閾值
    this.warningThresholds = this.isMobile
      ? {
          lowFrameRate: 25, // 移動設備較低的幀率要求
          highMemoryUsage: 30 * 1024 * 1024, // 30MB for mobile
          slowRenderTime: 20, // 移動設備允許較慢的渲染
          slowAlgorithmTime: 150, // 移動設備允許較慢的算法執行
          highTouchLatency: 100 // 觸控延遲閾值
        }
      : {
          lowFrameRate: 30,
          highMemoryUsage: 50 * 1024 * 1024, // 50MB
          slowRenderTime: 16.67, // 60fps = 16.67ms per frame
          slowAlgorithmTime: 100, // 100ms
          highTouchLatency: 50
        };

    this.initMobileAPIs();
  }

  /**
   * 開始性能監控
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log(
      `Performance monitoring started (${this.isMobile ? 'Mobile' : 'Desktop'} mode)`
    );

    try {
      // 監控幀率
      this.startFrameRateMonitoring();

      // 監控記憶體使用
      this.startMemoryMonitoring();

      // 監控渲染性能
      this.startRenderMonitoring();

      // 移動設備特定監控
      if (this.isMobile) {
        this.startTouchLatencyMonitoring();
        this.startBatteryMonitoring();
        this.startNetworkMonitoring();
        this.optimizeForMobile();
      }

      // 設置定期報告 - 移動設備減少頻率以節省電池
      const reportInterval = this.isMobile
        ? 90000
        : this.isProduction()
          ? 60000
          : 30000;
      this.reportInterval = setInterval(() => {
        try {
          this.generatePerformanceReport();
        } catch (error) {
          console.error('Error generating performance report:', error);
        }
      }, reportInterval);

      // 監聽頁面可見性變化以優化性能
      this.setupVisibilityChangeHandler();

      // 移動設備電池優化
      if (this.isMobile) {
        this.setupBatteryOptimization();
      }
    } catch (error) {
      console.error('Error starting performance monitoring:', error);
      this.isMonitoring = false;
    }
  }

  /**
   * 停止性能監控
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    console.log('Performance monitoring stopped');

    if (this.reportInterval) {
      clearInterval(this.reportInterval);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    cancelAnimationFrame(this.frameRateRAF);
  }

  /**
   * 開始幀率監控
   */
  startFrameRateMonitoring() {
    const measureFrameRate = currentTime => {
      if (!this.isMonitoring) return;

      const deltaTime = currentTime - this.lastFrameTime;
      const fps = 1000 / deltaTime;

      this.metrics.frameRate.push(fps);
      this.frameCount++;
      this.lastFrameTime = currentTime;

      // 保持最近100幀的數據
      if (this.metrics.frameRate.length > 100) {
        this.metrics.frameRate.shift();
      }

      // 檢查性能警告
      if (fps < this.warningThresholds.lowFrameRate) {
        this.handlePerformanceWarning('low-framerate', fps);
      }

      this.frameRateRAF = requestAnimationFrame(measureFrameRate);
    };

    this.frameRateRAF = requestAnimationFrame(measureFrameRate);
  }

  /**
   * 開始記憶體監控
   */
  startMemoryMonitoring() {
    if (!performance.memory) {
      console.warn('Memory monitoring not supported in this browser');
      return;
    }

    const measureMemory = () => {
      if (!this.isMonitoring) return;

      const memInfo = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: performance.now()
      };

      this.metrics.memoryUsage.push(memInfo);

      // 保持最近50個記錄
      if (this.metrics.memoryUsage.length > 50) {
        this.metrics.memoryUsage.shift();
      }

      // 檢查記憶體使用警告
      if (memInfo.used > this.warningThresholds.highMemoryUsage) {
        this.handlePerformanceWarning('high-memory', memInfo.used);
      }

      setTimeout(measureMemory, 5000); // 每5秒檢查一次
    };

    measureMemory();
  }

  /**
   * 開始渲染監控
   */
  startRenderMonitoring() {
    if (!window.PerformanceObserver) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();

        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            if (entry.name.includes('render')) {
              this.metrics.renderTime.push({
                duration: entry.duration,
                timestamp: entry.startTime
              });

              if (entry.duration > this.warningThresholds.slowRenderTime) {
                this.handlePerformanceWarning('slow-render', entry.duration);
              }
            } else if (entry.name.includes('algorithm')) {
              this.metrics.algorithmTime.push({
                duration: entry.duration,
                timestamp: entry.startTime
              });

              if (entry.duration > this.warningThresholds.slowAlgorithmTime) {
                this.handlePerformanceWarning('slow-algorithm', entry.duration);
              }
            }
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('Failed to setup PerformanceObserver:', error);
    }
  }

  /**
   * 測量算法性能
   */
  measureAlgorithmPerformance(algorithmName, algorithmFunction) {
    const startMark = `${algorithmName}-start`;
    const endMark = `${algorithmName}-end`;
    const measureName = `algorithm-${algorithmName}`;

    performance.mark(startMark);

    const result = algorithmFunction.call(this);

    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    return result;
  }

  /**
   * 註冊算法測試
   * @param {string} testName - 測試名稱
   * @param {Function} testFunction - 測試函數
   */
  registerAlgorithmTest(testName, testFunction) {
    if (!this.algorithmTests) {
      this.algorithmTests = {};
    }

    this.algorithmTests[testName] = testFunction;
    console.log(`Algorithm test "${testName}" registered`);
  }

  /**
   * 運行註冊的算法測試
   * @param {string} testName - 測試名稱
   * @param {...any} args - 傳遞給測試函數的參數
   * @returns {Object} 測試結果
   */
  runAlgorithmTest(testName, ...args) {
    if (!this.algorithmTests || !this.algorithmTests[testName]) {
      console.error(`Algorithm test "${testName}" not found`);
      return null;
    }

    console.log(`Running algorithm test "${testName}"`);

    const startTime = performance.now();
    const result = this.algorithmTests[testName](...args);
    const endTime = performance.now();

    console.log(
      `Algorithm test "${testName}" completed in ${(endTime - startTime).toFixed(2)}ms`
    );

    // 記錄測試結果
    if (!this.testResults) {
      this.testResults = {};
    }

    if (!this.testResults[testName]) {
      this.testResults[testName] = [];
    }

    this.testResults[testName].push({
      timestamp: new Date().toISOString(),
      duration: endTime - startTime,
      result
    });

    // 限制結果歷史記錄大小
    if (this.testResults[testName].length > 10) {
      this.testResults[testName].shift();
    }

    return result;
  }

  /**
   * 測量渲染性能
   */
  measureRenderPerformance(renderName, renderFunction) {
    const startMark = `${renderName}-start`;
    const endMark = `${renderName}-end`;
    const measureName = `render-${renderName}`;

    performance.mark(startMark);

    const result = renderFunction.call(this);

    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    return result;
  }

  /**
   * 處理性能警告
   */
  handlePerformanceWarning(type, value) {
    const warnings = {
      'low-framerate': `幀率過低: ${value.toFixed(1)} FPS`,
      'high-memory': `記憶體使用過高: ${(value / 1024 / 1024).toFixed(1)} MB`,
      'slow-render': `渲染速度過慢: ${value.toFixed(1)} ms`,
      'slow-algorithm': `算法執行過慢: ${value.toFixed(1)} ms`,
      'high-touch-latency': `觸控延遲過高: ${value.toFixed(1)} ms`
    };

    console.warn(`Performance Warning: ${warnings[type]}`);

    // 記錄警告
    this.recordPerformanceWarning(type, value);

    // 自動優化
    this.applyAutoOptimizations(type, value);

    // 用戶通知（僅在嚴重情況下）
    if (this.isSeverePerformanceIssue(type, value)) {
      this.showPerformanceNotification(type, value);
    }

    // 建議優化措施
    this.suggestOptimizations(type, value);
  }

  /**
   * 記錄性能警告
   */
  recordPerformanceWarning(type, value) {
    if (!this.performanceWarnings) {
      this.performanceWarnings = {};
    }

    if (!this.performanceWarnings[type]) {
      this.performanceWarnings[type] = [];
    }

    this.performanceWarnings[type].push({
      value,
      timestamp: performance.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });

    // 限制記錄數量
    if (this.performanceWarnings[type].length > 10) {
      this.performanceWarnings[type].shift();
    }
  }

  /**
   * 判斷是否為嚴重性能問題
   */
  isSeverePerformanceIssue(type, value) {
    const severeThresholds = {
      'low-framerate': this.isMobile ? 15 : 20,
      'high-memory': this.isMobile ? 50 * 1024 * 1024 : 100 * 1024 * 1024,
      'slow-render': this.isMobile ? 50 : 33.33,
      'slow-algorithm': this.isMobile ? 300 : 200,
      'high-touch-latency': 200
    };

    return value > (severeThresholds[type] || Infinity);
  }

  /**
   * 顯示性能通知
   */
  showPerformanceNotification(type, value) {
    // 避免重複通知
    if (this.lastPerformanceNotification === type) {
      return;
    }

    this.lastPerformanceNotification = type;

    const messages = {
      'low-framerate': '遊戲運行較慢，正在自動優化...',
      'high-memory': '記憶體使用較高，建議重新載入頁面',
      'slow-render': '畫面更新較慢，已啟用性能模式',
      'slow-algorithm': '計算較慢，正在優化算法...',
      'high-touch-latency': '觸控響應較慢，正在優化...'
    };

    const message = messages[type] || '檢測到性能問題，正在優化...';

    // 使用現有的通知系統
    if (typeof showWarningMessage === 'function') {
      showWarningMessage(message, 3000);
    } else {
      console.warn(message);
    }

    // 重置通知標記
    setTimeout(() => {
      this.lastPerformanceNotification = null;
    }, 30000);
  }

  /**
   * 應用自動優化
   */
  applyAutoOptimizations(type, value) {
    switch (type) {
      case 'low-framerate':
        this.optimizeForLowFramerate();
        break;
      case 'high-memory':
        this.optimizeMemoryUsage();
        break;
      case 'slow-render':
        this.optimizeRendering();
        break;
      case 'slow-algorithm':
        this.optimizeAlgorithms();
        break;
      case 'high-touch-latency':
        this.optimizeTouchResponse();
        break;
    }
  }

  /**
   * 優化低幀率
   */
  optimizeForLowFramerate() {
    if (typeof document === 'undefined') return;

    // 減少動畫
    if (document.body && document.body.classList) {
      document.body.classList.add('performance-mode');
    }

    // 降低動畫品質
    if (document.createElement && document.head) {
      const style = document.createElement('style');
      style.id = 'framerate-optimization';
      style.textContent = `
                .performance-mode * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
                
                .performance-mode .game-cell {
                    transition: none !important;
                    animation: none !important;
                }
                
                .performance-mode .suggested {
                    animation-duration: 0.5s !important;
                }
            `;

      if (!document.getElementById('framerate-optimization')) {
        document.head.appendChild(style);
      }
    }

    console.log('Applied framerate optimizations');
  }

  /**
   * 優化記憶體使用
   */
  optimizeMemoryUsage() {
    // 清理緩存
    if (
      window.probabilityCalculator &&
      window.probabilityCalculator.clearCache
    ) {
      window.probabilityCalculator.clearCache();
    }

    // 清理性能數據
    this.clearOldMetrics();

    // 建議垃圾回收
    if (window.gc) {
      window.gc();
    }

    console.log('Applied memory optimizations');
  }

  /**
   * 優化渲染
   */
  optimizeRendering() {
    if (typeof document === 'undefined') return;

    // 啟用硬件加速
    const gameBoard = document.getElementById('game-board');
    if (gameBoard) {
      gameBoard.style.transform = 'translateZ(0)';
      gameBoard.style.willChange = 'transform';
    }

    // 減少重排
    if (document.body && document.body.classList) {
      document.body.classList.add('optimized-rendering');
    }

    if (document.createElement && document.head) {
      const style = document.createElement('style');
      style.id = 'rendering-optimization';
      style.textContent = `
                .optimized-rendering .game-cell {
                    contain: layout style paint;
                    will-change: transform;
                }
                
                .optimized-rendering .suggestion-display {
                    contain: layout style;
                }
            `;

      if (!document.getElementById('rendering-optimization')) {
        document.head.appendChild(style);
      }
    }

    console.log('Applied rendering optimizations');
  }

  /**
   * 優化算法
   */
  optimizeAlgorithms() {
    // 啟用算法緩存
    if (
      window.probabilityCalculator &&
      window.probabilityCalculator.enableCaching
    ) {
      window.probabilityCalculator.enableCaching(true);
    }

    // 減少計算精度
    if (
      window.probabilityCalculator &&
      window.probabilityCalculator.setPerformanceMode
    ) {
      window.probabilityCalculator.setPerformanceMode(true);
    }

    console.log('Applied algorithm optimizations');
  }

  /**
   * 優化觸控響應
   */
  optimizeTouchResponse() {
    if (typeof document === 'undefined') return;

    // 啟用快速觸控
    if (document.body) {
      document.body.style.touchAction = 'manipulation';
    }

    // 減少觸控延遲
    if (document.createElement && document.head) {
      const style = document.createElement('style');
      style.id = 'touch-optimization';
      style.textContent = `
                .game-cell {
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                }
                
                button {
                    touch-action: manipulation;
                }
            `;

      if (!document.getElementById('touch-optimization')) {
        document.head.appendChild(style);
      }
    }

    console.log('Applied touch optimizations');
  }

  /**
   * 清理舊的性能數據
   */
  clearOldMetrics() {
    const maxAge = 60000; // 1 minute
    const now = performance.now();

    // 清理幀率數據
    this.metrics.frameRate = this.metrics.frameRate.filter(
      (_, index) => index >= this.metrics.frameRate.length - 50
    );

    // 清理記憶體數據
    this.metrics.memoryUsage = this.metrics.memoryUsage.filter(
      entry => now - entry.timestamp < maxAge
    );

    // 清理渲染時間數據
    this.metrics.renderTime = this.metrics.renderTime.filter(
      entry => now - entry.timestamp < maxAge
    );

    // 清理算法時間數據
    this.metrics.algorithmTime = this.metrics.algorithmTime.filter(
      entry => now - entry.timestamp < maxAge
    );
  }

  /**
   * 建議優化措施
   */
  suggestOptimizations(type, value) {
    const optimizations = {
      'low-framerate': [
        '減少動畫效果',
        '降低視覺特效品質',
        '使用 requestAnimationFrame 優化動畫'
      ],
      'high-memory': [
        '清理未使用的變數',
        '減少緩存大小',
        '使用 WeakMap 代替 Map'
      ],
      'slow-render': [
        '使用 CSS transform 代替改變 position',
        '避免強制重排',
        '使用 will-change 屬性'
      ],
      'slow-algorithm': [
        '使用緩存避免重複計算',
        '優化算法複雜度',
        '使用 Web Workers 處理複雜計算'
      ]
    };

    console.log(`Optimization suggestions for ${type}:`, optimizations[type]);
  }

  /**
   * 生成性能報告
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      frameRate: this.calculateAverageFrameRate(),
      memoryUsage: this.getLatestMemoryUsage(),
      renderPerformance: this.calculateAverageRenderTime(),
      algorithmPerformance: this.calculateAverageAlgorithmTime(),
      recommendations: this.generateRecommendations()
    };

    console.log('Performance Report:', report);
    return report;
  }

  /**
   * 計算平均幀率
   */
  calculateAverageFrameRate() {
    if (this.metrics.frameRate.length === 0) return 0;

    const sum = this.metrics.frameRate.reduce((a, b) => a + b, 0);
    return sum / this.metrics.frameRate.length;
  }

  /**
   * 獲取最新記憶體使用情況
   */
  getLatestMemoryUsage() {
    if (this.metrics.memoryUsage.length === 0) return null;

    return this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
  }

  /**
   * 計算平均渲染時間
   */
  calculateAverageRenderTime() {
    if (this.metrics.renderTime.length === 0) return 0;

    const sum = this.metrics.renderTime.reduce((a, b) => a + b.duration, 0);
    return sum / this.metrics.renderTime.length;
  }

  /**
   * 計算平均算法執行時間
   */
  calculateAverageAlgorithmTime() {
    if (this.metrics.algorithmTime.length === 0) return 0;

    const sum = this.metrics.algorithmTime.reduce((a, b) => a + b.duration, 0);
    return sum / this.metrics.algorithmTime.length;
  }

  /**
   * 生成優化建議
   */
  generateRecommendations() {
    const recommendations = [];

    const avgFrameRate = this.calculateAverageFrameRate();
    if (avgFrameRate < 45) {
      recommendations.push('考慮減少動畫效果以提高幀率');
    }

    const latestMemory = this.getLatestMemoryUsage();
    if (latestMemory && latestMemory.used > 30 * 1024 * 1024) {
      recommendations.push('記憶體使用較高，建議清理未使用的資源');
    }

    const avgRenderTime = this.calculateAverageRenderTime();
    if (avgRenderTime > 10) {
      recommendations.push('渲染時間較長，建議優化 DOM 操作');
    }

    const avgAlgorithmTime = this.calculateAverageAlgorithmTime();
    if (avgAlgorithmTime > 50) {
      recommendations.push('算法執行時間較長，建議使用緩存或優化算法');
    }

    return recommendations;
  }

  /**
   * 清理性能數據
   */
  clearMetrics() {
    this.metrics = {
      frameRate: [],
      memoryUsage: [],
      renderTime: [],
      algorithmTime: [],
      userInteractionTime: []
    };
  }

  /**
   * 檢查是否為生產環境
   */
  isProduction() {
    // 在 Node.js 環境中，window 可能不存在
    if (typeof window === 'undefined' || !window.location) {
      return false; // 在測試環境中視為開發環境
    }

    return (
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    );
  }

  /**
   * 設置頁面可見性變化處理器
   */
  setupVisibilityChangeHandler() {
    if (typeof document.visibilityState !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // 頁面隱藏時暫停監控以節省資源
          this.pauseMonitoring();
        } else {
          // 頁面可見時恢復監控
          this.resumeMonitoring();
        }
      });
    }
  }

  /**
   * 暫停監控
   */
  pauseMonitoring() {
    if (this.frameRateRAF) {
      cancelAnimationFrame(this.frameRateRAF);
    }
    this.isPaused = true;
    console.log('Performance monitoring paused');
  }

  /**
   * 恢復監控
   */
  resumeMonitoring() {
    if (this.isMonitoring && this.isPaused) {
      this.startFrameRateMonitoring();
      this.isPaused = false;
      console.log('Performance monitoring resumed');
    }
  }

  /**
   * 獲取性能統計
   */
  getPerformanceStats() {
    try {
      const frameRateData =
        this.metrics.frameRate.length > 0 ? this.metrics.frameRate : [0];

      return {
        frameRate: {
          current: frameRateData[frameRateData.length - 1] || 0,
          average: this.calculateAverageFrameRate(),
          min: frameRateData.length > 0 ? Math.min(...frameRateData) : 0,
          max: frameRateData.length > 0 ? Math.max(...frameRateData) : 0
        },
        memory: this.getLatestMemoryUsage(),
        renderTime: {
          average: this.calculateAverageRenderTime(),
          samples: this.metrics.renderTime.length
        },
        algorithmTime: {
          average: this.calculateAverageAlgorithmTime(),
          samples: this.metrics.algorithmTime.length
        },
        isMonitoring: this.isMonitoring,
        isPaused: this.isPaused || false
      };
    } catch (error) {
      console.error('Error getting performance stats:', error);
      return {
        frameRate: { current: 0, average: 0, min: 0, max: 0 },
        memory: null,
        renderTime: { average: 0, samples: 0 },
        algorithmTime: { average: 0, samples: 0 },
        isMonitoring: this.isMonitoring,
        isPaused: this.isPaused || false,
        error: error.message
      };
    }
  }

  /**
   * 檢測移動設備
   */
  detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      ) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
      window.innerWidth <= 768
    );
  }

  /**
   * 檢測設備性能等級
   */
  detectPerformanceLevel() {
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 2;

    if (hardwareConcurrency >= 8 && memory >= 8) {
      return 'high';
    } else if (hardwareConcurrency >= 4 && memory >= 4) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 初始化移動設備 API
   */
  initMobileAPIs() {
    // 電池 API
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator
        .getBattery()
        .then(battery => {
          this.batteryAPI = battery;
        })
        .catch(error => {
          console.warn('Battery API not available:', error);
        });
    }

    // 網絡 API
    if (typeof navigator !== 'undefined') {
      if ('connection' in navigator) {
        this.networkAPI = navigator.connection;
      } else if ('mozConnection' in navigator) {
        this.networkAPI = navigator.mozConnection;
      } else if ('webkitConnection' in navigator) {
        this.networkAPI = navigator.webkitConnection;
      }
    }
  }

  /**
   * 開始觸控延遲監控
   */
  startTouchLatencyMonitoring() {
    if (typeof document === 'undefined') return;

    let touchStartTime = 0;

    document.addEventListener(
      'touchstart',
      e => {
        touchStartTime = performance.now();
      },
      { passive: true }
    );

    document.addEventListener(
      'touchend',
      e => {
        if (touchStartTime > 0) {
          const latency = performance.now() - touchStartTime;
          this.metrics.touchLatency.push({
            latency,
            timestamp: performance.now()
          });

          // 保持最近50個記錄
          if (this.metrics.touchLatency.length > 50) {
            this.metrics.touchLatency.shift();
          }

          if (latency > this.warningThresholds.highTouchLatency) {
            this.handlePerformanceWarning('high-touch-latency', latency);
          }

          touchStartTime = 0;
        }
      },
      { passive: true }
    );
  }

  /**
   * 開始電池監控
   */
  startBatteryMonitoring() {
    if (!this.batteryAPI) return;

    const updateBatteryInfo = () => {
      if (!this.batteryAPI) return;

      const batteryInfo = {
        level: this.batteryAPI.level,
        charging: this.batteryAPI.charging,
        chargingTime: this.batteryAPI.chargingTime,
        dischargingTime: this.batteryAPI.dischargingTime,
        timestamp: performance.now()
      };

      this.metrics.batteryLevel.push(batteryInfo);

      // 保持最近20個記錄
      if (this.metrics.batteryLevel.length > 20) {
        this.metrics.batteryLevel.shift();
      }
    };

    // 初始更新
    updateBatteryInfo();

    // 監聽電池事件
    this.batteryAPI.addEventListener('levelchange', updateBatteryInfo);
    this.batteryAPI.addEventListener('chargingchange', updateBatteryInfo);
  }

  /**
   * 開始網絡監控
   */
  startNetworkMonitoring() {
    if (!this.networkAPI) return;

    const updateNetworkInfo = () => {
      const networkInfo = {
        effectiveType: this.networkAPI.effectiveType,
        downlink: this.networkAPI.downlink,
        rtt: this.networkAPI.rtt,
        saveData: this.networkAPI.saveData,
        timestamp: performance.now()
      };

      this.metrics.networkSpeed.push(networkInfo);

      // 保持最近20個記錄
      if (this.metrics.networkSpeed.length > 20) {
        this.metrics.networkSpeed.shift();
      }
    };

    // 初始更新
    updateNetworkInfo();

    // 監聽網絡變化
    this.networkAPI.addEventListener('change', updateNetworkInfo);
  }

  /**
   * 移動設備優化
   */
  optimizeForMobile() {
    if (typeof document === 'undefined') return;

    // 減少動畫幀率
    if (this.performanceLevel === 'low') {
      document.documentElement.style.setProperty(
        '--animation-duration',
        '0.5s'
      );
    }

    // 啟用硬件加速
    const gameBoard = document.getElementById('game-board');
    if (gameBoard) {
      gameBoard.style.transform = 'translateZ(0)';
      gameBoard.style.willChange = 'transform';
    }

    // 優化觸控響應
    document.body.style.touchAction = 'manipulation';

    // 禁用不必要的視覺效果
    if (this.performanceLevel === 'low') {
      document.body.classList.add('low-performance');
    }
  }

  /**
   * 設置電池優化
   */
  setupBatteryOptimization() {
    if (typeof document === 'undefined') return;

    // 監聽頁面可見性以節省電池
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.reducePowerConsumption();
      } else {
        this.restorePowerConsumption();
      }
    });

    // 監聽設備方向變化
    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', () => {
        // 延遲處理以等待布局穩定
        setTimeout(() => {
          this.handleOrientationChange();
        }, 100);
      });
    }
  }

  /**
   * 減少電力消耗
   */
  reducePowerConsumption() {
    if (typeof document === 'undefined') return;

    // 暫停非必要的動畫
    document.body.classList.add('reduced-power');

    // 降低監控頻率
    this.pauseMonitoring();
  }

  /**
   * 恢復電力消耗
   */
  restorePowerConsumption() {
    if (typeof document === 'undefined') return;

    document.body.classList.remove('reduced-power');
    this.resumeMonitoring();
  }

  /**
   * 處理設備方向變化
   */
  handleOrientationChange() {
    if (typeof document === 'undefined') return;

    // 重新計算布局
    const gameBoard = document.getElementById('game-board');
    if (gameBoard) {
      // 觸發重新渲染
      gameBoard.style.display = 'none';
      gameBoard.offsetHeight; // 強制重排
      gameBoard.style.display = '';
    }
  }
}

// 創建全局性能監控實例
const performanceMonitor = new PerformanceMonitor();

// 自動啟動性能監控（在開發模式下）
if (
  typeof window !== 'undefined' &&
  window.location &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')
) {
  performanceMonitor.startMonitoring();
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
