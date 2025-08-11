/**
 * 遊戲流程整合測試
 * 測試多個組件之間的互動
 */
const GameEngine = require('./gameEngine.js');
const LineDetector = require('./lineDetector.js');
const ProbabilityCalculator = require('./probabilityCalculator.js');

describe('Game Flow Integration', () => {
  let lineDetector;
  let calculator;

  // 在每個測試前初始化
  function initializeGameFlow() {
    lineDetector = new LineDetector();
    calculator = new ProbabilityCalculator();
  }

  // 設置全局 beforeEach
  global.beforeEach = initializeGameFlow;

  test('should complete a full game cycle', () => {
    // 初始化遊戲引擎
    const engine = new GameEngine();
    engine.startGame();

    // 模擬完整的 8 輪遊戲
    for (let i = 0; i < 8; i++) {
      // 獲取建議的移動
      const suggestion = calculator.getBestSuggestion(engine.getBoardCopy());

      // 執行玩家回合
      engine.processPlayerTurn(suggestion.row, suggestion.col);

      // 執行電腦回合 (選擇一個空格子)
      let computerRow, computerCol;
      do {
        computerRow = Math.floor(Math.random() * 5);
        computerCol = Math.floor(Math.random() * 5);
      } while (!engine.isValidMove(computerRow, computerCol));

      engine.processComputerTurn(computerRow, computerCol);
    }

    // 遊戲應該完成
    expect(engine.isGameComplete()).toBeTruthy();

    // 應該有遊戲統計數據
    const stats = engine.getGameStats();
    expect(stats).toBeTruthy();
    expect(stats.currentRound).toBe(8);
    expect(stats.totalRounds).toBe(8);
  });

  test('should integrate line detection with game state', () => {
    // 初始化遊戲引擎
    const engine = new GameEngine();
    engine.startGame();

    // 創建一個水平線
    for (let col = 0; col < 5; col++) {
      engine.processPlayerTurn(0, col);

      // 如果不是最後一列，還需要進行電腦回合
      if (col < 4) {
        engine.processComputerTurn(1, col);
      }
    }

    // 檢查連線
    const stats = engine.getGameStats();
    expect(stats.completedLines.length).toBe(1);
    expect(stats.completedLines[0].type).toBe('horizontal');
  });

  test('should integrate probability calculation with game state', () => {
    // 測試機率計算器能夠正確識別最佳移動
    const calculator = new ProbabilityCalculator();

    // 創建一個特定的遊戲板，有一個部分完成的垂直線
    const customBoard = [
      [1, 2, 0, 0, 0],
      [1, 2, 0, 0, 0],
      [1, 2, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];

    // 計算 (3,0) 位置的價值
    const value = calculator.calculateMoveValue(customBoard, 3, 0);

    // 這個位置應該有很高的價值，因為它可以完成一條垂直線
    expect(value).toBeGreaterThan(50);
  });

  test('should handle game phase transitions correctly', () => {
    // 初始化遊戲引擎
    const engine = new GameEngine();
    engine.startGame();

    // 初始階段應該是玩家回合
    expect(engine.getCurrentPhase()).toBe('player-turn');

    // 玩家移動後應該轉到電腦輸入階段
    engine.processPlayerTurn(0, 0);
    expect(engine.getCurrentPhase()).toBe('computer-input');

    // 電腦移動後應該回到玩家回合
    engine.processComputerTurn(1, 1);
    expect(engine.getCurrentPhase()).toBe('player-turn');

    // 完成所有回合後應該是遊戲結束階段
    // 使用不同的位置來避免衝突
    const positions = [
      [2, 2],
      [2, 3],
      [2, 4],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3]
    ];

    const computerPositions = [
      [4, 1],
      [4, 2],
      [4, 3],
      [4, 4],
      [1, 2],
      [1, 3],
      [1, 4]
    ];

    for (let i = 0; i < 7; i++) {
      engine.processPlayerTurn(positions[i][0], positions[i][1]);
      engine.processComputerTurn(
        computerPositions[i][0],
        computerPositions[i][1]
      );
    }

    expect(engine.getCurrentPhase()).toBe('game-over');
  });

  test('should track completed lines correctly', () => {
    // 初始化遊戲引擎
    const engine = new GameEngine();
    engine.startGame();

    // 創建一個水平線
    for (let col = 0; col < 5; col++) {
      engine.processPlayerTurn(0, col);
      if (col < 4) {
        engine.processComputerTurn(1, col);
      }
    }

    // 檢查連線數量
    let stats = engine.getGameStats();
    expect(stats.completedLines.length).toBe(1);
  });
});
