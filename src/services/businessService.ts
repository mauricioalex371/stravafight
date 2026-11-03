import {
  CommercialProfile,
  AdCampaign,
  CommercialProduct,
  SponsorshipOpportunity,
  CommercialEventEntity,
  AdEventLog,
  AdReportComplaint,
  AdminAuditLog,
  CommercialPlan,
  CommercialPlanType,
  BusinessLanguage
} from '../types';
import { generateUUID } from '../utils/formatters';

const BIZ_STORAGE_KEYS = {
  PROFILES: 'sfb_commercial_profiles',
  MY_PROFILE: 'sfb_my_commercial_profile',
  CAMPAIGNS: 'sfb_ad_campaigns',
  PRODUCTS: 'sfb_products',
  OPPORTUNITIES: 'sfb_sponsorship_opportunities',
  EVENTS: 'sfb_commercial_events',
  EVENT_LOGS: 'sfb_ad_event_logs',
  REPORTS: 'sfb_ad_reports',
  AUDIT_LOGS: 'sfb_admin_audit_logs',
  LANGUAGE: 'sfb_language_preference'
};

// Default Commercial Plans
export const COMMERCIAL_PLANS: CommercialPlan[] = [
  {
    id: 'FREE',
    name: 'Plano Gratuito',
    badge: 'Standard',
    monthlyPrice: 0,
    currency: 'BRL',
    features: [
      'Perfil Comercial verificado básico',
      'Página institucional da empresa',
      'Publicações comerciais orgânicas',
      'Catálogo de até 3 produtos/serviços',
      'Acesso básico à Central de Anúncios'
    ],
    maxActiveCampaigns: 1,
    analyticsLevel: 'BASIC',
    prioritySupport: false,
    hasSponsoredBadge: false
  },
  {
    id: 'BUSINESS',
    name: 'SF Business Pro',
    badge: 'Pro Business',
    monthlyPrice: 189.90,
    currency: 'BRL',
    features: [
      'Perfil Comercial em destaque',
      'Até 5 campanhas ativas simultâneas',
      'Catálogo ilimitado de produtos e serviços',
      'Publicação de oportunidades de patrocínio',
      'Relatórios detalhados de cliques e alcance',
      'Selo Comercial Prata'
    ],
    maxActiveCampaigns: 5,
    analyticsLevel: 'ADVANCED',
    prioritySupport: true,
    hasSponsoredBadge: true
  },
  {
    id: 'PREMIUM',
    name: 'SF Premium Enterprise',
    badge: 'Enterprise Gold',
    monthlyPrice: 489.00,
    currency: 'BRL',
    features: [
      'Prioridade máxima no algoritmo do Feed e Reels',
      'Até 20 campanhas ativas simultâneas',
      'Campanhas em vídeo 4K e Stories Patrocinados',
      'Acesso direto ao Banco de Atletas e Sparrings',
      'Métricas em tempo real com exportação CSV',
      'Gerente de conta e suporte dedicado 24/7'
    ],
    maxActiveCampaigns: 20,
    analyticsLevel: 'ENTERPRISE',
    prioritySupport: true,
    hasSponsoredBadge: true
  },
  {
    id: 'OFFICIAL_SPONSOR',
    name: 'Patrocinador Oficial SF',
    badge: 'Official Sponsor',
    monthlyPrice: 1250.00,
    currency: 'BRL',
    features: [
      'Presença de marca no topo de eventos mundiais',
      'Campanhas exclusivas sem limite de veiculação',
      'Naming rights de Desafios e Tatame Streak',
      'Selo Oficial de Patrocinador Ouro',
      'Transmissões ao vivo patrocinadas',
      'Auditoria de métricas customizada'
    ],
    maxActiveCampaigns: 999,
    analyticsLevel: 'ENTERPRISE',
    prioritySupport: true,
    hasSponsoredBadge: true
  }
];

