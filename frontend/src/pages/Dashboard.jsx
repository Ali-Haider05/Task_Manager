import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  ListTodo,
  Clock,
  CheckCircle2,
  Layers,
  Calendar,
  AlertCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slowServerNotice, setSlowServerNotice] = useState(false);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  useEffect(() => {
    let isMounted = true;
    const slowTimer = setTimeout(() => {
      if (isMounted) setSlowServerNotice(true);
    }, 4500);

    const loadDashboardData = async () => {
      try {
        // Fetch stats summary and tasks in parallel
        const [statsRes, tasksRes] = await Promise.allSettled([
          api.get('/tasks/stats/summary'),
          api.get('/tasks'),
        ]);

        if (!isMounted) return;

        // Process summary stats
        if (statsRes.status === 'fulfilled') {
          const raw = statsRes.value.data?.stats || statsRes.value.data?.data || statsRes.value.data || {};
          setStats({
            total: Number(raw.total) || 0,
            todo: Number(raw.todo) || 0,
            inProgress: Number(raw.inProgress || raw.in_progress || raw['in-progress']) || 0,
            done: Number(raw.done || raw.completed) || 0,
          });
        }

        // Process tasks list
        if (tasksRes.status === 'fulfilled') {
          const rawTasks =
            tasksRes.value.data?.tasks ||
            tasksRes.value.data?.data ||
            (Array.isArray(tasksRes.value.data) ? tasksRes.value.data : []);
          
          // Sort newest first if createdAt exists, take 5
          const sorted = [...rawTasks].sort((a, b) => {
            const dateA = new Date(a.createdAt || a._id || 0);
            const dateB = new Date(b.createdAt || b._id || 0);
            return dateB - dateA;
          });
          setRecentTasks(sorted.slice(0, 5));
        }

        if (statsRes.status === 'rejected' && tasksRes.status === 'rejected') {
          showError('Unable to load dashboard data. The server might be waking up.');
        }
      } catch (err) {
        if (isMounted) {
          showError('An error occurred while loading dashboard data.');
        }
      } finally {
        if (isMounted) {
          clearTimeout(slowTimer);
          setLoading(false);
          setSlowServerNotice(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
      clearTimeout(slowTimer);
    };
  }, [showError]);

  // Chart data setup
  const chartData = [
    { name: 'To Do', value: stats.todo, color: '#77786F' },
    { name: 'In Progress', value: stats.inProgress, color: '#6487A5' },
    { name: 'Completed', value: stats.done, color: '#588157' },
  ].filter((item) => item.value > 0);

  const hasChartData = chartData.length > 0;

  const completionPercentage =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header Greeting & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-borderLight/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted tracking-wider uppercase mb-1">
            <Calendar className="w-3.5 h-3.5 text-natural" />
            <span>{currentDateString}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'there'}
          </h1>
          <p className="text-sm text-muted mt-1">
            Here's what's happening with your tasks today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-borderLight bg-white hover:bg-beige/40 text-charcoal text-sm font-medium transition-colors"
          >
            <span>View All Tasks</span>
          </Link>
          <Link
            to="/tasks/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-natural hover:bg-natural-hover text-white text-sm font-medium shadow-subtle transition-all duration-150 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Task</span>
          </Link>
        </div>
      </div>

      {/* Backend Wake-up Notice */}
      {slowServerNotice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-warning/30 flex items-center gap-3 text-charcoal text-xs sm:text-sm animate-slide-in-up">
          <Loader2 className="w-5 h-5 text-warning animate-spin flex-shrink-0" />
          <div>
            <span className="font-semibold">Backend server warming up: </span>
            <span>Free hosting sleep cycles can take up to a minute to respond. Your data is being fetched...</span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Tasks */}
        <div className="bg-white rounded-xl border border-borderLight p-5 shadow-subtle hover:shadow-premium transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-beige/60 flex items-center justify-center text-charcoal">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-beige/60 rounded animate-pulse my-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-charcoal">
              {stats.total}
            </div>
          )}
          <div className="mt-2 text-xs text-muted">
            All registered tasks in workspace
          </div>
        </div>

        {/* Card 2: To Do */}
        <div className="bg-white rounded-xl border border-borderLight p-5 shadow-subtle hover:shadow-premium transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              To Do
            </span>
            <div className="w-9 h-9 rounded-lg bg-beige/60 flex items-center justify-center text-muted">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-beige/60 rounded animate-pulse my-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-charcoal">
              {stats.todo}
            </div>
          )}
          <div className="mt-2 text-xs text-muted">
            Awaiting commencement
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-white rounded-xl border border-borderLight p-5 shadow-subtle hover:shadow-premium transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-info">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-beige/60 rounded animate-pulse my-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-charcoal">
              {stats.inProgress}
            </div>
          )}
          <div className="mt-2 text-xs text-muted">
            Currently active
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-white rounded-xl border border-borderLight p-5 shadow-subtle hover:shadow-premium transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Completed
            </span>
            <div className="w-9 h-9 rounded-lg bg-natural-light flex items-center justify-center text-natural">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-beige/60 rounded animate-pulse my-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-natural">
              {stats.done}
            </div>
          )}
          <div className="mt-2 text-xs text-muted">
            {stats.total > 0 ? `${completionPercentage}% overall completion` : 'No tasks finished yet'}
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Analytics + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-borderLight p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-charcoal">Recent Tasks</h2>
              <p className="text-xs text-muted mt-0.5">
                The latest items added or scheduled in your workspace
              </p>
            </div>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-natural hover:text-forest transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 bg-ivory/60 rounded-lg animate-pulse border border-borderLight/40"
                />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create your first task to see your active pipeline right here on your dashboard."
              onAction={() => navigate('/tasks/new')}
              actionLabel="Create First Task"
            />
          ) : (
            <div className="divide-y divide-borderLight/60">
              {recentTasks.map((task) => {
                const id = task._id || task.id;
                const formattedDate = task.dueDate
                  ? new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                    }).format(new Date(task.dueDate))
                  : null;

                const isOverdue =
                  task.dueDate &&
                  task.status !== 'done' &&
                  task.status !== 'completed' &&
                  new Date(task.dueDate).setHours(23, 59, 59, 999) < new Date().getTime();

                return (
                  <div
                    key={id}
                    onClick={() => navigate(`/tasks/${id}/edit`)}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-ivory/50 px-2 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-charcoal group-hover:text-forest truncate">
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-xs text-muted truncate max-w-md">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                      {formattedDate && (
                        <span
                          className={`text-xs ${
                            isOverdue ? 'text-danger font-medium' : 'text-muted'
                          } hidden sm:inline-block`}
                        >
                          {formattedDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Analytics / Status Distribution */}
        <div className="bg-white rounded-xl border border-borderLight p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Status Distribution</h2>
            <p className="text-xs text-muted mt-0.5">
              Live breakdown of active vs finished work
            </p>
          </div>

          <div className="my-6 flex flex-col items-center justify-center min-h-[220px]">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-natural" />
            ) : hasChartData ? (
              <div className="w-full h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} tasks`, name]}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E2D8',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(41, 43, 37, 0.08)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-charcoal leading-none">
                    {completionPercentage}%
                  </span>
                  <span className="text-[10px] text-muted tracking-wider uppercase mt-0.5">
                    Completed
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-beige/50 flex items-center justify-center text-muted mx-auto mb-2">
                  <Layers className="w-6 h-6" />
                </div>
                <p className="text-xs text-muted">
                  No task data to display in chart
                </p>
              </div>
            )}
          </div>

          {/* Compact Legend */}
          <div className="pt-4 border-t border-borderLight/60 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-ivory">
              <span className="block text-xs font-bold text-charcoal">{stats.todo}</span>
              <span className="text-[11px] text-muted">To Do</span>
            </div>
            <div className="p-2 rounded-lg bg-ivory">
              <span className="block text-xs font-bold text-info">{stats.inProgress}</span>
              <span className="text-[11px] text-muted">In Progress</span>
            </div>
            <div className="p-2 rounded-lg bg-ivory">
              <span className="block text-xs font-bold text-natural">{stats.done}</span>
              <span className="text-[11px] text-muted">Done</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
