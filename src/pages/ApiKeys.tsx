import { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  status: 'active' | 'revoked';
}

function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'mlm_prod_******************************',
      createdAt: '2026-02-01T10:00:00Z',
      lastUsed: '2026-03-01T08:30:00Z',
      usageCount: 1247,
      status: 'active',
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'mlm_dev_******************************',
      createdAt: '2026-02-15T14:00:00Z',
      lastUsed: '2026-02-28T16:45:00Z',
      usageCount: 89,
      status: 'active',
    },
    {
      id: '3',
      name: 'Test Key (Revoked)',
      key: 'mlm_test_******************************',
      createdAt: '2026-01-20T09:00:00Z',
      lastUsed: '2026-02-10T11:20:00Z',
      usageCount: 342,
      status: 'revoked',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCreateKey = () => {
    console.log('Creating new API key:', newKeyName);
    setNewKeyName('');
    setShowCreateModal(false);
  };

  const handleRevokeKey = (keyId: string) => {
    console.log('Revoking key:', keyId);
    setApiKeys(apiKeys.map((key) =>
      key.id === keyId ? { ...key, status: 'revoked' as const } : key
    ));
  };

  const handleCopyKey = (keyId: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maskKey = (key: string) => {
    const prefix = key.slice(0, 8);
    const suffix = key.slice(-4);
    return `${prefix}${'.'.repeat(8)}${suffix}`;
  };

  return (
    <DashboardLayout currentPage="projects">
      <div className="max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">API Keys</h1>
            <p className="text-secondary">Manage your API keys for accessing the MultiLanguageManager API</p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
            + Generate New Key
          </Button>
        </div>

        {/* API Keys Info */}
        <div className="mb-6 bg-cta/10 border border-cta/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-text mb-1">About API Keys</h3>
              <p className="text-sm text-secondary">
                API keys are used to authenticate requests to the MultiLanguageManager API.
                Keep them secure and never share them in public repositories.
                Rate limit: 100 requests/minute per key.
              </p>
            </div>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="bg-secondary/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-secondary">
                <th className="px-6 py-4 text-left font-semibold text-text">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-text">API Key</th>
                <th className="px-6 py-4 text-left font-semibold text-text">Created</th>
                <th className="px-6 py-4 text-left font-semibold text-text">Last Used</th>
                <th className="px-6 py-4 text-left font-semibold text-text">Usage</th>
                <th className="px-6 py-4 text-left font-semibold text-text">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="border-b border-secondary hover:bg-cta/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-text">{apiKey.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono bg-secondary/20 text-text px-3 py-1 rounded">
                      {maskKey(apiKey.key)}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">
                    {formatDate(apiKey.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">
                    {formatDate(apiKey.lastUsed)}
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">
                    {apiKey.usageCount.toLocaleString()} requests
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={apiKey.status === 'active' ? 'success' : 'error'}>
                      {apiKey.status === 'active' ? 'Active' : 'Revoked'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {apiKey.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                            className="text-cta hover:text-cta/80 text-sm font-medium transition-colors"
                          >
                            {copiedKeyId === apiKey.id ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => handleRevokeKey(apiKey.id)}
                            className="text-error hover:text-error/80 text-sm font-medium transition-colors"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {apiKeys.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔑</div>
            <h3 className="text-xl font-semibold text-text mb-2">No API Keys Yet</h3>
            <p className="text-secondary mb-6">Create your first API key to start using the MultiLanguageManager API</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Generate API Key
            </Button>
          </div>
        )}

        {/* Create API Key Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-primary rounded-lg max-w-md w-full mx-4 p-6">
              <h2 className="text-2xl font-bold text-text mb-4">Generate New API Key</h2>
              <p className="text-sm text-secondary mb-6">
                Give your API key a descriptive name to help you identify it later.
              </p>
              <div className="mb-6">
                <label htmlFor="newKeyName" className="block text-sm font-medium text-text mb-2">
                  API Key Name
                </label>
                <input
                  id="newKeyName"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Key"
                  className="w-full px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/20 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                >
                  Generate Key
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ApiKeys;
