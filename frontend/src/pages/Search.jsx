import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FileText, Upload, Database } from 'lucide-react';

import FileDropZone from '../components/Upload/FileDropZone';
import FilterSidebar from '../components/Search/FilterSidebar';
import { Button } from '../components/common/Button';
import { getDocuments, searchSimilar, findSimilar, searchSimilarText } from '../api/documents';
import './Search.css';

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

const countActiveFilters = (filters) => {
  return [
    filters.vendors?.length,
    filters.docTypes?.length,
    filters.dateFrom,
    filters.dateTo,
    filters.minAmount,
    filters.maxAmount,
    filters.currency !== 'Any' ? filters.currency : '',
  ].filter(Boolean).length;
};

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upload'); // upload, text, select
  const [threshold, setThreshold] = useState(70);
  const [topK, setTopK] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [queryFile, setQueryFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [documentQuery, setDocumentQuery] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const apiFilters = useMemo(() => toApiFilters(filters), [filters]);
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  useEffect(() => {
    const loadRecentDocuments = async () => {
      try {
        const response = await getDocuments({ page: 0, size: 20 });
        setRecentDocuments(response.data.content || []);
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Unable to load recent documents.');
      }
    };

    loadRecentDocuments();
  }, []);

  useEffect(() => {
    if (location.state?.selectedDocumentId) {
      setActiveTab('select');
      setSelectedDocumentId(location.state.selectedDocumentId);
    }
  }, [location.state]);

  const filteredDocuments = useMemo(() => {
    const query = documentQuery.trim().toLowerCase();
    if (!query) return recentDocuments;

    return recentDocuments.filter(doc => [
      doc.filename,
      doc.vendor,
      doc.invoiceNumber,
      doc.id,
    ].some(value => String(value || '').toLowerCase().includes(query)));
  }, [documentQuery, recentDocuments]);

  const handleSearch = async () => {
    if (activeTab === 'select') {
      if (!selectedDocumentId) {
        setErrorMsg('Please select a document from the list below.');
        return;
      }
      setIsSearching(true);
      setErrorMsg('');
      try {
        const selectedDoc = recentDocuments.find(d => d.id === selectedDocumentId);
        const response = await findSimilar(selectedDocumentId, {
          topK: Number(topK),
          threshold: Number(threshold) / 100,
          filters: apiFilters,
        });
        navigate('/search/results', {
          state: {
            response: response.data,
            queryName: selectedDoc?.filename || 'Selected document',
            threshold,
            searchContext: {
              mode: 'select',
              documentId: selectedDocumentId,
              topK: Number(topK),
              threshold,
              filters,
            },
          },
        });
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
      return;
    }

    if (activeTab === 'text') {
      if (!queryText.trim()) {
        setErrorMsg('Paste text to run similarity search.');
        return;
      }

      setIsSearching(true);
      setErrorMsg('');

      try {
        const response = await searchSimilarText(queryText, {
          topK: Number(topK),
          threshold: Number(threshold) / 100,
          filters: apiFilters,
        });
        navigate('/search/results', {
          state: {
            response: response.data,
            queryName: 'Pasted text query',
            threshold,
            searchContext: {
              mode: 'text',
              queryText,
              topK: Number(topK),
              threshold,
              filters,
            },
          },
        });
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
      return;
    }

    if (activeTab !== 'upload' || !queryFile) {
      setErrorMsg('Upload a query document to run similarity search.');
      return;
    }

    setIsSearching(true);
    setErrorMsg('');

    try {
      const response = await searchSimilar(queryFile, {
        topK: Number(topK),
        threshold: Number(threshold) / 100,
        filters: apiFilters,
      });
      navigate('/search/results', {
        state: {
          response: response.data,
          queryName: queryFile.name,
          threshold,
          searchContext: {
            mode: 'upload',
            file: queryFile,
            topK: Number(topK),
            threshold,
            filters,
          },
        },
      });
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <div className="search-page">
        <div className="page-header">
          <h1 className="page-title">Search Similar Documents</h1>
          <p className="page-subtitle">Find documents in your index that are semantically similar to your query.</p>
        </div>

        <div className="search-layout">
          <div className="search-main">
            <div className="search-card">
              <div className="search-tabs">
                <button 
                  className={`search-tab ${activeTab === 'upload' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upload')}
                >
                  <Upload size={18} />
                  <span>Upload File</span>
                </button>
                <button 
                  className={`search-tab ${activeTab === 'text' ? 'active' : ''}`}
                  onClick={() => setActiveTab('text')}
                >
                  <FileText size={18} />
                  <span>Paste Text</span>
                </button>
                <button 
                  className={`search-tab ${activeTab === 'select' ? 'active' : ''}`}
                  onClick={() => setActiveTab('select')}
                >
                  <Database size={18} />
                  <span>Select Existing</span>
                </button>
              </div>

              <div className="search-content">
                {activeTab === 'upload' && (
                  <div className="tab-panel">
                    {!queryFile ? (
                      <FileDropZone onFileSelect={setQueryFile} />
                    ) : (
                      <div className="recent-doc-item">
                        Selected query file: {queryFile.name}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="tab-panel">
                    <textarea 
                      className="search-textarea" 
                      placeholder="Paste text here to find similar documents..."
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      rows={8}
                    ></textarea>
                  </div>
                )}

                {activeTab === 'select' && (
                  <div className="tab-panel">
                    <div className="document-selector">
                      <SearchIcon size={20} className="selector-icon" />
                      <input
                        type="text"
                        placeholder="Search by filename, vendor, or ID..."
                        className="selector-input"
                        value={documentQuery}
                        onChange={(e) => setDocumentQuery(e.target.value)}
                      />
                    </div>
                    <div className="recent-docs">
                      <p className="recent-docs-title">Select a document to find similar</p>
                      {filteredDocuments.map(doc => (
                        <button
                          key={doc.id}
                          className={`recent-doc-item${selectedDocumentId === doc.id ? ' selected' : ''}`}
                          type="button"
                          onClick={() => setSelectedDocumentId(doc.id === selectedDocumentId ? null : doc.id)}
                        >
                          <span className="doc-select-name">{doc.filename}</span>
                          {doc.vendor && <span className="doc-select-vendor">{doc.vendor}</span>}
                          {selectedDocumentId === doc.id && <span className="doc-select-check">✓</span>}
                        </button>
                      ))}
                      {filteredDocuments.length === 0 && (
                        <div className="recent-doc-item">No stored documents found.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="search-sidebar">
            <div className="settings-card">
              <h3 className="settings-title">Search Parameters</h3>
              
              <div className="setting-group">
                <div className="setting-header">
                  <label>Similarity Threshold</label>
                  <span className="setting-value">{threshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={threshold} 
                  onChange={(e) => setThreshold(e.target.value)}
                  className="threshold-slider" 
                />
                <div className="slider-labels">
                  <span>Broader</span>
                  <span>Stricter</span>
                </div>
              </div>

              <div className="setting-group">
                <label>Maximum Results (Top K)</label>
                <select 
                  className="topk-select"
                  value={topK}
                  onChange={(e) => setTopK(e.target.value)}
                >
                  <option value="5">5 results</option>
                  <option value="10">10 results</option>
                  <option value="20">20 results</option>
                  <option value="50">50 results</option>
                </select>
              </div>

              <div className="search-action">
                {errorMsg && (
                  <div className="login-error">
                    <span>{errorMsg}</span>
                  </div>
                )}
                <Button 
                  variant="primary" 
                  className="w-full search-btn" 
                  onClick={handleSearch}
                  isLoading={isSearching}
                >
                  <SearchIcon size={18} />
                  <span>Search</span>
                </Button>
              </div>
            </div>

            <FilterSidebar
              filters={filters}
              activeCount={activeFilterCount}
              onApply={setFilters}
              onClear={() => setFilters(EMPTY_FILTERS)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
