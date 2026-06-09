import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Columns } from 'lucide-react';

import ScoreRing from '../components/Search/ScoreRing';
import SimilarityBadge from '../components/Search/SimilarityBadge';
import FilterSidebar from '../components/Search/FilterSidebar';
import DocumentPreviewModal from '../components/Documents/DocumentPreviewModal';
import { Button } from '../components/common/Button';
import { downloadDocumentFile, findSimilar, searchSimilar, searchSimilarText } from '../api/documents';
import './SearchResults.css';

const EMPTY_FILTERS = {
  vendors: [],
  docTypes: [],
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
  currency: 'Any'
};

const toApiFilters = (filters) => ({
  vendor: filters.vendors?.[0] || '',
  documentType: filters.docTypes?.[0] || '',
  dateFrom: filters.dateFrom || '',
  dateTo: filters.dateTo || '',
  amountMin: filters.minAmount || '',
  amountMax: filters.maxAmount || '',
  currency: filters.currency === 'Any' ? '' : filters.currency,
});

const countActiveFilters = (filters) => [
  filters.vendors?.length,
  filters.docTypes?.length,
  filters.dateFrom,
  filters.dateTo,
  filters.minAmount,
  filters.maxAmount,
  filters.currency !== 'Any' ? filters.currency : '',
].filter(Boolean).length;

const mapResult = (result) => ({
  id: result.documentId,
  score: result.similarityScore,
  filename: result.filename,
  vendor: result.vendor || '-',
  amount: result.totalAmount,
  currency: result.currency || '',
  date: result.invoiceDate || '',
  snippet: result.matchedSnippet || '',
  type: result.matchCategory,
  documentType: result.documentType || '',
});

const formatAmount = (result) => {
  if (result.amount === undefined || result.amount === null || result.amount === '') return '-';
  return `${result.currency || ''} ${Number(result.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`.trim();
};

const resultMatchesFilters = (result, filters) => {
  const vendor = filters.vendors?.[0]?.trim().toLowerCase();
  const docTypes = filters.docTypes || [];
  const amount = Number(result.amount);

  if (vendor && !String(result.vendor || '').toLowerCase().includes(vendor)) return false;
  if (docTypes.length > 0 && !docTypes.includes(result.documentType)) return false;
  if (filters.dateFrom && (!result.date || result.date < filters.dateFrom)) return false;
  if (filters.dateTo && (!result.date || result.date > filters.dateTo)) return false;
  if (filters.minAmount && (Number.isNaN(amount) || amount < Number(filters.minAmount))) return false;
  if (filters.maxAmount && (Number.isNaN(amount) || amount > Number(filters.maxAmount))) return false;
  if (filters.currency !== 'Any' && result.currency !== filters.currency) return false;
  return true;
};

const SearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchResponse = location.state?.response;
  const searchContext = location.state?.searchContext;
  const queryName = location.state?.queryName || 'Uploaded query document';
  const threshold = location.state?.threshold || 70;
  const [results, setResults] = useState((searchResponse?.results || []).map(mapResult));
  const [filters, setFilters] = useState(searchContext?.filters || EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('similarity');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const visibleResults = useMemo(() => {
    const filtered = results.filter((result) => resultMatchesFilters(result, filters));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return String(b.date || '').localeCompare(String(a.date || ''));
      }
      if (sortBy === 'amount') {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      return Number(b.score || 0) - Number(a.score || 0);
    });
  }, [filters, results, sortBy]);

  const rerunSearch = async (nextFilters) => {
    if (!searchContext) {
      return;
    }

    setIsRefreshing(true);
    setErrorMsg('');

    try {
      const options = {
        topK: Number(searchContext.topK || 10),
        threshold: Number(searchContext.threshold || threshold) / 100,
        filters: toApiFilters(nextFilters),
      };
      let response;

      if (searchContext.mode === 'select') {
        response = await findSimilar(searchContext.documentId, options);
      } else if (searchContext.mode === 'text') {
        response = await searchSimilarText(searchContext.queryText, options);
      } else if (searchContext.mode === 'upload' && searchContext.file) {
        response = await searchSimilar(searchContext.file, options);
      } else {
        throw new Error('Original search context is unavailable. Run the search again from the Search screen.');
      }

      setResults((response.data?.results || []).map(mapResult));
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Unable to refresh search results.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters);
    rerunSearch(nextFilters);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    rerunSearch(EMPTY_FILTERS);
  };

  const handleDownload = async (result) => {
    try {
      const response = await downloadDocumentFile(result.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename || `document-${result.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Failed to download document.');
    }
  };

  return (
    <>
      <div className="search-results-page">
        <div className="results-header">
          <button className="back-btn" onClick={() => navigate('/search')}>
            <ArrowLeft size={16} />
            <span>Back to Search</span>
          </button>
          
          <div className="results-summary">
            <h1 className="page-title">{visibleResults.length} Results Found</h1>
            <div className="summary-meta">
              <span>Query: {queryName}</span>
              <span className="dot-separator">•</span>
              <span>Threshold: {threshold}%</span>
            </div>
          </div>
        </div>

        <div className="results-layout">
          <div className="results-sidebar">
            <FilterSidebar
              filters={filters}
              onApply={applyFilters}
              onClear={clearFilters}
              activeCount={activeFilterCount}
            />
          </div>

          <div className="results-main">
            <div className="results-controls">
              <div className="sort-control">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="similarity">Similarity (High to Low)</option>
                  <option value="date">Date (Newest First)</option>
                  <option value="amount">Amount (High to Low)</option>
                </select>
              </div>
            </div>

            {errorMsg && <div className="login-error">{errorMsg}</div>}
            {isRefreshing && <div className="result-card">Refreshing results...</div>}

            <div className="results-list">
              {!isRefreshing && visibleResults.length === 0 && (
                <div className="result-card">
                  <div className="result-info-col">
                    <h3 className="result-filename">No results to show</h3>
                    <p>Run a similarity search or adjust your filters to see ranked matches here.</p>
                  </div>
                </div>
              )}
              {!isRefreshing && visibleResults.map((result) => (
                <div key={result.id} className="result-card">
                  <div className="result-score-col">
                    <ScoreRing score={result.score} size="lg" />
                    <SimilarityBadge type={result.type} size="sm" />
                  </div>
                  
                  <div className="result-info-col">
                    <div className="result-header">
                      <h3 className="result-filename">{result.filename}</h3>
                    </div>
                    
                    <div className="result-metadata">
                      <div className="meta-item">
                        <span className="meta-label">Vendor:</span>
                        <span className="meta-value">{result.vendor}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Date:</span>
                        <span className="meta-value">{result.date || '-'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Amount:</span>
                        <span className="meta-value monospace">{formatAmount(result)}</span>
                      </div>
                    </div>
                    
                    {result.snippet && (
                      <div className="result-snippet">
                        <p>{result.snippet}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="result-actions-col">
                    <Button variant="ghost" onClick={() => setPreviewDocument({ id: result.id, filename: result.filename })}>
                      <Eye size={16} />
                      <span>View</span>
                    </Button>
                    <Button variant="ghost" onClick={() => navigate(`/documents/compare?target=${result.id}`)}>
                      <Columns size={16} />
                      <span>Compare</span>
                    </Button>
                    <Button variant="ghost" onClick={() => handleDownload(result)}>
                      <Download size={16} />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />
    </>
  );
};

export default SearchResults;
