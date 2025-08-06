/**
 * PWA Manager Module
 * 管理 PWA 功能，包括安裝提示、更新檢查等
 */

// 確保 SafeDOM 可用
if (typeof SafeDOM === 'undefined' && typeof require !== 'undefined') {
    const SafeDOM = require('./safe-dom.js');
}

// Logger 初始化 - 使用函數作用域避免全局衝突
const getLogger = () => {
    if (typeof window !== 'undefined' && window.logger) {
        return window.logger;
} else if (typeof require !== 'undefined') {
    try {
        const { logger: prodLogger } = require('./production-logger.js');
        logger = prodLogger;
    } catch (e) {
        // Fallback if production-logger is not available
        logger = null;
    }
}

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isUpdateAvailable = false;
        this.registration = null;
        
        this.init();
    }
    
    /**
     * 初始化 PWA 管理器
     */
    init() {
        this.checkInstallStatus();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupUpdateCheck();
        this.setupOfflineDetection();
        this.createInstallButton();
    }
    
    /**
     * 檢查安裝狀態
     */
    checkInstallStatus() {
        // 檢查是否在獨立模式下運行（已安裝）
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;
        
        if (this.isInstalled) {
            if (logger) {
                logger.info('PWA is installed');
            }
            document.body.classList.add('pwa-installed');
        }
    }
    
    /**
     * 註冊 Service Worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('./sw.js');
                if (logger) {
                    logger.info('Service Worker registered successfully');
                }
                
                // 監聽更新
                this.registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate();
                });
                
                // 檢查現有的 Service Worker
                if (this.registration.waiting) {
                    this.showUpdatePrompt();
                }
                
            } catch (error) {
                if (logger) {
                    logger.error('Service Worker registration failed:', error);
                }
            }
        }
    }
    
    /**
     * 處理 Service Worker 更新
     */
    handleServiceWorkerUpdate() {
        const newWorker = this.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.isUpdateAvailable = true;
                this.showUpdatePrompt();
            }
        });
    }
    
    /**
     * 設置安裝提示
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        // 監聽安裝完成
        window.addEventListener('appinstalled', () => {
            if (logger) {
                logger.info('PWA installed successfully');
            }
            this.isInstalled = true;
            this.hideInstallPrompt();
            this.showInstallSuccessMessage();
        });
    }
    
    /**
     * 顯示安裝提示
     */
    showInstallPrompt() {
        if (this.isInstalled) return;
        
        const installBanner = this.createInstallBanner();
        document.body.appendChild(installBanner);
        
        // 3秒後顯示
        setTimeout(() => {
            installBanner.classList.add('show');
        }, 3000);
    }
    
    /**
     * 創建安裝橫幅
     */
    createInstallBanner() {
        const banner = SafeDOM.createStructure({
            tag: 'div',
            attributes: { class: 'pwa-install-banner' },
            children: [{
                tag: 'div',
                attributes: { class: 'install-content' },
                children: [
                    {
                        tag: 'div',
                        attributes: { class: 'install-icon' },
                        textContent: '📱'
                    },
                    {
                        tag: 'div',
                        attributes: { class: 'install-text' },
                        children: [
                            {
                                tag: 'h3',
                                textContent: '安裝 Bingo 遊戲'
                            },
                            {
                                tag: 'p',
                                textContent: '安裝到主屏幕，隨時隨地暢玩'
                            }
                        ]
                    },
                    {
                        tag: 'div',
                        attributes: { class: 'install-actions' },
                        children: [
                            {
                                tag: 'button',
                                attributes: { 
                                    class: 'install-btn',
                                    id: 'pwa-install-btn'
                                },
                                textContent: '安裝'
                            },
                            {
                                tag: 'button',
                                attributes: { 
                                    class: 'dismiss-btn',
                                    id: 'pwa-dismiss-btn'
                                },
                                textContent: '×'
                            }
                        ]
                    }
                ]
            }]
        });
        
        // 綁定事件
        banner.querySelector('#pwa-install-btn').addEventListener('click', () => {
            this.installPWA();
        });
        
        banner.querySelector('#pwa-dismiss-btn').addEventListener('click', () => {
            this.hideInstallPrompt();
        });
        
        return banner;
    }
    
    /**
     * 安裝 PWA
     */
    async installPWA() {
        if (!this.deferredPrompt) return;
        
        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                if (logger) {
                    logger.info('User accepted the install prompt');
                }
            } else {
                if (logger) {
                    logger.info('User dismissed the install prompt');
                }
            }
            
            this.deferredPrompt = null;
            this.hideInstallPrompt();
            
        } catch (error) {
            if (logger) {
                logger.error('Failed to install PWA:', error);
            }
        }
    }
    
    /**
     * 隱藏安裝提示
     */
    hideInstallPrompt() {
        const banner = document.querySelector('.pwa-install-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 300);
        }
    }
    
    /**
     * 顯示安裝成功消息
     */
    showInstallSuccessMessage() {
        const message = SafeDOM.createStructure({
            tag: 'div',
            attributes: { class: 'pwa-success-message' },
            children: [{
                tag: 'div',
                attributes: { class: 'success-content' },
                children: [
                    {
                        tag: 'div',
                        attributes: { class: 'success-icon' },
                        textContent: '✅'
                    },
                    {
                        tag: 'div',
                        attributes: { class: 'success-text' },
                        children: [
                            {
                                tag: 'h3',
                                textContent: '安裝成功！'
                            },
                            {
                                tag: 'p',
                                textContent: 'Bingo 遊戲已添加到主屏幕'
                            }
                        ]
                    }
                ]
            }]
        });
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * 設置更新檢查
     */
    setupUpdateCheck() {
        // 每30分鐘檢查一次更新
        setInterval(() => {
            this.checkForUpdates();
        }, 30 * 60 * 1000);
        
        // 頁面可見時檢查更新
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForUpdates();
            }
        });
    }
    
    /**
     * 檢查更新
     */
    async checkForUpdates() {
        if (!this.registration) return;
        
        try {
            await this.registration.update();
        } catch (error) {
            if (logger) {
                logger.error('Failed to check for updates:', error);
            }
        }
    }
    
    /**
     * 顯示更新提示
     */
    showUpdatePrompt() {
        const updateBanner = SafeDOM.createStructure({
            tag: 'div',
            attributes: { class: 'pwa-update-banner' },
            children: [{
                tag: 'div',
                attributes: { class: 'update-content' },
                children: [
                    {
                        tag: 'div',
                        attributes: { class: 'update-icon' },
                        textContent: '🔄'
                    },
                    {
                        tag: 'div',
                        attributes: { class: 'update-text' },
                        children: [
                            {
                                tag: 'h3',
                                textContent: '新版本可用'
                            },
                            {
                                tag: 'p',
                                textContent: '點擊更新以獲得最新功能'
                            }
                        ]
                    },
                    {
                        tag: 'div',
                        attributes: { class: 'update-actions' },
                        children: [
                            {
                                tag: 'button',
                                attributes: { 
                                    class: 'update-btn',
                                    id: 'pwa-update-btn'
                                },
                                textContent: '更新'
                            },
                            {
                                tag: 'button',
                                attributes: { 
                                    class: 'dismiss-btn',
                                    id: 'pwa-update-dismiss-btn'
                                },
                                textContent: '稍後'
                            }
                        ]
                    }
                ]
            }]
        });
        
        document.body.appendChild(updateBanner);
        
        setTimeout(() => {
            updateBanner.classList.add('show');
        }, 100);
        
        // 綁定事件
        updateBanner.querySelector('#pwa-update-btn').addEventListener('click', () => {
            this.applyUpdate();
        });
        
        updateBanner.querySelector('#pwa-update-dismiss-btn').addEventListener('click', () => {
            updateBanner.classList.remove('show');
            setTimeout(() => {
                if (updateBanner.parentNode) {
                    updateBanner.parentNode.removeChild(updateBanner);
                }
            }, 300);
        });
    }
    
    /**
     * 應用更新
     */
    applyUpdate() {
        if (!this.registration || !this.registration.waiting) return;
        
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // 監聽控制權變更
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
    
    /**
     * 設置離線檢測
     */
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.showConnectionStatus('online');
        });
        
        window.addEventListener('offline', () => {
            this.showConnectionStatus('offline');
        });
        
        // 初始狀態檢查
        if (!navigator.onLine) {
            this.showConnectionStatus('offline');
        }
    }
    
    /**
     * 顯示連接狀態
     */
    showConnectionStatus(status) {
        const statusBanner = document.createElement('div');
        statusBanner.className = `connection-status ${status}`;
        
        if (status === 'offline') {
            SafeDOM.replaceContent(statusBanner, {
                tag: 'div',
                attributes: { class: 'status-content' },
                children: [
                    {
                        tag: 'span',
                        attributes: { class: 'status-icon' },
                        textContent: '📡'
                    },
                    {
                        tag: 'span',
                        attributes: { class: 'status-text' },
                        textContent: '離線模式 - 部分功能可能受限'
                    }
                ]
            });
        } else {
            SafeDOM.replaceContent(statusBanner, {
                tag: 'div',
                attributes: { class: 'status-content' },
                children: [
                    {
                        tag: 'span',
                        attributes: { class: 'status-icon' },
                        textContent: '✅'
                    },
                    {
                        tag: 'span',
                        attributes: { class: 'status-text' },
                        textContent: '已重新連接'
                    }
                ]
            });
        }
        
        document.body.appendChild(statusBanner);
        
        setTimeout(() => {
            statusBanner.classList.add('show');
        }, 100);
        
        // 在線狀態3秒後自動隱藏
        if (status === 'online') {
            setTimeout(() => {
                statusBanner.classList.remove('show');
                setTimeout(() => {
                    if (statusBanner.parentNode) {
                        statusBanner.parentNode.removeChild(statusBanner);
                    }
                }, 300);
            }, 3000);
        }
    }
    
    /**
     * 創建安裝按鈕
     */
    createInstallButton() {
        if (this.isInstalled) return;
        
        const installBtn = document.createElement('button');
        installBtn.className = 'floating-install-btn';
        installBtn.textContent = '📱 安裝應用';
        installBtn.style.display = 'none';
        
        installBtn.addEventListener('click', () => {
            this.installPWA();
        });
        
        document.body.appendChild(installBtn);
        
        // 如果有安裝提示，顯示浮動按鈕
        if (this.deferredPrompt) {
            setTimeout(() => {
                installBtn.style.display = 'block';
            }, 10000); // 10秒後顯示
        }
    }
    
    /**
     * 獲取安裝狀態
     */
    getInstallStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.deferredPrompt,
            isUpdateAvailable: this.isUpdateAvailable
        };
    }
}

// 初始化 PWA 管理器
let pwaManager = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new PWAManager();
});

// 導出供其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}