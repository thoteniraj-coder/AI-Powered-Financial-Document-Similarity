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
          <span>Supported: PDF, DOCX, TXT, PNG, JPG, XLSX, XLS</span>
          <span className="dot-separator">•</span>
          <span>Max size: {maxSize / (1024 * 1024)}MB</span>
        </div>
        {error && <div className="drop-error">{error}</div>}
      </div>
    </div>
  );
};

export default FileDropZone;
