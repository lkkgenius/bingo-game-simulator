/**
 * 簡單的測試運行器來驗證LineDetector功能
 */

const LineDetector = require('./lineDetector.js');

// 簡單的測試框架
class SimpleTest {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
      },
      toHaveLength: (expected) => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${expected}, but got ${actual.length}`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${expected}`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      }
    };
  }

  run() {
    console.log('🧪 開始運行LineDetector測試...\n');

    for (const test of this.tests) {
      try {
        test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   錯誤: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 測試結果: ${this.passed} 通過, ${this.failed} 失敗`);
    
    if (this.failed === 0) {
      console.log('🎉 所有測試都通過了！');
    }
  }
}

// 創建測試實例
const test = new SimpleTest();
const lineDetector = new LineDetector();

// 水平線檢測測試
test.test('檢測完整的水平線', () => {
  const board = [
    [1, 1, 1, 1, 1], // 完整水平線
    [0, 2, 0, 1, 0],
    [2, 0, 1, 0, 2],
    [0, 1, 0, 2, 0],
    [1, 0, 2, 0, 1]
  ];

  const lines = lineDetector.checkHorizontalLines(board);
  
  test.expect(lines).toHaveLength(1);
  test.expect(lines[0].type).toBe('horizontal');
  test.expect(lines[0].row).toBe(0);
});

test.test('檢測多條水平線', () => {
  const board = [
    [1, 1, 1, 1, 1], // 第一條水平線
    [0, 2, 0, 1, 0],
    [2, 2, 2, 2, 2], // 第二條水平線
    [0, 1, 0, 2, 0],
    [1, 1, 1, 1, 1]  // 第三條水平線
  ];

  const lines = lineDetector.checkHorizontalLines(board);
  
  test.expect(lines).toHaveLength(3);
});

// 垂直線檢測測試
test.test('檢測完整的垂直線', () => {
  const board = [
    [1, 0, 2, 0, 1],
    [1, 2, 0, 1, 0], // 第一列完整
    [1, 0, 1, 0, 2],
    [1, 1, 0, 2, 0],
    [1, 0, 2, 0, 1]
  ];

  const lines = lineDetector.checkVerticalLines(board);
  
  test.expect(lines).toHaveLength(1);
  test.expect(lines[0].type).toBe('vertical');
  test.expect(lines[0].col).toBe(0);
});

// 對角線檢測測試
test.test('檢測主對角線', () => {
  const board = [
    [1, 0, 2, 0, 0],
    [0, 1, 0, 0, 0],
    [2, 0, 1, 0, 2],
    [0, 0, 0, 1, 0],
    [0, 0, 2, 0, 1]
  ];

  const lines = lineDetector.checkDiagonalLines(board);
  
  test.expect(lines).toHaveLength(1);
  test.expect(lines[0].type).toBe('diagonal-main');
});

test.test('檢測反對角線', () => {
  const board = [
    [0, 0, 2, 0, 1],
    [0, 2, 0, 1, 0],
    [2, 0, 1, 0, 2],
    [0, 1, 0, 2, 0],
    [1, 0, 2, 0, 0]
  ];

  const lines = lineDetector.checkDiagonalLines(board);
  
  test.expect(lines).toHaveLength(1);
  test.expect(lines[0].type).toBe('diagonal-anti');
});

// 綜合測試
test.test('檢測所有類型的連線', () => {
  const board = [
    [1, 1, 1, 1, 1], // 水平線
    [2, 0, 0, 0, 0],
    [2, 0, 0, 0, 0],
    [2, 0, 0, 0, 0],
    [2, 0, 0, 0, 0]  // 垂直線(第0列)
  ];

  const lines = lineDetector.getAllLines(board);
  
  test.expect(lines).toHaveLength(2); // 1條水平線 + 1條垂直線
});

test.test('計算連線數量', () => {
  const board = [
    [1, 1, 1, 1, 1], // 水平線
    [2, 0, 0, 0, 0],
    [2, 0, 0, 0, 0],
    [2, 0, 0, 0, 0],
    [2, 0, 0, 0, 0]  // 垂直線
  ];

  const count = lineDetector.countCompletedLines(board);
  
  test.expect(count).toBe(2);
});

test.test('處理全空的遊戲板', () => {
  const board = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];

  const lines = lineDetector.getAllLines(board);
  
  test.expect(lines).toHaveLength(0);
});

test.test('處理全滿的遊戲板', () => {
  const board = [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1]
  ];

  const lines = lineDetector.getAllLines(board);
  
  // 應該有5條水平線 + 5條垂直線 + 2條對角線 = 12條線
  test.expect(lines).toHaveLength(12);
});

// 運行所有測試
test.run();