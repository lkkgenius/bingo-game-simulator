/**
 * 連線顯示測試
 * 用於驗證連線檢測和顯示功能是否正常工作
 */

// 模擬瀏覽器環境
if (typeof window === 'undefined') {
    global.window = {};
    global.document = {
        getElementById: () => null,
        createElement: () => ({
            className: '',
            classList: {
                add: () => {},
                remove: () => {},
                contains: () => false
            },
            setAttribute: () => {},
            getAttribute: () => '',
            removeAttribute: () => {},
            appendChild: () => {},
            removeChild: () => {},
            querySelector: () => null
        }),
        addEventListener: () => {}
    };
}

// 載入必要的模組
const LineDetector = require('./lineDetector.js');

// 測試連線檢測功能
function testLineDetection() {
    console.log('=== 連線檢測測試 ===');
    
    const lineDetector = new LineDetector();
    
    // 測試水平線
    console.log('\n1. 測試水平線檢測:');
    const horizontalBoard = [
        [1, 1, 1, 1, 1], // 完成的水平線
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];
    
    const horizontalLines = lineDetector.getAllLines(horizontalBoard);
    console.log(`檢測到 ${horizontalLines.length} 條連線`);
    console.log('連線詳情:', JSON.stringify(horizontalLines, null, 2));
    
    // 測試垂直線
    console.log('\n2. 測試垂直線檢測:');
    const verticalBoard = [
        [2, 0, 0, 0, 0], // 完成的垂直線
        [2, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [2, 0, 0, 0, 0]
    ];
    
    const verticalLines = lineDetector.getAllLines(verticalBoard);
    console.log(`檢測到 ${verticalLines.length} 條連線`);
    console.log('連線詳情:', JSON.stringify(verticalLines, null, 2));
    
    // 測試對角線
    console.log('\n3. 測試對角線檢測:');
    const diagonalBoard = [
        [1, 0, 0, 0, 0], // 完成的主對角線
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1]
    ];
    
    const diagonalLines = lineDetector.getAllLines(diagonalBoard);
    console.log(`檢測到 ${diagonalLines.length} 條連線`);
    console.log('連線詳情:', JSON.stringify(diagonalLines, null, 2));
    
    // 測試多條線
    console.log('\n4. 測試多條線檢測:');
    const multipleBoard = [
        [1, 1, 1, 1, 1], // 水平線
        [2, 0, 0, 0, 2], // 反對角線的一部分
        [2, 0, 1, 0, 2],
        [2, 0, 0, 1, 2],
        [2, 0, 0, 0, 1]  // 垂直線 + 反對角線
    ];
    
    const multipleLines = lineDetector.getAllLines(multipleBoard);
    console.log(`檢測到 ${multipleLines.length} 條連線`);
    console.log('連線詳情:', JSON.stringify(multipleLines, null, 2));
    
    // 驗證連線數據結構
    console.log('\n5. 驗證連線數據結構:');
    multipleLines.forEach((line, index) => {
        console.log(`連線 ${index + 1}:`);
        console.log(`  類型: ${line.type}`);
        console.log(`  格子: ${JSON.stringify(line.cells)}`);
        console.log(`  值: ${JSON.stringify(line.values)}`);
        
        // 驗證格子座標是否有效
        const validCells = line.cells.every(([row, col]) => {
            return row >= 0 && row < 5 && col >= 0 && col < 5;
        });
        console.log(`  格子座標有效: ${validCells}`);
        
        // 驗證格子數量
        console.log(`  格子數量: ${line.cells.length} (應該是5)`);
    });
}

// 測試連線類型映射
function testLineTypeMapping() {
    console.log('\n=== 連線類型映射測試 ===');
    
    const lineTypes = {
        'horizontal': 'horizontal-line',
        'vertical': 'vertical-line',
        'diagonal-main': 'diagonal-line',
        'diagonal-anti': 'anti-diagonal-line'
    };
    
    Object.entries(lineTypes).forEach(([type, cssClass]) => {
        console.log(`${type} -> ${cssClass}`);
    });
}

// 運行測試
if (require.main === module) {
    try {
        testLineDetection();
        testLineTypeMapping();
        console.log('\n=== 所有測試完成 ===');
    } catch (error) {
        console.error('測試失敗:', error);
        console.error('錯誤堆疊:', error.stack);
    }
}

module.exports = {
    testLineDetection,
    testLineTypeMapping
};