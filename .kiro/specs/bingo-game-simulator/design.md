# 設計文件

## 概述

Bingo 遊戲模擬器是一個基於網頁的單頁應用程式，使用 HTML、CSS 和 JavaScript 構建。系統核心功能包括遊戲狀態管理、連線檢測演算法、合作機率計算引擎和用戶界面互動。遊戲設計為玩家與電腦合作模式，目標是共同完成最多的連線。

## 架構

### 系統架構
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Game Logic     │    │  Algorithm      │
│                 │    │                 │    │                 │
│ - Game Board    │◄──►│ - Game State    │◄──►│ - Line Detection│
│ - Controls      │    │ - Turn Manager  │    │ - Probability   │
│ - Results       │    │ - Score Tracker │    │ - Suggestion    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術棧
- **前端**: HTML5, CSS3, Vanilla JavaScript
- **樣式**: CSS Grid for game board, Flexbox for layout
- **狀態管理**: JavaScript objects and arrays
- **演算法**: Custom line detection and probability calculation
- **部署**: GitHub Pages (靜態網站託管)
- **版本控制**: Git with GitHub repository

## 組件和介面

### 1. GameBoard 組件
```javascript
class GameBoard {
  constructor(size = 5)
  render()
  updateCell(row, col, state)
  highlightSuggestion(row, col)
  highlightLines(lines)
}
```

### 2. GameEngine 組件
```javascript
class GameEngine {
  constructor()
  startGame()
  processPlayerTurn(row, col)
  processComputerTurn(row, col)
  calculateBestMove()
  checkLines()
  isGameComplete()
}
```

### 3. LineDetector 組件
```javascript
class LineDetector {
  checkHorizontalLines(board)
  checkVerticalLines(board)
  checkDiagonalLines(board)
  getAllLines(board)
  countCompletedLines(board)
}
```

### 4. ProbabilityCalculator 組件
```javascript
class ProbabilityCalculator {
  calculateMoveValue(board, row, col)
  simulateAllPossibleMoves(board)
  getBestSuggestion(board)
}
```

## 資料模型

### GameState
```javascript
const gameState = {
  board: Array(5).fill().map(() => Array(5).fill(0)), // 0: empty, 1: player, 2: computer
  currentRound: 1,
  maxRounds: 8,
  playerMoves: [],
  computerMoves: [],
  completedLines: [],
  gamePhase: 'player-turn' | 'computer-turn' | 'game-over'
}
```

### Cell States
```javascript
const CELL_STATES = {
  EMPTY: 0,
  PLAYER: 1,
  COMPUTER: 2
}
```

### Line Types
```javascript
const LINE_TYPES = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  DIAGONAL_MAIN: 'diagonal-main',
  DIAGONAL_ANTI: 'diagonal-anti'
}
```

## 錯誤處理

### 輸入驗證
- 驗證格子座標是否在有效範圍內 (0-4)
- 檢查格子是否已被選擇
- 驗證遊戲階段是否允許該操作

### 錯誤類型
```javascript
class GameError extends Error {
  constructor(message, type) {
    super(message)
    this.type = type
  }
}

const ERROR_TYPES = {
  INVALID_MOVE: 'invalid-move',
  CELL_OCCUPIED: 'cell-occupied',
  GAME_OVER: 'game-over',
  INVALID_PHASE: 'invalid-phase'
}
```

### 錯誤處理策略
- 顯示用戶友好的錯誤訊息
- 記錄錯誤到控制台以便調試
- 提供重試機制
- 防止無效操作破壞遊戲狀態

## GitHub Pages 部署設計

### 部署架構
- **靜態網站**: 純前端應用，無需後端服務器
- **資源結構**: 所有檔案位於根目錄，便於 GitHub Pages 直接服務
- **相對路徑**: 使用相對路徑確保在 GitHub Pages 子路徑下正常運行

### 部署需求
- **Repository 設置**: 需要 public GitHub repository
- **檔案結構**: index.html 作為入口點位於根目錄
- **資源優化**: CSS 和 JavaScript 檔案壓縮和優化
- **瀏覽器兼容性**: 支援現代瀏覽器的 ES6+ 功能

