
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConversationCollaborator } from "@/types/team";

export const useConversationCollaboration = (conversationId: string) => {
  const [collaborators, setCollaborators] = useState<ConversationCollaborator[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Fetch collaborators
  const fetchCollaborators = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('conversation_collaborators')
        .select(`
          *,
          user:usuarios!conversation_collaborators_user_id_fkey(nombre)
        `)
        .eq('conversation_id', conversationId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const formattedCollaborators: ConversationCollaborator[] = data?.map(collab => ({
        id: collab.id,
        conversation_id: collab.conversation_id,
        user_id: collab.user_id,
        role: (collab.role as 'primary' | 'collaborator' | 'observer') || 'observer',
        joined_at: collab.joined_at,
        last_seen: collab.last_seen || new Date().toISOString(),
        is_typing: collab.is_typing || false,
        user_name: collab.user?.nombre
      })) || [];

      setCollaborators(formattedCollaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  }, [conversationId]);

  // Join collaboration session
  const joinCollaboration = async (role: 'primary' | 'collaborator' | 'observer' = 'observer') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversation_collaborators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          role,
          last_seen: new Date().toISOString()
        });

      if (error) throw error;
      fetchCollaborators();
    } catch (error) {
      console.error('Error joining collaboration:', error);
    }
  };

  // Leave collaboration session
  const leaveCollaboration = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversation_collaborators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchCollaborators();
    } catch (error) {
      console.error('Error leaving collaboration:', error);
    }
  };

  // Update typing status
  const updateTypingStatus = async (typing: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('conversation_collaborators')
        .update({
          is_typing: typing,
          last_seen: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
      setIsTyping(typing);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`collaboration_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_collaborators',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchCollaborators();
        }
      )
      .subscribe();

    // Initial fetch
    fetchCollaborators();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchCollaborators]);

  // Handle typing indicators
  useEffect(() => {
    const typingCollaborators = collaborators
      .filter(collab => collab.is_typing)
      .map(collab => collab.user_name || 'Usuario')
      .filter(name => name);

    setTypingUsers(typingCollaborators);
  }, [collaborators]);

  return {
    collaborators,
    typingUsers,
    isTyping,
    joinCollaboration,
    leaveCollaboration,
    updateTypingStatus,
    fetchCollaborators
  };
};
