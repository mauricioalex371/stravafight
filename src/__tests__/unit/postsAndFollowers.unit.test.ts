/**
 * TESTES UNITÁRIOS - Posts CRUD e isFollowing
 * 
 * Valida comportamento de updatePost, deletePost e isFollowing
 * com cenários de sucesso, falha, não autorizado e erros do Supabase.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock do Supabase
const mockSelect = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockIn = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockRange = vi.fn().mockReturnThis();
const mockSingle = vi.fn();
const mockRpc = vi.fn();

const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: mockSelect,
    update: mockUpdate,
    delete: mockDelete,
    insert: mockInsert,
    eq: mockEq,
    in: mockIn,
    order: mockOrder,
    range: mockRange,
    single: mockSingle,
  })),
  rpc: mockRpc,
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabaseClient,
  isSupabaseReady: vi.fn(() => true),
}));

describe('Posts CRUD - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updatePost()', () => {
    it('deve atualizar post com campos permitidos', async () => {
      mockUpdate.mockReturnThis();
      mockEq.mockResolvedValue({ data: null, error: null });

      const { DbService } = await import('../../services/supabase/dbService');

      const result = await DbService.updatePost('post-123', {
        caption: 'Nova legenda',
        hashtags: ['#bjj', '#training'],
        location: 'São Paulo',
      });

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Nova legenda',
          hashtags: ['#bjj', '#training'],
          location: 'São Paulo',
          updated_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'post-123');
    });

    it('deve ignorar campos não permitidos (author_id, likes_count)', async () => {
      mockUpdate.mockReturnThis();
      mockEq.mockResolvedValue({ data: null, error: null });

      const { DbService } = await import('../../services/supabase/dbService');

      // Tentativa de alterar campos não permitidos
      const maliciousUpdate = {
        caption: 'Legenda',
        authorId: 'hacker-user-id', // Tentativa (não será incluído no update)
      };

      const result = await DbService.updatePost('post-123', maliciousUpdate);

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: 'Legenda',
          updated_at: expect.any(String),
        })
      );
      // Não deve incluir author_id
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall).not.toHaveProperty('author_id');
      expect(updateCall).not.toHaveProperty('likes_count');
    });

    it('deve retornar false quando Supabase retorna erro', async () => {
      mockUpdate.mockReturnThis();
      mockEq.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      const { DbService } = await import('../../services/supabase/dbService');

      const result = await DbService.updatePost('post-123', {
        caption: 'Nova legenda',
      });

      expect(result).toBe(false);
    });

    it('deve retornar false quando ocorre exceção', async () => {
      mockUpdate.mockImplementation(() => {
        throw new Error('Network error');
      });

      const { DbService } = await import('../../services/supabase/dbService');

      const result = await DbService.updatePost('post-123', {
        caption: 'Nova legenda',
      });

      expect(result).toBe(false);
    });
  });

  describe('deletePost()', () => {
    it('deve deletar post do autor correto', async () => {
      mockDelete.mockReturnThis();
      mockEq.mockReturnThis();
      mockSelect.mockResolvedValue({
        data: [{ id: 'post-123' }],
        error: null,
      });
      mockRpc.mockResolvedValue({ data: null, error: null });

      const { DbService } = await import('../../services/supabase/dbService');

      const result = await DbService.deletePost('post-123', 'user-456');

      expect(result).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'post-123');
      expect(mockEq).toHaveBeenCalledWith('author_id', 'user-456');
      // NOTE: posts_count RPC not implemented yet
    });

    it('deve retornar false quando nenhuma linha é deletada (não autorizado)', async () => {
      mockDelete.mockReturnThis();
      mockEq.mockReturnThis();
      mockSelect.mockResolvedValue({
        data: [], // Nenhuma linha afetada
        error: null,
      });

      const { DbService } = await import('../../services/supabase/dbService');

      const result = await DbService.deletePost('post-123', 'wrong-user-id');

      expect(result).toBe(false);
      // NOTE: posts_count RPC not called when delete fails
    });

    it('deve retornar false quando Supabase retorna erro', async () => {
      mockDelete.mockReturnThis();
      mockEq.mockReturnThis();
      mockSelect.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied', code: '403' },
      });

      const { DbService } = await import('../../services/supabase/dbService');

      const result = await DbService.deletePost('post-123', 'user-456');

      expect(result).toBe(false);
      // NOTE: posts_count RPC not called when error occurs
    });

    it('deve retornar false quando ocorre exceção', async () => {
      mockDelete.mockImplementation(() => {
        throw new Error('Network error');
      });

      const { DbService } = await import('../../services/supabase/dbService');

      const result = await DbService.deletePost('post-123', 'user-456');

      expect(result).toBe(false);
    });
  });
});

describe('FollowersService - isFollowing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkMultipleFollows()', () => {
    it('deve retornar Map com status correto de follows', async () => {
      mockSelect.mockReturnThis();
      mockEq.mockReturnThis();
      mockIn.mockResolvedValue({
        data: [
          { following_id: 'user-1' },
          { following_id: 'user-3' },
        ],
        error: null,
      });

      const { FollowersService } = await import(
        '../../services/supabase/followersService'
      );

      const result = await FollowersService.checkMultipleFollows('current-user', [
        'user-1',
        'user-2',
        'user-3',
        'user-4',
      ]);

      expect(result.get('user-1')).toBe(true);
      expect(result.get('user-2')).toBe(false);
      expect(result.get('user-3')).toBe(true);
      expect(result.get('user-4')).toBe(false);
      expect(result.size).toBe(4);
    });

    it('deve retornar todos false quando não segue ninguém', async () => {
      mockSelect.mockReturnThis();
      mockEq.mockReturnThis();
      mockIn.mockResolvedValue({
        data: [], // Não segue ninguém
        error: null,
      });

      const { FollowersService } = await import(
        '../../services/supabase/followersService'
      );

      const result = await FollowersService.checkMultipleFollows('current-user', [
        'user-1',
        'user-2',
      ]);

      expect(result.get('user-1')).toBe(false);
      expect(result.get('user-2')).toBe(false);
    });

    it('deve retornar todos false quando Supabase retorna erro', async () => {
      mockSelect.mockReturnThis();
      mockEq.mockReturnThis();
      mockIn.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: '500' },
      });

      const { FollowersService } = await import(
        '../../services/supabase/followersService'
      );

      const result = await FollowersService.checkMultipleFollows('current-user', [
        'user-1',
        'user-2',
      ]);

      expect(result.get('user-1')).toBe(false);
      expect(result.get('user-2')).toBe(false);
    });

    it('deve retornar Map vazio quando array de IDs está vazio', async () => {
      const { FollowersService } = await import(
        '../../services/supabase/followersService'
      );

      const result = await FollowersService.checkMultipleFollows('current-user', []);

      expect(result.size).toBe(0);
    });
  });

  describe('getFollowers() com isFollowing', () => {
    it('deve retornar seguidores sem verificar isFollowing quando currentUserId não fornecido', async () => {
      mockSelect.mockReturnThis();
      mockEq.mockReturnThis();
      mockOrder.mockReturnThis();
      mockRange.mockResolvedValue({
        data: [
          {
            follower_id: 'follower-1',
            follower: {
              id: 'follower-1',
              username: 'joao_fighter',
              full_name: 'João Silva',
              avatar_url: 'https://example.com/avatar.jpg',
              bio: 'BJJ Black Belt',
              role: 'Atleta',
              is_verified: true,
              followers_count: 150,
            },
          },
        ],
        error: null,
        count: 1,
      });

      const { FollowersService } = await import(
        '../../services/supabase/followersService'
      );

      const result = await FollowersService.getFollowers('user-123');

      expect(result.users).toHaveLength(1);
      expect(result.users[0].isFollowing).toBe(false); // Não verificado
    });

    it('deve verificar isFollowing quando currentUserId fornecido', async () => {
      // Mock do primeiro select (getFollowers)
      mockSelect.mockReturnThis();
      mockEq.mockReturnThis();
      mockOrder.mockReturnThis();
      mockRange.mockResolvedValueOnce({
        data: [
          {
            follower_id: 'follower-1',
            follower: {
              id: 'follower-1',
              username: 'joao_fighter',
              full_name: 'João Silva',
              avatar_url: null,
              bio: null,
              role: 'Atleta',
              is_verified: false,
              followers_count: 100,
            },
          },
        ],
        error: null,
        count: 1,
      });

      // Mock do segundo select (checkMultipleFollows)
      mockIn.mockResolvedValueOnce({
        data: [{ following_id: 'follower-1' }],
        error: null,
      });

      const { FollowersService } = await import(
        '../../services/supabase/followersService'
      );

      const result = await FollowersService.getFollowers(
        'user-123',
        'current-user'
      );

      expect(result.users).toHaveLength(1);
      expect(result.users[0].isFollowing).toBe(true); // Verificado e confirmado
    });
  });
});
