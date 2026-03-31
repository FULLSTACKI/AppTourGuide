import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const NAV_ITEMS = [
  { to: '/admin/places', label: 'Manage Places', icon: '📍' },
  { to: '/admin/dishes', label: 'Manage Dishes', icon: '🍽' },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col
                    transform transition-transform lg:translate-x-0 lg:static lg:z-auto
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <span className="text-2xl">🍜</span>
          <div>
            <h2 className="text-lg font-bold leading-tight">Vinh Khanh</h2>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-orange-500 text-white'
                   : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                 }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 mb-2 truncate">
            👤 {user?.displayName ?? 'Admin'}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                       text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile hamburger) */}
        <header className="flex items-center gap-4 px-4 py-3 bg-white shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 text-xl"
            aria-label="Open menu"
          >
            ☰
          </button>
          <h1 className="text-lg font-bold text-gray-800">🍜 Vinh Khanh Admin</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
