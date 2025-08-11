/**
 * 算法比較整合測試
 * 比較標準和增強版機率計算器的表現
 */
const ProbabilityCalculator = require('./probabilityCalculator.js');
const EnhancedProbabilityCalculator = require('./probabilityCalculator.enhanced.js');

describe('Algorithm Comparison Integration', () => {
  let standardCalculator;
  let enhancedCalculator;

  // 在每個測試前初始化
  beforeEach = () => {
    standardCalculator = new ProbabilityCalculator();
    enhancedCalculator = new EnhancedProbabilityCalculator();
  };

  // 初始化
  beforeEach();

  test('should compare suggestions on empty board', () => {
    const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));

    const standardSuggestion = standardCalculator.getBestSuggestion(emptyBoard);
    const enhancedSuggestion = enhancedCalculator.getBestSuggestion(emptyBoard);

    // 兩種算法在空板上應該都建議中心位置
    expect(standardSuggestion.row).toBe(2);
    expect(standardSuggestion.col).toBe(2);
    expect(enhancedSuggestion.row).toBe(2);
    expect(enhancedSuggestion.col).toBe(2);
  });

  test('should compare suggestions on partially filled board', () => {
    const board = [
      [1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];

    const standardSuggestion = standardCalculator.getBestSuggestion(board);
    const enhancedSuggestion = enhancedCalculator.getBestSuggestion(board);

    // 確保兩種算法都返回有效建議
    expect(standardSuggestion).toBeTruthy();
    expect(enhancedSuggestion).toBeTruthy();

    // 檢查建議格式
    expect(standardSuggestion.row >= 0 && standardSuggestion.row < 5).toBeTruthy();
    expect(standardSuggestion.col >= 0 && standardSuggestion.col < 5).toBeTruthy();
    expect(enhancedSuggestion.row >= 0 && enhancedSuggestion.row < 5).toBeTruthy();
    expect(enhancedSuggestion.col >= 0 && enhancedSuggestion.col < 5).toBeTruthy();
  });

  test('should compare suggestions on complex board', () => {
    const board = [
      [1, 0, 2, 0, 1],
      [0, 1, 2, 0, 0],
      [2, 0, 1, 0, 2],
      [0, 0, 0, 1, 0],
      [1, 0, 2, 0, 0]
    ];

    const standardSuggestion = standardCalculator.getBestSuggestion(board);
    const enhancedSuggestion = enhancedCalculator.getBestSuggestion(board);

    // 確保兩種算法都返回有效建議
    expect(standardSuggestion).toBeTruthy();
    expect(enhancedSuggestion).toBeTruthy();

    // 檢查建議格式
    expect(standardSuggestion.row >= 0 && standardSuggestion.row < 5).toBeTruthy();
    expect(standardSuggestion.col >= 0 && standardSuggestion.col < 5).toBeTruthy();
    expect(enhancedSuggestion.row >= 0 && enhancedSuggestion.row < 5).toBeTruthy();
    expect(enhancedSuggestion.col >= 0 && enhancedSuggestion.col < 5).toBeTruthy();
  });

  test('should compare confidence levels', () => {
    const board = [
      [1, 1, 1, 1, 0], // 明確的最佳選擇
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];

    const standardSuggestion = standardCalculator.getBestSuggestion(board);
    const enhancedSuggestion = enhancedCalculator.getBestSuggestion(board);

    // 兩種算法都應該有信心度
    expect(standardSuggestion.confidence).toBeTruthy();
    expect(enhancedSuggestion.confidence).toBeTruthy();

    // 信心度應該是有效的字符串
    expect(typeof standardSuggestion.confidence).toBe('string');
    expect(typeof enhancedSuggestion.confidence).toBe('string');
  });

  test('should compare alternative suggestions', () => {
    const emptyBoard = Array(5).fill().map(() => Array(5).fill(0));

    const standardSuggestion = standardCalculator.getBestSuggestion(emptyBoard);
    const enhancedSuggestion = enhancedCalculator.getBestSuggestion(emptyBoard);

    // 兩種算法都應該提供替代建議
    expect(standardSuggestion.alternatives).toBeTruthy();
    expect(standardSuggestion.alternatives.length).toBeGreaterThan(0);
    expect(enhancedSuggestion.alternatives).toBeTruthy();
    expect(enhancedSuggestion.alternatives.length).toBeGreaterThan(0);
  });

  test('should compare move values', () => {
    const board = [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];

    // 完成垂直線的移動
    const standardValue = standardCalculator.calculateMoveValue(board, 3, 2);
    const enhancedValue = enhancedCalculator.calculateMoveValue(board, 3, 2);

    // 增強版算法應該給予更高的價值
    expect(enhancedValue).toBeGreaterThan(standardValue);
  });

  test('should compare intersection point handling', () => {
    const board = Array(5).fill().map(() => Array(5).fill(0));

    // 中心點是交叉點
    const standardCenterValue = standardCalculator.calculateMoveValue(board, 2, 2);
    const enhancedCenterValue = enhancedCalculator.calculateMoveValue(board, 2, 2);

    // 非交叉點
    const standardCornerValue = standardCalculator.calculateMoveValue(board, 0, 0);
    const enhancedCornerValue = enhancedCalculator.calculateMoveValue(board, 0, 0);

    // 增強版算法應該對交叉點給予更高的獎勵
    const standardDifference = standardCenterValue - standardCornerValue;
    const enhancedDifference = enhancedCenterValue - enhancedCornerValue;

    expect(enhancedDifference).toBeGreaterThan(standardDifference);
  });
});
