import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')
    print(f"Created {path}")

docs_jsx = """
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, FileSearch, Trash2 } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import './Documents.css';

const MOCK_DOCS = [
  { id: '1', filename: 'INV-2023-042_AcmeCorp.pdf', vendor: 'Acme Corp', type: 'invoice', status: 'approved', amount: '$4,250.00', date: 'Oct 15, 2023' },
  { id: '2', filename: 'PO-78902_TechFlow.pdf', vendor: 'TechFlow', type: 'purchase_order', status: 'pending', amount: '$3,800.00', date: 'Oct 14, 2023' },
  { id: '3', filename: 'Receipt_Uber_Oct.pdf', vendor: 'Uber', type: 'receipt', status: 'rejected', amount: '$45.50', date: 'Oct 12, 2023' },
  { id: '4', filename: 'Contract_GlobalSystems.docx', vendor: 'Global Systems', type: 'contract', status: 'approved', amount: '-', date: 'Oct 10, 2023' },
  { id: '5', filename: 'INV-2023-041_AcmeCorp_dup.pdf', vendor: 'Acme Corp', type: 'invoice', status: 'flagged', amount: '$4,250.00', date: 'Oct 09, 2023' },
];

const Documents = () => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  
  return (
    <AppLayout>
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
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="outline"><Filter size={16} /> Filters</Button>
          </div>
        </div>

        <div className="table-container">
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
              {MOCK_DOCS.map(doc => (
                <tr key={doc.id}>
                  <td className="font-medium text-navy-900 cursor-pointer hover-underline" onClick={() => navigate(`/documents/${doc.id}`)}>
                    {doc.filename}
                  </td>
                  <td>{doc.vendor}</td>
                  <td className="capitalize">{doc.type.replace('_', ' ')}</td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td className="monospace">{doc.amount}</td>
                  <td>{doc.date}</td>
                  <td className="text-right">
                    <div className="row-actions">
                      <button className="icon-btn" title="View" onClick={() => navigate(`/documents/${doc.id}`)}><Eye size={16} /></button>
                      <button className="icon-btn" title="Find Similar" onClick={() => navigate('/search')}><FileSearch size={16} /></button>
                      <button className="icon-btn danger" title="Delete" onClick={() => setDeleteId(doc.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <span className="pagination-info">Showing 1-5 of 124 results</span>
          <div className="pagination-controls">
            <button className="page-btn disabled">Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-ellipsis">...</span>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => setDeleteId(null)}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
    </AppLayout>
  );
};

export default Documents;
"""

docs_css = """
.documents-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: var(--navy-900);
  margin: 0;
}

.docs-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  gap: var(--space-4);
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--slate-400);
}

.docs-search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-10);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
}

.filter-dropdowns {
  display: flex;
  gap: var(--space-3);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  background-color: white;
}

.table-container {
  background-color: white;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-4);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th, .data-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--slate-100);
}

.data-table th {
  background-color: var(--slate-50);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--slate-500);
  letter-spacing: 0.05em;
}

.data-table tr:hover {
  background-color: var(--slate-50);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.font-medium { font-weight: 500; }
.text-navy-900 { color: var(--navy-900); }
.cursor-pointer { cursor: pointer; }
.hover-underline:hover { text-decoration: underline; }
.capitalize { text-transform: capitalize; }
.monospace { font-family: 'IBM Plex Mono', monospace; }
.text-right { text-align: right; }

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-1);
}

.icon-btn {
  background: none;
  border: none;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--slate-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background-color: var(--slate-200);
  color: var(--navy-800);
}

.icon-btn.danger:hover {
  background-color: var(--danger-100);
  color: var(--danger-600);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
}

.pagination-info {
  font-size: 14px;
  color: var(--slate-500);
}

.pagination-controls {
  display: flex;
  gap: var(--space-1);
}

.page-btn {
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--slate-300);
  background-color: white;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--slate-700);
  cursor: pointer;
}

.page-btn:hover:not(.disabled):not(.active) {
  background-color: var(--slate-50);
}

.page-btn.active {
  background-color: var(--navy-600);
  color: white;
  border-color: var(--navy-600);
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: var(--space-1) var(--space-2);
  color: var(--slate-500);
}
"""

