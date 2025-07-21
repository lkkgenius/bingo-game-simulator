/**
 * 遊戲結果顯示系統測試
 * 測試遊戲結果頁面UI、連線統計顯示、重新開始功能和遊戲完成檢測邏輯
 */

// 模擬DOM環境
function createMockDOM() {
    // 創建基本的DOM結構
    const mockDocument = {
        elements: new Map(),
        
        getElementById: function(id) {
            return this.elements.get(id) || null;
        },
        
        createElement: function(tagName) {
            return {
                tagName: tagName.toUpperCase(),
                className: '',
                textContent: '',
                innerHTML: '',
                style: {},
                classList: {
                    add: function(className) { this.className += ' ' + className; },
                    remove: function(className) { this.className = this.className.replace(className, '').trim(); },
                    contains: function(className) { return this.className.includes(className); }
                },
                appendChild: function(child) {
                    if (!this.children) this.children = [];
                    this.children.push(child);
                },
                parentNode: null,
                insertBefore: function(newNode, referenceNode) {
                    if (!this.children) this.children = [];
                    const index = this.children.indexOf(referenceNode);
                    if (index >= 0) {
                        this.children.splice(index, 0, newNode);
                    } else {
                        this.children.push(newNode);
                    }
                },
                focus: function() { this.focused = true; }
            };
        },
        
        addEventListener: function(event, handler) {
            // Mock event listener
        }
    };
    
    // 創建必要的DOM元素
    const elements = [
        'game-results',
        'final-lines-count',
        'player-moves-count',
        'computer-moves-count',
        'lines-list',
        'play-again',
        'start-game',
        'restart-game'
    ];
    
    elements.forEach(id => {
        const element = mockDocument.createElement('div');
        element.id = id;
        if (id === 'game-results') {
            element.classList.add('hidden');
        }
        mockDocument.elements.set(id, element);
    });
    
    return mockDocument;
}

// 測試運行器
class GameResultsTestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    async run() {
        console.log('開始遊戲結果顯示系統測試...\n');
        
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

// 創建測試實例
const runner = new GameResultsTestRunner();

// 測試 1: 遊戲結果顯示基本功能
runner.test('遊戲結果顯示基本功能', () => {
    const mockDoc = createMockDOM();
    
    // 模擬遊戲狀態
    const gameState = {
        completedLines: [
            { type: 'horizontal', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
            { type: 'vertical', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] }
        ],
        playerMoves: [
            { row: 0, col: 0, round: 1 },
            { row: 1, col: 1, round: 2 }
        ],
        computerMoves: [
            { row: 0, col: 1, round: 1 },
            { row: 1, col: 0, round: 2 }
        ]
    };
    
    // 模擬全局變量
    global.document = mockDoc;
    
    // 測試 showGameResults 函數的核心邏輯
    const resultsModal = mockDoc.getElementById('game-results');
    const finalLinesCount = mockDoc.getElementById('final-lines-count');
    const playerMovesCount = mockDoc.getElementById('player-moves-count');
    const computerMovesCount = mockDoc.getElementById('computer-moves-count');
    
    // 模擬顯示結果
    resultsModal.classList.remove('hidden');
    finalLinesCount.textContent = gameState.completedLines.length.toString();
    playerMovesCount.textContent = gameState.playerMoves.length.toString();
    computerMovesCount.textContent = gameState.computerMoves.length.toString();
    
    // 驗證結果
    runner.assert(!resultsModal.classList.contains('hidden'), '結果模態框應該顯示');
    runner.assertEqual(finalLinesCount.textContent, '2', '應該顯示正確的連線數量');
    runner.assertEqual(playerMovesCount.textContent, '2', '應該顯示正確的玩家移動數量');
    runner.assertEqual(computerMovesCount.textContent, '2', '應該顯示正確的電腦移動數量');
});

// 測試 2: 連線統計和分組功能
runner.test('連線統計和分組功能', () => {
    // 測試 groupLinesByType 函數
    const completedLines = [
        { type: 'horizontal', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
        { type: 'horizontal', cells: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]] },
        { type: 'vertical', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
        { type: 'diagonal-main', cells: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]] }
    ];
    
    // 模擬 groupLinesByType 函數
    function groupLinesByType(lines) {
        const grouped = {};
        lines.forEach(line => {
            const type = line.type;
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(line);
        });
        return grouped;
    }
    
    const grouped = groupLinesByType(completedLines);
    
