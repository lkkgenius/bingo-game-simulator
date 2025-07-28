/**
 * Mobile Performance Tests
 * 測試移動設備優化功能
 */

// 模擬測試環境
const mockDOM = {
    createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        },
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        appendChild: () => {},
        removeChild: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        getAttribute: () => null,
        setAttribute: () => {},
        getBoundingClientRect: () => ({ width: 50, height: 50 })
    }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    body: {
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        },
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {}
    },
    addEventListener: () => {}
};

// 模擬全局對象
global.document = mockDOM;
global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false }),
    navigator: {
        maxTouchPoints: 0,
        msMaxTouchPoints: 0,
        onLine: true,
        vibrate: () => true
    },
    performance: {
        now: () => Date.now(),
        memory: {
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 10000000
        },
        getEntriesByType: () => []
    },
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    TouchEvent: function() {},
    location: { search: '' }
};

/**
 * 測試觸控設備檢測
 */
function testTouchDeviceDetection() {
    console.log('Testing touch device detection...');
    
    // 測試觸控支持檢測
    const tests = [
        {
            name: 'Desktop (no touch)',
            setup: () => {
                delete global.window.ontouchstart;
                global.window.navigator.maxTouchPoints = 0;
            },
            expected: false
        },
        {
            name: 'Mobile (touch support)',
            setup: () => {
                global.window.ontouchstart = true;
                global.window.navigator.maxTouchPoints = 5;
            },
            expected: true
        },
        {
            name: 'Tablet (touch support)',
            setup: () => {
                global.window.navigator.maxTouchPoints = 10;
            },
            expected: true
        }
    ];
    
    tests.forEach(test => {
        test.setup();
        
        // 模擬觸控檢測邏輯
        const isTouch = 'ontouchstart' in global.window || 
                       global.window.navigator.maxTouchPoints > 0 || 
                       global.window.navigator.msMaxTouchPoints > 0;
        
        const result = isTouch === test.expected ? 'PASS' : 'FAIL';
        console.log(`  ${test.name}: ${result} (detected: ${isTouch}, expected: ${test.expected})`);
    });
}

/**
 * 測試觸控目標優化
 */
function testTouchTargetOptimization() {
    console.log('Testing touch target optimization...');
    
    const mockElements = [
        { width: 30, height: 30, name: 'Small button' },
        { width: 50, height: 50, name: 'Good button' },
        { width: 20, height: 60, name: 'Narrow button' }
    ];
    
    mockElements.forEach(element => {
        const needsOptimization = element.width < 44 || element.height < 44;
        const result = needsOptimization ? 'OPTIMIZED' : 'OK';
        console.log(`  ${element.name} (${element.width}x${element.height}): ${result}`);
    });
}

/**
 * 測試手勢識別
 */
function testGestureRecognition() {
    console.log('Testing gesture recognition...');
    
    const gestures = [
        {
            name: 'Swipe Right',
            startX: 100, startY: 200,
            endX: 200, endY: 200,
            expected: 'right'
        },
        {
            name: 'Swipe Left',
            startX: 200, startY: 200,
            endX: 100, endY: 200,
            expected: 'left'
        },
        {
            name: 'Swipe Up',
            startX: 150, startY: 250,
            endX: 150, endY: 150,
            expected: 'up'
        },
        {
            name: 'Swipe Down',
            startX: 150, startY: 150,
            endX: 150, endY: 250,
            expected: 'down'
        },
        {
            name: 'Tap (no swipe)',
            startX: 150, startY: 150,
            endX: 155, endY: 155,
            expected: 'none'
        }
    ];
    
    gestures.forEach(gesture => {
        const deltaX = gesture.endX - gesture.startX;
        const deltaY = gesture.endY - gesture.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const swipeThreshold = 50;
        
        let detected = 'none';
        
        if (distance >= swipeThreshold) {
            const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
            
            if (Math.abs(angle) < 45) {
                detected = 'right';
            } else if (Math.abs(angle) > 135) {
                detected = 'left';
            } else if (angle > 45 && angle < 135) {
                detected = 'down';
            } else if (angle < -45 && angle > -135) {
                detected = 'up';
            }
        }
        
        const result = detected === gesture.expected ? 'PASS' : 'FAIL';
        console.log(`  ${gesture.name}: ${result} (detected: ${detected}, expected: ${gesture.expected})`);
    });
}

/**
 * 測試性能監控
 */
