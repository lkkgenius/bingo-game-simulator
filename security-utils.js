/**
 * Security Utilities for Bingo Game Simulator
 * 實作輸入驗證和清理，防止潛在的安全問題
 */

/**
 * 輸入驗證和清理工具類
 */
class SecurityUtils {
  /**
     * 清理和驗證用戶輸入
     * @param {any} input - 用戶輸入
     * @param {string} type - 輸入類型 ('number', 'string', 'coordinate', 'boolean')
     * @param {Object} options - 驗證選項
     * @returns {any} 清理後的輸入
     */
  static sanitizeInput(input, type, options = {}) {
    if (input === null || input === undefined) {
      if (options.required) {
        throw new SecurityError('Required input is missing', 'MISSING_INPUT');
      }
      return options.defaultValue || null;
    }

    switch (type) {
    case 'number':
      return this.sanitizeNumber(input, options);
    case 'string':
      return this.sanitizeString(input, options);
    case 'coordinate':
      return this.sanitizeCoordinate(input, options);
    case 'boolean':
      return this.sanitizeBoolean(input);
    case 'array':
      return this.sanitizeArray(input, options);
    case 'object':
      return this.sanitizeObject(input, options);
    default:
      throw new SecurityError(`Unknown input type: ${type}`, 'INVALID_TYPE');
    }
  }

  /**
     * 清理數字輸入
     */
  static sanitizeNumber(input, options = {}) {
    const num = Number(input);

    if (isNaN(num) || !isFinite(num)) {
      throw new SecurityError('Invalid number input', 'INVALID_NUMBER');
    }

    if (options.min !== undefined && num < options.min) {
      throw new SecurityError(`Number ${num} is below minimum ${options.min}`, 'NUMBER_TOO_SMALL');
    }

    if (options.max !== undefined && num > options.max) {
      throw new SecurityError(`Number ${num} is above maximum ${options.max}`, 'NUMBER_TOO_LARGE');
    }

    if (options.integer && !Number.isInteger(num)) {
      throw new SecurityError('Number must be an integer', 'NOT_INTEGER');
    }

    return num;
  }

  /**
     * 清理字符串輸入
     */
  static sanitizeString(input, options = {}) {
    let str = String(input);

    // 移除潛在的 HTML 標籤
    str = str.replace(/<[^>]*>/g, '');

    // 移除潛在的腳本內容 - 使用安全的協議檢查
    str = this.removeUnsafeProtocols(str);

    // 轉義特殊字符
    str = str.replace(/[<>&"']/g, (match) => {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        '\'': '&#x27;'
      };
      return escapeMap[match];
    });

    if (options.maxLength && str.length > options.maxLength) {
      throw new SecurityError(`String length ${str.length} exceeds maximum ${options.maxLength}`, 'STRING_TOO_LONG');
    }

    if (options.minLength && str.length < options.minLength) {
      throw new SecurityError(`String length ${str.length} is below minimum ${options.minLength}`, 'STRING_TOO_SHORT');
    }

    if (options.pattern && !options.pattern.test(str)) {
      throw new SecurityError('String does not match required pattern', 'PATTERN_MISMATCH');
    }

