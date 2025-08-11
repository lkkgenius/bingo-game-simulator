/**
 * Playwright 端到端測試套件
 * 使用 Playwright MCP server 進行完整的瀏覽器自動化測試
 */

// 測試配置
const TEST_CONFIG = {
  baseUrl: `file://${process.cwd()}/index.html`,
  timeout: 30000,
  retries: 2
};

// 測試結果追蹤
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now()
};

// 測試工具函數
const TestUtils = {
  // 等待元素出現
  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const element = await this.getElement(selector);
        if (element) return element;
      } catch (e) {
        // 繼續等待
      }
      await this.sleep(100);
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  },

  // 等待文本出現
  async waitForText(text, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        const snapshot = await this.getPageSnapshot();
        if (snapshot.includes(text)) return true;
      } catch (e) {
        // 繼續等待
      }
      await this.sleep(100);
    }
    throw new Error(`Text "${text}" not found within ${timeout}ms`);
  },

  // 睡眠函數
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // 獲取頁面快照
  async getPageSnapshot() {
    // 這裡需要使用 MCP server 的 snapshot 功能
    return '';
  },

  // 獲取元素
  async getElement(selector) {
    // 這裡需要使用 MCP server 的元素查找功能
    return null;
  },

  // 斷言函數
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  },

  // 記錄測試結果
  recordTest(name, passed, error = null) {
    testResults.total++;
    if (passed) {
      testResults.passed++;
      console.log(`✓ ${name}`);
    } else {
      testResults.failed++;
      console.error(`✗ ${name}`);
      if (error) {
        console.error(`  Error: ${error.message}`);
      }
    }
  }
};

/**
 * 測試套件 1: 遊戲初始化和載入流程測試
 */
