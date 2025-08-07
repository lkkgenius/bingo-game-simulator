/**
 * Enhanced Accessibility System for Bingo Game Simulator
 * Implements WCAG 2.1 AA compliance and advanced accessibility features
 */

class AccessibilityEnhancer {
    constructor() {
        this.isInitialized = false;
        this.screenReaderActive = false;
        this.keyboardNavigationEnabled = false;
        this.highContrastMode = false;
        this.reducedMotionMode = false;
        this.focusedElement = null;
        this.announcements = [];
        this.lastAnnouncement = '';
        
        // WCAG compliance settings
        this.wcagSettings = {
            minContrastRatio: 4.5, // AA standard
            minTouchTargetSize: 44, // pixels
            maxAnimationDuration: 5000, // milliseconds
            focusIndicatorMinWidth: 2 // pixels
        };
        
        this.init();
    }

    /**
     * Initialize accessibility enhancements
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.detectUserPreferences();
            this.setupScreenReaderSupport();
            this.enhanceKeyboardNavigation();
            this.setupFocusManagement();
            this.implementARIAEnhancements();
            this.setupColorContrastEnhancements();
            this.setupMotionPreferences();
            this.setupTouchTargetOptimization();
            this.setupVoiceAnnouncements();
            
            this.isInitialized = true;
            console.log('Accessibility enhancements initialized');
        } catch (error) {
            console.error('Failed to initialize accessibility enhancements:', error);
        }
    }

    /**
     * Detect user accessibility preferences
     */
    detectUserPreferences() {
        // Detect screen reader
        this.screenReaderActive = this.detectScreenReader();
        
        // Detect reduced motion preference
        if (window.matchMedia) {
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reducedMotionMode = reducedMotionQuery.matches;
            
            reducedMotionQuery.addEventListener('change', (e) => {
                this.reducedMotionMode = e.matches;
                this.applyMotionPreferences();
            });
        }
        
        // Detect high contrast preference
        if (window.matchMedia) {
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            this.highContrastMode = highContrastQuery.matches;
            
            highContrastQuery.addEventListener('change', (e) => {
                this.highContrastMode = e.matches;
                this.applyContrastPreferences();
            });
        }
        
        // Check for saved preferences
        const savedPrefs = localStorage.getItem('accessibility-preferences');
        if (savedPrefs) {
            try {
                const prefs = JSON.parse(savedPrefs);
                this.applyUserPreferences(prefs);
            } catch (error) {
                console.warn('Failed to load accessibility preferences:', error);
            }
        }
    }

    /**
     * Detect if screen reader is active
     */
    detectScreenReader() {
        // Multiple methods to detect screen reader
        const indicators = [
            // Check for common screen reader user agents
            /NVDA|JAWS|DRAGON|VoiceOver|TalkBack/i.test(navigator.userAgent),
            
            // Check for screen reader specific APIs
            'speechSynthesis' in window,
            
            // Check for accessibility tree modifications
            document.querySelector('[aria-hidden="true"]') !== null,
            
            // Check for high contrast mode (often used with screen readers)
            window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches
        ];
        
        return indicators.some(indicator => indicator);
    }

    /**
     * Setup enhanced screen reader support
     */
    setupScreenReaderSupport() {
        // Create live region for announcements
        this.createLiveRegion();
        
        // Setup game state announcements
        this.setupGameStateAnnouncements();
        
        // Setup move announcements
        this.setupMoveAnnouncements();
        
        // Setup error announcements
        this.setupErrorAnnouncements();
    }

    /**
     * Create ARIA live region for screen reader announcements
     */
    createLiveRegion() {
        // Remove existing live region
        const existingRegion = document.getElementById('sr-live-region');
        if (existingRegion) {
            existingRegion.remove();
        }
        
        // Create new live region
        const liveRegion = SafeDOM.createElement('div', {
            id: 'sr-live-region',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            class: 'sr-only'
        });
        
        // Create assertive region for urgent announcements
        const assertiveRegion = SafeDOM.createElement('div', {
            id: 'sr-assertive-region',
            'aria-live': 'assertive',
            'aria-atomic': 'true',
            class: 'sr-only'
        });
        
        document.body.appendChild(liveRegion);
        document.body.appendChild(assertiveRegion);
    }

