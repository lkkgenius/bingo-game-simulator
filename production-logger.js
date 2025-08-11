/**
 * Production Logger
 * 生產環境安全的日誌管理器
 */

class ProductionLogger {
  constructor() {
    this.isDevelopment = this.checkDevelopmentMode();
    this.logLevel = this.isDevelopment ? 'debug' : 'error';
    this.maxLogEntries = 100;
    this.logBuffer = [];
  }

  /**
     * 檢查是否為開發模式
     */
  checkDevelopmentMode() {
    // 檢查多個指標來確定是否為開發環境
    // 在 Node.js 環境中，window 可能不存在
    if (typeof window === 'undefined' || !window.location) {
      return true; // 在測試環境中視為開發環境
    }

    return (
      window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev') ||
            window.location.search.includes('debug=true') ||
            (typeof localStorage !== 'undefined' && localStorage.getItem('debug-mode') === 'true')
    );
  }

  /**
     * 記錄調試信息
     */
  debug(...args) {
    if (this.isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
    this.addToBuffer('debug', args);
  }

  /**
     * 記錄信息
     */
  info(...args) {
    if (this.isDevelopment) {
      console.info('[INFO]', ...args);
    }
    this.addToBuffer('info', args);
  }

  /**
     * 記錄警告
     */
  warn(...args) {
    if (this.isDevelopment) {
      console.warn('[WARN]', ...args);
    }
    this.addToBuffer('warn', args);
  }

  /**
     * 記錄錯誤（總是記錄）
     */
  error(...args) {
    console.error('[ERROR]', ...args);
    this.addToBuffer('error', args);
  }

  /**
     * 添加到日誌緩衝區
     */
  addToBuffer(level, args) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message: args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
    };

    this.logBuffer.push(entry);

    // 保持緩衝區大小
    if (this.logBuffer.length > this.maxLogEntries) {
      this.logBuffer.shift();
    }
  }

  /**
     * 獲取日誌緩衝區
     */
  getLogBuffer() {
    return [...this.logBuffer];
  }

  /**
     * 清空日誌緩衝區
     */
  clearBuffer() {
    this.logBuffer = [];
  }

  /**
     * 導出日誌
     */
  exportLogs() {
    const logs = this.getLogBuffer();
    const logText = logs.map(entry =>
      `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}`
    ).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `bingo-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
     * 設置日誌級別
     */
  setLogLevel(level) {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    if (validLevels.includes(level)) {
      this.logLevel = level;
    }
  }

  /**
     * 啟用開發模式
     */
  enableDevelopmentMode() {
    this.isDevelopment = true;
    localStorage.setItem('debug-mode', 'true');
  }

  /**
     * 禁用開發模式
     */
  disableDevelopmentMode() {
    this.isDevelopment = false;
    localStorage.removeItem('debug-mode');
  }
}

// 創建全局實例
if (typeof window !== 'undefined' && !window.logger) {
  window.logger = new ProductionLogger();
}

// 導出供其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
  const logger = new ProductionLogger();
  module.exports = { ProductionLogger, logger };
} else if (typeof window !== 'undefined') {
  window.ProductionLogger = ProductionLogger;
  window.logger = logger;
}
