/**
 * SF Business Migration Service
 * Migração segura de dados do localStorage para Supabase
 * Idempotente, com validação e rollback
 */

import { supabase } from '../lib/supabase';
import { businessSyncService } from './businessSyncService';
import {
  mapObjectiveToDb,
  mapStatusToDb,
} from './businessEnumMappers';

// ============================================================================
// TIPOS
// ============================================================================

export type MigrationStatus =
  | 'not_started'
  | 'detecting'
  | 'validating'
  | 'migrating'
  | 'completed'
  | 'failed'
  | 'partial';

export interface MigrationResult {
  status: MigrationStatus;
  totalItems: number;
  migratedItems: number;
  skippedItems: number;
  failedItems: number;
  errors: string[];
  startedAt?: number;
  completedAt?: number;
}

export interface LegacyData {
  profiles?: LegacyProfile[];
  campaigns?: LegacyCampaign[];
  products?: LegacyProduct[];
  opportunities?: LegacyOpportunity[];
  events?: LegacyEvent[];
}

interface LegacyProfile {
  id: string;
  [key: string]: unknown;
}

interface LegacyCampaign {
  id: string;
  companyId?: string;
  business_id?: string;
  name?: string;
  objective?: string;
  title?: string;
  description?: string;
  mediaUrl?: string;
  media_url?: string;
  mediaType?: string;
  destinationUrl?: string;
  target_url?: string;
  ctaLabel?: string;
  cta_text?: string;
  targetAudience?: {
    countries?: string[];
    modalities?: string[];
  };
  status?: string;
  budget?: number;
  spentBudget?: number;
  startDate?: string;
  endDate?: string;
  impressionsCount?: number;
  clicksCount?: number;
  createdAt?: string;
  [key: string]: unknown;
}

interface LegacyProduct {
  id: string;
  [key: string]: unknown;
}

interface LegacyOpportunity {
  id: string;
  countries?: string[];
  modalities?: string[];
  description?: string;
  [key: string]: unknown;
}

interface LegacyEvent {
  id: string;
  [key: string]: unknown;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const MIGRATION_CONFIG = {
  STATE_KEY: 'sfb_migration_state',
  BACKUP_KEY: 'sfb_migration_backup',
  BATCH_SIZE: 5,
  LEGACY_KEYS: {
    PROFILES: 'sfb_commercial_profiles',
    MY_PROFILE: 'sfb_my_commercial_profile',
    CAMPAIGNS: 'sfb_ad_campaigns',
    PRODUCTS: 'sfb_products',
    OPPORTUNITIES: 'sfb_sponsorship_opportunities',
    EVENTS: 'sfb_commercial_events',
  },
};

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

class BusinessMigrationService {
  private result: MigrationResult;

  constructor() {
    this.result = {
      status: 'not_started',
      totalItems: 0,
      migratedItems: 0,
      skippedItems: 0,
      failedItems: 0,
      errors: [],
    };

    this.loadState();
  }

  // ==========================================================================
  // DETECÇÃO DE DADOS LEGADOS
  // ==========================================================================