function testPerformanceMonitoring() {
    console.log('Testing performance monitoring...');
    
    // 測試內存使用監控
    const memoryTests = [
        { used: 5000000, total: 10000000, expected: 'OK' },
        { used: 8500000, total: 10000000, expected: 'WARNING' },
        { used: 9500000, total: 10000000, expected: 'CRITICAL' }
    ];
    
    memoryTests.forEach(test => {
        const usage = (test.used / test.total) * 100;
        let status = 'OK';
        
        if (usage > 95) {
            status = 'CRITICAL';
        } else if (usage > 80) {
            status = 'WARNING';
        }
        
        const result = status === test.expected ? 'PASS' : 'FAIL';
        console.log(`  Memory usage ${usage.toFixed(1)}%: ${result} (status: ${status}, expected: ${test.expected})`);
    });
    
    // 測試 FPS 監控
    const fpsTests = [
        { fps: 60, expected: 'GOOD' },
        { fps: 45, expected: 'OK' },
        { fps: 25, expected: 'LOW' }
    ];
    
    fpsTests.forEach(test => {
        let status = 'GOOD';
        
        if (test.fps < 30) {
            status = 'LOW';
        } else if (test.fps < 50) {
            status = 'OK';
        }
        
        const result = status === test.expected ? 'PASS' : 'FAIL';
        console.log(`  FPS ${test.fps}: ${result} (status: ${status}, expected: ${test.expected})`);
    });
}

/**
 * 測試 PWA 功能
 */
function testPWAFeatures() {
    console.log('Testing PWA features...');
    
    // 測試 Service Worker 支持
    const swSupported = typeof global.navigator !== 'undefined' && 'serviceWorker' in global.navigator;
    console.log(`  Service Worker support: ${swSupported ? 'SUPPORTED' : 'NOT_SUPPORTED'}`);
    
    // 測試 Manifest 支持
    const manifestSupported = typeof global.window !== 'undefined' && 'onbeforeinstallprompt' in global.window;
    console.log(`  Web App Manifest support: ${manifestSupported ? 'SUPPORTED' : 'NOT_SUPPORTED'}`);
    
    // 測試離線檢測
    const onlineStatus = global.window.navigator.onLine;
    console.log(`  Online status: ${onlineStatus ? 'ONLINE' : 'OFFLINE'}`);
    
    // 測試推送通知支持
    const notificationSupported = typeof Notification !== 'undefined';
    console.log(`  Push notifications: ${notificationSupported ? 'SUPPORTED' : 'NOT_SUPPORTED'}`);
}

/**
 * 測試緩存策略
 */
function testCacheStrategies() {
    console.log('Testing cache strategies...');
    
    const resources = [
        { url: '/index.html', type: 'document', strategy: 'networkFirst' },
        { url: '/styles.css', type: 'stylesheet', strategy: 'cacheFirst' },
        { url: '/script.js', type: 'script', strategy: 'cacheFirst' },
        { url: '/api/stats', type: 'api', strategy: 'networkFirst' },
        { url: '/images/icon.png', type: 'image', strategy: 'staleWhileRevalidate' }
    ];
    
    resources.forEach(resource => {
        let expectedStrategy = 'networkFirst';
        
        if (resource.url.endsWith('.js') || resource.url.endsWith('.css') || resource.url.endsWith('.html')) {
            expectedStrategy = 'cacheFirst';
        } else if (resource.url.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
            expectedStrategy = 'staleWhileRevalidate';
        } else if (resource.url.startsWith('/api/')) {
            expectedStrategy = 'networkFirst';
        }
        
        const result = expectedStrategy === resource.strategy ? 'PASS' : 'FAIL';
        console.log(`  ${resource.url}: ${result} (strategy: ${expectedStrategy})`);
    });
}

/**
 * 運行所有測試
 */
function runAllTests() {
    console.log('=== Mobile Device Optimization Tests ===\n');
    
    testTouchDeviceDetection();
    console.log('');
    
    testTouchTargetOptimization();
    console.log('');
    
    testGestureRecognition();
    console.log('');
    
    testPerformanceMonitoring();
    console.log('');
    
    testPWAFeatures();
    console.log('');
    
    testCacheStrategies();
    console.log('');
    
    console.log('=== Tests Completed ===');
}

// 如果直接運行此文件
if (require.main === module) {
    runAllTests();
}

// 導出測試函數
module.exports = {
    testTouchDeviceDetection,
    testTouchTargetOptimization,
    testGestureRecognition,
    testPerformanceMonitoring,
    testPWAFeatures,
    testCacheStrategies,
    runAllTests
};