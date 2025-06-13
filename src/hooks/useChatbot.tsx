
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  message: string;
  response: string | null;
  created_at: string;
  conversation_id: string;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setMessages(data);
        setConversationId(data[0].conversation_id || generateConversationId());
      } else {
        setConversationId(generateConversationId());
      }
    } catch (error: any) {
      console.error('Error loading chat history:', error);
    }
  };

  const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || !user) return;

    setIsLoading(true);

    // Add user message to local state immediately
    const newTempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      message: userMessage,
      response: null,
      created_at: new Date().toISOString(),
      conversation_id: conversationId
    };
    
    setMessages(prev => [...prev, newTempMessage]);

    try {
      // Save message to database
      const { data: savedMessage, error: saveError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: userMessage,
          conversation_id: conversationId
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Call the chatbot function
      const { data: functionData, error: functionError } = await supabase.functions
        .invoke('chatbot-support', {
          body: { 
            message: userMessage,
            conversation_id: conversationId,
            user_id: user.id
          }
        });

      if (functionError) {
        throw new Error('Chatbot service temporarily unavailable. Please try again in a moment.');
      }

      const botResponse = functionData?.response || 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question.';

      // Update the message with the response
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({ response: botResponse })
        .eq('id', savedMessage.id);

      if (updateError) throw updateError;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === newTempMessage.id 
          ? { ...savedMessage, response: botResponse }
          : msg
      ));

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Update the temporary message with an error response
      setMessages(prev => prev.map(msg => 
        msg.id === newTempMessage.id 
          ? { ...msg, response: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment or contact support for assistance.' }
          : msg
      ));

      toast({
        title: "Connection Issue",
        description: "There was a problem connecting to the chatbot. Your message has been saved and we'll respond as soon as possible.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
};
