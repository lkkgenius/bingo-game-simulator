// Simple version for testing
console.log('Loading probabilityCalculator-simple.js...');

// Check dependencies
console.log(
  'window.BaseProbabilityCalculator:',
  typeof window.BaseProbabilityCalculator
);
console.log('window.CONSTANTS:', typeof window.CONSTANTS);

if (
  typeof window.BaseProbabilityCalculator === 'function' &&
  typeof window.CONSTANTS === 'object'
) {
  console.log('Dependencies available, defining ProbabilityCalculator...');

  class ProbabilityCalculator extends window.BaseProbabilityCalculator {
    constructor() {
      console.log('ProbabilityCalculator constructor called');
      super(window.CONSTANTS.ALGORITHM_WEIGHTS.STANDARD);
    }

    calculateMoveValue(board, row, col) {
      console.log('calculateMoveValue called');
      return 0; // Simple implementation for testing
    }
  }

  // Export to global scope
  window.ProbabilityCalculator = ProbabilityCalculator;
  console.log('ProbabilityCalculator defined successfully');
} else {
  console.error('Dependencies not available');
  console.log('BaseProbabilityCalculator:', window.BaseProbabilityCalculator);
  console.log('CONSTANTS:', window.CONSTANTS);
}
