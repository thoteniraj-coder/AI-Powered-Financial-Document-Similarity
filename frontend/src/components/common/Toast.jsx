import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import './Toast.css';

export function Toast({ type = 'info', message, onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation
  };

  const icons = {
    success: <CheckCircle className="toast-icon text-success" size={20} />,
    warning: <AlertTriangle className="toast-icon text-warning" size={20} />,
    error: <XCircle className="toast-icon text-danger" size={20} />,
    info: <Info className="toast-icon text-info" size={20} />
  };

  if (!isVisible && !onClose) return null;

  return (
    <div className={`toast toast-${type} ${!isVisible ? 'toast-exit' : ''}`}>
      {icons[type]}
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  );
}

// Simple Toast Container
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
}
