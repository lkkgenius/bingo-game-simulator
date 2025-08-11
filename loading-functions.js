/**
 * 增強的載入狀態和錯誤處理函數
 * 提供更好的用戶體驗和性能優化
 */

/**
 * 顯示全局載入狀態
 */
function showGlobalLoading(message = '正在載入遊戲組件...') {
  console.log('顯示全局載入狀態:', message);

  let loadingOverlay = document.getElementById('global-loading');

  // 如果載入覆蓋層不存在，創建一個增強版本
  if (!loadingOverlay) {
    loadingOverlay = createEnhancedLoadingOverlay();
    document.body.appendChild(loadingOverlay);
  }

  const loadingText = loadingOverlay.querySelector('.loading-text');
  const progressBar = loadingOverlay.querySelector('.loading-progress-bar');
  const loadingSpinner = loadingOverlay.querySelector('.loading-spinner');

  // 更新載入訊息
  if (loadingText) {
    loadingText.textContent = message;

    // 添加打字機效果
    if (typeof addTypewriterEffect === 'function') {
      addTypewriterEffect(loadingText, message);
    }
  }

  // 顯示載入覆蓋層
  loadingOverlay.classList.remove('hidden');
  loadingOverlay.style.opacity = '0';

  // 平滑淡入動畫
  requestAnimationFrame(() => {
    loadingOverlay.style.transition = 'opacity 0.3s ease-in-out';
    loadingOverlay.style.opacity = '1';
  });

  // 啟動載入動畫
  if (loadingSpinner) {
    loadingSpinner.classList.add('spinning');
  }

  // 無障礙支持
  loadingOverlay.setAttribute('aria-live', 'polite');
  loadingOverlay.setAttribute('aria-busy', 'true');

  // 通知螢幕閱讀器
  if (window.accessibilityEnhancer) {
    window.accessibilityEnhancer.announce(message);
  }
}

/**
 * 創建增強版載入覆蓋層
 */
function createEnhancedLoadingOverlay() {
  const overlay = SafeDOM.createStructure({
    tag: 'div',
    attributes: {
      id: 'global-loading',
      class: 'global-loading enhanced-loading',
      role: 'status',
      'aria-label': '載入中'
    },
    children: [
      {
        tag: 'div',
        attributes: { class: 'loading-container' },
        children: [
          {
            tag: 'div',
            attributes: { class: 'loading-spinner-container' },
            children: [
              {
                tag: 'div',
                attributes: {
                  class: 'loading-spinner',
                  'aria-hidden': 'true'
                }
              }
            ]
          },
          {
            tag: 'div',
            attributes: { class: 'loading-content' },
            children: [
              {
                tag: 'div',
                attributes: { class: 'loading-text' },
                textContent: '正在載入遊戲組件...'
              },
              {
                tag: 'div',
                attributes: { class: 'loading-progress' },
                children: [
                  {
                    tag: 'div',
                    attributes: {
                      class: 'loading-progress-bar',
                      role: 'progressbar',
                      'aria-valuemin': '0',
                      'aria-valuemax': '100',
                      'aria-valuenow': '0'
                    }
                  }
                ]
              },
              {
                tag: 'div',
                attributes: { class: 'loading-tips' },
                textContent: '提示：您可以使用鍵盤方向鍵來導航遊戲板'
              }
            ]
          }
        ]
      }
    ]
  });

  // 添加增強樣式
  const enhancedStyles = document.createElement('style');
  enhancedStyles.id = 'enhanced-loading-styles';
  enhancedStyles.textContent = `
        .enhanced-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, 
                rgba(74, 144, 226, 0.95) 0%, 
                rgba(92, 107, 192, 0.95) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .loading-container {
            text-align: center;
            max-width: 400px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .loading-spinner-container {
            margin-bottom: 30px;
        }
        
        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #ffffff;
            border-radius: 50%;
            margin: 0 auto;
            position: relative;
        }
        
        .loading-spinner.spinning {
            animation: spin 1s linear infinite;
        }
        
        .loading-spinner::after {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            border: 2px solid transparent;
            border-top: 2px solid rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            animation: spin 2s linear infinite reverse;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loading-content {
            color: white;
        }
        
        .loading-text {
            font-size: 1.2rem;
            font-weight: 500;
            margin-bottom: 20px;
            min-height: 1.5em;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .loading-progress {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        .loading-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #ffffff, #e3f2fd);
            border-radius: 3px;
            width: 0%;
            transition: width 0.3s ease;
            position: relative;
        }
        
        .loading-progress-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(255, 255, 255, 0.4), 
                transparent);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .loading-tips {
            font-size: 0.9rem;
            opacity: 0.8;
            font-style: italic;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        /* 響應式設計 */
        @media (max-width: 768px) {
            .loading-container {
                max-width: 300px;
                padding: 30px 20px;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
            }
            
            .loading-text {
                font-size: 1.1rem;
            }
        }
        
        /* 減少動畫偏好 */
        @media (prefers-reduced-motion: reduce) {
            .loading-spinner,
            .loading-spinner::after {
                animation: none;
            }
            
            .loading-progress-bar::after {
                animation: none;
            }
        }
        
        /* 高對比度模式 */
        @media (prefers-contrast: high) {
            .enhanced-loading {
                background: #000;
                color: #fff;
            }
            
            .loading-container {
                background: #333;
                border: 2px solid #fff;
            }
            
            .loading-spinner {
                border-color: #666;
                border-top-color: #fff;
            }
        }
    `;

  if (!document.getElementById('enhanced-loading-styles')) {
    document.head.appendChild(enhancedStyles);
  }

  return overlay;
}

