import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ChevronDown, Copy, FilePlus, Files, Search } from 'lucide-react';

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

const buildComparisonUrl = ({ source, target }) => {
  const params = new URLSearchParams();
  if (source) params.set('source', source);
  if (target) params.set('target', target);
  return `/documents/compare?${params.toString()}`;
};

const formatDateLine = (document) => {
  if (!document) return 'Choose a document from the list below';
  const uploaded = document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : '-';
  return `Uploaded ${uploaded} / ${document.uploadedBy || '-'}`;
};

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

  const scoreLabel = targetDocument
    ? comparisonScore >= 0.8
      ? 'Strong metadata match'
      : comparisonScore >= 0.4
        ? 'Partial metadata match'
        : 'Low metadata match'
    : 'No target selected';

  const scoreClass = targetDocument
    ? comparisonScore >= 0.8
      ? 'strong'
      : comparisonScore >= 0.4
        ? 'partial'
        : 'low'
    : 'empty';

  const handleSelectDocument = (value, isSource) => {
    if (!value) return;
    navigate(buildComparisonUrl({
      source: isSource ? value : sourceId,
      target: isSource ? targetId : value,
    }));
  };

  const renderMetadata = (fields, otherFields, hasOtherDocument) => (
    <div className="compare-metadata">
      <div className="compare-section-title">Metadata</div>
      {Object.entries(fields).map(([label, value]) => {
        const isEmpty = value === '-';
        const isMatch = hasOtherDocument && value !== '-' && value === otherFields[label];
        const isDiff = hasOtherDocument && !isMatch && !isEmpty;
        return (
          <div className="compare-field-row" key={label}>
            <span className="compare-field-label">{label}</span>
            <span className={`compare-field-value ${isMatch ? 'match' : ''} ${isDiff ? 'diff' : ''} ${isEmpty ? 'empty' : ''}`}>
              {isEmpty ? 'Not set' : value}
            </span>
          </div>
        );
      })}
    </div>
  );

  const renderDocumentColumn = (label, document, fields, otherFields, isSource) => (
    <div className={`compare-col ${isSource ? 'source' : 'target'}`}>
      <div className="compare-col-header">
        <span className={`compare-col-type ${isSource ? 'source' : 'target'}`}>{label}</span>
        <h2 className={`compare-col-name ${!document ? 'empty' : ''}`}>{document?.filename || 'No document selected'}</h2>
        <div className="compare-col-sub">{formatDateLine(document)}</div>
      </div>

      {document ? (
        <>
          {renderMetadata(fields, otherFields, isSource ? Boolean(targetDocument) : Boolean(sourceDocument))}
          <div className="compare-text-section">
            <div className="compare-section-title">Extracted text</div>
            <div className="compare-text-box">
              {document.extractedText ? (
                <pre>{document.extractedText}</pre>
              ) : (
                <p>No extracted text available.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-target">
          <div className="empty-icon"><FilePlus size={22} /></div>
          <div className="empty-title">Select a document to compare</div>
          <div className="empty-desc">Choose any document from your library to compare against the other column.</div>
          <label className="select-wrap">
            <select value="" onChange={(e) => handleSelectDocument(e.target.value, isSource)}>
              <option value="">Choose document</option>
              {availableDocs.map(d => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </label>
          <div className="empty-or">or</div>
          <Button variant="secondary" onClick={() => navigate('/search')}>
            <Search size={16} /> Search similar documents
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="compare-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="compare-header">
          <div>
            <h1 className="page-title">Document comparison</h1>
            <p className="page-subtitle">Compare two documents side by side to detect duplicates or discrepancies.</p>
          </div>
          <div className="overall-score">
            <ScoreRing score={comparisonScore} size="md" />
            <div>
              <span className="score-label">Metadata similarity</span>
              <span className={`score-verdict ${scoreClass}`}>{scoreLabel}</span>
            </div>
          </div>
        </div>

        <div className="compare-actions">
          <Button variant="primary" disabled={!sourceDocument || !targetDocument}>
            <Copy size={16} /> Mark as Duplicate
          </Button>
          <Button variant="secondary" className="text-warning" disabled={!sourceDocument || !targetDocument}>
            <AlertTriangle size={16} /> Flag for Review
          </Button>
          <span className="action-separator" />
          <Button variant="ghost" onClick={() => navigate('/documents')}>
            <Files size={16} /> Choose Documents
          </Button>
          <div className="diff-legend">
            <span><i className="legend-dot match" /> Match</span>
            <span><i className="legend-dot diff" /> Difference</span>
            <span><i className="legend-dot empty" /> Not set</span>
          </div>
        </div>

        {isLoading && <div className="compare-loading">Loading comparison data...</div>}
        {errorMsg && <div className="login-error">{errorMsg}</div>}

        {!isLoading && (
          <div className="compare-grid">
            {renderDocumentColumn('Source Document', sourceDocument, sourceFields, targetFields, true)}
            {renderDocumentColumn('Target Document', targetDocument, targetFields, sourceFields, false)}
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentComparison;
