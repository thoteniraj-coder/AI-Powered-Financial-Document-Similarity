import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')
    print(f"Created {path}")

# Phase 2 Components
dropzone_jsx = """
import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText, File, Image as ImageIcon } from 'lucide-react';
import './FileDropZone.css';

const FileDropZone = ({ onFileSelect, accept = "*", maxSize = 50 * 1024 * 1024 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndSelect = (file) => {
    setError(null);
    if (!file) return;
    
    if (file.size > maxSize) {
      setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    onFileSelect(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  }, [maxSize, onFileSelect]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${error ? 'has-error' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleChange} 
        accept={accept} 
        style={{ display: 'none' }} 
      />
      <div className="drop-zone-content">
        <div className="drop-icon-container">
          <UploadCloud size={40} className="drop-icon" />
        </div>
        <h3 className="drop-title">Drag & drop your file here</h3>
        <p className="drop-subtitle">or click to browse from your computer</p>
        <div className="drop-meta">
          <span>Supported: PDF, DOCX, TXT, PNG, JPG</span>
          <span className="dot-separator">•</span>
          <span>Max size: {maxSize / (1024 * 1024)}MB</span>
        </div>
        {error && <div className="drop-error">{error}</div>}
      </div>
    </div>
  );
};

export default FileDropZone;
"""

dropzone_css = """
.file-drop-zone {
  border: 2px dashed var(--slate-300);
  border-radius: var(--radius-lg);
  background-color: var(--navy-50);
  padding: var(--space-10) var(--space-6);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-standard);
  outline: none;
}

.file-drop-zone:hover, .file-drop-zone:focus-visible {
  border-color: var(--navy-500);
  background-color: var(--navy-100);
}

.file-drop-zone:focus-visible {
  box-shadow: 0 0 0 4px rgba(46, 72, 153, 0.2);
}

.file-drop-zone.dragging {
  border-color: var(--navy-600);
  background-color: var(--navy-100);
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}

.file-drop-zone.has-error {
  border-color: var(--danger-600);
  background-color: var(--danger-100);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.drop-icon-container {
  background-color: white;
  border-radius: var(--radius-full);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-4);
  color: var(--navy-600);
}

.drop-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: var(--navy-900);
  margin: 0 0 var(--space-2) 0;
}

.drop-subtitle {
  color: var(--slate-600);
  margin: 0 0 var(--space-4) 0;
}

.drop-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 12px;
  color: var(--slate-500);
}

.dot-separator {
  color: var(--slate-300);
}

.drop-error {
  margin-top: var(--space-4);
  color: var(--danger-600);
  font-weight: 500;
  font-size: 14px;
}
"""

pipeline_jsx = """
import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import './ProcessingPipeline.css';

const STEPS = [
  { id: 'uploading', label: 'Uploading' },
  { id: 'extracting', label: 'Extracting Text' },
  { id: 'ocr', label: 'OCR Processing' },
  { id: 'chunking', label: 'Chunking' },
  { id: 'embedding', label: 'Generating Embeddings' },
  { id: 'storing', label: 'Storing' },
  { id: 'complete', label: 'Complete' }
];

const ProcessingPipeline = ({ currentStepId, status = 'processing', error = null }) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentStepId);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="processing-pipeline">
      <div className="pipeline-track-container">
        <div className="pipeline-track-bg"></div>
        <div 
          className="pipeline-track-fill" 
          style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        <div className="pipeline-steps">
          {STEPS.map((step, index) => {
            const isCompleted = index < activeIndex || (index === STEPS.length - 1 && status === 'success');
            const isActive = index === activeIndex && status === 'processing';
            const isError = index === activeIndex && status === 'error';
            const isPending = index > activeIndex;
            
            let stepClass = 'step-pending';
            if (isCompleted) stepClass = 'step-completed';
            if (isActive) stepClass = 'step-active';
            if (isError) stepClass = 'step-error';

            return (
              <div key={step.id} className={`pipeline-step ${stepClass}`}>
                <div className="step-icon-container">
                  {isCompleted && <Check size={14} />}
                  {isActive && <Loader2 size={14} className="spin-icon" />}
                  {isError && <X size={14} />}
                  {isPending && <span className="step-dot"></span>}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      {error && (
        <div className="pipeline-error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProcessingPipeline;
"""

