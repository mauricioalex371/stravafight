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
  static search(query: string, category: SearchCategory = 'TUDO', filterModality: string = 'TODAS'): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q && filterModality === 'TODAS') return [];

    const results: SearchResultItem[] = [];

    // 1. Search Users (Athletes & Masters)
    if (category === 'TUDO' || category === 'ATLETAS') {
      const currentUser = StorageService.getCurrentUser();
      const demoUsers: UserProfile[] = [
        currentUser,
        {
          id: 'usr_uarlei',
          username: 'mestre.uarlei',
          fullName: 'Mestre Uarlei Silva',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          role: 'Professor',
          modalities: [{ modality: 'Jiu-Jitsu', belt: 'Faixa Preta 3º Dan' }, { modality: 'MMA', belt: 'Treinador' }],
          location: 'São Paulo, SP',
          isVerified: true
        } as unknown as UserProfile,
        {
          id: 'usr_amanda',
          username: 'amanda_bjj',
          fullName: 'Amanda Souza',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
          role: 'Atleta',
          modalities: [{ modality: 'Jiu-Jitsu', belt: 'Faixa Roxa' }],
          location: 'São Paulo, SP',
          isVerified: true
        } as unknown as UserProfile,
        {
          id: 'usr_carlos',
          username: 'carlos_mma',
          fullName: 'Carlos Gracie Silva',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          role: 'Atleta Profissional',
          modalities: [{ modality: 'MMA', belt: 'Faixa Preta' }, { modality: 'Muay Thai', belt: 'Grau Preto' }],
          location: 'Rio de Janeiro, RJ',
          isVerified: true
        } as unknown as UserProfile
      ];


      for (const u of demoUsers) {
        const matchesQuery = !q || 
          u.username.toLowerCase().includes(q) || 
          u.fullName.toLowerCase().includes(q) ||
          u.modalities.some((m) => m.modality.toLowerCase().includes(q) || m.belt.toLowerCase().includes(q));

        const matchesModality = filterModality === 'TODAS' ||
          u.modalities.some((m) => m.modality.toLowerCase().includes(filterModality.toLowerCase()));

        if (matchesQuery && matchesModality) {
          results.push({
            id: u.id,
            type: 'USER',
            title: u.fullName,
            subtitle: `@${u.username} • ${u.modalities.map((m) => m.belt).join(', ')}`,
            imageUrl: u.avatarUrl,
            badge: u.role,
            routeView: 'profile',
            payload: u
          });
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

    // 4. Search Posts & Hashtags
    if (category === 'TUDO' || category === 'POSTS') {
      const posts = StorageService.getPosts();
      for (const p of posts) {
        const matchesQuery = !q ||
          p.caption.toLowerCase().includes(q) ||
          p.authorUsername.toLowerCase().includes(q) ||
          p.hashtags.some((h) => h.toLowerCase().includes(q));

        const matchesModality = filterModality === 'TODAS' ||
          p.authorModality.toLowerCase().includes(filterModality.toLowerCase());

        if (matchesQuery && matchesModality) {
          results.push({
            id: p.id,
            type: 'POST',
            title: p.caption.slice(0, 70) + (p.caption.length > 70 ? '...' : ''),
            subtitle: `@${p.authorUsername} • ${p.authorModality} • ${p.likesCount} curtidas`,
            imageUrl: p.mediaUrl,
            badge: 'POST',
            routeView: 'feed',
            payload: p
          });
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
