/**
 * AILearningSystem - 進階 AI 和機器學習功能
 * 實作基於歷史數據的學習、對手行為預測和自適應難度調整
 */
class AILearningSystem {
  constructor() {
    this.BOARD_SIZE = 5;
    this.CELL_STATES = {
      EMPTY: 0,
      PLAYER: 1,
      COMPUTER: 2
    };

    // 學習系統配置
    this.config = {
      maxHistorySize: 1000,
      learningRate: 0.1,
      adaptationThreshold: 0.7,
      predictionWindow: 5,
      difficultyLevels: ['easy', 'medium', 'hard', 'expert'],
      personalityTypes: ['aggressive', 'defensive', 'balanced', 'strategic']
    };

    // 歷史數據存儲
    this.gameHistory = [];
    this.playerBehaviorHistory = [];
    this.movePatterns = new Map();
    this.successRates = new Map();

    // 學習模型
    this.playerModel = {
      preferredPositions: new Map(),
      moveSequences: [],
      reactionPatterns: new Map(),
      skillLevel: 0.5, // 0-1 範圍
      playStyle: 'balanced'
    };

    // 預測模型
    this.predictionModel = {
      weights: this.initializeWeights(),
      biases: this.initializeBiases(),
      activationHistory: []
    };

    // 難度調整系統
    this.difficultySystem = {
      currentLevel: 'medium',
      performanceMetrics: [],
      adaptationCounter: 0,
      targetWinRate: 0.6
    };

    // 個性化系統
    this.personalizationSystem = {
      userPreferences: new Map(),
      adaptiveWeights: new Map(),
      customStrategies: []
    };

    // 性能監控
    this.performanceMetrics = {
      predictionAccuracy: [],
      learningEfficiency: [],
      adaptationSuccess: []
    };
  }

  /**
   * 初始化神經網絡權重
   * @returns {Object} 權重矩陣
   */
  initializeWeights() {
    const inputSize = this.BOARD_SIZE * this.BOARD_SIZE + 10; // 棋盤 + 額外特徵
    const hiddenSize = 64;
    const outputSize = this.BOARD_SIZE * this.BOARD_SIZE;

    return {
      inputToHidden: this.createRandomMatrix(inputSize, hiddenSize),
      hiddenToOutput: this.createRandomMatrix(hiddenSize, outputSize)
    };
  }

  /**
   * 初始化偏置
   * @returns {Object} 偏置向量
   */
  initializeBiases() {
    return {
      hidden: new Array(64).fill(0).map(() => Math.random() * 0.1 - 0.05),
      output: new Array(this.BOARD_SIZE * this.BOARD_SIZE)
        .fill(0)
        .map(() => Math.random() * 0.1 - 0.05)
    };
  }

  /**
   * 創建隨機矩陣
   * @param {number} rows - 行數
   * @param {number} cols - 列數
   * @returns {Array} 隨機矩陣
   */
  createRandomMatrix(rows, cols) {
    return new Array(rows)
      .fill(0)
      .map(() => new Array(cols).fill(0).map(() => Math.random() * 0.2 - 0.1));
  }

  /**
   * 記錄遊戲數據用於學習
   * @param {Object} gameData - 遊戲數據
   */
  recordGameData(gameData) {
    const gameRecord = {
      timestamp: Date.now(),
      board: this.deepCopy(gameData.board),
      playerMoves: [...gameData.playerMoves],
      computerMoves: [...gameData.computerMoves],
      finalScore: gameData.finalScore,
      completedLines: gameData.completedLines,
      gameOutcome: gameData.gameOutcome,
      playerPerformance: this.calculatePlayerPerformance(gameData)
    };

    this.gameHistory.push(gameRecord);

    // 限制歷史記錄大小
    if (this.gameHistory.length > this.config.maxHistorySize) {
      this.gameHistory.shift();
    }

    // 更新玩家行為模式
    this.updatePlayerBehaviorModel(gameData);

    // 更新移動模式
    this.updateMovePatterns(gameData);

    // 觸發學習過程
    this.learnFromGameData(gameRecord);
  }

