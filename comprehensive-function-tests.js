/**
 * Bingo 遊戲模擬器 - 完整功能測試套件
 * 使用 Playwright MCP Server 進行全面的功能測試
 */

class ComprehensiveBingoTests {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
        this.currentTest = 0;
        this.totalTests = 8;
    }

    /**
     * 記錄測試步驟
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`[${timestamp}] ${icon} ${message}`);
    }

    /**
     * 等待元素出現
     */
    async waitForElement(selector, timeout = 5000) {
        try {
            await page.waitForSelector(selector, { timeout });
            return true;
        } catch (error) {
            this.log(`等待元素 ${selector} 超時: ${error.message}`, 'warning');
            return false;
        }
    }

    /**
     * 安全獲取元素文本
     */
    async getElementText(selector, defaultValue = '') {
        try {
            const element = await page.locator(selector).first();
            if (await element.count() > 0) {
                return await element.textContent() || defaultValue;
            }
            return defaultValue;
        } catch (error) {
            this.log(`獲取元素 ${selector} 文本失敗: ${error.message}`, 'warning');
            return defaultValue;
        }
    }

    /**
     * 安全點擊元素
     */
    async safeClick(selector, description = '') {
        try {
            const element = page.locator(selector).first();
            await element.waitFor({ state: 'visible', timeout: 5000 });
            await element.click();
            await page.waitForTimeout(300); // 等待點擊效果
            this.log(`成功點擊 ${description || selector}`, 'success');
            return true;
        } catch (error) {
            this.log(`點擊 ${description || selector} 失敗: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * 測試 1: 頁面載入和初始狀態驗證
     */
    async test1_PageLoadAndInitialState() {
        this.currentTest = 1;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 頁面載入和初始狀態驗證`);
        
        const results = {
            testName: '頁面載入和初始狀態驗證',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 等待頁面完全載入
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(1000);

            // 檢查頁面標題
            const title = await page.title();
            if (title === 'Bingo遊戲模擬器') {
                results.details.push('✅ 頁面標題正確');
                this.log('頁面標題驗證通過', 'success');
            } else {
                results.details.push(`❌ 頁面標題錯誤: ${title}`);
                results.passed = false;
                this.log(`頁面標題錯誤: ${title}`, 'error');
            }

            // 檢查主要UI元素
            const uiElements = [
                { selector: 'h1', name: '主標題' },
                { selector: '.algorithm-selector', name: '演算法選擇器' },
                { selector: '.game-status', name: '遊戲狀態' },
                { selector: '.game-controls', name: '遊戲控制' },
                { selector: '#start-game', name: '開始遊戲按鈕' },
                { selector: '.game-board', name: '遊戲板' },
                { selector: '.instructions', name: '操作指示' }
            ];

            for (const element of uiElements) {
                const exists = await page.locator(element.selector).count() > 0;
                if (exists) {
                    results.details.push(`✅ ${element.name} 存在`);
                } else {
                    results.details.push(`❌ ${element.name} 不存在`);
                    results.passed = false;
                    this.log(`${element.name} 不存在`, 'error');
                }
            }

            // 檢查遊戲狀態
            const currentRound = await this.getElementText('.current-round', '0');
            const gamePhase = await this.getElementText('.game-phase', '');
            const completedLines = await this.getElementText('.completed-lines', '0');

            if (currentRound === '1') {
                results.details.push('✅ 初始輪數正確 (1)');
            } else {
                results.details.push(`❌ 初始輪數錯誤: ${currentRound}`);
                results.passed = false;
            }

            if (gamePhase.includes('玩家回合')) {
                results.details.push('✅ 初始遊戲階段正確');
            } else {
                results.details.push(`❌ 初始遊戲階段錯誤: ${gamePhase}`);
                results.passed = false;
            }

            if (completedLines === '0') {
                results.details.push('✅ 初始完成連線數正確 (0)');
            } else {
                results.details.push(`❌ 初始完成連線數錯誤: ${completedLines}`);
                results.passed = false;
            }

            // 檢查遊戲板格子數量
            const cellCount = await page.locator('.cell').count();
            if (cellCount === 25) {
                results.details.push('✅ 遊戲板有正確的25個格子');
            } else {
                results.details.push(`❌ 遊戲板格子數量錯誤: ${cellCount}`);
                results.passed = false;
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 1 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 測試 2: 演算法切換功能
     */
    async test2_AlgorithmSwitching() {
        this.currentTest = 2;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 演算法切換功能`);
        
        const results = {
            testName: '演算法切換功能',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 檢查初始演算法
            const initialAlgorithm = await this.getElementText('.current-algorithm', '');
            if (initialAlgorithm.includes('標準演算法')) {
                results.details.push('✅ 初始演算法為標準演算法');
            } else {
                results.details.push(`❌ 初始演算法錯誤: ${initialAlgorithm}`);
                results.passed = false;
            }

            // 點擊切換到增強演算法
            const enhancedAlgorithmButton = page.locator('.enhanced-algorithm').first();
            if (await enhancedAlgorithmButton.count() > 0) {
                await enhancedAlgorithmButton.click();
                await page.waitForTimeout(1000);
                
                const switchedAlgorithm = await this.getElementText('.current-algorithm', '');
                if (switchedAlgorithm.includes('增強演算法')) {
                    results.details.push('✅ 成功切換到增強演算法');
                } else {
                    results.details.push(`❌ 演算法切換失敗: ${switchedAlgorithm}`);
                    results.passed = false;
                }
            } else {
                // 嘗試其他選擇器
                const success = await this.safeClick('.algorithm-option:nth-child(2)', '增強演算法選項');
                if (success) {
                    await page.waitForTimeout(1000);
                    const switchedAlgorithm = await this.getElementText('.current-algorithm', '');
                    if (switchedAlgorithm.includes('增強演算法')) {
                        results.details.push('✅ 成功切換到增強演算法');
                    } else {
                        results.details.push(`❌ 演算法切換失敗: ${switchedAlgorithm}`);
                        results.passed = false;
                    }
                } else {
                    results.details.push('❌ 無法找到增強演算法切換按鈕');
                    results.passed = false;
                }
            }

            // 切換回標準演算法
            const standardAlgorithmButton = page.locator('.standard-algorithm').first();
            if (await standardAlgorithmButton.count() > 0) {
                await standardAlgorithmButton.click();
                await page.waitForTimeout(1000);
                
                const backToStandard = await this.getElementText('.current-algorithm', '');
                if (backToStandard.includes('標準演算法')) {
                    results.details.push('✅ 成功切換回標準演算法');
                } else {
                    results.details.push(`❌ 切換回標準演算法失敗: ${backToStandard}`);
                    results.passed = false;
                }
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 2 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 測試 3: 遊戲開始和遊戲板互動
     */
    async test3_GameStartAndBoardInteraction() {
        this.currentTest = 3;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 遊戲開始和遊戲板互動`);
        
        const results = {
            testName: '遊戲開始和遊戲板互動',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 點擊開始遊戲（如果需要）
            const startButton = page.locator('#start-game');
            if (await startButton.count() > 0 && await startButton.isEnabled()) {
                await startButton.click();
                await page.waitForTimeout(1000);
                results.details.push('✅ 成功點擊開始遊戲');
            } else {
                results.details.push('ℹ️ 遊戲已經開始或按鈕不可用');
            }

            // 檢查遊戲板是否顯示
            const gameBoard = page.locator('.game-board');
            if (await gameBoard.count() > 0) {
                results.details.push('✅ 遊戲板成功顯示');
            } else {
                results.details.push('❌ 遊戲板未顯示');
                results.passed = false;
                return results;
            }

            // 檢查格子數量
            const cells = page.locator('.cell');
            const cellCount = await cells.count();
            if (cellCount === 25) {
                results.details.push('✅ 遊戲板有正確的25個格子');
            } else {
                results.details.push(`❌ 遊戲板格子數量錯誤: ${cellCount}`);
                results.passed = false;
            }

            // 檢查建議是否顯示
            await page.waitForTimeout(500); // 等待建議計算
            const suggestionExists = await page.locator('.suggestion').count() > 0;
            if (suggestionExists) {
                results.details.push('✅ 建議移動正確顯示');
            } else {
                results.details.push('⚠️ 建議移動未顯示（可能正常）');
            }

            // 測試點擊空格子
            const emptyCells = page.locator('.cell:not(.player):not(.computer)');
            const firstEmptyCell = emptyCells.first();
            
            if (await firstEmptyCell.count() > 0) {
                await firstEmptyCell.click();
                await page.waitForTimeout(500);

                // 檢查格子是否被標記
                const playerCells = await page.locator('.cell.player').count();
                if (playerCells > 0) {
                    results.details.push('✅ 玩家點擊格子成功標記');
                } else {
                    results.details.push('❌ 玩家點擊格子未正確標記');
                    results.passed = false;
                }

                // 檢查遊戲階段是否切換
                const gamePhase = await this.getElementText('.game-phase', '');
                if (gamePhase.includes('電腦回合') || gamePhase.includes('玩家回合')) {
                    results.details.push('✅ 遊戲階段正確更新');
                } else {
                    results.details.push(`❌ 遊戲階段未正確更新: ${gamePhase}`);
                    results.passed = false;
                }
            } else {
                results.details.push('⚠️ 沒有找到可點擊的空格子');
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 3 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 測試 4: 電腦回合和隨機移動
     */
    async test4_ComputerTurnAndRandomMove() {
        this.currentTest = 4;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 電腦回合和隨機移動`);
        
        const results = {
            testName: '電腦回合和隨機移動',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 檢查當前遊戲階段
            const gamePhase = await this.getElementText('.game-phase', '');
            
            // 如果不是電腦回合，先進行一次玩家移動
            if (!gamePhase.includes('電腦回合')) {
                const emptyCells = page.locator('.cell:not(.player):not(.computer)');
                if (await emptyCells.count() > 0) {
                    await emptyCells.first().click();
                    await page.waitForTimeout(500);
                    results.details.push('✅ 執行玩家移動以進入電腦回合');
                }
            }

            // 記錄電腦移動前的狀態
            const computerCellsBefore = await page.locator('.cell.computer').count();

            // 點擊電腦隨機下棋按鈕
            const randomMoveButton = page.locator('#random-computer-move');
            if (await randomMoveButton.count() > 0) {
                await randomMoveButton.click();
                await page.waitForTimeout(1000);

                // 檢查電腦是否下了一步棋
                const computerCellsAfter = await page.locator('.cell.computer').count();
                if (computerCellsAfter > computerCellsBefore) {
                    results.details.push('✅ 電腦成功下了一步棋');
                } else {
                    results.details.push(`❌ 電腦移動失敗，電腦格子數: ${computerCellsBefore} -> ${computerCellsAfter}`);
                    results.passed = false;
                }

                // 檢查遊戲階段是否切換
                const newGamePhase = await this.getElementText('.game-phase', '');
                if (newGamePhase.includes('玩家回合') || newGamePhase.includes('遊戲結束')) {
                    results.details.push('✅ 遊戲階段正確切換');
                } else {
                    results.details.push(`❌ 遊戲階段切換錯誤: ${newGamePhase}`);
                    results.passed = false;
                }

                // 檢查輪數更新
                const currentRound = await this.getElementText('.current-round', '0');
                const roundNumber = parseInt(currentRound);
                if (roundNumber >= 1 && roundNumber <= 8) {
                    results.details.push(`✅ 輪數正確更新: ${roundNumber}`);
                } else {
                    results.details.push(`❌ 輪數更新錯誤: ${currentRound}`);
                    results.passed = false;
                }
            } else {
                results.details.push('❌ 找不到電腦隨機下棋按鈕');
                results.passed = false;
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 4 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 測試 5: 自動電腦下棋功能
     */
    async test5_AutoComputerMove() {
        this.currentTest = 5;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 自動電腦下棋功能`);
        
        const results = {
            testName: '自動電腦下棋功能',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 啟用自動電腦下棋
            const autoCheckbox = page.locator('#auto-computer-move');
            if (await autoCheckbox.count() > 0) {
                await autoCheckbox.check();
                results.details.push('✅ 啟用電腦自動隨機下棋');
                
                // 記錄當前狀態
                const computerCellsBefore = await page.locator('.cell.computer').count();
                
                // 進行玩家移動
                const emptyCells = page.locator('.cell:not(.player):not(.computer)');
                if (await emptyCells.count() > 0) {
                    await emptyCells.first().click();
                    await page.waitForTimeout(1500); // 等待自動電腦移動
                    
                    // 檢查電腦是否自動移動
                    const computerCellsAfter = await page.locator('.cell.computer').count();
                    if (computerCellsAfter > computerCellsBefore) {
                        results.details.push('✅ 電腦自動移動功能正常');
                    } else {
                        results.details.push('❌ 電腦未自動移動');
                        results.passed = false;
                    }
                } else {
                    results.details.push('⚠️ 沒有空格子可供測試');
                }
            } else {
                results.details.push('❌ 找不到自動電腦下棋選項');
                results.passed = false;
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 5 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 測試 6: 連線檢測功能
     */
    async test6_LineDetection() {
        this.currentTest = 6;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 連線檢測功能`);
        
        const results = {
            testName: '連線檢測功能',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 重新開始遊戲以確保乾淨狀態
            const restartButton = page.locator('#restart-game');
            if (await restartButton.count() > 0 && await restartButton.isEnabled()) {
                await restartButton.click();
                await page.waitForTimeout(500);
            }

            // 開始新遊戲
            const startButton = page.locator('#start-game');
            if (await startButton.count() > 0 && await startButton.isEnabled()) {
                await startButton.click();
                await page.waitForTimeout(1000);
            }

            // 嘗試創建一條線（模擬多次移動）
            let moveCount = 0;
            const maxMoves = 10; // 限制移動次數避免無限循環

            while (moveCount < maxMoves) {
                const emptyCells = page.locator('.cell:not(.player):not(.computer)');
                if (await emptyCells.count() > 0) {
                    await emptyCells.first().click();
                    await page.waitForTimeout(800); // 等待可能的自動電腦移動
                    moveCount++;
                    
                    // 檢查是否有連線
                    const completedLines = await this.getElementText('.completed-lines', '0');
                    if (parseInt(completedLines) > 0) {
                        results.details.push(`✅ 成功檢測到連線: ${completedLines} 條`);
                        
                        // 檢查連線高亮
                        const highlightedCells = await page.locator('.cell.line-highlight').count();
                        if (highlightedCells >= 5) {
                            results.details.push(`✅ 連線高亮顯示正常: ${highlightedCells} 個格子`);
                        } else {
                            results.details.push(`⚠️ 連線高亮可能不完整: ${highlightedCells} 個格子`);
                        }
                        break;
                    }
                } else {
                    break;
                }
            }

            // 如果沒有檢測到連線，這也是正常的
            const finalLines = await this.getElementText('.completed-lines', '0');
            if (parseInt(finalLines) === 0) {
                results.details.push('ℹ️ 在測試期間未形成連線（正常情況）');
            }

            results.details.push(`✅ 連線檢測功能測試完成，進行了 ${moveCount} 次移動`);

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 6 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 測試 7: 響應式設計和視覺元素
     */
    async test7_ResponsiveDesignAndVisuals() {
        this.currentTest = 7;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 響應式設計和視覺元素`);
        
        const results = {
            testName: '響應式設計和視覺元素',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 測試不同螢幕尺寸
            const viewports = [
                { width: 1920, height: 1080, name: '桌面大螢幕' },
                { width: 1366, height: 768, name: '桌面標準' },
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
                    { selector: '.game-controls', name: '遊戲控制' },
                    { selector: '.game-board', name: '遊戲板' }
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
            await page.waitForTimeout(500);

            // 檢查CSS樣式是否正確載入
            const hasStyles = await page.evaluate(() => {
                const styleSheets = document.styleSheets;
                return styleSheets.length > 0;
            });

            if (hasStyles) {
                results.details.push('✅ CSS樣式正確載入');
            } else {
                results.details.push('❌ CSS樣式載入失敗');
                results.passed = false;
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 7 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 測試 8: 性能和載入時間
     */
    async test8_PerformanceAndLoadTime() {
        this.currentTest = 8;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 性能和載入時間`);
        
        const results = {
            testName: '性能和載入時間',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 測量頁面重新載入時間
            const reloadStartTime = Date.now();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            const reloadTime = Date.now() - reloadStartTime;

            if (reloadTime < 3000) {
                results.details.push(`✅ 頁面重新載入時間良好: ${reloadTime}ms`);
            } else {
                results.details.push(`⚠️ 頁面重新載入時間較長: ${reloadTime}ms`);
            }

            // 等待遊戲初始化
            await page.waitForTimeout(2000);

            // 測試遊戲初始化時間
            const initStartTime = Date.now();
            const startButton = page.locator('#start-game');
            if (await startButton.count() > 0 && await startButton.isEnabled()) {
                await startButton.click();
                await this.waitForElement('.game-board', 5000);
                const initTime = Date.now() - initStartTime;

                if (initTime < 2000) {
                    results.details.push(`✅ 遊戲初始化時間良好: ${initTime}ms`);
                } else {
                    results.details.push(`⚠️ 遊戲初始化時間較長: ${initTime}ms`);
                }
            }

            // 測試互動響應時間
            const interactionStartTime = Date.now();
            const emptyCells = page.locator('.cell:not(.player):not(.computer)');
            if (await emptyCells.count() > 0) {
                await emptyCells.first().click();
                await page.waitForTimeout(100); // 短暫等待響應
                const interactionTime = Date.now() - interactionStartTime;

                if (interactionTime < 500) {
                    results.details.push(`✅ 互動響應時間良好: ${interactionTime}ms`);
                } else {
                    results.details.push(`⚠️ 互動響應時間較長: ${interactionTime}ms`);
                }
            }

            // 檢查記憶體使用（簡單檢查）
            const memoryInfo = await page.evaluate(() => {
                if (performance.memory) {
                    return {
                        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
                    };
                }
                return null;
            });

            if (memoryInfo) {
                results.details.push(`ℹ️ JavaScript記憶體使用: ${memoryInfo.used}MB / ${memoryInfo.total}MB`);
                if (memoryInfo.used < 50) {
                    results.details.push('✅ 記憶體使用量正常');
                } else {
                    results.details.push('⚠️ 記憶體使用量較高');
                }
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 8 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, results.passed ? 'success' : 'error');
        return results;
    }

    /**
     * 執行所有測試
     */
    async runAllTests() {
        this.log('🚀 開始執行 Bingo 遊戲完整功能測試套件');
        this.log('=' .repeat(60));

        const tests = [
            this.test1_PageLoadAndInitialState,
            this.test2_AlgorithmSwitching,
            this.test3_GameStartAndBoardInteraction,
            this.test4_ComputerTurnAndRandomMove,
            this.test5_AutoComputerMove,
            this.test6_LineDetection,
            this.test7_ResponsiveDesignAndVisuals,
            this.test8_PerformanceAndLoadTime
        ];

        for (const test of tests) {
            try {
                await test.call(this);
                await page.waitForTimeout(500); // 測試間隔
            } catch (error) {
                this.log(`測試執行失敗: ${error.message}`, 'error');
            }
        }

        this.generateTestReport();
        return this.testResults;
    }

    /**
     * 生成測試報告
     */
    generateTestReport() {
        this.log('📊 生成測試報告');
        this.log('=' .repeat(60));

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        const totalDuration = Date.now() - this.startTime;

        console.log(`\n📈 測試摘要:`);
        console.log(`總測試數: ${totalTests}`);
        console.log(`通過: ${passedTests} ✅`);
        console.log(`失敗: ${failedTests} ❌`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        console.log(`總耗時: ${totalDuration}ms`);
        console.log('');

        // 詳細結果
        this.testResults.forEach((test, index) => {
            const status = test.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${index + 1}. ${test.testName}: ${status} (${test.duration}ms)`);
            
            if (test.details.length > 0) {
                test.details.forEach(detail => {
                    console.log(`   ${detail}`);
                });
            }
            console.log('');
        });

        return {
            totalTests,
            passedTests,
            failedTests,
            successRate: ((passedTests / totalTests) * 100).toFixed(1),
            totalDuration,
            results: this.testResults
        };
    }
}

// 導出類別供使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComprehensiveBingoTests;
}

// 使用說明
console.log(`
🎯 Bingo 遊戲完整功能測試套件

這個測試套件包含以下測試項目：

1. 頁面載入和初始狀態驗證
2. 演算法切換功能測試
3. 遊戲開始和遊戲板互動測試
4. 電腦回合和隨機移動測試
5. 自動電腦下棋功能測試
6. 連線檢測功能測試
7. 響應式設計和視覺元素測試
8. 性能和載入時間測試

使用方法：
const tester = new ComprehensiveBingoTests();
await tester.runAllTests();
`);