  async detectLegacyData(): Promise<LegacyData> {
    console.log('[Migration] Detectando dados legados...');

    const legacy: LegacyData = {};

    try {
      // Perfis comerciais
      const profilesData = localStorage.getItem(MIGRATION_CONFIG.LEGACY_KEYS.PROFILES);
      if (profilesData) {
        legacy.profiles = JSON.parse(profilesData);
      }

      // Meu perfil (pode estar separado)
      const myProfileData = localStorage.getItem(MIGRATION_CONFIG.LEGACY_KEYS.MY_PROFILE);
      if (myProfileData) {
        const myProfile = JSON.parse(myProfileData);
        if (!legacy.profiles) legacy.profiles = [];
        // Adicionar se não estiver na lista
        if (!legacy.profiles.some((p) => p.id === myProfile.id)) {
          legacy.profiles.push(myProfile);
        }
      }

      // Campanhas
      const campaignsData = localStorage.getItem(MIGRATION_CONFIG.LEGACY_KEYS.CAMPAIGNS);
      if (campaignsData) {
        legacy.campaigns = JSON.parse(campaignsData);
      }

      // Produtos
      const productsData = localStorage.getItem(MIGRATION_CONFIG.LEGACY_KEYS.PRODUCTS);
      if (productsData) {
        legacy.products = JSON.parse(productsData);
      }

      // Oportunidades
      const opportunitiesData = localStorage.getItem(
        MIGRATION_CONFIG.LEGACY_KEYS.OPPORTUNITIES
      );
      if (opportunitiesData) {
        legacy.opportunities = JSON.parse(opportunitiesData);
      }

      // Eventos
      const eventsData = localStorage.getItem(MIGRATION_CONFIG.LEGACY_KEYS.EVENTS);
      if (eventsData) {
        legacy.events = JSON.parse(eventsData);
      }

      const total =
        (legacy.profiles?.length || 0) +
        (legacy.campaigns?.length || 0) +
        (legacy.products?.length || 0) +
        (legacy.opportunities?.length || 0) +
        (legacy.events?.length || 0);

      console.log('[Migration] Dados detectados', {
        profiles: legacy.profiles?.length || 0,
        campaigns: legacy.campaigns?.length || 0,
        products: legacy.products?.length || 0,
        opportunities: legacy.opportunities?.length || 0,
        events: legacy.events?.length || 0,
        total,
      });

      return legacy;
    } catch (error: any) {
      console.error('[Migration] Erro ao detectar dados', error);
      throw new Error(`Falha na detecção: ${error.message}`);
    }
  }

  // ==========================================================================
  // VALIDAÇÃO DE DADOS
  // ==========================================================================

