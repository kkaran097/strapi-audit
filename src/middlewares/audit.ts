import type { Core } from '@strapi/strapi';

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: any) => {
    let originalData: any = null;
    let contentTypeUid: string | null = null;

    const isApiRoute = ctx.request.url.startsWith('/api/');
    const isContentManagerRoute = ctx.request.url.includes('/content-manager/');
    const isModifyingRequest = ['POST', 'PUT', 'DELETE'].includes(ctx.request.method);

    if ((isApiRoute || isContentManagerRoute) && isModifyingRequest) {
      console.log("Audit middleware intercepted:', {
        url: ctx.request.url,
        method: ctx.request.method,
        isContentManager: isContentManagerRoute
      });

      if (isContentManagerRoute) {
        const urlMatch = ctx.request.url.match(/\/collection-types\/(api::[^\/]+)/);
        if (urlMatch) {
          contentTypeUid = urlMatch[1];
        }
      } else if (ctx.state?.route?.info?.apiName) {
        contentTypeUid = ctx.state.route.info.apiName;
      }

      console.log('Content type UID:', contentTypeUid);

      if (!contentTypeUid) {
        return await next();
      }

      if (!strapi.service('api::audit-log.audit-log').shouldAudit(contentTypeUid as any)) {
        return await next();
      }

      if (ctx.request.method === 'PUT') {
        const docId = ctx.params.documentId || ctx.params.id;
        if (docId) {
          try {
            originalData = await strapi.entityService.findOne(
              contentTypeUid as any,
              docId
            );
          } catch (error) {
            // TODO: Add proper logging
          }
        }
      }
    }

    await next();

    if (ctx.response.status >= 200 && ctx.response.status < 300 && contentTypeUid) {
      setImmediate(() => {
        logAuditEntry(ctx, originalData, contentTypeUid, strapi).catch(() => {
          // TODO: Add proper error logging
        });
      });
    }
  };
};

async function logAuditEntry(
  ctx: any,
  originalData: any,
  contentTypeUid: string,
  strapi: Core.Strapi
) {
  try {
    const auditService = strapi.service('api::audit-log.audit-log');
    const user = ctx.state.user || ctx.state.userAbility?.user;
    const method = ctx.request.method;

    let responseData = ctx.response.body?.data || ctx.response.body;

    if (!responseData || typeof responseData !== 'object') return;

    const recordId = responseData.documentId || responseData.id || ctx.params.documentId || ctx.params.id;
    if (!recordId) return;

    let action: 'create' | 'update' | 'delete';
    let changedFields: any = null;
    let fullPayload: any = null;

    switch (method) {
      case 'POST':
        action = 'create';
        fullPayload = responseData;
        break;
      case 'PUT':
        action = 'update';
        if (originalData && responseData) {
          changedFields = auditService.calculateDiff(originalData, responseData);
        }
        fullPayload = responseData;
        break;
      case 'DELETE':
        action = 'delete';
        fullPayload = originalData;
        break;
      default:
        return;
    }

    await auditService.createAuditEntry({
      contentType: contentTypeUid,
      recordId,
      action,
      userId: user?.documentId || user?.id || null,
      userEmail: user?.email || null,
      changedFields,
      fullPayload
    });
  } catch (error) {
    // TODO: Add proper audit logging failure handling
  }
}