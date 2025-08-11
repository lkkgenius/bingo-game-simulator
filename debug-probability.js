// Debug script to test ProbabilityCalculator
console.log('=== Debugging ProbabilityCalculator ===');

// Check if dependencies are loaded
console.log('CONSTANTS available:', typeof CONSTANTS !== 'undefined');
console.log('Utils available:', typeof Utils !== 'undefined');
console.log(
  'BaseProbabilityCalculator available:',
  typeof BaseProbabilityCalculator !== 'undefined'
);
console.log(
  'ProbabilityCalculator available:',
  typeof ProbabilityCalculator !== 'undefined'
);

if (typeof CONSTANTS !== 'undefined') {
  console.log('CONSTANTS.CELL_STATES:', CONSTANTS.CELL_STATES);
  console.log('CONSTANTS.ALGORITHM_WEIGHTS:', CONSTANTS.ALGORITHM_WEIGHTS);
}

if (typeof ProbabilityCalculator !== 'undefined') {
  try {
    const calc = new ProbabilityCalculator();
    console.log('ProbabilityCalculator instance created successfully');

    // Test with empty board
    const emptyBoard = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];

    console.log('Testing getBestSuggestion with empty board...');
    const suggestion = calc.getBestSuggestion(emptyBoard);
    console.log('Suggestion result:', suggestion);

    if (suggestion) {
      console.log('Suggestion row:', suggestion.row);
      console.log('Suggestion col:', suggestion.col);
      console.log('Suggestion value:', suggestion.value);
      console.log('Suggestion confidence:', suggestion.confidence);
    }

    // Test calculateMoveValue directly
    console.log('Testing calculateMoveValue for center position (2,2)...');
    const centerValue = calc.calculateMoveValue(emptyBoard, 2, 2);
    console.log('Center position value:', centerValue);
  } catch (error) {
    console.error('Error creating or using ProbabilityCalculator:', error);
    console.error('Error stack:', error.stack);
  }
} else {
  console.error('ProbabilityCalculator is not available');
}
