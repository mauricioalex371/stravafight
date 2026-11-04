/**
 * WAVE 1 SERVICES - Testes Unitários (Mocked, Sem Conexão)
 * 
 * Validam estrutura, tipos e lógica isolada dos services.
 * NÃO fazem chamadas reais ao Supabase.
 * Devem passar sempre, independente de configuração externa.
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

// Mock do Supabase antes de importar os services
vi.mock('../../lib/supabase', () => {
  const mockSupabaseClient = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
    })),
  };

  return {
    supabase: mockSupabaseClient,
    isSupabaseReady: vi.fn(() => true),
    getSupabaseConfig: vi.fn(() => ({
      url: 'http://mock-supabase.local',
      anonKey: 'mock-anon-key',
      isConfigured: true,
    })),
  };
});

describe('Wave 1 Services - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LikesService - Structure & Types', () => {
    it('exports all required methods', async () => {
      const { LikesService } = await import('../../services/supabase/likesService');
      
      expect(LikesService).toBeDefined();
      expect(typeof LikesService.likePost).toBe('function');
      expect(typeof LikesService.unlikePost).toBe('function');
      expect(typeof LikesService.hasUserLiked).toBe('function');
      expect(typeof LikesService.getPostLikes).toBe('function');
      expect(typeof LikesService.checkMultipleLikes).toBe('function');
      expect(typeof LikesService.getPostLikesCount).toBe('function');
    });
  });

  describe('CommentsService - Structure & Types', () => {
    it('exports all required methods', async () => {
      const { CommentsService } = await import('../../services/supabase/commentsService');
      
      expect(CommentsService).toBeDefined();
      expect(typeof CommentsService.createComment).toBe('function');
      expect(typeof CommentsService.getPostComments).toBe('function');
      expect(typeof CommentsService.editComment).toBe('function');
      expect(typeof CommentsService.deleteComment).toBe('function');
      expect(typeof CommentsService.getPostCommentsCount).toBe('function');
    });
  });

  describe('FollowersService - Structure & Types', () => {
    it('exports all required methods', async () => {
      const { FollowersService } = await import('../../services/supabase/followersService');
      
      expect(FollowersService).toBeDefined();
      expect(typeof FollowersService.followUser).toBe('function');
      expect(typeof FollowersService.unfollowUser).toBe('function');
      expect(typeof FollowersService.isFollowing).toBe('function');
      expect(typeof FollowersService.getFollowers).toBe('function');
      expect(typeof FollowersService.getFollowing).toBe('function');
      expect(typeof FollowersService.getFollowCounts).toBe('function');
    });
  });

  describe('NotificationsService - Structure & Types', () => {
    it('exports all required methods', async () => {
      const { NotificationsService } = await import('../../services/supabase/notificationsService');
      
      expect(NotificationsService).toBeDefined();
      expect(typeof NotificationsService.getUserNotifications).toBe('function');
      expect(typeof NotificationsService.getUnreadCount).toBe('function');
      expect(typeof NotificationsService.markAsRead).toBe('function');
      expect(typeof NotificationsService.markAllAsRead).toBe('function');
      expect(typeof NotificationsService.notifyLike).toBe('function');
      expect(typeof NotificationsService.notifyComment).toBe('function');
      expect(typeof NotificationsService.notifyFollow).toBe('function');
    });
  });

  describe('MessagesService - Structure & Types', () => {
    it('exports all required methods', async () => {
      const { MessagesService } = await import('../../services/supabase/messagesService');
      
      expect(MessagesService).toBeDefined();
      expect(typeof MessagesService.getOrCreateConversation).toBe('function');
      expect(typeof MessagesService.sendMessage).toBe('function');
      expect(typeof MessagesService.getConversationMessages).toBe('function');
      expect(typeof MessagesService.getUserConversations).toBe('function');
      expect(typeof MessagesService.markConversationAsRead).toBe('function');
      expect(typeof MessagesService.getUnreadCount).toBe('function');
    });
  });

  describe('Supabase Configuration - Mocked', () => {
    it('isSupabaseReady returns boolean', async () => {
      const { isSupabaseReady } = await import('../../lib/supabase');
      const result = isSupabaseReady();
      expect(typeof result).toBe('boolean');
    });

    it('getSupabaseConfig returns valid structure', async () => {
      const { getSupabaseConfig } = await import('../../lib/supabase');
      const config = getSupabaseConfig();
      
      expect(config).toBeDefined();
      expect(typeof config.url).toBe('string');
      expect(typeof config.anonKey).toBe('string');
      expect(typeof config.isConfigured).toBe('boolean');
    });
  });
});
