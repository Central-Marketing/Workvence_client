/**
 * Diagnostic & Telemetry Tracker for Playwright Journey Testing
 * Monitors network requests, console logs, errors, page metrics, and outputs comprehensive diagnostic reports.
 */

const fs = require('fs');
const path = require('path');

class DiagnosticTracker {
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.resolve(process.cwd(), 'test-results');
    this.screenshotsDir = path.join(this.outputDir, 'screenshots');
    this.baseUrl = options.baseUrl || 'https://dev.workvence.com';
    this.startTime = Date.now();
    this.endTime = null;

    this.steps = [];
    this.endpoints = [];
    this.activeRequests = new Map();
    this.pageMetrics = [];
    this.consoleLogs = [];
    this.errors = [];

    // Ensure output directories exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  attachToPage(page) {
    // 1. Intercept Network Requests
    page.on('request', (req) => {
      const url = req.url();
      const requestId = `${req.method()}_${url}_${Date.now()}_${Math.random()}`;
      
      // Store in request context
      this.activeRequests.set(req, {
        id: requestId,
        url,
        method: req.method(),
        resourceType: req.resourceType(),
        startTime: Date.now(),
        postData: req.postData()
      });
    });

    // 2. Intercept Network Responses
    page.on('response', async (res) => {
      const req = res.request();
      const reqInfo = this.activeRequests.get(req);
      const now = Date.now();
      const durationMs = reqInfo ? now - reqInfo.startTime : 0;
      const url = res.url();
      const status = res.status();
      const isApi = url.includes('/api/') || url.includes('devadmin.workvence.com');

      const entry = {
        url,
        method: req.method(),
        status,
        statusText: res.statusText(),
        durationMs,
        isApi,
        ok: res.ok(),
        timestamp: new Date().toISOString(),
        headers: res.headers()
      };

      this.endpoints.push(entry);
      this.activeRequests.delete(req);

      if (isApi) {
        const statusColor = status >= 200 && status < 300 ? '\x1b[32m' : (status >= 400 ? '\x1b[31m' : '\x1b[33m');
        console.log(`  📡 [API] ${req.method()} ${url} -> ${statusColor}${status}\x1b[0m (${durationMs}ms)`);
      }
    });

    // 3. Intercept Failed Requests
    page.on('requestfailed', (req) => {
      const reqInfo = this.activeRequests.get(req);
      const durationMs = reqInfo ? Date.now() - reqInfo.startTime : 0;
      const failure = req.failure() || {};

      this.endpoints.push({
        url: req.url(),
        method: req.method(),
        status: 0,
        statusText: failure.errorText || 'Failed/Cancelled',
        durationMs,
        isApi: req.url().includes('/api/') || req.url().includes('devadmin.workvence.com'),
        ok: false,
        timestamp: new Date().toISOString(),
        error: failure.errorText
      });

      this.activeRequests.delete(req);
      if (req.url().includes('/api/') || req.url().includes('devadmin.workvence.com')) {
        console.log(`  ⚠️  [API FAILED] ${req.method()} ${req.url()} - ${failure.errorText || 'Failed'}`);
      }
    });

    // 4. Track Console Messages
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      this.consoleLogs.push({
        type,
        text,
        location: msg.location(),
        time: new Date().toISOString()
      });

