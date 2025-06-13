
import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';

interface Alert {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'safe';
  title: string;
  message: string;
  timestamp: Date;
  location?: string;
  acknowledged?: boolean;
}

const AlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'emergency',
      title: 'Emergency Alert Triggered',
      message: 'SOS signal was sent to your emergency contacts at 2:30 PM',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      location: 'Main St & 5th Ave',
      acknowledged: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'High Crime Area Detected',
      message: 'You are entering an area with increased safety concerns',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: 'Downtown District'
    },
    {
      id: '3',
      type: 'safe',
      title: 'Safe Zone Entered',
      message: 'You have entered a designated safe zone',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      location: 'University Campus'
    }
  ]);

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-6 h-6 text-emergency-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-warning-600" />;
      case 'safe':
        return <CheckCircle className="w-6 h-6 text-safe-600" />;
      default:
        return <Bell className="w-6 h-6 text-blue-600" />;
    }
  };

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'border-emergency-200 bg-emergency-50';
      case 'warning':
        return 'border-warning-200 bg-warning-50';
      case 'safe':
        return 'border-safe-200 bg-safe-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-emergency-600" />
            <h2 className="text-xl font-bold text-gray-900">Alert Center</h2>
            {unacknowledgedCount > 0 && (
              <span className="bg-emergency-600 text-white text-xs px-2 py-1 rounded-full">
                {unacknowledgedCount}
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {alerts.length} total alerts
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-2 rounded-lg p-4 transition-all duration-200 ${getAlertBorderColor(alert.type)} ${
                !alert.acknowledged ? 'shadow-md' : 'opacity-75'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 truncate">{alert.title}</h3>
                    {!alert.acknowledged && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-all duration-200"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-gray-400 hover:text-gray-600 transition-all duration-200"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{alert.message}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                    {alert.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{alert.location}</span>
                      </div>
                    )}
                    {alert.acknowledged && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-safe-500" />
                        <span>Acknowledged</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No alerts at this time.</p>
              <p className="text-sm text-gray-500 mt-1">You'll see safety alerts and notifications here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Alert Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Emergency Alerts</div>
              <div className="text-sm text-gray-600">Receive alerts for emergency situations</div>
            </div>
            <div className="w-12 h-6 bg-safe-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Location Alerts</div>
              <div className="text-sm text-gray-600">Get notified when entering high-risk areas</div>
            </div>
            <div className="w-12 h-6 bg-safe-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Sound Alerts</div>
              <div className="text-sm text-gray-600">Play sounds for important notifications</div>
            </div>
            <div className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertSystem;
