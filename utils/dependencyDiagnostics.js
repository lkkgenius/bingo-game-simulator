/**
 * Dependency Diagnostics - 依賴診斷工具
 * 
 * 這個模組提供：
 * - 依賴健康檢查的可視化界面
 * - 實時依賴監控和報告
 * - 開發者友好的診斷信息
 * - 自動化問題檢測和修復建議
 * 
 * @class DependencyDiagnostics
 * @version 1.0.0
 */

// Logger 初始化
let logger, dependencyValidator;
if (typeof window !== 'undefined') {
    logger = window.logger;
    dependencyValidator = window.dependencyValidator;
} else if (typeof require !== 'undefined') {
    try {
        const { logger: prodLogger } = require('../production-logger.js');
        const { dependencyValidator: depValidator } = require('./dependencyValidator.js');
        logger = prodLogger;
        dependencyValidator = depValidator;
    } catch (e) {
        // Fallback
        logger = console;
        dependencyValidator = null;
    }
}

class DependencyDiagnostics {
    constructor() {
        this.diagnosticHistory = [];
        this.monitoringInterval = null;
        this.isMonitoring = false;
        this.diagnosticCallbacks = new Map();
        this.alertThresholds = {
            healthScore: 70,
            criticalDependencies: 0,
            responseTime: 1000
        };
        this.diagnosticUI = null;
        
        this.setupDiagnosticCategories();
    }

    /**
     * 設置診斷類別
     */
    setupDiagnosticCategories() {
        this.diagnosticCategories = {
            availability: {
                name: '可用性檢查',
                description: '檢查所有依賴項目是否正確載入',
                severity: 'critical',
                tests: [
                    'checkCriticalDependencies',
                    'checkOptionalDependencies',
                    'checkGlobalVariables'
                ]
            },
            integrity: {
                name: '完整性檢查',
                description: '驗證依賴項目的方法和屬性',
                severity: 'high',
                tests: [
                    'checkMethodAvailability',
                    'checkPropertyIntegrity',
                    'checkInterfaceCompatibility'
                ]
            },
            performance: {
                name: '性能檢查',
                description: '監控依賴載入和執行性能',
                severity: 'medium',
                tests: [
                    'checkLoadingPerformance',
                    'checkExecutionPerformance',
                    'checkMemoryUsage'
                ]
            },
            compatibility: {
                name: '兼容性檢查',
                description: '檢查瀏覽器和環境兼容性',
                severity: 'medium',
                tests: [
                    'checkBrowserCompatibility',
                    'checkFeatureSupport',
                    'checkVersionCompatibility'
                ]
            },
            security: {
                name: '安全性檢查',
                description: '檢查潛在的安全問題',
                severity: 'high',
                tests: [
                    'checkGlobalPollution',
                    'checkUnsafeOperations',
                    'checkDataValidation'
                ]
            }
        };
    }

    /**
     * 執行完整的依賴診斷
     * @returns {Promise<Object>} 診斷結果
     */
    async runCompleteDiagnostics() {
        logger.info('開始執行完整依賴診斷...');
        
        const diagnosticStart = Date.now();
        const results = {
            timestamp: new Date().toISOString(),
            overall: {
                status: 'unknown',
                score: 0,
                issues: 0,
                warnings: 0
            },
            categories: {},
            recommendations: [],
            performance: {},
            environment: this._getEnvironmentInfo()
        };

        try {
            // 執行各類別的診斷
            for (const [categoryName, category] of Object.entries(this.diagnosticCategories)) {
                logger.debug(`執行 ${category.name} 診斷...`);
                
                const categoryResult = await this._runCategoryDiagnostics(categoryName, category);
                results.categories[categoryName] = categoryResult;
                
                // 累計問題統計
                results.overall.issues += categoryResult.issues.length;
                results.overall.warnings += categoryResult.warnings.length;
            }

            // 計算整體分數
            results.overall.score = this._calculateOverallScore(results.categories);
            results.overall.status = this._determineOverallStatus(results.overall.score, results.overall.issues);

            // 生成建議
            results.recommendations = this._generateDiagnosticRecommendations(results);

            // 性能統計
            const diagnosticEnd = Date.now();
            results.performance = {
                totalTime: diagnosticEnd - diagnosticStart,
                categoriesChecked: Object.keys(results.categories).length,
                testsExecuted: Object.values(results.categories).reduce((sum, cat) => sum + cat.testsExecuted, 0)
            };

            // 記錄診斷歷史
            this.diagnosticHistory.push(results);
            
            // 保持歷史記錄在合理範圍內
            if (this.diagnosticHistory.length > 50) {
                this.diagnosticHistory = this.diagnosticHistory.slice(-50);
            }

            logger.info(`依賴診斷完成: ${results.overall.status} (分數: ${results.overall.score})`);
            
            // 觸發診斷完成回調
            this._triggerDiagnosticCallbacks('complete', results);

        } catch (error) {
            logger.error('依賴診斷過程中發生錯誤:', error);
            results.overall.status = 'error';
            results.error = error.message;
        }

        return results;
    }

