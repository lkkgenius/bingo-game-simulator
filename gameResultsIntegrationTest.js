/**
 * 遊戲結果顯示系統整合測試
 * 測試遊戲結果系統與實際遊戲流程的整合
 */

// 載入必要的模組
const GameEngine = require('./gameEngine.js');
const GameBoard = require('./gameBoard.js');

// 模擬DOM環境
function createMockGameBoard() {
    return {
        cells: Array(5).fill().map(() => Array(5).fill(0)),
        suggestions: [],
        lines: [],
        
        reset: function() {
            this.cells = Array(5).fill().map(() => Array(5).fill(0));
            this.suggestions = [];
            this.lines = [];
        },
        
        updateCell: function(row, col, state) {
            this.cells[row][col] = state;
        },
        
        updateBoard: function(board) {
            this.cells = board.map(row => [...row]);
        },
        
        highlightSuggestion: function(row, col) {
            this.suggestions.push({ row, col });
        },
        
        clearSuggestionHighlight: function() {
            this.suggestions = [];
        },
        
        highlightLines: function(lines) {
            this.lines = [...lines];
        },
        
        setClickHandler: function(handler) {
            this.clickHandler = handler;
        }
    };
}

// 測試運行器
class IntegrationTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    async run() {
        console.log('開始遊戲結果顯示系統整合測試...\n');
        
