/**
 * End-to-End Integration Test for Bingo Game Simulator
 * Tests the complete game flow and integration of all components
 */

// Import components for testing
const LineDetector = require('./lineDetector.js');
const ProbabilityCalculator = require('./probabilityCalculator.js');
const GameEngine = require('./gameEngine.js');

/**
 * Test suite for complete game integration
 */
class EndToEndIntegrationTest {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    /**
     * Run all integration tests
     */
    async runAllTests() {
        console.log('🚀 開始端到端整合測試...\n');
        
        // Test component initialization
        await this.testComponentInitialization();
        
        // Test complete game flow
        await this.testCompleteGameFlow();
        
        // Test error handling
        await this.testErrorHandling();
        
        // Test edge cases
        await this.testEdgeCases();
        
        // Test UI integration scenarios
        await this.testUIIntegrationScenarios();
        
        // Print final results
        this.printTestResults();
    }

    /**
     * Test component initialization
     */
    async testComponentInitialization() {
        console.log('📋 測試組件初始化...');
        
        try {
            // Test LineDetector initialization
            const lineDetector = new LineDetector();
            this.assert(lineDetector instanceof LineDetector, 'LineDetector 初始化成功');
            
            // Test ProbabilityCalculator initialization
            const probabilityCalculator = new ProbabilityCalculator();
            this.assert(probabilityCalculator instanceof ProbabilityCalculator, 'ProbabilityCalculator 初始化成功');
            
            // Test GameEngine initialization
            const gameEngine = new GameEngine();
            this.assert(gameEngine instanceof GameEngine, 'GameEngine 初始化成功');
            
            // Test component integration
            const gameState = gameEngine.getGameState();
            this.assert(gameState.board.length === 5, '遊戲板大小正確');
            this.assert(gameState.currentRound === 1, '初始回合數正確');
            
        } catch (error) {
            this.assert(false, `組件初始化失敗: ${error.message}`);
        }
    }

    /**
     * Test complete game flow from start to finish
     */
    async testCompleteGameFlow() {
        console.log('🎮 測試完整遊戲流程...');
        
        try {
            const gameEngine = new GameEngine();
            
            // Start game
            gameEngine.startGame();
            let gameState = gameEngine.getGameState();
            this.assert(gameState.gamePhase === 'player-turn', '遊戲開始後進入玩家回合');
            
            // Simulate 8 complete rounds
            for (let round = 1; round <= 8; round++) {
                console.log(`  測試第 ${round} 回合...`);
                
                // Player turn
                const emptyCells = this.getEmptyCells(gameState.board);
                if (emptyCells.length > 0) {
                    const playerMove = emptyCells[0];
                    gameEngine.processPlayerTurn(playerMove.row, playerMove.col);
                    
                    gameState = gameEngine.getGameState();
                    this.assert(gameState.gamePhase === 'computer-input', `第 ${round} 回合玩家移動後進入電腦輸入階段`);
                }
                
                // Computer turn
                const emptyCellsAfterPlayer = this.getEmptyCells(gameState.board);
                if (emptyCellsAfterPlayer.length > 0) {
                    const computerMove = emptyCellsAfterPlayer[0];
                    gameEngine.processComputerTurn(computerMove.row, computerMove.col);
                    
                    gameState = gameEngine.getGameState();
                    
                    if (round < 8) {
                        this.assert(gameState.gamePhase === 'player-turn', `第 ${round} 回合完成後進入下一回合`);
                        this.assert(gameState.currentRound === round + 1, `回合數正確遞增到 ${round + 1}`);
                    } else {
                        this.assert(gameState.gamePhase === 'game-over', '8回合後遊戲結束');
                        this.assert(gameState.isGameComplete === true, '遊戲標記為完成');
                    }
                }
            }
            
            // Verify final state
            const finalStats = gameEngine.getGameStats();
            this.assert(finalStats.playerMoves.length === 8, '玩家完成8次移動');
            this.assert(finalStats.computerMoves.length === 8, '電腦完成8次移動');
            this.assert(finalStats.isGameComplete === true, '遊戲完成狀態正確');
            
        } catch (error) {
            this.assert(false, `完整遊戲流程測試失敗: ${error.message}`);
        }
    }

    /**
     * Test error handling scenarios
     */
    async testErrorHandling() {
        console.log('⚠️ 測試錯誤處理...');
        
        try {
            const gameEngine = new GameEngine();
            
            // Test invalid moves before game starts
            try {
                gameEngine.processPlayerTurn(0, 0);
                this.assert(false, '應該拋出遊戲未開始錯誤');
            } catch (error) {
                this.assert(error.message.includes('Game has not started') || 
                           error.message.includes('現在不是玩家回合'), '正確處理遊戲未開始錯誤');
            }
            
            // Start game and test invalid positions
            gameEngine.startGame();
            
            try {
                gameEngine.processPlayerTurn(-1, 0);
                this.assert(false, '應該拋出無效位置錯誤');
            } catch (error) {
                this.assert(error.message.includes('無效') || error.message.includes('Invalid'), '正確處理無效位置錯誤');
            }
            
            try {
                gameEngine.processPlayerTurn(5, 5);
                this.assert(false, '應該拋出超出範圍錯誤');
            } catch (error) {
                this.assert(error.message.includes('無效') || error.message.includes('Invalid'), '正確處理超出範圍錯誤');
            }
            
            // Test occupied cell
            gameEngine.processPlayerTurn(0, 0);
            gameEngine.processComputerTurn(0, 1);
            
            try {
                gameEngine.processPlayerTurn(0, 0);
                this.assert(false, '應該拋出格子已佔用錯誤');
            } catch (error) {
                this.assert(error.message.includes('已被佔用') || error.message.includes('occupied'), '正確處理格子已佔用錯誤');
            }
            
        } catch (error) {
            this.assert(false, `錯誤處理測試失敗: ${error.message}`);
        }
    }

