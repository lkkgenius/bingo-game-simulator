/**
 * LineDetector - 負責檢測Bingo遊戲中的連線
 * 支援水平線、垂直線和對角線的檢測
 */
class LineDetector {
  constructor() {
    this.BOARD_SIZE = 5;
    this.LINE_TYPES = {
      HORIZONTAL: 'horizontal',
      VERTICAL: 'vertical',
      DIAGONAL_MAIN: 'diagonal-main',
      DIAGONAL_ANTI: 'diagonal-anti'
    };
    this.CELL_STATES = {
      EMPTY: 0,
      PLAYER: 1,
      COMPUTER: 2
    };
  }

  /**
   * 檢測水平線
   * @param {number[][]} board - 5x5遊戲板
   * @returns {Array} 完成的水平線陣列
   */
  checkHorizontalLines(board) {
    const lines = [];
    
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      // 檢查這一行是否所有格子都被填滿（非空白）
      if (board[row].every(cell => cell !== this.CELL_STATES.EMPTY)) {
        const cells = [];
        for (let col = 0; col < this.BOARD_SIZE; col++) {
          cells.push([row, col]);
        }
        
        lines.push({
          type: this.LINE_TYPES.HORIZONTAL,
          row: row,
          cells: cells,
          values: [...board[row]]
        });
      }
    }
    
    return lines;
  }

  /**
   * 檢測垂直線
   * @param {number[][]} board - 5x5遊戲板
   * @returns {Array} 完成的垂直線陣列
   */
  checkVerticalLines(board) {
    const lines = [];
    
    for (let col = 0; col < this.BOARD_SIZE; col++) {
      // 提取這一列的所有值
      const column = [];
      const cells = [];
      
      for (let row = 0; row < this.BOARD_SIZE; row++) {
        column.push(board[row][col]);
        cells.push([row, col]);
      }
      
      // 檢查這一列是否所有格子都被填滿（非空白）
      if (column.every(cell => cell !== this.CELL_STATES.EMPTY)) {
        lines.push({
          type: this.LINE_TYPES.VERTICAL,
          col: col,
          cells: cells,
          values: column
        });
      }
    }
    
    return lines;
  }

  /**
   * 檢測對角線
   * @param {number[][]} board - 5x5遊戲板
   * @returns {Array} 完成的對角線陣列
   */
  checkDiagonalLines(board) {
    const lines = [];
    
    // 檢測主對角線（左上到右下）
    const mainDiagonal = [];
    const mainDiagonalCells = [];
    
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      mainDiagonal.push(board[i][i]);
      mainDiagonalCells.push([i, i]);
    }
    
    if (mainDiagonal.every(cell => cell !== this.CELL_STATES.EMPTY)) {
      lines.push({
        type: this.LINE_TYPES.DIAGONAL_MAIN,
        cells: mainDiagonalCells,
        values: mainDiagonal
      });
    }
    
    // 檢測反對角線（右上到左下）
    const antiDiagonal = [];
    const antiDiagonalCells = [];
    
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      antiDiagonal.push(board[i][this.BOARD_SIZE - 1 - i]);
      antiDiagonalCells.push([i, this.BOARD_SIZE - 1 - i]);
    }
    
    if (antiDiagonal.every(cell => cell !== this.CELL_STATES.EMPTY)) {
      lines.push({
        type: this.LINE_TYPES.DIAGONAL_ANTI,
        cells: antiDiagonalCells,
        values: antiDiagonal
      });
    }
    
    return lines;
  }

  /**
   * 檢測所有類型的連線
   * @param {number[][]} board - 5x5遊戲板
   * @returns {Array} 所有完成的連線陣列
   */
  getAllLines(board) {
    const allLines = [];
    
    // 合併所有類型的連線
    allLines.push(...this.checkHorizontalLines(board));
    allLines.push(...this.checkVerticalLines(board));
    allLines.push(...this.checkDiagonalLines(board));
    
    return allLines;
  }

  /**
   * 計算完成的連線數量
   * @param {number[][]} board - 5x5遊戲板
   * @returns {number} 完成的連線總數
   */
  countCompletedLines(board) {
    return this.getAllLines(board).length;
  }

  /**
   * 驗證遊戲板格式是否正確
   * @param {number[][]} board - 遊戲板
   * @returns {boolean} 是否為有效的遊戲板
   */
  isValidBoard(board) {
    if (!Array.isArray(board) || board.length !== this.BOARD_SIZE) {
      return false;
    }
    
    for (let row of board) {
      if (!Array.isArray(row) || row.length !== this.BOARD_SIZE) {
        return false;
      }
      
      for (let cell of row) {
        if (![this.CELL_STATES.EMPTY, this.CELL_STATES.PLAYER, this.CELL_STATES.COMPUTER].includes(cell)) {
          return false;
        }
      }
    }
    
    return true;
  }
}

// 如果在Node.js環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LineDetector;
}