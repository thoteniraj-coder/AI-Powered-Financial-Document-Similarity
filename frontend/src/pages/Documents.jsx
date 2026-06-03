import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, FileSearch, Trash2 } from 'lucide-react';

import { StatusBadge } from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DocumentPreviewModal from '../components/Documents/DocumentPreviewModal';
import { Button } from '../components/common/Button';
import { deleteDocument, getDocuments, downloadDocumentFile } from '../api/documents';
import './Documents.css';

const Documents = () => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [pageData, setPageData] = useState({ number: 0, totalElements: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewDocument, setPreviewDocument] = useState(null);

  const loadDocuments = async (page = pageData.number) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await getDocuments({ page, size: 10 });
      setDocuments(response.data.content || []);
      setPageData({
        number: response.data.number || 0,
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
      });
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Unable to load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDocument(deleteId);
      setDeleteId(null);
      await loadDocuments();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Unable to delete document.');
      setDeleteId(null);
    }
  };

  const formatAmount = (doc) => {
    if (!doc.totalAmount) return '-';
    return `${doc.currency || ''} ${Number(doc.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`.trim();
  };

  const handleDownload = async (docId, filenameStr) => {
    try {
      const response = await downloadDocumentFile(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      let filename = filenameStr || `document-${docId}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setErrorMsg('Failed to download document.');
    }
  };

  return (
    <>
      <div className="documents-page">
        <div className="page-header">
          <h1 className="page-title">Documents</h1>
          <Button variant="primary" onClick={() => navigate('/upload')}>Upload New</Button>
        </div>

        <div className="docs-filter-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search documents..." className="docs-search-input" />
          </div>
          <div className="filter-dropdowns">
            <select className="filter-select">
              <option value="">All Types</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="contract">Contract</option>
            </select>
            <select className="filter-select">
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <Button variant="outline"><Filter size={16} /> Filters</Button>
          </div>
        </div>

        <div className="table-container">
          {errorMsg && <div className="login-error">{errorMsg}</div>}
          <table className="data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Vendor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && documents.map(doc => (
                <tr key={doc.id}>
                  <td className="font-medium text-navy-900 cursor-pointer hover-underline" onClick={() => navigate(`/documents/${doc.id}`)}>
                    {doc.filename}
                  </td>
                  <td>{doc.vendor || '-'}</td>
                  <td className="capitalize">{(doc.documentType || 'other').replace('_', ' ')}</td>
                  <td><StatusBadge status={doc.processingStatus || 'pending'} /></td>
                  <td className="monospace">{formatAmount(doc)}</td>
                  <td>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</td>
                  <td className="text-right">
                      <div className="row-actions">
                        <button className="icon-btn" title="View" onClick={() => setPreviewDocument(doc)}><Eye size={16} /></button>
                        <button className="icon-btn" title="Find Similar" onClick={() => navigate('/search')}><FileSearch size={16} /></button>
                        <button className="icon-btn" title="Download" onClick={() => handleDownload(doc.id, doc.filename)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                        <button className="icon-btn danger" title="Delete" onClick={() => setDeleteId(doc.id)}><Trash2 size={16} /></button>
                      </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan="7">Loading documents...</td>
                </tr>
              )}
              {!isLoading && documents.length === 0 && (
                <tr>
                  <td colSpan="7">No documents uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <span className="pagination-info">Showing {documents.length} of {pageData.totalElements} results</span>
          <div className="pagination-controls">
            <button
              className={`page-btn ${pageData.number === 0 ? 'disabled' : ''}`}
              disabled={pageData.number === 0}
              onClick={() => loadDocuments(pageData.number - 1)}
            >
              Previous
            </button>
            {Array.from({ length: pageData.totalPages }, (_, index) => (
              <button
                key={index}
                className={`page-btn ${pageData.number === index ? 'active' : ''}`}
                onClick={() => loadDocuments(index)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className={`page-btn ${pageData.number + 1 >= pageData.totalPages ? 'disabled' : ''}`}
              disabled={pageData.number + 1 >= pageData.totalPages}
              onClick={() => loadDocuments(pageData.number + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />
    </>
  );
};

export default Documents;
