import { useState, useRef } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { UploadCloud, Download, Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';

interface UploadStatus {
  step: 'idle' | 'uploading' | 'preview' | 'success' | 'error';
  progress: number;
  previewData?: PreviewEntry[];
  error?: string;
}

interface PreviewEntry {
  uuid: string;
  cn: string;
  en: string;
  de: string;
  es: string;
  status: 'new' | 'modified' | 'deleted' | 'error';
  error?: string;
}

function UploadExcel() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    step: 'idle',
    progress: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Validate file
    if (!file.name.endsWith('.xlsx')) {
      setUploadStatus({
        step: 'error',
        progress: 0,
        error: 'Only .xlsx files are supported',
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

    // Simulate upload (replace with actual API call)
    setUploadStatus({ step: 'uploading', progress: 0 });

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setUploadStatus((prev) => ({ ...prev, progress: i }));
    }

    // Simulate parsing
    const parsedData = await parseExcelFile(file);
    setUploadStatus({
      step: 'preview',
      progress: 100,
      previewData: parsedData,
    });
  };

  const parseExcelFile = async (file: File): Promise<PreviewEntry[]> => {
    // Simulate Excel parsing (replace with actual library)
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      {
        uuid: crypto.randomUUID(),
        cn: '用户名',
        en: 'Username',
        de: 'Benutzername',
        es: 'Nombre de usuario',
        status: 'new',
      },
    ];
  };

  const handleCancelUpload = () => {
    setUploadStatus({ step: 'idle', progress: 0 });
  };

  const handleDownloadTemplate = async () => {
    // Simulate template download
    console.log('Downloading template...');
  };

  const handleConfirmUpload = async () => {
    setUploadStatus((prev) => ({ ...prev, step: 'uploading', progress: 0 }));

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setUploadStatus({
      step: 'success',
      progress: 100,
    });
  };

  return (
    <DashboardLayout currentPage="Upload Excel">
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-text mb-2">Upload Excel</h1>
        <p className="text-text-secondary mb-8">
          Upload your Excel file to manage multilingual text entries
        </p>

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
                <p className="text-secondary">or</p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
                <p className="text-sm text-secondary mt-4">
                  Supported format: .xlsx | Max size: 10MB
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-cta hover:text-cta/80 transition-colors underline underline-offset-4"
                >
                  <Download className="w-4 h-4 inline-block mr-1" />
                  Download Template
                </button>
              </div>
            ) : uploadStatus.step === 'uploading' ? (
              <>
                <Loader2 className="animate-spin h-12 w-12 text-cta mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">Uploading...</p>
                <p className="text-secondary">
                  {uploadStatus.progress}% completed
                </p>
                <Button onClick={handleCancelUpload} variant="secondary">
                  Cancel
                </Button>
              </>
            ) : null}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </Card>

      {/* Upload Progress */}
      {uploadStatus.step === 'uploading' && (
        <div className="bg-background border border-secondary rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upload Progress</h2>
          <div className="border-b border-secondary mb-4" />
          <div className="relative w-full h-2 bg-secondary rounded-lg overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-cta rounded-lg transition-all duration-300"
              style={{ width: `${uploadStatus.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {uploadStatus.step === 'preview' && uploadStatus.previewData && (
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Preview</h2>
            <Badge variant="info">{uploadStatus.previewData.length} entries</Badge>
          </div>
          <div className="border-b border-secondary mb-4"></div>
          
          {/* Show validation errors */}
          {uploadStatus.previewData.some(e => e.status === 'error') && (
            <div className="mb-6 p-4 rounded bg-warning/10 border border-warning">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Validation Errors:</h4>
                  <ul className="space-y-2">
                    {uploadStatus.previewData.filter(e => e.status === 'error').map((entry, index) => (
                      <li key={entry.uuid} className="text-sm">
                        Row {index + 1}: {entry.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={handleCancelUpload}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpload}
              className="flex-1"
            >
              Confirm Upload
            </Button>
          </div>
        </Card>
      )}
      
      {/* Success State */}
      {uploadStatus.step === 'success' && (
        <div className="text-center py-12">
          <CheckCircle className="w-20 h-20 text-cta mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-2">Upload completed successfully!</h2>
          <p className="text-secondary mb-6">
            {uploadStatus.previewData?.length || 0} entries have been processed
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => console.log('View entries')}>
              View Entries
            </Button>
            <Button
              variant="secondary"
              onClick={() => setUploadStatus({ step: 'idle', progress: 0 })}
            >
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
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              onClick={() => setUploadStatus({ step: 'idle', progress: 0 })}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}

export default UploadExcel;
