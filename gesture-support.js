/**
 * Gesture Support Module
 * 實作手勢支持（滑動、縮放等）
 */

class GestureSupport {
    constructor() {
        this.isEnabled = false;
        this.gestureStartDistance = 0;
        this.gestureStartScale = 1;
        this.currentScale = 1;
        this.minScale = 0.8;
        this.maxScale = 2.0;
        this.swipeThreshold = 50;
        this.swipeTimeout = 300;
        
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.touchEndPos = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.detectGestureSupport();
        this.setupSwipeGestures();
        this.setupPinchZoom();
        this.setupRotationGestures();
        this.setupLongPress();
    }
    
    /**
     * 檢測手勢支持
     */
    detectGestureSupport() {
        this.isEnabled = 'ontouchstart' in window && 
                        window.TouchEvent && 
                        typeof window.TouchEvent === 'function';
        
        if (this.isEnabled) {
            document.body.classList.add('gesture-enabled');
            console.log('Gesture support enabled');
        }
    }
    
    /**
     * 設置滑動手勢
     */
    setupSwipeGestures() {
        if (!this.isEnabled) return;
        
        const gameContainer = document.querySelector('.container');
        if (!gameContainer) return;
        
        gameContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.touchStartTime = Date.now();
                this.touchStartPos = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }
        });
        
        gameContainer.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                this.touchEndPos = {
                    x: e.changedTouches[0].clientX,
                    y: e.changedTouches[0].clientY
                };
                
                this.handleSwipe();
            }
        });
    }
    
    /**
     * 處理滑動手勢
     */
    handleSwipe() {
        const touchDuration = Date.now() - this.touchStartTime;
        if (touchDuration > this.swipeTimeout) return;
        
        const deltaX = this.touchEndPos.x - this.touchStartPos.x;
        const deltaY = this.touchEndPos.y - this.touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < this.swipeThreshold) return;
        
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // 判斷滑動方向
        if (Math.abs(angle) < 45) {
            // 向右滑動
            this.onSwipeRight();
        } else if (Math.abs(angle) > 135) {
            // 向左滑動
            this.onSwipeLeft();
        } else if (angle > 45 && angle < 135) {
            // 向下滑動
            this.onSwipeDown();
        } else if (angle < -45 && angle > -135) {
            // 向上滑動
            this.onSwipeUp();
        }
    }
    
    /**
     * 向右滑動處理
     */
    onSwipeRight() {
        console.log('Swipe right detected');
        
        // 切換到下一個算法
        this.switchToNextAlgorithm();
        
        // 顯示滑動反饋
        this.showSwipeFeedback('right', '切換算法');
    }
    
    /**
     * 向左滑動處理
     */
    onSwipeLeft() {
        console.log('Swipe left detected');
        
        // 切換到上一個算法
        this.switchToPreviousAlgorithm();
        
        // 顯示滑動反饋
        this.showSwipeFeedback('left', '切換算法');
    }
    
    /**
     * 向上滑動處理
     */
    onSwipeUp() {
        console.log('Swipe up detected');
        
        // 顯示遊戲統計或幫助信息
        this.showGameStats();
        
        // 顯示滑動反饋
        this.showSwipeFeedback('up', '顯示統計');
    }
    
    /**
     * 向下滑動處理
     */
    onSwipeDown() {
        console.log('Swipe down detected');
        
        // 隱藏額外信息或重置視圖
        this.hideExtraInfo();
        
        // 顯示滑動反饋
        this.showSwipeFeedback('down', '隱藏信息');
    }
    
    /**
     * 切換到下一個算法
     */
    switchToNextAlgorithm() {
        const algorithms = ['standard', 'enhanced', 'ai-learning'];
        const currentSelected = document.querySelector('.algorithm-option.selected');
        
        if (!currentSelected) return;
        
        const currentAlgorithm = currentSelected.dataset.algorithm;
        const currentIndex = algorithms.indexOf(currentAlgorithm);
        const nextIndex = (currentIndex + 1) % algorithms.length;
        const nextAlgorithm = algorithms[nextIndex];
        
        const nextOption = document.querySelector(`[data-algorithm="${nextAlgorithm}"]`);
        if (nextOption && typeof selectAlgorithm === 'function') {
            nextOption.click();
        }
    }
    
    /**
     * 切換到上一個算法
     */
    switchToPreviousAlgorithm() {
        const algorithms = ['standard', 'enhanced', 'ai-learning'];
        const currentSelected = document.querySelector('.algorithm-option.selected');
        
        if (!currentSelected) return;
        
        const currentAlgorithm = currentSelected.dataset.algorithm;
        const currentIndex = algorithms.indexOf(currentAlgorithm);
        const prevIndex = (currentIndex - 1 + algorithms.length) % algorithms.length;
        const prevAlgorithm = algorithms[prevIndex];
        
        const prevOption = document.querySelector(`[data-algorithm="${prevAlgorithm}"]`);
        if (prevOption && typeof selectAlgorithm === 'function') {
            prevOption.click();
        }
    }
    
    /**
     * 顯示遊戲統計
     */
    showGameStats() {
        // 創建或顯示統計面板
        let statsPanel = document.getElementById('mobile-stats-panel');
        
        if (!statsPanel) {
            statsPanel = this.createStatsPanel();
            document.body.appendChild(statsPanel);
        }
        
        statsPanel.classList.add('show');
        
        // 3秒後自動隱藏
        setTimeout(() => {
            statsPanel.classList.remove('show');
        }, 3000);
    }
    
    /**
     * 創建統計面板
     */
    createStatsPanel() {
        const panel = document.createElement('div');
        panel.id = 'mobile-stats-panel';
        panel.className = 'mobile-stats-panel';
        
        panel.innerHTML = `
            <div class="stats-content">
                <h3>遊戲統計</h3>
                <div class="stat-item">
                    <span class="label">當前輪數:</span>
                    <span class="value" id="mobile-current-round">1</span>
                </div>
                <div class="stat-item">
                    <span class="label">完成連線:</span>
                    <span class="value" id="mobile-completed-lines">0</span>
                </div>
                <div class="stat-item">
                    <span class="label">當前算法:</span>
                    <span class="value" id="mobile-current-algorithm">標準演算法</span>
                </div>
            </div>
        `;
        
        return panel;
    }
    
    /**
     * 隱藏額外信息
     */
    hideExtraInfo() {
        const statsPanel = document.getElementById('mobile-stats-panel');
        if (statsPanel) {
            statsPanel.classList.remove('show');
        }
        
        // 隱藏其他可能的彈出面板
        const modals = document.querySelectorAll('.modal, .popup');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    /**
     * 顯示滑動反饋
     */
    showSwipeFeedback(direction, action) {
        const feedback = document.createElement('div');
        feedback.className = `swipe-feedback swipe-${direction}`;
        feedback.textContent = action;
        
        document.body.appendChild(feedback);
        
        // 觸發動畫
        requestAnimationFrame(() => {
            feedback.classList.add('show');
        });
        
        // 移除元素
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 1500);
    }
    
    /**
     * 設置縮放手勢
     */
    setupPinchZoom() {
        if (!this.isEnabled) return;
        
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;
        
        gameBoard.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.gestureStartDistance = this.getDistance(e.touches[0], e.touches[1]);
                this.gestureStartScale = this.currentScale;
            }
        });
        
        gameBoard.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scaleChange = currentDistance / this.gestureStartDistance;
                const newScale = this.gestureStartScale * scaleChange;
                
                this.currentScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
                this.applyScale(gameBoard, this.currentScale);
            }
        });
        
        gameBoard.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                // 縮放手勢結束，可以添加彈性動畫
                this.finalizeScale(gameBoard);
            }
        });
    }
    
    /**
     * 計算兩點間距離
     */
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 應用縮放
     */
    applyScale(element, scale) {
        element.style.transform = `scale(${scale})`;
        element.style.transformOrigin = 'center center';
    }
    
    /**
     * 完成縮放
     */
    finalizeScale(element) {
        // 如果縮放太小或太大，回彈到合理範圍
        if (this.currentScale < 0.9) {
            this.currentScale = 1;
            element.style.transition = 'transform 0.3s ease-out';
            this.applyScale(element, this.currentScale);
            
            setTimeout(() => {
                element.style.transition = '';
            }, 300);
        }
    }
    
    /**
     * 設置旋轉手勢
     */
    setupRotationGestures() {
        // 在這個遊戲中，旋轉手勢可能不太適用
        // 但可以用於切換視圖或模式
        console.log('Rotation gestures setup (placeholder)');
    }
    
    /**
     * 設置長按手勢
     */
    setupLongPress() {
        if (!this.isEnabled) return;
        
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;
        
        let longPressTimer = null;
        let longPressTarget = null;
        
        gameBoard.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const cell = this.getCellFromTouch(e.touches[0]);
                if (cell) {
                    longPressTarget = cell;
                    longPressTimer = setTimeout(() => {
                        this.handleLongPress(cell);
                    }, 500); // 500ms 長按
                }
            }
        });
        
        gameBoard.addEventListener('touchmove', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
                longPressTarget = null;
            }
        });
        
        gameBoard.addEventListener('touchend', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
                longPressTarget = null;
            }
        });
    }
    
    /**
     * 處理長按
     */
    handleLongPress(cell) {
        console.log('Long press detected on cell:', cell);
        
        // 顯示格子信息或上下文菜單
        this.showCellInfo(cell);
        
        // 添加觸覺反饋（如果支持）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    /**
     * 顯示格子信息
     */
    showCellInfo(cell) {
        const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
        const row = Math.floor(cellIndex / 5);
        const col = cellIndex % 5;
        
        // 創建信息提示
        const tooltip = document.createElement('div');
        tooltip.className = 'cell-info-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <p>位置: 第${row + 1}行第${col + 1}列</p>
                <p>狀態: ${this.getCellStateText(cell)}</p>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // 定位提示框
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        
        // 顯示動畫
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
        
        // 3秒後移除
        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    document.body.removeChild(tooltip);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * 獲取格子狀態文本
     */
    getCellStateText(cell) {
        if (cell.classList.contains('player')) {
            return '玩家已選擇';
        } else if (cell.classList.contains('computer')) {
            return '電腦已選擇';
        } else {
            return '空格子';
        }
    }
    
    /**
     * 從觸控點獲取格子元素
     */
    getCellFromTouch(touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        return element && element.classList.contains('game-cell') ? element : null;
    }
    
    /**
     * 更新統計面板
     */
    updateStatsPanel() {
        const currentRoundElement = document.getElementById('mobile-current-round');
        const completedLinesElement = document.getElementById('mobile-completed-lines');
        const currentAlgorithmElement = document.getElementById('mobile-current-algorithm');
        
        if (currentRoundElement && typeof gameState !== 'undefined' && gameState) {
            currentRoundElement.textContent = gameState.currentRound;
        }
        
        if (completedLinesElement && typeof gameState !== 'undefined' && gameState) {
            completedLinesElement.textContent = gameState.completedLines.length;
        }
        
        if (currentAlgorithmElement) {
            const selectedAlgorithm = document.querySelector('.algorithm-option.selected');
            if (selectedAlgorithm) {
                const algorithmNames = {
                    'standard': '標準演算法',
                    'enhanced': '增強演算法',
                    'ai-learning': 'AI 學習演算法'
                };
                currentAlgorithmElement.textContent = algorithmNames[selectedAlgorithm.dataset.algorithm] || '未知';
            }
        }
    }
}

// 初始化手勢支持
let gestureSupport = null;

document.addEventListener('DOMContentLoaded', () => {
    gestureSupport = new GestureSupport();
});