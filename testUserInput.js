/**
 * 簡單的用戶輸入系統測試
 */

// 導入必要的模組
const { validateComputerInput } = require('./userInputSystem.test.js');

console.log('=== 用戶輸入系統測試 ===\n');

// 測試用例
const testCases = [
    { row: '3', col: '4', expected: true, description: '有效輸入' },
    { row: '', col: '', expected: false, description: '空輸入' },
    { row: 'abc', col: 'xyz', expected: false, description: '非數字輸入' },
    { row: '0', col: '6', expected: false, description: '超出範圍' },
    { row: '1', col: '5', expected: true, description: '邊界值' },
    { row: ' 2 ', col: ' 3 ', expected: true, description: '帶空格的輸入' }
];

console.log('測試輸入驗證功能：\n');

testCases.forEach((testCase, index) => {
    try {
        const result = validateComputerInput(testCase.row, testCase.col);
        const passed = result.isValid === testCase.expected;
        
        console.log(`測試 ${index + 1}: ${testCase.description}`);
        console.log(`  輸入: 行="${testCase.row}", 列="${testCase.col}"`);
        console.log(`  預期: ${testCase.expected ? '有效' : '無效'}`);
        console.log(`  結果: ${result.isValid ? '有效' : '無效'}`);
        console.log(`  狀態: ${passed ? '✅ 通過' : '❌ 失敗'}`);
        
        if (!result.isValid && result.errors.length > 0) {
            console.log(`  錯誤: ${result.errors.join(', ')}`);
        }
        
        if (result.isValid) {
            console.log(`  轉換後位置: (${result.row}, ${result.col})`);
        }
        
        console.log('');
    } catch (error) {
        console.log(`測試 ${index + 1}: ${testCase.description} - ❌ 異常: ${error.message}\n`);
    }
});

console.log('=== 測試完成 ===');