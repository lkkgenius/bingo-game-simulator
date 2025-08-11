/**
 * AI Learning System 測試套件
 * 測試進階 AI 和機器學習功能
 */

// 在 Node.js 環境中載入依賴
let AILearningSystem;
if (typeof require !== 'undefined') {
  AILearningSystem = require('./aiLearningSystem.js');
}

/**
 * 測試 AI 學習系統的基本功能
 */
function testAILearningSystemBasics() {
  console.log('=== 測試 AI 學習系統基本功能 ===');

  const aiSystem = new AILearningSystem();

  // 測試初始化
  console.log('✓ AI 學習系統初始化成功');
  console.log('初始技能等級:', aiSystem.playerModel.skillLevel);
  console.log('初始遊戲風格:', aiSystem.playerModel.playStyle);
  console.log('初始難度等級:', aiSystem.difficultySystem.currentLevel);

  return aiSystem;
}

/**
 * 測試遊戲數據記錄功能
 */
function testGameDataRecording() {
  console.log('\n=== 測試遊戲數據記錄功能 ===');

  const aiSystem = new AILearningSystem();

  // 模擬遊戲數據
  const mockGameData = {
    board: [
      [1, 2, 0, 1, 0],
      [2, 1, 0, 0, 2],
      [0, 0, 1, 2, 0],
      [1, 0, 2, 1, 0],
      [0, 2, 0, 0, 1]
    ],
    playerMoves: [
      { row: 0, col: 0, round: 1 },
      { row: 1, col: 1, round: 2 },
      { row: 2, col: 2, round: 3 },
      { row: 3, col: 0, round: 4 }
    ],
    computerMoves: [
      { row: 0, col: 1, round: 1 },
      { row: 1, col: 4, round: 2 },
      { row: 2, col: 3, round: 3 },
      { row: 4, col: 1, round: 4 }
    ],
    finalScore: 2,
    completedLines: [{ type: 'horizontal', row: 0 }, { type: 'diagonal-main' }],
    gameOutcome: 'good'
  };

  // 記錄遊戲數據
  aiSystem.recordGameData(mockGameData);

  console.log('✓ 遊戲數據記錄成功');
  console.log('遊戲歷史數量:', aiSystem.gameHistory.length);
  console.log('更新後技能等級:', aiSystem.playerModel.skillLevel);
  console.log('更新後遊戲風格:', aiSystem.playerModel.playStyle);

  return aiSystem;
}

/**
 * 測試移動預測功能
 */
function testMovePrediction() {
  console.log('\n=== 測試移動預測功能 ===');

  const aiSystem = testGameDataRecording(); // 使用有學習數據的系統

  // 測試棋盤狀態
  const testBoard = [
    [1, 2, 0, 0, 0],
    [0, 1, 0, 2, 0],
    [0, 0, 0, 0, 0],
    [2, 0, 0, 1, 0],
    [0, 0, 0, 0, 0]
  ];

  const gameContext = {
    currentRound: 3,
    maxRounds: 8,
    playerMoves: 2,
    computerMoves: 2,
    completedLines: 0,
    gamePhase: 'player-turn'
  };

  try {
    const prediction = aiSystem.predictBestMove(testBoard, gameContext);

    console.log('✓ 移動預測成功');
    console.log(
      '預測移動:',
      `(${prediction.move.row}, ${prediction.move.col})`
    );
    console.log('預測信心度:', prediction.confidence);
    console.log('推理說明:', prediction.reasoning);
    console.log('替代選項數量:', prediction.alternatives.length);

    return true;
  } catch (error) {
    console.error('✗ 移動預測失敗:', error.message);
    return false;
  }
}

/**
 * 測試難度調整功能
 */
