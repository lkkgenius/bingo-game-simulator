// 在Node.js環境中載入依賴模組
let LineDetectorClass,
  ProbabilityCalculatorClass,
  AILearningSystemClass,
  logger;

if (typeof require !== 'undefined') {
  LineDetectorClass = require('./lineDetector.js');
  ProbabilityCalculatorClass = require('./probabilityCalculator.js');
  AILearningSystemClass = require('./aiLearningSystem.js');
  const { logger: prodLogger } = require('./production-logger.js');
  logger = prodLogger;
} else if (typeof window !== 'undefined' && window.logger) {
  logger = window.logger;
  // In browser environment, classes are available globally
  LineDetectorClass = window.LineDetector;
  ProbabilityCalculatorClass = window.ProbabilityCalculator;
  AILearningSystemClass = window.AILearningSystem;
}

/**
 * GameEngine - Bingo 遊戲的核心引擎類別
 *
 * 這是整個遊戲系統的中央控制器，負責：
 * - 統合所有遊戲邏輯組件（連線檢測、機率計算等）
 * - 管理遊戲流程和狀態轉換
 * - 處理玩家和電腦的回合邏輯
 * - 提供遊戲建議和分析
 * - 追蹤遊戲進度和統計數據
 * - 協調 UI 更新和事件處理
 *
 * 設計模式：
 * - 使用觀察者模式處理狀態變更通知
 * - 使用策略模式支持不同的演算法
 * - 使用狀態模式管理遊戲階段
 *
 * @class GameEngine
 * @version 1.0.0
 */
class GameEngine {
  /**
   * 創建遊戲引擎實例
   * 初始化所有必要的組件和狀態
   */
  constructor() {
    // 遊戲配置常數
    this.BOARD_SIZE = 5; // 遊戲板大小（5x5）
    this.MAX_ROUNDS = 8; // 最大遊戲回合數

    // 遊戲狀態常數定義
    this.CELL_STATES = {
      EMPTY: 0, // 空格子
      PLAYER: 1, // 玩家選擇的格子
      COMPUTER: 2 // 電腦選擇的格子
    };

    // 遊戲階段常數定義
    this.GAME_PHASES = {
      WAITING_START: 'waiting-start', // 等待遊戲開始
      PLAYER_TURN: 'player-turn', // 玩家回合
      COMPUTER_INPUT: 'computer-input', // 等待電腦輸入
      GAME_OVER: 'game-over' // 遊戲結束
    };

    // 初始化遊戲狀態對象
    // 包含所有遊戲進行中需要追蹤的數據
    this.gameState = {
      board: this.createEmptyBoard(), // 5x5 遊戲板
      currentRound: 1, // 當前回合數
      gamePhase: this.GAME_PHASES.WAITING_START, // 當前遊戲階段
      playerMoves: [], // 玩家移動記錄
      computerMoves: [], // 電腦移動記錄
      completedLines: [], // 完成的連線
      isGameComplete: false, // 遊戲是否完成
      lastSuggestion: null // 最後一次建議
    };

    // 初始化核心遊戲組件
    this.lineDetector = new (LineDetectorClass || LineDetector)(); // 連線檢測器
    this.probabilityCalculator = new (ProbabilityCalculatorClass ||
      ProbabilityCalculator)(); // 機率計算器
    // Initialize AI Learning System only if available
    if (AILearningSystemClass || (typeof AILearningSystem !== 'undefined')) {
      this.aiLearningSystem = new (AILearningSystemClass || AILearningSystem)();
    } else {
      this.aiLearningSystem = null;
      console.warn('AILearningSystem not available, continuing without AI learning features');
    }
    this.gameBoard = null; // 將由外部設置

    // AI 學習系統配置
    this.useAILearning = true;
    this.learningMode = 'adaptive'; // 'adaptive', 'personalized', 'traditional'

    // 事件回調
    this.onGameStateChange = null;
    this.onRoundComplete = null;
    this.onGameComplete = null;
    this.onError = null;
  }

  /**
   * 創建空的遊戲板
   * @returns {number[][]} 5x5的空遊戲板
   */
  createEmptyBoard() {
    return Array(this.BOARD_SIZE)
      .fill()
      .map(() => Array(this.BOARD_SIZE).fill(this.CELL_STATES.EMPTY));
  }

