/**
 * Bingo 遊戲模擬器 - Playwright 功能測試計畫
 * 使用 Playwright MCP Server 進行完整的功能測試
 */

class BingoGameFunctionTests {
    constructor() {
        this.baseUrl = `file://${process.cwd()}/index.html`;
        this.testResults = [];
        this.currentTestIndex = 0;
        this.startTime = Date.now();
    }

    /**
     * 等待元素穩定並可點擊
     */
    async waitForElementStable(selector, timeout = 5000) {
        try {
            await page.waitForSelector(selector, { timeout });
            await page.waitForTimeout(100); // 短暫等待確保元素穩定
            return true;
        } catch (error) {
            console.warn(`元素 ${selector} 等待超時: ${error.message}`);
            return false;
        }
    }

    /**
     * 安全點擊元素
     */
    async safeClick(selector, description = '') {
        try {
            const element = page.locator(selector);
            await element.waitFor({ state: 'visible', timeout: 5000 });
            await element.click();
            await page.waitForTimeout(200); // 等待點擊效果
            return true;
        } catch (error) {
            console.warn(`點擊 ${description || selector} 失敗: ${error.message}`);
            return false;
        }
    }

    /**
     * 獲取元素文本內容
     */
    async getTextContent(selector, defaultValue = '') {
        try {
            const element = page.locator(selector);
            await element.waitFor({ state: 'visible', timeout: 3000 });
            return await element.textContent() || defaultValue;
        } catch (error) {
            console.warn(`獲取 ${selector} 文本失敗: ${error.message}`);
            return defaultValue;
        }
    }

