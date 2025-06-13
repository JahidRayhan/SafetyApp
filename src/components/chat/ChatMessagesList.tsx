
import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import ChatMessageComponent from './ChatMessage';

interface ChatMessage {
  id: string;
  message: string;
  response: string | null;
  created_at: string;
  conversation_id: string;
}

interface ChatMessagesListProps {
  messages: ChatMessage[];
}

const ChatMessagesList = ({ messages }: ChatMessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Hello! I'm your SafeGuard AI assistant. How can I help you today?</p>
        </div>
      )}
      
      {messages.map((msg) => (
        <ChatMessageComponent key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessagesList;
