/**
 * ProbabilityCalculator - 負責計算移動價值和提供最佳移動建議
 * 分析遊戲板狀態，計算每個可能移動的價值，並建議最佳選擇
 */
class ProbabilityCalculator {
  constructor() {
    this.BOARD_SIZE = 5;
    this.CELL_STATES = {
      EMPTY: 0,
      PLAYER: 1,
      COMPUTER: 2
    };
    this.LINE_TYPES = {
      HORIZONTAL: 'horizontal',
      VERTICAL: 'vertical',
      DIAGONAL_MAIN: 'diagonal-main',
      DIAGONAL_ANTI: 'diagonal-anti'
    };
    
    // 權重設定
    this.WEIGHTS = {
      COMPLETE_LINE: 100,      // 完成一條線的價值
      COOPERATIVE_LINE: 50,    // 幫助完成混合連線的價值
      POTENTIAL_LINE: 10,      // 潛在連線的價值
      CENTER_BONUS: 5          // 中心位置的額外價值
    };
  }

  /**
   * 計算特定移動的價值（優化版本）
   * @param {number[][]} board - 當前遊戲板狀態
   * @param {number} row - 移動的行位置
   * @param {number} col - 移動的列位置
   * @returns {number} 移動的價值分數
   */
  calculateMoveValue(board, row, col) {
    // 快速驗證
    if (row < 0 || row >= this.BOARD_SIZE || col < 0 || col >= this.BOARD_SIZE || 
        board[row][col] !== this.CELL_STATES.EMPTY) {
      return -1;
    }

    let totalValue = 0;
    
    // 使用緩存避免重複計算
    const cacheKey = `${row}-${col}-${this.getBoardHash(board)}`;
    if (this._valueCache && this._valueCache.has(cacheKey)) {
      return this._valueCache.get(cacheKey);
    }
    
    // 初始化緩存
    if (!this._valueCache) {
      this._valueCache = new Map();
    }
    
    // 創建測試板，模擬玩家移動（優化：只在需要時創建）
    const testBoard = this.copyBoard(board);
    testBoard[row][col] = this.CELL_STATES.PLAYER;
    
    // 計算完成線的價值（優化：並行計算）
    totalValue += this.calculateCompletionValueOptimized(testBoard, row, col);
    
    // 計算阻止電腦的價值
    totalValue += this.calculateBlockingValue(board, row, col);
    
    // 計算潛在連線價值
    totalValue += this.calculatePotentialValue(testBoard, row, col);
    
    // 中心位置獎勵
    if (this.isCenterPosition(row, col)) {
      totalValue += this.WEIGHTS.CENTER_BONUS;
    }
    
    // 緩存結果
    this._valueCache.set(cacheKey, totalValue);
    
    // 限制緩存大小
    if (this._valueCache.size > 100) {
      const firstKey = this._valueCache.keys().next().value;
      this._valueCache.delete(firstKey);
    }
    
    return totalValue;
  }

  /**
   * 獲取遊戲板的簡單哈希值（用於緩存）
   * @param {number[][]} board - 遊戲板
   * @returns {string} 哈希值
   */
  getBoardHash(board) {
    return board.flat().join('');
  }

  /**
   * 優化的完成線價值計算
   * @param {number[][]} testBoard - 測試用的遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 完成線的價值
   */
  calculateCompletionValueOptimized(testBoard, row, col) {
    let value = 0;
    
    // 只檢查與當前位置相關的線
    const linesToCheck = this.getRelevantLines(row, col);
    
    for (const lineType of linesToCheck) {
      if (this.checkLineCompletion(testBoard, row, col, lineType)) {
        value += this.WEIGHTS.COMPLETE_LINE;
      }
    }
    
    return value;
  }

  /**
   * 獲取與特定位置相關的線類型
   * @param {number} row - 行位置
   * @param {number} col - 列位置
   * @returns {Array} 相關的線類型
   */
  getRelevantLines(row, col) {
    const lines = ['horizontal', 'vertical'];
    
    // 只有在對角線上的位置才檢查對角線
    if (row === col) {
      lines.push('diagonal-main');
    }
    
    if (row + col === this.BOARD_SIZE - 1) {
      lines.push('diagonal-anti');
    }
    
    return lines;
  }

