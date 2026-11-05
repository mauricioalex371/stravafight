/**
 * STRAVA FIGHT — Global Search & Discovery Service
 * 
 * Provides unified, indexed, and categorized search across:
 * - Atletas e Professores
 * - Academias parceiras
 * - Modalidades marciais
 * - Eventos e Torneios
 * - Publicações e Hashtags
 * - Empresas e Oportunidades Comerciais
 */

import { StorageService } from './storageService';
import { BusinessService } from './businessService';
import { Post, CombatEvent, UserProfile, AcademyInfo, CommercialProfile, SponsorshipOpportunity } from '../types';
import { supabase, isSupabaseReady } from '../lib/supabase';

export type SearchCategory = 'TUDO' | 'ATLETAS' | 'ACADEMIAS' | 'EVENTOS' | 'POSTS' | 'COMERCIAL';

export interface SearchResultItem {
  id: string;
  type: 'USER' | 'ACADEMY' | 'EVENT' | 'POST' | 'BUSINESS' | 'OPPORTUNITY';
  title: string;
  subtitle: string;
  imageUrl?: string;
  badge?: string;
  routeView: string;
  payload?: any;
}

export class SearchService {
  /**
   * Performs high-speed multi-entity query matching.
   */
  static async search(query: string, category: SearchCategory = 'TUDO', filterModality: string = 'TODAS'): Promise<SearchResultItem[]> {
    const q = query.trim().toLowerCase();
    if (!q && filterModality === 'TODAS') return [];

    const results: SearchResultItem[] = [];

    // 1. Search Users (Athletes & Masters) - BUSCAR DO SUPABASE
    if (category === 'TUDO' || category === 'ATLETAS') {
      if (isSupabaseReady()) {
        try {
          // Buscar usuários do Supabase
          const { data: users } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
            .limit(20);

          if (users) {
            for (const u of users) {
              const modalities = u.modalities || [];
              const matchesModality = filterModality === 'TODAS' ||
                modalities.some((m: any) => m.modality?.toLowerCase().includes(filterModality.toLowerCase()));

              if (matchesModality) {
                results.push({
                  id: u.id,
                  type: 'USER',
                  title: u.full_name,
                  subtitle: `@${u.username} • ${modalities.map((m: any) => m.belt || m.modality).join(', ')}`,
                  imageUrl: u.avatar_url,
                  badge: u.role,
                  routeView: 'profile',
                  payload: u
                });
              }
            }
          }
        } catch (err) {
          console.error('[SearchService] Erro ao buscar usuários:', err);
        }
      }
    }

    // 2. Search Academies
    if (category === 'TUDO' || category === 'ACADEMIAS') {
      const academy = StorageService.getAcademyInfo();
      const matchesQuery = !q || 
        academy.name.toLowerCase().includes(q) ||
        academy.masterName.toLowerCase().includes(q) ||
        academy.address.toLowerCase().includes(q) ||
        academy.modalities.some((m) => m.toLowerCase().includes(q));

      const matchesModality = filterModality === 'TODAS' ||
        academy.modalities.some((m) => m.toLowerCase().includes(filterModality.toLowerCase()));

      if (matchesQuery && matchesModality) {
        results.push({
          id: academy.id,
          type: 'ACADEMY',
          title: academy.name,
          subtitle: `Mestre: ${academy.masterName} • ${academy.address}`,
          imageUrl: academy.logoUrl || '/assets/aistudio/LOGO_47d32ee0.jpg',
          badge: 'ACADEMIA',
          routeView: 'academy',
          payload: academy
        });
      }
    }

    // 3. Search Combat Events
    if (category === 'TUDO' || category === 'EVENTOS') {
      const events = StorageService.getEvents();
      for (const ev of events) {
        const matchesQuery = !q ||
          ev.title.toLowerCase().includes(q) ||
          ev.city.toLowerCase().includes(q) ||
          ev.modalities.some((m) => m.toLowerCase().includes(q));

        const matchesModality = filterModality === 'TODAS' ||
          ev.modalities.some((m) => m.toLowerCase().includes(filterModality.toLowerCase()));

        if (matchesQuery && matchesModality) {
          results.push({
            id: ev.id,
            type: 'EVENT',
            title: ev.title,
            subtitle: `${ev.date} às ${ev.time} • ${ev.location}, ${ev.city}`,
            imageUrl: ev.bannerUrl,
            badge: ev.type,
            routeView: 'events',
            payload: ev
          });
        }
      }
    }

    // 4. Search Posts & Hashtags - BUSCAR DO SUPABASE
    if (category === 'TUDO' || category === 'POSTS') {
      if (isSupabaseReady()) {
        try {
          const { data: posts } = await supabase
            .from('posts')
            .select(`
              *,
              author:profiles!posts_author_id_fkey(username, full_name, avatar_url)
            `)
            .or(`caption.ilike.%${q}%`)
            .order('created_at', { ascending: false })
            .limit(20);

          if (posts) {
            for (const p of posts) {
              const author = Array.isArray(p.author) ? p.author[0] : p.author;
              results.push({
                id: p.id,
                type: 'POST',
                title: (p.caption || '').slice(0, 70) + ((p.caption?.length || 0) > 70 ? '...' : ''),
                subtitle: `@${author?.username || 'unknown'} • ${p.modality || 'Jiu-Jitsu'} • ${p.likes_count || 0} curtidas`,
                imageUrl: p.media_url,
                badge: 'POST',
                routeView: 'feed',
                payload: p
              });
            }
          }
        } catch (err) {
          console.error('[SearchService] Erro ao buscar posts:', err);
        }
      }
    }

    // 5. Search Commercial & Sponsorship Opportunities
    if (category === 'TUDO' || category === 'COMERCIAL') {
      const opps = BusinessService.getOpportunities();
      for (const o of opps) {
        const matchesQuery = !q ||
          o.title.toLowerCase().includes(q) ||
          o.authorName.toLowerCase().includes(q) ||
          o.modality.toLowerCase().includes(q) ||
          o.location.toLowerCase().includes(q);

        const matchesModality = filterModality === 'TODAS' ||
          o.modality.toLowerCase().includes(filterModality.toLowerCase());

        if (matchesQuery && matchesModality) {
          results.push({
            id: o.id,
            type: 'OPPORTUNITY',
            title: o.title,
            subtitle: `${o.authorName} • ${o.modality} • ${o.budgetOrSupport}`,
            imageUrl: o.authorAvatar,
            badge: o.type === 'PROCURA_PATROCINADOR' ? 'PATROCÍNIO' : 'VAGA ATLETA',
            routeView: 'business',
            payload: o
          });
        }
      }
    }

    return results;
  }
}
