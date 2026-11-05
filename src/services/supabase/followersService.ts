import { supabase, isSupabaseReady } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { StorageService } from '../storageService';

// ============================================================================
// TIPOS
// ============================================================================

export interface FollowerUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  role?: string;
  isVerified: boolean;
  followersCount: number;
  isFollowing?: boolean;
}

// Tipos do Supabase para queries tipadas
type SupabaseProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  is_verified: boolean;
  followers_count: number;
};

interface SupabaseFollowerRow {
  follower_id: string;
  follower: SupabaseProfile | null;
}

interface SupabaseFollowingRow {
  following_id: string;
  following: SupabaseProfile | null;
}

interface SupabaseFollowCheckRow {
  following_id: string;
}

export class FollowersService {
  /**
   * Seguir um usuário
   */
  static async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      console.warn('[FollowersService] Não é possível seguir a si mesmo');
      return false;
    }

    if (!isSupabaseReady()) {
      console.warn('[FollowersService] Supabase não configurado - usando fallback');
      const currentUser = StorageService.getCurrentUser();
      if (currentUser.id === followerId) {
        currentUser.followingCount++;
        StorageService.saveCurrentUser(currentUser);
      }
      return true;
    }

    try {
      // Inserir relação de follow
      // NOTA: Contadores são atualizados automaticamente via trigger (migration 00015)
      const { error: insertError } = await supabase
        .from('user_followers')
        .insert({ 
          follower_id: followerId, 
          following_id: followingId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        // Se erro for duplicação, já está seguindo (ignorar)
        if (insertError.code === '23505') {
          console.info('[FollowersService] Já está seguindo este usuário');
          return true;
        }
        console.error('[FollowersService] Erro ao seguir usuário:', insertError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[FollowersService] Erro inesperado ao seguir:', err);
      return false;
    }
  }

  /**
   * Deixar de seguir um usuário
   */
  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      console.warn('[FollowersService] Supabase não configurado - usando fallback');
      const currentUser = StorageService.getCurrentUser();
      if (currentUser.id === followerId) {
        currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
        StorageService.saveCurrentUser(currentUser);
      }
      return true;
    }

    try {
      // Deletar relação de follow
      // NOTA: Contadores são atualizados automaticamente via trigger (migration 00015)
      const { error: deleteError } = await supabase
        .from('user_followers')
        .delete()
        .match({ follower_id: followerId, following_id: followingId });

      if (deleteError) {
        console.error('[FollowersService] Erro ao deixar de seguir:', deleteError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[FollowersService] Erro inesperado ao deixar de seguir:', err);
      return false;
    }
  }

  /**
   * Verificar se um usuário está seguindo outro
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      return false; // Fallback simples
    }

    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('follower_id')
        .match({ follower_id: followerId, following_id: followingId })
        .maybeSingle();

      if (error) {
        console.error('[FollowersService] Erro ao verificar follow:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('[FollowersService] Erro inesperado ao verificar follow:', err);
      return false;
    }
  }

  /**
   * Obter lista de seguidores de um usuário (paginado)
   * Agora inclui verificação real de isFollowing para cada seguidor
   */
  static async getFollowers(
    userId: string,
    currentUserId?: string,
    page: number = 0,
    pageSize: number = 50
  ): Promise<{ users: FollowerUser[]; hasMore: boolean }> {
    if (!isSupabaseReady()) {
      return { users: [], hasMore: false };
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await supabase
        .from('user_followers')
        .select(`
          follower_id,
          follower:profiles!user_followers_follower_id_fkey(
            id, username, full_name, avatar_url, bio, role, is_verified, followers_count
          )
        `, { count: 'exact' })
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[FollowersService] Erro ao buscar seguidores:', error);
        return { users: [], hasMore: false };
      }

      let users: FollowerUser[] = (data || [])
        .filter((row: unknown): row is { follower_id: string; follower: SupabaseProfile } => {
          if (typeof row !== 'object' || row === null) return false;
          const r = row as Record<string, unknown>;
          const follower = r.follower as Record<string, unknown> | null;
          return follower !== null && follower !== undefined && typeof follower === 'object';
        })
        .map((row) => {
          const f = row.follower as unknown as SupabaseProfile;
          return {
            id: f.id,
            username: f.username,
            fullName: f.full_name,
            avatarUrl: f.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            bio: f.bio || undefined,
            role: f.role,
            isVerified: f.is_verified || false,
            followersCount: f.followers_count || 0,
            isFollowing: false
          };
        });

      // Se currentUserId fornecido, verificar quem o usuário atual segue
      if (currentUserId && users.length > 0) {
        const followerIds = users.map(u => u.id);
        const followMap = await this.checkMultipleFollows(currentUserId, followerIds);
        
        users = users.map(user => ({
          ...user,
          isFollowing: followMap.get(user.id) || false
        }));
      }

      return {
        users,
        hasMore: count ? to + 1 < count : users.length === pageSize
      };
    } catch (err) {
      console.error('[FollowersService] Erro inesperado ao buscar seguidores:', err);
      return { users: [], hasMore: false };
    }
  }

  /**
   * Obter lista de usuários que um usuário está seguindo (paginado)
   * isFollowing sempre true pois são users que o userId segue
   */
  static async getFollowing(
    userId: string,
    page: number = 0,
    pageSize: number = 50
  ): Promise<{ users: FollowerUser[]; hasMore: boolean }> {
    if (!isSupabaseReady()) {
      return { users: [], hasMore: false };
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await supabase
        .from('user_followers')
        .select(`
          following_id,
          following:profiles!user_followers_following_id_fkey(
            id, username, full_name, avatar_url, bio, role, is_verified, followers_count
          )
        `, { count: 'exact' })
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[FollowersService] Erro ao buscar seguindo:', error);
        return { users: [], hasMore: false };
      }

      const users: FollowerUser[] = (data || [])
        .filter((row: unknown): row is { following_id: string; following: SupabaseProfile } => {
          if (typeof row !== 'object' || row === null) return false;
          const r = row as Record<string, unknown>;
          const following = r.following as Record<string, unknown> | null;
          return following !== null && following !== undefined && typeof following === 'object';
        })
        .map((row) => {
          const f = row.following as unknown as SupabaseProfile;
          return {
            id: f.id,
            username: f.username,
            fullName: f.full_name,
            avatarUrl: f.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            bio: f.bio || undefined,
            role: f.role,
            isVerified: f.is_verified || false,
            followersCount: f.followers_count || 0,
            isFollowing: true // Always true - these are users that userId follows
          };
        });

      return {
        users,
        hasMore: count ? to + 1 < count : users.length === pageSize
      };
    } catch (err) {
      console.error('[FollowersService] Erro inesperado ao buscar seguindo:', err);
      return { users: [], hasMore: false };
    }
  }

  /**
   * Obter contadores de um perfil (followers/following)
   */
  static async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    if (!isSupabaseReady()) {
      const user = StorageService.getCurrentUser();
      return {
        followers: user.id === userId ? user.followersCount : 0,
        following: user.id === userId ? user.followingCount : 0
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('followers_count, following_count')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[FollowersService] Erro ao buscar contadores:', error);
        return { followers: 0, following: 0 };
      }

      return {
        followers: data.followers_count || 0,
        following: data.following_count || 0
      };
    } catch (err) {
      console.error('[FollowersService] Erro inesperado ao buscar contadores:', err);
      return { followers: 0, following: 0 };
    }
  }

  /**
   * Verificar múltiplos follows de uma vez (otimização para feed)
   */
  static async checkMultipleFollows(
    followerId: string,
    userIds: string[]
  ): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();

    if (!isSupabaseReady()) {
      userIds.forEach(id => result.set(id, false));
      return result;
    }

    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', followerId)
        .in('following_id', userIds);

      if (error) {
        console.error('[FollowersService] Erro ao verificar múltiplos follows:', error);
        userIds.forEach(id => result.set(id, false));
        return result;
      }

      // Inicializa todos como false
      userIds.forEach(id => result.set(id, false));

      // Marca os que estão sendo seguidos
      (data || []).forEach((row) => {
        if ('following_id' in row && typeof row.following_id === 'string') {
          result.set(row.following_id, true);
        }
      });

      return result;
    } catch (err) {
      console.error('[FollowersService] Erro inesperado ao verificar múltiplos follows:', err);
      userIds.forEach(id => result.set(id, false));
      return result;
    }
  }

  /**
   * Buscar sugestões de pessoas para seguir
   */
  static async getSuggestedUsers(
    userId: string,
    limit: number = 20
  ): Promise<FollowerUser[]> {
    if (!isSupabaseReady()) {
      return [];
    }

    try {
      // Buscar usuários que os amigos seguem mas o usuário atual não segue
      // Simplificado: buscar usuários populares que o usuário não segue
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, role, is_verified, followers_count')
        .neq('id', userId)
        .order('followers_count', { ascending: false })
        .limit(limit * 2); // Buscar mais para filtrar

      if (error) {
        console.error('[FollowersService] Erro ao buscar sugestões:', error);
        return [];
      }

      // Verificar quais o usuário já segue
      const userIds = data.map((u: any) => u.id);
      const followMap = await this.checkMultipleFollows(userId, userIds);

      // Filtrar apenas os que NÃO está seguindo
      const suggestions: FollowerUser[] = data
        .filter((u: any) => !followMap.get(u.id))
        .slice(0, limit)
        .map((u: any) => ({
          id: u.id,
          username: u.username,
          fullName: u.full_name,
          avatarUrl: u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          bio: u.bio,
          role: u.role,
          isVerified: u.is_verified || false,
          followersCount: u.followers_count || 0,
          isFollowing: false
        }));

      return suggestions;
    } catch (err) {
      console.error('[FollowersService] Erro inesperado ao buscar sugestões:', err);
      return [];
    }
  }
}
