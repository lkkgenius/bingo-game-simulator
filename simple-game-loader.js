/**
 * 簡化的遊戲載入器
 * 直接載入必要的組件，避免複雜的依賴管理
 */

class SimpleGameLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.isLoading = false;
  }

  async loadScript(src) {
    if (this.loadedScripts.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        this.loadedScripts.add(src);
        document.head.removeChild(script);
        resolve();
      };

      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  async loadGameComponents() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      // 載入核心組件（按順序）
      const coreScripts = [
        'safe-dom.js',
        'production-logger.js',
        'utils/baseProbabilityCalculator.js',
        'lineDetector.js',
        'probabilityCalculator.js',
        'gameBoard.js',
        'gameEngine.js',
        'script.js'
      ];

      for (const script of coreScripts) {
        try {
          await this.loadScript(script);
          console.log(`✅ Loaded: ${script}`);
        } catch (error) {
          console.warn(`⚠️ Failed to load ${script}:`, error.message);
        }
      }

      // 載入增強功能（可選）
      const enhancedScripts = [
        'probabilityCalculator.enhanced.js',
        'i18n.js',
        'accessibility-enhancements.js'
      ];

      for (const script of enhancedScripts) {
        try {
          await this.loadScript(script);
          console.log(`✅ Enhanced: ${script}`);
        } catch (error) {
          console.warn(`⚠️ Optional script failed ${script}:`, error.message);
        }
      }

      console.log('🎮 Game components loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to load game components:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  }
}

// 創建全局實例
window.simpleGameLoader = new SimpleGameLoader();