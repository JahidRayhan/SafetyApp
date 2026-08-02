
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/components/ActivityLog';
import { authService } from '@/features/auth/services/authService';
import { enqueueEvidence } from '@/core/sync/evidenceQueue';

export const useEmergencyRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const startEmergencyRecording = useCallback(async (incidentId: string) => {
    try {
      console.log('Starting emergency recording for incident:', incidentId);
      
      const session = await authService.getSession();
      const currentUser = session?.user;
      if (!currentUser) throw new Error('Not authenticated');

      // Check if browser supports media recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media recording not supported in this browser');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false // Audio only for emergency recording
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Emergency recording stopped, processing...');

        try {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });

          // Persist to IndexedDB FIRST so we never lose evidence on a crash
          // or network failure. The background processor uploads when online.
          const queued = await enqueueEvidence({
            incident_id: incidentId,
            user_id: currentUser.id,
            blob: audioBlob,
            file_type: 'audio',
            mime_type: 'audio/webm',
            extension: 'webm',
            duration_seconds: 0,
          });

          setRecordingId(queued.id);

          await logActivity('emergency', 'Emergency recording queued for upload', {
            incident_id: incidentId,
            queue_id: queued.id,
            file_path: queued.file_path,
            file_size: audioBlob.size,
            file_type: 'audio',
            online: typeof navigator !== 'undefined' ? navigator.onLine : true,
          });

          const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
          toast({
            title: isOffline ? '🎙️ Recording Saved Offline' : '🎙️ Recording Saved',
            description: isOffline
              ? 'Stored on this device. It will upload automatically when you are back online.'
              : 'Emergency recording is being securely uploaded.',
          });
        } catch (error: any) {
          console.error('Error queuing emergency recording:', error);
          toast({
            title: 'Recording Error',
            description: `Failed to save recording: ${error.message}`,
            variant: 'destructive',
          });
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      await logActivity('emergency', 'Emergency recording started', { 
        incident_id: incidentId 
      });

      toast({
        title: "🎙️ Recording Started",
        description: "Emergency recording is now active.",
      });

      // Auto-stop recording after 5 minutes
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          console.log('Auto-stopping emergency recording after 5 minutes');
          mediaRecorder.stop();
        }
      }, 5 * 60 * 1000);

      return recordingId;
      
    } catch (error: any) {
      console.error('Error starting emergency recording:', error);
      setIsRecording(false);
      
      await logActivity('emergency', 'Emergency recording failed to start', { 
        incident_id: incidentId,
        error: error.message
      });

      toast({
        title: "Recording Error",
        description: `Unable to start recording: ${error.message}`,
        variant: "destructive",
      });
      
      return null;
    }
  }, [toast, logActivity, recordingId]);

  const stopEmergencyRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingId(null);
    toast({
      title: "Recording Stopped",
      description: "Emergency recording has been stopped.",
    });
  }, [toast]);

  return {
    isRecording,
    recordingId,
    startEmergencyRecording,
    stopEmergencyRecording
  };
};
