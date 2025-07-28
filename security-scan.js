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
    /javascript\s*:/gi,
    /['"]data\s*:/gi,
    /vbscript\s*:/gi
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
      
      // Check each security pattern category
      Object.entries(SECURITY_PATTERNS).forEach(([category, patterns]) => {
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
    if (!filePath.includes('.test.') && !filePath.includes('testRunner')) {
      const consolePattern = /console\.(log|debug|info|warn|error)/g;
      const consoleCalls = content.match(consolePattern);
      
      if (consoleCalls && consoleCalls.length > 5) {
        this.issues.push({
          file: filePath,
          category: 'information_disclosure',
          pattern: 'Excessive console logging',
          match: `${consoleCalls.length} console calls`,
          line: 'multiple',
          severity: 'low'
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