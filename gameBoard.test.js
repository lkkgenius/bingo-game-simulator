/**
 * GameBoard 單元測試
 */

// 模擬 DOM 環境
global.document = {
  createElement: () => ({
    className: '',
    dataset: {},
    style: {},
    classList: {
      add: function(cls) { 
        this.contains = (c) => c === cls || (this._classes && this._classes.includes(c));
        if (!this._classes) this._classes = [];
        this._classes.push(cls);
      },
      remove: function(cls) { 
        if (this._classes) {
          this._classes = this._classes.filter(c => c !== cls);
        }
      },
      toggle: function(cls, force) {
        if (force === undefined) {
          force = !this.contains(cls);
        }
        if (force) {
          this.add(cls);
        } else {
          this.remove(cls);
        }
      },
      contains: function(cls) { 
        return this._classes && this._classes.includes(cls);
      }
    },
    setAttribute: () => {},
    getAttribute: () => '',
    removeAttribute: () => {},
    appendChild: () => {},
    animate: () => ({ onfinish: null }),
    querySelector: () => null
  }),
  getElementById: () => ({
    innerHTML: '',
    appendChild: () => {},
    classList: {
      toggle: () => {}
    },
    addEventListener: (event, handler) => {}
  })
};

const GameBoard = require('./gameBoard.js');

describe('GameBoard', () => {
  let gameBoard;
  
  // 在每個測試前初始化
  beforeEach = () => {
    gameBoard = new GameBoard('game-board');
  };
  
  // 初始化
  beforeEach();
  
  test('should initialize with correct size', () => {
    expect(gameBoard.size).toBe(5);
  });
  
  test('should update cell state', () => {
    // 模擬更新格子狀態
    gameBoard.updateCell(2, 2, 1); // 玩家選擇
    
    // 檢查內部狀態
    const cell = gameBoard.getCell(2, 2);
    expect(cell.classList.contains('player')).toBeTruthy();
    expect(cell.classList.contains('empty')).toBeFalsy();
  });
  
  test('should highlight suggestion', () => {
    // 模擬高亮建議
    gameBoard.highlightSuggestion(3, 3);
    
    // 檢查內部狀態
    const cell = gameBoard.getCell(3, 3);
    expect(cell.classList.contains('suggested')).toBeTruthy();
    
    // 檢查當前建議
    const suggestion = gameBoard.getCurrentSuggestion();
    expect(suggestion).toBeTruthy();
    expect(suggestion.row).toBe(3);
    expect(suggestion.col).toBe(3);
  });
  
  test('should clear suggestion highlight', () => {
    // 先設置建議
    gameBoard.highlightSuggestion(3, 3);
    
    // 清除建議
    gameBoard.clearSuggestionHighlight();
    
    // 檢查內部狀態
    const cell = gameBoard.getCell(3, 3);
    expect(cell.classList.contains('suggested')).toBeFalsy();
    
    // 檢查當前建議
    const suggestion = gameBoard.getCurrentSuggestion();
    expect(suggestion).toBe(null);
  });
  
  test('should highlight completed lines', () => {
    const lines = [
      { 
        type: 'horizontal', 
        row: 0, 
        cells: [[0,0], [0,1], [0,2], [0,3], [0,4]] 
      }
    ];
    
    gameBoard.highlightLines(lines);
    
    // 檢查內部狀態
    const cell = gameBoard.getCell(0, 0);
    expect(cell.classList.contains('line-completed')).toBeTruthy();
    expect(cell.classList.contains('horizontal-line')).toBeTruthy();
    
    // 檢查高亮的連線
    const highlightedLines = gameBoard.getHighlightedLines();
    expect(highlightedLines.length).toBe(1);
  });
  
  test('should clear line highlights', () => {
    // 先設置連線高亮
    const lines = [
      { 
        type: 'horizontal', 
        row: 0, 
        cells: [[0,0], [0,1], [0,2], [0,3], [0,4]] 
      }
    ];
    
    gameBoard.highlightLines(lines);
    
    // 清除連線高亮
    gameBoard.clearLineHighlights();
    
    // 檢查內部狀態
    const cell = gameBoard.getCell(0, 0);
    expect(cell.classList.contains('line-completed')).toBeFalsy();
    
    // 檢查高亮的連線
    const highlightedLines = gameBoard.getHighlightedLines();
    expect(highlightedLines.length).toBe(0);
  });
  
  test('should reset game board', () => {
    // 先設置一些狀態
    gameBoard.updateCell(0, 0, 1); // 玩家
    gameBoard.updateCell(1, 1, 2); // 電腦
    gameBoard.highlightSuggestion(2, 2);
    
    // 重置遊戲板
    gameBoard.reset();
    
    // 檢查格子狀態
    const cell1 = gameBoard.getCell(0, 0);
    expect(cell1.classList.contains('empty')).toBeTruthy();
    expect(cell1.classList.contains('player')).toBeFalsy();
    
    const cell2 = gameBoard.getCell(1, 1);
    expect(cell2.classList.contains('empty')).toBeTruthy();
    expect(cell2.classList.contains('computer')).toBeFalsy();
    
    // 檢查建議
    const suggestion = gameBoard.getCurrentSuggestion();
    expect(suggestion).toBe(null);
  });
  
  test('should validate board format', () => {
    // 有效的遊戲板
    const validBoard = Array(5).fill().map(() => Array(5).fill(0));
    expect(gameBoard.isValidBoard(validBoard)).toBeTruthy();
    
    // 無效的遊戲板 - 錯誤的尺寸
    const invalidSizeBoard = Array(4).fill().map(() => Array(5).fill(0));
    expect(gameBoard.isValidBoard(invalidSizeBoard)).toBeFalsy();
    
    // 無效的遊戲板 - 錯誤的值
    const invalidValueBoard = Array(5).fill().map(() => Array(5).fill(0));
    invalidValueBoard[0][0] = 3; // 無效的值
    expect(gameBoard.isValidBoard(invalidValueBoard)).toBeFalsy();
  });
  
  test('should handle click events', () => {
    let clickedRow = -1;
    let clickedCol = -1;
    
    // 設置點擊處理器
    gameBoard.setClickHandler((row, col) => {
      clickedRow = row;
      clickedCol = col;
    });
    
    // 模擬點擊事件
    const event = {
      target: {
        closest: () => {
          const cell = document.createElement();
          cell.dataset.row = '2';
          cell.dataset.col = '3';
          cell.classList.add('empty');
          return cell;
        }
      }
    };
    
    gameBoard.handleCellClick(event);
    
    // 檢查點擊處理器是否被調用
    expect(clickedRow).toBe(2);
    expect(clickedCol).toBe(3);
  });
  
  test('should validate position', () => {
    expect(gameBoard.isValidPosition(0, 0)).toBeTruthy();
    expect(gameBoard.isValidPosition(4, 4)).toBeTruthy();
    expect(gameBoard.isValidPosition(-1, 0)).toBeFalsy();
    expect(gameBoard.isValidPosition(0, -1)).toBeFalsy();
    expect(gameBoard.isValidPosition(5, 0)).toBeFalsy();
    expect(gameBoard.isValidPosition(0, 5)).toBeFalsy();
  });
});