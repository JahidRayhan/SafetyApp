
import React from 'react';
import { Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  response: string | null;
  created_at: string;
  conversation_id: string;
  isUser?: boolean;
}

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.isUser;
  
  return (
    <div className="space-y-3">
      {/* User Message */}
      {isUser && (
        <div className="flex justify-end">
          <div className="bg-safe-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
            <div className="flex items-center space-x-2 mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">You</span>
            </div>
            <p className="text-sm">{message.message}</p>
          </div>
        </div>
      )}

      {/* Bot Response */}
      {!isUser && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
            <div className="flex items-center space-x-2 mb-1">
              <Bot className="w-4 h-4 text-safe-600" />
              <span className="text-sm font-medium text-safe-600">SafeGuard AI</span>
            </div>
            <p className="text-sm text-gray-700">{message.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