  /**
   * 設置遊戲板UI組件
   * @param {GameBoard} gameBoard - 遊戲板UI組件
   */
  setGameBoard(gameBoard) {
    this.gameBoard = gameBoard;

    // 設置點擊處理器
    if (this.gameBoard) {
      this.gameBoard.setClickHandler((row, col) => {
        this.handleCellClick(row, col);
      });
    }
  }

  /**
   * 開始新遊戲
   */
  startGame() {
    // 重置遊戲狀態
    this.gameState = {
      board: this.createEmptyBoard(),
      currentRound: 1,
      gamePhase: this.GAME_PHASES.PLAYER_TURN,
      playerMoves: [],
      computerMoves: [],
      completedLines: [],
      isGameComplete: false,
      lastSuggestion: null
    };

    // 更新UI
    if (this.gameBoard) {
      this.gameBoard.reset();
      this.gameBoard.updateBoard(this.gameState.board);
    }

    // 提供第一個建議
    this.provideSuggestion();

    // 觸發狀態變更事件
    this.triggerStateChange();

    if (logger) logger.info('遊戲開始！輪到玩家選擇。');
  }

  /**
   * 處理格子點擊事件
   * @param {number} row - 點擊的行位置
   * @param {number} col - 點擊的列位置
   */
  handleCellClick(row, col) {
    try {
      if (this.gameState.gamePhase === this.GAME_PHASES.PLAYER_TURN) {
        this.processPlayerTurn(row, col);
      } else {
        this.triggerError('現在不是玩家回合，無法進行選擇。');
      }
    } catch (error) {
      this.triggerError(error.message);
    }
  }

  /**
   * 處理玩家回合
   * @param {number} row - 玩家選擇的行位置
   * @param {number} col - 玩家選擇的列位置
   */
  processPlayerTurn(row, col) {
    // 檢查遊戲是否已開始
    if (this.gameState.gamePhase === this.GAME_PHASES.WAITING_START) {
      throw new Error('Game has not started');
    }

    // 檢查是否為玩家回合
    if (this.gameState.gamePhase !== this.GAME_PHASES.PLAYER_TURN) {
      throw new Error('現在不是玩家回合，無法進行選擇');
    }

    // 驗證移動
    if (!this.isValidMove(row, col)) {
      throw new Error(`無效的移動位置 (${row}, ${col})`);
    }

    // 執行玩家移動
    this.gameState.board[row][col] = this.CELL_STATES.PLAYER;
    this.gameState.playerMoves.push({
      row,
      col,
      round: this.gameState.currentRound
    });

    // 更新UI
    if (this.gameBoard) {
      this.gameBoard.updateCell(row, col, this.CELL_STATES.PLAYER);
      this.gameBoard.clearSuggestionHighlight();
    }

    // 檢查連線
    this.updateCompletedLines();

    // 轉換到電腦輸入階段
    this.gameState.gamePhase = this.GAME_PHASES.COMPUTER_INPUT;

    if (logger) {
      logger.info(`玩家選擇了位置 (${row}, ${col})`);
      logger.info('請輸入電腦的選擇...');
    }

    // 觸發狀態變更事件
    this.triggerStateChange();
  }

  /**
   * 處理電腦回合輸入
   * @param {number} row - 電腦選擇的行位置
   * @param {number} col - 電腦選擇的列位置
   */
  processComputerTurn(row, col) {
    try {
      // 驗證當前階段
      if (this.gameState.gamePhase !== this.GAME_PHASES.COMPUTER_INPUT) {
        throw new Error('現在不是電腦輸入階段');
      }

      // 驗證移動
      if (!this.isValidMove(row, col)) {
        throw new Error(`無效的電腦移動位置 (${row}, ${col})`);
      }

      // 執行電腦移動
      this.gameState.board[row][col] = this.CELL_STATES.COMPUTER;
      this.gameState.computerMoves.push({
        row,
        col,
        round: this.gameState.currentRound
      });

      // 更新UI
      if (this.gameBoard) {
        this.gameBoard.updateCell(row, col, this.CELL_STATES.COMPUTER);
      }

      // 檢查連線
      this.updateCompletedLines();

      // 完成當前回合
      this.completeRound();

      if (logger) {
        logger.info(`電腦選擇了位置 (${row}, ${col})`);
      }
    } catch (error) {
      this.triggerError(error.message);
    }
  }

