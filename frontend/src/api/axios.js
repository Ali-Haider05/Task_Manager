import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds for cold-start cloud backends
});

// Demo initial tasks storage helper
const getStoredDemoTasks = () => {
  const existing = localStorage.getItem('demo_tasks');
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // fallback
    }
  }
  const defaultTasks = [
    {
      _id: 'task-1',
      title: 'Design high-converting landing page',
      description: 'Review UI typography, warm ivory palette, and Linear-style borders for NEXUS presentation.',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      _id: 'task-2',
      title: 'Integrate authentication endpoints with backend',
      description: 'Verify JWT Bearer tokens and handle 401 automatic redirection.',
      status: 'done',
      priority: 'high',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      _id: 'task-3',
      title: 'Prepare NEXUS 26 pitch deck',
      description: 'Outline market differentiation, technology stack, and user productivity metrics.',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      _id: 'task-4',
      title: 'Conduct cross-browser responsive testing',
      description: 'Verify sidebar navigation drawer on iOS Safari and mobile Chrome.',
      status: 'done',
      priority: 'low',
      dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ];
  localStorage.setItem('demo_tasks', JSON.stringify(defaultTasks));
  return defaultTasks;
};

// Request interceptor: attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If using the local demo mode token, intercept client-side
    if (token === 'demo-token-nexus26') {
      config.isDemo = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle demo mode mock responses or 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config } = error;

    // Handle mock demo mode requests client-side when in demo mode
    if (config && config.isDemo) {
      const url = config.url || '';
      const method = (config.method || 'get').toLowerCase();

      // /auth/me
      if (url.includes('/auth/me')) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return { data: { user } };
      }

      // /tasks/stats/summary
      if (url.includes('/tasks/stats/summary')) {
        const tasks = getStoredDemoTasks();
        const stats = {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === 'todo').length,
          inProgress: tasks.filter(
            (t) => t.status === 'in-progress' || t.status === 'inprogress'
          ).length,
          done: tasks.filter((t) => t.status === 'done' || t.status === 'completed').length,
        };
        return { data: { stats, ...stats } };
      }

      // GET /tasks
      if (url.endsWith('/tasks') && method === 'get') {
        const tasks = getStoredDemoTasks();
        return { data: { tasks } };
      }

      // GET /tasks/:id
      if (url.includes('/tasks/') && method === 'get') {
        const id = url.split('/tasks/')[1].split('?')[0];
        const tasks = getStoredDemoTasks();
        const task = tasks.find((t) => t._id === id || t.id === id);
        return { data: { task: task || tasks[0] } };
      }

      // POST /tasks
      if (url.endsWith('/tasks') && method === 'post') {
        const tasks = getStoredDemoTasks();
        const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        const newTask = {
          _id: 'demo-' + Date.now(),
          ...body,
          createdAt: new Date().toISOString(),
        };
        tasks.unshift(newTask);
        localStorage.setItem('demo_tasks', JSON.stringify(tasks));
        return { data: { task: newTask, message: 'Task created successfully' } };
      }

      // PUT /tasks/:id
      if (url.includes('/tasks/') && method === 'put') {
        const id = url.split('/tasks/')[1].split('?')[0];
        const tasks = getStoredDemoTasks();
        const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        const updated = tasks.map((t) =>
          t._id === id || t.id === id ? { ...t, ...body } : t
        );
        localStorage.setItem('demo_tasks', JSON.stringify(updated));
        return { data: { message: 'Task updated successfully' } };
      }

      // DELETE /tasks/:id
      if (url.includes('/tasks/') && method === 'delete') {
        const id = url.split('/tasks/')[1].split('?')[0];
        const tasks = getStoredDemoTasks();
        const filtered = tasks.filter((t) => t._id !== id && t.id !== id);
        localStorage.setItem('demo_tasks', JSON.stringify(filtered));
        return { data: { message: 'Task deleted successfully' } };
      }
    }

    // Avoid redirect loop on login or register endpoints
    const isAuthRoute =
      error.config &&
      (error.config.url?.includes('/auth/login') ||
        error.config.url?.includes('/auth/register'));

    if (error.response && error.response.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
