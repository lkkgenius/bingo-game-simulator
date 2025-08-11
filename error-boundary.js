/**
 * Error Boundary System for Bingo Game Simulator
 * 添加錯誤邊界處理，防止應用程式崩潰
 */

// Logger 初始化 - 使用函數作用域避免全局衝突
const getLogger = () => {
  if (typeof window !== 'undefined' && window.logger) {
    return window.logger;
  } else if (typeof require !== 'undefined') {
    try {
      const { logger: prodLogger } = require('./production-logger.js');
      return prodLogger;
    } catch (e) {
      return null;
    }
  }
  return null;
};
const errorLogger = getLogger();

/**
 * 全局錯誤邊界類
 */
class ErrorBoundary {
  constructor() {
    this.errorHandlers = new Map();
    this.errorLog = [];
    this.maxLogSize = 100;
    this.isInitialized = false;

    this.init();
  }

  /**
     * 初始化錯誤邊界
     */
  init() {
    if (this.isInitialized) {
      return;
    }

    // 捕獲未處理的 JavaScript 錯誤
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error ? event.error.stack : null
      });
    });

    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        message: event.reason ? event.reason.message : 'Unhandled promise rejection',
        error: event.reason,
        stack: event.reason ? event.reason.stack : null
      });
    });

    // 捕獲資源載入錯誤
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          type: 'resource',
          message: `Failed to load resource: ${event.target.src || event.target.href}`,
          element: event.target.tagName,
          source: event.target.src || event.target.href
        });
      }
    }, true);

    this.isInitialized = true;
    if (errorLogger) {
      errorLogger.info('Error boundary initialized');
    }
  }

  /**
     * 處理錯誤
     */
  handleError(errorInfo) {
    const errorEntry = {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      id: this.generateErrorId()
    };

    // 檢查是否為非致命錯誤（不需要顯示紅色對話框）
    const isNonFatalError = this.isNonFatalError(errorEntry);

    // 記錄錯誤
    this.logError(errorEntry);

    // 執行註冊的錯誤處理器
    const handlers = this.errorHandlers.get(errorInfo.type) || [];
    handlers.forEach(handler => {
      try {
        handler(errorEntry);
      } catch (handlerError) {
        if (errorLogger) {
          errorLogger.error('Error in error handler:', handlerError);
        }
      }
    });

    // 執行全局錯誤處理器
    const globalHandlers = this.errorHandlers.get('global') || [];
    globalHandlers.forEach(handler => {
      try {
        handler(errorEntry);
      } catch (handlerError) {
        if (errorLogger) {
          errorLogger.error('Error in global error handler:', handlerError);
        }
      }
    });

    // 只對致命錯誤顯示用戶友好的錯誤訊息
    if (!isNonFatalError) {
      this.showUserError(errorEntry);
    }

    // 嘗試恢復應用程式狀態
    this.attemptRecovery(errorEntry);
  }

  /**
     * 檢查是否為非致命錯誤
     */
  isNonFatalError(errorEntry) {
    const nonFatalPatterns = [
      /Script error/i,
      /Identifier.*has already been declared/i,
      /favicon.*not found/i,
      /Failed to load resource.*favicon/i,
      /Script loader not available/i
    ];

    return nonFatalPatterns.some(pattern =>
      pattern.test(errorEntry.message) ||
            pattern.test(errorEntry.error?.message || '')
    );
  }

  /**
     * 記錄錯誤
     */
  logError(errorEntry) {
    this.errorLog.push(errorEntry);

    // 限制日誌大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // 輸出到控制台
    if (errorLogger) {
      errorLogger.error('Error caught by boundary:', errorEntry);
    }

    // 發送到錯誤追蹤服務（如果配置了）
    this.sendToErrorTracking(errorEntry);
  }

  /**
     * 顯示用戶友好的錯誤訊息
     */
  showUserError(errorEntry) {
    const errorMessages = {
      script: '應用程式遇到了一個錯誤，正在嘗試恢復...',
      promise: '操作失敗，請稍後再試',
      resource: '資源載入失敗，請檢查網路連接',
      game: '遊戲遇到錯誤，正在重置...',
      network: '網路連接出現問題，請檢查連接',
      storage: '本地存儲出現問題，某些功能可能受影響'
    };

    const message = errorMessages[errorEntry.type] || '發生了未知錯誤';

    // 顯示錯誤通知
    this.showErrorNotification(message, errorEntry);

    // 對於嚴重錯誤，顯示錯誤頁面
    if (this.isCriticalError(errorEntry)) {
      this.showErrorPage(errorEntry);
    }
  }

  /**
     * 顯示錯誤通知
     */
  showErrorNotification(message, errorEntry) {
    // 檢查是否已經有錯誤通知顯示
    const existingNotification = document.querySelector('.error-notification');
    if (existingNotification) {
      // 更新現有通知而不是創建新的
      const messageElement = existingNotification.querySelector('.error-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
      return;
    }

    const notification = SafeDOM.createStructure({
      tag: 'div',
      attributes: {
        class: 'error-notification',
        role: 'alert',
        'aria-live': 'assertive',
        'aria-atomic': 'true'
      },
      children: [{
        tag: 'div',
        attributes: { class: 'error-notification-content' },
        children: [
          {
            tag: 'div',
            attributes: {
              class: 'error-icon',
              'aria-hidden': 'true'
            },
            textContent: this.getErrorIcon(errorEntry.type)
          },
          {
            tag: 'div',
            attributes: { class: 'error-message' },
            textContent: message
          },
          {
            tag: 'div',
            attributes: {
              class: 'error-actions',
              role: 'group',
              'aria-label': '錯誤處理選項'
            },
            children: [
              {
                tag: 'button',
                attributes: {
                  class: 'error-retry-btn',
                  'aria-label': '重試上次操作'
                },
                textContent: '重試'
              },
              {
                tag: 'button',
                attributes: {
                  class: 'error-dismiss-btn',
                  'aria-label': '關閉錯誤通知'
                },
                textContent: '關閉'
              },
              {
                tag: 'button',
                attributes: {
                  class: 'error-report-btn',
                  'aria-label': '回報此問題'
                },
                textContent: '回報問題'
              }
            ]
          }
        ]
      }]
    });

    // 添加增強樣式
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff4444, #cc3333);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 4px 8px rgba(255,68,68,0.2);
            z-index: 10000;
            max-width: 420px;
            min-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            animation: slideInFromRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

    // 添加動畫樣式
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
            @keyframes slideInFromRight {
                0% {
                    transform: translateX(100%);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutToRight {
                0% {
                    transform: translateX(0);
                    opacity: 1;
                }
                100% {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .error-notification-content {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .error-icon {
                font-size: 1.5rem;
                text-align: center;
            }
            
            .error-message {
                font-size: 1rem;
                line-height: 1.4;
                text-align: center;
            }
            
            .error-actions {
                display: flex;
                gap: 8px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .error-actions button {
                padding: 8px 16px;
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 6px;
                background: rgba(255,255,255,0.1);
                color: white;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s ease;
                backdrop-filter: blur(5px);
            }
            
            .error-actions button:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            
            .error-actions button:focus {
                outline: 2px solid rgba(255,255,255,0.8);
                outline-offset: 2px;
            }
            
            .error-retry-btn {
                background: rgba(76, 175, 80, 0.3) !important;
                border-color: rgba(76, 175, 80, 0.5) !important;
            }
            
            .error-retry-btn:hover {
                background: rgba(76, 175, 80, 0.5) !important;
            }
        `;

    if (!document.getElementById('error-notification-styles')) {
      animationStyles.id = 'error-notification-styles';
      document.head.appendChild(animationStyles);
    }

    // 添加事件監聽器
    const retryBtn = notification.querySelector('.error-retry-btn');
    const dismissBtn = notification.querySelector('.error-dismiss-btn');
    const reportBtn = notification.querySelector('.error-report-btn');

    retryBtn.addEventListener('click', () => {
      this.retryLastAction();
      this.dismissNotification(notification);
    });

    dismissBtn.addEventListener('click', () => {
      this.dismissNotification(notification);
    });

    reportBtn.addEventListener('click', () => {
      this.showErrorReportDialog(errorEntry);
      this.dismissNotification(notification);
    });

    // 鍵盤支持
    notification.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.dismissNotification(notification);
      }
    });

    document.body.appendChild(notification);

    // 聚焦到第一個按鈕以便鍵盤導航
    setTimeout(() => {
      retryBtn.focus();
    }, 100);

    // 自動移除通知（但給用戶更多時間）
    const autoCloseTimeout = setTimeout(() => {
      if (notification.parentNode) {
        this.dismissNotification(notification);
      }
    }, 15000);

    // 如果用戶與通知互動，取消自動關閉
    notification.addEventListener('mouseenter', () => {
      clearTimeout(autoCloseTimeout);
    });

    // 通知無障礙功能
    if (window.accessibilityEnhancer) {
      window.accessibilityEnhancer.announce(`錯誤：${message}`, 'assertive');
    }
  }

  /**
     * 獲取錯誤圖標
     */
  getErrorIcon(errorType) {
    const icons = {
      'javascript': '🚫',
      'promise': '⚠️',
      'resource': '📁',
      'game': '🎮',
      'network': '🌐',
      'storage': '💾'
    };

    return icons[errorType] || '❌';
  }

  /**
     * 優雅地關閉通知
     */
  dismissNotification(notification) {
    notification.style.animation = 'slideOutToRight 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }

  /**
     * 顯示錯誤頁面
     */
  showErrorPage(errorEntry) {
    const errorPage = SafeDOM.createStructure({
      tag: 'div',
      attributes: { class: 'error-page' },
      children: [{
        tag: 'div',
        attributes: { class: 'error-page-content' },
        children: [
          {
            tag: 'h1',
            textContent: '應用程式遇到錯誤'
          },
          {
            tag: 'p',
            textContent: '很抱歉，應用程式遇到了一個無法恢復的錯誤。'
          },
          {
            tag: 'div',
            attributes: { class: 'error-details' },
            children: [
              {
                tag: 'p',
                children: [
                  { tag: 'strong', textContent: '錯誤 ID:' },
                  ` ${errorEntry.id}`
                ]
              },
              {
                tag: 'p',
                children: [
                  { tag: 'strong', textContent: '時間:' },
                  ` ${new Date(errorEntry.timestamp).toLocaleString()}`
                ]
              }
            ]
          },
          {
            tag: 'div',
            attributes: { class: 'error-actions' },
            children: [
              {
                tag: 'button',
                attributes: { class: 'reload-btn' },
                textContent: '重新載入頁面'
              },
              {
                tag: 'button',
                attributes: { class: 'report-btn' },
                textContent: '回報問題'
              }
            ]
          }
        ]
      }]
    });

    // 添加樣式
    errorPage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20000;
            font-family: Arial, sans-serif;
        `;

    errorPage.querySelector('.error-page-content').style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 500px;
            margin: 20px;
        `;

    // 添加事件監聽器
    errorPage.querySelector('.reload-btn').addEventListener('click', () => {
      window.location.reload();
    });

    errorPage.querySelector('.report-btn').addEventListener('click', () => {
      this.showErrorReportDialog(errorEntry);
    });

    document.body.appendChild(errorPage);
  }

  /**
     * 顯示錯誤回報對話框
     */
  showErrorReportDialog(errorEntry) {
    const dialog = SafeDOM.createStructure({
      tag: 'div',
      attributes: { class: 'error-report-dialog' },
      children: [{
        tag: 'div',
        attributes: { class: 'dialog-content' },
        children: [
          {
            tag: 'h3',
            textContent: '回報錯誤'
          },
          {
            tag: 'p',
            textContent: '請描述發生錯誤時您正在做什麼：'
          },
          {
            tag: 'textarea',
            attributes: {
              class: 'error-description',
              placeholder: '請描述您的操作步驟...'
            }
          },
          {
            tag: 'div',
            attributes: { class: 'dialog-actions' },
            children: [
              {
                tag: 'button',
                attributes: { class: 'send-report-btn' },
                textContent: '發送回報'
              },
              {
                tag: 'button',
                attributes: { class: 'cancel-btn' },
                textContent: '取消'
              }
            ]
          }
        ]
      }]
    });

    // 添加樣式
    dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 25000;
        `;

    // 添加事件監聽器
    dialog.querySelector('.send-report-btn').addEventListener('click', () => {
      const description = dialog.querySelector('.error-description').value;
      this.sendErrorReport(errorEntry, description);
      dialog.remove();
    });

    dialog.querySelector('.cancel-btn').addEventListener('click', () => {
      dialog.remove();
    });

    document.body.appendChild(dialog);
  }

  /**
     * 嘗試恢復應用程式狀態
     */
  attemptRecovery(errorEntry) {
    switch (errorEntry.type) {
    case 'game':
      this.recoverGameState();
      break;
    case 'storage':
      this.recoverStorageState();
      break;
    case 'network':
      this.recoverNetworkState();
      break;
    default:
      this.performGeneralRecovery();
    }
  }

  /**
     * 恢復遊戲狀態
     */
  recoverGameState() {
    try {
      // 重置遊戲到安全狀態
      if (window.gameState && typeof window.gameState.reset === 'function') {
        window.gameState.reset();
      }

      // 重新初始化遊戲組件
      if (window.initializeGame && typeof window.initializeGame === 'function') {
        window.initializeGame();
      }

      if (errorLogger) {
        errorLogger.info('Game state recovered');
      }
    } catch (error) {
      if (errorLogger) {
        errorLogger.error('Failed to recover game state:', error);
      }
    }
  }

  /**
     * 恢復存儲狀態
     */
  recoverStorageState() {
    try {
      // 清理可能損壞的本地存儲
      const keysToCheck = ['gameState', 'userPreferences', 'gameHistory'];
      keysToCheck.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            JSON.parse(value); // 測試是否為有效 JSON
          }
        } catch (error) {
          localStorage.removeItem(key);
          if (errorLogger) {
            errorLogger.info(`Removed corrupted storage key: ${key}`);
          }
        }
      });

      if (errorLogger) {
        errorLogger.info('Storage state recovered');
      }
    } catch (error) {
      if (errorLogger) {
        errorLogger.error('Failed to recover storage state:', error);
      }
    }
  }

  /**
     * 恢復網路狀態
     */
  recoverNetworkState() {
    // 檢查網路連接
    if (navigator.onLine) {
      if (errorLogger) {
        errorLogger.info('Network connection restored');
      }
    } else {
      if (errorLogger) {
        errorLogger.info('Still offline, enabling offline mode');
      }
      this.enableOfflineMode();
    }
  }

  /**
     * 執行一般恢復
     */
  performGeneralRecovery() {
    try {
      // 清理可能的記憶體洩漏
      this.cleanupMemory();

      // 重新初始化關鍵組件
      this.reinitializeCriticalComponents();

      if (errorLogger) {
        errorLogger.info('General recovery completed');
      }
    } catch (error) {
      if (errorLogger) {
        errorLogger.error('General recovery failed:', error);
      }
    }
  }

  /**
     * 清理記憶體
     */
  cleanupMemory() {
    // 清理定時器
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }

    // 清理間隔器
    const highestIntervalId = setInterval(() => {}, 0);
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
  }

  /**
     * 重新初始化關鍵組件
     */
  reinitializeCriticalComponents() {
    // 這裡可以重新初始化關鍵的應用程式組件
    if (window.setupUIEventListeners && typeof window.setupUIEventListeners === 'function') {
      window.setupUIEventListeners();
    }
  }

  /**
     * 啟用離線模式
     */
  enableOfflineMode() {
    document.body.classList.add('offline-mode');

    // 顯示離線通知
    const offlineNotice = document.createElement('div');
    offlineNotice.className = 'offline-notice';
    offlineNotice.textContent = '您目前處於離線模式';
    offlineNotice.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #ff9800;
            color: white;
            text-align: center;
            padding: 8px;
            z-index: 15000;
        `;

    document.body.appendChild(offlineNotice);
  }

  /**
     * 註冊錯誤處理器
     */
  registerErrorHandler(type, handler) {
    if (!this.errorHandlers.has(type)) {
      this.errorHandlers.set(type, []);
    }
    this.errorHandlers.get(type).push(handler);
  }

  /**
     * 移除錯誤處理器
     */
  removeErrorHandler(type, handler) {
    const handlers = this.errorHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
     * 判斷是否為嚴重錯誤
     */
  isCriticalError(errorEntry) {
    const criticalPatterns = [
      /Cannot read property/,
      /Cannot access before initialization/,
      /is not a function/,
      /Maximum call stack size exceeded/
    ];

    return criticalPatterns.some(pattern =>
      pattern.test(errorEntry.message || '')
    );
  }

  /**
     * 生成錯誤 ID
     */
  generateErrorId() {
    return 'ERR_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  }

  /**
     * 重試最後一個操作
     */
  retryLastAction() {
    // 這裡可以實現重試邏輯
    if (errorLogger) {
      errorLogger.info('Retrying last action...');
    }
    window.location.reload();
  }

  /**
     * 發送錯誤到追蹤服務
     */
  sendToErrorTracking(errorEntry) {
    // 這裡可以發送錯誤到外部追蹤服務
    // 例如 Sentry, LogRocket 等
    if (errorLogger) {
      errorLogger.debug('Error would be sent to tracking service:', errorEntry);
    }
  }

  /**
     * 發送錯誤回報
     */
  sendErrorReport(errorEntry, userDescription) {
    const report = {
      ...errorEntry,
      userDescription,
      reportedAt: new Date().toISOString()
    };

    if (errorLogger) {
      errorLogger.debug('Error report:', report);
    }

    // 這裡可以發送到錯誤回報服務
    // 暫時存儲在本地
    try {
      const reports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      reports.push(report);
      localStorage.setItem('errorReports', JSON.stringify(reports));
    } catch (error) {
      if (errorLogger) {
        errorLogger.error('Failed to save error report:', error);
      }
    }
  }

  /**
     * 獲取錯誤日誌
     */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
     * 清除錯誤日誌
     */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
     * 獲取錯誤統計
     */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      recent: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });

    return stats;
  }
}

// 創建全局錯誤邊界實例
const globalErrorBoundary = new ErrorBoundary();

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorBoundary;
} else {
  window.ErrorBoundary = ErrorBoundary;
  window.globalErrorBoundary = globalErrorBoundary;
}