  /**
   * 計算完成線的價值
   * @param {number[][]} testBoard - 測試用的遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 完成線的價值
   */
  calculateCompletionValue(testBoard, row, col) {
    let value = 0;
    
    // 檢查水平線
    if (this.checkLineCompletion(testBoard, row, col, 'horizontal')) {
      value += this.WEIGHTS.COMPLETE_LINE;
    }
    
    // 檢查垂直線
    if (this.checkLineCompletion(testBoard, row, col, 'vertical')) {
      value += this.WEIGHTS.COMPLETE_LINE;
    }
    
    // 檢查主對角線
    if (row === col && this.checkLineCompletion(testBoard, row, col, 'diagonal-main')) {
      value += this.WEIGHTS.COMPLETE_LINE;
    }
    
    // 檢查反對角線
    if (row + col === this.BOARD_SIZE - 1 && this.checkLineCompletion(testBoard, row, col, 'diagonal-anti')) {
      value += this.WEIGHTS.COMPLETE_LINE;
    }
    
    return value;
  }

  /**
   * 計算協作價值（幫助完成混合連線的價值）
   * @param {number[][]} board - 當前遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 協作價值
   */
  calculateBlockingValue(board, row, col) {
    let value = 0;
    
    // 檢查這個位置是否能幫助完成混合連線（玩家+電腦）
    value += this.calculateMixedLineValue(board, row, col);
    
    return value;
  }

  /**
   * 計算混合連線的價值（玩家+電腦合作完成連線）
   * @param {number[][]} board - 當前遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 混合連線價值
   */
  calculateMixedLineValue(board, row, col) {
    let value = 0;
    
    // 檢查水平線的混合潛力
    value += this.evaluateMixedLinePotential(board, row, col, 'horizontal');
    
    // 檢查垂直線的混合潛力
    value += this.evaluateMixedLinePotential(board, row, col, 'vertical');
    
    // 檢查對角線的混合潛力
    if (row === col) {
      value += this.evaluateMixedLinePotential(board, row, col, 'diagonal-main');
    }
    
    if (row + col === this.BOARD_SIZE - 1) {
      value += this.evaluateMixedLinePotential(board, row, col, 'diagonal-anti');
    }
    
    return value;
  }

  /**
   * 評估混合連線的潛力（玩家+電腦合作）
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @param {string} lineType - 線類型
   * @returns {number} 混合連線潛力分數
   */
  evaluateMixedLinePotential(board, row, col, lineType) {
    const cells = this.getLineCells(row, col, lineType);
    let filledCells = 0;
    let emptyCells = 0;
    
    for (const [r, c] of cells) {
      const cellValue = board[r][c];
      if (cellValue !== this.CELL_STATES.EMPTY) {
        filledCells++;
      } else {
        emptyCells++;
      }
    }
    
    // 如果這條線已經有一些格子被填滿，且還有空格子，則有合作潛力
    if (filledCells > 0 && emptyCells > 0) {
      // 根據已填滿的格子數量給予不同的價值
      if (filledCells === 4) {
        // 只差一個格子就能完成連線，給予最高價值
        return this.WEIGHTS.COOPERATIVE_LINE * 2;
      } else if (filledCells >= 2) {
        // 已經有2-3個格子被填滿，給予中等價值
        return this.WEIGHTS.COOPERATIVE_LINE;
      } else {
        // 只有1個格子被填滿，給予較低價值
        return this.WEIGHTS.COOPERATIVE_LINE * 0.5;
      }
    }
    
    return 0;
  }

  /**
   * 計算潛在連線價值
   * @param {number[][]} testBoard - 測試用遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 潛在價值
   */
  calculatePotentialValue(testBoard, row, col) {
    let value = 0;
    
    // 檢查這個移動能增加多少潛在連線機會
    value += this.countPotentialLines(testBoard, row, col, this.CELL_STATES.PLAYER) * this.WEIGHTS.POTENTIAL_LINE;
    
    return value;
  }

