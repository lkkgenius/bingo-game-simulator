# 測試指南

## 測試執行方式

專案中的測試可以通過以下命令執行：

```bash
# 運行所有測試
node testRunner.js

# 運行單個測試文件
node lineDetector.test.js
node probabilityCalculator.test.js
node gameEngine.test.js
node gameBoard.test.js
node gameFlow.test.js
node algorithmComparison.test.js
node e2e.test.js

# 運行所有測試（推薦）
node testRunner.js
```

## 測試文件結構

專案包含以下測試文件：

### 單元測試

- `lineDetector.test.js` - 測試連線檢測功能
- `probabilityCalculator.test.js` - 測試標準機率計算器功能
- `probabilityCalculator.enhanced.test.js` - 測試增強版機率計算器功能
- `gameEngine.test.js` - 測試遊戲引擎功能
- `gameBoard.test.js` - 測試遊戲板UI組件功能

### 整合測試

- `gameFlow.test.js` - 測試遊戲流程和組件間互動
- `algorithmComparison.test.js` - 測試標準和增強版算法的比較

### 端到端測試

- `e2e.test.js` - 模擬完整的用戶交互流程

## 測試運行器

`testRunner.js` 是一個統一的測試運行器，它可以：

1. 自動發現並執行所有測試文件（`*.test.js` 或 `test-*.js`）
2. 提供測試結果摘要
3. 生成簡單的測試覆蓋率報告

## 測試結果解讀

測試成功時，會顯示所有測試項目及其結果，最後顯示測試結果摘要：

```
=== Test Results ===
Total tests: XX
Passed: XX
Failed: XX
```

如果測試失敗，會顯示具體的錯誤信息和失敗的測試項目。

## 測試覆蓋率報告

測試運行器會生成一個簡單的測試覆蓋率報告，顯示哪些組件有對應的測試文件：

```
=== Test Coverage Report ===
✓ lineDetector.js: Test file exists
✓ probabilityCalculator.js: Test file exists
✓ probabilityCalculator.enhanced.js: Test file exists
✓ gameEngine.js: Test file exists
✓ gameBoard.js: Test file exists
```

## 添加新測試

添加新測試時，請遵循以下步驟：

1. 創建新的測試文件，命名為 `[component-name].test.js`
2. 在測試文件中引入被測試的組件
3. 使用 `describe` 和 `test` 函數編寫測試用例
4. 使用 `expect` 函數進行斷言

測試文件的基本結構：

```javascript
const ComponentToTest = require('./componentToTest.js');

describe('ComponentToTest', () => {
  let component;

  // 在每個測試前初始化
  beforeEach = () => {
    component = new ComponentToTest();
  };

  // 初始化
  beforeEach();

  test('should do something', () => {
    const result = component.doSomething();
    expect(result).toBeTruthy();
  });

  test('should handle edge case', () => {
    const result = component.handleEdgeCase();
    expect(result).toBe(expectedValue);
  });
});
```

## 持續集成

未來我們計劃將測試集成到 CI/CD 流程中，在每次提交代碼時自動運行所有測試。步驟如下：

1. 在 GitHub Actions 中設置測試工作流
2. 配置工作流在每次推送和拉取請求時運行測試
3. 設置測試結果報告和通知

## 測試最佳實踐

1. **測試隔離**: 每個測試應該獨立運行，不依賴其他測試的結果
2. **測試覆蓋**: 確保測試覆蓋所有關鍵功能和邊緣情況
3. **測試可讀性**: 使用描述性的測試名稱和清晰的斷言
4. **測試維護**: 隨著代碼變化更新測試
5. **測試效率**: 避免不必要的重複測試，專注於關鍵功能
