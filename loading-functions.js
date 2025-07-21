/**
 * 增強的載入狀態和錯誤處理函數
 * 提供更好的用戶體驗和性能優化
 */

/**
 * 顯示全局載入狀態
 */
function showGlobalLoading(message = '正在載入遊戲組件...') {
    console.log('顯示全局載入狀態:', message);
    
    const loadingOverlay = document.getElementById('global-loading');
    const loadingText = loadingOverlay?.querySelector('.loading-text');
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
}

/**
 * 隱藏全局載入狀態
 */
function hideGlobalLoading() {
    console.log('隱藏全局載入狀態');
    
    const loadingOverlay = document.getElementById('global-loading');
    if (loadingOverlay) {
        // 添加淡出動畫
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.opacity = '1';
        }, 300);
    }
}

/**
 * 顯示載入狀態（向後兼容）
 */
function showLoadingState() {
    showGlobalLoading();
    
    // 禁用主要按鈕
    const startButton = document.getElementById('start-game');
    if (startButton) {
        startButton.disabled = true;
        startButton.classList.add('button-loading');
    }
}

/**
 * 隱藏載入狀態（向後兼容）
 */
function hideLoadingState() {
    hideGlobalLoading();
    
    // 恢復按鈕狀態
    const startButton = document.getElementById('start-game');
    if (startButton) {
        startButton.disabled = false;
        startButton.classList.remove('button-loading');
    }
}

/**
 * 顯示組件載入狀態
 */
function showComponentLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('component-loading');
    }
}

/**
 * 隱藏組件載入狀態
 */
function hideComponentLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('component-loading');
        element.classList.add('component-loaded');
        
        // 移除載入完成類別
        setTimeout(() => {
            element.classList.remove('component-loaded');
        }, 400);
    }
}

/**
 * 顯示遊戲板載入狀態
 */
function showGameBoardLoading() {
    const gameBoard = document.getElementById('game-board');
    if (gameBoard) {
        gameBoard.classList.add('game-board-loading');
    }
}

/**
 * 隱藏遊戲板載入狀態
 */
function hideGameBoardLoading() {
    const gameBoard = document.getElementById('game-board');
    if (gameBoard) {
        gameBoard.classList.remove('game-board-loading');
    }
}

/**
 * 顯示按鈕載入狀態
 */
function showButtonLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = true;
        button.classList.add('button-loading');
    }
}

/**
 * 隱藏按鈕載入狀態
 */
function hideButtonLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = false;
        button.classList.remove('button-loading');
    }
}

/**
 * 創建骨架屏載入效果
 */
function createSkeletonLoader(container, config = {}) {
    const {
        lines = 3,
        height = '1rem',
        spacing = '8px'
    } = config;
    
    const skeletonContainer = document.createElement('div');
    skeletonContainer.className = 'skeleton-container';
    
    for (let i = 0; i < lines; i++) {
        const skeletonLine = document.createElement('div');
        skeletonLine.className = 'skeleton skeleton-text';
        skeletonLine.style.height = height;
        skeletonLine.style.marginBottom = spacing;
        
        // 最後一行稍微短一些
        if (i === lines - 1) {
            skeletonLine.classList.add('small');
        }
        
        skeletonContainer.appendChild(skeletonLine);
    }
    
    if (container) {
        container.appendChild(skeletonContainer);
    }
    
    return skeletonContainer;
}

/**
 * 移除骨架屏載入效果
 */
function removeSkeletonLoader(container) {
    if (container) {
        const skeletonContainer = container.querySelector('.skeleton-container');
        if (skeletonContainer) {
            skeletonContainer.remove();
        }
    }
}

/**
 * 漸進式載入管理器
 */
class ProgressiveLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.totalComponents = 0;
        this.onProgress = null;
        this.onComplete = null;
    }
    
    setTotalComponents(total) {
        this.totalComponents = total;
    }
    
    markComponentLoaded(componentName) {
        this.loadedComponents.add(componentName);
        const progress = (this.loadedComponents.size / this.totalComponents) * 100;
        
        if (this.onProgress) {
            this.onProgress(progress, componentName);
        }
        
        if (this.loadedComponents.size === this.totalComponents && this.onComplete) {
            this.onComplete();
        }
    }
    
    setProgressCallback(callback) {
        this.onProgress = callback;
    }
    
    setCompleteCallback(callback) {
        this.onComplete = callback;
    }
    
    reset() {
        this.loadedComponents.clear();
    }
}

// 創建全局漸進式載入管理器
const progressiveLoader = new ProgressiveLoader();

/**
 * 更新載入進度
 */
function updateLoadingProgress(progress, componentName) {
    const loadingText = document.querySelector('#global-loading .loading-text');
    if (loadingText) {
        loadingText.textContent = `正在載入 ${componentName}... (${Math.round(progress)}%)`;
    }
}

/**
 * 初始化漸進式載入
 */
function initializeProgressiveLoading() {
    progressiveLoader.setTotalComponents(5); // LineDetector, ProbabilityCalculator, GameBoard, GameEngine, Enhanced Algorithm
    progressiveLoader.setProgressCallback(updateLoadingProgress);
    progressiveLoader.setCompleteCallback(() => {
        setTimeout(hideGlobalLoading, 500);
    });
}

/**
 * 顯示錯誤模態框（增強版）
 * @param {string} title - 錯誤標題
 * @param {string} message - 錯誤消息
 * @param {Object} options - 選項
 */
