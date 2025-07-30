/**
 * Safe DOM Manipulation Utilities
 * 提供安全的 DOM 操作方法，防止 XSS 攻擊
 */

class SafeDOM {
    /**
     * 安全地設置元素的文本內容
     * @param {HTMLElement} element - 目標元素
     * @param {string} text - 文本內容
     */
    static setTextContent(element, text) {
        if (!element || typeof text !== 'string') {
            return;
        }
        element.textContent = text;
    }

    /**
     * 安全地創建元素並設置屬性
     * @param {string} tagName - 標籤名
     * @param {Object} attributes - 屬性對象
     * @param {string} textContent - 文本內容
     * @returns {HTMLElement} 創建的元素
     */
    static createElement(tagName, attributes = {}, textContent = '') {
        const element = document.createElement(tagName);
        
        // 設置安全的屬性
        Object.entries(attributes).forEach(([key, value]) => {
            if (this.isSafeAttribute(key, value)) {
                element.setAttribute(key, value);
            }
        });

        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    }

    /**
     * 安全地清空元素內容
     * @param {HTMLElement} element - 目標元素
     */
    static clearContent(element) {
        if (!element) return;
        
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * 安全地添加 CSS 類
     * @param {HTMLElement} element - 目標元素
     * @param {string|Array} classNames - 類名
     */
    static addClass(element, classNames) {
        if (!element) return;
        
        const classes = Array.isArray(classNames) ? classNames : [classNames];
        classes.forEach(className => {
            if (typeof className === 'string' && this.isSafeClassName(className)) {
                element.classList.add(className);
            }
        });
    }

    /**
     * 安全地移除 CSS 類
     * @param {HTMLElement} element - 目標元素
     * @param {string|Array} classNames - 類名
     */
    static removeClass(element, classNames) {
        if (!element) return;
        
        const classes = Array.isArray(classNames) ? classNames : [classNames];
        classes.forEach(className => {
            if (typeof className === 'string') {
                element.classList.remove(className);
            }
        });
    }

    /**
     * 安全地設置元素樣式
     * @param {HTMLElement} element - 目標元素
     * @param {Object} styles - 樣式對象
     */
    static setStyles(element, styles) {
        if (!element || typeof styles !== 'object') return;
        
        Object.entries(styles).forEach(([property, value]) => {
            if (this.isSafeStyleProperty(property, value)) {
                element.style[property] = value;
            }
        });
    }

    /**
     * 創建安全的 HTML 結構
     * @param {Object} structure - HTML 結構描述
     * @returns {HTMLElement} 創建的元素
     */
    static createStructure(structure) {
        const { tag, attributes = {}, children = [], textContent = '' } = structure;
        
        const element = this.createElement(tag, attributes, textContent);
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (typeof child === 'object') {
                element.appendChild(this.createStructure(child));
            }
        });
        
        return element;
    }

    /**
     * 安全地替換元素內容
     * @param {HTMLElement} element - 目標元素
     * @param {Object|Array} content - 內容結構
     */
    static replaceContent(element, content) {
        if (!element) return;
        
        this.clearContent(element);
        
        if (Array.isArray(content)) {
            content.forEach(item => {
                if (typeof item === 'string') {
                    element.appendChild(document.createTextNode(item));
                } else if (typeof item === 'object') {
                    element.appendChild(this.createStructure(item));
                }
            });
        } else if (typeof content === 'object') {
            element.appendChild(this.createStructure(content));
        } else if (typeof content === 'string') {
            element.textContent = content;
        }
    }

    /**
     * 檢查屬性是否安全
     * @param {string} key - 屬性名
     * @param {string} value - 屬性值
     * @returns {boolean} 是否安全
     */
    static isSafeAttribute(key, value) {
        // 禁止的屬性
        const forbiddenAttributes = [
            'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
            'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset'
        ];
        
        if (forbiddenAttributes.includes(key.toLowerCase())) {
            return false;
        }
        
        // 檢查值是否包含危險內容
        if (typeof value === 'string') {
            const dangerousPatterns = [
                /javascript:/i,
                /vbscript:/i,
                /data:/i,
                /on\w+\s*=/i
            ];
            
            return !dangerousPatterns.some(pattern => pattern.test(value));
        }
        
        return true;
    }

    /**
     * 檢查類名是否安全
     * @param {string} className - 類名
     * @returns {boolean} 是否安全
     */
    static isSafeClassName(className) {
        // 只允許字母、數字、連字符和下劃線
        return /^[a-zA-Z0-9_-]+$/.test(className);
    }

    /**
     * 檢查樣式屬性是否安全
     * @param {string} property - 屬性名
     * @param {string} value - 屬性值
     * @returns {boolean} 是否安全
     */
    static isSafeStyleProperty(property, value) {
        // 禁止的樣式屬性
        const forbiddenProperties = [
            'behavior', 'binding', 'expression'
        ];
        
        if (forbiddenProperties.includes(property.toLowerCase())) {
            return false;
        }
        
        // 檢查值是否包含危險內容
        if (typeof value === 'string') {
            const dangerousPatterns = [
                /javascript:/i,
                /vbscript:/i,
                /expression\s*\(/i,
                /url\s*\(\s*javascript:/i
            ];
            
            return !dangerousPatterns.some(pattern => pattern.test(value));
        }
        
        return true;
    }

    /**
     * 安全地添加事件監聽器
     * @param {HTMLElement} element - 目標元素
     * @param {string} event - 事件名
     * @param {Function} handler - 事件處理器
     * @param {Object} options - 選項
     */
    static addEventListener(element, event, handler, options = {}) {
        if (!element || typeof handler !== 'function') return;
        
        // 確保事件名是安全的
        if (typeof event === 'string' && /^[a-zA-Z]+$/.test(event)) {
            element.addEventListener(event, handler, options);
        }
    }

    /**
     * 創建安全的通知元素
     * @param {string} message - 消息內容
     * @param {string} type - 通知類型
     * @returns {HTMLElement} 通知元素
     */
    static createNotification(message, type = 'info') {
        const validTypes = ['info', 'success', 'warning', 'error'];
        const safeType = validTypes.includes(type) ? type : 'info';
        
        return this.createStructure({
            tag: 'div',
            attributes: {
                class: `notification notification-${safeType}`,
                role: 'alert'
            },
            children: [
                {
                    tag: 'div',
                    attributes: { class: 'notification-content' },
                    textContent: message
                }
            ]
        });
    }
}

// 導出供其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafeDOM;
} else if (typeof window !== 'undefined') {
    window.SafeDOM = SafeDOM;
}