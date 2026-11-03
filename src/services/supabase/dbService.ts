import { supabase, isSupabaseReady } from '../../lib/supabase';
import { UserProfile, Post, Story, Reel, DirectConversation, ChatMessage, Student, ClassEntity, MonthlyFee, CashTransaction } from '../../types';
import { StorageService } from '../storageService';

export class DbService {
  // ==========================================
  // PERFIS (PROFILES)
  // ==========================================
  static async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseReady()) {
      return StorageService.getCurrentUser();
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return StorageService.getCurrentUser();
      return {
        id: data.id,
        username: data.username,
        fullName: data.full_name,
        avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        coverUrl: data.cover_url,
        bio: data.bio || '',
        role: data.role || 'Atleta',
        location: data.location || 'Brasil',
        modalities: data.modalities || [{ modality: 'Jiu-Jitsu', belt: 'Faixa Branca' }],
        affiliatedAcademyName: data.affiliated_academy_name,
        affiliatedAcademyId: data.affiliated_academy_id,
        isVerified: data.is_verified || false,
        followersCount: data.followers_count || 0,
        followingCount: data.following_count || 0,
        friendsCount: data.friends_count || 0,
        postsCount: data.posts_count || 0,
        streakDays: data.streak_days || 0,
        totalCheckIns: data.total_check_ins || 0,
        xpPoints: data.xp_points || 0,
        beltRankSocial: data.belt_rank_social || 'Faixa Branca SF',
        badges: data.badges || []
      };
    } catch {
      return StorageService.getCurrentUser();
    }
  }

  static async updateProfile(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
    if (!isSupabaseReady()) {
      const current = StorageService.getCurrentUser();
      StorageService.saveCurrentUser({ ...current, ...profile });
      return true;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          bio: profile.bio,
          avatar_url: profile.avatarUrl,
          cover_url: profile.coverUrl,
          location: profile.location,
          role: profile.role,
          modalities: profile.modalities,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      return !error;
    } catch {
      return false;
    }
  }

  // ==========================================
  // PUBLICAÇÕES (POSTS)
  // ==========================================
  static async getPosts(): Promise<Post[]> {
    if (!isSupabaseReady()) {
      return StorageService.getPosts();
    }
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, full_name, username, avatar_url, role)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return StorageService.getPosts();
      }

      return data.map((row: any) => ({
        id: row.id,
        authorId: row.author_id,
        authorName: row.author?.full_name || 'Guerreiro SF',
        authorUsername: row.author?.username || 'usuario',
        authorAvatar: row.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        authorModality: row.modality || 'Jiu-Jitsu',
        authorBelt: row.author_belt || 'Graduado',
        isAuthorVerified: row.is_verified || false,
        mediaUrl: row.media_url,
        mediaType: row.media_type || 'image',
        caption: row.caption || '',
        hashtags: row.hashtags || [],
        location: row.location,
        taggedAcademy: row.tagged_academy,
        likesCount: row.likes_count || 0,
        hasLiked: false,
        commentsCount: row.comments_count || 0,
        sharesCount: row.shares_count || 0,
        savesCount: row.saves_count || 0,
        hasSaved: false,
        createdAt: row.created_at,
        comments: [],
        trainingData: row.training_data
      }));
    } catch {
      return StorageService.getPosts();
    }
  }

  static async getPostsPaginated(page: number = 0, pageSize: number = 10): Promise<{ posts: Post[]; hasMore: boolean }> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    if (!isSupabaseReady()) {
      const all = StorageService.getPosts();
      const slice = all.slice(from, to + 1);
      return {
        posts: slice,
        hasMore: from + pageSize < all.length
      };
    }

    try {
      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, full_name, username, avatar_url, role)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error || !data) {
        const all = StorageService.getPosts();
        return { posts: all.slice(from, to + 1), hasMore: from + pageSize < all.length };
      }

      const mapped = data.map((row: any) => ({
        id: row.id,
        authorId: row.author_id,
        authorName: row.author?.full_name || 'Guerreiro SF',
        authorUsername: row.author?.username || 'usuario',
        authorAvatar: row.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        authorModality: row.modality || 'Jiu-Jitsu',
        authorBelt: row.author_belt || 'Graduado',
        isAuthorVerified: row.is_verified || false,
        mediaUrl: row.media_url,
        mediaType: row.media_type || 'image',
        caption: row.caption || '',
        hashtags: row.hashtags || [],
        location: row.location,
        taggedAcademy: row.tagged_academy,
        likesCount: row.likes_count || 0,
        hasLiked: false,
        commentsCount: row.comments_count || 0,
        sharesCount: row.shares_count || 0,
        savesCount: row.saves_count || 0,
        hasSaved: false,
        createdAt: row.created_at,
        comments: [],
        trainingData: row.training_data
      }));

      return {
        posts: mapped,
        hasMore: count ? to + 1 < count : mapped.length === pageSize
      };
    } catch {
      const all = StorageService.getPosts();
      return { posts: all.slice(from, to + 1), hasMore: from + pageSize < all.length };
    }
  }


  static async createPost(post: Post): Promise<boolean> {
    if (!isSupabaseReady()) {
      const posts = StorageService.getPosts();
      StorageService.savePosts([post, ...posts]);
      return true;
    }
    try {
      const { error } = await supabase.from('posts').insert({
        id: post.id,
        author_id: post.authorId,
        caption: post.caption,
        media_url: post.mediaUrl,
        media_type: post.mediaType,
        modality: post.authorModality,
        hashtags: post.hashtags,
        location: post.location,
        tagged_academy: post.taggedAcademy,
        training_data: post.trainingData,
        created_at: post.createdAt
      });
      return !error;
    } catch {
      return false;
    }
  }

  // ==========================================
  // STORIES & REELS
  // ==========================================
  static async getStories(): Promise<Story[]> {
    return StorageService.getStories();
  }

  static async getReels(): Promise<Reel[]> {
    return StorageService.getReels();
  }

  // ==========================================
  // SF ACADEMY (GESTÃO MULTI-TENANT)
  // ==========================================
  static async getStudents(academyId: string): Promise<Student[]> {
    if (!isSupabaseReady()) {
      return StorageService.getStudents().filter(s => s.academyId === academyId);
    }
    try {
      const { data, error } = await supabase
        .from('academy_students')
        .select('*')
        .eq('academy_id', academyId);

      if (error || !data) return StorageService.getStudents();
      return data;
    } catch {
      return StorageService.getStudents();
    }
  }

  static async getClasses(academyId: string): Promise<ClassEntity[]> {
    if (!isSupabaseReady()) {
      return StorageService.getClasses().filter(c => c.academyId === academyId);
    }
    try {
      const { data, error } = await supabase
        .from('academy_classes')
        .select('*')
        .eq('academy_id', academyId);

      if (error || !data) return StorageService.getClasses();
      return data;
    } catch {
      return StorageService.getClasses();
    }
  }
}
