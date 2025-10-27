import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

export default factories.createCoreController(
  'api::audit-log.audit-log',
  ({ strapi }: { strapi: Core.Strapi }) => ({

    async find(ctx) {
      const {
        contentType,
        userId,
        action,
        dateRange,
        sort = '-createdAt',
        pagination = { page: 1, pageSize: 25 },
        ...otherParams
      } = ctx.query;

      const filters: any = {};

      if (contentType) filters.contentType = { $eq: contentType };
      if (userId) filters.userId = { $eq: userId };
      if (action) filters.action = { $eq: action };

      if (dateRange && typeof dateRange === 'object') {
        const range = dateRange as { start?: string; end?: string };
        if (range.start || range.end) {
          filters.createdAt = {};
          if (range.start) filters.createdAt.$gte = range.start;
          if (range.end) filters.createdAt.$lte = range.end;
        }
      }

      const result = await strapi.entityService.findMany('api::audit-log.audit-log', {
        filters,
        sort,
        pagination,
        ...otherParams
      });

      return result;
    },

    async findOne(ctx) {
      const { id } = ctx.params;

      const result = await strapi.entityService.findOne('api::audit-log.audit-log', id);

      return result;
    }
  })
);