### 部署配置
```yaml
# GitHub Pages 設定
source: root directory
custom domain: 可選
HTTPS: 強制啟用
build: 無需構建過程（純靜態檔案）
```

### 檔案結構
```
/
├── index.html          # 主頁面
├── styles.css          # 樣式檔案
├── script.js           # 主要 JavaScript
├── gameBoard.js        # 遊戲板組件
├── gameEngine.js       # 遊戲引擎
├── lineDetector.js     # 連線檢測
├── probabilityCalculator.js # 機率計算
└── README.md           # 專案說明
```

## 測試策略

### 測試架構

我們將採用全面的測試策略，確保遊戲的所有關鍵組件都經過充分測試。測試將分為以下幾個層次：

1. **單元測試**: 測試各個獨立組件的功能
2. **整合測試**: 測試組件之間的互動
3. **端到端測試**: 測試完整的遊戲流程

### 測試運行器

我們將實現一個統一的測試運行器 `testRunner.js`，它將：
- 自動發現並執行所有測試文件
- 提供測試結果摘要
- 支持單獨運行特定測試

```javascript
// testRunner.js
const fs = require('fs');
const path = require('path');

// 測試結果追蹤
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let currentTestFile = '';

// 全局測試函數
global.describe = (description, testFn) => {
  console.log(`\n${description}`);
  testFn();
};

global.test = (description, testFn) => {
  totalTests++;
  try {
    testFn();
    console.log(`✓ ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    failedTests++;
  }
};

global.expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, but got ${actual}`);
    }
  },
  toEqual: (expected) => {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(`Expected ${expectedStr}, but got ${actualStr}`);
    }
  },
  toHaveLength: (expected) => {
    if (!actual || actual.length !== expected) {
      throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : 'undefined'}`);
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected truthy value, but got ${actual}`);
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected falsy value, but got ${actual}`);
    }
  }
});

// 查找並運行所有測試文件
function runAllTests() {
  const testFiles = findTestFiles();
  console.log(`Found ${testFiles.length} test files`);
  
  testFiles.forEach(file => {
    currentTestFile = file;
    console.log(`\n=== Running tests in ${file} ===`);
    require(path.join(process.cwd(), file));
  });
  
  // 輸出測試結果摘要
  console.log('\n=== Test Results ===');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// 查找所有測試文件
function findTestFiles() {
  const testFiles = [];
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (
        file.endsWith('.test.js') || 
        file.startsWith('test-') && file.endsWith('.js')
      ) {
        testFiles.push(filePath);
      }
    });
  }
  
  scanDir('.');
  return testFiles;
}

// 運行測試
runAllTests();
```

### 單元測試

我們將為以下核心組件創建單元測試：

#### 1. LineDetector 測試 (lineDetector.test.js)

```javascript
// lineDetector.test.js
const LineDetector = require('./lineDetector.js');

describe('LineDetector', () => {
  let lineDetector;
  
  // 在每個測試前初始化
  beforeEach(() => {
    lineDetector = new LineDetector();
  });
  
  test('should detect horizontal line', () => {
    const board = [
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    expect(lineDetector.checkHorizontalLines(board)).toHaveLength(1);
  });
  
  test('should detect vertical line', () => {
    const board = [
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0]
    ];
    expect(lineDetector.checkVerticalLines(board)).toHaveLength(1);
  });
  
  test('should detect main diagonal line', () => {
    const board = [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1]
    ];
    const diagonalLines = lineDetector.checkDiagonalLines(board);
    expect(diagonalLines).toHaveLength(1);
    expect(diagonalLines[0].type).toBe('diagonal-main');
  });
  
  test('should detect anti-diagonal line', () => {
    const board = [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0]
    ];
    const diagonalLines = lineDetector.checkDiagonalLines(board);
    expect(diagonalLines).toHaveLength(1);
    expect(diagonalLines[0].type).toBe('diagonal-anti');
  });
  
  test('should count completed lines correctly', () => {
    const board = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1]
    ];
    // 2 horizontal + 2 vertical = 4 lines
    expect(lineDetector.countCompletedLines(board)).toBe(4);
  });
  
  test('should return all lines', () => {
    const board = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 1, 0, 0],
      [1, 0, 0, 1, 0],
      [1, 0, 0, 0, 1]
    ];
    // 1 horizontal + 1 vertical + 1 diagonal = 3 lines
    expect(lineDetector.getAllLines(board)).toHaveLength(3);
  });
});
```

#### 2. ProbabilityCalculator 測試 (probabilityCalculator.test.js)

```javascript
// probabilityCalculator.test.js
const ProbabilityCalculator = require('./probabilityCalculator.js');

