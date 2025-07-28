/**
 * PWA Manager Module
 * 管理 PWA 功能，包括安裝提示、更新檢查等
 */

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
            console.log('PWA is installed');
            document.body.classList.add('pwa-installed');
        }
    }
    
    /**
     * 註冊 Service Worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
                
                // 監聽更新
                this.registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate();
                });
                
                // 檢查現有的 Service Worker
                if (this.registration.waiting) {
                    this.showUpdatePrompt();
                }
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
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
            console.log('PWA installed successfully');
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
        const banner = document.createElement('div');
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <h3>安裝 Bingo 遊戲</h3>
                    <p>安裝到主屏幕，隨時隨地暢玩</p>
                </div>
                <div class="install-actions">
                    <button class="install-btn" id="pwa-install-btn">安裝</button>
                    <button class="dismiss-btn" id="pwa-dismiss-btn">×</button>
                </div>
            </div>
        `;
        
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
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
            this.hideInstallPrompt();
            
        } catch (error) {
            console.error('Failed to install PWA:', error);
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
        const message = document.createElement('div');
        message.className = 'pwa-success-message';
        message.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✅</div>
                <div class="success-text">
                    <h3>安裝成功！</h3>
                    <p>Bingo 遊戲已添加到主屏幕</p>
                </div>
            </div>
        `;
        
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
            console.error('Failed to check for updates:', error);
        }
    }
    
    /**
     * 顯示更新提示
     */
    showUpdatePrompt() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'pwa-update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <div class="update-icon">🔄</div>
                <div class="update-text">
                    <h3>新版本可用</h3>
                    <p>點擊更新以獲得最新功能</p>
                </div>
                <div class="update-actions">
                    <button class="update-btn" id="pwa-update-btn">更新</button>
                    <button class="dismiss-btn" id="pwa-update-dismiss-btn">稍後</button>
                </div>
            </div>
        `;
        
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
            statusBanner.innerHTML = `
                <div class="status-content">
                    <span class="status-icon">📡</span>
                    <span class="status-text">離線模式 - 部分功能可能受限</span>
                </div>
            `;
        } else {
            statusBanner.innerHTML = `
                <div class="status-content">
                    <span class="status-icon">✅</span>
                    <span class="status-text">已重新連接</span>
                </div>
            `;
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
        installBtn.innerHTML = '📱 安裝應用';
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