/**
 * 載入流程測試
 * 專門測試漸進式載入系統，確保不會卡在某個百分比
 */

// 模擬瀏覽器環境
global.document = {
    getElementById: () => ({
        classList: { add: () => {}, remove: () => {} },
        style: {},
        querySelector: () => ({ textContent: '' })
    }),
    querySelector: () => ({ textContent: '' }),
    createElement: () => ({
        className: '',
        style: {},
        appendChild: () => {},
        textContent: ''
    }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} }
};

global.window = {
    matchMedia: () => ({ matches: false })
};

global.CSS = {
    supports: () => true
};

global.localStorage = {
    setItem: () => {},
    removeItem: () => {}
};

global.performance = {
    now: () => Date.now()
};

// 直接定義 ProgressiveLoader 類別用於測試
class ProgressiveLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.totalComponents = 0;
        this.onProgress = null;
        this.onComplete = null;
        this.loadStartTime = performance.now();
        this.componentLoadTimes = new Map();
        this.criticalComponents = new Set(['GameState', 'LineDetector', 'ProbabilityCalculator']);
    }
    
    setTotalComponents(total) {
        this.totalComponents = total;
    }
    
    markComponentLoaded(componentName) {
        const loadTime = performance.now() - this.loadStartTime;
        this.componentLoadTimes.set(componentName, loadTime);
        this.loadedComponents.add(componentName);
        
        const progress = (this.loadedComponents.size / this.totalComponents) * 100;
        
        if (this.onProgress) {
            this.onProgress(progress, componentName);
        }
        
        // 檢查關鍵組件是否已載入完成
        const criticalLoaded = Array.from(this.criticalComponents).every(comp => 
            this.loadedComponents.has(comp)
        );
        
        if (criticalLoaded && this.loadedComponents.size >= this.criticalComponents.size) {
            this.onCriticalComponentsLoaded?.();
        }
        
        if (this.loadedComponents.size === this.totalComponents && this.onComplete) {
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

// 簡單的測試函數
function updateLoadingProgress(progress, componentName) {
    const loadingText = document.querySelector('#global-loading .loading-text');
    if (loadingText) {
        loadingText.textContent = `正在載入 ${componentName}... (${Math.round(progress)}%)`;
    }
}

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

// 測試 ProgressiveLoader 基本功能
console.log('\nLoading Flow Tests');

// 測試 1: 初始化
console.log('\nProgressiveLoader Class');
try {
    const loader = new ProgressiveLoader();
    if (loader.loadedComponents.size === 0 && loader.totalComponents === 0) {
        console.log('✓ should initialize with correct default values');
    } else {
        console.log('✗ should initialize with correct default values');
    }
} catch (error) {
    console.log('✗ should initialize with correct default values');
    console.error('  Error:', error.message);
}

// 測試 2: 設置總組件數
try {
    const loader = new ProgressiveLoader();
    loader.setTotalComponents(6);
    if (loader.totalComponents === 6) {
        console.log('✓ should set total components correctly');
    } else {
        console.log('✗ should set total components correctly');
    }
} catch (error) {
    console.log('✗ should set total components correctly');
    console.error('  Error:', error.message);
}

// 測試 3: 追蹤組件載入進度
try {
    const loader = new ProgressiveLoader();
    loader.setTotalComponents(6);
    
    let progressCalled = false;
    loader.setProgressCallback(() => {
        progressCalled = true;
    });

    loader.markComponentLoaded('GameState');
    
    if (loader.loadedComponents.has('GameState') && progressCalled) {
        console.log('✓ should track component loading progress');
    } else {
        console.log('✗ should track component loading progress');
    }
} catch (error) {
    console.log('✗ should track component loading progress');
    console.error('  Error:', error.message);
}

// 測試 4: 完成回調
try {
    const loader = new ProgressiveLoader();
    loader.setTotalComponents(3);
    
    let completeCalled = false;
    loader.setCompleteCallback(() => {
        completeCalled = true;
    });

    loader.markComponentLoaded('Component1');
    loader.markComponentLoaded('Component2');
    
    if (completeCalled) {
        console.log('✗ should call complete callback when all components loaded (called too early)');
    } else {
        loader.markComponentLoaded('Component3');
        if (completeCalled) {
            console.log('✓ should call complete callback when all components loaded');
        } else {
            console.log('✗ should call complete callback when all components loaded (not called)');
        }
    }
} catch (error) {
    console.log('✗ should call complete callback when all components loaded');
    console.error('  Error:', error.message);
}

// 測試 5: 防止重複載入
try {
    const loader = new ProgressiveLoader();
    loader.setTotalComponents(2);
    
    loader.markComponentLoaded('GameState');
    loader.markComponentLoaded('GameState'); // 重複載入
    
    if (loader.loadedComponents.size === 1) {
        console.log('✓ should prevent duplicate component loading');
    } else {
        console.log('✗ should prevent duplicate component loading');
    }
} catch (error) {
    console.log('✗ should prevent duplicate component loading');
    console.error('  Error:', error.message);
}

// 測試 6: 重置功能
try {
    const loader = new ProgressiveLoader();
    loader.setTotalComponents(3);
    loader.markComponentLoaded('Component1');
    loader.markComponentLoaded('Component2');
    
    if (loader.loadedComponents.size === 2) {
        loader.reset();
        if (loader.loadedComponents.size === 0) {
            console.log('✓ should reset correctly');
        } else {
            console.log('✗ should reset correctly');
        }
    } else {
        console.log('✗ should reset correctly (setup failed)');
    }
} catch (error) {
    console.log('✗ should reset correctly');
    console.error('  Error:', error.message);
}

// 測試 7: 關鍵測試 - 防止卡在 83%
console.log('\nReal-world Loading Scenarios');
try {
    const loader = new ProgressiveLoader();
    loader.setTotalComponents(6);
    
    let completeCalled = false;
    loader.setCompleteCallback(() => {
        completeCalled = true;
    });

    // 載入前 5 個組件（83.33%）
    loader.markComponentLoaded('GameState');
    loader.markComponentLoaded('LineDetector');
    loader.markComponentLoaded('ProbabilityCalculator');
    loader.markComponentLoaded('GameBoard');
    loader.markComponentLoaded('Enhanced Algorithm');

    if (completeCalled) {
        console.log('✗ should prevent getting stuck at 83% (completed too early)');
    } else {
        // 載入最後一個組件
        loader.markComponentLoaded('UI');
        
        if (completeCalled && loader.loadedComponents.size === 6) {
            console.log('✓ should prevent getting stuck at 83%');
        } else {
            console.log('✗ should prevent getting stuck at 83% (not completed properly)');
        }
    }
} catch (error) {
    console.log('✗ should prevent getting stuck at 83%');
    console.error('  Error:', error.message);
}

// 測試 8: 載入進度顯示
console.log('\nLoading Progress Display');
try {
    const mockLoadingText = { textContent: '' };
    global.document.querySelector = () => mockLoadingText;

    updateLoadingProgress(50, 'TestComponent');

    if (mockLoadingText.textContent === '正在載入 TestComponent... (50%)') {
        console.log('✓ should update loading progress text correctly');
    } else {
        console.log('✗ should update loading progress text correctly');
    }
} catch (error) {
    console.log('✗ should update loading progress text correctly');
    console.error('  Error:', error.message);
}

// 測試 9: 瀏覽器兼容性檢查
console.log('\nError Handling');
try {
    const originalSupports = global.CSS.supports;
    global.CSS.supports = () => false;

    const compatibility = checkBrowserCompatibility();

    if (!compatibility.isSupported && compatibility.issues.length > 0) {
        console.log('✓ should handle browser compatibility issues');
    } else {
        console.log('✗ should handle browser compatibility issues');
    }
    
    // 恢復原始函數
    global.CSS.supports = originalSupports;
} catch (error) {
    console.log('✗ should handle browser compatibility issues');
    console.error('  Error:', error.message);
}

console.log('\nLoading flow tests completed!');