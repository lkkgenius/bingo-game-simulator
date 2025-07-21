/**
 * 用戶輸入和互動系統測試
 * 測試輸入驗證、錯誤處理和用戶提示功能
 */

// 模擬DOM環境
const { JSDOM } = require('jsdom');

// 設置測試環境
function setupTestEnvironment() {
    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bingo Game Test</title>
        </head>
        <body>
            <div class="container">
                <div class="control-panel">
                    <div class="input-area">
                        <h3>電腦選擇輸入</h3>
                        <div class="computer-input">
                            <label for="computer-row">行 (1-5):</label>
                            <input type="number" id="computer-row" min="1" max="5" disabled>
                            <label for="computer-col">列 (1-5):</label>
                            <input type="number" id="computer-col" min="1" max="5" disabled>
                            <button id="confirm-computer-move" disabled>確認電腦移動</button>
                        </div>
                    </div>
                </div>
                
                <div class="instructions">
                    <h3>操作指示</h3>
                    <div id="instruction-text" class="instruction-text">
                        點擊「開始遊戲」按鈕開始新的遊戲
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);

    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    
    return dom;
}

// 模擬遊戲狀態
class MockGameState {
    constructor() {
        this.board = Array(5).fill().map(() => Array(5).fill(0));
        this.gamePhase = 'computer-turn';
    }
    
    isCellEmpty(row, col) {
        return this.board[row][col] === 0;
    }
    
    makeComputerMove(row, col) {
        if (!this.isCellEmpty(row, col)) {
            throw new Error(`位置 (${row + 1}, ${col + 1}) 已被佔用`);
        }
        this.board[row][col] = 2;
        return true;
    }
}

// 輸入驗證函數（從script.js複製）
function validateComputerInput(rowValue, colValue) {
    const errors = [];
    const invalidFields = [];
    let row = null;
    let col = null;
    
    // Check if values are provided
    if (!rowValue || rowValue.trim() === '') {
        errors.push('請輸入行數');
        invalidFields.push('row');
    } else {
        // Parse and validate row
        const parsedRow = parseInt(rowValue.trim());
        if (isNaN(parsedRow)) {
            errors.push('行數必須是數字');
            invalidFields.push('row');
        } else if (parsedRow < 1 || parsedRow > 5) {
            errors.push('行數必須在 1-5 之間');
            invalidFields.push('row');
        } else {
            row = parsedRow - 1; // Convert to 0-based index
        }
    }
    
    if (!colValue || colValue.trim() === '') {
        errors.push('請輸入列數');
        invalidFields.push('col');
    } else {
        // Parse and validate column
        const parsedCol = parseInt(colValue.trim());
        if (isNaN(parsedCol)) {
            errors.push('列數必須是數字');
            invalidFields.push('col');
        } else if (parsedCol < 1 || parsedCol > 5) {
            errors.push('列數必須在 1-5 之間');
            invalidFields.push('col');
        } else {
            col = parsedCol - 1; // Convert to 0-based index
        }
    }
    
    return {
        isValid: errors.length === 0,
        row: row,
        col: col,
        errors: errors,
        invalidFields: invalidFields
    };
}

