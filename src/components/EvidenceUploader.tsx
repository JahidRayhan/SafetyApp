
import React, { useState } from 'react';
import { Upload, FileText, Image, Video, Mic, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';

interface EvidenceUploaderProps {
  incidentId?: string;
  onUploadComplete?: (uploads: any[]) => void;
}

const EvidenceUploader = ({ incidentId, onUploadComplete }: EvidenceUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [completedUploads, setCompletedUploads] = useState<string[]>([]);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Mic className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Determine bucket based on whether it's an emergency incident
      const bucket = incidentId ? 'emergency-recordings' : 'recordings';
      
      // Create a progress callback
      const uploadWithProgress = async () => {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (error) throw error;
        return data;
      };

      const data = await uploadWithProgress();

      // Save record to database
      if (incidentId) {
        await supabase.from('recordings').insert({
          incident_id: incidentId,
          user_id: user.user.id,
          file_path: data.path,
          file_type: file.type.split('/')[0], // 'image', 'video', 'audio'
          file_size: file.size,
          duration_seconds: 0 // Could be enhanced to detect actual duration
        });
      }

      await logActivity('evidence', `Uploaded ${file.type.split('/')[0]} evidence`, {
        incident_id: incidentId,
        file_path: data.path,
        file_size: file.size,
        file_type: file.type
      });

      return data.path;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploads: any[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        try {
          const filePath = await uploadFile(file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          setCompletedUploads(prev => [...prev, file.name]);
          
          uploads.push({
            fileName: file.name,
            filePath,
            fileType: file.type,
            fileSize: file.size
          });

          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error: any) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${error.message}`,
            variant: "destructive",
          });
        }
      }

      if (uploads.length > 0) {
        toast({
          title: "Evidence Uploaded",
          description: `Successfully uploaded ${uploads.length} file(s) as evidence.`,
        });

        if (onUploadComplete) {
          onUploadComplete(uploads);
        }

        // Clear files after successful upload
        setFiles([]);
        setUploadProgress({});
        setCompletedUploads([]);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Upload className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Evidence Upload</h3>
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
          <label
            htmlFor="evidence-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-gray-600">
              Click to select photos, videos, or audio files
            </span>
            <span className="text-sm text-gray-500">
              Supports images, videos, and audio recordings
            </span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Selected Files</h4>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {uploadProgress[file.name] !== undefined && (
                    <div className="flex items-center space-x-2">
                      {completedUploads.includes(file.name) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      <span className="text-xs text-gray-600">
                        {uploadProgress[file.name]}%
                      </span>
                    </div>
                  )}
                  
                  {!uploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
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
                <span>Upload Evidence</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Evidence files are encrypted and stored securely. They can be accessed later by authorized personnel for incident investigation.
        </p>
      </div>
    </div>
  );
};

export default EvidenceUploader;
