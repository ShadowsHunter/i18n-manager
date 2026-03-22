import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { projectApi } from '../services/api';
import { Project } from '../services/apiClient';
/**
 * Dashboard页面 - 项目列表
 */
function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'ARCHIVED'>('all');

  // 创建项目Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    languages: ['EN'],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // 加载项目列表
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await projectApi.getProjects({
        page: 1,
        limit: 100,
        status: filter === 'all' ? undefined : filter,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        const projectList =
          (response.data as any)?.projects || (response.data as any)?.data || response.data || [];
        setProjects(Array.isArray(projectList) ? projectList : []);
      } else {
        throw new Error(response.error?.message || 'Failed to load projects');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载项目失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }; // 闭合loadProjects函数
  // 创建项目
  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await projectApi.createProject(newProject);

      if (response.success && response.data) {
        // 创建成功，重新加载列表
        await loadProjects();
        // 关闭Modal
        setShowCreateModal(false);
        // 重置表单
        setNewProject({
          name: '',
          description: '',
          languages: ['EN'],
        });
      } else {
        throw new Error(response.error?.message || 'Failed to create project');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建项目失败';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // 删除项目
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await projectApi.deleteProject(projectId);

      if (response.success) {
        // 删除成功，重新加载列表
        await loadProjects();
      } else {
        throw new Error(response.error?.message || 'Failed to delete project');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除项目失败';
      alert(errorMessage);
    }
  };

  // 过滤项目
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || project.status === filter;
    return matchesSearch && matchesFilter;
  });

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 导航到项目详情
  const navigateToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">Projects</h1>
            <p className="text-text-secondary">Manage your multilingual text entries</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>+ New Project</Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert type="error" className="mb-6">
            {error}
            <Button size="sm" variant="secondary" onClick={loadProjects} className="ml-4">
              重试
            </Button>
          </Alert>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'ACTIVE' | 'ARCHIVED')}
            className="px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none transition-all"
          >
            <option value="all">All Projects</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : (
          /* Project Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} hoverable onClick={() => navigateToProject(project.id)}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-text">{project.name}</h3>
                  <Badge variant={project.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {project.status}
                  </Badge>
                </div>

                <p className="text-text-secondary mb-4 line-clamp-2 min-h-[40px]">
                  {project.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="info">🌐 {project.languages.length} languages</Badge>
                  <span className="text-sm text-text-secondary">
                    {project.languages.join(', ')}
                  </span>
                </div>

                <div className="text-sm text-text-secondary">
                  Updated {formatDate(project.updatedAt)}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProject(project.id);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}

            {/* Create New Project Card */}
            <Card hoverable onClick={() => setShowCreateModal(true)}>
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <Plus className="w-12 h-12 text-cta mb-4" />
                <h3 className="text-xl font-semibold text-text mb-2">Create New Project</h3>
                <p className="text-sm text-text-secondary">Click to add new project</p>
              </div>
            </Card>
          </div>
        )}

        {/* Create Project Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Project"
        >
          <form onSubmit={handleCreateProject} className="space-y-6">
            {createError && <Alert type="error">{createError}</Alert>}

            <div>
              <Input
                id="name"
                label="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="E-commerce App"
                required
                maxLength={100}
              />
            </div>

            <div>
              <Input
                id="description"
                label="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Main application translations"
                required
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {['CN', 'EN', 'DE', 'ES', 'FI', 'FR', 'IT', 'NL', 'NO', 'PL', 'SE', 'DA'].map(
                  (lang) => (
                    <label
                      key={lang}
                      className={`
                    inline-flex items-center px-4 py-2 rounded-lg cursor-pointer border-2 transition-all
                    ${
                      newProject.languages.includes(lang)
                        ? 'border-cta bg-cta/10 text-cta'
                        : 'border-secondary bg-background text-text hover:border-cta/50'
                    }
                  `}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={newProject.languages.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProject({
                              ...newProject,
                              languages: [...newProject.languages, lang],
                            });
                          } else {
                            setNewProject({
                              ...newProject,
                              languages: newProject.languages.filter((l) => l !== lang),
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isCreating || newProject.languages.length === 0}
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