describe('ProbabilityCalculator', () => {
  let calculator;
  
  beforeEach(() => {
    calculator = new ProbabilityCalculator();
  });
  
  test('should calculate move value for empty board', () => {
    const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));
    // 中心位置應該有最高價值
    expect(calculator.calculateMoveValue(emptyBoard, 2, 2)).toBeGreaterThan(
      calculator.calculateMoveValue(emptyBoard, 0, 0)
    );
  });
  
  test('should calculate move value for partially filled board', () => {
    const board = [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    // 完成垂直線的移動應該有高價值
    expect(calculator.calculateMoveValue(board, 3, 2)).toBeGreaterThan(
      calculator.calculateMoveValue(board, 3, 3)
    );
  });
  
  test('should return best suggestion', () => {
    const board = [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    const suggestion = calculator.getBestSuggestion(board);
    expect(suggestion).toBeTruthy();
    expect(suggestion.row).toBe(3);
    expect(suggestion.col).toBe(2);
  });
  
  test('should handle invalid positions', () => {
    const board = Array(5).fill().map(() => Array(5).fill(0));
    // 無效位置應該返回負值
    expect(calculator.calculateMoveValue(board, -1, 0)).toBeLessThan(0);
    expect(calculator.calculateMoveValue(board, 0, -1)).toBeLessThan(0);
    expect(calculator.calculateMoveValue(board, 5, 0)).toBeLessThan(0);
    expect(calculator.calculateMoveValue(board, 0, 5)).toBeLessThan(0);
  });
  
  test('should handle already occupied positions', () => {
    const board = [
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    // 已佔用位置應該返回負值
    expect(calculator.calculateMoveValue(board, 0, 0)).toBeLessThan(0);
  });
});
```

#### 3. EnhancedProbabilityCalculator 測試 (probabilityCalculator.enhanced.test.js)

```javascript
// probabilityCalculator.enhanced.test.js
const EnhancedProbabilityCalculator = require('./probabilityCalculator.enhanced.js');

describe('EnhancedProbabilityCalculator', () => {
  let calculator;
  
  beforeEach(() => {
    calculator = new EnhancedProbabilityCalculator();
  });
  
  test('should calculate higher value for center position', () => {
    const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));
    const centerValue = calculator.calculateMoveValue(emptyBoard, 2, 2);
    const cornerValue = calculator.calculateMoveValue(emptyBoard, 0, 0);
    expect(centerValue).toBeGreaterThan(cornerValue);
  });
  
  test('should calculate higher value for intersection points', () => {
    const board = [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [1, 1, 0, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    // 交叉點 (2,2) 應該有更高價值
    const intersectionValue = calculator.calculateMoveValue(board, 2, 2);
    const nonIntersectionValue = calculator.calculateMoveValue(board, 3, 3);
    expect(intersectionValue).toBeGreaterThan(nonIntersectionValue);
  });
  
  test('should return best suggestion with confidence level', () => {
    const board = [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    const suggestion = calculator.getBestSuggestion(board);
    expect(suggestion).toBeTruthy();
    expect(suggestion.row).toBe(3);
    expect(suggestion.col).toBe(2);
    expect(suggestion.confidence).toBeTruthy();
  });
  
  test('should provide alternative suggestions', () => {
    const board = Array(5).fill().map(() => Array(5).fill(0));
    const suggestion = calculator.getBestSuggestion(board);
    expect(suggestion.alternatives).toBeTruthy();
    expect(suggestion.alternatives.length).toBeGreaterThan(0);
  });
  
  test('should use caching for performance', () => {
    const board = Array(5).fill().map(() => Array(5).fill(0));
    // 第一次計算
    const firstValue = calculator.calculateMoveValue(board, 2, 2);
    // 第二次應該使用緩存
    const secondValue = calculator.calculateMoveValue(board, 2, 2);
    expect(firstValue).toBe(secondValue);
    // 驗證緩存命中
    expect(calculator.getCacheHits()).toBeGreaterThan(0);
  });
});
```

#### 4. GameEngine 測試 (gameEngine.test.js)

```javascript
// gameEngine.test.js
const GameEngine = require('./gameEngine.js');

describe('GameEngine', () => {
  let engine;
  
  beforeEach(() => {
    engine = new GameEngine();
    engine.startGame();
  });
  
  test('should initialize with empty board', () => {
    const board = engine.getBoard();
    // 檢查所有格子是否為空
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        expect(board[row][col]).toBe(0);
      }
    }
  });
  
  test('should process player turn correctly', () => {
    const result = engine.processPlayerTurn(2, 2);
    expect(result).toBeTruthy();
    
    const board = engine.getBoard();
    expect(board[2][2]).toBe(1); // 1 表示玩家
  });
  
  test('should reject invalid player moves', () => {
    // 先選擇一個位置
    engine.processPlayerTurn(2, 2);
    // 嘗試選擇同一個位置應該失敗
    const result = engine.processPlayerTurn(2, 2);
    expect(result).toBeFalsy();
  });
  
  test('should process computer turn correctly', () => {
    const result = engine.processComputerTurn(3, 3);
    expect(result).toBeTruthy();
    
    const board = engine.getBoard();
    expect(board[3][3]).toBe(2); // 2 表示電腦
  });
  
  test('should track game progress', () => {
    expect(engine.getCurrentRound()).toBe(1);
    
    // 完成一輪
    engine.processPlayerTurn(0, 0);
    engine.processComputerTurn(1, 1);
    
    expect(engine.getCurrentRound()).toBe(2);
  });
  
  test('should detect game completion', () => {
    expect(engine.isGameComplete()).toBeFalsy();
    
    // 模擬完成 8 輪遊戲
    for (let i = 0; i < 8; i++) {
      engine.processPlayerTurn(i % 5, Math.floor(i / 5));
      engine.processComputerTurn((i % 5) + 1, Math.floor(i / 5));
    }
    
    expect(engine.isGameComplete()).toBeTruthy();
  });
  
  test('should calculate best move', () => {
    const move = engine.calculateBestMove();
    expect(move).toBeTruthy();
    expect(move.row >= 0 && move.row < 5).toBeTruthy();
    expect(move.col >= 0 && move.col < 5).toBeTruthy();
  });
});
```

#### 5. GameBoard UI 測試 (gameBoard.test.js)

```javascript
// gameBoard.test.js
const GameBoard = require('./gameBoard.js');

