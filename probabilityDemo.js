/**
 * 演示增強版機率計算器的效果
 * 這個腳本會創建一個遊戲板，並使用增強版機率計算器來計算最佳移動
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
 * 打印遊戲板
 * @param {number[][]} board - 遊戲板
 */
function printBoard(board) {
  console.log('  | 1 | 2 | 3 | 4 | 5 |');
  console.log('--+---+---+---+---+---+');
  
  for (let row = 0; row < 5; row++) {
    let rowStr = `${row + 1} |`;
    
    for (let col = 0; col < 5; col++) {
      let cellStr = ' ';
      if (board[row][col] === CELL_STATES.PLAYER) {
        cellStr = 'P';
      } else if (board[row][col] === CELL_STATES.COMPUTER) {
        cellStr = 'C';
      }
      
      rowStr += ` ${cellStr} |`;
    }
    
    console.log(rowStr);
    console.log('--+---+---+---+---+---+');
  }
}

/**
 * 模擬一個遊戲場景
 */
function simulateGameScenario() {
  // 創建一個遊戲板，模擬已經進行了幾輪的遊戲
  const board = createEmptyBoard();
  
  // 玩家的移動
  board[0][0] = CELL_STATES.PLAYER;
  board[1][1] = CELL_STATES.PLAYER;
  board[2][2] = CELL_STATES.PLAYER;
  
  // 電腦的移動
  board[0][4] = CELL_STATES.COMPUTER;
  board[1][3] = CELL_STATES.COMPUTER;
  board[2][0] = CELL_STATES.COMPUTER;
  
  console.log('當前遊戲板狀態:');
  printBoard(board);
  
  // 創建增強版機率計算器
  const calculator = new ProbabilityCalculator();
  
  // 獲取最佳移動建議
  const suggestion = calculator.getBestSuggestion(board);
  
  console.log('\n最佳移動建議:');
  console.log(`位置: 第${suggestion.row + 1}行, 第${suggestion.col + 1}列`);
  console.log(`價值: ${suggestion.value}`);
  console.log(`信心度: ${suggestion.confidence}`);
  
  // 模擬執行這個建議
  board[suggestion.row][suggestion.col] = CELL_STATES.PLAYER;
  
  console.log('\n執行建議後的遊戲板:');
  printBoard(board);
  
  // 檢查是否完成了連線
  const completedLines = checkCompletedLines(board);
  console.log(`\n完成的連線數量: ${completedLines.length}`);
  
  if (completedLines.length > 0) {
    console.log('完成的連線:');
    completedLines.forEach((line, index) => {
      console.log(`${index + 1}. ${line.type} 線`);
    });
  }
}

/**
 * 檢查完成的連線
 * @param {number[][]} board - 遊戲板
 * @returns {Array} 完成的連線陣列
 */
function checkCompletedLines(board) {
  const lines = [];
  
  // 檢查水平線
  for (let row = 0; row < 5; row++) {
    if (board[row].every(cell => cell !== CELL_STATES.EMPTY)) {
      lines.push({ type: 'horizontal', row });
    }
  }
  
  // 檢查垂直線
  for (let col = 0; col < 5; col++) {
    let isComplete = true;
    for (let row = 0; row < 5; row++) {
      if (board[row][col] === CELL_STATES.EMPTY) {
        isComplete = false;
        break;
      }
    }
    if (isComplete) {
      lines.push({ type: 'vertical', col });
    }
  }
  
  // 檢查主對角線
  let isMainDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    if (board[i][i] === CELL_STATES.EMPTY) {
      isMainDiagonalComplete = false;
      break;
    }
  }
  if (isMainDiagonalComplete) {
    lines.push({ type: 'diagonal-main' });
  }
  
  // 檢查反對角線
  let isAntiDiagonalComplete = true;
  for (let i = 0; i < 5; i++) {
    if (board[i][4 - i] === CELL_STATES.EMPTY) {
      isAntiDiagonalComplete = false;
      break;
    }
  }
  if (isAntiDiagonalComplete) {
    lines.push({ type: 'diagonal-anti' });
  }
  
  return lines;
}

/**
 * 模擬多輪遊戲，測試算法效果
 */
function simulateMultipleRounds() {
  console.log('模擬多輪遊戲，測試算法效果...\n');
  
  // 創建一個空的遊戲板
  const board = createEmptyBoard();
  
  // 創建增強版機率計算器
  const calculator = new ProbabilityCalculator();
  
  // 模擬8輪遊戲
  for (let round = 1; round <= 8; round++) {
    console.log(`===== 第 ${round} 輪 =====`);
    
    // 玩家回合
    const playerSuggestion = calculator.getBestSuggestion(board);
    console.log(`玩家移動: 第${playerSuggestion.row + 1}行, 第${playerSuggestion.col + 1}列`);
    board[playerSuggestion.row][playerSuggestion.col] = CELL_STATES.PLAYER;
    
    // 電腦隨機移動
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const computerMove = emptyCells[randomIndex];
      console.log(`電腦移動: 第${computerMove.row + 1}行, 第${computerMove.col + 1}列`);
      board[computerMove.row][computerMove.col] = CELL_STATES.COMPUTER;
    }
    
    // 打印當前遊戲板
    console.log('\n當前遊戲板:');
    printBoard(board);
    
    // 檢查完成的連線
    const completedLines = checkCompletedLines(board);
    console.log(`完成的連線數量: ${completedLines.length}`);
    
    if (completedLines.length > 0) {
      console.log('完成的連線:');
      completedLines.forEach((line, index) => {
        console.log(`${index + 1}. ${line.type} 線`);
      });
    }
    
    console.log('\n');
  }
  
  // 最終結果
  console.log('===== 遊戲結束 =====');
  console.log('最終遊戲板:');
  printBoard(board);
  
  const finalLines = checkCompletedLines(board);
  console.log(`最終完成的連線數量: ${finalLines.length}`);
  
  if (finalLines.length > 0) {
    console.log('完成的連線:');
    finalLines.forEach((line, index) => {
      console.log(`${index + 1}. ${line.type} 線`);
    });
  }
}

/**
 * 獲取空格子列表
 * @param {number[][]} board - 遊戲板
 * @returns {Array} 空格子座標陣列
 */
function getEmptyCells(board) {
  const emptyCells = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (board[row][col] === CELL_STATES.EMPTY) {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
}

// 執行模擬
console.log('===== 增強版機率計算器演示 =====\n');
simulateGameScenario();
console.log('\n\n');
simulateMultipleRounds();