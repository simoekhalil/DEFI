# Performance Monitoring Guide

## 🎯 Overview

This guide explains how to monitor and analyze slow screen loading during scrolling and image clicking on the LPAD platform.

## 📋 System Components

### 1. Performance Test Suite (`tests/performance-monitoring.spec.ts`)
Automated tests that capture slow loading issues:
- **Scroll Performance Test**: Monitors loading during page scrolling
- **Image Click Performance Test**: Tracks response time when clicking images
- **Comprehensive Test**: Combined testing with detailed metrics

### 2. Performance Analyzer (`scripts/analyze-performance.mjs`)
Intelligent analysis tool that:
- Analyzes all performance test reports
- Identifies trends and patterns
- Detects critical issues
- Generates actionable recommendations
- Creates visual evidence catalog

## 🚀 Quick Start

### Step 1: Run Performance Tests

```bash
# Run all performance tests
npx playwright test performance-monitoring

# Run specific test
npx playwright test performance-monitoring -g "scrolling"
npx playwright test performance-monitoring -g "clicking on images"
npx playwright test performance-monitoring -g "Comprehensive"

# Run with visual browser (headed mode)
npx playwright test performance-monitoring --headed
```

### Step 2: Analyze Results

```bash
# Run the analyzer
npm run analyze:performance

# Or directly
node scripts/analyze-performance.mjs
```

### Step 3: Review Reports

The analyzer generates multiple outputs:
- `PERFORMANCE-ANALYSIS-REPORT.md` - Main report in root directory
- `test-results/performance-analysis-[timestamp].json` - Detailed JSON data
- `test-results/performance-analysis-[timestamp].txt` - Human-readable text report

## 📊 What Gets Captured

### Automatic Screenshots
Screenshots are automatically taken when:
- Scroll loading takes >2 seconds
- Image click response takes >2 seconds
- Network requests take >2 seconds

Screenshots are saved as:
- `test-results/slow-scroll-[number]-[timestamp].png`
- `test-results/slow-image-click-[number]-[timestamp].png`
- `test-results/slow-click-comprehensive-[number]-[timestamp].png`

### Performance Reports
JSON reports include:
```json
{
  "scrolling": [
    {
      "scrollNumber": 1,
      "duration": 2500,
      "visibleImages": 12,
      "lazyLoadingImages": 8,
      "timestamp": "2025-10-09T..."
    }
  ],
  "imageClicks": [
    {
      "elementNumber": 1,
      "duration": 1500,
      "imageInfo": "Token XYZ...",
      "timestamp": "2025-10-09T..."
    }
  ],
  "overallMetrics": {
    "totalTestDuration": 45000,
    "slowNetworkRequests": 5,
    "totalSlowScrolls": 2,
    "totalSlowClicks": 1
  }
}
```

## 📈 Understanding the Analysis

### Performance Thresholds
- **Scroll**: >1500ms is slow, >3000ms is critical
- **Click**: >1000ms is slow, >3000ms is critical
- **Network**: >2000ms is slow

### Analysis Sections

#### 1. Summary
Quick overview of all tests and issues:
- Total reports analyzed
- Total slow operations detected
- Number of screenshots captured

#### 2. Scrolling Performance
Detailed scroll metrics:
- Average, min, and max scroll duration
- Percentage of slow scrolls
- Number of images loaded per scroll
- Slowest scrolls with details

#### 3. Click Performance
Click/interaction analysis:
- Average, min, and max response time
- Percentage of slow clicks
- Slowest interactions with image info

#### 4. Network Performance
Network request analysis:
- Total slow requests
- Average slow requests per test
- Impact level assessment

#### 5. Trends
Performance over time (requires 2+ reports):
- Scroll performance trend
- Click performance trend
- Overall trend direction

#### 6. Critical Issues
Flagged problems requiring immediate attention:
- 🔴 CRITICAL: >3000ms operations
- 🟡 HIGH: Multiple slow operations or >10 slow network requests

#### 7. Recommendations
Prioritized suggestions for improvement:
- 🔴 HIGH: Critical fixes needed
- 🟡 MEDIUM: Important optimizations
- ℹ️ INFO: Best practices and tips

## 🔧 Customization

### Adjust Performance Thresholds

Edit `tests/performance-monitoring.spec.ts`:

```typescript
// Change what's considered "slow"
const SLOW_SCROLL_THRESHOLD = 2000; // ms
const SLOW_CLICK_THRESHOLD = 1000;  // ms
```

Edit `scripts/analyze-performance.mjs`:

```javascript
this.thresholds = {
  scroll: 1500,      // Slow scroll threshold
  click: 1000,       // Slow click threshold
  network: 2000,     // Slow network threshold
  critical: 3000     // Critical threshold
};
```

### Test More Images

Edit in `tests/performance-monitoring.spec.ts`:

```typescript
// Change from 5 to test more images
const imagesToTest = Math.min(images.length, 10);
```

### Change Scroll Behavior

```typescript
// Adjust scroll amount and steps
const scrollSteps = 10;     // Number of scrolls
const scrollAmount = 300;   // Pixels per scroll
```

## 📝 Example Workflow

### Scenario: Testing Before Release

```bash
# 1. Run comprehensive performance test
npx playwright test performance-monitoring -g "Comprehensive" --headed

# 2. Analyze the results
npm run analyze:performance

# 3. Review the report
# Open: PERFORMANCE-ANALYSIS-REPORT.md

# 4. Check screenshots for visual evidence
# Look in: test-results/slow-*.png

# 5. If issues found, re-test after fixes
npx playwright test performance-monitoring

# 6. Compare trends
npm run analyze:performance
```

