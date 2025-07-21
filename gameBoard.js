/**
 * GameBoard - 負責處理遊戲板的UI渲染和用戶互動
 * 包含格子點擊事件處理、建議高亮顯示和連線高亮顯示功能
 */
class GameBoard {
    constructor(containerId, size = 5) {
        this.containerId = containerId;
        this.size = size;
        this.container = document.getElementById(containerId);
        this.cells = [];
        this.currentSuggestion = null;
        this.highlightedLines = [];
        this.clickHandler = null;
        
        // 常數定義
        this.CELL_STATES = {
            EMPTY: 0,
            PLAYER: 1,
            COMPUTER: 2
        };
        
        this.LINE_TYPES = {
            HORIZONTAL: 'horizontal',
            VERTICAL: 'vertical',
            DIAGONAL_MAIN: 'diagonal-main',
            DIAGONAL_ANTI: 'diagonal-anti'
        };
        
        this.initialize();
    }

    /**
     * 初始化遊戲板
     */
    initialize() {
        if (!this.container) {
            throw new Error(`Container with id '${this.containerId}' not found`);
        }
        
        this.createBoard();
        this.setupEventListeners();
    }

    /**
     * 創建遊戲板HTML結構
     */
    createBoard() {
        // 清空容器
        this.container.innerHTML = '';
        this.cells = [];
        
        // 創建5x5網格
        for (let row = 0; row < this.size; row++) {
            const rowCells = [];
            for (let col = 0; col < this.size; col++) {
                const cell = this.createCell(row, col);
                this.container.appendChild(cell);
                rowCells.push(cell);
            }
            this.cells.push(rowCells);
        }
    }

    /**
     * 創建單個格子元素
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @returns {HTMLElement} 格子元素
     */
    createCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'game-cell empty';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', `格子 ${row + 1}, ${col + 1}`);
        
        return cell;
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 使用事件委託處理點擊事件
        this.container.addEventListener('click', (event) => {
            this.handleCellClick(event);
        });
        
