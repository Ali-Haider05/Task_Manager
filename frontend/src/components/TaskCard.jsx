import React, { useState } from 'react';
import { Calendar, AlertCircle, Edit2, Trash2, MoreVertical, ChevronDown } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { _id, id, title, description, status = 'todo', priority = 'medium', dueDate } = task;
  const taskId = _id || id;

  const isCompleted = status === 'done' || status === 'completed';
  const hasDueDate = Boolean(dueDate);
  const dueDateTime = hasDueDate ? new Date(dueDate) : null;
  const isOverdue =
    hasDueDate &&
    !isCompleted &&
    dueDateTime.setHours(23, 59, 59, 999) < new Date().getTime();

  const formattedDueDate = hasDueDate
    ? new Date(dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No due date';

  const handleStatusSelect = async (newStatus) => {
    setStatusMenuOpen(false);
    if (newStatus === status) return;
    if (onStatusChange) {
      setUpdatingStatus(true);
      try {
        await onStatusChange(taskId, newStatus);
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border p-5 transition-all duration-200 hover:shadow-premium flex flex-col justify-between ${
        isOverdue
          ? 'border-red-200 bg-red-50/30'
          : 'border-borderLight hover:border-sage/40'
      }`}
    >
      {/* Top Header: Badges & Actions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-danger border border-red-200">
                <AlertCircle className="w-3 h-3" />
                <span>Overdue</span>
              </span>
            )}
          </div>

          {/* Quick Action Dropdown */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit && onEdit(task)}
              type="button"
              className="p-1.5 text-muted hover:text-forest hover:bg-beige/40 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete && onDelete(task)}
              type="button"
              className="p-1.5 text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Title */}
        <h4
          className={`text-base font-semibold text-charcoal leading-snug line-clamp-2 mb-2 ${
            isCompleted ? 'line-through text-muted' : ''
          }`}
        >
          {title}
        </h4>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted line-clamp-3 mb-4 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}
      </div>

      {/* Footer: Due Date & Quick Status Switcher */}
      <div className="pt-3 border-t border-borderLight/70 flex items-center justify-between gap-2 text-xs text-muted mt-3">
        {/* Due Date Display */}
        <div
          className={`flex items-center gap-1.5 ${
            isOverdue ? 'text-danger font-medium' : 'text-muted'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDueDate}</span>
        </div>

        {/* Quick Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            disabled={updatingStatus}
            onClick={() => setStatusMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-ivory hover:bg-beige text-charcoal text-xs font-medium border border-borderLight transition-colors"
          >
            <span>Change Status</span>
            <ChevronDown className="w-3 h-3 text-muted" />
          </button>

          {statusMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStatusMenuOpen(false)}
              />
              <div className="absolute right-0 bottom-full mb-1.5 z-20 w-36 bg-white rounded-lg shadow-premium border border-borderLight py-1 text-xs animate-fade-in-scale">
                <button
                  type="button"
                  onClick={() => handleStatusSelect('todo')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-ivory flex items-center justify-between ${
                    status === 'todo' ? 'font-semibold text-charcoal bg-beige/30' : 'text-muted'
                  }`}
                >
                  To Do
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusSelect('in-progress')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-ivory flex items-center justify-between ${
                    status === 'in-progress' || status === 'inprogress'
                      ? 'font-semibold text-charcoal bg-beige/30'
                      : 'text-muted'
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusSelect('done')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-ivory flex items-center justify-between ${
                    status === 'done' ? 'font-semibold text-charcoal bg-beige/30' : 'text-muted'
                  }`}
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
