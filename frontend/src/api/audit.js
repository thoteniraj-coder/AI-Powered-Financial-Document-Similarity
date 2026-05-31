import client from './client';

export const getAuditLogs = (params) => client.get('/api/audit', { params });
export const exportAuditLogs = (params) => client.get('/api/audit/export', { params, responseType: 'blob' });
