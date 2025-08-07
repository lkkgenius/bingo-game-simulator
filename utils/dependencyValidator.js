/**
 * Dependency Validator - 依賴檢查和驗證系統
 * 
 * 這個模組負責：
 * - 檢查所有必需的全局變量和類別是否正確載入
 * - 實作運行時依賴檢查，在遊戲初始化前驗證所有組件
 * - 添加缺失依賴的自動修復功能
 * - 創建依賴健康檢查報告，幫助開發者診斷問題
 * 
 * @class DependencyValidator
 * @version 1.0.0
 */

// Logger 初始化
let logger;
if (typeof window !== 'undefined' && window.logger) {
    logger = window.logger;
} else if (typeof require !== 'undefined') {
    try {
        const { logger: prodLogger } = require('../production-logger.js');
        logger = prodLogger;
    } catch (e) {
        // Fallback logger
        logger = {
            info: console.log,
            warn: console.warn,
            error: console.error,
            debug: console.log
        };
    }
} else {
    // Fallback logger
    logger = {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.log
    };
}

class DependencyValidator {
    constructor() {
        this.validationResults = new Map();
        this.fallbackImplementations = new Map();
        this.dependencyGraph = new Map();
        this.validationHistory = [];
        this.autoRepairEnabled = true;
        this.criticalDependencies = new Set();
        
        this.setupDependencyDefinitions();
        this.setupFallbackImplementations();
    }

    /**
     * 設置依賴定義和需求
     */
    setupDependencyDefinitions() {
        // 定義核心依賴項目
        this.dependencyGraph.set('CONSTANTS', {
            type: 'global',
            required: true,
            critical: true,
            location: 'window.CONSTANTS',
            expectedProperties: [
                'BOARD_SIZE', 'MAX_ROUNDS', 'CELL_STATES', 'GAME_PHASES', 
                'LINE_TYPES', 'ERROR_TYPES', 'ALGORITHM_WEIGHTS'
            ],
            fallbackAvailable: true,
            description: '遊戲常數和配置'
        });

        this.dependencyGraph.set('Utils', {
            type: 'global',
            required: true,
            critical: true,
            location: 'window.Utils',
            expectedProperties: [
                'isValidPosition', 'isCellEmpty', 'copyBoard', 'formatError',
                'debounce', 'throttle', 'deepClone'
            ],
            fallbackAvailable: true,
            description: '通用工具函數'
        });

        this.dependencyGraph.set('LineDetector', {
            type: 'class',
            required: true,
            critical: true,
            location: 'window.LineDetector',
            expectedMethods: [
                'checkHorizontalLines', 'checkVerticalLines', 'checkDiagonalLines',
                'getAllLines', 'countCompletedLines'
            ],
            dependencies: ['CONSTANTS'],
            fallbackAvailable: true,
            description: '連線檢測器'
        });

        this.dependencyGraph.set('ProbabilityCalculator', {
            type: 'class',
            required: true,
            critical: true,
            location: 'window.ProbabilityCalculator',
            expectedMethods: [
                'calculateMoveValue', 'getBestSuggestion', 'simulateAllPossibleMoves'
            ],
            dependencies: ['CONSTANTS', 'Utils', 'LineDetector'],
            fallbackAvailable: true,
            description: '標準機率計算器'
        });

        this.dependencyGraph.set('BaseProbabilityCalculator', {
            type: 'class',
            required: true,
            critical: false,
            location: 'window.BaseProbabilityCalculator',
            expectedMethods: [
                'calculateMoveValue', 'isValidMove', 'isCenterPosition'
            ],
            dependencies: ['CONSTANTS', 'Utils'],
            fallbackAvailable: true,
            description: '基礎機率計算器'
        });

        this.dependencyGraph.set('GameBoard', {
            type: 'class',
            required: true,
            critical: true,
            location: 'window.GameBoard',
            expectedMethods: [
                'render', 'updateCell', 'highlightSuggestion', 'highlightLines'
            ],
            dependencies: ['CONSTANTS', 'Utils'],
            fallbackAvailable: false,
            description: '遊戲板 UI 組件'
        });

        this.dependencyGraph.set('GameEngine', {
            type: 'class',
            required: true,
            critical: true,
            location: 'window.GameEngine',
            expectedMethods: [
                'startGame', 'processPlayerTurn', 'processComputerTurn',
                'calculateBestMove', 'isGameComplete'
            ],
            dependencies: ['CONSTANTS', 'Utils', 'LineDetector', 'ProbabilityCalculator'],
            fallbackAvailable: false,
            description: '遊戲引擎'
        });

        // 可選依賴項目
        this.dependencyGraph.set('EnhancedProbabilityCalculator', {
            type: 'class',
            required: false,
            critical: false,
            location: 'window.EnhancedProbabilityCalculator',
            expectedMethods: [
                'calculateMoveValue', 'getBestSuggestion', 'getAlternativeSuggestions'
            ],
            dependencies: ['CONSTANTS', 'Utils', 'LineDetector', 'BaseProbabilityCalculator'],
            fallbackAvailable: false,
            description: '增強版機率計算器'
        });

        this.dependencyGraph.set('AILearningSystem', {
            type: 'class',
            required: false,
            critical: false,
            location: 'window.AILearningSystem',
            expectedMethods: ['learn', 'predict', 'adaptDifficulty'],
            dependencies: ['CONSTANTS', 'Utils', 'GameEngine'],
            fallbackAvailable: false,
            description: 'AI 學習系統'
        });

        this.dependencyGraph.set('PerformanceMonitor', {
            type: 'class',
            required: false,
            critical: false,
            location: 'window.PerformanceMonitor',
            expectedMethods: ['startMonitoring', 'getMetrics', 'generateReport'],
            dependencies: ['CONSTANTS'],
            fallbackAvailable: false,
            description: '性能監控器'
        });

        // 標記關鍵依賴
        this.criticalDependencies.add('CONSTANTS');
        this.criticalDependencies.add('Utils');
        this.criticalDependencies.add('LineDetector');
        this.criticalDependencies.add('ProbabilityCalculator');
        this.criticalDependencies.add('GameBoard');
        this.criticalDependencies.add('GameEngine');
    }