      if (type === 'error') {
        console.log(`  🔴 [Browser Console Error]: ${text}`);
      }
    });

    // 5. Track Uncaught Page Errors
    page.on('pageerror', (err) => {
      const errMsg = err.message || err.toString();
      this.errors.push({
        type: 'PageError',
        message: errMsg,
        stack: err.stack,
        time: new Date().toISOString()
      });
      console.log(`  💥 [Browser Uncaught Exception]: ${errMsg}`);
    });
  }

  async recordPagePerformance(page, pageName, routeUrl) {
    try {
      const performanceTiming = await page.evaluate(() => {
        const perf = window.performance;
        const navEntries = perf.getEntriesByType('navigation');
        if (navEntries && navEntries.length > 0) {
          const nav = navEntries[0];
          return {
            dnsTime: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
            connectTime: Math.round(nav.connectEnd - nav.connectStart),
            ttfb: Math.round(nav.responseStart - nav.requestStart),
            responseDuration: Math.round(nav.responseEnd - nav.responseStart),
            domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
            loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
            duration: Math.round(nav.duration)
          };
        }
        // Fallback for older browsers
        const timing = perf.timing;
        if (timing) {
          return {
            dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
            connectTime: timing.connectEnd - timing.connectStart,
            ttfb: timing.responseStart - timing.requestStart,
            responseDuration: timing.responseEnd - timing.responseStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            duration: timing.loadEventEnd - timing.navigationStart
          };
        }
        return null;
      });

      const entry = {
        pageName,
        url: routeUrl || page.url(),
        timestamp: new Date().toISOString(),
        metrics: performanceTiming || { loadComplete: 0, ttfb: 0, domContentLoaded: 0 }
      };

      this.pageMetrics.push(entry);

      if (performanceTiming) {
        console.log(`  ⚡ [Perf] ${pageName}: TTFB=${performanceTiming.ttfb}ms | DCL=${performanceTiming.domContentLoaded}ms | FullyLoaded=${performanceTiming.loadComplete || performanceTiming.duration}ms`);
      }
      return entry;
    } catch (e) {
      console.warn(`[DiagnosticTracker] Could not evaluate performance metrics for ${pageName}: ${e.message}`);
    }
  }

  async startStep(name, category = 'General') {
    const stepObj = {
      id: this.steps.length + 1,
      name,
      category,
      startTime: Date.now(),
      endTime: null,
      durationMs: null,
      status: 'RUNNING',
      details: '',
      screenshot: null,
      error: null
    };
    this.steps.push(stepObj);
    console.log(`\n\x1b[36m▶ [Step ${stepObj.id}] ${category} » ${name}\x1b[0m`);
    return stepObj;
  }

  async passStep(stepObj, details = '', page = null) {
    stepObj.endTime = Date.now();
    stepObj.durationMs = stepObj.endTime - stepObj.startTime;
    stepObj.status = 'PASSED';
    stepObj.details = details;

    if (page) {
      const screenshotFilename = `step_${stepObj.id}_${Date.now()}.png`;
      const screenshotPath = path.join(this.screenshotsDir, screenshotFilename);
      try {
        await page.screenshot({ path: screenshotPath, fullPage: false });
        stepObj.screenshot = screenshotFilename;
      } catch (err) {
        // ignore screenshot errors
      }
    }

    console.log(`\x1b[32m✔ [Step ${stepObj.id} PASSED]\x1b[0m ${stepObj.name} (${stepObj.durationMs}ms) ${details ? '• ' + details : ''}`);
  }

  async failStep(stepObj, error, details = '', page = null) {
    stepObj.endTime = Date.now();
    stepObj.durationMs = stepObj.endTime - stepObj.startTime;
    stepObj.status = 'FAILED';
    stepObj.error = error?.message || String(error);
    stepObj.details = details;

    if (page) {
      const screenshotFilename = `failed_step_${stepObj.id}_${Date.now()}.png`;
      const screenshotPath = path.join(this.screenshotsDir, screenshotFilename);
      try {
        await page.screenshot({ path: screenshotPath, fullPage: false });
        stepObj.screenshot = screenshotFilename;
      } catch (err) {
        // ignore
      }
    }

    console.log(`\x1b[31m✖ [Step ${stepObj.id} FAILED]\x1b[0m ${stepObj.name} (${stepObj.durationMs}ms)`);
    console.log(`   Error: ${stepObj.error}`);
  }

  async skipStep(stepObj, reason = '') {
    stepObj.endTime = Date.now();
    stepObj.durationMs = 0;
    stepObj.status = 'SKIPPED';
    stepObj.details = reason;
    console.log(`\x1b[33m⏸ [Step ${stepObj.id} SKIPPED]\x1b[0m ${stepObj.name} - ${reason}`);
  }

  finish() {
    this.endTime = Date.now();
  }

  generateReports() {
    this.finish();
    const mdReportPath = path.resolve(process.cwd(), 'workvence-diagnostic-report.md');
    const htmlReportPath = path.resolve(process.cwd(), 'workvence-diagnostic-report.html');

    const totalDurationSec = ((this.endTime - this.startTime) / 1000).toFixed(2);
    const passedCount = this.steps.filter(s => s.status === 'PASSED').length;
    const failedCount = this.steps.filter(s => s.status === 'FAILED').length;
    const skippedCount = this.steps.filter(s => s.status === 'SKIPPED').length;
    const totalSteps = this.steps.length;

    const apiCalls = this.endpoints.filter(e => e.isApi);
    const avgApiLatency = apiCalls.length > 0 
      ? Math.round(apiCalls.reduce((acc, c) => acc + (c.durationMs || 0), 0) / apiCalls.length) 
      : 0;

    // --- 1. Generate Markdown Report ---
    let md = `# 🚀 Workvence Live End-to-End Diagnostic Report\n\n`;
    md += `**Target System:** [${this.baseUrl}](${this.baseUrl})  \n`;
    md += `**Execution Date:** ${new Date().toUTCString()}  \n`;
    md += `**Total Execution Duration:** ${totalDurationSec}s  \n\n`;

    md += `## 📊 Executive Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Total Journey Steps** | ${totalSteps} |\n`;
    md += `| **Steps Passed** | ✅ ${passedCount} (${totalSteps ? Math.round((passedCount/totalSteps)*100) : 0}%) |\n`;
    md += `| **Steps Failed** | ❌ ${failedCount} |\n`;
    md += `| **Steps Skipped** | ⏸️ ${skippedCount} |\n`;
    md += `| **Total Network Requests** | ${this.endpoints.length} |\n`;
    md += `| **Total Backend API Calls** | ${apiCalls.length} |\n`;
    md += `| **Average API Response Latency** | ${avgApiLatency}ms |\n`;
    md += `| **Browser Console Errors** | ${this.consoleLogs.filter(c => c.type === 'error').length} |\n\n`;

    md += `## 🗺️ User Journey Steps\n\n`;
    md += `| # | Category | Step Name | Status | Duration | Details |\n`;
    md += `| :--- | :--- | :--- | :---: | :---: | :--- |\n`;
    for (const s of this.steps) {
      const statusIcon = s.status === 'PASSED' ? '✅ PASSED' : (s.status === 'FAILED' ? '❌ FAILED' : '⏸️ SKIPPED');
      md += `| ${s.id} | ${s.category} | **${s.name}** | ${statusIcon} | ${s.durationMs ? s.durationMs + 'ms' : '-'} | ${s.details || s.error || '-'} |\n`;
    }
    md += `\n`;

    md += `## ⏱️ Page Performance & Load Time Matrix\n\n`;
    md += `| Page / Route | URL | TTFB (ms) | DOM Ready (ms) | Full Load Time (ms) |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: |\n`;
    for (const p of this.pageMetrics) {
      const m = p.metrics || {};
      md += `| **${p.pageName}** | \`${p.url}\` | ${m.ttfb || '-'}ms | ${m.domContentLoaded || '-'}ms | **${m.loadComplete || m.duration || '-'}ms** |\n`;
    }
    md += `\n`;

    md += `## 🌐 API Endpoint Telemetry Matrix\n\n`;
    md += `| HTTP Method | Endpoint URL | Status | Latency (ms) | Health |\n`;
    md += `| :---: | :--- | :---: | :---: | :---: |\n`;
    for (const ep of apiCalls) {
      const isSuccess = ep.status >= 200 && ep.status < 400;
      const healthBadge = isSuccess ? '🟢 OK' : '🔴 ERROR';
      md += `| \`${ep.method}\` | \`${ep.url}\` | **${ep.status || 'FAILED'}** | ${ep.durationMs}ms | ${healthBadge} |\n`;
    }
    md += `\n`;

    if (this.errors.length > 0 || this.consoleLogs.filter(c => c.type === 'error').length > 0) {
      md += `## ⚠️ Errors & Anomalies Log\n\n`;
      for (const err of this.errors) {
        md += `- **[Runtime Exception]**: ${err.message} (${err.time})\n`;
      }
      for (const clog of this.consoleLogs.filter(c => c.type === 'error')) {
        md += `- **[Console Error]**: \`${clog.text}\`\n`;
      }
      md += `\n`;
    }

    fs.writeFileSync(mdReportPath, md, 'utf8');

    // --- 2. Generate Interactive HTML Report ---
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Workvence E2E Diagnostic & Journey Telemetry Report</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --heading: #f0f6fc;
      --accent: #10b981;
      --accent-glow: rgba(16, 185, 129, 0.15);
      --danger: #f85149;
      --warning: #e3b341;
      --info: #58a6ff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      padding: 30px 20px;
      line-height: 1.5;
    }
    .container { max-width: 1300px; margin: 0 auto; }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 20px;
    }
    h1 { color: var(--heading); font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .subtitle { color: #8b949e; font-size: 14px; margin-top: 6px; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
    }
    .badge-passed { background: var(--accent-glow); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .badge-failed { background: rgba(248,81,73,0.15); color: #f85149; border: 1px solid rgba(248,81,73,0.3); }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .stat-label { font-size: 13px; color: #8b949e; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .stat-value { font-size: 28px; font-weight: 800; color: var(--heading); margin-top: 6px; }
    .stat-value.green { color: #34d399; }
    .stat-value.red { color: #f85149; }
    .stat-value.blue { color: #58a6ff; }

    .section-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .section-header {
      font-size: 18px;
      font-weight: 700;
      color: var(--heading);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
      text-align: left;
    }
    th {
      background: #21262d;
      color: #8b949e;
      padding: 12px 14px;
      font-weight: 600;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid #21262d;
    }
    tr:hover td { background: rgba(255,255,255,0.02); }
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      background: rgba(110,118,129,0.15);
      padding: 2px 6px;
      border-radius: 4px;
      color: #79c0ff;
    }
    .tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 600;
    }
    .tag-passed { background: rgba(16,185,129,0.2); color: #34d399; }
    .tag-failed { background: rgba(248,81,73,0.2); color: #f85149; }
    .tag-skipped { background: rgba(227,179,65,0.2); color: #e3b341; }
    .tag-get { background: rgba(56,189,248,0.2); color: #38bdf8; }
    .tag-post { background: rgba(16,185,129,0.2); color: #34d399; }
    .tag-put { background: rgba(251,146,60,0.2); color: #fb923c; }
    .tag-delete { background: rgba(248,81,73,0.2); color: #f85149; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Workvence Live End-to-End Diagnostic Report</h1>
        <div class="subtitle">Environment: <strong>${this.baseUrl}</strong> | Generated: ${new Date().toLocaleString()}</div>
      </div>
      <div>
        <span class="status-badge ${failedCount === 0 ? 'badge-passed' : 'badge-failed'}">
          ${failedCount === 0 ? '✔ ALL SUITES PASSED' : `✖ ${failedCount} FAILURES DETECTED`}
        </span>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Execution Time</div>
        <div class="stat-value blue">${totalDurationSec}s</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">User Journey Steps</div>
        <div class="stat-value ${failedCount === 0 ? 'green' : 'red'}">${passedCount} / ${totalSteps}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">API Endpoints Tested</div>
        <div class="stat-value">${apiCalls.length} calls</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg API Latency</div>
        <div class="stat-value">${avgApiLatency}ms</div>
      </div>
    </div>

    <!-- Section 1: User Journey Progression -->
    <div class="section-card">
      <div class="section-header">🧭 User Journey Execution Steps</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Category</th>
            <th>Step Name</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${this.steps.map(s => `
            <tr>
              <td>${s.id}</td>
              <td><code>${s.category}</code></td>
              <td><strong>${s.name}</strong></td>
              <td><span class="tag tag-${s.status.toLowerCase()}">${s.status}</span></td>
              <td>${s.durationMs !== null ? s.durationMs + 'ms' : '-'}</td>
              <td style="color: ${s.error ? '#f85149' : '#8b949e'}">${s.details || s.error || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Section 2: Page Performance Benchmarks -->
    <div class="section-card">
      <div class="section-header">⚡ Page Load & Navigation Performance Benchmarks</div>
      <table>
        <thead>
          <tr>
            <th>Page / Route</th>
            <th>URL</th>
            <th>TTFB (ms)</th>
            <th>DOM Ready (ms)</th>
            <th>Full Page Load (ms)</th>
          </tr>
        </thead>
        <tbody>
          ${this.pageMetrics.map(p => `
            <tr>
              <td><strong>${p.pageName}</strong></td>
              <td><code>${p.url}</code></td>
              <td>${p.metrics?.ttfb || 0}ms</td>
              <td>${p.metrics?.domContentLoaded || 0}ms</td>
              <td><strong style="color: #58a6ff">${p.metrics?.loadComplete || p.metrics?.duration || 0}ms</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Section 3: API Endpoint Telemetry Matrix -->
    <div class="section-card">
      <div class="section-header">🌐 API Endpoint Telemetry & Latency Matrix</div>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>API Endpoint URL</th>
            <th>Status Code</th>
            <th>Latency</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          ${apiCalls.map(ep => {
            const isOk = ep.status >= 200 && ep.status < 400;
            return `
            <tr>
              <td><span class="tag tag-${ep.method.toLowerCase()}">${ep.method}</span></td>
              <td><code>${ep.url}</code></td>
              <td><strong>${ep.status || 'ERR'}</strong></td>
              <td>${ep.durationMs}ms</td>
              <td><span class="tag tag-${isOk ? 'passed' : 'failed'}">${isOk ? 'OK' : 'ERROR'}</span></td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    </div>

  </div>
</body>
</html>`;

    fs.writeFileSync(htmlReportPath, html, 'utf8');
    console.log(`\n\x1b[32m✔ Diagnostic reports generated successfully:\x1b[0m`);
    console.log(`  📄 Markdown Report: ${mdReportPath}`);
    console.log(`  🌐 HTML Dashboard: ${htmlReportPath}`);
  }
}

module.exports = { DiagnosticTracker };
