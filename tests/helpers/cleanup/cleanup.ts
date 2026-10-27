import * as fs from 'fs';
import * as path from 'path';

export interface CreatedRecord {
  type: 'USER' | 'GIG' | 'BRIEF' | 'PROPOSAL' | 'ORDER' | 'MESSAGE' | 'REVIEW';
  id?: string;
  title?: string;
  owner?: string;
  status: 'ACTIVE' | 'CLEANED_UP' | 'CLEANUP_FAILED' | 'MANUAL_CLEANUP_REQUIRED';
  details?: string;
}

const CLEANUP_FILE = path.join(process.cwd(), 'test-results', 'cleanup-records.json');
const LOCK_FILE = path.join(process.cwd(), 'test-results', 'cleanup-records.lock');

function withLock<T>(fn: () => T): T {
  const dir = path.dirname(LOCK_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const maxRetries = 100;
  const retryIntervalMs = 50;
  let fd: number | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      fd = fs.openSync(LOCK_FILE, 'wx');
      break;
    } catch (err: any) {
      if (err.code === 'EEXIST') {
        const waitTill = Date.now() + retryIntervalMs;
        while (Date.now() < waitTill) {}
      } else {
        throw err;
      }
    }
  }

  if (fd === null) {
    throw new Error('Failed to acquire cleanup records lock after multiple attempts');
  }

  try {
    return fn();
  } finally {
    try {
      fs.closeSync(fd);
    } catch {}
    try {
      fs.unlinkSync(LOCK_FILE);
    } catch {}
  }
}

function persistRecords(records: CreatedRecord[]) {
  const dir = path.dirname(CLEANUP_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tempFile = path.join(dir, `cleanup-records.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
  fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), 'utf-8');
  fs.renameSync(tempFile, CLEANUP_FILE);
}

function loadRecords(): CreatedRecord[] {
  if (fs.existsSync(CLEANUP_FILE)) {
    const raw = fs.readFileSync(CLEANUP_FILE, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  }
  return [];
}

function findRecord(records: CreatedRecord[], idOrTitle: string): CreatedRecord | undefined {
  const matches = records.filter((r) => r.id === idOrTitle || r.title === idOrTitle);
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous record key: "${idOrTitle}" matches ${matches.length} records by ID or title. A unique record key is required for updates.`
    );
  }
  if (matches.length === 1) {
    return matches[0];
  }
  return undefined;
}

export class CleanupTracker {
  private static records: CreatedRecord[] = loadRecords();

  static register(record: Omit<CreatedRecord, 'status'> & { status?: CreatedRecord['status'] }) {
    withLock(() => {
      const records = loadRecords();
      const newRecord: CreatedRecord = {
        ...record,
        status: record.status ?? 'MANUAL_CLEANUP_REQUIRED',
      };
      records.push(newRecord);
      this.records = records;
      persistRecords(records);
    });
  }

  static updateStatus(idOrTitle: string, status: CreatedRecord['status'], details?: string) {
    withLock(() => {
      const records = loadRecords();
      const record = findRecord(records, idOrTitle);
      if (!record) {
        throw new Error(`Record not found for key "${idOrTitle}". A unique, existing record key is required to update status.`);
      }
      record.status = status;
      if (details) record.details = details;
      this.records = records;
      persistRecords(records);
    });
  }

  static getAllRecords(): CreatedRecord[] {
    const records = loadRecords();
    if (records.length > 0) return records;
    return [...this.records];
  }

  static generateCleanupSummary(): {
    total: number;
    cleanedUp: number;
    manualRequired: number;
    records: CreatedRecord[];
  } {
    const records = this.getAllRecords();
    const cleanedUp = records.filter((r) => r.status === 'CLEANED_UP').length;
    const manualRequired = records.filter((r) => r.status === 'MANUAL_CLEANUP_REQUIRED').length;

    return {
      total: records.length,
      cleanedUp,
      manualRequired,
      records
    };
  }
}
