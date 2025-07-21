/**
 * 全面的LineDetector測試，驗證需求4.3和4.4
 */

const LineDetector = require('./lineDetector.js');

console.log('🧪 開始全面的LineDetector功能測試...\n');

const lineDetector = new LineDetector();
let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, testFn) {
  testsTotal++;
  try {
    testFn();
    console.log(`✅ ${testName}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${testName}`);
    console.log(`   錯誤: ${error.message}`);
  }
}

// 需求4.3: 檢查並顯示當前的連線數量
console.log('📋 測試需求4.3: 連線數量檢測');

runTest('水平線檢測 - 單條線', () => {
  const board = [
    [1, 1, 1, 1, 1],
    [0, 2, 0, 1, 0],
    [2, 0, 1, 0, 2],
    [0, 1, 0, 2, 0],
    [1, 0, 2, 0, 0]
  ];
  
  const lines = lineDetector.checkHorizontalLines(board);
  if (lines.length !== 1) throw new Error(`期望1條線，實際${lines.length}條`);
  if (lines[0].row !== 0) throw new Error(`期望第0行，實際第${lines[0].row}行`);
});

runTest('水平線檢測 - 多條線', () => {
  const board = [
    [1, 1, 1, 1, 1],
    [0, 2, 0, 1, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 0, 2, 0],
    [1, 1, 1, 1, 1]
  ];
  
  const lines = lineDetector.checkHorizontalLines(board);
  if (lines.length !== 3) throw new Error(`期望3條線，實際${lines.length}條`);
});

runTest('垂直線檢測 - 單條線', () => {
  const board = [
    [1, 0, 2, 0, 0],
    [1, 2, 0, 1, 0],
    [1, 0, 1, 0, 2],
    [1, 1, 0, 2, 0],
    [1, 0, 2, 0, 0]
  ];
  
  const lines = lineDetector.checkVerticalLines(board);
  if (lines.length !== 1) throw new Error(`期望1條線，實際${lines.length}條`);
  if (lines[0].col !== 0) throw new Error(`期望第0列，實際第${lines[0].col}列`);
});

runTest('對角線檢測 - 主對角線', () => {
  const board = [
    [1, 0, 2, 0, 0],
    [0, 1, 0, 0, 0],
    [2, 0, 1, 0, 2],
    [0, 0, 0, 1, 0],
    [0, 0, 2, 0, 1]
  ];
  
  const lines = lineDetector.checkDiagonalLines(board);
  if (lines.length !== 1) throw new Error(`期望1條線，實際${lines.length}條`);
  if (lines[0].type !== 'diagonal-main') throw new Error(`期望主對角線，實際${lines[0].type}`);
});

runTest('對角線檢測 - 反對角線', () => {
  const board = [
    [0, 0, 2, 0, 1],
    [0, 2, 0, 1, 0],
    [2, 0, 1, 0, 2],
    [0, 1, 0, 2, 0],
    [1, 0, 2, 0, 0]
  ];
  
  const lines = lineDetector.checkDiagonalLines(board);
  if (lines.length !== 1) throw new Error(`期望1條線，實際${lines.length}條`);
  if (lines[0].type !== 'diagonal-anti') throw new Error(`期望反對角線，實際${lines[0].type}`);
});

// 需求4.4: 當連線完成時，系統應該在網格上高亮顯示完成的連線
console.log('\n📋 測試需求4.4: 連線位置信息');

runTest('水平線位置信息正確', () => {
  const board = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];
  
  const lines = lineDetector.checkHorizontalLines(board);
  const expectedCells = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
  
  if (JSON.stringify(lines[0].cells) !== JSON.stringify(expectedCells)) {
    throw new Error(`位置信息不正確`);
  }
});

runTest('垂直線位置信息正確', () => {
  const board = [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0]
  ];
  
  const lines = lineDetector.checkVerticalLines(board);
  const expectedCells = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]];
  
  if (JSON.stringify(lines[0].cells) !== JSON.stringify(expectedCells)) {
    throw new Error(`位置信息不正確`);
  }
});

runTest('主對角線位置信息正確', () => {
  const board = [
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1]
  ];
  
  const lines = lineDetector.checkDiagonalLines(board);
  const expectedCells = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]];
  
  if (JSON.stringify(lines[0].cells) !== JSON.stringify(expectedCells)) {
    throw new Error(`位置信息不正確`);
  }
});

runTest('反對角線位置信息正確', () => {
  const board = [
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0]
  ];
  
  const lines = lineDetector.checkDiagonalLines(board);
  const expectedCells = [[0, 4], [1, 3], [2, 2], [3, 1], [4, 0]];
  
  if (JSON.stringify(lines[0].cells) !== JSON.stringify(expectedCells)) {
    throw new Error(`位置信息不正確`);
  }
});

// 綜合功能測試
console.log('\n📋 綜合功能測試');

runTest('getAllLines 返回所有連線', () => {
  const board = [
    [1, 1, 1, 1, 1], // 水平線
    [2, 0, 0, 0, 0],
    [2, 0, 1, 0, 0],
    [2, 0, 0, 1, 0],
    [2, 0, 0, 0, 1]  // 垂直線 + 主對角線
  ];
  
  const lines = lineDetector.getAllLines(board);
  if (lines.length !== 3) throw new Error(`期望3條線，實際${lines.length}條`);
  
  const types = lines.map(line => line.type);
  if (!types.includes('horizontal')) throw new Error('缺少水平線');
  if (!types.includes('vertical')) throw new Error('缺少垂直線');
  if (!types.includes('diagonal-main')) throw new Error('缺少主對角線');
});

runTest('countCompletedLines 正確計算', () => {
  const board = [
    [1, 1, 1, 1, 1], // 水平線
    [2, 0, 0, 0, 2],
    [2, 0, 1, 0, 2],
    [2, 0, 0, 1, 2],
    [2, 0, 0, 0, 2]  // 兩條垂直線
  ];
  
  const count = lineDetector.countCompletedLines(board);
  if (count !== 3) throw new Error(`期望3條線，實際${count}條`);
});

// 邊界情況測試
console.log('\n📋 邊界情況測試');

runTest('空遊戲板', () => {
  const board = Array(5).fill().map(() => Array(5).fill(0));
  const count = lineDetector.countCompletedLines(board);
  if (count !== 0) throw new Error(`空遊戲板應該有0條線，實際${count}條`);
});

runTest('滿遊戲板', () => {
  const board = Array(5).fill().map(() => Array(5).fill(1));
  const count = lineDetector.countCompletedLines(board);
  if (count !== 12) throw new Error(`滿遊戲板應該有12條線，實際${count}條`);
});

runTest('混合玩家和電腦的連線', () => {
  const board = [
    [1, 1, 1, 1, 1], // 玩家水平線
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2], // 電腦水平線
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];
  
  const lines = lineDetector.getAllLines(board);
  if (lines.length !== 2) throw new Error(`期望2條線，實際${lines.length}條`);
});

// 測試結果
console.log(`\n📊 測試結果: ${testsPassed}/${testsTotal} 通過`);

if (testsPassed === testsTotal) {
  console.log('🎉 所有測試都通過了！LineDetector實現完全符合需求4.3和4.4');
  console.log('\n✨ 功能驗證完成:');
  console.log('   ✅ 水平線檢測方法');
  console.log('   ✅ 垂直線檢測方法');
  console.log('   ✅ 對角線檢測方法');
  console.log('   ✅ 連線位置信息提供');
  console.log('   ✅ 綜合連線檢測');
  console.log('   ✅ 邊界情況處理');
} else {
  console.log('❌ 部分測試失敗，需要修復');
}