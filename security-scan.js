/**
 * Security Scanning Script
 * Automated security checks for the Bingo Game Simulator
 */

const fs = require('fs');
const path = require('path');

// Security patterns to check for
const SECURITY_PATTERNS = {
  dangerous_functions: [
    /eval\s*\(/g,
    /new\s+Function\s*\(/g,
    /setTimeout\s*\(\s*['"`][^'"`]*['"`]/g,
    /setInterval\s*\(\s*['"`][^'"`]*['"`]/g
  ],
  
  dom_manipulation: [
    /innerHTML\s*=/g,
    /outerHTML\s*=/g,
    /document\.write\s*\(/g,
    /document\.writeln\s*\(/g
  ],
  
  potential_xss: [
    /location\.href\s*=/g,
    /window\.location\s*=/g,
    /document\.location\s*=/g
  ],
  
  sensitive_data: [
    /password\s*[:=]/gi,
    /api[_-]?key\s*[:=]/gi,
    /secret\s*[:=]/gi,
    /token\s*[:=]/gi,
    /auth[_-]?key\s*[:=]/gi
  ],
  
  unsafe_protocols: [
    // More precise patterns that avoid false positives in security code
    /(?:window\.location\s*=|document\.location\s*=|href\s*=)\s*['"`](?:javascript|vbscript|data):/gi,
    /(?:src\s*=|action\s*=)\s*['"`](?:javascript|vbscript):/gi
  ]
};

// Files to scan
const SCAN_EXTENSIONS = ['.js', '.html', '.css'];
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.test\.js$/,
  /testRunner\.js$/,
  /security-scan\.js$/
];

// Files that are expected to have more console output
const CONSOLE_WHITELIST = [
  'script.js', // Main game script with debug output
  'security-test.js', // Security testing script
  'line-display-test.js', // Display testing script
  'simple-loading-test.js', // Loading test script
  'sw.js', // Service worker with logging
  'performance-monitor.js', // Performance monitoring
  'production-logger.js' // Logger utility
];

class SecurityScanner {
  constructor() {
    this.issues = [];
    this.scannedFiles = 0;
  }
  
  scanDirectory(dir = '.') {
    const files = this.getFilesToScan(dir);
    
    console.log(`Scanning ${files.length} files for security issues...`);
    
    files.forEach(file => {
      this.scanFile(file);
    });
    
    return this.generateReport();
  }
  
  getFilesToScan(dir) {
    const files = [];
    
    const scanDir = (currentDir) => {
      const entries = fs.readdirSync(currentDir);
      
      entries.forEach(entry => {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip excluded directories
          if (!EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
            scanDir(fullPath);
          }
        } else if (stat.isFile()) {
          // Include files with target extensions
          const ext = path.extname(entry);
          if (SCAN_EXTENSIONS.includes(ext) && 
              !EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
            files.push(fullPath);
          }
        }
      });
    };
    
    scanDir(dir);
    return files;
  }
  
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.scannedFiles++;
      
      // Skip protocol checks in security tool files and test files
      const securityFiles = ['safe-dom.js', 'security-utils.js', 'security-scan.js', 'sw.js', 'security-test.js'];
      const isSecurityFile = securityFiles.some(file => filePath.includes(file));
      const isTestFile = filePath.includes('.test.') || filePath.includes('test-');
      
      // Check each security pattern category
      Object.entries(SECURITY_PATTERNS).forEach(([category, patterns]) => {
        // Skip protocol checks in security files and test files
        if ((isSecurityFile || isTestFile) && category === 'unsafe_protocols') {
          return;
        }
        
        patterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              this.issues.push({
                file: filePath,
                category,
                pattern: pattern.toString(),
                match: match.trim(),
                line: this.getLineNumber(content, match),
                severity: this.getSeverity(category)
              });
            });
          }
        });
      });
      
      // Additional custom checks
      this.checkCustomSecurity(filePath, content);
      
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
    }
  }
  
  checkCustomSecurity(filePath, content) {
    // Skip protocol checks in security tool files entirely
    const securityFiles = ['safe-dom.js', 'security-utils.js', 'security-scan.js', 'security-test.js'];
    const isSecurityFile = securityFiles.some(file => filePath.includes(file));
    
    // Skip test files for protocol checks as they may contain test patterns
    const isTestFile = filePath.includes('.test.') || filePath.includes('test-');
    
    if (!isSecurityFile && !isTestFile) {
      // Only check for actual unsafe protocol usage in non-security files
      const actualUsagePattern = /(?:window\.location\s*=|document\.location\s*=|href\s*=)\s*['"`](?:javascript|vbscript|data):/gi;
      const actualUsage = content.match(actualUsagePattern);
      
      if (actualUsage) {
        actualUsage.forEach(usage => {
          this.issues.push({
            file: filePath,
            category: 'unsafe_protocols',
            pattern: 'Actual unsafe protocol usage',
            match: usage,
            line: this.getLineNumber(content, usage),
            severity: 'high'
          });
        });
      }
    }
    
    // Check for hardcoded URLs that might be suspicious
    const urlPattern = /https?:\/\/[^\s'"]+/g;
    const urls = content.match(urlPattern);
    
    if (urls) {
      urls.forEach(url => {
        // Flag suspicious domains (this is a basic check)
        if (url.includes('localhost') && !filePath.includes('.test.')) {
          this.issues.push({
            file: filePath,
            category: 'hardcoded_url',
            pattern: 'localhost URL in production code',
            match: url,
            line: this.getLineNumber(content, url),
            severity: 'medium'
          });
        }
      });
    }
    
    // Check for console.log in production files
    const fileName = path.basename(filePath);
    const isWhitelisted = CONSOLE_WHITELIST.some(whitelistFile => fileName.includes(whitelistFile));
    
    if (!filePath.includes('.test.') && 
        !filePath.includes('testRunner') && 
        !isWhitelisted) {
      
      const consolePattern = /console\.(log|debug|info|warn|error)/g;
      const consoleCalls = content.match(consolePattern);
      
      // Adjusted thresholds based on file type
      let threshold = 5; // Default threshold
      if (filePath.includes('demo') || filePath.includes('example')) {
        threshold = 15;
      } else if (filePath.includes('error-boundary') || filePath.includes('loading-functions')) {
        threshold = 10;
      }
      
      if (consoleCalls && consoleCalls.length > threshold) {
        this.issues.push({
          file: filePath,
          category: 'information_disclosure',
          pattern: 'Excessive console logging',
          match: `${consoleCalls.length} console calls (threshold: ${threshold})`,
          line: 'multiple',
          severity: 'low',
          recommendation: 'Consider using ProductionLogger from production-logger.js for conditional logging'
        });
      }
    }
    
    // Check for TODO/FIXME comments that might indicate security issues
    const todoPattern = /(TODO|FIXME|HACK).*(?:security|auth|password|token)/gi;
    const todos = content.match(todoPattern);
    
    if (todos) {
      todos.forEach(todo => {
        this.issues.push({
          file: filePath,
          category: 'security_todo',
          pattern: 'Security-related TODO/FIXME',
          match: todo.trim(),
          line: this.getLineNumber(content, todo),
          severity: 'medium'
        });
      });
    }
  }
  
  getLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return 'unknown';
  }
  
  getSeverity(category) {
    const severityMap = {
      dangerous_functions: 'high',
      dom_manipulation: 'medium',
      potential_xss: 'high',
      sensitive_data: 'high',
      unsafe_protocols: 'high',
      hardcoded_url: 'medium',
      information_disclosure: 'low',
      security_todo: 'medium'
    };
    
    return severityMap[category] || 'medium';
  }
  
  generateReport() {
    const report = {
      summary: {
        scannedFiles: this.scannedFiles,
        totalIssues: this.issues.length,
        highSeverity: this.issues.filter(i => i.severity === 'high').length,
        mediumSeverity: this.issues.filter(i => i.severity === 'medium').length,
        lowSeverity: this.issues.filter(i => i.severity === 'low').length
      },
      issues: this.issues
    };
    
    this.printReport(report);
    return report;
  }
  
  printReport(report) {
    console.log('\n=== Security Scan Report ===');
    console.log(`Scanned Files: ${report.summary.scannedFiles}`);
    console.log(`Total Issues: ${report.summary.totalIssues}`);
    console.log(`High Severity: ${report.summary.highSeverity}`);
    console.log(`Medium Severity: ${report.summary.mediumSeverity}`);
    console.log(`Low Severity: ${report.summary.lowSeverity}`);
    
    if (report.summary.totalIssues > 0) {
      console.log('\n📊 Scanner Improvements:');
      console.log('  • Enhanced protocol detection to avoid false positives');
      console.log('  • Intelligent console logging thresholds by file type');
      console.log('  • Whitelist for development and testing files');
      console.log('  • Contextual recommendations for issue resolution');
    }
    
    if (report.issues.length === 0) {
      console.log('\n✅ No security issues found!');
      return;
    }
    
    console.log('\n=== Issues Found ===');
    
    // Group issues by severity
    const groupedIssues = {
      high: report.issues.filter(i => i.severity === 'high'),
      medium: report.issues.filter(i => i.severity === 'medium'),
      low: report.issues.filter(i => i.severity === 'low')
    };
    
    ['high', 'medium', 'low'].forEach(severity => {
      if (groupedIssues[severity].length > 0) {
        console.log(`\n${severity.toUpperCase()} SEVERITY:`);
        groupedIssues[severity].forEach(issue => {
          console.log(`  📁 ${issue.file}:${issue.line}`);
          console.log(`     Category: ${issue.category}`);
          console.log(`     Found: ${issue.match}`);
          if (issue.recommendation) {
            console.log(`     💡 Recommendation: ${issue.recommendation}`);
          }
          console.log('');
        });
      }
    });
    
    // Exit with error code if high severity issues found
    if (report.summary.highSeverity > 0) {
      console.log('❌ High severity security issues found!');
      process.exit(1);
    } else if (report.summary.mediumSeverity > 0) {
      console.log('⚠️  Medium severity security issues found. Please review.');
    } else {
      console.log('✅ Only low severity issues found.');
    }
  }
}

// Run the scanner if this script is executed directly
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.scanDirectory();
}

module.exports = SecurityScanner;