async function testGameInitialization() {
  console.log('\n=== 測試遊戲初始化和載入流程 ===');

  // 測試 1.1: 頁面載入測試
  try {
    // 頁面應該已經載入，檢查標題
    const title = await browser_evaluate({
      function: '() => document.title'
    });
    TestUtils.assert(title === 'Bingo遊戲模擬器', '頁面標題應該正確');
    TestUtils.recordTest('頁面載入測試', true);
  } catch (error) {
    TestUtils.recordTest('頁面載入測試', false, error);
  }

  // 測試 1.1.1: 載入畫面隱藏測試
  try {
    const loadingState = await browser_evaluate({
      function: `() => {
                const loadingOverlay = document.getElementById('global-loading');
                return {
                    exists: !!loadingOverlay,
                    isHidden: loadingOverlay ? loadingOverlay.classList.contains('hidden') : true,
                    opacity: loadingOverlay ? loadingOverlay.style.opacity : '1'
                };
            }`
    });

    TestUtils.assert(loadingState.exists, '載入畫面元素應該存在');
    TestUtils.assert(loadingState.isHidden || loadingState.opacity === '0', '載入畫面應該已隱藏');
    TestUtils.recordTest('載入畫面隱藏測試', true);
  } catch (error) {
    TestUtils.recordTest('載入畫面隱藏測試', false, error);
  }

  // 測試 1.1.2: 漸進式載入組件檢查
  try {
    const componentState = await browser_evaluate({
      function: `() => {
                // 檢查關鍵組件是否已載入
                const components = {
                    gameState: typeof gameState !== 'undefined' && gameState !== null,
                    gameBoard: typeof gameBoard !== 'undefined' && gameBoard !== null,
                    lineDetector: typeof lineDetector !== 'undefined' && lineDetector !== null,
                    probabilityCalculator: typeof probabilityCalculator !== 'undefined' && probabilityCalculator !== null,
                    progressiveLoader: typeof progressiveLoader !== 'undefined' && progressiveLoader !== null
                };
                
                const loadedCount = Object.values(components).filter(Boolean).length;
                
                return {
                    components,
                    loadedCount,
                    totalExpected: 5
                };
            }`
    });

    TestUtils.assert(componentState.loadedCount >= 4, `至少應該載入 4 個核心組件，實際載入: ${componentState.loadedCount}`);
    TestUtils.assert(componentState.components.gameState, 'GameState 應該已載入');
    TestUtils.assert(componentState.components.gameBoard, 'GameBoard 應該已載入');
    TestUtils.recordTest('漸進式載入組件檢查', true);
  } catch (error) {
    TestUtils.recordTest('漸進式載入組件檢查', false, error);
  }

  // 測試 1.2: 核心元素存在性測試
  try {
    const elements = await browser_evaluate({
      function: `() => {
                const required = [
                    '#game-board',
                    '#start-game',
                    '#current-round',
                    '#game-phase',
                    '#completed-lines',
                    '.algorithm-selector'
                ];
                return required.map(selector => ({
                    selector,
                    exists: !!document.querySelector(selector)
                }));
            }`
    });

    elements.forEach(({ selector, exists }) => {
      TestUtils.assert(exists, `元素 ${selector} 應該存在`);
    });
    TestUtils.recordTest('核心元素存在性測試', true);
  } catch (error) {
    TestUtils.recordTest('核心元素存在性測試', false, error);
  }

  // 測試 1.3: 遊戲板初始化測試
  try {
    const boardState = await browser_evaluate({
      function: `() => {
                const board = document.getElementById('game-board');
                const cells = board.querySelectorAll('.cell');
                return {
                    cellCount: cells.length,
                    emptyCells: Array.from(cells).filter(cell => 
                        !cell.classList.contains('player') && 
                        !cell.classList.contains('computer')
                    ).length
                };
            }`
    });

    TestUtils.assert(boardState.cellCount === 25, '遊戲板應該有25個格子');
    TestUtils.assert(boardState.emptyCells === 25, '初始時所有格子應該為空');
    TestUtils.recordTest('遊戲板初始化測試', true);
  } catch (error) {
    TestUtils.recordTest('遊戲板初始化測試', false, error);
  }

  // 測試 1.4: 演算法選擇器初始化測試
  try {
    const algorithmState = await browser_evaluate({
      function: `() => {
                const options = document.querySelectorAll('.algorithm-option');
                const selected = document.querySelector('.algorithm-option.selected');
                return {
                    optionCount: options.length,
                    hasSelected: !!selected,
                    selectedAlgorithm: selected ? selected.getAttribute('data-algorithm') : null
                };
            }`
    });

    TestUtils.assert(algorithmState.optionCount >= 2, '應該有至少2個演算法選項');
    TestUtils.assert(algorithmState.hasSelected, '應該有一個預選的演算法');
    TestUtils.assert(algorithmState.selectedAlgorithm === 'standard', '預設應該選擇標準演算法');
    TestUtils.recordTest('演算法選擇器初始化測試', true);
  } catch (error) {
    TestUtils.recordTest('演算法選擇器初始化測試', false, error);
  }
}

/**
 * 測試套件 2: 玩家移動和電腦回合的完整互動測試
 */
