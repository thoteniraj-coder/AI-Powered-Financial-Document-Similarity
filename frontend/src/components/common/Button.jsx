import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  icon: Icon,
  className = '',
  ...props 
}) {
  const baseClass = `btn btn-${variant}`;
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 min-h-[36px]' : size === 'lg' ? 'px-6 py-3 min-h-[52px]' : '';
  
  return (
    <button 
      className={`${baseClass} ${sizeClass} ${className}`.trim()} 
      disabled={isLoading || disabled} 
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" size={16} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
}
