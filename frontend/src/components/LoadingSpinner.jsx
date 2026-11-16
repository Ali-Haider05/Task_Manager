import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({
  size = 'md',
  message = '',
  submessage = '',
  fullPage = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-natural`}
      />
      {message && (
        <p className="text-sm font-medium text-charcoal text-center">{message}</p>
      )}
      {submessage && (
        <p className="text-xs text-muted text-center max-w-xs">{submessage}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-ivory/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-borderLight shadow-premium flex flex-col items-center max-w-sm text-center animate-fade-in-scale">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