// 用戶輸入系統類
class UserInputSystem {
    constructor() {
        this.gameState = new MockGameState();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const confirmButton = document.getElementById('confirm-computer-move');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => this.handleComputerMove());
        }
    }
    
    enableComputerInput() {
        const computerRow = document.getElementById('computer-row');
        const computerCol = document.getElementById('computer-col');
        const confirmButton = document.getElementById('confirm-computer-move');
        
        if (computerRow) computerRow.disabled = false;
        if (computerCol) computerCol.disabled = false;
        if (confirmButton) confirmButton.disabled = false;
        
        this.updateInstructions('請輸入電腦的移動位置 (行: 1-5, 列: 1-5)');
    }
    
    disableComputerInput() {
        const computerRow = document.getElementById('computer-row');
        const computerCol = document.getElementById('computer-col');
        const confirmButton = document.getElementById('confirm-computer-move');
        
        if (computerRow) computerRow.disabled = true;
        if (computerCol) computerCol.disabled = true;
        if (confirmButton) confirmButton.disabled = true;
    }
    
    handleComputerMove() {
        try {
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            
            if (!computerRow || !computerCol) {
                throw new Error('找不到電腦輸入控件');
            }
            
            // Clear any previous error styling
            this.clearInputErrors();
            
            // Get and validate input values
            const inputValidation = validateComputerInput(computerRow.value, computerCol.value);
            
            if (!inputValidation.isValid) {
                this.showInputError(inputValidation.errors);
                this.highlightInvalidInputs(inputValidation.invalidFields);
                return false;
            }
            
            const row = inputValidation.row;
            const col = inputValidation.col;
            
            // Check if the cell is already occupied
            if (!this.gameState.isCellEmpty(row, col)) {
                const errorMsg = `位置 (${row + 1}, ${col + 1}) 已被佔用，請選擇其他位置`;
                this.showInputError([errorMsg]);
                this.highlightInvalidInputs(['row', 'col']);
                return false;
            }
            
            // Make computer move
            this.gameState.makeComputerMove(row, col);
            
            // Clear input fields and reset styling
            computerRow.value = '';
            computerCol.value = '';
            this.clearInputErrors();
            
            // Show success feedback
            this.showSuccessMessage(`電腦選擇了位置 (${row + 1}, ${col + 1})`);
            
            return true;
            
        } catch (error) {
            console.error('Error handling computer move:', error);
            this.showError(error.message);
            this.clearInputErrors();
            return false;
        }
    }
    
    showInputError(errors) {
        const errorContainer = this.getOrCreateErrorContainer();
        errorContainer.innerHTML = '';
        errorContainer.className = 'input-error-container';
        
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'input-error-message';
            errorElement.textContent = error;
            errorContainer.appendChild(errorElement);
        });
        
        errorContainer.style.display = 'block';
    }
    
    highlightInvalidInputs(invalidFields) {
        invalidFields.forEach(field => {
            const inputElement = document.getElementById(`computer-${field}`);
            if (inputElement) {
                inputElement.classList.add('input-error');
            }
        });
    }
    
    clearInputErrors() {
        // Clear error messages
        const errorContainer = document.getElementById('input-error-container');
        if (errorContainer) {
            errorContainer.style.display = 'none';
            errorContainer.innerHTML = '';
        }
        
        // Clear error styling from input fields
        const computerRow = document.getElementById('computer-row');
        const computerCol = document.getElementById('computer-col');
        
        if (computerRow) {
            computerRow.classList.remove('input-error');
        }
        if (computerCol) {
            computerCol.classList.remove('input-error');
        }
    }
    
    getOrCreateErrorContainer() {
        let errorContainer = document.getElementById('input-error-container');
        
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'input-error-container';
            errorContainer.className = 'input-error-container';
            errorContainer.style.display = 'none';
            
            // Insert after the computer input area
            const computerInputArea = document.querySelector('.computer-input');
            if (computerInputArea) {
                computerInputArea.appendChild(errorContainer);
            }
        }
        
        return errorContainer;
    }
    
    showSuccessMessage(message) {
        const successContainer = this.getOrCreateSuccessContainer();
        successContainer.textContent = message;
        successContainer.style.display = 'block';
        successContainer.className = 'success-message';
    }
    
    getOrCreateSuccessContainer() {
        let successContainer = document.getElementById('success-message-container');
        
        if (!successContainer) {
            successContainer = document.createElement('div');
            successContainer.id = 'success-message-container';
            successContainer.className = 'success-message';
            successContainer.style.display = 'none';
            
            // Insert after the instructions area
            const instructionsArea = document.querySelector('.instructions');
            if (instructionsArea) {
                instructionsArea.appendChild(successContainer);
            }
        }
        
        return successContainer;
    }
    
    showError(message) {
        console.error('User Input Error:', message);
    }
    
    updateInstructions(text) {
        const instructionElement = document.getElementById('instruction-text');
        if (instructionElement) {
            instructionElement.textContent = text;
        }
    }
}