    /**
     * 設置回退實現
     */
    setupFallbackImplementations() {
        // CONSTANTS 回退實現
        this.fallbackImplementations.set('CONSTANTS', () => {
            return {
                BOARD_SIZE: 5,
                MAX_ROUNDS: 8,
                CELL_STATES: { EMPTY: 0, PLAYER: 1, COMPUTER: 2 },
                GAME_PHASES: {
                    WAITING: 'waiting',
                    PLAYER_TURN: 'player-turn',
                    COMPUTER_TURN: 'computer-turn',
                    GAME_OVER: 'game-over'
                },
                LINE_TYPES: {
                    HORIZONTAL: 'horizontal',
                    VERTICAL: 'vertical',
                    DIAGONAL_MAIN: 'diagonal-main',
                    DIAGONAL_ANTI: 'diagonal-anti'
                },
                ERROR_TYPES: {
                    INVALID_MOVE: 'invalid-move',
                    CELL_OCCUPIED: 'cell-occupied',
                    GAME_OVER: 'game-over',
                    INVALID_PHASE: 'invalid-phase'
                },
                ALGORITHM_WEIGHTS: {
                    STANDARD: {
                        COMPLETE_LINE: 100,
                        COOPERATIVE_LINE: 50,
                        POTENTIAL_LINE: 10,
                        CENTER_BONUS: 5
                    },
                    ENHANCED: {
                        COMPLETE_LINE: 120,
                        COOPERATIVE_LINE: 70,
                        POTENTIAL_LINE: 15,
                        CENTER_BONUS: 8,
                        INTERSECTION_BONUS: 20,
                        STRATEGIC_POSITION: 12
                    }
                },
                PERFORMANCE: {
                    CACHE_SIZE: {
                        VALUE_CACHE: 1000,
                        LINE_CACHE: 500
                    },
                    DEBOUNCE_DELAY: 100,
                    THROTTLE_DELAY: 50
                }
            };
        });

        // Utils 回退實現
        this.fallbackImplementations.set('Utils', () => {
            return {
                isValidPosition: (row, col, boardSize = 5) => {
                    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
                },
                
                isCellEmpty: (board, row, col) => {
                    return board && board[row] && board[row][col] === 0;
                },
                
                copyBoard: (board) => {
                    return board.map(row => [...row]);
                },
                
                formatError: (error, context = '') => {
                    return `${context ? context + ': ' : ''}${error.message || error}`;
                },
                
                debounce: (func, delay) => {
                    let timeoutId;
                    return function(...args) {
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => func.apply(this, args), delay);
                    };
                },
                
                throttle: (func, delay) => {
                    let lastCall = 0;
                    return function(...args) {
                        const now = Date.now();
                        if (now - lastCall >= delay) {
                            lastCall = now;
                            return func.apply(this, args);
                        }
                    };
                },
                
                deepClone: (obj) => {
                    if (obj === null || typeof obj !== 'object') return obj;
                    if (obj instanceof Date) return new Date(obj);
                    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
                    if (typeof obj === 'object') {
                        const cloned = {};
                        Object.keys(obj).forEach(key => {
                            cloned[key] = this.deepClone(obj[key]);
                        });
                        return cloned;
                    }
                },
                
                isCenterPosition: (row, col, boardSize = 5) => {
                    const center = Math.floor(boardSize / 2);
                    return row === center && col === center;
                }
            };
        });

