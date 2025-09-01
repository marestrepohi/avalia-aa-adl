import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Assistant {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature: number;
  system_prompt: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  assistant_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const useAssistants = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAssistants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Assistant[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting assistants');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAssistant = useCallback(async (assistantData: Omit<Assistant, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('assistants')
        .insert({
          ...assistantData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as Assistant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating assistant');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAssistant = useCallback(async (id: string, updates: Partial<Assistant>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('assistants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Assistant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating assistant');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAssistant = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('assistants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting assistant');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getConversations = useCallback(async (assistantId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('assistant_id', assistantId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting conversations');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting messages');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    assistantId: string, 
    message: string, 
    conversationId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('chat-assistant', {
        body: {
          assistantId,
          message,
          conversationId,
          userId: user.id
        }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    getConversations,
    getMessages,
    sendMessage
  };
};