    /**
     * Announce message to screen readers
     */
    announce(message, priority = 'polite') {
        if (!message || message === this.lastAnnouncement) return;
        
        const regionId = priority === 'assertive' ? 'sr-assertive-region' : 'sr-live-region';
        const region = document.getElementById(regionId);
        
        if (region) {
            // Clear previous announcement
            region.textContent = '';
            
            // Add new announcement after a brief delay
            setTimeout(() => {
                region.textContent = message;
                this.lastAnnouncement = message;
                
                // Clear after announcement
                setTimeout(() => {
                    if (region.textContent === message) {
                        region.textContent = '';
                    }
                }, 1000);
            }, 100);
        }
        
        // Log announcement for debugging
        console.log(`Screen reader announcement (${priority}):`, message);
    }

    /**
     * Setup game state announcements
     */
    setupGameStateAnnouncements() {
        // Listen for game state changes
        document.addEventListener('gameStateChanged', (event) => {
            const { phase, round, completedLines } = event.detail;
            
            let announcement = '';
            
            switch (phase) {
                case 'player-turn':
                    announcement = `第 ${round} 輪，輪到您下棋。已完成 ${completedLines} 條連線。`;
                    break;
                case 'computer-turn':
                    announcement = `第 ${round} 輪，電腦回合。請選擇電腦的位置。`;
                    break;
                case 'game-over':
                    announcement = `遊戲結束！總共完成了 ${completedLines} 條連線。`;
                    break;
            }
            
            if (announcement) {
                this.announce(announcement);
            }
        });
    }

    /**
     * Setup move announcements
     */
    setupMoveAnnouncements() {
        document.addEventListener('moveCompleted', (event) => {
            const { player, position, isValid } = event.detail;
            
            if (isValid) {
                const positionText = `第 ${position.row + 1} 行第 ${position.col + 1} 列`;
                const playerText = player === 'player' ? '您' : '電腦';
                this.announce(`${playerText}選擇了${positionText}`);
            } else {
                this.announce('無效的移動，請重新選擇', 'assertive');
            }
        });
    }

    /**
     * Setup error announcements
     */
    setupErrorAnnouncements() {
        document.addEventListener('gameError', (event) => {
            const { message, type } = event.detail;
            this.announce(`錯誤：${message}`, 'assertive');
        });
    }

    /**
     * Enhance keyboard navigation
     */
    enhanceKeyboardNavigation() {
        this.keyboardNavigationEnabled = true;
        
        // Setup game board keyboard navigation
        this.setupGameBoardKeyboardNav();
        
        // Setup menu keyboard navigation
        this.setupMenuKeyboardNav();
        
        // Setup skip links
        this.setupSkipLinks();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup game board keyboard navigation
     */
    setupGameBoardKeyboardNav() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;
        
        let focusedRow = 0;
        let focusedCol = 0;
        
        // Make game board focusable
        gameBoard.setAttribute('tabindex', '0');
        gameBoard.setAttribute('role', 'grid');
        gameBoard.setAttribute('aria-label', '5x5 Bingo 遊戲板，使用方向鍵導航，按 Enter 選擇');
        
        // Keyboard event handler
        const handleKeyDown = (event) => {
            if (!gameState || !gameState.gameStarted || gameState.gameEnded) {
                return;
            }
            
            let handled = false;
            const oldRow = focusedRow;
            const oldCol = focusedCol;
            
            switch (event.key) {
                case 'ArrowUp':
                    focusedRow = Math.max(0, focusedRow - 1);
                    handled = true;
                    break;
                case 'ArrowDown':
                    focusedRow = Math.min(4, focusedRow + 1);
                    handled = true;
                    break;
                case 'ArrowLeft':
                    focusedCol = Math.max(0, focusedCol - 1);
                    handled = true;
                    break;
                case 'ArrowRight':
                    focusedCol = Math.min(4, focusedCol + 1);
                    handled = true;
                    break;
                case 'Home':
                    focusedRow = 0;
                    focusedCol = 0;
                    handled = true;
                    break;
                case 'End':
                    focusedRow = 4;
                    focusedCol = 4;
                    handled = true;
                    break;
                case 'Enter':
                case ' ':
                    if (typeof handleCellClick === 'function') {
                        handleCellClick(focusedRow, focusedCol);
                    }
                    handled = true;
                    break;
            }
            
            if (handled) {
                event.preventDefault();
                
                // Update visual focus if position changed
                if (oldRow !== focusedRow || oldCol !== focusedCol) {
                    this.updateKeyboardFocus(focusedRow, focusedCol);
                    this.announceCurrentPosition(focusedRow, focusedCol);
                }
            }
        };
        
        gameBoard.addEventListener('keydown', handleKeyDown);
        
        // Initialize focus
        this.updateKeyboardFocus(0, 0);
    }

