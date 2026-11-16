import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle = 'this task',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md rounded-xl border border-borderLight shadow-modal overflow-hidden animate-fade-in-scale">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-danger flex-shrink-0 border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              type="button"
              className="text-muted hover:text-charcoal p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-charcoal">
              Delete Task
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-charcoal">
                "{taskTitle}"
              </span>
              ? This action cannot be undone and all data associated with this task will be removed.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg border border-borderLight text-charcoal text-sm font-medium hover:bg-ivory transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-danger hover:bg-danger/90 text-white text-sm font-medium shadow-subtle transition-all duration-150 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