// 模擬 DOM 環境
global.document = {
  createElement: () => ({
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    appendChild: () => {},
    addEventListener: () => {}
  }),
  getElementById: () => ({
    appendChild: () => {}
  })
};

describe('GameBoard', () => {
  let gameBoard;
  
  beforeEach(() => {
    gameBoard = new GameBoard();
  });
  
  test('should initialize with correct size', () => {
    expect(gameBoard.getSize()).toBe(5);
  });
  
  test('should update cell state', () => {
    // 模擬更新格子狀態
    gameBoard.updateCell(2, 2, 1); // 玩家選擇
    const cellState = gameBoard.getCellState(2, 2);
    expect(cellState).toBe(1);
  });
  
  test('should highlight suggestion', () => {
    // 模擬高亮建議
    gameBoard.highlightSuggestion(3, 3);
    const isHighlighted = gameBoard.isCellHighlighted(3, 3);
    expect(isHighlighted).toBeTruthy();
  });
  
  test('should highlight completed lines', () => {
    const lines = [
      { type: 'horizontal', row: 0, cells: [[0,0], [0,1], [0,2], [0,3], [0,4]] }
    ];
    gameBoard.highlightLines(lines);
    const isLineHighlighted = gameBoard.isLineHighlighted(0, 0);
    expect(isLineHighlighted).toBeTruthy();
  });
});
```

### 整合測試

我們將創建整合測試，測試多個組件之間的互動：

#### 1. 遊戲流程整合測試 (gameFlow.test.js)

```javascript
// gameFlow.test.js
const GameEngine = require('./gameEngine.js');
const LineDetector = require('./lineDetector.js');
const ProbabilityCalculator = require('./probabilityCalculator.js');

