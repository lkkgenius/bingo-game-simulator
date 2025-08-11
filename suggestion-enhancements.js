/**
 * Enhanced Suggestion Display System
 * Provides improved visual feedback for move suggestions with confidence indicators
 */

class SuggestionEnhancer {
  constructor() {
    this.currentSuggestion = null;
    this.alternativeSuggestions = [];
    this.confidenceLevels = {
      'very-high': { min: 0.8, color: '#4CAF50', label: '極高信心' },
      'high': { min: 0.6, color: '#2196F3', label: '高信心' },
      'medium': { min: 0.4, color: '#FF9800', label: '中等信心' },
      'low': { min: 0.2, color: '#F44336', label: '低信心' },
      'very-low': { min: 0, color: '#9E9E9E', label: '極低信心' }
    };
    this.animationDuration = 1500;
    this.isInitialized = false;

    this.init();
  }

  /**
     * 初始化建議增強系統
     */
  init() {
    if (this.isInitialized) return;

    try {
      this.setupSuggestionStyles();
      this.setupSuggestionContainer();
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('Suggestion enhancer initialized');
    } catch (error) {
      console.error('Failed to initialize suggestion enhancer:', error);
    }
  }

  /**
     * 設置建議樣式
     */
  setupSuggestionStyles() {
    const styles = document.createElement('style');
    styles.id = 'suggestion-enhancement-styles';
    styles.textContent = `
            /* 增強的建議顯示容器 */
            .enhanced-suggestion-container {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(0, 0, 0, 0.05);
                position: relative;
                overflow: hidden;
            }

            .enhanced-suggestion-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #4CAF50, #2196F3, #FF9800, #F44336);
                background-size: 400% 100%;
                animation: gradientShift 3s ease-in-out infinite;
            }

            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }

            /* 主要建議區域 */
            .primary-suggestion {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 20px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 12px;
                border-left: 4px solid #4CAF50;
                transition: all 0.3s ease;
            }

            .primary-suggestion:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }

            .suggestion-icon {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .suggestion-content {
                flex: 1;
            }

            .suggestion-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .suggestion-description {
                color: #5a6c7d;
                font-size: 0.95rem;
                line-height: 1.4;
                margin-bottom: 12px;
            }

            /* 信心度指示器 */
            .confidence-indicator {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
                overflow: hidden;
            }

            .confidence-indicator::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: shimmer 2s infinite;
            }

            .confidence-very-high {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
            }

            .confidence-high {
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
            }

            .confidence-medium {
                background: linear-gradient(135deg, #FF9800, #F57C00);
                color: white;
                box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
            }

            .confidence-low {
                background: linear-gradient(135deg, #F44336, #D32F2F);
                color: white;
                box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
            }

            .confidence-very-low {
                background: linear-gradient(135deg, #9E9E9E, #757575);
                color: white;
                box-shadow: 0 2px 8px rgba(158, 158, 158, 0.3);
            }

            /* 數值顯示 */
            .suggestion-metrics {
                display: flex;
                gap: 16px;
                margin-top: 12px;
            }

            .metric-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 8px;
                min-width: 80px;
            }

            .metric-label {
                font-size: 0.75rem;
                color: #6c757d;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }

            .metric-value {
                font-size: 1.1rem;
                font-weight: 700;
                color: #2c3e50;
            }

            /* 替代建議 */
            .alternative-suggestions {
                margin-top: 24px;
            }

            .alternatives-title {
                font-size: 1rem;
                font-weight: 600;
                color: #495057;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .alternatives-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }

            .alternative-item {
                padding: 12px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 8px;
                border: 1px solid rgba(0, 0, 0, 0.05);
                transition: all 0.2s ease;
                cursor: pointer;
            }

            .alternative-item:hover {
                background: rgba(255, 255, 255, 0.9);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .alternative-rank {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #6c757d;
                color: white;
                font-size: 0.75rem;
                font-weight: 600;
                margin-right: 8px;
            }

            .alternative-position {
                font-weight: 600;
                color: #2c3e50;
            }

            .alternative-value {
                font-size: 0.85rem;
                color: #6c757d;
                margin-top: 4px;
            }

            /* 動畫效果 */
            .suggestion-appear {
                animation: suggestionAppear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            @keyframes suggestionAppear {
                0% {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            /* 響應式設計 */
            @media (max-width: 768px) {
                .enhanced-suggestion-container {
                    padding: 16px;
                    margin-bottom: 16px;
                }

                .primary-suggestion {
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                }

                .suggestion-metrics {
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .alternatives-list {
                    grid-template-columns: 1fr;
                }
            }

            /* 減少動畫偏好 */
            @media (prefers-reduced-motion: reduce) {
                .suggestion-icon,
                .confidence-indicator::before,
                .enhanced-suggestion-container::before {
                    animation: none;
                }

                .suggestion-appear {
                    animation: none;
                }
            }

            /* 高對比度模式 */
            @media (prefers-contrast: high) {
                .enhanced-suggestion-container {
                    border: 2px solid #000;
                    background: #fff;
                }

                .primary-suggestion {
                    border: 1px solid #000;
                    background: #f8f9fa;
                }

                .confidence-indicator {
                    border: 1px solid #000;
                }
            }
        `;

    if (!document.getElementById('suggestion-enhancement-styles')) {
      document.head.appendChild(styles);
    }
  }

