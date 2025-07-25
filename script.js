// Constants for game state management
const CELL_STATES = {
    EMPTY: 0,
    PLAYER: 1,
    COMPUTER: 2
};

const GAME_PHASES = {
    WAITING: 'waiting',
    PLAYER_TURN: 'player-turn',
    COMPUTER_TURN: 'computer-turn',
    GAME_OVER: 'game-over'
};

const LINE_TYPES = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    DIAGONAL_MAIN: 'diagonal-main',
    DIAGONAL_ANTI: 'diagonal-anti'
};

// Custom error class for game-related errors
class GameError extends Error {
    constructor(message, type) {
        super(message);
        this.name = 'GameError';
        this.type = type;
    }
}

const ERROR_TYPES = {
    INVALID_MOVE: 'invalid-move',
    CELL_OCCUPIED: 'cell-occupied',
    GAME_OVER: 'game-over',
    INVALID_PHASE: 'invalid-phase'
};

/**
 * GameState class manages the complete state of the Bingo game
 */
class GameState {
    constructor(boardSize = 5, maxRounds = 8) {
        this.boardSize = boardSize;
        this.maxRounds = maxRounds;
        this.reset();
    }

    reset() {
        this.board = Array(this.boardSize).fill().map(() => 
            Array(this.boardSize).fill(CELL_STATES.EMPTY)
        );
        this.currentRound = 1;
        this.gamePhase = GAME_PHASES.WAITING;
        this.playerMoves = [];
        this.computerMoves = [];
        this.completedLines = [];
        this.gameStarted = false;
        this.gameEnded = false;
    }

    startGame() {
        this.reset();
        this.gameStarted = true;
        this.gamePhase = GAME_PHASES.PLAYER_TURN;
    }

    getState() {
        return {
            board: this.board.map(row => [...row]),
            currentRound: this.currentRound,
            maxRounds: this.maxRounds,
            gamePhase: this.gamePhase,
            playerMoves: [...this.playerMoves],
            computerMoves: [...this.computerMoves],
            completedLines: [...this.completedLines],
            gameStarted: this.gameStarted,
            gameEnded: this.gameEnded,
            boardSize: this.boardSize
        };
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && 
               col >= 0 && col < this.boardSize;
    }

    isCellEmpty(row, col) {
        if (!this.isValidPosition(row, col)) {
            return false;
        }
        return this.board[row][col] === CELL_STATES.EMPTY;
    }

    makePlayerMove(row, col) {
        this.validateMove(row, col, GAME_PHASES.PLAYER_TURN);
        
        this.board[row][col] = CELL_STATES.PLAYER;
        this.playerMoves.push({ row, col, round: this.currentRound });
        this.gamePhase = GAME_PHASES.COMPUTER_TURN;
        
        return true;
    }

    makeComputerMove(row, col) {
        this.validateMove(row, col, GAME_PHASES.COMPUTER_TURN);
        
        this.board[row][col] = CELL_STATES.COMPUTER;
        this.computerMoves.push({ row, col, round: this.currentRound });
        
        this.advanceRound();
        return true;
    }

    validateMove(row, col, expectedPhase) {
        if (!this.gameStarted) {
            throw new GameError('Game has not started', ERROR_TYPES.INVALID_PHASE);
        }

        if (this.gameEnded) {
            throw new GameError('Game has already ended', ERROR_TYPES.GAME_OVER);
        }

        if (this.gamePhase !== expectedPhase) {
            throw new GameError(`Invalid game phase. Expected: ${expectedPhase}, Current: ${this.gamePhase}`, ERROR_TYPES.INVALID_PHASE);
        }

        if (!this.isValidPosition(row, col)) {
            throw new GameError(`Invalid position: (${row}, ${col})`, ERROR_TYPES.INVALID_MOVE);
        }

        if (!this.isCellEmpty(row, col)) {
            throw new GameError(`Cell (${row}, ${col}) is already occupied`, ERROR_TYPES.CELL_OCCUPIED);
        }
    }

    advanceRound() {
        if (this.currentRound >= this.maxRounds) {
            this.endGame();
        } else {
            this.currentRound++;
            this.gamePhase = GAME_PHASES.PLAYER_TURN;
        }
    }

    endGame() {
        this.gamePhase = GAME_PHASES.GAME_OVER;
        this.gameEnded = true;
    }

    updateCompletedLines(lines) {
        this.completedLines = [...lines];
    }

    getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === CELL_STATES.EMPTY) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    isGameComplete() {
        return this.gameEnded || this.currentRound > this.maxRounds;
    }
}

// Global game instances
let gameState = null;
let gameBoard = null;
let lineDetector = null;
let probabilityCalculator = null;

/**
 * Initialize the game when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    
    // 檢查瀏覽器兼容性
    const compatibility = initializeCompatibilityCheck();
    
    // 初始化漸進式載入
    initializeProgressiveLoading();
    
    // Show loading state
    try {
        showGlobalLoading('正在檢查系統兼容性...');
    } catch (error) {
        console.error('Error showing loading state:', error);
        // Continue initialization even if showing loading state fails
    }
    
    // Initialize game with progressive loading
    setTimeout(() => {
        try {
            showGlobalLoading('正在初始化遊戲組件...');
            initializeGameWithProgressiveLoading();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            try {
                hideGlobalLoading();
                showErrorModal('遊戲初始化失敗', error.message, {
                    showRetry: true,
                    onRetry: () => {
                        location.reload();
                    }
                });
            } catch (modalError) {
                console.error('Error showing error modal:', modalError);
                alert('遊戲初始化失敗：' + error.message);
            }
        }
    }, 500);
});

/**
 * Initialize game with progressive loading
 */