describe('Game Flow Integration', () => {
  let engine;
  let lineDetector;
  let calculator;
  
  beforeEach(() => {
    lineDetector = new LineDetector();
    calculator = new ProbabilityCalculator();
    engine = new GameEngine(lineDetector, calculator);
    engine.startGame();
  });
  
  test('should complete a full game cycle', () => {
    // 模擬完整的 8 輪遊戲
    for (let i = 0; i < 8; i++) {
      // 獲取建議的移動
      const suggestion = calculator.getBestSuggestion(engine.getBoard());
      
      // 執行玩家回合
      const playerResult = engine.processPlayerTurn(suggestion.row, suggestion.col);
      expect(playerResult).toBeTruthy();
      
      // 執行電腦回合 (選擇一個空格子)
      let computerRow, computerCol;
      do {
        computerRow = Math.floor(Math.random() * 5);
        computerCol = Math.floor(Math.random() * 5);
      } while (engine.getBoard()[computerRow][computerCol] !== 0);
      
      const computerResult = engine.processComputerTurn(computerRow, computerCol);
      expect(computerResult).toBeTruthy();
    }
    
    // 遊戲應該完成
    expect(engine.isGameComplete()).toBeTruthy();
    
    // 應該有一些連線
    const lines = lineDetector.getAllLines(engine.getBoard());
    expect(lines.length).toBeGreaterThan(0);
  });
  
  test('should integrate line detection with game state', () => {
    // 創建一個水平線
    for (let col = 0; col < 5; col++) {
      engine.processPlayerTurn(0, col);
    }
    
    // 檢查連線
    const lines = lineDetector.getAllLines(engine.getBoard());
    expect(lines.length).toBe(1);
    expect(lines[0].type).toBe('horizontal');
  });
  
  test('should integrate probability calculation with game state', () => {
    // 創建一個部分完成的垂直線
    for (let row = 0; row < 3; row++) {
      engine.processPlayerTurn(row, 0);
    }
    
    // 獲取建議
    const suggestion = calculator.getBestSuggestion(engine.getBoard());
    
    // 建議應該是完成這條線
    expect(suggestion.row).toBe(3);
    expect(suggestion.col).toBe(0);
  });
});
```

#### 2. 演算法比較整合測試 (algorithmComparison.test.js)

```javascript
// algorithmComparison.test.js
const ProbabilityCalculator = require('./probabilityCalculator.js');
const EnhancedProbabilityCalculator = require('./probabilityCalculator.enhanced.js');

describe('Algorithm Comparison Integration', () => {
  let standardCalculator;
  let enhancedCalculator;
  
  beforeEach(() => {
    standardCalculator = new ProbabilityCalculator();
    enhancedCalculator = new EnhancedProbabilityCalculator();
  });
  
  test('should compare suggestions on empty board', () => {
    const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));
    
    const standardSuggestion = standardCalculator.getBestSuggestion(emptyBoard);
    const enhancedSuggestion = enhancedCalculator.getBestSuggestion(emptyBoard);
    
    // 兩種演算法在空板上應該都建議中心位置
    expect(standardSuggestion.row).toBe(2);
    expect(standardSuggestion.col).toBe(2);
    expect(enhancedSuggestion.row).toBe(2);
    expect(enhancedSuggestion.col).toBe(2);
  });
  
  test('should compare suggestions on partially filled board', () => {
    const board = [
      [1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    
    const standardSuggestion = standardCalculator.getBestSuggestion(board);
    const enhancedSuggestion = enhancedCalculator.getBestSuggestion(board);
    
    // 兩種演算法都應該建議完成水平線
    expect(standardSuggestion.row).toBe(0);
    expect(standardSuggestion.col).toBe(4);
    expect(enhancedSuggestion.row).toBe(0);
    expect(enhancedSuggestion.col).toBe(4);
  });
  
  test('should compare performance', () => {
    const board = Array(5).fill().map(() => Array(5).fill(0));
    
    // 測量標準演算法性能
    const standardStart = Date.now();
    for (let i = 0; i < 100; i++) {
      standardCalculator.getBestSuggestion(board);
    }
    const standardTime = Date.now() - standardStart;
    
    // 測量增強演算法性能
    const enhancedStart = Date.now();
    for (let i = 0; i < 100; i++) {
      enhancedCalculator.getBestSuggestion(board);
    }
    const enhancedTime = Date.now() - enhancedStart;
    
    console.log(`Standard algorithm: ${standardTime}ms`);
    console.log(`Enhanced algorithm: ${enhancedTime}ms`);
    
    // 不強制要求哪個更快，只是記錄比較結果
  });
});
```

### 端到端測試

我們將創建一個端到端測試，模擬完整的用戶交互：

```javascript
// e2e.test.js
const GameEngine = require('./gameEngine.js');
const GameBoard = require('./gameBoard.js');
const LineDetector = require('./lineDetector.js');
const ProbabilityCalculator = require('./probabilityCalculator.js');

