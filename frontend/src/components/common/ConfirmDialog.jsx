import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { Button } from './Button';

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
