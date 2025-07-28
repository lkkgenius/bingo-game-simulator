/**
 * Service Worker for Bingo Game Simulator
 * 實作離線緩存策略和 PWA 功能
 */

const CACHE_NAME = 'bingo-simulator-v1.0.0';
const STATIC_CACHE_NAME = 'bingo-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'bingo-dynamic-v1.0.0';

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
    '/manifest.json'
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
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

/**
 * Service Worker 激活事件
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName.startsWith('bingo-')) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

/**
 * 網絡請求攔截
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 跳過非 HTTP(S) 請求
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // 跳過 Chrome 擴展請求
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // 根據請求類型選擇緩存策略
    if (isStaticAsset(request)) {
        event.respondWith(cacheFirst(request));
    } else if (isNetworkFirst(request)) {
        event.respondWith(networkFirst(request));
    } else if (isDynamicAsset(request)) {
        event.respondWith(staleWhileRevalidate(request));
    } else {
        event.respondWith(networkFirst(request));
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
 * 緩存優先策略
 */
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * 網絡優先策略
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
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
            return caches.match('/');
        }
        
        return new Response('Offline', { status: 503 });
    }
}

/**
 * 陳舊內容重新驗證策略
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
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
 * 清理過期緩存
 */
async function cleanupExpiredCache() {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
    
    for (const request of requests) {
        const response = await cache.match(request);
        const dateHeader = response.headers.get('date');
        
        if (dateHeader) {
            const responseDate = new Date(dateHeader).getTime();
            if (now - responseDate > maxAge) {
                await cache.delete(request);
                console.log('Deleted expired cache:', request.url);
            }
        }
    }
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