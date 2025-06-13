
import React, { useState, useEffect } from 'react';
import { FileText, MapPin, Camera, Mic, Video, User, UserX, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const IncidentReportForm = () => {
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationDescription, setLocationDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [severityLevel, setSeverityLevel] = useState(1);
  const [tags, setTags] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();

  const incidentTypes = [
    'harassment',
    'theft',
    'violence',
    'suspicious_activity',
    'vandalism',
    'domestic_violence',
    'sexual_assault',
    'stalking',
    'drug_activity',
    'other'
  ];

  const severityLabels = {
    1: 'Low',
    2: 'Moderate', 
    3: 'High',
    4: 'Severe',
    5: 'Critical'
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
          toast({
            title: "Location captured",
            description: "Your current location has been tagged to this report.",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          toast({
            title: "Location unavailable",
            description: "Unable to get your current location. You can manually enter location details.",
            variant: "destructive",
          });
        }
      );
    } else {
      setLocationLoading(false);
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    setMediaFiles(prev => [...prev, ...files]);
    toast({
      title: "Media attached",
      description: `${files.length} file(s) added to your report.`,
    });
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagAdd = (tag) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const reportData = {
        title,
        incident_type: incidentType,
        description,
        location_lat: location.lat,
        location_lng: location.lng,
        location_description: locationDescription,
        is_anonymous: isAnonymous,
        severity_level: severityLevel,
        tags,
        media_files: mediaFiles.map(file => ({ name: file.name, size: file.size, type: file.type })),
        user_id: isAnonymous ? null : user.user?.id
      };

      const { error } = await supabase
        .from('incident_reports')
        .insert(reportData);

      if (error) throw error;

      toast({
        title: "Report submitted successfully",
        description: "Your incident report has been submitted and will be reviewed by authorities.",
      });

      // Reset form
      setTitle('');
      setIncidentType('');
      setDescription('');
      setLocationDescription('');
      setIsAnonymous(false);
      setSeverityLevel(1);
      setTags([]);
      setMediaFiles([]);

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error submitting report",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <FileText className="w-6 h-6 text-emergency-600" />
        <h2 className="text-xl font-bold text-gray-900">Report an Incident</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to Report</h4>
        <p className="text-blue-800 text-sm">
          Fill out this form to report safety incidents in your area. Your report helps keep the community safe and informed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incident Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
            placeholder="Brief description of the incident"
            required
          />
        </div>

        {/* Incident Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incident Type *
          </label>
          <select
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
            required
          >
            <option value="">Select incident type</option>
            {incidentTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity Level
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverityLevel(level)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  severityLevel === level
                    ? 'bg-emergency-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level} - {severityLabels[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
            placeholder="Provide detailed information about the incident..."
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span>{locationLoading ? 'Getting location...' : 'Use current location'}</span>
            </button>
            
            {location.lat && location.lng && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            )}

            <input
              type="text"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
              placeholder="Describe the location (e.g., Near Central Park entrance, 5th Street)"
            />
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attach Media (Photos, Videos, Audio)
          </label>
          <div className="space-y-3">
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleMediaUpload}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-emergency-500 transition-colors"
            >
              <div className="text-center">
                <div className="flex justify-center space-x-2 mb-2">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <Video className="w-6 h-6 text-gray-400" />
                  <Mic className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-gray-600">Click to upload media files</span>
              </div>
            </label>

            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMediaFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Anonymous Reporting */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-emergency-600 border-gray-300 rounded focus:ring-emergency-500"
          />
          <label htmlFor="anonymous" className="flex items-center space-x-2 text-sm text-gray-700">
            {isAnonymous ? <UserX className="w-4 h-4" /> : <User className="w-4 h-4" />}
            <span>Submit anonymously</span>
          </label>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {['night_time', 'well_lit', 'crowded_area', 'isolated', 'public_transport', 'parking_lot'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagAdd(tag)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {tag.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-emergency-100 text-emergency-800 rounded-full text-sm"
                >
                  {tag.replace('_', ' ')}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-emergency-600 hover:text-emergency-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !title || !incidentType}
          className="w-full bg-emergency-600 hover:bg-emergency-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{loading ? 'Submitting Report...' : 'Submit Incident Report'}</span>
        </button>
      </form>
    </div>
  );
};

export default IncidentReportForm;