  private validateData(legacy: LegacyData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar perfis
    legacy.profiles?.forEach((profile, index) => {
      if (!profile.id) errors.push(`Perfil ${index}: ID ausente`);
      if (!profile.userId && !profile.user_id) {
        errors.push(`Perfil ${index}: user_id ausente`);
      }
      if (!profile.companyName && !profile.company_name) {
        errors.push(`Perfil ${index}: company_name ausente`);
      }
    });

    // Validar campanhas
    legacy.campaigns?.forEach((campaign, index) => {
      if (!campaign.id) errors.push(`Campanha ${index}: ID ausente`);
      if (!campaign.companyId && !campaign.business_id) {
        errors.push(`Campanha ${index}: business_id ausente`);
      }
      if (!campaign.name) errors.push(`Campanha ${index}: name ausente`);
    });

    // Validar produtos
    legacy.products?.forEach((product, index) => {
      if (!product.id) errors.push(`Produto ${index}: ID ausente`);
      if (!product.companyId && !product.commercial_profile_id) {
        errors.push(`Produto ${index}: commercial_profile_id ausente`);
      }
    });

    console.log('[Migration] Validação concluída', {
      valid: errors.length === 0,
      errors: errors.length,
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ==========================================================================
  // MIGRAÇÃO PRINCIPAL
  // ==========================================================================

  async migrate(): Promise<MigrationResult> {
    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado. Faça login primeiro.');
    }

    // Detectar dados
    this.result.status = 'detecting';
    this.saveState();

    const legacy = await this.detectLegacyData();
    this.result.totalItems =
      (legacy.profiles?.length || 0) +
      (legacy.campaigns?.length || 0) +
      (legacy.products?.length || 0) +
      (legacy.opportunities?.length || 0) +
      (legacy.events?.length || 0);

    if (this.result.totalItems === 0) {
      this.result.status = 'completed';
      this.result.completedAt = Date.now();
      this.saveState();
      return this.result;
    }

    // Backup antes de migrar
    this.createBackup(legacy);

    // Validar dados
    this.result.status = 'validating';
    this.saveState();

    const validation = this.validateData(legacy);
    if (!validation.valid) {
      this.result.errors = validation.errors;
      this.result.status = 'failed';
      this.saveState();
      throw new Error(
        `Dados inválidos: ${validation.errors.slice(0, 5).join(', ')}`
      );
    }

    // Migrar
    this.result.status = 'migrating';
    this.result.startedAt = Date.now();
    this.saveState();

    console.log('[Migration] Iniciando migração...', {
      total: this.result.totalItems,
      userId: user.id,
    });

    try {
      // Migrar perfis
      if (legacy.profiles) {
        await this.migrateProfiles(legacy.profiles, user.id);
      }

      // Migrar campanhas
      if (legacy.campaigns) {
        await this.migrateCampaigns(legacy.campaigns);
      }

      // Migrar produtos
      if (legacy.products) {
        await this.migrateProducts(legacy.products);
      }

      // Migrar oportunidades
      if (legacy.opportunities) {
        await this.migrateOpportunities(legacy.opportunities);
      }

      // Migrar eventos
      if (legacy.events) {
        await this.migrateEvents(legacy.events);
      }

      // Sucesso
      this.result.status =
        this.result.failedItems > 0 ? 'partial' : 'completed';
      this.result.completedAt = Date.now();
      this.saveState();

      console.log('[Migration] Migração concluída', {
        total: this.result.totalItems,
        migrated: this.result.migratedItems,
        skipped: this.result.skippedItems,
        failed: this.result.failedItems,
      });

      return this.result;
    } catch (error: any) {
      console.error('[Migration] Erro fatal', error);
      this.result.status = 'failed';
      this.result.errors.push(`Erro fatal: ${error.message}`);
      this.saveState();
      throw error;
    }
  }

  // ==========================================================================
  // MIGRAÇÃO POR TIPO
  // ==========================================================================

  private async migrateProfiles(
    profiles: LegacyProfile[],
    userId: string
  ): Promise<void> {
    console.log('[Migration] Migrando perfis', { count: profiles.length });

    for (const profile of profiles) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('commercial_profiles')
          .select('id')
          .eq('id', profile.id)
          .single();

        if (existing) {
          console.log('[Migration] Perfil já existe, pulando', { id: profile.id });
          this.result.skippedItems++;
          continue;
        }

        // Mapear campos localStorage → Supabase
        const dbProfile = {
          id: profile.id,
          user_id: userId, // Associar ao usuário atual
          business_name: profile.companyName || profile.company_name,
          brand_category: profile.category || 'OUTRO',
          tagline: profile.tradingName || null,
          bio: profile.description || null,
          logo_url: profile.logoUrl || profile.logo_url,
          cover_url: profile.coverUrl || profile.cover_url,
          website: profile.websiteUrl || profile.website,
          official_email: profile.contactEmail || profile.contact_email,
          phone: profile.contactPhone || profile.phone,
          instagram: profile.socialInstagram || null,
          country: profile.country || 'Brasil',
          state: profile.region || null,
          city: profile.city || null,
          is_verified_business: profile.isVerified || false,
          is_active: true,
          created_at: profile.createdAt || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('commercial_profiles')
          .insert(dbProfile);

        if (error) throw error;

        this.result.migratedItems++;
        console.log('[Migration] Perfil migrado', { id: profile.id });
      } catch (error: any) {
        console.error('[Migration] Erro ao migrar perfil', {
          id: profile.id,
          error: error.message,
        });
        this.result.failedItems++;
        this.result.errors.push(`Perfil ${profile.id}: ${error.message}`);
      }
    }
  }

  private async migrateCampaigns(campaigns: LegacyCampaign[]): Promise<void> {
    console.log('[Migration] Migrando campanhas', { count: campaigns.length });

    for (const campaign of campaigns) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('ad_campaigns')
          .select('id')
          .eq('id', campaign.id)
          .single();

        if (existing) {
          console.log('[Migration] Campanha já existe, pulando', {
            id: campaign.id,
          });
          this.result.skippedItems++;
          continue;
        }

        // Mapear campos localStorage → Supabase
        const dbCampaign = {
          id: campaign.id,
          advertiser_id: campaign.companyId || campaign.business_id,
          title: campaign.name,
          objective: mapObjectiveToDb(campaign.objective || 'CONHECIMENTO_DE_MARCA'),
          headline: campaign.title || campaign.name,
          description: campaign.description || '',
          media_url: campaign.mediaUrl || campaign.media_url || '',
          media_type: campaign.mediaType || 'image',
          target_url: campaign.destinationUrl || campaign.target_url || '',
          cta_text: campaign.ctaLabel || campaign.cta_text || 'Saiba Mais',
          target_regions: campaign.targetAudience?.countries || ['Brasil'],
          target_modalities: campaign.targetAudience?.modalities || [],
          status: mapStatusToDb(campaign.status || 'RASCUNHO'),
          budget_total: campaign.budget || 0,
          budget_spent: campaign.spentBudget || 0,
          start_date: campaign.startDate || null,
          end_date: campaign.endDate || null,
          impressions_count: campaign.impressionsCount || 0,
          clicks_count: campaign.clicksCount || 0,
          created_at: campaign.createdAt || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('ad_campaigns')
          .insert(dbCampaign);

        if (error) throw error;

        this.result.migratedItems++;
        console.log('[Migration] Campanha migrada', { id: campaign.id });
      } catch (error: any) {
        console.error('[Migration] Erro ao migrar campanha', {
          id: campaign.id,
          error: error.message,
        });
        this.result.failedItems++;
        this.result.errors.push(`Campanha ${campaign.id}: ${error.message}`);
      }
    }
  }

