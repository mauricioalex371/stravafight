import { supabase, isSupabaseReady } from '../../lib/supabase';
import { ChatMessage, DirectConversation } from '../../types';
import { StorageService } from '../storageService';
import { RealtimeChannel } from '@supabase/supabase-js';

export class MessagesService {
  private static realtimeChannels: Map<string, RealtimeChannel> = new Map();

  /**
   * Obter ou criar conversa entre dois usuários
   */
  static async getOrCreateConversation(userId1: string, userId2: string): Promise<string | null> {
    if (userId1 === userId2) {
      console.warn('[MessagesService] Não é possível criar conversa consigo mesmo');
      return null;
    }

    if (!isSupabaseReady()) {
      console.warn('[MessagesService] Supabase não configurado');
      return `conv_${userId1}_${userId2}`;
    }

    try {
      // Verificar se conversa já existe
      const { data: existingConv, error: searchError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .or(`user_id.eq.${userId1},user_id.eq.${userId2}`)
        .limit(100);

      if (searchError) {
        console.error('[MessagesService] Erro ao buscar conversa:', searchError);
        return null;
      }

      // Agrupar por conversation_id e contar participantes
      const conversationCounts = new Map<string, Set<string>>();
      (existingConv || []).forEach((row: any) => {
        if (!conversationCounts.has(row.conversation_id)) {
          conversationCounts.set(row.conversation_id, new Set());
        }
      });

      // Buscar participantes de cada conversa candidata
      const conversationIds = Array.from(conversationCounts.keys());
      if (conversationIds.length > 0) {
        const { data: allParticipants, error: partError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, user_id')
          .in('conversation_id', conversationIds);

        if (!partError && allParticipants) {
          allParticipants.forEach((row: any) => {
            conversationCounts.get(row.conversation_id)?.add(row.user_id);
          });

          // Procurar conversa que tem exatamente os 2 usuários
          for (const [convId, participants] of conversationCounts.entries()) {
            if (
              participants.size === 2 &&
              participants.has(userId1) &&
              participants.has(userId2)
            ) {
              return convId;
            }
          }
        }
      }

      // Conversa não existe, criar nova
      const conversationId = crypto.randomUUID();

      const { error: createError } = await supabase
        .from('conversations')
        .insert({
          id: conversationId,
          type: 'DIRECT',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('[MessagesService] Erro ao criar conversa:', createError);
        return null;
      }

      // Adicionar participantes
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: userId1, joined_at: new Date().toISOString() },
          { conversation_id: conversationId, user_id: userId2, joined_at: new Date().toISOString() }
        ]);

      if (participantsError) {
        console.error('[MessagesService] Erro ao adicionar participantes:', participantsError);
        // Tentar limpar conversa criada
        await supabase.from('conversations').delete().eq('id', conversationId);
        return null;
      }

      return conversationId;
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao criar/buscar conversa:', err);
      return null;
    }
  }