    /**
     * 執行特定類別的診斷
     * @private
     */
    async _runCategoryDiagnostics(categoryName, category) {
        const categoryResult = {
            name: category.name,
            description: category.description,
            severity: category.severity,
            status: 'unknown',
            score: 0,
            issues: [],
            warnings: [],
            testsExecuted: 0,
            performance: {}
        };

        const categoryStart = Date.now();

        try {
            // 執行類別中的所有測試
            for (const testName of category.tests) {
                if (typeof this[testName] === 'function') {
                    try {
                        const testResult = await this[testName]();
                        categoryResult.testsExecuted++;
                        
                        if (testResult.issues) {
                            categoryResult.issues.push(...testResult.issues);
                        }
                        if (testResult.warnings) {
                            categoryResult.warnings.push(...testResult.warnings);
                        }
                    } catch (error) {
                        categoryResult.issues.push({
                            test: testName,
                            message: `測試執行失敗: ${error.message}`,
                            severity: 'high'
                        });
                    }
                }
            }

            // 計算類別分數
            categoryResult.score = this._calculateCategoryScore(categoryResult);
            categoryResult.status = categoryResult.issues.length === 0 ? 'healthy' : 'issues';

        } catch (error) {
            categoryResult.status = 'error';
            categoryResult.issues.push({
                message: `類別診斷失敗: ${error.message}`,
                severity: 'critical'
            });
        }

        categoryResult.performance.executionTime = Date.now() - categoryStart;
        return categoryResult;
    }

    /**
     * 檢查關鍵依賴項目
     */
    async checkCriticalDependencies() {
        const result = { issues: [], warnings: [] };
        
        if (!dependencyValidator) {
            result.issues.push({
                message: '依賴驗證器不可用',
                severity: 'critical',
                recommendation: '確保 dependencyValidator 正確載入'
            });
            return result;
        }

        try {
            const validationResults = await dependencyValidator.validateAllDependencies();
            
            // 檢查關鍵依賴
            const criticalIssues = validationResults.issues.filter(issue => issue.severity === 'critical');
            
            for (const issue of criticalIssues) {
                result.issues.push({
                    dependency: issue.dependency,
                    message: `關鍵依賴項目不可用: ${issue.message}`,
                    severity: 'critical',
                    recommendation: issue.autoRepairAvailable ? '啟用自動修復' : '手動修復依賴項目'
                });
            }

            // 檢查修復狀況
            if (validationResults.repairs.length > 0) {
                result.warnings.push({
                    message: `${validationResults.repairs.length} 個依賴項目已自動修復`,
                    severity: 'medium',
                    details: validationResults.repairs.map(repair => repair.dependency)
                });
            }

        } catch (error) {
            result.issues.push({
                message: `關鍵依賴檢查失敗: ${error.message}`,
                severity: 'critical'
            });
        }

        return result;
    }

    /**
     * 檢查可選依賴項目
     */
    async checkOptionalDependencies() {
        const result = { issues: [], warnings: [] };
        
        const optionalDependencies = [
            'EnhancedProbabilityCalculator',
            'AILearningSystem',
            'PerformanceMonitor'
        ];

        for (const dep of optionalDependencies) {
            try {
                const available = this._checkDependencyAvailability(dep);
                if (!available) {
                    result.warnings.push({
                        dependency: dep,
                        message: `可選依賴項目 ${dep} 不可用`,
                        severity: 'low',
                        recommendation: '考慮載入此依賴項目以獲得完整功能'
                    });
                }
            } catch (error) {
                result.warnings.push({
                    dependency: dep,
                    message: `檢查可選依賴 ${dep} 時發生錯誤: ${error.message}`,
                    severity: 'medium'
                });
            }
        }

        return result;
    }

