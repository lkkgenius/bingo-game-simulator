#!/usr/bin/env node

/**
 * Bingo 遊戲 Playwright 功能測試執行器
 * 使用 Playwright MCP Server 執行完整的功能測試
 */

const BingoPlaywrightFunctionTests = require('./bingo-playwright-function-tests.js');

async function runTests() {
    console.log('🚀 啟動 Bingo 遊戲 Playwright 功能測試');
    console.log('=' .repeat(60));
    
    try {
        // 創建測試實例
        const tester = new BingoPlaywrightFunctionTests();
        
        // 執行所有測試
        const report = await tester.runAllTests();
        
        // 輸出最終結果
        console.log('\n🏁 測試執行完成');
        console.log(`成功率: ${report.summary.successRate}%`);
        console.log(`總耗時: ${report.summary.totalDuration}ms`);
        
        // 根據測試結果設置退出碼
        const exitCode = report.summary.failedTests > 0 ? 1 : 0;
        process.exit(exitCode);
        
    } catch (error) {
        console.error('❌ 測試執行失敗:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// 處理未捕獲的異常
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未處理的 Promise 拒絕:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ 未捕獲的異常:', error.message);
    process.exit(1);
});

// 執行測試
if (require.main === module) {
    runTests();
}

module.exports = { runTests };