doc_detail_jsx = """
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Columns, FileSearch } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import StatusBadge from '../components/common/StatusBadge';
import ScoreRing from '../components/Search/ScoreRing';
import Button from '../components/common/Button';
import './DocumentDetail.css';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="doc-detail-page">
        <button className="back-btn" onClick={() => navigate('/documents')}>
          <ArrowLeft size={16} />
          <span>Back to Documents</span>
        </button>
        
        <div className="doc-header">
          <div className="doc-title-row">
            <h1 className="doc-filename">INV-2023-042_AcmeCorp.pdf</h1>
            <StatusBadge status="approved" />
          </div>
          <div className="doc-meta-bar">
            <span>Uploaded: Oct 15, 2023 10:42 AM</span>
            <span className="dot-separator">•</span>
            <span>By: Jane Doe</span>
            <span className="dot-separator">•</span>
            <span>ID: {id || 'doc-12345'}</span>
          </div>
        </div>
        
        <div className="doc-actions-bar">
          <div className="left-actions">
            <Button variant="outline" onClick={() => navigate('/search')}>
              <FileSearch size={16} /> Find Similar
            </Button>
            <Button variant="outline" onClick={() => navigate('/documents/compare')}>
              <Columns size={16} /> Compare
            </Button>
          </div>
          <div className="right-actions">
            <Button variant="ghost">
              <Download size={16} /> Download
            </Button>
            <Button variant="ghost" className="text-danger">
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>

        <div className="doc-layout">
          <div className="doc-main">
            <div className="doc-card">
              <div className="doc-tabs">
                <button className="doc-tab active">Metadata</button>
                <button className="doc-tab">Extracted Text</button>
                <button className="doc-tab">Chunks (12)</button>
              </div>
              
              <div className="doc-panel">
                <div className="meta-grid">
                  <div className="meta-group">
                    <label>Vendor</label>
                    <div className="meta-val">Acme Corp</div>
                  </div>
                  <div className="meta-group">
                    <label>Document Type</label>
                    <div className="meta-val">Invoice</div>
                  </div>
                  <div className="meta-group">
                    <label>Invoice Number</label>
                    <div className="meta-val">INV-2023-042</div>
                  </div>
                  <div className="meta-group">
                    <label>Date</label>
                    <div className="meta-val">Oct 15, 2023</div>
                  </div>
                  <div className="meta-group">
                    <label>Amount</label>
                    <div className="meta-val monospace">$4,250.00</div>
                  </div>
                  <div className="meta-group">
                    <label>Currency</label>
                    <div className="meta-val">USD</div>
                  </div>
                </div>
                
                <div className="tags-section">
                  <label>Tags</label>
                  <div className="tags-list">
                    <span className="tag">software</span>
                    <span className="tag">licensing</span>
                    <span className="tag">Q4</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="doc-card mt-6">
              <h3 className="card-title">Extracted Text Preview</h3>
              <div className="text-preview">
                <pre>
                  INVOICE
                  Acme Corp
                  123 Tech Lane, Silicon Valley, CA 94025
                  
                  BILL TO:
                  Global Systems Inc
                  456 Market St, San Francisco, CA 94105
                  
                  Invoice No: INV-2023-042
                  Date: October 15, 2023
                  Due Date: November 14, 2023
                  
                  DESCRIPTION                              AMOUNT
                  Software Licensing Fees (Annual)         $4,250.00
                  
                  TOTAL DUE                                $4,250.00
                </pre>
              </div>
            </div>
          </div>
          
          <div className="doc-sidebar">
            <div className="similar-card">
              <h3 className="card-title">Similar Documents</h3>
              
              <div className="similar-list">
                {[1, 2, 3].map((item, idx) => (
                  <div key={idx} className="similar-item cursor-pointer" onClick={() => navigate('/documents/compare')}>
                    <ScoreRing score={0.98 - (idx * 0.12)} size="sm" />
                    <div className="similar-info">
                      <div className="similar-name truncate">INV-2023-041_AcmeCorp.pdf</div>
                      <div className="similar-meta">Oct 15, 2023 • $4,250.00</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/search')}>
                View all similar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DocumentDetail;
"""

