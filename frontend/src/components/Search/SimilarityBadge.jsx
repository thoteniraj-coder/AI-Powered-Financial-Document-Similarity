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
