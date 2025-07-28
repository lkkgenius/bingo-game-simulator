/**
 * Service Worker for Bingo Game Simulator
 * 實作離線緩存策略和 PWA 功能
 * Enhanced with security and stability improvements
 */

const CACHE_VERSION = '1.1.0';
const CACHE_NAME = `bingo-simulator-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `bingo-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `bingo-dynamic-v${CACHE_VERSION}`;
const OFFLINE_CACHE_NAME = `bingo-offline-v${CACHE_VERSION}`;

// 需要緩存的靜態資源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/gameBoard.js',
    '/gameEngine.js',
    '/lineDetector.js',
    '/probabilityCalculator.js',
    '/probabilityCalculator.enhanced.js',
    '/mobile-touch.js',
    '/gesture-support.js',
    '/performance-monitor.js',
    '/loading-functions.js',
    '/algorithmComparison.js',
    '/aiLearningSystem.js',
    '/security-utils.js',
    '/error-boundary.js',
    '/manifest.json'
];

// 離線頁面和資源
const OFFLINE_ASSETS = [
    '/offline.html',
    '/offline-game.js'
];

// 動態緩存的資源模式
const DYNAMIC_CACHE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\.(?:woff|woff2|ttf|eot)$/,
    /\/api\//
];

// 網絡優先的資源模式
const NETWORK_FIRST_PATTERNS = [
    /\/api\/stats/,
    /\/api\/leaderboard/
];

/**
 * Service Worker 安裝事件
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // 緩存靜態資源
            caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                    console.log('Caching static assets...');
                    return cache.addAll(STATIC_ASSETS);
                }),
            
            // 緩存離線資源
            caches.open(OFFLINE_CACHE_NAME)
                .then((cache) => {
                    console.log('Caching offline assets...');
                    return cache.addAll(OFFLINE_ASSETS.filter(asset => {
                        // 只緩存存在的離線資源
                        return true; // 暫時返回 true，實際應該檢查文件是否存在
                    }));
                })
                .catch((error) => {
                    console.warn('Some offline assets not found, continuing...', error);
                    return Promise.resolve();
                })
        ])
        .then(() => {
            console.log('All assets cached successfully');
            return self.skipWaiting();
        })
        .catch((error) => {
            console.error('Failed to cache assets:', error);
        })
    );
});

/**
 * Service Worker 激活事件
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        Promise.all([
            // 清理舊緩存
            caches.keys()
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            if (cacheName !== STATIC_CACHE_NAME && 
                                cacheName !== DYNAMIC_CACHE_NAME &&
                                cacheName !== OFFLINE_CACHE_NAME &&
                                cacheName.startsWith('bingo-')) {
                                console.log('Deleting old cache:', cacheName);
                                return caches.delete(cacheName);
                            }
                        })
                    );
                }),
            
            // 初始化離線數據庫
            initializeOfflineDatabase()
        ])
        .then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
        .catch((error) => {
            console.error('Service Worker activation failed:', error);
        })
    );
});

/**
 * 網絡請求攔截
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // 安全性檢查
    if (!isSecureRequest(request)) {
        console.warn('Blocked insecure request:', request.url);
        event.respondWith(new Response('Request blocked for security reasons', { status: 403 }));
        return;
    }
    
    const url = new URL(request.url);
    
    // 跳過非 HTTP(S) 請求
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // 跳過 Chrome 擴展請求
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // 跳過 Service Worker 自身的請求
    if (url.pathname === '/sw.js') {
        return;
    }
    
    // 根據請求類型選擇緩存策略
    if (isStaticAsset(request)) {
        event.respondWith(enhancedCacheFirst(request));
    } else if (isNetworkFirst(request)) {
        event.respondWith(enhancedNetworkFirst(request));
    } else if (isDynamicAsset(request)) {
        event.respondWith(enhancedStaleWhileRevalidate(request));
    } else {
        event.respondWith(enhancedNetworkFirst(request));
    }
});

/**
 * 判斷是否為靜態資源
 */
function isStaticAsset(request) {
    const url = new URL(request.url);
    return STATIC_ASSETS.some(asset => url.pathname === asset) ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.html');
}

/**
 * 判斷是否為網絡優先資源
 */
function isNetworkFirst(request) {
    return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url));
}

/**
 * 判斷是否為動態資源
 */
