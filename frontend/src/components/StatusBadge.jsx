import React from 'react';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');

  switch (normalized) {
    case 'done':
    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-natural-light text-natural border border-natural/20 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Done</span>
        </span>
      );

    case 'in-progress':
    case 'inprogress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-info border border-info/20 ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>In Progress</span>
        </span>
      );

    case 'todo':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-beige text-muted border border-borderLight ${className}`}
        >
          <Circle className="w-3 h-3 stroke-[2.5]" />
          <span>To Do</span>
        </span>
      );
  }
};

export default StatusBadge;
