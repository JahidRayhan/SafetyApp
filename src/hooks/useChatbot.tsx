
import { useState, useCallback } from 'react';
import { assistantService } from '@/features/support/services/assistantService';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  response: string | null;
  created_at: string;
  conversation_id: string;
  isUser?: boolean;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! I\'m your SafeGuard AI assistant. I can help you with safety tips, emergency procedures, and answer questions about the app.',
      response: '',
      created_at: new Date().toISOString(),
      conversation_id: 'initial',
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      response: '',
      created_at: new Date().toISOString(),
      conversation_id: 'user-conv',
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const reply = await assistantService.ask(message);

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: reply.text || 'I apologize, but I encountered an issue processing your message. Please try again.',
        response: reply.text,
        created_at: new Date().toISOString(),
        conversation_id: 'bot-conv',
        isUser: false
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Add error response
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'I\'m having trouble connecting right now. As a SafeGuard assistant, I can help with:\n\n• Emergency procedures and safety tips\n• How to use app features like SOS alerts\n• Setting up emergency contacts\n• Location sharing guidance\n• General safety advice\n\nPlease try your question again, or contact support if the issue persists.',
        response: '',
        created_at: new Date().toISOString(),
        conversation_id: 'error-conv',
        isUser: false
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection Issue",
        description: "Having trouble connecting to the assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    messages,
    isLoading,
    sendMessage
  };
};