### Scenario: Monitoring Production Performance

```bash
# 1. Schedule regular tests (e.g., daily)
# Add to CI/CD or cron job

# 2. Run tests
npx playwright test performance-monitoring

# 3. Analyze trends over time
npm run analyze:performance

# 4. Review trend section for degradation
# The analyzer will show if performance is:
# 📈 Improving, ➡️ Stable, or 📉 Degrading
```

## 🎯 Common Issues and Solutions

### Issue: "No performance reports found"
**Solution**: Run the performance tests first:
```bash
npx playwright test performance-monitoring
```

### Issue: Tests timing out
**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
timeout: 120000, // 2 minutes
```

### Issue: Too many slow operations detected
**Solution**: Check the recommendations section in the analysis report. Common fixes:
1. Implement lazy loading properly
2. Optimize image sizes
3. Add loading placeholders
4. Implement caching

### Issue: Screenshots not capturing the problem
**Solution**: Adjust when screenshots are taken:
```typescript
// Lower the threshold to capture more screenshots
if (duration > 1000) { // Changed from 2000
  await page.screenshot({...});
}
```

## 📊 Reading the Report

### Good Performance Example
```
Scrolling Performance:
  Total Scroll Tests: 5
  Slow Scrolls Detected: 0 (0.0%)
  Average Duration: 850ms
  ✅ No significant performance issues
```

### Poor Performance Example
```
Scrolling Performance:
  Total Scroll Tests: 5
  Slow Scrolls Detected: 4 (80.0%)
  Average Duration: 2500ms
  ⚠️ PERFORMANCE ISSUES DETECTED

Critical Issues:
  🔴 CRITICAL - Scroll Performance
  3 scroll(s) took over 3000ms
  Max Duration: 4500ms
```

## 🔍 Advanced Usage

### Compare Performance Across Environments

```bash
# Test staging
ENVIRONMENT=staging npx playwright test performance-monitoring

# Analyze
npm run analyze:performance

# Test production
ENVIRONMENT=production npx playwright test performance-monitoring

# Analyze and compare
npm run analyze:performance
```

### Integration with CI/CD

Add to your pipeline:

```yaml
# .github/workflows/performance.yml
- name: Run Performance Tests
  run: npx playwright test performance-monitoring

- name: Analyze Performance
  run: npm run analyze:performance

- name: Upload Reports
  uses: actions/upload-artifact@v3
  with:
    name: performance-reports
    path: |
      test-results/performance-*.json
      test-results/slow-*.png
      PERFORMANCE-ANALYSIS-REPORT.md
```

### Creating Jira Tickets from Critical Issues

The analyzer exits with code 1 if critical issues are detected. You can use this to automatically create Jira tickets:

```bash
# Run analyzer and check exit code
npm run analyze:performance

if [ $? -eq 1 ]; then
  echo "Critical performance issues detected!"
  # Trigger your Jira ticket creation script
  node scripts/create-jira-tickets.mjs
fi
```

## 🎨 Screenshot Organization

Screenshots are named descriptively:
```
slow-scroll-1-1728476123456.png
slow-scroll-2-1728476125789.png
slow-image-click-1-1728476130123.png
slow-click-comprehensive-1-1728476135456.png
```

Format: `slow-[type]-[number]-[timestamp].png`

Where:
- `type`: scroll, image, click, image-response
- `number`: Sequential number in test
- `timestamp`: Unix timestamp (milliseconds)

## 📚 Best Practices

1. **Regular Testing**: Run performance tests weekly or before releases
2. **Baseline Metrics**: Establish acceptable performance baselines
3. **Track Trends**: Monitor the trend section to catch degradation early
4. **Review Screenshots**: Visual evidence helps identify UI-specific issues
5. **Act on Recommendations**: Prioritize high-priority recommendations
6. **Document Fixes**: Keep notes on what fixes improved performance
7. **Retest After Changes**: Verify that optimizations actually help

## 🆘 Getting Help

If you encounter issues:

1. Check the console output for detailed error messages
2. Review the generated screenshots for visual clues
3. Check the recommendations section in the analysis report
4. Review Playwright documentation for test issues
5. Check network tab in browser DevTools during headed runs

## 📦 File Structure

```
qa-testing/
├── tests/
│   └── performance-monitoring.spec.ts    # Performance tests
├── scripts/
│   └── analyze-performance.mjs           # Analysis tool
├── test-results/
│   ├── performance-report-*.json         # Raw test reports
│   ├── performance-analysis-*.json       # Analysis results
│   ├── performance-analysis-*.txt        # Text reports
│   └── slow-*.png                        # Screenshots
├── PERFORMANCE-ANALYSIS-REPORT.md        # Latest analysis
└── PERFORMANCE-MONITORING-GUIDE.md       # This file
```

## 🎯 Success Metrics

Track these over time:
- **Average scroll duration** (target: <1000ms)
- **Average click response** (target: <800ms)
- **Percentage of slow operations** (target: <10%)
- **Critical issues count** (target: 0)
- **Slow network requests** (target: <3 per test)

## 🚀 Next Steps

1. Run your first performance test
2. Review the analysis report
3. Implement top recommendations
4. Re-test to verify improvements
5. Set up regular monitoring schedule
6. Establish performance baselines for your project

---

**Created**: October 2025  
**Version**: 1.0  
**Maintained by**: QA Team

