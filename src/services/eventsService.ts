/**
 * EVENTS SERVICE
 * Gerenciamento de eventos esportivos, inscrições e resultados
 */

import { supabase } from './supabaseClient';
import type { SportEvent, EventRegistration, EventResult } from '../types';

export class EventsService {
  // ==========================================
  // EVENTOS
  // ==========================================

  static async getEvents(filters?: {
    modality?: string;
    city?: string;
    event_type?: string;
    status?: string;
    upcoming_only?: boolean;
  }): Promise<SportEvent[]> {
    try {
      let query = supabase
        .from('sports_events')
        .select(`
          *,
          organizer:profiles(id, full_name, avatar_url)
        `);

      if (filters?.modality) query = query.eq('modality', filters.modality);
      if (filters?.city) query = query.eq('city', filters.city);
      if (filters?.event_type) query = query.eq('event_type', filters.event_type);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.upcoming_only) {
        query = query.gte('start_date', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('start_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((event: any) => ({
        ...event,
        organizer_name: event.organizer?.full_name || '',
        organizer_logo: event.organizer?.avatar_url || ''
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  static async getEventBySlug(slug: string, userId?: string): Promise<SportEvent | null> {
    try {
      const { data: event, error } = await supabase
        .from('sports_events')
        .select(`
          *,
          organizer:profiles(id, full_name, avatar_url),
          registrations:sports_event_registrations(count)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (!event) return null;

      // Verificar se usuário está inscrito ou interessado
      let has_registered = false;
      let has_interested = false;

      if (userId) {
        const { data: registration } = await supabase
          .from('sports_event_registrations')
          .select('id')
          .eq('event_id', event.id)
          .eq('participant_id', userId)
          .single();
        has_registered = !!registration;

        const { data: interest } = await supabase
          .from('sports_event_interests')
          .select('*')
          .eq('event_id', event.id)
          .eq('user_id', userId)
          .single();
        has_interested = !!interest;
      }

      // Incrementar visualizações
      await supabase
        .from('sports_events')
        .update({ views_count: (event.views_count || 0) + 1 })
        .eq('id', event.id);

      return {
        ...event,
        organizer_name: event.organizer?.full_name || '',
        organizer_logo: event.organizer?.avatar_url || '',
        has_registered,
        has_interested
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  // ==========================================
  // INSCRIÇÕES
  // ==========================================

  static async registerForEvent(
    eventId: string,
    userId: string,
    category: string,
    teamName?: string
  ): Promise<EventRegistration | null> {
    try {
      // Verificar se já está inscrito
      const { data: existing } = await supabase
        .from('sports_event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('participant_id', userId)
        .single();

      if (existing) {
        console.log('Already registered');
        return null;
      }

      // Gerar número de inscrição
      const timestamp = Date.now();
      const registration_number = `SF-${eventId.substring(0, 8).toUpperCase()}-${timestamp}`;

      const { data, error } = await supabase
        .from('sports_event_registrations')
        .insert({
          event_id: eventId,
          participant_id: userId,
          category,
          team_name: teamName,
          registration_number,
          payment_status: 'PENDING'
        })
        .select(`
          *,
          participant:profiles(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Atualizar contador de participantes
      const { data: event } = await supabase
        .from('sports_events')
        .select('current_participants')
        .eq('id', eventId)
        .single();

      if (event) {
        await supabase
          .from('sports_events')
          .update({ current_participants: (event.current_participants || 0) + 1 })
          .eq('id', eventId);
      }

      return {
        ...data,
        participant_name: data.participant?.full_name || '',
        participant_avatar: data.participant?.avatar_url || ''
      };
    } catch (error) {
      console.error('Error registering for event:', error);
      return null;
    }
  }

  static async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      const { data, error } = await supabase
        .from('sports_event_registrations')
        .select(`
          *,
          event:sports_events(title, start_date, banner_url),
          participant:profiles(full_name, avatar_url)
        `)
        .eq('participant_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((reg: any) => ({
        ...reg,
        participant_name: reg.participant?.full_name || '',
        participant_avatar: reg.participant?.avatar_url || ''
      }));
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }
  }

  // ==========================================
  // INTERESSE EM EVENTOS
  // ==========================================

  static async toggleInterest(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data: existing } = await supabase
        .from('sports_event_interests')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Remover interesse
        const { error } = await supabase
          .from('sports_event_interests')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (!error) {
          // Decrementar contador
          const { data: event } = await supabase
            .from('sports_events')
            .select('interested_count')
            .eq('id', eventId)
            .single();

          if (event) {
            await supabase
              .from('sports_events')
              .update({ interested_count: Math.max(0, (event.interested_count || 0) - 1) })
              .eq('id', eventId);
          }
        }

        return !error;
      } else {
        // Adicionar interesse
        const { error } = await supabase
          .from('sports_event_interests')
          .insert({ event_id: eventId, user_id: userId });

        if (!error) {
          // Incrementar contador
          const { data: event } = await supabase
            .from('sports_events')
            .select('interested_count')
            .eq('id', eventId)
            .single();

          if (event) {
            await supabase
              .from('sports_events')
              .update({ interested_count: (event.interested_count || 0) + 1 })
              .eq('id', eventId);
          }
        }

        return !error;
      }
    } catch (error) {
      console.error('Error toggling interest:', error);
      return false;
    }
  }

  // ==========================================
  // RESULTADOS
  // ==========================================

  static async getEventResults(eventId: string): Promise<EventResult[]> {
    try {
      const { data, error } = await supabase
        .from('sports_event_results')
        .select(`
          *,
          participant:profiles(full_name, avatar_url)
        `)
        .eq('event_id', eventId)
        .order('category')
        .order('position');

      if (error) throw error;

      return (data || []).map((result: any) => ({
        ...result,
        participant_name: result.participant?.full_name || '',
        participant_avatar: result.participant?.avatar_url || ''
      }));
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  }
}
