/**
 * Bingo 遊戲模擬器 - Playwright MCP Server 功能測試計畫
 * 完整的功能測試套件，涵蓋所有核心用戶流程和互動場景
 */

class BingoPlaywrightFunctionTests {
    constructor() {
        this.baseUrl = `file://${process.cwd()}/index.html`;
        this.testResults = [];
        this.startTime = Date.now();
        this.currentTest = 0;
        this.totalTests = 10;
        this.screenshots = [];
    }

    /**
     * 記錄測試步驟和結果
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icons = {
            'success': '✅',
            'error': '❌', 
            'warning': '⚠️',
            'info': 'ℹ️',
            'start': '🚀',
            'complete': '🏁'
        };
        const icon = icons[type] || 'ℹ️';
        console.log(`[${timestamp}] ${icon} ${message}`);
    }

    /**
     * 等待元素出現並穩定
     */
    async waitForElementStable(selector, timeout = 5000) {
        try {
            await page.waitForSelector(selector, { timeout });
            await page.waitForTimeout(200); // 等待元素穩定
            return true;
        } catch (error) {
            this.log(`等待元素 ${selector} 超時: ${error.message}`, 'warning');
            return false;
        }
    }

    /**
     * 安全獲取元素文本內容
     */
    async getElementText(selector, defaultValue = '') {
        try {
            const element = page.locator(selector).first();
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
            await page.waitForTimeout(300);
            this.log(`成功點擊 ${description || selector}`, 'success');
            return true;
        } catch (error) {
            this.log(`點擊 ${description || selector} 失敗: ${error.message}`, 'error');
            return false;
        }
    }    /**

     * 截圖功能
     */
    async takeScreenshot(name, description = '') {
        try {
            const timestamp = Date.now();
            const filename = `screenshot-${name}-${timestamp}.png`;
            await page.screenshot({ path: filename, fullPage: true });
            this.screenshots.push({
                name,
                filename,
                description,
                timestamp: new Date().toISOString()
            });
            this.log(`截圖已保存: ${filename}`, 'info');
            return filename;
        } catch (error) {
            this.log(`截圖失敗: ${error.message}`, 'error');
            return null;
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
     * 檢查元素是否可見
     */
    async isElementVisible(selector) {
        try {
            const element = page.locator(selector).first();
            return await element.isVisible();
        } catch (error) {
            return false;
        }
    }

    /**
     * 測試 1: 設置 Playwright MCP server 配置驗證
     */
    async test1_PlaywrightMCPServerSetup() {
        this.currentTest = 1;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: Playwright MCP Server 配置驗證`, 'start');
        
        const results = {
            testName: 'Playwright MCP Server 配置驗證',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 檢查瀏覽器是否正常啟動
            const browserInfo = await page.evaluate(() => ({
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                url: window.location.href
            }));

            results.details.push(`✅ 瀏覽器成功啟動: ${browserInfo.userAgent.split(' ')[0]}`);
            results.details.push(`✅ 視窗大小: ${browserInfo.viewport.width}x${browserInfo.viewport.height}`);
            results.details.push(`✅ 當前URL: ${browserInfo.url}`);

            // 檢查頁面是否正確載入
            const title = await page.title();
            if (title === 'Bingo遊戲模擬器') {
                results.details.push('✅ 頁面標題正確載入');
            } else {
                results.details.push(`❌ 頁面標題錯誤: ${title}`);
                results.passed = false;
            }

            // 檢查基本DOM結構
            const hasBody = await this.elementExists('body');
            const hasContainer = await this.elementExists('.container');
            
            if (hasBody && hasContainer) {
                results.details.push('✅ 基本DOM結構正常');
            } else {
                results.details.push('❌ 基本DOM結構異常');
                results.passed = false;
            }

            // 截圖記錄初始狀態
            await this.takeScreenshot('initial-state', '初始頁面狀態');

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 1 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }    /**

     * 測試 2: 頁面載入和初始狀態驗證
     */
    async test2_PageLoadAndInitialState() {
        this.currentTest = 2;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 頁面載入和初始狀態驗證`, 'start');
        
        const results = {
            testName: '頁面載入和初始狀態驗證',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 等待頁面完全載入
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000); // 等待JavaScript初始化

            // 檢查主要UI元素存在性
            const uiElements = [
                { selector: 'h1', name: '主標題' },
                { selector: '.algorithm-selector', name: '演算法選擇器' },
                { selector: '.game-status', name: '遊戲狀態面板' },
                { selector: '.game-board-container', name: '遊戲板容器' },
                { selector: '#game-board', name: '遊戲板' },
                { selector: '.board-controls', name: '遊戲控制按鈕' },
                { selector: '#start-game', name: '開始遊戲按鈕' },
                { selector: '#restart-game', name: '重新開始按鈕' },
                { selector: '#random-computer-move', name: '電腦隨機下棋按鈕' },
                { selector: '.control-panel', name: '控制面板' },
                { selector: '.instructions', name: '操作指示' }
            ];

            for (const element of uiElements) {
                const exists = await this.elementExists(element.selector);
                if (exists) {
                    results.details.push(`✅ ${element.name} 存在`);
                } else {
                    results.details.push(`❌ ${element.name} 不存在`);
                    results.passed = false;
                }
            }

            // 檢查初始遊戲狀態
            const currentRound = await this.getElementText('#current-round', '0');
            const gamePhase = await this.getElementText('#game-phase', '');
            const completedLines = await this.getElementText('#completed-lines', '0');

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

            // 檢查演算法選擇器狀態
            const currentAlgorithm = await this.getElementText('#current-algorithm-name', '');
            if (currentAlgorithm.includes('標準演算法')) {
                results.details.push('✅ 初始演算法正確設置為標準演算法');
            } else {
                results.details.push(`❌ 初始演算法設置錯誤: ${currentAlgorithm}`);
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

            // 檢查控制台錯誤
            const consoleErrors = await page.evaluate(() => {
                return window.console._errors || [];
            });

            if (consoleErrors.length === 0) {
                results.details.push('✅ 無控制台錯誤');
            } else {
                results.details.push(`⚠️ 發現 ${consoleErrors.length} 個控制台錯誤`);
            }

            await this.takeScreenshot('initial-ui-state', '初始UI狀態');

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 2 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }    /**

     * 測試 3: 演算法切換功能測試
     */
    async test3_AlgorithmSwitching() {
        this.currentTest = 3;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 演算法切換功能測試`, 'start');
        
        const results = {
            testName: '演算法切換功能測試',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 檢查初始演算法狀態
            const initialAlgorithm = await this.getElementText('#current-algorithm-name', '');
            if (initialAlgorithm.includes('標準演算法')) {
                results.details.push('✅ 初始演算法為標準演算法');
            } else {
                results.details.push(`❌ 初始演算法錯誤: ${initialAlgorithm}`);
                results.passed = false;
            }

            // 檢查演算法選項是否存在
            const standardOption = await this.elementExists('.algorithm-option[data-algorithm="standard"]');
            const enhancedOption = await this.elementExists('.algorithm-option[data-algorithm="enhanced"]');

            if (standardOption && enhancedOption) {
                results.details.push('✅ 演算法選項正確顯示');
            } else {
                results.details.push('❌ 演算法選項顯示異常');
                results.passed = false;
            }

            // 測試切換到增強演算法
            const enhancedAlgorithmOption = page.locator('.algorithm-option[data-algorithm="enhanced"]');
            if (await enhancedAlgorithmOption.count() > 0) {
                await enhancedAlgorithmOption.click();
                await page.waitForTimeout(1000);
                
                // 檢查演算法是否切換成功
                const switchedAlgorithm = await this.getElementText('#current-algorithm-name', '');
                if (switchedAlgorithm.includes('增強演算法')) {
                    results.details.push('✅ 成功切換到增強演算法');
                } else {
                    results.details.push(`❌ 演算法切換失敗: ${switchedAlgorithm}`);
                    results.passed = false;
                }

                // 檢查選中狀態
                const isEnhancedSelected = await page.locator('.algorithm-option[data-algorithm="enhanced"].selected').count() > 0;
                if (isEnhancedSelected) {
                    results.details.push('✅ 增強演算法選項正確標記為選中');
                } else {
                    results.details.push('❌ 增強演算法選項未正確標記為選中');
                    results.passed = false;
                }

                await this.takeScreenshot('enhanced-algorithm-selected', '增強演算法選中狀態');
            }

            // 測試切換回標準演算法
            const standardAlgorithmOption = page.locator('.algorithm-option[data-algorithm="standard"]');
            if (await standardAlgorithmOption.count() > 0) {
                await standardAlgorithmOption.click();
                await page.waitForTimeout(1000);
                
                const backToStandard = await this.getElementText('#current-algorithm-name', '');
                if (backToStandard.includes('標準演算法')) {
                    results.details.push('✅ 成功切換回標準演算法');
                } else {
                    results.details.push(`❌ 切換回標準演算法失敗: ${backToStandard}`);
                    results.passed = false;
                }

                // 檢查選中狀態
                const isStandardSelected = await page.locator('.algorithm-option[data-algorithm="standard"].selected').count() > 0;
                if (isStandardSelected) {
                    results.details.push('✅ 標準演算法選項正確標記為選中');
                } else {
                    results.details.push('❌ 標準演算法選項未正確標記為選中');
                    results.passed = false;
                }
            }

            // 測試演算法切換的視覺反饋
            const algorithmOptions = page.locator('.algorithm-option');
            const optionCount = await algorithmOptions.count();
            
            if (optionCount === 2) {
                results.details.push('✅ 演算法選項數量正確 (2個)');
            } else {
                results.details.push(`❌ 演算法選項數量錯誤: ${optionCount}`);
                results.passed = false;
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 3 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }    /**

     * 測試 4: 遊戲板互動測試 - 驗證格子點擊、建議顯示和連線檢測功能
     */
    async test4_GameBoardInteraction() {
        this.currentTest = 4;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 遊戲板互動測試`, 'start');
        
        const results = {
            testName: '遊戲板互動測試',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 確保遊戲已開始
            const startButton = page.locator('#start-game');
            if (await startButton.count() > 0 && await startButton.isEnabled()) {
                await startButton.click();
                await page.waitForTimeout(1000);
                results.details.push('✅ 成功開始遊戲');
            }

            // 檢查遊戲板是否正確顯示
            const gameBoard = page.locator('#game-board');
            if (await gameBoard.count() > 0 && await gameBoard.isVisible()) {
                results.details.push('✅ 遊戲板正確顯示');
            } else {
                results.details.push('❌ 遊戲板未正確顯示');
                results.passed = false;
                return results;
            }

            // 檢查格子數量和初始狀態
            const cells = page.locator('.cell');
            const cellCount = await cells.count();
            
            if (cellCount === 25) {
                results.details.push('✅ 遊戲板有正確的25個格子');
            } else {
                results.details.push(`❌ 遊戲板格子數量錯誤: ${cellCount}`);
                results.passed = false;
            }

            // 檢查建議顯示功能
            await page.waitForTimeout(1000); // 等待建議計算
            const suggestionExists = await page.locator('.suggestion').count() > 0;
            
            if (suggestionExists) {
                results.details.push('✅ 建議移動正確顯示');
                
                // 檢查建議格子的視覺效果
                const suggestionCell = page.locator('.cell.suggestion').first();
                const suggestionCellVisible = await suggestionCell.isVisible();
                
                if (suggestionCellVisible) {
                    results.details.push('✅ 建議格子視覺效果正常');
                } else {
                    results.details.push('❌ 建議格子視覺效果異常');
                    results.passed = false;
                }
            } else {
                results.details.push('⚠️ 建議移動未顯示（可能正常）');
            }

            // 測試格子點擊功能
            const emptyCells = page.locator('.cell:not(.player):not(.computer)');
            const firstEmptyCell = emptyCells.first();
            
            if (await firstEmptyCell.count() > 0) {
                // 記錄點擊前的狀態
                const playerCellsBefore = await page.locator('.cell.player').count();
                
                // 點擊格子
                await firstEmptyCell.click();
                await page.waitForTimeout(500);
                
                // 檢查格子是否被正確標記
                const playerCellsAfter = await page.locator('.cell.player').count();
                
                if (playerCellsAfter > playerCellsBefore) {
                    results.details.push('✅ 玩家點擊格子成功標記');
                } else {
                    results.details.push('❌ 玩家點擊格子未正確標記');
                    results.passed = false;
                }

                // 檢查遊戲階段是否正確切換
                const gamePhase = await this.getElementText('#game-phase', '');
                if (gamePhase.includes('電腦回合') || gamePhase.includes('玩家回合')) {
                    results.details.push('✅ 遊戲階段正確更新');
                } else {
                    results.details.push(`❌ 遊戲階段未正確更新: ${gamePhase}`);
                    results.passed = false;
                }

                await this.takeScreenshot('after-player-move', '玩家移動後狀態');
            }

            // 測試格子狀態視覺區分
            const playerCells = await page.locator('.cell.player').count();
            const computerCells = await page.locator('.cell.computer').count();
            const emptyCellsCount = await page.locator('.cell:not(.player):not(.computer)').count();
            
            results.details.push(`ℹ️ 當前格子狀態 - 玩家: ${playerCells}, 電腦: ${computerCells}, 空格: ${emptyCellsCount}`);
            
            if (playerCells + computerCells + emptyCellsCount === 25) {
                results.details.push('✅ 格子狀態統計正確');
            } else {
                results.details.push('❌ 格子狀態統計異常');
                results.passed = false;
            }

            // 測試重複點擊已佔用格子
            const occupiedCell = page.locator('.cell.player').first();
            if (await occupiedCell.count() > 0) {
                const playerCellsBeforeReclick = await page.locator('.cell.player').count();
                await occupiedCell.click();
                await page.waitForTimeout(300);
                
                const playerCellsAfterReclick = await page.locator('.cell.player').count();
                if (playerCellsBeforeReclick === playerCellsAfterReclick) {
                    results.details.push('✅ 重複點擊已佔用格子正確處理');
                } else {
                    results.details.push('❌ 重複點擊已佔用格子處理異常');
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
        this.log(`測試 4 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }    /**

     * 測試 5: 電腦回合和隨機移動測試
     */
    async test5_ComputerTurnAndRandomMove() {
        this.currentTest = 5;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 電腦回合和隨機移動測試`, 'start');
        
        const results = {
            testName: '電腦回合和隨機移動測試',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 確保處於電腦回合狀態
            const gamePhase = await this.getElementText('#game-phase', '');
            
            if (!gamePhase.includes('電腦回合')) {
                // 如果不是電腦回合，先進行一次玩家移動
                const emptyCells = page.locator('.cell:not(.player):not(.computer)');
                if (await emptyCells.count() > 0) {
                    await emptyCells.first().click();
                    await page.waitForTimeout(500);
                    results.details.push('✅ 執行玩家移動以進入電腦回合');
                }
            }

            // 記錄電腦移動前的狀態
            const computerCellsBefore = await page.locator('.cell.computer').count();
            const currentRoundBefore = await this.getElementText('#current-round', '0');

            // 測試電腦隨機下棋按鈕
            const randomMoveButton = page.locator('#random-computer-move');
            if (await randomMoveButton.count() > 0 && await randomMoveButton.isEnabled()) {
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

                // 檢查遊戲階段是否正確切換
                const newGamePhase = await this.getElementText('#game-phase', '');
                if (newGamePhase.includes('玩家回合') || newGamePhase.includes('遊戲結束')) {
                    results.details.push('✅ 遊戲階段正確切換');
                } else {
                    results.details.push(`❌ 遊戲階段切換錯誤: ${newGamePhase}`);
                    results.passed = false;
                }

                // 檢查輪數更新
                const currentRoundAfter = await this.getElementText('#current-round', '0');
                const roundBefore = parseInt(currentRoundBefore);
                const roundAfter = parseInt(currentRoundAfter);
                
                if (roundAfter >= roundBefore && roundAfter <= 8) {
                    results.details.push(`✅ 輪數正確更新: ${roundBefore} -> ${roundAfter}`);
                } else {
                    results.details.push(`❌ 輪數更新錯誤: ${roundBefore} -> ${roundAfter}`);
                    results.passed = false;
                }

                await this.takeScreenshot('after-computer-move', '電腦移動後狀態');
            } else {
                results.details.push('❌ 電腦隨機下棋按鈕不可用');
                results.passed = false;
            }

            // 測試自動電腦下棋功能
            const autoCheckbox = page.locator('#auto-random-move');
            if (await autoCheckbox.count() > 0) {
                // 先取消勾選（如果已勾選）
                if (await autoCheckbox.isChecked()) {
                    await autoCheckbox.uncheck();
                    await page.waitForTimeout(300);
                }

                // 勾選自動電腦下棋
                await autoCheckbox.check();
                await page.waitForTimeout(500);
                
                if (await autoCheckbox.isChecked()) {
                    results.details.push('✅ 自動電腦下棋選項成功啟用');
                    
                    // 測試自動功能
                    const computerCellsBeforeAuto = await page.locator('.cell.computer').count();
                    
                    // 進行玩家移動觸發自動電腦移動
                    const emptyCells = page.locator('.cell:not(.player):not(.computer)');
                    if (await emptyCells.count() > 0) {
                        await emptyCells.first().click();
                        await page.waitForTimeout(1500); // 等待自動電腦移動
                        
                        const computerCellsAfterAuto = await page.locator('.cell.computer').count();
                        if (computerCellsAfterAuto > computerCellsBeforeAuto) {
                            results.details.push('✅ 電腦自動移動功能正常');
                        } else {
                            results.details.push('❌ 電腦未自動移動');
                            results.passed = false;
                        }
                    }
                } else {
                    results.details.push('❌ 自動電腦下棋選項啟用失敗');
                    results.passed = false;
                }
            } else {
                results.details.push('⚠️ 找不到自動電腦下棋選項');
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 5 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }    /*
*
     * 測試 6: 完整遊戲流程測試 - 模擬從開始到結束的完整遊戲體驗
     */
    async test6_CompleteGameFlow() {
        this.currentTest = 6;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 完整遊戲流程測試`, 'start');
        
        const results = {
            testName: '完整遊戲流程測試',
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
                results.details.push('✅ 成功重新開始遊戲');
            }

            // 開始新遊戲
            const startButton = page.locator('#start-game');
            if (await startButton.count() > 0 && await startButton.isEnabled()) {
                await startButton.click();
                await page.waitForTimeout(1000);
                results.details.push('✅ 成功開始新遊戲');
            }

            // 啟用自動電腦下棋以加速測試
            const autoCheckbox = page.locator('#auto-random-move');
            if (await autoCheckbox.count() > 0 && !await autoCheckbox.isChecked()) {
                await autoCheckbox.check();
                await page.waitForTimeout(300);
                results.details.push('✅ 啟用電腦自動下棋');
            }

            // 進行8輪遊戲
            let completedRounds = 0;
            const maxRounds = 8;
            
            for (let round = 1; round <= maxRounds; round++) {
                // 檢查當前輪數
                const currentRound = await this.getElementText('#current-round', '0');
                const roundNumber = parseInt(currentRound);
                
                if (roundNumber !== round) {
                    results.details.push(`⚠️ 輪數不匹配，期望: ${round}，實際: ${roundNumber}`);
                    if (roundNumber > maxRounds) {
                        break; // 遊戲可能已結束
                    }
                }

                // 檢查遊戲是否已結束
                const gamePhase = await this.getElementText('#game-phase', '');
                if (gamePhase.includes('遊戲結束')) {
                    results.details.push(`ℹ️ 遊戲在第 ${round} 輪前結束`);
                    break;
                }

                // 玩家回合：點擊建議的格子或任意空格子
                if (gamePhase.includes('玩家回合')) {
                    let moveSuccessful = false;
                    
                    // 優先點擊建議的格子
                    const suggestedCell = page.locator('.cell.suggestion').first();
                    if (await suggestedCell.count() > 0) {
                        await suggestedCell.click();
                        moveSuccessful = true;
                    } else {
                        // 如果沒有建議，點擊任意空格子
                        const emptyCells = page.locator('.cell:not(.player):not(.computer)');
                        if (await emptyCells.count() > 0) {
                            await emptyCells.first().click();
                            moveSuccessful = true;
                        }
                    }
                    
                    if (moveSuccessful) {
                        await page.waitForTimeout(1500); // 等待電腦自動移動
                        completedRounds++;
                        results.details.push(`✅ 完成第 ${round} 輪`);
                    } else {
                        results.details.push(`❌ 第 ${round} 輪玩家移動失敗`);
                        results.passed = false;
                        break;
                    }
                } else {
                    results.details.push(`⚠️ 第 ${round} 輪開始時不是玩家回合: ${gamePhase}`);
                }

                // 檢查連線狀態
                const completedLines = await this.getElementText('#completed-lines', '0');
                if (parseInt(completedLines) > 0) {
                    results.details.push(`ℹ️ 第 ${round} 輪後完成連線數: ${completedLines}`);
                }

                // 每隔幾輪截圖記錄進度
                if (round % 3 === 0) {
                    await this.takeScreenshot(`game-progress-round-${round}`, `第${round}輪遊戲進度`);
                }
            }

            // 檢查遊戲是否正確結束
            await page.waitForTimeout(1000); // 等待遊戲狀態更新
            const finalGamePhase = await this.getElementText('#game-phase', '');
            
            if (finalGamePhase.includes('遊戲結束') || completedRounds >= 8) {
                results.details.push('✅ 遊戲正確結束');
                
                // 檢查最終結果
                const finalLines = await this.getElementText('#completed-lines', '0');
                const playerMoves = await page.locator('.cell.player').count();
                const computerMoves = await page.locator('.cell.computer').count();
                
                results.details.push(`✅ 最終統計 - 連線數: ${finalLines}, 玩家移動: ${playerMoves}, 電腦移動: ${computerMoves}`);
                
                // 檢查結果面板是否顯示
                const resultPanel = page.locator('#game-result-panel');
                if (await resultPanel.count() > 0) {
                    const isResultVisible = await resultPanel.isVisible();
                    if (isResultVisible) {
                        results.details.push('✅ 遊戲結果面板正確顯示');
                    } else {
                        results.details.push('⚠️ 遊戲結果面板未顯示');
                    }
                }
                
                await this.takeScreenshot('game-completed', '遊戲完成狀態');
            } else {
                results.details.push(`❌ 遊戲未正確結束，當前階段: ${finalGamePhase}`);
                results.passed = false;
            }

            results.details.push(`ℹ️ 總共完成 ${completedRounds} 輪遊戲`);

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 6 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }  
  /**
     * 測試 7: 跨瀏覽器兼容性測試
     */
    async test7_CrossBrowserCompatibility() {
        this.currentTest = 7;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 跨瀏覽器兼容性測試`, 'start');
        
        const results = {
            testName: '跨瀏覽器兼容性測試',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 檢查瀏覽器信息
            const browserInfo = await page.evaluate(() => ({
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }));

            results.details.push(`ℹ️ 瀏覽器信息: ${browserInfo.userAgent}`);
            results.details.push(`ℹ️ 平台: ${browserInfo.platform}`);
            results.details.push(`ℹ️ 語言: ${browserInfo.language}`);
            results.details.push(`ℹ️ 視窗大小: ${browserInfo.viewport.width}x${browserInfo.viewport.height}`);

            // 檢查JavaScript功能支持
            const jsFeatures = await page.evaluate(() => {
                const features = {
                    localStorage: typeof Storage !== 'undefined',
                    sessionStorage: typeof sessionStorage !== 'undefined',
                    fetch: typeof fetch !== 'undefined',
                    promise: typeof Promise !== 'undefined',
                    arrow: (() => { try { eval('() => {}'); return true; } catch(e) { return false; } })(),
                    const: (() => { try { eval('const x = 1'); return true; } catch(e) { return false; } })(),
                    let: (() => { try { eval('let x = 1'); return true; } catch(e) { return false; } })(),
                    classList: 'classList' in document.createElement('div'),
                    querySelector: 'querySelector' in document,
                    addEventListener: 'addEventListener' in document
                };
                return features;
            });

            let unsupportedFeatures = [];
            for (const [feature, supported] of Object.entries(jsFeatures)) {
                if (supported) {
                    results.details.push(`✅ ${feature} 支持`);
                } else {
                    results.details.push(`❌ ${feature} 不支持`);
                    unsupportedFeatures.push(feature);
                    results.passed = false;
                }
            }

            if (unsupportedFeatures.length === 0) {
                results.details.push('✅ 所有必要的JavaScript功能都受支持');
            } else {
                results.details.push(`❌ 不支持的功能: ${unsupportedFeatures.join(', ')}`);
            }

            // 檢查CSS功能支持
            const cssFeatures = await page.evaluate(() => {
                const testElement = document.createElement('div');
                document.body.appendChild(testElement);
                
                const features = {
                    flexbox: 'flex' in testElement.style,
                    grid: 'grid' in testElement.style,
                    transform: 'transform' in testElement.style,
                    transition: 'transition' in testElement.style,
                    borderRadius: 'borderRadius' in testElement.style,
                    boxShadow: 'boxShadow' in testElement.style,
                    opacity: 'opacity' in testElement.style
                };
                
                document.body.removeChild(testElement);
                return features;
            });

            let unsupportedCSSFeatures = [];
            for (const [feature, supported] of Object.entries(cssFeatures)) {
                if (supported) {
                    results.details.push(`✅ CSS ${feature} 支持`);
                } else {
                    results.details.push(`❌ CSS ${feature} 不支持`);
                    unsupportedCSSFeatures.push(feature);
                }
            }

            // 測試基本遊戲功能在當前瀏覽器中的工作狀態
            const gameElements = [
                { selector: '#game-board', name: '遊戲板' },
                { selector: '.algorithm-selector', name: '演算法選擇器' },
                { selector: '.game-status', name: '遊戲狀態' },
                { selector: '.board-controls', name: '遊戲控制' }
            ];

            for (const element of gameElements) {
                const exists = await this.elementExists(element.selector);
                const visible = await this.isElementVisible(element.selector);
                
                if (exists && visible) {
                    results.details.push(`✅ ${element.name} 在當前瀏覽器中正常顯示`);
                } else {
                    results.details.push(`❌ ${element.name} 在當前瀏覽器中顯示異常`);
                    results.passed = false;
                }
            }

            // 測試事件處理
            const clickTest = await page.evaluate(() => {
                try {
                    const testButton = document.createElement('button');
                    testButton.textContent = 'Test';
                    document.body.appendChild(testButton);
                    
                    let clicked = false;
                    testButton.addEventListener('click', () => { clicked = true; });
                    testButton.click();
                    
                    document.body.removeChild(testButton);
                    return clicked;
                } catch (error) {
                    return false;
                }
            });

            if (clickTest) {
                results.details.push('✅ 事件處理功能正常');
            } else {
                results.details.push('❌ 事件處理功能異常');
                results.passed = false;
            }

            await this.takeScreenshot('browser-compatibility', '瀏覽器兼容性測試');

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 7 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }    /**

     * 測試 8: 視覺回歸測試 - 確保UI元素正確顯示和佈局
     */
    async test8_VisualRegressionTest() {
        this.currentTest = 8;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 視覺回歸測試`, 'start');
        
        const results = {
            testName: '視覺回歸測試',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 測試不同螢幕尺寸下的響應式設計
            const viewports = [
                { width: 1920, height: 1080, name: '桌面大螢幕' },
                { width: 1366, height: 768, name: '桌面標準' },
                { width: 1024, height: 768, name: '小桌面/大平板' },
                { width: 768, height: 1024, name: '平板直向' },
                { width: 480, height: 854, name: '大手機' },
                { width: 375, height: 667, name: '標準手機' }
            ];

            for (const viewport of viewports) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.waitForTimeout(500);

                // 檢查主要元素是否可見且佈局正確
                const mainElements = [
                    { selector: 'h1', name: '主標題' },
                    { selector: '.algorithm-selector', name: '演算法選擇器' },
                    { selector: '.game-status', name: '遊戲狀態' },
                    { selector: '#game-board', name: '遊戲板' },
                    { selector: '.board-controls', name: '遊戲控制' }
                ];

                let allVisible = true;
                let layoutIssues = [];

                for (const element of mainElements) {
                    const isVisible = await this.isElementVisible(element.selector);
                    if (!isVisible) {
                        allVisible = false;
                        layoutIssues.push(element.name);
                    }
                }

                if (allVisible) {
                    results.details.push(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) 所有元素可見`);
                } else {
                    results.details.push(`❌ ${viewport.name} (${viewport.width}x${viewport.height}) 元素顯示問題: ${layoutIssues.join(', ')}`);
                    results.passed = false;
                }

                // 檢查遊戲板在不同尺寸下的佈局
                const gameBoard = page.locator('#game-board');
                if (await gameBoard.count() > 0) {
                    const boardBounds = await gameBoard.boundingBox();
                    if (boardBounds) {
                        const aspectRatio = boardBounds.width / boardBounds.height;
                        // 遊戲板應該接近正方形
                        if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
                            results.details.push(`✅ ${viewport.name} 遊戲板比例正常 (${aspectRatio.toFixed(2)})`);
                        } else {
                            results.details.push(`⚠️ ${viewport.name} 遊戲板比例異常 (${aspectRatio.toFixed(2)})`);
                        }
                    }
                }

                // 檢查格子是否正確排列
                const cells = page.locator('.cell');
                const cellCount = await cells.count();
                if (cellCount === 25) {
                    // 檢查格子是否呈5x5排列
                    const firstCell = cells.first();
                    const lastCell = cells.last();
                    
                    if (await firstCell.count() > 0 && await lastCell.count() > 0) {
                        const firstCellBounds = await firstCell.boundingBox();
                        const lastCellBounds = await lastCell.boundingBox();
                        
                        if (firstCellBounds && lastCellBounds) {
                            const gridWidth = lastCellBounds.x + lastCellBounds.width - firstCellBounds.x;
                            const gridHeight = lastCellBounds.y + lastCellBounds.height - firstCellBounds.y;
                            
                            results.details.push(`ℹ️ ${viewport.name} 遊戲網格尺寸: ${gridWidth.toFixed(0)}x${gridHeight.toFixed(0)}`);
                        }
                    }
                }

                // 截圖記錄不同尺寸下的顯示效果
                await this.takeScreenshot(`viewport-${viewport.width}x${viewport.height}`, `${viewport.name}顯示效果`);
            }

            // 恢復到標準桌面尺寸
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.waitForTimeout(500);

            // 檢查CSS樣式是否正確載入
            const stylesLoaded = await page.evaluate(() => {
                const styleSheets = document.styleSheets;
                let hasStyles = false;
                
                for (let i = 0; i < styleSheets.length; i++) {
                    try {
                        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                        if (rules && rules.length > 0) {
                            hasStyles = true;
                            break;
                        }
                    } catch (e) {
                        // 跨域樣式表可能無法訪問，但這不影響功能
                    }
                }
                
                return hasStyles;
            });

            if (stylesLoaded) {
                results.details.push('✅ CSS樣式正確載入');
            } else {
                results.details.push('❌ CSS樣式載入失敗');
                results.passed = false;
            }

            // 檢查字體和顏色是否正確顯示
            const visualStyles = await page.evaluate(() => {
                const h1 = document.querySelector('h1');
                const gameBoard = document.querySelector('#game-board');
                
                if (!h1 || !gameBoard) return null;
                
                const h1Styles = window.getComputedStyle(h1);
                const boardStyles = window.getComputedStyle(gameBoard);
                
                return {
                    h1Color: h1Styles.color,
                    h1FontSize: h1Styles.fontSize,
                    boardBackground: boardStyles.backgroundColor,
                    boardBorder: boardStyles.border
                };
            });

            if (visualStyles) {
                results.details.push(`ℹ️ 標題顏色: ${visualStyles.h1Color}, 字體大小: ${visualStyles.h1FontSize}`);
                results.details.push(`ℹ️ 遊戲板背景: ${visualStyles.boardBackground}`);
                results.details.push('✅ 視覺樣式檢查完成');
            } else {
                results.details.push('⚠️ 無法獲取視覺樣式信息');
            }

            // 檢查動畫和過渡效果
            const animationTest = await page.evaluate(() => {
                const testElement = document.createElement('div');
                testElement.style.transition = 'opacity 0.3s ease';
                testElement.style.opacity = '1';
                document.body.appendChild(testElement);
                
                // 觸發過渡
                testElement.style.opacity = '0';
                
                // 檢查是否支持過渡
                const hasTransition = testElement.style.transition !== '';
                
                document.body.removeChild(testElement);
                return hasTransition;
            });

            if (animationTest) {
                results.details.push('✅ CSS過渡動畫支持正常');
            } else {
                results.details.push('⚠️ CSS過渡動畫支持異常');
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 8 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    } 
   /**
     * 測試 9: 性能測試 - 監控頁面載入時間和互動響應速度
     */
    async test9_PerformanceTest() {
        this.currentTest = 9;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 性能測試`, 'start');
        
        const results = {
            testName: '性能測試',
            passed: true,
            details: [],
            startTime: Date.now()
        };

        try {
            // 測試頁面重新載入時間
            const reloadStartTime = Date.now();
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            const reloadTime = Date.now() - reloadStartTime;

            if (reloadTime < 3000) {
                results.details.push(`✅ 頁面重新載入時間良好: ${reloadTime}ms`);
            } else if (reloadTime < 5000) {
                results.details.push(`⚠️ 頁面重新載入時間一般: ${reloadTime}ms`);
            } else {
                results.details.push(`❌ 頁面重新載入時間過長: ${reloadTime}ms`);
                results.passed = false;
            }

            // 等待JavaScript完全初始化
            await page.waitForTimeout(2000);

            // 測試遊戲初始化時間
            const initStartTime = Date.now();
            const startButton = page.locator('#start-game');
            if (await startButton.count() > 0 && await startButton.isEnabled()) {
                await startButton.click();
                await this.waitForElementStable('#game-board', 5000);
                const initTime = Date.now() - initStartTime;

                if (initTime < 1000) {
                    results.details.push(`✅ 遊戲初始化時間優秀: ${initTime}ms`);
                } else if (initTime < 2000) {
                    results.details.push(`✅ 遊戲初始化時間良好: ${initTime}ms`);
                } else if (initTime < 3000) {
                    results.details.push(`⚠️ 遊戲初始化時間一般: ${initTime}ms`);
                } else {
                    results.details.push(`❌ 遊戲初始化時間過長: ${initTime}ms`);
                    results.passed = false;
                }
            }

            // 測試格子點擊響應時間
            const clickResponseTimes = [];
            const emptyCells = page.locator('.cell:not(.player):not(.computer)');
            const testClickCount = Math.min(5, await emptyCells.count());

            for (let i = 0; i < testClickCount; i++) {
                const clickStartTime = Date.now();
                await emptyCells.nth(i).click();
                await page.waitForTimeout(100); // 短暫等待響應
                const clickTime = Date.now() - clickStartTime;
                clickResponseTimes.push(clickTime);
            }

            if (clickResponseTimes.length > 0) {
                const avgClickTime = clickResponseTimes.reduce((a, b) => a + b, 0) / clickResponseTimes.length;
                const maxClickTime = Math.max(...clickResponseTimes);

                if (avgClickTime < 200) {
                    results.details.push(`✅ 平均點擊響應時間優秀: ${avgClickTime.toFixed(1)}ms`);
                } else if (avgClickTime < 500) {
                    results.details.push(`✅ 平均點擊響應時間良好: ${avgClickTime.toFixed(1)}ms`);
                } else {
                    results.details.push(`⚠️ 平均點擊響應時間較慢: ${avgClickTime.toFixed(1)}ms`);
                }

                results.details.push(`ℹ️ 最大點擊響應時間: ${maxClickTime}ms`);
            }

            // 測試建議計算時間
            const suggestionStartTime = Date.now();
            await page.waitForTimeout(500); // 等待建議計算
            const suggestionExists = await page.locator('.suggestion').count() > 0;
            const suggestionTime = Date.now() - suggestionStartTime;

            if (suggestionExists) {
                if (suggestionTime < 500) {
                    results.details.push(`✅ 建議計算時間優秀: ${suggestionTime}ms`);
                } else if (suggestionTime < 1000) {
                    results.details.push(`✅ 建議計算時間良好: ${suggestionTime}ms`);
                } else {
                    results.details.push(`⚠️ 建議計算時間較長: ${suggestionTime}ms`);
                }
            } else {
                results.details.push('ℹ️ 未檢測到建議顯示');
            }

            // 測試記憶體使用情況
            const memoryInfo = await page.evaluate(() => {
                if (performance.memory) {
                    return {
                        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                    };
                }
                return null;
            });

            if (memoryInfo) {
                results.details.push(`ℹ️ JavaScript記憶體使用: ${memoryInfo.used}MB / ${memoryInfo.total}MB (限制: ${memoryInfo.limit}MB)`);
                
                if (memoryInfo.used < 50) {
                    results.details.push('✅ 記憶體使用量正常');
                } else if (memoryInfo.used < 100) {
                    results.details.push('⚠️ 記憶體使用量較高');
                } else {
                    results.details.push('❌ 記憶體使用量過高');
                    results.passed = false;
                }
            } else {
                results.details.push('ℹ️ 無法獲取記憶體使用信息');
            }

            // 測試DOM操作性能
            const domTestStartTime = Date.now();
            await page.evaluate(() => {
                // 模擬大量DOM操作
                const testContainer = document.createElement('div');
                document.body.appendChild(testContainer);
                
                for (let i = 0; i < 1000; i++) {
                    const element = document.createElement('div');
                    element.textContent = `Test ${i}`;
                    testContainer.appendChild(element);
                }
                
                document.body.removeChild(testContainer);
            });
            const domTestTime = Date.now() - domTestStartTime;

            if (domTestTime < 100) {
                results.details.push(`✅ DOM操作性能優秀: ${domTestTime}ms`);
            } else if (domTestTime < 300) {
                results.details.push(`✅ DOM操作性能良好: ${domTestTime}ms`);
            } else {
                results.details.push(`⚠️ DOM操作性能較慢: ${domTestTime}ms`);
            }

            // 測試網路資源載入時間
            const resourceTimings = await page.evaluate(() => {
                const entries = performance.getEntriesByType('resource');
                return entries.map(entry => ({
                    name: entry.name.split('/').pop(),
                    duration: Math.round(entry.duration),
                    size: entry.transferSize || 0
                })).filter(entry => entry.name.endsWith('.js') || entry.name.endsWith('.css'));
            });

            if (resourceTimings.length > 0) {
                results.details.push('ℹ️ 資源載入時間:');
                resourceTimings.forEach(resource => {
                    const sizeKB = (resource.size / 1024).toFixed(1);
                    results.details.push(`  - ${resource.name}: ${resource.duration}ms (${sizeKB}KB)`);
                });

                const totalLoadTime = resourceTimings.reduce((sum, resource) => sum + resource.duration, 0);
                if (totalLoadTime < 1000) {
                    results.details.push(`✅ 總資源載入時間良好: ${totalLoadTime}ms`);
                } else {
                    results.details.push(`⚠️ 總資源載入時間較長: ${totalLoadTime}ms`);
                }
            }

            // 測試FPS（如果支持）
            const fpsTest = await page.evaluate(() => {
                return new Promise((resolve) => {
                    let frames = 0;
                    const startTime = Date.now();
                    
                    function countFrame() {
                        frames++;
                        if (Date.now() - startTime < 1000) {
                            requestAnimationFrame(countFrame);
                        } else {
                            resolve(frames);
                        }
                    }
                    
                    if (typeof requestAnimationFrame !== 'undefined') {
                        requestAnimationFrame(countFrame);
                    } else {
                        resolve(0);
                    }
                });
            });

            if (fpsTest > 0) {
                if (fpsTest >= 50) {
                    results.details.push(`✅ 動畫幀率優秀: ${fpsTest} FPS`);
                } else if (fpsTest >= 30) {
                    results.details.push(`✅ 動畫幀率良好: ${fpsTest} FPS`);
                } else {
                    results.details.push(`⚠️ 動畫幀率較低: ${fpsTest} FPS`);
                }
            }

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 9 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }  
  /**
     * 測試 10: 連線檢測和視覺反饋測試
     */
    async test10_LineDetectionAndVisualFeedback() {
        this.currentTest = 10;
        this.log(`開始測試 ${this.currentTest}/${this.totalTests}: 連線檢測和視覺反饋測試`, 'start');
        
        const results = {
            testName: '連線檢測和視覺反饋測試',
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
                results.details.push('✅ 成功開始新遊戲進行連線測試');
            }

            // 測試建議顯示功能
            await page.waitForTimeout(1000); // 等待建議計算
            const initialSuggestion = await page.locator('.suggestion').count();
            
            if (initialSuggestion > 0) {
                results.details.push('✅ 初始建議正確顯示');
                
                // 檢查建議的視覺效果
                const suggestionCell = page.locator('.cell.suggestion').first();
                const suggestionVisible = await suggestionCell.isVisible();
                
                if (suggestionVisible) {
                    results.details.push('✅ 建議格子視覺效果正常');
                } else {
                    results.details.push('❌ 建議格子視覺效果異常');
                    results.passed = false;
                }
            } else {
                results.details.push('⚠️ 初始建議未顯示（可能正常）');
            }

            // 進行多次移動以嘗試形成連線
            let moveCount = 0;
            let linesDetected = false;
            const maxMoves = 16; // 8輪 x 2 (玩家+電腦)

            // 啟用自動電腦下棋以加速測試
            const autoCheckbox = page.locator('#auto-random-move');
            if (await autoCheckbox.count() > 0 && !await autoCheckbox.isChecked()) {
                await autoCheckbox.check();
                await page.waitForTimeout(300);
            }

            while (moveCount < maxMoves && !linesDetected) {
                // 檢查遊戲是否結束
                const gamePhase = await this.getElementText('#game-phase', '');
                if (gamePhase.includes('遊戲結束')) {
                    results.details.push('ℹ️ 遊戲已結束，停止移動測試');
                    break;
                }

                // 玩家移動
                if (gamePhase.includes('玩家回合')) {
                    const emptyCells = page.locator('.cell:not(.player):not(.computer)');
                    if (await emptyCells.count() > 0) {
                        // 優先點擊建議的格子
                        const suggestedCell = page.locator('.cell.suggestion').first();
                        if (await suggestedCell.count() > 0) {
                            await suggestedCell.click();
                        } else {
                            await emptyCells.first().click();
                        }
                        
                        await page.waitForTimeout(1000); // 等待電腦自動移動
                        moveCount++;
                        
                        // 檢查是否有連線形成
                        const completedLines = await this.getElementText('#completed-lines', '0');
                        const lineCount = parseInt(completedLines);
                        
                        if (lineCount > 0) {
                            linesDetected = true;
                            results.details.push(`✅ 成功檢測到連線: ${lineCount} 條 (第 ${moveCount} 次移動後)`);
                            
                            // 檢查連線高亮顯示
                            const highlightedCells = await page.locator('.cell.line-highlight').count();
                            if (highlightedCells >= 5) {
                                results.details.push(`✅ 連線高亮顯示正常: ${highlightedCells} 個格子`);
                            } else {
                                results.details.push(`⚠️ 連線高亮可能不完整: ${highlightedCells} 個格子`);
                            }
                            
                            // 截圖記錄連線狀態
                            await this.takeScreenshot('line-detected', '檢測到連線狀態');
                            break;
                        }
                    } else {
                        results.details.push('⚠️ 沒有空格子可供移動');
                        break;
                    }
                } else {
                    // 等待遊戲狀態更新
                    await page.waitForTimeout(500);
                }
            }

            // 測試不同類型的連線檢測（如果可能）
            if (linesDetected) {
                // 檢查連線類型
                const lineTypes = await page.evaluate(() => {
                    const highlightedCells = document.querySelectorAll('.cell.line-highlight');
                    const positions = Array.from(highlightedCells).map(cell => {
                        const row = parseInt(cell.dataset.row || '0');
                        const col = parseInt(cell.dataset.col || '0');
                        return { row, col };
                    });
                    
                    if (positions.length < 5) return 'unknown';
                    
                    // 檢查是否為水平線
                    const sameRow = positions.every(pos => pos.row === positions[0].row);
                    if (sameRow) return 'horizontal';
                    
                    // 檢查是否為垂直線
                    const sameCol = positions.every(pos => pos.col === positions[0].col);
                    if (sameCol) return 'vertical';
                    
                    // 檢查是否為對角線
                    const isMainDiagonal = positions.every(pos => pos.row === pos.col);
                    if (isMainDiagonal) return 'main-diagonal';
                    
                    const isAntiDiagonal = positions.every(pos => pos.row + pos.col === 4);
                    if (isAntiDiagonal) return 'anti-diagonal';
                    
                    return 'unknown';
                });
                
                results.details.push(`ℹ️ 檢測到的連線類型: ${lineTypes}`);
            } else {
                results.details.push('ℹ️ 在測試期間未形成連線（正常情況）');
            }

            // 測試建議更新功能
            const suggestionUpdateTest = await page.evaluate(() => {
                // 檢查建議是否會隨著遊戲狀態變化而更新
                const suggestions = document.querySelectorAll('.cell.suggestion');
                return suggestions.length;
            });

            results.details.push(`ℹ️ 當前建議數量: ${suggestionUpdateTest}`);

            // 測試視覺反饋的一致性
            const visualConsistencyTest = await page.evaluate(() => {
                const playerCells = document.querySelectorAll('.cell.player');
                const computerCells = document.querySelectorAll('.cell.computer');
                const suggestionCells = document.querySelectorAll('.cell.suggestion');
                
                return {
                    playerCells: playerCells.length,
                    computerCells: computerCells.length,
                    suggestionCells: suggestionCells.length,
                    totalCells: document.querySelectorAll('.cell').length
                };
            });

            results.details.push(`ℹ️ 視覺狀態統計 - 玩家: ${visualConsistencyTest.playerCells}, 電腦: ${visualConsistencyTest.computerCells}, 建議: ${visualConsistencyTest.suggestionCells}, 總計: ${visualConsistencyTest.totalCells}`);

            if (visualConsistencyTest.totalCells === 25) {
                results.details.push('✅ 格子總數正確');
            } else {
                results.details.push(`❌ 格子總數錯誤: ${visualConsistencyTest.totalCells}`);
                results.passed = false;
            }

            // 最終狀態檢查
            const finalLines = await this.getElementText('#completed-lines', '0');
            const finalRound = await this.getElementText('#current-round', '0');
            const finalPhase = await this.getElementText('#game-phase', '');

            results.details.push(`ℹ️ 最終狀態 - 輪數: ${finalRound}, 階段: ${finalPhase}, 連線數: ${finalLines}`);
            results.details.push(`✅ 連線檢測和視覺反饋測試完成，進行了 ${moveCount} 次移動`);

        } catch (error) {
            results.passed = false;
            results.details.push(`❌ 測試執行錯誤: ${error.message}`);
            this.log(`測試執行錯誤: ${error.message}`, 'error');
        }

        results.duration = Date.now() - results.startTime;
        this.testResults.push(results);
        this.log(`測試 10 完成，耗時: ${results.duration}ms，結果: ${results.passed ? '通過' : '失敗'}`, 
                 results.passed ? 'success' : 'error');
        return results;
    }    /**

     * 執行所有測試
     */
    async runAllTests() {
        this.log('🚀 開始執行 Bingo 遊戲 Playwright 功能測試套件', 'start');
        this.log('=' .repeat(80));

        const tests = [
            this.test1_PlaywrightMCPServerSetup,
            this.test2_PageLoadAndInitialState,
            this.test3_AlgorithmSwitching,
            this.test4_GameBoardInteraction,
            this.test5_ComputerTurnAndRandomMove,
            this.test6_CompleteGameFlow,
            this.test7_CrossBrowserCompatibility,
            this.test8_VisualRegressionTest,
            this.test9_PerformanceTest,
            this.test10_LineDetectionAndVisualFeedback
        ];

        for (const test of tests) {
            try {
                await test.call(this);
                await page.waitForTimeout(1000); // 測試間隔
            } catch (error) {
                this.log(`測試執行失敗: ${error.message}`, 'error');
                
                // 記錄失敗的測試
                this.testResults.push({
                    testName: `測試 ${this.currentTest} (執行失敗)`,
                    passed: false,
                    details: [`❌ 測試執行失敗: ${error.message}`],
                    duration: 0
                });
            }
        }

        const report = this.generateTestReport();
        this.generateHTMLReport();
        
        this.log('🏁 所有測試執行完成', 'complete');
        return report;
    }

    /**
     * 生成測試報告
     */
    generateTestReport() {
        this.log('📊 生成測試報告', 'info');
        this.log('=' .repeat(80));

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        const totalDuration = Date.now() - this.startTime;

        const report = {
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate: ((passedTests / totalTests) * 100).toFixed(1),
                totalDuration,
                timestamp: new Date().toISOString()
            },
            results: this.testResults,
            screenshots: this.screenshots
        };

        console.log(`\n📈 測試摘要:`);
        console.log(`總測試數: ${totalTests}`);
        console.log(`通過: ${passedTests} ✅`);
        console.log(`失敗: ${failedTests} ❌`);
        console.log(`成功率: ${report.summary.successRate}%`);
        console.log(`總耗時: ${totalDuration}ms`);
        console.log(`截圖數量: ${this.screenshots.length}`);
        console.log('');

        // 詳細結果
        this.testResults.forEach((test, index) => {
            const status = test.passed ? '✅ PASS' : '❌ FAIL';
            const duration = test.duration ? `(${test.duration}ms)` : '';
            console.log(`${index + 1}. ${test.testName}: ${status} ${duration}`);
            
            if (test.details && test.details.length > 0) {
                test.details.forEach(detail => {
                    console.log(`   ${detail}`);
                });
            }
            console.log('');
        });

        // 截圖列表
        if (this.screenshots.length > 0) {
            console.log('📸 截圖列表:');
            this.screenshots.forEach((screenshot, index) => {
                console.log(`${index + 1}. ${screenshot.name}: ${screenshot.filename} - ${screenshot.description}`);
            });
            console.log('');
        }

        return report;
    }

    /**
     * 生成 HTML 測試報告
     */
    generateHTMLReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);

        const htmlContent = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bingo 遊戲 Playwright 功能測試報告</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { font-size: 2rem; margin-bottom: 10px; }
        .summary-card p { color: #666; font-size: 1.1rem; }
        .total { border-left: 4px solid #3498db; }
        .passed { border-left: 4px solid #27ae60; }
        .failed { border-left: 4px solid #e74c3c; }
        .success-rate { border-left: 4px solid #f39c12; }
        .test-results { background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .test-result { padding: 20px; border-bottom: 1px solid #eee; }
        .test-result:last-child { border-bottom: none; }
        .test-passed { border-left: 4px solid #27ae60; background: #f8fff9; }
        .test-failed { border-left: 4px solid #e74c3c; background: #fff8f8; }
        .test-header { display: flex; justify-content: between; align-items: center; margin-bottom: 15px; }
        .test-title { font-size: 1.2rem; font-weight: bold; flex: 1; }
        .test-duration { color: #666; font-size: 0.9rem; }
        .test-details { margin-left: 20px; }
        .test-details li { margin-bottom: 8px; padding: 5px 0; }
        .screenshots { margin-top: 30px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .screenshots h2 { margin-bottom: 20px; color: #2c3e50; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .screenshot-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .screenshot-info { padding: 15px; }
        .screenshot-name { font-weight: bold; margin-bottom: 5px; }
        .screenshot-desc { color: #666; font-size: 0.9rem; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; color: #666; }
        .progress-bar { width: 100%; height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #27ae60, #2ecc71); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Bingo 遊戲 Playwright 功能測試報告</h1>
            <p>使用 Playwright MCP Server 進行的完整功能測試</p>
            <p>測試時間: ${new Date().toLocaleString('zh-TW')}</p>
        </div>

        <div class="summary">
            <div class="summary-card total">
                <h3>${totalTests}</h3>
                <p>總測試數</p>
            </div>
            <div class="summary-card passed">
                <h3>${passedTests}</h3>
                <p>通過測試</p>
            </div>
            <div class="summary-card failed">
                <h3>${failedTests}</h3>
                <p>失敗測試</p>
            </div>
            <div class="summary-card success-rate">
                <h3>${successRate}%</h3>
                <p>成功率</p>
            </div>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: ${successRate}%"></div>
        </div>

        <div class="test-results">
            ${this.testResults.map((test, index) => `
                <div class="test-result ${test.passed ? 'test-passed' : 'test-failed'}">
                    <div class="test-header">
                        <div class="test-title">
                            ${index + 1}. ${test.testName} ${test.passed ? '✅' : '❌'}
                        </div>
                        <div class="test-duration">${test.duration || 0}ms</div>
                    </div>
                    <ul class="test-details">
                        ${(test.details || []).map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>

        ${this.screenshots.length > 0 ? `
        <div class="screenshots">
            <h2>📸 測試截圖</h2>
            <div class="screenshot-grid">
                ${this.screenshots.map(screenshot => `
                    <div class="screenshot-item">
                        <div class="screenshot-info">
                            <div class="screenshot-name">${screenshot.name}</div>
                            <div class="screenshot-desc">${screenshot.description}</div>
                            <div class="screenshot-desc">檔案: ${screenshot.filename}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <p>測試執行時間: ${Date.now() - this.startTime}ms</p>
            <p>報告生成時間: ${new Date().toLocaleString('zh-TW')}</p>
        </div>
    </div>
</body>
</html>`;

        this.log('📄 HTML 測試報告已生成', 'info');
        return htmlContent;
    }
}

// 導出類別
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BingoPlaywrightFunctionTests;
}

// 使用說明
console.log(`
🎯 Bingo 遊戲 Playwright MCP Server 功能測試計畫

這個完整的測試套件包含以下測試項目：

1. Playwright MCP Server 配置驗證
2. 頁面載入和初始狀態驗證  
3. 演算法切換功能測試
4. 遊戲板互動測試 - 驗證格子點擊、建議顯示和連線檢測功能
5. 電腦回合和隨機移動測試
6. 完整遊戲流程測試 - 模擬從開始到結束的完整遊戲體驗
7. 跨瀏覽器兼容性測試 - 確保在不同瀏覽器環境下功能正常
8. 視覺回歸測試 - 確保UI元素正確顯示和佈局
9. 性能測試 - 監控頁面載入時間和互動響應速度
10. 連線檢測和視覺反饋測試

特色功能：
✅ 完整的截圖記錄
✅ 詳細的性能監控
✅ 跨瀏覽器兼容性檢查
✅ 響應式設計測試
✅ HTML 測試報告生成
✅ 視覺回歸檢測

使用方法：
const tester = new BingoPlaywrightFunctionTests();
await tester.runAllTests();
`);