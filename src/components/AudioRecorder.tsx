
import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AudioRecorderProps {
  incidentId?: string;
  onRecordingComplete?: (recordingData: any) => void;
}

const AudioRecorder = ({ incidentId, onRecordingComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Audio recording is now active.",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Audio recording has been saved.",
      });
    }
  };

  const playRecording = () => {
    if (audioURL && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const uploadRecording = async () => {
    if (!audioURL || !incidentId) return;

    setUploading(true);
    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const fileName = `${Date.now()}_audio.webm`;
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) throw new Error('Not authenticated');

      const filePath = `${user.user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('recordings')
        .insert({
          incident_id: incidentId,
          user_id: user.user.id,
          file_path: filePath,
          file_type: 'audio',
          file_size: audioBlob.size,
          duration_seconds: Math.round((audioRef.current?.duration || 0))
        });

      if (dbError) throw dbError;

      toast({
        title: "Recording Uploaded",
        description: "Audio evidence has been saved securely.",
      });

      if (onRecordingComplete) {
        onRecordingComplete({ type: 'audio', path: filePath });
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
      <h3 className="text-lg font-bold text-gray-900 mb-4">Audio Recording</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-emergency-600 hover:bg-emergency-700 text-white p-4 rounded-full transition-all duration-200"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full transition-all duration-200 animate-pulse"
            >
              <Square className="w-6 h-6" />
            </button>
          )}
          
          {audioURL && (
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

        {audioURL && (
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            className="w-full"
            controls
          />
        )}

        {isRecording && (
          <div className="text-center">
            <div className="text-emergency-600 font-medium">Recording in progress...</div>
            <div className="w-4 h-4 bg-emergency-500 rounded-full mx-auto mt-2 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