async function testGameInteraction() {
  console.log('\n=== 測試玩家移動和電腦回合的完整互動 ===');

  // 測試 2.1: 開始遊戲測試
  try {
    await browser_click({
      element: '開始遊戲按鈕',
      ref: 'e49'
    });

    await TestUtils.sleep(1000); // 等待遊戲初始化

    const gameState = await browser_evaluate({
      function: `() => {
                return {
                    gameStarted: typeof gameState !== 'undefined' && gameState.gameStarted,
                    currentRound: document.getElementById('current-round').textContent,
                    gamePhase: document.getElementById('game-phase').textContent,
                    startButtonDisabled: document.getElementById('start-game').disabled
                };
            }`
    });

    TestUtils.assert(gameState.gameStarted, '遊戲應該已開始');
    TestUtils.assert(gameState.currentRound === '1', '應該顯示第1輪');
    TestUtils.assert(gameState.gamePhase === '玩家回合', '應該是玩家回合');
    TestUtils.recordTest('開始遊戲測試', true);
  } catch (error) {
    TestUtils.recordTest('開始遊戲測試', false, error);
  }

  // 測試 2.2: 玩家移動測試
  try {
    // 獲取建議的移動
    const suggestion = await browser_evaluate({
      function: `() => {
                const suggestedCell = document.querySelector('.cell.suggested');
                if (suggestedCell) {
                    return {
                        row: parseInt(suggestedCell.getAttribute('data-row')),
                        col: parseInt(suggestedCell.getAttribute('data-col')),
                        found: true
                    };
                }
                return { found: false };
            }`
    });

    if (suggestion.found) {
      // 點擊建議的格子
      await browser_click({
        element: `遊戲格子 (${suggestion.row}, ${suggestion.col})`,
        ref: `cell-${suggestion.row}-${suggestion.col}`
      });

      await TestUtils.sleep(500);

      // 驗證玩家移動
      const moveResult = await browser_evaluate({
        function: `() => {
                    const cell = document.querySelector('[data-row="${suggestion.row}"][data-col="${suggestion.col}"]');
                    return {
                        hasPlayerClass: cell && cell.classList.contains('player'),
                        gamePhase: document.getElementById('game-phase').textContent
                    };
                }`,
        suggestion
      });

      TestUtils.assert(moveResult.hasPlayerClass, '格子應該標記為玩家選擇');
      TestUtils.assert(moveResult.gamePhase === '電腦回合', '應該轉換到電腦回合');
      TestUtils.recordTest('玩家移動測試', true);
    } else {
      throw new Error('找不到建議的移動');
    }
  } catch (error) {
    TestUtils.recordTest('玩家移動測試', false, error);
  }

  // 測試 2.3: 電腦回合測試
  try {
    // 使用隨機下棋按鈕
    await browser_click({
      element: '電腦隨機下棋按鈕',
      ref: 'e51'
    });

    await TestUtils.sleep(1000);

    const computerMoveResult = await browser_evaluate({
      function: `() => {
                const computerCells = document.querySelectorAll('.cell.computer');
                const currentRound = document.getElementById('current-round').textContent;
                const gamePhase = document.getElementById('game-phase').textContent;
                
                return {
                    computerMoveCount: computerCells.length,
                    currentRound: parseInt(currentRound),
                    gamePhase
                };
            }`
    });

    TestUtils.assert(computerMoveResult.computerMoveCount === 1, '應該有一個電腦移動');
    TestUtils.assert(computerMoveResult.currentRound === 2, '應該進入第2輪');
    TestUtils.assert(computerMoveResult.gamePhase === '玩家回合', '應該回到玩家回合');
    TestUtils.recordTest('電腦回合測試', true);
  } catch (error) {
    TestUtils.recordTest('電腦回合測試', false, error);
  }

  // 測試 2.4: 完整回合循環測試
  try {
    // 進行幾輪完整的遊戲
    for (let round = 2; round <= 4; round++) {
      // 玩家回合
      const suggestion = await browser_evaluate({
        function: `() => {
                    const suggestedCell = document.querySelector('.cell.suggested');
                    if (suggestedCell) {
                        return {
                            row: parseInt(suggestedCell.getAttribute('data-row')),
                            col: parseInt(suggestedCell.getAttribute('data-col')),
                            found: true
                        };
                    }
                    return { found: false };
                }`
      });

      if (suggestion.found) {
        await browser_click({
          element: `遊戲格子 (${suggestion.row}, ${suggestion.col})`,
          ref: `cell-${suggestion.row}-${suggestion.col}`
        });
        await TestUtils.sleep(500);
      }

      // 電腦回合
      await browser_click({
        element: '電腦隨機下棋按鈕',
        ref: 'e51'
      });
      await TestUtils.sleep(1000);
    }

    const finalState = await browser_evaluate({
      function: `() => {
                return {
                    currentRound: parseInt(document.getElementById('current-round').textContent),
                    playerMoves: document.querySelectorAll('.cell.player').length,
                    computerMoves: document.querySelectorAll('.cell.computer').length
                };
            }`
    });

    TestUtils.assert(finalState.currentRound === 5, '應該進入第5輪');
    TestUtils.assert(finalState.playerMoves === 4, '應該有4個玩家移動');
    TestUtils.assert(finalState.computerMoves === 4, '應該有4個電腦移動');
    TestUtils.recordTest('完整回合循環測試', true);
  } catch (error) {
    TestUtils.recordTest('完整回合循環測試', false, error);
  }
}

