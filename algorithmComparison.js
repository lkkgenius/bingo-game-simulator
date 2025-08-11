/**
 * 算法比較工具
 * 比較標準和增強版算法的性能和建議質量
 *
 * 功能：
 * 1. 測量兩種算法在相同遊戲狀態下的執行時間
 * 2. 比較兩種算法的記憶體使用量
 * 3. 評估兩種算法的建議質量
 * 4. 提供視覺化的比較結果
 */

// 確保 SafeDOM 可用
if (typeof SafeDOM === 'undefined' && typeof require !== 'undefined') {
  const SafeDOM = require('./safe-dom.js');
}
class AlgorithmComparison {
  constructor() {
    this.standardCalculator = new ProbabilityCalculator();
    this.enhancedCalculator = new EnhancedProbabilityCalculator();
    this.comparisonResults = [];
    this.isComparing = false;
    this.memorySnapshots = [];
    this.testCases = [];

    // 性能監控集成
    if (typeof performanceMonitor !== 'undefined') {
      this.performanceMonitor = performanceMonitor;
      this.enhancedCalculator.registerWithPerformanceMonitor(performanceMonitor);
    }

    // 初始化測試案例
    this._initializeTestCases();

    // 性能指標
    this.performanceMetrics = {
      executionTime: {
        standard: [],
        enhanced: []
      },
      memoryUsage: {
        standard: [],
        enhanced: []
      },
      suggestionQuality: []
    };
  }

  /**
   * 初始化預定義測試案例
   * @private
   */
  _initializeTestCases() {
    // 空白棋盤
    this.testCases.push({
      name: '空白棋盤',
      board: Array(5).fill().map(() => Array(5).fill(0))
    });

    // 中期遊戲（約8個格子已填滿）
    this.testCases.push({
      name: '中期遊戲',
      board: this.generateRandomBoard(8)
    });

    // 後期遊戲（約16個格子已填滿）
    this.testCases.push({
      name: '後期遊戲',
      board: this.generateRandomBoard(16)
    });

    // 特殊案例：接近完成的線
    const nearCompleteBoard = Array(5).fill().map(() => Array(5).fill(0));
    for (let i = 0; i < 4; i++) {
      nearCompleteBoard[0][i] = 1; // 水平線差一格完成
    }
    for (let i = 0; i < 4; i++) {
      nearCompleteBoard[i][0] = 2; // 垂直線差一格完成
    }
    this.testCases.push({
      name: '接近完成的線',
      board: nearCompleteBoard
    });

    // 特殊案例：多交叉點
    const intersectionBoard = Array(5).fill().map(() => Array(5).fill(0));
    intersectionBoard[2][2] = 1; // 中心點
    intersectionBoard[0][0] = 2;
    intersectionBoard[0][4] = 2;
    intersectionBoard[4][0] = 2;
    intersectionBoard[4][4] = 2;
    this.testCases.push({
      name: '多交叉點',
      board: intersectionBoard
    });
  }

