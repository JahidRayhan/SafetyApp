
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import ChatMessagesList from '@/components/chat/ChatMessagesList';
import MessageInput from '@/components/chat/MessageInput';

const ChatbotSupport = () => {
  const { messages, isLoading, sendMessage } = useChatbot();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-[600px] flex flex-col">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="w-6 h-6 text-safe-600" />
        <h2 className="text-xl font-bold text-gray-900">SafeGuard AI Assistant</h2>
      </div>

      <ChatMessagesList messages={messages} />
      <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatbotSupport;
