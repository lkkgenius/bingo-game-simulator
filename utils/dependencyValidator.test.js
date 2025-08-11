/**
 * Dependency Validator Tests
 * 測試依賴檢查和驗證系統的功能
 */

// 模擬瀏覽器環境
global.window = {
  performance: {
    now: () => Date.now()
  },
  document: {
    createElement: () => ({
      style: {},
      innerHTML: '',
      appendChild: () => {},
      remove: () => {}
    }),
    body: {
      appendChild: () => {}
    }
  }
};

// 載入依賴驗證器
const { DependencyValidator, dependencyValidator } = require('./dependencyValidator.js');

describe('DependencyValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new DependencyValidator();
    // 清理全局環境
    if (global.window) {
      delete global.window.CONSTANTS;
      delete global.window.Utils;
      delete global.window.LineDetector;
      delete global.window.ProbabilityCalculator;
      delete global.window.GameBoard;
      delete global.window.GameEngine;
    }
  });

  describe('依賴定義設置', () => {
    test('應該正確設置依賴圖', () => {
      expect(validator.dependencyGraph.size).toBeGreaterThan(0);
      expect(validator.dependencyGraph.has('CONSTANTS')).toBe(true);
      expect(validator.dependencyGraph.has('Utils')).toBe(true);
      expect(validator.dependencyGraph.has('LineDetector')).toBe(true);
    });

    test('應該正確標記關鍵依賴', () => {
      expect(validator.criticalDependencies.has('CONSTANTS')).toBe(true);
      expect(validator.criticalDependencies.has('Utils')).toBe(true);
      expect(validator.criticalDependencies.has('GameEngine')).toBe(true);
    });

    test('應該設置回退實現', () => {
      expect(validator.fallbackImplementations.has('CONSTANTS')).toBe(true);
      expect(validator.fallbackImplementations.has('Utils')).toBe(true);
      expect(validator.fallbackImplementations.has('LineDetector')).toBe(true);
    });
  });

  describe('單個依賴驗證', () => {
    test('應該檢測缺失的依賴', async () => {
      const constantsInfo = validator.dependencyGraph.get('CONSTANTS');
      const result = await validator._validateSingleDependency('CONSTANTS', constantsInfo);

      expect(result.available).toBe(false);
      expect(result.error).toContain('未找到');
    });

    test('應該驗證可用的依賴', async () => {
      // 模擬可用的 CONSTANTS
      global.window.CONSTANTS = {
        BOARD_SIZE: 5,
        MAX_ROUNDS: 8,
        CELL_STATES: { EMPTY: 0, PLAYER: 1, COMPUTER: 2 }
      };

      const constantsInfo = validator.dependencyGraph.get('CONSTANTS');
      const result = await validator._validateSingleDependency('CONSTANTS', constantsInfo);

      expect(result.available).toBe(true);
      expect(result.error).toBeNull();
    });

    test('應該檢查預期屬性', async () => {
      // 模擬不完整的 CONSTANTS
      global.window.CONSTANTS = {
        BOARD_SIZE: 5
        // 缺少其他屬性
      };

      const constantsInfo = validator.dependencyGraph.get('CONSTANTS');
      const result = await validator._validateSingleDependency('CONSTANTS', constantsInfo);

      expect(result.available).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.properties.BOARD_SIZE.available).toBe(true);
      expect(result.properties.MAX_ROUNDS.available).toBe(false);
    });

    test('應該檢查類的方法', async () => {
      // 模擬 LineDetector 類
      global.window.LineDetector = class {
        checkHorizontalLines() {}
        // 缺少其他方法
      };

      const lineDetectorInfo = validator.dependencyGraph.get('LineDetector');
      const result = await validator._validateSingleDependency('LineDetector', lineDetectorInfo);

      expect(result.available).toBe(true);
      expect(result.methods.checkHorizontalLines.available).toBe(true);
      expect(result.methods.checkVerticalLines.available).toBe(false);
    });
  });

  describe('自動修復功能', () => {
    test('應該能夠修復缺失的 CONSTANTS', async () => {
      const constantsInfo = validator.dependencyGraph.get('CONSTANTS');
      const repairResult = await validator._attemptAutoRepair('CONSTANTS', constantsInfo);

      expect(repairResult.success).toBe(true);
      expect(repairResult.method).toBe('fallback_injection');
      expect(global.window.CONSTANTS).toBeDefined();
      expect(global.window.CONSTANTS.BOARD_SIZE).toBe(5);
    });

    test('應該能夠修復缺失的 Utils', async () => {
      const utilsInfo = validator.dependencyGraph.get('Utils');
      const repairResult = await validator._attemptAutoRepair('Utils', utilsInfo);

      expect(repairResult.success).toBe(true);
      expect(global.window.Utils).toBeDefined();
      expect(typeof global.window.Utils.isValidPosition).toBe('function');
    });

    test('應該能夠修復缺失的 LineDetector', async () => {
      const lineDetectorInfo = validator.dependencyGraph.get('LineDetector');
      const repairResult = await validator._attemptAutoRepair('LineDetector', lineDetectorInfo);

      expect(repairResult.success).toBe(true);
      expect(global.window.LineDetector).toBeDefined();

      // 測試回退實現的功能
      const instance = new global.window.LineDetector();
      expect(typeof instance.checkHorizontalLines).toBe('function');
      expect(typeof instance.getAllLines).toBe('function');
    });

    test('回退的 ProbabilityCalculator 應該能正常工作', async () => {
      // 先修復依賴
      await validator._attemptAutoRepair('CONSTANTS', validator.dependencyGraph.get('CONSTANTS'));
      await validator._attemptAutoRepair('Utils', validator.dependencyGraph.get('Utils'));
      await validator._attemptAutoRepair('BaseProbabilityCalculator', validator.dependencyGraph.get('BaseProbabilityCalculator'));
      await validator._attemptAutoRepair('ProbabilityCalculator', validator.dependencyGraph.get('ProbabilityCalculator'));

      expect(global.window.ProbabilityCalculator).toBeDefined();

      const calculator = new global.window.ProbabilityCalculator();
      const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));

      // 測試基本功能
      const value = calculator.calculateMoveValue(emptyBoard, 2, 2);
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);

      const suggestion = calculator.getBestSuggestion(emptyBoard);
      expect(suggestion).toBeDefined();
      expect(suggestion.row).toBeDefined();
      expect(suggestion.col).toBeDefined();
    });
  });

  describe('完整依賴驗證', () => {
    test('應該執行完整的依賴驗證', async () => {
      const results = await validator.validateAllDependencies();

      expect(results.timestamp).toBeDefined();
      expect(results.overall).toBeDefined();
      expect(results.dependencies.size).toBeGreaterThan(0);
      expect(results.performance).toBeDefined();
    });

    test('應該在驗證失敗時嘗試自動修復', async () => {
      validator.setAutoRepair(true);

      const results = await validator.validateAllDependencies();

      // 應該有修復記錄
      expect(results.repairs.length).toBeGreaterThan(0);

      // 關鍵依賴應該被修復
      const constantsResult = results.dependencies.get('CONSTANTS');
      expect(constantsResult.available || constantsResult.repaired).toBe(true);
    });

    test('應該生成適當的建議', async () => {
      const results = await validator.validateAllDependencies();

      expect(Array.isArray(results.recommendations)).toBe(true);

      // 如果有關鍵依賴問題，應該有相應建議
      const criticalIssues = results.issues.filter(issue => issue.severity === 'critical');
      if (criticalIssues.length > 0) {
        const criticalRecommendations = results.recommendations.filter(rec => rec.type === 'critical');
        expect(criticalRecommendations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('健康檢查報告', () => {
    test('應該生成健康檢查報告', async () => {
      // 先執行驗證
      await validator.validateAllDependencies();

      const report = validator.generateHealthReport();

      expect(report.timestamp).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalDependencies).toBeGreaterThan(0);
      expect(report.summary.healthScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.healthScore).toBeLessThanOrEqual(100);
      expect(report.details).toBeDefined();
    });

    test('健康分數應該反映依賴狀況', async () => {
      // 模擬所有關鍵依賴都可用
      global.window.CONSTANTS = validator.fallbackImplementations.get('CONSTANTS')();
      global.window.Utils = validator.fallbackImplementations.get('Utils')();
      global.window.LineDetector = validator.fallbackImplementations.get('LineDetector')();
      global.window.ProbabilityCalculator = validator.fallbackImplementations.get('ProbabilityCalculator')();

      await validator.validateAllDependencies();
      const report = validator.generateHealthReport();

      expect(report.summary.healthScore).toBeGreaterThan(50);
    });
  });

  describe('運行時檢查', () => {
    test('應該執行運行時依賴檢查', async () => {
      const result = await validator.performRuntimeCheck();

      // 結果應該是布爾值
      expect(typeof result).toBe('boolean');
    });

    test('關鍵依賴缺失時應該返回 false', async () => {
      validator.setAutoRepair(false);

      const result = await validator.performRuntimeCheck();

      // 由於沒有設置依賴且禁用自動修復，應該失敗
      expect(result).toBe(false);
    });

    test('自動修復啟用時應該嘗試修復', async () => {
      validator.setAutoRepair(true);

      const result = await validator.performRuntimeCheck();

      // 自動修復應該能解決大部分問題
      expect(result).toBe(true);
    });
  });

  describe('工具方法', () => {
    test('應該正確解析依賴位置', () => {
      global.window.testObject = { nested: { value: 42 } };

      const result = validator._resolveDependency('window.testObject.nested.value');
      expect(result).toBe(42);

      const nullResult = validator._resolveDependency('window.nonexistent');
      expect(nullResult).toBeNull();
    });

    test('應該計算正確的驗證順序', () => {
      const order = validator._calculateValidationOrder();

      expect(Array.isArray(order)).toBe(true);
      expect(order.length).toBeGreaterThan(0);

      // CONSTANTS 應該在依賴它的項目之前
      const constantsIndex = order.indexOf('CONSTANTS');
      const lineDetectorIndex = order.indexOf('LineDetector');

      expect(constantsIndex).toBeLessThan(lineDetectorIndex);
    });

    test('應該提供依賴項目信息', async () => {
      await validator.validateAllDependencies();

      const info = validator.getDependencyInfo('CONSTANTS');

      expect(info.definition).toBeDefined();
      expect(info.validation).toBeDefined();
      expect(typeof info.available).toBe('boolean');
      expect(typeof info.critical).toBe('boolean');
    });
  });

  describe('回退實現功能測試', () => {
    test('回退的 LineDetector 應該能檢測連線', async () => {
      await validator._attemptAutoRepair('LineDetector', validator.dependencyGraph.get('LineDetector'));

      const LineDetector = global.window.LineDetector;
      const detector = new LineDetector();

      // 測試水平線檢測
      const boardWithHorizontalLine = [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
      ];

      const horizontalLines = detector.checkHorizontalLines(boardWithHorizontalLine);
      expect(horizontalLines.length).toBe(1);
      expect(horizontalLines[0].type).toBe('horizontal');
      expect(horizontalLines[0].row).toBe(0);
    });

    test('回退的 Utils 函數應該正常工作', async () => {
      await validator._attemptAutoRepair('Utils', validator.dependencyGraph.get('Utils'));

      const Utils = global.window.Utils;

      // 測試位置驗證
      expect(Utils.isValidPosition(2, 2, 5)).toBe(true);
      expect(Utils.isValidPosition(-1, 2, 5)).toBe(false);
      expect(Utils.isValidPosition(5, 2, 5)).toBe(false);

      // 測試格子檢查
      const board = [[0, 1], [2, 0]];
      expect(Utils.isCellEmpty(board, 0, 0)).toBe(true);
      expect(Utils.isCellEmpty(board, 0, 1)).toBe(false);

      // 測試中心位置
      expect(Utils.isCenterPosition(2, 2, 5)).toBe(true);
      expect(Utils.isCenterPosition(0, 0, 5)).toBe(false);
    });
  });
});

// 輔助函數
function beforeEach(fn) {
  // 簡單的 beforeEach 實現
  if (typeof global.beforeEachFn === 'undefined') {
    global.beforeEachFn = [];
  }
  global.beforeEachFn.push(fn);
}

function describe(name, fn) {
  console.log(`\n=== ${name} ===`);

  // 執行 beforeEach
  if (global.beforeEachFn) {
    global.beforeEachFn.forEach(beforeEachFn => beforeEachFn());
  }

  fn();
}

function test(name, fn) {
  try {
    // 執行 beforeEach
    if (global.beforeEachFn) {
      global.beforeEachFn.forEach(beforeEachFn => beforeEachFn());
    }

    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toEqual: (expected) => {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr}, but got ${actualStr}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error('Expected value to be defined, but got undefined');
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`Expected null, but got ${actual}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThanOrEqual: (expected) => {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toContain: (expected) => {
      if (typeof actual === 'string' && !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
      if (Array.isArray(actual) && !actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    }
  };
}

// 如果直接運行此文件，執行測試
if (require.main === module) {
  console.log('執行依賴驗證器測試...');

  // 這裡會自動執行所有測試
  console.log('\n測試完成！');
}
