/**
 * Dependency Integration - 依賴整合示例
 *
 * 這個文件展示如何在實際應用中使用依賴驗證系統
 * 包括初始化檢查、運行時監控和錯誤處理
 *
 * @version 1.0.0
 */

// 載入依賴驗證器和診斷工具
let dependencyValidator, dependencyDiagnostics, logger;

if (typeof require !== 'undefined') {
  const { dependencyValidator: validator } = require('./dependencyValidator.js');
  const { dependencyDiagnostics: diagnostics } = require('./dependencyDiagnostics.js');
  dependencyValidator = validator;
  dependencyDiagnostics = diagnostics;

  try {
    const { logger: prodLogger } = require('../production-logger.js');
    logger = prodLogger;
  } catch (e) {
    logger = console;
  }
} else if (typeof window !== 'undefined') {
  dependencyValidator = window.dependencyValidator;
  dependencyDiagnostics = window.dependencyDiagnostics;
  logger = window.logger || console;
}

/**
 * 依賴整合管理器
 */
class DependencyIntegrationManager {
  constructor() {
    this.initializationComplete = false;
    this.validationResults = null;
    this.diagnosticResults = null;
    this.errorHandlers = new Map();
    this.statusCallbacks = [];

    this.setupErrorHandlers();
  }

  /**
     * 設置錯誤處理器
     */
  setupErrorHandlers() {
    // 關鍵依賴缺失處理器
    this.errorHandlers.set('critical_dependency_missing', (error) => {
      logger.error('關鍵依賴缺失:', error);
      this.displayCriticalError(error);
      return false; // 阻止繼續執行
    });

    // 可選依賴缺失處理器
    this.errorHandlers.set('optional_dependency_missing', (error) => {
      logger.warn('可選依賴缺失:', error);
      this.displayWarning(error);
      return true; // 允許繼續執行
    });

    // 性能問題處理器
    this.errorHandlers.set('performance_issue', (error) => {
      logger.warn('性能問題:', error);
      this.displayPerformanceWarning(error);
      return true;
    });

    // 兼容性問題處理器
    this.errorHandlers.set('compatibility_issue', (error) => {
      logger.warn('兼容性問題:', error);
      this.displayCompatibilityWarning(error);
      return true;
    });
  }

  /**
     * 初始化依賴檢查
     * @returns {Promise<boolean>} 初始化是否成功
     */
  async initializeDependencyCheck() {
    logger.info('開始初始化依賴檢查...');

    try {
      // 1. 執行基本依賴驗證
      if (!dependencyValidator) {
        throw new Error('依賴驗證器不可用');
      }

      this.validationResults = await dependencyValidator.validateAllDependencies();

      // 2. 檢查關鍵依賴
      const criticalIssues = this.validationResults.issues.filter(issue => issue.severity === 'critical');

      if (criticalIssues.length > 0) {
        logger.error(`發現 ${criticalIssues.length} 個關鍵依賴問題`);

        for (const issue of criticalIssues) {
          const canContinue = this.handleError('critical_dependency_missing', issue);
          if (!canContinue) {
            return false;
          }
        }
      }

      // 3. 執行完整診斷（如果可用）
      if (dependencyDiagnostics) {
        this.diagnosticResults = await dependencyDiagnostics.runCompleteDiagnostics();

        // 處理診斷發現的問題
        await this.processDiagnosticResults(this.diagnosticResults);
      }

      // 4. 設置運行時監控
      this.setupRuntimeMonitoring();

      this.initializationComplete = true;
      this.notifyStatusChange('initialized', {
        validationResults: this.validationResults,
        diagnosticResults: this.diagnosticResults
      });

      logger.info('依賴檢查初始化完成');
      return true;

    } catch (error) {
      logger.error('依賴檢查初始化失敗:', error);
      this.handleError('initialization_failed', error);
      return false;
    }
  }

  /**
     * 處理診斷結果
     * @private
     */
  async processDiagnosticResults(results) {
    // 處理性能問題
    const performanceIssues = this.extractIssuesByType(results, 'performance');
    for (const issue of performanceIssues) {
      this.handleError('performance_issue', issue);
    }

    // 處理兼容性問題
    const compatibilityIssues = this.extractIssuesByType(results, 'compatibility');
    for (const issue of compatibilityIssues) {
      this.handleError('compatibility_issue', issue);
    }

    // 處理可選依賴問題
    const optionalIssues = this.extractOptionalDependencyIssues(results);
    for (const issue of optionalIssues) {
      this.handleError('optional_dependency_missing', issue);
    }
  }

  /**
     * 從診斷結果中提取特定類型的問題
     * @private
     */
  extractIssuesByType(results, type) {
    const issues = [];

    for (const [categoryName, category] of Object.entries(results.categories)) {
      if (categoryName.includes(type)) {
        issues.push(...category.issues);
        issues.push(...category.warnings);
      }
    }

    return issues;
  }