    /**
     * 檢查全局變量
     */
    async checkGlobalVariables() {
        const result = { issues: [], warnings: [] };
        
        const expectedGlobals = [
            'CONSTANTS', 'Utils', 'LineDetector', 'ProbabilityCalculator',
            'GameBoard', 'GameEngine'
        ];

        const globalScope = typeof window !== 'undefined' ? window : global;

        for (const globalVar of expectedGlobals) {
            if (!(globalVar in globalScope)) {
                result.issues.push({
                    variable: globalVar,
                    message: `全局變量 ${globalVar} 未定義`,
                    severity: 'high',
                    recommendation: '確保相應的腳本文件已正確載入'
                });
            } else if (globalScope[globalVar] === null || globalScope[globalVar] === undefined) {
                result.warnings.push({
                    variable: globalVar,
                    message: `全局變量 ${globalVar} 為 null 或 undefined`,
                    severity: 'medium'
                });
            }
        }

        return result;
    }

    /**
     * 檢查方法可用性
     */
    async checkMethodAvailability() {
        const result = { issues: [], warnings: [] };
        
        const methodChecks = [
            {
                object: 'LineDetector',
                methods: ['checkHorizontalLines', 'checkVerticalLines', 'getAllLines']
            },
            {
                object: 'ProbabilityCalculator',
                methods: ['calculateMoveValue', 'getBestSuggestion']
            },
            {
                object: 'GameEngine',
                methods: ['startGame', 'processPlayerTurn', 'isGameComplete']
            }
        ];

        const globalScope = typeof window !== 'undefined' ? window : global;

        for (const check of methodChecks) {
            const obj = globalScope[check.object];
            
            if (!obj) {
                result.issues.push({
                    object: check.object,
                    message: `對象 ${check.object} 不存在，無法檢查方法`,
                    severity: 'high'
                });
                continue;
            }

            for (const method of check.methods) {
                let hasMethod = false;
                
                if (typeof obj === 'function' && obj.prototype) {
                    // 檢查類的原型方法
                    hasMethod = typeof obj.prototype[method] === 'function';
                } else if (typeof obj === 'object') {
                    // 檢查對象的方法
                    hasMethod = typeof obj[method] === 'function';
                }

                if (!hasMethod) {
                    result.issues.push({
                        object: check.object,
                        method: method,
                        message: `方法 ${check.object}.${method} 不可用`,
                        severity: 'high',
                        recommendation: '檢查對象實現是否完整'
                    });
                }
            }
        }

        return result;
    }

    /**
     * 檢查屬性完整性
     */
    async checkPropertyIntegrity() {
        const result = { issues: [], warnings: [] };
        
        const globalScope = typeof window !== 'undefined' ? window : global;
        
        // 檢查 CONSTANTS
        if (globalScope.CONSTANTS) {
            const requiredConstants = [
                'BOARD_SIZE', 'MAX_ROUNDS', 'CELL_STATES', 'GAME_PHASES'
            ];
            
            for (const constant of requiredConstants) {
                if (!(constant in globalScope.CONSTANTS)) {
                    result.issues.push({
                        object: 'CONSTANTS',
                        property: constant,
                        message: `常數 CONSTANTS.${constant} 缺失`,
                        severity: 'high'
                    });
                }
            }
        }

        // 檢查 Utils
        if (globalScope.Utils) {
            const requiredUtils = [
                'isValidPosition', 'isCellEmpty', 'copyBoard'
            ];
            
            for (const util of requiredUtils) {
                if (typeof globalScope.Utils[util] !== 'function') {
                    result.issues.push({
                        object: 'Utils',
                        property: util,
                        message: `工具函數 Utils.${util} 不可用`,
                        severity: 'high'
                    });
                }
            }
        }

        return result;
    }

