/**
 * STREAMS SERVICE
 * Gerenciamento de transmissões autorizadas (lutas, eventos ao vivo)
 */

import { supabase } from './supabaseClient';
import type { AuthorizedStream, StreamChatMessage } from '../types';

export class StreamsService {
  // ==========================================
  // STREAMS
  // ==========================================

  static async getStreams(filters?: {
    status?: 'SCHEDULED' | 'LIVE' | 'ENDED';
    modality?: string;
    upcoming_only?: boolean;
  }): Promise<AuthorizedStream[]> {
    try {
      let query = supabase.from('authorized_streams').select('*');

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.modality) query = query.eq('modality', filters.modality);
      if (filters?.upcoming_only) {
        query = query.gte('event_date', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('event_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching streams:', error);
      return [];
    }
  }

  static async getStreamBySlug(slug: string): Promise<AuthorizedStream | null> {
    try {
      const { data, error } = await supabase
        .from('authorized_streams')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Incrementar visualizações
      await supabase
        .from('authorized_streams')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);

      return data;
    } catch (error) {
      console.error('Error fetching stream:', error);
      return null;
    }
  }

  static async logStreamAccess(streamId: string, userId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stream_access_logs')
        .insert({
          stream_id: streamId,
          user_id: userId || null
        });

      return !error;
    } catch (error) {
      console.error('Error logging stream access:', error);
      return false;
    }
  }

  // ==========================================
  // CHAT DE TRANSMISSÃO
  // ==========================================

  static async getChatMessages(
    streamId: string,
    limit: number = 100
  ): Promise<StreamChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('stream_chat_messages')
        .select(`
          *,
          user:profiles(username, full_name, avatar_url)
        `)
        .eq('stream_id', streamId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || [])
        .reverse()
        .map((msg: any) => ({
          ...msg,
          user_name: msg.user?.full_name || msg.user?.username || '',
          user_avatar: msg.user?.avatar_url || ''
        }));
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  static async sendChatMessage(
    streamId: string,
    userId: string,
    message: string
  ): Promise<StreamChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('stream_chat_messages')
        .insert({
          stream_id: streamId,
          user_id: userId,
          message: message.trim()
        })
        .select(`
          *,
          user:profiles(username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        user_name: data.user?.full_name || '',
        user_avatar: data.user?.avatar_url || ''
      };
    } catch (error) {
      console.error('Error sending chat message:', error);
      return null;
    }
  }

  static async deleteChatMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stream_chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error deleting chat message:', error);
      return false;
    }
  }

  // ==========================================
  // PLAYER EMBED
  // ==========================================

  static getEmbedUrl(stream: AuthorizedStream): string {
    switch (stream.stream_provider) {
      case 'YOUTUBE':
        // Extrai video ID do URL
        const youtubeId = this.extractYouTubeId(stream.stream_url);
        return youtubeId
          ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
          : stream.stream_url;

      case 'TWITCH':
        // Formato: https://player.twitch.tv/?channel=CHANNEL&parent=stravafight.com.br
        return stream.stream_url;

      case 'VIMEO':
        const vimeoId = this.extractVimeoId(stream.stream_url);
        return vimeoId
          ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1`
          : stream.stream_url;

      case 'IFRAME_EMBED':
        return stream.stream_url;

      case 'CUSTOM_HLS':
        // HLS stream - precisa de player compatível (ex: video.js)
        return stream.stream_url;

      default:
        return stream.stream_url;
    }
  }

  private static extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  private static extractVimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }

  // ==========================================
  // VERIFICAÇÃO DE ACESSO
  // ==========================================

  static canAccessStream(stream: AuthorizedStream, userHasSubscription: boolean): boolean {
    // Stream gratuito
    if (stream.is_free) return true;

    // Requer assinatura
    if (stream.requires_subscription && userHasSubscription) return true;

    // Outras regras de acesso podem ser implementadas aqui
    // (ex: comprou ingresso, está na lista VIP, etc)

    return false;
  }
}
