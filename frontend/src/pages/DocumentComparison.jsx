import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

import ScoreRing from '../components/Search/ScoreRing';
import { Button } from '../components/common/Button';
import { getDocument, getDocuments } from '../api/documents';
import './DocumentComparison.css';

const formatAmount = (document) => {
  if (!document?.totalAmount) return '-';
  return `${document.currency || ''} ${Number(document.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`.trim();
};

const buildFields = (document) => ({
  Vendor: document?.vendor || '-',
  'Invoice Number': document?.invoiceNumber || '-',
  Date: document?.invoiceDate || '-',
  Amount: formatAmount(document),
  Type: document?.documentType || '-',
});

const DocumentComparison = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('source');
  const targetId = searchParams.get('target');
  const [sourceDocument, setSourceDocument] = useState(null);
  const [targetDocument, setTargetDocument] = useState(null);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(sourceId || targetId));
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadDocuments = async () => {
      if (!sourceId && !targetId) {
        setIsLoading(false);
        return;
      }

      try {
        const [sourceResponse, targetResponse] = await Promise.all([
          sourceId ? getDocument(sourceId) : Promise.resolve({ data: null }),
          targetId ? getDocument(targetId) : Promise.resolve({ data: null }),
        ]);
        setSourceDocument(sourceResponse.data);
        setTargetDocument(targetResponse.data);
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Unable to load comparison documents.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [sourceId, targetId]);

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const res = await getDocuments({ size: 50 });
        setAvailableDocs(res.data?.content || []);
      } catch (e) {
        console.error("Failed to load available docs", e);
      }
    };
    fetchAvailable();
  }, []);

  const sourceFields = useMemo(() => buildFields(sourceDocument), [sourceDocument]);
  const targetFields = useMemo(() => buildFields(targetDocument), [targetDocument]);
  const comparisonScore = useMemo(() => {
    if (!sourceDocument || !targetDocument) return 0;
    const labels = Object.keys(sourceFields);
    const matches = labels.filter(label => sourceFields[label] !== '-' && sourceFields[label] === targetFields[label]).length;
    return matches / labels.length;
  }, [sourceDocument, targetDocument, sourceFields, targetFields]);

  const renderMetadata = (fields, otherFields) => (
    <div className="compare-section">
      <h3 className="section-title">Metadata</h3>
      {Object.entries(fields).map(([label, value]) => {
        const isMatch = value !== '-' && value === otherFields[label];
        return (
          <div className="field-row" key={label}>
            <span className="field-label">{label}</span>
            <span className={`field-value ${isMatch ? 'match' : 'diff'}`}>{value}</span>
          </div>
        );
      })}
    </div>
  );

  const renderDocumentColumn = (label, document, fields, otherFields, isSource) => (
    <div className="compare-col">
      <div className="col-header">
        <span className={`col-badge ${label === 'Target Document' ? 'target' : ''}`}>{label}</span>
        <h2 className="col-doc-name">{document?.filename || 'No document selected'}</h2>
      </div>

      {document ? (
        <>
          {renderMetadata(fields, otherFields)}
          <div className="compare-section">
            <h3 className="section-title">Extracted Text</h3>
            <div className="text-scroll-area">
              {document.extractedText ? (
                <pre style={{ margin: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', whiteSpace: 'pre-wrap', color: 'var(--slate-700)' }}>
                  {document.extractedText}
                </pre>
              ) : (
                <p className="text-slate-500 italic">No extracted text available.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="compare-section">
          <h3 className="section-title">Select a document</h3>
          <p className="text-slate-500" style={{ marginBottom: '12px' }}>Choose a document to compare against the other column.</p>
          <select 
            className="w-full p-2 border border-slate-300 rounded"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '14px' }}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              if (isSource) {
                navigate(`/documents/compare?source=${val}${targetId ? `&target=${targetId}` : ''}`);
              } else {
                navigate(`/documents/compare?target=${val}${sourceId ? `&source=${sourceId}` : ''}`);
              }
            }}
          >
            <option value="">-- Choose Document --</option>
            {availableDocs.map(d => (
              <option key={d.id} value={d.id}>{d.filename}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="compare-page">
        <div className="compare-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="compare-title-row">
            <h1 className="page-title">Document Comparison</h1>
            <div className="overall-score">
              <ScoreRing score={comparisonScore} size="lg" />
              <span className="score-label">Metadata Similarity</span>
            </div>
          </div>
        </div>

        <div className="compare-actions">
          <Button variant="primary" disabled={!sourceDocument || !targetDocument}>Mark as Duplicate</Button>
          <Button variant="outline" className="text-warning" disabled={!sourceDocument || !targetDocument}>
            <AlertTriangle size={16} /> Flag for Review
          </Button>
          <Button variant="ghost" onClick={() => navigate('/documents')}>Choose Documents</Button>
        </div>

        {isLoading && <div className="compare-section">Loading comparison data...</div>}
        {errorMsg && <div className="login-error">{errorMsg}</div>}

        {!isLoading && (
          <div className="compare-grid">
            {renderDocumentColumn('Source Document', sourceDocument, sourceFields, targetFields, true)}
            <div className="compare-divider"></div>
            {renderDocumentColumn('Target Document', targetDocument, targetFields, sourceFields, false)}
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentComparison;
