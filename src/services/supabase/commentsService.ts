import { supabase, isSupabaseReady } from '../../lib/supabase';
import { PostComment } from '../../types';
import { StorageService } from '../storageService';

export class CommentsService {
  /**
   * Criar um comentário em um post
   */
  static async createComment(
    postId: string,
    authorId: string,
    text: string
  ): Promise<{ success: boolean; comment?: PostComment }> {
    if (!text.trim()) {
      return { success: false };
    }

    if (!isSupabaseReady()) {
      console.warn('[CommentsService] Supabase não configurado - usando fallback');
      const newComment: PostComment = {
        id: `cmt_${Date.now()}`,
        postId,
        authorUsername: 'usuario',
        authorName: 'Usuário',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        text: text.trim(),
        createdAt: new Date().toISOString(),
        likesCount: 0,
        hasLiked: false
      };

      const posts = StorageService.getPosts();
      const post = posts.find(p => p.id === postId);
      if (post) {
        post.comments = [newComment, ...(post.comments || [])];
        post.commentsCount++;
        StorageService.savePosts(posts);
      }

      return { success: true, comment: newComment };
    }

    try {
      // Buscar dados do autor
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', authorId)
        .single();

      if (authorError || !authorData) {
        console.error('[CommentsService] Erro ao buscar autor:', authorError);
        return { success: false };
      }

      // Criar comentário
      const commentId = crypto.randomUUID();
      const { data, error: insertError } = await supabase
        .from('post_comments')
        .insert({
          id: commentId,
          post_id: postId,
          author_id: authorId,
          text: text.trim(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('[CommentsService] Erro ao criar comentário:', insertError);
        return { success: false };
      }

      // Incrementar contador
      const { error: rpcError } = await supabase.rpc('increment_post_comments', { post_id: postId });
      
      if (rpcError) {
        console.error('[CommentsService] Erro ao incrementar contador:', rpcError);
        // Reverter comentário
        await supabase.from('post_comments').delete().eq('id', commentId);
        return { success: false };
      }

      const comment: PostComment = {
        id: data.id,
        postId: data.post_id,
        authorUsername: authorData.username,
        authorName: authorData.full_name,
        authorAvatar: authorData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        text: data.text,
        createdAt: data.created_at,
        likesCount: data.likes_count || 0,
        hasLiked: false
      };

      return { success: true, comment };
    } catch (err) {
      console.error('[CommentsService] Erro inesperado ao criar comentário:', err);
      return { success: false };
    }
  }

  /**
   * Obter comentários de um post (paginado)
   */
  static async getPostComments(
    postId: string,
    page: number = 0,
    pageSize: number = 50
  ): Promise<{ comments: PostComment[]; hasMore: boolean }> {
    if (!isSupabaseReady()) {
      const posts = StorageService.getPosts();
      const post = posts.find(p => p.id === postId);
      const comments = post?.comments || [];
      const from = page * pageSize;
      const slice = comments.slice(from, from + pageSize);
      return {
        comments: slice,
        hasMore: from + pageSize < comments.length
      };
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data, error, count } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles!inner(id, username, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('[CommentsService] Erro ao buscar comentários:', error);
        return { comments: [], hasMore: false };
      }

      const comments: PostComment[] = (data || []).map((row: any) => ({
        id: row.id,
        postId: row.post_id,
        authorUsername: row.author.username,
        authorName: row.author.full_name,
        authorAvatar: row.author.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        text: row.text,
        createdAt: row.created_at,
        likesCount: row.likes_count || 0,
        hasLiked: false // Comment likes feature planned for future wave
      }));

      return {
        comments,
        hasMore: count ? to + 1 < count : comments.length === pageSize
      };
    } catch (err) {
      console.error('[CommentsService] Erro inesperado ao buscar comentários:', err);
      return { comments: [], hasMore: false };
    }
  }

  /**
   * Deletar um comentário (apenas o autor ou admin pode deletar)
   */
  static async deleteComment(commentId: string, userId: string): Promise<boolean> {
    if (!isSupabaseReady()) {
      console.warn('[CommentsService] Supabase não configurado - usando fallback');
      const posts = StorageService.getPosts();
      let deleted = false;

      posts.forEach(post => {
        if (post.comments) {
          const initialLength = post.comments.length;
          post.comments = post.comments.filter(c => c.id !== commentId);
          if (post.comments.length < initialLength) {
            post.commentsCount = Math.max(0, post.commentsCount - 1);
            deleted = true;
          }
        }
      });

      if (deleted) {
        StorageService.savePosts(posts);
      }

      return deleted;
    }

    try {
      // Buscar post_id antes de deletar (para atualizar contador)
      const { data: commentData, error: fetchError } = await supabase
        .from('post_comments')
        .select('post_id, author_id')
        .eq('id', commentId)
        .single();

      if (fetchError || !commentData) {
        console.error('[CommentsService] Comentário não encontrado:', fetchError);
        return false;
      }

      // Verificar se é o autor
      if (commentData.author_id !== userId) {
        console.error('[CommentsService] Usuário não autorizado a deletar este comentário');
        return false;
      }

      // Deletar comentário
      const { error: deleteError } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', userId); // RLS adicional

      if (deleteError) {
        console.error('[CommentsService] Erro ao deletar comentário:', deleteError);
        return false;
      }

      // Decrementar contador
      const { error: rpcError } = await supabase.rpc('decrement_post_comments', { 
        post_id: commentData.post_id 
      });
      
      if (rpcError) {
        console.error('[CommentsService] Erro ao decrementar contador:', rpcError);
      }

      return true;
    } catch (err) {
      console.error('[CommentsService] Erro inesperado ao deletar comentário:', err);
      return false;
    }
  }

  /**
   * Obter contagem de comentários de um post
   */
  static async getPostCommentsCount(postId: string): Promise<number> {
    if (!isSupabaseReady()) {
      const posts = StorageService.getPosts();
      const post = posts.find(p => p.id === postId);
      return post?.commentsCount || 0;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('comments_count')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('[CommentsService] Erro ao buscar contagem:', error);
        return 0;
      }

      return data?.comments_count || 0;
    } catch (err) {
      console.error('[CommentsService] Erro inesperado ao buscar contagem:', err);
      return 0;
    }
  }

  /**
   * Editar um comentário (Wave 2 - preparado para futuro)
   */
  static async editComment(
    commentId: string,
    userId: string,
    newText: string
  ): Promise<boolean> {
    if (!newText.trim()) {
      return false;
    }

    if (!isSupabaseReady()) {
      console.warn('[CommentsService] Edit não implementado em modo offline');
      return false;
    }

    try {
      const { error } = await supabase
        .from('post_comments')
        .update({ text: newText.trim() })
        .eq('id', commentId)
        .eq('author_id', userId); // Apenas autor pode editar

      if (error) {
        console.error('[CommentsService] Erro ao editar comentário:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[CommentsService] Erro inesperado ao editar comentário:', err);
      return false;
    }
  }
}
