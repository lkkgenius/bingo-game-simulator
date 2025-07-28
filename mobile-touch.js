/**
 * Mobile Touch Optimization Module
 * 優化移動設備的觸控操作體驗
 */

class MobileTouchOptimizer {
    constructor() {
        this.touchStartTime = 0;
        this.touchStartPosition = { x: 0, y: 0 };
        this.isTouch = false;
        this.touchThreshold = 10; // 觸控移動閾值
        this.tapTimeout = 300; // 點擊超時時間
        
        this.init();
    }
    
    init() {
        this.detectTouchDevice();
        this.optimizeTouchTargets();
        this.setupTouchEventHandlers();
        this.preventZoomOnDoubleTap();
        this.optimizeScrolling();
    }
    
    /**
     * 檢測觸控設備
     */
    detectTouchDevice() {
        this.isTouch = 'ontouchstart' in window || 
                      navigator.maxTouchPoints > 0 || 
                      navigator.msMaxTouchPoints > 0;
        
        if (this.isTouch) {
            document.body.classList.add('touch-device');
            console.log('Touch device detected');
        }
    }
    
    /**
     * 優化觸控目標大小
     */
    optimizeTouchTargets() {
        // 確保所有可點擊元素至少 44x44px (WCAG 標準)
        const touchTargets = document.querySelectorAll('button, .game-cell, .algorithm-option, input[type="checkbox"], .control-button');
        
        touchTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                target.style.minWidth = '44px';
                target.style.minHeight = '44px';
                target.style.padding = target.style.padding || '12px';
                
                // 增加觸控區域
                target.style.position = 'relative';
                if (!target.querySelector('.touch-area')) {
                    const touchArea = document.createElement('div');
                    touchArea.className = 'touch-area';
                    touchArea.style.cssText = `
                        position: absolute;
                        top: -8px;
                        left: -8px;
                        right: -8px;
                        bottom: -8px;
                        z-index: 1;
                        pointer-events: none;
                    `;
                    target.appendChild(touchArea);
                }
            }
            
            // 添加觸控狀態樣式
            target.classList.add('touch-optimized');
        });
        
        // 優化輸入框觸控體驗
        this.optimizeInputFields();
    }
    
    /**
     * 優化輸入框觸控體驗
     */
    optimizeInputFields() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // 防止縮放
            input.addEventListener('focus', () => {
                if (this.isTouch) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 
                            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                    }
                }
            });
            
            input.addEventListener('blur', () => {
                if (this.isTouch) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 
                            'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
                    }
                }
            });
            
            // 改善數字輸入體驗
            if (input.type === 'number') {
                input.setAttribute('inputmode', 'numeric');
                input.setAttribute('pattern', '[0-9]*');
            }
        });
    }
    
    /**
     * 設置觸控事件處理器
     */
    setupTouchEventHandlers() {
        // 為遊戲板添加觸控支持
        const gameBoard = document.getElementById('game-board');
        if (gameBoard) {
            this.setupGameBoardTouch(gameBoard);
        }
        
        // 為按鈕添加觸控反饋
        this.setupButtonTouchFeedback();
        
        // 為算法選擇器添加觸控支持
        this.setupAlgorithmSelectorTouch();
    }
    
    /**
     * 設置遊戲板觸控支持
     */
    setupGameBoardTouch(gameBoard) {
        let touchStartCell = null;
        
        gameBoard.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStartTime = Date.now();
            
            const touch = e.touches[0];
            this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
            
            const cell = this.getCellFromTouch(touch);
            if (cell) {
                touchStartCell = cell;
                cell.classList.add('touch-active');
            }
        }, { passive: false });
        
        gameBoard.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            const touch = e.touches[0];
            const distance = Math.sqrt(
                Math.pow(touch.clientX - this.touchStartPosition.x, 2) +
                Math.pow(touch.clientY - this.touchStartPosition.y, 2)
            );
            
            // 如果移動距離超過閾值，取消觸控
            if (distance > this.touchThreshold && touchStartCell) {
                touchStartCell.classList.remove('touch-active');
                touchStartCell = null;
            }
        }, { passive: false });
        
        gameBoard.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            const touchDuration = Date.now() - this.touchStartTime;
            
            if (touchStartCell && touchDuration < this.tapTimeout) {
                // 觸發點擊事件
                const cellIndex = Array.from(gameBoard.children).indexOf(touchStartCell);
                const row = Math.floor(cellIndex / 5);
                const col = cellIndex % 5;
                
                // 添加觸控反饋動畫
                this.addTouchFeedback(touchStartCell);
                
                // 延遲執行點擊處理，讓動畫先播放
                setTimeout(() => {
                    if (typeof handleCellClick === 'function') {
                        handleCellClick(row, col, touchStartCell);
                    }
                }, 100);
            }
            
            // 清理觸控狀態
            if (touchStartCell) {
                touchStartCell.classList.remove('touch-active');
                touchStartCell = null;
            }
        }, { passive: false });
        
        // 處理觸控取消
        gameBoard.addEventListener('touchcancel', (e) => {
            if (touchStartCell) {
                touchStartCell.classList.remove('touch-active');
                touchStartCell = null;
            }
        });
    }
    
    /**
     * 從觸控點獲取格子元素
     */
    getCellFromTouch(touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        return element && element.classList.contains('game-cell') ? element : null;
    }
    
    /**
     * 添加觸控反饋動畫
     */
    addTouchFeedback(element) {
        element.classList.add('touch-feedback');
        setTimeout(() => {
            element.classList.remove('touch-feedback');
        }, 300);
    }
    
    /**
     * 設置按鈕觸控反饋
     */
    setupButtonTouchFeedback() {
        const buttons = document.querySelectorAll('button');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                button.classList.add('touch-active');
            });
            
            button.addEventListener('touchend', (e) => {
                button.classList.remove('touch-active');
                this.addTouchFeedback(button);
            });
            
            button.addEventListener('touchcancel', (e) => {
                button.classList.remove('touch-active');
            });
        });
    }
    
    /**
     * 設置算法選擇器觸控支持
     */
    setupAlgorithmSelectorTouch() {
        const algorithmOptions = document.querySelectorAll('.algorithm-option');
        
        algorithmOptions.forEach(option => {
            option.addEventListener('touchstart', (e) => {
                option.classList.add('touch-active');
            });
            
            option.addEventListener('touchend', (e) => {
                option.classList.remove('touch-active');
                this.addTouchFeedback(option);
            });
            
            option.addEventListener('touchcancel', (e) => {
                option.classList.remove('touch-active');
            });
        });
    }
    
    /**
     * 防止雙擊縮放
     */
    preventZoomOnDoubleTap() {
        let lastTouchEnd = 0;
        
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    
    /**
     * 優化滾動體驗
     */
    optimizeScrolling() {
        // 為可滾動區域添加慣性滾動
        const scrollableElements = document.querySelectorAll('.scrollable, .control-panel, .instructions');
        
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowScrolling = 'touch';
        });
        
        // 防止過度滾動
        document.body.addEventListener('touchmove', (e) => {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// 初始化移動觸控優化器
let mobileTouchOptimizer = null;

document.addEventListener('DOMContentLoaded', () => {
    mobileTouchOptimizer = new MobileTouchOptimizer();
});