import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { useToast } from '../components/Toast';
import { ArrowLeft, Download, Loader2, CheckCircle, FileText } from 'lucide-react';
import { projectApi, entryApi } from '../services/api';
import { Project, Entry } from '../services/apiClient';

interface ExportStatus {
  step: 'idle' | 'loading' | 'exporting' | 'success' | 'error';
  progress: number;
  error?: string;
}

function ExportDownload() {
  const navigate = useNavigate();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    step: 'idle',
    progress: 0,
  });

  // 导出选项
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(
    new Set(['CN', 'EN', 'DE', 'ES', 'FI', 'FR', 'IT', 'NL', 'NO', 'PL', 'SE', 'DA'])
  );

  const availableLanguages = [
    { code: 'CN', name: 'Chinese' },
    { code: 'EN', name: 'English' },
    { code: 'DE', name: 'German' },
    { code: 'ES', name: 'Spanish' },
    { code: 'FI', name: 'Finnish' },
    { code: 'FR', name: 'French' },
    { code: 'IT', name: 'Italian' },
    { code: 'NL', name: 'Dutch' },
    { code: 'NO', name: 'Norwegian' },
    { code: 'PL', name: 'Polish' },
    { code: 'SE', name: 'Swedish' },
    { code: 'DA', name: 'Danish' },
  ];

  // 加载项目列表
  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当选择项目时，加载条目
  useEffect(() => {
    if (selectedProjectId) {
      loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await projectApi.getProjects();
      if (response.success && response.data) {
        const projectList =
          (response.data as any)?.projects ||
          (response.data as any)?.entries ||
          (response.data as any)?.data ||
          (Array.isArray(response.data) ? response.data : []);
        setProjects(Array.isArray(projectList) ? projectList : []);
        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      toast.showToast({
        type: 'error',
        message: 'Failed to load projects',
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadEntries = async () => {
    if (!selectedProjectId) return;

    try {
      setIsLoadingEntries(true);
      const response = await entryApi.getAllEntries(selectedProjectId);
      if (response.success && response.data) {
        setEntries(response.data.entries || []);
      }
    } catch (err) {
      console.error('Failed to load entries:', err);
      toast.showToast({
        type: 'error',
        message: 'Failed to load entries',
      });
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleLanguageToggle = (lang: string) => {
    setSelectedLanguages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lang)) {
        newSet.delete(lang);
      } else {
        newSet.add(lang);
      }
      return newSet;
    });
  };

  const handleSelectAllLanguages = () => {
    setSelectedLanguages(new Set(availableLanguages.map((l) => l.code)));
  };

  const handleExport = async () => {
    if (!selectedProjectId) {
      toast.showToast({
        type: 'error',
        message: 'Please select a project first',
      });
      return;
    }

    if (selectedLanguages.size === 0) {
      toast.showToast({
        type: 'error',
        message: 'Please select at least one language',
      });
      return;
    }

    if (entries.length === 0) {
      toast.showToast({
        type: 'error',
        message: 'No entries to export',
      });
      return;
    }

    setExportStatus({ step: 'exporting', progress: 0 });

    try {
      const languages = Array.from(selectedLanguages).map((l) => l.toLowerCase());
      const zip = new JSZip();
      const folder = zip.folder('translations');

      if (!folder) {
        throw new Error('Failed to create folder in ZIP');
      }

      // 为每个选中的语言创建 JSON 文件
      languages.forEach((lang) => {
        const langData: Record<string, string> = {};
        entries.forEach((entry) => {
          const value = entry[lang as keyof Entry];
          langData[entry.key] = typeof value === 'string' ? value : '';
        });
        // Always add the file for every language, even with empty values
        folder.file(`${lang}.json`, JSON.stringify(langData, null, 2));
      });

      // 生成 ZIP 文件
      const content = await zip.generateAsync({ type: 'blob' });

      // 创建下载链接
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;

      const selectedProject = projects.find((p) => p.id === selectedProjectId);
      const projectName = selectedProject?.name || 'translations';
      link.download = `${projectName}_${new Date().toISOString().split('T')[0]}.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus({ step: 'success', progress: 100 });

      toast.showToast({
        type: 'success',
        message: `Successfully exported ${languages.length} language files`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setExportStatus({ step: 'error', progress: 0, error: errorMessage });
      toast.showToast({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleReset = () => {
    setExportStatus({ step: 'idle', progress: 0 });
  };

  if (isLoadingProjects) {
    return (
      <DashboardLayout currentPage="export">
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="export">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text">Export Translations</h1>
            <p className="text-text-secondary">Export your multilingual translations as ZIP file</p>
          </div>
        </div>

        {/* Project Selection */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Project</h2>
          {projects.length === 0 ? (
            <Alert type="warning">
              No projects available. Please create a project first.
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="ml-4"
              >
                Create Project
              </Button>
            </Alert>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none transition-all"
            >
              <option value="">-- Select a project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.languages.join(', ')})
                </option>
              ))}
            </select>
          )}

          {/* Entry count */}
          {selectedProjectId && (
            <div className="mt-4 flex items-center gap-4">
              <Badge variant="info">
                {isLoadingEntries ? 'Loading...' : `${entries.length} entries`}
              </Badge>
              {entries.length > 0 && (
                <span className="text-sm text-text-secondary">
                  {selectedLanguages.size} languages selected
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Export Configuration */}
        {exportStatus.step === 'idle' || exportStatus.step === 'loading' ? (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Export Configuration</h2>

            {/* Language Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium">Select Languages</label>
                <button
                  onClick={handleSelectAllLanguages}
                  className="text-cta hover:text-cta/80 text-sm font-medium underline underline-offset-2 transition-colors"
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {availableLanguages.map((lang) => (
                  <label
                    key={lang.code}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer border-2 transition-all
                      ${
                        selectedLanguages.has(lang.code)
                          ? 'border-cta bg-cta/10 text-cta'
                          : 'border-secondary bg-background text-text hover:border-cta/50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLanguages.has(lang.code)}
                      onChange={() => handleLanguageToggle(lang.code)}
                      className="w-4 h-4 accent-cta"
                    />
                    <span className="text-sm font-medium">{lang.code}</span>
                    <span className="text-xs text-text-secondary">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <div className="flex gap-4 justify-end">
              <Button
                onClick={handleExport}
                disabled={
                  !selectedProjectId ||
                  entries.length === 0 ||
                  selectedLanguages.size === 0 ||
                  isLoadingEntries
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Export Translations
              </Button>
            </div>
          </Card>
        ) : exportStatus.step === 'exporting' ? (
          <Card className="mb-8">
            <div className="text-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-cta mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">Exporting Translations...</p>
              <p className="text-text-secondary">{exportStatus.progress}% completed</p>
            </div>
          </Card>
        ) : exportStatus.step === 'success' ? (
          <Card className="mb-8">
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-2">Export Completed Successfully!</h2>
              <p className="text-text-secondary mb-6">
                {selectedLanguages.size} language files have been downloaded
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate(`/projects/${selectedProjectId}`)}>
                  View Project
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Export Another
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-8">
            <div className="text-center py-12">
              <FileText className="w-20 h-20 text-error mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-2">Export Failed</h2>
              <p className="text-error mb-6">{exportStatus.error}</p>
              <Button variant="secondary" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Preview */}
        {exportStatus.step === 'idle' && selectedProjectId && entries.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Preview</h2>
              <Badge variant="info">{entries.length} entries</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary">
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">Key</th>
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">EN</th>
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">DE</th>
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="border-b border-secondary/50">
                      <td className="px-2 py-2 text-text font-medium">{entry.key}</td>
                      <td className="px-2 py-2 text-text-secondary">{entry.en || '-'}</td>
                      <td className="px-2 py-2 text-text-secondary">{entry.de || '-'}</td>
                      <td className="px-2 py-2">
                        <Badge variant={entry.status === 'NEW' ? 'success' : 'info'}>
                          {entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {entries.length > 10 && (
                <p className="text-sm text-text-secondary mt-2 text-center">
                  Showing first 10 of {entries.length} entries
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ExportDownload;