    /**
     * Test edge cases and boundary conditions
     */
    async testEdgeCases() {
        console.log('🔍 測試邊界情況...');
        
        try {
            // Test line detection with various patterns
            const lineDetector = new LineDetector();
            
            // Test horizontal line
            const horizontalBoard = [
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            const horizontalLines = lineDetector.getAllLines(horizontalBoard);
            this.assert(horizontalLines.length === 1, '正確檢測水平線');
            this.assert(horizontalLines[0].type === 'horizontal', '水平線類型正確');
            
            // Test vertical line
            const verticalBoard = [
                [1, 0, 0, 0, 0],
                [1, 0, 0, 0, 0],
                [1, 0, 0, 0, 0],
                [1, 0, 0, 0, 0],
                [1, 0, 0, 0, 0]
            ];
            const verticalLines = lineDetector.getAllLines(verticalBoard);
            this.assert(verticalLines.length === 1, '正確檢測垂直線');
            this.assert(verticalLines[0].type === 'vertical', '垂直線類型正確');
            
            // Test diagonal line
            const diagonalBoard = [
                [1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
            const diagonalLines = lineDetector.getAllLines(diagonalBoard);
            this.assert(diagonalLines.length === 1, '正確檢測對角線');
            this.assert(diagonalLines[0].type === 'diagonal-main', '主對角線類型正確');
            
            // Test mixed lines (cooperative)
            const mixedBoard = [
                [1, 2, 1, 2, 1],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            const mixedLines = lineDetector.getAllLines(mixedBoard);
            this.assert(mixedLines.length === 1, '正確檢測混合連線（合作模式）');
            
            // Test probability calculator with edge cases
            const probabilityCalculator = new ProbabilityCalculator();
            
            // Test empty board
            const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));
            const suggestion = probabilityCalculator.getBestSuggestion(emptyBoard);
            this.assert(suggestion !== null, '空板能提供建議');
            this.assert(suggestion.row === 2 && suggestion.col === 2, '空板建議中心位置');
            
            // Test full board
            const fullBoard = Array(5).fill().map(() => Array(5).fill(1));
            const fullBoardSuggestion = probabilityCalculator.getBestSuggestion(fullBoard);
            this.assert(fullBoardSuggestion === null, '滿板無法提供建議');
            
        } catch (error) {
            this.assert(false, `邊界情況測試失敗: ${error.message}`);
        }
    }

    /**
     * Test UI integration scenarios
     */
    async testUIIntegrationScenarios() {
        console.log('🖥️ 測試UI整合場景...');
        
        try {
            // Test game state synchronization
            const gameEngine = new GameEngine();
            gameEngine.startGame();
            
            // Simulate UI interactions
            const gameState = gameEngine.getGameState();
            this.assert(gameState.gamePhase === 'player-turn', 'UI狀態同步：玩家回合');
            
            // Test suggestion system
            const suggestion = gameEngine.getBestMove();
            this.assert(suggestion !== null, '建議系統正常工作');
            this.assert(typeof suggestion.row === 'number', '建議包含有效行位置');
            this.assert(typeof suggestion.col === 'number', '建議包含有效列位置');
            
            // Test move validation
            const isValidMove = gameEngine.isValidMove(suggestion.row, suggestion.col);
            this.assert(isValidMove === true, '建議的移動是有效的');
            
            // Test game progress tracking
            const initialProgress = gameEngine.getGameProgress();
            this.assert(initialProgress === 0, '初始進度為0%');
            
            // Make some moves and check progress
            gameEngine.processPlayerTurn(suggestion.row, suggestion.col);
            const emptyCells = this.getEmptyCells(gameEngine.getGameState().board);
            if (emptyCells.length > 0) {
                gameEngine.processComputerTurn(emptyCells[0].row, emptyCells[0].col);
            }
            
            const progressAfterRound1 = gameEngine.getGameProgress();
            this.assert(progressAfterRound1 > 0, '完成一回合後進度增加');
            
        } catch (error) {
            this.assert(false, `UI整合測試失敗: ${error.message}`);
        }
    }

    /**
     * Get empty cells from board
     */
    getEmptyCells(board) {
        const emptyCells = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }

    /**
     * Assert function for testing
     */
    assert(condition, message) {
        const result = {
            passed: !!condition,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (result.passed) {
            this.passedTests++;
            console.log(`  ✅ ${message}`);
        } else {
            this.failedTests++;
            console.log(`  ❌ ${message}`);
        }
    }

    /**
     * Print final test results
     */
    printTestResults() {
        console.log('\n📊 測試結果總結:');
        console.log(`總測試數: ${this.testResults.length}`);
        console.log(`通過: ${this.passedTests}`);
        console.log(`失敗: ${this.failedTests}`);
        console.log(`成功率: ${((this.passedTests / this.testResults.length) * 100).toFixed(1)}%`);
        
        if (this.failedTests > 0) {
            console.log('\n❌ 失敗的測試:');
            this.testResults
                .filter(result => !result.passed)
                .forEach(result => {
                    console.log(`  - ${result.message}`);
                });
        }
        
        console.log('\n🎯 整合測試完成！');
        
        if (this.failedTests === 0) {
            console.log('🎉 所有測試通過！系統整合成功。');
        } else {
            console.log('⚠️ 發現問題，需要修復後重新測試。');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new EndToEndIntegrationTest();
    tester.runAllTests().catch(error => {
        console.error('測試執行失敗:', error);
        process.exit(1);
    });
}

module.exports = EndToEndIntegrationTest;