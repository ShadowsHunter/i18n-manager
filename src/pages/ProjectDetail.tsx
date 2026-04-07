import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { useToast } from '../components/Toast';
import { projectApi, entryApi } from '../services/api';
import { Project, Entry } from '../services/apiClient';

/**
 * ProjectDetail页面 - 项目详情和条目管理
 */
function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const toast = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'NEW' | 'MODIFIED' | 'TRANSLATED' | 'REVIEWED'>(
    'all'
  );

  // 语言过滤
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);

  // 排序状态
  const [sortField, setSortField] = useState<'key' | 'createdAt' | 'updatedAt' | 'status'>(
    'updatedAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  // 删除确认 Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 导出功能
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // 创建条目Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    key: '',
    cn: '',
    en: '',
    de: '',
    es: '',
    fi: '',
    fr: '',
    it: '',
    nl: '',
    no: '',
    pl: '',
    se: '',
    da: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  // 编辑条目Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{
    key: string;
    cn: string;
    en: string;
    de: string;
    es: string;
    fi: string;
    fr: string;
    it: string;
    nl: string;
    no: string;
    pl: string;
    se: string;
    da: string;
    status: Entry['status'];
  }>({
    key: '',
    cn: '',
    en: '',
    de: '',
    es: '',
    fi: '',
    fr: '',
    it: '',
    nl: '',
    no: '',
    pl: '',
    se: '',
    da: '',
    status: 'NEW',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // 加载项目和条目
  useEffect(() => {
    if (projectId) {
      loadData(currentPage, pageSize);
    }
  }, [projectId]);

  // 当提交的搜索词或状态过滤改变时，重新从第一页加载（触发后端搜索）
  useEffect(() => {
    if (!projectId) return;
    setCurrentPage(1);
    loadData(1, pageSize);
  }, [appliedSearchTerm, filter]);

  const loadData = async (page: number = 1, size: number = pageSize) => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 并行加载项目和条目（把 searchTerm 和 filter 传给后端做全项目搜索）
      const [projectResponse, entriesResponse] = await Promise.all([
        projectApi.getProject(projectId),
        entryApi.getEntries(projectId, {
          page,
          limit: size,
          ...(appliedSearchTerm ? { search: appliedSearchTerm } : {}),
          ...(filter !== 'all' ? { filter } : {}),
        }),
      ]);

      if (projectResponse.success && projectResponse.data) {
        setProject(projectResponse.data);
      } else {
        throw new Error(projectResponse.error?.message || 'Failed to load project');
      }

      if (entriesResponse.success && entriesResponse.data) {
        // 获取条目列表和分页信息
        const entryList = entriesResponse.data.entries || [];

        // 更新分页信息
        setPaginationInfo({
          page: entriesResponse.data.pagination.page,
          limit: entriesResponse.data.pagination.limit,
          total: entriesResponse.data.pagination.total,
          totalPages: entriesResponse.data.pagination.totalPages,
        });
        setTotalCount(entriesResponse.data.pagination.total || 0);

        // 调试日志：检查数据结构
        console.log('Entries loaded:', entryList.length);
        if (entryList.length > 0) {
          console.log('First entry:', entryList[0]);
          console.log('Entry fields:', Object.keys(entryList[0]));
          console.log('Has key field:', 'key' in entryList[0]);
        }

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
  };

  // 分页控制
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadData(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
    loadData(1, newSize);
  }; // 闭合loadData函数
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
          cn: '',
          en: '',
          de: '',
          es: '',
          fi: '',
          fr: '',
          it: '',
          nl: '',
          no: '',
          pl: '',
          se: '',
          da: '',
        });
        // 显示成功提示
        toast.showToast({
          type: 'success',
          message: '条目创建成功！',
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

  // 打开编辑 Modal
  const handleOpenEditModal = (entry: Entry) => {
    setEditingEntryId(entry.id);
    setEditingEntry({
      key: entry.key || '', // 使用 key 而不是 uuid
      cn: entry.cn || '',
      en: entry.en || '',
      de: entry.de || '',
      es: entry.es || '',
      fi: entry.fi || '',
      fr: entry.fr || '',
      it: entry.it || '',
      nl: entry.nl || '',
      no: entry.no || '',
      pl: entry.pl || '',
      se: entry.se || '',
      da: entry.da || '',
      status: entry.status || 'NEW',
    });
    setShowEditModal(true);
    setEditError(null);
  };

  // 处理编辑条目
  const handleUpdateEntry = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId || !editingEntryId) return;

    setEditError(null);
    setIsEditing(true);

    try {
      const response = await entryApi.updateEntry(projectId, editingEntryId, editingEntry);

      if (response.success && response.data) {
        // 更新成功，重新加载列表
        await loadData();
        // 关闭Modal
        setShowEditModal(false);
        setEditingEntryId(null);
        // 重置编辑状态
        setEditingEntry({
          key: '',
          cn: '',
          en: '',
          de: '',
          fr: '',
          es: '',
          fi: '',
          it: '',
          nl: '',
          no: '',
          pl: '',
          se: '',
          da: '',
          status: 'NEW',
        });
        // 显示成功提示
        toast.showToast({
          type: 'success',
          message: '条目更新成功！',
        });
      } else {
        throw new Error(response.error?.message || 'Failed to update entry');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新条目失败';
      setEditError(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  // 打开删除确认 Modal (单个删除)
  const handleOpenDeleteModal = (entryId: string) => {
    setDeleteTargetId(entryId);
    setDeleteTarget(entries.find((e) => e.id === entryId) || null);
    setShowDeleteModal(true);
  };

  // 打开删除确认 Modal (批量删除)
  const handleOpenBulkDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteTargetId(null);
    setShowDeleteModal(true);
  };

  // 执行删除（支持单个和批量）
  const handleConfirmDelete = async () => {
    if (!projectId) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // 单个删除
      if (deleteTargetId) {
        const response = await entryApi.deleteEntry(projectId, deleteTargetId);
        if (response.success) {
          await loadData();
          setShowDeleteModal(false);
          setDeleteTarget(null);
          setDeleteTargetId(null);
          toast.showToast({
            type: 'success',
            message: 'Entry deleted successfully',
          });
        } else {
          throw new Error(response.error?.message || 'Failed to delete entry');
        }
      }
      // 批量删除
      else {
        const ids = Array.from(selectedEntries);
        if (ids.length === 0) {
          setShowDeleteModal(false);
          setIsDeleting(false);
          return;
        }

        const response = await entryApi.bulkDeleteEntries(projectId, { ids });
        if (response.success && response.data) {
          await loadData();
          setShowDeleteModal(false);
          setSelectedEntries(new Set());
          toast.showToast({
            type: 'success',
            message: `Successfully deleted ${ids.length} entries`,
          });
        } else {
          throw new Error(response.error?.message || 'Failed to delete entries');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // 打开导出 Modal
  const handleOpenExportModal = () => {
    setShowExportModal(true);
    setExportError(null);
  };

  // 关闭导出 Modal
  const handleCloseExportModal = () => {
    setShowExportModal(false);
    setExportFormat('json');
    setExportError(null);
  };

  // 导出条目 - 获取全部条目后导出，每语言导出一个独立文件并打包为ZIP
  const handleExport = async () => {
    if (!projectId) return;

    setIsExporting(true);
    setExportError(null);
    try {
      // 获取全部条目（不分页），使用getAllEntries绕过Supabase 1000行限制
      const allEntriesResponse = await entryApi.getAllEntries(projectId);
      if (!allEntriesResponse.success || !allEntriesResponse.data) {
        throw new Error(allEntriesResponse.error?.message || 'Failed to fetch all entries');
      }
      const allEntries = allEntriesResponse.data.entries || [];
      if (allEntries.length === 0) {
        setExportError('No entries to export');
        setIsExporting(false);
        return;
      }

      // 定义支持的语言列表
      const languages = ['cn', 'en', 'de', 'es', 'fi', 'fr', 'it', 'nl', 'no', 'pl', 'se', 'da'];
      const zip = new JSZip();
      const folder = zip.folder('translations');
      if (!folder) {
        throw new Error('Failed to create folder in ZIP');
      }
      // 为每个语言创建一个独立的JSON文件
      languages.forEach((lang) => {
        const langData: Record<string, string> = {};
        allEntries.forEach((entry) => {
          const value = entry[lang as keyof Entry];
          langData[entry.key] = typeof value === 'string' ? value : '';
        });
        // Always add the file for every language, empty strings for missing values
        folder.file(`${lang}.json`, JSON.stringify(langData, null, 2));
      });
      // 生成ZIP文件
      const content = await zip.generateAsync({ type: 'blob' });
      // 创建下载链接
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // 关闭 Modal
      setShowExportModal(false);
      // 显示成功提示
      toast.showToast({
        type: 'success',
        message: `Successfully exported ${allEntries.length} entries (${languages.length} languages)`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导出失败';
      setExportError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  // 过滤和排序条目（搜索和状态过滤已由后端处理，这里只做语言过滤和排序）
  const filteredEntries = entries
    .filter((entry) => {
      // 语言过滤 - 至少一个选中的语言有内容
      const matchesLanguage =
        languageFilter.length === 0 ||
        languageFilter.some((lang) => {
          const langValue = entry[lang as keyof Entry];
          return langValue && langValue.trim().length > 0;
        });

      return matchesLanguage;
    })
    .sort((a, b) => {
      // 排序逻辑
      let comparison = 0;

      switch (sortField) {
        case 'key':
          comparison = a.key.localeCompare(b.key);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'status':
          const statusOrder = { NEW: 0, MODIFIED: 1, TRANSLATED: 2, REVIEWED: 3 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
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
        <Alert type="error">项目未找到</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="projects">
      <div className="max-w-6xl mx-auto py-8">
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
          <Alert type="error" className="mb-6">
            {error}
            <Button size="sm" variant="secondary" onClick={() => loadData()} className="ml-4">
              重试
            </Button>
          </Alert>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search entries... (press Enter to search)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAppliedSearchTerm(searchTerm);
                }
              }}
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
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm text-text-secondary">Filter by language:</span>
            {['cn', 'en', 'de', 'es', 'fi', 'fr', 'it', 'nl', 'no', 'pl', 'se', 'da'].map(
              (lang) => (
                <label key={lang} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={languageFilter.includes(lang)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLanguageFilter([...languageFilter, lang]);
                      } else {
                        setLanguageFilter(languageFilter.filter((l) => l !== lang));
                      }
                    }}
                    className="w-4 h-4 accent-cta"
                  />
                  <span className="text-sm text-text">{lang.toUpperCase()}</span>
                </label>
              )
            )}
          </div>

          {/* 导出、上传和批量删除按钮 */}
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
              + Add Entry
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/projects/${projectId}/upload`)}
            >
              Upload Excel
            </Button>
            <Button variant="secondary" size="sm" onClick={handleOpenExportModal}>
              Export
            </Button>
            {selectedEntries.size > 0 && (
              <Button variant="danger" size="sm" onClick={handleOpenBulkDeleteModal}>
                Delete ({selectedEntries.size})
              </Button>
            )}
          </div>
        </div>

        {/* Entries Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-secondary">
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                    Key
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                    EN
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                    DE
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                    FR
                  </th>
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
                    <td className="px-4 py-3 text-text font-medium text-sm">{entry.key}</td>
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
                            handleOpenEditModal(entry);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenDeleteModal(entry.id)}
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

          {/* 分页控件 */}
          {entries.length > 0 && (
            <div className="flex items-center justify-between px-4 py-6 bg-background border-t border-secondary">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">
                  Showing {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                </span>
                <span className="text-sm text-text-secondary">
                  (Page {currentPage} of {paginationInfo.totalPages})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-2 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= paginationInfo.totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

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
            {createError && <Alert type="error">{createError}</Alert>}

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
                id="create-cn"
                label="Chinese (CN)"
                value={newEntry.cn}
                onChange={(e) => setNewEntry({ ...newEntry, cn: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-en"
                label="English (EN)"
                value={newEntry.en}
                onChange={(e) => setNewEntry({ ...newEntry, en: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-de"
                label="German (DE)"
                value={newEntry.de}
                onChange={(e) => setNewEntry({ ...newEntry, de: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-da"
                label="Danish (DA)"
                value={newEntry.da}
                onChange={(e) => setNewEntry({ ...newEntry, da: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-es"
                label="Spanish (ES)"
                value={newEntry.es}
                onChange={(e) => setNewEntry({ ...newEntry, es: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-fi"
                label="Finnish (FI)"
                value={newEntry.fi}
                onChange={(e) => setNewEntry({ ...newEntry, fi: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-fr"
                label="French (FR)"
                value={newEntry.fr}
                onChange={(e) => setNewEntry({ ...newEntry, fr: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-it"
                label="Italian (IT)"
                value={newEntry.it}
                onChange={(e) => setNewEntry({ ...newEntry, it: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-nl"
                label="Dutch (NL)"
                value={newEntry.nl}
                onChange={(e) => setNewEntry({ ...newEntry, nl: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-no"
                label="Norwegian (NO)"
                value={newEntry.no}
                onChange={(e) => setNewEntry({ ...newEntry, no: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-pl"
                label="Polish (PL)"
                value={newEntry.pl}
                onChange={(e) => setNewEntry({ ...newEntry, pl: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="create-se"
                label="Swedish (SE)"
                value={newEntry.se}
                onChange={(e) => setNewEntry({ ...newEntry, se: e.target.value })}
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
              <Button type="submit" variant="primary" disabled={isCreating || !newEntry.key.trim()}>
                {isCreating ? 'Creating...' : 'Create Entry'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Entry Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEntryId(null);
          }}
          title="Edit Entry"
        >
          <form onSubmit={handleUpdateEntry} className="space-y-6">
            {editError && <Alert type="error">{editError}</Alert>}

            <div>
              <Input
                id="edit-key"
                label="Key (read-only)"
                value={editingEntry.key}
                readOnly
                required
              />
            </div>

            <div>
              <Input
                id="edit-cn"
                label="Chinese (CN)"
                value={editingEntry.cn}
                onChange={(e) => setEditingEntry({ ...editingEntry, cn: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-en"
                label="English (EN)"
                value={editingEntry.en}
                onChange={(e) => setEditingEntry({ ...editingEntry, en: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-de"
                label="German (DE)"
                value={editingEntry.de}
                onChange={(e) => setEditingEntry({ ...editingEntry, de: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-da"
                label="Danish (DA)"
                value={editingEntry.da}
                onChange={(e) => setEditingEntry({ ...editingEntry, da: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-es"
                label="Spanish (ES)"
                value={editingEntry.es}
                onChange={(e) => setEditingEntry({ ...editingEntry, es: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-fi"
                label="Finnish (FI)"
                value={editingEntry.fi}
                onChange={(e) => setEditingEntry({ ...editingEntry, fi: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-fr"
                label="French (FR)"
                value={editingEntry.fr}
                onChange={(e) => setEditingEntry({ ...editingEntry, fr: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-it"
                label="Italian (IT)"
                value={editingEntry.it}
                onChange={(e) => setEditingEntry({ ...editingEntry, it: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-nl"
                label="Dutch (NL)"
                value={editingEntry.nl}
                onChange={(e) => setEditingEntry({ ...editingEntry, nl: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-no"
                label="Norwegian (NO)"
                value={editingEntry.no}
                onChange={(e) => setEditingEntry({ ...editingEntry, no: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-pl"
                label="Polish (PL)"
                value={editingEntry.pl}
                onChange={(e) => setEditingEntry({ ...editingEntry, pl: e.target.value })}
              />
            </div>

            <div>
              <Input
                id="edit-se"
                label="Swedish (SE)"
                value={editingEntry.se}
                onChange={(e) => setEditingEntry({ ...editingEntry, se: e.target.value })}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text mb-2">Status</label>
              <select
                id="edit-status"
                value={editingEntry.status}
                onChange={(e) =>
                  setEditingEntry({ ...editingEntry, status: e.target.value as any })
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none transition-all"
              >
                <option value="NEW">New</option>
                <option value="MODIFIED">Modified</option>
                <option value="TRANSLATED">Translated</option>
                <option value="REVIEWED">Reviewed</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntryId(null);
                }}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isEditing || !editingEntry.key || !editingEntry.en}
              >
                {isEditing ? 'Updating...' : 'Update Entry'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Export Modal */}
        <Modal isOpen={showExportModal} onClose={handleCloseExportModal} title="Export Entries">
          <div className="space-y-6">
            {exportError && <Alert type="error">{exportError}</Alert>}

            <div>
              <label className="block text-sm font-medium text-text mb-3">Export Format</label>
              <div className="flex gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={() => setExportFormat('json')}
                    className="w-4 h-4 accent-cta"
                  />
                  <span className="text-sm text-text">JSON</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="w-4 h-4 accent-cta"
                  />
                  <span className="text-sm text-text">CSV</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="excel"
                    checked={exportFormat === 'excel'}
                    onChange={() => setExportFormat('excel')}
                    className="w-4 h-4 accent-cta"
                  />
                  <span className="text-sm text-text">Excel (TSV)</span>
                </label>
              </div>
            </div>

            <div className="text-sm text-text-secondary">
              Will export <strong>{filteredEntries.length}</strong> entries
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseExportModal}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleExport}
                disabled={isExporting || filteredEntries.length === 0}
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirm Delete"
        >
          <div className="space-y-6">
            {deleteError && <Alert type="error">{deleteError}</Alert>}

            <p className="text-text-secondary">
              {deleteTarget
                ? `Are you sure you want to delete the entry "${deleteTarget.key}"? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedEntries.size} selected entries? This action cannot be undone.`}
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default ProjectDetail;