        // LineDetector 回退實現
        this.fallbackImplementations.set('LineDetector', () => {
            return class FallbackLineDetector {
                constructor() {
                    this.BOARD_SIZE = 5;
                    this.LINE_TYPES = {
                        HORIZONTAL: 'horizontal',
                        VERTICAL: 'vertical',
                        DIAGONAL_MAIN: 'diagonal-main',
                        DIAGONAL_ANTI: 'diagonal-anti'
                    };
                    this.CELL_STATES = { EMPTY: 0, PLAYER: 1, COMPUTER: 2 };
                }

                checkHorizontalLines(board) {
                    const lines = [];
                    for (let row = 0; row < this.BOARD_SIZE; row++) {
                        if (board[row].every(cell => cell !== this.CELL_STATES.EMPTY)) {
                            lines.push({
                                type: this.LINE_TYPES.HORIZONTAL,
                                row: row,
                                cells: board[row].map((_, col) => [row, col])
                            });
                        }
                    }
                    return lines;
                }

                checkVerticalLines(board) {
                    const lines = [];
                    for (let col = 0; col < this.BOARD_SIZE; col++) {
                        const column = board.map(row => row[col]);
                        if (column.every(cell => cell !== this.CELL_STATES.EMPTY)) {
                            lines.push({
                                type: this.LINE_TYPES.VERTICAL,
                                col: col,
                                cells: column.map((_, row) => [row, col])
                            });
                        }
                    }
                    return lines;
                }

                checkDiagonalLines(board) {
                    const lines = [];
                    
                    // 主對角線
                    const mainDiagonal = board.map((row, i) => row[i]);
                    if (mainDiagonal.every(cell => cell !== this.CELL_STATES.EMPTY)) {
                        lines.push({
                            type: this.LINE_TYPES.DIAGONAL_MAIN,
                            cells: mainDiagonal.map((_, i) => [i, i])
                        });
                    }
                    
                    // 反對角線
                    const antiDiagonal = board.map((row, i) => row[this.BOARD_SIZE - 1 - i]);
                    if (antiDiagonal.every(cell => cell !== this.CELL_STATES.EMPTY)) {
                        lines.push({
                            type: this.LINE_TYPES.DIAGONAL_ANTI,
                            cells: antiDiagonal.map((_, i) => [i, this.BOARD_SIZE - 1 - i])
                        });
                    }
                    
                    return lines;
                }

                getAllLines(board) {
                    return [
                        ...this.checkHorizontalLines(board),
                        ...this.checkVerticalLines(board),
                        ...this.checkDiagonalLines(board)
                    ];
                }

                countCompletedLines(board) {
                    return this.getAllLines(board).length;
                }
            };
        });

