import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
}

export const useConversationMemory = () => {
  const [sessionId] = useState(() => {
    // Generate a unique session ID
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  });
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('message_index', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const messages = data.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          metadata: msg.metadata
        }));
        setConversationHistory(messages);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }, [sessionId]);

  const addMessage = useCallback(async (role: 'user' | 'assistant', content: string, metadata?: any) => {
    try {
      const newMessage = { role, content, metadata };
      const messageIndex = conversationHistory.length;

      // Add to local state immediately
      setConversationHistory(prev => [...prev, newMessage]);

      // Store in database
      const { data } = await supabase.auth.getUser();
      
      await supabase
        .from('conversation_history')
        .insert({
          user_id: data.user?.id || null,
          session_id: sessionId,
          message_index: messageIndex,
          role,
          content,
          metadata: metadata || {}
        });

    } catch (error) {
      console.error('Error saving message to history:', error);
    }
  }, [conversationHistory, sessionId]);

  const getRecentContext = useCallback((maxMessages: number = 10): ConversationMessage[] => {
    return conversationHistory.slice(-maxMessages);
  }, [conversationHistory]);

  const getContextSummary = useCallback((): string => {
    if (conversationHistory.length === 0) return '';

    const recentMessages = conversationHistory.slice(-6);
    const topics = new Set<string>();

    recentMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (content.includes('dining') || content.includes('food')) topics.add('dining');
      if (content.includes('event')) topics.add('events');
      if (content.includes('building') || content.includes('location')) topics.add('buildings');
      if (content.includes('course') || content.includes('class')) topics.add('courses');
      if (content.includes('parking')) topics.add('parking');
    });

    if (topics.size === 0) return '';

    return `Previous conversation topics: ${Array.from(topics).join(', ')}`;
  }, [conversationHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await supabase
        .from('conversation_history')
        .delete()
        .eq('session_id', sessionId);

      setConversationHistory([]);
    } catch (error) {
      console.error('Error clearing conversation history:', error);
    }
  }, [sessionId]);

  return {
    sessionId,
    conversationHistory,
    addMessage,
    getRecentContext,
    getContextSummary,
    clearHistory
  };
};