function testDifficultyAdjustment() {
  console.log('\n=== 測試難度調整功能 ===');

  const aiSystem = new AILearningSystem();

  // 模擬多場高表現遊戲
  for (let i = 0; i < 6; i++) {
    const highPerformanceGame = {
      board: Array(5)
        .fill()
        .map(() => Array(5).fill(0)),
      playerMoves: Array(4)
        .fill()
        .map((_, idx) => ({ row: idx, col: idx, round: idx + 1 })),
      computerMoves: Array(4)
        .fill()
        .map((_, idx) => ({ row: idx, col: idx + 1, round: idx + 1 })),
      finalScore: 8, // 高分
      completedLines: [],
      gameOutcome: 'excellent'
    };

    aiSystem.recordGameData(highPerformanceGame);
  }

  console.log('✓ 難度調整測試完成');
  console.log('調整後難度等級:', aiSystem.difficultySystem.currentLevel);
  console.log('適應次數:', aiSystem.difficultySystem.adaptationCounter);

  return aiSystem;
}

/**
 * 測試個性化功能
 */
function testPersonalization() {
  console.log('\n=== 測試個性化功能 ===');

  const aiSystem = new AILearningSystem();

  // 模擬具有特定偏好的遊戲數據
  const personalizedGame = {
    board: Array(5)
      .fill()
      .map(() => Array(5).fill(0)),
    playerMoves: [
      { row: 2, col: 2, round: 1 }, // 中心偏好
      { row: 1, col: 1, round: 2 }, // 對角線偏好
      { row: 3, col: 3, round: 3 }, // 對角線偏好
      { row: 0, col: 4, round: 4 } // 角落偏好
    ],
    computerMoves: [
      { row: 0, col: 0, round: 1 },
      { row: 1, col: 0, round: 2 },
      { row: 2, col: 0, round: 3 },
      { row: 3, col: 0, round: 4 }
    ],
    finalScore: 3,
    completedLines: [],
    gameOutcome: 'good'
  };

  aiSystem.recordGameData(personalizedGame);

  // 測試個性化建議
  const testBoard = Array(5)
    .fill()
    .map(() => Array(5).fill(0));
  const personalizedSuggestion = aiSystem.getPersonalizedSuggestion(testBoard);

  console.log('✓ 個性化功能測試完成');
  console.log('個性化建議:', personalizedSuggestion);
  console.log(
    '用戶偏好數量:',
    aiSystem.personalizationSystem.userPreferences.size
  );
  console.log(
    '自定義策略數量:',
    aiSystem.personalizationSystem.customStrategies.length
  );

  return aiSystem;
}

/**
 * 測試學習統計功能
 */
function testLearningStats() {
  console.log('\n=== 測試學習統計功能 ===');

  const aiSystem = testGameDataRecording(); // 使用有數據的系統

  const stats = aiSystem.getLearningStats();

  console.log('✓ 學習統計功能測試完成');
  console.log('學習統計:', JSON.stringify(stats, null, 2));

  return stats;
}

/**
 * 測試性能指標
 */
function testPerformanceMetrics() {
  console.log('\n=== 測試性能指標 ===');

  const aiSystem = new AILearningSystem();

  // 測試大量數據處理
  const startTime = performance.now();

  for (let i = 0; i < 100; i++) {
    const mockGame = {
      board: Array(5)
        .fill()
        .map(() => Array(5).fill(Math.floor(Math.random() * 3))),
      playerMoves: Array(4)
        .fill()
        .map((_, idx) => ({
          row: Math.floor(Math.random() * 5),
          col: Math.floor(Math.random() * 5),
          round: idx + 1
        })),
      computerMoves: Array(4)
        .fill()
        .map((_, idx) => ({
          row: Math.floor(Math.random() * 5),
          col: Math.floor(Math.random() * 5),
          round: idx + 1
        })),
      finalScore: Math.floor(Math.random() * 10),
      completedLines: [],
      gameOutcome: ['poor', 'average', 'good', 'excellent'][
        Math.floor(Math.random() * 4)
      ]
    };

    aiSystem.recordGameData(mockGame);
  }

  const endTime = performance.now();
  const processingTime = endTime - startTime;

  console.log('✓ 性能測試完成');
  console.log(`處理 100 場遊戲耗時: ${processingTime.toFixed(2)}ms`);
  console.log(
    '平均每場遊戲處理時間:',
    `${(processingTime / 100).toFixed(2)}ms`
  );
  console.log('最終遊戲歷史數量:', aiSystem.gameHistory.length);

  return processingTime;
}

