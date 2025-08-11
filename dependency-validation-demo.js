/**
 * Dependency Validation System Demo
 * 依賴驗證系統演示
 *
 * 這個演示展示了如何使用依賴驗證系統來：
 * 1. 檢查系統依賴
 * 2. 自動修復缺失的依賴
 * 3. 生成健康檢查報告
 * 4. 監控運行時狀態
 */

// 載入依賴驗證系統
const { dependencyValidator } = require('./utils/dependencyValidator.js');
const { dependencyDiagnostics } = require('./utils/dependencyDiagnostics.js');
const { dependencyIntegrationManager } = require('./utils/dependencyIntegration.js');

// 模擬瀏覽器環境
global.window = {
  performance: { now: () => Date.now() },
  document: {
    createElement: () => ({
      style: {},
      innerHTML: '',
      appendChild: () => {},
      remove: () => {}
    }),
    body: { appendChild: () => {} }
  }
};

async function runDemo() {
  console.log('🚀 依賴驗證系統演示開始\n');

  try {
    // === 第一部分：基本依賴驗證 ===
    console.log('📋 第一部分：基本依賴驗證');
    console.log('=' .repeat(50));

    // 啟用自動修復
    dependencyValidator.setAutoRepair(true);

    // 執行依賴驗證
    const validationResults = await dependencyValidator.validateAllDependencies();

    console.log('✅ 驗證完成！');
    console.log(`   - 總依賴項目: ${validationResults.dependencies.size}`);
    console.log(`   - 發現問題: ${validationResults.issues.length}`);
    console.log(`   - 自動修復: ${validationResults.repairs.length}`);
    console.log(`   - 整體狀態: ${validationResults.overall.passed ? '通過' : '失敗'}`);

    if (validationResults.repairs.length > 0) {
      console.log('\n🔧 自動修復的依賴項目:');
      validationResults.repairs.forEach(repair => {
        console.log(`   - ${repair.dependency}: ${repair.success ? '成功' : '失敗'}`);
      });
    }

    // === 第二部分：健康檢查報告 ===
    console.log('\n📊 第二部分：健康檢查報告');
    console.log('=' .repeat(50));

    const healthReport = dependencyValidator.generateHealthReport();
    console.log(`🏥 系統健康分數: ${healthReport.summary.healthScore}/100`);
    console.log(`   - 可用依賴: ${healthReport.summary.availableDependencies}/${healthReport.summary.totalDependencies}`);
    console.log(`   - 關鍵依賴: ${healthReport.summary.criticalDependencies} 個`);

    if (healthReport.actionItems.length > 0) {
      console.log('\n📝 建議行動項目:');
      healthReport.actionItems.forEach(item => {
        console.log(`   - [${item.priority}] ${item.action}: ${item.description}`);
      });
    }

    // === 第三部分：完整診斷 ===
    console.log('\n🔍 第三部分：完整系統診斷');
    console.log('=' .repeat(50));

    const diagnosticResults = await dependencyDiagnostics.runCompleteDiagnostics();
    console.log('🎯 診斷完成！');
    console.log(`   - 整體狀態: ${diagnosticResults.overall.status}`);
    console.log(`   - 健康分數: ${diagnosticResults.overall.score}/100`);
    console.log(`   - 檢查類別: ${Object.keys(diagnosticResults.categories).length}`);
    console.log(`   - 總問題: ${diagnosticResults.overall.issues}`);
    console.log(`   - 總警告: ${diagnosticResults.overall.warnings}`);

    // 顯示各類別結果
    console.log('\n📂 各類別診斷結果:');
    for (const [categoryName, category] of Object.entries(diagnosticResults.categories)) {
      const statusIcon = category.status === 'healthy' ? '✅' :
        category.status === 'issues' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ${category.name}: ${category.score}/100 (${category.issues.length} 問題, ${category.warnings.length} 警告)`);
    }

    // === 第四部分：回退實現測試 ===
    console.log('\n🛠️ 第四部分：回退實現功能測試');
    console.log('=' .repeat(50));

    // 測試回退的 LineDetector
    if (global.window.LineDetector) {
      const lineDetector = new global.window.LineDetector();
      const testBoard = [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
      ];

      const lines = lineDetector.getAllLines(testBoard);
      console.log(`✅ LineDetector 回退實現測試: 檢測到 ${lines.length} 條連線`);
    }

    // 測試回退的 ProbabilityCalculator
    if (global.window.ProbabilityCalculator) {
      const calculator = new global.window.ProbabilityCalculator();
      const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));

      const suggestion = calculator.getBestSuggestion(emptyBoard);
      console.log(`✅ ProbabilityCalculator 回退實現測試: 建議位置 (${suggestion.row}, ${suggestion.col})`);
    }

    // 測試回退的 Utils
    if (global.window.Utils) {
      const isValid = global.window.Utils.isValidPosition(2, 2, 5);
      const isEmpty = global.window.Utils.isCellEmpty([[0, 1], [2, 0]], 0, 0);
      console.log(`✅ Utils 回退實現測試: 位置驗證=${isValid}, 格子檢查=${isEmpty}`);
    }

    // === 第五部分：整合管理器演示 ===
    console.log('\n🎛️ 第五部分：整合管理器演示');
    console.log('=' .repeat(50));

    // 初始化整合管理器
    const initSuccess = await dependencyIntegrationManager.initializeDependencyCheck();
    console.log(`🚀 整合管理器初始化: ${initSuccess ? '成功' : '失敗'}`);

    if (initSuccess) {
      const status = dependencyIntegrationManager.getCurrentStatus();
      console.log(`   - 健康分數: ${status.healthScore}/100`);
      console.log(`   - 有問題: ${status.hasIssues ? '是' : '否'}`);
      console.log(`   - 監控狀態: ${status.isMonitoring ? '運行中' : '已停止'}`);

      // 生成狀態報告
      const statusReport = dependencyIntegrationManager.generateStatusReport();
      console.log('\n📋 系統狀態報告:');
      console.log(statusReport);
    }

    // === 第六部分：性能統計 ===
    console.log('\n⚡ 第六部分：性能統計');
    console.log('=' .repeat(50));

    console.log(`🕐 驗證執行時間: ${validationResults.performance.totalTime}ms`);
    console.log(`🕐 診斷執行時間: ${diagnosticResults.performance.totalTime}ms`);
    console.log(`📊 檢查的依賴項目: ${validationResults.performance.dependenciesChecked}`);
    console.log(`🧪 執行的測試: ${diagnosticResults.performance.testsExecuted}`);

    // === 演示完成 ===
    console.log('\n🎉 演示完成！');
    console.log('=' .repeat(50));
    console.log('依賴驗證系統已成功演示以下功能：');
    console.log('✅ 自動檢測和修復缺失的依賴項目');
    console.log('✅ 生成詳細的健康檢查報告');
    console.log('✅ 執行全面的系統診斷');
    console.log('✅ 提供功能完整的回退實現');
    console.log('✅ 整合管理和監控功能');
    console.log('✅ 性能監控和優化建議');

    // 清理資源
    dependencyIntegrationManager.cleanup();

  } catch (error) {
    console.error('❌ 演示過程中發生錯誤:', error);
    console.error('錯誤堆棧:', error.stack);
  }
}

// 執行演示
if (require.main === module) {
  runDemo().then(() => {
    console.log('\n👋 演示結束，感謝觀看！');
    process.exit(0);
  }).catch(error => {
    console.error('演示執行失敗:', error);
    process.exit(1);
  });
}

module.exports = { runDemo };
