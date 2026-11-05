/**
 * STRAVA FIGHT - Recommendations Service
 * Sistema inteligente de recomendações de usuários baseado em:
 * - Mesma modalidade
 * - Mesma cidade/região
 * - Mesma academia
 * - Atividade recente
 * - Novos usuários
 */

import { supabase, isSupabaseReady } from '../../lib/supabase';

export interface RecommendedUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  location: string;
  modalities: any[];
  isVerified: boolean;
  followersCount: number;
  matchReason: string; // Ex: "Mesma modalidade", "Mesma cidade"
  mutualFriends?: number;
}

export class RecommendationsService {
  /**
   * Busca usuários recomendados com base no perfil do usuário atual
   */
  static async getRecommendedUsers(
    currentUserId: string,
    limit: number = 20
  ): Promise<RecommendedUser[]> {
    if (!isSupabaseReady()) {
      console.warn('[RecommendationsService] Supabase não configurado');
      return [];
    }

    try {
      // 1. Pegar perfil do usuário atual
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (!currentUser) return [];

      // 2. Buscar quem o usuário já segue
      const { data: following } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', currentUserId);

      const followingIds = following?.map(f => f.following_id) || [];
      const excludeIds = [...followingIds, currentUserId];

      // 3. Buscar usuários recomendados (excluindo quem já segue)
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Pegar mais para filtrar

      if (error || !users) {
        console.error('[RecommendationsService] Erro ao buscar usuários:', error);
        return [];
      }

      // 4. Pontuar cada usuário baseado em similaridade
      const scored = await Promise.all(
        users.map(async (user) => {
          let score = 0;
          let reasons: string[] = [];

          // Parse modalities
          const currentModalities = currentUser.modalities || [];
          const userModalities = user.modalities || [];

          // Mesma modalidade (peso alto)
          const hasSharedModality = currentModalities.some((cm: any) =>
            userModalities.some((um: any) => 
              cm.modality?.toLowerCase() === um.modality?.toLowerCase()
            )
          );
          if (hasSharedModality) {
            score += 50;
            reasons.push('Mesma modalidade');
          }

          // Mesma cidade/região
          if (user.location && currentUser.location) {
            const userCity = user.location.toLowerCase();
            const currentCity = currentUser.location.toLowerCase();
            if (userCity.includes(currentCity) || currentCity.includes(userCity)) {
              score += 30;
              reasons.push('Mesma região');
            }
          }

          // Mesma academia
          if (
            user.affiliated_academy_name &&
            currentUser.affiliated_academy_name &&
            user.affiliated_academy_name.toLowerCase() === currentUser.affiliated_academy_name.toLowerCase()
          ) {
            score += 40;
            reasons.push('Mesma academia');
          }

          // Usuário verificado (boost)
          if (user.is_verified) {
            score += 15;
            reasons.push('Verificado');
          }

          // Professor/Mestre (boost)
          if (user.role === 'Professor' || user.role === 'Mestre') {
            score += 20;
            reasons.push('Professor');
          }

          // Usuário novo (últimos 7 dias)
          const createdAt = new Date(user.created_at);
          const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreated <= 7) {
            score += 10;
            reasons.push('Novo na plataforma');
          }

          // Popular (muitos seguidores)
          if (user.followers_count > 50) {
            score += 10;
          }

          // Calcular amigos em comum
          const { count: mutualCount } = await supabase
            .from('user_followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', user.id)
            .in('following_id', followingIds);

          const mutualFriends = mutualCount || 0;
          if (mutualFriends > 0) {
            score += mutualFriends * 5;
            reasons.push(`${mutualFriends} amigos em comum`);
          }

          return {
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            role: user.role,
            location: user.location,
            modalities: userModalities,
            isVerified: user.is_verified,
            followersCount: user.followers_count,
            matchReason: reasons.length > 0 ? reasons[0] : 'Sugestão para você',
            mutualFriends,
            score,
          };
        })
      );

      // 5. Ordenar por score e retornar top N
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, ...user }) => user);
    } catch (err) {
      console.error('[RecommendationsService] Erro inesperado:', err);
      return [];
    }
  }

  /**
   * Busca usuários por modalidade específica
   */
  static async getUsersByModality(
    modality: string,
    limit: number = 20
  ): Promise<RecommendedUser[]> {
    if (!isSupabaseReady()) return [];

    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error || !users) return [];

      // Filtrar por modalidade no lado do cliente (modalities é JSONB)
      const filtered = users.filter((user) => {
        const userModalities = user.modalities || [];
        return userModalities.some((m: any) =>
          m.modality?.toLowerCase().includes(modality.toLowerCase())
        );
      });

      return filtered.map((user) => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        location: user.location,
        modalities: user.modalities || [],
        isVerified: user.is_verified,
        followersCount: user.followers_count,
        matchReason: modality,
        mutualFriends: 0,
      }));
    } catch (err) {
      console.error('[RecommendationsService] Erro ao buscar por modalidade:', err);
      return [];
    }
  }

  /**
   * Busca novos usuários (últimos 30 dias)
   */
  static async getNewUsers(limit: number = 20): Promise<RecommendedUser[]> {
    if (!isSupabaseReady()) return [];

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !users) return [];

      return users.map((user) => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        location: user.location,
        modalities: user.modalities || [],
        isVerified: user.is_verified,
        followersCount: user.followers_count,
        matchReason: 'Novo na plataforma',
        mutualFriends: 0,
      }));
    } catch (err) {
      console.error('[RecommendationsService] Erro ao buscar novos usuários:', err);
      return [];
    }
  }

  /**
   * Busca usuários próximos (mesma cidade)
   */
  static async getNearbyUsers(
    currentUserId: string,
    limit: number = 20
  ): Promise<RecommendedUser[]> {
    if (!isSupabaseReady()) return [];

    try {
      // Pegar localização do usuário atual
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', currentUserId)
        .single();

      if (!currentUser?.location) return [];

      // Buscar usuários da mesma região
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('location', `%${currentUser.location}%`)
        .neq('id', currentUserId)
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error || !users) return [];

      return users.map((user) => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        location: user.location,
        modalities: user.modalities || [],
        isVerified: user.is_verified,
        followersCount: user.followers_count,
        matchReason: 'Perto de você',
        mutualFriends: 0,
      }));
    } catch (err) {
      console.error('[RecommendationsService] Erro ao buscar usuários próximos:', err);
      return [];
    }
  }
}