// 模擬 DOM 環境
global.document = {
  createElement: () => ({
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    appendChild: () => {},
    addEventListener: (event, callback) => {
      // 存儲點擊回調以便測試
      if (event === 'click') {
        this.clickCallback = callback;
      }
    }
  }),
  getElementById: () => ({
    appendChild: () => {}
  })
};

describe('End-to-End Game Test', () => {
  let engine;
  let gameBoard;
  
  beforeEach(() => {
    const lineDetector = new LineDetector();
    const calculator = new ProbabilityCalculator();
    engine = new GameEngine(lineDetector, calculator);
    gameBoard = new GameBoard();
    
    // 連接組件
    engine.onBoardUpdate((board) => {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          gameBoard.updateCell(row, col, board[row][col]);
        }
      }
    });
    
    engine.onSuggestionUpdate((suggestion) => {
      gameBoard.highlightSuggestion(suggestion.row, suggestion.col);
    });
    
    engine.onLinesUpdate((lines) => {
      gameBoard.highlightLines(lines);
    });
    
    gameBoard.onCellClick((row, col) => {
      engine.processPlayerTurn(row, col);
    });
    
    engine.startGame();
  });
  
  test('should simulate complete game flow', () => {
    // 模擬 8 輪遊戲
    for (let round = 1; round <= 8; round++) {
      // 1. 獲取建議
      const suggestion = engine.calculateBestMove();
      
      // 2. 模擬玩家點擊建議的格子
      gameBoard.simulateClick(suggestion.row, suggestion.col);
      
      // 3. 檢查玩家的選擇是否被記錄
      expect(engine.getBoard()[suggestion.row][suggestion.col]).toBe(1);
      
      // 4. 模擬電腦回合
      let computerRow, computerCol;
      do {
        computerRow = Math.floor(Math.random() * 5);
        computerCol = Math.floor(Math.random() * 5);
      } while (engine.getBoard()[computerRow][computerCol] !== 0);
      
      engine.processComputerTurn(computerRow, computerCol);
      
      // 5. 檢查電腦的選擇是否被記錄
      expect(engine.getBoard()[computerRow][computerCol]).toBe(2);
      
      // 6. 檢查回合是否增加
      if (round < 8) {
        expect(engine.getCurrentRound()).toBe(round + 1);
      }
    }
    
    // 遊戲應該結束
    expect(engine.isGameComplete()).toBeTruthy();
    
    // 應該有最終結果
    const finalStats = engine.getFinalStats();
    expect(finalStats).toBeTruthy();
    expect(finalStats.totalLines).toBeGreaterThanOrEqual(0);
  });
});
```

### 測試覆蓋率

我們將實現一個簡單的測試覆蓋率報告功能：

```javascript
// 在 testRunner.js 中添加
function generateCoverageReport() {
  console.log('\n=== Test Coverage Report ===');
  console.log('Note: This is a simplified coverage report');
  
  const components = [
    'lineDetector.js',
    'probabilityCalculator.js',
    'probabilityCalculator.enhanced.js',
    'gameEngine.js',
    'gameBoard.js'
  ];
  
  components.forEach(component => {
    const testFile = component.replace('.js', '.test.js');
    try {
      fs.statSync(testFile);
      console.log(`✓ ${component}: Test file exists`);
    } catch (error) {
      console.log(`✗ ${component}: No test file found`);
    }
  });
}

