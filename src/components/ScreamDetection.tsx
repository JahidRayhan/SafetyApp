
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ScreamDetectionProps {
  isActive: boolean;
  onDetection: () => void;
}

const ScreamDetection = ({ isActive, onDetection }: ScreamDetectionProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isActive) return;

    let mediaRecorder: MediaRecorder | null = null;
    let audioContext: AudioContext | null = null;

    const startDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const detectScream = () => {
          if (!isActive) return;
          
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          
          // Scream detection threshold (adjust as needed)
          if (average > 150) {
            console.log('Potential distress detected:', average);
            onDetection();
          }
          
          if (isActive) {
            requestAnimationFrame(detectScream);
          }
        };
        
        detectScream();
        
      } catch (error) {
        console.error('Error starting scream detection:', error);
      }
    };

    startDetection();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isActive, onDetection]);

  // This component runs in the background - no UI
  return null;
};

export default ScreamDetection;
