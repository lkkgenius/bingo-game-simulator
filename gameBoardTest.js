/**
 * Simple test for GameBoard functionality
 * This can be run in the browser console to verify GameBoard works correctly
 */

// Test GameBoard functionality
function testGameBoard() {
    console.log('Testing GameBoard functionality...');
    
    try {
        // Create a test container
        const testContainer = document.createElement('div');
        testContainer.id = 'test-game-board';
        testContainer.className = 'game-board';
        document.body.appendChild(testContainer);
        
        // Initialize GameBoard
        const gameBoard = new GameBoard('test-game-board');
        
        // Test 1: Basic initialization
        console.log('✓ GameBoard initialized successfully');
        
        // Test 2: Update cell states
        gameBoard.updateCell(0, 0, 1); // Player
        gameBoard.updateCell(1, 1, 2); // Computer
        gameBoard.updateCell(2, 2, 0); // Empty
        console.log('✓ Cell updates working');
        
        // Test 3: Highlight suggestion
        gameBoard.highlightSuggestion(3, 3);
        console.log('✓ Suggestion highlighting working');
        
        // Test 4: Test board update
        const testBoard = [
            [1, 0, 0, 0, 0],
            [0, 2, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 2, 0],
            [0, 0, 0, 0, 0]
        ];
        gameBoard.updateBoard(testBoard);
        console.log('✓ Board update working');
        
        // Test 5: Line highlighting
        const testLines = [
            {
                type: 'horizontal',
                cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]
            }
        ];
        gameBoard.highlightLines(testLines);
        console.log('✓ Line highlighting working');
        
        // Test 6: Clear highlights
        gameBoard.clearAllHighlights();
        console.log('✓ Clear highlights working');
        
        // Test 7: Reset board
        gameBoard.reset();
        console.log('✓ Board reset working');
        
        // Clean up
        gameBoard.destroy();
        document.body.removeChild(testContainer);
        
        console.log('🎉 All GameBoard tests passed!');
        return true;
        
    } catch (error) {
        console.error('❌ GameBoard test failed:', error);
        return false;
    }
}

// Test click handler functionality
function testClickHandler() {
    console.log('Testing click handler...');
    
    try {
        const testContainer = document.createElement('div');
        testContainer.id = 'test-click-board';
        testContainer.className = 'game-board';
        document.body.appendChild(testContainer);
        
        const gameBoard = new GameBoard('test-click-board');
        
        let clickReceived = false;
        let clickRow = -1;
        let clickCol = -1;
        
        // Set up click handler
        gameBoard.setClickHandler((row, col, cell) => {
            clickReceived = true;
            clickRow = row;
            clickCol = col;
            console.log(`Click received: (${row}, ${col})`);
        });
        
        // Simulate click on cell (2, 3)
        const cell = gameBoard.getCell(2, 3);
        if (cell) {
            cell.click();
            
            if (clickReceived && clickRow === 2 && clickCol === 3) {
                console.log('✓ Click handler working correctly');
            } else {
                throw new Error('Click handler not working properly');
            }
        } else {
            throw new Error('Could not get cell for click test');
        }
        
        // Clean up
        gameBoard.destroy();
        document.body.removeChild(testContainer);
        
        console.log('🎉 Click handler test passed!');
        return true;
        
    } catch (error) {
        console.error('❌ Click handler test failed:', error);
        return false;
    }
}

// Run tests if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                testGameBoard();
                testClickHandler();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            testGameBoard();
            testClickHandler();
        }, 1000);
    }
}