// Initial Commercial Profiles Seed
const SEED_PROFILES: CommercialProfile[] = [
  {
    id: 'cp_storm_fight',
    userId: 'usr_brand_storm',
    companyName: 'Storm Kimonos Brasil',
    tradingName: 'Storm Fight Wear Ltda',
    logoUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    description: 'A maior fabricante de kimonos de alta performance e rashguards blindadas da América Latina. Equipamento de campeões mundiais de Jiu-Jitsu e No-Gi.',
    category: 'MARCA_ESPORTIVA',
    country: 'Brasil',
    region: 'São Paulo',
    city: 'São Paulo',
    websiteUrl: 'https://www.stormkimonos.com.br',
    socialInstagram: '@stormkimonosbr',
    contactEmail: 'comercial@stormkimonos.com.br',
    contactPhone: '+55 11 98844-3200',
    whatsappNumber: '+55 11 98844-3200',
    isVerified: true,
    verificationStatus: 'APPROVED',
    followersCount: 18450,
    planId: 'PREMIUM',
    createdAt: '2026-01-15T10:00:00Z',
    modalitiesServed: ['Jiu-Jitsu', 'Judô', 'Wrestling']
  },
  {
    id: 'cp_iron_fist',
    userId: 'usr_promoter_iron',
    companyName: 'Iron Fist Championship',
    tradingName: 'IFC Combat Productions Inc',
    logoUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=1200&auto=format&fit=crop&q=80',
    description: 'Circuito internacional de lutas profissionais de MMA e Muay Thai. Eventos televisionados ao vivo, bolsas de destaque e disputas de cinturão.',
    category: 'PROMOTOR_LUTAS',
    country: 'Brasil',
    region: 'Rio de Janeiro',
    city: 'Rio de Janeiro',
    websiteUrl: 'https://www.ironfistmma.com',
    socialInstagram: '@ironfistchampionship',
    contactEmail: 'contact@ironfistmma.com',
    contactPhone: '+55 21 97722-1100',
    whatsappNumber: '+55 21 97722-1100',
    isVerified: true,
    verificationStatus: 'APPROVED',
    followersCount: 32100,
    planId: 'OFFICIAL_SPONSOR',
    createdAt: '2026-01-20T14:30:00Z',
    modalitiesServed: ['MMA', 'Muay Thai', 'Boxe']
  },
  {
    id: 'cp_venum_store',
    userId: 'usr_venum_store',
    companyName: 'Fight Zone Pro Shop',
    tradingName: 'Fight Zone Equipamentos Esportivos',
    logoUrl: 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=1200&auto=format&fit=crop&q=80',
    description: 'Loja oficial multimarcas especializada em luvas de boxe, caneleiras, bandagens, capacetes e suplementação para atletas de combate.',
    category: 'LOJA_EQUIPAMENTOS',
    country: 'Brasil',
    region: 'Curitiba',
    city: 'Curitiba',
    websiteUrl: 'https://www.fightzonepro.com.br',
    socialInstagram: '@fightzonepro',
    contactEmail: 'vendas@fightzonepro.com.br',
    contactPhone: '+55 41 99123-4567',
    whatsappNumber: '+55 41 99123-4567',
    isVerified: true,
    verificationStatus: 'APPROVED',
    followersCount: 9240,
    planId: 'BUSINESS',
    createdAt: '2026-02-01T09:00:00Z',
    modalitiesServed: ['Boxe', 'Muay Thai', 'MMA', 'Kickboxing']
  }
];

