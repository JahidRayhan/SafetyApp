
import React, { useState } from 'react';
import AudioRecorder from './AudioRecorder';
import VideoRecorder from './VideoRecorder';
import { Mic, Video, FileText } from 'lucide-react';

interface RecordingPanelProps {
  incidentId?: string;
  onRecordingComplete?: (recordingData: any) => void;
}

const RecordingPanel = ({ incidentId, onRecordingComplete }: RecordingPanelProps) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');

  const tabs = [
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'video', label: 'Video', icon: Video },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-emergency-600" />
          <h2 className="text-xl font-bold text-gray-900">Evidence Recording</h2>
        </div>

        <div className="flex space-x-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'audio' | 'video')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emergency-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'audio' && (
          <AudioRecorder 
            incidentId={incidentId} 
            onRecordingComplete={onRecordingComplete}
          />
        )}
        
        {activeTab === 'video' && (
          <VideoRecorder 
            incidentId={incidentId} 
            onRecordingComplete={onRecordingComplete}
          />
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Evidence Collection Tips</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Record clear audio/video evidence of the situation</li>
          <li>• Speak clearly and describe what you're seeing</li>
          <li>• Keep recordings focused and relevant to the incident</li>
          <li>• All recordings are encrypted and stored securely</li>
        </ul>
      </div>
    </div>
  );
};

export default RecordingPanel;
