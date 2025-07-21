/**
 * 測試增強版機率計算器
 */

// 載入增強版機率計算器
const ProbabilityCalculator = require('./probabilityCalculator.enhanced.js');

// 定義遊戲板狀態常量
const CELL_STATES = {
  EMPTY: 0,
  PLAYER: 1,
  COMPUTER: 2
};

/**
 * 創建一個空的遊戲板
 * @returns {number[][]} 5x5的空遊戲板
 */
function createEmptyBoard() {
  return Array(5).fill().map(() => Array(5).fill(CELL_STATES.EMPTY));
}

/**
 * 測試交叉點獎勵計算
 */
function testIntersectionBonus() {
  console.log('測試交叉點獎勵計算...');
  
  const calculator = new ProbabilityCalculator();
  const board = createEmptyBoard();
  
  // 測試中心點 (2,2) - 應該有4條潛在連線
  const centerValue = calculator.calculateIntersectionBonus(board, 2, 2);
  console.log(`中心點 (3,3) 的交叉點獎勵: ${centerValue}`);
  
  // 測試對角線交叉點 (0,0) - 應該有2條潛在連線
  const cornerValue = calculator.calculateIntersectionBonus(board, 0, 0);
  console.log(`角落點 (1,1) 的交叉點獎勵: ${cornerValue}`);
  
  // 測試普通點 (1,3) - 應該有2條潛在連線
  const normalValue = calculator.calculateIntersectionBonus(board, 1, 3);
  console.log(`普通點 (2,4) 的交叉點獎勵: ${normalValue}`);
  
  console.log('交叉點獎勵測試完成\n');
}

/**
 * 測試接近完成的線獎勵計算
 */
function testNearCompletionBonus() {
  console.log('測試接近完成的線獎勵計算...');
  
  const calculator = new ProbabilityCalculator();
  const board = createEmptyBoard();
  
  // 創建一個接近完成的水平線
  board[0][0] = CELL_STATES.PLAYER;
  board[0][1] = CELL_STATES.PLAYER;
  board[0][2] = CELL_STATES.PLAYER;
  board[0][3] = CELL_STATES.PLAYER;
  // 0,4 是空的
  
  // 測試填補最後一個空格的獎勵
  const nearCompletionValue = calculator.calculateNearCompletionBonus(board, 0, 4);
  console.log(`填補最後一個空格的獎勵: ${nearCompletionValue}`);
  
  // 創建一個接近完成的垂直線
  board[0][0] = CELL_STATES.PLAYER;
  board[1][0] = CELL_STATES.PLAYER;
  board[2][0] = CELL_STATES.PLAYER;
  // 3,0 和 4,0 是空的
  
  // 測試填補倒數第二個空格的獎勵
  const nearCompletionValue2 = calculator.calculateNearCompletionBonus(board, 3, 0);
  console.log(`填補倒數第二個空格的獎勵: ${nearCompletionValue2}`);
  
  console.log('接近完成的線獎勵測試完成\n');
}

/**
 * 測試戰略位置獎勵計算
 */
function testStrategicPositionBonus() {
  console.log('測試戰略位置獎勵計算...');
  
  const calculator = new ProbabilityCalculator();
  const board = createEmptyBoard();
  
  // 測試角落位置
  const cornerValue = calculator.calculateStrategicPositionBonus(board, 0, 0);
  console.log(`角落位置 (1,1) 的戰略獎勵: ${cornerValue}`);
  
  // 測試邊緣中心位置
  const edgeCenterValue = calculator.calculateStrategicPositionBonus(board, 0, 2);
  console.log(`邊緣中心位置 (1,3) 的戰略獎勵: ${edgeCenterValue}`);
  
  // 測試2x2方格的角落
  const innerCornerValue = calculator.calculateStrategicPositionBonus(board, 1, 1);
  console.log(`2x2方格的角落 (2,2) 的戰略獎勵: ${innerCornerValue}`);
  
  console.log('戰略位置獎勵測試完成\n');
}

/**
 * 測試最佳移動建議
 */
function testBestSuggestion() {
  console.log('測試最佳移動建議...');
  
  const calculator = new ProbabilityCalculator();
  const board = createEmptyBoard();
  
  // 創建一個測試場景
  // 玩家的移動
  board[0][0] = CELL_STATES.PLAYER;
  board[1][1] = CELL_STATES.PLAYER;
  board[2][2] = CELL_STATES.PLAYER;
  
  // 電腦的移動
  board[0][4] = CELL_STATES.COMPUTER;
  board[1][3] = CELL_STATES.COMPUTER;
  board[2][0] = CELL_STATES.COMPUTER;
  
  // 獲取最佳移動建議
  const suggestion = calculator.getBestSuggestion(board);
  
  console.log('最佳移動建議:');
  console.log(`位置: 第${suggestion.row + 1}行, 第${suggestion.col + 1}列`);
  console.log(`價值: ${suggestion.value}`);
  console.log(`信心度: ${suggestion.confidence}`);
  
  // 預期最佳移動應該是 (3,3)，因為這會延續對角線
  if (suggestion.row === 3 && suggestion.col === 3) {
    console.log('測試通過: 最佳移動是預期的位置');
  } else {
    console.log(`測試失敗: 預期位置是 (4,4)，但得到 (${suggestion.row + 1},${suggestion.col + 1})`);
  }
  
  console.log('最佳移動建議測試完成\n');
}

/**
 * 測試完成多條線的能力
 */
function testMultipleLineCompletion() {
  console.log('測試完成多條線的能力...');
  
  const calculator = new ProbabilityCalculator();
  const board = createEmptyBoard();
  
  // 創建一個可以同時完成兩條線的場景
  // 水平線
  board[0][0] = CELL_STATES.PLAYER;
  board[0][1] = CELL_STATES.COMPUTER;
  board[0][2] = CELL_STATES.PLAYER;
  board[0][3] = CELL_STATES.COMPUTER;
  // 0,4 是空的
  
  // 垂直線
  board[1][4] = CELL_STATES.PLAYER;
  board[2][4] = CELL_STATES.COMPUTER;
  board[3][4] = CELL_STATES.PLAYER;
  board[4][4] = CELL_STATES.COMPUTER;
  
  // 獲取最佳移動建議
  const suggestion = calculator.getBestSuggestion(board);
  
  console.log('最佳移動建議:');
  console.log(`位置: 第${suggestion.row + 1}行, 第${suggestion.col + 1}列`);
  console.log(`價值: ${suggestion.value}`);
  console.log(`信心度: ${suggestion.confidence}`);
  
  // 預期最佳移動應該是 (0,4)，因為這會同時完成水平線和垂直線
  if (suggestion.row === 0 && suggestion.col === 4) {
    console.log('測試通過: 最佳移動是預期的位置，可以同時完成兩條線');
  } else {
    console.log(`測試失敗: 預期位置是 (1,5)，但得到 (${suggestion.row + 1},${suggestion.col + 1})`);
  }
  
  console.log('完成多條線的能力測試完成\n');
}

/**
 * 執行所有測試
 */
function runAllTests() {
  console.log('===== 增強版機率計算器測試 =====\n');
  
  testIntersectionBonus();
  testNearCompletionBonus();
  testStrategicPositionBonus();
  testBestSuggestion();
  testMultipleLineCompletion();
  
  console.log('所有測試完成');
}

// 執行測試
runAllTests();