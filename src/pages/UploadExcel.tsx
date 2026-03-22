import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { useToast } from '../components/Toast';
import {
  UploadCloud,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { projectApi, entryApi } from '../services/api';
import { Project } from '../services/apiClient';

interface UploadStatus {
  step: 'idle' | 'parsing' | 'preview' | 'uploading' | 'success' | 'error';
  progress: number;
  previewData?: PreviewEntry[];
  error?: string;
}

interface PreviewEntry {
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
  status: 'new' | 'exists' | 'error';
  error?: string;
}

function UploadExcel() {
  const navigate = useNavigate();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    step: 'idle',
    progress: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载项目列表
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await projectApi.getProjects();
      if (response.success && response.data) {
        // API 返回 { projects: [...], total: ... } 格式
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // 验证是否选择了项目
    if (!selectedProjectId) {
      setUploadStatus({
        step: 'error',
        progress: 0,
        error: 'Please select a project first',
      });
      return;
    }

    // 验证文件格式
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus({
        step: 'error',
        progress: 0,
        error: 'Only .xlsx and .xls files are supported',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        step: 'error',
        progress: 0,
        error: 'File size must be less than 10MB',
      });
      return;
    }

    setUploadStatus({ step: 'parsing', progress: 0 });

    try {
      // 解析 Excel 文件
      const parsedData = await parseExcelFile(file);
      setUploadStatus({
        step: 'preview',
        progress: 100,
        previewData: parsedData,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse Excel file';
      setUploadStatus({
        step: 'error',
        progress: 0,
        error: errorMessage,
      });
    }
  };

  const parseExcelFile = (file: File): Promise<PreviewEntry[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });

          // 获取第一个工作表
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // 转换为 JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

          if (jsonData.length < 2) {
            reject(new Error('Excel file is empty or has no data rows'));
            return;
          }

          // 获取表头
          const headers = jsonData[0] as string[];
          const keyIndex = headers.findIndex((h) => h?.toLowerCase() === 'key');

          if (keyIndex === -1) {
            reject(new Error('Excel must have a "Key" column'));
            return;
          }

          // 语言列映射
          const langMap: Record<string, number> = {};
          const languages = [
            'cn',
            'en',
            'de',
            'es',
            'fi',
            'fr',
            'it',
            'nl',
            'no',
            'pl',
            'se',
            'da',
          ];
          languages.forEach((lang) => {
            const index = headers.findIndex((h) => h?.toLowerCase() === lang.toLowerCase());
            if (index !== -1) {
              langMap[lang] = index;
            }
          });

          // 解析数据行
          const entries: PreviewEntry[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const key = row[keyIndex]?.toString().trim();
            if (!key) continue;

            const entry: PreviewEntry = {
              key,
              cn: langMap.cn !== undefined ? row[langMap.cn]?.toString() || '' : '',
              en: langMap.en !== undefined ? row[langMap.en]?.toString() || '' : '',
              de: langMap.de !== undefined ? row[langMap.de]?.toString() || '' : '',
              es: langMap.es !== undefined ? row[langMap.es]?.toString() || '' : '',
              fi: langMap.fi !== undefined ? row[langMap.fi]?.toString() || '' : '',
              fr: langMap.fr !== undefined ? row[langMap.fr]?.toString() || '' : '',
              it: langMap.it !== undefined ? row[langMap.it]?.toString() || '' : '',
              nl: langMap.nl !== undefined ? row[langMap.nl]?.toString() || '' : '',
              no: langMap.no !== undefined ? row[langMap.no]?.toString() || '' : '',
              pl: langMap.pl !== undefined ? row[langMap.pl]?.toString() || '' : '',
              se: langMap.se !== undefined ? row[langMap.se]?.toString() || '' : '',
              status: 'new',
            };

            // 验证：至少需要一个语言值
            const hasValue = languages.some((lang) => entry[lang as keyof PreviewEntry]);
            if (!hasValue) {
              entry.status = 'error';
              entry.error = 'No translation value provided';
            }

            entries.push(entry);
          }

          if (entries.length === 0) {
            reject(new Error('No valid entries found in Excel file'));
            return;
          }

          resolve(entries);
        } catch (err) {
          reject(
            new Error(
              'Failed to parse Excel file: ' +
                (err instanceof Error ? err.message : 'Unknown error')
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsBinaryString(file);
    });
  };

  const handleCancelUpload = () => {
    setUploadStatus({ step: 'idle', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    // 创建模板数据
    const templateData = [
      ['Key', 'CN', 'EN', 'DE', 'ES', 'FI', 'FR', 'IT', 'NL', 'NO', 'PL', 'SE', 'DA'],
      [
        'welcome_message',
        '欢迎',
        'Welcome',
        'Willkommen',
        'Bienvenido',
        'Tervetuloa',
        'Bienvenue',
        'Benvenuto',
        'Welkom',
        'Velkommen',
        'Witamy',
        'Välkommen',
        'Velkommen',
      ],
      [
        'login_button',
        '登录',
        'Login',
        'Anmelden',
        'Iniciar sesión',
        'Kirjaudu',
        'Connexion',
        'Accedi',
        'Inloggen',
        'Logg inn',
        'Zaloguj',
        'Logga in',
        'Log ind',
      ],
      [
        'logout_button',
        '退出',
        'Logout',
        'Abmelden',
        'Cerrar sesión',
        'Kirjaudu ulos',
        'Déconnexion',
        'Esci',
        'Uitloggen',
        'Logg ut',
        'Wyloguj',
        'Logga ut',
        'Log ud',
      ],
    ];

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, // Key
      { wch: 15 }, // CN
      { wch: 15 }, // EN
      { wch: 15 }, // DE
      { wch: 15 }, // ES
      { wch: 15 }, // FI
      { wch: 15 }, // FR
      { wch: 15 }, // IT
      { wch: 15 }, // NL
      { wch: 15 }, // NO
      { wch: 15 }, // PL
      { wch: 15 }, // SE
      { wch: 15 }, // DA
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Translations');

    // 下载文件
    XLSX.writeFile(wb, 'translation_template.xlsx');

    toast.showToast({
      type: 'success',
      message: 'Template downloaded successfully',
    });
  };

  const handleConfirmUpload = async () => {
    if (!selectedProjectId || !uploadStatus.previewData) {
      return;
    }

    setUploadStatus((prev) => ({ ...prev, step: 'uploading', progress: 0 }));

    const totalEntries = uploadStatus.previewData.length;
    let successCount = 0;
    let errorCount = 0;

    try {
      // 批量创建条目
      for (let i = 0; i < uploadStatus.previewData.length; i++) {
        const entry = uploadStatus.previewData[i];

        if (entry.status === 'error') {
          errorCount++;
          continue;
        }

        try {
          const response = await entryApi.createEntry(selectedProjectId, {
            key: entry.key,
            cn: entry.cn,
            en: entry.en,
            de: entry.de,
            es: entry.es,
            fi: entry.fi,
            fr: entry.fr,
            it: entry.it,
            nl: entry.nl,
            no: entry.no,
            pl: entry.pl,
            se: entry.se,
          });

          if (response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }

        // 更新进度
        const progress = Math.round(((i + 1) / totalEntries) * 100);
        setUploadStatus((prev) => ({ ...prev, progress }));
      }

      setUploadStatus({
        step: 'success',
        progress: 100,
        previewData: uploadStatus.previewData,
      });

      toast.showToast({
        type: successCount > 0 ? 'success' : 'error',
        message: `Import completed: ${successCount} entries imported, ${errorCount} errors`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import entries';
      setUploadStatus((prev) => ({
        ...prev,
        step: 'error',
        error: errorMessage,
      }));
    }
  };

  const handleViewEntries = () => {
    if (selectedProjectId) {
      navigate(`/projects/${selectedProjectId}`);
    }
  };

  if (isLoadingProjects) {
    return (
      <DashboardLayout currentPage="Upload Excel">
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="Upload Excel">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text">Upload Excel</h1>
            <p className="text-text-secondary">
              Upload your Excel file to import multilingual text entries
            </p>
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
        </Card>

        {/* Upload Area */}
        <Card className="mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-cta bg-cta/5'
                : 'border-secondary hover:border-cta hover:bg-secondary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadStatus.step === 'idle' ? (
              <div>
                <UploadCloud className="w-12 h-12 text-cta mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">Drag & Drop Excel File Here</p>
                <p className="text-text-secondary">or</p>
                <Button onClick={() => fileInputRef.current?.click()} disabled={!selectedProjectId}>
                  Browse Files
                </Button>
                <p className="text-sm text-text-secondary mt-4">
                  Supported formats: .xlsx, .xls | Max size: 10MB
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-cta hover:text-cta/80 transition-colors underline underline-offset-4 mt-4 inline-flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            ) : uploadStatus.step === 'parsing' ? (
              <>
                <Loader2 className="animate-spin h-12 w-12 text-cta mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">Parsing Excel File...</p>
              </>
            ) : uploadStatus.step === 'uploading' ? (
              <>
                <Loader2 className="animate-spin h-12 w-12 text-cta mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">Importing Entries...</p>
                <p className="text-text-secondary">{uploadStatus.progress}% completed</p>
              </>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </Card>

        {/* Preview */}
        {uploadStatus.step === 'preview' && uploadStatus.previewData && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Preview</h2>
              <Badge variant="info">{uploadStatus.previewData.length} entries</Badge>
            </div>
            <div className="border-b border-secondary mb-4"></div>

            {/* Show validation errors */}
            {uploadStatus.previewData.some((e) => e.status === 'error') && (
              <div className="mb-6 p-4 rounded bg-error/10 border border-error/30">
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 flex-shrink-0 text-error" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2 text-error">Validation Errors:</h4>
                    <ul className="space-y-1 text-sm">
                      {uploadStatus.previewData
                        .filter((e) => e.status === 'error')
                        .slice(0, 5)
                        .map((entry, index) => (
                          <li key={index}>
                            Key "{entry.key}": {entry.error}
                          </li>
                        ))}
                      {uploadStatus.previewData.filter((e) => e.status === 'error').length > 5 && (
                        <li className="text-text-secondary">
                          ...and{' '}
                          {uploadStatus.previewData.filter((e) => e.status === 'error').length - 5}{' '}
                          more errors
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary">
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">Key</th>
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">CN</th>
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">EN</th>
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">DE</th>
                    <th className="text-left px-2 py-2 text-text-secondary font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadStatus.previewData.slice(0, 10).map((entry, index) => (
                    <tr key={index} className="border-b border-secondary/50">
                      <td className="px-2 py-2 text-text font-medium">{entry.key}</td>
                      <td className="px-2 py-2 text-text-secondary">{entry.cn || '-'}</td>
                      <td className="px-2 py-2 text-text-secondary">{entry.en || '-'}</td>
                      <td className="px-2 py-2 text-text-secondary">{entry.de || '-'}</td>
                      <td className="px-2 py-2">
                        <Badge variant={entry.status === 'error' ? 'error' : 'success'}>
                          {entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadStatus.previewData.length > 10 && (
                <p className="text-sm text-text-secondary mt-2 text-center">
                  Showing first 10 of {uploadStatus.previewData.length} entries
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button onClick={handleCancelUpload} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={uploadStatus.previewData.every((e) => e.status === 'error')}
              >
                Confirm Import
              </Button>
            </div>
          </Card>
        )}

        {/* Success State */}
        {uploadStatus.step === 'success' && (
          <div className="text-center py-12">
            <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Import Completed Successfully!</h2>
            <p className="text-text-secondary mb-6">
              {uploadStatus.previewData?.filter((e) => e.status !== 'error').length || 0} entries
              have been imported
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleViewEntries}>View Entries</Button>
              <Button variant="secondary" onClick={handleCancelUpload}>
                Upload Another
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {uploadStatus.step === 'error' && (
          <div className="text-center py-12">
            <FileText className="w-20 h-20 text-error mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Upload Failed</h2>
            <p className="text-error mb-6">{uploadStatus.error}</p>
            <Button variant="secondary" onClick={handleCancelUpload}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default UploadExcel;