  private async migrateProducts(products: LegacyProduct[]): Promise<void> {
    console.log('[Migration] Migrando produtos', { count: products.length });

    for (const product of products) {
      try {
        const { data: existing } = await supabase
          .from('commercial_products')
          .select('id')
          .eq('id', product.id)
          .single();

        if (existing) {
          this.result.skippedItems++;
          continue;
        }

        const dbProduct = {
          id: product.id,
          commercial_profile_id:
            product.companyId || product.commercial_profile_id,
          title: product.title,
          category: product.category || 'OUTROS',
          price: product.price || 0,
          currency: product.currency || 'BRL',
          description: product.description || '',
          image_url: product.imageUrl || product.image_url,
          buy_url: product.buyUrl || product.buy_url,
          contact_whatsapp: product.contactWhatsApp || null,
          modality: product.modality || null,
          is_active: product.isActive !== false,
          created_at: product.createdAt || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('commercial_products')
          .insert(dbProduct);

        if (error) throw error;

        this.result.migratedItems++;
      } catch (error: any) {
        this.result.failedItems++;
        this.result.errors.push(`Produto ${product.id}: ${error.message}`);
      }
    }
  }

  private async migrateOpportunities(opportunities: LegacyOpportunity[]): Promise<void> {
    console.log('[Migration] Migrando oportunidades', {
      count: opportunities.length,
    });

    for (const opp of opportunities) {
      try {
        const { data: existing } = await supabase
          .from('sponsorship_opportunities')
          .select('id')
          .eq('id', opp.id)
          .single();

        if (existing) {
          this.result.skippedItems++;
          continue;
        }

        const dbOpp = {
          id: opp.id,
          commercial_profile_id: opp.companyId || opp.commercial_profile_id,
          title: opp.title,
          opportunity_type: opp.type || 'SPONSOR_ATHLETE',
          description: opp.description || '',
          value_min: opp.valueMin || 0,
          value_max: opp.valueMax || 0,
          currency: opp.currency || 'BRL',
          status: opp.status || 'OPEN',
          deadline: opp.deadline || null,
          modalities: opp.modalities || [],
          created_at: opp.createdAt || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('sponsorship_opportunities')
          .insert(dbOpp);

        if (error) throw error;

        this.result.migratedItems++;
      } catch (error: any) {
        this.result.failedItems++;
        this.result.errors.push(`Oportunidade ${opp.id}: ${error.message}`);
      }
    }
  }

  private async migrateEvents(events: LegacyEvent[]): Promise<void> {
    console.log('[Migration] Migrando eventos', { count: events.length });

    for (const event of events) {
      try {
        const { data: existing } = await supabase
          .from('commercial_events')
          .select('id')
          .eq('id', event.id)
          .single();

        if (existing) {
          this.result.skippedItems++;
          continue;
        }

        const dbEvent = {
          id: event.id,
          commercial_profile_id: event.companyId || event.commercial_profile_id,
          title: event.title,
          event_type: event.eventType || 'FIGHT_CARD',
          description: event.description || '',
          event_date: event.eventDate || event.date,
          location: event.location || '',
          ticket_url: event.ticketUrl || null,
          modality: event.modality || null,
          created_at: event.createdAt || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('commercial_events')
          .insert(dbEvent);

        if (error) throw error;

        this.result.migratedItems++;
      } catch (error: any) {
        this.result.failedItems++;
        this.result.errors.push(`Evento ${event.id}: ${error.message}`);
      }
    }
  }

  // ==========================================================================
  // BACKUP E ROLLBACK
  // ==========================================================================

  private createBackup(legacy: LegacyData): void {
    try {
      localStorage.setItem(
        MIGRATION_CONFIG.BACKUP_KEY,
        JSON.stringify({
          data: legacy,
          timestamp: Date.now(),
        })
      );
      console.log('[Migration] Backup criado');
    } catch (error) {
      console.error('[Migration] Erro ao criar backup', error);
    }
  }

  async rollback(): Promise<void> {
    try {
      const backup = localStorage.getItem(MIGRATION_CONFIG.BACKUP_KEY);
      if (!backup) {
        throw new Error('Nenhum backup encontrado');
      }

      const { data } = JSON.parse(backup);

      // Restaurar localStorage original
      if (data.profiles) {
        localStorage.setItem(
          MIGRATION_CONFIG.LEGACY_KEYS.PROFILES,
          JSON.stringify(data.profiles)
        );
      }
      if (data.campaigns) {
        localStorage.setItem(
          MIGRATION_CONFIG.LEGACY_KEYS.CAMPAIGNS,
          JSON.stringify(data.campaigns)
        );
      }
      if (data.products) {
        localStorage.setItem(
          MIGRATION_CONFIG.LEGACY_KEYS.PRODUCTS,
          JSON.stringify(data.products)
        );
      }

      console.log('[Migration] Rollback concluído');
    } catch (error: any) {
      console.error('[Migration] Erro no rollback', error);
      throw new Error(`Rollback falhou: ${error.message}`);
    }
  }

  // ==========================================================================
  // PERSISTÊNCIA
  // ==========================================================================

  private loadState(): void {
    try {
      const stored = localStorage.getItem(MIGRATION_CONFIG.STATE_KEY);
      if (stored) {
        this.result = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[Migration] Erro ao carregar estado', error);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(
        MIGRATION_CONFIG.STATE_KEY,
        JSON.stringify(this.result)
      );
    } catch (error) {
      console.error('[Migration] Erro ao salvar estado', error);
    }
  }

  // ==========================================================================
  // API PÚBLICA
  // ==========================================================================

  getResult(): MigrationResult {
    return { ...this.result };
  }

  getStatus(): MigrationStatus {
    return this.result.status;
  }

  async hasLegacyData(): Promise<boolean> {
    const legacy = await this.detectLegacyData();
    const total =
      (legacy.profiles?.length || 0) +
      (legacy.campaigns?.length || 0) +
      (legacy.products?.length || 0) +
      (legacy.opportunities?.length || 0) +
      (legacy.events?.length || 0);

    return total > 0;
  }

  reset(): void {
    this.result = {
      status: 'not_started',
      totalItems: 0,
      migratedItems: 0,
      skippedItems: 0,
      failedItems: 0,
      errors: [],
    };
    this.saveState();
    console.log('[Migration] Estado resetado');
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const businessMigrationService = new BusinessMigrationService();