  /**
   * 完成當前回合
   */
  completeRound() {
    // 檢查遊戲是否結束
    if (this.gameState.currentRound >= this.MAX_ROUNDS) {
      this.endGame();
      return;
    }

    // 進入下一回合
    this.gameState.currentRound++;
    this.gameState.gamePhase = this.GAME_PHASES.PLAYER_TURN;

    // 提供新的建議
    this.provideSuggestion();

    // 觸發回合完成事件
    if (this.onRoundComplete) {
      this.onRoundComplete(
        this.gameState.currentRound - 1,
        this.getGameStats()
      );
    }

    // 觸發狀態變更事件
    this.triggerStateChange();

    if (logger) {
      logger.info(`第 ${this.gameState.currentRound - 1} 回合完成！`);
      logger.info(`開始第 ${this.gameState.currentRound} 回合，輪到玩家選擇。`);
    }
  }

  /**
   * 結束遊戲
   */
  endGame() {
    this.gameState.gamePhase = this.GAME_PHASES.GAME_OVER;
    this.gameState.isGameComplete = true;

    // 清除建議高亮
    if (this.gameBoard) {
      this.gameBoard.clearSuggestionHighlight();
    }

    const finalStats = this.getGameStats();

    // 記錄遊戲數據用於AI學習
    if (this.useAILearning && this.aiLearningSystem) {
      this.recordGameDataForLearning(finalStats);
    }

    // 觸發遊戲完成事件
    if (this.onGameComplete) {
      this.onGameComplete(finalStats);
    }

    // 觸發狀態變更事件
    this.triggerStateChange();

    if (logger) {
      logger.info('遊戲結束！');
      logger.info(`最終結果：完成了 ${finalStats.totalLines} 條連線`);
    }

    // 顯示學習統計
    if (this.useAILearning) {
      const learningStats = this.aiLearningSystem.getLearningStats();
      if (logger) {
        logger.info('AI學習統計:', learningStats);
      }
    }
  }

  /**
   * 提供移動建議
   */
  provideSuggestion() {
    if (this.gameState.gamePhase !== this.GAME_PHASES.PLAYER_TURN) {
      return;
    }

    let suggestion;

    // 根據學習模式選擇建議算法
    if (this.useAILearning && this.aiLearningSystem) {
      switch (this.learningMode) {
        case 'personalized':
          suggestion = this.aiLearningSystem.getPersonalizedSuggestion(
            this.gameState.board,
            this.getGameContext()
          );
          break;
        case 'adaptive':
          suggestion = this.aiLearningSystem.predictBestMove(
            this.gameState.board,
            this.getGameContext()
          );
          break;
        default:
          suggestion = this.probabilityCalculator.getBestSuggestion(
            this.gameState.board
          );
      }
    } else {
      suggestion = this.probabilityCalculator.getBestSuggestion(
        this.gameState.board
      );
    }

    if (suggestion) {
      this.gameState.lastSuggestion = suggestion;

      // 在UI上高亮建議
      if (this.gameBoard) {
        this.gameBoard.highlightSuggestion(suggestion.row, suggestion.col);
      }

      if (logger) {
        logger.info(
          `建議移動：(${suggestion.row}, ${suggestion.col})，價值：${suggestion.value}`
        );
      }
    } else {
      if (logger) {
        logger.info('沒有可用的移動建議');
      }
    }
  }

  /**
   * 更新完成的連線
   */
  updateCompletedLines() {
    const newLines = this.lineDetector.getAllLines(this.gameState.board);

    // 找出新完成的連線
    const previousLineCount = this.gameState.completedLines.length;
    this.gameState.completedLines = newLines;

    // 總是更新UI上的連線高亮顯示，確保顯示一致性
    if (this.gameBoard) {
      if (logger) {
        logger.debug(
          `Updating line highlights: ${newLines.length} lines found`
        );
      }
      // 使用強制刷新方法確保連線正確顯示
      if (typeof this.gameBoard.forceRefreshLines === 'function') {
        this.gameBoard.forceRefreshLines(newLines);
      } else {
        this.gameBoard.highlightLines(newLines);
      }
    }

    if (newLines.length > previousLineCount) {
      const newLineCount = newLines.length - previousLineCount;
      if (logger) {
        logger.info(
          `完成了 ${newLineCount} 條新連線！總共 ${newLines.length} 條連線。`
        );
      }
    }
  }

