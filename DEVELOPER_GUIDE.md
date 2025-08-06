# 開發者指南

本指南幫助新開發者快速理解 Bingo 遊戲模擬器的代碼結構、開發流程和最佳實踐。

## 目錄

- [快速開始](#快速開始)
- [架構概覽](#架構概覽)
- [核心概念](#核心概念)
- [開發環境設置](#開發環境設置)
- [代碼結構](#代碼結構)
- [開發流程](#開發流程)
- [測試指南](#測試指南)
- [性能優化](#性能優化)
- [部署指南](#部署指南)
- [常見問題](#常見問題)

## 快速開始

### 1. 環境準備

```bash
# 克隆專案
git clone https://github.com/lkkgenius/bingo-game-simulator.git
cd bingo-game-simulator

# 安裝依賴（如果有的話）
# 本專案使用純 JavaScript，無需安裝依賴

# 啟動本地服務器
python -m http.server 8000
# 或
npx http-server
```

### 2. 瀏覽器訪問

打開瀏覽器訪問 `http://localhost:8000`

### 3. 開發工具

推薦使用以下開發工具：
- **編輯器**: VS Code, WebStorm, 或任何支持 JavaScript 的編輯器
- **瀏覽器**: Chrome DevTools 用於調試
- **版本控制**: Git
- **測試**: Node.js 用於運行測試

## 架構概覽

### MVC 架構模式

專案採用 MVC (Model-View-Controller) 架構模式：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Model       │    │   Controller    │    │      View       │
│                 │    │                 │    │                 │
│ - GameEngine    │◄──►│ - script.js     │◄──►│ - GameBoard     │
│ - LineDetector  │    │ - Event Handler │    │ - index.html    │
│ - Calculator    │    │ - Game Logic    │    │ - styles.css    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 組件層次結構

```
Application (script.js)
├── GameEngine (遊戲邏輯核心)
│   ├── LineDetector (連線檢測)
│   ├── ProbabilityCalculator (標準演算法)
│   └── EnhancedProbabilityCalculator (增強演算法)
├── GameBoard (UI 組件)
├── PerformanceMonitor (性能監控)
├── AILearningSystem (AI 學習)
└── Utilities (工具模塊)
    ├── I18n (國際化)
    ├── PWAManager (PWA 功能)
    └── SafeDOM (安全 DOM 操作)
```

## 核心概念

### 1. 遊戲狀態管理

遊戲狀態集中在 `GameEngine` 中管理：

```javascript
// 遊戲狀態結構
const gameState = {
    board: Array(5).fill().map(() => Array(5).fill(0)), // 5x5 遊戲板
    currentRound: 1,                                     // 當前回合
    gamePhase: 'waiting-start',                          // 遊戲階段
    playerMoves: [],                                     // 玩家移動記錄
    computerMoves: [],                                   // 電腦移動記錄
    completedLines: [],                                  // 完成的連線
    isGameComplete: false                                // 遊戲是否結束
};
```

### 2. 事件驅動架構

組件間通過事件和回調進行通信：

```javascript
// 註冊事件監聽器
gameEngine.onBoardUpdate((board) => {
    // 更新 UI
});

gameEngine.onGamePhaseChange((phase) => {
    // 處理階段變更
});

gameBoard.onCellClick((row, col) => {
    // 處理用戶點擊
});
```

### 3. 演算法系統

兩種演算法提供不同的策略：

- **標準演算法**: 基礎的機率計算和連線檢測
- **增強演算法**: 更智能的策略分析和交叉點優先

### 4. 模塊化設計

每個功能模塊都是獨立的，可以單獨測試和維護：

```javascript
// 模塊導出（Node.js 環境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}

// 瀏覽器環境
if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
}
```

## 開發環境設置

### 1. 編輯器配置

**VS Code 推薦設置** (`.vscode/settings.json`):

```json
{
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "javascript.preferences.quoteStyle": "single",
    "files.eol": "\n",
    "editor.formatOnSave": true
}
```

**推薦擴展**:
- JavaScript (ES6) code snippets
- Live Server
- Prettier - Code formatter
- ESLint

### 2. Git 配置

```bash
# 設置 Git hooks
git config core.autocrlf input
git config core.eol lf

# 推薦的 .gitignore 已包含在專案中
```

### 3. 瀏覽器開發工具

**Chrome DevTools 使用技巧**:
- 使用 Console 面板調試 JavaScript
- 使用 Network 面板監控資源載入
- 使用 Performance 面板分析性能
- 使用 Application 面板測試 PWA 功能

## 代碼結構

### 1. 文件組織原則

```
核心邏輯文件:
├── gameEngine.js          # 遊戲引擎（最重要）
├── gameBoard.js           # UI 組件
├── lineDetector.js        # 連線檢測
└── probabilityCalculator.js # 演算法

工具和增強功能:
├── performance-monitor.js  # 性能監控
├── aiLearningSystem.js    # AI 學習
├── i18n.js               # 國際化
└── utils/                # 工具模塊

測試文件:
├── *.test.js             # 單元測試
├── e2e.test.js           # 端到端測試
└── testRunner.js         # 測試運行器
```

### 2. 命名規範

**文件命名**:
- 使用 kebab-case: `performance-monitor.js`
- 測試文件: `component.test.js`
- 工具文件: `utils/common.js`

**變量和函數命名**:
```javascript
// 使用 camelCase
const gameEngine = new GameEngine();
const calculateBestMove = () => {};

// 常數使用 UPPER_SNAKE_CASE
const BOARD_SIZE = 5;
const MAX_ROUNDS = 8;

// 類使用 PascalCase
class GameEngine {}
class LineDetector {}
```

**CSS 類命名**:
```css
/* 使用 BEM 方法論 */
.game-board {}
.game-board__cell {}
.game-board__cell--highlighted {}
.game-board__cell--player {}
```

### 3. 代碼組織模式

**模塊模式**:
```javascript
// 立即執行函數表達式 (IIFE)
(function() {
    'use strict';
    
    // 私有變量和函數
    let privateVar = 'private';
    
    function privateFunction() {
        // 私有邏輯
    }
    
    // 公開 API
    window.MyModule = {
        publicMethod: function() {
            // 公開方法
        }
    };
})();
```

**類模式**:
```javascript
class GameComponent {
    constructor(options = {}) {
        // 初始化
        this.options = { ...this.defaultOptions, ...options };
        this.init();
    }
    
    get defaultOptions() {
        return {
            // 默認選項
        };
    }
    
    init() {
        // 初始化邏輯
    }
    
    // 公開方法
    publicMethod() {}
    
    // 私有方法（約定以 _ 開頭）
    _privateMethod() {}
}
```

## 開發流程

### 1. 功能開發流程

```bash
# 1. 創建功能分支
git checkout -b feature/new-algorithm

# 2. 開發功能
# - 編寫代碼
# - 添加測試
# - 更新文檔

# 3. 運行測試
node testRunner.js

# 4. 提交代碼
git add .
git commit -m "feat: add new algorithm implementation"

# 5. 推送並創建 PR
git push origin feature/new-algorithm
```

### 2. 代碼審查清單

**功能性**:
- [ ] 功能是否按預期工作
- [ ] 是否處理了邊界情況
- [ ] 錯誤處理是否完善

**代碼質量**:
- [ ] 代碼是否易讀易懂
- [ ] 是否遵循命名規範
- [ ] 是否有適當的註釋

**性能**:
- [ ] 是否有性能問題
- [ ] 是否有記憶體洩漏
- [ ] 是否需要優化

**測試**:
- [ ] 是否有足夠的測試覆蓋
- [ ] 測試是否通過
- [ ] 是否測試了邊界情況

### 3. 提交訊息規範

使用 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

```bash
# 功能
git commit -m "feat: add enhanced probability calculator"

# 修復
git commit -m "fix: resolve line detection bug in diagonal lines"

# 文檔
git commit -m "docs: update API documentation"

# 樣式
git commit -m "style: improve CSS formatting"

# 重構
git commit -m "refactor: simplify game state management"

# 測試
git commit -m "test: add unit tests for LineDetector"

# 性能
git commit -m "perf: optimize move calculation algorithm"
```

## 測試指南

### 1. 測試架構

```
測試層次:
├── 單元測試 (Unit Tests)
│   ├── lineDetector.test.js
│   ├── probabilityCalculator.test.js
│   └── gameEngine.test.js
├── 整合測試 (Integration Tests)
│   ├── gameFlow.test.js
│   └── algorithmComparison.test.js
└── 端到端測試 (E2E Tests)
    ├── e2e.test.js
    └── playwright-e2e.test.js
```

### 2. 編寫測試

**單元測試範例**:
```javascript
// lineDetector.test.js
describe('LineDetector', () => {
    let lineDetector;
    
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
        
        const lines = lineDetector.checkHorizontalLines(board);
        expect(lines).toHaveLength(1);
        expect(lines[0].type).toBe('horizontal');
    });
});
```

**整合測試範例**:
```javascript
// gameFlow.test.js
describe('Game Flow Integration', () => {
    test('should complete full game cycle', () => {
        const engine = new GameEngine();
        engine.startGame();
        
        // 模擬 8 輪遊戲
        for (let i = 0; i < 8; i++) {
            const suggestion = engine.calculateBestMove();
            engine.processPlayerTurn(suggestion.row, suggestion.col);
            
            // 模擬電腦移動
            const emptyCells = getEmptyCells(engine.getBoard());
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            engine.processComputerTurn(randomCell[0], randomCell[1]);
        }
        
        expect(engine.isGameComplete()).toBeTruthy();
    });
});
```

### 3. 運行測試

```bash
# 運行所有測試
node testRunner.js

# 運行特定測試
node lineDetector.test.js

# 運行 E2E 測試
npx playwright test playwright-e2e.test.js

# 生成測試報告
node testRunner.js --report
```

### 4. 測試最佳實踐

**測試命名**:
```javascript
// 好的測試名稱
test('should detect horizontal line when all cells in row are filled', () => {});
test('should return empty array when no lines are completed', () => {});

// 避免的測試名稱
test('test1', () => {});
test('horizontal line test', () => {});
```

**測試結構**:
```javascript
test('should calculate correct move value', () => {
    // Arrange - 準備測試數據
    const board = createTestBoard();
    const calculator = new ProbabilityCalculator();
    
    // Act - 執行被測試的操作
    const value = calculator.calculateMoveValue(board, 2, 2);
    
    // Assert - 驗證結果
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(100);
});
```

## 性能優化

### 1. JavaScript 性能

**避免重複計算**:
```javascript
// 不好的做法
function calculateMoveValue(board, row, col) {
    // 每次都重新計算
    const lines = getAllLines(board);
    // ...
}

// 好的做法
class ProbabilityCalculator {
    constructor() {
        this._cache = new Map();
    }
    
    calculateMoveValue(board, row, col) {
        const cacheKey = this.getBoardHash(board) + `-${row}-${col}`;
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }
        
        const value = this._doCalculation(board, row, col);
        this._cache.set(cacheKey, value);
        return value;
    }
}
```

**使用高效的數據結構**:
```javascript
// 使用 Set 進行快速查找
const occupiedCells = new Set();
occupiedCells.add(`${row}-${col}`);

// 使用 Map 進行鍵值對存儲
const cellValues = new Map();
cellValues.set(`${row}-${col}`, value);
```

### 2. DOM 性能

**批量 DOM 操作**:
```javascript
// 不好的做法
for (let i = 0; i < cells.length; i++) {
    cells[i].style.backgroundColor = 'red'; // 每次都觸發重繪
}

// 好的做法
const fragment = document.createDocumentFragment();
cells.forEach(cell => {
    cell.style.backgroundColor = 'red';
    fragment.appendChild(cell);
});
container.appendChild(fragment); // 一次性更新
```

**使用 CSS 類而不是內聯樣式**:
```javascript
// 不好的做法
element.style.backgroundColor = 'red';
element.style.border = '2px solid blue';

// 好的做法
element.className = 'highlighted-cell';
```

### 3. 記憶體管理

**清理事件監聽器**:
```javascript
class GameBoard {
    constructor() {
        this.clickHandler = this.handleClick.bind(this);
    }
    
    render() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', this.clickHandler);
        });
    }
    
    destroy() {
        this.cells.forEach(cell => {
            cell.removeEventListener('click', this.clickHandler);
        });
    }
}
```

**避免記憶體洩漏**:
```javascript
// 清理定時器
class PerformanceMonitor {
    startMonitoring() {
        this.intervalId = setInterval(() => {
            this.collectMetrics();
        }, 1000);
    }
    
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
```

## 部署指南

### 1. GitHub Pages 部署

**自動部署設置**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Run tests
      run: node testRunner.js
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

**部署前檢查清單**:
- [ ] 所有測試通過
- [ ] 資源路徑使用相對路徑
- [ ] 壓縮 CSS 和 JavaScript（如需要）
- [ ] 更新 manifest.json
- [ ] 測試 PWA 功能

### 2. 其他部署選項

**Netlify 部署**:
```toml
# netlify.toml
[build]
  publish = "."
  command = "echo 'No build step required'"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

**Vercel 部署**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ]
}
```

### 3. 性能優化部署

**資源壓縮**:
```bash
# 壓縮 JavaScript
npx terser script.js -o script.min.js

# 壓縮 CSS
npx csso styles.css --output styles.min.css

# 優化圖片
npx imagemin images/* --out-dir=images/optimized
```

**CDN 配置**:
```html
<!-- 使用 CDN 加速字體載入 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

## 常見問題

### 1. 開發問題

**Q: 為什麼我的修改沒有生效？**
A: 檢查瀏覽器緩存，使用 Ctrl+F5 強制刷新，或在開發者工具中禁用緩存。

**Q: 如何調試 JavaScript 錯誤？**
A: 使用 Chrome DevTools 的 Console 面板，設置斷點，使用 `console.log()` 輸出調試信息。

**Q: 測試失敗怎麼辦？**
A: 檢查測試輸出的錯誤信息，確保測試環境正確設置，檢查代碼邏輯是否正確。

### 2. 性能問題

**Q: 遊戲運行緩慢怎麼辦？**
A: 使用 Performance Monitor 檢查性能瓶頸，優化演算法，減少 DOM 操作。

**Q: 記憶體使用過高？**
A: 檢查是否有記憶體洩漏，清理不必要的事件監聽器，使用 Chrome DevTools 的 Memory 面板分析。

### 3. 部署問題

**Q: GitHub Pages 部署失敗？**
A: 檢查 repository 設置，確保分支正確，檢查文件路徑是否正確。

**Q: PWA 功能不工作？**
A: 檢查 manifest.json 配置，確保 Service Worker 正確註冊，使用 HTTPS 協議。

### 4. 瀏覽器兼容性

**Q: 在某些瀏覽器中不工作？**
A: 檢查 JavaScript 特性兼容性，使用 Babel 轉譯代碼，添加 polyfills。

**支持的瀏覽器**:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### 5. 調試技巧

**使用 Console API**:
```javascript
// 基本日誌
console.log('Debug info:', variable);

// 分組日誌
console.group('Game State');
console.log('Round:', currentRound);
console.log('Phase:', gamePhase);
console.groupEnd();

// 性能測量
console.time('algorithm');
calculateBestMove();
console.timeEnd('algorithm');

// 條件日誌
console.assert(value > 0, 'Value should be positive');
```

**使用斷點**:
```javascript
// 代碼斷點
debugger;

// 條件斷點（在 DevTools 中設置）
if (round === 5) {
    debugger;
}
```

## 貢獻指南

### 1. 提交 Issue

**Bug 報告模板**:
```markdown
## Bug 描述
簡潔描述遇到的問題

## 重現步驟
1. 打開遊戲
2. 點擊...
3. 看到錯誤...

## 預期行為
描述應該發生什麼

## 實際行為
描述實際發生了什麼

## 環境信息
- 瀏覽器: Chrome 95
- 操作系統: Windows 10
- 版本: v1.0.0
```

**功能請求模板**:
```markdown
## 功能描述
描述想要的功能

## 使用場景
說明為什麼需要這個功能

## 建議實現
如果有想法，描述如何實現
```

### 2. 提交 Pull Request

**PR 模板**:
```markdown
## 變更描述
描述這個 PR 做了什麼

## 變更類型
- [ ] Bug 修復
- [ ] 新功能
- [ ] 文檔更新
- [ ] 性能優化
- [ ] 重構

## 測試
- [ ] 添加了新測試
- [ ] 所有測試通過
- [ ] 手動測試通過

## 檢查清單
- [ ] 代碼遵循項目規範
- [ ] 添加了適當的註釋
- [ ] 更新了相關文檔
```

---

## 結語

這個開發者指南涵蓋了 Bingo 遊戲模擬器開發的主要方面。隨著專案的發展，請保持文檔的更新。

如果有任何問題或建議，請：
1. 查看現有的 Issues 和 Discussions
2. 提交新的 Issue 或 Discussion
3. 聯繫維護者

**快樂編程！** 🚀