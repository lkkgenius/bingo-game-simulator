/**
 * EnhancedProbabilityCalculator - 增強版機率計算器
 * 專注於最大化完成三條連線的機會，使用交叉點優先策略和接近完成的線優先處理
 */
class EnhancedProbabilityCalculator {
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
    
    // 增強版權重設定 - 更注重多線完成和戰略位置
    this.WEIGHTS = {
      COMPLETE_LINE: 120,      // 完成一條線的價值（比標準版高）
      COOPERATIVE_LINE: 70,    // 幫助完成混合連線的價值（比標準版高）
      POTENTIAL_LINE: 15,      // 潛在連線的價值（比標準版高）
      CENTER_BONUS: 8,         // 中心位置的額外價值（比標準版高）
      INTERSECTION_BONUS: 25,  // 交叉點獎勵（新增）
      NEAR_COMPLETE_BONUS: 40, // 接近完成的線獎勵（新增）
      MULTI_LINE_BONUS: 30     // 多線潛力獎勵（新增）
    };
    
    // 初始化緩存
    this._valueCache = new Map();
    this._lineCache = new Map();
    this._intersectionPointsCache = null;
  }
  /**
   * 計算特定移動的價值（增強版）
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

    // 使用緩存避免重複計算
    const cacheKey = `${row}-${col}-${this.getBoardHash(board)}`;
    if (this._valueCache.has(cacheKey)) {
      return this._valueCache.get(cacheKey);
    }
    
    let totalValue = 0;
    
    // 創建測試板，模擬玩家移動
    const testBoard = this.copyBoard(board);
    testBoard[row][col] = this.CELL_STATES.PLAYER;
    
    // 1. 計算完成線的價值
    totalValue += this.calculateCompletionValueEnhanced(testBoard, row, col);
    
    // 2. 計算接近完成的線的價值（增強版特性）
    totalValue += this.calculateNearCompletionValue(testBoard, row, col);
    
    // 3. 計算交叉點價值（增強版特性）
    totalValue += this.calculateIntersectionValue(row, col);
    
    // 4. 計算多線潛力價值（增強版特性）
    totalValue += this.calculateMultiLinePotentialValue(testBoard, row, col);
    
    // 5. 計算阻止電腦的價值
    totalValue += this.calculateBlockingValue(board, row, col);
    
    // 6. 計算潛在連線價值
    totalValue += this.calculatePotentialValue(testBoard, row, col);
    
    // 7. 中心位置獎勵
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
   * 增強版完成線價值計算
   * @param {number[][]} testBoard - 測試用的遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 完成線的價值
   */
  calculateCompletionValueEnhanced(testBoard, row, col) {
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
   * 計算接近完成的線的價值（增強版特性）
   * @param {number[][]} testBoard - 測試用的遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 接近完成線的價值
   */
  calculateNearCompletionValue(testBoard, row, col) {
    let value = 0;
    
    // 檢查與此位置相關的所有線
    const relevantLines = this.getRelevantLines(row, col);
    
    for (const lineType of relevantLines) {
      const lineCells = this.getLineCells(row, col, lineType);
      const filledCount = this.countFilledCells(testBoard, lineCells);
      
      // 如果線上已經有4個格子被填滿（只差一個就能完成）
      if (filledCount === 4) {
        value += this.WEIGHTS.NEAR_COMPLETE_BONUS;
      }
      // 如果線上已經有3個格子被填滿（差兩個就能完成）
      else if (filledCount === 3) {
        value += this.WEIGHTS.NEAR_COMPLETE_BONUS * 0.6;
      }
    }
    
    return value;
  }
  
  /**
   * 計算交叉點價值（增強版特性）
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @returns {number} 交叉點價值
   */
  calculateIntersectionValue(row, col) {
    // 獲取所有交叉點
    const intersectionPoints = this.getIntersectionPoints();
    
    // 檢查當前位置是否為交叉點
    for (const point of intersectionPoints) {
      if (point.row === row && point.col === col) {
        // 根據交叉的線數量給予不同獎勵
        return this.WEIGHTS.INTERSECTION_BONUS * point.lineCount;
      }
    }
    
    return 0;
  }

  /**
   * 計算多線潛力價值（增強版特性）
   * @param {number[][]} testBoard - 測試用的遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 多線潛力價值
   */
  calculateMultiLinePotentialValue(testBoard, row, col) {
    // 計算此位置能影響多少條潛在線
    const relevantLines = this.getRelevantLines(row, col);
    let potentialLinesCount = 0;
    
    for (const lineType of relevantLines) {
      const lineCells = this.getLineCells(row, col, lineType);
      const emptyCount = this.countEmptyCells(testBoard, lineCells);
      const filledCount = this.countFilledCells(testBoard, lineCells);
      
      // 如果線上有空格且已有一些格子被填滿，則有潛力
      if (emptyCount > 0 && filledCount > 0) {
        potentialLinesCount++;
      }
    }
    
    // 如果能影響多條線，給予額外獎勵
    if (potentialLinesCount > 1) {
      return this.WEIGHTS.MULTI_LINE_BONUS * (potentialLinesCount - 1);
    }
    
    return 0;
  }
  
  /**
   * 獲取遊戲板的交叉點
   * @returns {Array} 交叉點陣列
   */
  getIntersectionPoints() {
    // 使用緩存避免重複計算
    if (this._intersectionPointsCache) {
      return this._intersectionPointsCache;
    }
    
    const intersectionPoints = [];
    
    // 水平線和垂直線的交叉點（所有格子）
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        let lineCount = 2; // 默認每個點都是水平線和垂直線的交叉
        
        // 檢查是否也在主對角線上
        if (row === col) {
          lineCount++;
        }
        
        // 檢查是否也在反對角線上
        if (row + col === this.BOARD_SIZE - 1) {
          lineCount++;
        }
        
        // 只有交叉2條以上線的點才算作交叉點
        if (lineCount > 2) {
          intersectionPoints.push({ row, col, lineCount });
        }
      }
    }
    
    // 緩存結果
    this._intersectionPointsCache = intersectionPoints;
    
    return intersectionPoints;
  }

  /**
   * 計算阻止電腦的價值
   * @param {number[][]} board - 當前遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 阻止價值
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
    let computerCells = 0;
    
    for (const [r, c] of cells) {
      const cellValue = board[r][c];
      if (cellValue === this.CELL_STATES.EMPTY) {
        emptyCells++;
      } else {
        filledCells++;
        if (cellValue === this.CELL_STATES.COMPUTER) {
          computerCells++;
        }
      }
    }
    
    // 如果這條線已經有一些格子被填滿，且還有空格子，則有合作潛力
    if (filledCells > 0 && emptyCells > 0) {
      // 增強版：更重視有電腦棋子的線
      const computerBonus = computerCells > 0 ? 1.5 : 1;
      
      // 根據已填滿的格子數量給予不同的價值
      if (filledCells === 4) {
        // 只差一個格子就能完成連線，給予最高價值
        return this.WEIGHTS.COOPERATIVE_LINE * 2 * computerBonus;
      } else if (filledCells >= 2) {
        // 已經有2-3個格子被填滿，給予中等價值
        return this.WEIGHTS.COOPERATIVE_LINE * computerBonus;
      } else {
        // 只有1個格子被填滿，給予較低價值
        return this.WEIGHTS.COOPERATIVE_LINE * 0.5 * computerBonus;
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
    const lineCells = this.getLineCells(row, col, lineType);
    
    // 檢查線上的所有格子是否都被填滿（非空白）
    for (const [r, c] of lineCells) {
      if (board[r][c] === this.CELL_STATES.EMPTY) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 計算潛在連線數量
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @returns {number} 潛在連線數量
   */
  countPotentialLines(board, row, col) {
    let count = 0;
    
    // 檢查水平線的潛力
    count += this.evaluateLinePotential(board, row, col, 'horizontal');
    
    // 檢查垂直線的潛力
    count += this.evaluateLinePotential(board, row, col, 'vertical');
    
    // 檢查對角線的潛力
    if (row === col) {
      count += this.evaluateLinePotential(board, row, col, 'diagonal-main');
    }
    
    if (row + col === this.BOARD_SIZE - 1) {
      count += this.evaluateLinePotential(board, row, col, 'diagonal-anti');
    }
    
    return count;
  }
  
  /**
   * 評估線的潛力（增強版）
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @param {string} lineType - 線類型
   * @returns {number} 線的潛力分數
   */
  evaluateLinePotential(board, row, col, lineType) {
    const lineCells = this.getLineCells(row, col, lineType);
    let filledCells = 0;
    let emptyCells = 0;
    let computerCells = 0;
    
    for (const [r, c] of lineCells) {
      const cellValue = board[r][c];
      if (cellValue === this.CELL_STATES.EMPTY) {
        emptyCells++;
      } else {
        filledCells++;
        if (cellValue === this.CELL_STATES.COMPUTER) {
          computerCells++;
        }
      }
    }
    
    // 在合作模式下，任何已填滿的格子（無論是玩家還是電腦）都有助於完成連線
    // 增強版：更重視有電腦棋子的線
    if (emptyCells > 0) {
      // 已填滿的格子越多，潛力越大
      const computerBonus = computerCells > 0 ? 1.3 : 1;
      return (filledCells + 1) * computerBonus;
    }
    
    return 0;
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
   * 獲取線上的所有格子座標
   * @param {number} row - 參考行
   * @param {number} col - 參考列
   * @param {string} lineType - 線類型
   * @returns {Array} 格子座標陣列
   */
  getLineCells(row, col, lineType) {
    // 使用緩存避免重複計算
    const cacheKey = `${lineType}-${row}-${col}`;
    if (this._lineCache.has(cacheKey)) {
      return this._lineCache.get(cacheKey);
    }
    
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
    
    // 緩存結果
    this._lineCache.set(cacheKey, cells);
    
    return cells;
  }

  /**
   * 計算線上已填滿的格子數量
   * @param {number[][]} board - 遊戲板
   * @param {Array} cells - 格子座標陣列
   * @returns {number} 已填滿的格子數量
   */
  countFilledCells(board, cells) {
    let count = 0;
    for (const [row, col] of cells) {
      if (board[row][col] !== this.CELL_STATES.EMPTY) {
        count++;
      }
    }
    return count;
  }

  /**
   * 計算線上空白格子數量
   * @param {number[][]} board - 遊戲板
   * @param {Array} cells - 格子座標陣列
   * @returns {number} 空白格子數量
   */
  countEmptyCells(board, cells) {
    let count = 0;
    for (const [row, col] of cells) {
      if (board[row][col] === this.CELL_STATES.EMPTY) {
        count++;
      }
    }
    return count;
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
   * 獲取遊戲板的簡單哈希值（用於緩存）
   * @param {number[][]} board - 遊戲板
   * @returns {string} 哈希值
   */
  getBoardHash(board) {
    return board.flat().join('');
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

  /**
   * 清除緩存
   */
  clearCache() {
    this._valueCache.clear();
    this._lineCache.clear();
    this._intersectionPointsCache = null;
  }
}

// 如果在Node.js環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedProbabilityCalculator;
}