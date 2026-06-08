import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Columns,
  Download,
  Eye,
  FileSearch,
  FileText,
  ShieldAlert,
  Tag,
  Trash2,
} from 'lucide-react';

import { StatusBadge } from '../components/common/StatusBadge';
import ScoreRing from '../components/Search/ScoreRing';
import { Button } from '../components/common/Button';
import { getDocument, findSimilar, downloadDocumentFile } from '../api/documents';
import './DocumentDetail.css';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [document, setDocument] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [similarDocs, setSimilarDocs] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'view' ? 'view' : 'metadata');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const response = await getDocument(id);
        setDocument(response.data);
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Unable to load document.');
      }
    };

    const loadSimilar = async () => {
      setLoadingSimilar(true);
      try {
        const res = await findSimilar(id, { topK: 3, threshold: 0.5 });
        setSimilarDocs(res.data.results || []);
      } catch (err) {
        console.error('Failed to load similar docs', err);
      } finally {
        setLoadingSimilar(false);
      }
    };

    loadDocument();
    loadSimilar();
  }, [id]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'view' && activeTab !== 'view') {
      setActiveTab('view');
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    if (activeTab !== 'view' || !id) return undefined;

    let objectUrl = '';
    let isMounted = true;

    const loadPreview = async () => {
      setIsPreviewLoading(true);
      setPreviewError('');

      try {
        const response = await downloadDocumentFile(id);
        objectUrl = window.URL.createObjectURL(response.data);
        if (!isMounted) {
          window.URL.revokeObjectURL(objectUrl);
          return;
        }
        setPreviewUrl(objectUrl);
        setPreviewType(response.data.type || document?.fileType || '');
      } catch (error) {
        if (isMounted) {
          setPreviewError('Unable to load the document preview.');
        }
      } finally {
        if (isMounted) {
          setIsPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [activeTab, document?.fileType, id]);

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'view') {
      setSearchParams({ tab: 'view' });
    } else if (searchParams.has('tab')) {
      setSearchParams({});
    }
  };

  const handleFindSimilar = async () => {
    try {
      const response = await findSimilar(id, { topK: 10, threshold: 0.7 });
      navigate('/search/results', {
        state: {
          response: response.data,
          queryName: document?.filename || 'Document',
          threshold: 70,
        },
      });
    } catch (error) {
      setErrorMsg('Failed to run similarity search.');
    }
  };

  const amount = document?.totalAmount
    ? `${document.currency || ''} ${Number(document.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`.trim()
    : '-';

  const uploadedDate = document?.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : '-';
  const fileType = document?.fileType || document?.contentType || 'Unknown';
  const chunksCount = document?.chunksCount || document?.chunks?.length || 0;
  const duplicateRisk = similarDocs.length >= 3 ? 'High' : similarDocs.length > 0 ? 'Medium' : 'Low';
  const duplicateRiskClass = duplicateRisk.toLowerCase();
  const duplicateRiskWidth = duplicateRisk === 'High' ? '100%' : duplicateRisk === 'Medium' ? '56%' : '18%';

  const formatMatchCategory = (category) => {
    if (!category) return 'Match';
    return category.replace(/_/g, ' ').toLowerCase();
  };

  const handleDownload = async () => {
    try {
      const response = await downloadDocumentFile(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      let filename = document?.filename || `document-${id}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      link.setAttribute('download', filename);
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setErrorMsg('Failed to download document.');
    }
  };

  return (
    <>
      <div className="doc-detail-page">
        <button className="back-btn" onClick={() => navigate('/documents')}>
          <ArrowLeft size={16} />
          <span>Back to Documents</span>
        </button>
        
        <div className="doc-header">
          <div className="doc-title-row">
            <div className="doc-title-main">
              <div className="doc-file-icon">
                <FileText size={22} />
              </div>
              <div className="doc-title-copy">
                <h1 className="doc-filename">{document?.filename || 'Loading document...'}</h1>
                <StatusBadge status={document?.processingStatus || 'pending'} />
              </div>
            </div>
            <div className="doc-header-actions">
              <Button variant="primary" onClick={handleFindSimilar}>
                <FileSearch size={16} /> Find Similar
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/documents/compare?source=${id}`)}>
                <Columns size={16} /> Compare
              </Button>
            </div>
          </div>
          <div className="doc-meta-bar">
            <span>Uploaded: {uploadedDate}</span>
            <span className="dot-separator">/</span>
            <span>By: {document?.uploadedBy || '-'}</span>
            <span className="dot-separator">/</span>
            <span className="doc-id-text">ID: {id || 'doc-12345'}</span>
          </div>
          <div className="doc-secondary-actions">
            <Button variant="ghost" onClick={handleDownload}>
              <Download size={16} /> Download
            </Button>
            <Button variant="ghost" className="text-danger">
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>
        {errorMsg && <div className="login-error">{errorMsg}</div>}

        <div className="doc-layout">
          <div className="doc-main">
            <div className="doc-card">
              <div className="doc-tabs">
                <button 
                  className={`doc-tab ${activeTab === 'metadata' ? 'active' : ''}`}
                  onClick={() => selectTab('metadata')}
                >Metadata</button>
                <button
                  className={`doc-tab ${activeTab === 'view' ? 'active' : ''}`}
                  onClick={() => selectTab('view')}
                ><Eye size={16} /> Document View</button>
                <button 
                  className={`doc-tab ${activeTab === 'text' ? 'active' : ''}`}
                  onClick={() => selectTab('text')}
                >Extracted Text</button>
                <button 
                  className={`doc-tab ${activeTab === 'chunks' ? 'active' : ''}`}
                  onClick={() => selectTab('chunks')}
                >Chunks ({document?.chunksCount || 0})</button>
              </div>
              
              <div className="doc-panel">
                {activeTab === 'metadata' && (
                  <>
                    <div className="meta-grid">
                      <div className="meta-group">
                        <label>Vendor</label>
                        <div className="meta-val">{document?.vendor || '-'}</div>
                      </div>
                      <div className="meta-group">
                        <label>Document Type</label>
                        <div className="meta-val">
                          <span className="doc-type-pill">{document?.documentType || '-'}</span>
                        </div>
                      </div>
                      <div className="meta-group">
                        <label>Invoice Number</label>
                        <div className="meta-val">{document?.invoiceNumber || '-'}</div>
                      </div>
                      <div className="meta-group">
                        <label>Date</label>
                        <div className="meta-val">{document?.invoiceDate || '-'}</div>
                      </div>
                      <div className="meta-group">
                        <label>Amount</label>
                        <div className="meta-val monospace">{amount}</div>
                      </div>
                      <div className="meta-group">
                        <label>Currency</label>
                        <div className="meta-val">{document?.currency || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="tags-section">
                      <label>Tags</label>
                      <div className="tags-list">
                        <span className="tag empty-tag"><Tag size={13} /> No tags returned by the document API.</span>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'view' && (
                  <div className="document-view-panel">
                    {isPreviewLoading && (
                      <div className="document-view-state">Loading document preview...</div>
                    )}

                    {!isPreviewLoading && previewError && (
                      <div className="document-view-state">{previewError}</div>
                    )}

                    {!isPreviewLoading && !previewError && previewUrl && previewType.startsWith('image/') && (
                      <img className="document-preview-image" src={previewUrl} alt={document?.filename || 'Document preview'} />
                    )}

                    {!isPreviewLoading && !previewError && previewUrl && previewType === 'application/pdf' && (
                      <iframe className="document-preview-frame" src={previewUrl} title={document?.filename || 'Document preview'} />
                    )}

                    {!isPreviewLoading && !previewError && previewUrl && previewType.startsWith('text/') && (
                      <iframe className="document-preview-frame" src={previewUrl} title={document?.filename || 'Document preview'} />
                    )}

                    {!isPreviewLoading && !previewError && previewUrl && !previewType.startsWith('image/') && previewType !== 'application/pdf' && !previewType.startsWith('text/') && (
                      <div className="document-view-state">
                        Preview is not available for this file type. Use Download to open the original file.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="text-preview">
                    {document?.extractedText ? (
                      <pre>{document.extractedText}</pre>
                    ) : (
                      <div className="empty-state">No extracted text available.</div>
                    )}
                  </div>
                )}

                {activeTab === 'chunks' && (
                  <div className="chunks-list">
                    {document?.chunks && document.chunks.length > 0 ? (
                      document.chunks.map((chunk, idx) => (
                        <div key={idx} className="chunk-item">
                          <div className="chunk-header">Chunk {idx + 1}</div>
                          <div className="chunk-text">{typeof chunk === 'string' ? chunk : chunk.text || JSON.stringify(chunk)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">No chunks available.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="doc-sidebar">
            <div className="similar-card">
              <div className="side-card-title-row">
                <h3 className="card-title">Similar documents</h3>
                <button className="side-link" onClick={handleFindSimilar}>View all</button>
              </div>
              
              <div className="similar-list">
                {loadingSimilar ? (
                  <div className="similar-item">
                    <div className="similar-info">
                      <div className="similar-name">Loading matches...</div>
                    </div>
                  </div>
                ) : similarDocs.length > 0 ? (
                  similarDocs.map((doc, idx) => (
                    <div key={doc.documentId || idx} className="similar-item cursor-pointer" onClick={() => navigate(`/documents/${doc.documentId}`)}>
                      <ScoreRing score={doc.similarityScore} size="sm" />
                      <div className="similar-info">
                        <div className="similar-name truncate" title={doc.filename}>{doc.filename}</div>
                        <div className="similar-meta">{formatMatchCategory(doc.matchCategory)}</div>
                      </div>
                      <ChevronRight size={16} className="similar-chevron" />
                    </div>
                  ))
                ) : (
                  <div className="similar-item">
                    <ScoreRing score={0} size="sm" />
                    <div className="similar-info">
                      <div className="similar-name truncate">No strong matches</div>
                      <div className="similar-meta">Try adjusting search parameters.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3 className="info-card-title">File details</h3>
              <div className="info-row"><span>File type</span><strong>{fileType}</strong></div>
              <div className="info-row"><span>Processing</span><strong className="success-text">{document?.processingStatus || 'pending'}</strong></div>
              <div className="info-row"><span>OCR used</span><strong>{document?.ocrUsed ? 'Yes' : 'No'}</strong></div>
              <div className="info-row"><span>Chunks</span><strong>{chunksCount}</strong></div>
              <div className="info-row"><span>Retention</span><strong>7 years</strong></div>
              <div className="info-row"><span>Expires</span><strong className="monospace">2033-01-06</strong></div>
            </div>

            <div className="info-card">
              <div className="risk-title">
                <ShieldAlert size={16} />
                <h3 className="info-card-title">Duplicate risk</h3>
              </div>
              <div className="risk-meter">
                <span style={{ width: duplicateRiskWidth }} className={`risk-fill ${duplicateRiskClass}`} />
              </div>
              <div className="risk-summary">
                <strong className={`risk-label ${duplicateRiskClass}`}>{duplicateRisk}</strong>
                <span>{similarDocs.length} near match{similarDocs.length === 1 ? '' : 'es'} found in system</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentDetail;
