import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')
    print(f"Created {path}")

filter_sidebar_jsx = """
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import Button from '../common/Button';
import './FilterSidebar.css';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="filter-section">
      <button 
        className="filter-section-header" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="filter-section-title">{title}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className="filter-section-content">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({ onApply, onClear, filters, activeCount = 0 }) => {
  const [localFilters, setLocalFilters] = useState(filters || {
    vendors: [],
    docTypes: [],
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    currency: 'Any'
  });

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, value) => {
    setLocalFilters(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-sidebar-header">
        <div className="filter-sidebar-title-row">
          <Filter size={18} className="filter-icon" />
          <h3 className="filter-sidebar-title">Filters</h3>
          {activeCount > 0 && <span className="filter-count-badge">{activeCount}</span>}
        </div>
        <button className="clear-filters-btn" onClick={() => {
          setLocalFilters({ vendors: [], docTypes: [], dateFrom: '', dateTo: '', minAmount: '', maxAmount: '', currency: 'Any' });
          onClear();
        }}>
          Clear All
        </button>
      </div>

      <div className="filter-sidebar-body">
        <FilterSection title="Document Type">
          <div className="checkbox-list">
            {['invoice', 'receipt', 'contract', 'purchase_order'].map(type => (
              <label key={type} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={localFilters.docTypes.includes(type)}
                  onChange={() => handleCheckboxChange('docTypes', type)}
                />
                <span className="checkbox-text">{type.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Vendor">
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Search vendors..." 
            onChange={(e) => {
              // Mock multiselect behavior with text input for now
              handleChange('vendors', e.target.value ? [e.target.value] : []);
            }}
          />
        </FilterSection>

        <FilterSection title="Date Range">
          <div className="filter-row">
            <input 
              type="date" 
              className="filter-input half" 
              value={localFilters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
            />
            <span className="filter-separator">to</span>
            <input 
              type="date" 
              className="filter-input half" 
              value={localFilters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
            />
          </div>
        </FilterSection>

        <FilterSection title="Amount">
          <div className="filter-row">
            <input 
              type="number" 
              className="filter-input half" 
              placeholder="Min" 
              value={localFilters.minAmount}
              onChange={(e) => handleChange('minAmount', e.target.value)}
            />
            <span className="filter-separator">-</span>
            <input 
              type="number" 
              className="filter-input half" 
              placeholder="Max" 
              value={localFilters.maxAmount}
              onChange={(e) => handleChange('maxAmount', e.target.value)}
            />
          </div>
          <select 
            className="filter-select mt-2" 
            value={localFilters.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="Any">Any Currency</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </FilterSection>
      </div>

      <div className="filter-sidebar-footer">
        <Button variant="primary" className="w-full" onClick={() => onApply(localFilters)}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
"""

filter_sidebar_css = """
.filter-sidebar {
  background-color: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--slate-200);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-sidebar-header {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--slate-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-sidebar-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filter-icon {
  color: var(--navy-600);
}

.filter-sidebar-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--navy-900);
}

.filter-count-badge {
  background-color: var(--navy-100);
  color: var(--navy-700);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.clear-filters-btn {
  background: none;
  border: none;
  color: var(--slate-500);
  font-size: 13px;
  cursor: pointer;
}

.clear-filters-btn:hover {
  color: var(--navy-600);
  text-decoration: underline;
}

.filter-sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2) 0;
}

.filter-section {
  border-bottom: 1px solid var(--slate-100);
}

.filter-section-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--navy-800);
}

.filter-section-header:hover {
  background-color: var(--slate-50);
}

.filter-section-title {
  font-weight: 600;
  font-size: 14px;
}

.filter-section-content {
  padding: 0 var(--space-5) var(--space-4) var(--space-5);
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-size: 14px;
  color: var(--slate-700);
}

.filter-input, .filter-select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filter-input.half {
  flex: 1;
}

.filter-separator {
  color: var(--slate-500);
  font-size: 12px;
}

.mt-2 {
  margin-top: var(--space-2);
}

.filter-sidebar-footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--slate-200);
  background-color: var(--slate-50);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.w-full {
  width: 100%;
}
"""

search_jsx = """
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FileText, Upload, Database } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import FileDropZone from '../components/Upload/FileDropZone';
import Button from '../components/common/Button';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload'); // upload, text, select
  const [threshold, setThreshold] = useState(70);
  const [topK, setTopK] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const [queryText, setQueryText] = useState('');

  const handleSearch = () => {
    setIsSearching(true);
    // Mock search delay
    setTimeout(() => {
      navigate('/search/results');
    }, 1500);
  };

  return (
    <AppLayout>
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
                    <FileDropZone onFileSelect={() => {}} />
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
                      <input type="text" placeholder="Search by filename, vendor, or ID..." className="selector-input" />
                    </div>
                    <div className="recent-docs">
                      <p className="recent-docs-title">Recent Documents</p>
                      <div className="recent-doc-item">INV-2023-001_AcmeCorp.pdf</div>
                      <div className="recent-doc-item">Q3_Expense_Report.docx</div>
                      <div className="recent-doc-item">Contract_TechFlow_Final.pdf</div>
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;
"""

