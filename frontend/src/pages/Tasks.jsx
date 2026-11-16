import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/TaskCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import TaskForm from '../components/TaskForm';

const Tasks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  // Search & Filters from URL or default state
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'all';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, dueDate
  const [viewMode, setViewMode] = useState('grid'); // grid, table

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [slowServerNotice, setSlowServerNotice] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Synchronize URL parameters with local state
  const updateUrlParams = useCallback(
    (newSearch, newStatus) => {
      const params = {};
      if (newSearch) params.search = newSearch;
      if (newStatus && newStatus !== 'all') params.status = newStatus;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Fetch tasks from API
  const fetchTasks = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    const slowTimer = setTimeout(() => {
      setSlowServerNotice(true);
    }, 4500);

    try {
      // Build query params
      const params = {};
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.get('/tasks', { params });
      const rawData =
        res.data?.tasks ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      setTasks(rawData);
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to fetch tasks.';
      showError(msg);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setRefreshing(false);
      setSlowServerNotice(false);
    }
  }, [statusFilter, searchTerm, showError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle Search Input Change with slight debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    updateUrlParams(val, statusFilter);
  };

  const handleStatusFilterChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    updateUrlParams(searchTerm, val);
  };

  // Client-side filtering & sorting for priority & sort order
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Additional client-side search check in case backend doesn't support substring
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Additional client-side status check
    if (statusFilter && statusFilter !== 'all') {
      const sf = statusFilter.toLowerCase();
      result = result.filter((t) => {
        const norm = (t.status || '').toLowerCase().replace(/_/g, '-');
        return norm === sf;
      });
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(
        (t) => (t.priority || '').toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.createdAt || a._id || 0);
        const dateB = new Date(b.createdAt || b._id || 0);
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = new Date(a.createdAt || a._id || 0);
        const dateB = new Date(b.createdAt || b._id || 0);
        return dateA - dateB;
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });

    return result;
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy]);

  // Status Change directly from TaskCard or Table
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === taskId ? { ...t, status: newStatus } : t
        )
      );
      showSuccess('Status updated.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      showError(msg);
    }
  };

  // Delete flow
  const handleOpenDelete = (task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete._id || taskToDelete.id;

    setDeleting(true);
    try {
      await api.delete(`/tasks/${taskId}`);
      showSuccess('Task deleted successfully.');
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      // Refresh list
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task.';
      showError(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Edit flow
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditingTask(null);
    fetchTasks(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-borderLight/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage your work, stay organized, and keep moving forward.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchTasks(true)}
            disabled={refreshing || loading}
            type="button"
            className="p-2.5 rounded-lg border border-borderLight bg-white hover:bg-beige/40 text-charcoal transition-colors disabled:opacity-50"
            title="Refresh task list"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin text-natural' : ''}`}
            />
          </button>

          <button
            onClick={handleOpenCreate}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-natural hover:bg-natural-hover text-white text-sm font-medium shadow-subtle transition-all duration-150 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Task</span>
          </button>
        </div>
      </div>

      {/* Backend Wake-up Notice */}
      {slowServerNotice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-warning/30 flex items-center gap-3 text-charcoal text-xs sm:text-sm animate-slide-in-up">
          <Loader2 className="w-5 h-5 text-warning animate-spin flex-shrink-0" />
          <div>
            <span className="font-semibold">Syncing with server: </span>
            <span>Free hosting cold-start in progress. Results will display shortly.</span>
          </div>
        </div>
      )}

      {/* Toolbar: Search, Filters & View Toggle */}
      <div className="bg-white rounded-xl border border-borderLight p-4 shadow-subtle space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Filter tasks by title or keyword..."
              className="w-full pl-9 pr-9 py-2 bg-ivory/60 focus:bg-white text-sm text-charcoal placeholder:text-muted/70 rounded-lg border border-borderLight focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  updateUrlParams('', statusFilter);
                }}
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="py-1.5 px-2.5 bg-ivory/70 rounded-lg border border-borderLight text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span>Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-ivory/70 rounded-lg border border-borderLight text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-1.5 px-2.5 bg-ivory/70 rounded-lg border border-borderLight text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>

            {/* View Toggle (Grid / Table) */}
            <div className="flex items-center border border-borderLight rounded-lg p-0.5 bg-ivory/50 ml-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white text-forest shadow-sm'
                    : 'text-muted hover:text-charcoal'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${
                  viewMode === 'table'
                    ? 'bg-white text-forest shadow-sm'
                    : 'text-muted hover:text-charcoal'
                }`}
                title="Table View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary Bar */}
        {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <div className="pt-2 border-t border-borderLight/60 flex items-center justify-between text-xs text-muted">
            <span>
              Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                updateUrlParams('', 'all');
              }}
              className="text-natural hover:text-forest underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Task Content: Grid or Table */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 bg-white rounded-xl border border-borderLight p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-beige/60 rounded-full" />
                  <div className="h-5 w-16 bg-beige/60 rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-beige/60 rounded" />
                <div className="h-4 w-1/2 bg-beige/40 rounded" />
              </div>
              <div className="h-4 w-28 bg-beige/40 rounded" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedTasks.length === 0 ? (
        <EmptyState
          title={tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
          description={
            tasks.length === 0
              ? 'Create your first task and start organizing your work.'
              : 'Try adjusting your search query or filter settings.'
          }
          actionLabel="Create Task"
          onAction={handleOpenCreate}
        />
      ) : viewMode === 'grid' ? (
        /* Grid / Card Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-white rounded-xl border border-borderLight shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory/80 border-b border-borderLight text-[11px] font-semibold text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight/60 text-sm">
                {filteredAndSortedTasks.map((task) => {
                  const id = task._id || task.id;
                  const isCompleted = task.status === 'done' || task.status === 'completed';
                  const isOverdue =
                    task.dueDate &&
                    !isCompleted &&
                    new Date(task.dueDate).setHours(23, 59, 59, 999) < new Date().getTime();

                  const formattedDueDate = task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr
                      key={id}
                      className={`hover:bg-ivory/50 transition-colors ${
                        isOverdue ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-charcoal">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted truncate max-w-xs mt-0.5">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span
                          className={
                            isOverdue ? 'text-danger font-semibold' : 'text-muted'
                          }
                        >
                          {formattedDueDate}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(task)}
                            className="px-2 py-1 text-xs font-medium text-forest hover:bg-beige/50 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(task)}
                            className="px-2 py-1 text-xs font-medium text-danger hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reusable Modal for Add / Edit Task */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/40 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-borderLight shadow-modal p-6 md:p-8 animate-fade-in-scale">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-borderLight">
              <div>
                <h3 className="text-xl font-bold text-charcoal">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <p className="text-xs text-muted mt-1">
                  {editingTask
                    ? 'Modify task parameters and save changes.'
                    : 'Fill out the details below to add a new task to your list.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-muted hover:text-charcoal rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TaskForm
              isModal={true}
              initialData={editingTask}
              onClose={() => setModalOpen(false)}
              onSuccess={handleModalSuccess}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || 'this task'}
        loading={deleting}
      />
    </div>
  );
};

export default Tasks;