        // BaseProbabilityCalculator 回退實現
        this.fallbackImplementations.set('BaseProbabilityCalculator', () => {
            return class FallbackBaseProbabilityCalculator {
                constructor(weights = {}) {
                    this.BOARD_SIZE = 5;
                    this.CELL_STATES = { EMPTY: 0, PLAYER: 1, COMPUTER: 2 };
                    this.WEIGHTS = {
                        COMPLETE_LINE: 100,
                        COOPERATIVE_LINE: 50,
                        POTENTIAL_LINE: 10,
                        CENTER_BONUS: 5,
                        ...weights
                    };
                    this._valueCache = new Map();
                    this._performanceMetrics = {
                        cacheHits: 0,
                        cacheMisses: 0,
                        calculationTime: []
                    };
                }

                calculateMoveValue(board, row, col) {
                    if (!this.isValidMove(board, row, col)) {
                        return -1;
                    }

                    let value = 0;
                    
                    // 中心位置獎勵
                    if (this.isCenterPosition(row, col)) {
                        value += this.WEIGHTS.CENTER_BONUS;
                    }
                    
                    // 基本位置價值
                    value += this._calculatePositionValue(row, col);
                    
                    return value;
                }

                isValidMove(board, row, col) {
                    return row >= 0 && row < this.BOARD_SIZE && 
                           col >= 0 && col < this.BOARD_SIZE && 
                           board[row][col] === this.CELL_STATES.EMPTY;
                }

                isCenterPosition(row, col) {
                    const center = Math.floor(this.BOARD_SIZE / 2);
                    return row === center && col === center;
                }

                _calculatePositionValue(row, col) {
                    // 簡單的位置價值計算
                    const center = Math.floor(this.BOARD_SIZE / 2);
                    const distanceFromCenter = Math.abs(row - center) + Math.abs(col - center);
                    return Math.max(0, 10 - distanceFromCenter * 2);
                }

                copyBoard(board) {
                    return board.map(row => [...row]);
                }

                getCacheHits() {
                    return this._performanceMetrics.cacheHits;
                }

                getCacheMisses() {
                    return this._performanceMetrics.cacheMisses;
                }
            };
        });