    return str;
  }

  /**
     * 清理座標輸入
     */
  static sanitizeCoordinate(input, options = {}) {
    const coord = this.sanitizeNumber(input, {
      integer: true,
      min: options.min || 0,
      max: options.max || 4
    });

    return coord;
  }

  /**
     * 清理布爾值輸入
     */
  static sanitizeBoolean(input) {
    if (typeof input === 'boolean') {
      return input;
    }

    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') {
        return true;
      }
      if (lower === 'false' || lower === '0' || lower === 'no') {
        return false;
      }
    }

    if (typeof input === 'number') {
      return Boolean(input);
    }

    throw new SecurityError('Invalid boolean input', 'INVALID_BOOLEAN');
  }

  /**
     * 清理陣列輸入
     */
  static sanitizeArray(input, options = {}) {
    if (!Array.isArray(input)) {
      throw new SecurityError('Input is not an array', 'NOT_ARRAY');
    }

    if (options.maxLength && input.length > options.maxLength) {
      throw new SecurityError(`Array length ${input.length} exceeds maximum ${options.maxLength}`, 'ARRAY_TOO_LONG');
    }

    if (options.itemType) {
      return input.map(item => this.sanitizeInput(item, options.itemType, options.itemOptions || {}));
    }

    return input;
  }

  /**
     * 清理物件輸入
     */
  static sanitizeObject(input, options = {}) {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new SecurityError('Input is not a valid object', 'NOT_OBJECT');
    }

    const sanitized = {};
    const allowedKeys = options.allowedKeys || Object.keys(input);

    for (const key of allowedKeys) {
      if (input.hasOwnProperty(key)) {
        const keyOptions = options.keyOptions && options.keyOptions[key];
        if (keyOptions) {
          sanitized[key] = this.sanitizeInput(input[key], keyOptions.type, keyOptions);
        } else {
          sanitized[key] = input[key];
        }
      }
    }

    return sanitized;
  }

  /**
     * 驗證遊戲座標
     */
  static validateGameCoordinate(row, col) {
    try {
      const sanitizedRow = this.sanitizeCoordinate(row, { min: 0, max: 4 });
      const sanitizedCol = this.sanitizeCoordinate(col, { min: 0, max: 4 });
      return { row: sanitizedRow, col: sanitizedCol };
    } catch (error) {
      throw new SecurityError(`Invalid game coordinate (${row}, ${col}): ${error.message}`, 'INVALID_COORDINATE');
    }
  }

  /**
     * 驗證遊戲狀態
     */
  static validateGameState(gameState) {
    if (!gameState || typeof gameState !== 'object') {
      throw new SecurityError('Invalid game state', 'INVALID_GAME_STATE');
    }

    const requiredFields = ['board', 'currentRound', 'gamePhase'];
    for (const field of requiredFields) {
      if (!(field in gameState)) {
        throw new SecurityError(`Missing required field: ${field}`, 'MISSING_FIELD');
      }
    }

    // 驗證遊戲板
    if (!Array.isArray(gameState.board) || gameState.board.length !== 5) {
      throw new SecurityError('Invalid game board structure', 'INVALID_BOARD');
    }

    for (let i = 0; i < 5; i++) {
      if (!Array.isArray(gameState.board[i]) || gameState.board[i].length !== 5) {
        throw new SecurityError(`Invalid board row ${i}`, 'INVALID_BOARD_ROW');
      }

      for (let j = 0; j < 5; j++) {
        const cell = gameState.board[i][j];
        if (![0, 1, 2].includes(cell)) {
          throw new SecurityError(`Invalid cell value at (${i}, ${j}): ${cell}`, 'INVALID_CELL_VALUE');
        }
      }
    }

    // 驗證回合數
    this.sanitizeNumber(gameState.currentRound, { min: 1, max: 8, integer: true });

    // 驗證遊戲階段
    const validPhases = ['waiting-start', 'player-turn', 'computer-input', 'game-over'];
    if (!validPhases.includes(gameState.gamePhase)) {
      throw new SecurityError(`Invalid game phase: ${gameState.gamePhase}`, 'INVALID_GAME_PHASE');
    }

    return true;
  }

  /**
     * 防止 XSS 攻擊的 HTML 清理
     */
  static sanitizeHTML(html) {
    if (typeof html !== 'string') {
      return '';
    }

    // 移除所有 HTML 標籤
    return html.replace(/<[^>]*>/g, '');
  }

  /**
     * 移除不安全的協議
     */
  static removeUnsafeProtocols(str) {
    if (typeof str !== 'string') {
      return '';
    }

    // 移除危險的協議
    const unsafeProtocols = [
      /^javascript:/gi,
      /^vbscript:/gi,
      /^data:/gi,
      /^file:/gi,
      /^about:/gi
    ];

    let cleanStr = str;
    unsafeProtocols.forEach(protocol => {
      cleanStr = cleanStr.replace(protocol, '');
    });

    return cleanStr;
  }

  /**
     * 安全的 JSON 解析
     */
  static safeJSONParse(jsonString, defaultValue = null) {
    try {
      if (typeof jsonString !== 'string') {
        return defaultValue;
      }

      // 檢查是否包含潛在的危險內容
      if (jsonString.includes('__proto__') ||
                jsonString.includes('constructor') ||
                jsonString.includes('prototype')) {
        throw new SecurityError('Potentially dangerous JSON content', 'DANGEROUS_JSON');
      }

      const parsed = JSON.parse(jsonString);

      // 防止原型污染
      if (parsed && typeof parsed === 'object') {
        delete parsed.__proto__;
        delete parsed.constructor;
        delete parsed.prototype;
      }

      return parsed;
    } catch (error) {
      console.warn('JSON parsing failed:', error.message);
      return defaultValue;
    }
  }

  /**
     * 生成安全的隨機 ID
     */
  static generateSecureId(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
     * 檢查 URL 是否安全
     */
  static isSecureURL(url) {
    try {
      const urlObj = new URL(url);

      // 只允許 HTTP 和 HTTPS 協議
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // 檢查是否為本地主機（在生產環境中可能不安全）
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return process.env.NODE_ENV === 'development';
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
     * 速率限制檢查
     */
  static createRateLimiter(maxRequests = 100, windowMs = 60000) {
    const requests = new Map();

    return function rateLimiter(identifier) {
      const now = Date.now();
      const windowStart = now - windowMs;

      // 清理過期的請求記錄
      for (const [id, timestamps] of requests.entries()) {
        const validTimestamps = timestamps.filter(ts => ts > windowStart);
        if (validTimestamps.length === 0) {
          requests.delete(id);
        } else {
          requests.set(id, validTimestamps);
        }
      }

      // 檢查當前標識符的請求次數
      const userRequests = requests.get(identifier) || [];
      if (userRequests.length >= maxRequests) {
        throw new SecurityError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
      }

      // 記錄新請求
      userRequests.push(now);
      requests.set(identifier, userRequests);

      return true;
    };
  }
}

/**
 * 安全錯誤類
 */
class SecurityError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

// 創建全局速率限制器
const globalRateLimiter = SecurityUtils.createRateLimiter(1000, 60000); // 每分鐘最多 1000 次請求

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecurityUtils, SecurityError };
} else {
  window.SecurityUtils = SecurityUtils;
  window.SecurityError = SecurityError;
}