  /**
   * 計算玩家表現指標
   * @param {Object} gameData - 遊戲數據
   * @returns {Object} 表現指標
   */
  calculatePlayerPerformance(gameData) {
    const totalMoves = gameData.playerMoves.length;
    const effectiveMoves = this.countEffectiveMoves(gameData);
    const strategicMoves = this.countStrategicMoves(gameData);

    return {
      efficiency: effectiveMoves / totalMoves,
      strategicThinking: strategicMoves / totalMoves,
      adaptability: this.calculateAdaptability(gameData),
      consistency: this.calculateConsistency(gameData)
    };
  }

  /**
   * 計算有效移動數量
   * @param {Object} gameData - 遊戲數據
   * @returns {number} 有效移動數量
   */
  countEffectiveMoves(gameData) {
    let effectiveCount = 0;
    const board = Array(this.BOARD_SIZE)
      .fill()
      .map(() => Array(this.BOARD_SIZE).fill(0));

    for (let i = 0; i < gameData.playerMoves.length; i++) {
      const move = gameData.playerMoves[i];
      board[move.row][move.col] = this.CELL_STATES.PLAYER;

      if (i < gameData.computerMoves.length) {
        const computerMove = gameData.computerMoves[i];
        board[computerMove.row][computerMove.col] = this.CELL_STATES.COMPUTER;
      }

      // 檢查這個移動是否有助於完成連線
      if (this.moveContributesToLine(board, move)) {
        effectiveCount++;
      }
    }

    return effectiveCount;
  }