  /**
   * 檢查線是否完成
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @param {string} lineType - 線的類型
   * @returns {boolean} 是否完成線
   */
  checkLineCompletion(board, row, col, lineType) {
    switch (lineType) {
      case 'horizontal':
        return board[row].every(cell => cell !== this.CELL_STATES.EMPTY);
      
      case 'vertical':
        for (let r = 0; r < this.BOARD_SIZE; r++) {
          if (board[r][col] === this.CELL_STATES.EMPTY) {
            return false;
          }
        }
        return true;
      
      case 'diagonal-main':
        for (let i = 0; i < this.BOARD_SIZE; i++) {
          if (board[i][i] === this.CELL_STATES.EMPTY) {
            return false;
          }
        }
        return true;
      
      case 'diagonal-anti':
        for (let i = 0; i < this.BOARD_SIZE; i++) {
          if (board[i][this.BOARD_SIZE - 1 - i] === this.CELL_STATES.EMPTY) {
            return false;
          }
        }
        return true;
      
      default:
        return false;
    }
  }

  /**
   * 計算潛在完成數量
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @param {number} playerType - 玩家類型
   * @returns {number} 潛在完成數量
   */
  countPotentialCompletions(board, row, col, playerType) {
    let count = 0;
    
    // 檢查水平線
    if (this.checkLineCompletion(board, row, col, 'horizontal')) {
      count++;
    }
    
    // 檢查垂直線
    if (this.checkLineCompletion(board, row, col, 'vertical')) {
      count++;
    }
    
    // 檢查主對角線
    if (row === col && this.checkLineCompletion(board, row, col, 'diagonal-main')) {
      count++;
    }
    
    // 檢查反對角線
    if (row + col === this.BOARD_SIZE - 1 && this.checkLineCompletion(board, row, col, 'diagonal-anti')) {
      count++;
    }
    
    return count;
  }

  /**
   * 計算潛在連線數量
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @param {number} playerType - 玩家類型
   * @returns {number} 潛在連線數量
   */
  countPotentialLines(board, row, col, playerType) {
    let count = 0;
    
    // 檢查水平線的潛力
    count += this.evaluateLinePotential(board, row, col, 'horizontal', playerType);
    
    // 檢查垂直線的潛力
    count += this.evaluateLinePotential(board, row, col, 'vertical', playerType);
    
    // 檢查對角線的潛力
    if (row === col) {
      count += this.evaluateLinePotential(board, row, col, 'diagonal-main', playerType);
    }
    
    if (row + col === this.BOARD_SIZE - 1) {
      count += this.evaluateLinePotential(board, row, col, 'diagonal-anti', playerType);
    }
    
    return count;
  }

  /**
   * 評估線的潛力（合作模式）
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @param {string} lineType - 線類型
   * @param {number} playerType - 玩家類型
   * @returns {number} 線的潛力分數
   */
  evaluateLinePotential(board, row, col, lineType, playerType) {
    let filledCells = 0;
    let emptyCells = 0;
    
    const cells = this.getLineCells(row, col, lineType);
    
    for (const [r, c] of cells) {
      const cellValue = board[r][c];
      if (cellValue !== this.CELL_STATES.EMPTY) {
        filledCells++;
      } else {
        emptyCells++;
      }
    }
    
    // 在合作模式下，任何已填滿的格子（無論是玩家還是電腦）都有助於完成連線
    // 根據已填滿的格子數量和剩餘空格數量計算潛力
    if (emptyCells > 0) {
      // 已填滿的格子越多，潛力越大
      return filledCells + 1;
    }
    
    return 0;
  }

