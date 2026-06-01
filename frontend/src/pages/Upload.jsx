import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { File, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

import FileDropZone from '../components/Upload/FileDropZone';
import ProcessingPipeline from '../components/Upload/ProcessingPipeline';
import { Button } from '../components/common/Button';
import './Upload.css';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState({
    documentType: 'invoice',
    vendor: '',
    invoiceNumber: '',
    invoiceDate: '',
    amount: '',
    currency: 'USD',
    department: ''
  });
  
  // Pipeline state
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, complete, error
  const [currentStep, setCurrentStep] = useState('uploading');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setUploadState('idle');
  };

  const handleClearFile = () => {
    setFile(null);
    setUploadState('idle');
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = () => {
    if (!file) return;
    
    setUploadState('processing');
    setCurrentStep('uploading');
    
    // Mock progression
    const steps = ['uploading', 'extracting', 'ocr', 'chunking', 'embedding', 'storing', 'complete'];
    let stepIdx = 0;
    
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx >= steps.length) {
        clearInterval(interval);
        setUploadState('complete');
      } else {
        setCurrentStep(steps[stepIdx]);
      }
    }, 1500);
  };

  return (
    <>
      <div className="upload-page">
        <div className="page-header">
          <h1 className="page-title">Upload Document</h1>
          <p className="page-subtitle">Upload files to analyze and find similarities across your knowledge base.</p>
        </div>

        <div className="upload-container">
          {uploadState === 'idle' && (
            <>
              {!file ? (
                <FileDropZone onFileSelect={handleFileSelect} />
              ) : (
                <div className="file-preview-card">
                  <div className="file-preview-info">
                    <div className="file-icon-bg">
                      <File className="file-icon" size={24} />
                    </div>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button className="remove-file-btn" onClick={handleClearFile}>
                    <X size={20} />
                  </button>
                </div>
              )}

              {file && (
                <div className="metadata-section">
                  <button 
                    className="metadata-toggle" 
                    onClick={() => setShowMetadata(!showMetadata)}
                  >
                    <span>Optional Metadata</span>
                    {showMetadata ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {showMetadata && (
                    <div className="metadata-form">
                      <div className="form-group">
                        <label>Document Type</label>
                        <select name="documentType" value={metadata.documentType} onChange={handleMetadataChange}>
                          <option value="invoice">Invoice</option>
                          <option value="receipt">Receipt</option>
                          <option value="contract">Contract</option>
                          <option value="bank_statement">Bank Statement</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Vendor / Sender</label>
                        <input type="text" name="vendor" value={metadata.vendor} onChange={handleMetadataChange} placeholder="e.g., Acme Corp" />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group half">
                          <label>Document Number</label>
                          <input type="text" name="invoiceNumber" value={metadata.invoiceNumber} onChange={handleMetadataChange} placeholder="INV-12345" />
                        </div>
                        <div className="form-group half">
                          <label>Date</label>
                          <input type="date" name="invoiceDate" value={metadata.invoiceDate} onChange={handleMetadataChange} />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group half">
                          <label>Amount</label>
                          <input type="number" name="amount" value={metadata.amount} onChange={handleMetadataChange} placeholder="0.00" />
                        </div>
                        <div className="form-group half">
                          <label>Currency</label>
                          <select name="currency" value={metadata.currency} onChange={handleMetadataChange}>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {file && (
                <div className="upload-actions">
                  <Button variant="ghost" onClick={handleClearFile}>Cancel</Button>
                  <Button variant="primary" onClick={handleUpload}>Upload & Process</Button>
                </div>
              )}
            </>
          )}

          {uploadState === 'processing' && (
            <div className="processing-state">
              <h3 className="state-title">Processing Document</h3>
              <p className="state-subtitle">{file?.name}</p>
              <ProcessingPipeline currentStepId={currentStep} status="processing" />
            </div>
          )}

          {uploadState === 'complete' && (
            <div className="success-state">
              <div className="success-icon-container">
                <CheckCircle size={48} className="success-icon" />
              </div>
              <h3 className="state-title">Upload Complete</h3>
              <p className="state-subtitle">Your document has been successfully processed and added to the index.</p>
              
              <div className="success-actions">
                <Button variant="outline" onClick={handleClearFile}>Upload Another</Button>
                <Button variant="primary" onClick={() => navigate('/search')}>Search Similar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Upload;