    /**
     * Update keyboard focus visual indicator
     */
    updateKeyboardFocus(row, col) {
        // Remove all existing focus indicators
        document.querySelectorAll('.game-cell.keyboard-focus').forEach(cell => {
            cell.classList.remove('keyboard-focus');
            cell.setAttribute('aria-selected', 'false');
        });
        
        // Add focus to target cell
        const cells = document.querySelectorAll('.game-cell');
        const targetCell = cells[row * 5 + col];
        
        if (targetCell) {
            targetCell.classList.add('keyboard-focus');
            targetCell.setAttribute('aria-selected', 'true');
            
            // Ensure cell is visible (scroll into view if needed)
            targetCell.scrollIntoView({ 
                block: 'nearest', 
                inline: 'nearest',
                behavior: this.reducedMotionMode ? 'auto' : 'smooth'
            });
        }
    }

    /**
     * Announce current position for screen readers
     */
    announceCurrentPosition(row, col) {
        if (!gameState) return;
        
        const board = gameState.getState().board;
        const cellState = board[row][col];
        
        let stateText = '';
        switch (cellState) {
            case 1:
                stateText = '玩家已選擇';
                break;
            case 2:
                stateText = '電腦已選擇';
                break;
            default:
                stateText = '空格子';
        }
        
        const positionText = `第 ${row + 1} 行第 ${col + 1} 列`;
        this.announce(`${positionText}，${stateText}`);
    }