search_css = """
.search-page {
  max-width: 1200px;
  margin: 0 auto;
}

.search-layout {
  display: flex;
  gap: var(--space-6);
  align-items: flex-start;
}

.search-main {
  flex: 1;
}

.search-sidebar {
  width: 320px;
}

.search-card, .settings-card {
  background-color: white;
  border-radius: var(--radius-xl);
  border: 1px solid var(--slate-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.search-tabs {
  display: flex;
  border-bottom: 1px solid var(--slate-200);
  background-color: var(--slate-50);
}

.search-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  color: var(--slate-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-tab:hover {
  color: var(--navy-800);
  background-color: var(--slate-100);
}

.search-tab.active {
  color: var(--navy-600);
  border-bottom-color: var(--navy-600);
  background-color: white;
}

.search-content {
  padding: var(--space-6);
}

.search-textarea {
  width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  resize: vertical;
  min-height: 200px;
}

.search-textarea:focus {
  outline: none;
  border-color: var(--navy-500);
  box-shadow: 0 0 0 3px rgba(46, 72, 153, 0.1);
}

.document-selector {
  position: relative;
  margin-bottom: var(--space-6);
}

.selector-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--slate-400);
}

.selector-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-10);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-size: 15px;
}

.selector-input:focus {
  outline: none;
  border-color: var(--navy-500);
  box-shadow: 0 0 0 3px rgba(46, 72, 153, 0.1);
}

.recent-docs-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--slate-500);
  margin-bottom: var(--space-3);
}

.recent-doc-item {
  padding: var(--space-3);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.recent-doc-item:hover {
  background-color: var(--slate-50);
  border-color: var(--slate-300);
}

.settings-card {
  padding: var(--space-5);
}

.settings-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--navy-900);
  margin: 0 0 var(--space-5) 0;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--slate-100);
}

.setting-group {
  margin-bottom: var(--space-6);
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.setting-header label {
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-800);
}

.setting-value {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: var(--navy-600);
  background-color: var(--navy-50);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.threshold-slider {
  width: 100%;
  accent-color: var(--navy-600);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--slate-500);
  margin-top: var(--space-1);
}

.topk-select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  margin-top: var(--space-2);
}

.search-action {
  margin-top: var(--space-8);
}

.search-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  font-size: 16px;
}

@media (max-width: 768px) {
  .search-layout {
    flex-direction: column;
  }
  .search-sidebar {
    width: 100%;
  }
}
"""

search_results_jsx = """
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Columns } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import ScoreRing from '../components/Search/ScoreRing';
import SimilarityBadge from '../components/Search/SimilarityBadge';
import FilterSidebar from '../components/Search/FilterSidebar';
import Button from '../components/common/Button';
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
"""

search_results_css = """
.search-results-page {
  max-width: 1200px;
  margin: 0 auto;
}

.results-header {
  margin-bottom: var(--space-6);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: none;
  color: var(--slate-500);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: var(--space-4);
  transition: color var(--transition-fast);
}

.back-btn:hover {
  color: var(--navy-800);
}

.page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: var(--navy-900);
  margin: 0 0 var(--space-2) 0;
}

.summary-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--slate-600);
  font-size: 14px;
}

.dot-separator {
  color: var(--slate-300);
}

.results-layout {
  display: flex;
  gap: var(--space-6);
  align-items: flex-start;
}

.results-sidebar {
  width: 280px;
  position: sticky;
  top: var(--space-6);
}

.results-main {
  flex: 1;
}

.results-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-4);
}

.sort-control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.sort-control label {
  font-size: 14px;
  color: var(--slate-600);
}

.sort-control select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.result-card {
  display: flex;
  background-color: white;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  gap: var(--space-6);
  transition: box-shadow var(--transition-standard), border-color var(--transition-standard);
}

.result-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--navy-200);
}

.result-score-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  min-width: 100px;
}

.result-info-col {
  flex: 1;
}

.result-header {
  margin-bottom: var(--space-3);
}

.result-filename {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--navy-900);
  margin: 0;
}

.result-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  background-color: var(--slate-50);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

.meta-item {
  display: flex;
  gap: var(--space-2);
  font-size: 13px;
}

.meta-label {
  color: var(--slate-500);
}

.meta-value {
  font-weight: 500;
  color: var(--navy-800);
}

.monospace {
  font-family: 'IBM Plex Mono', monospace;
}

.result-snippet {
  font-size: 14px;
  color: var(--slate-700);
  line-height: 1.5;
}

.result-snippet p {
  margin: 0;
}

.result-snippet mark {
  background-color: var(--warning-100);
  color: var(--navy-900);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 500;
}

.result-actions-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 120px;
}

.result-actions-col button {
  justify-content: flex-start;
}

@media (max-width: 900px) {
  .results-layout {
    flex-direction: column;
  }
  .results-sidebar {
    width: 100%;
    position: static;
  }
  .result-card {
    flex-direction: column;
  }
  .result-score-col {
    flex-direction: row;
    justify-content: flex-start;
  }
  .result-actions-col {
    flex-direction: row;
  }
}
"""

write_file('frontend/src/components/Search/FilterSidebar.jsx', filter_sidebar_jsx)
write_file('frontend/src/components/Search/FilterSidebar.css', filter_sidebar_css)
write_file('frontend/src/pages/Search.jsx', search_jsx)
write_file('frontend/src/pages/Search.css', search_css)
write_file('frontend/src/pages/SearchResults.jsx', search_results_jsx)
write_file('frontend/src/pages/SearchResults.css', search_results_css)