    /**
     * 檢查接口兼容性
     */
    async checkInterfaceCompatibility() {
        const result = { issues: [], warnings: [] };
        
        try {
            const globalScope = typeof window !== 'undefined' ? window : global;
            
            // 測試 LineDetector 接口
            if (globalScope.LineDetector) {
                try {
                    const detector = new globalScope.LineDetector();
                    const testBoard = Array(5).fill().map(() => Array(5).fill(0));
                    
                    // 測試基本方法調用
                    const lines = detector.getAllLines(testBoard);
                    if (!Array.isArray(lines)) {
                        result.issues.push({
                            interface: 'LineDetector',
                            message: 'getAllLines 方法返回值不是數組',
                            severity: 'high'
                        });
                    }
                } catch (error) {
                    result.issues.push({
                        interface: 'LineDetector',
                        message: `LineDetector 接口測試失敗: ${error.message}`,
                        severity: 'high'
                    });
                }
            }

            // 測試 ProbabilityCalculator 接口
            if (globalScope.ProbabilityCalculator) {
                try {
                    const calculator = new globalScope.ProbabilityCalculator();
                    const testBoard = Array(5).fill().map(() => Array(5).fill(0));
                    
                    const value = calculator.calculateMoveValue(testBoard, 2, 2);
                    if (typeof value !== 'number') {
                        result.issues.push({
                            interface: 'ProbabilityCalculator',
                            message: 'calculateMoveValue 方法返回值不是數字',
                            severity: 'high'
                        });
                    }
                } catch (error) {
                    result.issues.push({
                        interface: 'ProbabilityCalculator',
                        message: `ProbabilityCalculator 接口測試失敗: ${error.message}`,
                        severity: 'high'
                    });
                }
            }

        } catch (error) {
            result.issues.push({
                message: `接口兼容性檢查失敗: ${error.message}`,
                severity: 'medium'
            });
        }

        return result;
    }

    /**
     * 檢查載入性能
     */
    async checkLoadingPerformance() {
        const result = { issues: [], warnings: [] };
        
        try {
            if (dependencyValidator) {
                const validationResults = await dependencyValidator.validateAllDependencies();
                
                if (validationResults.performance.totalTime > this.alertThresholds.responseTime) {
                    result.warnings.push({
                        metric: 'loadingTime',
                        value: validationResults.performance.totalTime,
                        threshold: this.alertThresholds.responseTime,
                        message: `依賴載入時間過長: ${validationResults.performance.totalTime}ms`,
                        severity: 'medium',
                        recommendation: '考慮優化依賴載入順序或使用懶加載'
                    });
                }
            }
        } catch (error) {
            result.warnings.push({
                message: `載入性能檢查失敗: ${error.message}`,
                severity: 'low'
            });
        }

        return result;
    }

    /**
     * 檢查執行性能
     */
    async checkExecutionPerformance() {
        const result = { issues: [], warnings: [] };
        
        try {
            const globalScope = typeof window !== 'undefined' ? window : global;
            
            // 測試 ProbabilityCalculator 性能
            if (globalScope.ProbabilityCalculator) {
                const calculator = new globalScope.ProbabilityCalculator();
                const testBoard = Array(5).fill().map(() => Array(5).fill(0));
                
                const startTime = performance.now();
                for (let i = 0; i < 100; i++) {
                    calculator.calculateMoveValue(testBoard, Math.floor(Math.random() * 5), Math.floor(Math.random() * 5));
                }
                const endTime = performance.now();
                
                const avgTime = (endTime - startTime) / 100;
                if (avgTime > 10) { // 10ms per calculation
                    result.warnings.push({
                        component: 'ProbabilityCalculator',
                        metric: 'calculationTime',
                        value: avgTime,
                        message: `機率計算性能較慢: 平均 ${avgTime.toFixed(2)}ms`,
                        severity: 'medium',
                        recommendation: '考慮啟用緩存或優化算法'
                    });
                }
            }
        } catch (error) {
            result.warnings.push({
                message: `執行性能檢查失敗: ${error.message}`,
                severity: 'low'
            });
        }

        return result;
    }

    /**
     * 檢查記憶體使用
     */
    async checkMemoryUsage() {
        const result = { issues: [], warnings: [] };
        
        try {
            if (typeof performance !== 'undefined' && performance.memory) {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
                
                const usagePercent = (usedMB / limitMB) * 100;
                
                if (usagePercent > 80) {
                    result.warnings.push({
                        metric: 'memoryUsage',
                        value: usagePercent,
                        message: `記憶體使用率較高: ${usagePercent.toFixed(1)}%`,
                        severity: 'medium',
                        recommendation: '檢查是否有記憶體洩漏或考慮優化數據結構'
                    });
                }
            }
        } catch (error) {
            result.warnings.push({
                message: `記憶體使用檢查失敗: ${error.message}`,
                severity: 'low'
            });
        }

        return result;
    }

