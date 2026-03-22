import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import UploadExcel from './pages/UploadExcel';
import ExportDownload from './pages/ExportDownload';
import Settings from './pages/Settings';
import ApiKeys from './pages/ApiKeys';
import Login from './pages/Login';

/**
 * 私有路由组件 - 需要认证才能访问
 */
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * App组件
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 登录页面 - 公开路由 */}
          <Route path="/login" element={<Login />} />

          {/* 私有路由 - 需要认证 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <PrivateRoute>
                <ProjectDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId/upload"
            element={
              <PrivateRoute>
                <UploadExcel />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:projectId/exports"
            element={
              <PrivateRoute>
                <ExportDownload />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <UploadExcel />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/api-keys"
            element={
              <PrivateRoute>
                <ApiKeys />
              </PrivateRoute>
            }
          />
          <Route
            path="/export"
            element={
              <PrivateRoute>
                <ExportDownload />
              </PrivateRoute>
            }
          />

          {/* 404 - 重定向到dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
