
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmergencySOSButtonProps {
  onPress: () => void;
  isRecording: boolean;
}

const EmergencySOSButton = ({ onPress, isRecording }: EmergencySOSButtonProps) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <button
        onClick={onPress}
        className="w-48 h-48 rounded-full bg-gradient-to-br from-emergency-500 to-emergency-700 shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center group"
        aria-label="Emergency SOS Button"
      >
        <div className="text-center text-white">
          <AlertTriangle className="w-16 h-16 mx-auto mb-2 group-hover:animate-shake" />
          <div className="text-xl font-bold">SOS</div>
          <div className="text-sm opacity-90">Tap for Help</div>
        </div>
      </button>
      
      {isRecording && (
        <div className="flex items-center space-x-2 bg-emergency-100 text-emergency-800 px-4 py-2 rounded-full">
          <div className="w-3 h-3 bg-emergency-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Emergency Recording Active</span>
        </div>
      )}
      
      <div className="text-center text-gray-600 max-w-sm">
        <p className="text-sm">
          Press the SOS button to send an emergency alert to your contacts, share your location, and start automatic recording.
        </p>
      </div>
    </div>
  );
};

export default EmergencySOSButton;
