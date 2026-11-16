import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-info flex-shrink-0" />,
};

const bgColors = {
  success: 'bg-white border-l-4 border-l-success border-borderLight',
  error: 'bg-white border-l-4 border-l-danger border-borderLight',
  warning: 'bg-white border-l-4 border-l-warning border-borderLight',
  info: 'bg-white border-l-4 border-l-info border-borderLight',
};

const Toast = ({ toast, onDismiss }) => {
  const { id, message, type = 'success', duration = 4000 } = toast;

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-lg shadow-premium border ${
        bgColors[type] || bgColors.info
      } animate-slide-in-right transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        {icons[type] || icons.info}
        <div className="text-sm font-medium text-charcoal leading-snug">
          {message}
        </div>
      </div>
      <button
        onClick={onDismiss}
        type="button"
        className="text-muted hover:text-charcoal p-0.5 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
