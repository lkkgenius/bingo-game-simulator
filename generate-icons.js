/**
 * Icon Generation Script for PWA
 * 為 PWA 生成所需的圖標文件
 */

// 這個腳本用於生成 PWA 所需的各種尺寸圖標
// 在實際部署時，您需要創建真實的圖標文件

const iconSizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 72, name: 'icon-72x72.png' },
    { size: 96, name: 'icon-96x96.png' },
    { size: 128, name: 'icon-128x128.png' },
    { size: 144, name: 'icon-144x144.png' },
    { size: 152, name: 'icon-152x152.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 384, name: 'icon-384x384.png' },
    { size: 512, name: 'icon-512x512.png' }
];

/**
 * 生成 SVG 圖標
 */
function generateSVGIcon(size) {
    return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#5C6BC0;stop-opacity:1" />
        </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size * 0.1}"/>
    
    <!-- Bingo Grid -->
    <g transform="translate(${size * 0.2}, ${size * 0.2})">
        ${generateBingoGrid(size * 0.6)}
    </g>
    
    <!-- Letter B -->
    <text x="${size * 0.5}" y="${size * 0.85}" 
          font-family="Arial, sans-serif" 
          font-size="${size * 0.2}" 
          font-weight="bold" 
          text-anchor="middle" 
          fill="white">B</text>
</svg>`;
}

/**
 * 生成 Bingo 網格
 */
function generateBingoGrid(gridSize) {
    const cellSize = gridSize / 5;
    let grid = '';
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const x = col * cellSize;
            const y = row * cellSize;
            const isCenter = row === 2 && col === 2;
            const isFilled = Math.random() > 0.6 || isCenter;
            
            grid += `
                <rect x="${x}" y="${y}" 
                      width="${cellSize * 0.9}" 
                      height="${cellSize * 0.9}" 
                      fill="${isFilled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'}" 
                      stroke="rgba(255,255,255,0.8)" 
                      stroke-width="1" 
                      rx="${cellSize * 0.1}"/>
            `;
            
            if (isCenter) {
                grid += `
                    <text x="${x + cellSize * 0.45}" y="${y + cellSize * 0.6}" 
                          font-family="Arial, sans-serif" 
                          font-size="${cellSize * 0.4}" 
                          font-weight="bold" 
                          text-anchor="middle" 
                          fill="#4A90E2">★</text>
                `;
            }
        }
    }
    
    return grid;
}

/**
 * 創建圖標目錄結構說明
 */
function createIconDirectoryStructure() {
    return `
# 圖標目錄結構

請在項目根目錄創建 \`icons\` 文件夾，並包含以下圖標文件：

\`\`\`
icons/
├── favicon-16x16.png          # 16x16 網站圖標
├── favicon-32x32.png          # 32x32 網站圖標
├── icon-72x72.png             # 72x72 PWA 圖標
├── icon-96x96.png             # 96x96 PWA 圖標
├── icon-128x128.png           # 128x128 PWA 圖標
├── icon-144x144.png           # 144x144 PWA 圖標
├── icon-152x152.png           # 152x152 PWA 圖標
├── icon-192x192.png           # 192x192 PWA 圖標
├── icon-384x384.png           # 384x384 PWA 圖標
├── icon-512x512.png           # 512x512 PWA 圖標
├── apple-touch-icon.png       # 180x180 Apple 觸控圖標
├── safari-pinned-tab.svg      # Safari 固定標籤圖標
├── badge-72x72.png            # 72x72 通知徽章圖標
├── new-game-96x96.png         # 96x96 新遊戲快捷方式圖標
├── stats-96x96.png            # 96x96 統計快捷方式圖標
├── open-96x96.png             # 96x96 打開動作圖標
└── close-96x96.png            # 96x96 關閉動作圖標
\`\`\`

## 圖標設計建議

1. **主色調**: 使用漸變色 #4A90E2 到 #5C6BC0
2. **設計元素**: 包含 5x5 Bingo 網格和字母 "B"
3. **風格**: 現代扁平化設計，圓角矩形背景
4. **對比度**: 確保在各種背景下都有良好的可見性

## 生成圖標的方法

1. **使用設計工具**: Figma, Sketch, Adobe Illustrator
2. **在線工具**: PWA Builder, RealFaviconGenerator
3. **命令行工具**: ImageMagick, Sharp (Node.js)

## SVG 模板

可以使用以下 SVG 作為起點：

\`\`\`svg
${generateSVGIcon(512)}
\`\`\`

將此 SVG 保存為 icon-template.svg，然後使用工具轉換為不同尺寸的 PNG 文件。
`;
}

// 如果在 Node.js 環境中運行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        iconSizes,
        generateSVGIcon,
        createIconDirectoryStructure
    };
}

// 如果在瀏覽器中運行
if (typeof window !== 'undefined') {
    window.IconGenerator = {
        iconSizes,
        generateSVGIcon,
        createIconDirectoryStructure
    };
    
    console.log('Icon Generator loaded. Use IconGenerator.createIconDirectoryStructure() for instructions.');
}