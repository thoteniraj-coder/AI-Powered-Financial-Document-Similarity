import client from './client';

export const uploadDocument = (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata?.documentType) {
    formData.append('documentType', metadata.documentType);
  }
  return client.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getDocuments = (params) => client.get('/documents', { params });
export const getDocument = (id) => client.get(`/documents/${id}`);
export const downloadDocumentFile = (id) => client.get(`/documents/${id}/download`, { responseType: 'blob' });
export const getSpreadsheetPreview = (id) => client.get(`/documents/${id}/spreadsheet-preview`);
export const deleteDocument = (id) => client.delete(`/documents/${id}`);
export const searchSimilar = (file, options) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (key === 'filters' && value) {
        Object.entries(value).forEach(([filterKey, filterValue]) => {
          if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
            formData.append(`filters.${filterKey}`, filterValue);
          }
        });
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
  }
  return client.post('/documents/search', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const findSimilar = (documentId, options) => {
  const params = {};
  if (options?.topK) params.topK = options.topK;
  if (options?.threshold !== undefined) params.threshold = options.threshold;
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
  }
  return client.post(`/documents/${documentId}/find-similar`, null, { params });
};
export const compareDocuments = (input) => {
  if (Array.isArray(input)) {
    return client.post('/documents/compare', {
      documentIdA: input[0],
      documentIdB: input[1],
    });
  }
  return client.post('/documents/compare', input);
};
