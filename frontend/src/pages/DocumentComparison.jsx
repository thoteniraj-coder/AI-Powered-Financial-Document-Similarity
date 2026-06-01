import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

import ScoreRing from '../components/Search/ScoreRing';
import { Button } from '../components/common/Button';
import './DocumentComparison.css';

const DocumentComparison = () => {
  const navigate = useNavigate();

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
    </>
  );
};

export default DocumentComparison;
