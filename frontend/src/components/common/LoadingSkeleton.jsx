import React from 'react';
import './LoadingSkeleton.css';

export function LoadingSkeleton({ type = 'text', count = 1, className = '' }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <div className={`skeleton skeleton-card ${className}`}></div>;
      case 'stat-card':
        return <div className={`skeleton skeleton-stat-card ${className}`}></div>;
      case 'table-row':
        return <div className={`skeleton skeleton-table-row ${className}`}></div>;
      case 'text':
      default:
        return <div className={`skeleton skeleton-text ${className}`}></div>;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
}