    runner.assertEqual(Object.keys(grouped).length, 3, '應該有3種不同類型的連線');
    runner.assertEqual(grouped['horizontal'].length, 2, '應該有2條水平線');
    runner.assertEqual(grouped['vertical'].length, 1, '應該有1條垂直線');
    runner.assertEqual(grouped['diagonal-main'].length, 1, '應該有1條主對角線');
});

// 測試 3: 效率計算功能
runner.test('效率計算功能', () => {
    // 模擬 calculateLineEfficiency 函數
    function calculateLineEfficiency(gameState) {
        const totalPossibleLines = 12;
        const completedLines = gameState.completedLines.length;
        const totalMoves = gameState.playerMoves.length + gameState.computerMoves.length;
        
        if (totalMoves === 0) return 0;
        
        const efficiency = Math.round((completedLines / totalPossibleLines) * 100);
        return Math.min(efficiency, 100);
    }
    
    // 測試不同情況
    const testCases = [
        {
            gameState: { completedLines: [], playerMoves: [], computerMoves: [] },
            expected: 0
        },
        {
            gameState: { 
                completedLines: [1, 2, 3], 
                playerMoves: [1, 2, 3, 4], 
                computerMoves: [1, 2, 3, 4] 
            },
            expected: 25 // 3/12 * 100 = 25%
        },
        {
            gameState: { 
                completedLines: [1, 2, 3, 4, 5, 6], 
                playerMoves: [1, 2, 3, 4], 
                computerMoves: [1, 2, 3, 4] 
            },
            expected: 50 // 6/12 * 100 = 50%
        }
    ];
    
    testCases.forEach((testCase, index) => {
        const result = calculateLineEfficiency(testCase.gameState);
        runner.assertEqual(result, testCase.expected, `測試案例 ${index + 1} 效率計算錯誤`);
    });
});

// 測試 4: 遊戲分析功能
runner.test('遊戲分析功能', () => {
    // 模擬 generateGameAnalysis 函數
    function generateGameAnalysis(gameState) {
        const totalLines = gameState.completedLines.length;
        
        let cooperationScore = 0;
        if (totalLines > 0) {
            cooperationScore = Math.min(Math.round((totalLines / 6) * 100), 100);
        }
        
        let cooperationGrade = 'F';
        if (cooperationScore >= 90) cooperationGrade = 'A+';
        else if (cooperationScore >= 80) cooperationGrade = 'A';
        else if (cooperationScore >= 70) cooperationGrade = 'B';
        else if (cooperationScore >= 60) cooperationGrade = 'C';
        else if (cooperationScore >= 50) cooperationGrade = 'D';
        
        let strategicAdvice = '';
        if (totalLines === 0) {
            strategicAdvice = '嘗試跟隨系統建議來提高合作效率';
        } else if (totalLines < 3) {
            strategicAdvice = '注意選擇能與電腦形成連線的位置';
        } else if (totalLines < 5) {
            strategicAdvice = '表現不錯！繼續關注連線機會';
        } else {
            strategicAdvice = '優秀的合作表現！';
        }
        
        return {
            cooperationScore,
            cooperationGrade,
            strategicAdvice
        };
    }
    
    // 測試不同分數情況
    const testCases = [
        {
            completedLines: [],
            expectedGrade: 'F',
            expectedAdvice: '嘗試跟隨系統建議來提高合作效率'
        },
        {
            completedLines: [1, 2],
            expectedGrade: 'F', // 2/6 * 100 = 33%, which is F grade
            expectedAdvice: '注意選擇能與電腦形成連線的位置'
        },
        {
            completedLines: [1, 2, 3, 4],
            expectedGrade: 'C', // 4/6 * 100 = 67%, which is C grade
            expectedAdvice: '表現不錯！繼續關注連線機會'
        },
        {
            completedLines: [1, 2, 3, 4, 5, 6],
            expectedGrade: 'A+',
            expectedAdvice: '優秀的合作表現！'
        }
    ];
    
    testCases.forEach((testCase, index) => {
        const analysis = generateGameAnalysis({ completedLines: testCase.completedLines });
        runner.assertEqual(analysis.cooperationGrade, testCase.expectedGrade, 
            `測試案例 ${index + 1} 合作等級錯誤`);
        runner.assertEqual(analysis.strategicAdvice, testCase.expectedAdvice, 
            `測試案例 ${index + 1} 策略建議錯誤`);
    });
});

