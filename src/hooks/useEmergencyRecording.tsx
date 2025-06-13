
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLogger } from '@/components/ActivityLog';

export const useEmergencyRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const uploadRecording = async (blob: Blob, incidentId: string, type: 'audio' | 'video') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const fileName = `${user.user.id}/${incidentId}_${Date.now()}.webm`;
      
      // Try to upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('emergency-recordings')
        .upload(fileName, blob);

      if (uploadError) {
        // If upload fails (offline), store locally
        const recordingData = {
          incident_id: incidentId,
          user_id: user.user.id,
          file_type: type,
          file_path: fileName,
          file_size: blob.size,
          duration_seconds: 300
        };

        // Store recording metadata and try to insert when online
        await supabase.from('recordings').insert(recordingData);
        
        // Store blob locally for later upload
        localStorage.setItem(`emergency_recording_${incidentId}`, await blobToBase64(blob));
        localStorage.setItem(`emergency_recording_meta_${incidentId}`, JSON.stringify(recordingData));
        
        await logActivity('emergency', 'Emergency recording stored offline', { 
          incident_id: incidentId,
          file_path: fileName,
          stored_locally: true
        });

        toast({
          title: "Recording Saved Offline",
          description: "Recording saved locally. Will upload when connection is restored.",
        });
        
        // Set up retry mechanism
        setupRetryUpload(incidentId, blob, fileName, recordingData);
      } else {
        // Upload successful
        const recordingData = {
          incident_id: incidentId,
          user_id: user.user.id,
          file_type: type,
          file_path: uploadData.path,
          file_size: blob.size,
          duration_seconds: 300
        };

        await supabase.from('recordings').insert(recordingData);
        
        await logActivity('emergency', 'Emergency recording uploaded successfully', { 
          incident_id: incidentId,
          file_path: uploadData.path,
          file_size: blob.size 
        });

        toast({
          title: "Recording Saved",
          description: "Emergency recording has been securely uploaded.",
        });
      }
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
        
        toast({
          title: "Recording Saved Locally",
          description: "Recording stored on device due to connection issues.",
        });
      } catch (localError) {
        console.error('Failed to store recording locally:', localError);
      }
    }
  };

  const setupRetryUpload = (incidentId: string, blob: Blob, fileName: string, recordingData: any) => {
    const retryInterval = setInterval(async () => {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('emergency-recordings')
          .upload(fileName, blob);

        if (!uploadError) {
          // Upload successful, clean up local storage
          localStorage.removeItem(`emergency_recording_${incidentId}`);
          localStorage.removeItem(`emergency_recording_meta_${incidentId}`);
          clearInterval(retryInterval);
          
          await logActivity('emergency', 'Offline recording uploaded successfully', { 
            incident_id: incidentId,
            file_path: uploadData.path 
          });

          toast({
            title: "Recording Uploaded",
            description: "Offline recording has been successfully uploaded.",
          });
        }
      } catch (retryError) {
        console.log('Retry upload failed, will try again...');
      }
    }, 30000); // Retry every 30 seconds

    // Stop retrying after 1 hour
    setTimeout(() => {
      clearInterval(retryInterval);
    }, 3600000);
  };

  const startEmergencyRecording = useCallback(async (incidentId: string) => {
    try {
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

        await logActivity('emergency', 'Emergency audio recording started (fallback)', { 
          incident_id: incidentId,
          recording_type: 'audio' 
        });

      } catch (audioError: any) {
        console.error('Error starting audio recording:', audioError);
        toast({
          title: "Recording Error",
          description: "Could not start emergency recording. Emergency alert will still be sent.",
          variant: "destructive",
        });
      }
    }
  }, [logActivity, toast]);

  return {
    isRecording,
    startEmergencyRecording
  };
};
