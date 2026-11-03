import { BusinessLanguage } from '../types';

export const BUSINESS_TRANSLATIONS = {
  pt: {
    title: 'SF BUSINESS',
    subtitle: 'Ambiente Global de Negócios, Patrocínios & Anúncios STRAVA FIGHT',
    tabs: {
      dashboard: 'Visão Geral',
      campaigns: 'Central de Anúncios',
      profile: 'Perfil Comercial',
      products: 'Produtos & Serviços',
      sponsorships: 'Patrocínios & Vagas',
      events: 'Eventos & Lutas',
      plans: 'Planos Comerciais',
      admin: 'Moderação Admin'
    },
    metrics: {
      impressions: 'Visualizações',
      reach: 'Alcance Único',
      clicks: 'Cliques no Link',
      ctr: 'Taxa de Cliques (CTR)',
      activeCampaigns: 'Campanhas Ativas',
      totalSpent: 'Investimento Total'
    },
    campaigns: {
      newCampaign: 'Criar Nova Campanha',
      editCampaign: 'Editar Campanha',
      pause: 'Pausar',
      resume: 'Ativar',
      duplicate: 'Duplicar',
      status: 'Status',
      objective: 'Objetivo',
      budget: 'Orçamento',
      dates: 'Período',
      preview: 'Prévia do Anúncio',
      sponsoredTag: 'PATROCINADO',
      submitApproval: 'Enviar para Aprovação',
      waitingApproval: 'Aguardando Aprovação',
      approved: 'Aprovada',
      active: 'Ativa',
      paused: 'Pausada',
      ended: 'Encerrada',
      rejected: 'Reprovada'
    },
    profile: {
      createOrEdit: 'Configurar Perfil Comercial',
      transformAccount: 'Transformar em Perfil Comercial',
      alreadyCommercial: 'Sua conta possui Perfil Comercial Ativo',
      companyName: 'Nome da Empresa / Marca',
      tradingName: 'Razão Social / Nome Fantasia',
      category: 'Categoria de Atuação',
      country: 'País de Origem',
      region: 'Estado / Região',
      city: 'Cidade',
      website: 'Site Oficial',
      whatsapp: 'WhatsApp Comercial',
      email: 'E-mail Comercial',
      description: 'Apresentação Comercial & Bio',
      logo: 'URL do Logotipo',
      cover: 'URL da Capa',
      requestVerification: 'Solicitar Selo de Verificado Oficial',
      verifiedBadge: 'Empresa Verificada STRAVA FIGHT'
    },
    products: {
      title: 'Catálogo de Produtos & Serviços',
      addProduct: 'Adicionar Produto ou Serviço',
      price: 'Preço',
      buyNow: 'Comprar no Site',
      contactSeller: 'Falar com Vendedor',
      categories: {
        ROUPAS: 'Roupas & Vestuário',
        EQUIPAMENTOS: 'Equipamentos de Luta',
        ACESSORIOS: 'Acessórios & Proteções',
        CURSOS: 'Cursos & Treinamentos Online',
        TREINAMENTOS: 'Aulas Particulares & Sparrings',
        SERVICOS: 'Serviços de Saúde & Fisioterapia',
        ASSINATURAS: 'Planos & Mensalidades de Academia'
      }
    },
    sponsorships: {
      title: 'Mural de Patrocínios & Oportunidades',
      newOpportunity: 'Publicar Nova Oportunidade',
      seekingAthletes: 'Marcas Procurando Atletas',
      seekingSponsors: 'Atletas Procurando Patrocinadores',
      seekingEvents: 'Eventos Procurando Apoiadores',
      apply: 'Candidatar-se / Entrar em Contato',
      requirements: 'Requisitos & Critérios',
      supportValue: 'Apoio / Cota Oferecida',
      deadline: 'Prazo Limite'
    },
    events: {
      title: 'Eventos, Lutas & Campeonatos Patrocinados',
      newEvent: 'Cadastrar Evento Comercial',
      ticket: 'Ingressos',
      buyTicket: 'Garantir Ingresso',
      registerAthlete: 'Inscrição de Atletas',
      interested: 'Demonstrar Interesse',
      confirmedAthletes: 'Atletas Confirmados no Card'
    },
    plans: {
      title: 'Planos de Divulgação Comercial',
      currentPlan: 'Seu Plano Atual',
      upgrade: 'Fazer Upgrade',
      gatewayNotice: 'Integração transparente: os pagamentos utilizam faturamento seguro homologado. Em ambiente de pré-visualização, simulações sem cobrança real.'
    },
    admin: {
      title: 'Painel Administrativo & Moderação',
      pendingCampaigns: 'Campanhas Aguardando Revisão',
      approve: 'Aprovar',
      reject: 'Reprovar',
      rejectionReason: 'Motivo da Reprovação',
      verifyProfile: 'Verificar Empresa',
      complaints: 'Denúncias de Anúncios',
      auditLogs: 'Histórico de Ações da Moderação'
    }
  },
  en: {
    title: 'SF BUSINESS',
    subtitle: 'Global Commercial Hub, Sponsorships & Advertising on STRAVA FIGHT',
    tabs: {
      dashboard: 'Overview',
      campaigns: 'Ad Campaign Center',
      profile: 'Commercial Profile',
      products: 'Products & Services',
      sponsorships: 'Sponsorships & Scouting',
      events: 'Events & Fights',
      plans: 'Business Plans',
      admin: 'Admin Moderation'
    },
    metrics: {
      impressions: 'Impressions',
      reach: 'Unique Reach',
      clicks: 'Link Clicks',
      ctr: 'Click-Through Rate (CTR)',
      activeCampaigns: 'Active Campaigns',
      totalSpent: 'Total Investment'
    },
    campaigns: {
      newCampaign: 'Create Campaign',
      editCampaign: 'Edit Campaign',
      pause: 'Pause',
      resume: 'Resume',
      duplicate: 'Duplicate',
      status: 'Status',
      objective: 'Objective',
      budget: 'Budget',
      dates: 'Flight Dates',
      preview: 'Ad Preview',
      sponsoredTag: 'SPONSORED',
      submitApproval: 'Submit for Review',
      waitingApproval: 'Under Review',
      approved: 'Approved',
      active: 'Active',
      paused: 'Paused',
      ended: 'Ended',
      rejected: 'Rejected'
    },
    profile: {
      createOrEdit: 'Set up Business Profile',
      transformAccount: 'Convert to Business Profile',
      alreadyCommercial: 'Active Business Profile Connected',
      companyName: 'Company / Brand Name',
      tradingName: 'Legal Business Name',
      category: 'Industry Category',
      country: 'Country',
      region: 'State / Region',
      city: 'City',
      website: 'Official Website',
      whatsapp: 'Business WhatsApp',
      email: 'Business Email',
      description: 'Commercial Bio & Mission',
      logo: 'Brand Logo URL',
      cover: 'Cover Image URL',
      requestVerification: 'Request Official Verification Badge',
      verifiedBadge: 'Verified STRAVA FIGHT Business'
    },
    products: {
      title: 'Products & Services Showcase',
      addProduct: 'Add Product or Service',
      price: 'Price',
      buyNow: 'Buy on Store',
      contactSeller: 'Contact Seller',
      categories: {
        ROUPAS: 'Fightwear & Apparel',
        EQUIPAMENTOS: 'Combat Sports Gear',
        ACESSORIOS: 'Protective Accessories',
        CURSOS: 'Online Masterclasses',
        TREINAMENTOS: 'Private Coaching & Sparring',
        SERVICOS: 'Health & Physical Therapy',
        ASSINATURAS: 'Gym Memberships & Plans'
      }
    },
    sponsorships: {
      title: 'Sponsorships & Athlete Scouting',
      newOpportunity: 'Post Opportunity',
      seekingAthletes: 'Brands Seeking Fighters',
      seekingSponsors: 'Fighters Seeking Sponsors',
      seekingEvents: 'Events Seeking Partners',
      apply: 'Apply / Get in Touch',
      requirements: 'Requirements & Criteria',
      supportValue: 'Support & Purse Offer',
      deadline: 'Deadline'
    },
    events: {
      title: 'Commercial Events & Fight Cards',
      newEvent: 'Register Fight Event',
      ticket: 'Tickets',
      buyTicket: 'Get Tickets',
      registerAthlete: 'Fighter Registration',
      interested: 'RSVP / Interested',
      confirmedAthletes: 'Confirmed Fighters'
    },
    plans: {
      title: 'Commercial Advertising Plans',
      currentPlan: 'Your Current Plan',
      upgrade: 'Upgrade Plan',
      gatewayNotice: 'Payment integration architecture prepared for verified gateways. Demo preview operates safely without actual charges.'
    },
    admin: {
      title: 'Admin Moderation & Compliance',
      pendingCampaigns: 'Campaigns Pending Review',
      approve: 'Approve',
      reject: 'Reject',
      rejectionReason: 'Rejection Reason',
      verifyProfile: 'Verify Business',
      complaints: 'User Reports & Complaints',
      auditLogs: 'Moderation Audit Trail'
    }
  },
  es: {
    title: 'SF BUSINESS',
    subtitle: 'Ambiente Comercial Global, Patrocinios y Publicidad STRAVA FIGHT',
    tabs: {
      dashboard: 'Resumen',
      campaigns: 'Central de Anuncios',
      profile: 'Perfil Comercial',
      products: 'Productos y Servicios',
      sponsorships: 'Patrocinios y Oportunidades',
      events: 'Eventos y Combates',
      plans: 'Planes Comerciales',
      admin: 'Moderación Admin'
    },
    metrics: {
      impressions: 'Impresiones',
      reach: 'Alcance Único',
      clicks: 'Clics en el Enlace',
      ctr: 'Tasa de Clics (CTR)',
      activeCampaigns: 'Campañas Activas',
      totalSpent: 'Inversión Total'
    },
    campaigns: {
      newCampaign: 'Crear Nueva Campaña',
      editCampaign: 'Editar Campaña',
      pause: 'Pausar',
      resume: 'Activar',
      duplicate: 'Duplicar',
      status: 'Estado',
      objective: 'Objetivo',
      budget: 'Presupuesto',
      dates: 'Período',
      preview: 'Vista Previa del Anuncio',
      sponsoredTag: 'PATROCINADO',
      submitApproval: 'Enviar a Aprobación',
      waitingApproval: 'Esperando Aprobación',
      approved: 'Aprobada',
      active: 'Activa',
      paused: 'Pausada',
      ended: 'Finalizada',
      rejected: 'Rechazada'
    },
    profile: {
      createOrEdit: 'Configurar Perfil Comercial',
      transformAccount: 'Convertir en Perfil Comercial',
      alreadyCommercial: 'Perfil Comercial Activo',
      companyName: 'Nombre de la Empresa / Marca',
      tradingName: 'Razón Social / Nombre Comercial',
      category: 'Categoría',
      country: 'País',
      region: 'Estado / Región',
      city: 'Ciudad',
      website: 'Sitio Web Oficial',
      whatsapp: 'WhatsApp Comercial',
      email: 'Correo Comercial',
      description: 'Presentación Comercial',
      logo: 'URL del Logotipo',
      cover: 'URL de Portada',
      requestVerification: 'Solicitar Insignia de Verificado',
      verifiedBadge: 'Empresa Verificada STRAVA FIGHT'
    },
    products: {
      title: 'Catálogo de Productos y Servicios',
      addProduct: 'Añadir Producto o Servicio',
      price: 'Precio',
      buyNow: 'Comprar en la Tienda',
      contactSeller: 'Contactar al Vendedor',
      categories: {
        ROUPAS: 'Ropa Deportiva y Gi',
        EQUIPAMENTOS: 'Equipos de Combate',
        ACESSORIOS: 'Protecciones y Accesorios',
        CURSOS: 'Cursos Online',
        TREINAMENTOS: 'Entrenamiento Privado y Sparring',
        SERVICOS: 'Salud y Fisioterapia',
        ASSINATURAS: 'Planes y Membresías de Gimnasio'
      }
    },
    sponsorships: {
      title: 'Mural de Patrocinios y Oportunidades',
      newOpportunity: 'Publicar Oportunidad',
      seekingAthletes: 'Marcas Buscando Atletas',
      seekingSponsors: 'Atletas Buscando Patrocinadores',
      seekingEvents: 'Eventos Buscando Apoyo',
      apply: 'Postularse / Contactar',
      requirements: 'Requisitos y Criterios',
      supportValue: 'Apoyo / Bolsa Ofrecida',
      deadline: 'Fecha Límite'
    },
    events: {
      title: 'Eventos y Combates Comerciales',
      newEvent: 'Registrar Evento',
      ticket: 'Entradas',
      buyTicket: 'Comprar Entradas',
      registerAthlete: 'Inscripción de Luchadores',
      interested: 'Demostrar Interés',
      confirmedAthletes: 'Luchadores Confirmados'
    },
    plans: {
      title: 'Planes Comerciales de Difusión',
      currentPlan: 'Tu Plan Actual',
      upgrade: 'Mejorar Plan',
      gatewayNotice: 'Integración segura preparada para pasarelas oficiales de pago. Modo vista previa sin cargos reales.'
    },
    admin: {
      title: 'Panel de Moderación Admin',
      pendingCampaigns: 'Campañas Pendientes de Revisión',
      approve: 'Aprobar',
      reject: 'Rechazar',
      rejectionReason: 'Motivo del Rechazo',
      verifyProfile: 'Verificar Empresa',
      complaints: 'Reportes y Denuncias',
      auditLogs: 'Historial de Auditoría'
    }
  }
};
