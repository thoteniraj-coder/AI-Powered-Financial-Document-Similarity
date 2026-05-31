import client from './client';

export const uploadDocument = (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }
  return client.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getDocuments = (params) => client.get('/api/documents', { params });
export const getDocument = (id) => client.get(`/api/documents/${id}`);
export const deleteDocument = (id) => client.delete(`/api/documents/${id}`);
export const searchSimilar = (file, options) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (options) formData.append('options', JSON.stringify(options));
  return client.post('/api/documents/search', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const findSimilar = (documentId) => client.post(`/api/documents/${documentId}/find-similar`);
export const compareDocuments = (documentIds) => client.post('/api/documents/compare', { documentIds });
