import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FolderKanban, Key, Download, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPage = 'Dashboard',
}) => {
  const { logout } = useAuth();

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
          <a
            href="/dashboard"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${currentPage === 'dashboard' ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>

          <a
            href="/projects"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${currentPage === 'projects' ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <FolderKanban className="w-5 h-5" />
            <span className="font-medium">Projects</span>
          </a>

          <a
            href="/api-keys"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${currentPage === 'api-keys' ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <Key className="w-5 h-5" />
            <span className="font-medium">API Keys</span>
          </a>

          <a
            href="/export"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${currentPage === 'export' ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </a>
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