        for (const { name, testFn } of this.tests) {
            try {
                await testFn();
                console.log(`✓ ${name}`);
                this.passed++;
            } catch (error) {
                console.error(`✗ ${name}: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n測試完成: ${this.passed} 通過, ${this.failed} 失敗`);
        return this.failed === 0;
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}: 期望 ${expected}, 實際 ${actual}`);
        }
    }
}

const runner = new IntegrationTestRunner();

// 測試 1: 遊戲完成時觸發結果顯示
runner.test('遊戲完成時觸發結果顯示', async () => {
    const engine = new GameEngine();
    const mockBoard = createMockGameBoard();
    
    engine.setGameBoard(mockBoard);
    
    let gameCompleteTriggered = false;
    let finalStats = null;
    
    // 設置遊戲完成回調
    engine.setOnGameComplete((stats) => {
        gameCompleteTriggered = true;
        finalStats = stats;
    });
    
    // 開始遊戲
    engine.startGame();
    
    // 模擬完整的8回合遊戲
    const moves = [
        // 玩家移動, 電腦移動
        [[0, 0], [0, 1]],
        [[1, 0], [1, 1]],
        [[2, 0], [2, 1]],
        [[3, 0], [3, 1]],
        [[4, 0], [4, 1]],
        [[0, 2], [0, 3]],
        [[1, 2], [1, 3]],
        [[2, 2], [2, 3]]
    ];
    
    for (let i = 0; i < moves.length; i++) {
        const [playerMove, computerMove] = moves[i];
        
        // 玩家移動
        engine.processPlayerTurn(playerMove[0], playerMove[1]);
        
        // 電腦移動
        engine.processComputerTurn(computerMove[0], computerMove[1]);
    }
    
    // 驗證遊戲完成
    runner.assert(gameCompleteTriggered, '應該觸發遊戲完成事件');
    runner.assert(finalStats !== null, '應該提供最終統計');
    runner.assert(finalStats.isGameComplete, '最終統計應該標記遊戲完成');
    runner.assert(finalStats.totalRounds === 8, '應該完成8回合');
    runner.assert(finalStats.playerMoves.length === 8, '玩家應該移動8次');
    runner.assert(finalStats.computerMoves.length === 8, '電腦應該移動8次');
});

// 測試 2: 連線統計正確性
runner.test('連線統計正確性', async () => {
    const engine = new GameEngine();
    const mockBoard = createMockGameBoard();
    
    engine.setGameBoard(mockBoard);
    
    let finalStats = null;
    
    engine.setOnGameComplete((stats) => {
        finalStats = stats;
    });
    
    // 開始遊戲
    engine.startGame();
    
    // 模擬能形成連線的移動
    const moves = [
        // 形成垂直線的移動
        [[0, 0], [1, 0]], // 第1回合
        [[2, 0], [3, 0]], // 第2回合
        [[4, 0], [0, 1]], // 第3回合 - 完成垂直線
        [[1, 1], [2, 1]], // 第4回合
        [[3, 1], [4, 1]], // 第5回合 - 完成另一條垂直線
        [[0, 2], [1, 2]], // 第6回合
        [[2, 2], [3, 2]], // 第7回合
        [[4, 2], [0, 3]]  // 第8回合
    ];
    
    for (let i = 0; i < moves.length; i++) {
        const [playerMove, computerMove] = moves[i];
        
        engine.processPlayerTurn(playerMove[0], playerMove[1]);
        engine.processComputerTurn(computerMove[0], computerMove[1]);
    }
    
    // 驗證連線統計
    runner.assert(finalStats !== null, '應該提供最終統計');
    runner.assert(finalStats.completedLines.length >= 2, '應該至少完成2條連線');
    
    // 驗證連線類型
    const lineTypes = finalStats.completedLines.map(line => line.type);
    runner.assert(lineTypes.includes('vertical'), '應該包含垂直線');
});

// 測試 3: 遊戲分析數據準確性
runner.test('遊戲分析數據準確性', async () => {
    const engine = new GameEngine();
    const mockBoard = createMockGameBoard();
    
    engine.setGameBoard(mockBoard);
    
    let finalStats = null;
    
    engine.setOnGameComplete((stats) => {
        finalStats = stats;
    });
    
    // 開始遊戲
    engine.startGame();
    
    // 模擬隨機移動（不太可能形成連線）
    const moves = [
        [[0, 0], [4, 4]],
        [[0, 1], [4, 3]],
        [[0, 2], [4, 2]],
        [[1, 0], [3, 4]],
        [[1, 1], [3, 3]],
        [[1, 2], [3, 2]],
        [[2, 0], [2, 4]],
        [[2, 1], [2, 3]]
    ];
    
    for (let i = 0; i < moves.length; i++) {
        const [playerMove, computerMove] = moves[i];
        
        engine.processPlayerTurn(playerMove[0], playerMove[1]);
        engine.processComputerTurn(computerMove[0], computerMove[1]);
    }
    
    // 驗證統計數據
    runner.assert(finalStats !== null, '應該提供最終統計');
    runner.assert(finalStats.playerMoves.length === 8, '玩家移動數應該正確');
    runner.assert(finalStats.computerMoves.length === 8, '電腦移動數應該正確');
    runner.assert(finalStats.totalLines >= 0, '連線數應該非負');
    runner.assert(finalStats.currentRound === 9, '最終回合數應該是9（遊戲結束後）');
});

// 測試 4: 重新開始遊戲功能
runner.test('重新開始遊戲功能', async () => {
    const engine = new GameEngine();
    const mockBoard = createMockGameBoard();
    
    engine.setGameBoard(mockBoard);
    
    // 開始第一個遊戲
    engine.startGame();
    
    // 進行幾個移動
    engine.processPlayerTurn(0, 0);
    engine.processComputerTurn(0, 1);
    engine.processPlayerTurn(1, 0);
    engine.processComputerTurn(1, 1);
    
    // 驗證遊戲狀態
    runner.assert(engine.getCurrentRound() === 3, '應該在第3回合');
    runner.assert(!engine.isGameComplete(), '遊戲不應該完成');
    
    // 重新開始遊戲
    engine.startGame();
    
    // 驗證重置狀態
    runner.assert(engine.getCurrentRound() === 1, '應該重置到第1回合');
    runner.assert(!engine.isGameComplete(), '遊戲不應該完成');
    runner.assert(engine.getCurrentPhase() === 'player-turn', '應該是玩家回合');
    
    const stats = engine.getGameStats();
    runner.assert(stats.playerMoves.length === 0, '玩家移動應該重置');
    runner.assert(stats.computerMoves.length === 0, '電腦移動應該重置');
    runner.assert(stats.completedLines.length === 0, '連線應該重置');
});

// 測試 5: 錯誤處理和邊界情況
runner.test('錯誤處理和邊界情況', async () => {
    const engine = new GameEngine();
    const mockBoard = createMockGameBoard();
    
    engine.setGameBoard(mockBoard);
    
    let errorTriggered = false;
    let errorMessage = '';
    
    engine.setOnError((message) => {
        errorTriggered = true;
        errorMessage = message;
    });
    
    // 測試在遊戲未開始時進行移動
    try {
        engine.processPlayerTurn(0, 0);
        runner.assert(false, '應該拋出錯誤');
    } catch (error) {
        runner.assert(error.message.includes('Game has not started'), '應該是遊戲未開始錯誤');
    }
    
    // 開始遊戲
    engine.startGame();
    
    // 測試無效位置
    try {
        engine.processPlayerTurn(-1, 0);
        runner.assert(false, '應該拋出錯誤');
    } catch (error) {
        runner.assert(error.message.includes('Invalid position'), '應該是無效位置錯誤');
    }
    
    // 測試重複選擇同一位置
    engine.processPlayerTurn(0, 0);
    
    try {
        engine.processComputerTurn(0, 0);
        runner.assert(false, '應該拋出錯誤');
    } catch (error) {
        runner.assert(error.message.includes('already occupied'), '應該是位置已佔用錯誤');
    }
});

// 執行測試
async function runIntegrationTests() {
    const success = await runner.run();
    if (success) {
        console.log('\n🎉 所有遊戲結果顯示系統整合測試通過！');
        console.log('✅ 遊戲結果顯示系統已成功實現並通過所有測試');
    } else {
        console.log('\n❌ 部分整合測試失敗，請檢查實現');
    }
    return success;
}

if (require.main === module) {
    runIntegrationTests();
}

module.exports = { IntegrationTestRunner, runIntegrationTests };