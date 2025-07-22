// Simple test script for EnhancedProbabilityCalculator
const EnhancedProbabilityCalculator = require('./probabilityCalculator.enhanced.js');

console.log('Testing EnhancedProbabilityCalculator...');

// Create an instance of the calculator
const calculator = new EnhancedProbabilityCalculator();

// Create a test board
const testBoard = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
];

// Test 1: Calculate move value for center position
const centerValue = calculator.calculateMoveValue(testBoard, 2, 2);
console.log('Test 1: Center position value:', centerValue);
console.assert(centerValue > 0, 'Center position should have a positive value');

// Test 2: Calculate move value for corner position
const cornerValue = calculator.calculateMoveValue(testBoard, 0, 0);
console.log('Test 2: Corner position value:', cornerValue);
console.assert(cornerValue >= 0, 'Corner position should have a non-negative value');

// Test 3: Calculate move value for invalid position
const invalidValue = calculator.calculateMoveValue(testBoard, -1, -1);
console.log('Test 3: Invalid position value:', invalidValue);
console.assert(invalidValue === -1, 'Invalid position should return -1');

// Test 4: Get best suggestion
const suggestion = calculator.getBestSuggestion(testBoard);
console.log('Test 4: Best suggestion:', suggestion);
console.assert(suggestion !== null, 'Should return a valid suggestion');

// Test 5: Test intersection points
const intersectionPoints = calculator.getIntersectionPoints();
console.log('Test 5: Intersection points count:', intersectionPoints.length);
console.assert(intersectionPoints.length > 0, 'Should find intersection points');

// Test 6: Test cache functionality
const cachedValue = calculator.calculateMoveValue(testBoard, 2, 2);
console.log('Test 6: Cached value for center position:', cachedValue);
console.assert(cachedValue === centerValue, 'Cached value should match original value');

console.log('All tests completed!');