import React, { useState } from 'react';
import { Upload, FileText, Image, Video, Mic, X, CheckCircle, CloudOff, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/components/ActivityLog';
import { evidenceService } from '@/features/evidence/services/evidenceService';
import { useEvidenceStore } from '@/stores/evidenceStore';
import { useEvidenceQueue } from '@/hooks/useEvidenceQueue';

interface EvidenceUploaderProps {
  incidentId?: string;
  onUploadComplete?: (uploads: { fileName: string; filePath: string; queued: boolean }[]) => void;
}

const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
  if (file.type.startsWith('audio/')) return <Mic className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

const EvidenceUploader = ({ incidentId, onUploadComplete }: EvidenceUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const uploads = useEvidenceStore((s) => s.uploads);
  const upsertUpload = useEvidenceStore((s) => s.upsert);
  const setStatus = useEvidenceStore((s) => s.setStatus);
  const removeUpload = useEvidenceStore((s) => s.remove);
  const { online, pendingCount, failedCount } = useEvidenceQueue();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) =>
      upsertUpload(fileKey(f), { fileName: f.name, size: f.size, mime: f.type, status: 'selected', progress: 0 }),
    );
  };

  const removeFile = (index: number) => {
    const f = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (f) removeUpload(fileKey(f));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const completed: { fileName: string; filePath: string; queued: boolean }[] = [];
    try {
      for (const file of files) {
        const key = fileKey(file);
        setStatus(key, 'uploading', { progress: 25 });
        try {
          const outcome = await evidenceService.uploadOne(file, { incidentId });
          setStatus(key, outcome.queued ? 'queued' : 'uploaded', { progress: 100 });
          completed.push({ fileName: file.name, filePath: outcome.filePath, queued: outcome.queued });

          await logActivity('evidence', `Uploaded ${file.type.split('/')[0] || 'file'} evidence`, {
            incident_id: incidentId,
            file_path: outcome.filePath,
            file_size: file.size,
            file_type: file.type,
            queued_offline: outcome.queued,
          });
        } catch (error: any) {
          setStatus(key, 'failed', { error: error?.message ?? 'Upload failed' });
          toast({
            title: 'Upload Failed',
            description: `${file.name}: ${error?.message ?? 'Upload failed'}`,
            variant: 'destructive',
          });
        }
      }

      if (completed.length > 0) {
        const queuedCount = completed.filter((c) => c.queued).length;
        toast({
          title: queuedCount > 0 ? 'Evidence Queued' : 'Evidence Uploaded',
          description:
            queuedCount > 0
              ? `${queuedCount} file(s) queued for upload, ${completed.length - queuedCount} uploaded.`
              : `Successfully uploaded ${completed.length} file(s) as evidence.`,
        });
        onUploadComplete?.(completed);

        // Clear successful items from the local file list
        const failedKeys = new Set(
          Object.entries(uploads)
            .filter(([, v]) => v.status === 'failed')
            .map(([k]) => k),
        );
        setFiles((prev) => prev.filter((f) => failedKeys.has(fileKey(f))));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Upload className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Evidence Upload</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          {!online && (
            <span className="flex items-center gap-1 text-amber-700">
              <CloudOff className="w-3.5 h-3.5" /> Offline
            </span>
          )}
          {pendingCount > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {pendingCount} pending
            </span>
          )}
          {failedCount > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-3.5 h-3.5" /> {failedCount} failed
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileSelect}
            className="hidden"
            id="evidence-upload"
            disabled={uploading}
          />
          <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-gray-600">Click to select photos, videos, or audio files</span>
            <span className="text-sm text-gray-500">Supports images, videos, and audio recordings</span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Selected Files</h4>
            {files.map((file, index) => {
              const entry = uploads[fileKey(file)];
              return (
                <div key={`${fileKey(file)}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {entry?.status === 'uploading' && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {entry?.status === 'uploaded' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {entry?.status === 'queued' && <Clock className="w-4 h-4 text-amber-600" />}
                    {entry?.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-600" />}

                    {!uploading && (
                      <button onClick={() => removeFile(index)} className="p-1 text-gray-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {files.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{online ? 'Upload Evidence' : 'Queue Evidence (Offline)'}</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Evidence files are encrypted and stored securely. Offline uploads are queued and retried automatically.
        </p>
      </div>
    </div>
  );
};

export default EvidenceUploader;