/**
 * 測試數據導出導入功能
 */
function testDataExportImport() {
  console.log('\n=== 測試數據導出導入功能 ===');

  const aiSystem1 = testGameDataRecording();

  // 模擬導出數據
  const exportedData = {
    gameHistory: aiSystem1.gameHistory,
    playerModel: aiSystem1.playerModel,
    difficultySystem: aiSystem1.difficultySystem,
    personalizationSystem: aiSystem1.personalizationSystem,
    performanceMetrics: aiSystem1.performanceMetrics
  };

  // 創建新的系統並導入數據
  const aiSystem2 = new AILearningSystem();

  // 模擬導入過程
  aiSystem2.gameHistory = exportedData.gameHistory;
  aiSystem2.playerModel = exportedData.playerModel;
  aiSystem2.difficultySystem = exportedData.difficultySystem;
  aiSystem2.personalizationSystem = exportedData.personalizationSystem;
  aiSystem2.performanceMetrics = exportedData.performanceMetrics;

  console.log('✓ 數據導出導入測試完成');
  console.log('原系統遊戲數量:', aiSystem1.gameHistory.length);
  console.log('新系統遊戲數量:', aiSystem2.gameHistory.length);
  console.log(
    '技能等級匹配:',
    aiSystem1.playerModel.skillLevel === aiSystem2.playerModel.skillLevel
  );

  return true;
}

/**
 * 運行所有測試
 */
function runAllTests() {
  console.log('🚀 開始 AI 學習系統測試套件');
  console.log('=====================================');

  const results = {
    basic: false,
    recording: false,
    prediction: false,
    difficulty: false,
    personalization: false,
    stats: false,
    performance: false,
    exportImport: false
  };

  try {
    // 基本功能測試
    testAILearningSystemBasics();
    results.basic = true;

    // 數據記錄測試
    testGameDataRecording();
    results.recording = true;

    // 移動預測測試
    results.prediction = testMovePrediction();

    // 難度調整測試
    testDifficultyAdjustment();
    results.difficulty = true;

    // 個性化測試
    testPersonalization();
    results.personalization = true;

    // 學習統計測試
    testLearningStats();
    results.stats = true;

    // 性能測試
    testPerformanceMetrics();
    results.performance = true;

    // 導出導入測試
    results.exportImport = testDataExportImport();
  } catch (error) {
    console.error('測試過程中發生錯誤:', error);
  }

  // 測試結果總結
  console.log('\n=====================================');
  console.log('🏁 測試結果總結');
  console.log('=====================================');

  const passedTests = Object.values(results).filter(
    result => result === true
  ).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([testName, passed]) => {
    const status = passed ? '✅ 通過' : '❌ 失敗';
    console.log(`${testName}: ${status}`);
  });

  console.log(`\n總體結果: ${passedTests}/${totalTests} 測試通過`);

  if (passedTests === totalTests) {
    console.log('🎉 所有測試都通過了！AI 學習系統運行正常。');
  } else {
    console.log('⚠️  部分測試失敗，請檢查相關功能。');
  }

  return results;
}

// 如果在 Node.js 環境中運行測試
if (typeof module !== 'undefined' && require.main === module) {
  runAllTests();
}

// 如果在瀏覽器環境中，添加到全局作用域
if (typeof window !== 'undefined') {
  window.testAILearningSystem = runAllTests;
}

// 導出測試函數
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testAILearningSystemBasics,
    testGameDataRecording,
    testMovePrediction,
    testDifficultyAdjustment,
    testPersonalization,
    testLearningStats,
    testPerformanceMetrics,
    testDataExportImport
  };
}
