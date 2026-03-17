import { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

interface ExportHistory {
  id: string;
  timestamp: string;
  project: string;
  platform: 'iOS' | 'Android' | 'Web';
  language: string;
  version: string;
}

function ExportDownload() {
  const [selectedProject, setSelectedProject] = useState('my-app');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<'iOS' | 'Android' | 'Web'>>(new Set(['iOS', 'Android', 'Web']));
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set(['CN', 'DA', 'DE', 'EN', 'ES', 'FI', 'FR', 'IT', 'NL', 'NO', 'PL', 'SE']));

  const [exportHistory] = useState<ExportHistory[]>([
    {
      id: '1',
      timestamp: '2026-03-01 10:30:00',
      project: 'My App',
      platform: 'iOS',
      language: 'All',
      version: 'v1.0.0',
    },
    {
      id: '2',
      timestamp: '2026-02-28 15:45:00',
      project: 'My App',
      platform: 'Android',
      language: 'EN',
      version: 'v1.0.0',
    },
    {
      id: '3',
      timestamp: '2026-02-28 15:00:00',
      project: 'My App',
      platform: 'Web',
      language: 'All',
      version: 'v1.0.0',
    },
  ]);

  const availableProjects = [
    { id: 'my-app', name: 'My App' },
    { id: 'dashboard', name: 'Dashboard' },
  ];

  const availableLanguages = [
    'CN', 'DA', 'DE', 'EN', 'ES', 'FI', 'FR', 'IT', 'NL', 'NO', 'PL', 'SE',
  ];

  const availablePlatforms = [
    { id: 'ios', name: 'iOS (.strings)' },
    { id: 'android', name: 'Android (strings.xml)' },
    { id: 'web', name: 'Web (JSON)' },
  ];

  const handlePlatformToggle = (platform: 'iOS' | 'Android' | 'Web') => {
    setSelectedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platform)) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
      }
      return newSet;
    });
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(language)) {
        newSet.delete(language);
      } else {
        newSet.add(language);
      }
      return newSet;
    });
  };

  const handleDownload = () => {
    console.log('Download files:', {
      project: selectedProject,
      platforms: Array.from(selectedPlatforms),
      languages: Array.from(selectedLanguages),
    });
  };

  const handleDownloadHistory = (exportId: string) => {
    console.log('Download export:', exportId);
  };

  return (
    <DashboardLayout currentPage="projects">
      {/* Header */}
      <nav className="text-sm text-secondary mb-4">
        <a href="/" className="hover:text-cta transition-colors">Home</a>
        {' > '}
        <a href="/dashboard" className="hover:text-transition-colors">
          Projects
        </a>
        {' > '}
        <span className="text-text font-medium">
          My App
        </span>
        {' > '}
        <span className="text-text">Export</span>
      </nav>
      
      <h1 className="text-4xl font-bold mb-8">Export / Download</h1>
      
      {/* Export Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Selection */}
        <div className="bg-background border border-secondary rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Export Configuration</h2>
          
          {/* Project Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none transition-all"
            >
              {availableProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Platform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Platforms
            </label>
            <div className="space-y-2">
              {availablePlatforms.map((platform) => (
                <label
                  key={platform.id}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.has(platform.id as 'iOS' | 'Android' | 'Web')}
                    onChange={() => handlePlatformToggle(platform.id as 'iOS' | 'Android' | 'Web')}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-sm">
                    {platform.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Language Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Languages
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableLanguages.map((language) => (
                <label
                  key={language}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.has(language)}
                    onChange={() => handleLanguageToggle(language)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-sm font-mono">
                    {language}
                  </span>
                </label>
              ))}
            </div>
            <button
              className="text-cta hover:text-cta/80 text-sm font-medium underline underline-offset-2 transition-colors"
              onClick={() => {
                setSelectedLanguages(new Set(['CN', 'DA', 'DE', 'EN', 'ES', 'FI', 'FR', 'IT', 'NL', 'NO', 'PL', 'SE']));
              }}
            >
              Select All
            </button>
          </div>
          
          {/* Download Button */}
          <Button onClick={handleDownload} className="w-full">
            Download
          </Button>
        </div>
        
        {/* Right Column - API Info */}
        <div className="bg-background border border-secondary rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">API Endpoints</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-cta mb-2">Get Projects</h3>
              <code className="block bg-secondary/20 text-cta px-3 py-2 rounded text-sm font-mono">
                GET /api/projects
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-cta mb-2">Download Files</h3>
              <code className="block bg-secondary/20 text-cta px-3 py-2 rounded text-sm font-mono">
                GET /api/projects/:projectId/export?platform=\&#123;platform\&#125;&language=\&#123;language\&#125;
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-cta mb-2">Download ZIP Archive</h3>
              <code className="block bg-secondary/20 text-cta px-3 py-2 rounded text-sm font-mono">
                POST /api/projects/:id/export/zip
              </code>
            </div>
            
            <div className="pt-4 border-t border-secondary">
              <p className="text-xs text-secondary mb-2">
                <strong>Note:</strong> Replace <code>:projectId</code> with your project ID, <code>platform</code> with the platform type (iOS/Android/Web), and <code>language</code> with the language code.
              </p>
              <p className="text-xs text-secondary mb-2">
              </p>
              <p className="text-xs text-secondary mb-4">
                <strong>Rate Limit:</strong> 100 requests/minute
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Export History */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Export History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary">
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">Platform</th>
                <th className="px-4 py-3 text-left">Language</th>
                <th className="px-4 py-3 text-left">Version</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((exportItem) => (
                <tr key={exportItem.id} className="border-b border-secondary">
                  <td className="px-4 py-3 text-sm text-secondary">
                    {new Date(exportItem.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {exportItem.project}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{exportItem.platform}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {exportItem.language}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-secondary font-mono">
                      {exportItem.version}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-cta hover:text-cta/80 text-sm font-medium underline underline-offset-2 transition-colors"
                      onClick={() => handleDownloadHistory(exportItem.id)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ExportDownload;
