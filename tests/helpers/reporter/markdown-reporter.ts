import { Reporter, TestCase, TestResult, FullResult, FullConfig } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { CleanupTracker } from '../cleanup/cleanup';

export interface AuditLogEntry {
  type: string;
  details: string;
  url?: string;
  timestamp: string;
}

export interface PageAuditRecord {
  pageName: string;
  url: string;
  loadDurationMs: number;
  domContentLoadedMs: number;
  buttonsCount: number;
  linksCount: number;
  inputsCount: number;
  workingBehavior: string;
  authenticityStatus: string;
  consoleErrorsCount: number;
  networkStatus: string;
  timestamp: string;
}

const AUDIT_FILE = path.join(process.cwd(), 'test-results', 'page-audits.json');
const LOGS_FILE = path.join(process.cwd(), 'test-results', 'audit-logs.json');

export class MarkdownReporter implements Reporter {
  private suiteStartTime = new Date();
  private testResults: { title: string; status: string; duration: number; error?: string }[] = [];
  private static blockers: string[] = [];

  static logAudit(entry: Omit<AuditLogEntry, 'timestamp'>) {
    const fullEntry: AuditLogEntry = { ...entry, timestamp: new Date().toISOString() };
    try {
      const dir = path.dirname(LOGS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let current: AuditLogEntry[] = [];
      if (fs.existsSync(LOGS_FILE)) {
        current = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
      }
      current.push(fullEntry);
      fs.writeFileSync(LOGS_FILE, JSON.stringify(current, null, 2), 'utf-8');
    } catch {}
  }

  static addBlocker(reason: string) {
    this.blockers.push(reason);
  }

  static recordPageAudit(record: PageAuditRecord) {
    try {
      const dir = path.dirname(AUDIT_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let current: PageAuditRecord[] = [];
      if (fs.existsSync(AUDIT_FILE)) {
        current = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      }
      current.push(record);
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(current, null, 2), 'utf-8');
    } catch {}
  }

  onBegin(config: FullConfig) {
    this.suiteStartTime = new Date();
    // Clean old run caches
    try {
      if (fs.existsSync(AUDIT_FILE)) fs.unlinkSync(AUDIT_FILE);
      if (fs.existsSync(LOGS_FILE)) fs.unlinkSync(LOGS_FILE);
    } catch {}
    console.log(`\n🚀 [E2E Suite] Started execution on ${config.projects[0]?.use?.baseURL || 'Target Base URL'}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const title = test.titlePath().slice(1).join(' › ');
    this.testResults.push({
      title,
      status: result.status.toUpperCase(),
      duration: result.duration,
      error: result.error?.message
    });
  }

  async onEnd(result: FullResult) {
    const total = this.testResults.length;
    const passed = this.testResults.filter((r) => r.status === 'PASSED').length;
    const failed = this.testResults.filter((r) => r.status === 'FAILED' || r.status === 'TIMEDOUT').length;
    const skipped = this.testResults.filter((r) => r.status === 'SKIPPED').length;
    const blocked = MarkdownReporter.blockers.length;

    const cleanupSummary = CleanupTracker.generateCleanupSummary();

    // Read recorded page audits from disk
    let pageAudits: PageAuditRecord[] = [];
    try {
      if (fs.existsSync(AUDIT_FILE)) {
        pageAudits = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      }
    } catch {}

    // Read recorded audit logs from disk
    let auditLogs: AuditLogEntry[] = [];
    try {
      if (fs.existsSync(LOGS_FILE)) {
        auditLogs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
      }
    } catch {}

    // Calculate average load time
    const validLoads = pageAudits.filter((p) => p.loadDurationMs > 0);
    const avgLoadTime = validLoads.length > 0
      ? Math.round(validLoads.reduce((acc, p) => acc + p.loadDurationMs, 0) / validLoads.length)
      : 0;

    const reportContent = `# Workvence Production E2E Automation Audit Report

## Environment
- **Frontend URL**: ${process.env.BASE_URL || 'https://dev.workvence.com'}
- **Backend API**: ${process.env.NEXT_PUBLIC_SERVER_API_URL || 'https://devadmin.workvence.com/api'}
- **Socket Server**: ${process.env.NEXT_PUBLIC_SOCKET_URL || 'https://devadmin.workvence.com'}
- **Browser**: Chromium (Playwright)
- **Primary Viewport**: 1440 × 900 (Desktop) | 390 × 844 (Mobile Audit)
- **Timestamp**: ${new Date().toISOString()}
- **Duration**: ${((Date.now() - this.suiteStartTime.getTime()) / 1000).toFixed(1)}s

---

## Executive Summary
| Metric | Count / Value |
| :--- | :--- |
| **Total Tests / Phases** | ${total} |
| **Passed** | ${passed} |
| **Failed** | ${failed} |
| **Skipped** | ${skipped} |
| **Identified Blockers** | ${blocked} |
| **Pages Inspected & Audited** | ${pageAudits.length} |
| **Average Page Load Time** | **${avgLoadTime} ms** |

---

## ⚡ Page-by-Page Performance & Working Behavior Breakdown

The following table provides verified latency, DOM responsiveness, interactivity counts, and functional working behavior for every visited page:

| Page / Feature | Route / URL | Load Time | DOM Ready | Interactive Elements | Working Behavior | Data Authenticity | Network / Errors |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${
  pageAudits.length > 0
    ? pageAudits
        .map(
          (p) =>
            `| **${p.pageName}** | \`${p.url}\` | **${p.loadDurationMs > 0 ? `${p.loadDurationMs} ms` : 'Client Render'}** | ${p.domContentLoadedMs > 0 ? `${p.domContentLoadedMs} ms` : 'Ready'} | ${p.buttonsCount} buttons, ${p.linksCount} links, ${p.inputsCount} inputs | ${p.workingBehavior} | ${p.authenticityStatus} | ${p.networkStatus} |`
        )
        .join('\n')
    : '| _No individual pages audited yet._ | - | - | - | - | - | - | - |'
}

---

## Detailed User Journey Execution
${this.testResults
  .map(
    (t) =>
      `### ${t.status === 'PASSED' ? '✅' : t.status === 'SKIPPED' ? '⏭️' : '❌'} ${t.title} (${(t.duration / 1000).toFixed(1)}s)
${t.error ? `> **Error**: \`${t.error.slice(0, 300)}\`` : ''}`
  )
  .join('\n\n')}

---

## UI Integrity & Authenticity Audit Log
${
  auditLogs.length > 0
    ? auditLogs
        .map((log) => `- **[${log.type}]** ${log.details} *(Page: ${log.url || 'Global'})*`)
        .join('\n')
    : '✅ Zero dummy data leaks, dead links, or broken images detected during execution.'
}

---

## Test Data Cleanup Summary
- **Total [E2E-TEST] Records Tracked**: ${cleanupSummary.total}
- **Cleaned Up via UI**: ${cleanupSummary.cleanedUp}
- **Requires Manual Administrative Removal**: ${cleanupSummary.manualRequired}

${
  cleanupSummary.records.length > 0
    ? `| Type | ID / Title | Owner | Cleanup Status |
| :--- | :--- | :--- | :--- |
${cleanupSummary.records.map((r) => `| ${r.type} | ${r.title || r.id || 'N/A'} | ${r.owner || 'N/A'} | ${r.status} |`).join('\n')}`
    : '_No persistent records created._'
}

---

## Blockers & Production Constraints
${
  MarkdownReporter.blockers.length > 0
    ? MarkdownReporter.blockers.map((b) => `- ⚠️ ${b}`).join('\n')
    : 'None. All tested phases completed without hard blockers.'
}
`;

    const outputDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, 'E2E-REPORT.md');
    fs.writeFileSync(reportPath, reportContent, 'utf-8');
    console.log(`\n📋 [E2E Report Generated]: ${reportPath}`);
  }
}

export default MarkdownReporter;