// Initial Ad Campaigns Seed
const SEED_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'camp_storm_kimono_pro',
    companyId: 'cp_storm_fight',
    companyName: 'Storm Kimonos Brasil',
    companyLogo: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=300&auto=format&fit=crop&q=80',
    name: 'Lançamento Kimono Stealth Pro 2026',
    objective: 'VENDER_PRODUTO',
    category: 'Equipamentos & Vestuário',
    title: 'Novo Kimono Stealth Pro 450g — Blindado para Guerra',
    description: 'Tecido trançado ultra leve, reforço triplo nas axilas e lapela antibacteriana. Frete Grátis e 15% OFF para membros da comunidade STRAVA FIGHT!',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80',
    mediaType: 'image',
    destinationUrl: 'https://www.stormkimonos.com.br/promocao-strava-fight',
    ctaLabel: 'Garantir com 15% OFF',
    targetAudience: {
      modalities: ['Jiu-Jitsu', 'Judô'],
      countries: ['Brasil', 'EUA', 'Portugal']
    },
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    budget: 3500,
    spentBudget: 840,
    status: 'ATIVA',
    placement: 'FEED',
    impressionsCount: 14280,
    reachCount: 9850,
    clicksCount: 892,
    likesCount: 314,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-15T12:00:00Z'
  },
  {
    id: 'camp_iron_fist_gp',
    companyId: 'cp_iron_fist',
    companyName: 'Iron Fist Championship',
    companyLogo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&auto=format&fit=crop&q=80',
    name: 'Grand Prix dos Pesos Leves IFC 28',
    objective: 'VENDER_INGRESSO',
    category: 'Eventos & Lutas',
    title: 'IFC 28: Disputa de Cinturão Mundial MMA & GP dos Leves',
    description: '12 combates eletrizantes ao vivo no Maracanãzinho. Assista aos melhores nocauteadores do mundo frente a frente. Ingressos limitados no 1º lote!',
    mediaUrl: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=900&auto=format&fit=crop&q=80',
    mediaType: 'image',
    destinationUrl: 'https://www.ironfistmma.com/ingressos-ifc28',
    ctaLabel: 'Comprar Ingressos 1º Lote',
    targetAudience: {
      modalities: ['MMA', 'Muay Thai', 'Boxe'],
      countries: ['Brasil']
    },
    startDate: '2026-02-10',
    endDate: '2026-03-25',
    budget: 6000,
    spentBudget: 2150,
    status: 'ATIVA',
    placement: 'FEED',
    impressionsCount: 22400,
    reachCount: 15600,
    clicksCount: 1680,
    likesCount: 620,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-18T16:00:00Z'
  },
  {
    id: 'camp_boxing_gloves_fz',
    companyId: 'cp_venum_store',
    companyName: 'Fight Zone Pro Shop',
    companyLogo: 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=300&auto=format&fit=crop&q=80',
    name: 'Luvas de Boxe Pro Sparring Leather',
    objective: 'VENDER_PRODUTO',
    category: 'Equipamentos',
    title: 'Luva de Boxe 100% Couro Legítimo — Proteção Máxima para Seus Punhos',
    description: 'Espuma multicamadas de alta absorção e trava anatômica para polegar. Ideal para sparring pesado e treinos diários.',
    mediaUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&auto=format&fit=crop&q=80',
    mediaType: 'image',
    destinationUrl: 'https://www.fightzonepro.com.br/luvas-couro',
    ctaLabel: 'Ver no Site Oficial',
    targetAudience: {
      modalities: ['Boxe', 'Muay Thai', 'Kickboxing'],
      countries: ['Brasil']
    },
    startDate: '2026-02-15',
    endDate: '2026-05-01',
    budget: 1800,
    spentBudget: 420,
    status: 'ATIVA',
    placement: 'FEED',
    impressionsCount: 8900,
    reachCount: 6300,
    clicksCount: 512,
    likesCount: 185,
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-02-20T14:00:00Z'
  }
];