  /**
   * Enviar mensagem
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    text?: string,
    mediaUrl?: string
  ): Promise<{ success: boolean; message?: ChatMessage }> {
    if (!text?.trim() && !mediaUrl) {
      return { success: false };
    }

    if (!isSupabaseReady()) {
      console.warn('[MessagesService] Supabase não configurado - usando fallback');
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId,
        text: text?.trim() || '',
        mediaUrl,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      return { success: true, message };
    }

    try {
      const messageId = crypto.randomUUID();

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          conversation_id: conversationId,
          sender_id: senderId,
          text: text?.trim() || null,
          media_url: mediaUrl || null,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('[MessagesService] Erro ao enviar mensagem:', insertError);
        return { success: false };
      }

      // Atualizar timestamp da conversa
      await supabase.rpc('update_conversation_timestamp', { conversation_id: conversationId });

      const message: ChatMessage = {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        text: data.text || '',
        mediaUrl: data.media_url,
        timestamp: data.created_at,
        isRead: data.is_read
      };

      return { success: true, message };
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao enviar mensagem:', err);
      return { success: false };
    }
  }

  /**
   * Obter mensagens de uma conversa (paginado)
   */
  static async getConversationMessages(
    conversationId: string,
    page: number = 0,
    pageSize: number = 50
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    if (!isSupabaseReady()) {
      return { messages: [], hasMore: false };
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[MessagesService] Erro ao buscar mensagens:', error);
        return { messages: [], hasMore: false };
      }

      const messages: ChatMessage[] = (data || []).map((row: any) => ({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        text: row.text || '',
        mediaUrl: row.media_url,
        timestamp: row.created_at,
        isRead: row.is_read
      }));

      // Retornar em ordem cronológica (mais antiga primeiro)
      messages.reverse();

      return {
        messages,
        hasMore: count ? to + 1 < count : messages.length === pageSize
      };
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao buscar mensagens:', err);
      return { messages: [], hasMore: false };
    }
  }

  /**
   * Obter lista de conversas de um usuário
   */
  static async getUserConversations(
    userId: string,
    page: number = 0,
    pageSize: number = 30
  ): Promise<{ conversations: DirectConversation[]; hasMore: boolean }> {
    if (!isSupabaseReady()) {
      return { conversations: [], hasMore: false };
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      // Buscar IDs das conversas do usuário
      const { data: participantData, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (partError || !participantData || participantData.length === 0) {
        return { conversations: [], hasMore: false };
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      // Buscar conversas com última atualização
      const { data: convData, error: convError, count } = await supabase
        .from('conversations')
        .select('*', { count: 'exact' })
        .in('id', conversationIds)
        .order('updated_at', { ascending: false })
        .range(from, to);

      if (convError || !convData) {
        console.error('[MessagesService] Erro ao buscar conversas:', convError);
        return { conversations: [], hasMore: false };
      }

      // Para cada conversa, buscar o outro participante e última mensagem
      const conversations: DirectConversation[] = await Promise.all(
        convData.map(async (conv: any) => {
          // Buscar participantes
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id);

          const otherUserId = participants?.find(p => p.user_id !== userId)?.user_id;

          // Buscar dados do outro usuário
          const { data: otherUser } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Buscar última mensagem
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Contar não lidas (do outro usuário para mim)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', userId);

          return {
            id: conv.id,
            otherUser: {
              id: otherUser?.id || '',
              name: otherUser?.full_name || 'Usuário',
              username: otherUser?.username || 'usuario',
              avatar: otherUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
            },
            tab: 'primary' as const,
            unreadCount: unreadCount || 0,
            lastMessage: {
              text: lastMsg?.text || '',
              timestamp: lastMsg?.created_at || conv.updated_at,
              senderId: lastMsg?.sender_id || '',
              isRead: lastMsg?.is_read || false
            }
          };
        })
      );

      return {
        conversations,
        hasMore: count ? to + 1 < count : conversations.length === pageSize
      };
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao buscar conversas:', err);
      return { conversations: [], hasMore: false };
    }
  }

  /**
   * Marcar mensagem como lida
   */
  static async markMessageAsRead(messageId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      return false;
    }

    try {
      // Apenas marcar se a mensagem não foi enviada pelo próprio usuário
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .neq('sender_id', userId);

      if (error) {
        console.error('[MessagesService] Erro ao marcar mensagem como lida:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao marcar mensagem como lida:', err);
      return false;
    }
  }

  /**
   * Marcar todas mensagens de uma conversa como lidas
   */
  static async markConversationAsRead(conversationId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', userId);

      if (error) {
        console.error('[MessagesService] Erro ao marcar conversa como lida:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao marcar conversa como lida:', err);
      return false;
    }
  }

  /**
   * Obter contagem de mensagens não lidas de uma conversa
   */
  static async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    if (!isSupabaseReady()) {
      return 0;
    }

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', userId);

      if (error) {
        console.error('[MessagesService] Erro ao contar não lidas:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao contar não lidas:', err);
      return 0;
    }
  }

  /**
   * Obter contagem total de mensagens não lidas (todas conversas)
   */
  static async getTotalUnreadCount(userId: string): Promise<number> {
    if (!isSupabaseReady()) {
      return 0;
    }

    try {
      // Buscar conversas do usuário
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (!participantData || participantData.length === 0) {
        return 0;
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      // Contar não lidas
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', userId);

      if (error) {
        console.error('[MessagesService] Erro ao contar total de não lidas:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao contar total de não lidas:', err);
      return 0;
    }
  }

  /**
   * Deletar uma mensagem (apenas o sender pode deletar)
   */
  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId);

      if (error) {
        console.error('[MessagesService] Erro ao deletar mensagem:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[MessagesService] Erro inesperado ao deletar mensagem:', err);
      return false;
    }
  }

  // ========================================
  // REALTIME - Subscrição de mensagens
  // ========================================

  /**
   * Subscrever às mensagens de uma conversa em tempo real
   */
  static subscribeToConversation(
    conversationId: string,
    onNewMessage: (message: ChatMessage) => void
  ): (() => void) | null {
    if (!isSupabaseReady()) {
      console.warn('[MessagesService] Realtime não disponível sem Supabase');
      return null;
    }

    try {
      const channelKey = `messages:${conversationId}`;

      // Limpar subscription anterior se existir
      if (this.realtimeChannels.has(channelKey)) {
        this.realtimeChannels.get(channelKey)?.unsubscribe();
        this.realtimeChannels.delete(channelKey);
      }

      const channel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload: any) => {
            const newRow = payload.new;

            const message: ChatMessage = {
              id: newRow.id,
              conversationId: newRow.conversation_id,
              senderId: newRow.sender_id,
              text: newRow.text || '',
              mediaUrl: newRow.media_url,
              timestamp: newRow.created_at,
              isRead: newRow.is_read
            };

            onNewMessage(message);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.info(`[MessagesService] Realtime conectado: ${conversationId}`);
          } else if (status === 'CLOSED') {
            console.info(`[MessagesService] Realtime desconectado: ${conversationId}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`[MessagesService] Erro no canal Realtime: ${conversationId}`);
          }
        });

      this.realtimeChannels.set(channelKey, channel);

      // Retornar função de cleanup
      return () => {
        const ch = this.realtimeChannels.get(channelKey);
        if (ch) {
          ch.unsubscribe();
          this.realtimeChannels.delete(channelKey);
        }
      };
    } catch (err) {
      console.error('[MessagesService] Erro ao configurar Realtime:', err);
      return null;
    }
  }

  /**
   * Limpar todas as subscriptions ativas
   */
  static unsubscribeAll(): void {
    this.realtimeChannels.forEach(channel => {
      channel.unsubscribe();
    });
    this.realtimeChannels.clear();
    console.info('[MessagesService] Todas subscriptions limpas');
  }
}