    /**
     * 檢查元素是否存在
     */
    async elementExists(selector) {
        try {
            return await page.locator(selector).count() > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * 記錄測試步驟
     */
    logTestStep(step, status = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const statusIcon = status === 'success' ? '✅' : status === 'error' ? '❌' : 'ℹ️';
        console.log(`[${timestamp}] ${statusIcon} ${step}`);
    }

    /**
     * 測試 1: 頁面載入和初始狀態驗證
     */
    async testPageLoadAndInitialState() {
        this.logTestStep('開始測試 1: 頁面載入和初始狀態驗證');
        
        const results = {
            testName: '頁面載入和初始狀態',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 等待頁面完全載入
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(1000); // 等待JavaScript初始化
            
            // 驗證頁面標題
            const title = await page.title();
            if (title === 'Bingo遊戲模擬器') {
                results.details.push('✅ 頁面標題正確');
                this.logTestStep('頁面標題驗證通過', 'success');
            } else {
                results.details.push(`❌ 頁面標題錯誤: ${title}`);
                results.passed = false;
                this.logTestStep(`頁面標題錯誤: ${title}`, 'error');
            }

            // 驗證主要UI元素存在
            const mainElements = [
                { selector: 'h1', name: '主標題' },
                { selector: '.algorithm-selector', name: '演算法選擇器' },
                { selector: '.game-status', name: '遊戲狀態' },
                { selector: '.game-controls', name: '遊戲控制' },
                { selector: '#start-game', name: '開始遊戲按鈕' },
                { selector: '.suggestion-panel', name: '建議面板' },
                { selector: '.computer-input-panel', name: '電腦輸入面板' },
                { selector: '.instructions', name: '操作指示' }
            ];

            for (const element of mainElements) {
                const exists = await this.elementExists(element.selector);
                if (exists) {
                    results.details.push(`✅ ${element.name} 存在`);
                    this.logTestStep(`${element.name} 驗證通過`, 'success');
                } else {
                    results.details.push(`❌ ${element.name} 不存在`);
                    results.passed = false;
                    this.logTestStep(`${element.name} 不存在`, 'error');
                }
            }

            // 驗證初始遊戲狀態
            const currentRound = await this.getTextContent('.current-round', '0');
            const gamePhase = await this.getTextContent('.game-phase', '');
            const completedLines = await this.getTextContent('.completed-lines', '0');

            if (currentRound === '1') {
                results.details.push('✅ 初始輪數正確 (1)');
                this.logTestStep('初始輪數驗證通過', 'success');
            } else {
                results.details.push(`❌ 初始輪數錯誤: ${currentRound}`);
                results.passed = false;
                this.logTestStep(`初始輪數錯誤: ${currentRound}`, 'error');
            }

            if (gamePhase.includes('玩家回合')) {
                results.details.push('✅ 初始遊戲階段正確');
                this.logTestStep('初始遊戲階段驗證通過', 'success');
            } else {
                results.details.push(`❌ 初始遊戲階段錯誤: ${gamePhase}`);
                results.passed = false;
                this.logTestStep(`初始遊戲階段錯誤: ${gamePhase}`, 'error');
            }

            if (completedLines === '0') {
                results.details.push('✅ 初始完成連線數正確 (0)');
                this.logTestStep('初始完成連線數驗證通過', 'success');
            } else {
                results.details.push(`❌ 初始完成連線數錯誤: ${completedLines}`);
                results.passed = false;
                this.logTestStep(`初始完成連線數錯誤: ${completedLines}`, 'error');
            }

            // 驗證演算法選擇器狀態
            const currentAlgorithm = await this.getTextContent('.current-algorithm', '');
            if (currentAlgorithm.includes('標準演算法')) {
                results.details.push('✅ 初始演算法正確設置為標準演算法');
                this.logTestStep('初始演算法驗證通過', 'success');
            } else {
                results.details.push(`❌ 初始演算法設置錯誤: ${currentAlgorithm}`);
                results.passed = false;
                this.logTestStep(`初始演算法錯誤: ${currentAlgorithm}`, 'error');
            }

            // 檢查控制台是否有錯誤
            const consoleMessages = await page.evaluate(() => {
                return window.console._messages || [];
            });
            
            const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
            if (errorMessages.length === 0) {
                results.details.push('✅ 無控制台錯誤');
                this.logTestStep('控制台錯誤檢查通過', 'success');
            } else {
                results.details.push(`⚠️ 發現 ${errorMessages.length} 個控制台錯誤`);
                this.logTestStep(`發現控制台錯誤: ${errorMessages.length}`, 'error');
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.logTestStep(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.logTestStep(`測試 1 完成，耗時: ${results.duration}ms`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 測試 2: 演算法切換功能
     */
    async testAlgorithmSwitching() {
        console.log('🧪 測試 2: 演算法切換功能');
        
        const results = {
            testName: '演算法切換功能',
            passed: true,
            details: []
        };

        try {
            // 驗證初始演算法是標準演算法
            const initialAlgorithm = await page.locator('.current-algorithm').textContent();
            if (initialAlgorithm.includes('標準演算法')) {
                results.details.push('✅ 初始演算法為標準演算法');
            } else {
                results.details.push(`❌ 初始演算法錯誤: ${initialAlgorithm}`);
                results.passed = false;
            }

            // 點擊切換到增強演算法
            await page.locator('.enhanced-algorithm').click();
            await page.waitForTimeout(500); // 等待切換完成

            // 驗證演算法已切換
            const switchedAlgorithm = await page.locator('.current-algorithm').textContent();
            if (switchedAlgorithm.includes('增強演算法')) {
                results.details.push('✅ 成功切換到增強演算法');
            } else {
                results.details.push(`❌ 演算法切換失敗: ${switchedAlgorithm}`);
                results.passed = false;
            }

            // 切換回標準演算法
            await page.locator('.standard-algorithm').click();
            await page.waitForTimeout(500);

            const backToStandard = await page.locator('.current-algorithm').textContent();
            if (backToStandard.includes('標準演算法')) {
                results.details.push('✅ 成功切換回標準演算法');
            } else {
                results.details.push(`❌ 切換回標準演算法失敗: ${backToStandard}`);
                results.passed = false;
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
        }

        this.testResults.push(results);
        return results;
    }

    /**
     * 測試 3: 遊戲開始和遊戲板互動
     */
    async testGameStartAndBoardInteraction() {
        console.log('🧪 測試 3: 遊戲開始和遊戲板互動');
        
        const results = {
            testName: '遊戲開始和遊戲板互動',
            passed: true,
            details: []
        };

        try {
            // 點擊開始遊戲
            await page.locator('#start-game').click();
            await page.waitForTimeout(1000); // 等待遊戲初始化

            // 驗證遊戲板是否出現
            const gameBoardExists = await page.locator('#game-board').count() > 0;
            if (gameBoardExists) {
                results.details.push('✅ 遊戲板成功顯示');
            } else {
                results.details.push('❌ 遊戲板未顯示');
                results.passed = false;
                return results;
            }

            // 驗證遊戲板有25個格子
            const cellCount = await page.locator('.cell').count();
            if (cellCount === 25) {
                results.details.push('✅ 遊戲板有正確的25個格子');
            } else {
                results.details.push(`❌ 遊戲板格子數量錯誤: ${cellCount}`);
                results.passed = false;
            }

            // 驗證建議移動是否顯示
            const suggestionExists = await page.locator('.suggestion').count() > 0;
            if (suggestionExists) {
                results.details.push('✅ 建議移動正確顯示');
            } else {
                results.details.push('❌ 建議移動未顯示');
                results.passed = false;
            }

            // 測試點擊空格子
            const emptyCells = await page.locator('.cell:not(.player):not(.computer)');
            const firstEmptyCell = emptyCells.first();
            
            if (await firstEmptyCell.count() > 0) {
                await firstEmptyCell.click();
                await page.waitForTimeout(500);

                // 驗證格子是否被標記為玩家選擇
                const isPlayerCell = await firstEmptyCell.locator('.player').count() > 0;
                if (isPlayerCell) {
                    results.details.push('✅ 玩家點擊格子成功標記');
                } else {
                    results.details.push('❌ 玩家點擊格子未正確標記');
                    results.passed = false;
                }

                // 驗證遊戲階段是否切換到電腦回合
                const gamePhase = await page.locator('.game-phase').textContent();
                if (gamePhase.includes('電腦回合')) {
                    results.details.push('✅ 遊戲階段正確切換到電腦回合');
                } else {
                    results.details.push(`❌ 遊戲階段未正確切換: ${gamePhase}`);
                    results.passed = false;
                }
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
        }

        this.testResults.push(results);
        return results;
    }

    /**
     * 測試 4: 電腦回合和隨機移動
     */
    async testComputerTurnAndRandomMove() {
        console.log('🧪 測試 4: 電腦回合和隨機移動');
        
        const results = {
            testName: '電腦回合和隨機移動',
            passed: true,
            details: []
        };

        try {
            // 確保處於電腦回合
            const gamePhase = await page.locator('.game-phase').textContent();
            if (!gamePhase.includes('電腦回合')) {
                results.details.push('⚠️ 跳過測試：不在電腦回合狀態');
                return results;
            }

            // 記錄電腦移動前的狀態
            const computerCellsBefore = await page.locator('.cell.computer').count();

            // 點擊電腦隨機下棋按鈕
            await page.locator('#random-computer-move').click();
            await page.waitForTimeout(1000); // 等待電腦移動完成

            // 驗證電腦是否下了一步棋
            const computerCellsAfter = await page.locator('.cell.computer').count();
            if (computerCellsAfter === computerCellsBefore + 1) {
                results.details.push('✅ 電腦成功下了一步棋');
            } else {
                results.details.push(`❌ 電腦移動失敗，電腦格子數: ${computerCellsBefore} -> ${computerCellsAfter}`);
                results.passed = false;
            }

            // 驗證遊戲階段是否切換回玩家回合或下一輪
            const newGamePhase = await page.locator('.game-phase').textContent();
            if (newGamePhase.includes('玩家回合') || newGamePhase.includes('遊戲結束')) {
                results.details.push('✅ 遊戲階段正確切換');
            } else {
                results.details.push(`❌ 遊戲階段切換錯誤: ${newGamePhase}`);
                results.passed = false;
            }

            // 驗證輪數是否正確更新
            const currentRound = await page.locator('.current-round').textContent();
            const roundNumber = parseInt(currentRound);
            if (roundNumber >= 1 && roundNumber <= 8) {
                results.details.push(`✅ 輪數正確更新: ${roundNumber}`);
            } else {
                results.details.push(`❌ 輪數更新錯誤: ${currentRound}`);
                results.passed = false;
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
        }

        this.testResults.push(results);
        return results;
    }

    /**
     * 測試 5: 連線檢測功能
     */
    async testLineDetection() {
        console.log('🧪 測試 5: 連線檢測功能');
        
        const results = {
            testName: '連線檢測功能',
            passed: true,
            details: []
        };

        try {
            // 重新開始遊戲以確保乾淨的狀態
            await page.locator('#restart-game').click();
            await page.waitForTimeout(500);
            await page.locator('#start-game').click();
            await page.waitForTimeout(1000);

            // 模擬完成一條水平線 (第一行)
            const firstRowCells = [
                page.locator('.cell[data-row="0"][data-col="0"]'),
                page.locator('.cell[data-row="0"][data-col="1"]'),
                page.locator('.cell[data-row="0"][data-col="2"]'),
                page.locator('.cell[data-row="0"][data-col="3"]'),
                page.locator('.cell[data-row="0"][data-col="4"]')
            ];

            // 交替點擊玩家和電腦格子來完成第一行
            for (let i = 0; i < firstRowCells.length; i++) {
                if (await firstRowCells[i].count() > 0) {
                    await firstRowCells[i].click();
                    await page.waitForTimeout(500);
                    
                    // 如果不是最後一個格子且處於電腦回合，讓電腦隨機下棋
                    const gamePhase = await page.locator('.game-phase').textContent();
                    if (i < firstRowCells.length - 1 && gamePhase.includes('電腦回合')) {
                        await page.locator('#random-computer-move').click();
                        await page.waitForTimeout(500);
                    }
                }
            }

            // 檢查是否檢測到連線
            const completedLines = await page.locator('.completed-lines').textContent();
            const lineCount = parseInt(completedLines);
            
            if (lineCount > 0) {
                results.details.push(`✅ 成功檢測到連線: ${lineCount} 條`);
            } else {
                results.details.push('❌ 未檢測到連線');
                results.passed = false;
            }

            // 檢查是否有連線高亮顯示
            const highlightedCells = await page.locator('.cell.line-highlight').count();
            if (highlightedCells >= 5) {
                results.details.push(`✅ 連線高亮顯示正常: ${highlightedCells} 個格子`);
            } else {
                results.details.push(`❌ 連線高亮顯示異常: ${highlightedCells} 個格子`);
                results.passed = false;
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
        }

        this.testResults.push(results);
        return results;
    }

    /**
     * 測試 6: 完整遊戲流程
     */
    async testCompleteGameFlow() {
        console.log('🧪 測試 6: 完整遊戲流程');
        
        const results = {
            testName: '完整遊戲流程',
            passed: true,
            details: []
        };

        try {
            // 重新開始遊戲
            await page.locator('#restart-game').click();
            await page.waitForTimeout(500);
            await page.locator('#start-game').click();
            await page.waitForTimeout(1000);

            // 啟用電腦自動隨機下棋
            const autoCheckbox = page.locator('#auto-computer-move');
            if (await autoCheckbox.count() > 0) {
                await autoCheckbox.check();
                results.details.push('✅ 啟用電腦自動隨機下棋');
            }

            // 進行8輪遊戲
            for (let round = 1; round <= 8; round++) {
                const currentRound = await page.locator('.current-round').textContent();
                if (parseInt(currentRound) !== round) {
                    results.details.push(`❌ 輪數不匹配，期望: ${round}，實際: ${currentRound}`);
                    results.passed = false;
                    break;
                }

                // 玩家回合：點擊建議的格子或任意空格子
                const gamePhase = await page.locator('.game-phase').textContent();
                if (gamePhase.includes('玩家回合')) {
                    const suggestedCell = page.locator('.cell.suggestion').first();
                    if (await suggestedCell.count() > 0) {
                        await suggestedCell.click();
                    } else {
                        const emptyCells = page.locator('.cell:not(.player):not(.computer)');
                        if (await emptyCells.count() > 0) {
                            await emptyCells.first().click();
                        }
                    }
                    await page.waitForTimeout(1000); // 等待電腦自動移動
                }

                results.details.push(`✅ 完成第 ${round} 輪`);
            }

            // 驗證遊戲是否結束
            const finalGamePhase = await page.locator('.game-phase').textContent();
            if (finalGamePhase.includes('遊戲結束')) {
                results.details.push('✅ 遊戲正確結束');
            } else {
                results.details.push(`❌ 遊戲未正確結束，當前階段: ${finalGamePhase}`);
                results.passed = false;
            }

            // 檢查最終結果
            const finalLines = await page.locator('.completed-lines').textContent();
            results.details.push(`✅ 最終完成連線數: ${finalLines}`);

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
        }

        this.testResults.push(results);
        return results;
    }

    /**
     * 測試 7: 響應式設計和視覺元素
     */
    async testResponsiveDesignAndVisuals() {
        console.log('🧪 測試 7: 響應式設計和視覺元素');
        
        const results = {
            testName: '響應式設計和視覺元素',
            passed: true,
            details: []
        };

        try {
            // 測試不同螢幕尺寸
            const viewports = [
                { width: 1920, height: 1080, name: '桌面' },
                { width: 768, height: 1024, name: '平板' },
                { width: 375, height: 667, name: '手機' }
            ];

            for (const viewport of viewports) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.waitForTimeout(500);

                // 檢查主要元素是否可見
                const mainElements = [
                    { selector: 'h1', name: '主標題' },
                    { selector: '.algorithm-selector', name: '演算法選擇器' },
                    { selector: '.game-controls', name: '遊戲控制' }
                ];

                let allVisible = true;
                for (const element of mainElements) {
                    const isVisible = await page.locator(element.selector).isVisible();
                    if (!isVisible) {
                        allVisible = false;
                        break;
                    }
                }

                if (allVisible) {
                    results.details.push(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) 顯示正常`);
                } else {
                    results.details.push(`❌ ${viewport.name} (${viewport.width}x${viewport.height}) 顯示異常`);
                    results.passed = false;
                }
            }

            // 恢復到標準桌面尺寸
            await page.setViewportSize({ width: 1920, height: 1080 });

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
        }

        this.testResults.push(results);
        return results;
    }

    /**
     * 測試 8: 性能和載入時間
     */
    async testPerformanceAndLoadTime() {
        console.log('🧪 測試 8: 性能和載入時間');
        
        const results = {
            testName: '性能和載入時間',
            passed: true,
            details: []
        };

        try {
            // 重新載入頁面並測量載入時間
            const startTime = Date.now();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;

            if (loadTime < 3000) {
                results.details.push(`✅ 頁面載入時間良好: ${loadTime}ms`);
            } else {
                results.details.push(`⚠️ 頁面載入時間較長: ${loadTime}ms`);
            }

            // 測試遊戲初始化時間
            const initStartTime = Date.now();
            await page.locator('#start-game').click();
            await page.waitForSelector('#game-board', { timeout: 5000 });
            const initTime = Date.now() - initStartTime;

            if (initTime < 2000) {
                results.details.push(`✅ 遊戲初始化時間良好: ${initTime}ms`);
            } else {
                results.details.push(`⚠️ 遊戲初始化時間較長: ${initTime}ms`);
            }

            // 測試建議計算響應時間
            const suggestionStartTime = Date.now();
            const emptyCells = page.locator('.cell:not(.player):not(.computer)');
            if (await emptyCells.count() > 0) {
                await emptyCells.first().click();
                await page.waitForSelector('.suggestion', { timeout: 3000 });
                const suggestionTime = Date.now() - suggestionStartTime;

                if (suggestionTime < 1000) {
                    results.details.push(`✅ 建議計算響應時間良好: ${suggestionTime}ms`);
                } else {
                    results.details.push(`⚠️ 建議計算響應時間較長: ${suggestionTime}ms`);
                }
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
        }

        this.testResults.push(results);
        return results;
    }

    /**
     * 執行所有測試
     */
    async runAllTests() {
        console.log('🚀 開始執行 Bingo 遊戲功能測試套件');
        console.log('=' .repeat(50));

        const tests = [
            this.testPageLoadAndInitialState,
            this.testAlgorithmSwitching,
            this.testGameStartAndBoardInteraction,
            this.testComputerTurnAndRandomMove,
            this.testLineDetection,
            this.testCompleteGameFlow,
            this.testResponsiveDesignAndVisuals,
            this.testPerformanceAndLoadTime
        ];

        for (const test of tests) {
            try {
                await test.call(this);
                console.log(''); // 空行分隔
            } catch (error) {
                console.error(`測試執行失敗: ${error.message}`);
            }
        }

        this.generateTestReport();
    }

    /**
     * 生成測試報告
     */
    generateTestReport() {
        console.log('📊 測試報告');
        console.log('=' .repeat(50));

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;

        console.log(`總測試數: ${totalTests}`);
        console.log(`通過: ${passedTests}`);
        console.log(`失敗: ${failedTests}`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        console.log('');

        // 詳細結果
        this.testResults.forEach((test, index) => {
            const status = test.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${index + 1}. ${test.testName}: ${status}`);
            
            if (test.details.length > 0) {
                test.details.forEach(detail => {
                    console.log(`   ${detail}`);
                });
            }
            console.log('');
        });

        // 生成 HTML 報告
        this.generateHTMLReport();
    }

    /**
     * 生成 HTML 測試報告
     */
    generateHTMLReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;

        const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bingo 遊戲功能測試報告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
        .summary-item { text-align: center; padding: 20px; border-radius: 8px; }
        .total { background-color: #e3f2fd; }
        .passed { background-color: #e8f5e8; }
        .failed { background-color: #ffebee; }
        .test-result { margin-bottom: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid; }
        .test-passed { background-color: #f1f8e9; border-left-color: #4caf50; }
        .test-failed { background-color: #fce4ec; border-left-color: #f44336; }
        .test-title { font-weight: bold; margin-bottom: 10px; }
        .test-details { margin-left: 20px; }
        .test-details li { margin-bottom: 5px; }
        .timestamp { text-align: center; color: #666; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Bingo 遊戲功能測試報告</h1>
            <p>使用 Playwright MCP Server 進行的完整功能測試</p>
        </div>

        <div class="summary">
            <div class="summary-item total">
                <h3>${totalTests}</h3>
                <p>總測試數</p>
            </div>
            <div class="summary-item passed">
                <h3>${passedTests}</h3>
                <p>通過測試</p>
            </div>
            <div class="summary-item failed">
                <h3>${failedTests}</h3>
                <p>失敗測試</p>
            </div>
        </div>

        <div class="test-results">
            ${this.testResults.map((test, index) => `
                <div class="test-result ${test.passed ? 'test-passed' : 'test-failed'}">
                    <div class="test-title">
                        ${index + 1}. ${test.testName} ${test.passed ? '✅' : '❌'}
                    </div>
                    <ul class="test-details">
                        ${test.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>

        <div class="timestamp">
            <p>測試執行時間: ${new Date().toLocaleString('zh-TW')}</p>
            <p>成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%</p>
        </div>
    </div>
</body>
</html>`;

        // 這裡可以將 HTML 內容寫入檔案
        console.log('📄 HTML 測試報告已生成');
        return htmlContent;
    }
}

// 使用說明
console.log(`
🎯 Bingo 遊戲 Playwright 功能測試計畫

這個測試套件包含以下測試項目：

1. 頁面載入和初始狀態驗證
2. 演算法切換功能測試
3. 遊戲開始和遊戲板互動測試
4. 電腦回合和隨機移動測試
5. 連線檢測功能測試
6. 完整遊戲流程測試
7. 響應式設計和視覺元素測試
8. 性能和載入時間測試

使用方法：
const tester = new BingoGameFunctionTests();
await tester.runAllTests();
`);

module.exports = BingoGameFunctionTests;