function isDynamicAsset(request) {
    return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

/**
 * 增強的緩存優先策略
 */
async function enhancedCacheFirst(request) {
    try {
        // 首先檢查緩存
        const cachedResponse = await caches.match(request);
        if (cachedResponse && !isResponseExpired(cachedResponse)) {
            return cachedResponse;
        }
        
        // 嘗試網絡請求
        const networkResponse = await fetch(request, {
            timeout: 5000 // 5秒超時
        });
        
        if (networkResponse.ok) {
            await safeCacheOperation(STATIC_CACHE_NAME, async (cache) => {
                await cache.put(request, networkResponse.clone());
            });
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Enhanced cache first strategy failed:', error);
        
        // 如果有過期的緩存，返回它
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 返回離線響應
        if (request.destination === 'document') {
            return getOfflineResponse(request);
        }
        
        return new Response('Service Unavailable', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

/**
 * 增強的網絡優先策略
 */
async function enhancedNetworkFirst(request) {
    try {
        const networkResponse = await fetch(request, {
            timeout: 8000 // 8秒超時
        });
        
        if (networkResponse.ok) {
            await safeCacheOperation(DYNAMIC_CACHE_NAME, async (cache) => {
                await cache.put(request, networkResponse.clone());
            });
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 返回離線頁面或默認響應
        if (request.destination === 'document') {
            return getOfflineResponse(request);
        }
        
        return new Response('Service Unavailable', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

/**
 * 增強的陳舊內容重新驗證策略
 */
async function enhancedStaleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // 後台更新
    const fetchPromise = fetch(request, {
        timeout: 10000 // 10秒超時
    }).then(async (networkResponse) => {
        if (networkResponse.ok) {
            await safeCacheOperation(DYNAMIC_CACHE_NAME, async (cache) => {
                await cache.put(request, networkResponse.clone());
            });
        }
        return networkResponse;
    }).catch((error) => {
        console.warn('Background fetch failed:', error);
        return cachedResponse;
    });
    
    // 如果有緩存且未過期，立即返回
    if (cachedResponse && !isResponseExpired(cachedResponse)) {
        return cachedResponse;
    }
    
    // 否則等待網絡響應
    return fetchPromise || cachedResponse || getOfflineResponse(request);
}

/**
 * 檢查響應是否過期
 */
function isResponseExpired(response) {
    const dateHeader = response.headers.get('date');
    if (!dateHeader) return false;
    
    const responseDate = new Date(dateHeader).getTime();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24小時
    
    return (now - responseDate) > maxAge;
}

/**
 * 後台同步事件
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * 執行後台同步
 */
async function doBackgroundSync() {
    try {
        // 同步遊戲統計數據
        const stats = await getStoredStats();
        if (stats) {
            await syncStats(stats);
        }
        
        // 清理過期緩存
        await cleanupExpiredCache();
        
        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

/**
 * 獲取存儲的統計數據
 */
async function getStoredStats() {
    // 這裡可以從 IndexedDB 或其他存儲中獲取數據
    return null;
}

/**
 * 同步統計數據
 */
async function syncStats(stats) {
    try {
        await fetch('/api/stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stats)
        });
    } catch (error) {
        console.error('Failed to sync stats:', error);
    }
}

/**
 * 初始化離線數據庫
 */
async function initializeOfflineDatabase() {
    try {
        // 這裡可以初始化 IndexedDB 用於離線數據存儲
        console.log('Offline database initialized');
    } catch (error) {
        console.error('Failed to initialize offline database:', error);
    }
}

/**
 * 清理過期緩存
 */
async function cleanupExpiredCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const requests = await cache.keys();
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
        
        for (const request of requests) {
            try {
                const response = await cache.match(request);
                if (!response) continue;
                
                const dateHeader = response.headers.get('date');
                
                if (dateHeader) {
                    const responseDate = new Date(dateHeader).getTime();
                    if (now - responseDate > maxAge) {
                        await cache.delete(request);
                        console.log('Deleted expired cache:', request.url);
                    }
                }
            } catch (error) {
                console.warn('Error processing cache entry:', error);
                // 刪除有問題的緩存條目
                await cache.delete(request);
            }
        }
    } catch (error) {
        console.error('Failed to cleanup expired cache:', error);
    }
}

/**
 * 安全的緩存操作
 */
async function safeCacheOperation(cacheName, operation) {
    try {
        const cache = await caches.open(cacheName);
        return await operation(cache);
    } catch (error) {
        console.error(`Cache operation failed for ${cacheName}:`, error);
        return null;
    }
}

/**
 * 驗證請求安全性
 */
function isSecureRequest(request) {
    const url = new URL(request.url);
    
    // 只允許 HTTP 和 HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
        return false;
    }
    
    // 檢查是否為惡意 URL 模式
    const maliciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /<script/i,
        /eval\(/i
    ];
    
    return !maliciousPatterns.some(pattern => pattern.test(request.url));
}

/**
 * 增強的離線頁面響應
 */
async function getOfflineResponse(request) {
    // 嘗試從離線緩存獲取
    const offlineResponse = await caches.match('/offline.html', {
        cacheName: OFFLINE_CACHE_NAME
    });
    
    if (offlineResponse) {
        return offlineResponse;
    }
    
    // 創建基本的離線響應
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>離線模式 - Bingo 遊戲模擬器</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 50px;
                    background: #f5f5f5;
                }
                .offline-container {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .offline-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                }
                .retry-btn {
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-top: 20px;
                }
                .retry-btn:hover {
                    background: #45a049;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📱</div>
                <h1>您目前處於離線模式</h1>
                <p>請檢查您的網路連接，然後重試。</p>
                <p>某些功能在離線模式下可能無法使用。</p>
                <button class="retry-btn" onclick="window.location.reload()">重試</button>
            </div>
        </body>
        </html>
    `, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
        }
    });
}

/**
 * 推送通知事件
 */
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
            {
                action: 'open',
                title: '打開遊戲',
                icon: '/icons/open-96x96.png'
            },
            {
                action: 'close',
                title: '關閉',
                icon: '/icons/close-96x96.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

/**
 * 通知點擊事件
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * 消息事件處理
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

/**
 * 錯誤處理
 */
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});