import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Columns } from 'lucide-react';

import ScoreRing from '../components/Search/ScoreRing';
import SimilarityBadge from '../components/Search/SimilarityBadge';
import FilterSidebar from '../components/Search/FilterSidebar';
import DocumentPreviewModal from '../components/Documents/DocumentPreviewModal';
import { Button } from '../components/common/Button';
import './SearchResults.css';

const SearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchResponse = location.state?.response;
  const queryName = location.state?.queryName || 'Uploaded query document';
  const threshold = location.state?.threshold || 70;
  const [results] = useState(
    searchResponse?.results?.map((result) => ({
      id: result.documentId,
      score: result.similarityScore,
      filename: result.filename,
      vendor: result.vendor || '-',
      amount: '-',
      date: '-',
      snippet: result.matchedSnippet || '',
      type: result.matchCategory,
    })) || []
  );
  const [previewDocument, setPreviewDocument] = useState(null);

  return (
    <>
      <div className="search-results-page">
        <div className="results-header">
          <button className="back-btn" onClick={() => navigate('/search')}>
            <ArrowLeft size={16} />
            <span>Back to Search</span>
          </button>
          
          <div className="results-summary">
            <h1 className="page-title">{results.length} Results Found</h1>
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
              onApply={() => {}} 
              onClear={() => {}} 
              activeCount={0} 
            />
          </div>

          <div className="results-main">
            <div className="results-controls">
              <div className="sort-control">
                <label>Sort by:</label>
                <select>
                  <option>Similarity (High to Low)</option>
                  <option>Date (Newest First)</option>
                  <option>Amount (High to Low)</option>
                </select>
              </div>
            </div>

            <div className="results-list">
              {results.length === 0 && (
                <div className="result-card">
                  <div className="result-info-col">
                    <h3 className="result-filename">No results to show</h3>
                    <p>Run a similarity search from the Search screen to see ranked matches here.</p>
                  </div>
                </div>
              )}
              {results.map((result) => (
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
                        <span className="meta-value">{result.date}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Amount:</span>
                        <span className="meta-value monospace">{result.amount}</span>
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
                    <Button variant="ghost">
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