doc_detail_css = """
.doc-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.doc-header {
  margin-bottom: var(--space-6);
}

.doc-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-2);
}

.doc-filename {
  font-family: 'DM Serif Display', serif;
  font-size: 32px;
  color: var(--navy-900);
  margin: 0;
}

.doc-meta-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--slate-500);
  font-size: 14px;
}

.doc-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--slate-200);
  margin-bottom: var(--space-6);
}

.left-actions, .right-actions {
  display: flex;
  gap: var(--space-3);
}

.text-danger {
  color: var(--danger-600);
}

.doc-layout {
  display: flex;
  gap: var(--space-6);
  align-items: flex-start;
}

.doc-main {
  flex: 1;
}

.doc-sidebar {
  width: 320px;
}

.doc-card, .similar-card {
  background-color: white;
  border-radius: var(--radius-xl);
  border: 1px solid var(--slate-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.mt-6 { margin-top: var(--space-6); }
.mt-4 { margin-top: var(--space-4); }
.w-full { width: 100%; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.doc-tabs {
  display: flex;
  border-bottom: 1px solid var(--slate-200);
  background-color: var(--slate-50);
}

.doc-tab {
  padding: var(--space-4) var(--space-6);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  color: var(--slate-600);
  cursor: pointer;
}

.doc-tab.active {
  color: var(--navy-800);
  border-bottom-color: var(--navy-600);
  background-color: white;
}

.doc-panel {
  padding: var(--space-6);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-6);
}

.meta-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--slate-500);
  margin-bottom: var(--space-1);
}

.meta-val {
  font-size: 15px;
  color: var(--navy-900);
  font-weight: 500;
}

.tags-section label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--slate-500);
  margin-bottom: var(--space-2);
}

.tags-list {
  display: flex;
  gap: var(--space-2);
}

.tag {
  background-color: var(--navy-100);
  color: var(--navy-700);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}

.card-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--navy-900);
  margin: 0;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--slate-100);
}

.text-preview {
  padding: var(--space-5);
  background-color: var(--slate-50);
  height: 300px;
  overflow-y: auto;
}

.text-preview pre {
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--slate-700);
  white-space: pre-wrap;
}

.similar-list {
  display: flex;
  flex-direction: column;
}

.similar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--slate-100);
  transition: background-color var(--transition-fast);
}

.similar-item:hover {
  background-color: var(--slate-50);
}

.similar-item:last-child {
  border-bottom: none;
}

.similar-info {
  flex: 1;
  min-width: 0;
}

.similar-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-900);
  margin-bottom: 2px;
}

.similar-meta {
  font-size: 12px;
  color: var(--slate-500);
}

@media (max-width: 768px) {
  .doc-layout {
    flex-direction: column;
  }
  .doc-sidebar {
    width: 100%;
  }
  .meta-grid {
    grid-template-columns: 1fr;
  }
}
"""

compare_jsx = """
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import ScoreRing from '../components/Search/ScoreRing';
import Button from '../components/common/Button';
import './DocumentComparison.css';

const DocumentComparison = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="compare-page">
        <div className="compare-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          
          <div className="compare-title-row">
            <h1 className="page-title">Document Comparison</h1>
            <div className="overall-score">
              <ScoreRing score={0.98} size="lg" />
              <span className="score-label">Overall Similarity</span>
            </div>
          </div>
        </div>

        <div className="compare-actions">
          <Button variant="primary">Mark as Duplicate</Button>
          <Button variant="outline" className="text-warning"><AlertTriangle size={16} /> Flag for Review</Button>
          <Button variant="ghost">Ignore</Button>
        </div>

        <div className="compare-grid">
          <div className="compare-col">
            <div className="col-header">
              <span className="col-badge">Source Document</span>
              <h2 className="col-doc-name">INV-2023-042_AcmeCorp.pdf</h2>
            </div>
            
            <div className="compare-section">
              <h3 className="section-title">Metadata</h3>
              <div className="field-row">
                <span className="field-label">Vendor</span>
                <span className="field-value match">Acme Corp</span>
              </div>
              <div className="field-row">
                <span className="field-label">Invoice Number</span>
                <span className="field-value diff">INV-2023-042</span>
              </div>
              <div className="field-row">
                <span className="field-label">Date</span>
                <span className="field-value match">Oct 15, 2023</span>
              </div>
              <div className="field-row">
                <span className="field-label">Amount</span>
                <span className="field-value match">$4,250.00</span>
              </div>
            </div>
            
            <div className="compare-section">
              <h3 className="section-title">Extracted Text</h3>
              <div className="text-scroll-area">
                <p>INVOICE</p>
                <p>Acme Corp</p>
                <p>123 Tech Lane, Silicon Valley, CA 94025</p>
                <p><br/></p>
                <p>BILL TO:</p>
                <p>Global Systems Inc</p>
                <p>456 Market St, San Francisco, CA 94105</p>
                <p><br/></p>
                <p>Invoice No: <mark className="diff-mark">INV-2023-042</mark></p>
                <p>Date: October 15, 2023</p>
                <p><br/></p>
                <p>DESCRIPTION                              AMOUNT</p>
                <p><mark className="match-mark">Software Licensing Fees (Annual)         $4,250.00</mark></p>
                <p>TOTAL DUE                                $4,250.00</p>
              </div>
            </div>
          </div>
          
          <div className="compare-divider"></div>
          
          <div className="compare-col">
            <div className="col-header">
              <span className="col-badge target">Target Document</span>
              <h2 className="col-doc-name">INV-2023-041_AcmeCorp.pdf</h2>
            </div>
            
            <div className="compare-section">
              <h3 className="section-title">Metadata</h3>
              <div className="field-row">
                <span className="field-label">Vendor</span>
                <span className="field-value match">Acme Corp</span>
              </div>
              <div className="field-row">
                <span className="field-label">Invoice Number</span>
                <span className="field-value diff">INV-2023-041</span>
              </div>
              <div className="field-row">
                <span className="field-label">Date</span>
                <span className="field-value match">Oct 15, 2023</span>
              </div>
              <div className="field-row">
                <span className="field-label">Amount</span>
                <span className="field-value match">$4,250.00</span>
              </div>
            </div>
            
            <div className="compare-section">
              <h3 className="section-title">Extracted Text</h3>
              <div className="text-scroll-area">
                <p>INVOICE</p>
                <p>Acme Corp</p>
                <p>123 Tech Lane, Silicon Valley, CA 94025</p>
                <p><br/></p>
                <p>BILL TO:</p>
                <p>Global Systems Inc</p>
                <p>456 Market St, San Francisco, CA 94105</p>
                <p><br/></p>
                <p>Invoice No: <mark className="diff-mark">INV-2023-041</mark></p>
                <p>Date: October 15, 2023</p>
                <p><br/></p>
                <p>DESCRIPTION                              AMOUNT</p>
                <p><mark className="match-mark">Software Licensing Fees (Annual)         $4,250.00</mark></p>
                <p>TOTAL DUE                                $4,250.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DocumentComparison;
"""

