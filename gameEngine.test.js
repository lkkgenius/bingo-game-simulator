/**
 * GameEngine 測試檔案
 * 測試遊戲引擎的所有核心功能
 */

// 在Node.js環境中載入模組
let GameEngine, LineDetector, ProbabilityCalculator, GameBoard;

if (typeof require !== 'undefined') {
    GameEngine = require('./gameEngine.js');
    LineDetector = require('./lineDetector.js');
    ProbabilityCalculator = require('./probabilityCalculator.js');
    // GameBoard 在測試中會被模擬
}

/**
 * 模擬 GameBoard 類別用於測試
 */
class MockGameBoard {
    constructor() {
        this.clickHandler = null;
        this.board = Array(5).fill().map(() => Array(5).fill(0));
        this.suggestions = [];
        this.highlightedLines = [];
        this.resetCalled = false;
    }

    setClickHandler(handler) {
        this.clickHandler = handler;
    }

    updateCell(row, col, state) {
        this.board[row][col] = state;
    }

    updateBoard(board) {
        this.board = board.map(row => [...row]);
    }

    highlightSuggestion(row, col) {
        this.suggestions.push({ row, col });
    }

    clearSuggestionHighlight() {
        this.suggestions = [];
    }

    highlightLines(lines) {
        this.highlightedLines = [...lines];
    }

    reset() {
        this.resetCalled = true;
        this.board = Array(5).fill().map(() => Array(5).fill(0));
        this.suggestions = [];
        this.highlightedLines = [];
    }
}

/**
 * 測試套件
 */
function runGameEngineTests() {
    console.log('開始 GameEngine 測試...\n');

    // 測試 1: 基本初始化
    testBasicInitialization();

    // 測試 2: 遊戲開始
    testGameStart();

    // 測試 3: 玩家回合處理
    testPlayerTurnProcessing();

    // 測試 4: 電腦回合處理
    testComputerTurnProcessing();

    // 測試 5: 回合轉換
    testRoundTransition();

    // 測試 6: 遊戲進度追蹤
    testGameProgressTracking();

    // 測試 7: 連線檢測整合
    testLineDetectionIntegration();

    // 測試 8: 錯誤處理
    testErrorHandling();

    // 測試 9: 遊戲完成
    testGameCompletion();

    // 測試 10: 狀態管理
    testStateManagement();

    console.log('\n所有 GameEngine 測試完成！');
}

function testBasicInitialization() {
    console.log('測試 1: 基本初始化');
    
    const engine = new GameEngine();
    
    // 檢查初始狀態
    assert(engine.getCurrentRound() === 1, '初始回合應該是 1');
    assert(engine.getCurrentPhase() === 'waiting-start', '初始階段應該是 waiting-start');
    assert(!engine.isGameComplete(), '遊戲初始時不應該完成');
    assert(engine.getGameProgress() === 0, '初始進度應該是 0%');
    
    // 檢查遊戲板
    const board = engine.getBoardCopy();
    assert(board.length === 5, '遊戲板應該是 5x5');
    assert(board.every(row => row.length === 5), '每行應該有 5 個格子');
    assert(board.every(row => row.every(cell => cell === 0)), '所有格子初始應該為空');
    
    console.log('✓ 基本初始化測試通過\n');
}

function testGameStart() {
    console.log('測試 2: 遊戲開始');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    let stateChangeTriggered = false;
    engine.setOnGameStateChange(() => {
        stateChangeTriggered = true;
    });
    
    engine.startGame();
    
    // 檢查遊戲狀態
    assert(engine.getCurrentPhase() === 'player-turn', '遊戲開始後應該是玩家回合');
    assert(engine.getCurrentRound() === 1, '應該從第 1 回合開始');
    assert(mockBoard.resetCalled, '應該重置遊戲板');
    assert(stateChangeTriggered, '應該觸發狀態變更事件');
    assert(mockBoard.suggestions.length > 0, '應該提供移動建議');
    
    console.log('✓ 遊戲開始測試通過\n');
}

