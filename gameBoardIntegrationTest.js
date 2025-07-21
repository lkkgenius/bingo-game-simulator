/**
 * Comprehensive integration test for GameBoard UI component
 * Tests all required functionality for task 6
 */

// Mock DOM environment for testing
function createMockDOM() {
    const mockElements = new Map();
    
    global.document = {
        createElement: (tag) => {
            const element = {
                tagName: tag.toUpperCase(),
                id: '',
                className: '',
                dataset: {},
                innerHTML: '',
                children: [],
                parentNode: null,
                classList: {
                    add: function(...classes) {
                        classes.forEach(cls => {
                            if (!this.contains(cls)) {
                                this.value = (this.value || '').split(' ').concat(cls).filter(Boolean).join(' ');
                            }
                        });
                    },
                    remove: function(...classes) {
                        classes.forEach(cls => {
                            this.value = (this.value || '').split(' ').filter(c => c !== cls).join(' ');
                        });
                    },
                    contains: function(cls) {
                        return (this.value || '').split(' ').includes(cls);
                    },
                    toggle: function(cls, force) {
                        if (force !== undefined) {
                            if (force) this.add(cls);
                            else this.remove(cls);
                        } else {
                            if (this.contains(cls)) this.remove(cls);
                            else this.add(cls);
                        }
                    },
                    value: ''
                },
                setAttribute: function(name, value) {
                    this.attributes = this.attributes || {};
                    this.attributes[name] = value;
                },
                getAttribute: function(name) {
                    return this.attributes && this.attributes[name] || '';
                },
                appendChild: function(child) {
                    this.children.push(child);
                    child.parentNode = this;
                },
                addEventListener: function(event, handler) {
                    this.eventListeners = this.eventListeners || {};
                    this.eventListeners[event] = this.eventListeners[event] || [];
                    this.eventListeners[event].push(handler);
                },
                click: function() {
                    if (this.eventListeners && this.eventListeners.click) {
                        const event = { target: this, preventDefault: () => {} };
                        this.eventListeners.click.forEach(handler => handler(event));
                    }
                },
                closest: function(selector) {
                    if (selector === '.game-cell' && this.classList.contains('game-cell')) {
                        return this;
                    }
                    return null;
                }
            };
            return element;
        },
        getElementById: (id) => {
            if (!mockElements.has(id)) {
                const element = global.document.createElement('div');
                element.id = id;
                mockElements.set(id, element);
            }
            return mockElements.get(id);
        }
    };
    
    return mockElements;
}

// Load GameBoard class
function loadGameBoard() {
    const fs = require('fs');
    const gameBoardCode = fs.readFileSync('gameBoard.js', 'utf8');
    
    // Extract and evaluate the GameBoard class
    const classMatch = gameBoardCode.match(/class GameBoard\s*{[\s\S]*?^}/m);
    if (!classMatch) {
        throw new Error('GameBoard class not found in file');
    }
    
    // Create a safe evaluation context
    const safeEval = new Function('document', 'module', 'exports', classMatch[0] + '; return GameBoard;');
    return safeEval(global.document, { exports: {} }, {});
}

