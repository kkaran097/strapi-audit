export interface AuditLog {
  id: number;
  documentId: string;
  contentType: string;
  recordId: string;
  action: AuditAction;
  userId?: string;
  userEmail?: string;
  changedFields?: Record<string, FieldChange>;
  fullPayload?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction = 'create' | 'update' | 'delete';

export interface FieldChange {
  old: any;
  new: any;
}

export interface AuditLogFilters {
  contentType?: string;
  userId?: string;
  action?: AuditAction;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AuditConfig {
  enabled: boolean;
  excludeContentTypes: string[];
}