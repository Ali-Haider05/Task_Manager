import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Sidebar = ({
  collapsed = false,
  onToggleCollapse = () => {},
  mobileOpen = false,
  onCloseMobile = () => {},
}) => {
  const { logout, user } = useAuth();
  const { showInfo } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showInfo('You have been logged out.');
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/tasks',
      label: 'My Tasks',
      icon: CheckSquare,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-forest text-white transition-all duration-300 ease-in-out border-r border-forest-dark
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-forest-light/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-sage flex items-center justify-center text-forest flex-shrink-0 shadow-sm font-bold">
              <Sparkles className="w-5 h-5 text-forest" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-tight text-white leading-tight truncate">
                  TaskFlow
                </span>
                <span className="text-[10px] text-sage tracking-wider uppercase truncate">
                  Organize. Focus. Achieve.
                </span>
              </div>
            )}
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            type="button"
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-md"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-sage/80 uppercase">
              Main Menu
            </div>
          )}

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-sage text-forest font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-forest-light hover:text-white'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-forest' : 'text-sage group-hover:text-white'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex px-3 py-2 border-t border-forest-light/30 justify-end">
          <button
            onClick={onToggleCollapse}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-sage hover:text-white hover:bg-forest-light/50 rounded-lg transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User Card & Logout Section */}
        <div className="p-3 border-t border-forest-light/30 bg-forest-dark/40">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-forest-light/30">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-forest text-xs font-bold uppercase flex-shrink-0">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[11px] text-sage/80 truncate">
                    {user?.email || ''}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                type="button"
                className="p-1.5 text-sage hover:text-red-300 hover:bg-forest-dark rounded-md transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <div
                className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-forest text-xs font-bold uppercase"
                title={user?.name || 'User'}
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <button
                onClick={handleLogout}
                type="button"
                className="p-2 text-sage hover:text-red-300 hover:bg-forest-dark rounded-md transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
