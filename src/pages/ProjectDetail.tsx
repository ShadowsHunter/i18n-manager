import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { projectApi, entryApi } from '../services/api';
import { Project, Entry } from '../services/apiClient';

/**
 * ProjectDetail页面 - 项目详情和条目管理
 */
function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'NEW' | 'MODIFIED' | 'TRANSLATED' | 'REVIEWED'>(
    'all'
  );
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  // 创建条目Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    key: '',
    en: '',
    de: '',
    fr: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // 加载项目和条目
  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 并行加载项目和条目
      const [projectResponse, entriesResponse] = await Promise.all([
        projectApi.getProject(projectId),
        entryApi.getEntries(projectId, { page: 1, limit: 100 }),
      ]);

      if (projectResponse.success && projectResponse.data) {
        setProject(projectResponse.data);
      } else {
        throw new Error(projectResponse.error?.message || 'Failed to load project');
      }

      if (entriesResponse.success && entriesResponse.data) {
        // 适应test-server.js的响应格式（response.data.entries）
        // 也兼容标准格式（response.data.data）
        const entryList = entriesResponse.data.entries || entriesResponse.data.data || [];
        setEntries(entryList);
      } else {
        throw new Error(entriesResponse.error?.message || 'Failed to load entries');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载数据失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };  // 闭合loadData函数
  // 创建条目
  const handleCreateEntry = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) return;

    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await entryApi.createEntry(projectId, newEntry);

      if (response.success && response.data) {
        // 创建成功，重新加载列表
        await loadData();
        // 关闭Modal
        setShowCreateModal(false);
        // 重置表单
        setNewEntry({
          key: '',
          en: '',
          de: '',
          fr: '',
        });
      } else {
        throw new Error(response.error?.message || 'Failed to create entry');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建条目失败';
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // 删除条目
  const handleDeleteEntry = async (entryId: string) => {
    if (!projectId) return;

    if (!confirm('确定要删除这个条目吗？')) {
      return;
    }

    try {
      const response = await entryApi.deleteEntry(projectId, entryId);

      if (response.success) {
        // 删除成功，重新加载列表
        await loadData();
      } else {
        throw new Error(response.error?.message || 'Failed to delete entry');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除条目失败';
      alert(errorMessage);
    }
  };

  // 过滤条目
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.de?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.fr?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || entry.status === filter;
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

  if (isLoading) {
    return (
      <DashboardLayout currentPage="projects">
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout currentPage="projects">
        <Alert variant="error">项目未找到</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="projects">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-text-secondary mb-4">
          <a href="/dashboard" className="hover:text-cta transition-colors">
            Projects
          </a>
          {' > '}
          <span className="text-text">{project.name}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text mb-2">{project.name}</h1>
            <p className="text-text-secondary">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={project.status === 'ACTIVE' ? 'success' : 'warning'}>
              {project.status}
            </Badge>
            <Badge variant="info">🌐 {project.languages.join(', ')}</Badge>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
          <Button size="sm" variant="secondary" onClick={loadData} className="ml-4">
            重试
          </Button>
        </Alert>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none transition-all"
        >
          <option value="all">All Status</option>
          <option value="NEW">New</option>
          <option value="MODIFIED">Modified</option>
          <option value="TRANSLATED">Translated</option>
          <option value="REVIEWED">Reviewed</option>
        </select>
        <Button onClick={() => setShowCreateModal(true)}>+ Add Entry</Button>
      </div>

      {/* Entries Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-secondary">
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Key</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">EN</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">DE</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">FR</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  Updated
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-secondary/50 hover:bg-background/50 transition-colors"
                >
                  <td className="px-4 py-3 text-text font-medium">{entry.key}</td>
                  <td className="px-4 py-3 text-text-secondary">{entry.en || '-'}</td>
                  <td className="px-4 py-3 text-text-secondary">{entry.de || '-'}</td>
                  <td className="px-4 py-3 text-text-secondary">{entry.fr || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        entry.status === 'NEW'
                          ? 'success'
                          : entry.status === 'MODIFIED'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(entry.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => {
                          // TODO: 实现编辑功能
                          console.log('Edit entry:', entry.id);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                    No entries found. Add your first entry to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {entries.length > 0 && (
          <div className="px-4 py-3 text-sm text-text-secondary">
            Showing {filteredEntries.length} of {entries.length} entries
          </div>
        )}
      </Card>

      {/* Create Entry Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Entry"
      >
        <form onSubmit={handleCreateEntry} className="space-y-6">
          {createError && <Alert variant="error">{createError}</Alert>}

          <div>
            <Input
              id="key"
              label="Key"
              value={newEntry.key}
              onChange={(e) => setNewEntry({ ...newEntry, key: e.target.value })}
              placeholder="welcome_message"
              required
            />
            <p className="text-xs text-text-secondary mt-1">
              Unique identifier for this text entry
            </p>
          </div>

          <div>
            <Input
              id="en"
              label="English (EN)"
              value={newEntry.en}
              onChange={(e) => setNewEntry({ ...newEntry, en: e.target.value })}
              placeholder="Welcome"
              required
            />
          </div>

          <div>
            <Input
              id="de"
              label="German (DE)"
              value={newEntry.de}
              onChange={(e) => setNewEntry({ ...newEntry, de: e.target.value })}
              placeholder="Willkommen"
            />
          </div>

          <div>
            <Input
              id="fr"
              label="French (FR)"
              value={newEntry.fr}
              onChange={(e) => setNewEntry({ ...newEntry, fr: e.target.value })}
              placeholder="Bienvenue"
            />
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
              disabled={isCreating || !newEntry.key || !newEntry.en}
            >
              {isCreating ? 'Creating...' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default ProjectDetail;
