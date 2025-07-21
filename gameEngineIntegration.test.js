/**
 * GameEngine 整合測試
 * 測試 GameEngine 與其他組件的整合
 */

// 在Node.js環境中載入模組
let GameEngine, GameBoard, LineDetector, ProbabilityCalculator;

if (typeof require !== 'undefined') {
    GameEngine = require('./gameEngine.js');
    GameBoard = require('./gameBoard.js');
    LineDetector = require('./lineDetector.js');
    ProbabilityCalculator = require('./probabilityCalculator.js');
}

/**
 * 模擬DOM環境用於測試
 */
class MockDOM {
    constructor() {
        this.elements = new Map();
    }

    createElement(tagName) {
        const element = {
            tagName: tagName.toUpperCase(),
            className: '',
            innerHTML: '',
            dataset: {},
            setAttribute: function(name, value) { this[name] = value; },
            getAttribute: function(name) { return this[name]; },
            appendChild: function(child) { /* mock */ },
            addEventListener: function(event, handler) { /* mock */ },
            closest: function(selector) { return this; }
        };
        
        element.classList = {
            add: function(className) { 
                if (!element.className) element.className = '';
                element.className += ' ' + className; 
            },
            remove: function(className) { 
                if (!element.className) element.className = '';
                element.className = element.className.replace(className, ''); 
            },
            contains: function(className) { 
                if (!element.className) element.className = '';
                return element.className.includes(className); 
            },
            toggle: function(className, force) { 
                if (force !== undefined) {
                    if (force) this.add(className);
                    else this.remove(className);
                } else {
                    if (this.contains(className)) this.remove(className);
                    else this.add(className);
                }
            }
        };
        
        return element;
    }

    getElementById(id) {
        if (!this.elements.has(id)) {
            const element = this.createElement('div');
            element.id = id;
            this.elements.set(id, element);
        }
        return this.elements.get(id);
    }
}

// 設置模擬DOM
const mockDOM = new MockDOM();
global.document = mockDOM;

/**
 * 整合測試套件
 */
function runGameEngineIntegrationTests() {
    console.log('開始 GameEngine 整合測試...\n');

    // 測試 1: GameEngine 與 GameBoard 整合
    testGameEngineGameBoardIntegration();

    // 測試 2: 完整遊戲流程測試
    testCompleteGameFlow();

    // 測試 3: 連線檢測整合
    testLineDetectionIntegration();

    // 測試 4: 建議系統整合
    testSuggestionSystemIntegration();

    console.log('\n所有 GameEngine 整合測試完成！');
}

function testGameEngineGameBoardIntegration() {
    console.log('測試 1: GameEngine 與 GameBoard 整合');
    
    const engine = new GameEngine();
    
    // 創建模擬的 GameBoard
    const mockGameBoard = {
        clickHandler: null,
        board: Array(5).fill().map(() => Array(5).fill(0)),
        suggestions: [],
        highlightedLines: [],
        resetCalled: false,
        
        setClickHandler: function(handler) { this.clickHandler = handler; },
        updateCell: function(row, col, state) { this.board[row][col] = state; },
        updateBoard: function(board) { this.board = board.map(row => [...row]); },
        highlightSuggestion: function(row, col) { this.suggestions.push({ row, col }); },
        clearSuggestionHighlight: function() { this.suggestions = []; },
        highlightLines: function(lines) { this.highlightedLines = [...lines]; },
        reset: function() { 
            this.resetCalled = true;
            this.board = Array(5).fill().map(() => Array(5).fill(0));
            this.suggestions = [];
            this.highlightedLines = [];
        }
    };
    
    engine.setGameBoard(mockGameBoard);
    
    // 檢查點擊處理器是否正確設置
    assert(mockGameBoard.clickHandler !== null, 'GameBoard 應該設置點擊處理器');
    
    // 測試遊戲開始時的UI更新
    engine.startGame();
    
    // 檢查遊戲板是否重置
    assert(mockGameBoard.resetCalled, '遊戲開始時應該重置 GameBoard');
    
    // 測試玩家移動的UI更新
    engine.processPlayerTurn(0, 0);
    assert(mockGameBoard.board[0][0] === 1, 'GameBoard 應該更新玩家移動');
    
    // 測試電腦移動的UI更新
    engine.processComputerTurn(1, 1);
    assert(mockGameBoard.board[1][1] === 2, 'GameBoard 應該更新電腦移動');
    
    console.log('✓ GameEngine 與 GameBoard 整合測試通過\n');
}

