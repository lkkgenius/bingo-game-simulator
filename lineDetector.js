/**
 * LineDetector - Bingo 遊戲連線檢測器
 *
 * 這個類別專門負責檢測遊戲板上的完成連線，支援：
 * - 水平線檢測（5 個連續的水平格子）
 * - 垂直線檢測（5 個連續的垂直格子）
 * - 主對角線檢測（左上到右下）
 * - 反對角線檢測（右上到左下）
 *
 * 演算法特點：
 * - 使用高效的線性掃描算法
 * - 支持混合連線（玩家和電腦合作完成）
 * - 提供詳細的連線信息（類型、位置、參與者）
 * - 優化的性能，避免重複計算
 *
 * 連線規則：
 * - 一條完整連線需要 5 個格子都被填滿（非空）
 * - 支持玩家和電腦的混合連線（合作模式）
 * - 每種類型最多可以有多條連線
 *
 * @class LineDetector
 * @version 1.0.0
 */
class LineDetector {
  /**
   * 創建連線檢測器實例
   * 初始化檢測所需的常數和配置
   */
  constructor() {
    // 遊戲板配置
    this.BOARD_SIZE = 5; // 標準 Bingo 遊戲板大小

    // 連線類型定義
    this.LINE_TYPES = {
      HORIZONTAL: 'horizontal', // 水平連線
      VERTICAL: 'vertical', // 垂直連線
      DIAGONAL_MAIN: 'diagonal-main', // 主對角線（\）
      DIAGONAL_ANTI: 'diagonal-anti' // 反對角線（/）
    };

    // 格子狀態定義（與其他組件保持一致）
    this.CELL_STATES = {
      EMPTY: 0, // 空格子
      PLAYER: 1, // 玩家選擇
      COMPUTER: 2 // 電腦選擇
    };
  }

  /**
   * 檢測水平連線
   *
   * 掃描每一行，檢查是否有完整的水平連線。
   * 一條水平連線需要該行的所有 5 個格子都被填滿（非空）。
   *
   * 演算法複雜度：O(n²) 其中 n 是遊戲板大小
   *
   * @param {number[][]} board - 5x5 遊戲板二維陣列
   * @returns {Array<Object>} 完成的水平連線陣列，每個對象包含：
   *   - type: 連線類型 ('horizontal')
   *   - row: 連線所在的行號
   *   - cells: 連線包含的格子座標陣列 [[row, col], ...]
   *   - values: 連線中每個格子的值陣列
   */
  checkHorizontalLines(board) {
    const lines = [];

    // 逐行檢查水平連線
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      // 檢查這一行是否所有格子都被填滿（非空白）
      // 使用 Array.every() 方法進行高效檢查
      if (board[row].every(cell => cell !== this.CELL_STATES.EMPTY)) {
        // 收集這條連線中所有格子的座標
        const cells = [];
        for (let col = 0; col < this.BOARD_SIZE; col++) {
          cells.push([row, col]);
        }

        // 創建連線對象，包含完整的連線信息
        lines.push({
          type: this.LINE_TYPES.HORIZONTAL, // 連線類型
          row: row, // 連線所在行
          cells: cells, // 格子座標陣列
          values: [...board[row]] // 格子值的副本
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
        if (
          ![
            this.CELL_STATES.EMPTY,
            this.CELL_STATES.PLAYER,
            this.CELL_STATES.COMPUTER
          ].includes(cell)
        ) {
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

// 在瀏覽器環境中，將 LineDetector 添加到全局作用域
if (typeof window !== 'undefined') {
  window.LineDetector = LineDetector;
}
