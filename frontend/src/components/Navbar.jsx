import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Navbar = ({ onOpenMobile = () => {}, onQuickSearch = null }) => {
  const { user, logout } = useAuth();
  const { showInfo } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard') {
      return { title: 'Dashboard', breadcrumb: 'TaskFlow / Dashboard' };
    }
    if (path === '/tasks') {
      return { title: 'My Tasks', breadcrumb: 'TaskFlow / Tasks' };
    }
    if (path === '/tasks/new') {
      return { title: 'Create Task', breadcrumb: 'TaskFlow / Tasks / New' };
    }
    if (path.startsWith('/tasks/') && path.endsWith('/edit')) {
      return { title: 'Edit Task', breadcrumb: 'TaskFlow / Tasks / Edit' };
    }
    return { title: 'TaskFlow', breadcrumb: 'TaskFlow' };
  };

  const { title, breadcrumb } = getPageInfo();

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    showInfo('Logged out successfully.');
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/tasks') {
      navigate(`/tasks?search=${encodeURIComponent(searchVal)}`);
    } else if (onQuickSearch) {
      onQuickSearch(searchVal);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-borderLight px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile menu toggle & Page title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          type="button"
          className="lg:hidden p-2 text-charcoal hover:bg-ivory rounded-lg transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="hidden sm:inline-block text-[11px] font-medium text-muted tracking-wide uppercase">
            {breadcrumb}
          </span>
          <h1 className="text-base sm:text-lg font-bold text-charcoal leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Search Field */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search tasks, descriptions..."
            className="w-full pl-9 pr-4 py-2 bg-ivory/80 focus:bg-white text-xs sm:text-sm text-charcoal placeholder:text-muted/70 rounded-lg border border-borderLight focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-all"
          />
        </form>
      </div>

      {/* Right: Quick Add Task, Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/tasks/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-natural hover:bg-natural-hover text-white text-xs font-semibold shadow-subtle transition-all duration-150 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            type="button"
            className="p-2 text-muted hover:text-charcoal hover:bg-ivory rounded-lg transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-natural ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-20 w-72 bg-white rounded-xl shadow-premium border border-borderLight p-4 animate-fade-in-scale">
                <div className="flex items-center justify-between pb-2 border-b border-borderLight">
                  <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                    Notifications
                  </span>
                  <span className="text-[11px] text-natural font-medium">1 new</span>
                </div>
                <div className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center text-forest flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-charcoal">
                      Welcome to TaskFlow!
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Ready to boost productivity with clean, focused task tracking.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            type="button"
            className="flex items-center gap-2 p-1.5 hover:bg-ivory rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold uppercase shadow-subtle">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-charcoal leading-tight">
                {user?.name || 'My Account'}
              </span>
              <span className="text-[10px] text-muted truncate max-w-[100px]">
                {user?.email || 'Active'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted hidden sm:block" />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-20 w-52 bg-white rounded-xl shadow-premium border border-borderLight py-1.5 animate-fade-in-scale">
                <div className="px-4 py-2 border-b border-borderLight">
                  <p className="text-xs font-bold text-charcoal truncate">
                    {user?.name || 'Logged In User'}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    {user?.email || ''}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/dashboard');
                    }}
                    type="button"
                    className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-ivory flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-muted" />
                    <span>Workspace Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/tasks');
                    }}
                    type="button"
                    className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-ivory flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-muted" />
                    <span>Manage Tasks</span>
                  </button>
                </div>

                <div className="border-t border-borderLight pt-1">
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="w-full text-left px-4 py-2 text-xs text-danger hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