        // ProbabilityCalculator 回退實現
        this.fallbackImplementations.set('ProbabilityCalculator', () => {
            const BaseProbabilityCalculator = this.fallbackImplementations.get('BaseProbabilityCalculator')();
            
            return class FallbackProbabilityCalculator extends BaseProbabilityCalculator {
                constructor() {
                    super();
                }

                calculateMoveValue(board, row, col) {
                    if (!this.isValidMove(board, row, col)) {
                        return -1;
                    }

                    const cacheKey = `${JSON.stringify(board)}-${row}-${col}`;
                    if (this._valueCache.has(cacheKey)) {
                        this._performanceMetrics.cacheHits++;
                        return this._valueCache.get(cacheKey);
                    }

                    this._performanceMetrics.cacheMisses++;
                    const startTime = performance.now();

                    let value = super.calculateMoveValue(board, row, col);
                    
                    // 添加合作線檢查
                    value += this._checkCooperativeLines(board, row, col);

                    const endTime = performance.now();
                    this._performanceMetrics.calculationTime.push(endTime - startTime);

                    // 限制緩存大小
                    if (this._valueCache.size > 1000) {
                        const firstKey = this._valueCache.keys().next().value;
                        this._valueCache.delete(firstKey);
                    }

                    this._valueCache.set(cacheKey, value);
                    return value;
                }

                _checkCooperativeLines(board, row, col) {
                    let cooperativeValue = 0;
                    
                    // 檢查水平線
                    const horizontalLine = board[row];
                    const horizontalFilled = horizontalLine.filter(cell => cell !== 0).length;
                    if (horizontalFilled > 0) {
                        cooperativeValue += horizontalFilled * this.WEIGHTS.COOPERATIVE_LINE / 10;
                    }
                    
                    // 檢查垂直線
                    const verticalLine = board.map(r => r[col]);
                    const verticalFilled = verticalLine.filter(cell => cell !== 0).length;
                    if (verticalFilled > 0) {
                        cooperativeValue += verticalFilled * this.WEIGHTS.COOPERATIVE_LINE / 10;
                    }
                    
                    return cooperativeValue;
                }

                getBestSuggestion(board) {
                    let bestMove = null;
                    let maxValue = -1;

                    for (let row = 0; row < this.BOARD_SIZE; row++) {
                        for (let col = 0; col < this.BOARD_SIZE; col++) {
                            if (this.isValidMove(board, row, col)) {
                                const value = this.calculateMoveValue(board, row, col);
                                if (value > maxValue) {
                                    maxValue = value;
                                    bestMove = { row, col, value };
                                }
                            }
                        }
                    }

                    return bestMove;
                }

                simulateAllPossibleMoves(board) {
                    const moves = [];
                    
                    for (let row = 0; row < this.BOARD_SIZE; row++) {
                        for (let col = 0; col < this.BOARD_SIZE; col++) {
                            if (this.isValidMove(board, row, col)) {
                                const value = this.calculateMoveValue(board, row, col);
                                moves.push({ row, col, value });
                            }
                        }
                    }

                    return moves.sort((a, b) => b.value - a.value);
                }
            };
        });
    }

    /**
     * 執行完整的依賴驗證
     * @returns {Object} 驗證結果
     */
    async validateAllDependencies() {
        logger.info('開始執行依賴驗證...');
        
        const validationStart = Date.now();
        const results = {
            timestamp: new Date().toISOString(),
            overall: { passed: true, critical: true },
            dependencies: new Map(),
            issues: [],
            repairs: [],
            performance: {},
            recommendations: []
        };

        // 按依賴順序驗證
        const validationOrder = this._calculateValidationOrder();
        
        for (const dependencyName of validationOrder) {
            const dependencyInfo = this.dependencyGraph.get(dependencyName);
            const validationResult = await this._validateSingleDependency(dependencyName, dependencyInfo);
            
            results.dependencies.set(dependencyName, validationResult);
            
            if (!validationResult.available) {
                results.issues.push({
                    dependency: dependencyName,
                    severity: dependencyInfo.critical ? 'critical' : 'warning',
                    message: validationResult.error,
                    autoRepairAvailable: dependencyInfo.fallbackAvailable && this.autoRepairEnabled
                });

                if (dependencyInfo.critical) {
                    results.overall.critical = false;
                }
                results.overall.passed = false;

                // 嘗試自動修復
                if (dependencyInfo.fallbackAvailable && this.autoRepairEnabled) {
                    const repairResult = await this._attemptAutoRepair(dependencyName, dependencyInfo);
                    if (repairResult.success) {
                        results.repairs.push(repairResult);
                        validationResult.repaired = true;
                        validationResult.available = true;
                        
                        // 重新驗證修復後的依賴
                        const revalidationResult = await this._validateSingleDependency(dependencyName, dependencyInfo);
                        results.dependencies.set(dependencyName, { ...validationResult, ...revalidationResult });
                    }
                }
            }
        }

        const validationEnd = Date.now();
        results.performance = {
            totalTime: validationEnd - validationStart,
            dependenciesChecked: results.dependencies.size,
            issuesFound: results.issues.length,
            repairsAttempted: results.repairs.length
        };

        // 生成建議
        results.recommendations = this._generateRecommendations(results);

        // 記錄驗證歷史
        this.validationHistory.push(results);
        this.validationResults = results.dependencies;

        logger.info(`依賴驗證完成: ${results.overall.passed ? '通過' : '失敗'} (${results.performance.totalTime}ms)`);
        
        return results;
    }

    /**
     * 驗證單個依賴項目
     * @private
     */
    async _validateSingleDependency(name, info) {
        const result = {
            name,
            type: info.type,
            required: info.required,
            critical: info.critical,
            available: false,
            properties: {},
            methods: {},
            dependencies: [],
            error: null,
            warnings: [],
            performance: {}
        };

        const startTime = Date.now();

        try {
            // 檢查依賴項目是否存在
            const dependency = this._resolveDependency(info.location);
            
            if (!dependency) {
                result.error = `依賴項目 ${name} 在 ${info.location} 未找到`;
                return result;
            }

            result.available = true;

            // 驗證預期屬性
            if (info.expectedProperties) {
                for (const prop of info.expectedProperties) {
                    const hasProperty = dependency.hasOwnProperty(prop) || (prop in dependency);
                    result.properties[prop] = {
                        available: hasProperty,
                        type: hasProperty ? typeof dependency[prop] : 'undefined'
                    };
                    
                    if (!hasProperty) {
                        result.warnings.push(`缺少預期屬性: ${prop}`);
                    }
                }
            }

            // 驗證預期方法
            if (info.expectedMethods) {
                for (const method of info.expectedMethods) {
                    let hasMethod = false;
                    let methodType = 'undefined';
                    
                    if (info.type === 'class') {
                        // 對於類，檢查原型方法
                        hasMethod = typeof dependency.prototype[method] === 'function';
                        methodType = hasMethod ? 'function' : 'undefined';
                    } else {
                        // 對於對象，直接檢查方法
                        hasMethod = typeof dependency[method] === 'function';
                        methodType = hasMethod ? 'function' : 'undefined';
                    }
                    
                    result.methods[method] = {
                        available: hasMethod,
                        type: methodType
                    };
                    
                    if (!hasMethod) {
                        result.warnings.push(`缺少預期方法: ${method}`);
                    }
                }
            }

            // 驗證依賴關係
            if (info.dependencies) {
                for (const dep of info.dependencies) {
                    const depResult = this.validationResults.get(dep);
                    result.dependencies.push({
                        name: dep,
                        available: depResult ? depResult.available : false,
                        required: this.dependencyGraph.get(dep)?.required || false
                    });
                }
            }

            // 性能測試（如果是類）
            if (info.type === 'class' && result.available) {
                try {
                    const instance = new dependency();
                    result.performance.instantiation = Date.now() - startTime;
                } catch (error) {
                    result.warnings.push(`類實例化失敗: ${error.message}`);
                }
            }

        } catch (error) {
            result.error = `驗證過程中發生錯誤: ${error.message}`;
        }

        result.performance.validationTime = Date.now() - startTime;
        return result;
    }

    /**
     * 解析依賴項目位置
     * @private
     */
    _resolveDependency(location) {
        try {
            // 支持多種位置格式
            if (location.startsWith('window.')) {
                const path = location.substring(7).split('.');
                let obj = window;
                for (const part of path) {
                    if (obj && typeof obj === 'object' && part in obj) {
                        obj = obj[part];
                    } else {
                        return null;
                    }
                }
                return obj;
            }
            
            // 直接全局變量
            if (typeof window !== 'undefined' && location in window) {
                return window[location];
            }
            
            return null;
        } catch (error) {
            logger.warn(`解析依賴項目 ${location} 時發生錯誤:`, error);
            return null;
        }
    }

    /**
     * 嘗試自動修復依賴項目
     * @private
     */
    async _attemptAutoRepair(name, info) {
        const repairResult = {
            dependency: name,
            success: false,
            method: 'none',
            error: null,
            timestamp: Date.now()
        };

        try {
            logger.info(`嘗試自動修復依賴項目: ${name}`);

            const fallbackFactory = this.fallbackImplementations.get(name);
            if (!fallbackFactory) {
                repairResult.error = '沒有可用的回退實現';
                return repairResult;
            }

            const fallbackImplementation = fallbackFactory();
            
            // 將回退實現注入到全局範圍
            if (info.location.startsWith('window.')) {
                const path = info.location.substring(7).split('.');
                let obj = window;
                
                for (let i = 0; i < path.length - 1; i++) {
                    if (!(path[i] in obj)) {
                        obj[path[i]] = {};
                    }
                    obj = obj[path[i]];
                }
                
                obj[path[path.length - 1]] = fallbackImplementation;
                repairResult.success = true;
                repairResult.method = 'fallback_injection';
                
                logger.info(`成功注入回退實現: ${name}`);
            }

        } catch (error) {
            repairResult.error = error.message;
            logger.error(`自動修復 ${name} 失敗:`, error);
        }

        return repairResult;
    }

    /**
     * 計算驗證順序（基於依賴關係）
     * @private
     */
    _calculateValidationOrder() {
        const visited = new Set();
        const visiting = new Set();
        const order = [];

        const visit = (name) => {
            if (visiting.has(name)) {
                logger.warn(`檢測到循環依賴: ${name}`);
                return;
            }
            
            if (visited.has(name)) {
                return;
            }

            visiting.add(name);
            
            const info = this.dependencyGraph.get(name);
            if (info && info.dependencies) {
                for (const dep of info.dependencies) {
                    if (this.dependencyGraph.has(dep)) {
                        visit(dep);
                    }
                }
            }

            visiting.delete(name);
            visited.add(name);
            order.push(name);
        };

        // 先處理關鍵依賴
        for (const name of this.criticalDependencies) {
            if (this.dependencyGraph.has(name)) {
                visit(name);
            }
        }

        // 然後處理其他依賴
        for (const name of this.dependencyGraph.keys()) {
            if (!visited.has(name)) {
                visit(name);
            }
        }

        return order;
    }

    /**
     * 生成建議
     * @private
     */
    _generateRecommendations(results) {
        const recommendations = [];

        // 檢查關鍵依賴
        for (const [name, result] of results.dependencies) {
            const info = this.dependencyGraph.get(name);
            
            if (info.critical && !result.available) {
                recommendations.push({
                    type: 'critical',
                    message: `關鍵依賴項目 ${name} 不可用，遊戲可能無法正常運行`,
                    action: `請確保 ${name} 正確載入或啟用自動修復功能`
                });
            }
            
            if (result.warnings && result.warnings.length > 0) {
                recommendations.push({
                    type: 'warning',
                    message: `依賴項目 ${name} 有 ${result.warnings.length} 個警告`,
                    action: `檢查並修復: ${result.warnings.join(', ')}`
                });
            }
        }

        // 性能建議
        const slowDependencies = Array.from(results.dependencies.entries())
            .filter(([_, result]) => result.performance?.validationTime > 100)
            .map(([name, _]) => name);

        if (slowDependencies.length > 0) {
            recommendations.push({
                type: 'performance',
                message: `以下依賴項目驗證較慢: ${slowDependencies.join(', ')}`,
                action: '考慮優化這些依賴項目的載入或初始化過程'
            });
        }

        // 修復建議
        if (results.issues.length > 0 && !this.autoRepairEnabled) {
            recommendations.push({
                type: 'repair',
                message: `發現 ${results.issues.length} 個問題，但自動修復已禁用`,
                action: '啟用自動修復功能或手動修復這些問題'
            });
        }

        return recommendations;
    }

    /**
     * 生成依賴健康檢查報告
     * @returns {Object} 健康檢查報告
     */
    generateHealthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalDependencies: this.dependencyGraph.size,
                criticalDependencies: this.criticalDependencies.size,
                availableDependencies: 0,
                healthScore: 0
            },
            details: {},
            history: this.validationHistory.slice(-5), // 最近5次驗證
            trends: {},
            actionItems: []
        };

        // 計算健康狀況
        let availableCount = 0;
        let criticalAvailableCount = 0;

        for (const [name, result] of this.validationResults) {
            const info = this.dependencyGraph.get(name);
            
            if (result.available) {
                availableCount++;
                if (info.critical) {
                    criticalAvailableCount++;
                }
            }

            report.details[name] = {
                status: result.available ? 'healthy' : 'unhealthy',
                critical: info.critical,
                issues: result.warnings?.length || 0,
                lastValidated: result.performance?.validationTime ? 
                    new Date(Date.now() - result.performance.validationTime).toISOString() : 'never'
            };
        }

        report.summary.availableDependencies = availableCount;
        report.summary.healthScore = Math.round((availableCount / this.dependencyGraph.size) * 100);

        // 趨勢分析
        if (this.validationHistory.length > 1) {
            const previousValidation = this.validationHistory[this.validationHistory.length - 2];
            const currentValidation = this.validationHistory[this.validationHistory.length - 1];
            
            report.trends = {
                healthScoreChange: report.summary.healthScore - 
                    Math.round((previousValidation.dependencies.size / this.dependencyGraph.size) * 100),
                issuesChange: currentValidation.issues.length - previousValidation.issues.length,
                performanceChange: currentValidation.performance.totalTime - previousValidation.performance.totalTime
            };
        }

        // 行動項目
        if (criticalAvailableCount < this.criticalDependencies.size) {
            report.actionItems.push({
                priority: 'high',
                action: '修復關鍵依賴項目',
                description: `${this.criticalDependencies.size - criticalAvailableCount} 個關鍵依賴項目不可用`
            });
        }

        if (report.summary.healthScore < 80) {
            report.actionItems.push({
                priority: 'medium',
                action: '改善整體依賴健康狀況',
                description: `當前健康分數: ${report.summary.healthScore}%`
            });
        }

        return report;
    }

    /**
     * 執行運行時依賴檢查
     * @returns {Promise<boolean>} 是否所有關鍵依賴都可用
     */
    async performRuntimeCheck() {
        logger.info('執行運行時依賴檢查...');
        
        const results = await this.validateAllDependencies();
        
        // 檢查關鍵依賴
        const criticalIssues = results.issues.filter(issue => issue.severity === 'critical');
        
        if (criticalIssues.length > 0) {
            logger.error('發現關鍵依賴問題:', criticalIssues);
            
            // 嘗試顯示用戶友好的錯誤信息
            if (typeof window !== 'undefined' && window.document) {
                this._displayRuntimeError(criticalIssues);
            }
            
            return false;
        }

        logger.info('運行時依賴檢查通過');
        return true;
    }

    /**
     * 顯示運行時錯誤
     * @private
     */
    _displayRuntimeError(issues) {
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: monospace;
        `;
        
        errorContainer.innerHTML = `
            <h3>依賴載入錯誤</h3>
            <p>遊戲無法啟動，因為以下關鍵組件未正確載入：</p>
            <ul>
                ${issues.map(issue => `<li>${issue.dependency}: ${issue.message}</li>`).join('')}
            </ul>
            <p>請重新載入頁面或聯繫開發者。</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px;">關閉</button>
        `;
        
        document.body.appendChild(errorContainer);
    }

    /**
     * 設置自動修復功能
     * @param {boolean} enabled - 是否啟用自動修復
     */
    setAutoRepair(enabled) {
        this.autoRepairEnabled = enabled;
        logger.info(`自動修復功能 ${enabled ? '已啟用' : '已禁用'}`);
    }

    /**
     * 獲取依賴項目信息
     * @param {string} name - 依賴項目名稱
     * @returns {Object} 依賴項目詳細信息
     */
    getDependencyInfo(name) {
        const definition = this.dependencyGraph.get(name);
        const validation = this.validationResults.get(name);
        
        return {
            definition,
            validation,
            available: validation?.available || false,
            critical: definition?.critical || false,
            hasIssues: validation?.warnings?.length > 0 || !validation?.available
        };
    }

    /**
     * 清除驗證緩存
     */
    clearValidationCache() {
        this.validationResults.clear();
        this.validationHistory = [];
        logger.info('驗證緩存已清除');
    }
}

// 創建全局實例
const dependencyValidator = new DependencyValidator();

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DependencyValidator, dependencyValidator };
} else if (typeof window !== 'undefined') {
    window.DependencyValidator = DependencyValidator;
    window.dependencyValidator = dependencyValidator;
}