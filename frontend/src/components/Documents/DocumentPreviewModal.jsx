import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '../common/Button';
import { downloadDocumentFile } from '../../api/documents';
import './DocumentPreviewModal.css';

const getFileType = (response) => response.data.type || response.headers['content-type'] || '';

const DocumentPreviewModal = ({ document, isOpen, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !document?.id) return undefined;

    let objectUrl = '';
    let isMounted = true;

    const loadPreview = async () => {
      setIsLoading(true);
      setErrorMsg('');
      setPreviewUrl('');
      setPreviewType('');

      try {
        const response = await downloadDocumentFile(document.id);
        objectUrl = window.URL.createObjectURL(response.data);
        if (!isMounted) {
          window.URL.revokeObjectURL(objectUrl);
          return;
        }
        setPreviewUrl(objectUrl);
        setPreviewType(getFileType(response));
      } catch (error) {
        if (isMounted) {
          setErrorMsg('Unable to load the document preview.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [document?.id, isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.document.addEventListener('keydown', handleEscape);
      window.document.body.style.overflow = 'hidden';
    }

    return () => {
      window.document.removeEventListener('keydown', handleEscape);
      window.document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    if (!document?.id) return;

    try {
      const response = await downloadDocumentFile(document.id);
      const url = window.URL.createObjectURL(response.data);
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.filename || `document-${document.id}`);
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setErrorMsg('Failed to download document.');
    }
  };

  if (!isOpen) return null;

  const canPreview =
    previewType.startsWith('application/pdf') ||
    previewType.startsWith('image/');

  return (
    <div className="document-preview-backdrop" onClick={onClose}>
      <div className="document-preview-modal" onClick={(event) => event.stopPropagation()}>
        <div className="document-preview-header">
          <div className="document-preview-title-wrap">
            <h3 className="document-preview-title">{document?.filename || 'Document preview'}</h3>
            <span className="document-preview-type">{previewType || document?.fileType || 'Loading file'}</span>
          </div>
          <button className="document-preview-close" onClick={onClose} aria-label="Close preview">
            <X size={20} />
          </button>
        </div>

        <div className="document-preview-body">
          {isLoading && <div className="document-popup-state">Loading preview...</div>}

          {!isLoading && errorMsg && <div className="document-popup-state">{errorMsg}</div>}

          {!isLoading && !errorMsg && previewUrl && previewType.startsWith('application/pdf') && (
            <iframe className="document-popup-frame" src={previewUrl} title={document?.filename || 'Document preview'} />
          )}

          {!isLoading && !errorMsg && previewUrl && previewType.startsWith('image/') && (
            <img className="document-popup-image" src={previewUrl} alt={document?.filename || 'Document preview'} />
          )}

          {!isLoading && !errorMsg && previewUrl && !canPreview && (
            <div className="document-popup-state">
              Preview is available for PDF and image files. Use Download to open this file.
            </div>
          )}
        </div>

        <div className="document-preview-footer">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={handleDownload}>Download</Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