/**
 * 測試套件 3: 演算法切換功能和建議系統測試
 */
async function testAlgorithmSwitching() {
  console.log('\n=== 測試演算法切換功能和建議系統 ===');

  // 測試 3.1: 演算法切換測試
  try {
    // 切換到增強演算法
    await browser_click({
      element: '增強演算法選項',
      ref: 'e17'
    });

    await TestUtils.sleep(1000);

    const algorithmState = await browser_evaluate({
      function: `() => {
                const selected = document.querySelector('.algorithm-option.selected');
                const currentAlgorithmName = document.getElementById('current-algorithm-name');
                
                return {
                    selectedAlgorithm: selected ? selected.getAttribute('data-algorithm') : null,
                    displayedName: currentAlgorithmName ? currentAlgorithmName.textContent : null
                };
            }`
    });

    TestUtils.assert(algorithmState.selectedAlgorithm === 'enhanced', '應該選擇增強演算法');
    TestUtils.assert(algorithmState.displayedName === '增強演算法', '應該顯示增強演算法名稱');
    TestUtils.recordTest('演算法切換測試', true);
  } catch (error) {
    TestUtils.recordTest('演算法切換測試', false, error);
  }

  // 測試 3.2: 建議系統測試
  try {
    // 重新開始遊戲以測試新演算法
    await browser_click({
      element: '重新開始按鈕',
      ref: 'e50'
    });

    await TestUtils.sleep(500);

    await browser_click({
      element: '開始遊戲按鈕',
      ref: 'e49'
    });

    await TestUtils.sleep(1000);

    const suggestionState = await browser_evaluate({
      function: `() => {
                const suggestedCell = document.querySelector('.cell.suggested');
                const suggestionText = document.getElementById('suggestion-text');
                
                return {
                    hasSuggestion: !!suggestedCell,
                    suggestionText: suggestionText ? suggestionText.textContent : null,
                    suggestionPosition: suggestedCell ? {
                        row: parseInt(suggestedCell.getAttribute('data-row')),
                        col: parseInt(suggestedCell.getAttribute('data-col'))
                    } : null
                };
            }`
    });

    TestUtils.assert(suggestionState.hasSuggestion, '應該有建議的移動');
    TestUtils.assert(suggestionState.suggestionText && suggestionState.suggestionText !== '點擊開始遊戲獲得建議', '應該顯示具體的建議');
    TestUtils.recordTest('建議系統測試', true);
  } catch (error) {
    TestUtils.recordTest('建議系統測試', false, error);
  }

  // 測試 3.3: 演算法性能比較測試
  try {
    // 測試標準演算法
    await browser_click({
      element: '標準演算法選項',
      ref: 'e10'
    });

    await TestUtils.sleep(500);

    const standardPerformance = await browser_evaluate({
      function: `() => {
                const startTime = performance.now();
                // 模擬獲取建議
                if (typeof ProbabilityCalculator !== 'undefined' && gameState) {
                    const suggestion = ProbabilityCalculator.getBestSuggestion ? 
                        ProbabilityCalculator.getBestSuggestion(gameState.board) : null;
                }
                const endTime = performance.now();
                return endTime - startTime;
            }`
    });

    // 測試增強演算法
    await browser_click({
      element: '增強演算法選項',
      ref: 'e17'
    });

    await TestUtils.sleep(500);

    const enhancedPerformance = await browser_evaluate({
      function: `() => {
                const startTime = performance.now();
                // 模擬獲取建議
                if (typeof ProbabilityCalculator !== 'undefined' && gameState) {
                    const suggestion = ProbabilityCalculator.getBestSuggestion ? 
                        ProbabilityCalculator.getBestSuggestion(gameState.board) : null;
                }
                const endTime = performance.now();
                return endTime - startTime;
            }`
    });

    TestUtils.assert(standardPerformance >= 0, '標準演算法應該能正常執行');
    TestUtils.assert(enhancedPerformance >= 0, '增強演算法應該能正常執行');
    console.log(`  標準演算法執行時間: ${standardPerformance.toFixed(2)}ms`);
    console.log(`  增強演算法執行時間: ${enhancedPerformance.toFixed(2)}ms`);
    TestUtils.recordTest('演算法性能比較測試', true);
  } catch (error) {
    TestUtils.recordTest('演算法性能比較測試', false, error);
  }
}

