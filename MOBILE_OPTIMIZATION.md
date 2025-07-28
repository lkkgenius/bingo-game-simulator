# 移動設備優化功能

本文檔描述了 Bingo 遊戲模擬器的移動設備優化功能實現。

## 功能概述

### 1. 觸控操作優化 ✅

- **觸控設備檢測**: 自動檢測觸控設備並啟用相應優化
- **觸控目標優化**: 確保所有可點擊元素至少 44x44px (WCAG 標準)
- **觸控反饋**: 提供視覺和觸覺反饋
- **防止意外縮放**: 防止雙擊縮放和輸入框縮放
- **觸控事件優化**: 優化觸控事件處理，減少延遲

### 2. 手勢支持 ✅

- **滑動手勢**: 
  - 左右滑動切換算法
  - 上滑顯示統計信息
  - 下滑隱藏額外信息
- **縮放手勢**: 支持雙指縮放遊戲板 (0.8x - 2.0x)
- **長按手勢**: 長按格子顯示詳細信息
- **手勢反饋**: 顯示手勢操作提示

### 3. 移動設備性能優化 ✅

- **硬件加速**: 啟用 GPU 加速動畫
- **內存監控**: 監控內存使用，自動優化
- **幀率監控**: 監控 FPS，低於 30fps 時減少動畫
- **事件節流**: 觸控事件節流，提高性能
- **資源預加載**: 預加載關鍵資源

### 4. PWA (Progressive Web App) 功能 ✅

- **Web App Manifest**: 支持安裝到主屏幕
- **Service Worker**: 離線緩存和後台同步
- **安裝提示**: 智能安裝提示橫幅
- **更新檢查**: 自動檢查和提示更新
- **離線支持**: 離線時仍可正常遊戲

### 5. 離線緩存策略 ✅

- **靜態資源**: 緩存優先策略 (HTML, CSS, JS)
- **動態內容**: 網絡優先策略 (API 數據)
- **圖片資源**: 陳舊內容重新驗證策略
- **緩存清理**: 自動清理過期緩存

## 文件結構

```
├── mobile-touch.js              # 觸控操作優化
├── gesture-support.js           # 手勢支持
├── pwa-manager.js              # PWA 管理
├── sw.js                       # Service Worker
├── manifest.json               # Web App Manifest
├── browserconfig.xml           # Windows 磁貼配置
├── generate-icons.js           # 圖標生成工具
├── mobile-performance.test.js  # 移動性能測試
└── MOBILE_OPTIMIZATION.md      # 本文檔
```

## 使用方法

### 基本使用

移動設備優化功能會自動啟用，無需額外配置。當檢測到觸控設備時，會自動：

1. 啟用觸控優化樣式
2. 增大觸控目標
3. 啟用手勢支持
4. 優化性能設置

### 手勢操作

- **切換算法**: 左右滑動
- **顯示統計**: 向上滑動
- **隱藏信息**: 向下滑動
- **縮放遊戲板**: 雙指縮放
- **查看格子信息**: 長按格子

### PWA 安裝

1. 在支持的瀏覽器中打開應用
2. 等待安裝提示橫幅出現
3. 點擊「安裝」按鈕
4. 應用將添加到主屏幕

### 離線使用

1. 首次訪問時會自動緩存資源
2. 離線時仍可正常遊戲
3. 重新連接時會同步數據

## 技術實現

### 觸控檢測

```javascript
const isTouch = 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
```

### 手勢識別

```javascript
const deltaX = touchEndPos.x - touchStartPos.x;
const deltaY = touchEndPos.y - touchStartPos.y;
const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
```

### 性能監控

```javascript
// 內存監控
const memoryUsage = (performance.memory.usedJSHeapSize / 
                    performance.memory.totalJSHeapSize) * 100;

// FPS 監控
const measureFPS = (currentTime) => {
    frameCount++;
    if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    }
};
```

### Service Worker 緩存策略

```javascript
// 緩存優先
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetch(request);
}

// 網絡優先
async function networkFirst(request) {
    try {
        return await fetch(request);
    } catch {
        return await caches.match(request);
    }
}
```

## 性能指標

### 觸控響應時間
- 目標: < 100ms
- 實現: 觸控事件防抖和節流

### 手勢識別準確率
- 目標: > 95%
- 實現: 多點觸控和角度計算

### 內存使用
- 警告閾值: 80%
- 優化閾值: 95%

### 幀率
- 目標: 60 FPS
- 最低: 30 FPS

## 瀏覽器支持

### 完全支持
- Chrome 67+ (Android/iOS)
- Safari 11.1+ (iOS)
- Firefox 67+ (Android)
- Edge 79+ (Android)

### 部分支持
- Samsung Internet 8.2+
- UC Browser 12.12+

### 功能檢測
所有功能都有適當的功能檢測，不支持的瀏覽器會優雅降級。

## 測試

運行移動設備優化測試：

```bash
node mobile-performance.test.js
```

測試覆蓋：
- 觸控設備檢測
- 觸控目標優化
- 手勢識別
- 性能監控
- PWA 功能
- 緩存策略

## 部署注意事項

### 1. HTTPS 要求
PWA 功能需要 HTTPS 環境（localhost 除外）

### 2. 圖標文件
需要創建 `icons/` 目錄並添加各種尺寸的圖標文件

### 3. Service Worker 更新
更新 Service Worker 時需要修改 `CACHE_NAME` 版本號

### 4. 性能監控
生產環境建議啟用性能監控和錯誤報告

## 故障排除

### 常見問題

1. **PWA 安裝提示不出現**
   - 檢查 HTTPS 環境
   - 確認 manifest.json 正確
   - 檢查 Service Worker 註冊

2. **觸控操作不響應**
   - 檢查觸控事件綁定
   - 確認 CSS 觸控樣式
   - 檢查事件冒泡

3. **手勢識別不準確**
   - 調整閾值參數
   - 檢查觸控點計算
   - 確認事件順序

4. **性能問題**
   - 檢查內存洩漏
   - 優化動畫性能
   - 減少 DOM 操作

### 調試工具

- Chrome DevTools > Application > Service Workers
- Chrome DevTools > Application > Manifest
- Chrome DevTools > Performance
- Chrome DevTools > Memory

## 未來改進

- [ ] 添加更多手勢支持
- [ ] 改進性能監控
- [ ] 支持更多 PWA 功能
- [ ] 添加推送通知
- [ ] 改進離線體驗