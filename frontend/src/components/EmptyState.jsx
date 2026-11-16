import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

const EmptyState = ({
  icon: Icon = ClipboardList,
  title = 'No tasks yet',
  description = 'Create your first task and start organizing your work.',
  actionLabel = 'Create Task',
  onAction,
  showAction = true,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-borderLight shadow-subtle ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-sage-light flex items-center justify-center text-forest mb-4 border border-sage/20">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal mb-1.5">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {showAction && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-natural hover:bg-natural-hover text-white text-sm font-medium shadow-subtle transition-all duration-150 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