  /**
   * 驗證移動是否有效
   * @param {number} row - 行位置
   * @param {number} col - 列位置
   * @returns {boolean} 是否為有效移動
   */
  isValidMove(row, col) {
    // 檢查位置是否在範圍內
    if (
      row < 0 ||
      row >= this.BOARD_SIZE ||
      col < 0 ||
      col >= this.BOARD_SIZE
    ) {
      return false;
    }

    // 檢查格子是否為空
    return this.gameState.board[row][col] === this.CELL_STATES.EMPTY;
  }

  /**
   * 獲取遊戲統計資料
   * @returns {Object} 遊戲統計資料
   */
  getGameStats() {
    return {
      currentRound: this.gameState.currentRound,
      totalRounds: this.MAX_ROUNDS,
      totalLines: this.gameState.completedLines.length,
      completedLines: [...this.gameState.completedLines],
      playerMoves: [...this.gameState.playerMoves],
      computerMoves: [...this.gameState.computerMoves],
      gamePhase: this.gameState.gamePhase,
      isGameComplete: this.gameState.isGameComplete,
      remainingMoves: this.getRemainingMoves()
    };
  }

  /**
   * 獲取剩餘可移動的位置
   * @returns {Array} 剩餘可移動位置的陣列
   */
  getRemainingMoves() {
    const remaining = [];
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (this.gameState.board[row][col] === this.CELL_STATES.EMPTY) {
          remaining.push({ row, col });
        }
      }
    }
    return remaining;
  }

  /**
   * 獲取當前遊戲狀態
   * @returns {Object} 當前遊戲狀態
   */
  getGameState() {
    return {
      ...this.gameState,
      board: this.gameState.board.map(row => [...row]) // 深拷貝遊戲板
    };
  }

  /**
   * 獲取最佳移動建議
   * @returns {Object|null} 最佳移動建議
   */
  getBestMove() {
    return this.probabilityCalculator.getBestSuggestion(this.gameState.board);
  }

  /**
   * 檢查遊戲是否完成
   * @returns {boolean} 遊戲是否完成
   */
  isGameComplete() {
    return this.gameState.isGameComplete;
  }

  /**
   * 獲取當前回合數
   * @returns {number} 當前回合數
   */
  getCurrentRound() {
    return this.gameState.currentRound;
  }

  /**
   * 獲取當前遊戲階段
   * @returns {string} 當前遊戲階段
   */
  getCurrentPhase() {
    return this.gameState.gamePhase;
  }

  /**
   * 設置狀態變更回調
   * @param {Function} callback - 狀態變更回調函數
   */
  setOnGameStateChange(callback) {
    this.onGameStateChange = callback;
  }

  /**
   * 設置回合完成回調
   * @param {Function} callback - 回合完成回調函數
   */
  setOnRoundComplete(callback) {
    this.onRoundComplete = callback;
  }

  /**
   * 設置遊戲完成回調
   * @param {Function} callback - 遊戲完成回調函數
   */
  setOnGameComplete(callback) {
    this.onGameComplete = callback;
  }

  /**
   * 設置錯誤處理回調
   * @param {Function} callback - 錯誤處理回調函數
   */
  setOnError(callback) {
    this.onError = callback;
  }

  /**
   * 觸發狀態變更事件
   */
  triggerStateChange() {
    if (this.onGameStateChange) {
      this.onGameStateChange(this.getGameStats());
    }
  }

  /**
   * 觸發錯誤事件
   * @param {string} message - 錯誤訊息
   */
  triggerError(message) {
    if (logger) {
      logger.error('遊戲錯誤：', message);
    }

    if (this.onError) {
      this.onError(message);
    }
  }

  /**
   * 重置遊戲到初始狀態
   */
  reset() {
    this.gameState = {
      board: this.createEmptyBoard(),
      currentRound: 1,
      gamePhase: this.GAME_PHASES.WAITING_START,
      playerMoves: [],
      computerMoves: [],
      completedLines: [],
      isGameComplete: false,
      lastSuggestion: null
    };

    if (this.gameBoard) {
      this.gameBoard.reset();
    }

    if (logger) {
      logger.info('遊戲已重置');
    }
  }

  /**
   * 獲取遊戲進度百分比
   * @returns {number} 遊戲進度百分比 (0-100)
   */
  getGameProgress() {
    return Math.round(
      ((this.gameState.currentRound - 1) / this.MAX_ROUNDS) * 100
    );
  }

  /**
   * 檢查是否可以進行玩家移動
   * @returns {boolean} 是否可以進行玩家移動
   */
  canPlayerMove() {
    return (
      this.gameState.gamePhase === this.GAME_PHASES.PLAYER_TURN &&
      !this.gameState.isGameComplete
    );
  }

  /**
   * 檢查是否可以輸入電腦移動
   * @returns {boolean} 是否可以輸入電腦移動
   */
  canInputComputerMove() {
    return (
      this.gameState.gamePhase === this.GAME_PHASES.COMPUTER_INPUT &&
      !this.gameState.isGameComplete
    );
  }

  /**
   * 獲取遊戲板的副本
   * @returns {number[][]} 遊戲板副本
   */
  getBoardCopy() {
    return this.gameState.board.map(row => [...row]);
  }

  /**
   * 模擬移動（不改變實際遊戲狀態）
   * @param {number} row - 行位置
   * @param {number} col - 列位置
   * @param {number} playerType - 玩家類型
   * @returns {Object} 模擬結果
   */
  simulateMove(row, col, playerType) {
    if (!this.isValidMove(row, col)) {
      return null;
    }

    const testBoard = this.getBoardCopy();
    testBoard[row][col] = playerType;

    const lines = this.lineDetector.getAllLines(testBoard);
    const newLinesCount = lines.length - this.gameState.completedLines.length;

    return {
      board: testBoard,
      newLines: lines,
      newLinesCount: newLinesCount,
      totalLines: lines.length
    };
  }

  /**
   * 記錄遊戲數據用於AI學習
   * @param {Object} finalStats - 最終遊戲統計
   */
  recordGameDataForLearning(finalStats) {
    const gameData = {
      board: this.gameState.board,
      playerMoves: this.gameState.playerMoves,
      computerMoves: this.gameState.computerMoves,
      finalScore: finalStats.totalLines,
      completedLines: finalStats.completedLines,
      gameOutcome: this.determineGameOutcome(finalStats),
      roundsPlayed: this.gameState.currentRound - 1,
      timestamp: Date.now()
    };

    this.aiLearningSystem.recordGameData(gameData);
  }

  /**
   * 確定遊戲結果
   * @param {Object} finalStats - 最終統計
   * @returns {string} 遊戲結果
   */
  determineGameOutcome(finalStats) {
    if (finalStats.totalLines >= 6) return 'excellent';
    if (finalStats.totalLines >= 4) return 'good';
    if (finalStats.totalLines >= 2) return 'average';
    return 'poor';
  }

  /**
   * 獲取遊戲上下文信息
   * @returns {Object} 遊戲上下文
   */
  getGameContext() {
    return {
      currentRound: this.gameState.currentRound,
      maxRounds: this.MAX_ROUNDS,
      playerMoves: this.gameState.playerMoves.length,
      computerMoves: this.gameState.computerMoves.length,
      completedLines: this.gameState.completedLines.length,
      gamePhase: this.gameState.gamePhase,
      remainingMoves: this.getRemainingMoves()
    };
  }

  /**
   * 設置AI學習模式
   * @param {string} mode - 學習模式 ('adaptive', 'personalized', 'traditional')
   */
  setLearningMode(mode) {
    const validModes = ['adaptive', 'personalized', 'traditional'];
    if (validModes.includes(mode)) {
      this.learningMode = mode;
      if (logger) {
        logger.info(`AI學習模式設置為: ${mode}`);
      }
    } else {
      if (logger) {
        logger.warn(`無效的學習模式: ${mode}`);
      }
    }
  }

  /**
   * 啟用或禁用AI學習
   * @param {boolean} enabled - 是否啟用
   */
  setAILearningEnabled(enabled) {
    this.useAILearning = enabled;
    if (logger) {
      logger.info(`AI學習系統${enabled ? '已啟用' : '已禁用'}`);
    }
  }

  /**
   * 獲取AI學習統計
   * @returns {Object} 學習統計信息
   */
  getAILearningStats() {
    if (this.useAILearning && this.aiLearningSystem) {
      return this.aiLearningSystem.getLearningStats();
    }
    return null;
  }

  /**
   * 重置AI學習數據
   */
  resetAILearning() {
    if (this.aiLearningSystem && (typeof AILearningSystem !== 'undefined')) {
      this.aiLearningSystem = new AILearningSystem();
      if (logger) {
        logger.info('AI學習數據已重置');
      }
    }
  }

  /**
   * 獲取當前難度等級
   * @returns {string} 難度等級
   */
  getCurrentDifficulty() {
    if (this.useAILearning && this.aiLearningSystem) {
      return this.aiLearningSystem.difficultySystem.currentLevel;
    }
    return 'medium';
  }

  /**
   * 獲取玩家技能等級
   * @returns {number} 技能等級 (0-1)
   */
  getPlayerSkillLevel() {
    if (this.useAILearning && this.aiLearningSystem) {
      return this.aiLearningSystem.playerModel.skillLevel;
    }
    return 0.5;
  }

  /**
   * 獲取玩家遊戲風格
   * @returns {string} 遊戲風格
   */
  getPlayerStyle() {
    if (this.useAILearning && this.aiLearningSystem) {
      return this.aiLearningSystem.playerModel.playStyle;
    }
    return 'balanced';
  }

  /**
   * 導出學習數據
   * @returns {Object} 學習數據
   */
  exportLearningData() {
    if (this.useAILearning && this.aiLearningSystem) {
      return {
        gameHistory: this.aiLearningSystem.gameHistory,
        playerModel: this.aiLearningSystem.playerModel,
        difficultySystem: this.aiLearningSystem.difficultySystem,
        personalizationSystem: this.aiLearningSystem.personalizationSystem,
        performanceMetrics: this.aiLearningSystem.performanceMetrics
      };
    }
    return null;
  }

  /**
   * 導入學習數據
   * @param {Object} learningData - 學習數據
   */
  importLearningData(learningData) {
    if (this.useAILearning && this.aiLearningSystem && learningData) {
      try {
        if (learningData.gameHistory) {
          this.aiLearningSystem.gameHistory = learningData.gameHistory;
        }
        if (learningData.playerModel) {
          this.aiLearningSystem.playerModel = learningData.playerModel;
        }
        if (learningData.difficultySystem) {
          this.aiLearningSystem.difficultySystem =
            learningData.difficultySystem;
        }
        if (learningData.personalizationSystem) {
          this.aiLearningSystem.personalizationSystem =
            learningData.personalizationSystem;
        }
        if (learningData.performanceMetrics) {
          this.aiLearningSystem.performanceMetrics =
            learningData.performanceMetrics;
        }
        if (logger) {
          logger.info('學習數據導入成功');
        }
      } catch (error) {
        if (logger) {
          logger.error('學習數據導入失敗:', error);
        }
      }
    }
  }

  /**
   * 獲取當前遊戲狀態
   * @returns {Object} 當前遊戲狀態的副本
   */
  getState() {
    return {
      board: this.gameState.board.map(row => [...row]), // 深拷貝遊戲板
      currentRound: this.gameState.currentRound,
      maxRounds: this.MAX_ROUNDS,
      gamePhase: this.gameState.gamePhase,
      playerMoves: [...this.gameState.playerMoves], // 拷貝移動記錄
      computerMoves: [...this.gameState.computerMoves],
      completedLines: [...this.gameState.completedLines],
      isGameComplete: this.gameState.isGameComplete,
      lastSuggestion: this.gameState.lastSuggestion,
      boardSize: this.BOARD_SIZE
    };
  }

  /**
   * 檢查位置是否有效
   * @param {number} row - 行索引
   * @param {number} col - 列索引
   * @returns {boolean} 位置是否有效
   */
  isValidPosition(row, col) {
    return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
  }

  /**
   * 檢查格子是否為空
   * @param {number} row - 行索引
   * @param {number} col - 列索引
   * @returns {boolean} 格子是否為空
   */
  isCellEmpty(row, col) {
    if (!this.isValidPosition(row, col)) {
      return false;
    }
    return this.gameState.board[row][col] === this.CELL_STATES.EMPTY;
  }
}

// 如果在Node.js環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}

// 在瀏覽器環境中，將 GameEngine 添加到全局作用域
if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
}
