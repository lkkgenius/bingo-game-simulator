# API 文檔

本文檔詳細說明了 Bingo 遊戲模擬器各個組件的 API 接口和使用方法。

## 目錄

- [GameEngine](#gameengine) - 核心遊戲引擎
- [GameBoard](#gameboard) - 遊戲板 UI 組件
- [LineDetector](#linedetector) - 連線檢測器
- [ProbabilityCalculator](#probabilitycalculator) - 標準機率計算器
- [EnhancedProbabilityCalculator](#enhancedprobabilitycalculator) - 增強機率計算器
- [AlgorithmComparison](#algorithmcomparison) - 演算法比較工具
- [PerformanceMonitor](#performancemonitor) - 性能監控器
- [AILearningSystem](#ailearningsystem) - AI 學習系統
- [I18n](#i18n) - 國際化系統
- [PWAManager](#pwamanager) - PWA 管理器

---

## GameEngine

核心遊戲引擎，負責管理遊戲狀態、處理回合邏輯和協調各個組件。

### 構造函數

```javascript
const gameEngine = new GameEngine();
```

### 常數

```javascript
gameEngine.BOARD_SIZE = 5;           // 遊戲板大小
gameEngine.MAX_ROUNDS = 8;           // 最大回合數

gameEngine.CELL_STATES = {
    EMPTY: 0,                        // 空格子
    PLAYER: 1,                       // 玩家選擇
    COMPUTER: 2                      // 電腦選擇
};

gameEngine.GAME_PHASES = {
    WAITING_START: 'waiting-start',  // 等待開始
    PLAYER_TURN: 'player-turn',      // 玩家回合
    COMPUTER_INPUT: 'computer-input', // 電腦輸入
    GAME_OVER: 'game-over'           // 遊戲結束
};
```

### 主要方法

#### `startGame()`
開始新遊戲，重置所有狀態。

```javascript
gameEngine.startGame();
```

#### `processPlayerTurn(row, col)`
處理玩家回合的移動。

**參數:**
- `row` (number): 行位置 (0-4)
- `col` (number): 列位置 (0-4)

**返回值:**
- `boolean`: 移動是否成功

```javascript
const success = gameEngine.processPlayerTurn(2, 3);
```

#### `processComputerTurn(row, col)`
處理電腦回合的移動。

**參數:**
- `row` (number): 行位置 (0-4)
- `col` (number): 列位置 (0-4)

**返回值:**
- `boolean`: 移動是否成功

```javascript
const success = gameEngine.processComputerTurn(1, 4);
```

#### `calculateBestMove()`
計算當前最佳移動建議。

**返回值:**
- `Object`: 包含建議移動的對象
  - `row` (number): 建議的行位置
  - `col` (number): 建議的列位置
  - `value` (number): 移動的價值分數
  - `confidence` (number): 建議的信心度

```javascript
const suggestion = gameEngine.calculateBestMove();
console.log(`建議移動: (${suggestion.row}, ${suggestion.col})`);
```

#### `getGameState()`
獲取當前遊戲狀態。

**返回值:**
- `Object`: 遊戲狀態對象

```javascript
const state = gameEngine.getGameState();
console.log(`當前回合: ${state.currentRound}`);
```

#### `isGameComplete()`
檢查遊戲是否已結束。

**返回值:**
- `boolean`: 遊戲是否結束

```javascript
if (gameEngine.isGameComplete()) {
    console.log('遊戲結束！');
}
```

### 事件回調

#### `onBoardUpdate(callback)`
註冊遊戲板更新回調。

```javascript
gameEngine.onBoardUpdate((board) => {
    console.log('遊戲板已更新', board);
});
```

#### `onGamePhaseChange(callback)`
註冊遊戲階段變更回調。

```javascript
gameEngine.onGamePhaseChange((phase) => {
    console.log('遊戲階段變更為:', phase);
});
```

---

## GameBoard

遊戲板 UI 組件，負責渲染遊戲板和處理用戶交互。

### 構造函數

```javascript
const gameBoard = new GameBoard(containerId, size);
```

**參數:**
- `containerId` (string): 容器元素的 ID
- `size` (number, 可選): 遊戲板大小，默認為 5

### 主要方法

#### `render()`
渲染遊戲板到指定容器。

```javascript
gameBoard.render();
```

#### `updateCell(row, col, state)`
更新指定格子的狀態。

**參數:**
- `row` (number): 行位置
- `col` (number): 列位置
- `state` (number): 格子狀態 (0: 空, 1: 玩家, 2: 電腦)

```javascript
gameBoard.updateCell(2, 3, 1); // 將 (2,3) 設為玩家狀態
```

#### `highlightSuggestion(row, col)`
高亮顯示建議的移動位置。

**參數:**
- `row` (number): 行位置
- `col` (number): 列位置

```javascript
gameBoard.highlightSuggestion(1, 2);
```

#### `clearSuggestion()`
清除建議高亮。

```javascript
gameBoard.clearSuggestion();
```

#### `highlightLines(lines)`
高亮顯示完成的連線。

**參數:**
- `lines` (Array): 連線陣列

```javascript
gameBoard.highlightLines([
    { type: 'horizontal', row: 0, cells: [[0,0], [0,1], [0,2], [0,3], [0,4]] }
]);
```

#### `onCellClick(callback)`
註冊格子點擊事件回調。

```javascript
gameBoard.onCellClick((row, col) => {
    console.log(`點擊了格子 (${row}, ${col})`);
});
```

---

## LineDetector

連線檢測器，負責檢測遊戲板上的完成連線。

### 構造函數

```javascript
const lineDetector = new LineDetector();
```

### 常數

```javascript
lineDetector.LINE_TYPES = {
    HORIZONTAL: 'horizontal',        // 水平線
    VERTICAL: 'vertical',            // 垂直線
    DIAGONAL_MAIN: 'diagonal-main',  // 主對角線
    DIAGONAL_ANTI: 'diagonal-anti'   // 反對角線
};
```

### 主要方法

#### `checkHorizontalLines(board)`
檢測水平連線。

**參數:**
- `board` (Array): 5x5 遊戲板陣列

**返回值:**
- `Array`: 完成的水平線陣列

```javascript
const horizontalLines = lineDetector.checkHorizontalLines(board);
```

#### `checkVerticalLines(board)`
檢測垂直連線。

**參數:**
- `board` (Array): 5x5 遊戲板陣列

**返回值:**
- `Array`: 完成的垂直線陣列

```javascript
const verticalLines = lineDetector.checkVerticalLines(board);
```

#### `checkDiagonalLines(board)`
檢測對角線連線。

**參數:**
- `board` (Array): 5x5 遊戲板陣列

**返回值:**
- `Array`: 完成的對角線陣列

```javascript
const diagonalLines = lineDetector.checkDiagonalLines(board);
```

#### `getAllLines(board)`
獲取所有完成的連線。

**參數:**
- `board` (Array): 5x5 遊戲板陣列

**返回值:**
- `Array`: 所有完成連線的陣列

```javascript
const allLines = lineDetector.getAllLines(board);
console.log(`總共完成了 ${allLines.length} 條連線`);
```

#### `countCompletedLines(board)`
計算完成的連線數量。

**參數:**
- `board` (Array): 5x5 遊戲板陣列

**返回值:**
- `number`: 完成的連線數量

```javascript
const lineCount = lineDetector.countCompletedLines(board);
```

---

## ProbabilityCalculator

標準機率計算器，提供基本的移動價值計算和建議。

### 構造函數

```javascript
const calculator = new ProbabilityCalculator();
```

### 權重設定

```javascript
calculator.WEIGHTS = {
    COMPLETE_LINE: 100,      // 完成一條線的價值
    COOPERATIVE_LINE: 50,    // 幫助完成混合連線的價值
    POTENTIAL_LINE: 10,      // 潛在連線的價值
    CENTER_BONUS: 5          // 中心位置的額外價值
};
```

### 主要方法

#### `calculateMoveValue(board, row, col)`
計算特定移動的價值。

**參數:**
- `board` (Array): 當前遊戲板狀態
- `row` (number): 移動的行位置
- `col` (number): 移動的列位置

**返回值:**
- `number`: 移動的價值分數

```javascript
const value = calculator.calculateMoveValue(board, 2, 3);
console.log(`移動 (2,3) 的價值: ${value}`);
```

#### `getBestSuggestion(board)`
獲取最佳移動建議。

**參數:**
- `board` (Array): 當前遊戲板狀態

**返回值:**
- `Object`: 建議對象
  - `row` (number): 建議的行位置
  - `col` (number): 建議的列位置
  - `value` (number): 移動價值
  - `reasoning` (string): 建議理由

```javascript
const suggestion = calculator.getBestSuggestion(board);
console.log(`建議: (${suggestion.row}, ${suggestion.col}), 理由: ${suggestion.reasoning}`);
```

#### `simulateAllPossibleMoves(board)`
模擬所有可能的移動。

**參數:**
- `board` (Array): 當前遊戲板狀態

**返回值:**
- `Array`: 所有可能移動的價值陣列

```javascript
const allMoves = calculator.simulateAllPossibleMoves(board);
```

---

## EnhancedProbabilityCalculator

增強機率計算器，提供更智能的移動建議和策略分析。

### 構造函數

```javascript
const enhancedCalculator = new EnhancedProbabilityCalculator();
```

### 主要方法

#### `calculateMoveValue(board, row, col)`
計算移動價值（增強版）。

**參數:**
- `board` (Array): 當前遊戲板狀態
- `row` (number): 移動的行位置
- `col` (number): 移動的列位置

**返回值:**
- `number`: 移動的價值分數

```javascript
const value = enhancedCalculator.calculateMoveValue(board, 2, 3);
```

#### `getBestSuggestion(board)`
獲取最佳移動建議（增強版）。

**參數:**
- `board` (Array): 當前遊戲板狀態

**返回值:**
- `Object`: 增強建議對象
  - `row` (number): 建議的行位置
  - `col` (number): 建議的列位置
  - `value` (number): 移動價值
  - `confidence` (number): 信心度 (0-1)
  - `alternatives` (Array): 替代建議
  - `reasoning` (string): 詳細理由

```javascript
const suggestion = enhancedCalculator.getBestSuggestion(board);
console.log(`增強建議: (${suggestion.row}, ${suggestion.col})`);
console.log(`信心度: ${suggestion.confidence}`);
console.log(`替代方案: ${suggestion.alternatives.length} 個`);
```

#### `analyzeIntersectionPoints(board)`
分析交叉點的戰略價值。

**參數:**
- `board` (Array): 當前遊戲板狀態

**返回值:**
- `Array`: 交叉點分析結果

```javascript
const intersections = enhancedCalculator.analyzeIntersectionPoints(board);
```

---

## AlgorithmComparison

演算法比較工具，用於比較不同演算法的性能和建議質量。

### 構造函數

```javascript
const comparison = new AlgorithmComparison();
```

### 主要方法

#### `compareAlgorithms(board, iterations)`
比較兩種演算法的性能。

**參數:**
- `board` (Array): 測試用的遊戲板狀態
- `iterations` (number): 測試迭代次數

**返回值:**
- `Object`: 比較結果
  - `standard` (Object): 標準演算法結果
  - `enhanced` (Object): 增強演算法結果
  - `comparison` (Object): 比較統計

```javascript
const result = comparison.compareAlgorithms(board, 100);
console.log(`標準演算法平均時間: ${result.standard.averageTime}ms`);
console.log(`增強演算法平均時間: ${result.enhanced.averageTime}ms`);
```

#### `measurePerformance(algorithm, board, iterations)`
測量特定演算法的性能。

**參數:**
- `algorithm` (Object): 演算法實例
- `board` (Array): 測試用的遊戲板狀態
- `iterations` (number): 測試迭代次數

**返回值:**
- `Object`: 性能測量結果

```javascript
const performance = comparison.measurePerformance(calculator, board, 50);
```

---

## PerformanceMonitor

性能監控器，追蹤和分析應用程式的性能指標。

### 構造函數

```javascript
const monitor = new PerformanceMonitor();
```

### 主要方法

#### `startTiming(label)`
開始計時。

**參數:**
- `label` (string): 計時標籤

```javascript
monitor.startTiming('algorithm-calculation');
```

#### `endTiming(label)`
結束計時。

**參數:**
- `label` (string): 計時標籤

**返回值:**
- `number`: 經過的時間（毫秒）

```javascript
const elapsed = monitor.endTiming('algorithm-calculation');
console.log(`演算法計算耗時: ${elapsed}ms`);
```

#### `recordMetric(name, value)`
記錄性能指標。

**參數:**
- `name` (string): 指標名稱
- `value` (number): 指標值

```javascript
monitor.recordMetric('memory-usage', performance.memory.usedJSHeapSize);
```

#### `getReport()`
獲取性能報告。

**返回值:**
- `Object`: 性能報告

```javascript
const report = monitor.getReport();
console.log('性能報告:', report);
```

---

## AILearningSystem

AI 學習系統，基於歷史數據提供智能學習功能。

### 構造函數

```javascript
const aiSystem = new AILearningSystem();
```

### 主要方法

#### `recordGameData(gameData)`
記錄遊戲數據。

**參數:**
- `gameData` (Object): 遊戲數據對象

```javascript
aiSystem.recordGameData({
    moves: playerMoves,
    result: gameResult,
    algorithm: 'enhanced'
});
```

#### `getRecommendation(board)`
基於學習數據獲取建議。

**參數:**
- `board` (Array): 當前遊戲板狀態

**返回值:**
- `Object`: AI 建議

```javascript
const aiSuggestion = aiSystem.getRecommendation(board);
```

#### `analyzePatterns()`
分析遊戲模式。

**返回值:**
- `Object`: 模式分析結果

```javascript
const patterns = aiSystem.analyzePatterns();
```

---

## I18n

國際化系統，提供多語言支持。

### 構造函數

```javascript
const i18n = new I18n();
```

### 主要方法

#### `setLanguage(language)`
設置語言。

**參數:**
- `language` (string): 語言代碼 ('zh' 或 'en')

```javascript
i18n.setLanguage('en');
```

#### `t(key, params)`
翻譯文本。

**參數:**
- `key` (string): 翻譯鍵
- `params` (Object, 可選): 參數對象

**返回值:**
- `string`: 翻譯後的文本

```javascript
const text = i18n.t('game.start');
const paramText = i18n.t('game.round', { round: 3 });
```

---

## PWAManager

PWA 管理器，處理 Progressive Web App 功能。

### 構造函數

```javascript
const pwaManager = new PWAManager();
```

### 主要方法

#### `init()`
初始化 PWA 功能。

```javascript
pwaManager.init();
```

#### `showInstallPrompt()`
顯示安裝提示。

```javascript
pwaManager.showInstallPrompt();
```

#### `isInstalled()`
檢查是否已安裝。

**返回值:**
- `boolean`: 是否已安裝

```javascript
if (pwaManager.isInstalled()) {
    console.log('PWA 已安裝');
}
```

---

## 使用範例

### 基本遊戲流程

```javascript
// 初始化組件
const gameEngine = new GameEngine();
const gameBoard = new GameBoard('game-container');

// 設置事件監聽
gameEngine.onBoardUpdate((board) => {
    // 更新 UI
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            gameBoard.updateCell(row, col, board[row][col]);
        }
    }
});

gameBoard.onCellClick((row, col) => {
    // 處理玩家移動
    if (gameEngine.processPlayerTurn(row, col)) {
        // 獲取建議
        const suggestion = gameEngine.calculateBestMove();
        gameBoard.highlightSuggestion(suggestion.row, suggestion.col);
    }
});

// 開始遊戲
gameEngine.startGame();
gameBoard.render();
```

### 演算法比較

```javascript
const comparison = new AlgorithmComparison();
const testBoard = [
    [1, 0, 2, 0, 1],
    [0, 1, 0, 2, 0],
    [2, 0, 1, 0, 2],
    [0, 2, 0, 1, 0],
    [1, 0, 2, 0, 0]
];

const result = comparison.compareAlgorithms(testBoard, 100);
console.log('演算法比較結果:', result);
```

### 性能監控

```javascript
const monitor = new PerformanceMonitor();

// 監控演算法性能
monitor.startTiming('suggestion-calculation');
const suggestion = gameEngine.calculateBestMove();
const elapsed = monitor.endTiming('suggestion-calculation');

console.log(`建議計算耗時: ${elapsed}ms`);

// 獲取完整報告
const report = monitor.getReport();
console.log('性能報告:', report);
```

---

## 錯誤處理

所有 API 方法都包含適當的錯誤處理。常見錯誤類型：

- `InvalidMoveError`: 無效的移動位置
- `GameStateError`: 遊戲狀態錯誤
- `CalculationError`: 計算錯誤

```javascript
try {
    const success = gameEngine.processPlayerTurn(row, col);
    if (!success) {
        console.error('移動失敗');
    }
} catch (error) {
    console.error('遊戲錯誤:', error.message);
}
```

---

## 類型定義

專案包含 TypeScript 類型定義文件 `types.d.ts`，提供完整的類型支持。

```typescript
interface GameState {
    board: number[][];
    currentRound: number;
    gamePhase: string;
    playerMoves: [number, number][];
    computerMoves: [number, number][];
    completedLines: Line[];
    isGameComplete: boolean;
}

interface Suggestion {
    row: number;
    col: number;
    value: number;
    confidence?: number;
    reasoning?: string;
    alternatives?: Suggestion[];
}
```