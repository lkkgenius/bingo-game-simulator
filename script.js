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
    
    console.log('UI event listeners setup complete');
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
 * Show suggestion for player's next move (optimized with performance monitoring)
 */
function showPlayerSuggestion() {
    try {
        if (!gameState || !probabilityCalculator) {
            return;
        }
        
        const currentBoard = gameState.getState().board;
        
        // 使用性能監控測量算法執行時間
        const suggestion = performanceMonitor.measureAlgorithmPerformance('suggestion-calculation', () => {
            return probabilityCalculator.getBestSuggestion(currentBoard);
        });
        
        if (suggestion) {
            // 使用性能監控測量渲染時間
            performanceMonitor.measureRenderPerformance('suggestion-highlight', () => {
                gameBoard.highlightSuggestion(suggestion.row, suggestion.col);
            });
            
            const suggestionText = document.getElementById('suggestion-text');
            if (suggestionText) {
                // 添加信心度和替代選項信息
                let suggestionMessage = `建議移動: 第${suggestion.row + 1}行, 第${suggestion.col + 1}列 (價值: ${suggestion.value})`;
                
                if (suggestion.confidence) {
                    const confidenceText = {
                        'very-high': '非常確定',
                        'high': '高度確定',
                        'medium': '中等確定',
                        'low': '低確定度'
                    };
                    suggestionMessage += ` - ${confidenceText[suggestion.confidence] || ''}`;
                }
                
                suggestionText.textContent = suggestionMessage;
                
                // 添加視覺反饋
                suggestionText.classList.add('suggestion-appear');
                setTimeout(() => {
                    suggestionText.classList.remove('suggestion-appear');
                }, 500);
            }
        } else {
            const suggestionText = document.getElementById('suggestion-text');
            if (suggestionText) {
                suggestionText.textContent = '沒有可用的移動建議';
                suggestionText.classList.add('warning');
                setTimeout(() => {
                    suggestionText.classList.remove('warning');
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error showing player suggestion:', error);
        showWarningMessage('無法生成移動建議');
    }
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