  /**
     * 設置建議容器
     */
  setupSuggestionContainer() {
    const suggestionArea = document.querySelector('.suggestion-area');
    if (!suggestionArea) return;

    // 檢查是否已經有增強容器
    if (suggestionArea.querySelector('.enhanced-suggestion-container')) {
      return;
    }

    // 創建增強的建議容器
    const enhancedContainer = SafeDOM.createStructure({
      tag: 'div',
      attributes: {
        class: 'enhanced-suggestion-container',
        style: 'display: none;'
      },
      children: [{
        tag: 'div',
        attributes: { class: 'primary-suggestion' },
        children: [
          {
            tag: 'div',
            attributes: {
              class: 'suggestion-icon',
              'aria-hidden': 'true'
            },
            textContent: '🎯'
          },
          {
            tag: 'div',
            attributes: { class: 'suggestion-content' },
            children: [
              {
                tag: 'div',
                attributes: { class: 'suggestion-title' },
                textContent: '建議移動'
              },
              {
                tag: 'div',
                attributes: { class: 'suggestion-description' },
                textContent: '點擊開始遊戲獲得建議'
              },
              {
                tag: 'div',
                attributes: { class: 'suggestion-metrics' }
              }
            ]
          }
        ]
      }]
    });

    // 添加替代建議區域
    const alternativesSection = SafeDOM.createStructure({
      tag: 'div',
      attributes: { class: 'alternative-suggestions' },
      children: [
        {
          tag: 'div',
          attributes: { class: 'alternatives-title' },
          children: [
            {
              tag: 'span',
              textContent: '其他選擇'
            },
            {
              tag: 'span',
              attributes: {
                class: 'alternatives-icon',
                'aria-hidden': 'true'
              },
              textContent: '📋'
            }
          ]
        },
        {
          tag: 'div',
          attributes: { class: 'alternatives-list' }
        }
      ]
    });

    enhancedContainer.appendChild(alternativesSection);
    suggestionArea.appendChild(enhancedContainer);
  }

  /**
     * 設置事件監聽器
     */
  setupEventListeners() {
    // 監聽建議更新事件
    document.addEventListener('suggestionUpdated', (event) => {
      const { suggestion, alternatives } = event.detail;
      this.displayEnhancedSuggestion(suggestion, alternatives);
    });

    // 監聽遊戲狀態變化
    document.addEventListener('gameStateChanged', (event) => {
      const { phase } = event.detail;
      if (phase !== 'player-turn') {
        this.hideSuggestion();
      }
    });
  }

