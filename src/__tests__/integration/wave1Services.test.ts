/**
 * WAVE 1 SERVICES - Testes de Integração
 * 
 * Testes para validar os 5 services implementados na Wave 1:
 * - LikesService
 * - CommentsService
 * - FollowersService
 * - NotificationsService
 * - MessagesService
 * 
 * NOTA: Estes testes requerem Supabase configurado.
 * Em modo de desenvolvimento (sem Supabase), os services usam fallback para LocalStorage.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { LikesService } from '../../services/supabase/likesService';
import { CommentsService } from '../../services/supabase/commentsService';
import { FollowersService } from '../../services/supabase/followersService';
import { NotificationsService } from '../../services/supabase/notificationsService';
import { MessagesService } from '../../services/supabase/messagesService';
import { isSupabaseReady } from '../../lib/supabase';

describe('Wave 1 Services - Integration Tests', () => {
  const testUserId1 = 'test-user-1';
  const testUserId2 = 'test-user-2';
  const testPostId = 'test-post-1';

  beforeAll(() => {
    if (!isSupabaseReady()) {
      console.warn('⚠️  Supabase não configurado. Testes usarão fallback (comportamento limitado).');
    } else {
      console.log('✅ Supabase configurado. Executando testes de integração reais.');
    }
  });

  describe('LikesService', () => {
    it('should export LikesService class', () => {
      expect(LikesService).toBeDefined();
      expect(typeof LikesService.likePost).toBe('function');
      expect(typeof LikesService.unlikePost).toBe('function');
      expect(typeof LikesService.hasUserLiked).toBe('function');
      expect(typeof LikesService.getPostLikes).toBe('function');
      expect(typeof LikesService.getPostLikesCount).toBe('function');
      expect(typeof LikesService.checkMultipleLikes).toBe('function');
    });

    it('should handle likePost (mock test)', async () => {
      // Teste básico de estrutura - sem DB real
      const result = await LikesService.likePost(testPostId, testUserId1);
      expect(typeof result).toBe('boolean');
    });

    it('should handle hasUserLiked (mock test)', async () => {
      const result = await LikesService.hasUserLiked(testPostId, testUserId1);
      expect(typeof result).toBe('boolean');
    });

    it('should handle getPostLikes (mock test)', async () => {
      const result = await LikesService.getPostLikes(testPostId);
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.users)).toBe(true);
    });

    it('should handle checkMultipleLikes (mock test)', async () => {
      const result = await LikesService.checkMultipleLikes(['post1', 'post2'], testUserId1);
      expect(result instanceof Map).toBe(true);
    });
  });

  describe('CommentsService', () => {
    it('should export CommentsService class', () => {
      expect(CommentsService).toBeDefined();
      expect(typeof CommentsService.createComment).toBe('function');
      expect(typeof CommentsService.getPostComments).toBe('function');
      expect(typeof CommentsService.deleteComment).toBe('function');
      expect(typeof CommentsService.getPostCommentsCount).toBe('function');
      expect(typeof CommentsService.editComment).toBe('function');
    });

    it('should handle createComment (mock test)', async () => {
      const result = await CommentsService.createComment(testPostId, testUserId1, 'Teste');
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle getPostComments (mock test)', async () => {
      const result = await CommentsService.getPostComments(testPostId);
      expect(result).toHaveProperty('comments');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.comments)).toBe(true);
    });

    it('should reject empty comments', async () => {
      const result = await CommentsService.createComment(testPostId, testUserId1, '   ');
      expect(result.success).toBe(false);
    });
  });

  describe('FollowersService', () => {
    it('should export FollowersService class', () => {
      expect(FollowersService).toBeDefined();
      expect(typeof FollowersService.followUser).toBe('function');
      expect(typeof FollowersService.unfollowUser).toBe('function');
      expect(typeof FollowersService.isFollowing).toBe('function');
      expect(typeof FollowersService.getFollowers).toBe('function');
      expect(typeof FollowersService.getFollowing).toBe('function');
      expect(typeof FollowersService.getFollowCounts).toBe('function');
      expect(typeof FollowersService.checkMultipleFollows).toBe('function');
      expect(typeof FollowersService.getSuggestedUsers).toBe('function');
    });

    it('should handle followUser (mock test)', async () => {
      const result = await FollowersService.followUser(testUserId1, testUserId2);
      expect(typeof result).toBe('boolean');
    });

    it('should prevent self-follow', async () => {
      const result = await FollowersService.followUser(testUserId1, testUserId1);
      expect(result).toBe(false);
    });

    it('should handle isFollowing (mock test)', async () => {
      const result = await FollowersService.isFollowing(testUserId1, testUserId2);
      expect(typeof result).toBe('boolean');
    });

    it('should handle getFollowers (mock test)', async () => {
      const result = await FollowersService.getFollowers(testUserId1);
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.users)).toBe(true);
    });

    it('should handle getFollowCounts (mock test)', async () => {
      const result = await FollowersService.getFollowCounts(testUserId1);
      expect(result).toHaveProperty('followers');
      expect(result).toHaveProperty('following');
      expect(typeof result.followers).toBe('number');
      expect(typeof result.following).toBe('number');
    });
  });

  describe('NotificationsService', () => {
    it('should export NotificationsService class', () => {
      expect(NotificationsService).toBeDefined();
      expect(typeof NotificationsService.createNotification).toBe('function');
      expect(typeof NotificationsService.getUserNotifications).toBe('function');
      expect(typeof NotificationsService.markAsRead).toBe('function');
      expect(typeof NotificationsService.markAllAsRead).toBe('function');
      expect(typeof NotificationsService.getUnreadCount).toBe('function');
      expect(typeof NotificationsService.deleteNotification).toBe('function');
      expect(typeof NotificationsService.subscribeToNotifications).toBe('function');
      expect(typeof NotificationsService.notifyLike).toBe('function');
      expect(typeof NotificationsService.notifyComment).toBe('function');
      expect(typeof NotificationsService.notifyFollow).toBe('function');
    });

    it('should handle createNotification (mock test)', async () => {
      const result = await NotificationsService.createNotification({
        recipientId: testUserId2,
        type: 'LIKE',
        actorId: testUserId1,
        targetId: testPostId,
        text: 'curtiu sua publicação'
      });
      expect(typeof result).toBe('boolean');
    });

    it('should not notify self', async () => {
      const result = await NotificationsService.createNotification({
        recipientId: testUserId1,
        type: 'LIKE',
        actorId: testUserId1,
        text: 'teste'
      });
      // Deve retornar true mas não criar notificação
      expect(result).toBe(true);
    });

    it('should handle getUserNotifications (mock test)', async () => {
      const result = await NotificationsService.getUserNotifications(testUserId1);
      expect(result).toHaveProperty('notifications');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.notifications)).toBe(true);
    });

    it('should handle getUnreadCount (mock test)', async () => {
      const result = await NotificationsService.getUnreadCount(testUserId1);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should have helper notification methods', () => {
      expect(typeof NotificationsService.notifyLike).toBe('function');
      expect(typeof NotificationsService.notifyComment).toBe('function');
      expect(typeof NotificationsService.notifyFollow).toBe('function');
      expect(typeof NotificationsService.notifyMention).toBe('function');
      expect(typeof NotificationsService.notifyFriendRequest).toBe('function');
      expect(typeof NotificationsService.notifyFriendAccept).toBe('function');
    });
  });

  describe('MessagesService', () => {
    it('should export MessagesService class', () => {
      expect(MessagesService).toBeDefined();
      expect(typeof MessagesService.getOrCreateConversation).toBe('function');
      expect(typeof MessagesService.sendMessage).toBe('function');
      expect(typeof MessagesService.getConversationMessages).toBe('function');
      expect(typeof MessagesService.getUserConversations).toBe('function');
      expect(typeof MessagesService.markMessageAsRead).toBe('function');
      expect(typeof MessagesService.markConversationAsRead).toBe('function');
      expect(typeof MessagesService.getUnreadCount).toBe('function');
      expect(typeof MessagesService.getTotalUnreadCount).toBe('function');
      expect(typeof MessagesService.deleteMessage).toBe('function');
      expect(typeof MessagesService.subscribeToConversation).toBe('function');
      expect(typeof MessagesService.unsubscribeAll).toBe('function');
    });

    it('should handle getOrCreateConversation (mock test)', async () => {
      const result = await MessagesService.getOrCreateConversation(testUserId1, testUserId2);
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should prevent conversation with self', async () => {
      const result = await MessagesService.getOrCreateConversation(testUserId1, testUserId1);
      expect(result).toBe(null);
    });

    it('should handle sendMessage (mock test)', async () => {
      const result = await MessagesService.sendMessage('conv_test', testUserId1, 'Teste');
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('should reject empty messages', async () => {
      const result = await MessagesService.sendMessage('conv_test', testUserId1, '   ');
      expect(result.success).toBe(false);
    });

    it('should handle getUserConversations (mock test)', async () => {
      const result = await MessagesService.getUserConversations(testUserId1);
      expect(result).toHaveProperty('conversations');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.conversations)).toBe(true);
    });

    it('should handle getTotalUnreadCount (mock test)', async () => {
      const result = await MessagesService.getTotalUnreadCount(testUserId1);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration - Services working together', () => {
    it('should allow like + notification workflow (structure test)', async () => {
      // Teste de estrutura - verifica se os métodos podem ser encadeados
      const likeResult = await LikesService.likePost(testPostId, testUserId1);
      expect(typeof likeResult).toBe('boolean');

      const notifyResult = await NotificationsService.notifyLike(testUserId2, testUserId1, testPostId);
      expect(typeof notifyResult).toBe('boolean');
    });

    it('should allow comment + notification workflow (structure test)', async () => {
      const commentResult = await CommentsService.createComment(testPostId, testUserId1, 'Ótimo!');
      expect(commentResult).toHaveProperty('success');

      const notifyResult = await NotificationsService.notifyComment(testUserId2, testUserId1, testPostId);
      expect(typeof notifyResult).toBe('boolean');
    });

    it('should allow follow + notification workflow (structure test)', async () => {
      const followResult = await FollowersService.followUser(testUserId1, testUserId2);
      expect(typeof followResult).toBe('boolean');

      const notifyResult = await NotificationsService.notifyFollow(testUserId2, testUserId1);
      expect(typeof notifyResult).toBe('boolean');
    });

    it('should allow message + conversation workflow (structure test)', async () => {
      const convId = await MessagesService.getOrCreateConversation(testUserId1, testUserId2);
      
      if (convId) {
        const messageResult = await MessagesService.sendMessage(convId, testUserId1, 'Olá!');
        expect(messageResult).toHaveProperty('success');
      }
      
      expect(convId === null || typeof convId === 'string').toBe(true);
    });
  });

  describe('Realtime capabilities', () => {
    it('should have notification subscription method', () => {
      expect(typeof NotificationsService.subscribeToNotifications).toBe('function');
    });

    it('should have message subscription method', () => {
      expect(typeof MessagesService.subscribeToConversation).toBe('function');
      expect(typeof MessagesService.unsubscribeAll).toBe('function');
    });

    it('should return null or cleanup function from subscriptions when Supabase not ready', () => {
      if (!isSupabaseReady()) {
        const notifUnsub = NotificationsService.subscribeToNotifications('user-id', () => {});
        expect(notifUnsub).toBe(null);

        const msgUnsub = MessagesService.subscribeToConversation('conv-id', () => {});
        expect(msgUnsub).toBe(null);
      }
    });
  });
});