function testPlayerTurnProcessing() {
    console.log('測試 3: 玩家回合處理');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    engine.startGame();
    
    // 測試有效移動
    engine.processPlayerTurn(0, 0);
    
    const board = engine.getBoardCopy();
    assert(board[0][0] === 1, '玩家移動應該更新遊戲板');
    assert(engine.getCurrentPhase() === 'computer-input', '玩家移動後應該轉到電腦輸入階段');
    assert(mockBoard.board[0][0] === 1, 'UI 應該更新');
    
    // 測試無效移動
    try {
        engine.processPlayerTurn(0, 0); // 重複位置
        assert(false, '應該拋出錯誤');
    } catch (error) {
        assert(error.message.includes('無效'), '應該拋出無效移動錯誤');
    }
    
    console.log('✓ 玩家回合處理測試通過\n');
}

function testComputerTurnProcessing() {
    console.log('測試 4: 電腦回合處理');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    engine.startGame();
    engine.processPlayerTurn(0, 0); // 先進行玩家移動
    
    // 測試有效的電腦移動
    engine.processComputerTurn(1, 1);
    
    const board = engine.getBoardCopy();
    assert(board[1][1] === 2, '電腦移動應該更新遊戲板');
    assert(engine.getCurrentPhase() === 'player-turn', '電腦移動後應該回到玩家回合');
    assert(engine.getCurrentRound() === 2, '應該進入下一回合');
    
    // 測試無效移動 - 先回到電腦輸入階段
    engine.processPlayerTurn(1, 0); // 進行另一次玩家移動
    
    // 測試重複位置的錯誤處理（通過錯誤回調）
    let errorCaught = false;
    const originalErrorHandler = engine.onError;
    engine.setOnError((message) => {
        if (message.includes('無效')) {
            errorCaught = true;
        }
    });
    
    engine.processComputerTurn(1, 1); // 重複位置，應該觸發錯誤回調
    assert(errorCaught, '應該通過錯誤回調處理無效移動');
    
    // 恢復原始錯誤處理器
    engine.setOnError(originalErrorHandler);
    
    console.log('✓ 電腦回合處理測試通過\n');
}

function testRoundTransition() {
    console.log('測試 5: 回合轉換');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    let roundCompleteTriggered = false;
    engine.setOnRoundComplete((round, stats) => {
        roundCompleteTriggered = true;
        assert(round === 1, '應該報告正確的完成回合');
        assert(stats.currentRound === 2, '統計應該顯示新的當前回合');
    });
    
    engine.startGame();
    
    // 完成第一回合
    engine.processPlayerTurn(0, 0);
    engine.processComputerTurn(1, 1);
    
    assert(roundCompleteTriggered, '應該觸發回合完成事件');
    assert(engine.getCurrentRound() === 2, '應該進入第 2 回合');
    assert(mockBoard.suggestions.length > 0, '應該為新回合提供建議');
    
    console.log('✓ 回合轉換測試通過\n');
}

function testGameProgressTracking() {
    console.log('測試 6: 遊戲進度追蹤');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    engine.startGame();
    
    // 檢查初始進度
    assert(engine.getGameProgress() === 0, '第 1 回合進度應該是 0%');
    
    // 完成幾個回合
    for (let round = 1; round <= 4; round++) {
        engine.processPlayerTurn(round - 1, 0);
        engine.processComputerTurn(round - 1, 1);
        
        const expectedProgress = Math.round((round / 8) * 100);
        assert(engine.getGameProgress() === expectedProgress, 
               `第 ${round + 1} 回合進度應該是 ${expectedProgress}%`);
    }
    
    const stats = engine.getGameStats();
    assert(stats.playerMoves.length === 4, '應該記錄 4 次玩家移動');
    assert(stats.computerMoves.length === 4, '應該記錄 4 次電腦移動');
    assert(stats.currentRound === 5, '應該在第 5 回合');
    
    console.log('✓ 遊戲進度追蹤測試通過\n');
}

function testLineDetectionIntegration() {
    console.log('測試 7: 連線檢測整合');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    engine.startGame();
    
    // 創建一條水平線
    engine.processPlayerTurn(0, 0);
    engine.processComputerTurn(0, 1);
    engine.processPlayerTurn(0, 2);
    engine.processComputerTurn(0, 3);
    engine.processPlayerTurn(0, 4); // 完成第一行
    
    // 這時還在等待電腦輸入，所以還沒檢測到連線
    engine.processComputerTurn(1, 0);
    
    const stats = engine.getGameStats();
    assert(stats.totalLines >= 1, '應該檢測到至少一條連線');
    assert(mockBoard.highlightedLines.length > 0, '應該高亮顯示連線');
    
    console.log('✓ 連線檢測整合測試通過\n');
}

