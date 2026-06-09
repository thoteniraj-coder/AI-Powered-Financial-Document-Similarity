import client from './client';

export const getAuditLogs = (params) => client.get('/audit', { params });
export const exportAuditLogs = (params) => client.get('/audit/export', { params, responseType: 'blob' });
