/**
 * LRU 緩存類實現
 * 使用 Map 實現 LRU (Least Recently Used) 緩存策略
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // 獲取值
    const value = this.cache.get(key);
    
    // 刪除舊位置
    this.cache.delete(key);
    
    // 放到最新位置
    this.cache.set(key, value);
    
    return value;
  }
  
  set(key, value) {
    // 如果已存在，先刪除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果達到容量上限，刪除最舊的項目
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    // 添加到最新位置
    this.cache.set(key, value);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  get size() {
    return this.cache.size;
  }
}

/**
 * EnhancedProbabilityCalculator - 增強版機率計算器
 * 專注於最大化完成三條連線的機會，使用交叉點優先策略和接近完成的線優先處理
 * 優化版本：實作更高效的緩存策略和延遲計算機制
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
    
    // 優化：使用 LRU 緩存策略
    this._valueCache = new LRUCache(200); // 增加緩存大小，提高命中率
    this._lineCache = new LRUCache(100);
    this._boardAnalysisCache = new LRUCache(50); // 新增：緩存整個棋盤的分析結果
    this._intersectionPointsCache = null;
    
    // 優化：預計算所有可能的線和交叉點
    this._allPossibleLines = this._precomputeAllLines();
    this._intersectionPoints = this._precomputeIntersectionPoints();
    
    // 性能監控
    this._performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      calculationTime: []
    };
    
    // 批處理相關
    this._batchQueue = [];
    this._isBatchProcessing = false;
    this._batchProcessDelay = 10; // 10ms 延遲，避免 UI 阻塞
  }
  
  /**
   * LRU 緩存實現
   * @private
   */
  _precomputeAllLines() {
    const lines = {
      horizontal: [],
      vertical: [],
      'diagonal-main': [],
      'diagonal-anti': []
    };
    
    // 預計算水平線
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      const cells = [];
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        cells.push([row, col]);
      }
      lines.horizontal.push(cells);
    }
    
    // 預計算垂直線
    for (let col = 0; col < this.BOARD_SIZE; col++) {
      const cells = [];
      for (let row = 0; row < this.BOARD_SIZE; row++) {
        cells.push([row, col]);
      }
      lines.vertical.push(cells);
    }
    
    // 預計算主對角線
    const mainDiagonal = [];
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      mainDiagonal.push([i, i]);
    }
    lines['diagonal-main'].push(mainDiagonal);
    
    // 預計算反對角線
    const antiDiagonal = [];
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      antiDiagonal.push([i, this.BOARD_SIZE - 1 - i]);
    }
    lines['diagonal-anti'].push(antiDiagonal);
    
    return lines;
  }
  
  /**
   * 預計算所有交叉點
   * @private
   */
  _precomputeIntersectionPoints() {
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
    
    return intersectionPoints;
  }
  /**
   * LRU 緩存實現
   */
  
  /**
   * 計算特定移動的價值（增強版 - 優化）
   * @param {number[][]} board - 當前遊戲板狀態
   * @param {number} row - 移動的行位置
   * @param {number} col - 移動的列位置
   * @returns {number} 移動的價值分數
   */
  calculateMoveValue(board, row, col) {
    const startTime = performance.now();
    
    // 快速驗證
    if (row < 0 || row >= this.BOARD_SIZE || col < 0 || col >= this.BOARD_SIZE || 
        board[row][col] !== this.CELL_STATES.EMPTY) {
      return -1;
    }

    // 使用緩存避免重複計算
    const cacheKey = `${row}-${col}-${this.getBoardHash(board)}`;
    const cachedValue = this._valueCache.get(cacheKey);
    
    if (cachedValue !== undefined) {
      this._performanceMetrics.cacheHits++;
      return cachedValue;
    }
    
    this._performanceMetrics.cacheMisses++;
    
    // 優化：檢查是否有整個棋盤的分析結果緩存
    const boardHash = this.getBoardHash(board);
    const boardAnalysis = this._boardAnalysisCache.get(boardHash);
    
    let totalValue;
    
    if (boardAnalysis && boardAnalysis.moves && boardAnalysis.moves[`${row}-${col}`]) {
      // 使用已緩存的棋盤分析結果
      totalValue = boardAnalysis.moves[`${row}-${col}`];
    } else {
      // 創建測試板，模擬玩家移動
      const testBoard = this.copyBoard(board);
      testBoard[row][col] = this.CELL_STATES.PLAYER;
      
      // 優化：使用延遲計算策略，只計算必要的值
      totalValue = 0;
      
      // 1. 計算完成線的價值 (高優先級)
      totalValue += this.calculateCompletionValueEnhanced(testBoard, row, col);
      
      // 如果這個移動可以直接完成線，其他計算可能不那麼重要
      const isHighValueMove = totalValue >= this.WEIGHTS.COMPLETE_LINE;
      
      // 2. 計算交叉點價值（快速計算，使用預計算結果）
      totalValue += this.calculateIntersectionValue(row, col);
      
      // 3. 計算接近完成的線的價值（中等優先級）
      totalValue += this.calculateNearCompletionValue(testBoard, row, col);
      
      // 如果不是高價值移動，進行更詳細的分析
      if (!isHighValueMove) {
        // 4. 計算多線潛力價值
        totalValue += this.calculateMultiLinePotentialValue(testBoard, row, col);
        
        // 5. 計算阻止電腦的價值
        totalValue += this.calculateBlockingValue(board, row, col);
        
        // 6. 計算潛在連線價值
        totalValue += this.calculatePotentialValue(testBoard, row, col);
      }
      
      // 7. 中心位置獎勵 (快速計算)
      if (this.isCenterPosition(row, col)) {
        totalValue += this.WEIGHTS.CENTER_BONUS;
      }
    }
    
    // 緩存結果
    this._valueCache.set(cacheKey, totalValue);
    
    // 記錄計算時間
    const endTime = performance.now();
    this._performanceMetrics.calculationTime.push(endTime - startTime);
    
    // 限制性能指標數組大小
    if (this._performanceMetrics.calculationTime.length > 100) {
      this._performanceMetrics.calculationTime.shift();
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
   * 計算接近完成的線的價值（增強版特性 - 優化）
   * @param {number[][]} testBoard - 測試用的遊戲板
   * @param {number} row - 移動位置行
   * @param {number} col - 移動位置列
   * @returns {number} 接近完成線的價值
   */
  calculateNearCompletionValue(testBoard, row, col) {
    // 使用緩存避免重複計算
    const cacheKey = `near-${row}-${col}-${this.getBoardHash(testBoard)}`;
    const cachedValue = this._lineCache.get(cacheKey);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    let value = 0;
    
    // 檢查與此位置相關的所有線
    const relevantLines = this.getRelevantLines(row, col);
    
    // 優化：預先計算每種線類型的填充計數
    const lineFillCounts = {};
    
    for (const lineType of relevantLines) {
      const lineCells = this.getLineCells(row, col, lineType);
      const filledCount = this.countFilledCells(testBoard, lineCells);
      lineFillCounts[lineType] = filledCount;
      
      // 如果線上已經有4個格子被填滿（只差一個就能完成）
      if (filledCount === 4) {
        value += this.WEIGHTS.NEAR_COMPLETE_BONUS;
      }
      // 如果線上已經有3個格子被填滿（差兩個就能完成）
      else if (filledCount === 3) {
        value += this.WEIGHTS.NEAR_COMPLETE_BONUS * 0.6;
      }
    }
    
    // 緩存結果
    this._lineCache.set(cacheKey, value);
    
    return value;
  }
  
  /**
   * 計算交叉點價值（增強版特性 - 優化）
   * @param {number} row - 位置行
   * @param {number} col - 位置列
   * @returns {number} 交叉點價值
   */
  calculateIntersectionValue(row, col) {
    // 優化：使用 O(1) 時間複雜度的查找
    // 檢查是否為主對角線上的點
    const isOnMainDiagonal = (row === col);
    
    // 檢查是否為反對角線上的點
    const isOnAntiDiagonal = (row + col === this.BOARD_SIZE - 1);
    
    // 如果同時在兩條對角線上，則為交叉點
    if (isOnMainDiagonal && isOnAntiDiagonal) {
      // 這是中心點，交叉4條線
      return this.WEIGHTS.INTERSECTION_BONUS * 4;
    } 
    // 如果在任一對角線上，則為交叉點
    else if (isOnMainDiagonal || isOnAntiDiagonal) {
      // 交叉3條線（1條對角線 + 水平線 + 垂直線）
      return this.WEIGHTS.INTERSECTION_BONUS * 3;
    }
    
    // 不是交叉點
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
    // 直接返回預計算的交叉點
    return this._intersectionPoints;
  }
  
  /**
   * 批處理計算多個移動的價值
   * 使用批處理和延遲計算減少 UI 阻塞
   * @param {number[][]} board - 當前遊戲板
   * @param {Array} moves - 要計算的移動列表 [{row, col}, ...]
   * @param {Function} callback - 完成後的回調函數
   */
  batchCalculateMoveValues(board, moves, callback) {
    // 如果已經在處理批處理，將請求加入隊列
    if (this._isBatchProcessing) {
      this._batchQueue.push({ board, moves, callback });
      return;
    }
    
    this._isBatchProcessing = true;
    const results = [];
    const totalMoves = moves.length;
    let processedMoves = 0;
    
    // 使用 requestAnimationFrame 或 setTimeout 分批處理
    const processBatch = (startIndex) => {
      const batchSize = 5; // 每批處理5個移動
      const endIndex = Math.min(startIndex + batchSize, totalMoves);
      
      for (let i = startIndex; i < endIndex; i++) {
        const { row, col } = moves[i];
        const value = this.calculateMoveValue(board, row, col);
        results.push({ row, col, value });
        processedMoves++;
      }
      
      // 如果還有未處理的移動，安排下一批
      if (processedMoves < totalMoves) {
        setTimeout(() => processBatch(endIndex), this._batchProcessDelay);
      } else {
        // 所有移動都已處理完成
        this._isBatchProcessing = false;
        callback(results);
        
        // 處理隊列中的下一個批處理請求
        if (this._batchQueue.length > 0) {
          const nextBatch = this._batchQueue.shift();
          this.batchCalculateMoveValues(nextBatch.board, nextBatch.moves, nextBatch.callback);
        }
      }
    };
    
    // 開始處理第一批
    processBatch(0);
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
   * 獲取線上的所有格子座標（優化版）
   * @param {number} row - 參考行
   * @param {number} col - 參考列
   * @param {string} lineType - 線類型
   * @returns {Array} 格子座標陣列
   */
  getLineCells(row, col, lineType) {
    // 使用預計算的線數據
    switch (lineType) {
      case 'horizontal':
        return this._allPossibleLines.horizontal[row];
      
      case 'vertical':
        return this._allPossibleLines.vertical[col];
      
      case 'diagonal-main':
        return this._allPossibleLines['diagonal-main'][0];
      
      case 'diagonal-anti':
        return this._allPossibleLines['diagonal-anti'][0];
      
      default:
        return [];
    }
  }
  
  /**
   * 獲取性能指標
   * @returns {Object} 性能指標數據
   */
  getPerformanceMetrics() {
    const totalCalculations = this._performanceMetrics.cacheHits + this._performanceMetrics.cacheMisses;
    const cacheHitRate = totalCalculations > 0 ? 
      (this._performanceMetrics.cacheHits / totalCalculations * 100).toFixed(2) : 0;
    
    const avgCalculationTime = this._performanceMetrics.calculationTime.length > 0 ?
      this._performanceMetrics.calculationTime.reduce((sum, time) => sum + time, 0) / 
      this._performanceMetrics.calculationTime.length : 0;
    
    return {
      cacheHitRate: `${cacheHitRate}%`,
      cacheHits: this._performanceMetrics.cacheHits,
      cacheMisses: this._performanceMetrics.cacheMisses,
      averageCalculationTime: `${avgCalculationTime.toFixed(2)}ms`,
      cacheSize: {
        valueCache: this._valueCache.size,
        lineCache: this._lineCache.size,
        boardAnalysisCache: this._boardAnalysisCache.size
      }
    };
  }
  
  /**
   * 重置性能指標
   */
  resetPerformanceMetrics() {
    this._performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      calculationTime: []
    };
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
   * 模擬所有可能的移動（優化版 - 支持批處理）
   * @param {number[][]} board - 當前遊戲板
   * @param {Function} callback - 完成後的回調函數 (可選)
   * @returns {Array|undefined} 如果沒有提供回調，則返回所有可能移動及其價值的陣列
   */
  simulateAllPossibleMoves(board, callback) {
    // 檢查是否有緩存的棋盤分析結果
    const boardHash = this.getBoardHash(board);
    const cachedAnalysis = this._boardAnalysisCache.get(boardHash);
    
    if (cachedAnalysis) {
      const moves = Object.entries(cachedAnalysis.moves).map(([key, value]) => {
        const [row, col] = key.split('-').map(Number);
        return {
          row,
          col,
          value,
          position: `(${row}, ${col})`
        };
      });
      
      // 按價值排序（降序）
      moves.sort((a, b) => b.value - a.value);
      
      if (callback) {
        callback(moves);
        return;
      }
      return moves;
    }
    
    // 收集所有空格子
    const emptyCells = [];
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col] === this.CELL_STATES.EMPTY) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    // 如果提供了回調，使用批處理
    if (callback) {
      this.batchCalculateMoveValues(board, emptyCells, (results) => {
        // 創建移動列表
        const moves = results.map(result => ({
          row: result.row,
          col: result.col,
          value: result.value,
          position: `(${result.row}, ${result.col})`
        }));
        
        // 按價值排序（降序）
        moves.sort((a, b) => b.value - a.value);
        
        // 緩存整個棋盤的分析結果
        const movesMap = {};
        for (const move of results) {
          movesMap[`${move.row}-${move.col}`] = move.value;
        }
        
        this._boardAnalysisCache.set(boardHash, { moves: movesMap });
        
        callback(moves);
      });
      return;
    }
    
    // 同步版本（無回調）
    const moves = [];
    
    // 創建棋盤分析結果
    const movesMap = {};
    
    for (const { row, col } of emptyCells) {
      const value = this.calculateMoveValue(board, row, col);
      moves.push({
        row,
        col,
        value,
        position: `(${row}, ${col})`
      });
      
      movesMap[`${row}-${col}`] = value;
    }
    
    // 緩存整個棋盤的分析結果
    this._boardAnalysisCache.set(boardHash, { moves: movesMap });
    
    // 按價值排序（降序）
    moves.sort((a, b) => b.value - a.value);
    
    return moves;
  }

  /**
   * 獲取最佳移動建議（優化版 - 支持異步）
   * @param {number[][]} board - 當前遊戲板
   * @param {Function} callback - 完成後的回調函數 (可選)
   * @returns {Object|null|undefined} 如果沒有提供回調，則返回最佳移動建議或null
   */
  getBestSuggestion(board, callback) {
    // 使用性能監控
    if (typeof performanceMonitor !== 'undefined') {
      return performanceMonitor.measureAlgorithmPerformance('enhanced-suggestion', () => {
        return this._getBestSuggestionInternal(board, callback);
      });
    } else {
      return this._getBestSuggestionInternal(board, callback);
    }
  }
  
  /**
   * 內部獲取最佳移動建議的實現
   * @private
   */
  _getBestSuggestionInternal(board, callback) {
    // 如果提供了回調，使用異步版本
    if (callback) {
      this.simulateAllPossibleMoves(board, (allMoves) => {
        if (allMoves.length === 0) {
          callback(null);
          return;
        }
        
        const bestMove = allMoves[0];
        
        callback({
          row: bestMove.row,
          col: bestMove.col,
          value: bestMove.value,
          position: bestMove.position,
          confidence: this.calculateConfidence(allMoves),
          alternatives: allMoves.slice(1, 4) // 提供前3個替代選項
        });
      });
      return;
    }
    
    // 同步版本
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

// 在瀏覽器環境中，將 EnhancedProbabilityCalculator 添加到全局作用域
if (typeof window !== 'undefined') {
    window.EnhancedProbabilityCalculator = EnhancedProbabilityCalculator;
}

/**
 * 與性能監控系統集成
 * @param {PerformanceMonitor} monitor - 性能監控實例
 */
EnhancedProbabilityCalculator.prototype.registerWithPerformanceMonitor = function(monitor) {
  if (!monitor) return;
  
  // 註冊性能比較測試
  monitor.registerAlgorithmTest('standard-vs-enhanced', (standardCalc, enhancedCalc, board) => {
    // 測量標準算法性能
    const standardStart = performance.now();
    const standardSuggestion = standardCalc.getBestSuggestion(board);
    const standardEnd = performance.now();
    const standardTime = standardEnd - standardStart;
    
    // 測量增強版算法性能
    const enhancedStart = performance.now();
    const enhancedSuggestion = enhancedCalc.getBestSuggestion(board);
    const enhancedEnd = performance.now();
    const enhancedTime = enhancedEnd - enhancedStart;
    
    // 返回比較結果
    return {
      standardTime,
      enhancedTime,
      improvement: ((standardTime - enhancedTime) / standardTime * 100).toFixed(2) + '%',
      standardSuggestion,
      enhancedSuggestion,
      standardMetrics: standardCalc.getPerformanceMetrics ? standardCalc.getPerformanceMetrics() : null,
      enhancedMetrics: this.getPerformanceMetrics()
    };
  });
};

// 如果在瀏覽器環境中，自動與全局性能監控集成
if (typeof window !== 'undefined' && typeof performanceMonitor !== 'undefined') {
  const enhancedCalculator = new EnhancedProbabilityCalculator();
  enhancedCalculator.registerWithPerformanceMonitor(performanceMonitor);
}