// Initial Commercial Products Seed
const SEED_PRODUCTS: CommercialProduct[] = [
  {
    id: 'prod_kimono_stealth',
    companyId: 'cp_storm_fight',
    companyName: 'Storm Kimonos Brasil',
    title: 'Kimono Storm Stealth Pro Branco (A1 a A4)',
    category: 'ROUPAS',
    price: 489.90,
    currency: 'BRL',
    description: 'Trançado 450g/m² com calça ripstop militar impermeável. Homologado IBJJF para campeonatos oficiais.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    buyUrl: 'https://www.stormkimonos.com.br/stealth-pro-branco',
    contactWhatsApp: '+55 11 98844-3200',
    modality: 'Jiu-Jitsu',
    isActive: true,
    createdAt: '2026-01-22T10:00:00Z'
  },
  {
    id: 'prod_rashguard_no_gi',
    companyId: 'cp_storm_fight',
    companyName: 'Storm Kimonos Brasil',
    title: 'Rashguard Compression No-Gi Armor',
    category: 'ROUPAS',
    price: 159.90,
    currency: 'BRL',
    description: 'Costura plana Flatlock, proteção UV50+ e estampa sublimada que nunca desbota no tatame.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    buyUrl: 'https://www.stormkimonos.com.br/rashguard-no-gi',
    contactWhatsApp: '+55 11 98844-3200',
    modality: 'Jiu-Jitsu',
    isActive: true,
    createdAt: '2026-01-25T11:00:00Z'
  },
  {
    id: 'prod_luva_boxe_pro',
    companyId: 'cp_venum_store',
    companyName: 'Fight Zone Pro Shop',
    title: 'Luva de Boxe 16oz Pro Combat Couro',
    category: 'EQUIPAMENTOS',
    price: 320.00,
    currency: 'BRL',
    description: 'Ajuste com velcro reforçado no pulso, ideal para sparring seguro sem risco de lesão nas mãos.',
    imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80',
    buyUrl: 'https://www.fightzonepro.com.br/luvas-16oz',
    contactWhatsApp: '+55 41 99123-4567',
    modality: 'Boxe',
    isActive: true,
    createdAt: '2026-02-02T14:00:00Z'
  },
  {
    id: 'prod_caneleira_muaythai',
    companyId: 'cp_venum_store',
    companyName: 'Fight Zone Pro Shop',
    title: 'Caneleira Anatômica Muay Thai King',
    category: 'EQUIPAMENTOS',
    price: 249.90,
    currency: 'BRL',
    description: 'Proteção para canela e peito do pé com densidade tripla para chutes com potência máxima.',
    imageUrl: 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=600&auto=format&fit=crop&q=80',
    buyUrl: 'https://www.fightzonepro.com.br/caneleira-muay-thai',
    contactWhatsApp: '+55 41 99123-4567',
    modality: 'Muay Thai',
    isActive: true,
    createdAt: '2026-02-05T16:00:00Z'
  }
];