/**
 * 更新載入進度
 */
function updateLoadingProgress(progress, message) {
  const loadingOverlay = document.getElementById('global-loading');
  if (!loadingOverlay) return;

  const progressBar = loadingOverlay.querySelector('.loading-progress-bar');
  const loadingText = loadingOverlay.querySelector('.loading-text');

  if (progressBar) {
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    progressBar.setAttribute('aria-valuenow', progress.toString());
  }

  if (loadingText && message) {
    loadingText.textContent = message;
  }
}

/**
 * 添加打字機效果
 */
function addTypewriterEffect(element, text) {
  if (!element || typeof text !== 'string') return;

  element.textContent = '';
  let index = 0;

  const typeWriter = () => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(typeWriter, 50);
    }
  };

  typeWriter();
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
  const { lines = 3, height = '1rem', spacing = '8px' } = config;

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
    this.loadStartTime = performance.now();
    this.componentLoadTimes = new Map();
    this.criticalComponents = new Set([
      'GameState',
      'LineDetector',
      'ProbabilityCalculator'
    ]); // 關鍵組件優先載入
  }

  setTotalComponents(total) {
    this.totalComponents = total;
  }

  markComponentLoaded(componentName) {
    const loadTime = performance.now() - this.loadStartTime;
    this.componentLoadTimes.set(componentName, loadTime);
    this.loadedComponents.add(componentName);

    const progress = (this.loadedComponents.size / this.totalComponents) * 100;

    console.log(
      `Component loaded: ${componentName} (${loadTime.toFixed(2)}ms)`
    );

    if (this.onProgress) {
      this.onProgress(progress, componentName);
    }

    // 檢查關鍵組件是否已載入完成
    const criticalLoaded = Array.from(this.criticalComponents).every(comp =>
      this.loadedComponents.has(comp)
    );

    if (
      criticalLoaded &&
      this.loadedComponents.size >= this.criticalComponents.size
    ) {
      // 關鍵組件載入完成，可以開始基本功能
      this.onCriticalComponentsLoaded?.();
    }

    if (
      this.loadedComponents.size === this.totalComponents &&
      this.onComplete
    ) {
      const totalLoadTime = performance.now() - this.loadStartTime;
      console.log(`All components loaded in ${totalLoadTime.toFixed(2)}ms`);
      this.logLoadingPerformance();
      this.onComplete();
    }
  }

  setCriticalComponentsCallback(callback) {
    this.onCriticalComponentsLoaded = callback;
  }

  logLoadingPerformance() {
    console.log('Loading Performance Report:');
    for (const [component, time] of this.componentLoadTimes) {
      console.log(`  ${component}: ${time.toFixed(2)}ms`);
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
  progressiveLoader.setTotalComponents(6); // LineDetector, ProbabilityCalculator, GameBoard, GameEngine, Enhanced Algorithm, UI
  progressiveLoader.setProgressCallback(updateLoadingProgress);
  progressiveLoader.setCompleteCallback(() => {
    // 添加載入完成動畫
    const loadingOverlay = document.getElementById('global-loading');
    if (loadingOverlay) {
      loadingOverlay.style.transition = 'opacity 0.5s ease-out';
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        hideGlobalLoading();
        showSuccessMessage('遊戲載入完成！');
      }, 500);
    } else {
      hideGlobalLoading();
      showSuccessMessage('遊戲載入完成！');
    }
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

  // Enhanced input validation
  if (typeof title !== 'string' || typeof message !== 'string') {
    console.error('Invalid parameters for showErrorModal');
    title = '錯誤';
    message = '發生未知錯誤';
  }

  const {
    type = 'error',
    autoClose = false,
    autoCloseDelay = 5000,
    showRetry = false,
    onRetry = null,
    showDetails = false,
    details = null,
    persistent = false // 是否為持久性錯誤（不能自動關閉）
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
  errorIcon.textContent = type === 'warning' ? '⚠️' : '❌';
  errorIcon.style.fontSize = '2rem';
  errorIcon.style.marginBottom = '15px';

  const errorTitle = document.createElement('h3');
  errorTitle.textContent = title;
  errorTitle.style.marginBottom = '15px';

  const errorMessage = document.createElement('p');
  errorMessage.className = 'error-message';
  errorMessage.textContent = message;
  errorMessage.style.marginBottom = '15px';
  errorMessage.style.lineHeight = '1.5';

  // 添加詳細信息區域
  let detailsContainer = null;
  if (showDetails && details) {
    detailsContainer = document.createElement('div');
    detailsContainer.className = 'error-details';
    detailsContainer.style.background = '#f8f9fa';
    detailsContainer.style.padding = '10px';
    detailsContainer.style.borderRadius = '5px';
    detailsContainer.style.marginTop = '10px';
    detailsContainer.style.fontSize = '0.9rem';
    detailsContainer.style.color = '#666';
    detailsContainer.style.maxHeight = '150px';
    detailsContainer.style.overflowY = 'auto';
    detailsContainer.style.display = 'none';

    const detailsText = document.createElement('pre');
    detailsText.style.whiteSpace = 'pre-wrap';
    detailsText.style.margin = '0';
    detailsText.textContent =
      typeof details === 'string' ? details : JSON.stringify(details, null, 2);
    detailsContainer.appendChild(detailsText);
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '10px';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.marginTop = '20px';

  const closeButton = document.createElement('button');
  closeButton.className = 'error-close-btn';
  closeButton.textContent = '關閉';

  closeButton.addEventListener('click', function () {
    errorModal.remove();
  });

  buttonContainer.appendChild(closeButton);

  // 重試按鈕
  if (showRetry && onRetry) {
    const retryButton = document.createElement('button');
    retryButton.className = 'error-close-btn';
    retryButton.textContent = '重試';
    retryButton.style.backgroundColor = '#3498db';

    retryButton.addEventListener('click', function () {
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
  errorModal.addEventListener('click', function (e) {
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
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
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
    // Check for ES6 features without using Function constructor
    const testArrowFunction = (a = 0) => a;
    const testDestructuring = { a: 1 };
    const { a } = testDestructuring;
    // If we get here, ES6 is supported
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
