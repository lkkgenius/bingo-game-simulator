// Simple test to verify dependency loading
const fs = require('fs');
const path = require('path');

// Simulate browser environment
global.window = {};
global.document = {
  readyState: 'complete',
  addEventListener: () => {}
};
global.performance = {
  now: () => Date.now()
};

console.log('Testing dependency loading...');

try {
  // Load common utilities
  require('./utils/common.js');
  console.log('✓ Common utilities loaded');
  
  // Load base probability calculator
  require('./utils/baseProbabilityCalculator.js');
  console.log('✓ BaseProbabilityCalculator loaded');
  
  // Check if it's available in global scope
  if (global.window.BaseProbabilityCalculator) {
    console.log('✓ BaseProbabilityCalculator available in window');
  } else {
    console.log('✗ BaseProbabilityCalculator NOT available in window');
  }
  
  // Load probability calculator
  require('./probabilityCalculator.js');
  console.log('✓ ProbabilityCalculator loaded');
  
  // Check if it's available in global scope
  if (global.window.ProbabilityCalculator) {
    console.log('✓ ProbabilityCalculator available in window');
    
    // Try to create an instance
    const calc = new global.window.ProbabilityCalculator();
    console.log('✓ ProbabilityCalculator instance created successfully');
  } else {
    console.log('✗ ProbabilityCalculator NOT available in window');
  }
  
} catch (error) {
  console.error('✗ Error during loading:', error.message);
  console.error(error.stack);
}