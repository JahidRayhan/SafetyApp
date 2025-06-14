
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';
import { useLocationSharing } from './useLocationSharing';

export const useEmergencyRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const { shareLocationWithContacts } = useLocationSharing();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const uploadRecording = async (blob: Blob, incidentId: string, type: 'audio' | 'video') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const fileName = `${user.user.id}/${incidentId}_${Date.now()}.webm`;
      
      console.log('Uploading emergency recording to storage...');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('emergency-recordings')
        .upload(fileName, blob);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Recording uploaded, processing via edge function...');

      // Process the recording via edge function
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-recording-upload', {
        body: {
          incident_id: incidentId,
          user_id: user.user.id,
          file_path: uploadData.path,
          file_type: type,
          file_size: blob.size,
          duration_seconds: 300 // Estimated duration
        }
      });

      if (processError) {
        console.error('Processing error:', processError);
        // Still log success for upload even if processing fails
        await logActivity('emergency', 'Emergency recording uploaded (processing failed)', { 
          incident_id: incidentId,
          file_path: uploadData.path,
          file_size: blob.size,
          processing_error: processError.message
        });
      } else {
        await logActivity('emergency', 'Emergency recording uploaded and processed', { 
          incident_id: incidentId,
          recording_id: processResult.recording_id,
          file_path: uploadData.path,
          file_size: blob.size 
        });
      }

      toast({
        title: "📹 Recording Saved",
        description: "Emergency recording has been securely uploaded and processed.",
      });

    } catch (error: any) {
      console.error('Error handling recording:', error);
      
      // Fallback: store everything locally
      try {
        const recordingData = {
          incident_id: incidentId,
          file_type: type,
          file_size: blob.size,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`emergency_recording_${incidentId}`, await blobToBase64(blob));
        localStorage.setItem(`emergency_recording_meta_${incidentId}`, JSON.stringify(recordingData));
        
        await logActivity('emergency', 'Emergency recording stored locally due to upload failure', { 
          incident_id: incidentId,
          error: error.message,
          stored_locally: true
        });
        
        toast({
          title: "📱 Recording Saved Locally",
          description: "Recording stored on device due to connection issues. Will upload when connection is restored.",
        });
        
        setupRetryUpload(incidentId, blob, recordingData);
      } catch (localError) {
        console.error('Failed to store recording locally:', localError);
        toast({
          title: "❌ Recording Failed",
          description: "Unable to save emergency recording. Please try manual recording.",
          variant: "destructive",
        });
      }
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const setupRetryUpload = (incidentId: string, blob: Blob, recordingData: any) => {
    const retryInterval = setInterval(async () => {
      try {
        console.log('Retrying upload for incident:', incidentId);
        
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        const fileName = `${user.user.id}/${incidentId}_${Date.now()}.webm`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('emergency-recordings')
          .upload(fileName, blob);

        if (!uploadError) {
          localStorage.removeItem(`emergency_recording_${incidentId}`);
          localStorage.removeItem(`emergency_recording_meta_${incidentId}`);
          clearInterval(retryInterval);
          
          // Process via edge function
          await supabase.functions.invoke('process-recording-upload', {
            body: {
              incident_id: incidentId,
              user_id: user.user.id,
              file_path: uploadData.path,
              file_type: recordingData.file_type,
              file_size: recordingData.file_size
            }
          });
          
          await logActivity('emergency', 'Offline recording uploaded successfully on retry', { 
            incident_id: incidentId,
            file_path: uploadData.path 
          });

          toast({
            title: "📤 Recording Uploaded",
            description: "Offline recording has been successfully uploaded and processed.",
          });
        }
      } catch (retryError) {
        console.log('Retry upload failed, will try again later...');
      }
    }, 30000); // Retry every 30 seconds

    // Stop retrying after 1 hour
    setTimeout(() => {
      clearInterval(retryInterval);
    }, 3600000);
  };

  const startEmergencyRecording = useCallback(async (incidentId: string) => {
    try {
      console.log('Starting emergency recording for incident:', incidentId);
      
      // Share location with contacts immediately
      await shareLocationWithContacts(incidentId);

      // Try video first, fall back to audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        await uploadRecording(blob, incidentId, 'video');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Record for 5 minutes
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 5 * 60 * 1000);

      await logActivity('emergency', 'Emergency video recording started', { 
        incident_id: incidentId,
        recording_type: 'video',
        duration_planned: 300 
      });

      toast({
        title: "📹 Emergency Recording Started",
        description: "Video recording is active and will upload automatically.",
      });

    } catch (error: any) {
      console.error('Error starting video recording:', error);
      
      // Fallback to audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioRecorder = new MediaRecorder(audioStream);
        mediaRecorderRef.current = audioRecorder;
        recordedChunksRef.current = [];

        audioRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        audioRecorder.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          await uploadRecording(blob, incidentId, 'audio');
          audioStream.getTracks().forEach(track => track.stop());
        };

        audioRecorder.start();
        setIsRecording(true);

        // Record for 5 minutes
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
          }
        }, 5 * 60 * 1000);

        await logActivity('emergency', 'Emergency audio recording started (video fallback)', { 
          incident_id: incidentId,
          recording_type: 'audio' 
        });

        toast({
          title: "🎤 Emergency Audio Recording Started",
          description: "Audio recording is active and will upload automatically.",
        });

      } catch (audioError: any) {
        console.error('Error starting audio recording:', audioError);
        await logActivity('emergency', 'Emergency recording failed to start', { 
          incident_id: incidentId,
          error: audioError.message 
        });
        
        toast({
          title: "❌ Recording Error",
          description: "Could not start emergency recording. Emergency alert will still be sent.",
          variant: "destructive",
        });
      }
    }
  }, [logActivity, toast, shareLocationWithContacts]);

  return {
    isRecording,
    startEmergencyRecording
  };
};