    /**
     * 檢查瀏覽器兼容性
     */
    async checkBrowserCompatibility() {
        const result = { issues: [], warnings: [] };
        
        try {
            const requiredFeatures = [
                { name: 'Promise', test: () => typeof Promise !== 'undefined' },
                { name: 'Map', test: () => typeof Map !== 'undefined' },
                { name: 'Set', test: () => typeof Set !== 'undefined' },
                { name: 'Array.from', test: () => typeof Array.from === 'function' },
                { name: 'Object.assign', test: () => typeof Object.assign === 'function' }
            ];

            for (const feature of requiredFeatures) {
                if (!feature.test()) {
                    result.issues.push({
                        feature: feature.name,
                        message: `瀏覽器不支持 ${feature.name}`,
                        severity: 'high',
                        recommendation: '使用 polyfill 或升級瀏覽器'
                    });
                }
            }

            // 檢查用戶代理
            if (typeof navigator !== 'undefined') {
                const userAgent = navigator.userAgent;
                if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
                    result.warnings.push({
                        browser: 'Internet Explorer',
                        message: '檢測到 Internet Explorer，可能存在兼容性問題',
                        severity: 'medium',
                        recommendation: '建議使用現代瀏覽器'
                    });
                }
            }

        } catch (error) {
            result.warnings.push({
                message: `瀏覽器兼容性檢查失敗: ${error.message}`,
                severity: 'low'
            });
        }

