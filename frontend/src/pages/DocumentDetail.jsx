import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Columns, FileSearch } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import ScoreRing from '../components/Search/ScoreRing';
import { Button } from '../components/common/Button';
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