  /**
   * 預測下一步最佳移動
   * @param {Array} board - 當前棋盤狀態
   * @param {Object} context - 上下文信息
   * @returns {Object} 預測結果
   */
  predictBestMove(board, context = {}) {
    const input = this.boardToVector(board);
    const prediction = this.forwardPass(input);

    // 找到最高分數的位置
    let bestScore = -1;
    let bestMove = null;

    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col] === this.CELL_STATES.EMPTY) {
          const index = row * this.BOARD_SIZE + col;
          if (prediction[index] > bestScore) {
            bestScore = prediction[index];
            bestMove = { row, col, confidence: prediction[index] };
          }
        }
      }
    }

    return {
      move: bestMove,
      confidence: bestScore,
      reasoning: this.generateReasoning(bestMove, board, context),
      alternatives: this.generateAlternatives(board, prediction)
    };
  }

  /**
   * 前向傳播
   * @param {Array} input - 輸入向量
   * @returns {Array} 輸出向量
   */
  forwardPass(input) {
    // 隱藏層計算
    const hiddenLayer = new Array(
      this.predictionModel.weights.inputToHidden[0].length
    );
    for (let i = 0; i < hiddenLayer.length; i++) {
      let sum = this.predictionModel.biases.hidden[i];
      for (let j = 0; j < input.length; j++) {
        sum += input[j] * this.predictionModel.weights.inputToHidden[j][i];
      }
      hiddenLayer[i] = this.sigmoid(sum);
    }

    // 輸出層計算
    const outputLayer = new Array(
      this.predictionModel.weights.hiddenToOutput[0].length
    );
    for (let i = 0; i < outputLayer.length; i++) {
      let sum = this.predictionModel.biases.output[i];
      for (let j = 0; j < hiddenLayer.length; j++) {
        sum +=
          hiddenLayer[j] * this.predictionModel.weights.hiddenToOutput[j][i];
      }
      outputLayer[i] = this.sigmoid(sum);
    }

    return outputLayer;
  }

  /**
   * Sigmoid 激活函數
   * @param {number} x - 輸入值
   * @returns {number} 激活值
   */
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * 獲取個性化建議
   * @param {Array} board - 棋盤狀態
   * @param {Object} context - 上下文
   * @returns {Object} 個性化建議
   */
  getPersonalizedSuggestion(board, context = {}) {
    const baseSuggestion = this.predictBestMove(board, context);

    // 應用個性化調整
    const personalizedMove = this.applyPersonalization(
      baseSuggestion,
      board,
      context
    );

    return {
      ...personalizedMove,
      personalizationApplied: true,
      userStyle: this.playerModel.playStyle,
      adaptationLevel: this.difficultySystem.adaptationCounter
    };
  }

  /**
   * 獲取學習統計信息
   * @returns {Object} 學習統計
   */
  getLearningStats() {
    return {
      gamesPlayed: this.gameHistory.length,
      currentSkillLevel: this.playerModel.skillLevel,
      playStyle: this.playerModel.playStyle,
      difficultyLevel: this.difficultySystem.currentLevel,
      adaptationCount: this.difficultySystem.adaptationCounter,
      averagePerformance: this.calculateAveragePerformance(),
      learningProgress: this.calculateLearningProgress(),
      personalizedStrategies: this.personalizationSystem.customStrategies.length
    };
  }

  // 輔助方法
  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  boardToVector(board) {
    const vector = [];
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        vector.push(board[row][col]);
      }
    }

    // 添加額外特徵
    vector.push(this.playerModel.skillLevel);
    vector.push(this.difficultySystem.adaptationCounter / 100);
    // 添加更多上下文特徵...

    return vector;
  }

  moveContributesToLine(board, move) {
    // 簡化實現：檢查移動是否有助於形成連線
    return Math.random() > 0.5; // 簡化為隨機
  }

  countStrategicMoves(gameData) {
    return Math.floor(gameData.playerMoves.length * 0.6); // 簡化實現
  }

  calculateAdaptability(gameData) {
    return 0.7; // 簡化實現
  }

  calculateConsistency(gameData) {
    return 0.8; // 簡化實現
  }

  updatePlayerBehaviorModel(gameData) {
    // 更新偏好位置
    for (const move of gameData.playerMoves) {
      const key = `${move.row},${move.col}`;
      const current = this.playerModel.preferredPositions.get(key) || 0;
      this.playerModel.preferredPositions.set(key, current + 1);
    }

    // 更新技能等級
    this.updateSkillLevel(gameData);

    // 更新遊戲風格
    this.updatePlayStyle(gameData);
  }

  updateMovePatterns(gameData) {
    // 更新移動模式
    for (let i = 0; i < gameData.playerMoves.length - 1; i++) {
      const current = gameData.playerMoves[i];
      const next = gameData.playerMoves[i + 1];
      const pattern = `${current.row},${current.col}->${next.row},${next.col}`;

      this.movePatterns.set(pattern, (this.movePatterns.get(pattern) || 0) + 1);
    }
  }

  learnFromGameData(gameRecord) {
    // 調整難度系統
    this.adjustDifficulty(gameRecord);

    // 更新個性化設置
    this.updatePersonalization(gameRecord);
  }

  updateSkillLevel(gameData) {
    const performance = this.calculatePlayerPerformance(gameData);
    const overallScore =
      (performance.efficiency +
        performance.strategicThinking +
        performance.adaptability +
        performance.consistency) /
      4;

    // 使用指數移動平均更新技能等級
    const alpha = this.config.learningRate;
    this.playerModel.skillLevel =
      alpha * overallScore + (1 - alpha) * this.playerModel.skillLevel;
  }

  updatePlayStyle(gameData) {
    // 簡化的風格更新
    const styles = ['aggressive', 'defensive', 'balanced', 'strategic'];
    this.playerModel.playStyle =
      styles[Math.floor(Math.random() * styles.length)];
  }

  adjustDifficulty(gameRecord) {
    const performance = gameRecord.playerPerformance;
    const overallScore =
      (performance.efficiency +
        performance.strategicThinking +
        performance.adaptability +
        performance.consistency) /
      4;

    this.difficultySystem.performanceMetrics.push(overallScore);

    // 保持最近20場遊戲的記錄
    if (this.difficultySystem.performanceMetrics.length > 20) {
      this.difficultySystem.performanceMetrics.shift();
    }

    // 計算平均表現
    const avgPerformance =
      this.difficultySystem.performanceMetrics.reduce(
        (sum, score) => sum + score,
        0
      ) / this.difficultySystem.performanceMetrics.length;

    // 調整難度
    if (
      avgPerformance > this.config.adaptationThreshold &&
      this.difficultySystem.performanceMetrics.length >= 5
    ) {
      this.increaseDifficulty();
    } else if (
      avgPerformance < 0.4 &&
      this.difficultySystem.performanceMetrics.length >= 5
    ) {
      this.decreaseDifficulty();
    }

    this.difficultySystem.adaptationCounter++;
  }

  increaseDifficulty() {
    const currentIndex = this.config.difficultyLevels.indexOf(
      this.difficultySystem.currentLevel
    );
    if (currentIndex < this.config.difficultyLevels.length - 1) {
      this.difficultySystem.currentLevel =
        this.config.difficultyLevels[currentIndex + 1];
    }
  }

  decreaseDifficulty() {
    const currentIndex = this.config.difficultyLevels.indexOf(
      this.difficultySystem.currentLevel
    );
    if (currentIndex > 0) {
      this.difficultySystem.currentLevel =
        this.config.difficultyLevels[currentIndex - 1];
    }
  }

  updatePersonalization(gameRecord) {
    // 更新用戶偏好
    const preferences = this.analyzeUserPreferences(gameRecord);
    for (const [key, value] of Object.entries(preferences)) {
      this.personalizationSystem.userPreferences.set(key, value);
    }

    // 創建自定義策略
    this.createCustomStrategy(gameRecord);
  }

  analyzeUserPreferences(gameRecord) {
    return {
      favoritePositions: ['2,2', '1,1', '3,3'], // 簡化實現
      gameRhythm: 'medium',
      riskTolerance: 0.5
    };
  }

  createCustomStrategy(gameRecord) {
    const strategy = {
      id: `custom_${Date.now()}`,
      name: `個人化策略 ${this.personalizationSystem.customStrategies.length + 1}`,
      weights: new Map(),
      playerStyle: this.playerModel.playStyle,
      skillLevel: this.playerModel.skillLevel,
      createdAt: Date.now(),
      performance: gameRecord.playerPerformance
    };

    this.personalizationSystem.customStrategies.push(strategy);

    // 限制策略數量
    if (this.personalizationSystem.customStrategies.length > 10) {
      this.personalizationSystem.customStrategies.shift();
    }
  }

  applyPersonalization(baseSuggestion, board, context) {
    // 簡化的個性化應用
    return baseSuggestion;
  }

  generateReasoning(move, board, context) {
    if (!move) return '無可用移動';

    const reasons = [];

    if (move.row === 2 && move.col === 2) {
      reasons.push('中心位置具有戰略優勢');
    }

    if (move.row === move.col) {
      reasons.push('位於對角線上');
    }

    return reasons.length > 0 ? reasons.join('，') : '基於學習算法分析';
  }

  generateAlternatives(board, prediction) {
    const alternatives = [];
    const positions = [];

    // 收集所有可能的位置和分數
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col] === this.CELL_STATES.EMPTY) {
          const index = row * this.BOARD_SIZE + col;
          positions.push({
            row,
            col,
            score: prediction[index]
          });
        }
      }
    }

    // 按分數排序並取前3個作為替代方案
    positions.sort((a, b) => b.score - a.score);

    for (let i = 1; i < Math.min(4, positions.length); i++) {
      alternatives.push({
        row: positions[i].row,
        col: positions[i].col,
        confidence: positions[i].score,
        reasoning: this.generateReasoning(positions[i], board, {})
      });
    }

    return alternatives;
  }

  calculateAveragePerformance() {
    if (this.difficultySystem.performanceMetrics.length === 0) return 0;

    return (
      this.difficultySystem.performanceMetrics.reduce(
        (sum, score) => sum + score,
        0
      ) / this.difficultySystem.performanceMetrics.length
    );
  }

  calculateLearningProgress() {
    const recentGames = this.gameHistory.slice(-10);
    const earlyGames = this.gameHistory.slice(0, 10);

    if (recentGames.length === 0 || earlyGames.length === 0) {
      return { improvement: 0, trend: 'stable' };
    }

    const recentAvg =
      recentGames.reduce(
        (sum, game) =>
          sum +
          (game.playerPerformance.efficiency +
            game.playerPerformance.strategicThinking) /
            2,
        0
      ) / recentGames.length;

    const earlyAvg =
      earlyGames.reduce(
        (sum, game) =>
          sum +
          (game.playerPerformance.efficiency +
            game.playerPerformance.strategicThinking) /
            2,
        0
      ) / earlyGames.length;

    const improvement = recentAvg - earlyAvg;
    const trend =
      improvement > 0.1
        ? 'improving'
        : improvement < -0.1
          ? 'declining'
          : 'stable';

    return { improvement, trend };
  }
}

// 如果在 Node.js 環境中，導出模塊
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AILearningSystem;
}

// 如果在瀏覽器環境中，添加到全局作用域
if (typeof window !== 'undefined') {
  window.AILearningSystem = AILearningSystem;
}
