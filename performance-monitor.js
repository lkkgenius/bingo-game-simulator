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
            userInteractionTime: []
        };
        this.isMonitoring = false;
        this.performanceObserver = null;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.warningThresholds = {
            lowFrameRate: 30,
            highMemoryUsage: 50 * 1024 * 1024, // 50MB
            slowRenderTime: 16.67, // 60fps = 16.67ms per frame
            slowAlgorithmTime: 100 // 100ms
        };
    }

    /**
     * 開始性能監控
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('Performance monitoring started');
        
        try {
            // 監控幀率
            this.startFrameRateMonitoring();
            
            // 監控記憶體使用
            this.startMemoryMonitoring();
            
            // 監控渲染性能
            this.startRenderMonitoring();
            
            // 設置定期報告 - 在生產環境中減少頻率
            const reportInterval = this.isProduction() ? 60000 : 30000; // 生產環境60秒，開發環境30秒
            this.reportInterval = setInterval(() => {
                try {
                    this.generatePerformanceReport();
                } catch (error) {
                    console.error('Error generating performance report:', error);
                }
            }, reportInterval);
            
            // 監聽頁面可見性變化以優化性能
            this.setupVisibilityChangeHandler();
            
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
        const measureFrameRate = (currentTime) => {
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
            this.performanceObserver = new PerformanceObserver((list) => {
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
        
        const result = algorithmFunction();
        
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
        
        console.log(`Algorithm test "${testName}" completed in ${(endTime - startTime).toFixed(2)}ms`);
        
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
        
        const result = renderFunction();
        
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
            'slow-algorithm': `算法執行過慢: ${value.toFixed(1)} ms`
        };
        
        console.warn(`Performance Warning: ${warnings[type]}`);
        
        // 可以在這裡添加用戶通知或自動優化
        this.suggestOptimizations(type, value);
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
        
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1' &&
               !window.location.hostname.includes('github.io') === false; // GitHub Pages 也視為生產環境
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
            const frameRateData = this.metrics.frameRate.length > 0 ? this.metrics.frameRate : [0];
            
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
}

// 創建全局性能監控實例
const performanceMonitor = new PerformanceMonitor();

// 自動啟動性能監控（在開發模式下）
if (typeof window !== 'undefined' && window.location && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    performanceMonitor.startMonitoring();
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}