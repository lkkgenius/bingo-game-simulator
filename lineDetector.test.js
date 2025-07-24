/**
 * LineDetector 單元測試
 */
const LineDetector = require('./lineDetector.js');

describe('LineDetector', () => {
  let lineDetector;
  
  // 在每個測試前初始化
  beforeEach = () => {
    lineDetector = new LineDetector();
  };
  
  // 初始化
  beforeEach();
  
  test('should detect horizontal line', () => {
    const board = [
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    const lines = lineDetector.checkHorizontalLines(board);
    expect(lines).toHaveLength(1);
    expect(lines[0].type).toBe('horizontal');
    expect(lines[0].row).toBe(0);
  });
  
  test('should detect vertical line', () => {
    const board = [
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0]
    ];
    const lines = lineDetector.checkVerticalLines(board);
    expect(lines).toHaveLength(1);
    expect(lines[0].type).toBe('vertical');
    expect(lines[0].col).toBe(0);
  });
  
  test('should detect main diagonal line', () => {
    const board = [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1]
    ];
    const lines = lineDetector.checkDiagonalLines(board);
    expect(lines).toHaveLength(1);
    expect(lines[0].type).toBe('diagonal-main');
  });
  
  test('should detect anti-diagonal line', () => {
    const board = [
      [0, 0, 0, 0, 1],
      [0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0]
    ];
    const lines = lineDetector.checkDiagonalLines(board);
    expect(lines).toHaveLength(1);
    expect(lines[0].type).toBe('diagonal-anti');
  });
  
  test('should count completed lines correctly', () => {
    const board = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1]
    ];
    // 2 horizontal + 2 vertical = 4 lines
    expect(lineDetector.countCompletedLines(board)).toBe(4);
  });
  
  test('should return all lines', () => {
    const board = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 1, 0, 0],
      [1, 0, 0, 1, 0],
      [1, 0, 0, 0, 1]
    ];
    // 1 horizontal + 1 vertical + 1 diagonal = 3 lines
    const lines = lineDetector.getAllLines(board);
    // 實際上只有 1 水平線和 1 垂直線，因為對角線不完整
    expect(lines).toHaveLength(2);
  });
  
  test('should validate board format', () => {
    // 有效的遊戲板
    const validBoard = Array(5).fill().map(() => Array(5).fill(0));
    expect(lineDetector.isValidBoard(validBoard)).toBeTruthy();
    
    // 無效的遊戲板 - 錯誤的尺寸
    const invalidSizeBoard = Array(4).fill().map(() => Array(5).fill(0));
    expect(lineDetector.isValidBoard(invalidSizeBoard)).toBeFalsy();
    
    // 無效的遊戲板 - 錯誤的值
    const invalidValueBoard = Array(5).fill().map(() => Array(5).fill(0));
    invalidValueBoard[0][0] = 3; // 無效的值
    expect(lineDetector.isValidBoard(invalidValueBoard)).toBeFalsy();
  });
});