pipeline_css = """
.processing-pipeline {
  padding: var(--space-6) 0;
  width: 100%;
}

.pipeline-track-container {
  position: relative;
  padding-top: var(--space-4);
  padding-bottom: var(--space-8);
}

.pipeline-track-bg {
  position: absolute;
  top: var(--space-6);
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--slate-200);
  z-index: 1;
}

.pipeline-track-fill {
  position: absolute;
  top: var(--space-6);
  left: 0;
  height: 2px;
  background-color: var(--success-600);
  z-index: 2;
  transition: width var(--transition-slow);
}

.pipeline-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 3;
}

.pipeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}

.step-icon-container {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 2px solid;
  margin-bottom: var(--space-2);
  transition: all var(--transition-standard);
}

.step-label {
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  color: var(--slate-500);
}

/* States */
.step-pending .step-icon-container {
  border-color: var(--slate-300);
}
.step-pending .step-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--slate-300);
}

.step-completed .step-icon-container {
  border-color: var(--success-600);
  background-color: var(--success-600);
  color: white;
}
.step-completed .step-label {
  color: var(--success-600);
}

.step-active .step-icon-container {
  border-color: var(--amber-500);
  color: var(--amber-500);
  animation: pulse-amber 2s infinite;
}
.step-active .step-label {
  color: var(--navy-900);
  font-weight: 600;
}

.step-error .step-icon-container {
  border-color: var(--danger-600);
  background-color: var(--danger-600);
  color: white;
}
.step-error .step-label {
  color: var(--danger-600);
  font-weight: 600;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-amber {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

.pipeline-error-message {
  margin-top: var(--space-4);
  padding: var(--space-3);
  background-color: var(--danger-100);
  color: var(--danger-600);
  border-radius: var(--radius-md);
  font-size: 14px;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .spin-icon, .step-active .step-icon-container {
    animation: none;
  }
}
"""

upload_jsx = """
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { File, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import FileDropZone from '../components/Upload/FileDropZone';
import ProcessingPipeline from '../components/Upload/ProcessingPipeline';
import Button from '../components/common/Button';
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
    <AppLayout>
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
    </AppLayout>
  );
};

export default Upload;
"""

upload_css = """
.upload-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: var(--navy-900);
  margin: 0 0 var(--space-2) 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: var(--slate-600);
  font-size: 16px;
  margin: 0;
}

.upload-container {
  background-color: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: var(--space-8);
  border: 1px solid var(--slate-200);
}

.file-preview-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  background-color: var(--slate-50);
  margin-bottom: var(--space-6);
}

.file-preview-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.file-icon-bg {
  background-color: var(--navy-100);
  color: var(--navy-600);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  color: var(--navy-900);
  margin-bottom: var(--space-1);
}

.file-size {
  font-size: 12px;
  color: var(--slate-500);
}

.remove-file-btn {
  background: none;
  border: none;
  color: var(--slate-400);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.remove-file-btn:hover {
  color: var(--danger-600);
  background-color: var(--danger-50);
}

/* Metadata section */
.metadata-section {
  margin-bottom: var(--space-6);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.metadata-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background-color: white;
  border: none;
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  color: var(--navy-800);
  transition: background-color var(--transition-fast);
}

.metadata-toggle:hover {
  background-color: var(--slate-50);
}

.metadata-form {
  padding: var(--space-5);
  border-top: 1px solid var(--slate-200);
  background-color: var(--slate-50);
}

.form-group {
  margin-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--navy-800);
  margin-bottom: var(--space-2);
}

.form-group input, .form-group select {
  padding: var(--space-3);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: var(--navy-500);
  box-shadow: 0 0 0 3px rgba(46, 72, 153, 0.1);
}

.form-row {
  display: flex;
  gap: var(--space-4);
}

.form-group.half {
  flex: 1;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--slate-200);
}

/* Processing and Success States */
.processing-state, .success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8) 0;
}

.state-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--navy-900);
  margin: 0 0 var(--space-2) 0;
}

.state-subtitle {
  color: var(--slate-600);
  margin: 0 0 var(--space-8) 0;
}

.success-icon-container {
  color: var(--success-600);
  margin-bottom: var(--space-4);
  animation: scale-in var(--transition-deliberate);
}

.success-actions {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

@keyframes scale-in {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .success-icon-container {
    animation: none;
  }
}
"""

write_file('frontend/src/components/Upload/FileDropZone.jsx', dropzone_jsx)
write_file('frontend/src/components/Upload/FileDropZone.css', dropzone_css)
write_file('frontend/src/components/Upload/ProcessingPipeline.jsx', pipeline_jsx)
write_file('frontend/src/components/Upload/ProcessingPipeline.css', pipeline_css)
write_file('frontend/src/pages/Upload.jsx', upload_jsx)
write_file('frontend/src/pages/Upload.css', upload_css)
