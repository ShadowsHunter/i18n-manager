import { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

function Settings() {
  const [projectName, setProjectName] = useState('My App');
  const [projectDescription, setProjectDescription] = useState('Mobile application for e-commerce platform');
  const [defaultLanguage, setDefaultLanguage] = useState('EN');
  const [autoTranslation, setAutoTranslation] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'xml' | 'strings'>('json');

  const handleSave = () => {
    console.log('Saving settings:', {
      projectName,
      projectDescription,
      defaultLanguage,
      autoTranslation,
      notificationEmail,
      exportFormat,
    });
  };

  const handleReset = () => {
    console.log('Resetting settings to defaults');
    setProjectName('My App');
    setProjectDescription('Mobile application for e-commerce platform');
    setDefaultLanguage('EN');
    setAutoTranslation(false);
    setNotificationEmail('');
    setExportFormat('json');
  };

  return (
    <DashboardLayout currentPage="projects">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Settings</h1>
          <p className="text-secondary">Configure project settings and preferences</p>
        </div>

        <div className="space-y-8">
          {/* Project Information */}
          <section className="bg-secondary/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text mb-4">Project Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-text mb-2">
                  Project Name
                </label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-text mb-2">
                  Description
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/20 transition-all resize-none"
                  placeholder="Describe your project"
                />
              </div>
            </div>
          </section>

          {/* Language Settings */}
          <section className="bg-secondary/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text mb-4">Language Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="defaultLanguage" className="block text-sm font-medium text-text mb-2">
                  Default Language
                </label>
                <select
                  id="defaultLanguage"
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/20 transition-all"
                >
                  <option value="CN">Chinese (CN)</option>
                  <option value="DA">Danish (DA)</option>
                  <option value="DE">German (DE)</option>
                  <option value="EN">English (EN)</option>
                  <option value="ES">Spanish (ES)</option>
                  <option value="FI">Finnish (FI)</option>
                  <option value="FR">French (FR)</option>
                  <option value="IT">Italian (IT)</option>
                  <option value="NL">Dutch (NL)</option>
                  <option value="NO">Norwegian (NO)</option>
                  <option value="PL">Polish (PL)</option>
                  <option value="SE">Swedish (SE)</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoTranslation"
                  checked={autoTranslation}
                  onChange={(e) => setAutoTranslation(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-secondary bg-background focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/20 cursor-pointer"
                />
                <label htmlFor="autoTranslation" className="text-sm text-text cursor-pointer">
                  Enable auto-translation for new entries
                </label>
              </div>
            </div>
          </section>

          {/* Export Settings */}
          <section className="bg-secondary/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text mb-4">Export Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="exportFormat" className="block text-sm font-medium text-text mb-2">
                  Default Export Format
                </label>
                <select
                  id="exportFormat"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'xml' | 'strings')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/20 transition-all"
                >
                  <option value="json">JSON</option>
                  <option value="xml">XML (Android)</option>
                  <option value="strings">Strings (iOS)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-secondary/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text mb-4">Notifications</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="notificationEmail" className="block text-sm font-medium text-text mb-2">
                  Email for notifications
                </label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex gap-4 pt-4 border-t border-secondary">
            <Button variant="primary" size="lg" onClick={handleSave}>
              Save Settings
            </Button>
            <Button variant="secondary" size="lg" onClick={handleReset}>
              Reset to Defaults
            </Button>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
