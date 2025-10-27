import { factories } from '@strapi/strapi';
import type { AuditLog, AuditAction, FieldChange } from '../types';

export default factories.createCoreService('api::audit-log.audit-log', ({ strapi }) => ({

  async createAuditEntry(data: {
    contentType: string;
    recordId: string;
    action: AuditAction;
    userId?: string;
    userEmail?: string;
    changedFields?: any;
    fullPayload?: any;
  }) {
    return await strapi.entityService.create('api::audit-log.audit-log', {
      data
    });
  },

  calculateDiff(original: Record<string, any>, updated: Record<string, any>): Record<string, FieldChange> {
    const changes: Record<string, FieldChange> = {};

    for (const key in updated) {
      if (key === 'updatedAt' || key === 'id' || key === 'documentId') continue;

      if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
        changes[key] = {
          old: original[key],
          new: updated[key]
        };
      }
    }

    return changes;
  },

  shouldAudit(contentType: string): boolean {
    const config = strapi.config.get('audit', { enabled: true, excludeContentTypes: [] });

    if (!config.enabled) return false;

    const excludeTypes = [
      'admin::user',
      'admin::role',
      'admin::permission',
      'plugin::upload.file',
      'api::audit-log.audit-log',
      ...config.excludeContentTypes
    ];

    return !excludeTypes.includes(contentType);
  }
}));