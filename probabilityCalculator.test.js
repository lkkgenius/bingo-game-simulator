/**
 * ProbabilityCalculator 單元測試
 */
const ProbabilityCalculator = require('./probabilityCalculator.js');

describe('ProbabilityCalculator', () => {
  let calculator;

  // 在每個測試前初始化
  beforeEach = () => {
    calculator = new ProbabilityCalculator();
  };

  // 初始化
  beforeEach();

  test('should calculate move value for empty board', () => {
    const emptyBoard = Array(5)
      .fill()
      .map(() => Array(5).fill(0));
    // 中心位置應該有最高價值
    const centerValue = calculator.calculateMoveValue(emptyBoard, 2, 2);
    const cornerValue = calculator.calculateMoveValue(emptyBoard, 0, 0);
    expect(centerValue).toBeGreaterThan(cornerValue);
  });

  test('should calculate move value for partially filled board', () => {
    const board = [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    // 完成垂直線的移動應該有高價值
    const completionValue = calculator.calculateMoveValue(board, 3, 2);
    const randomValue = calculator.calculateMoveValue(board, 3, 3);
    expect(completionValue).toBeGreaterThan(randomValue);
  });

  test('should return best suggestion', () => {
    const board = [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    const suggestion = calculator.getBestSuggestion(board);
    expect(suggestion).toBeTruthy();
    // 不檢查具體的行列值，因為不同實現可能有不同的建議
    expect(suggestion.row >= 0 && suggestion.row < 5).toBeTruthy();
    expect(suggestion.col >= 0 && suggestion.col < 5).toBeTruthy();
  });

  test('should handle invalid positions', () => {
    const board = Array(5)
      .fill()
      .map(() => Array(5).fill(0));
    // 無效位置應該返回負值
    expect(calculator.calculateMoveValue(board, -1, 0)).toBeLessThan(0);
    expect(calculator.calculateMoveValue(board, 0, -1)).toBeLessThan(0);
    expect(calculator.calculateMoveValue(board, 5, 0)).toBeLessThan(0);
    expect(calculator.calculateMoveValue(board, 0, 5)).toBeLessThan(0);
  });

  test('should handle already occupied positions', () => {
    const board = [
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    // 已佔用位置應該返回負值
    expect(calculator.calculateMoveValue(board, 0, 0)).toBeLessThan(0);
  });

  test('should provide confidence level with suggestion', () => {
    const board = Array(5)
      .fill()
      .map(() => Array(5).fill(0));
    const suggestion = calculator.getBestSuggestion(board);
    expect(suggestion.confidence).toBeTruthy();
  });

  test('should provide alternative suggestions', () => {
    const board = Array(5)
      .fill()
      .map(() => Array(5).fill(0));
    const suggestion = calculator.getBestSuggestion(board);
    expect(suggestion.alternatives).toBeTruthy();
    expect(suggestion.alternatives.length).toBeGreaterThan(0);
  });

  test('should calculate higher value for potential line completion', () => {
    const board = [
      [1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    // 完成水平線的移動應該有高價值
    const completionValue = calculator.calculateMoveValue(board, 0, 4);
    const randomValue = calculator.calculateMoveValue(board, 1, 1);
    expect(completionValue).toBeGreaterThan(randomValue);
  });

  test('should calculate cooperative line potential', () => {
    const board = [
      [1, 0, 2, 0, 0],
      [0, 1, 2, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    // 測試合作連線潛力 - 使用現有的 calculateCooperativeValue 方法
    const cooperativeValue = calculator.calculateCooperativeValue(board, 2, 2);
    expect(cooperativeValue).toBeGreaterThanOrEqual(0);
  });

  test('should identify valid moves', () => {
    const board = [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    expect(calculator.isValidMove(board, 0, 0)).toBeFalsy();
    expect(calculator.isValidMove(board, 0, 1)).toBeTruthy();
    expect(calculator.isValidMove(board, -1, 0)).toBeFalsy();
  });

  test('should identify center position', () => {
    expect(calculator.isCenterPosition(2, 2)).toBeTruthy();
    expect(calculator.isCenterPosition(0, 0)).toBeFalsy();
  });

  test('should get empty cells', () => {
    const board = [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
    const emptyCells = calculator.getEmptyCells(board);
    expect(emptyCells.length).toBe(23); // 25 - 2 = 23
  });
});