// 測試套件
describe('用戶輸入和互動系統測試', () => {
    let dom;
    let userInputSystem;
    
    beforeEach(() => {
        dom = setupTestEnvironment();
        userInputSystem = new UserInputSystem();
    });
    
    afterEach(() => {
        if (dom) {
            dom.window.close();
        }
    });
    
    describe('輸入驗證測試', () => {
        test('應該驗證空輸入', () => {
            const result = validateComputerInput('', '');
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('請輸入行數');
            expect(result.errors).toContain('請輸入列數');
            expect(result.invalidFields).toContain('row');
            expect(result.invalidFields).toContain('col');
        });
        
        test('應該驗證非數字輸入', () => {
            const result = validateComputerInput('abc', 'xyz');
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('行數必須是數字');
            expect(result.errors).toContain('列數必須是數字');
        });
        
        test('應該驗證超出範圍的輸入', () => {
            const result = validateComputerInput('0', '6');
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('行數必須在 1-5 之間');
            expect(result.errors).toContain('列數必須在 1-5 之間');
        });
        
        test('應該接受有效輸入', () => {
            const result = validateComputerInput('3', '4');
            
            expect(result.isValid).toBe(true);
            expect(result.row).toBe(2); // 0-based index
            expect(result.col).toBe(3); // 0-based index
            expect(result.errors).toHaveLength(0);
        });
        
        test('應該處理帶空格的輸入', () => {
            const result = validateComputerInput(' 2 ', ' 5 ');
            
            expect(result.isValid).toBe(true);
            expect(result.row).toBe(1);
            expect(result.col).toBe(4);
        });
        
        test('應該驗證邊界值', () => {
            const result1 = validateComputerInput('1', '1');
            expect(result1.isValid).toBe(true);
            expect(result1.row).toBe(0);
            expect(result1.col).toBe(0);
            
            const result2 = validateComputerInput('5', '5');
            expect(result2.isValid).toBe(true);
            expect(result2.row).toBe(4);
            expect(result2.col).toBe(4);
        });
    });
    
    describe('用戶界面互動測試', () => {
        test('應該能夠啟用電腦輸入控件', () => {
            userInputSystem.enableComputerInput();
            
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            const confirmButton = document.getElementById('confirm-computer-move');
            
            expect(computerRow.disabled).toBe(false);
            expect(computerCol.disabled).toBe(false);
            expect(confirmButton.disabled).toBe(false);
        });
        
        test('應該能夠禁用電腦輸入控件', () => {
            userInputSystem.disableComputerInput();
            
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            const confirmButton = document.getElementById('confirm-computer-move');
            
            expect(computerRow.disabled).toBe(true);
            expect(computerCol.disabled).toBe(true);
            expect(confirmButton.disabled).toBe(true);
        });
        
        test('應該能夠更新操作指示', () => {
            const testMessage = '測試指示訊息';
            userInputSystem.updateInstructions(testMessage);
            
            const instructionElement = document.getElementById('instruction-text');
            expect(instructionElement.textContent).toBe(testMessage);
        });
        
        test('應該能夠創建錯誤容器', () => {
            const errorContainer = userInputSystem.getOrCreateErrorContainer();
            
            expect(errorContainer).toBeTruthy();
            expect(errorContainer.id).toBe('input-error-container');
            expect(errorContainer.className).toBe('input-error-container');
        });
        
        test('應該能夠創建成功訊息容器', () => {
            const successContainer = userInputSystem.getOrCreateSuccessContainer();
            
            expect(successContainer).toBeTruthy();
            expect(successContainer.id).toBe('success-message-container');
            expect(successContainer.className).toBe('success-message');
        });
    });
    
    describe('錯誤處理測試', () => {
        test('應該顯示輸入錯誤訊息', () => {
            const errors = ['測試錯誤1', '測試錯誤2'];
            userInputSystem.showInputError(errors);
            
            const errorContainer = document.getElementById('input-error-container');
            expect(errorContainer.style.display).toBe('block');
            
            const errorMessages = errorContainer.querySelectorAll('.input-error-message');
            expect(errorMessages).toHaveLength(2);
            expect(errorMessages[0].textContent).toBe('測試錯誤1');
            expect(errorMessages[1].textContent).toBe('測試錯誤2');
        });
        
        test('應該高亮無效輸入欄位', () => {
            const invalidFields = ['row', 'col'];
            userInputSystem.highlightInvalidInputs(invalidFields);
            
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            
            expect(computerRow.classList.contains('input-error')).toBe(true);
            expect(computerCol.classList.contains('input-error')).toBe(true);
        });
        
        test('應該能夠清除輸入錯誤', () => {
            // 先設置錯誤狀態
            userInputSystem.showInputError(['測試錯誤']);
            userInputSystem.highlightInvalidInputs(['row', 'col']);
            
            // 清除錯誤
            userInputSystem.clearInputErrors();
            
            const errorContainer = document.getElementById('input-error-container');
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            
            expect(errorContainer.style.display).toBe('none');
            expect(computerRow.classList.contains('input-error')).toBe(false);
            expect(computerCol.classList.contains('input-error')).toBe(false);
        });
        
        test('應該顯示成功訊息', () => {
            const successMessage = '操作成功！';
            userInputSystem.showSuccessMessage(successMessage);
            
            const successContainer = document.getElementById('success-message-container');
            expect(successContainer.style.display).toBe('block');
            expect(successContainer.textContent).toBe(successMessage);
        });
    });
    
    describe('電腦移動處理測試', () => {
        beforeEach(() => {
            userInputSystem.enableComputerInput();
        });
        
        test('應該成功處理有效的電腦移動', () => {
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            
            computerRow.value = '3';
            computerCol.value = '4';
            
            const result = userInputSystem.handleComputerMove();
            
            expect(result).toBe(true);
            expect(computerRow.value).toBe(''); // 應該清空輸入
            expect(computerCol.value).toBe(''); // 應該清空輸入
        });
        
        test('應該拒絕無效的電腦移動', () => {
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            
            computerRow.value = 'abc';
            computerCol.value = 'xyz';
            
            const result = userInputSystem.handleComputerMove();
            
            expect(result).toBe(false);
            
            // 檢查錯誤顯示
            const errorContainer = document.getElementById('input-error-container');
            expect(errorContainer.style.display).toBe('block');
        });
        
        test('應該拒絕已佔用位置的移動', () => {
            // 先佔用一個位置
            userInputSystem.gameState.board[2][3] = 1; // 玩家佔用 (3,4)
            
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            
            computerRow.value = '3';
            computerCol.value = '4';
            
            const result = userInputSystem.handleComputerMove();
            
            expect(result).toBe(false);
            
            // 檢查錯誤顯示
            const errorContainer = document.getElementById('input-error-container');
            expect(errorContainer.style.display).toBe('block');
            
            const errorMessage = errorContainer.querySelector('.input-error-message');
            expect(errorMessage.textContent).toContain('已被佔用');
        });
        
        test('應該處理空輸入', () => {
            const computerRow = document.getElementById('computer-row');
            const computerCol = document.getElementById('computer-col');
            
            computerRow.value = '';
            computerCol.value = '';
            
            const result = userInputSystem.handleComputerMove();
            
            expect(result).toBe(false);
            
            // 檢查錯誤顯示
            const errorContainer = document.getElementById('input-error-container');
            expect(errorContainer.style.display).toBe('block');
            
            const errorMessages = errorContainer.querySelectorAll('.input-error-message');
            expect(errorMessages.length).toBeGreaterThan(0);
        });
    });
    
    describe('邊界情況測試', () => {
        test('應該處理缺少DOM元素的情況', () => {
            // 移除必要的DOM元素
            const computerRow = document.getElementById('computer-row');
            if (computerRow) {
                computerRow.remove();
            }
            
            const result = userInputSystem.handleComputerMove();
            expect(result).toBe(false);
        });
        
        test('應該處理極端輸入值', () => {
            const testCases = [
                { row: '-999', col: '999', valid: false },
                { row: '0.5', col: '2.7', valid: false },
                { row: '1e10', col: '-1e10', valid: false },
                { row: 'Infinity', col: '-Infinity', valid: false },
                { row: 'NaN', col: 'undefined', valid: false }
            ];
            
            testCases.forEach(testCase => {
                const result = validateComputerInput(testCase.row, testCase.col);
                expect(result.isValid).toBe(testCase.valid);
            });
        });
        
        test('應該處理Unicode和特殊字符輸入', () => {
            const testCases = [
                '中文',
                '🎮',
                '½',
                '²',
                '∞',
                '№'
            ];
            
            testCases.forEach(input => {
                const result = validateComputerInput(input, input);
                expect(result.isValid).toBe(false);
            });
        });
    });
});

// 如果在Node.js環境中運行測試
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateComputerInput,
        UserInputSystem,
        setupTestEnvironment
    };
}