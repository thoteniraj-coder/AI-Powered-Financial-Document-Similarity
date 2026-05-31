import client from './client';

export const getAlerts = (params) => client.get('/api/alerts', { params });
export const getAlert = (id) => client.get(`/api/alerts/${id}`);
export const updateAlert = (id, data) => client.patch(`/api/alerts/${id}`, data);
