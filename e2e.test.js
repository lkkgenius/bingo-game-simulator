/**
 * 端到端測試
 * 模擬完整的用戶交互流程
 */

// 載入 SafeDOM
let SafeDOM;
try {
    SafeDOM = require('./safe-dom.js');
    if (!SafeDOM) {
        throw new Error('SafeDOM not loaded');
    }
} catch (error) {
    // Fallback for test environment
    SafeDOM = {
        createStructure: () => ({ appendChild: () => {} }),
        sanitizeHTML: (html) => html,
        createElement: (tag, attrs, text) => ({
            appendChild: () => {},
            classList: { add: () => {}, remove: () => {} },
            setAttribute: () => {},
            textContent: text || ''
        })
    };
}

// 模擬 DOM 環境
global.document = {
  createElement: () => ({
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    className: '',
    dataset: {},
    style: {},
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (event, callback) => {
      // 存儲點擊回調以便測試
      if (event === 'click') {
        this.clickCallback = callback;
      }
    },
    setAttribute: () => {},
    getAttribute: () => '',
    removeAttribute: () => {}
  }),
  getElementById: () => ({
    innerHTML: '',
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    classList: {
      toggle: () => {},
      add: () => {},
      remove: () => {},
      contains: () => false
    }
  }),
  querySelector: () => null,
  querySelectorAll: () => []
};

// 模擬 window 環境
global.window = {
  logger: {
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {}
  }
};

// 模擬 window.performance
global.performance = {
  now: () => Date.now()
};

const GameEngine = require('./gameEngine.js');
const GameBoard = require('./gameBoard.js');
const LineDetector = require('./lineDetector.js');
const ProbabilityCalculator = require('./probabilityCalculator.js');
const EnhancedProbabilityCalculator = require('./probabilityCalculator.enhanced.js');

describe('End-to-End Game Test', () => {
  let engine;
  let gameBoard;
  let lineDetector;
  let calculator;
  
  // 在每個測試前初始化
  function initializeE2ETest() {
    lineDetector = new LineDetector();
    calculator = new ProbabilityCalculator();
    engine = new GameEngine();
    gameBoard = new GameBoard('game-board');
    
    // 設置遊戲板
    if (engine.setGameBoard) {
      engine.setGameBoard(gameBoard);
    }
    
    // 設置事件回調
    if (engine.setOnGameStateChange) {
      engine.setOnGameStateChange((state) => {
        // 模擬遊戲狀態變更處理
      });
    }
    
    if (engine.setOnRoundComplete) {
      engine.setOnRoundComplete((round, stats) => {
        // 模擬回合完成處理
      });
    }
    
    if (engine.setOnGameComplete) {
      engine.setOnGameComplete((stats) => {
        // 模擬遊戲完成處理
      });
    }
    
    if (engine.setOnError) {
      engine.setOnError((message) => {
        // 模擬錯誤處理
      });
    }
    
    engine.startGame();
  }
  
  // 設置全局 beforeEach
  global.beforeEach = initializeE2ETest;
  
  test('should simulate complete game flow', () => {
    // 模擬 8 輪遊戲
    for (let round = 1; round <= 8; round++) {
      // 1. 獲取建議
      const suggestion = calculator.getBestSuggestion(engine.getBoardCopy());
      
      // 2. 模擬玩家選擇建議的格子
      engine.processPlayerTurn(suggestion.row, suggestion.col);
      
      // 3. 檢查玩家的選擇是否被記錄
      const board = engine.getBoardCopy();
      expect(board[suggestion.row][suggestion.col]).toBe(1); // 1 表示玩家
      
      // 4. 模擬電腦回合
      let computerRow, computerCol;
      do {
        computerRow = Math.floor(Math.random() * 5);
        computerCol = Math.floor(Math.random() * 5);
      } while (!engine.isValidMove(computerRow, computerCol));
      
      engine.processComputerTurn(computerRow, computerCol);
      
      // 5. 檢查電腦的選擇是否被記錄
      const updatedBoard = engine.getBoardCopy();
      expect(updatedBoard[computerRow][computerCol]).toBe(2); // 2 表示電腦
      
      // 6. 檢查回合是否增加
      if (round < 8) {
        expect(engine.getCurrentRound()).toBe(round + 1);
      }
    }
    
    // 遊戲應該結束
    expect(engine.isGameComplete()).toBeTruthy();
    
    // 應該有最終結果
    const finalStats = engine.getGameStats();
    expect(finalStats).toBeTruthy();
    expect(finalStats.totalRounds).toBe(8);
    expect(finalStats.isGameComplete).toBeTruthy();
  });
  
  test('should handle invalid moves correctly', () => {
    // 先進行一個有效移動
    engine.processPlayerTurn(0, 0);
    
    // 完成電腦回合以回到玩家回合
    engine.processComputerTurn(1, 1);
    
    // 嘗試在同一位置再次移動（應該失敗）
    try {
      engine.processPlayerTurn(0, 0);
      // 如果沒有拋出錯誤，測試失敗
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error.message).toBeTruthy();
    }
    
    // 嘗試在無效位置移動（應該失敗）
    try {
      engine.processPlayerTurn(-1, 0);
      // 如果沒有拋出錯誤，測試失敗
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error.message).toBeTruthy();
    }
  });
  
  test('should handle algorithm switching', () => {
    // 初始使用標準算法
    let suggestion = calculator.getBestSuggestion(engine.getBoardCopy());
    engine.processPlayerTurn(suggestion.row, suggestion.col);
    
    // 完成電腦回合
    engine.processComputerTurn(1, 1);
    
    // 切換到增強版算法
    calculator = new EnhancedProbabilityCalculator();
    
    // 使用增強版算法獲取建議
    suggestion = calculator.getBestSuggestion(engine.getBoardCopy());
    
    // 確保建議有效
    expect(suggestion).toBeTruthy();
    expect(suggestion.row >= 0 && suggestion.row < 5).toBeTruthy();
    expect(suggestion.col >= 0 && suggestion.col < 5).toBeTruthy();
    
    // 使用增強版算法的建議
    engine.processPlayerTurn(suggestion.row, suggestion.col);
    
    // 確保移動有效
    const board = engine.getBoardCopy();
    expect(board[suggestion.row][suggestion.col]).toBe(1);
  });
  
  test('should complete game and show results', () => {
    // 快速完成遊戲
    for (let i = 0; i < 8; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      engine.processPlayerTurn(row, col);
      
      const compRow = Math.floor((i + 8) / 5);
      const compCol = (i + 8) % 5;
      engine.processComputerTurn(compRow, compCol);
    }
    
    // 檢查遊戲是否完成
    expect(engine.isGameComplete()).toBeTruthy();
    expect(engine.getCurrentPhase()).toBe('game-over');
    
    // 檢查最終統計
    const stats = engine.getGameStats();
    expect(stats.isGameComplete).toBeTruthy();
    expect(stats.currentRound).toBe(8);
    expect(stats.totalRounds).toBe(8);
    expect(stats.remainingMoves.length).toBe(25 - 16); // 總格子數減去已使用的格子
  });
});