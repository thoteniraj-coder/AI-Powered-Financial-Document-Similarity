import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')
    print(f"Created {path}")

# Common components
modal_jsx = """
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
"""

modal_css = """
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 15, 30, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  animation: fadeIn var(--transition-deliberate);
}

.modal-card {
  background-color: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - var(--space-16));
  display: flex;
  flex-direction: column;
  animation: slideUp var(--transition-deliberate);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--slate-100);
}

.modal-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: var(--navy-900);
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  color: var(--slate-500);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.modal-close-btn:hover {
  background-color: var(--slate-100);
  color: var(--navy-900);
}

.modal-close-btn:focus-visible {
  outline: 2px solid var(--navy-500);
  outline-offset: 2px;
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  font-family: 'IBM Plex Sans', sans-serif;
  color: var(--slate-700);
}

.modal-footer {
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--slate-100);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  background-color: var(--slate-50);
  border-bottom-left-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-xl);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .modal-backdrop, .modal-card {
    animation: none;
  }
}
"""

confirm_jsx = """
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false, isLoading = false }) => {
  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
        {isDanger && (
          <div style={{ color: 'var(--danger-600)', backgroundColor: 'var(--danger-100)', padding: 'var(--space-2)', borderRadius: 'var(--radius-full)' }}>
            <AlertTriangle size={24} />
          </div>
        )}
        <div style={{ marginTop: isDanger ? 'var(--space-1)' : 0 }}>
          <p style={{ margin: 0, lineHeight: '1.5' }}>{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
"""

score_ring_jsx = """
import React, { useEffect, useState } from 'react';
import './ScoreRing.css';

const ScoreRing = ({ score, size = 'md' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setAnimatedScore(score);
    } else {
      let start = 0;
      const duration = 500;
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutQuad)
        const easeProgress = progress * (2 - progress);
        setAnimatedScore(Math.round(easeProgress * score * 100) / 100);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [score]);

  const sizeMap = {
    sm: { width: 48, strokeWidth: 4, textClass: 'score-text-sm' },
    md: { width: 64, strokeWidth: 5, textClass: 'score-text-md' },
    lg: { width: 80, strokeWidth: 6, textClass: 'score-text-lg' }
  };

  const { width, strokeWidth, textClass } = sizeMap[size] || sizeMap.md;
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore * circumference);

  let colorClass = 'score-gray';
  if (animatedScore >= 0.85) colorClass = 'score-green';
  else if (animatedScore >= 0.70) colorClass = 'score-amber';
  else if (animatedScore >= 0.60) colorClass = 'score-yellow';

  return (
    <div className={`score-ring ${colorClass}`} style={{ width, height: width }}>
      <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
        <circle
          className="score-ring-bg"
          cx={width / 2}
          cy={width / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="score-ring-progress"
          cx={width / 2}
          cy={width / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${width/2} ${width/2})`}
        />
      </svg>
      <div className={`score-ring-text ${textClass}`}>
        {Math.round(animatedScore * 100)}%
      </div>
    </div>
  );
};

export default ScoreRing;
"""

score_ring_css = """
.score-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.score-ring-bg {
  fill: none;
  stroke: var(--slate-100);
}

.score-ring-progress {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.1s linear;
}

.score-ring-text {
  position: absolute;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 500;
  color: var(--navy-900);
}

.score-text-sm { font-size: 12px; }
.score-text-md { font-size: 14px; }
.score-text-lg { font-size: 18px; font-weight: 600; }

.score-green .score-ring-progress { stroke: var(--success-600); }
.score-green .score-ring-text { color: var(--success-600); }

.score-amber .score-ring-progress { stroke: var(--amber-500); }
.score-amber .score-ring-text { color: var(--amber-500); }

.score-yellow .score-ring-progress { stroke: #EAB308; }
.score-yellow .score-ring-text { color: #EAB308; }

.score-gray .score-ring-progress { stroke: var(--slate-500); }
.score-gray .score-ring-text { color: var(--slate-500); }
"""

sim_badge_jsx = """
import React from 'react';

const SimilarityBadge = ({ type, size = 'md' }) => {
  const styles = {
    STRONG_MATCH: { bg: 'var(--success-100)', color: 'var(--success-600)', label: 'Strong Match' },
    RELATED: { bg: 'var(--warning-100)', color: 'var(--warning-600)', label: 'Related' },
    WEAK_MATCH: { bg: '#FEF08A', color: '#A16207', label: 'Weak Match' }
  };

  const config = styles[type] || { bg: 'var(--slate-100)', color: 'var(--slate-700)', label: 'Unknown' };
  
  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px' },
    md: { padding: '4px 10px', fontSize: '12px' }
  };

  return (
    <span style={{
      backgroundColor: config.bg,
      color: config.color,
      borderRadius: 'var(--radius-full)',
      fontFamily: "'IBM Plex Sans', sans-serif",
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      ...sizeStyles[size]
    }}>
      {config.label}
    </span>
  );
};

export default SimilarityBadge;
"""

write_file('frontend/src/components/common/Modal.jsx', modal_jsx)
write_file('frontend/src/components/common/Modal.css', modal_css)
write_file('frontend/src/components/common/ConfirmDialog.jsx', confirm_jsx)
write_file('frontend/src/components/Search/ScoreRing.jsx', score_ring_jsx)
write_file('frontend/src/components/Search/ScoreRing.css', score_ring_css)
write_file('frontend/src/components/Search/SimilarityBadge.jsx', sim_badge_jsx)
