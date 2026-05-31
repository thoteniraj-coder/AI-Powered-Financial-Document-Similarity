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