function showErrorModal(title, message, options = {}) {
    console.log('顯示錯誤模態框:', title, message);
    
    const {
        type = 'error',
        autoClose = false,
        autoCloseDelay = 5000,
        showRetry = false,
        onRetry = null
    } = options;
    
    // 移除現有的錯誤模態框
    const existingModal = document.getElementById('error-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 創建錯誤模態框
    const errorModal = document.createElement('div');
    errorModal.id = 'error-modal';
    errorModal.className = 'error-modal';
    
    const errorContent = document.createElement('div');
    errorContent.className = 'error-content';
    
    // 錯誤圖標
    const errorIcon = document.createElement('div');
    errorIcon.className = 'error-icon';
    errorIcon.innerHTML = type === 'warning' ? '⚠️' : '❌';
    errorIcon.style.fontSize = '2rem';
    errorIcon.style.marginBottom = '15px';
    
    const errorTitle = document.createElement('h3');
    errorTitle.textContent = title;
    errorTitle.style.marginBottom = '15px';
    
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.marginTop = '20px';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'error-close-btn';
    closeButton.textContent = '關閉';
    
    closeButton.addEventListener('click', function() {
        errorModal.remove();
    });
    
    buttonContainer.appendChild(closeButton);
    
    // 重試按鈕
    if (showRetry && onRetry) {
        const retryButton = document.createElement('button');
        retryButton.className = 'error-close-btn';
        retryButton.textContent = '重試';
        retryButton.style.backgroundColor = '#3498db';
        
        retryButton.addEventListener('click', function() {
            errorModal.remove();
            onRetry();
        });
        
        buttonContainer.insertBefore(retryButton, closeButton);
    }
    
    errorContent.appendChild(errorIcon);
    errorContent.appendChild(errorTitle);
    errorContent.appendChild(errorMessage);
    errorContent.appendChild(buttonContainer);
    errorModal.appendChild(errorContent);
    
    document.body.appendChild(errorModal);
    
    // 自動關閉
    if (autoClose) {
        setTimeout(() => {
            if (document.body.contains(errorModal)) {
                errorModal.remove();
            }
        }, autoCloseDelay);
    }
    
    // 點擊背景關閉
    errorModal.addEventListener('click', function(e) {
        if (e.target === errorModal) {
            errorModal.remove();
        }
    });
    
    console.log('錯誤模態框已顯示');
}

/**
 * 顯示成功訊息
 * @param {string} message - 成功訊息
 * @param {number} duration - 顯示持續時間（毫秒）
 */
function showSuccessMessage(message, duration = 3000) {
    const successToast = document.createElement('div');
    successToast.className = 'success-toast';
    successToast.style.position = 'fixed';
    successToast.style.top = '20px';
    successToast.style.right = '20px';
    successToast.style.background = '#27ae60';
    successToast.style.color = 'white';
    successToast.style.padding = '15px 20px';
    successToast.style.borderRadius = '5px';
    successToast.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    successToast.style.zIndex = '10001';
    successToast.style.animation = 'slideInRight 0.3s ease-out';
    successToast.textContent = message;
    
    document.body.appendChild(successToast);
    
    setTimeout(() => {
        successToast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(successToast)) {
                successToast.remove();
            }
        }, 300);
    }, duration);
}

/**
 * 顯示警告訊息
 * @param {string} message - 警告訊息
 * @param {number} duration - 顯示持續時間（毫秒）
 */
function showWarningMessage(message, duration = 4000) {
    const warningToast = document.createElement('div');
    warningToast.className = 'warning-toast';
    warningToast.style.position = 'fixed';
    warningToast.style.top = '20px';
    warningToast.style.right = '20px';
    warningToast.style.background = '#f39c12';
    warningToast.style.color = 'white';
    warningToast.style.padding = '15px 20px';
    warningToast.style.borderRadius = '5px';
    warningToast.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    warningToast.style.zIndex = '10001';
    warningToast.style.animation = 'slideInRight 0.3s ease-out';
    warningToast.textContent = message;
    
    document.body.appendChild(warningToast);
    
    setTimeout(() => {
        warningToast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(warningToast)) {
                warningToast.remove();
            }
        }, 300);
    }, duration);
}

/**
 * 防抖函數 - 性能優化
 * @param {Function} func - 要防抖的函數
 * @param {number} wait - 等待時間（毫秒）
 * @param {boolean} immediate - 是否立即執行
 * @returns {Function} 防抖後的函數
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * 節流函數 - 性能優化
 * @param {Function} func - 要節流的函數
 * @param {number} limit - 限制時間（毫秒）
 * @returns {Function} 節流後的函數
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 檢查瀏覽器兼容性
 */
function checkBrowserCompatibility() {
    const compatibility = {
        isSupported: true,
        issues: []
    };
    
    // 檢查 CSS Grid 支持
    if (!CSS.supports('display', 'grid')) {
        compatibility.isSupported = false;
        compatibility.issues.push('CSS Grid 不被支持');
    }
    
    // 檢查 Flexbox 支持
    if (!CSS.supports('display', 'flex')) {
        compatibility.isSupported = false;
        compatibility.issues.push('Flexbox 不被支持');
    }
    
    // 檢查 ES6 支持
    try {
        new Function('(a = 0) => a');
    } catch (e) {
        compatibility.isSupported = false;
        compatibility.issues.push('ES6 箭頭函數不被支持');
    }
    
    // 檢查 localStorage 支持
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        compatibility.issues.push('localStorage 不被支持');
    }
    
    return compatibility;
}

/**
 * 初始化兼容性檢查
 */
function initializeCompatibilityCheck() {
    const compatibility = checkBrowserCompatibility();
    
    if (!compatibility.isSupported) {
        showErrorModal(
            '瀏覽器兼容性問題',
            `您的瀏覽器可能不完全支持此遊戲的功能：\n${compatibility.issues.join('\n')}\n\n建議使用最新版本的 Chrome、Firefox 或 Safari。`,
            { type: 'warning' }
        );
    }
    
    return compatibility;
}

// 添加 toast 動畫樣式
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyles);