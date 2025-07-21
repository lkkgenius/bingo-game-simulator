const LineDetector = require('./lineDetector.js');

const lineDetector = new LineDetector();

// 檢查主對角線測試案例
console.log('=== 主對角線測試案例 ===');
const board1 = [
  [1, 0, 2, 0, 1],
  [0, 1, 0, 1, 0],
  [2, 0, 1, 0, 2],
  [0, 1, 0, 1, 0],
  [1, 0, 2, 0, 1]
];

console.log('遊戲板:');
board1.forEach(row => console.log(row));

const lines1 = lineDetector.getAllLines(board1);
console.log('檢測到的連線:', lines1.length);
lines1.forEach((line, i) => {
  console.log(`連線 ${i + 1}: ${line.type}, 位置:`, line.cells || `row: ${line.row}, col: ${line.col}`);
});

console.log('\n=== 綜合測試案例 ===');
const board2 = [
  [1, 1, 1, 1, 1], // 水平線
  [2, 1, 0, 1, 0],
  [2, 0, 1, 0, 2],
  [2, 1, 0, 1, 0],
  [2, 0, 2, 0, 1]  // 垂直線(第0列) + 主對角線
];

console.log('遊戲板:');
board2.forEach(row => console.log(row));

const lines2 = lineDetector.getAllLines(board2);
console.log('檢測到的連線:', lines2.length);
lines2.forEach((line, i) => {
  console.log(`連線 ${i + 1}: ${line.type}, 位置:`, line.cells || `row: ${line.row}, col: ${line.col}`);
});