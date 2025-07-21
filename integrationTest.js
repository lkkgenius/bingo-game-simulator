/**
 * 整合測試 - 測試增強版機率計算器與遊戲引擎的整合
 */

// 載入增強版機率計算器
const ProbabilityCalculator = require('./probabilityCalculator.enhanced.js');
const LineDetector = require('./lineDetector.js');

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
 * 模擬完整遊戲流程
 * @param {number} games - 要模擬的遊戲數量
 * @returns {Object} 統計結果
 */
function simulateGames(games = 100) {
  console.log(`模擬 ${games} 場遊戲，測試算法效果...\n`);
  
  const statistics = {
    totalGames: games,
    totalLines: 0,
    gamesWithThreeLines: 0,
    gamesWithTwoLines: 0,
    gamesWithOneLine: 0,
    gamesWithNoLines: 0,
    lineDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // 最多可能有12條線
  };
  
  // 創建增強版機率計算器和線檢測器
  const calculator = new ProbabilityCalculator();
  const lineDetector = new LineDetector();
  
  for (let game = 1; game <= games; game++) {
    // 創建一個空的遊戲板
    const board = createEmptyBoard();
    
    // 模擬8輪遊戲
    for (let round = 1; round <= 8; round++) {
      // 玩家回合
      const playerSuggestion = calculator.getBestSuggestion(board);
      if (playerSuggestion) {
        board[playerSuggestion.row][playerSuggestion.col] = CELL_STATES.PLAYER;
      }
      
      // 電腦隨機移動
      const emptyCells = getEmptyCells(board);
      if (emptyCells.length > 0) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const computerMove = emptyCells[randomIndex];
        board[computerMove.row][computerMove.col] = CELL_STATES.COMPUTER;
      }
    }
    
    // 檢查完成的連線
    const completedLines = lineDetector.getAllLines(board);
    const lineCount = completedLines.length;
    
    // 更新統計數據
    statistics.totalLines += lineCount;
    statistics.lineDistribution[lineCount]++;
    
    if (lineCount >= 3) {
      statistics.gamesWithThreeLines++;
    } else if (lineCount === 2) {
      statistics.gamesWithTwoLines++;
    } else if (lineCount === 1) {
      statistics.gamesWithOneLine++;
    } else {
      statistics.gamesWithNoLines++;
    }
    
    // 每10場遊戲顯示一次進度
    if (game % 10 === 0) {
      console.log(`已完成 ${game} 場遊戲...`);
    }
  }
  
  // 計算平均連線數
  statistics.averageLines = statistics.totalLines / statistics.totalGames;
  
  return statistics;
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

/**
 * 顯示統計結果
 * @param {Object} statistics - 統計結果
 */
function displayStatistics(statistics) {
  console.log('\n===== 統計結果 =====');
  console.log(`總遊戲數: ${statistics.totalGames}`);
  console.log(`總連線數: ${statistics.totalLines}`);
  console.log(`平均每場連線數: ${statistics.averageLines.toFixed(2)}`);
  console.log(`完成3條或以上連線的遊戲數: ${statistics.gamesWithThreeLines} (${(statistics.gamesWithThreeLines / statistics.totalGames * 100).toFixed(2)}%)`);
  console.log(`完成2條連線的遊戲數: ${statistics.gamesWithTwoLines} (${(statistics.gamesWithTwoLines / statistics.totalGames * 100).toFixed(2)}%)`);
  console.log(`完成1條連線的遊戲數: ${statistics.gamesWithOneLine} (${(statistics.gamesWithOneLine / statistics.totalGames * 100).toFixed(2)}%)`);
  console.log(`沒有完成連線的遊戲數: ${statistics.gamesWithNoLines} (${(statistics.gamesWithNoLines / statistics.totalGames * 100).toFixed(2)}%)`);
  
  console.log('\n連線數量分佈:');
  for (let i = 0; i < statistics.lineDistribution.length; i++) {
    if (statistics.lineDistribution[i] > 0) {
      console.log(`${i}條連線: ${statistics.lineDistribution[i]} 場 (${(statistics.lineDistribution[i] / statistics.totalGames * 100).toFixed(2)}%)`);
    }
  }
}

/**
 * 執行測試
 */
function runTest() {
  console.log('===== 增強版機率計算器整合測試 =====\n');
  
  // 模擬100場遊戲
  const statistics = simulateGames(100);
  
  // 顯示統計結果
  displayStatistics(statistics);
}

// 執行測試
runTest();