// Test suite
function runGameBoardTests() {
    console.log('🧪 Starting GameBoard Integration Tests...\n');
    
    const mockElements = createMockDOM();
    const GameBoard = loadGameBoard();
    
    let testsPassed = 0;
    let testsTotal = 0;
    
    function test(name, testFn) {
        testsTotal++;
        try {
            testFn();
            console.log(`✅ ${name}`);
            testsPassed++;
        } catch (error) {
            console.log(`❌ ${name}: ${error.message}`);
        }
    }
    
    // Test 1: GameBoard類別處理UI渲染
    test('創建GameBoard類別處理UI渲染', () => {
        const gameBoard = new GameBoard('test-board');
        
        if (!gameBoard.containerId) throw new Error('Container ID not set');
        if (!gameBoard.size || gameBoard.size !== 5) throw new Error('Size not set correctly');
        if (!gameBoard.cells || !Array.isArray(gameBoard.cells)) throw new Error('Cells array not initialized');
        if (!gameBoard.CELL_STATES) throw new Error('Cell states not defined');
        if (!gameBoard.LINE_TYPES) throw new Error('Line types not defined');
    });
    
    // Test 2: 格子點擊事件處理
    test('實作格子點擊事件處理', () => {
        const gameBoard = new GameBoard('test-board-2');
        
        let clickReceived = false;
        let clickRow = -1;
        let clickCol = -1;
        
        // Set up click handler
        gameBoard.setClickHandler((row, col, cell) => {
            clickReceived = true;
            clickRow = row;
            clickCol = col;
        });
        
        // Simulate click event
        const mockEvent = {
            target: {
                closest: () => ({
                    dataset: { row: '2', col: '3' },
                    classList: { contains: (cls) => cls === 'empty' }
                })
            }
        };
        
        gameBoard.handleCellClick(mockEvent);
        
        if (!clickReceived) throw new Error('Click event not handled');
        if (clickRow !== 2 || clickCol !== 3) throw new Error('Click coordinates incorrect');
    });
    
    // Test 3: 建議高亮顯示功能
    test('實作建議高亮顯示功能', () => {
        const gameBoard = new GameBoard('test-board-3');
        
        // Test highlight suggestion
        gameBoard.highlightSuggestion(1, 2);
        
        if (!gameBoard.currentSuggestion) throw new Error('Current suggestion not set');
        if (gameBoard.currentSuggestion.row !== 1 || gameBoard.currentSuggestion.col !== 2) {
            throw new Error('Suggestion coordinates incorrect');
        }
        
        // Test clear suggestion
        gameBoard.clearSuggestionHighlight();
        if (gameBoard.currentSuggestion !== null) throw new Error('Suggestion not cleared');
    });
    
    // Test 4: 連線高亮顯示功能
    test('實作連線高亮顯示功能', () => {
        const gameBoard = new GameBoard('test-board-4');
        
        const testLines = [
            {
                type: 'horizontal',
                cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]
            },
            {
                type: 'vertical',
                cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]
            }
        ];
        
        gameBoard.highlightLines(testLines);
        
        if (gameBoard.highlightedLines.length !== 2) {
            throw new Error('Highlighted lines not stored correctly');
        }
        
        // Test clear line highlights
        gameBoard.clearLineHighlights();
        if (gameBoard.highlightedLines.length !== 0) {
            throw new Error('Line highlights not cleared');
        }
    });
    
    // Test 5: 更新格子狀態
    test('更新格子狀態功能', () => {
        const gameBoard = new GameBoard('test-board-5');
        
        // Test valid position updates
        gameBoard.updateCell(0, 0, gameBoard.CELL_STATES.PLAYER);
        gameBoard.updateCell(1, 1, gameBoard.CELL_STATES.COMPUTER);
        gameBoard.updateCell(2, 2, gameBoard.CELL_STATES.EMPTY);
        
        // Test invalid position (should not throw error)
        gameBoard.updateCell(5, 5, gameBoard.CELL_STATES.PLAYER);
        gameBoard.updateCell(-1, -1, gameBoard.CELL_STATES.PLAYER);
    });
    
    // Test 6: 更新整個遊戲板
    test('更新整個遊戲板功能', () => {
        const gameBoard = new GameBoard('test-board-6');
        
        const testBoard = [
            [1, 0, 0, 0, 2],
            [0, 1, 0, 2, 0],
            [0, 0, 1, 0, 0],
            [0, 2, 0, 1, 0],
            [2, 0, 0, 0, 1]
        ];
        
        gameBoard.updateBoard(testBoard);
        
        // Test invalid board (should not crash)
        const invalidBoard = [[1, 2], [0, 1]]; // Wrong size
        gameBoard.updateBoard(invalidBoard);
    });
    
    // Test 7: 位置驗證
    test('位置驗證功能', () => {
        const gameBoard = new GameBoard('test-board-7');
        
        if (!gameBoard.isValidPosition(0, 0)) throw new Error('Valid position rejected');
        if (!gameBoard.isValidPosition(4, 4)) throw new Error('Valid position rejected');
        if (gameBoard.isValidPosition(5, 5)) throw new Error('Invalid position accepted');
        if (gameBoard.isValidPosition(-1, -1)) throw new Error('Invalid position accepted');
    });
    
    // Test 8: 遊戲板驗證
    test('遊戲板驗證功能', () => {
        const gameBoard = new GameBoard('test-board-8');
        
        const validBoard = Array(5).fill().map(() => Array(5).fill(0));
        if (!gameBoard.isValidBoard(validBoard)) throw new Error('Valid board rejected');
        
        const invalidBoard1 = Array(3).fill().map(() => Array(3).fill(0)); // Wrong size
        if (gameBoard.isValidBoard(invalidBoard1)) throw new Error('Invalid board accepted');
        
        const invalidBoard2 = Array(5).fill().map(() => Array(5).fill(5)); // Invalid values
        if (gameBoard.isValidBoard(invalidBoard2)) throw new Error('Invalid board accepted');
    });
    
    // Test 9: 重置功能
    test('重置遊戲板功能', () => {
        const gameBoard = new GameBoard('test-board-9');
        
        // Set some state
        gameBoard.highlightSuggestion(1, 1);
        gameBoard.highlightLines([{
            type: 'horizontal',
            cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]
        }]);
        
        // Reset
        gameBoard.reset();
        
        if (gameBoard.currentSuggestion !== null) throw new Error('Suggestion not cleared on reset');
        if (gameBoard.highlightedLines.length !== 0) throw new Error('Line highlights not cleared on reset');
    });
    
    // Test 10: 禁用狀態
    test('設置禁用狀態功能', () => {
        const gameBoard = new GameBoard('test-board-10');
        
        gameBoard.setDisabled(true);
        gameBoard.setDisabled(false);
        
        // Should not throw errors
    });
    
    // Test 11: 動畫功能
    test('格子動畫功能', () => {
        const gameBoard = new GameBoard('test-board-11');
        
        // Should not throw errors
        gameBoard.animateCell(2, 2, 'test-animation', 500);
        gameBoard.animateCell(5, 5, 'test-animation', 500); // Invalid position
    });
    
    // Test 12: 獲取方法
    test('獲取方法功能', () => {
        const gameBoard = new GameBoard('test-board-12');
        
        const cell = gameBoard.getCell(2, 2);
        if (!cell) throw new Error('Could not get valid cell');
        
        const invalidCell = gameBoard.getCell(5, 5);
        if (invalidCell !== null) throw new Error('Got invalid cell');
        
        const suggestion = gameBoard.getCurrentSuggestion();
        if (suggestion !== null) throw new Error('Should have no suggestion initially');
        
        const lines = gameBoard.getHighlightedLines();
        if (!Array.isArray(lines)) throw new Error('Should return array for highlighted lines');
    });
    
    // Test 13: 銷毀功能
    test('銷毀遊戲板功能', () => {
        const gameBoard = new GameBoard('test-board-13');
        
        gameBoard.destroy();
        
        if (gameBoard.clickHandler !== null) throw new Error('Click handler not cleared');
        if (gameBoard.cells.length !== 0) throw new Error('Cells not cleared');
    });
    
    // Summary
    console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
    
    if (testsPassed === testsTotal) {
        console.log('🎉 All GameBoard tests passed! Task 6 implementation is complete.');
        return true;
    } else {
        console.log('❌ Some tests failed. Please check the implementation.');
        return false;
    }
}

// Run tests
if (require.main === module) {
    runGameBoardTests();
}

module.exports = { runGameBoardTests };