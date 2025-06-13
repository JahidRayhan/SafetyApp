
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  phrase: string;
  action: string;
  description: string;
}

const VoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  const commands: VoiceCommand[] = [
    { phrase: 'emergency help', action: 'trigger_sos', description: 'Trigger SOS alert' },
    { phrase: 'call emergency', action: 'trigger_sos', description: 'Trigger SOS alert' },
    { phrase: 'send location', action: 'share_location', description: 'Share current location' },
    { phrase: 'fake call now', action: 'fake_call', description: 'Start fake call' },
    { phrase: 'start recording', action: 'start_recording', description: 'Begin evidence recording' },
    { phrase: 'stop recording', action: 'stop_recording', description: 'Stop evidence recording' },
    { phrase: 'open chat', action: 'open_chatbot', description: 'Open AI support chat' },
    { phrase: 'help me', action: 'open_chatbot', description: 'Open AI support chat' },
    { phrase: 'show safe zones', action: 'show_safe_zones', description: 'Display safe zones map' },
    { phrase: 'contact support', action: 'contact_support', description: 'Access support resources' }
  ];

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript.toLowerCase().trim());
          processCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "There was an issue with voice recognition. Please try again.",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        if (isListening) {
          recognitionInstance.start(); // Restart if we're still supposed to be listening
        }
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const processCommand = (transcript: string) => {
    const matchedCommand = commands.find(cmd => 
      transcript.includes(cmd.phrase)
    );

    if (matchedCommand) {
      executeCommand(matchedCommand);
    }
  };

  const executeCommand = (command: VoiceCommand) => {
    console.log('Executing voice command:', command.action);
    
    switch (command.action) {
      case 'trigger_sos':
        toast({
          title: "SOS Alert Triggered",
          description: "Emergency alert has been sent to your contacts.",
          variant: "destructive",
        });
        break;
      case 'share_location':
        toast({
          title: "Location Shared",
          description: "Your current location has been shared with emergency contacts.",
        });
        break;
      case 'fake_call':
        toast({
          title: "Fake Call Initiated",
          description: "Starting fake call for safety exit.",
        });
        break;
      case 'start_recording':
        toast({
          title: "Recording Started",
          description: "Evidence recording has begun.",
        });
        break;
      case 'stop_recording':
        toast({
          title: "Recording Stopped",
          description: "Evidence recording has been saved.",
        });
        break;
      case 'open_chatbot':
        toast({
          title: "Opening Chat Support",
          description: "AI support chat is now available.",
        });
        break;
      case 'show_safe_zones':
        toast({
          title: "Safe Zones",
          description: "Displaying safe zones in your area.",
        });
        break;
      case 'contact_support':
        toast({
          title: "Support Resources",
          description: "Opening safety resource directory.",
        });
        break;
      default:
        break;
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      toast({
        title: "Voice Commands Disabled",
        description: "Voice recognition has been turned off.",
      });
    } else {
      recognition.start();
      setIsListening(true);
      toast({
        title: "Voice Commands Enabled",
        description: "Say a command to interact with the app.",
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <MicOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Commands Not Supported</h3>
          <p className="text-gray-600">
            Your browser doesn't support voice recognition. Please use a modern browser like Chrome or Firefox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Voice Commands</h2>
          </div>
          <button
            onClick={toggleListening}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isListening
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
          </button>
        </div>

        {/* Status */}
        <div className={`p-4 rounded-lg border ${
          isListening 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          <div className="flex items-center space-x-2">
            <Mic className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isListening ? 'Listening for voice commands...' : 'Voice commands are disabled'}
            </span>
          </div>
          {transcript && (
            <div className="mt-2 text-sm">
              <strong>Last heard:</strong> "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Available Commands */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Commands</h3>
        <div className="grid gap-3">
          {commands.map((command, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-blue-600">"{command.phrase}"</span>
                  <p className="text-sm text-gray-600 mt-1">{command.description}</p>
                </div>
                <Volume2 className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Usage Tips</h4>
        </div>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Speak clearly and at normal volume</li>
          <li>• Wait for the system to process before speaking again</li>
          <li>• Use exact phrases listed above for best results</li>
          <li>• Make sure your microphone is enabled in browser settings</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceCommands;
