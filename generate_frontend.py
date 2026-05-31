import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')
    print(f"Created {path}")

# Phase 2: API
documents_api = """
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
"""

alerts_api = """
import client from './client';

export const getAlerts = (params) => client.get('/api/alerts', { params });
export const getAlert = (id) => client.get(`/api/alerts/${id}`);
export const updateAlert = (id, data) => client.patch(`/api/alerts/${id}`, data);
"""

audit_api = """
import client from './client';

export const getAuditLogs = (params) => client.get('/api/audit', { params });
export const exportAuditLogs = (params) => client.get('/api/audit/export', { params, responseType: 'blob' });
"""

write_file('frontend/src/api/documents.js', documents_api)
write_file('frontend/src/api/alerts.js', alerts_api)
write_file('frontend/src/api/audit.js', audit_api)
