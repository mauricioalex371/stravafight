import { supabase, isSupabaseReady } from '../../lib/supabase';
import { StorageService } from '../storageService';

export interface PostLike {
  postId: string;
  userId: string;
  createdAt: string;
}

export interface LikeUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
}

export class LikesService {
  /**
   * Curtir um post
   */
  static async likePost(postId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      console.warn('[LikesService] Supabase não configurado - usando fallback');
      const posts = StorageService.getPosts();
      const post = posts.find(p => p.id === postId);
      if (post) {
        post.hasLiked = true;
        post.likesCount++;
        StorageService.savePosts(posts);
        return true;
      }
      return false;
    }

    try {
      // Inserir like
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });

      if (insertError) {
        // Se erro for duplicação, já está curtido (ignorar)
        if (insertError.code === '23505') {
          console.info('[LikesService] Post já está curtido');
          return true;
        }
        console.error('[LikesService] Erro ao curtir post:', insertError);
        return false;
      }

      // Incrementar contador atomicamente
      const { error: rpcError } = await supabase.rpc('increment_post_likes', { post_id: postId });
      
      if (rpcError) {
        console.error('[LikesService] Erro ao incrementar contador:', rpcError);
        // Reverter like se contador falhou
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId });
        return false;
      }

      return true;
    } catch (err) {
      console.error('[LikesService] Erro inesperado ao curtir:', err);
      return false;
    }
  }

  /**
   * Descurtir um post
   */
  static async unlikePost(postId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      console.warn('[LikesService] Supabase não configurado - usando fallback');
      const posts = StorageService.getPosts();
      const post = posts.find(p => p.id === postId);
      if (post && post.hasLiked) {
        post.hasLiked = false;
        post.likesCount = Math.max(0, post.likesCount - 1);
        StorageService.savePosts(posts);
        return true;
      }
      return false;
    }

    try {
      // Deletar like
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .match({ post_id: postId, user_id: userId });

      if (deleteError) {
        console.error('[LikesService] Erro ao descurtir post:', deleteError);
        return false;
      }

      // Decrementar contador atomicamente
      const { error: rpcError } = await supabase.rpc('decrement_post_likes', { post_id: postId });
      
      if (rpcError) {
        console.error('[LikesService] Erro ao decrementar contador:', rpcError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[LikesService] Erro inesperado ao descurtir:', err);
      return false;
    }
  }

  /**
   * Verificar se usuário curtiu um post
   */
  static async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      const posts = StorageService.getPosts();
      const post = posts.find(p => p.id === postId);
      return post?.hasLiked || false;
    }

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('user_id')
        .match({ post_id: postId, user_id: userId })
        .maybeSingle();

      if (error) {
        console.error('[LikesService] Erro ao verificar like:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('[LikesService] Erro inesperado ao verificar like:', err);
      return false;
    }
  }

  /**
   * Obter lista de usuários que curtiram um post (paginado)
   */
  static async getPostLikes(
    postId: string, 
    page: number = 0, 
    pageSize: number = 50
  ): Promise<{ users: LikeUser[]; hasMore: boolean }> {
    if (!isSupabaseReady()) {
      return { users: [], hasMore: false };
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await supabase
        .from('post_likes')
        .select(`
          user_id,
          profiles!inner(id, username, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[LikesService] Erro ao buscar likes:', error);
        return { users: [], hasMore: false };
      }

      const users: LikeUser[] = (data || []).map((row: any) => ({
        id: row.profiles.id,
        username: row.profiles.username,
        fullName: row.profiles.full_name,
        avatarUrl: row.profiles.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
      }));

      return {
        users,
        hasMore: count ? to + 1 < count : users.length === pageSize
      };
    } catch (err) {
      console.error('[LikesService] Erro inesperado ao buscar likes:', err);
      return { users: [], hasMore: false };
    }
  }

  /**
   * Obter contagem de likes de um post
   */
  static async getPostLikesCount(postId: string): Promise<number> {
    if (!isSupabaseReady()) {
      const posts = StorageService.getPosts();
      const post = posts.find(p => p.id === postId);
      return post?.likesCount || 0;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('[LikesService] Erro ao buscar contagem:', error);
        return 0;
      }

      return data?.likes_count || 0;
    } catch (err) {
      console.error('[LikesService] Erro inesperado ao buscar contagem:', err);
      return 0;
    }
  }

  /**
   * Verificar múltiplos posts de uma vez (otimização para feed)
   */
  static async checkMultipleLikes(
    postIds: string[], 
    userId: string
  ): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();

    if (!isSupabaseReady()) {
      const posts = StorageService.getPosts();
      postIds.forEach(postId => {
        const post = posts.find(p => p.id === postId);
        result.set(postId, post?.hasLiked || false);
      });
      return result;
    }

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds)
        .eq('user_id', userId);

      if (error) {
        console.error('[LikesService] Erro ao verificar múltiplos likes:', error);
        postIds.forEach(id => result.set(id, false));
        return result;
      }

      // Inicializa todos como false
      postIds.forEach(id => result.set(id, false));

      // Marca os que estão curtidos
      (data || []).forEach((row: any) => {
        result.set(row.post_id, true);
      });

      return result;
    } catch (err) {
      console.error('[LikesService] Erro inesperado ao verificar múltiplos likes:', err);
      postIds.forEach(id => result.set(id, false));
      return result;
    }
  }
}