  /**
     * 顯示增強的建議
     */
  displayEnhancedSuggestion(suggestion, alternatives = []) {
    if (!suggestion) return;

    this.currentSuggestion = suggestion;
    this.alternativeSuggestions = alternatives;

    const container = document.querySelector('.enhanced-suggestion-container');
    if (!container) return;

    // 更新主要建議
    this.updatePrimarySuggestion(container, suggestion);

    // 更新替代建議
    this.updateAlternativeSuggestions(container, alternatives);

    // 顯示容器
    container.style.display = 'block';
    container.classList.add('suggestion-appear');

    // 隱藏原始建議顯示
    const originalDisplay = document.querySelector('.suggestion-display');
    if (originalDisplay) {
      originalDisplay.style.display = 'none';
    }

    // 無障礙支持
    this.announceNewSuggestion(suggestion);
  }

  /**
     * 更新主要建議
     */
  updatePrimarySuggestion(container, suggestion) {
    const { row, col, value, confidence, reasoning } = suggestion;

    // 更新標題和描述
    const title = container.querySelector('.suggestion-title');
    const description = container.querySelector('.suggestion-description');

    if (title) {
      const positionText = typeof i18n !== 'undefined' ?
        i18n.formatPosition(row, col) :
        `第 ${row + 1} 行第 ${col + 1} 列`;

      title.innerHTML = `
                建議移動：${positionText}
                ${this.createConfidenceIndicator(confidence)}
            `;
    }

    if (description) {
      description.textContent = reasoning || '這是當前最佳的移動選擇';
    }

    // 更新指標
    this.updateSuggestionMetrics(container, suggestion);

    // 更新邊框顏色
    const primarySuggestion = container.querySelector('.primary-suggestion');
    if (primarySuggestion) {
      const confidenceLevel = this.getConfidenceLevel(confidence);
      const color = this.confidenceLevels[confidenceLevel].color;
      primarySuggestion.style.borderLeftColor = color;
    }
  }

  /**
     * 創建信心度指示器
     */
  createConfidenceIndicator(confidence) {
    const level = this.getConfidenceLevel(confidence);
    const config = this.confidenceLevels[level];

    return `<span class="confidence-indicator confidence-${level}" 
                      title="信心度: ${(confidence * 100).toFixed(1)}%">
                    <span class="confidence-icon">●</span>
                    ${config.label}
                </span>`;
  }

  /**
     * 獲取信心度等級
     */
  getConfidenceLevel(confidence) {
    for (const [level, config] of Object.entries(this.confidenceLevels)) {
      if (confidence >= config.min) {
        return level;
      }
    }
    return 'very-low';
  }

  /**
     * 更新建議指標
     */
  updateSuggestionMetrics(container, suggestion) {
    const metricsContainer = container.querySelector('.suggestion-metrics');
    if (!metricsContainer) return;

    const { value, confidence, expectedLines, riskLevel } = suggestion;

    const metrics = [
      {
        label: '預期價值',
        value: value ? value.toFixed(1) : 'N/A',
        color: '#4CAF50'
      },
      {
        label: '信心度',
        value: confidence ? `${(confidence * 100).toFixed(0)}%` : 'N/A',
        color: '#2196F3'
      }
    ];

    if (expectedLines !== undefined) {
      metrics.push({
        label: '預期連線',
        value: expectedLines.toFixed(1),
        color: '#FF9800'
      });
    }

    if (riskLevel !== undefined) {
      metrics.push({
        label: '風險等級',
        value: this.getRiskLevelText(riskLevel),
        color: '#F44336'
      });
    }

    // 清空並重新創建指標
    metricsContainer.innerHTML = '';

    metrics.forEach(metric => {
      const metricElement = SafeDOM.createStructure({
        tag: 'div',
        attributes: { class: 'metric-item' },
        children: [
          {
            tag: 'div',
            attributes: { class: 'metric-label' },
            textContent: metric.label
          },
          {
            tag: 'div',
            attributes: {
              class: 'metric-value',
              style: `color: ${metric.color}`
            },
            textContent: metric.value
          }
        ]
      });

      metricsContainer.appendChild(metricElement);
    });
  }

  /**
     * 獲取風險等級文字
     */
  getRiskLevelText(riskLevel) {
    const levels = {
      0: '極低',
      1: '低',
      2: '中',
      3: '高',
      4: '極高'
    };
    return levels[riskLevel] || '未知';
  }