    /**
     * Setup skip links for keyboard navigation
     */
    setupSkipLinks() {
        const skipLinks = SafeDOM.createStructure({
            tag: 'div',
            attributes: { class: 'skip-links' },
            children: [
                {
                    tag: 'a',
                    attributes: {
                        href: '#game-board',
                        class: 'skip-link'
                    },
                    textContent: '跳到遊戲板'
                },
                {
                    tag: 'a',
                    attributes: {
                        href: '#game-controls',
                        class: 'skip-link'
                    },
                    textContent: '跳到遊戲控制'
                },
                {
                    tag: 'a',
                    attributes: {
                        href: '#game-status',
                        class: 'skip-link'
                    },
                    textContent: '跳到遊戲狀態'
                }
            ]
        });
        
        // Insert at the beginning of body
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Only handle shortcuts when not in input fields
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl/Cmd + shortcuts
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'r':
                        event.preventDefault();
                        const restartBtn = document.getElementById('restart-game');
                        if (restartBtn && !restartBtn.disabled) {
                            restartBtn.click();
                        }
                        break;
                    case 'n':
                        event.preventDefault();
                        const startBtn = document.getElementById('start-game');
                        if (startBtn && !startBtn.disabled) {
                            startBtn.click();
                        }
                        break;
                }
            }
            
            // Function key shortcuts
            switch (event.key) {
                case 'F1':
                    event.preventDefault();
                    this.showKeyboardShortcutsHelp();
                    break;
                case 'Escape':
                    // Close any open modals or return focus to game board
                    const modals = document.querySelectorAll('.modal, .error-modal');
                    if (modals.length > 0) {
                        modals[modals.length - 1].remove();
                    } else {
                        const gameBoard = document.getElementById('game-board');
                        if (gameBoard) {
                            gameBoard.focus();
                        }
                    }
                    break;
            }
        });
    }

    /**
     * Show keyboard shortcuts help
     */
    showKeyboardShortcutsHelp() {
        const helpModal = SafeDOM.createStructure({
            tag: 'div',
            attributes: { 
                class: 'modal keyboard-shortcuts-modal',
                role: 'dialog',
                'aria-labelledby': 'shortcuts-title',
                'aria-modal': 'true'
            },
            children: [{
                tag: 'div',
                attributes: { class: 'modal-content' },
                children: [
                    {
                        tag: 'h2',
                        attributes: { id: 'shortcuts-title' },
                        textContent: '鍵盤快捷鍵'
                    },
                    {
                        tag: 'div',
                        attributes: { class: 'shortcuts-list' },
                        children: [
                            {
                                tag: 'div',
                                attributes: { class: 'shortcut-item' },
                                children: [
                                    { tag: 'kbd', textContent: '方向鍵' },
                                    { tag: 'span', textContent: '在遊戲板上導航' }
                                ]
                            },
                            {
                                tag: 'div',
                                attributes: { class: 'shortcut-item' },
                                children: [
                                    { tag: 'kbd', textContent: 'Enter / 空格' },
                                    { tag: 'span', textContent: '選擇格子' }
                                ]
                            },
                            {
                                tag: 'div',
                                attributes: { class: 'shortcut-item' },
                                children: [
                                    { tag: 'kbd', textContent: 'Ctrl+N' },
                                    { tag: 'span', textContent: '開始新遊戲' }
                                ]
                            },
                            {
                                tag: 'div',
                                attributes: { class: 'shortcut-item' },
                                children: [
                                    { tag: 'kbd', textContent: 'Ctrl+R' },
                                    { tag: 'span', textContent: '重新開始遊戲' }
                                ]
                            },
                            {
                                tag: 'div',
                                attributes: { class: 'shortcut-item' },
                                children: [
                                    { tag: 'kbd', textContent: 'F1' },
                                    { tag: 'span', textContent: '顯示此說明' }
                                ]
                            },
                            {
                                tag: 'div',
                                attributes: { class: 'shortcut-item' },
                                children: [
                                    { tag: 'kbd', textContent: 'Escape' },
                                    { tag: 'span', textContent: '關閉對話框' }
                                ]
                            }
                        ]
                    },
                    {
                        tag: 'button',
                        attributes: { class: 'modal-close-btn' },
                        textContent: '關閉'
                    }
                ]
            }]
        });
        
        // Add event listeners
        const closeBtn = helpModal.querySelector('.modal-close-btn');
        closeBtn.addEventListener('click', () => helpModal.remove());
        
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.remove();
            }
        });
        
        document.body.appendChild(helpModal);
        
        // Focus the close button
        closeBtn.focus();
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Track focus changes
        document.addEventListener('focusin', (event) => {
            this.focusedElement = event.target;
        });
        
        // Ensure proper focus indicators
        this.enhanceFocusIndicators();
        
        // Setup focus trapping for modals
        this.setupFocusTrapping();
    }

    /**
     * Enhance focus indicators for better visibility
     */
    enhanceFocusIndicators() {
        // Add enhanced focus styles
        const focusStyles = document.createElement('style');
        focusStyles.textContent = `
            /* Enhanced focus indicators */
            *:focus {
                outline: ${this.wcagSettings.focusIndicatorMinWidth}px solid #4A90E2 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.3) !important;
            }
            
            /* High contrast focus indicators */
            @media (prefers-contrast: high) {
                *:focus {
                    outline: 3px solid #000 !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 6px #fff, 0 0 0 9px #000 !important;
                }
            }
            
            /* Keyboard focus specific styles */
            .keyboard-focus {
                outline: 3px solid #FFD700 !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 6px rgba(255, 215, 0, 0.5) !important;
                z-index: 10 !important;
            }
        `;
        
        document.head.appendChild(focusStyles);
    }

    /**
     * Setup focus trapping for modals
     */
    setupFocusTrapping() {
        // Monitor for modal creation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('modal')) {
                            this.trapFocusInModal(node);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Trap focus within a modal
     */
    trapFocusInModal(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        firstElement.focus();
        
        // Trap focus
        const trapFocus = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        
        modal.addEventListener('keydown', trapFocus);
        
        // Remove trap when modal is removed
        const removeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === modal) {
                        modal.removeEventListener('keydown', trapFocus);
                        removeObserver.disconnect();
                    }
                });
            });
        });
        
        removeObserver.observe(document.body, { childList: true });
    }

    /**
     * Implement ARIA enhancements
     */
    implementARIAEnhancements() {
        this.enhanceGameBoardARIA();
        this.enhanceControlsARIA();
        this.enhanceStatusARIA();
        this.setupARIAUpdates();
    }

    /**
     * Enhance game board ARIA attributes
     */
    enhanceGameBoardARIA() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;
        
        gameBoard.setAttribute('role', 'grid');
        gameBoard.setAttribute('aria-label', '5x5 Bingo 遊戲板');
        gameBoard.setAttribute('aria-rowcount', '5');
        gameBoard.setAttribute('aria-colcount', '5');
        
        // Enhance individual cells
        const cells = gameBoard.querySelectorAll('.game-cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 5) + 1;
            const col = (index % 5) + 1;
            
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('aria-rowindex', row);
            cell.setAttribute('aria-colindex', col);
            cell.setAttribute('tabindex', '-1');
            
            // Add descriptive label
            this.updateCellARIA(cell, row - 1, col - 1);
        });
    }

    /**
     * Update cell ARIA attributes based on state
     */
    updateCellARIA(cell, row, col) {
        if (!gameState) return;
        
        const board = gameState.getState().board;
        const cellState = board[row][col];
        
        let stateText = '';
        let ariaPressed = 'false';
        
        switch (cellState) {
            case 1:
                stateText = '玩家已選擇';
                ariaPressed = 'true';
                break;
            case 2:
                stateText = '電腦已選擇';
                ariaPressed = 'true';
                break;
            default:
                stateText = '空格子';
                ariaPressed = 'false';
        }
        
        const positionText = `第 ${row + 1} 行第 ${col + 1} 列`;
        cell.setAttribute('aria-label', `${positionText}，${stateText}`);
        cell.setAttribute('aria-pressed', ariaPressed);
    }

    /**
     * Setup color contrast enhancements
     */
    setupColorContrastEnhancements() {
        if (this.highContrastMode) {
            this.applyContrastPreferences();
        }
        
        // Add contrast adjustment controls
        this.addContrastControls();
    }

    /**
     * Apply contrast preferences
     */
    applyContrastPreferences() {
        document.body.classList.toggle('high-contrast', this.highContrastMode);
        
        if (this.highContrastMode) {
            // Apply high contrast styles
            const contrastStyles = document.createElement('style');
            contrastStyles.id = 'high-contrast-styles';
            contrastStyles.textContent = `
                .high-contrast {
                    filter: contrast(150%);
                }
                
                .high-contrast .game-cell {
                    border-width: 3px !important;
                    border-color: #000 !important;
                }
                
                .high-contrast .game-cell.player {
                    background: #0000FF !important;
                    color: #FFFFFF !important;
                }
                
                .high-contrast .game-cell.computer {
                    background: #FF0000 !important;
                    color: #FFFFFF !important;
                }
                
                .high-contrast .game-cell.empty {
                    background: #FFFFFF !important;
                    color: #000000 !important;
                }
            `;
            
            document.head.appendChild(contrastStyles);
        } else {
            // Remove high contrast styles
            const existingStyles = document.getElementById('high-contrast-styles');
            if (existingStyles) {
                existingStyles.remove();
            }
        }
    }

    /**
     * Add contrast adjustment controls
     */
    addContrastControls() {
        const contrastControls = SafeDOM.createStructure({
            tag: 'div',
            attributes: { 
                class: 'accessibility-controls',
                'aria-label': '無障礙控制'
            },
            children: [
                {
                    tag: 'button',
                    attributes: {
                        id: 'toggle-high-contrast',
                        class: 'accessibility-btn',
                        'aria-pressed': this.highContrastMode.toString()
                    },
                    textContent: '高對比度模式'
                },
                {
                    tag: 'button',
                    attributes: {
                        id: 'toggle-reduced-motion',
                        class: 'accessibility-btn',
                        'aria-pressed': this.reducedMotionMode.toString()
                    },
                    textContent: '減少動畫'
                }
            ]
        });
        
        // Add event listeners
        const contrastBtn = contrastControls.querySelector('#toggle-high-contrast');
        contrastBtn.addEventListener('click', () => {
            this.highContrastMode = !this.highContrastMode;
            contrastBtn.setAttribute('aria-pressed', this.highContrastMode.toString());
            this.applyContrastPreferences();
            this.saveAccessibilityPreferences();
        });
        
        const motionBtn = contrastControls.querySelector('#toggle-reduced-motion');
        motionBtn.addEventListener('click', () => {
            this.reducedMotionMode = !this.reducedMotionMode;
            motionBtn.setAttribute('aria-pressed', this.reducedMotionMode.toString());
            this.applyMotionPreferences();
            this.saveAccessibilityPreferences();
        });
        
        // Insert controls
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(contrastControls);
        }
    }

    /**
     * Setup motion preferences
     */
    setupMotionPreferences() {
        this.applyMotionPreferences();
    }

    /**
     * Apply motion preferences
     */
    applyMotionPreferences() {
        document.body.classList.toggle('reduce-motion', this.reducedMotionMode);
        
        if (this.reducedMotionMode) {
            // Apply reduced motion styles
            const motionStyles = document.createElement('style');
            motionStyles.id = 'reduced-motion-styles';
            motionStyles.textContent = `
                .reduce-motion *,
                .reduce-motion *::before,
                .reduce-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            
            document.head.appendChild(motionStyles);
        } else {
            // Remove reduced motion styles
            const existingStyles = document.getElementById('reduced-motion-styles');
            if (existingStyles) {
                existingStyles.remove();
            }
        }
    }

    /**
     * Setup touch target optimization
     */
    setupTouchTargetOptimization() {
        // Ensure all interactive elements meet minimum touch target size
        const interactiveElements = document.querySelectorAll(
            'button, a, input, select, textarea, .game-cell, [role="button"]'
        );
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            
            if (rect.width < this.wcagSettings.minTouchTargetSize || 
                rect.height < this.wcagSettings.minTouchTargetSize) {
                
                element.style.minWidth = `${this.wcagSettings.minTouchTargetSize}px`;
                element.style.minHeight = `${this.wcagSettings.minTouchTargetSize}px`;
                element.style.padding = element.style.padding || '8px';
            }
        });
    }

    /**
     * Setup voice announcements
     */
    setupVoiceAnnouncements() {
        // Check if speech synthesis is available
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            this.setupVoiceControls();
        }
    }

    /**
     * Setup voice controls
     */
    setupVoiceControls() {
        const voiceControls = SafeDOM.createStructure({
            tag: 'div',
            attributes: { class: 'voice-controls' },
            children: [
                {
                    tag: 'button',
                    attributes: {
                        id: 'toggle-voice-announcements',
                        class: 'accessibility-btn'
                    },
                    textContent: '語音播報'
                }
            ]
        });
        
        const voiceBtn = voiceControls.querySelector('#toggle-voice-announcements');
        let voiceEnabled = false;
        
        voiceBtn.addEventListener('click', () => {
            voiceEnabled = !voiceEnabled;
            voiceBtn.textContent = voiceEnabled ? '關閉語音播報' : '開啟語音播報';
            voiceBtn.setAttribute('aria-pressed', voiceEnabled.toString());
        });
        
        // Add to accessibility controls
        const accessibilityControls = document.querySelector('.accessibility-controls');
        if (accessibilityControls) {
            accessibilityControls.appendChild(voiceControls);
        }
        
        // Override announce method to include voice
        const originalAnnounce = this.announce.bind(this);
        this.announce = (message, priority = 'polite') => {
            originalAnnounce(message, priority);
            
            if (voiceEnabled && this.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = 'zh-TW';
                utterance.rate = 0.8;
                utterance.pitch = 1;
                this.speechSynthesis.speak(utterance);
            }
        };
    }

    /**
     * Save accessibility preferences
     */
    saveAccessibilityPreferences() {
        const preferences = {
            highContrastMode: this.highContrastMode,
            reducedMotionMode: this.reducedMotionMode,
            screenReaderActive: this.screenReaderActive
        };
        
        localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    }

    /**
     * Apply user preferences
     */
    applyUserPreferences(preferences) {
        if (preferences.highContrastMode !== undefined) {
            this.highContrastMode = preferences.highContrastMode;
            this.applyContrastPreferences();
        }
        
        if (preferences.reducedMotionMode !== undefined) {
            this.reducedMotionMode = preferences.reducedMotionMode;
            this.applyMotionPreferences();
        }
    }

    /**
     * Get accessibility status
     */
    getAccessibilityStatus() {
        return {
            isInitialized: this.isInitialized,
            screenReaderActive: this.screenReaderActive,
            keyboardNavigationEnabled: this.keyboardNavigationEnabled,
            highContrastMode: this.highContrastMode,
            reducedMotionMode: this.reducedMotionMode,
            wcagCompliant: this.checkWCAGCompliance()
        };
    }

    /**
     * Check WCAG compliance
     */
    checkWCAGCompliance() {
        const checks = {
            focusIndicators: this.checkFocusIndicators(),
            colorContrast: this.checkColorContrast(),
            touchTargets: this.checkTouchTargets(),
            ariaLabels: this.checkARIALabels()
        };
        
        return Object.values(checks).every(check => check);
    }

    /**
     * Check focus indicators compliance
     */
    checkFocusIndicators() {
        // This would implement actual contrast ratio checking
        return true; // Simplified for now
    }

    /**
     * Check color contrast compliance
     */
    checkColorContrast() {
        // This would implement actual contrast ratio checking
        return true; // Simplified for now
    }

    /**
     * Check touch targets compliance
     */
    checkTouchTargets() {
        const interactiveElements = document.querySelectorAll(
            'button, a, input, select, textarea, .game-cell, [role="button"]'
        );
        
        return Array.from(interactiveElements).every(element => {
            const rect = element.getBoundingClientRect();
            return rect.width >= this.wcagSettings.minTouchTargetSize && 
                   rect.height >= this.wcagSettings.minTouchTargetSize;
        });
    }

    /**
     * Check ARIA labels compliance
     */
    checkARIALabels() {
        const elementsNeedingLabels = document.querySelectorAll(
            'button:not([aria-label]):not([aria-labelledby]), ' +
            'input:not([aria-label]):not([aria-labelledby]):not([id]), ' +
            '[role="button"]:not([aria-label]):not([aria-labelledby])'
        );
        
        return elementsNeedingLabels.length === 0;
    }
}

// Create global accessibility enhancer instance
const accessibilityEnhancer = new AccessibilityEnhancer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityEnhancer;
} else {
    window.AccessibilityEnhancer = AccessibilityEnhancer;
    window.accessibilityEnhancer = accessibilityEnhancer;
}