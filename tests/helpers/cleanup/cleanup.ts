export interface CreatedRecord {
  type: 'USER' | 'GIG' | 'BRIEF' | 'PROPOSAL' | 'ORDER' | 'MESSAGE' | 'REVIEW';
  id?: string;
  title?: string;
  owner?: string;
  status: 'ACTIVE' | 'CLEANED_UP' | 'CLEANUP_FAILED' | 'MANUAL_CLEANUP_REQUIRED';
  details?: string;
}

export class CleanupTracker {
  private static records: CreatedRecord[] = [];

  static register(record: Omit<CreatedRecord, 'status'> & { status?: CreatedRecord['status'] }) {
    this.records.push({
      status: 'MANUAL_CLEANUP_REQUIRED',
      ...record
    });
  }

  static updateStatus(idOrTitle: string, status: CreatedRecord['status'], details?: string) {
    const record = this.records.find((r) => r.id === idOrTitle || r.title === idOrTitle);
    if (record) {
      record.status = status;
      if (details) record.details = details;
    }
  }

  static getAllRecords(): CreatedRecord[] {
    return [...this.records];
  }

  static generateCleanupSummary(): {
    total: number;
    cleanedUp: number;
    manualRequired: number;
    records: CreatedRecord[];
  } {
    const cleanedUp = this.records.filter((r) => r.status === 'CLEANED_UP').length;
    const manualRequired = this.records.filter((r) => r.status === 'MANUAL_CLEANUP_REQUIRED').length;

    return {
      total: this.records.length,
      cleanedUp,
      manualRequired,
      records: this.records
    };
  }
}
