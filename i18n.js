/**
 * Internationalization (i18n) Manager for Bingo Game Simulator
 * Supports multiple languages with dynamic switching
 */

class I18nManager {
    constructor() {
        this.currentLanguage = 'zh-TW'; // Default language
        this.translations = {};
        this.supportedLanguages = ['zh-TW', 'en-US'];
        this.fallbackLanguage = 'zh-TW';
        this.rtlLanguages = []; // Languages that use right-to-left text direction
        this.languageMetadata = {};
        
        // Initialize with default translations
        this.loadTranslations();
        this.loadLanguageMetadata();
        
        // Detect browser language
        this.detectBrowserLanguage();
        
        // Initialize layout observers
        this.initializeLayoutObservers();
    }

    /**
     * Load all translation data
     */
    loadTranslations() {
        // Traditional Chinese (Default)
        this.translations['zh-TW'] = {
            // Page title and meta
            'page.title': 'Bingo遊戲模擬器',
            'page.description': '一個合作式 Bingo 遊戲模擬器，玩家與電腦合作完成連線',
            'page.apple-title': 'Bingo模擬器',
            
            // Header
            'header.title': 'Bingo遊戲模擬器',
            'header.description': '與電腦進行8輪翻牌遊戲，目標是完成最多的連線！',
            
            // Language selector
            'language.selector.title': '語言選擇',
            'language.chinese': '繁體中文',
            'language.english': 'English',
            
            // Algorithm selector
            'algorithm.selector.title': '選擇演算法',
            'algorithm.standard.name': '標準演算法',
            'algorithm.standard.description': '基本的機率計算，平衡考慮各種因素',
            'algorithm.standard.features.1': '基本連線檢測',
            'algorithm.standard.features.2': '簡單的機率計算',
            'algorithm.standard.features.3': '中心位置獎勵',
            'algorithm.enhanced.name': '增強演算法',
            'algorithm.enhanced.description': '專注於最大化完成三條連線的機會',
            'algorithm.enhanced.features.1': '交叉點優先策略',
            'algorithm.enhanced.features.2': '接近完成的線優先',
            'algorithm.enhanced.features.3': '戰略位置評估',
            'algorithm.enhanced.features.4': '多線完成獎勵',
            'algorithm.ai-learning.name': 'AI 學習演算法',
            'algorithm.ai-learning.description': '基於機器學習的智能建議系統',
            'algorithm.ai-learning.features.1': '歷史數據學習',
            'algorithm.ai-learning.features.2': '行為模式預測',
            'algorithm.ai-learning.features.3': '自適應難度調整',
            'algorithm.ai-learning.features.4': '個性化遊戲體驗',
            'algorithm.current': '當前使用',
            
            // Game status
            'status.current-round': '當前輪數',
            'status.game-phase': '遊戲階段',
            'status.completed-lines': '完成連線',
            'status.total-rounds': '8',
            
            // Game phases
            'phase.waiting': '等待開始',
            'phase.player-turn': '玩家回合',
            'phase.computer-turn': '電腦回合',
            'phase.game-over': '遊戲結束',
            
            // AI Learning status
            'ai.status.title': 'AI 學習系統狀態',
            'ai.status.skill-level': '技能等級',
            'ai.status.play-style': '遊戲風格',
            'ai.status.difficulty-level': '難度等級',
            'ai.status.games-played': '已玩遊戲',
            'ai.style.balanced': '平衡型',
            'ai.style.aggressive': '積極型',
            'ai.style.defensive': '保守型',
            'ai.difficulty.easy': '簡單',
            'ai.difficulty.medium': '中等',
            'ai.difficulty.hard': '困難',
            'ai.controls.reset': '重置學習數據',
            'ai.controls.export': '導出學習數據',
            'ai.controls.import': '導入學習數據',
            
            // Game controls
            'controls.start-game': '開始遊戲',
            'controls.restart-game': '重新開始',
            'controls.random-computer-move': '電腦隨機下棋',
            'controls.auto-random-move': '電腦自動隨機下棋',
            'controls.auto-random-description': '啟用後，電腦將在每回合自動隨機選擇位置',
            
            // Game results
            'results.game-over': '遊戲結束！',
            'results.total-lines': '總連線數',
            'results.player-moves': '玩家移動',
            'results.computer-moves': '電腦移動',
            'results.play-again': '再玩一次',
            
            // Suggestions
            'suggestion.title': '建議移動',
            'suggestion.default': '點擊開始遊戲獲得建議',
            'suggestion.position': '建議位置',
            'suggestion.confidence': '信心度',
            'suggestion.expected-value': '預期價值',
            
            // Computer input
            'computer.input.title': '電腦選擇輸入',
            'computer.input.message': '電腦回合時，請直接點擊棋盤上的空格子或使用棋盤旁的隨機下棋按鈕',
            
            // Instructions
            'instructions.title': '操作指示',
            'instructions.default': '點擊「開始遊戲」按鈕開始新的遊戲。使用方向鍵導航遊戲板，按 Enter 或空格鍵選擇格子。',
            'instructions.player-turn': '請點擊一個空格子進行您的移動',
            'instructions.computer-turn': '請為電腦選擇一個位置，或點擊「電腦隨機下棋」按鈕',
            'instructions.game-over': '遊戲已結束，點擊「再玩一次」開始新遊戲',
            
            // Loading messages
            'loading.components': '正在載入遊戲組件...',
            'loading.compatibility': '正在檢查系統兼容性...',
            'loading.initializing': '正在初始化遊戲...',
            'loading.algorithm': '正在載入演算法...',
            
            // Error messages
            'error.component-load': '遊戲組件加載失敗',
            'error.game-start': '遊戲啟動失敗',
            'error.invalid-move': '無效的移動',
            'error.cell-occupied': '該位置已被佔用',
            'error.game-not-started': '遊戲尚未開始',
            'error.game-ended': '遊戲已結束',
            'error.invalid-phase': '當前不是正確的遊戲階段',
            
            // Success messages
            'success.algorithm-switched': '已切換到{algorithm}演算法',
            'success.game-restarted': '遊戲已重新開始',
            'success.language-switched': '語言已切換至 {language}',
            
            // Accessibility
            'aria.game-board': '5x5 Bingo 遊戲板',
            'aria.game-status': '遊戲狀態信息',
            'aria.current-round': '當前輪數',
            'aria.game-phase': '當前遊戲階段',
            'aria.completed-lines': '已完成的連線數量',
            'aria.game-controls': '遊戲控制按鈕',
            'aria.move-suggestion': '移動建議',
            
            // Date and number formatting
            'format.number.decimal': '.',
            'format.number.thousands': ',',
            'format.percentage': '{value}%',
            'format.round': '第 {round} 輪',
            'format.position': '位置 ({row}, {col})',
            
            // Time-related
            'time.seconds': '秒',
            'time.minutes': '分鐘',
            'time.hours': '小時',
            'time.days': '天',
            'time.weeks': '週',
            'time.months': '月',
            'time.years': '年',
            'time.seconds-ago': '{count} 秒前',
            'time.minutes-ago': '{count} 分鐘前',
            'time.hours-ago': '{count} 小時前',
            'time.days-ago': '{count} 天前',
            'time.just-now': '剛剛',
            
            // Additional UI elements
            'ui.loading': '載入中...',
            'ui.please-wait': '請稍候...',
            'ui.retry': '重試',
            'ui.cancel': '取消',
            'ui.confirm': '確認',
            'ui.close': '關閉',
            'ui.save': '儲存',
            'ui.reset': '重置',
            'ui.settings': '設定',
            'ui.help': '說明',
            'ui.about': '關於',
            
            // Loading states
            'loading.language-switch': '正在切換語言...',
            'loading.game-data': '正在載入遊戲資料...',
            'loading.preferences': '正在載入偏好設定...',
            
            // Game board cells
            'cell.empty': '空格子',
            'cell.player': '玩家已選擇',
            'cell.computer': '電腦已選擇',
            'cell.suggested': '建議位置',
            
            // Keyboard navigation
            'keyboard.navigate': '使用方向鍵導航',
            'keyboard.select': '按 Enter 或空格鍵選擇',
            'keyboard.current-position': '當前位置'
        };

        // English translations
        this.translations['en-US'] = {
            // Page title and meta
            'page.title': 'Bingo Game Simulator',
            'page.description': 'A cooperative Bingo game simulator where players collaborate with computer to complete lines',
            'page.apple-title': 'Bingo Simulator',
            
            // Header
            'header.title': 'Bingo Game Simulator',
            'header.description': 'Play 8 rounds with the computer to complete as many lines as possible!',
            
            // Language selector
            'language.selector.title': 'Language Selection',
            'language.chinese': '繁體中文',
            'language.english': 'English',
            
            // Algorithm selector
            'algorithm.selector.title': 'Select Algorithm',
            'algorithm.standard.name': 'Standard Algorithm',
            'algorithm.standard.description': 'Basic probability calculation with balanced considerations',
            'algorithm.standard.features.1': 'Basic line detection',
            'algorithm.standard.features.2': 'Simple probability calculation',
            'algorithm.standard.features.3': 'Center position bonus',
            'algorithm.enhanced.name': 'Enhanced Algorithm',
            'algorithm.enhanced.description': 'Focuses on maximizing the chance of completing three lines',
            'algorithm.enhanced.features.1': 'Intersection priority strategy',
            'algorithm.enhanced.features.2': 'Near-completion line priority',
            'algorithm.enhanced.features.3': 'Strategic position evaluation',
            'algorithm.enhanced.features.4': 'Multi-line completion bonus',
            'algorithm.ai-learning.name': 'AI Learning Algorithm',
            'algorithm.ai-learning.description': 'Intelligent suggestion system based on machine learning',
            'algorithm.ai-learning.features.1': 'Historical data learning',
            'algorithm.ai-learning.features.2': 'Behavior pattern prediction',
            'algorithm.ai-learning.features.3': 'Adaptive difficulty adjustment',
            'algorithm.ai-learning.features.4': 'Personalized gaming experience',
            'algorithm.current': 'Currently using',
            
            // Game status
            'status.current-round': 'Current Round',
            'status.game-phase': 'Game Phase',
            'status.completed-lines': 'Completed Lines',
            'status.total-rounds': '8',
            
            // Game phases
            'phase.waiting': 'Waiting to Start',
            'phase.player-turn': 'Player Turn',
            'phase.computer-turn': 'Computer Turn',
            'phase.game-over': 'Game Over',
            
            // AI Learning status
            'ai.status.title': 'AI Learning System Status',
            'ai.status.skill-level': 'Skill Level',
            'ai.status.play-style': 'Play Style',
            'ai.status.difficulty-level': 'Difficulty Level',
            'ai.status.games-played': 'Games Played',
            'ai.style.balanced': 'Balanced',
            'ai.style.aggressive': 'Aggressive',
            'ai.style.defensive': 'Defensive',
            'ai.difficulty.easy': 'Easy',
            'ai.difficulty.medium': 'Medium',
            'ai.difficulty.hard': 'Hard',
            'ai.controls.reset': 'Reset Learning Data',
            'ai.controls.export': 'Export Learning Data',
            'ai.controls.import': 'Import Learning Data',
            
            // Game controls
            'controls.start-game': 'Start Game',
            'controls.restart-game': 'Restart',
            'controls.random-computer-move': 'Random Computer Move',
            'controls.auto-random-move': 'Auto Random Computer Move',
            'controls.auto-random-description': 'When enabled, computer will automatically choose random positions each turn',
            
            // Game results
            'results.game-over': 'Game Over!',
            'results.total-lines': 'Total Lines',
            'results.player-moves': 'Player Moves',
            'results.computer-moves': 'Computer Moves',
            'results.play-again': 'Play Again',
            
            // Suggestions
            'suggestion.title': 'Move Suggestion',
            'suggestion.default': 'Click Start Game to get suggestions',
            'suggestion.position': 'Suggested Position',
            'suggestion.confidence': 'Confidence',
            'suggestion.expected-value': 'Expected Value',
            
            // Computer input
            'computer.input.title': 'Computer Move Input',
            'computer.input.message': 'During computer turn, click an empty cell on the board or use the random move button',
            
            // Instructions
            'instructions.title': 'Instructions',
            'instructions.default': 'Click "Start Game" to begin a new game. Use arrow keys to navigate the board, press Enter or Space to select a cell.',
            'instructions.player-turn': 'Please click an empty cell to make your move',
            'instructions.computer-turn': 'Please select a position for the computer, or click "Random Computer Move" button',
            'instructions.game-over': 'Game has ended, click "Play Again" to start a new game',
            
            // Loading messages
            'loading.components': 'Loading game components...',
            'loading.compatibility': 'Checking system compatibility...',
            'loading.initializing': 'Initializing game...',
            'loading.algorithm': 'Loading algorithm...',
            
            // Error messages
            'error.component-load': 'Failed to load game component',
            'error.game-start': 'Failed to start game',
            'error.invalid-move': 'Invalid move',
            'error.cell-occupied': 'Cell is already occupied',
            'error.game-not-started': 'Game has not started',
            'error.game-ended': 'Game has ended',
            'error.invalid-phase': 'Not the correct game phase',
            
            // Success messages
            'success.algorithm-switched': 'Switched to {algorithm} algorithm',
            'success.game-restarted': 'Game has been restarted',
            'success.language-switched': 'Language switched to {language}',
            
            // Accessibility
            'aria.game-board': '5x5 Bingo game board',
            'aria.game-status': 'Game status information',
            'aria.current-round': 'Current round number',
            'aria.game-phase': 'Current game phase',
            'aria.completed-lines': 'Number of completed lines',
            'aria.game-controls': 'Game control buttons',
            'aria.move-suggestion': 'Move suggestion',
            
            // Date and number formatting
            'format.number.decimal': '.',
            'format.number.thousands': ',',
            'format.percentage': '{value}%',
            'format.round': 'Round {round}',
            'format.position': 'Position ({row}, {col})',
            
            // Time-related
            'time.seconds': 'seconds',
            'time.minutes': 'minutes',
            'time.hours': 'hours',
            'time.days': 'days',
            'time.weeks': 'weeks',
            'time.months': 'months',
            'time.years': 'years',
            'time.seconds-ago': '{count} seconds ago',
            'time.minutes-ago': '{count} minutes ago',
            'time.hours-ago': '{count} hours ago',
            'time.days-ago': '{count} days ago',
            'time.just-now': 'just now',
            
            // Additional UI elements
            'ui.loading': 'Loading...',
            'ui.please-wait': 'Please wait...',
            'ui.retry': 'Retry',
            'ui.cancel': 'Cancel',
            'ui.confirm': 'Confirm',
            'ui.close': 'Close',
            'ui.save': 'Save',
            'ui.reset': 'Reset',
            'ui.settings': 'Settings',
            'ui.help': 'Help',
            'ui.about': 'About',
            
            // Loading states
            'loading.language-switch': 'Switching language...',
            'loading.game-data': 'Loading game data...',
            'loading.preferences': 'Loading preferences...',
            
            // Game board cells
            'cell.empty': 'Empty cell',
            'cell.player': 'Player selected',
            'cell.computer': 'Computer selected',
            'cell.suggested': 'Suggested position',
            
            // Keyboard navigation
            'keyboard.navigate': 'Use arrow keys to navigate',
            'keyboard.select': 'Press Enter or Space to select',
            'keyboard.current-position': 'Current position'
        };
    }