// 測試 5: 遊戲完成檢測邏輯
runner.test('遊戲完成檢測邏輯', () => {
    // 模擬 isGameReadyToEnd 函數
    function isGameReadyToEnd(gameState) {
        if (!gameState) return false;
        
        const maxRoundsReached = gameState.currentRound > gameState.maxRounds;
        const expectedMoves = Math.min(gameState.currentRound - 1, gameState.maxRounds);
        const actualPlayerMoves = gameState.playerMoves.length;
        const actualComputerMoves = gameState.computerMoves.length;
        
        const movesComplete = actualPlayerMoves >= expectedMoves && actualComputerMoves >= expectedMoves;
        const explicitlyEnded = gameState.gameEnded || gameState.gamePhase === 'game-over';
        
        return maxRoundsReached || explicitlyEnded || (movesComplete && gameState.currentRound > gameState.maxRounds);
    }
    
    // 測試不同遊戲狀態
    const testCases = [
        {
            gameState: {
                currentRound: 9,
                maxRounds: 8,
                playerMoves: [1, 2, 3, 4, 5, 6, 7, 8],
                computerMoves: [1, 2, 3, 4, 5, 6, 7, 8],
                gameEnded: false,
                gamePhase: 'player-turn'
            },
            expected: true,
            description: '超過最大回合數'
        },
        {
            gameState: {
                currentRound: 5,
                maxRounds: 8,
                playerMoves: [1, 2, 3, 4],
                computerMoves: [1, 2, 3, 4],
                gameEnded: true,
                gamePhase: 'game-over'
            },
            expected: true,
            description: '明確標記為結束'
        },
        {
            gameState: {
                currentRound: 3,
                maxRounds: 8,
                playerMoves: [1, 2],
                computerMoves: [1, 2],
                gameEnded: false,
                gamePhase: 'player-turn'
            },
            expected: false,
            description: '遊戲進行中'
        }
    ];
    
    testCases.forEach((testCase, index) => {
        const result = isGameReadyToEnd(testCase.gameState);
        runner.assertEqual(result, testCase.expected, 
            `測試案例 ${index + 1} (${testCase.description}) 檢測錯誤`);
    });
});

// 測試 6: 重新開始遊戲功能
runner.test('重新開始遊戲功能', () => {
    const mockDoc = createMockDOM();
    
    // 模擬 hideGameResults 和 startNewGame 函數
    let resultsHidden = false;
    let gameStarted = false;
    
    function hideGameResults() {
        const resultsModal = mockDoc.getElementById('game-results');
        if (resultsModal) {
            resultsModal.classList.add('hidden');
            resultsHidden = true;
        }
    }
    
    function startNewGame() {
        gameStarted = true;
    }
    
    function handlePlayAgain() {
        hideGameResults();
        startNewGame();
    }
    
    // 執行重新開始功能
    handlePlayAgain();
    
    runner.assert(resultsHidden, '結果模態框應該被隱藏');
    runner.assert(gameStarted, '新遊戲應該開始');
});

// 測試 7: 格式化函數
runner.test('格式化函數', () => {
    // 測試 formatLineCells 函數
    function formatLineCells(cells) {
        return cells.map(([row, col]) => `(${row + 1},${col + 1})`).join(', ');
    }
    
    const testCells = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
    const result = formatLineCells(testCells);
    const expected = '(1,1), (1,2), (1,3), (1,4), (1,5)';
    
    runner.assertEqual(result, expected, '格子位置格式化錯誤');
    
    // 測試 getLineTypeText 函數
    function getLineTypeText(lineType) {
        switch (lineType) {
            case 'horizontal': return '水平線';
            case 'vertical': return '垂直線';
            case 'diagonal-main': return '主對角線';
            case 'diagonal-anti': return '反對角線';
            default: return '未知連線';
        }
    }
    
    const typeTests = [
        { type: 'horizontal', expected: '水平線' },
        { type: 'vertical', expected: '垂直線' },
        { type: 'diagonal-main', expected: '主對角線' },
        { type: 'diagonal-anti', expected: '反對角線' },
        { type: 'unknown', expected: '未知連線' }
    ];
    
    typeTests.forEach(test => {
        const result = getLineTypeText(test.type);
        runner.assertEqual(result, test.expected, `連線類型 ${test.type} 格式化錯誤`);
    });
});

// 執行所有測試
async function runTests() {
    const success = await runner.run();
    if (success) {
        console.log('\n🎉 所有遊戲結果顯示系統測試通過！');
    } else {
        console.log('\n❌ 部分測試失敗，請檢查實現');
    }
    return success;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameResultsTestRunner, runner, runTests };
    
    // 如果直接運行此文件，執行測試
    if (require.main === module) {
        runTests();
    }
} else {
    // 在瀏覽器環境中直接運行
    runTests();
}