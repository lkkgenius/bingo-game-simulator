# 部署指南

本指南詳細說明如何將 Bingo 遊戲模擬器部署到不同的環境和平台。

## 目錄

- [部署概覽](#部署概覽)
- [GitHub Pages 部署](#github-pages-部署)
- [Netlify 部署](#netlify-部署)
- [Vercel 部署](#vercel-部署)
- [Firebase Hosting 部署](#firebase-hosting-部署)
- [自定義服務器部署](#自定義服務器部署)
- [Docker 部署](#docker-部署)
- [CDN 配置](#cdn-配置)
- [域名配置](#域名配置)
- [SSL/HTTPS 設置](#sslhttps-設置)
- [性能優化](#性能優化)
- [監控和分析](#監控和分析)
- [故障排除](#故障排除)

## 部署概覽

### 專案特性

Bingo 遊戲模擬器是一個純前端應用程式，具有以下特性：

- **靜態網站**: 無需後端服務器
- **PWA 支持**: 支援離線使用和安裝
- **響應式設計**: 適配各種設備
- **無外部依賴**: 純 JavaScript 實現
- **SEO 友好**: 適當的 meta 標籤和結構

### 部署需求

**最低需求**:
- 靜態文件託管服務
- HTTPS 支持（PWA 必需）
- 支持自定義 404 頁面（可選）

**推薦需求**:
- CDN 支持
- 自動部署 (CI/CD)
- 性能監控
- 分析工具集成

## GitHub Pages 部署

GitHub Pages 是最簡單的部署方式，特別適合開源專案。

### 1. 基本設置

**步驟 1: 準備 Repository**
```bash
# 確保代碼在 main 分支
git checkout main
git push origin main
```

**步驟 2: 啟用 GitHub Pages**
1. 前往 GitHub repository 頁面
2. 點擊 "Settings" 標籤
3. 滾動到 "Pages" 部分
4. 在 "Source" 下選擇 "Deploy from a branch"
5. 選擇 "main" 分支和 "/ (root)" 文件夾
6. 點擊 "Save"

**步驟 3: 驗證部署**
- 等待 2-5 分鐘
- 訪問 `https://[username].github.io/[repository-name]`

### 2. 自動部署設置

創建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Run tests
      run: |
        node testRunner.js
        
    - name: Run E2E tests
      run: |
        npx playwright install
        npx playwright test playwright-e2e.test.js

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      pages: write
      id-token: write
    
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Pages
      uses: actions/configure-pages@v3
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v2
      with:
        path: '.'
        
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v2
```

### 3. 自定義域名設置

**步驟 1: 添加 CNAME 文件**
```bash
echo "yourdomain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

**步驟 2: 配置 DNS**
```
# 對於 apex 域名 (example.com)
A 記錄:
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

# 對於子域名 (www.example.com)
CNAME 記錄: [username].github.io
```

**步驟 3: 在 GitHub 設置中配置**
1. 在 Pages 設置中輸入自定義域名
2. 勾選 "Enforce HTTPS"
3. 等待 DNS 驗證完成

## Netlify 部署

Netlify 提供優秀的靜態網站託管服務，支持自動部署和豐富的功能。

### 1. 通過 Git 部署

**步驟 1: 連接 Repository**
1. 登錄 [Netlify](https://netlify.com)
2. 點擊 "New site from Git"
3. 選擇 GitHub 並授權
4. 選擇你的 repository

**步驟 2: 配置構建設置**
```
Build command: echo "No build required"
Publish directory: .
```

**步驟 3: 部署**
點擊 "Deploy site"，Netlify 會自動部署並提供一個 URL。

### 2. 配置文件設置

創建 `netlify.toml`:

```toml
[build]
  publish = "."
  command = "echo 'Static site - no build required'"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"]}

# PWA 支持
[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

# 安全標頭
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
```

### 3. 環境變量設置

在 Netlify 控制台中設置環境變量：
```
ENVIRONMENT=production
ANALYTICS_ID=your-analytics-id
```

### 4. 表單處理（可選）

如果需要聯繫表單：
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <input type="text" name="name" placeholder="姓名" required />
  <input type="email" name="email" placeholder="電子郵件" required />
  <textarea name="message" placeholder="訊息" required></textarea>
  <button type="submit">發送</button>
</form>
```

## Vercel 部署

Vercel 是另一個優秀的靜態網站託管平台，特別適合前端專案。

### 1. 通過 Git 部署

**步驟 1: 連接 Repository**
1. 登錄 [Vercel](https://vercel.com)
2. 點擊 "New Project"
3. 導入你的 GitHub repository

**步驟 2: 配置設置**
```
Framework Preset: Other
Build Command: (留空)
Output Directory: .
Install Command: (留空)
```

### 2. 配置文件設置

創建 `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/sw.js",
      "headers": {
        "Cache-Control": "no-cache"
      }
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg))",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 3. 環境變量

在 Vercel 控制台中設置：
```
ENVIRONMENT=production
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Firebase Hosting 部署

Firebase Hosting 提供快速、安全的網站託管服務。

### 1. 初始設置

**步驟 1: 安裝 Firebase CLI**
```bash
npm install -g firebase-tools
```

**步驟 2: 登錄和初始化**
```bash
firebase login
firebase init hosting
```

**步驟 3: 配置 firebase.json**
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "**/*.test.js",
      "testRunner.js"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 2. 部署

```bash
# 構建（如果需要）
# npm run build

# 部署
firebase deploy
```

### 3. 自動部署

創建 `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Run tests
      run: node testRunner.js
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: your-project-id
```

## 自定義服務器部署

如果你有自己的服務器，可以使用以下方法部署。

### 1. Nginx 配置

**步驟 1: 上傳文件**
```bash
# 使用 rsync 同步文件
rsync -avz --delete ./ user@server:/var/www/bingo-game/

# 或使用 scp
scp -r ./* user@server:/var/www/bingo-game/
```

**步驟 2: 配置 Nginx**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL 配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # 網站根目錄
    root /var/www/bingo-game;
    index index.html;
    
    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 緩存設置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Service Worker 不緩存
    location = /sw.js {
        add_header Cache-Control "no-cache";
        expires 0;
    }
    
    # 安全標頭
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # PWA 支持
    location = /manifest.json {
        add_header Content-Type "application/manifest+json";
    }
    
    # 單頁應用支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 2. Apache 配置

創建 `.htaccess`:

```apache
# 啟用重寫引擎
RewriteEngine On

# HTTPS 重定向
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 單頁應用支持
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 緩存設置
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Service Worker 不緩存
<Files "sw.js">
    <IfModule mod_expires.c>
        ExpiresActive Off
    </IfModule>
    <IfModule mod_headers.c>
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </IfModule>
</Files>

# 安全標頭
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Gzip 壓縮
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

## Docker 部署

使用 Docker 容器化部署應用程式。

### 1. Dockerfile

```dockerfile
# 使用 Nginx 作為基礎鏡像
FROM nginx:alpine

# 複製網站文件
COPY . /usr/share/nginx/html

# 複製 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Nginx 配置 (nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip 壓縮
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 緩存設置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # Service Worker
    location = /sw.js {
        add_header Cache-Control "no-cache";
    }
    
    # 單頁應用支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Docker Compose

```yaml
version: '3.8'

services:
  bingo-game:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    
  # 可選：添加 SSL 終止
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./proxy.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - bingo-game
```

### 4. 構建和運行

```bash
# 構建鏡像
docker build -t bingo-game .

# 運行容器
docker run -d -p 80:80 --name bingo-game bingo-game

# 使用 Docker Compose
docker-compose up -d
```

## CDN 配置

使用 CDN 可以提高全球用戶的訪問速度。

### 1. Cloudflare 設置

**步驟 1: 添加網站到 Cloudflare**
1. 註冊 Cloudflare 帳戶
2. 添加你的域名
3. 更新 DNS 服務器

**步驟 2: 配置緩存規則**
```
Page Rules:
- *.js, *.css: Cache Everything, Edge TTL 1 month
- /sw.js: Bypass Cache
- /*: Cache Everything, Edge TTL 4 hours
```

**步驟 3: 優化設置**
- 啟用 Auto Minify (JavaScript, CSS, HTML)
- 啟用 Brotli 壓縮
- 啟用 HTTP/2
- 設置 Security Level 為 Medium

### 2. AWS CloudFront 設置

創建 CloudFront 分發：

```json
{
  "DistributionConfig": {
    "CallerReference": "bingo-game-2023",
    "Origins": [
      {
        "Id": "S3-bingo-game",
        "DomainName": "bingo-game.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ],
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-bingo-game",
      "ViewerProtocolPolicy": "redirect-to-https",
      "CachePolicyId": "managed-caching-optimized",
      "Compress": true
    },
    "CacheBehaviors": [
      {
        "PathPattern": "/sw.js",
        "TargetOriginId": "S3-bingo-game",
        "ViewerProtocolPolicy": "redirect-to-https",
        "CachePolicyId": "managed-caching-disabled"
      }
    ],
    "Enabled": true,
    "PriceClass": "PriceClass_100"
  }
}
```

## 域名配置

### 1. DNS 設置

**A 記錄設置**:
```
Type: A
Name: @
Value: [服務器 IP 地址]
TTL: 300

Type: A
Name: www
Value: [服務器 IP 地址]
TTL: 300
```

**CNAME 記錄設置**:
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 300
```

### 2. 子域名設置

```
Type: CNAME
Name: game
Value: yourdomain.com
TTL: 300
```

### 3. DNS 驗證

```bash
# 檢查 DNS 解析
nslookup yourdomain.com
dig yourdomain.com

# 檢查 HTTPS
curl -I https://yourdomain.com
```

## SSL/HTTPS 設置

### 1. Let's Encrypt (免費)

```bash
# 安裝 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 獲取證書
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自動續期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. 商業 SSL 證書

```bash
# 生成私鑰
openssl genrsa -out private.key 2048

# 生成 CSR
openssl req -new -key private.key -out certificate.csr

# 安裝證書（從 CA 獲得後）
# 配置 Web 服務器使用證書
```

### 3. SSL 測試

```bash
# 測試 SSL 配置
openssl s_client -connect yourdomain.com:443

# 在線測試
# https://www.ssllabs.com/ssltest/
```

## 性能優化

### 1. 資源優化

**JavaScript 壓縮**:
```bash
# 使用 Terser
npx terser script.js -o script.min.js --compress --mangle

# 使用 UglifyJS
npx uglifyjs script.js -o script.min.js -c -m
```

**CSS 優化**:
```bash
# 使用 csso
npx csso styles.css --output styles.min.css

# 使用 clean-css
npx cleancss -o styles.min.css styles.css
```

**圖片優化**:
```bash
# 使用 imagemin
npx imagemin images/* --out-dir=images/optimized

# 轉換為 WebP
cwebp image.jpg -q 80 -o image.webp
```

### 2. 緩存策略

**HTTP 緩存標頭**:
```
# 靜態資源
Cache-Control: public, max-age=31536000, immutable

# HTML 文件
Cache-Control: public, max-age=3600

# Service Worker
Cache-Control: no-cache
```

**Service Worker 緩存**:
```javascript
// 在 sw.js 中
const CACHE_NAME = 'bingo-game-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/script.js',
  '/gameEngine.js',
  // ... 其他資源
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### 3. 載入優化

**資源預載**:
```html
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="script.js" as="script">
<link rel="prefetch" href="gameEngine.js">
```

**延遲載入**:
```javascript
// 延遲載入非關鍵資源
setTimeout(() => {
  import('./aiLearningSystem.js');
}, 2000);
```

## 監控和分析

### 1. Google Analytics

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. 性能監控

```javascript
// 使用 Performance API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance:', entry);
  }
});

observer.observe({entryTypes: ['navigation', 'resource']});
```

### 3. 錯誤監控

```javascript
// 全局錯誤處理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // 發送到監控服務
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // 發送到監控服務
});
```

### 4. 用戶體驗監控

```javascript
// Core Web Vitals
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 故障排除

### 1. 常見部署問題

**問題: 404 錯誤**
```
解決方案:
1. 檢查文件路徑是否正確
2. 確保 index.html 在根目錄
3. 配置服務器支持 SPA 路由
```

**問題: HTTPS 混合內容錯誤**
```
解決方案:
1. 確保所有資源使用 HTTPS
2. 更新 HTTP 鏈接為 HTTPS
3. 使用相對路徑
```

**問題: Service Worker 不工作**
```
解決方案:
1. 確保使用 HTTPS
2. 檢查 Service Worker 註冊代碼
3. 清除瀏覽器緩存
```

### 2. 性能問題

**問題: 載入速度慢**
```
解決方案:
1. 啟用 Gzip/Brotli 壓縮
2. 優化圖片大小
3. 使用 CDN
4. 實施緩存策略
```

**問題: JavaScript 執行慢**
```
解決方案:
1. 使用 Performance Monitor 分析
2. 優化算法邏輯
3. 實施代碼分割
4. 使用 Web Workers
```

### 3. 調試工具

**瀏覽器開發者工具**:
- Network 面板：檢查資源載入
- Performance 面板：分析性能
- Application 面板：檢查 PWA 功能
- Console 面板：查看錯誤日誌

**在線工具**:
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### 4. 部署檢查清單

**部署前檢查**:
- [ ] 所有測試通過
- [ ] 資源路徑使用相對路徑
- [ ] 移除調試代碼和 console.log
- [ ] 優化圖片和資源
- [ ] 更新版本號
- [ ] 檢查 manifest.json
- [ ] 測試 PWA 功能

**部署後檢查**:
- [ ] 網站可以正常訪問
- [ ] 所有功能正常工作
- [ ] HTTPS 正常工作
- [ ] PWA 安裝功能正常
- [ ] 在不同設備上測試
- [ ] 檢查性能指標
- [ ] 設置監控和分析

---

## 結語

本部署指南涵蓋了多種部署選項和最佳實踐。選擇最適合你需求的部署方式：

- **GitHub Pages**: 適合開源專案和簡單部署
- **Netlify/Vercel**: 適合需要高級功能的專案
- **Firebase**: 適合需要 Google 生態系統集成
- **自定義服務器**: 適合需要完全控制的情況
- **Docker**: 適合容器化部署

記住定期更新和維護你的部署，監控性能和安全性，並根據用戶反饋持續改進。

**祝部署順利！** 🚀