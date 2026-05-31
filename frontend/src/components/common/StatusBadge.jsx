import React from 'react';

export function StatusBadge({ status }) {
  const config = {
    Indexed: { class: 'badge-success', dot: '#16A34A' },
    Processing: { class: 'badge-warning', dot: '#D97706', animate: true },
    Pending: { class: 'badge-pending', dot: '#6B7280' },
    Failed: { class: 'badge-danger', dot: '#DC2626' },
    Archived: { class: 'badge-pending', dot: '#6B7280' },
  };

  const { class: badgeClass, dot, animate } = config[status] || config.Pending;

  return (
    <span className={`badge ${badgeClass}`}>
      <span 
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dot,
          display: 'inline-block',
          animation: animate ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
        }}
      />
      {status}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </span>
  );
}