// Initial Sponsorship Opportunities Seed
const SEED_OPPORTUNITIES: SponsorshipOpportunity[] = [
  {
    id: 'opp_storm_athletes_2026',
    authorId: 'cp_storm_fight',
    authorName: 'Storm Kimonos Brasil',
    authorAvatar: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=300&auto=format&fit=crop&q=80',
    authorType: 'MARCA',
    title: 'Seleção de Atletas para Patrocínio de Kimonos & Inscrições 2026',
    modality: 'Jiu-Jitsu',
    type: 'PROCURA_ATLETA',
    description: 'Estamos selecionando 6 atletas (3 masculinos e 3 femininos) das faixas Azul, Roxa, Marrom e Preta para apoio oficial com material completo e custeio de inscrições dos Opens CBJJ/IBJJF.',
    requirements: [
      'Pelo menos 2 títulos estaduais ou nacionais comprovados nos últimos 24 meses',
      'Perfil ativo na rede STRAVA FIGHT com Tatame Streak consistente',
      'Boa conduta e disciplina no tatame',
      'Disponibilidade para produzir fotos e reviews com os equipamentos da marca'
    ],
    location: 'Brasil (Envio nacional)',
    country: 'Brasil',
    budgetOrSupport: 'Kit de 4 Kimonos + Rashguards + Inscrições de até R$ 2.500/ano',
    deadline: '2026-04-15',
    contactEmail: 'patrocinio@stormkimonos.com.br',
    contactWhatsApp: '+55 11 98844-3200',
    status: 'ABERTA',
    applicationsCount: 42,
    createdAt: '2026-02-05T10:00:00Z'
  },
  {
    id: 'opp_iron_fist_undercard',
    authorId: 'cp_iron_fist',
    authorName: 'Iron Fist Championship',
    authorAvatar: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&auto=format&fit=crop&q=80',
    authorType: 'EVENTO',
    title: 'Card Preliminar IFC 29: Buscamos Atletas Peso Pena (66kg) e Leve (70kg)',
    modality: 'MMA',
    type: 'PROCURA_ATLETA',
    description: 'Oportunidade para atletas profissionais com cartel positivo no Sherdog/Tapology para lutar no IFC 29 com transmissão ao vivo internacional e bolsa garantida + bônus de nocaute da noite.',
    requirements: [
      'Cartel profissional mínimo de 3 lutas oficiais',
      'Exames médicos de combate em dia (hepatite, HIV, ressonância)',
      'Afiliação ativa a uma academia reconhecida'
    ],
    location: 'Rio de Janeiro, RJ',
    country: 'Brasil',
    budgetOrSupport: 'Bolsa de Luta de R$ 3.000 a R$ 6.000 + Bônus de Vitória',
    deadline: '2026-03-30',
    contactEmail: 'matchmaker@ironfistmma.com',
    contactWhatsApp: '+55 21 97722-1100',
    status: 'ABERTA',
    applicationsCount: 19,
    createdAt: '2026-02-12T15:00:00Z'
  },
  {
    id: 'opp_athlete_seeking_sponsor',
    authorId: 'usr_lucas_bjj',
    authorName: 'Lucas "Pitbull" Ferreira',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    authorType: 'ATLETA',
    title: 'Atleta Faixa Roxa (Top 3 Ranking CBJJ) Busca Patrocínio para Mundial IBJJF na Califórnia',
    modality: 'Jiu-Jitsu',
    type: 'PROCURA_PATROCINADOR',
    description: 'Campeão Sul-Americano 2025 e Campeão Brasileiro 2025. Busco marcas parceiras de suplementos, roupas ou academias para viabilizar passagem aérea e hospedagem no Mundial na Califórnia. Ofereço exposição de logotipo no kimono, posts dedicados com engajamento de 15k seguidores e menções.',
    requirements: [
      'Apoio financeiro ou passagem aérea / suplementação mensal',
      'Contrato de imagem com contrapartida de visibilidade garantida'
    ],
    location: 'São Paulo, SP - Brasil',
    country: 'Brasil',
    budgetOrSupport: 'Cota Master: R$ 4.000 / Cotas Apoio: R$ 1.000',
    deadline: '2026-04-01',
    contactEmail: 'lucaspitbull.bjj@gmail.com',
    contactWhatsApp: '+55 11 97654-3210',
    status: 'ABERTA',
    applicationsCount: 7,
    createdAt: '2026-02-18T18:00:00Z'
  }
];

