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
        SafeDOM.clearContent(this.container);
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
     * 高亮顯示建議的移動（增強版）
     * @param {number} row - 建議的行位置
     * @param {number} col - 建議的列位置
     * @param {Object} options - 建議選項
     * @param {string} options.confidence - 信心度等級
     * @param {number} options.value - 預期價值
     * @param {Array} options.alternatives - 替代建議
     */
    highlightSuggestion(row, col, options = {}) {
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
        
        // 添加基本建議類別
        cell.classList.add('suggested');
        
        // 添加信心度類別
        const confidence = options.confidence || 'medium';
        cell.classList.add(`confidence-${confidence}`);
        
        // 設置價值數據屬性
        if (options.value !== undefined) {
            cell.setAttribute('data-value', Math.round(options.value));
        }
        
        // 添加出現動畫，使用更長的動畫時間提供更流暢的體驗
        cell.classList.add('suggestion-appear');
        setTimeout(() => {
            cell.classList.remove('suggestion-appear');
        }, 700);
        
        this.currentSuggestion = { 
            row, 
            col, 
            confidence: confidence,
            value: options.value,
            alternatives: options.alternatives || []
        };
        
        // 顯示替代建議，限制最多顯示3個替代選項
        if (options.alternatives && options.alternatives.length > 0) {
            this.highlightAlternatives(options.alternatives.slice(0, 3));
        }
        
        // 更新無障礙標籤，添加更詳細的信息
        const originalLabel = cell.getAttribute('aria-label');
        const confidenceLabels = {
            'very-high': '非常高的信心度',
            'high': '高信心度',
            'medium': '中等信心度',
            'low': '低信心度'
        };
        const confidenceText = ` (${confidenceLabels[confidence] || '中等信心度'})`;
        const valueText = options.value !== undefined ? ` 價值: ${Math.round(options.value)}` : '';
        cell.setAttribute('aria-label', `建議移動: ${originalLabel}${confidenceText}${valueText}`);
        
        // 添加焦點效果，使建議更加醒目
        this.pulseHighlightEffect(cell);
    }

    /**
     * 高亮顯示替代建議
     * @param {Array} alternatives - 替代建議陣列
     */
    highlightAlternatives(alternatives) {
        // 清除之前的替代建議
        this.clearAlternativeHighlights();
        
        alternatives.slice(0, 3).forEach((alt, index) => {
            if (this.isValidPosition(alt.row, alt.col)) {
                const cell = this.cells[alt.row][alt.col];
                if (cell.classList.contains('empty')) {
                    cell.classList.add('alternative-suggestion');
                    cell.setAttribute('data-alt-value', Math.round(alt.value));
                    cell.setAttribute('data-alt-rank', index + 2); // 排名從2開始（主建議是1）
                    
                    // 更新無障礙標籤
                    const originalLabel = cell.getAttribute('aria-label');
                    cell.setAttribute('aria-label', `替代建議 #${index + 2}: ${originalLabel} (價值: ${Math.round(alt.value)})`);
                    
                    // 添加延遲動畫效果，每個替代建議有不同的延遲
                    setTimeout(() => {
                        cell.classList.add('suggestion-appear');
                        
                        // 添加脈衝效果，但比主建議更微妙
                        const pulseIntensity = 0.7 - (index * 0.15); // 隨著排名降低，強度降低
                        this.pulseAlternativeEffect(cell, index + 2, pulseIntensity);
                        
                        setTimeout(() => {
                            cell.classList.remove('suggestion-appear');
                        }, 500);
                    }, (index + 1) * 150); // 增加延遲時間，使動畫更加明顯
                }
            }
        });
    }

    /**
     * 清除替代建議高亮
     */
    clearAlternativeHighlights() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = this.cells[row][col];
                
                if (cell.classList.contains('alternative-suggestion')) {
                    // 移除類別
                    cell.classList.remove('alternative-suggestion', 'suggestion-appear');
                    
                    // 移除數據屬性
                    cell.removeAttribute('data-alt-value');
                    cell.removeAttribute('data-alt-rank');
                    
                    // 移除任何可能存在的脈衝效果元素
                    const pulseEffect = cell.querySelector('.alternative-pulse-effect');
                    if (pulseEffect) {
                        cell.removeChild(pulseEffect);
                    }
                    
                    // 恢復原始標籤
                    cell.setAttribute('aria-label', `空白格子 ${row + 1}, ${col + 1}`);
                    
                    // 重置樣式屬性
                    cell.style.transform = '';
                    cell.style.boxShadow = '';
                }
            }
        }
    }

    /**
     * 清除建議高亮（增強版）
     */
    clearSuggestionHighlight() {
        if (this.currentSuggestion) {
            const { row, col } = this.currentSuggestion;
            const cell = this.cells[row][col];
            
            // 移除所有建議相關的類別
            cell.classList.remove(
                'suggested', 
                'confidence-very-high', 
                'confidence-high', 
                'confidence-medium', 
                'confidence-low',
                'suggestion-appear'
            );
            
            // 移除數據屬性
            cell.removeAttribute('data-value');
            
            // 移除任何可能存在的脈衝效果元素
            const pulseEffect = cell.querySelector('.suggestion-pulse-effect');
            if (pulseEffect) {
                cell.removeChild(pulseEffect);
            }
            
            // 恢復原始標籤
            cell.setAttribute('aria-label', `空白格子 ${row + 1}, ${col + 1}`);
            
            // 重置樣式屬性
            cell.style.transform = '';
            cell.style.boxShadow = '';
            
            this.currentSuggestion = null;
        }
        
        // 清除替代建議
        this.clearAlternativeHighlights();
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
     * 為建議格子添加脈衝高亮效果
     * @param {HTMLElement} cell - 格子元素
     */
    pulseHighlightEffect(cell) {
        // 創建一個臨時的高亮效果元素
        const highlight = document.createElement('div');
        highlight.className = 'suggestion-pulse-effect';
        highlight.style.position = 'absolute';
        highlight.style.top = '0';
        highlight.style.left = '0';
        highlight.style.right = '0';
        highlight.style.bottom = '0';
        highlight.style.borderRadius = '8px';
        highlight.style.pointerEvents = 'none';
        
        // 根據信心度設置不同的顏色
        if (cell.classList.contains('confidence-very-high')) {
            highlight.style.boxShadow = '0 0 20px 10px rgba(76, 175, 80, 0.6)';
        } else if (cell.classList.contains('confidence-high')) {
            highlight.style.boxShadow = '0 0 20px 10px rgba(33, 150, 243, 0.6)';
        } else if (cell.classList.contains('confidence-medium')) {
            highlight.style.boxShadow = '0 0 20px 10px rgba(255, 152, 0, 0.6)';
        } else if (cell.classList.contains('confidence-low')) {
            highlight.style.boxShadow = '0 0 20px 10px rgba(244, 67, 54, 0.6)';
        } else {
            highlight.style.boxShadow = '0 0 20px 10px rgba(255, 193, 7, 0.6)';
        }
        
        // 添加到格子中
        cell.style.position = 'relative';
        cell.style.overflow = 'visible';
        cell.appendChild(highlight);
        
        // 創建動畫
        highlight.animate(
            [
                { opacity: 0.8, transform: 'scale(0.95)' },
                { opacity: 0, transform: 'scale(1.5)' }
            ],
            {
                duration: 1500,
                iterations: 2,
                easing: 'ease-out'
            }
        ).onfinish = () => {
            // 動畫結束後移除元素
            if (highlight.parentNode === cell) {
                cell.removeChild(highlight);
            }
        };
    }
    
    /**
     * 為替代建議格子添加脈衝效果
     * @param {HTMLElement} cell - 格子元素
     * @param {number} rank - 建議排名
     * @param {number} intensity - 效果強度 (0-1)
     */
    pulseAlternativeEffect(cell, rank, intensity = 0.5) {
        // 創建一個臨時的高亮效果元素
        const highlight = document.createElement('div');
        highlight.className = 'alternative-pulse-effect';
        highlight.style.position = 'absolute';
        highlight.style.top = '0';
        highlight.style.left = '0';
        highlight.style.right = '0';
        highlight.style.bottom = '0';
        highlight.style.borderRadius = '8px';
        highlight.style.pointerEvents = 'none';
        
        // 根據排名設置不同的顏色
        let color;
        switch (rank) {
            case 2:
                color = 'rgba(33, 150, 243, ' + intensity + ')'; // 藍色
                break;
            case 3:
                color = 'rgba(255, 152, 0, ' + intensity + ')'; // 橙色
                break;
            case 4:
                color = 'rgba(244, 67, 54, ' + intensity + ')'; // 紅色
                break;
            default:
                color = 'rgba(158, 158, 158, ' + intensity + ')'; // 灰色
        }
        
        highlight.style.boxShadow = `0 0 15px 5px ${color}`;
        
        // 添加到格子中
        cell.style.position = 'relative';
        cell.style.overflow = 'visible';
        cell.appendChild(highlight);
        
        // 創建動畫，替代建議的動畫比主建議更短更微妙
        highlight.animate(
            [
                { opacity: 0.6, transform: 'scale(0.97)' },
                { opacity: 0, transform: 'scale(1.3)' }
            ],
            {
                duration: 1200,
                iterations: 1,
                easing: 'ease-out'
            }
        ).onfinish = () => {
            // 動畫結束後移除元素
            if (highlight.parentNode === cell) {
                cell.removeChild(highlight);
            }
        };
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