function testErrorHandling() {
    console.log('測試 8: 錯誤處理');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    let errorTriggered = false;
    let errorMessage = '';
    engine.setOnError((message) => {
        errorTriggered = true;
        errorMessage = message;
    });
    
    engine.startGame();
    
    // 測試超出範圍的移動
    engine.handleCellClick(-1, 0);
    assert(errorTriggered, '應該觸發錯誤事件');
    assert(errorMessage.includes('無效'), '錯誤訊息應該包含"無效"');
    
    // 重置錯誤狀態
    errorTriggered = false;
    
    // 測試在錯誤階段的操作
    engine.processPlayerTurn(0, 0);
    engine.handleCellClick(1, 1); // 現在是電腦輸入階段，不應該允許玩家點擊
    assert(errorTriggered, '在電腦輸入階段點擊應該觸發錯誤');
    
    console.log('✓ 錯誤處理測試通過\n');
}

function testGameCompletion() {
    console.log('測試 9: 遊戲完成');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    let gameCompleteTriggered = false;
    let finalStats = null;
    engine.setOnGameComplete((stats) => {
        gameCompleteTriggered = true;
        finalStats = stats;
    });
    
    engine.startGame();
    
    // 完成 8 回合
    const positions = [
        [0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [3, 1],
        [4, 0], [4, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 2], [2, 3]
    ];
    
    for (let round = 1; round <= 8; round++) {
        const playerPos = positions[(round - 1) * 2];
        const computerPos = positions[(round - 1) * 2 + 1];
        engine.processPlayerTurn(playerPos[0], playerPos[1]);
        engine.processComputerTurn(computerPos[0], computerPos[1]);
    }
    
    assert(gameCompleteTriggered, '應該觸發遊戲完成事件');
    assert(engine.isGameComplete(), '遊戲應該標記為完成');
    assert(engine.getCurrentPhase() === 'game-over', '遊戲階段應該是結束');
    assert(finalStats.totalRounds === 8, '最終統計應該顯示 8 回合');
    assert(finalStats.isGameComplete, '最終統計應該標記遊戲完成');
    
    console.log('✓ 遊戲完成測試通過\n');
}

function testStateManagement() {
    console.log('測試 10: 狀態管理');
    
    const engine = new GameEngine();
    const mockBoard = new MockGameBoard();
    engine.setGameBoard(mockBoard);
    
    engine.startGame();
    
    // 測試狀態查詢方法
    assert(engine.canPlayerMove(), '玩家回合時應該可以移動');
    assert(!engine.canInputComputerMove(), '玩家回合時不應該可以輸入電腦移動');
    
    engine.processPlayerTurn(0, 0);
    
    assert(!engine.canPlayerMove(), '電腦輸入階段玩家不應該可以移動');
    assert(engine.canInputComputerMove(), '電腦輸入階段應該可以輸入電腦移動');
    
    // 測試移動模擬
    const simulation = engine.simulateMove(1, 1, 2);
    assert(simulation !== null, '應該能模擬有效移動');
    assert(simulation.board[1][1] === 2, '模擬應該更新測試板');
    
    // 確保模擬不影響實際遊戲狀態
    const actualBoard = engine.getBoardCopy();
    assert(actualBoard[1][1] === 0, '模擬不應該影響實際遊戲狀態');
    
    // 測試重置
    engine.reset();
    assert(engine.getCurrentRound() === 1, '重置後應該回到第 1 回合');
    assert(engine.getCurrentPhase() === 'waiting-start', '重置後應該回到等待開始狀態');
    assert(!engine.isGameComplete(), '重置後遊戲不應該完成');
    
    console.log('✓ 狀態管理測試通過\n');
}

/**
 * 簡單的斷言函數
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`斷言失敗: ${message}`);
    }
}

// 如果在瀏覽器環境中，將測試函數添加到全域
if (typeof window !== 'undefined') {
    window.runGameEngineTests = runGameEngineTests;
}

// 如果在Node.js環境中，直接執行測試
if (typeof require !== 'undefined' && require.main === module) {
    runGameEngineTests();
}

// 導出測試函數
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runGameEngineTests };
}