// Initial Commercial Events Seed
const SEED_COMMERCIAL_EVENTS: CommercialEventEntity[] = [
  {
    id: 'ce_ifc_28',
    organizerId: 'cp_iron_fist',
    organizerName: 'Iron Fist Championship',
    organizerLogo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&auto=format&fit=crop&q=80',
    title: 'IFC 28: Guerra dos Pesos Médios & Super Lutas',
    modality: 'MMA',
    description: 'O maior evento de combate das Américas. 12 lutas profissionais, 2 disputas de título mundial e show de luzes e som.',
    date: '25/03/2026',
    time: '20:00',
    country: 'Brasil',
    city: 'Rio de Janeiro, RJ',
    venue: 'Arena Maracanãzinho',
    bannerUrl: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=1000&auto=format&fit=crop&q=80',
    promoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    athletes: [
      { name: 'Ricardo "Mão de Pedra"', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', record: '14-1-0', role: 'Campeão' },
      { name: 'Diego "Anaconda" Silva', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', record: '12-2-0', role: 'Desafiante' },
      { name: 'Gabriel Santana', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', record: '9-0-0', role: 'Co-main Event' }
    ],
    ticketPrice: 80.00,
    currency: 'BRL',
    ticketUrl: 'https://www.ironfistmma.com/ingressos-ifc28',
    registrationUrl: 'https://www.ironfistmma.com/atletas-inscricao',
    isSponsored: true,
    interestedCount: 1420,
    hasInterested: false,
    createdAt: '2026-02-01T12:00:00Z'
  },
  {
    id: 'ce_bjj_grand_slam',
    organizerId: 'cp_storm_fight',
    organizerName: 'Storm Kimonos Brasil',
    organizerLogo: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=300&auto=format&fit=crop&q=80',
    title: 'Copa Storm Pro BJJ Gi & No-Gi São Paulo',
    modality: 'Jiu-Jitsu',
    description: 'Torneio profissional com premiação em dinheiro para os campeões do Absoluto Faixa Preta e Faixa Marrom. Árbitros certificados e tatames de padrão olímpico.',
    date: '18/04/2026',
    time: '08:30',
    country: 'Brasil',
    city: 'São Paulo, SP',
    venue: 'Ginásio do Ibirapuera',
    bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1000&auto=format&fit=crop&q=80',
    athletes: [
      { name: 'Mestre Uarlei Silva', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', role: 'Super Luta No-Gi' },
      { name: 'Felipe "Trator" Diniz', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', role: 'Super Luta Gi' }
    ],
    ticketPrice: 40.00,
    currency: 'BRL',
    ticketUrl: 'https://www.stormkimonos.com.br/copa-storm-ingressos',
    registrationUrl: 'https://www.stormkimonos.com.br/copa-storm-inscricao',
    isSponsored: true,
    interestedCount: 890,
    hasInterested: true,
    createdAt: '2026-02-10T14:00:00Z'
  }
];

// Initial Audit Logs Seed
const SEED_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log_01',
    adminId: 'admin_sys',
    adminName: 'Equipe de Moderação STRAVA FIGHT',
    action: 'VERIFICAÇÃO_APROVADA',
    targetId: 'cp_storm_fight',
    targetTitle: 'Storm Kimonos Brasil',
    details: 'Perfil comercial verificado e selo concedido após conferência de CNPJ e alvará esportivo.',
    timestamp: '2026-02-01T10:15:00Z'
  },
  {
    id: 'log_02',
    adminId: 'admin_sys',
    adminName: 'Equipe de Moderação STRAVA FIGHT',
    action: 'CAMPANHA_APROVADA',
    targetId: 'camp_storm_kimono_pro',
    targetTitle: 'Lançamento Kimono Stealth Pro 2026',
    details: 'Anúncio em conformidade com as diretrizes comerciais e políticas esportivas da plataforma.',
    timestamp: '2026-02-01T10:20:00Z'
  },
  {
    id: 'log_03',
    adminId: 'admin_sys',
    adminName: 'Equipe de Moderação STRAVA FIGHT',
    action: 'CAMPANHA_APROVADA',
    targetId: 'camp_iron_fist_gp',
    targetTitle: 'Grand Prix dos Pesos Leves IFC 28',
    details: 'Campanha de venda de ingressos do evento IFC 28 verificada e liberada para o feed.',
    timestamp: '2026-02-10T11:45:00Z'
  }
];

// High-performance in-memory cache for SF Business
const bizMemoryCache = new Map<string, any>();


function getBizCached<T>(key: string, seed: T): T {
  if (bizMemoryCache.has(key)) {
    return bizMemoryCache.get(key) as T;
  }
  try {
    if (typeof localStorage === 'undefined') {
      bizMemoryCache.set(key, seed);
      return seed;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      bizMemoryCache.set(key, seed);
      return seed;
    }
    const parsed = JSON.parse(raw);
    bizMemoryCache.set(key, parsed);
    return parsed;
  } catch {
    bizMemoryCache.set(key, seed);
    return seed;
  }
}

function setBizCached<T>(key: string, val: T): void {
  bizMemoryCache.set(key, val);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    console.warn('Biz storage save failed:', e);
  }
}


export class BusinessService {
  // Multilingual helper
  static getLanguage(): BusinessLanguage {
    const saved = localStorage.getItem(BIZ_STORAGE_KEYS.LANGUAGE) as BusinessLanguage;
    return saved || 'pt';
  }

  static setLanguage(lang: BusinessLanguage): void {
    localStorage.setItem(BIZ_STORAGE_KEYS.LANGUAGE, lang);
  }

  // Profiles
  static getProfiles(): CommercialProfile[] {
    return getBizCached(BIZ_STORAGE_KEYS.PROFILES, SEED_PROFILES);
  }

  static saveProfiles(profiles: CommercialProfile[]): void {
    setBizCached(BIZ_STORAGE_KEYS.PROFILES, profiles);
  }

  static getMyCommercialProfile(userId: string): CommercialProfile | null {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.userId === userId) || null;
  }

  static saveCommercialProfile(profile: CommercialProfile): void {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex((p) => p.id === profile.id);
    let updated: CommercialProfile[];
    if (idx >= 0) {
      updated = [...profiles];
      updated[idx] = profile;
    } else {
      updated = [profile, ...profiles];
    }
    this.saveProfiles(updated);
  }

  // Campaigns
  static getCampaigns(): AdCampaign[] {
    return getBizCached(BIZ_STORAGE_KEYS.CAMPAIGNS, SEED_CAMPAIGNS);
  }

  static saveCampaigns(campaigns: AdCampaign[]): void {
    setBizCached(BIZ_STORAGE_KEYS.CAMPAIGNS, campaigns);
  }

  static getActiveCampaignsForPlacement(placement: 'FEED' | 'REELS' | 'STORY'): AdCampaign[] {
    const all = this.getCampaigns();
    return all.filter((c) => c.status === 'ATIVA' && (c.placement === placement || c.placement === 'ALL'));
  }

  static saveCampaign(campaign: AdCampaign): void {
    const campaigns = this.getCampaigns();
    const idx = campaigns.findIndex((c) => c.id === campaign.id);
    let updated: AdCampaign[];
    if (idx >= 0) {
      updated = [...campaigns];
      updated[idx] = { ...campaign, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...campaign, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...campaigns];
    }
    this.saveCampaigns(updated);
  }


  // Products
  static getProducts(): CommercialProduct[] {
    return getBizCached(BIZ_STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
  }

  static saveProducts(products: CommercialProduct[]): void {
    setBizCached(BIZ_STORAGE_KEYS.PRODUCTS, products);
  }

  static saveProduct(product: CommercialProduct): void {
    const prods = this.getProducts();
    const idx = prods.findIndex((p) => p.id === product.id);
    let updated: CommercialProduct[];
    if (idx >= 0) {
      updated = [...prods];
      updated[idx] = product;
    } else {
      updated = [product, ...prods];
    }
    this.saveProducts(updated);
  }

  static deleteProduct(id: string): void {
    const prods = this.getProducts().filter((p) => p.id !== id);
    this.saveProducts(prods);
  }

  // Sponsorship Opportunities
  static getOpportunities(): SponsorshipOpportunity[] {
    return getBizCached(BIZ_STORAGE_KEYS.OPPORTUNITIES, SEED_OPPORTUNITIES);
  }

  static saveOpportunities(opps: SponsorshipOpportunity[]): void {
    setBizCached(BIZ_STORAGE_KEYS.OPPORTUNITIES, opps);
  }

  static saveOpportunity(opp: SponsorshipOpportunity): void {
    const list = this.getOpportunities();
    const idx = list.findIndex((o) => o.id === opp.id);
    let updated: SponsorshipOpportunity[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = opp;
    } else {
      updated = [opp, ...list];
    }
    this.saveOpportunities(updated);
  }

  // Commercial Events
  static getCommercialEvents(): CommercialEventEntity[] {
    return getBizCached(BIZ_STORAGE_KEYS.EVENTS, SEED_COMMERCIAL_EVENTS);
  }

  static saveCommercialEvents(events: CommercialEventEntity[]): void {
    setBizCached(BIZ_STORAGE_KEYS.EVENTS, events);
  }

  static saveCommercialEvent(event: CommercialEventEntity): void {
    const list = this.getCommercialEvents();
    const idx = list.findIndex((e) => e.id === event.id);

    let updated: CommercialEventEntity[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = event;
    } else {
      updated = [event, ...list];
    }
    this.saveCommercialEvents(updated);
  }

  // Analytics & Real Deduplicated Events
  static recordAdImpression(campaignId: string, userId: string, placement: string): void {
    const sessionKey = `ad_imp_${campaignId}_${userId}`;
    const now = Date.now();
    const lastImp = sessionStorage.getItem(sessionKey);
    // Anti-duplicate: only count 1 impression per user/session every 5 minutes
    if (lastImp && now - parseInt(lastImp, 10) < 300000) {
      return;
    }
    sessionStorage.setItem(sessionKey, now.toString());

    // Update campaign counters
    const campaigns = this.getCampaigns();
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          impressionsCount: c.impressionsCount + 1,
          reachCount: c.reachCount + 1
        };
      }
      return c;
    });
    this.saveCampaigns(updated);

    // Save event log
    const log: AdEventLog = {
      id: generateUUID(),
      campaignId,
      eventType: 'IMPRESSION',
      userId,
      timestamp: new Date().toISOString(),
      placement
    };
    this.addEventLog(log);
  }

  static recordAdClick(campaignId: string, userId: string, placement: string): void {
    const sessionKey = `ad_clk_${campaignId}_${userId}`;
    const now = Date.now();
    const lastClk = sessionStorage.getItem(sessionKey);
    // Anti-duplicate: only count 1 click per user/session every 30 seconds
    if (lastClk && now - parseInt(lastClk, 10) < 30000) {
      return;
    }
    sessionStorage.setItem(sessionKey, now.toString());

    // Update campaign counters
    const campaigns = this.getCampaigns();
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          clicksCount: c.clicksCount + 1
        };
      }
      return c;
    });
    this.saveCampaigns(updated);

    // Save event log
    const log: AdEventLog = {
      id: generateUUID(),
      campaignId,
      eventType: 'CLICK',
      userId,
      timestamp: new Date().toISOString(),
      placement
    };
    this.addEventLog(log);
  }

  private static addEventLog(log: AdEventLog): void {
    try {
      const raw = localStorage.getItem(BIZ_STORAGE_KEYS.EVENT_LOGS);
      const list: AdEventLog[] = raw ? JSON.parse(raw) : [];
      // Keep only last 1000 logs to prevent storage bloat
      const capped = [log, ...list].slice(0, 1000);
      localStorage.setItem(BIZ_STORAGE_KEYS.EVENT_LOGS, JSON.stringify(capped));
    } catch {
      // Storage quota safety
    }
  }

  // Moderation & Reports
  static getReports(): AdReportComplaint[] {
    const raw = localStorage.getItem(BIZ_STORAGE_KEYS.REPORTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static submitReport(report: Omit<AdReportComplaint, 'id' | 'createdAt' | 'status'>): void {
    const reports = this.getReports();
    const newReport: AdReportComplaint = {
      ...report,
      id: generateUUID(),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(BIZ_STORAGE_KEYS.REPORTS, JSON.stringify([newReport, ...reports]));
  }

  static resolveReport(reportId: string, status: 'RESOLVED' | 'DISMISSED'): void {
    const reports = this.getReports().map((r) => (r.id === reportId ? { ...r, status } : r));
    localStorage.setItem(BIZ_STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }

  // Audit Logs
  static getAuditLogs(): AdminAuditLog[] {
    const raw = localStorage.getItem(BIZ_STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(BIZ_STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_AUDIT_LOGS;
    }
  }

  static addAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AdminAuditLog = {
      ...log,
      id: generateUUID(),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(BIZ_STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([newLog, ...logs].slice(0, 200)));
  }
}