        return result;
    }

    /**
     * 檢查功能支持
     */
    async checkFeatureSupport() {
        const result = { issues: [], warnings: [] };
        
        try {
            const features = [
                { name: 'localStorage', test: () => typeof Storage !== 'undefined' },
                { name: 'sessionStorage', test: () => typeof sessionStorage !== 'undefined' },
                { name: 'console', test: () => typeof console !== 'undefined' },
                { name: 'JSON', test: () => typeof JSON !== 'undefined' }
            ];

            for (const feature of features) {
                if (!feature.test()) {
                    result.warnings.push({
                        feature: feature.name,
                        message: `功能 ${feature.name} 不支持`,
                        severity: 'medium',
                        recommendation: '某些功能可能無法正常工作'
                    });
                }
            }

        } catch (error) {
            result.warnings.push({
                message: `功能支持檢查失敗: ${error.message}`,
                severity: 'low'
            });
        }

        return result;
    }

    /**
     * 檢查版本兼容性
     */
    async checkVersionCompatibility() {
        const result = { issues: [], warnings: [] };
        
        // 這裡可以添加版本檢查邏輯
        // 目前返回空結果
        return result;
    }

    /**
     * 檢查全局污染
     */
    async checkGlobalPollution() {
        const result = { issues: [], warnings: [] };
        
        try {
            const globalScope = typeof window !== 'undefined' ? window : global;
            const expectedGlobals = new Set([
                'CONSTANTS', 'Utils', 'LineDetector', 'ProbabilityCalculator',
                'GameBoard', 'GameEngine', 'dependencyValidator', 'logger'
            ]);

            const gameRelatedGlobals = Object.keys(globalScope).filter(key => 
                key.toLowerCase().includes('game') || 
                key.toLowerCase().includes('bingo') ||
                key.toLowerCase().includes('probability') ||
                key.toLowerCase().includes('line')
            );

            const unexpectedGlobals = gameRelatedGlobals.filter(key => !expectedGlobals.has(key));

            if (unexpectedGlobals.length > 5) {
                result.warnings.push({
                    count: unexpectedGlobals.length,
                    message: `檢測到 ${unexpectedGlobals.length} 個可能的全局變量污染`,
                    severity: 'medium',
                    recommendation: '檢查是否有不必要的全局變量',
                    details: unexpectedGlobals.slice(0, 10) // 只顯示前10個
                });
            }

        } catch (error) {
            result.warnings.push({
                message: `全局污染檢查失敗: ${error.message}`,
                severity: 'low'
            });
        }

        return result;
    }

    /**
     * 檢查不安全操作
     */
    async checkUnsafeOperations() {
        const result = { issues: [], warnings: [] };
        
        try {
            // 檢查 eval 的使用
            const globalScope = typeof window !== 'undefined' ? window : global;
            
            if (globalScope.eval && typeof globalScope.eval === 'function') {
                result.warnings.push({
                    operation: 'eval',
                    message: 'eval 函數可用，存在潛在安全風險',
                    severity: 'medium',
                    recommendation: '避免使用 eval 或確保輸入已正確驗證'
                });
            }

        } catch (error) {
            result.warnings.push({
                message: `不安全操作檢查失敗: ${error.message}`,
                severity: 'low'
            });
        }

        return result;
    }

    /**
     * 檢查數據驗證
     */
    async checkDataValidation() {
        const result = { issues: [], warnings: [] };
        
        try {
            const globalScope = typeof window !== 'undefined' ? window : global;
            
            // 檢查 Utils 是否有適當的驗證函數
            if (globalScope.Utils) {
                const validationFunctions = ['isValidPosition', 'isCellEmpty'];
                const missingValidations = validationFunctions.filter(fn => 
                    typeof globalScope.Utils[fn] !== 'function'
                );

                if (missingValidations.length > 0) {
                    result.warnings.push({
                        functions: missingValidations,
                        message: `缺少數據驗證函數: ${missingValidations.join(', ')}`,
                        severity: 'medium',
                        recommendation: '添加適當的數據驗證函數'
                    });
                }
            }

        } catch (error) {
            result.warnings.push({
                message: `數據驗證檢查失敗: ${error.message}`,
                severity: 'low'
            });
        }

        return result;
    }

    /**
     * 輔助方法：檢查依賴可用性
     * @private
     */
    _checkDependencyAvailability(dependencyName) {
        const globalScope = typeof window !== 'undefined' ? window : global;
        return dependencyName in globalScope && globalScope[dependencyName] != null;
    }

    /**
     * 計算類別分數
     * @private
     */
    _calculateCategoryScore(categoryResult) {
        const totalTests = categoryResult.testsExecuted;
        const issues = categoryResult.issues.length;
        const warnings = categoryResult.warnings.length;
        
        if (totalTests === 0) return 0;
        
        const issueWeight = 10;
        const warningWeight = 3;
        const maxScore = 100;
        
        const deduction = (issues * issueWeight) + (warnings * warningWeight);
        return Math.max(0, maxScore - deduction);
    }

    /**
     * 計算整體分數
     * @private
     */
    _calculateOverallScore(categories) {
        const scores = Object.values(categories).map(cat => cat.score);
        if (scores.length === 0) return 0;
        
        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    /**
     * 確定整體狀態
     * @private
     */
    _determineOverallStatus(score, issues) {
        if (issues > 0 && score < 50) return 'critical';
        if (issues > 0 && score < 70) return 'warning';
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        return 'fair';
    }

    /**
     * 生成診斷建議
     * @private
     */
    _generateDiagnosticRecommendations(results) {
        const recommendations = [];
        
        // 基於整體分數的建議
        if (results.overall.score < 70) {
            recommendations.push({
                type: 'improvement',
                priority: 'high',
                message: `整體健康分數較低 (${results.overall.score})`,
                action: '優先修復關鍵問題以提高系統穩定性'
            });
        }

        // 基於問題數量的建議
        if (results.overall.issues > 5) {
            recommendations.push({
                type: 'maintenance',
                priority: 'medium',
                message: `發現 ${results.overall.issues} 個問題`,
                action: '建議定期執行依賴檢查和維護'
            });
        }

        // 基於性能的建議
        if (results.performance.totalTime > 2000) {
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: `診斷執行時間較長 (${results.performance.totalTime}ms)`,
                action: '考慮優化診斷流程或減少檢查項目'
            });
        }

        return recommendations;
    }

    /**
     * 獲取環境信息
     * @private
     */
    _getEnvironmentInfo() {
        const info = {
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
            platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
            language: typeof navigator !== 'undefined' ? navigator.language : 'Unknown'
        };

        if (typeof window !== 'undefined') {
            info.windowSize = {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }

        if (typeof performance !== 'undefined' && performance.memory) {
            info.memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }

        return info;
    }

    /**
     * 觸發診斷回調
     * @private
     */
    _triggerDiagnosticCallbacks(event, data) {
        const callbacks = this.diagnosticCallbacks.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                logger.warn(`診斷回調執行失敗:`, error);
            }
        });
    }

    /**
     * 註冊診斷事件回調
     * @param {string} event - 事件名稱
     * @param {Function} callback - 回調函數
     */
    onDiagnosticEvent(event, callback) {
        if (!this.diagnosticCallbacks.has(event)) {
            this.diagnosticCallbacks.set(event, []);
        }
        this.diagnosticCallbacks.get(event).push(callback);
    }

    /**
     * 開始監控模式
     * @param {number} interval - 監控間隔（毫秒）
     */
    startMonitoring(interval = 60000) { // 默認1分鐘
        if (this.isMonitoring) {
            logger.warn('依賴監控已在運行中');
            return;
        }

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(async () => {
            try {
                const results = await this.runCompleteDiagnostics();
                this._triggerDiagnosticCallbacks('monitoring', results);
                
                // 檢查是否需要警報
                if (results.overall.score < this.alertThresholds.healthScore) {
                    this._triggerDiagnosticCallbacks('alert', {
                        type: 'healthScore',
                        value: results.overall.score,
                        threshold: this.alertThresholds.healthScore,
                        results
                    });
                }
            } catch (error) {
                logger.error('監控診斷執行失敗:', error);
            }
        }, interval);

        logger.info(`依賴監控已啟動，間隔: ${interval}ms`);
    }

    /**
     * 停止監控模式
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
        logger.info('依賴監控已停止');
    }

    /**
     * 獲取診斷歷史
     * @param {number} limit - 返回記錄數量限制
     * @returns {Array} 診斷歷史記錄
     */
    getDiagnosticHistory(limit = 10) {
        return this.diagnosticHistory.slice(-limit);
    }

    /**
     * 清除診斷歷史
     */
    clearDiagnosticHistory() {
        this.diagnosticHistory = [];
        logger.info('診斷歷史已清除');
    }

    /**
     * 設置警報閾值
     * @param {Object} thresholds - 閾值配置
     */
    setAlertThresholds(thresholds) {
        this.alertThresholds = { ...this.alertThresholds, ...thresholds };
        logger.info('警報閾值已更新:', this.alertThresholds);
    }

    /**
     * 生成診斷報告
     * @param {Object} results - 診斷結果
     * @returns {string} 格式化的報告
     */
    generateDiagnosticReport(results) {
        if (!results) {
            return '無診斷結果可用';
        }

        let report = `
=== 依賴診斷報告 ===
時間: ${results.timestamp}
整體狀態: ${results.overall.status}
健康分數: ${results.overall.score}/100
問題數量: ${results.overall.issues}
警告數量: ${results.overall.warnings}

=== 類別詳情 ===
`;

        for (const [categoryName, category] of Object.entries(results.categories)) {
            report += `
${category.name} (${category.severity}):
  狀態: ${category.status}
  分數: ${category.score}/100
  問題: ${category.issues.length}
  警告: ${category.warnings.length}
  執行時間: ${category.performance.executionTime}ms
`;

            if (category.issues.length > 0) {
                report += '  問題詳情:\n';
                category.issues.forEach(issue => {
                    report += `    - ${issue.message}\n`;
                });
            }
        }

        if (results.recommendations.length > 0) {
            report += '\n=== 建議 ===\n';
            results.recommendations.forEach(rec => {
                report += `- [${rec.priority}] ${rec.message}: ${rec.action}\n`;
            });
        }

        report += `
=== 性能統計 ===
總執行時間: ${results.performance.totalTime}ms
檢查類別: ${results.performance.categoriesChecked}
執行測試: ${results.performance.testsExecuted}
`;

        return report;
    }
}

// 創建全局實例
const dependencyDiagnostics = new DependencyDiagnostics();

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DependencyDiagnostics, dependencyDiagnostics };
} else if (typeof window !== 'undefined') {
    window.DependencyDiagnostics = DependencyDiagnostics;
    window.dependencyDiagnostics = dependencyDiagnostics;
}