  /**
   * 比較兩種算法在特定遊戲板上的表現
   * @param {number[][]} board - 遊戲板狀態
   * @returns {Object} 比較結果
   */
  compareAlgorithms(board) {
    this.isComparing = true;

    // 清理緩存以確保公平比較
    if (this.standardCalculator._valueCache) {
      this.standardCalculator._valueCache.clear();
    }
    if (this.enhancedCalculator._valueCache) {
      this.enhancedCalculator.clearCache();
    }

    // 強制垃圾回收（如果可能）
    if (window.gc) {
      window.gc();
    }

    // 記錄初始記憶體使用量
    let initialMemory = null;
    let memoryUsageBeforeStandard = null;
    let memoryUsageAfterStandard = null;
    let memoryUsageBeforeEnhanced = null;
    let memoryUsageAfterEnhanced = null;

    if (performance.memory) {
      memoryUsageBeforeStandard = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }

    // 測量標準算法性能
    const standardStart = performance.now();
    const standardSuggestion = this.standardCalculator.getBestSuggestion(board);
    const standardEnd = performance.now();
    const standardTime = standardEnd - standardStart;

    // 記錄標準算法後的記憶體使用量
    if (performance.memory) {
      memoryUsageAfterStandard = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }

    // 強制垃圾回收（如果可能）
    if (window.gc) {
      window.gc();
    }

    // 記錄增強版算法前的記憶體使用量
    if (performance.memory) {
      memoryUsageBeforeEnhanced = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }

    // 測量增強版算法性能
    const enhancedStart = performance.now();
    const enhancedSuggestion = this.enhancedCalculator.getBestSuggestion(board);
    const enhancedEnd = performance.now();
    const enhancedTime = enhancedEnd - enhancedStart;

    // 記錄增強版算法後的記憶體使用量
    if (performance.memory) {
      memoryUsageAfterEnhanced = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }

    // 計算記憶體使用量差異
    let memoryUsage = null;
    if (memoryUsageBeforeStandard && memoryUsageAfterStandard &&
        memoryUsageBeforeEnhanced && memoryUsageAfterEnhanced) {

      const standardMemoryDelta = memoryUsageAfterStandard.usedJSHeapSize - memoryUsageBeforeStandard.usedJSHeapSize;
      const enhancedMemoryDelta = memoryUsageAfterEnhanced.usedJSHeapSize - memoryUsageBeforeEnhanced.usedJSHeapSize;

      memoryUsage = {
        standard: {
          before: memoryUsageBeforeStandard.usedJSHeapSize,
          after: memoryUsageAfterStandard.usedJSHeapSize,
          delta: standardMemoryDelta,
          formatted: this.formatMemorySize(standardMemoryDelta)
        },
        enhanced: {
          before: memoryUsageBeforeEnhanced.usedJSHeapSize,
          after: memoryUsageAfterEnhanced.usedJSHeapSize,
          delta: enhancedMemoryDelta,
          formatted: this.formatMemorySize(enhancedMemoryDelta)
        },
        difference: standardMemoryDelta - enhancedMemoryDelta,
        percentImprovement: standardMemoryDelta > 0 ?
          ((standardMemoryDelta - enhancedMemoryDelta) / standardMemoryDelta * 100).toFixed(2) + '%' : 'N/A'
      };

      // 保存到性能指標
      this.performanceMetrics.memoryUsage.standard.push(standardMemoryDelta);
      this.performanceMetrics.memoryUsage.enhanced.push(enhancedMemoryDelta);

      // 限制歷史記錄大小
      if (this.performanceMetrics.memoryUsage.standard.length > 50) {
        this.performanceMetrics.memoryUsage.standard.shift();
        this.performanceMetrics.memoryUsage.enhanced.shift();
      }
    }

    // 保存執行時間到性能指標
    this.performanceMetrics.executionTime.standard.push(standardTime);
    this.performanceMetrics.executionTime.enhanced.push(enhancedTime);

    // 限制歷史記錄大小
    if (this.performanceMetrics.executionTime.standard.length > 50) {
      this.performanceMetrics.executionTime.standard.shift();
      this.performanceMetrics.executionTime.enhanced.shift();
    }

    // 比較建議質量
    const qualityComparison = this.compareSuggestionQuality(standardSuggestion, enhancedSuggestion, board);

    // 保存建議質量到性能指標
    this.performanceMetrics.suggestionQuality.push(qualityComparison);

    // 限制歷史記錄大小
    if (this.performanceMetrics.suggestionQuality.length > 50) {
      this.performanceMetrics.suggestionQuality.shift();
    }

    // 創建比較結果
    const result = {
      timestamp: new Date().toISOString(),
      boardState: this.getBoardStateDescription(board),
      performance: {
        standardTime: standardTime.toFixed(2),
        enhancedTime: enhancedTime.toFixed(2),
        rawStandardTime: standardTime,
        rawEnhancedTime: enhancedTime,
        improvement: ((standardTime - enhancedTime) / standardTime * 100).toFixed(2),
        memoryUsage
      },
      suggestions: {
        standard: standardSuggestion,
        enhanced: enhancedSuggestion,
        qualityComparison
      },
      metrics: {
        standard: this.standardCalculator.getPerformanceMetrics ?
          this.standardCalculator.getPerformanceMetrics() : null,
        enhanced: this.enhancedCalculator.getPerformanceMetrics()
      }
    };

    // 保存結果
    this.comparisonResults.push(result);

    // 限制結果歷史記錄大小
    if (this.comparisonResults.length > 10) {
      this.comparisonResults.shift();
    }

    this.isComparing = false;
    return result;
  }