  /**
     * 提取可選依賴問題
     * @private
     */
  extractOptionalDependencyIssues(results) {
    const issues = [];
    const optionalDependencies = ['EnhancedProbabilityCalculator', 'AILearningSystem', 'PerformanceMonitor'];

    if (this.validationResults) {
      for (const [depName, depResult] of this.validationResults.dependencies) {
        if (optionalDependencies.includes(depName) && !depResult.available) {
          issues.push({
            dependency: depName,
            message: `可選依賴 ${depName} 不可用`,
            severity: 'warning'
          });
        }
      }
    }

    return issues;
  }

  /**
     * 設置運行時監控
     * @private
     */
  setupRuntimeMonitoring() {
    if (!dependencyDiagnostics) {
      logger.warn('診斷工具不可用，跳過運行時監控設置');
      return;
    }

    // 設置監控回調
    dependencyDiagnostics.onDiagnosticEvent('alert', (alertData) => {
      logger.warn('依賴監控警報:', alertData);
      this.handleRuntimeAlert(alertData);
    });

    dependencyDiagnostics.onDiagnosticEvent('monitoring', (results) => {
      this.processMonitoringResults(results);
    });

    // 啟動監控（每5分鐘檢查一次）
    dependencyDiagnostics.startMonitoring(300000);

    logger.info('運行時依賴監控已啟動');
  }

  /**
     * 處理運行時警報
     * @private
     */
  handleRuntimeAlert(alertData) {
    const alertMessage = {
      type: 'runtime_alert',
      severity: this.determineAlertSeverity(alertData),
      message: `運行時依賴警報: ${alertData.type}`,
      data: alertData
    };

    this.notifyStatusChange('alert', alertMessage);

    // 根據警報類型採取行動
    switch (alertData.type) {
    case 'healthScore':
      if (alertData.value < 50) {
        logger.error('系統健康分數過低，建議立即檢查');
        this.displayCriticalError({
          message: '系統依賴健康狀況嚴重惡化',
          recommendation: '請檢查系統狀態或重新載入頁面'
        });
      }
      break;

    case 'criticalDependencies':
      logger.error('關鍵依賴項目出現問題');
      this.displayCriticalError({
        message: '關鍵系統組件不可用',
        recommendation: '請重新載入頁面或聯繫技術支持'
      });
      break;
    }
  }

  /**
     * 處理監控結果
     * @private
     */
  processMonitoringResults(results) {
    // 更新最新的診斷結果
    this.diagnosticResults = results;

    // 檢查是否有新問題
    const newIssues = this.detectNewIssues(results);
    if (newIssues.length > 0) {
      logger.info(`檢測到 ${newIssues.length} 個新問題`);
      this.notifyStatusChange('new_issues', newIssues);
    }

    // 檢查是否有改善
    const improvements = this.detectImprovements(results);
    if (improvements.length > 0) {
      logger.info(`檢測到 ${improvements.length} 個改善項目`);
      this.notifyStatusChange('improvements', improvements);
    }
  }

  /**
     * 檢測新問題
     * @private
     */
  detectNewIssues(currentResults) {
    // 這裡可以實現更複雜的問題檢測邏輯
    // 目前返回空數組作為示例
    return [];
  }

  /**
     * 檢測改善項目
     * @private
     */
  detectImprovements(currentResults) {
    // 這裡可以實現改善檢測邏輯
    // 目前返回空數組作為示例
    return [];
  }

  /**
     * 確定警報嚴重程度
     * @private
     */
  determineAlertSeverity(alertData) {
    switch (alertData.type) {
    case 'healthScore':
      return alertData.value < 30 ? 'critical' : alertData.value < 60 ? 'high' : 'medium';
    case 'criticalDependencies':
      return 'critical';
    case 'responseTime':
      return alertData.value > 5000 ? 'high' : 'medium';
    default:
      return 'medium';
    }
  }

  /**
     * 處理錯誤
     * @private
     */
  handleError(errorType, error) {
    const handler = this.errorHandlers.get(errorType);
    if (handler) {
      return handler(error);
    } else {
      logger.error(`未處理的錯誤類型: ${errorType}`, error);
      return true; // 默認允許繼續執行
    }
  }