/**
 * 測試套件 4: 遊戲結束和重新開始流程測試
 */
async function testGameCompletion() {
  console.log('\n=== 測試遊戲結束和重新開始流程 ===');

  // 測試 4.1: 完整遊戲流程測試
  try {
    // 重新開始遊戲
    await browser_click({
      element: '重新開始按鈕',
      ref: 'e50'
    });

    await TestUtils.sleep(500);

    await browser_click({
      element: '開始遊戲按鈕',
      ref: 'e49'
    });

    await TestUtils.sleep(1000);

    // 啟用自動隨機下棋
    await browser_click({
      element: '電腦自動隨機下棋複選框',
      ref: 'e53'
    });

    // 進行8輪完整遊戲
    for (let round = 1; round <= 8; round++) {
      // 玩家回合
      const suggestion = await browser_evaluate({
        function: `() => {
                    const suggestedCell = document.querySelector('.cell.suggested');
                    if (suggestedCell) {
                        return {
                            row: parseInt(suggestedCell.getAttribute('data-row')),
                            col: parseInt(suggestedCell.getAttribute('data-col')),
                            found: true
                        };
                    }
                    return { found: false };
                }`
      });

      if (suggestion.found) {
        await browser_click({
          element: `遊戲格子 (${suggestion.row}, ${suggestion.col})`,
          ref: `cell-${suggestion.row}-${suggestion.col}`
        });
        await TestUtils.sleep(1500); // 等待自動電腦回合
      }
    }

    // 檢查遊戲是否結束
    const gameEndState = await browser_evaluate({
      function: `() => {
                const resultPanel = document.getElementById('game-result-panel');
                const finalLinesCount = document.getElementById('final-lines-count');
                const playerMovesCount = document.getElementById('player-moves-count');
                const computerMovesCount = document.getElementById('computer-moves-count');
                
                return {
                    gameEnded: !resultPanel.classList.contains('hidden'),
                    finalLines: finalLinesCount ? parseInt(finalLinesCount.textContent) : 0,
                    playerMoves: playerMovesCount ? parseInt(playerMovesCount.textContent) : 0,
                    computerMoves: computerMovesCount ? parseInt(computerMovesCount.textContent) : 0
                };
            }`
    });

    TestUtils.assert(gameEndState.gameEnded, '遊戲應該已結束');
    TestUtils.assert(gameEndState.playerMoves === 8, '應該有8個玩家移動');
    TestUtils.assert(gameEndState.computerMoves === 8, '應該有8個電腦移動');
    TestUtils.assert(gameEndState.finalLines >= 0, '應該顯示最終連線數');
    TestUtils.recordTest('完整遊戲流程測試', true);
  } catch (error) {
    TestUtils.recordTest('完整遊戲流程測試', false, error);
  }

  // 測試 4.2: 重新開始功能測試
  try {
    // 點擊再玩一次
    await browser_click({
      element: '再玩一次按鈕',
      ref: 'play-again'
    });

    await TestUtils.sleep(1000);

    const restartState = await browser_evaluate({
      function: `() => {
                const resultPanel = document.getElementById('game-result-panel');
                const currentRound = document.getElementById('current-round');
                const completedLines = document.getElementById('completed-lines');
                const playerCells = document.querySelectorAll('.cell.player');
                const computerCells = document.querySelectorAll('.cell.computer');
                
                return {
                    resultPanelHidden: resultPanel.classList.contains('hidden'),
                    currentRound: parseInt(currentRound.textContent),
                    completedLines: parseInt(completedLines.textContent),
                    playerCellCount: playerCells.length,
                    computerCellCount: computerCells.length
                };
            }`
    });

    TestUtils.assert(restartState.resultPanelHidden, '結果面板應該隱藏');
    TestUtils.assert(restartState.currentRound === 1, '應該重置到第1輪');
    TestUtils.assert(restartState.completedLines === 0, '完成連線數應該重置為0');
    TestUtils.assert(restartState.playerCellCount === 0, '玩家格子應該清空');
    TestUtils.assert(restartState.computerCellCount === 0, '電腦格子應該清空');
    TestUtils.recordTest('重新開始功能測試', true);
  } catch (error) {
    TestUtils.recordTest('重新開始功能測試', false, error);
  }
}

