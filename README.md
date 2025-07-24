# Bingo 遊戲模擬器

一個基於網頁的 Bingo 遊戲模擬器，讓玩家與電腦進行 8 輪翻牌遊戲，目標是完成最多的連線（水平、垂直或對角線）。

## 🎮 遊戲特色

- **合作模式**: 玩家與電腦合作完成連線，而非對抗
- **智能建議**: 系統會分析並建議最佳的翻牌選擇
- **雙演算法**: 提供標準和增強兩種演算法選擇
- **即時反饋**: 實時顯示遊戲狀態和連線情況
- **響應式設計**: 支援各種螢幕尺寸和設備

## 🚀 線上體驗

[點擊這裡開始遊戲](https://your-username.github.io/bingo-game-simulator)

> **注意**: 遊戲已部署到 GitHub Pages，請將上方連結中的 "your-username" 替換為您的 GitHub 用戶名。

## 📋 遊戲規則

1. **遊戲目標**: 在 8 輪遊戲中，玩家和電腦合作完成最多的連線
2. **遊戲流程**: 
   - 每輪玩家先選擇一個格子
   - 然後電腦選擇一個格子（可手動輸入或隨機選擇）
   - 重複 8 輪後遊戲結束
3. **連線規則**: 水平、垂直或對角線上的 5 個格子都被填滿即為完成連線
4. **建議系統**: 遊戲會根據當前局面建議最佳的移動位置

## 🛠️ 技術特色

### 前端技術
- **HTML5**: 語義化標記和現代網頁標準
- **CSS3**: 響應式設計、動畫效果和現代佈局
- **Vanilla JavaScript**: 純 JavaScript 實現，無外部依賴

### 核心算法
- **連線檢測**: 高效的線性算法檢測所有可能的連線
- **機率計算**: 智能分析每個位置的價值和潛力
- **合作優化**: 專門針對合作模式優化的建議算法

### 性能優化
- **漸進式載入**: 組件按需載入，提升初始載入速度
- **防抖節流**: 防止重複點擊和過度計算
- **性能監控**: 內建性能監控和優化機制

## 📁 專案結構

```
/
├── index.html                    # 主頁面
├── styles.css                    # 樣式檔案
├── script.js                     # 主要遊戲邏輯
├── gameBoard.js                  # 遊戲板組件
├── gameEngine.js                 # 遊戲引擎
├── lineDetector.js               # 連線檢測算法
├── probabilityCalculator.js      # 標準機率計算器
├── probabilityCalculator.enhanced.js # 增強機率計算器
├── loading-functions.js          # 載入功能
├── performance-monitor.js        # 性能監控
└── README.md                     # 專案說明
```

## 🎯 演算法說明

### 標準演算法
- 基本的機率計算和連線檢測
- 平衡考慮各種移動因素
- 適合一般遊戲體驗

### 增強演算法
- 專注於最大化完成三條連線的機會
- 交叉點優先策略
- 接近完成的線優先處理
- 戰略位置評估

## 🚀 本地運行

1. **克隆專案**
   ```bash
   git clone https://github.com/your-username/bingo-game-simulator.git
   cd bingo-game-simulator
   ```

2. **啟動本地服務器**
   ```bash
   # 使用 Python 3
   python -m http.server 8000
   
   # 或使用 Python 2
   python -m SimpleHTTPServer 8000
   
   # 或使用 Node.js
   npx http-server
   ```

3. **開啟瀏覽器**
   訪問 `http://localhost:8000`

## 🌐 GitHub Pages 部署

本專案已配置為可直接部署到 GitHub Pages：

1. Fork 或克隆此專案到你的 GitHub 帳戶
2. 在 Repository Settings 中啟用 GitHub Pages
3. 選擇 "Deploy from a branch" 並選擇 "main" 分支
4. 等待部署完成，即可通過 `https://your-username.github.io/repository-name` 訪問

## 🎮 使用指南

### 基本操作
1. 點擊「開始遊戲」按鈕開始新遊戲
2. 根據建議或自己的判斷點擊格子進行移動
3. 電腦回合時可以：
   - 直接點擊棋盤上的空格子
   - 使用「電腦隨機下棋」按鈕
   - 勾選「電腦自動隨機下棋」讓電腦自動移動

### 演算法切換
- 在遊戲開始前可以選擇使用標準或增強演算法
- 切換演算法會重新開始遊戲
- 不同演算法會提供不同的移動建議

### 遊戲分析
- 遊戲結束後會顯示詳細的統計資訊
- 包括完成的連線數量和類型
- 提供合作效果評估

## 🧪 測試

專案包含完整的測試套件：

```bash
# 運行所有測試
node testRunner.js

# 運行特定測試
node lineDetector.test.js
node probabilityCalculator.test.js
node gameEngine.test.js
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- 感謝所有測試和提供反饋的用戶
- 靈感來源於經典的 Bingo 遊戲
- 使用了現代網頁開發的最佳實踐

## 📞 聯絡

如有問題或建議，請通過以下方式聯絡：

- 提交 GitHub Issue
- 發送 Pull Request
- 在 Discussions 中討論

---

**享受遊戲！** 🎉