  /**
     * 更新替代建議
     */
  updateAlternativeSuggestions(container, alternatives) {
    const alternativesList = container.querySelector('.alternatives-list');
    const alternativesSection = container.querySelector('.alternative-suggestions');

    if (!alternativesList || !alternativesSection) return;

    // 如果沒有替代建議，隱藏整個區域
    if (!alternatives || alternatives.length === 0) {
      alternativesSection.style.display = 'none';
      return;
    }

    alternativesSection.style.display = 'block';
    alternativesList.innerHTML = '';

    alternatives.slice(0, 4).forEach((alt, index) => {
      const { row, col, value, confidence } = alt;

      const positionText = typeof i18n !== 'undefined' ?
        i18n.formatPosition(row, col) :
        `第 ${row + 1} 行第 ${col + 1} 列`;

      const altElement = SafeDOM.createStructure({
        tag: 'div',
        attributes: {
          class: 'alternative-item',
          'data-row': row,
          'data-col': col,
          role: 'button',
          tabindex: '0',
          'aria-label': `替代建議 ${index + 2}: ${positionText}`
        },
        children: [
          {
            tag: 'div',
            children: [
              {
                tag: 'span',
                attributes: { class: 'alternative-rank' },
                textContent: (index + 2).toString()
              },
              {
                tag: 'span',
                attributes: { class: 'alternative-position' },
                textContent: positionText
              }
            ]
          },
          {
            tag: 'div',
            attributes: { class: 'alternative-value' },
            textContent: `價值: ${value ? value.toFixed(1) : 'N/A'} | 信心: ${confidence ? (confidence * 100).toFixed(0) + '%' : 'N/A'}`
          }
        ]
      });

      // 添加點擊事件
      altElement.addEventListener('click', () => {
        this.selectAlternativeSuggestion(alt);
      });

      // 添加鍵盤支持
      altElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.selectAlternativeSuggestion(alt);
        }
      });

      alternativesList.appendChild(altElement);
    });
  }

  /**
     * 選擇替代建議
     */
  selectAlternativeSuggestion(suggestion) {
    // 觸發建議選擇事件
    const event = new CustomEvent('suggestionSelected', {
      detail: { suggestion }
    });
    document.dispatchEvent(event);

    // 如果有點擊處理器，調用它
    if (typeof handleCellClick === 'function') {
      handleCellClick(suggestion.row, suggestion.col);
    }
  }

  /**
     * 隱藏建議
     */
  hideSuggestion() {
    const container = document.querySelector('.enhanced-suggestion-container');
    if (container) {
      container.style.display = 'none';
    }

    // 顯示原始建議顯示
    const originalDisplay = document.querySelector('.suggestion-display');
    if (originalDisplay) {
      originalDisplay.style.display = 'block';
    }
  }

  /**
     * 宣告新建議（無障礙支持）
     */
  announceNewSuggestion(suggestion) {
    if (!window.accessibilityEnhancer) return;

    const { row, col, confidence } = suggestion;
    const positionText = typeof i18n !== 'undefined' ?
      i18n.formatPosition(row, col) :
      `第 ${row + 1} 行第 ${col + 1} 列`;

    const confidenceLevel = this.getConfidenceLevel(confidence);
    const confidenceText = this.confidenceLevels[confidenceLevel].label;

    const message = `建議移動：${positionText}，${confidenceText}`;
    window.accessibilityEnhancer.announce(message);
  }

  /**
     * 獲取當前建議
     */
  getCurrentSuggestion() {
    return this.currentSuggestion;
  }

  /**
     * 獲取替代建議
     */
  getAlternativeSuggestions() {
    return this.alternativeSuggestions;
  }

  /**
     * 清除建議
     */
  clearSuggestions() {
    this.currentSuggestion = null;
    this.alternativeSuggestions = [];
    this.hideSuggestion();
  }
}

// 創建全局建議增強器實例
const suggestionEnhancer = new SuggestionEnhancer();

// 導出供其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SuggestionEnhancer;
} else {
  window.SuggestionEnhancer = SuggestionEnhancer;
  window.suggestionEnhancer = suggestionEnhancer;
}