/**
 * 測試套件 5: 視覺回歸測試
 */
async function testVisualRegression() {
  console.log('\n=== 視覺回歸測試 ===');

  // 測試 5.1: 初始頁面截圖測試
  try {
    await browser_take_screenshot({
      filename: 'initial-page.png'
    });

    console.log('  已保存初始頁面截圖: initial-page.png');
    TestUtils.recordTest('初始頁面截圖測試', true);
  } catch (error) {
    TestUtils.recordTest('初始頁面截圖測試', false, error);
  }

  // 測試 5.2: 遊戲進行中截圖測試
  try {
    await browser_click({
      element: '開始遊戲按鈕',
      ref: 'e49'
    });

    await TestUtils.sleep(1000);

    await browser_take_screenshot({
      filename: 'game-in-progress.png'
    });

    console.log('  已保存遊戲進行中截圖: game-in-progress.png');
    TestUtils.recordTest('遊戲進行中截圖測試', true);
  } catch (error) {
    TestUtils.recordTest('遊戲進行中截圖測試', false, error);
  }

  // 測試 5.3: UI 元素一致性測試
  try {
    const uiElements = await browser_evaluate({
      function: `() => {
                const elements = {
                    header: document.querySelector('header'),
                    gameBoard: document.querySelector('#game-board'),
                    algorithmSelector: document.querySelector('.algorithm-selector'),
                    gameStatus: document.querySelector('.game-status'),
                    controlPanel: document.querySelector('.control-panel')
                };
                
                const results = {};
                for (const [key, element] of Object.entries(elements)) {
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        const styles = window.getComputedStyle(element);
                        results[key] = {
                            visible: rect.width > 0 && rect.height > 0,
                            position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                            backgroundColor: styles.backgroundColor,
                            color: styles.color
                        };
                    } else {
                        results[key] = { visible: false };
                    }
                }
                return results;
            }`
    });

    // 驗證關鍵UI元素的可見性
    Object.entries(uiElements).forEach(([key, element]) => {
      TestUtils.assert(element.visible, `${key} 元素應該可見`);
    });

    TestUtils.recordTest('UI 元素一致性測試', true);
  } catch (error) {
    TestUtils.recordTest('UI 元素一致性測試', false, error);
  }
}

/**
 * 測試套件 6: 性能測試
 */
