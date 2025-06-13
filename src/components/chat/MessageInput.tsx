
import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput = ({ onSendMessage, isLoading }: MessageInputProps) => {
  const [currentMessage, setCurrentMessage] = useState('');

  const handleSend = () => {
    if (!currentMessage.trim()) return;
    onSendMessage(currentMessage.trim());
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!currentMessage.trim() || isLoading}
          className="bg-safe-600 hover:bg-safe-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Your conversations are saved and encrypted for your privacy and safety.
      </div>
    </div>
  );
};

export default MessageInput;
