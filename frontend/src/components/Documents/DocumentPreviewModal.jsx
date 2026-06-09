import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '../common/Button';
import { downloadDocumentFile, getSpreadsheetPreview } from '../../api/documents';
import './DocumentPreviewModal.css';

const inferFileType = (filename = '') => {
  const extension = filename.toLowerCase().split('.').pop();
  const typeByExtension = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    xlsb: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    xls: 'application/vnd.ms-excel',
  };

  return typeByExtension[extension] || '';
};

const getFileExtension = (filename = '') => filename.toLowerCase().split('.').pop() || '';

const isSpreadsheetFile = (type = '', filename = '') => {
  const extension = getFileExtension(filename);
  return type.includes('spreadsheet')
    || type.includes('excel')
    || ['xlsx', 'xlsm', 'xlsb', 'xls'].includes(extension);
};

const getFileType = (response, filename) => {
  const responseType = response.data.type || response.headers['content-type'] || '';
  if (responseType && responseType !== 'application/octet-stream') {
    return responseType;
  }
  return inferFileType(filename) || responseType;
};

const getDocumentFileType = (document) => {
  const fileType = document?.fileType || '';
  if (fileType && fileType !== 'application/octet-stream') {
    return fileType;
  }
  return inferFileType(document?.filename) || fileType;
};

const PdfCanvasPreview = ({ data }) => {
  const containerRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!data || !containerRef.current) return undefined;

    let isCancelled = false;
    let pdfDocument = null;
    let pdfWorker = null;
    const container = containerRef.current;
    container.innerHTML = '';
    setErrorMsg('');

    const renderPdf = async () => {
      try {
        const [{ GlobalWorkerOptions, getDocument }, workerModule] = await Promise.all([
          import('pdfjs-dist/legacy/build/pdf.mjs'),
          import('pdfjs-dist/legacy/build/pdf.worker.mjs?worker'),
        ]);
        const PdfWorker = workerModule.default;
        pdfWorker = new PdfWorker();
        GlobalWorkerOptions.workerPort = pdfWorker;
        pdfDocument = await getDocument({ data: new Uint8Array(data.slice(0)) }).promise;

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
          if (isCancelled) break;

          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const availableWidth = Math.max(container.clientWidth - 32, 320);
          const scale = Math.min(1.5, availableWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });
          const pixelRatio = window.devicePixelRatio || 1;
          const canvas = window.document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          const pageWrap = window.document.createElement('div');
          pageWrap.className = 'document-pdf-page';
          pageWrap.appendChild(canvas);
          container.appendChild(pageWrap);

          await page.render({
            canvasContext: context,
            viewport,
            transform: pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined,
          }).promise;
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMsg(`Unable to render this PDF preview. ${error?.message || ''}`.trim());
        }
      }
    };

    renderPdf();

    return () => {
      isCancelled = true;
      container.innerHTML = '';
      if (pdfDocument) {
        pdfDocument.destroy();
      }
      if (pdfWorker) {
        pdfWorker.terminate();
      }
    };
  }, [data]);

  return (
    <div className="document-pdf-scroll">
      {errorMsg && <div className="document-popup-state">{errorMsg}</div>}
      <div ref={containerRef} className="document-pdf-pages" />
    </div>
  );
};

const SpreadsheetPreview = ({ preview }) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const sheets = preview?.sheets || [];

  const activeSheet = sheets[activeSheetIndex];

  return (
    <div className="document-sheet-preview">
      {sheets.length === 0 && (
        <div className="document-popup-state">Loading workbook...</div>
      )}

      {sheets.length > 0 && (
        <>
          <div className="document-sheet-tabs">
            {sheets.map((sheet, index) => (
              <button
                key={sheet.name}
                className={`document-sheet-tab ${index === activeSheetIndex ? 'active' : ''}`}
                onClick={() => setActiveSheetIndex(index)}
              >
                {sheet.name}
              </button>
            ))}
          </div>

          {activeSheet?.truncated && (
            <div className="document-sheet-note">
              Showing first {preview.maxRows} rows and {preview.maxColumns} columns of {activeSheet.originalRows} rows and {activeSheet.originalColumns} columns.
            </div>
          )}

          <div className="document-sheet-table-wrap">
            <table className="document-sheet-table">
              <tbody>
                {activeSheet?.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const DocumentPreviewModal = ({ document, isOpen, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewPdfData, setPreviewPdfData] = useState(null);
  const [previewSpreadsheetData, setPreviewSpreadsheetData] = useState(null);
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
      setPreviewPdfData(null);
      setPreviewSpreadsheetData(null);

      try {
        const initialType = getDocumentFileType(document);
        if (isSpreadsheetFile(initialType, document.filename)) {
          const previewResponse = await getSpreadsheetPreview(document.id);
          if (!isMounted) return;
          setPreviewType(initialType);
          setPreviewSpreadsheetData(previewResponse.data);
          return;
        }

        const response = await downloadDocumentFile(document.id);
        const type = getFileType(response, document.filename);
        const previewBlob = type ? new Blob([response.data], { type }) : response.data;
        if (type.startsWith('application/pdf')) {
          const pdfData = await previewBlob.arrayBuffer();
          if (!isMounted) return;
          setPreviewPdfData(pdfData);
        } else {
          objectUrl = window.URL.createObjectURL(previewBlob);
        }
        if (!isMounted) {
          if (objectUrl) {
            window.URL.revokeObjectURL(objectUrl);
          }
          return;
        }
        setPreviewUrl(objectUrl);
        setPreviewType(type);
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
    previewType.startsWith('image/') ||
    isSpreadsheetFile(previewType, document?.filename);

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

          {!isLoading && !errorMsg && previewPdfData && previewType.startsWith('application/pdf') && (
            <PdfCanvasPreview data={previewPdfData} />
          )}

          {!isLoading && !errorMsg && previewUrl && previewType.startsWith('image/') && (
            <img className="document-popup-image" src={previewUrl} alt={document?.filename || 'Document preview'} />
          )}

          {!isLoading && !errorMsg && previewSpreadsheetData && isSpreadsheetFile(previewType, document?.filename) && (
            <SpreadsheetPreview preview={previewSpreadsheetData} />
          )}

          {!isLoading && !errorMsg && !previewPdfData && !previewSpreadsheetData && previewUrl && !canPreview && (
            <div className="document-popup-state">
              Preview is available for PDF, image, and Excel files. Use Download to open this file.
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