        // 鍵盤支援
        this.container.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.handleCellClick(event);
            }
        });
    }

    /**
     * 處理格子點擊事件
     * @param {Event} event - 點擊事件
     */
    handleCellClick(event) {
        const cell = event.target.closest('.game-cell');
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // 檢查格子是否可點擊（空白且不是電腦回合）
        if (!cell.classList.contains('empty')) {
            return;
        }
        
        // 調用外部點擊處理器
        if (this.clickHandler) {
            this.clickHandler(row, col, cell);
        }
    }

    /**
     * 設置格子點擊處理器
     * @param {Function} handler - 點擊處理函數
     */
    setClickHandler(handler) {
        this.clickHandler = handler;
    }

    /**
     * 更新單個格子的狀態
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @param {number} state - 格子狀態
     */
    updateCell(row, col, state) {
        if (!this.isValidPosition(row, col)) {
            console.warn(`Invalid position: (${row}, ${col})`);
            return;
        }
        
        const cell = this.cells[row][col];
        
        // 移除所有狀態類別
        cell.classList.remove('empty', 'player', 'computer');
        
        // 添加新狀態類別
        switch (state) {
            case this.CELL_STATES.EMPTY:
                cell.classList.add('empty');
                cell.setAttribute('aria-label', `空白格子 ${row + 1}, ${col + 1}`);
                break;
            case this.CELL_STATES.PLAYER:
                cell.classList.add('player');
                cell.setAttribute('aria-label', `玩家格子 ${row + 1}, ${col + 1}`);
                break;
            case this.CELL_STATES.COMPUTER:
                cell.classList.add('computer');
                cell.setAttribute('aria-label', `電腦格子 ${row + 1}, ${col + 1}`);
                break;
            default:
                console.warn(`Unknown cell state: ${state}`);
                cell.classList.add('empty');
        }
    }

    /**
     * 更新整個遊戲板
     * @param {number[][]} board - 遊戲板狀態陣列
     */
    updateBoard(board) {
        if (!this.isValidBoard(board)) {
            console.error('Invalid board provided to updateBoard');
            return;
        }
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.updateCell(row, col, board[row][col]);
            }
        }
    }

    /**
     * 高亮顯示建議的移動
     * @param {number} row - 建議的行位置
     * @param {number} col - 建議的列位置
     */
    highlightSuggestion(row, col) {
        // 清除之前的建議高亮
        this.clearSuggestionHighlight();
        
        if (!this.isValidPosition(row, col)) {
            console.warn(`Invalid suggestion position: (${row}, ${col})`);
            return;
        }
        
        const cell = this.cells[row][col];
        
        // 只有空白格子才能被建議
        if (!cell.classList.contains('empty')) {
            console.warn(`Cannot suggest occupied cell: (${row}, ${col})`);
            return;
        }
        
        cell.classList.add('suggested');
        this.currentSuggestion = { row, col };
        
        // 更新無障礙標籤
        const originalLabel = cell.getAttribute('aria-label');
        cell.setAttribute('aria-label', `建議移動: ${originalLabel}`);
    }

    /**
     * 清除建議高亮
     */
    clearSuggestionHighlight() {
        if (this.currentSuggestion) {
            const { row, col } = this.currentSuggestion;
            const cell = this.cells[row][col];
            cell.classList.remove('suggested');
            
            // 恢復原始標籤
            cell.setAttribute('aria-label', `空白格子 ${row + 1}, ${col + 1}`);
            
            this.currentSuggestion = null;
        }
    }

    /**
     * 高亮顯示完成的連線
     * @param {Array} lines - 完成的連線陣列
     */
    highlightLines(lines) {
        // 清除之前的連線高亮
        this.clearLineHighlights();
        
        if (!Array.isArray(lines)) {
            console.warn('Lines parameter must be an array');
            return;
        }
        
        lines.forEach(line => {
            this.highlightSingleLine(line);
        });
        
        this.highlightedLines = [...lines];
    }

    /**
     * 高亮顯示單條連線
     * @param {Object} line - 連線對象
     */
    highlightSingleLine(line) {
        if (!line || !line.cells || !Array.isArray(line.cells)) {
            console.warn('Invalid line object provided');
            return;
        }
        
        const lineClass = this.getLineClass(line.type);
        
        line.cells.forEach(([row, col]) => {
            if (this.isValidPosition(row, col)) {
                const cell = this.cells[row][col];
                cell.classList.add('line-completed', lineClass);
                
                // 更新無障礙標籤
                const currentLabel = cell.getAttribute('aria-label');
                if (!currentLabel.includes('完成連線')) {
                    cell.setAttribute('aria-label', `${currentLabel} - 完成連線`);
                }
            }
        });
    }

    /**
     * 獲取連線類型對應的CSS類別
     * @param {string} lineType - 連線類型
     * @returns {string} CSS類別名稱
     */
    getLineClass(lineType) {
        switch (lineType) {
            case this.LINE_TYPES.HORIZONTAL:
                return 'horizontal-line';
            case this.LINE_TYPES.VERTICAL:
                return 'vertical-line';
            case this.LINE_TYPES.DIAGONAL_MAIN:
                return 'diagonal-line';
            case this.LINE_TYPES.DIAGONAL_ANTI:
                return 'anti-diagonal-line';
            default:
                return 'horizontal-line'; // 預設為水平線
        }
    }

    /**
     * 清除所有連線高亮
     */
    clearLineHighlights() {
        this.highlightedLines.forEach(line => {
            if (line.cells) {
                line.cells.forEach(([row, col]) => {
                    if (this.isValidPosition(row, col)) {
                        const cell = this.cells[row][col];
                        cell.classList.remove(
                            'line-completed',
                            'horizontal-line',
                            'vertical-line',
                            'diagonal-line',
                            'anti-diagonal-line'
                        );
                        
                        // 恢復原始標籤
                        const currentLabel = cell.getAttribute('aria-label');
                        const cleanLabel = currentLabel.replace(' - 完成連線', '');
                        cell.setAttribute('aria-label', cleanLabel);
                    }
                });
            }
        });
        
        this.highlightedLines = [];
    }

    /**
     * 清除所有高亮效果
     */
    clearAllHighlights() {
        this.clearSuggestionHighlight();
        this.clearLineHighlights();
    }

    /**
     * 重置遊戲板到初始狀態
     */
    reset() {
        this.clearAllHighlights();
        
        // 重置所有格子為空白狀態
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.updateCell(row, col, this.CELL_STATES.EMPTY);
            }
        }
    }

    /**
     * 獲取格子元素
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @returns {HTMLElement|null} 格子元素
     */
    getCell(row, col) {
        if (!this.isValidPosition(row, col)) {
            return null;
        }
        return this.cells[row][col];
    }

    /**
     * 檢查位置是否有效
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @returns {boolean} 是否為有效位置
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.size && 
               col >= 0 && col < this.size;
    }

    /**
     * 驗證遊戲板格式
     * @param {number[][]} board - 遊戲板陣列
     * @returns {boolean} 是否為有效的遊戲板
     */
    isValidBoard(board) {
        if (!Array.isArray(board) || board.length !== this.size) {
            return false;
        }
        
        for (let row of board) {
            if (!Array.isArray(row) || row.length !== this.size) {
                return false;
            }
            
            for (let cell of row) {
                if (![this.CELL_STATES.EMPTY, this.CELL_STATES.PLAYER, this.CELL_STATES.COMPUTER].includes(cell)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 添加動畫效果到格子
     * @param {number} row - 行位置
     * @param {number} col - 列位置
     * @param {string} animationClass - 動畫CSS類別
     * @param {number} duration - 動畫持續時間（毫秒）
     */
    animateCell(row, col, animationClass, duration = 1000) {
        if (!this.isValidPosition(row, col)) {
            return;
        }
        
        const cell = this.cells[row][col];
        cell.classList.add(animationClass);
        
        setTimeout(() => {
            cell.classList.remove(animationClass);
        }, duration);
    }

    /**
     * 獲取當前建議位置
     * @returns {Object|null} 當前建議位置或null
     */
    getCurrentSuggestion() {
        return this.currentSuggestion;
    }

    /**
     * 獲取當前高亮的連線
     * @returns {Array} 當前高亮的連線陣列
     */
    getHighlightedLines() {
        return [...this.highlightedLines];
    }

    /**
     * 設置遊戲板為禁用狀態
     * @param {boolean} disabled - 是否禁用
     */
    setDisabled(disabled) {
        this.container.classList.toggle('disabled', disabled);
        
        // 更新所有格子的tabindex
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.cells[row][col];
                cell.setAttribute('tabindex', disabled ? '-1' : '0');
            }
        }
    }

    /**
     * 銷毀遊戲板實例
     */
    destroy() {
        this.clearAllHighlights();
        this.clickHandler = null;
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.cells = [];
    }
}

// 如果在Node.js環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameBoard;
}