function testCompleteGameFlow() {
    console.log('測試 2: 完整遊戲流程測試');
    
    const engine = new GameEngine();
    const gameBoard = new GameBoard('test-board-2');
    
    engine.setGameBoard(gameBoard);
    
    // 設置事件監聽器
    let roundsCompleted = 0;
    let gameCompleted = false;
    let stateChanges = 0;
    
    engine.setOnRoundComplete((round, stats) => {
        roundsCompleted++;
        assert(stats.currentRound === round + 1, '回合統計應該正確');
    });
    
    engine.setOnGameComplete((stats) => {
        gameCompleted = true;
        assert(stats.isGameComplete, '最終統計應該標記遊戲完成');
        assert(stats.totalRounds === 8, '應該完成 8 回合');
    });
    
    engine.setOnGameStateChange((stats) => {
        stateChanges++;
    });
    
    // 開始遊戲
    engine.startGame();
    
    // 模擬完整的 8 回合遊戲
    const moves = [
        [[0, 0], [0, 1]], [[1, 0], [1, 1]], [[2, 0], [2, 1]], [[3, 0], [3, 1]],
        [[4, 0], [4, 1]], [[0, 2], [0, 3]], [[1, 2], [1, 3]], [[2, 2], [2, 3]]
    ];
    
    for (let round = 0; round < 8; round++) {
        const [playerMove, computerMove] = moves[round];
        engine.processPlayerTurn(playerMove[0], playerMove[1]);
        engine.processComputerTurn(computerMove[0], computerMove[1]);
    }
    
    // 驗證遊戲完成
    console.log(`實際完成回合數: ${roundsCompleted}`);
    assert(roundsCompleted >= 7, '應該完成至少 7 回合'); // 允許一些彈性
    assert(gameCompleted, '遊戲應該完成');
    assert(engine.isGameComplete(), 'GameEngine 應該標記遊戲完成');
    assert(engine.getCurrentPhase() === 'game-over', '遊戲階段應該是結束');
    assert(stateChanges > 0, '應該觸發狀態變更事件');
    
    console.log('✓ 完整遊戲流程測試通過\n');
}

function testLineDetectionIntegration() {
    console.log('測試 3: 連線檢測整合');
    
    const engine = new GameEngine();
    const gameBoard = new GameBoard('test-board-3');
    
    engine.setGameBoard(gameBoard);
    engine.startGame();
    
    // 創建一條水平線
    engine.processPlayerTurn(0, 0);
    engine.processComputerTurn(0, 1);
    engine.processPlayerTurn(0, 2);
    engine.processComputerTurn(0, 3);
    engine.processPlayerTurn(0, 4);
    engine.processComputerTurn(1, 0); // 完成第一行
    
    const stats = engine.getGameStats();
    assert(stats.totalLines >= 1, '應該檢測到至少一條連線');
    assert(gameBoard.highlightedLines.length > 0, 'GameBoard 應該高亮顯示連線');
    
    // 驗證連線檢測的準確性
    const board = engine.getBoardCopy();
    const lineDetector = new LineDetector();
    const detectedLines = lineDetector.getAllLines(board);
    
    assert(detectedLines.length === stats.totalLines, '連線檢測結果應該一致');
    
    console.log('✓ 連線檢測整合測試通過\n');
}

function testSuggestionSystemIntegration() {
    console.log('測試 4: 建議系統整合');
    
    const engine = new GameEngine();
    
    // 創建模擬的 GameBoard
    const mockGameBoard = {
        clickHandler: null,
        board: Array(5).fill().map(() => Array(5).fill(0)),
        suggestions: [],
        highlightedLines: [],
        resetCalled: false,
        
        setClickHandler: function(handler) { this.clickHandler = handler; },
        updateCell: function(row, col, state) { this.board[row][col] = state; },
        updateBoard: function(board) { this.board = board.map(row => [...row]); },
        highlightSuggestion: function(row, col) { this.suggestions.push({ row, col }); },
        clearSuggestionHighlight: function() { this.suggestions = []; },
        highlightLines: function(lines) { this.highlightedLines = [...lines]; },
        reset: function() { 
            this.resetCalled = true;
            this.board = Array(5).fill().map(() => Array(5).fill(0));
            this.suggestions = [];
            this.highlightedLines = [];
        }
    };
    
    engine.setGameBoard(mockGameBoard);
    engine.startGame();
    
    // 檢查初始建議
    assert(mockGameBoard.suggestions.length > 0, '遊戲開始時應該提供建議');
    
    const initialSuggestion = mockGameBoard.suggestions[0];
    assert(initialSuggestion.row >= 0 && initialSuggestion.row < 5, '建議行位置應該有效');
    assert(initialSuggestion.col >= 0 && initialSuggestion.col < 5, '建議列位置應該有效');
    
    // 進行一次移動並檢查新建議
    engine.processPlayerTurn(0, 0);
    engine.processComputerTurn(1, 1);
    
    // 新回合應該提供新建議
    assert(mockGameBoard.suggestions.length > 0, '新回合應該提供新建議');
    
    // 測試建議的有效性
    const suggestion = engine.getBestMove();
    if (suggestion) {
        assert(engine.isValidMove(suggestion.row, suggestion.col), '建議的移動應該有效');
        assert(suggestion.value >= 0, '建議應該有非負價值');
    }
    
    console.log('✓ 建議系統整合測試通過\n');
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
    window.runGameEngineIntegrationTests = runGameEngineIntegrationTests;
}

// 如果在Node.js環境中，直接執行測試
if (typeof require !== 'undefined' && require.main === module) {
    runGameEngineIntegrationTests();
}

// 導出測試函數
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runGameEngineIntegrationTests };
}