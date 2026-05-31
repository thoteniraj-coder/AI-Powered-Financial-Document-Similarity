import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Columns } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import ScoreRing from '../components/Search/ScoreRing';
import SimilarityBadge from '../components/Search/SimilarityBadge';
import FilterSidebar from '../components/Search/FilterSidebar';
import { Button } from '../components/common/Button';
import './SearchResults.css';

const MOCK_RESULTS = [
  { id: '1', score: 0.98, filename: 'INV-2023-042_AcmeCorp.pdf', vendor: 'Acme Corp', amount: '$4,250.00', date: '2023-10-15', snippet: '...invoice total for <mark>software licensing fees</mark> comes to $4,250.00 payable within 30 days...', type: 'STRONG_MATCH' },
  { id: '2', score: 0.85, filename: 'INV-2023-041_AcmeCorp.pdf', vendor: 'Acme Corp', amount: '$4,250.00', date: '2023-09-15', snippet: '...monthly invoice for <mark>software licensing</mark> and support services...', type: 'STRONG_MATCH' },
  { id: '3', score: 0.76, filename: 'PO-78902_TechFlow.pdf', vendor: 'TechFlow', amount: '$3,800.00', date: '2023-10-01', snippet: '...purchase order for annual <mark>licensing fees</mark> and implementation...', type: 'RELATED' },
  { id: '4', score: 0.62, filename: 'Contract_GlobalSystems.docx', vendor: 'Global Systems', amount: '-', date: '2022-11-20', snippet: '...standard <mark>software licensing</mark> agreement section 4.2 terms...', type: 'WEAK_MATCH' },
];

const SearchResults = () => {
  const navigate = useNavigate();
  const [results] = useState(MOCK_RESULTS);

  return (
    <AppLayout>
      <div className="search-results-page">
        <div className="results-header">
          <button className="back-btn" onClick={() => navigate('/search')}>
            <ArrowLeft size={16} />
            <span>Back to Search</span>
          </button>
          
          <div className="results-summary">
            <h1 className="page-title">4 Results Found</h1>
            <div className="summary-meta">
              <span>Query: "Software licensing fees invoice"</span>
              <span className="dot-separator">•</span>
              <span>Threshold: 70%</span>
              <span className="dot-separator">•</span>
              <span>0.42s</span>
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
                    
                    <div className="result-snippet">
                      <p dangerouslySetInnerHTML={{ __html: result.snippet }}></p>
                    </div>
                  </div>
                  
                  <div className="result-actions-col">
                    <Button variant="ghost" onClick={() => navigate(`/documents/${result.id}`)}>
                      <Eye size={16} />
                      <span>View</span>
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/documents/compare')}>
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
    </AppLayout>
  );
};

export default SearchResults;
