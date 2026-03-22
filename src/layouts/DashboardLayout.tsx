import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Key, Download, LogOut, Upload } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string; // 可选，用于向后兼容
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage }) => {
  const { logout } = useAuth();
  const location = useLocation();

  // 优先使用传入的 currentPage，否则根据路径判断
  const getIsActive = (path: string) => {
    if (currentPage) {
      // 使用传入的 currentPage
      if (path === '/dashboard' || path === '/') {
        return currentPage === 'Dashboard' || currentPage === 'dashboard';
      }
      if (path === '/upload') {
        return currentPage === 'Upload Excel' || currentPage === 'upload';
      }
      if (path === '/api-keys') {
        return currentPage === 'api-keys' || currentPage === 'API Keys';
      }
      if (path === '/export') {
        return currentPage === 'export' || currentPage === 'Export';
      }
      return false;
    }

    // 根据 location.pathname 判断
    if (path === '/dashboard' || path === '/') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-text flex">
      {/* Skip Navigation Link */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside className="w-[280px] bg-background border-r border-secondary fixed left-0 top-0 bottom-0 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-secondary">
          <h1 className="text-xl font-bold">MultiLanguageManager</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${getIsActive('/dashboard') ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/upload"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${getIsActive('/upload') ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Upload Excel</span>
          </Link>

          <Link
            to="/api-keys"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${getIsActive('/api-keys') ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <Key className="w-5 h-5" />
            <span className="font-medium">API Keys</span>
          </Link>

          <Link
            to="/export"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${getIsActive('/export') ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-secondary">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 ml-[280px]">
        {children}
      </main>
    </div>
  );
};
