/**
 * 測試運行器 - 自動發現並執行所有測試文件
 */
const fs = require('fs');
const path = require('path');

// 測試結果追蹤
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let currentTestFile = '';

// 全局測試函數
global.describe = (description, testFn) => {
  console.log(`\n${description}`);
  testFn();
};

global.test = (description, testFn) => {
  totalTests++;
  try {
    testFn();
    console.log(`✓ ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
    failedTests++;
  }
};

global.expect = (actual) => ({
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
  toHaveLength: (expected) => {
    if (!actual || actual.length !== expected) {
      throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : 'undefined'}`);
    }
  },
  toBeGreaterThan: (expected) => {
    if (!(actual > expected)) {
      throw new Error(`Expected value greater than ${expected}, but got ${actual}`);
    }
  },
  toBeGreaterThanOrEqual: (expected) => {
    if (!(actual >= expected)) {
      throw new Error(`Expected value greater than or equal to ${expected}, but got ${actual}`);
    }
  },
  toBeLessThan: (expected) => {
    if (!(actual < expected)) {
      throw new Error(`Expected value less than ${expected}, but got ${actual}`);
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected truthy value, but got ${actual}`);
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected falsy value, but got ${actual}`);
    }
  }
});

// 查找並運行所有測試文件
function runAllTests() {
  const testFiles = findTestFiles();
  console.log(`Found ${testFiles.length} test files`);
  
  testFiles.forEach(file => {
    currentTestFile = file;
    console.log(`\n=== Running tests in ${file} ===`);
    try {
      require(path.join(process.cwd(), file));
    } catch (error) {
      console.error(`Error running tests in ${file}:`);
      console.error(error);
      failedTests++;
    }
  });
  
  // 輸出測試結果摘要
  console.log('\n=== Test Results ===');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  
  generateCoverageReport();
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// 查找所有測試文件
function findTestFiles() {
  const testFiles = [];
  
  function scanDir(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (
          file.endsWith('.test.js') || 
          (file.startsWith('test-') && file.endsWith('.js'))
        ) {
          testFiles.push(filePath);
        }
      });
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error.message);
    }
  }
  
  scanDir('.');
  return testFiles;
}

// 生成測試覆蓋率報告
function generateCoverageReport() {
  console.log('\n=== Test Coverage Report ===');
  console.log('Note: This is a simplified coverage report');
  
  const components = [
    'lineDetector.js',
    'probabilityCalculator.js',
    'probabilityCalculator.enhanced.js',
    'gameEngine.js',
    'gameBoard.js'
  ];
  
  components.forEach(component => {
    const testFile = component.replace('.js', '.test.js');
    try {
      fs.statSync(testFile);
      console.log(`✓ ${component}: Test file exists`);
    } catch (error) {
      console.log(`✗ ${component}: No test file found`);
    }
  });
}

// 運行測試
runAllTests();