// 在 runAllTests 函數末尾調用
generateCoverageReport();
```
```

### 演算法設計

#### 連線檢測演算法
```javascript
// 檢測所有可能的連線
function detectAllLines(board) {
  const lines = []
  
  // 水平線檢測
  for (let row = 0; row < 5; row++) {
    if (board[row].every(cell => cell !== 0)) {
      lines.push({ type: 'horizontal', row, cells: board[row].map((_, col) => [row, col]) })
    }
  }
  
  // 垂直線檢測
  for (let col = 0; col < 5; col++) {
    const column = board.map(row => row[col])
    if (column.every(cell => cell !== 0)) {
      lines.push({ type: 'vertical', col, cells: column.map((_, row) => [row, col]) })
    }
  }
  
  // 對角線檢測
  const mainDiagonal = board.map((row, i) => row[i])
  const antiDiagonal = board.map((row, i) => row[4 - i])
  
  if (mainDiagonal.every(cell => cell !== 0)) {
    lines.push({ type: 'diagonal-main', cells: mainDiagonal.map((_, i) => [i, i]) })
  }
  
  if (antiDiagonal.every(cell => cell !== 0)) {
    lines.push({ type: 'diagonal-anti', cells: antiDiagonal.map((_, i) => [i, 4 - i]) })
  }
  
  return lines
}
```

#### 最佳移動建議演算法（合作模式）
```javascript
function calculateBestMove(board) {
  const emptyCells = getEmptyCells(board)
  let bestMove = null
  let maxValue = -1
  
  for (const [row, col] of emptyCells) {
    const value = calculateMoveValue(board, row, col)
    if (value > maxValue) {
      maxValue = value
      bestMove = [row, col]
    }
  }
  
  return bestMove
}

function calculateMoveValue(board, row, col) {
  // 模擬放置這個移動
  const testBoard = board.map(row => [...row])
  testBoard[row][col] = 1 // 玩家移動
  
  // 計算合作價值
  let value = 0
  
  // 檢查這個移動能直接完成多少條線
  value += checkDirectCompletions(testBoard, row, col) * 100
  
  // 檢查這個移動能與電腦合作完成多少條線的潛力
  value += checkCooperativeLinePotential(testBoard, row, col) * 50
  
  // 檢查這個移動的一般連線潛力
  value += checkGeneralLinePotential(testBoard, row, col) * 10
  
  // 中心位置獎勵
  if (row === 2 && col === 2) {
    value += 5
  }
  
  return value
}

function checkCooperativeLinePotential(board, row, col) {
  let potential = 0
  
  // 檢查水平線：如果這條線上已有電腦或玩家的棋子，增加合作潛力
  const horizontalLine = board[row]
  const horizontalFilled = horizontalLine.filter(cell => cell !== 0).length
  const horizontalEmpty = horizontalLine.filter(cell => cell === 0).length
  if (horizontalFilled > 0 && horizontalEmpty > 0) {
    potential += horizontalFilled
  }
  
  // 檢查垂直線
  const verticalLine = board.map(r => r[col])
  const verticalFilled = verticalLine.filter(cell => cell !== 0).length
  const verticalEmpty = verticalLine.filter(cell => cell === 0).length
  if (verticalFilled > 0 && verticalEmpty > 0) {
    potential += verticalFilled
  }
  
  // 檢查對角線（如果適用）
  if (row === col) {
    const mainDiagonal = board.map((r, i) => r[i])
    const diagonalFilled = mainDiagonal.filter(cell => cell !== 0).length
    const diagonalEmpty = mainDiagonal.filter(cell => cell === 0).length
    if (diagonalFilled > 0 && diagonalEmpty > 0) {
      potential += diagonalFilled
    }
  }
  
  if (row + col === 4) {
    const antiDiagonal = board.map((r, i) => r[4 - i])
    const antiDiagonalFilled = antiDiagonal.filter(cell => cell !== 0).length
    const antiDiagonalEmpty = antiDiagonal.filter(cell => cell === 0).length
    if (antiDiagonalFilled > 0 && antiDiagonalEmpty > 0) {
      potential += antiDiagonalFilled
    }
  }
  
  return potential
}
```