function initializeGameWithProgressiveLoading() {
    console.log('Starting progressive game initialization...');
    
    // 使用 requestAnimationFrame 來優化性能
    requestAnimationFrame(() => {
        try {
            // Step 1: Initialize game state
            showGlobalLoading('正在初始化遊戲狀態...');
            gameState = new GameState();
            progressiveLoader.markComponentLoaded('GameState');
            
            requestAnimationFrame(() => {
                // Step 2: Initialize line detector
                showGlobalLoading('正在載入連線檢測器...');
                lineDetector = new LineDetector();
                progressiveLoader.markComponentLoaded('LineDetector');
                
                requestAnimationFrame(() => {
                    // Step 3: Initialize probability calculator
                    showGlobalLoading('正在載入機率計算器...');
                    probabilityCalculator = new ProbabilityCalculator();
                    progressiveLoader.markComponentLoaded('ProbabilityCalculator');
                    
                    requestAnimationFrame(() => {
                        // Step 4: Initialize game board
                        showGlobalLoading('正在初始化遊戲板...');
                        gameBoard = new GameBoard('game-board');
                        gameBoard.setClickHandler(handleCellClick);
                        progressiveLoader.markComponentLoaded('GameBoard');
                        
                        requestAnimationFrame(() => {
                            // Step 5: Setup UI event listeners
                            showGlobalLoading('正在設置用戶界面...');
                            setupUIEventListeners();
                            progressiveLoader.markComponentLoaded('UI');
                            
                            console.log('Game initialized successfully with progressive loading');
                            showSuccessMessage('遊戲載入完成！');
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Failed to initialize game:', error);
            hideGlobalLoading();
            showErrorModal('遊戲初始化失敗', error.message, {
                showRetry: true,
                onRetry: () => {
                    location.reload();
                }
            });
        }
    });
}

/**
 * Initialize all game components
 */
function initializeGame() {
    try {
        console.log('Starting game initialization...');
        
        // Initialize game components
        gameState = new GameState();
        gameBoard = new GameBoard('game-board');
        lineDetector = new LineDetector();
        probabilityCalculator = new ProbabilityCalculator();
        
        // Initialize AI learning system if available
        if (typeof AILearningSystem !== 'undefined') {
            aiLearningSystem = new AILearningSystem();
            console.log('AI Learning System initialized');
        }
        
        console.log('Game components created');
        
        // Set up game board click handler
        gameBoard.setClickHandler(handleCellClick);
        
        // Set up UI event listeners
        setupUIEventListeners();
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('遊戲初始化失敗：' + error.message);
    }
}

/**
 * Set up UI event listeners
 */
function setupUIEventListeners() {
    console.log('Setting up UI event listeners...');
    
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart-game');
    const confirmComputerMoveButton = document.getElementById('confirm-computer-move');
    const randomComputerMoveButton = document.getElementById('random-computer-move');
    const playAgainButton = document.getElementById('play-again');
    
    // 設置無障礙功能
    setupAccessibilityFeatures();
    
    if (startButton) {
        console.log('Found start button, adding event listener');
        startButton.addEventListener('click', function() {
            console.log('Start button clicked');
            startNewGame();
        });
    } else {
        console.error('Start button not found!');
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    }
    
    if (confirmComputerMoveButton) {
        confirmComputerMoveButton.addEventListener('click', handleComputerMove);
    }
    
    if (randomComputerMoveButton) {
        console.log('Found random computer move button, adding event listener');
        randomComputerMoveButton.addEventListener('click', function() {
            console.log('Random computer move button clicked');
            makeRandomComputerMove();
        });
    } else {
        console.error('Random computer move button not found!');
    }
    
    if (playAgainButton) {
        playAgainButton.addEventListener('click', handlePlayAgain);
    }
    
    // AI 學習系統事件監聽器
    setupAILearningEventListeners();
    
    console.log('UI event listeners setup complete');
}

/**
 * 設置無障礙功能
 */
function setupAccessibilityFeatures() {
    console.log('Setting up accessibility features...');
    
    // 為遊戲板添加鍵盤導航支持
    setupKeyboardNavigation();
    
    // 設置 ARIA 標籤和角色
    setupARIALabels();
    
    // 設置螢幕閱讀器支持
    setupScreenReaderSupport();
    
    // 檢測用戶偏好設置
    detectUserPreferences();
}

/**
 * 設置鍵盤導航
 */
function setupKeyboardNavigation() {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;
    
    let focusedRow = 0;
    let focusedCol = 0;
    
    // 為遊戲板添加 tabindex 使其可聚焦
    gameBoard.setAttribute('tabindex', '0');
    gameBoard.setAttribute('role', 'grid');
    gameBoard.setAttribute('aria-label', '5x5 Bingo 遊戲板');
    
    // 鍵盤事件處理
    gameBoard.addEventListener('keydown', function(event) {
        if (!gameState || !gameState.gameStarted || gameState.gameEnded) {
            return;
        }
        
        let handled = false;
        
        switch (event.key) {
            case 'ArrowUp':
                focusedRow = Math.max(0, focusedRow - 1);
                handled = true;
                break;
            case 'ArrowDown':
                focusedRow = Math.min(4, focusedRow + 1);
                handled = true;
                break;
            case 'ArrowLeft':
                focusedCol = Math.max(0, focusedCol - 1);
                handled = true;
                break;
            case 'ArrowRight':
                focusedCol = Math.min(4, focusedCol + 1);
                handled = true;
                break;
            case 'Enter':
            case ' ':
                handleCellClick(focusedRow, focusedCol);
                handled = true;
                break;
        }
        
        if (handled) {
            event.preventDefault();
            updateKeyboardFocus(focusedRow, focusedCol);
            announceCurrentPosition(focusedRow, focusedCol);
        }
    });
    
    // 初始焦點
    updateKeyboardFocus(0, 0);
}

/**
 * 更新鍵盤焦點視覺指示
 */
function updateKeyboardFocus(row, col) {
    // 移除所有現有焦點
    document.querySelectorAll('.game-cell.keyboard-focus').forEach(cell => {
        cell.classList.remove('keyboard-focus');
    });
    
    // 添加新焦點
    const cells = document.querySelectorAll('.game-cell');
    const targetCell = cells[row * 5 + col];
    if (targetCell) {
        targetCell.classList.add('keyboard-focus');
        targetCell.setAttribute('aria-selected', 'true');
    }
    
    // 移除其他格子的 aria-selected
    cells.forEach((cell, index) => {
        if (index !== row * 5 + col) {
            cell.setAttribute('aria-selected', 'false');
        }
    });
}

/**
 * 設置 ARIA 標籤
 */
function setupARIALabels() {
    // 遊戲狀態區域
    const gameStatus = document.querySelector('.game-status');
    if (gameStatus) {
        gameStatus.setAttribute('role', 'status');
        gameStatus.setAttribute('aria-live', 'polite');
        gameStatus.setAttribute('aria-label', '遊戲狀態信息');
    }
    
    // 建議區域
    const suggestionArea = document.querySelector('.suggestion-area');
    if (suggestionArea) {
        suggestionArea.setAttribute('role', 'region');
        suggestionArea.setAttribute('aria-label', '移動建議');
        suggestionArea.setAttribute('aria-live', 'polite');
    }
    
    // 按鈕標籤
    const startButton = document.getElementById('start-game');
    if (startButton) {
        startButton.setAttribute('aria-describedby', 'game-instructions');
    }
    
    // 遊戲板格子
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 5) + 1;
        const col = (index % 5) + 1;
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `第${row}行第${col}列`);
        cell.setAttribute('aria-selected', 'false');
        cell.setAttribute('tabindex', '-1');
    });
}

/**
 * 設置螢幕閱讀器支持
 */
function setupScreenReaderSupport() {
    // 創建螢幕閱讀器專用的狀態更新區域
    const srStatus = document.createElement('div');
    srStatus.id = 'sr-status';
    srStatus.setAttribute('aria-live', 'assertive');
    srStatus.setAttribute('aria-atomic', 'true');
    srStatus.style.position = 'absolute';
    srStatus.style.left = '-10000px';
    srStatus.style.width = '1px';
    srStatus.style.height = '1px';
    srStatus.style.overflow = 'hidden';
    document.body.appendChild(srStatus);
}

/**
 * 宣告當前位置（螢幕閱讀器）
 */
function announceCurrentPosition(row, col) {
    const srStatus = document.getElementById('sr-status');
    if (!srStatus) return;
    
    const board = gameState ? gameState.getState().board : null;
    if (!board) return;
    
    let cellState = '';
    switch (board[row][col]) {
        case 1:
            cellState = '玩家已選擇';
            break;
        case 2:
            cellState = '電腦已選擇';
            break;
        default:
            cellState = '空格子';
    }
    
    srStatus.textContent = `第${row + 1}行第${col + 1}列，${cellState}`;
}

/**
 * 宣告遊戲狀態變化
 */
function announceGameStateChange(message) {
    const srStatus = document.getElementById('sr-status');
    if (srStatus) {
        srStatus.textContent = message;
    }
}

/**
 * 檢測用戶偏好設置
 */
function detectUserPreferences() {
    // 檢測減少動畫偏好
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
        console.log('Reduced motion preference detected');
    }
    
    // 檢測高對比度偏好
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
        console.log('High contrast preference detected');
    }
    
    // 檢測深色模式偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        console.log('Dark mode preference detected');
    }
}

/**
 * 設置 AI 學習系統的事件監聽器
 */
function setupAILearningEventListeners() {
    // 算法選擇器
    const algorithmOptions = document.querySelectorAll('.algorithm-option');
    algorithmOptions.forEach(option => {
        option.addEventListener('click', function() {
            const algorithm = this.dataset.algorithm;
            selectAlgorithm(algorithm);
        });
    });
    
    // AI 學習控制按鈕
    const resetAIButton = document.getElementById('reset-ai-learning');
    if (resetAIButton) {
        resetAIButton.addEventListener('click', resetAILearning);
    }
    
    const exportDataButton = document.getElementById('export-learning-data');
    if (exportDataButton) {
        exportDataButton.addEventListener('click', exportLearningData);
    }
    
    const importDataButton = document.getElementById('import-learning-data-btn');
    const importDataInput = document.getElementById('import-learning-data');
    if (importDataButton && importDataInput) {
        importDataButton.addEventListener('click', () => importDataInput.click());
        importDataInput.addEventListener('change', importLearningData);
    }
}

/**
 * 選擇算法
 * @param {string} algorithm - 算法類型
 */
function selectAlgorithm(algorithm) {
    // 更新 UI 選擇狀態
    document.querySelectorAll('.algorithm-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[data-algorithm="${algorithm}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // 更新當前算法顯示
    const currentAlgorithmName = document.getElementById('current-algorithm-name');
    const algorithmNames = {
        'standard': '標準演算法',
        'enhanced': '增強演算法',
        'ai-learning': 'AI 學習演算法'
    };
    
    if (currentAlgorithmName) {
        currentAlgorithmName.textContent = algorithmNames[algorithm] || '未知演算法';
    }
    
    // 顯示或隱藏 AI 學習狀態面板
    const aiStatusPanel = document.getElementById('ai-learning-status');
    if (aiStatusPanel) {
        if (algorithm === 'ai-learning') {
            aiStatusPanel.classList.remove('hidden');
            updateAILearningStatus();
        } else {
            aiStatusPanel.classList.add('hidden');
        }
    }
    
    // 更新遊戲引擎的算法設置
    if (typeof gameEngine !== 'undefined' && gameEngine) {
        switch (algorithm) {
            case 'ai-learning':
                gameEngine.setAILearningEnabled(true);
                gameEngine.setLearningMode('personalized');
                break;
            case 'enhanced':
                gameEngine.setAILearningEnabled(false);
                // 這裡可以設置使用增強算法
                break;
            default:
                gameEngine.setAILearningEnabled(false);
                // 使用標準算法
                break;
        }
    }
    
    console.log(`算法切換至: ${algorithm}`);
}

/**
 * 更新 AI 學習系統狀態顯示
 */
function updateAILearningStatus() {
    if (typeof gameEngine === 'undefined' || !gameEngine || !gameEngine.aiLearningSystem) {
        return;
    }
    
    const learningStats = gameEngine.getAILearningStats();
    if (!learningStats) return;
    
    // 更新技能等級
    const skillLevelElement = document.getElementById('skill-level');
    if (skillLevelElement) {
        skillLevelElement.textContent = `${Math.round(learningStats.currentSkillLevel * 100)}%`;
    }
    
    // 更新遊戲風格
    const playStyleElement = document.getElementById('play-style');
    if (playStyleElement) {
        const styleNames = {
            'aggressive': '攻擊型',
            'defensive': '防守型',
            'balanced': '平衡型',
            'strategic': '策略型'
        };
        playStyleElement.textContent = styleNames[learningStats.playStyle] || '未知';
    }
    
    // 更新難度等級
    const difficultyElement = document.getElementById('difficulty-level');
    if (difficultyElement) {
        const difficultyNames = {
            'easy': '簡單',
            'medium': '中等',
            'hard': '困難',
            'expert': '專家'
        };
        difficultyElement.textContent = difficultyNames[learningStats.difficultyLevel] || '未知';
    }
    
    // 更新已玩遊戲數
    const gamesPlayedElement = document.getElementById('games-played');
    if (gamesPlayedElement) {
        gamesPlayedElement.textContent = learningStats.gamesPlayed.toString();
    }
}

/**
 * 重置 AI 學習數據
 */
function resetAILearning() {
    if (confirm('確定要重置所有 AI 學習數據嗎？此操作無法撤銷。')) {
        if (typeof gameEngine !== 'undefined' && gameEngine) {
            gameEngine.resetAILearning();
            updateAILearningStatus();
            showSuccessMessage('AI 學習數據已重置');
        }
    }
}

/**
 * 導出學習數據
 */
function exportLearningData() {
    if (typeof gameEngine === 'undefined' || !gameEngine) {
        showErrorMessage('遊戲引擎未初始化');
        return;
    }
    
    const learningData = gameEngine.exportLearningData();
    if (!learningData) {
        showErrorMessage('沒有學習數據可導出');
        return;
    }
    
    const dataStr = JSON.stringify(learningData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `bingo-ai-learning-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showSuccessMessage('學習數據已導出');
}

/**
 * 導入學習數據
 * @param {Event} event - 文件選擇事件
 */
function importLearningData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const learningData = JSON.parse(e.target.result);
            
            if (typeof gameEngine !== 'undefined' && gameEngine) {
                gameEngine.importLearningData(learningData);
                updateAILearningStatus();
                showSuccessMessage('學習數據導入成功');
            }
        } catch (error) {
            console.error('導入學習數據失敗:', error);
            showErrorMessage('學習數據格式錯誤');
        }
    };
    
    reader.readAsText(file);
    
    // 清除文件選擇
    event.target.value = '';
}

/**
 * Check if auto random move is enabled and execute a random computer move if it is
 */
function checkAutoRandomMove() {
    try {
        console.log('Checking auto random move setting');
        const autoRandomCheckbox = document.getElementById('auto-random-move');
        console.log('Auto random checkbox element:', autoRandomCheckbox);
        console.log('Auto random checkbox checked:', autoRandomCheckbox ? autoRandomCheckbox.checked : 'element not found');
        
        if (autoRandomCheckbox && autoRandomCheckbox.checked && 
            gameState && gameState.gamePhase === GAME_PHASES.COMPUTER_TURN) {
            console.log('Auto random move is enabled, executing after short delay');
            
            // 添加短暂延迟，让用户能看清楚玩家的移动
            setTimeout(() => {
                makeRandomComputerMove();
            }, 500);
        } else {
            console.log('Auto random move is disabled or not applicable');
        }
    } catch (error) {
        console.error('Error checking auto random move:', error);
    }
}

/**
 * Handle cell click events from the game board (optimized with debouncing)
 */
const handleCellClick = debounce(function(row, col, cellElement) {
    try {
        console.log(`Cell clicked: (${row}, ${col})`);
        
        // Enhanced input validation
        if (typeof row !== 'number' || typeof col !== 'number' || 
            row < 0 || row >= 5 || col < 0 || col >= 5) {
            console.error('Invalid cell coordinates:', row, col);
            showWarningMessage('無效的格子位置');
            return;
        }
        
        // 如果游戏未开始或已结束，不处理点击
        if (!gameState || !gameState.gameStarted || gameState.gameEnded) {
            console.log('Game not started or already ended');
            showWarningMessage('遊戲尚未開始或已結束');
            return;
        }
        
        // 添加視覺反饋
        if (cellElement) {
            cellElement.classList.add('placing');
            setTimeout(() => {
                cellElement.classList.remove('placing');
            }, 400);
        }
        
        // 玩家回合处理
        if (gameState.gamePhase === GAME_PHASES.PLAYER_TURN) {
            // 确保格子为空
            if (!gameState.isCellEmpty(row, col)) {
                console.log('Cell already occupied');
                showWarningMessage('此位置已被佔用，請選擇其他位置');
                return;
            }
            
            // 显示加载状态
            showGameBoardLoading();
            
            // 使用 requestAnimationFrame 优化性能
            requestAnimationFrame(() => {
                try {
                    // 执行玩家移动
                    gameState.makePlayerMove(row, col);
                    
                    // 更新UI
                    gameBoard.updateCell(row, col, CELL_STATES.PLAYER);
                    gameBoard.clearSuggestionHighlight();
                    
                    // 检查连线
                    updateCompletedLines();
                    
                    // 更新游戏状态
                    updateGameStatus();
                    
                    // 更新指示
                    updateInstructions('電腦回合 - 請點擊一個空格子作為電腦的移動');
                    
                    console.log('Player move completed, now computer turn');
                    
                    // 隐藏加载状态
                    hideGameBoardLoading();
                    
                    // 检查是否需要自动随机下棋
                    checkAutoRandomMove();
                } catch (moveError) {
                    hideGameBoardLoading();
                    throw moveError;
                }
            });
        }
        // 电脑回合处理
        else if (gameState.gamePhase === GAME_PHASES.COMPUTER_TURN) {
            // 确保格子为空
            if (!gameState.isCellEmpty(row, col)) {
                console.log('Cell already occupied');
                showWarningMessage('此位置已被佔用，請選擇其他位置');
                return;
            }
            
            // 显示加载状态
            showGameBoardLoading();
            
            // 使用 requestAnimationFrame 优化性能
            requestAnimationFrame(() => {
                try {
                    // 执行电脑移动
                    gameState.makeComputerMove(row, col);
                    
                    // 更新UI
                    gameBoard.updateCell(row, col, CELL_STATES.COMPUTER);
                    
                    // 检查连线
                    updateCompletedLines();
                    
                    // 更新游戏状态
                    updateGameStatus();
                    
                    // 隐藏加载状态
                    hideGameBoardLoading();
                    
                    // 检查游戏是否结束
                    if (gameState.isGameComplete()) {
                        endGame();
                    } else {
                        // 显示下一步建议
                        showPlayerSuggestion();
                        
                        // 更新指示
                        updateInstructions('玩家回合 - 請選擇一個格子進行移動');
                        
                        console.log('Computer move completed, now player turn');
                    }
                } catch (moveError) {
                    hideGameBoardLoading();
                    throw moveError;
                }
            });
        } else {
            showWarningMessage('現在不是有效的遊戲階段');
        }
        
    } catch (error) {
        console.error('Error handling cell click:', error);
        hideGameBoardLoading();
        
        // 使用增強的錯誤處理
        if (error instanceof GameError) {
            switch (error.type) {
                case ERROR_TYPES.CELL_OCCUPIED:
                    showWarningMessage('此位置已被佔用，請選擇其他位置');
                    break;
                case ERROR_TYPES.INVALID_MOVE:
                    showWarningMessage('無效的移動位置');
                    break;
                case ERROR_TYPES.INVALID_PHASE:
                    showWarningMessage('現在不是有效的遊戲階段');
                    break;
                case ERROR_TYPES.GAME_OVER:
                    showWarningMessage('遊戲已結束');
                    break;
                default:
                    showErrorModal('移動失敗', error.message);
            }
        } else {
            showErrorModal('移動失敗', error.message, {
                showRetry: true,
                onRetry: () => {
                    handleCellClick(row, col, cellElement);
                }
            });
        }
    }
}, 100); // 100ms debounce to prevent rapid clicks

/**
 * Start a new game
 */
function startNewGame() {
    try {
        console.log('Starting new game...');
        
        if (!gameState) {
            console.error('Game state not initialized');
            return;
        }
        
        gameState.startGame();
        gameBoard.reset();
        
        // Update UI
        updateGameStatus();
        
        // Show suggestion for first move
        showPlayerSuggestion();
        
        // Enable/disable buttons
        const startBtn = document.getElementById('start-game');
        const restartBtn = document.getElementById('restart-game');
        
        if (startBtn) startBtn.disabled = true;
        if (restartBtn) restartBtn.disabled = false;
        
        // Hide results modal if visible
        hideGameResults();
        
        console.log('New game started successfully');
        
    } catch (error) {
        console.error('Error starting new game:', error);
        alert('開始新遊戲失敗：' + error.message);
    }
}

/**
 * Restart the current game
 */
function restartGame() {
    startNewGame();
}

/**
 * Show suggestion for player's next move (enhanced with visual improvements)
 */
function showPlayerSuggestion() {
    try {
        if (!gameState || !probabilityCalculator) {
            console.warn('Game state or probability calculator not available');
            return;
        }
        
        const currentBoard = gameState.getState().board;
        const suggestionDisplay = document.getElementById('suggestion-display');
        
        // Validate board state
        if (!currentBoard || !Array.isArray(currentBoard) || currentBoard.length !== 5) {
            console.error('Invalid board state');
            showWarningMessage('遊戲狀態異常，請重新開始遊戲');
            return;
        }
        
        // 顯示載入狀態
        if (suggestionDisplay) {
            suggestionDisplay.classList.add('loading');
        }
        
        // 使用性能監控測量算法執行時間
        const suggestion = performanceMonitor.measureAlgorithmPerformance('suggestion-calculation', () => {
            return probabilityCalculator.getBestSuggestion(currentBoard);
        });
        
        // 移除載入狀態
        if (suggestionDisplay) {
            suggestionDisplay.classList.remove('loading');
        }
        
        if (suggestion && typeof suggestion === 'object' && 
            typeof suggestion.row === 'number' && typeof suggestion.col === 'number') {
            
            // Validate suggestion coordinates
            if (suggestion.row < 0 || suggestion.row >= 5 || 
                suggestion.col < 0 || suggestion.col >= 5) {
                console.error('Invalid suggestion coordinates:', suggestion);
                updateSuggestionDisplay(null);
                return;
            }
            
            // 使用性能監控測量渲染時間
            performanceMonitor.measureRenderPerformance('suggestion-highlight', () => {
                gameBoard.highlightSuggestion(suggestion.row, suggestion.col, {
                    confidence: suggestion.confidence,
                    value: suggestion.value,
                    alternatives: suggestion.alternatives
                });
            });
            
            // 更新建議顯示區域
            updateSuggestionDisplay(suggestion);
            
        } else {
            // 沒有建議時的處理
            updateSuggestionDisplay(null);
        }
    } catch (error) {
        console.error('Error showing player suggestion:', error);
        
        // 移除載入狀態
        const suggestionDisplay = document.getElementById('suggestion-display');
        if (suggestionDisplay) {
            suggestionDisplay.classList.remove('loading');
        }
        
        showErrorModal('建議生成失敗', '無法生成移動建議，請檢查遊戲狀態', {
            showRetry: true,
            onRetry: () => {
                setTimeout(showPlayerSuggestion, 100);
            }
        });
    }
}

/**
 * 更新建議顯示區域（增強版）
 * @param {Object|null} suggestion - 建議對象或null
 */
function updateSuggestionDisplay(suggestion) {
    const suggestionDisplay = document.getElementById('suggestion-display');
    
    if (!suggestionDisplay) {
        return;
    }
    
    // 清除現有內容和類別
    suggestionDisplay.innerHTML = '';
    suggestionDisplay.className = 'suggestion-display';
    
    if (suggestion) {
        // 添加信心度類別到顯示區域
        if (suggestion.confidence) {
            suggestionDisplay.classList.add(`confidence-${suggestion.confidence}`);
        }
        
        // 創建主要建議文本
        const mainSuggestion = document.createElement('div');
        mainSuggestion.id = 'suggestion-text';
        mainSuggestion.innerHTML = createSuggestionHTML(suggestion);
        suggestionDisplay.appendChild(mainSuggestion);
        
        // 創建價值解釋
        if (suggestion.value !== undefined) {
            const valueExplanation = document.createElement('div');
            valueExplanation.className = 'value-explanation';
            valueExplanation.innerHTML = createValueExplanation(suggestion.value, suggestion.confidence);
            suggestionDisplay.appendChild(valueExplanation);
        }
        
        // 創建替代建議區域
        if (suggestion.alternatives && suggestion.alternatives.length > 0) {
            const alternativesContainer = document.createElement('div');
            alternativesContainer.className = 'alternatives-container';
            alternativesContainer.innerHTML = createAlternativesHTML(suggestion.alternatives);
            suggestionDisplay.appendChild(alternativesContainer);
            
            // 為替代建議添加點擊事件
            setupAlternativeClickHandlers(alternativesContainer, suggestion.alternatives);
        }
        
        // 添加更新動畫，根據信心度使用不同的動畫
        suggestionDisplay.classList.add('suggestion-update');
        setTimeout(() => {
            suggestionDisplay.classList.remove('suggestion-update');
        }, 600); // 延長動畫時間
        
    } else {
        // 沒有建議時的顯示
        const noSuggestion = document.createElement('div');
        noSuggestion.id = 'suggestion-text';
        noSuggestion.innerHTML = '<i class="fa fa-info-circle"></i> 沒有可用的移動建議';
        noSuggestion.style.color = '#FF6F00';
        suggestionDisplay.appendChild(noSuggestion);
        
        // 添加提示信息
        const noSuggestionHint = document.createElement('div');
        noSuggestionHint.className = 'value-explanation';
        noSuggestionHint.textContent = '所有可用的移動都具有相似的價值，或者沒有可用的空格子。';
        suggestionDisplay.appendChild(noSuggestionHint);
    }
}

/**
 * 創建建議HTML內容（增強版）
 * @param {Object} suggestion - 建議對象
 * @returns {string} HTML字符串
 */
function createSuggestionHTML(suggestion) {
    const confidenceText = {
        'very-high': '非常高的信心度',
        'high': '高信心度',
        'medium': '中等信心度',
        'low': '低信心度'
    };
    
    const confidenceClass = suggestion.confidence || 'medium';
    const confidenceLabel = confidenceText[suggestion.confidence] || '中等信心度';
    
    // 添加圖標以增強視覺效果
    const icons = {
        'very-high': '★★★',
        'high': '★★☆',
        'medium': '★☆☆',
        'low': '☆☆☆'
    };
    
    const icon = icons[confidenceClass] || '★☆☆';
    
    return `
        <div class="suggestion-position">
            建議移動: <strong>第${suggestion.row + 1}行, 第${suggestion.col + 1}列</strong>
        </div>
        <span class="confidence-indicator ${confidenceClass}">
            ${icon} ${confidenceLabel}
        </span>
    `;
}

/**
 * 創建價值解釋內容（增強版）
 * @param {number} value - 價值分數
 * @param {string} confidence - 信心度
 * @returns {string} 解釋文本
 */
function createValueExplanation(value, confidence) {
    const roundedValue = Math.round(value);
    
    // 根據價值範圍確定信心度類別
    let valueClass = 'low';
    if (value >= 100) {
        valueClass = 'very-high';
    } else if (value >= 50) {
        valueClass = 'high';
    } else if (value >= 10) {
        valueClass = 'medium';
    }
    
    // 創建帶有高亮的價值顯示
    const valueHighlight = `<span class="value-highlight ${valueClass}">${roundedValue}</span>`;
    
    let explanation = `預期價值: ${valueHighlight} 分`;
    
    // 根據價值提供詳細解釋
    if (value >= 100) {
        explanation += `
            <div class="value-detail">
                <strong>極高價值!</strong> 此移動可能直接完成一條連線，是最佳選擇。
            </div>
        `;
    } else if (value >= 50) {
        explanation += `
            <div class="value-detail">
                <strong>高價值:</strong> 此移動有助於與電腦合作完成連線，大幅提高成功機會。
            </div>
        `;
    } else if (value >= 10) {
        explanation += `
            <div class="value-detail">
                <strong>中等價值:</strong> 此移動增加未來連線的潛力，為後續回合創造機會。
            </div>
        `;
    } else {
        explanation += `
            <div class="value-detail">
                <strong>基本價值:</strong> 此移動提供基本的戰略價值，但可能不會立即產生明顯效果。
            </div>
        `;
    }
    
    return explanation;
}

/**
 * 創建替代建議HTML內容（增強版）
 * @param {Array} alternatives - 替代建議陣列
 * @returns {string} HTML字符串
 */
function createAlternativesHTML(alternatives) {
    const alternativeItems = alternatives.slice(0, 3).map((alt, index) => {
        // 計算與最佳建議的價值差異百分比
        const rank = index + 2; // 排名從2開始（主建議是1）
        const roundedValue = Math.round(alt.value);
        
        return `
            <div class="alternative-item" 
                data-row="${alt.row}" 
                data-col="${alt.col}" 
                data-value="${alt.value}"
                data-rank="${rank}">
                <span class="alternative-position">第${alt.row + 1}行,${alt.col + 1}列</span>
                <span class="alternative-value">${roundedValue}分</span>
            </div>
        `;
    }).join('');
    
    return `
        <div class="alternatives-title">其他可能的選擇</div>
        <div class="alternatives-list">
            ${alternativeItems}
        </div>
        <div class="alternatives-hint">點擊任一選項可查看詳細信息</div>
    `;
}

/**
 * 為替代建議設置點擊事件處理器（增強版）
 * @param {HTMLElement} container - 替代建議容器
 * @param {Array} alternatives - 替代建議陣列
 */
function setupAlternativeClickHandlers(container, alternatives) {
    const alternativeItems = container.querySelectorAll('.alternative-item');
    
    alternativeItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const row = parseInt(item.dataset.row);
            const col = parseInt(item.dataset.col);
            const value = parseFloat(item.dataset.value);
            const rank = parseInt(item.dataset.rank);
            
            // 高亮顯示選中的替代建議，使用適當的信心度
            gameBoard.clearSuggestionHighlight();
            
            // 根據排名確定信心度
            let confidence;
            if (rank === 2) confidence = 'medium';
            else if (rank === 3) confidence = 'medium';
            else confidence = 'low';
            
            // 過濾掉當前選中的替代建議
            const remainingAlternatives = alternatives.filter(alt => 
                alt.row !== row || alt.col !== col
            );
            
            // 添加原始最佳建議作為替代建議之一
            const originalBest = gameBoard.getCurrentSuggestion();
            if (originalBest) {
                remainingAlternatives.unshift({
                    row: originalBest.row,
                    col: originalBest.col,
                    value: originalBest.value
                });
            }
            
            // 高亮顯示選中的替代建議
            gameBoard.highlightSuggestion(row, col, {
                confidence: confidence,
                value: value,
                alternatives: remainingAlternatives.slice(0, 2) // 最多顯示2個替代建議
            });
            
            // 更新建議顯示
            const newSuggestion = {
                row: row,
                col: col,
                value: value,
                confidence: confidence,
                alternatives: remainingAlternatives.slice(0, 2)
            };
            
            updateSuggestionDisplay(newSuggestion);
            
            // 增強的視覺反饋
            // 1. 添加點擊波紋效果
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.position = 'absolute';
            ripple.style.top = '50%';
            ripple.style.left = '50%';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(33, 150, 243, 0.4)';
            ripple.style.zIndex = '1';
            
            // 確保item有相對定位
            item.style.position = 'relative';
            item.style.overflow = 'hidden';
            item.appendChild(ripple);
            
            // 動畫
            ripple.animate(
                [
                    { width: '0', height: '0', opacity: 1 },
                    { width: '200px', height: '200px', opacity: 0 }
                ],
                {
                    duration: 600,
                    easing: 'ease-out'
                }
            ).onfinish = () => {
                if (ripple.parentNode === item) {
                    item.removeChild(ripple);
                }
            };
            
            // 2. 高亮選中項
            item.style.backgroundColor = 'rgba(33, 150, 243, 0.2)';
            item.style.borderColor = 'rgba(33, 150, 243, 0.6)';
            item.style.color = '#1565C0';
            item.style.fontWeight = 'bold';
            
            // 3. 恢復其他項的樣式
            alternativeItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.style.backgroundColor = '';
                    otherItem.style.borderColor = '';
                    otherItem.style.color = '';
                    otherItem.style.fontWeight = '';
                }
            });
        });
        
        // 增強的懸停效果
        item.addEventListener('mouseenter', () => {
            const row = parseInt(item.dataset.row);
            const col = parseInt(item.dataset.col);
            
            // 1. 改變替代建議項的樣式
            item.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
            item.style.borderColor = 'rgba(33, 150, 243, 0.4)';
            item.style.transform = 'translateY(-2px)';
            item.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            
            // 2. 高亮對應的格子
            if (gameBoard.isValidPosition(row, col)) {
                const cell = gameBoard.getCell(row, col);
                if (cell && cell.classList.contains('empty')) {
                    cell.style.transform = 'scale(1.08)';
                    cell.style.boxShadow = '0 0 15px rgba(33, 150, 243, 0.6)';
                    cell.style.zIndex = '10';
                    cell.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                }
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const row = parseInt(item.dataset.row);
            const col = parseInt(item.dataset.col);
            
            // 1. 恢復替代建議項的樣式
            if (!item.style.fontWeight || item.style.fontWeight !== 'bold') {
                item.style.backgroundColor = '';
                item.style.borderColor = '';
            }
            item.style.transform = '';
            item.style.boxShadow = '';
            
            // 2. 恢復格子樣式
            if (gameBoard.isValidPosition(row, col)) {
                const cell = gameBoard.getCell(row, col);
                if (cell) {
                    cell.style.transform = '';
                    cell.style.boxShadow = '';
                    cell.style.zIndex = '';
                }
            }
        });
    });
}

/**
 * Enable computer input controls
 */
function enableComputerInput() {
    const computerRow = document.getElementById('computer-row');
    const computerCol = document.getElementById('computer-col');
    const confirmButton = document.getElementById('confirm-computer-move');
    
    if (computerRow) computerRow.disabled = false;
    if (computerCol) computerCol.disabled = false;
    if (confirmButton) confirmButton.disabled = false;
    
    updateInstructions('請輸入電腦的移動位置 (行: 1-5, 列: 1-5)');
}

/**
 * Handle computer move input
 */
function handleComputerMove() {
    try {
        const computerRow = document.getElementById('computer-row');
        const computerCol = document.getElementById('computer-col');
        
        if (!computerRow || !computerCol) {
            throw new Error('找不到電腦輸入控件');
        }
        
        const row = parseInt(computerRow.value) - 1;
        const col = parseInt(computerCol.value) - 1;
        
        if (isNaN(row) || isNaN(col) || row < 0 || row > 4 || col < 0 || col > 4) {
            alert('請輸入1-5之間的數字');
            return;
        }
        
        if (!gameState.isCellEmpty(row, col)) {
            alert(`位置 (${row + 1}, ${col + 1}) 已被佔用，請選擇其他位置`);
            return;
        }
        
        // Make computer move
        gameState.makeComputerMove(row, col);
        
        // Update UI
        gameBoard.updateCell(row, col, CELL_STATES.COMPUTER);
        
        // Check for completed lines
        updateCompletedLines();
        
        // Clear input fields
        computerRow.value = '';
        computerCol.value = '';
        
        // Disable computer input
        disableComputerInput();
        
        // Update game status
        updateGameStatus();
        
        // Check if game is over
        if (gameState.isGameComplete()) {
            endGame();
        } else {
            // Show suggestion for next player move
            showPlayerSuggestion();
        }
        
    } catch (error) {
        console.error('Error handling computer move:', error);
        alert('電腦移動失敗：' + error.message);
    }
}

/**
 * Disable computer input controls
 */
function disableComputerInput() {
    const computerRow = document.getElementById('computer-row');
    const computerCol = document.getElementById('computer-col');
    const confirmButton = document.getElementById('confirm-computer-move');
    
    if (computerRow) computerRow.disabled = true;
    if (computerCol) computerCol.disabled = true;
    if (confirmButton) confirmButton.disabled = true;
}

/**
 * Make a random computer move (optimized with throttling)
 */
const makeRandomComputerMove = throttle(function() {
    try {
        console.log('Making random computer move');
        
        // 检查是否是电脑回合
        if (!gameState || gameState.gamePhase !== GAME_PHASES.COMPUTER_TURN) {
            console.log('Not computer turn or game not started');
            showWarningMessage('現在不是電腦回合');
            return;
        }
        
        // 显示加载状态
        showButtonLoading('random-computer-move');
        showGameBoardLoading();
        
        // 使用 requestAnimationFrame 优化性能
        requestAnimationFrame(() => {
            try {
                // 获取所有空格子
                const emptyCells = gameState.getEmptyCells();
                if (emptyCells.length === 0) {
                    console.log('No empty cells available');
                    hideButtonLoading('random-computer-move');
                    hideGameBoardLoading();
                    showWarningMessage('沒有可用的空格子');
                    return;
                }
                
                // 随机选择一个空格子
                const randomIndex = Math.floor(Math.random() * emptyCells.length);
                const randomCell = emptyCells[randomIndex];
                
                console.log(`Random computer move selected: (${randomCell.row}, ${randomCell.col})`);
                
                // 添加短暂延迟以显示加载效果
                setTimeout(() => {
                    try {
                        // 执行电脑移动
                        gameState.makeComputerMove(randomCell.row, randomCell.col);
                        
                        // 更新UI
                        gameBoard.updateCell(randomCell.row, randomCell.col, CELL_STATES.COMPUTER);
                        
                        // 检查连线
                        updateCompletedLines();
                        
                        // 更新游戏状态
                        updateGameStatus();
                        
                        // 隐藏加载状态
                        hideButtonLoading('random-computer-move');
                        hideGameBoardLoading();
                        
                        // 检查游戏是否结束
                        if (gameState.isGameComplete()) {
                            endGame();
                        } else {
                            // 显示下一步建议
                            showPlayerSuggestion();
                            
                            // 更新指示
                            updateInstructions('玩家回合 - 請選擇一個格子進行移動');
                            
                            console.log('Random computer move completed, now player turn');
                        }
                    } catch (moveError) {
                        hideButtonLoading('random-computer-move');
                        hideGameBoardLoading();
                        throw moveError;
                    }
                }, 300); // 300ms delay for better UX
                
            } catch (innerError) {
                hideButtonLoading('random-computer-move');
                hideGameBoardLoading();
                throw innerError;
            }
        });
        
    } catch (error) {
        console.error('Error making random computer move:', error);
        hideButtonLoading('random-computer-move');
        hideGameBoardLoading();
        
        if (error instanceof GameError) {
            showWarningMessage(`電腦隨機移動失敗：${error.message}`);
        } else {
            showErrorModal('電腦隨機移動失敗', error.message, {
                showRetry: true,
                onRetry: makeRandomComputerMove
            });
        }
    }
}, 500); // 500ms throttle to prevent rapid clicks

/**
 * Update completed lines display
 */
function updateCompletedLines() {
    try {
        if (!gameState || !lineDetector) {
            return;
        }
        
        const currentBoard = gameState.getState().board;
        const completedLines = lineDetector.getAllLines(currentBoard);
        
        // Update game state
        gameState.updateCompletedLines(completedLines);
        
        // Highlight lines on board
        gameBoard.highlightLines(completedLines);
        
        // Update completed lines counter
        const completedLinesElement = document.getElementById('completed-lines');
        if (completedLinesElement) {
            completedLinesElement.textContent = completedLines.length;
        }
        
    } catch (error) {
        console.error('Error updating completed lines:', error);
    }
}

/**
 * Update game status display
 */
function updateGameStatus() {
    try {
        if (!gameState) {
            return;
        }
        
        const state = gameState.getState();
        
        // Update current round
        const currentRoundElement = document.getElementById('current-round');
        if (currentRoundElement) {
            currentRoundElement.textContent = state.currentRound;
        }
        
        // Update game phase
        const gamePhaseElement = document.getElementById('game-phase');
        if (gamePhaseElement) {
            let phaseText = '';
            switch (state.gamePhase) {
                case GAME_PHASES.WAITING:
                    phaseText = '等待開始';
                    break;
                case GAME_PHASES.PLAYER_TURN:
                    phaseText = '玩家回合';
                    break;
                case GAME_PHASES.COMPUTER_TURN:
                    phaseText = '電腦回合';
                    break;
                case GAME_PHASES.GAME_OVER:
                    phaseText = '遊戲結束';
                    break;
                default:
                    phaseText = '未知狀態';
            }
            gamePhaseElement.textContent = phaseText;
        }
        
    } catch (error) {
        console.error('Error updating game status:', error);
    }
}

/**
 * Update instructions display
 */
function updateInstructions(text, type = 'normal') {
    const instructionElement = document.getElementById('instruction-text');
    if (instructionElement) {
        instructionElement.textContent = text;
        
        // Clear previous type classes
        instructionElement.classList.remove('warning', 'error', 'success');
        
        // Add new type class if specified
        if (type !== 'normal') {
            instructionElement.classList.add(type);
        }
    }
}

/**
 * End the current game
 */
function endGame() {
    try {
        if (gameState && !gameState.isGameComplete()) {
            gameState.endGame();
        }
        
        const state = gameState.getState();
        
        // Perform final line detection
        if (lineDetector) {
            const finalLines = lineDetector.getAllLines(state.board);
            gameState.updateCompletedLines(finalLines);
            
            if (gameBoard) {
                gameBoard.highlightLines(finalLines);
            }
        }
        
        // Update final game status display
        updateGameStatus();
        
        // 更新指示
        updateInstructions('遊戲結束！即將顯示結果...', 'success');
        
        // 延迟显示游戏结果，让用户有时间看到最后一步落子
        setTimeout(() => {
            // Show game results
            const finalState = gameState.getState();
            showGameResults(finalState);
            
            // Update button states
            const startButton = document.getElementById('start-game');
            const restartButton = document.getElementById('restart-game');
            
            if (startButton) startButton.disabled = false;
            if (restartButton) restartButton.disabled = true;
        }, 1500); // 延迟1.5秒显示结果
        
        console.log('Game ended successfully');
        
    } catch (error) {
        console.error('Error ending game:', error);
    }
}

/**
 * Show game results in the control panel
 */
function showGameResults(gameState) {
    try {
        const gameActivePanel = document.getElementById('game-active-panel');
        const gameResultPanel = document.getElementById('game-result-panel');
        const finalLinesCount = document.getElementById('final-lines-count');
        const playerMovesCount = document.getElementById('player-moves-count');
        const computerMovesCount = document.getElementById('computer-moves-count');
        
        if (!gameResultPanel) {
            console.error('Game result panel not found');
            return;
        }
        
        // Hide active game panel and show result panel
        if (gameActivePanel) gameActivePanel.classList.add('hidden');
        gameResultPanel.classList.remove('hidden');
        
        // Update final statistics
        if (finalLinesCount) {
            finalLinesCount.textContent = gameState.completedLines.length;
        }
        
        if (playerMovesCount) {
            playerMovesCount.textContent = gameState.playerMoves.length;
        }
        
        if (computerMovesCount) {
            computerMovesCount.textContent = gameState.computerMoves.length;
        }
        
        console.log('Game results displayed successfully');
        
    } catch (error) {
        console.error('Error showing game results:', error);
    }
}

/**
 * Hide game results panel
 */
function hideGameResults() {
    const gameActivePanel = document.getElementById('game-active-panel');
    const gameResultPanel = document.getElementById('game-result-panel');
    
    if (gameResultPanel) {
        gameResultPanel.classList.add('hidden');
    }
    
    if (gameActivePanel) {
        gameActivePanel.classList.remove('hidden');
    }
}

/**
 * Handle play again button click
 */
function handlePlayAgain() {
    try {
        hideGameResults();
        startNewGame();
        console.log('Starting new game from results panel');
    } catch (error) {
        console.error('Error handling play again:', error);
    }
}

// Export for testing (if in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        CELL_STATES,
        GAME_PHASES,
        LINE_TYPES,
        ERROR_TYPES,
        GameError
    };
}