  /**
   * 格式化記憶體大小為人類可讀格式
   * @param {number} bytes - 位元組數
   * @returns {string} 格式化後的大小
   */
  formatMemorySize(bytes) {
    if (bytes < 0) return '-' + this.formatMemorySize(-bytes);
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * 獲取遊戲板狀態描述
   * @param {number[][]} board - 遊戲板
   * @returns {Object} 遊戲板狀態描述
   */
  getBoardStateDescription(board) {
    let playerCells = 0;
    let computerCells = 0;
    let emptyCells = 0;

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 1) {
          playerCells++;
        } else if (board[row][col] === 2) {
          computerCells++;
        } else {
          emptyCells++;
        }
      }
    }

    return {
      playerCells,
      computerCells,
      emptyCells,
      totalFilled: playerCells + computerCells,
      fillPercentage: ((playerCells + computerCells) / 25 * 100).toFixed(0) + '%'
    };
  }

  /**
   * 比較建議質量
   * @param {Object} standardSuggestion - 標準算法建議
   * @param {Object} enhancedSuggestion - 增強版算法建議
   * @param {number[][]} board - 當前遊戲板狀態
   * @returns {Object} 質量比較結果
   */
  compareSuggestionQuality(standardSuggestion, enhancedSuggestion, board) {
    if (!standardSuggestion || !enhancedSuggestion) {
      return { status: 'incomplete', reason: 'One or both suggestions are null' };
    }

    // 檢查是否建議相同的移動
    const sameMove = standardSuggestion.row === enhancedSuggestion.row &&
                     standardSuggestion.col === enhancedSuggestion.col;

    // 計算價值差異
    const valueDifference = enhancedSuggestion.value - standardSuggestion.value;
    const percentImprovement = (valueDifference / Math.max(1, standardSuggestion.value) * 100).toFixed(2);

    // 檢查增強版的建議是否在標準版的替代選項中
    let enhancedInStandardAlternatives = false;
    let enhancedRankInStandard = -1;
    if (standardSuggestion.alternatives) {
      for (let i = 0; i < standardSuggestion.alternatives.length; i++) {
        const alt = standardSuggestion.alternatives[i];
        if (alt.row === enhancedSuggestion.row && alt.col === enhancedSuggestion.col) {
          enhancedInStandardAlternatives = true;
          enhancedRankInStandard = i + 1; // +1 因為alternatives不包含最佳選擇
          break;
        }
      }
    }

    // 檢查標準版的建議是否在增強版的替代選項中
    let standardInEnhancedAlternatives = false;
    let standardRankInEnhanced = -1;
    if (enhancedSuggestion.alternatives) {
      for (let i = 0; i < enhancedSuggestion.alternatives.length; i++) {
        const alt = enhancedSuggestion.alternatives[i];
        if (alt.row === standardSuggestion.row && alt.col === standardSuggestion.col) {
          standardInEnhancedAlternatives = true;
          standardRankInEnhanced = i + 1; // +1 因為alternatives不包含最佳選擇
          break;
        }
      }
    }

    // 模擬兩種建議的結果
    const standardQuality = this.simulateMoveQuality(board, standardSuggestion.row, standardSuggestion.col);
    const enhancedQuality = this.simulateMoveQuality(board, enhancedSuggestion.row, enhancedSuggestion.col);

    // 評估建議質量
    let qualityAssessment = 'unknown';
    let qualityScore = 0;
    let qualityDetails = {};

    if (sameMove) {
      qualityAssessment = 'identical';
      qualityScore = 5; // 最高分
      qualityDetails = {
        description: '兩種算法給出相同的建議',
        reason: '建議位置完全相同'
      };
    } else {
      // 比較完成線數量
      if (enhancedQuality.completedLines > standardQuality.completedLines) {
        qualityAssessment = 'enhanced_better';
        qualityScore = 4;
        qualityDetails = {
          description: '增強版算法建議更優',
          reason: `增強版可完成 ${enhancedQuality.completedLines} 條線，而標準版只能完成 ${standardQuality.completedLines} 條線`
        };
      } else if (standardQuality.completedLines > enhancedQuality.completedLines) {
        qualityAssessment = 'standard_better';
        qualityScore = 2;
        qualityDetails = {
          description: '標準算法建議更優',
          reason: `標準版可完成 ${standardQuality.completedLines} 條線，而增強版只能完成 ${enhancedQuality.completedLines} 條線`
        };
      }
      // 如果完成線數量相同，比較潛在線數量
      else if (enhancedQuality.potentialLines > standardQuality.potentialLines) {
        qualityAssessment = 'enhanced_slightly_better';
        qualityScore = 3;
        qualityDetails = {
          description: '增強版算法建議略優',
          reason: `增強版可創建 ${enhancedQuality.potentialLines} 條潛在線，而標準版只能創建 ${standardQuality.potentialLines} 條潛在線`
        };
      } else if (standardQuality.potentialLines > enhancedQuality.potentialLines) {
        qualityAssessment = 'standard_slightly_better';
        qualityScore = 2;
        qualityDetails = {
          description: '標準算法建議略優',
          reason: `標準版可創建 ${standardQuality.potentialLines} 條潛在線，而增強版只能創建 ${enhancedQuality.potentialLines} 條潛在線`
        };
      } else {
        qualityAssessment = 'equivalent';
        qualityScore = 3;
        qualityDetails = {
          description: '兩種算法建議等效',
          reason: '兩種建議的完成線數量和潛在線數量相同'
        };
      }

      // 檢查交叉點策略
      const enhancedIsIntersection = this.isIntersectionPoint(enhancedSuggestion.row, enhancedSuggestion.col);
      const standardIsIntersection = this.isIntersectionPoint(standardSuggestion.row, standardSuggestion.col);

      if (enhancedIsIntersection && !standardIsIntersection) {
        qualityDetails.intersectionStrategy = '增強版算法選擇了交叉點，這可能有助於完成多條線';
      }
    }

    // 計算信心度差異
    const confidenceRanking = {
      'very-high': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };

    const standardConfidenceRank = confidenceRanking[standardSuggestion.confidence] || 0;
    const enhancedConfidenceRank = confidenceRanking[enhancedSuggestion.confidence] || 0;
    const confidenceDifference = enhancedConfidenceRank - standardConfidenceRank;

    // 詳細的模擬結果
    const simulationDetails = {
      standard: {
        position: `(${standardSuggestion.row}, ${standardSuggestion.col})`,
        completedLines: standardQuality.completedLines,
        potentialLines: standardQuality.potentialLines,
        isIntersection: standardIsIntersection,
        confidence: standardSuggestion.confidence,
        value: standardSuggestion.value
      },
      enhanced: {
        position: `(${enhancedSuggestion.row}, ${enhancedSuggestion.col})`,
        completedLines: enhancedQuality.completedLines,
        potentialLines: enhancedQuality.potentialLines,
        isIntersection: enhancedIsIntersection,
        confidence: enhancedSuggestion.confidence,
        value: enhancedSuggestion.value
      }
    };

    return {
      sameMove,
      valueDifference,
      percentImprovement: percentImprovement + '%',
      enhancedInStandardAlternatives,
      standardInEnhancedAlternatives,
      enhancedRankInStandard,
      standardRankInEnhanced,
      confidenceComparison: {
        standard: standardSuggestion.confidence,
        enhanced: enhancedSuggestion.confidence,
        difference: confidenceDifference
      },
      qualityAssessment,
      qualityScore,
      qualityDetails,
      simulationDetails
    };
  }

  /**
   * 檢查是否為交叉點
   * @param {number} row - 行位置
   * @param {number} col - 列位置
   * @returns {boolean} 是否為交叉點
   */
  isIntersectionPoint(row, col) {
    // 檢查是否為主對角線上的點
    const isOnMainDiagonal = (row === col);

    // 檢查是否為反對角線上的點
    const isOnAntiDiagonal = (row + col === 4); // 5x5 棋盤，索引為 0-4

    // 如果同時在兩條對角線上，或在任一對角線上，則為交叉點
    return (isOnMainDiagonal && isOnAntiDiagonal) || // 中心點
           (isOnMainDiagonal || isOnAntiDiagonal);   // 對角線上的點
  }

  /**
   * 模擬移動質量
   * @param {number[][]} board - 遊戲板
   * @param {number} row - 行位置
   * @param {number} col - 列位置
   * @returns {Object} 移動質量評估
   */
  simulateMoveQuality(board, row, col) {
    // 創建測試板，模擬玩家移動
    const testBoard = this.copyBoard(board);
    testBoard[row][col] = 1; // 玩家移動

    // 檢查完成的線
    const completedLines = this.countCompletedLines(testBoard);

    // 檢查潛在的線
    const potentialLines = this.countPotentialLines(testBoard);

    return {
      completedLines,
      potentialLines
    };
  }

  /**
   * 計算完成的線數量
   * @param {number[][]} board - 遊戲板
   * @returns {number} 完成的線數量
   */
  countCompletedLines(board) {
    let count = 0;

    // 檢查水平線
    for (let row = 0; row < 5; row++) {
      if (board[row].every(cell => cell !== 0)) {
        count++;
      }
    }

    // 檢查垂直線
    for (let col = 0; col < 5; col++) {
      let complete = true;
      for (let row = 0; row < 5; row++) {
        if (board[row][col] === 0) {
          complete = false;
          break;
        }
      }
      if (complete) {
        count++;
      }
    }

    // 檢查主對角線
    let mainDiagonalComplete = true;
    for (let i = 0; i < 5; i++) {
      if (board[i][i] === 0) {
        mainDiagonalComplete = false;
        break;
      }
    }
    if (mainDiagonalComplete) {
      count++;
    }

    // 檢查反對角線
    let antiDiagonalComplete = true;
    for (let i = 0; i < 5; i++) {
      if (board[i][4 - i] === 0) {
        antiDiagonalComplete = false;
        break;
      }
    }
    if (antiDiagonalComplete) {
      count++;
    }

    return count;
  }

  /**
   * 計算潛在的線數量
   * @param {number[][]} board - 遊戲板
   * @returns {number} 潛在的線數量
   */
  countPotentialLines(board) {
    let count = 0;

    // 檢查水平線
    for (let row = 0; row < 5; row++) {
      const filledCells = board[row].filter(cell => cell !== 0).length;
      if (filledCells >= 3 && filledCells < 5) {
        count += filledCells - 2; // 3個填充=1分，4個填充=2分
      }
    }

    // 檢查垂直線
    for (let col = 0; col < 5; col++) {
      let filledCells = 0;
      for (let row = 0; row < 5; row++) {
        if (board[row][col] !== 0) {
          filledCells++;
        }
      }
      if (filledCells >= 3 && filledCells < 5) {
        count += filledCells - 2;
      }
    }

    // 檢查主對角線
    let mainDiagonalFilled = 0;
    for (let i = 0; i < 5; i++) {
      if (board[i][i] !== 0) {
        mainDiagonalFilled++;
      }
    }
    if (mainDiagonalFilled >= 3 && mainDiagonalFilled < 5) {
      count += mainDiagonalFilled - 2;
    }

    // 檢查反對角線
    let antiDiagonalFilled = 0;
    for (let i = 0; i < 5; i++) {
      if (board[i][4 - i] !== 0) {
        antiDiagonalFilled++;
      }
    }
    if (antiDiagonalFilled >= 3 && antiDiagonalFilled < 5) {
      count += antiDiagonalFilled - 2;
    }

    return count;
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
   * 進行批量比較測試
   * @param {number} iterations - 測試迭代次數
   * @param {Function|Array} boardGenerator - 生成測試遊戲板的函數或預定義測試案例
   * @param {Function} callback - 完成後的回調函數
   * @param {Object} options - 測試選項
   */
  runBenchmark(iterations = 10, boardGenerator, callback, options = {}) {
    const results = [];
    let completed = 0;
    let testBoards = [];

    // 準備測試遊戲板
    if (Array.isArray(boardGenerator)) {
      // 使用提供的遊戲板陣列
      testBoards = boardGenerator;
    } else if (options.useTestCases) {
      // 使用預定義測試案例
      testBoards = this.testCases.map(testCase => testCase.board);
    } else {
      // 生成隨機遊戲板
      for (let i = 0; i < iterations; i++) {
        const filledCells = Math.floor(Math.random() * 20) + 1; // 1-20個已填充的格子
        testBoards.push(boardGenerator ? boardGenerator() : this.generateRandomBoard(filledCells));
      }
    }

    // 確保有足夠的測試遊戲板
    const actualIterations = Math.min(iterations, testBoards.length);

    // 顯示進度指示器
    if (options.showProgress && typeof document !== 'undefined') {
      const progressContainer = document.createElement('div');
      progressContainer.id = 'benchmark-progress';
      progressContainer.style.width = '100%';
      progressContainer.style.height = '20px';
      progressContainer.style.backgroundColor = '#f0f0f0';
      progressContainer.style.marginBottom = '10px';
      progressContainer.style.borderRadius = '3px';
      progressContainer.style.overflow = 'hidden';

      const progressBar = document.createElement('div');
      progressBar.style.width = '0%';
      progressBar.style.height = '100%';
      progressBar.style.backgroundColor = '#4CAF50';
      progressBar.style.transition = 'width 0.3s';

      progressContainer.appendChild(progressBar);

      const progressText = document.createElement('div');
      progressText.style.textAlign = 'center';
      progressText.style.marginTop = '5px';
      progressText.textContent = '準備中...';

      if (document.getElementById('benchmark-progress')) {
        document.getElementById('benchmark-progress').remove();
      }
      if (document.getElementById('benchmark-progress-text')) {
        document.getElementById('benchmark-progress-text').remove();
      }

      document.getElementById('benchmarkResults').appendChild(progressContainer);
      document.getElementById('benchmarkResults').appendChild(progressText);
    }

    const updateProgress = (progress) => {
      if (options.showProgress && typeof document !== 'undefined') {
        const progressBar = document.querySelector('#benchmark-progress div');
        const progressText = document.getElementById('benchmark-progress-text');
        if (progressBar) {
          progressBar.style.width = `${progress}%`;
        }
        if (progressText) {
          progressText.textContent = `進度: ${progress}% (${completed}/${actualIterations})`;
        }
      }
    };

    const processBatch = (startIndex) => {
      const batchSize = options.batchSize || 2;
      const endIndex = Math.min(startIndex + batchSize, actualIterations);

      for (let i = startIndex; i < endIndex; i++) {
        // 執行比較
        const result = this.compareAlgorithms(testBoards[i]);

        // 添加測試案例信息
        if (options.useTestCases && i < this.testCases.length) {
          result.testCase = this.testCases[i].name;
        }

        results.push(result);
        completed++;
      }

      // 更新進度
      const progress = (completed / actualIterations * 100).toFixed(0);
      console.log(`Benchmark progress: ${progress}%`);
      updateProgress(parseInt(progress));

      // 如果還有未完成的迭代，安排下一批
      if (completed < actualIterations) {
        setTimeout(() => processBatch(endIndex), options.batchDelay || 50);
      } else {
        // 所有迭代完成，計算總結果
        const summary = this.summarizeBenchmarkResults(results);

        // 移除進度指示器
        if (options.showProgress && typeof document !== 'undefined') {
          const progressBar = document.getElementById('benchmark-progress');
          const progressText = document.getElementById('benchmark-progress-text');
          if (progressBar) progressBar.remove();
          if (progressText) progressText.remove();
        }

        callback(summary, results);
      }
    };

    // 開始第一批
    processBatch(0);
  }

  /**
   * 總結基準測試結果
   * @param {Array} results - 比較結果陣列
   * @returns {Object} 總結
   */
  summarizeBenchmarkResults(results) {
    // 計算平均性能改進
    let totalStandardTime = 0;
    let totalEnhancedTime = 0;
    let sameMovesCount = 0;
    let enhancedBetterCount = 0;
    let standardBetterCount = 0;
    let totalQualityScore = 0;

    // 記憶體使用統計
    let totalStandardMemory = 0;
    let totalEnhancedMemory = 0;
    let memoryResultsCount = 0;

    // 緩存效率統計
    let totalCacheHitRate = 0;
    let cacheResultsCount = 0;

    for (const result of results) {
      // 時間性能
      totalStandardTime += result.performance.rawStandardTime;
      totalEnhancedTime += result.performance.rawEnhancedTime;

      // 建議質量
      if (result.suggestions.qualityComparison.sameMove) {
        sameMovesCount++;
      }

      if (result.suggestions.qualityComparison.qualityAssessment === 'enhanced_better' ||
          result.suggestions.qualityComparison.qualityAssessment === 'enhanced_slightly_better') {
        enhancedBetterCount++;
      }

      if (result.suggestions.qualityComparison.qualityAssessment === 'standard_better' ||
          result.suggestions.qualityComparison.qualityAssessment === 'standard_slightly_better') {
        standardBetterCount++;
      }

      totalQualityScore += result.suggestions.qualityComparison.qualityScore || 0;

      // 記憶體使用
      if (result.performance.memoryUsage) {
        totalStandardMemory += result.performance.memoryUsage.standard || 0;
        totalEnhancedMemory += result.performance.memoryUsage.enhanced || 0;
        memoryResultsCount++;
      }

      // 緩存效率
      if (result.metrics.enhanced && result.metrics.enhanced.cacheHitRate) {
        totalCacheHitRate += parseFloat(result.metrics.enhanced.cacheHitRate);
        cacheResultsCount++;
      }
    }

    const avgStandardTime = totalStandardTime / results.length;
    const avgEnhancedTime = totalEnhancedTime / results.length;
    const avgImprovement = ((avgStandardTime - avgEnhancedTime) / avgStandardTime * 100).toFixed(2);

    // 記憶體使用平均值
    let memoryStats = null;
    if (memoryResultsCount > 0) {
      const avgStandardMemory = totalStandardMemory / memoryResultsCount;
      const avgEnhancedMemory = totalEnhancedMemory / memoryResultsCount;
      const memoryImprovement = ((avgStandardMemory - avgEnhancedMemory) / avgStandardMemory * 100).toFixed(2);

      memoryStats = {
        avgStandardMemory: (avgStandardMemory / 1024 / 1024).toFixed(2) + 'MB',
        avgEnhancedMemory: (avgEnhancedMemory / 1024 / 1024).toFixed(2) + 'MB',
        memoryImprovement: memoryImprovement + '%'
      };
    }

    // 緩存效率平均值
    let cacheStats = null;
    if (cacheResultsCount > 0) {
      cacheStats = {
        avgCacheHitRate: (totalCacheHitRate / cacheResultsCount).toFixed(2) + '%'
      };
    }

    return {
      iterations: results.length,
      performance: {
        avgStandardTime: avgStandardTime.toFixed(2) + 'ms',
        avgEnhancedTime: avgEnhancedTime.toFixed(2) + 'ms',
        avgImprovement: avgImprovement + '%',
        memory: memoryStats
      },
      quality: {
        sameMovesPercent: (sameMovesCount / results.length * 100).toFixed(2) + '%',
        enhancedBetterPercent: (enhancedBetterCount / results.length * 100).toFixed(2) + '%',
        standardBetterPercent: (standardBetterCount / results.length * 100).toFixed(2) + '%',
        equivalentPercent: ((results.length - enhancedBetterCount - standardBetterCount - sameMovesCount) / results.length * 100).toFixed(2) + '%',
        avgQualityScore: (totalQualityScore / results.length).toFixed(2)
      },
      cache: cacheStats
    };
  }

  /**
   * 運行預定義測試案例
   * @param {Function} callback - 完成後的回調函數
   */
  runTestCases(callback) {
    this.runBenchmark(this.testCases.length, null, callback, {
      useTestCases: true,
      showProgress: true,
      batchDelay: 100
    });
  }

  /**
   * 生成隨機遊戲板用於測試
   * @param {number} filledCells - 已填充的格子數量
   * @returns {number[][]} 隨機遊戲板
   */
  generateRandomBoard(filledCells = 8) {
    const board = Array(5).fill().map(() => Array(5).fill(0));
    let filled = 0;

    while (filled < filledCells) {
      const row = Math.floor(Math.random() * 5);
      const col = Math.floor(Math.random() * 5);

      if (board[row][col] === 0) {
        // 隨機分配玩家或電腦的棋子
        board[row][col] = Math.random() < 0.5 ? 1 : 2;
        filled++;
      }
    }

    return board;
  }

  /**
   * 創建視覺化比較結果
   * @param {Object} result - 比較結果
   * @returns {HTMLElement} 包含比較結果的 DOM 元素
   */
  createComparisonVisual(result) {
    const container = document.createElement('div');
    container.className = 'algorithm-comparison';

    // 創建性能比較部分
    const performanceSection = SafeDOM.createStructure({
      tag: 'div',
      attributes: { class: 'comparison-section performance' },
      children: [
        {
          tag: 'h3',
          textContent: '性能比較'
        },
        {
          tag: 'div',
          attributes: { class: 'comparison-chart' },
          children: [
            {
              tag: 'div',
              attributes: { class: 'bar-container' },
              children: [
                {
                  tag: 'div',
                  attributes: { class: 'bar-label' },
                  textContent: '標準算法'
                },
                {
                  tag: 'div',
                  attributes: {
                    class: 'bar standard',
                    style: 'width: 100%;'
                  },
                  textContent: result.performance.standardTime
                }
              ]
            },
            {
              tag: 'div',
              attributes: { class: 'bar-container' },
              children: [
                {
                  tag: 'div',
                  attributes: { class: 'bar-label' },
                  textContent: '增強版算法'
                },
                {
                  tag: 'div',
                  attributes: {
                    class: 'bar enhanced',
                    style: `width: ${(parseFloat(result.performance.enhancedTime) / parseFloat(result.performance.standardTime) * 100).toFixed(0)}%;`
                  },
                  textContent: result.performance.enhancedTime
                }
              ]
            }
          ]
        },
        {
          tag: 'div',
          attributes: { class: 'improvement' },
          textContent: `性能提升: ${result.performance.improvement}`
        }
      ]
    });

    // 創建建議比較部分
    const suggestionSection = document.createElement('div');
    suggestionSection.className = 'comparison-section suggestions';

    const standardPos = result.suggestions.standard ? result.suggestions.standard.position : 'N/A';
    const enhancedPos = result.suggestions.enhanced ? result.suggestions.enhanced.position : 'N/A';
    const sameMove = result.suggestions.qualityComparison.sameMove ? '相同' : '不同';
    const moveClass = result.suggestions.qualityComparison.sameMove ? 'same' : 'different';

    SafeDOM.replaceContent(suggestionSection, [
      {
        tag: 'h3',
        textContent: '建議比較'
      },
      {
        tag: 'div',
        attributes: { class: 'suggestion-comparison' },
        children: [
          {
            tag: 'div',
            attributes: { class: 'suggestion-item' },
            children: [
              {
                tag: 'div',
                attributes: { class: 'suggestion-label' },
                textContent: '標準算法建議:'
              },
              {
                tag: 'div',
                attributes: { class: 'suggestion-value' },
                textContent: standardPos
              }
            ]
          },
          {
            tag: 'div',
            attributes: { class: 'suggestion-item' },
            children: [
              {
                tag: 'div',
                attributes: { class: 'suggestion-label' },
                textContent: '增強版算法建議:'
              },
              {
                tag: 'div',
                attributes: { class: 'suggestion-value' },
                textContent: enhancedPos
              }
            ]
          },
          {
            tag: 'div',
            attributes: {
              class: `suggestion-result ${moveClass}`
            },
            textContent: `建議結果: ${sameMove}`
          }
        ]
      }
    ]);

    // 創建指標比較部分
    const metricsSection = document.createElement('div');
    metricsSection.className = 'comparison-section metrics';

    const enhancedMetrics = result.metrics.enhanced;
    SafeDOM.replaceContent(metricsSection, [
      {
        tag: 'h3',
        textContent: '緩存效率'
      },
      {
        tag: 'div',
        attributes: { class: 'metrics-data' },
        children: [
          {
            tag: 'div',
            attributes: { class: 'metric-item' },
            children: [
              {
                tag: 'div',
                attributes: { class: 'metric-label' },
                textContent: '緩存命中率:'
              },
              {
                tag: 'div',
                attributes: { class: 'metric-value' },
                textContent: enhancedMetrics.cacheHitRate
              }
            ]
          },
          {
            tag: 'div',
            attributes: { class: 'metric-item' },
            children: [
              {
                tag: 'div',
                attributes: { class: 'metric-label' },
                textContent: '平均計算時間:'
              },
              {
                tag: 'div',
                attributes: { class: 'metric-value' },
                textContent: enhancedMetrics.averageCalculationTime
              }
            ]
          }
        ]
      }
    ]);

    container.appendChild(performanceSection);
    container.appendChild(suggestionSection);
    container.appendChild(metricsSection);

    return container;
  }
}

// 如果在瀏覽器環境中，創建全局實例
if (typeof window !== 'undefined') {
  window.algorithmComparison = new AlgorithmComparison();
}

// 如果在Node.js環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlgorithmComparison;
}
