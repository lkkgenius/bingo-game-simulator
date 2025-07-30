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
        
        // Initialize with default translations
        this.loadTranslations();
        
        // Detect browser language
        this.detectBrowserLanguage();
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
            
            // Additional UI elements
            'ui.loading': '載入中...',
            'ui.please-wait': '請稍候...',
            'ui.retry': '重試',
            'ui.cancel': '取消',
            'ui.confirm': '確認',
            'ui.close': '關閉',
            
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
            
            // Additional UI elements
            'ui.loading': 'Loading...',
            'ui.please-wait': 'Please wait...',
            'ui.retry': 'Retry',
            'ui.cancel': 'Cancel',
            'ui.confirm': 'Confirm',
            'ui.close': 'Close',
            
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
     * Detect browser language and set as default if supported
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        
        // Check if browser language is supported
        if (this.supportedLanguages.includes(browserLang)) {
            this.currentLanguage = browserLang;
        } else {
            // Check for language family (e.g., 'en' from 'en-GB')
            const langFamily = browserLang.split('-')[0];
            const matchingLang = this.supportedLanguages.find(lang => 
                lang.startsWith(langFamily)
            );
            
            if (matchingLang) {
                this.currentLanguage = matchingLang;
            }
        }
        
        // Try to load from localStorage
        const savedLang = localStorage.getItem('bingo-game-language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
        }
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
     * Set current language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`Language ${language} is not supported`);
            return false;
        }
        
        this.currentLanguage = language;
        localStorage.setItem('bingo-game-language', language);
        
        // Update document language
        document.documentElement.lang = language;
        
        // Trigger language change event
        this.onLanguageChange();
        
        return true;
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
            return new Intl.NumberFormat(this.currentLanguage, options).format(number);
        } catch (error) {
            // Fallback formatting
            const decimal = this.t('format.number.decimal');
            const thousands = this.t('format.number.thousands');
            
            return number.toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, thousands)
                .replace('.', decimal);
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
     * Called when language changes - updates the entire UI
     */
    onLanguageChange() {
        console.log(`Language changed to: ${this.currentLanguage}`);
        
        // Update document language attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update page title and meta tags
        this.updatePageMeta();
        
        // Update all elements with data-i18n attributes
        this.updateUIElements();
        
        // Update number and date formats
        this.updateFormattedElements();
        
        // Trigger custom event for other components to listen
        const event = new CustomEvent('languageChanged', {
            detail: { 
                language: this.currentLanguage,
                translations: this.translations[this.currentLanguage]
            }
        });
        document.dispatchEvent(event);
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
     * Switch to a different language
     * @param {string} language - Target language code
     */
    switchLanguage(language) {
        if (this.setLanguage(language)) {
            // Update language selector UI
            const languageOptions = document.querySelectorAll('.language-option');
            languageOptions.forEach(option => {
                const optionLang = option.getAttribute('data-language');
                if (optionLang === language) {
                    option.classList.add('selected');
                    option.setAttribute('aria-pressed', 'true');
                } else {
                    option.classList.remove('selected');
                    option.setAttribute('aria-pressed', 'false');
                }
            });
            
            // Show success message
            this.showLanguageChangeMessage(language);
        }
    }

    /**
     * Show language change confirmation message
     * @param {string} language - New language code
     */
    showLanguageChangeMessage(language) {
        const languageNames = {
            'zh-TW': '繁體中文',
            'en-US': 'English'
        };
        
        const message = this.currentLanguage === 'zh-TW' 
            ? `語言已切換至 ${languageNames[language]}`
            : `Language switched to ${languageNames[language]}`;
        
        // Create temporary message element
        const messageElement = document.createElement('div');
        messageElement.className = 'language-change-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-size: 14px;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(messageElement);
        
        // Animate in
        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 3000);
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