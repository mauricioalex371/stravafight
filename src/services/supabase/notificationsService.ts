import { supabase, isSupabaseReady } from '../../lib/supabase';
import { NotificationItem } from '../../types';
import { StorageService } from '../storageService';
import { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationType = 
  | 'LIKE'
  | 'COMMENT'
  | 'FOLLOW'
  | 'MENTION'
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPT'
  | 'CHALLENGE_RECEIVED'
  | 'CHALLENGE_ACCEPTED'
  | 'EVENT_INVITE'
  | 'POST_SHARE'
  | 'BADGE_EARNED';

export interface CreateNotificationParams {
  recipientId: string;
  type: NotificationType;
  actorId?: string;
  targetId?: string;
  text: string;
}

export class NotificationsService {
  private static realtimeChannel: RealtimeChannel | null = null;

  /**
   * Criar uma notificação
   */
  static async createNotification(params: CreateNotificationParams): Promise<boolean> {
    const { recipientId, type, actorId, targetId, text } = params;

    // Não notificar a si mesmo
    if (actorId && actorId === recipientId) {
      return true;
    }

    if (!isSupabaseReady()) {
      console.warn('[NotificationsService] Supabase não configurado - notificação não enviada');
      return false;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          actor_id: actorId || null,
          type,
          text,
          target_id: targetId || null,
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('[NotificationsService] Erro ao criar notificação:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[NotificationsService] Erro inesperado ao criar notificação:', err);
      return false;
    }
  }

  /**
   * Obter notificações de um usuário (paginado)
   */
  static async getUserNotifications(
    userId: string,
    page: number = 0,
    pageSize: number = 30
  ): Promise<{ notifications: NotificationItem[]; hasMore: boolean }> {
    if (!isSupabaseReady()) {
      return { notifications: [], hasMore: false };
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(
            id, username, full_name, avatar_url, is_verified
          )
        `, { count: 'exact' })
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[NotificationsService] Erro ao buscar notificações:', error);
        return { notifications: [], hasMore: false };
      }

      const notifications: NotificationItem[] = (data || []).map((row: any) => ({
        id: row.id,
        type: row.type as any,
        text: row.text,
        timestamp: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        targetId: row.target_id,
        actorName: row.actor?.full_name || 'Usuário',
        actorAvatar: row.actor?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        isRead: row.is_read
      }));

      return {
        notifications,
        hasMore: count ? to + 1 < count : notifications.length === pageSize
      };
    } catch (err) {
      console.error('[NotificationsService] Erro inesperado ao buscar notificações:', err);
      return { notifications: [], hasMore: false };
    }
  }

  /**
   * Marcar notificação como lida
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('recipient_id', userId); // Garantir que é do usuário

      if (error) {
        console.error('[NotificationsService] Erro ao marcar como lida:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[NotificationsService] Erro inesperado ao marcar como lida:', err);
      return false;
    }
  }

  /**
   * Marcar todas notificações como lidas
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('[NotificationsService] Erro ao marcar todas como lidas:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[NotificationsService] Erro inesperado ao marcar todas como lidas:', err);
      return false;
    }
  }

  /**
   * Obter contagem de notificações não lidas
   */
  static async getUnreadCount(userId: string): Promise<number> {
    if (!isSupabaseReady()) {
      return 0;
    }

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('[NotificationsService] Erro ao contar não lidas:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('[NotificationsService] Erro inesperado ao contar não lidas:', err);
      return 0;
    }
  }

  /**
   * Deletar uma notificação
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('recipient_id', userId);

      if (error) {
        console.error('[NotificationsService] Erro ao deletar notificação:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[NotificationsService] Erro inesperado ao deletar notificação:', err);
      return false;
    }
  }

  /**
   * Deletar todas notificações lidas
   */
  static async deleteAllRead(userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', userId)
        .eq('is_read', true);

      if (error) {
        console.error('[NotificationsService] Erro ao deletar notificações lidas:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[NotificationsService] Erro inesperado ao deletar notificações lidas:', err);
      return false;
    }
  }

  // ========================================
  // REALTIME - Subscrição de notificações
  // ========================================

  /**
   * Subscrever às notificações de um usuário em tempo real
   */
  static subscribeToNotifications(
    userId: string,
    onNewNotification: (notification: NotificationItem) => void
  ): (() => void) | null {
    if (!isSupabaseReady()) {
      console.warn('[NotificationsService] Realtime não disponível sem Supabase');
      return null;
    }

    try {
      // Limpar subscription anterior se existir
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
      }

      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          async (payload: any) => {
            const newRow = payload.new;

            // Buscar dados do actor
            let actorData = null;
            if (newRow.actor_id) {
              const { data } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, is_verified')
                .eq('id', newRow.actor_id)
                .single();
              actorData = data;
            }

            const notification: NotificationItem = {
              id: newRow.id,
              type: newRow.type,
              text: newRow.text,
              timestamp: new Date(newRow.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              targetId: newRow.target_id,
              actorName: actorData?.full_name || 'Usuário',
              actorAvatar: actorData?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
              isRead: newRow.is_read
            };

            onNewNotification(notification);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.info('[NotificationsService] Realtime conectado');
          } else if (status === 'CLOSED') {
            console.info('[NotificationsService] Realtime desconectado');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[NotificationsService] Erro no canal Realtime');
          }
        });

      this.realtimeChannel = channel;

      // Retornar função de cleanup
      return () => {
        if (this.realtimeChannel) {
          this.realtimeChannel.unsubscribe();
          this.realtimeChannel = null;
        }
      };
    } catch (err) {
      console.error('[NotificationsService] Erro ao configurar Realtime:', err);
      return null;
    }
  }

  // ========================================
  // HELPERS - Criação de notificações específicas
  // ========================================

  static async notifyLike(postAuthorId: string, likerUserId: string, postId: string): Promise<boolean> {
    return this.createNotification({
      recipientId: postAuthorId,
      type: 'LIKE',
      actorId: likerUserId,
      targetId: postId,
      text: 'curtiu sua publicação'
    });
  }

  static async notifyComment(postAuthorId: string, commenterId: string, postId: string): Promise<boolean> {
    return this.createNotification({
      recipientId: postAuthorId,
      type: 'COMMENT',
      actorId: commenterId,
      targetId: postId,
      text: 'comentou em sua publicação'
    });
  }

  static async notifyFollow(followedUserId: string, followerId: string): Promise<boolean> {
    return this.createNotification({
      recipientId: followedUserId,
      type: 'FOLLOW',
      actorId: followerId,
      text: 'começou a seguir você'
    });
  }

  static async notifyMention(mentionedUserId: string, mentionerId: string, postId: string): Promise<boolean> {
    return this.createNotification({
      recipientId: mentionedUserId,
      type: 'MENTION',
      actorId: mentionerId,
      targetId: postId,
      text: 'mencionou você em uma publicação'
    });
  }

  static async notifyFriendRequest(recipientId: string, senderId: string): Promise<boolean> {
    return this.createNotification({
      recipientId,
      type: 'FRIEND_REQUEST',
      actorId: senderId,
      text: 'enviou um pedido de amizade'
    });
  }

  static async notifyFriendAccept(recipientId: string, accepterId: string): Promise<boolean> {
    return this.createNotification({
      recipientId,
      type: 'FRIEND_ACCEPT',
      actorId: accepterId,
      text: 'aceitou seu pedido de amizade'
    });
  }
}
