
import React, { useState, useRef } from 'react';
import { Video, Square, Play, Pause, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VideoRecorderProps {
  incidentId?: string;
  onRecordingComplete?: (recordingData: any) => void;
}

const VideoRecorder = ({ incidentId, onRecordingComplete }: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        setIsPreview(true);
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(videoBlob);
        setVideoURL(url);
        setIsPreview(false);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Video Recording Started",
        description: "Video recording is now active.",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Video Recording Stopped",
        description: "Video recording has been saved.",
      });
    }
  };

  const playRecording = () => {
    if (videoURL && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const uploadRecording = async () => {
    if (!videoURL || !incidentId) return;

    setUploading(true);
    try {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const fileName = `${Date.now()}_video.webm`;
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) throw new Error('Not authenticated');

      const filePath = `${user.user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filePath, videoBlob);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('recordings')
        .insert({
          incident_id: incidentId,
          user_id: user.user.id,
          file_path: filePath,
          file_type: 'video',
          file_size: videoBlob.size,
          duration_seconds: Math.round((videoRef.current?.duration || 0))
        });

      if (dbError) throw dbError;

      toast({
        title: "Video Uploaded",
        description: "Video evidence has been saved securely.",
      });

      if (onRecordingComplete) {
        onRecordingComplete({ type: 'video', path: filePath });
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Video Recording</h3>
      
      <div className="space-y-4">
        {isPreview && (
          <video
            ref={previewRef}
            autoPlay
            muted
            className="w-full rounded-lg bg-black"
            style={{ maxHeight: '300px' }}
          />
        )}
        
        {videoURL && !isPreview && (
          <video
            ref={videoRef}
            src={videoURL}
            onEnded={() => setIsPlaying(false)}
            className="w-full rounded-lg"
            style={{ maxHeight: '300px' }}
            controls
          />
        )}

        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-emergency-600 hover:bg-emergency-700 text-white p-4 rounded-full transition-all duration-200"
            >
              <Video className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full transition-all duration-200 animate-pulse"
            >
              <Square className="w-6 h-6" />
            </button>
          )}
          
          {videoURL && !isPreview && (
            <>
              <button
                onClick={playRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-all duration-200"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              
              {incidentId && (
                <button
                  onClick={uploadRecording}
                  disabled={uploading}
                  className="bg-safe-600 hover:bg-safe-700 text-white p-4 rounded-full transition-all duration-200 disabled:opacity-50"
                >
                  <Upload className="w-6 h-6" />
                </button>
              )}
            </>
          )}
        </div>

        {isRecording && (
          <div className="text-center">
            <div className="text-emergency-600 font-medium">Recording video...</div>
            <div className="flex items-center justify-center space-x-1 mt-2">
              <div className="w-2 h-2 bg-emergency-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emergency-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-emergency-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