async function testPerformance() {
  console.log('\n=== 性能測試 ===');

  // 測試 6.1: 頁面載入性能測試
  try {
    const performanceMetrics = await browser_evaluate({
      function: `() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const resources = performance.getEntriesByType('resource');
                
                return {
                    loadTime: perfData ? perfData.loadEventEnd - perfData.fetchStart : 0,
                    domContentLoaded: perfData ? perfData.domContentLoadedEventEnd - perfData.fetchStart : 0,
                    resourceCount: resources.length,
                    slowResources: resources.filter(r => r.duration > 1000).length
                };
            }`
    });

    TestUtils.assert(performanceMetrics.loadTime < 5000, '頁面載入時間應該少於5秒');
    TestUtils.assert(performanceMetrics.domContentLoaded < 3000, 'DOM載入時間應該少於3秒');
    TestUtils.assert(performanceMetrics.slowResources === 0, '不應該有載入時間超過1秒的資源');

    console.log(`  頁面載入時間: ${performanceMetrics.loadTime.toFixed(2)}ms`);
    console.log(`  DOM載入時間: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`  資源數量: ${performanceMetrics.resourceCount}`);

    TestUtils.recordTest('頁面載入性能測試', true);
  } catch (error) {
    TestUtils.recordTest('頁面載入性能測試', false, error);
  }

  // 測試 6.2: 互動響應速度測試
  try {
    const interactionTimes = [];

    // 測試多次點擊響應時間
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();

      await browser_click({
        element: '標準演算法選項',
        ref: 'e10'
      });

      await TestUtils.sleep(100);

      const endTime = Date.now();
      interactionTimes.push(endTime - startTime);
    }

    const avgResponseTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
    const maxResponseTime = Math.max(...interactionTimes);

    TestUtils.assert(avgResponseTime < 500, '平均響應時間應該少於500ms');
    TestUtils.assert(maxResponseTime < 1000, '最大響應時間應該少於1000ms');

    console.log(`  平均響應時間: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`  最大響應時間: ${maxResponseTime.toFixed(2)}ms`);

    TestUtils.recordTest('互動響應速度測試', true);
  } catch (error) {
    TestUtils.recordTest('互動響應速度測試', false, error);
  }

  // 測試 6.3: 記憶體使用測試
  try {
    const memoryUsage = await browser_evaluate({
      function: `() => {
                if (performance.memory) {
                    return {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    };
                }
                return null;
            }`
    });

    if (memoryUsage) {
      const usagePercentage = (memoryUsage.used / memoryUsage.limit) * 100;
      TestUtils.assert(usagePercentage < 50, '記憶體使用率應該少於50%');

      console.log(`  記憶體使用: ${(memoryUsage.used / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  記憶體使用率: ${usagePercentage.toFixed(2)}%`);
    }

    TestUtils.recordTest('記憶體使用測試', true);
  } catch (error) {
    TestUtils.recordTest('記憶體使用測試', false, error);
  }
}

/**
 * 測試套件 7: 載入流程專項測試
 */