    /**
     * Load language metadata for enhanced localization
     */
    loadLanguageMetadata() {
        this.languageMetadata = {
            'zh-TW': {
                name: '繁體中文',
                nativeName: '繁體中文',
                direction: 'ltr',
                dateFormat: 'YYYY年MM月DD日',
                timeFormat: 'HH:mm:ss',
                numberFormat: {
                    decimal: '.',
                    thousands: ',',
                    currency: 'NT$',
                    currencyPosition: 'before'
                },
                pluralRules: 'other', // Chinese doesn't have plural forms
                fontFamily: '"Microsoft JhengHei", "PingFang TC", "Helvetica Neue", Arial, sans-serif'
            },
            'en-US': {
                name: 'English',
                nativeName: 'English',
                direction: 'ltr',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: 'h:mm:ss A',
                numberFormat: {
                    decimal: '.',
                    thousands: ',',
                    currency: '$',
                    currencyPosition: 'before'
                },
                pluralRules: 'en', // English plural rules
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }
        };
    }

    /**
     * Initialize layout observers for responsive language switching
     */
    initializeLayoutObservers() {
        // Observe viewport changes for responsive language adjustments
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(entries => {
                this.handleViewportChange();
            });
            
            // Start observing the document body
            if (document.body) {
                this.resizeObserver.observe(document.body);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    this.resizeObserver.observe(document.body);
                });
            }
        }
    }

    /**
     * Handle viewport changes for responsive language layouts
     */
    handleViewportChange() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        
        // Apply responsive language-specific styles
        this.applyResponsiveLanguageStyles(isMobile, isTablet);
    }

    /**
     * Apply responsive styles based on current language and viewport
     */
    applyResponsiveLanguageStyles(isMobile, isTablet) {
        const currentLangMeta = this.languageMetadata[this.currentLanguage];
        if (!currentLangMeta) return;

        // Apply font family
        document.documentElement.style.setProperty('--lang-font-family', currentLangMeta.fontFamily);
        
        // Apply text direction
        document.documentElement.dir = currentLangMeta.direction;
        
        // Apply responsive adjustments for different languages
        if (this.currentLanguage === 'en-US') {
            if (isMobile) {
                document.documentElement.style.setProperty('--lang-font-size-adjust', '0.9');
                document.documentElement.style.setProperty('--lang-line-height-adjust', '1.4');
            } else {
                document.documentElement.style.setProperty('--lang-font-size-adjust', '1');
                document.documentElement.style.setProperty('--lang-line-height-adjust', '1.6');
            }
        } else {
            // Chinese text adjustments
            if (isMobile) {
                document.documentElement.style.setProperty('--lang-font-size-adjust', '1');
                document.documentElement.style.setProperty('--lang-line-height-adjust', '1.5');
            } else {
                document.documentElement.style.setProperty('--lang-font-size-adjust', '1');
                document.documentElement.style.setProperty('--lang-line-height-adjust', '1.6');
            }
        }
    }

    /**
     * Detect browser language and set as default if supported
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const browserLangs = navigator.languages || [browserLang];
        
        // Check browser languages in order of preference
        for (const lang of browserLangs) {
            if (this.supportedLanguages.includes(lang)) {
                this.currentLanguage = lang;
                break;
            }
            
            // Check for language family (e.g., 'en' from 'en-GB')
            const langFamily = lang.split('-')[0];
            const matchingLang = this.supportedLanguages.find(supportedLang => 
                supportedLang.startsWith(langFamily)
            );
            
            if (matchingLang) {
                this.currentLanguage = matchingLang;
                break;
            }
        }
        
        // Try to load from localStorage (highest priority)
        const savedLang = localStorage.getItem('bingo-game-language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
        }
        
        // Apply initial language metadata
        this.applyLanguageMetadata();
    }

    /**
     * Apply language-specific metadata to the document
     */
    applyLanguageMetadata() {
        const langMeta = this.languageMetadata[this.currentLanguage];
        if (!langMeta) return;

        // Set document language and direction
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = langMeta.direction;
        
        // Apply font family
        document.documentElement.style.setProperty('--lang-font-family', langMeta.fontFamily);
        
        // Apply initial responsive styles
        this.handleViewportChange();
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for string interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const langTranslations = this.translations[this.currentLanguage] || 
                                this.translations[this.fallbackLanguage];
        
        let translation = langTranslations[key] || key;
        
        // Handle string interpolation
        if (params && typeof params === 'object') {
            Object.keys(params).forEach(param => {
                const placeholder = `{${param}}`;
                translation = translation.replace(new RegExp(placeholder, 'g'), params[param]);
            });
        }
        
        return translation;
    }

    /**
     * Set current language with enhanced validation and transition
     * @param {string} language - Language code
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>} Success status
     */
    async setLanguage(language, options = {}) {
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`Language ${language} is not supported`);
            return false;
        }
        
        if (language === this.currentLanguage && !options.force) {
            return true; // Already using this language
        }
        
        const previousLanguage = this.currentLanguage;
        
        try {
            // Show loading state if requested
            if (options.showLoading) {
                this.showLanguageLoadingState(true);
            }
            
            // Prepare for language change
            await this.prepareLanguageChange(language, previousLanguage);
            
            // Update current language
            this.currentLanguage = language;
            localStorage.setItem('bingo-game-language', language);
            
            // Apply language metadata
            this.applyLanguageMetadata();
            
            // Trigger language change with transition
            await this.onLanguageChange(previousLanguage, options);
            
            // Hide loading state
            if (options.showLoading) {
                this.showLanguageLoadingState(false);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to change language:', error);
            
            // Revert to previous language on error
            this.currentLanguage = previousLanguage;
            
            if (options.showLoading) {
                this.showLanguageLoadingState(false);
            }
            
            return false;
        }
    }

    /**
     * Prepare for language change (preload resources, validate, etc.)
     * @param {string} newLanguage - Target language
     * @param {string} previousLanguage - Current language
     */
    async prepareLanguageChange(newLanguage, previousLanguage) {
        // Validate translations exist
        if (!this.translations[newLanguage]) {
            throw new Error(`Translations for ${newLanguage} not found`);
        }
        
        // Preload any language-specific resources
        await this.preloadLanguageResources(newLanguage);
        
        // Validate critical translations
        const criticalKeys = [
            'page.title',
            'header.title',
            'controls.start-game',
            'error.invalid-move'
        ];
        
        for (const key of criticalKeys) {
            if (!this.translations[newLanguage][key]) {
                console.warn(`Missing critical translation: ${key} for ${newLanguage}`);
            }
        }
    }

    /**
     * Preload language-specific resources
     * @param {string} language - Language code
     */
    async preloadLanguageResources(language) {
        // This could be extended to load language-specific fonts, images, etc.
        const langMeta = this.languageMetadata[language];
        
        if (langMeta && langMeta.fontFamily) {
            // Preload font if needed
            const fontFamilies = langMeta.fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
            
            for (const fontFamily of fontFamilies) {
                if (fontFamily && !fontFamily.includes('sans-serif') && !fontFamily.includes('serif')) {
                    try {
                        await document.fonts.load(`16px "${fontFamily}"`);
                    } catch (error) {
                        console.warn(`Failed to preload font: ${fontFamily}`);
                    }
                }
            }
        }
    }

    /**
     * Show/hide language loading state
     * @param {boolean} show - Whether to show loading state
     */
    showLanguageLoadingState(show) {
        let loadingElement = document.getElementById('language-loading');
        
        if (show) {
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.id = 'language-loading';
                loadingElement.className = 'language-loading-overlay';
                loadingElement.innerHTML = `
                    <div class="language-loading-content">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">${this.t('loading.language-switch')}</div>
                    </div>
                `;
                document.body.appendChild(loadingElement);
            }
            
            loadingElement.style.display = 'flex';
            requestAnimationFrame(() => {
                loadingElement.style.opacity = '1';
            });
        } else {
            if (loadingElement) {
                loadingElement.style.opacity = '0';
                setTimeout(() => {
                    if (loadingElement.parentNode) {
                        loadingElement.parentNode.removeChild(loadingElement);
                    }
                }, 300);
            }
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get supported languages
     * @returns {Array} Array of supported language codes
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    /**
     * Format number according to current locale
     * @param {number} number - Number to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted number
     */
    formatNumber(number, options = {}) {
        try {
            // Use Intl.NumberFormat for modern browsers
            const formatter = new Intl.NumberFormat(this.currentLanguage, {
                minimumFractionDigits: options.minimumFractionDigits || 0,
                maximumFractionDigits: options.maximumFractionDigits || 3,
                useGrouping: options.useGrouping !== false,
                ...options
            });
            return formatter.format(number);
        } catch (error) {
            // Enhanced fallback formatting using language metadata
            const langMeta = this.languageMetadata[this.currentLanguage];
            const decimal = langMeta?.numberFormat?.decimal || '.';
            const thousands = langMeta?.numberFormat?.thousands || ',';
            
            let formattedNumber = number.toString();
            
            // Handle decimal places
            if (options.minimumFractionDigits || options.maximumFractionDigits) {
                const decimalPlaces = options.maximumFractionDigits || options.minimumFractionDigits || 0;
                formattedNumber = parseFloat(number).toFixed(decimalPlaces);
            }
            
            // Add thousands separators
            const parts = formattedNumber.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
            
            return parts.join(decimal);
        }
    }

    /**
     * Format currency according to current locale
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (optional)
     * @returns {string} Formatted currency
     */
    formatCurrency(amount, currency = null) {
        const langMeta = this.languageMetadata[this.currentLanguage];
        const currencySymbol = currency || langMeta?.numberFormat?.currency || '$';
        const position = langMeta?.numberFormat?.currencyPosition || 'before';
        
        try {
            const formatter = new Intl.NumberFormat(this.currentLanguage, {
                style: 'currency',
                currency: currency || (this.currentLanguage === 'zh-TW' ? 'TWD' : 'USD'),
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
            return formatter.format(amount);
        } catch (error) {
            // Fallback currency formatting
            const formattedAmount = this.formatNumber(amount, { maximumFractionDigits: 2 });
            return position === 'before' 
                ? `${currencySymbol}${formattedAmount}`
                : `${formattedAmount}${currencySymbol}`;
        }
    }

    /**
     * Format date according to current locale
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date
     */
    formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        try {
            const formatter = new Intl.DateTimeFormat(this.currentLanguage, {
                year: options.year || 'numeric',
                month: options.month || 'long',
                day: options.day || 'numeric',
                ...options
            });
            return formatter.format(dateObj);
        } catch (error) {
            // Fallback date formatting using language metadata
            const langMeta = this.languageMetadata[this.currentLanguage];
            const format = langMeta?.dateFormat || 'MM/DD/YYYY';
            
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            
            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day);
        }
    }

    /**
     * Format time according to current locale
     * @param {Date|string|number} time - Time to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted time
     */
    formatTime(time, options = {}) {
        const timeObj = time instanceof Date ? time : new Date(time);
        
        try {
            const formatter = new Intl.DateTimeFormat(this.currentLanguage, {
                hour: options.hour || 'numeric',
                minute: options.minute || '2-digit',
                second: options.second || '2-digit',
                hour12: options.hour12,
                ...options
            });
            return formatter.format(timeObj);
        } catch (error) {
            // Fallback time formatting
            const langMeta = this.languageMetadata[this.currentLanguage];
            const format = langMeta?.timeFormat || 'HH:mm:ss';
            
            const hours = timeObj.getHours();
            const minutes = String(timeObj.getMinutes()).padStart(2, '0');
            const seconds = String(timeObj.getSeconds()).padStart(2, '0');
            
            if (format.includes('A')) {
                // 12-hour format
                const hour12 = hours % 12 || 12;
                const ampm = hours >= 12 ? 'PM' : 'AM';
                return `${hour12}:${minutes}:${seconds} ${ampm}`;
            } else {
                // 24-hour format
                const hour24 = String(hours).padStart(2, '0');
                return `${hour24}:${minutes}:${seconds}`;
            }
        }
    }

    /**
     * Format relative time (e.g., "2 minutes ago")
     * @param {Date|string|number} date - Date to format
     * @returns {string} Formatted relative time
     */
    formatRelativeTime(date) {
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffMs = now - dateObj;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        try {
            const formatter = new Intl.RelativeTimeFormat(this.currentLanguage, {
                numeric: 'auto',
                style: 'long'
            });

            if (diffDays > 0) {
                return formatter.format(-diffDays, 'day');
            } else if (diffHours > 0) {
                return formatter.format(-diffHours, 'hour');
            } else if (diffMinutes > 0) {
                return formatter.format(-diffMinutes, 'minute');
            } else {
                return formatter.format(-diffSeconds, 'second');
            }
        } catch (error) {
            // Fallback relative time formatting
            if (diffDays > 0) {
                return this.t('time.days-ago', { count: diffDays });
            } else if (diffHours > 0) {
                return this.t('time.hours-ago', { count: diffHours });
            } else if (diffMinutes > 0) {
                return this.t('time.minutes-ago', { count: diffMinutes });
            } else {
                return this.t('time.seconds-ago', { count: diffSeconds });
            }
        }
    }

    /**
     * Format percentage
     * @param {number} value - Percentage value (0-100)
     * @returns {string} Formatted percentage
     */
    formatPercentage(value) {
        return this.t('format.percentage', { value: this.formatNumber(value) });
    }

    /**
     * Format round number
     * @param {number} round - Round number
     * @returns {string} Formatted round
     */
    formatRound(round) {
        return this.t('format.round', { round: this.formatNumber(round) });
    }

    /**
     * Format position
     * @param {number} row - Row number
     * @param {number} col - Column number
     * @returns {string} Formatted position
     */
    formatPosition(row, col) {
        return this.t('format.position', { 
            row: this.formatNumber(row + 1), 
            col: this.formatNumber(col + 1) 
        });
    }

    /**
     * Called when language changes - updates the entire UI with transitions
     * @param {string} previousLanguage - Previous language code
     * @param {Object} options - Change options
     */
    async onLanguageChange(previousLanguage = null, options = {}) {
        console.log(`Language changed from ${previousLanguage} to: ${this.currentLanguage}`);
        
        // Apply fade transition if requested
        if (options.transition !== false) {
            await this.applyLanguageTransition();
        }
        
        // Update document language attribute and metadata
        document.documentElement.lang = this.currentLanguage;
        this.applyLanguageMetadata();
        
        // Update page title and meta tags
        this.updatePageMeta();
        
        // Update all elements with data-i18n attributes
        this.updateUIElements();
        
        // Update number and date formats
        this.updateFormattedElements();
        
        // Update language-specific styles
        this.updateLanguageStyles();
        
        // Update layout for new language
        this.updateLanguageLayout();
        
        // Trigger custom event for other components to listen
        const event = new CustomEvent('languageChanged', {
            detail: { 
                language: this.currentLanguage,
                previousLanguage: previousLanguage,
                translations: this.translations[this.currentLanguage],
                metadata: this.languageMetadata[this.currentLanguage]
            }
        });
        document.dispatchEvent(event);
        
        // Show success message
        if (options.showMessage !== false) {
            this.showLanguageChangeMessage(this.currentLanguage, previousLanguage);
        }
    }

    /**
     * Apply smooth transition effect during language change
     */
    async applyLanguageTransition() {
        const transitionElements = document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-aria]');
        
        // Add transition class
        transitionElements.forEach(element => {
            element.classList.add('language-transition');
        });
        
        // Wait for transition to complete
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Remove transition class after update
        setTimeout(() => {
            transitionElements.forEach(element => {
                element.classList.remove('language-transition');
            });
        }, 300);
    }

    /**
     * Update language-specific styles
     */
    updateLanguageStyles() {
        const langMeta = this.languageMetadata[this.currentLanguage];
        if (!langMeta) return;

        // Update CSS custom properties for language-specific styling
        const root = document.documentElement;
        root.style.setProperty('--current-language', `"${this.currentLanguage}"`);
        root.style.setProperty('--text-direction', langMeta.direction);
        root.style.setProperty('--lang-font-family', langMeta.fontFamily);
        
        // Add language class to body
        document.body.className = document.body.className
            .replace(/\blang-[a-z]{2}-[A-Z]{2}\b/g, '')
            .trim();
        document.body.classList.add(`lang-${this.currentLanguage}`);
    }

    /**
     * Update layout adjustments for different languages
     */
    updateLanguageLayout() {
        const isEnglish = this.currentLanguage === 'en-US';
        const isChinese = this.currentLanguage === 'zh-TW';
        
        // Apply language-specific layout adjustments
        if (isEnglish) {
            // English text tends to be longer, adjust spacing
            document.documentElement.style.setProperty('--lang-button-padding', '8px 16px');
            document.documentElement.style.setProperty('--lang-text-spacing', '0.02em');
        } else if (isChinese) {
            // Chinese characters are more compact
            document.documentElement.style.setProperty('--lang-button-padding', '10px 20px');
            document.documentElement.style.setProperty('--lang-text-spacing', '0');
        }
        
        // Update responsive breakpoints if needed
        this.handleViewportChange();
    }

    /**
     * Update page meta information based on current language
     */
    updatePageMeta() {
        // Update page title
        const title = document.querySelector('title');
        if (title) {
            title.textContent = this.t('page.title');
        }
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', this.t('page.description'));
        }
        
        // Update apple mobile web app title
        const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (appleTitle) {
            appleTitle.setAttribute('content', this.t('page.apple-title'));
        }
    }

    /**
     * Update all UI elements with data-i18n attributes
     */
    updateUIElements() {
        // Update elements with data-i18n attribute
        const i18nElements = document.querySelectorAll('[data-i18n]');
        i18nElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = this.t(key);
            }
        });
        
        // Update elements with data-i18n-html attribute (for HTML content)
        const i18nHtmlElements = document.querySelectorAll('[data-i18n-html]');
        i18nHtmlElements.forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            if (key) {
                element.innerHTML = this.t(key);
            }
        });
        
        // Update ARIA labels
        const ariaElements = document.querySelectorAll('[data-i18n-aria]');
        ariaElements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            if (key) {
                element.setAttribute('aria-label', this.t(key));
            }
        });
        
        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                element.setAttribute('placeholder', this.t(key));
            }
        });
        
        // Update titles
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                element.setAttribute('title', this.t(key));
            }
        });
    }

    /**
     * Update elements with formatted numbers and dates
     */
    updateFormattedElements() {
        // Update round numbers
        const roundElements = document.querySelectorAll('[data-format="round"]');
        roundElements.forEach(element => {
            const roundNumber = parseInt(element.textContent) || 1;
            element.textContent = this.formatRound(roundNumber);
        });
        
        // Update position elements
        const positionElements = document.querySelectorAll('[data-format="position"]');
        positionElements.forEach(element => {
            const row = parseInt(element.getAttribute('data-row')) || 0;
            const col = parseInt(element.getAttribute('data-col')) || 0;
            element.textContent = this.formatPosition(row, col);
        });
        
        // Update percentage elements
        const percentageElements = document.querySelectorAll('[data-format="percentage"]');
        percentageElements.forEach(element => {
            const value = parseFloat(element.getAttribute('data-value')) || 0;
            element.textContent = this.formatPercentage(value);
        });
    }

    /**
     * Initialize language selector UI
     */
    initializeLanguageSelector() {
        const languageOptions = document.querySelectorAll('.language-option');
        
        languageOptions.forEach(option => {
            const language = option.getAttribute('data-language');
            
            // Set initial selection
            if (language === this.currentLanguage) {
                option.classList.add('selected');
                option.setAttribute('aria-pressed', 'true');
            } else {
                option.classList.remove('selected');
                option.setAttribute('aria-pressed', 'false');
            }
            
            // Add click event listener
            option.addEventListener('click', () => {
                this.switchLanguage(language);
            });
        });
    }

    /**
     * Switch to a different language with enhanced UX
     * @param {string} language - Target language code
     * @param {Object} options - Switch options
     */
    async switchLanguage(language, options = {}) {
        if (language === this.currentLanguage) {
            return true; // Already using this language
        }
        
        // Show loading state for better UX
        const switchOptions = {
            showLoading: true,
            transition: true,
            showMessage: true,
            ...options
        };
        
        const success = await this.setLanguage(language, switchOptions);
        
        if (success) {
            // Update language selector UI with animation
            this.updateLanguageSelectorUI(language);
            
            // Update URL parameter if needed (for bookmarking)
            if (options.updateURL !== false) {
                this.updateURLLanguageParameter(language);
            }
            
            // Track language change for analytics
            this.trackLanguageChange(language);
        }
        
        return success;
    }

    /**
     * Update language selector UI with smooth transitions
     * @param {string} selectedLanguage - Currently selected language
     */
    updateLanguageSelectorUI(selectedLanguage) {
        const languageOptions = document.querySelectorAll('.language-option');
        
        languageOptions.forEach(option => {
            const optionLang = option.getAttribute('data-language');
            const isSelected = optionLang === selectedLanguage;
            
            // Add transition class
            option.classList.add('language-option-transition');
            
            // Update selection state
            if (isSelected) {
                option.classList.add('selected');
                option.setAttribute('aria-pressed', 'true');
                option.setAttribute('aria-current', 'true');
            } else {
                option.classList.remove('selected');
                option.setAttribute('aria-pressed', 'false');
                option.removeAttribute('aria-current');
            }
            
            // Remove transition class after animation
            setTimeout(() => {
                option.classList.remove('language-option-transition');
            }, 300);
        });
    }

    /**
     * Update URL parameter for language (for bookmarking and sharing)
     * @param {string} language - Language code
     */
    updateURLLanguageParameter(language) {
        if (typeof URLSearchParams !== 'undefined' && window.history && window.history.replaceState) {
            const url = new URL(window.location);
            
            if (language === this.fallbackLanguage) {
                // Remove language parameter for default language
                url.searchParams.delete('lang');
            } else {
                url.searchParams.set('lang', language);
            }
            
            window.history.replaceState({}, '', url.toString());
        }
    }

    /**
     * Track language change for analytics
     * @param {string} language - New language
     */
    trackLanguageChange(language) {
        // This could be extended to send analytics data
        console.log(`Language switched to: ${language}`);
        
        // Example: Send to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'language_change', {
                'language': language,
                'previous_language': this.currentLanguage
            });
        }
    }

    /**
     * Show enhanced language change confirmation message
     * @param {string} language - New language code
     * @param {string} previousLanguage - Previous language code
     */
    showLanguageChangeMessage(language, previousLanguage = null) {
        const langMeta = this.languageMetadata[language];
        const languageName = langMeta ? langMeta.nativeName : language;
        
        // Create message in the new language
        const message = this.t('success.language-switched', { language: languageName });
        
        // Remove any existing message
        const existingMessage = document.querySelector('.language-change-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create enhanced message element
        const messageElement = document.createElement('div');
        messageElement.className = 'language-change-message';
        messageElement.innerHTML = `
            <div class="message-icon">🌐</div>
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-subtext">${languageName}</div>
            </div>
            <button class="message-close" aria-label="${this.t('ui.close')}">&times;</button>
        `;
        
        // Apply enhanced styles
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
            z-index: 10000;
            font-size: 14px;
            opacity: 0;
            transform: translateX(100%) scale(0.8);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 300px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        // Style the icon
        const icon = messageElement.querySelector('.message-icon');
        icon.style.cssText = `
            font-size: 20px;
            flex-shrink: 0;
        `;
        
        // Style the content
        const content = messageElement.querySelector('.message-content');
        content.style.cssText = `
            flex: 1;
            line-height: 1.4;
        `;
        
        // Style the subtext
        const subtext = messageElement.querySelector('.message-subtext');
        subtext.style.cssText = `
            font-size: 12px;
            opacity: 0.8;
            margin-top: 2px;
        `;
        
        // Style the close button
        const closeButton = messageElement.querySelector('.message-close');
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
            flex-shrink: 0;
        `;
        
        // Add close button hover effect
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.backgroundColor = 'transparent';
        });
        
        // Add close functionality
        const closeMessage = () => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateX(100%) scale(0.8)';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 400);
        };
        
        closeButton.addEventListener('click', closeMessage);
        
        // Add to document
        document.body.appendChild(messageElement);
        
        // Animate in with enhanced effect
        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateX(0) scale(1)';
        });
        
        // Auto-remove after 4 seconds
        setTimeout(closeMessage, 4000);
        
        // Add accessibility announcement
        this.announceLanguageChange(message);
    }

    /**
     * Announce language change to screen readers
     * @param {string} message - Message to announce
     */
    announceLanguageChange(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    }
}

// Global i18n instance
let i18n = null;

// Initialize i18n when script loads
if (typeof window !== 'undefined') {
    i18n = new I18nManager();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            i18n.initializeLanguageSelector();
            i18n.onLanguageChange(); // Initial UI update
        });
    } else {
        // DOM is already ready
        i18n.initializeLanguageSelector();
        i18n.onLanguageChange(); // Initial UI update
    }
}

// Export for Node.js environments (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18nManager };
}