compare_css = """
.compare-page {
  max-width: 1400px;
  margin: 0 auto;
}

.compare-header {
  margin-bottom: var(--space-4);
}

.compare-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overall-score {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background-color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--slate-200);
  box-shadow: var(--shadow-sm);
}

.score-label {
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  color: var(--navy-800);
}

.compare-actions {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--slate-200);
}

.text-warning {
  color: var(--warning-600);
  border-color: var(--warning-200);
}

.compare-grid {
  display: flex;
  background-color: white;
  border-radius: var(--radius-xl);
  border: 1px solid var(--slate-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  position: relative;
}

.compare-col {
  flex: 1;
  min-width: 0;
}

.compare-divider {
  width: 1px;
  background-color: var(--slate-200);
}

.col-header {
  padding: var(--space-5);
  border-bottom: 1px solid var(--slate-200);
  background-color: var(--slate-50);
}

.col-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--info-600);
  background-color: var(--info-100);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.col-badge.target {
  color: var(--warning-600);
  background-color: var(--warning-100);
}

.col-doc-name {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--navy-900);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compare-section {
  padding: var(--space-5);
  border-bottom: 1px solid var(--slate-100);
}

.compare-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--slate-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-4) 0;
}

.field-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px dashed var(--slate-100);
}

.field-label {
  font-size: 14px;
  color: var(--slate-600);
}

.field-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--navy-900);
}

.field-value.match {
  color: var(--success-600);
}

.field-value.diff {
  color: var(--danger-600);
  background-color: var(--danger-50);
  padding: 0 var(--space-1);
  border-radius: 2px;
}

.text-scroll-area {
  height: 400px;
  overflow-y: auto;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--slate-700);
  background-color: var(--slate-50);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}

.text-scroll-area p {
  margin: 0;
  white-space: pre-wrap;
}

.match-mark {
  background-color: var(--success-100);
  color: var(--success-700);
}

.diff-mark {
  background-color: var(--danger-100);
  color: var(--danger-700);
}

@media (max-width: 900px) {
  .compare-grid {
    flex-direction: column;
  }
  .compare-divider {
    width: 100%;
    height: 1px;
  }
}
"""

write_file('frontend/src/pages/Documents.jsx', docs_jsx)
write_file('frontend/src/pages/Documents.css', docs_css)
write_file('frontend/src/pages/DocumentDetail.jsx', doc_detail_jsx)
write_file('frontend/src/pages/DocumentDetail.css', doc_detail_css)
write_file('frontend/src/pages/DocumentComparison.jsx', compare_jsx)
write_file('frontend/src/pages/DocumentComparison.css', compare_css)