  /**
     * 顯示關鍵錯誤
     * @private
     */
  displayCriticalError(error) {
    if (typeof window !== 'undefined' && window.document) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;

      errorDiv.innerHTML = `
                <h3 style="margin: 0 0 10px 0;">⚠️ 系統錯誤</h3>
                <p style="margin: 0 0 10px 0;"><strong>${error.dependency || '系統'}:</strong> ${error.message}</p>
                ${error.recommendation ? `<p style="margin: 0 0 15px 0; font-size: 14px;"><strong>建議:</strong> ${error.recommendation}</p>` : ''}
                <button onclick="this.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                ">關閉</button>
            `;

      document.body.appendChild(errorDiv);

      // 5秒後自動移除（如果用戶沒有手動關閉）
      setTimeout(() => {
        if (errorDiv.parentElement) {
          errorDiv.remove();
        }
      }, 5000);
    }
  }

  /**
     * 顯示警告
     * @private
     */
  displayWarning(warning) {
    if (typeof console !== 'undefined') {
      console.warn(`⚠️ ${warning.dependency || '系統'}: ${warning.message}`);
    }
  }

  /**
     * 顯示性能警告
     * @private
     */
  displayPerformanceWarning(warning) {
    logger.warn(`🐌 性能警告: ${warning.message}`);
  }

  /**
     * 顯示兼容性警告
     * @private
     */
  displayCompatibilityWarning(warning) {
    logger.warn(`🔧 兼容性警告: ${warning.message}`);
  }

  /**
     * 通知狀態變更
     * @private
     */
  notifyStatusChange(status, data) {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status, data);
      } catch (error) {
        logger.warn('狀態回調執行失敗:', error);
      }
    });
  }

  /**
     * 註冊狀態變更回調
     * @param {Function} callback - 回調函數
     */
  onStatusChange(callback) {
    this.statusCallbacks.push(callback);
  }

  /**
     * 獲取當前狀態
     * @returns {Object} 當前狀態信息
     */
  getCurrentStatus() {
    return {
      initialized: this.initializationComplete,
      validationResults: this.validationResults,
      diagnosticResults: this.diagnosticResults,
      healthScore: this.diagnosticResults?.overall?.score || 0,
      hasIssues: this.validationResults?.issues?.length > 0 || false,
      isMonitoring: dependencyDiagnostics?.isMonitoring || false
    };
  }

  /**
     * 執行手動健康檢查
     * @returns {Promise<Object>} 檢查結果
     */
  async performHealthCheck() {
    logger.info('執行手動健康檢查...');

    try {
      // 重新執行驗證
      if (dependencyValidator) {
        this.validationResults = await dependencyValidator.validateAllDependencies();
      }

      // 重新執行診斷
      if (dependencyDiagnostics) {
        this.diagnosticResults = await dependencyDiagnostics.runCompleteDiagnostics();
      }

      const status = this.getCurrentStatus();
      this.notifyStatusChange('health_check_complete', status);

      logger.info('手動健康檢查完成');
      return status;

    } catch (error) {
      logger.error('手動健康檢查失敗:', error);
      throw error;
    }
  }

  /**
     * 生成狀態報告
     * @returns {string} 格式化的狀態報告
     */
  generateStatusReport() {
    const status = this.getCurrentStatus();

    let report = `
=== 依賴系統狀態報告 ===
時間: ${new Date().toISOString()}
初始化狀態: ${status.initialized ? '✅ 完成' : '❌ 未完成'}
健康分數: ${status.healthScore}/100
監控狀態: ${status.isMonitoring ? '🔄 運行中' : '⏸️ 已停止'}
問題狀態: ${status.hasIssues ? '⚠️ 有問題' : '✅ 正常'}
`;

    if (status.validationResults) {
      report += `
=== 驗證結果 ===
總依賴項目: ${status.validationResults.dependencies.size}
問題數量: ${status.validationResults.issues.length}
修復數量: ${status.validationResults.repairs.length}
`;
    }

    if (status.diagnosticResults) {
      report += `
=== 診斷結果 ===
檢查類別: ${Object.keys(status.diagnosticResults.categories).length}
總問題: ${status.diagnosticResults.overall.issues}
總警告: ${status.diagnosticResults.overall.warnings}
`;
    }

    return report;
  }

  /**
     * 清理資源
     */
  cleanup() {
    // 停止監控
    if (dependencyDiagnostics && dependencyDiagnostics.isMonitoring) {
      dependencyDiagnostics.stopMonitoring();
    }

    // 清除回調
    this.statusCallbacks = [];

    // 重置狀態
    this.initializationComplete = false;
    this.validationResults = null;
    this.diagnosticResults = null;

    logger.info('依賴整合管理器已清理');
  }
}

// 創建全局實例
const dependencyIntegrationManager = new DependencyIntegrationManager();

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DependencyIntegrationManager, dependencyIntegrationManager };
} else if (typeof window !== 'undefined') {
  window.DependencyIntegrationManager = DependencyIntegrationManager;
  window.dependencyIntegrationManager = dependencyIntegrationManager;
}

// 如果在瀏覽器環境中，自動初始化
if (typeof window !== 'undefined' && window.document) {
  // 等待 DOM 載入完成後初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      dependencyIntegrationManager.initializeDependencyCheck().catch(error => {
        console.error('自動依賴檢查初始化失敗:', error);
      });
    });
  } else {
    // DOM 已經載入完成
    setTimeout(() => {
      dependencyIntegrationManager.initializeDependencyCheck().catch(error => {
        console.error('自動依賴檢查初始化失敗:', error);
      });
    }, 100);
  }
}
