import client from './client';

export const getAlerts = (params) => client.get('/alerts', { params });
export const getAlert = (id) => client.get(`/alerts/${id}`);
export const updateAlert = (id, data) => client.patch(`/alerts/${id}`, data);
