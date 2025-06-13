
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmergencyCountdownProps {
  countdown: number;
  onCancel: () => void;
}

const EmergencyCountdown = ({ countdown, onCancel }: EmergencyCountdownProps) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div className="w-48 h-48 rounded-full bg-emergency-600 flex items-center justify-center animate-pulse-emergency">
          <div className="text-center text-white">
            <AlertTriangle className="w-16 h-16 mx-auto mb-2" />
            <div className="text-4xl font-bold">{countdown}</div>
            <div className="text-sm">Sending Alert...</div>
          </div>
        </div>
      </div>
      
      <button
        onClick={onCancel}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
      >
        Cancel Alert
      </button>
    </div>
  );
};

export default EmergencyCountdown;
