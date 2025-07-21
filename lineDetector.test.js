// 測試LineDetector類別的功能
const LineDetector = require('./lineDetector');

describe('LineDetector', () => {
  let lineDetector;

  beforeEach(() => {
    lineDetector = new LineDetector();
  });

  describe('水平線檢測', () => {
    test('應該檢測到完整的水平線', () => {
      const board = [
        [1, 1, 1, 1, 1], // 完整水平線
        [0, 2, 0, 1, 0],
        [2, 0, 1, 0, 2],
        [0, 1, 0, 2, 0],
        [1, 0, 2, 0, 1]
      ];

      const lines = lineDetector.checkHorizontalLines(board);
      expect(lines).toHaveLength(1);
      expect(lines[0].type).toBe('horizontal');
      expect(lines[0].row).toBe(0);
      expect(lines[0].cells).toEqual([[0,0], [0,1], [0,2], [0,3], [0,4]]);
    });

    test('應該檢測到多條水平線', () => {
      const board = [
        [1, 1, 1, 1, 1], // 第一條水平線
        [0, 2, 0, 1, 0],
        [2, 2, 2, 2, 2], // 第二條水平線
        [0, 1, 0, 2, 0],
        [1, 0, 2, 0, 1]
      ];

      const lines = lineDetector.checkHorizontalLines(board);
      expect(lines).toHaveLength(2);
      expect(lines[0].row).toBe(0);
      expect(lines[1].row).toBe(2);
    });

    test('沒有完整水平線時應該返回空陣列', () => {
      const board = [
        [1, 1, 0, 1, 1], // 不完整
        [0, 2, 0, 1, 0],
        [2, 0, 1, 0, 2],
        [0, 1, 0, 2, 0],
        [1, 0, 2, 0, 1]
      ];

      const lines = lineDetector.checkHorizontalLines(board);
      expect(lines).toHaveLength(0);
    });
  });

  describe('垂直線檢測', () => {
    test('應該檢測到完整的垂直線', () => {
      const board = [
        [1, 0, 2, 0, 1],
        [1, 2, 0, 1, 0], // 第一列完整
        [1, 0, 1, 0, 2],
        [1, 1, 0, 2, 0],
        [1, 0, 2, 0, 1]
      ];

      const lines = lineDetector.checkVerticalLines(board);
      expect(lines).toHaveLength(1);
      expect(lines[0].type).toBe('vertical');
      expect(lines[0].col).toBe(0);
      expect(lines[0].cells).toEqual([[0,0], [1,0], [2,0], [3,0], [4,0]]);
    });

    test('應該檢測到多條垂直線', () => {
      const board = [
        [1, 0, 2, 0, 1],
        [1, 2, 2, 1, 1], // 第一列和第五列完整
        [1, 0, 2, 0, 1],
        [1, 1, 2, 2, 1],
        [1, 0, 2, 0, 1]
      ];

      const lines = lineDetector.checkVerticalLines(board);
      expect(lines).toHaveLength(3);
      expect(lines.map(line => line.col)).toEqual([0, 2, 4]);
    });

    test('沒有完整垂直線時應該返回空陣列', () => {
      const board = [
        [1, 0, 2, 0, 1],
        [0, 2, 0, 1, 0], // 所有列都不完整
        [2, 0, 1, 0, 2],
        [0, 1, 0, 2, 0],
        [1, 0, 2, 0, 0]
      ];

      const lines = lineDetector.checkVerticalLines(board);
      expect(lines).toHaveLength(0);
    });
  });

  describe('對角線檢測', () => {
    test('應該檢測到主對角線', () => {
      const board = [
        [1, 0, 2, 0, 1],
        [0, 1, 0, 1, 0], // 主對角線完整
        [2, 0, 1, 0, 2],
        [0, 1, 0, 1, 0],
        [1, 0, 2, 0, 1]
      ];

      const lines = lineDetector.checkDiagonalLines(board);
      expect(lines).toHaveLength(1);
      expect(lines[0].type).toBe('diagonal-main');
      expect(lines[0].cells).toEqual([[0,0], [1,1], [2,2], [3,3], [4,4]]);
    });

    test('應該檢測到反對角線', () => {
      const board = [
        [0, 0, 2, 0, 1],
        [0, 2, 0, 1, 0], // 反對角線完整
        [2, 0, 1, 0, 2],
        [0, 1, 0, 2, 0],
        [1, 0, 2, 0, 0]
      ];

      const lines = lineDetector.checkDiagonalLines(board);
      expect(lines).toHaveLength(1);
      expect(lines[0].type).toBe('diagonal-anti');
      expect(lines[0].cells).toEqual([[0,4], [1,3], [2,2], [3,1], [4,0]]);
    });

    test('應該檢測到兩條對角線', () => {
      const board = [
        [1, 0, 2, 0, 2],
        [0, 1, 0, 2, 0], // 兩條對角線都完整
        [2, 0, 1, 0, 2],
        [0, 2, 0, 1, 0],
        [2, 0, 2, 0, 1]
      ];

      const lines = lineDetector.checkDiagonalLines(board);
      expect(lines).toHaveLength(2);
      expect(lines.map(line => line.type)).toEqual(['diagonal-main', 'diagonal-anti']);
    });

    test('沒有完整對角線時應該返回空陣列', () => {
      const board = [
        [0, 0, 2, 0, 1],
        [0, 2, 0, 1, 0], // 兩條對角線都不完整
        [2, 0, 0, 0, 2],
        [0, 1, 0, 2, 0],
        [1, 0, 2, 0, 0]
      ];

      const lines = lineDetector.checkDiagonalLines(board);
      expect(lines).toHaveLength(0);
    });
  });

  describe('getAllLines方法', () => {
    test('應該返回所有類型的連線', () => {
      const board = [
        [1, 1, 1, 1, 1], // 水平線
        [2, 2, 0, 2, 0],
        [2, 0, 2, 0, 2], // 垂直線(第0列)和主對角線
        [2, 1, 0, 2, 0],
        [2, 0, 2, 0, 2]
      ];

      const lines = lineDetector.getAllLines(board);
      expect(lines.length).toBeGreaterThan(0);
      
      const types = lines.map(line => line.type);
      expect(types).toContain('horizontal');
      expect(types).toContain('vertical');
      expect(types).toContain('diagonal-main');
    });

    test('空遊戲板應該返回空陣列', () => {
      const board = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
      ];

      const lines = lineDetector.getAllLines(board);
      expect(lines).toHaveLength(0);
    });
  });

  describe('countCompletedLines方法', () => {
    test('應該正確計算連線數量', () => {
      const board = [
        [1, 1, 1, 1, 1], // 1條水平線
        [2, 2, 0, 2, 0],
        [2, 0, 2, 0, 2], // 1條垂直線(第0列)
        [2, 1, 0, 2, 0],
        [2, 0, 2, 0, 2]
      ];

      const count = lineDetector.countCompletedLines(board);
      expect(count).toBe(2);
    });

    test('沒有連線時應該返回0', () => {
      const board = [
        [1, 0, 1, 0, 1],
        [0, 2, 0, 2, 0],
        [2, 0, 1, 0, 2],
        [0, 1, 0, 2, 0],
        [1, 0, 2, 0, 1]
      ];

      const count = lineDetector.countCompletedLines(board);
      expect(count).toBe(0);
    });
  });

  describe('isValidBoard方法', () => {
    test('有效的遊戲板應該返回true', () => {
      const board = [
        [0, 1, 2, 0, 1],
        [1, 0, 1, 2, 0],
        [2, 1, 0, 1, 2],
        [0, 2, 1, 0, 1],
        [1, 0, 2, 1, 0]
      ];

      expect(lineDetector.isValidBoard(board)).toBe(true);
    });

    test('無效的遊戲板大小應該返回false', () => {
      const board = [
        [0, 1, 2, 0],
        [1, 0, 1, 2],
        [2, 1, 0, 1],
        [0, 2, 1, 0]
      ];

      expect(lineDetector.isValidBoard(board)).toBe(false);
    });

    test('包含無效值的遊戲板應該返回false', () => {
      const board = [
        [0, 1, 2, 0, 1],
        [1, 0, 1, 2, 0],
        [2, 1, 3, 1, 2], // 3是無效值
        [0, 2, 1, 0, 1],
        [1, 0, 2, 1, 0]
      ];

      expect(lineDetector.isValidBoard(board)).toBe(false);
    });
  });

  describe('邊界情況測試', () => {
    test('應該處理混合玩家和電腦的連線', () => {
      const board = [
        [1, 2, 1, 2, 1], // 混合但完整的水平線
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
      ];

      const lines = lineDetector.checkHorizontalLines(board);
      expect(lines).toHaveLength(1);
      expect(lines[0].values).toEqual([1, 2, 1, 2, 1]);
    });

    test('應該正確處理全部為同一玩家的連線', () => {
      const board = [
        [1, 1, 1, 1, 1], // 全部玩家1
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [2, 2, 2, 2, 2]  // 全部玩家2
      ];

      const lines = lineDetector.checkHorizontalLines(board);
      expect(lines).toHaveLength(2);
      expect(lines[0].values.every(v => v === 1)).toBe(true);
      expect(lines[1].values.every(v => v === 2)).toBe(true);
    });

    test('應該檢測複雜的多重連線情況', () => {
      const board = [
        [1, 1, 1, 1, 1], // 水平線
        [1, 2, 2, 2, 2],
        [1, 2, 1, 2, 1], // 垂直線(第0列)
        [1, 2, 2, 1, 2],
        [1, 2, 1, 2, 1]
      ];

      const allLines = lineDetector.getAllLines(board);
      expect(allLines.length).toBeGreaterThanOrEqual(2);
      
      const horizontalLines = allLines.filter(line => line.type === 'horizontal');
      const verticalLines = allLines.filter(line => line.type === 'vertical');
      
      expect(horizontalLines).toHaveLength(1);
      expect(verticalLines).toHaveLength(1);
    });
  });
});