  /**
   * 獲取線上的所有格子座標
   * @param {number} row - 參考行
   * @param {number} col - 參考列
   * @param {string} lineType - 線類型
   * @returns {Array} 格子座標陣列
   */
  getLineCells(row, col, lineType) {
    const cells = [];
    
    switch (lineType) {
      case 'horizontal':
        for (let c = 0; c < this.BOARD_SIZE; c++) {
          cells.push([row, c]);
        }
        break;
      
      case 'vertical':
        for (let r = 0; r < this.BOARD_SIZE; r++) {
          cells.push([r, col]);
        }
        break;
      
      case 'diagonal-main':
        for (let i = 0; i < this.BOARD_SIZE; i++) {
          cells.push([i, i]);
        }
        break;
      
      case 'diagonal-anti':
        for (let i = 0; i < this.BOARD_SIZE; i++) {
          cells.push([i, this.BOARD_SIZE - 1 - i]);
        }
        break;
    }
    
    return cells;
  }

  /**
   * 模擬所有可能的移動
   * @param {number[][]} board - 當前遊戲板
   * @returns {Array} 所有可能移動及其價值的陣列
   */
  simulateAllPossibleMoves(board) {
    const moves = [];
    
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col] === this.CELL_STATES.EMPTY) {
          const value = this.calculateMoveValue(board, row, col);
          moves.push({
            row,
            col,
            value,
            position: `(${row}, ${col})`
          });
        }
      }
    }
    
    // 按價值排序（降序）
    moves.sort((a, b) => b.value - a.value);
    
    return moves;
  }

  /**
   * 獲取最佳移動建議
   * @param {number[][]} board - 當前遊戲板
   * @returns {Object|null} 最佳移動建議或null（如果沒有可用移動）
   */
  getBestSuggestion(board) {
    const allMoves = this.simulateAllPossibleMoves(board);
    
    if (allMoves.length === 0) {
      return null;
    }
    
    const bestMove = allMoves[0];
    
    return {
      row: bestMove.row,
      col: bestMove.col,
      value: bestMove.value,
      position: bestMove.position,
      confidence: this.calculateConfidence(allMoves),
      alternatives: allMoves.slice(1, 4) // 提供前3個替代選項
    };
  }

  /**
   * 計算建議的信心度
   * @param {Array} moves - 所有移動選項
   * @returns {string} 信心度等級
   */
  calculateConfidence(moves) {
    if (moves.length < 2) {
      return 'high';
    }
    
    const bestValue = moves[0].value;
    const secondBestValue = moves[1].value;
    const difference = bestValue - secondBestValue;
    
    if (difference >= this.WEIGHTS.COMPLETE_LINE) {
      return 'very-high';
    } else if (difference >= this.WEIGHTS.COOPERATIVE_LINE) {
      return 'high';
    } else if (difference >= this.WEIGHTS.POTENTIAL_LINE) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 檢查移動是否有效
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 行位置
   * @param {number} col - 列位置
   * @returns {boolean} 是否為有效移動
   */
  isValidMove(board, row, col) {
    return row >= 0 && row < this.BOARD_SIZE &&
           col >= 0 && col < this.BOARD_SIZE &&
           board[row][col] === this.CELL_STATES.EMPTY;
  }

  /**
   * 檢查是否為中心位置
   * @param {number} row - 行位置
   * @param {number} col - 列位置
   * @returns {boolean} 是否為中心位置
   */
  isCenterPosition(row, col) {
    const center = Math.floor(this.BOARD_SIZE / 2);
    return row === center && col === center;
  }

  /**
   * 複製遊戲板
   * @param {number[][]} board - 原始遊戲板
   * @returns {number[][]} 複製的遊戲板
   */
  copyBoard(board) {
    return board.map(row => [...row]);
  }

  /**
   * 獲取空格子列表
   * @param {number[][]} board - 遊戲板
   * @returns {Array} 空格子座標陣列
   */
  getEmptyCells(board) {
    const emptyCells = [];
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col] === this.CELL_STATES.EMPTY) {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells;
  }
}

// 如果在Node.js環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProbabilityCalculator;
}

// 在瀏覽器環境中，將 ProbabilityCalculator 添加到全局作用域
if (typeof window !== 'undefined') {
    window.ProbabilityCalculator = ProbabilityCalculator;
}