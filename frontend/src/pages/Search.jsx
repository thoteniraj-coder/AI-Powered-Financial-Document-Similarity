import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FileText, Upload, Database } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import FileDropZone from '../components/Upload/FileDropZone';
import { Button } from '../components/common/Button';
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
