
import React, { useState } from 'react';
import { FileText, Plus, List } from 'lucide-react';
import IncidentReportForm from './IncidentReportForm';
import IncidentReportsList from './IncidentReportsList';

const IncidentReporting = () => {
  const [activeView, setActiveView] = useState('form');

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-6 h-6 text-emergency-600" />
          <h1 className="text-2xl font-bold text-gray-900">Incident Reporting</h1>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView('form')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'form'
                ? 'bg-emergency-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
          
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'list'
                ? 'bg-emergency-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'form' ? <IncidentReportForm /> : <IncidentReportsList />}
    </div>
  );
};

export default IncidentReporting;
