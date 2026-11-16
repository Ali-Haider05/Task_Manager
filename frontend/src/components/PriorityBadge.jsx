import React from 'react';
import { ArrowDown, Minus, ArrowUp } from 'lucide-react';

const PriorityBadge = ({ priority, className = '' }) => {
  const normalized = (priority || '').toLowerCase();

  switch (normalized) {
    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-danger border border-danger/20 ${className}`}
        >
          <ArrowUp className="w-3 h-3 stroke-[2.5]" />
          <span>High</span>
        </span>
      );

    case 'medium':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-warning border border-warning/20 ${className}`}
        >
          <Minus className="w-3 h-3 stroke-[2.5]" />
          <span>Medium</span>
        </span>
      );

    case 'low':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sage-light text-forest border border-sage/30 ${className}`}
        >
          <ArrowDown className="w-3 h-3 stroke-[2.5]" />
          <span>Low</span>
        </span>
      );
  }
};

export default PriorityBadge;
