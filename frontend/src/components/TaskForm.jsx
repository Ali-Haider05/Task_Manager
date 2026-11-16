import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Calendar, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const TaskForm = ({ initialData = null, isModal = false, onClose = null, onSuccess = null }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();

  const isEditMode = Boolean(id || initialData?._id || initialData?.id);
  const taskId = id || initialData?._id || initialData?.id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode && !initialData);
  const [slowServerWarning, setSlowServerWarning] = useState(false);

  // If editing and no initialData was passed via props, fetch task by id
  useEffect(() => {
    let isMounted = true;
    let timer;

    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        priority: initialData.priority || 'medium',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
      });
      return;
    }

    if (id) {
      setFetching(true);
      timer = setTimeout(() => {
        if (isMounted) setSlowServerWarning(true);
      }, 5000);

      api
        .get(`/tasks/${id}`)
        .then((res) => {
          if (!isMounted) return;
          const task = res.data?.task || res.data?.data || res.data;
          setFormData({
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          });
        })
        .catch((err) => {
          if (!isMounted) return;
          const msg = err.response?.data?.message || 'Failed to load task details.';
          showError(msg);
          navigate('/tasks');
        })
        .finally(() => {
          if (isMounted) {
            clearTimeout(timer);
            setFetching(false);
            setSlowServerWarning(false);
          }
        });
    }

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [id, initialData, navigate, showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const slowTimer = setTimeout(() => {
      setSlowServerWarning(true);
    }, 4000);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
    };

    try {
      if (isEditMode) {
        await api.put(`/tasks/${taskId}`, payload);
        showSuccess('Task updated successfully.');
      } else {
        await api.post('/tasks', payload);
        showSuccess('Task added successfully.');
      }

      if (onSuccess) {
        onSuccess();
      } else if (onClose) {
        onClose();
      } else {
        navigate('/tasks');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (isEditMode ? 'Failed to update task.' : 'Failed to create task.');
      showError(msg);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowServerWarning(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/tasks');
    }
  };

  if (fetching) {
    return (
      <div className="bg-white rounded-xl border border-borderLight p-10 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-natural mb-3" />
        <p className="text-sm font-medium text-charcoal">Loading task information...</p>
        {slowServerWarning && (
          <p className="text-xs text-muted mt-2 max-w-xs text-center">
            Connecting to server... Cold backend may take a moment to wake up.
          </p>
        )}
      </div>
    );
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-charcoal mb-1.5"
        >
          Task Title <span className="text-danger">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Finalize project proposal for client"
          className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-charcoal placeholder:text-muted/60 text-sm focus:outline-none focus:ring-2 transition-all ${
            errors.title
              ? 'border-danger focus:ring-danger/20'
              : 'border-borderLight focus:border-forest focus:ring-forest/10'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-danger flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.title}</span>
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-charcoal mb-1.5"
        >
          Description <span className="text-muted text-xs font-normal">(Optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Add details, notes, links or acceptance criteria..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-borderLight bg-white text-charcoal placeholder:text-muted/60 text-sm focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all resize-y"
        />
      </div>

      {/* Grid: Status, Priority, Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-borderLight bg-white text-charcoal text-sm focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all cursor-pointer"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-borderLight bg-white text-charcoal text-sm focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            Due Date
          </label>
          <div className="relative">
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-borderLight bg-white text-charcoal text-sm focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Server notice if waking */}
      {slowServerWarning && (
        <div className="p-3 bg-amber-50 rounded-lg border border-warning/30 text-xs text-charcoal flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-warning flex-shrink-0" />
          <span>The backend server is waking up from inactivity. Please hold on...</span>
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="pt-4 border-t border-borderLight flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg border border-borderLight text-charcoal text-sm font-medium hover:bg-beige/30 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-natural hover:bg-natural-hover text-white text-sm font-medium shadow-subtle transition-all duration-150 disabled:opacity-50 active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditMode ? 'Update Task' : 'Save Task'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  // If used as a standalone page component (via /tasks/new or /tasks/:id/edit)
  if (!isModal) {
    return (
      <div className="max-w-3xl mx-auto py-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-forest transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Tasks</span>
          </Link>
          <h1 className="text-2xl font-bold text-charcoal">
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </h1>
          <p className="text-sm text-muted mt-1">
            {isEditMode
              ? 'Update the details and schedule for this task.'
              : 'Add a new task to your personal workspace to stay organized.'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl border border-borderLight shadow-premium p-6 md:p-8">
          {content}
        </div>
      </div>
    );
  }

  // Modal variant
  return content;
};

export default TaskForm;