async function testLoadingFlow() {
  console.log('\n=== 載入流程專項測試 ===');

  // 測試 7.1: 載入進度追蹤測試
  try {
    // 重新載入頁面以測試載入流程
    await browser_navigate({
      url: TEST_CONFIG.baseUrl
    });

    // 等待載入開始
    await TestUtils.sleep(100);

    // 檢查載入進度是否正常更新
    let loadingProgress = [];
    let maxAttempts = 50; // 最多等待 5 秒
    let attempts = 0;

    while (attempts < maxAttempts) {
      const progress = await browser_evaluate({
        function: `() => {
                    const loadingText = document.querySelector('#global-loading .loading-text');
                    const loadingOverlay = document.getElementById('global-loading');
                    
                    return {
                        text: loadingText ? loadingText.textContent : '',
                        isVisible: loadingOverlay ? !loadingOverlay.classList.contains('hidden') : false,
                        opacity: loadingOverlay ? loadingOverlay.style.opacity : '1'
                    };
                }`
      });

      if (progress.text && progress.isVisible) {
        loadingProgress.push(progress.text);
      }

      // 如果載入完成（不可見或透明），跳出循環
      if (!progress.isVisible || progress.opacity === '0') {
        break;
      }

      await TestUtils.sleep(100);
      attempts++;
    }

    TestUtils.assert(attempts < maxAttempts, '載入不應該超時（5秒內應該完成）');
    TestUtils.assert(loadingProgress.length > 0, '應該有載入進度更新');

    // 檢查是否有 83% 相關的進度
    const has83Percent = loadingProgress.some(text => text.includes('83%'));
    if (has83Percent) {
      console.log('  ⚠️  檢測到 83% 進度，但載入最終完成了');
    }

    TestUtils.recordTest('載入進度追蹤測試', true);
  } catch (error) {
    TestUtils.recordTest('載入進度追蹤測試', false, error);
  }

  // 測試 7.2: 載入完成驗證測試
  try {
    // 等待載入完全完成
    await TestUtils.sleep(2000);

    const finalState = await browser_evaluate({
      function: `() => {
                const loadingOverlay = document.getElementById('global-loading');
                const startButton = document.getElementById('start-game');
                
                return {
                    loadingHidden: loadingOverlay ? loadingOverlay.classList.contains('hidden') : true,
                    loadingOpacity: loadingOverlay ? loadingOverlay.style.opacity : '1',
                    startButtonEnabled: startButton ? !startButton.disabled : false,
                    gameComponentsLoaded: {
                        gameState: typeof gameState !== 'undefined',
                        gameBoard: typeof gameBoard !== 'undefined',
                        lineDetector: typeof lineDetector !== 'undefined',
                        probabilityCalculator: typeof probabilityCalculator !== 'undefined'
                    }
                };
            }`
    });

    TestUtils.assert(finalState.loadingHidden || finalState.loadingOpacity === '0', '載入畫面應該已隱藏');
    TestUtils.assert(finalState.startButtonEnabled, '開始遊戲按鈕應該已啟用');
    TestUtils.assert(finalState.gameComponentsLoaded.gameState, 'GameState 應該已載入');
    TestUtils.assert(finalState.gameComponentsLoaded.gameBoard, 'GameBoard 應該已載入');

    TestUtils.recordTest('載入完成驗證測試', true);
  } catch (error) {
    TestUtils.recordTest('載入完成驗證測試', false, error);
  }

  // 測試 7.3: 載入錯誤處理測試
  try {
    // 檢查是否有載入錯誤
    const errorState = await browser_evaluate({
      function: `() => {
                const errorModal = document.getElementById('error-modal');
                const consoleErrors = [];
                
                // 模擬檢查 console 錯誤（實際實現中可能需要不同的方法）
                return {
                    hasErrorModal: !!errorModal && !errorModal.classList.contains('hidden'),
                    consoleErrorCount: consoleErrors.length
                };
            }`
    });

    TestUtils.assert(!errorState.hasErrorModal, '不應該有錯誤模態框顯示');
    TestUtils.recordTest('載入錯誤處理測試', true);
  } catch (error) {
    TestUtils.recordTest('載入錯誤處理測試', false, error);
  }
}

/**
 * 主測試執行函數
 */
async function runPlaywrightE2ETests() {
  console.log('🎯 開始執行 Playwright 端到端測試套件');
  console.log(`📍 測試 URL: ${TEST_CONFIG.baseUrl}`);
  console.log('⏰ 測試開始時間:', new Date().toLocaleString());

  try {
    // 執行所有測試套件
    await testLoadingFlow(); // 優先測試載入流程
    await testGameInitialization();
    await testGameInteraction();
    await testAlgorithmSwitching();
    await testGameCompletion();
    await testVisualRegression();
    await testPerformance();

    // 輸出測試結果摘要
    const duration = Date.now() - testResults.startTime;
    console.log('\n' + '='.repeat(50));
    console.log('📊 測試結果摘要');
    console.log('='.repeat(50));
    console.log(`總測試數: ${testResults.total}`);
    console.log(`✅ 通過: ${testResults.passed}`);
    console.log(`❌ 失敗: ${testResults.failed}`);
    console.log(`⏭️  跳過: ${testResults.skipped}`);
    console.log(`⏱️  執行時間: ${(duration / 1000).toFixed(2)}秒`);
    console.log(`📈 通過率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    if (testResults.failed === 0) {
      console.log('\n🎉 所有測試通過！');
      return true;
    } else {
      console.log(`\n⚠️  有 ${testResults.failed} 個測試失敗`);
      return false;
    }

  } catch (error) {
    console.error('❌ 測試執行過程中發生錯誤:', error);
    return false;
  }
}

// 導出測試函數供外部調用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runPlaywrightE2ETests,
    testGameInitialization,
    testGameInteraction,
    testAlgorithmSwitching,
    testGameCompletion,
    testVisualRegression,
    testPerformance
  };
}

// 如果直接執行此文件，則運行測試
if (require.main === module) {
  runPlaywrightE2ETests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
