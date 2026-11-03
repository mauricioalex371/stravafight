import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  Users, 
  DollarSign, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Pause, 
  Play, 
  Copy, 
  Edit, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  ShoppingBag, 
  Trophy, 
  Globe, 
  Mail, 
  Phone, 
  Sparkles, 
  Share2, 
  Filter, 
  Check, 
  X, 
  Trash2,
  Building2,
  Calendar,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  UserProfile, 
  CommercialProfile, 
  AdCampaign, 
  CommercialProduct, 
  SponsorshipOpportunity, 
  CommercialEventEntity,
  AdObjective,
  AdStatus,
  CommercialCategory,
  BusinessLanguage,
  AdReportComplaint,
  AdminAuditLog
} from '../types';
import { BusinessService, COMMERCIAL_PLANS } from '../services/businessService';
import { BUSINESS_TRANSLATIONS } from '../utils/businessI18n';
import { generateUUID, formatCurrency } from '../utils/formatters';

interface BusinessViewProps {
  currentUser: UserProfile;
  onNavigateView: (view: string) => void;
}

export const BusinessView: React.FC<BusinessViewProps> = ({
  currentUser,
  onNavigateView
}) => {
  // Language & Translations
  const [lang, setLang] = useState<BusinessLanguage>(BusinessService.getLanguage());
  const t = BUSINESS_TRANSLATIONS[lang] || BUSINESS_TRANSLATIONS.pt;

  // Active Subtab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'campaigns' | 'profile' | 'products' | 'sponsorships' | 'events' | 'plans' | 'admin'
  >('dashboard');

  // State Collections
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [myProfile, setMyProfile] = useState<CommercialProfile | null>(null);
  const [products, setProducts] = useState<CommercialProduct[]>([]);
  const [opportunities, setOpportunities] = useState<SponsorshipOpportunity[]>([]);
  const [commercialEvents, setCommercialEvents] = useState<CommercialEventEntity[]>([]);
  const [reports, setReports] = useState<AdReportComplaint[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Modals & Forms
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);

  // Campaign Form State
  const [campName, setCampName] = useState('');
  const [campObjective, setCampObjective] = useState<AdObjective>('VENDER_PRODUTO');
  const [campCategory, setCampCategory] = useState('Equipamentos');
  const [campTitle, setCampTitle] = useState('');
  const [campDescription, setCampDescription] = useState('');
  const [campMediaUrl, setCampMediaUrl] = useState('');
  const [campDestinationUrl, setCampDestinationUrl] = useState('');
  const [campCtaLabel, setCampCtaLabel] = useState('Comprar Agora');
  const [campModalities, setCampModalities] = useState<string[]>(['Jiu-Jitsu', 'Muay Thai', 'MMA']);
  const [campCountries, setCampCountries] = useState<string[]>(['Brasil']);
  const [campBudget, setCampBudget] = useState('500');
  const [campPlacement, setCampPlacement] = useState<'FEED' | 'REELS' | 'STORY' | 'ALL'>('FEED');

  // Commercial Profile Form State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compTradingName, setCompTradingName] = useState('');
  const [compCategory, setCompCategory] = useState<CommercialCategory>('MARCA_ESPORTIVA');
  const [compLogoUrl, setCompLogoUrl] = useState('');
  const [compCoverUrl, setCompCoverUrl] = useState('');
  const [compDescription, setCompDescription] = useState('');
  const [compCountry, setCompCountry] = useState('Brasil');
  const [compRegion, setCompRegion] = useState('São Paulo, SP');
  const [compWebsite, setCompWebsite] = useState('');
  const [compInstagram, setCompInstagram] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compWhatsapp, setCompWhatsapp] = useState('');

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState<'ROUPAS' | 'EQUIPAMENTOS' | 'ACESSORIOS' | 'CURSOS' | 'TREINAMENTOS' | 'SERVICOS' | 'ASSINATURAS'>('EQUIPAMENTOS');
  const [prodPrice, setProdPrice] = useState('199.90');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodBuyUrl, setProdBuyUrl] = useState('');
  const [prodModality, setProdModality] = useState('Jiu-Jitsu');

  // Opportunity Form State
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppModality, setOppModality] = useState('Jiu-Jitsu');
  const [oppType, setOppType] = useState<'PROCURA_ATLETA' | 'PROCURA_PATROCINADOR' | 'PROCURA_APOIADOR' | 'PROCURA_PARCEIRO' | 'VAGA_TRABALHO'>('PROCURA_ATLETA');
  const [oppDesc, setOppDesc] = useState('');
  const [oppReqs, setOppReqs] = useState('Faixa Azul a Preta\n2 Títulos Estaduais\nDisponibilidade para fotos');
  const [oppSupport, setOppSupport] = useState('Kit de Kimonos + Apoio em Inscrições');
  const [oppDeadline, setOppDeadline] = useState('30/04/2026');
  const [oppEmail, setOppEmail] = useState('');
  const [oppWhatsapp, setOppWhatsapp] = useState('');

  // Commercial Event Form State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evModality, setEvModality] = useState('MMA');
  const [evDesc, setEvDesc] = useState('');
  const [evDate, setEvDate] = useState('15/05/2026');
  const [evTime, setEvTime] = useState('19:30');
  const [evCity, setEvCity] = useState('São Paulo, SP');
  const [evVenue, setEvVenue] = useState('Ginásio do Ibirapuera');
  const [evBanner, setEvBanner] = useState('https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=1000&auto=format&fit=crop&q=80');
  const [evPrice, setEvPrice] = useState('60.00');
  const [evTicketUrl, setEvTicketUrl] = useState('');

  // Admin Rejection Prompt
  const [rejectingCampaignId, setRejectingCampaignId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Load all initial business data
  const loadBusinessData = () => {
    setCampaigns(BusinessService.getCampaigns());
    setMyProfile(BusinessService.getMyCommercialProfile(currentUser.id));
    setProducts(BusinessService.getProducts());
    setOpportunities(BusinessService.getOpportunities());
    setCommercialEvents(BusinessService.getCommercialEvents());
    setReports(BusinessService.getReports());
    setAuditLogs(BusinessService.getAuditLogs());
  };

  useEffect(() => {
    loadBusinessData();
  }, [currentUser.id]);

  const handleLanguageChange = (newLang: BusinessLanguage) => {
    setLang(newLang);
    BusinessService.setLanguage(newLang);
  };

  // Metrics Calculation
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressionsCount || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + (c.reachCount || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'ATIVA').length;
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spentBudget || 0), 0);

  // Campaign Handlers
  const handleOpenCreateCampaign = () => {
    setEditingCampaign(null);
    setCampName('');
    setCampObjective('VENDER_PRODUTO');
    setCampCategory('Equipamentos & Luta');
    setCampTitle('');
    setCampDescription('');
    setCampMediaUrl('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80');
    setCampDestinationUrl('https://www.stravafight.com');
    setCampCtaLabel('Comprar Agora');
    setCampModalities(['Jiu-Jitsu', 'Muay Thai', 'MMA']);
    setCampCountries(['Brasil']);
    setCampBudget('600');
    setCampPlacement('FEED');
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaignSubmit = (e: React.FormEvent, submitForApproval: boolean) => {
    e.preventDefault();
    if (!campTitle.trim() || !campName.trim()) return;

    const companyName = myProfile?.companyName || currentUser.fullName;
    const companyLogo = myProfile?.logoUrl || currentUser.avatarUrl;
    const companyId = myProfile?.id || currentUser.id;

    const newCamp: AdCampaign = {
      id: editingCampaign ? editingCampaign.id : generateUUID(),
      companyId,
      companyName,
      companyLogo,
      name: campName.trim(),
      objective: campObjective,
      category: campCategory,
      title: campTitle.trim(),
      description: campDescription.trim(),
      mediaUrl: campMediaUrl.trim() || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80',
      mediaType: 'image',
      destinationUrl: campDestinationUrl.trim() || 'https://www.stravafight.com',
      ctaLabel: campCtaLabel.trim() || 'Saiba Mais',
      targetAudience: {
        modalities: campModalities,
        countries: campCountries
      },
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      budget: parseFloat(campBudget) || 500,
      spentBudget: editingCampaign ? editingCampaign.spentBudget : 0,
      status: submitForApproval ? 'AGUARDANDO_APROVACAO' : 'RASCUNHO',
      placement: campPlacement,
      impressionsCount: editingCampaign ? editingCampaign.impressionsCount : 0,
      reachCount: editingCampaign ? editingCampaign.reachCount : 0,
      clicksCount: editingCampaign ? editingCampaign.clicksCount : 0,
      likesCount: editingCampaign ? editingCampaign.likesCount : 0,
      createdAt: editingCampaign ? editingCampaign.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    BusinessService.saveCampaign(newCamp);
    BusinessService.addAuditLog({
      adminId: currentUser.id,
      adminName: currentUser.fullName,
      action: submitForApproval ? 'CAMPANHA_ENVIADA_APROVACAO' : 'CAMPANHA_CRIADA_RASCUNHO',
      targetId: newCamp.id,
      targetTitle: newCamp.title,
      details: `Campanha criada por @${currentUser.username} com orçamento de R$ ${newCamp.budget}`
    });

    setIsCampaignModalOpen(false);
    loadBusinessData();
  };

  const handleTogglePauseCampaign = (camp: AdCampaign) => {
    const nextStatus: AdStatus = camp.status === 'ATIVA' ? 'PAUSADA' : 'ATIVA';
    const updated = { ...camp, status: nextStatus };
    BusinessService.saveCampaign(updated);
    BusinessService.addAuditLog({
      adminId: currentUser.id,
      adminName: currentUser.fullName,
      action: nextStatus === 'ATIVA' ? 'CAMPANHA_REATIVADA' : 'CAMPANHA_PAUSADA',
      targetId: camp.id,
      targetTitle: camp.title,
      details: `Status alterado para ${nextStatus}`
    });
    loadBusinessData();
  };

  const handleDuplicateCampaign = (camp: AdCampaign) => {
    const duplicated: AdCampaign = {
      ...camp,
      id: generateUUID(),
      name: `${camp.name} (Cópia)`,
      status: 'RASCUNHO',
      impressionsCount: 0,
      reachCount: 0,
      clicksCount: 0,
      likesCount: 0,
      spentBudget: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    BusinessService.saveCampaign(duplicated);
    loadBusinessData();
  };

  // Profile Save
  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    const profile: CommercialProfile = {
      id: myProfile ? myProfile.id : generateUUID(),
      userId: currentUser.id,
      companyName: compName.trim(),
      tradingName: compTradingName.trim() || undefined,
      logoUrl: compLogoUrl.trim() || currentUser.avatarUrl,
      coverUrl: compCoverUrl.trim() || currentUser.coverUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
      description: compDescription.trim(),
      category: compCategory,
      country: compCountry.trim() || 'Brasil',
      region: compRegion.trim() || 'São Paulo',
      websiteUrl: compWebsite.trim() || undefined,
      socialInstagram: compInstagram.trim() || undefined,
      contactEmail: compEmail.trim() || 'comercial@empresa.com',
      contactPhone: compPhone.trim() || '+55 11 99999-9999',
      whatsappNumber: compWhatsapp.trim() || '+55 11 99999-9999',
      isVerified: myProfile ? myProfile.isVerified : false,
      verificationStatus: myProfile ? myProfile.verificationStatus : 'PENDING',
      followersCount: myProfile ? myProfile.followersCount : 150,
      planId: myProfile ? myProfile.planId : 'BUSINESS',
      createdAt: myProfile ? myProfile.createdAt : new Date().toISOString(),
      modalitiesServed: ['Jiu-Jitsu', 'Muay Thai', 'MMA', 'Boxe']
    };

    BusinessService.saveCommercialProfile(profile);
    BusinessService.addAuditLog({
      adminId: currentUser.id,
      adminName: currentUser.fullName,
      action: 'PERFIL_COMERCIAL_ATUALIZADO',
      targetId: profile.id,
      targetTitle: profile.companyName,
      details: `Perfil comercial salvo pelo usuário @${currentUser.username}`
    });

    setIsProfileModalOpen(false);
    loadBusinessData();
  };

  const handleOpenEditProfile = () => {
    if (myProfile) {
      setCompName(myProfile.companyName);
      setCompTradingName(myProfile.tradingName || '');
      setCompCategory(myProfile.category);
      setCompLogoUrl(myProfile.logoUrl);
      setCompCoverUrl(myProfile.coverUrl);
      setCompDescription(myProfile.description);
      setCompCountry(myProfile.country);
      setCompRegion(myProfile.region);
      setCompWebsite(myProfile.websiteUrl || '');
      setCompInstagram(myProfile.socialInstagram || '');
      setCompEmail(myProfile.contactEmail);
      setCompPhone(myProfile.contactPhone);
      setCompWhatsapp(myProfile.whatsappNumber);
    } else {
      setCompName(currentUser.fullName + ' Fight Shop');
      setCompTradingName(currentUser.fullName + ' Comércio Esportivo');
      setCompCategory('MARCA_ESPORTIVA');
      setCompLogoUrl(currentUser.avatarUrl);
      setCompCoverUrl(currentUser.coverUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80');
      setCompDescription('Especialistas em produtos de alta performance para atletas de combate.');
      setCompCountry('Brasil');
      setCompRegion('São Paulo, SP');
      setCompWebsite('https://www.stravafight.com');
      setCompInstagram('@' + currentUser.username);
      setCompEmail('comercial@' + currentUser.username + '.com');
      setCompPhone('+55 11 98844-3200');
      setCompWhatsapp('+55 11 98844-3200');
    }
    setIsProfileModalOpen(true);
  };

  // Product Save
  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) return;

    const newProd: CommercialProduct = {
      id: generateUUID(),
      companyId: myProfile?.id || currentUser.id,
      companyName: myProfile?.companyName || currentUser.fullName,
      title: prodTitle.trim(),
      category: prodCategory,
      price: parseFloat(prodPrice) || 0,
      currency: 'BRL',
      description: prodDesc.trim(),
      imageUrl: prodImage.trim() || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      buyUrl: prodBuyUrl.trim() || 'https://www.stravafight.com',
      contactWhatsApp: myProfile?.whatsappNumber || '+55 11 98844-3200',
      modality: prodModality,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    BusinessService.saveProduct(newProd);
    setIsProductModalOpen(false);
    loadBusinessData();
  };

  // Opportunity Save
  const handleSaveOppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle.trim()) return;

    const newOpp: SponsorshipOpportunity = {
      id: generateUUID(),
      authorId: myProfile?.id || currentUser.id,
      authorName: myProfile?.companyName || currentUser.fullName,
      authorAvatar: myProfile?.logoUrl || currentUser.avatarUrl,
      authorType: myProfile ? 'MARCA' : 'ATLETA',
      title: oppTitle.trim(),
      modality: oppModality,
      type: oppType,
      description: oppDesc.trim(),
      requirements: oppReqs.split('\n').filter((r) => r.trim().length > 0),
      location: 'Brasil',
      country: 'Brasil',
      budgetOrSupport: oppSupport.trim() || 'Apoio em material',
      deadline: oppDeadline.trim() || '30 dias',
      contactEmail: oppEmail.trim() || myProfile?.contactEmail || 'contato@stravafight.com',
      contactWhatsApp: oppWhatsapp.trim() || myProfile?.whatsappNumber || '+55 11 98844-3200',
      status: 'ABERTA',
      applicationsCount: 0,
      createdAt: new Date().toISOString()
    };

    BusinessService.saveOpportunity(newOpp);
    setIsOppModalOpen(false);
    loadBusinessData();
  };

  // Commercial Event Save
  const handleSaveEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;

    const newEv: CommercialEventEntity = {
      id: generateUUID(),
      organizerId: myProfile?.id || currentUser.id,
      organizerName: myProfile?.companyName || currentUser.fullName,
      organizerLogo: myProfile?.logoUrl || currentUser.avatarUrl,
      title: evTitle.trim(),
      modality: evModality,
      description: evDesc.trim(),
      date: evDate.trim(),
      time: evTime.trim(),
      country: 'Brasil',
      city: evCity.trim(),
      venue: evVenue.trim(),
      bannerUrl: evBanner.trim(),
      ticketPrice: parseFloat(evPrice) || 0,
      currency: 'BRL',
      ticketUrl: evTicketUrl.trim() || 'https://www.stravafight.com/ingressos',
      isSponsored: true,
      interestedCount: 1,
      createdAt: new Date().toISOString()
    };

    BusinessService.saveCommercialEvent(newEv);
    setIsEventModalOpen(false);
    loadBusinessData();
  };

  // Admin Actions
  const handleAdminApproveCampaign = (camp: AdCampaign) => {
    const updated = { ...camp, status: 'ATIVA' as AdStatus, rejectionReason: undefined };
    BusinessService.saveCampaign(updated);
    BusinessService.addAuditLog({
      adminId: currentUser.id,
      adminName: currentUser.fullName,
      action: 'CAMPANHA_APROVADA_ADMIN',
      targetId: camp.id,
      targetTitle: camp.title,
      details: `Campanha aprovada pela moderação para veiculação pública.`
    });
    loadBusinessData();
  };

  const handleAdminRejectCampaign = (campId: string) => {
    if (!rejectionReasonInput.trim()) return;
    const camp = campaigns.find((c) => c.id === campId);
    if (!camp) return;

    const updated = { 
      ...camp, 
      status: 'REPROVADA' as AdStatus, 
      rejectionReason: rejectionReasonInput.trim() 
    };
    BusinessService.saveCampaign(updated);
    BusinessService.addAuditLog({
      adminId: currentUser.id,
      adminName: currentUser.fullName,
      action: 'CAMPANHA_REPROVADA_ADMIN',
      targetId: camp.id,
      targetTitle: camp.title,
      details: `Motivo: ${rejectionReasonInput.trim()}`
    });
    setRejectingCampaignId(null);
    setRejectionReasonInput('');
    loadBusinessData();
  };

  const handleAdminVerifyProfile = (profile: CommercialProfile) => {
    const updated = { 
      ...profile, 
      isVerified: true, 
      verificationStatus: 'APPROVED' as const 
    };
    BusinessService.saveCommercialProfile(updated);
    BusinessService.addAuditLog({
      adminId: currentUser.id,
      adminName: currentUser.fullName,
      action: 'PERFIL_VERIFICADO_ADMIN',
      targetId: profile.id,
      targetTitle: profile.companyName,
      details: `Selo oficial de empresa verificada concedido.`
    });
    loadBusinessData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071321] via-[#0B1526] to-[#071321] border border-[#171C25] p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F20D18]/20 border border-[#F20D18]/40 text-[#F20D18] text-[10px] font-black uppercase tracking-wider">
                COMMERCIAL ECOSYSTEM
              </span>
              <span className="text-[10px] text-[#94A3B8] font-semibold">
                STRAVA FIGHT GLOBAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{t.title}</span>
              <Sparkles className="w-5 h-5 text-[#F20D18]" />
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Actions & Language Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-[#05070B] border border-[#171C25] rounded-xl p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-[#94A3B8] ml-2 mr-1" />
              {(['pt', 'en', 'es'] as BusinessLanguage[]).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLanguageChange(l)}
                  className={`px-2 py-1 rounded-lg uppercase font-bold text-[10px] transition-all ${
                    lang === l
                      ? 'bg-[#F20D18] text-white shadow-sm'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenCreateCampaign}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white text-xs font-black shadow-lg shadow-[#F20D18]/30 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.campaigns.newCampaign}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-[#071321]/60 border border-[#171C25] rounded-2xl">
        {[
          { id: 'dashboard', label: t.tabs.dashboard, icon: TrendingUp },
          { id: 'campaigns', label: t.tabs.campaigns, icon: Layers, badge: campaigns.length },
          { id: 'profile', label: t.tabs.profile, icon: Building2 },
          { id: 'products', label: t.tabs.products, icon: ShoppingBag, badge: products.length },
          { id: 'sponsorships', label: t.tabs.sponsorships, icon: Trophy, badge: opportunities.length },
          { id: 'events', label: t.tabs.events, icon: Calendar, badge: commercialEvents.length },
          { id: 'plans', label: t.tabs.plans, icon: DollarSign },
          { id: 'admin', label: t.tabs.admin, icon: ShieldCheck, highlight: true }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#F20D18] text-white shadow-md shadow-[#F20D18]/25'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  isActive ? 'bg-white text-[#F20D18]' : 'bg-[#171C25] text-[#94A3B8]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: DASHBOARD / VISÃO GERAL
      ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: t.metrics.impressions, value: totalImpressions.toLocaleString(), icon: Eye, color: 'text-blue-400' },
              { label: t.metrics.reach, value: totalReach.toLocaleString(), icon: Users, color: 'text-emerald-400' },
              { label: t.metrics.clicks, value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-purple-400' },
              { label: t.metrics.ctr, value: `${overallCtr}%`, icon: TrendingUp, color: 'text-amber-400' },
              { label: t.metrics.activeCampaigns, value: activeCampaignsCount.toString(), icon: Layers, color: 'text-[#F20D18]' },
              { label: t.metrics.totalSpent, value: formatCurrency(totalSpent), icon: DollarSign, color: 'text-emerald-400' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-[#071321]/60 border border-[#171C25] rounded-2xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#94A3B8] mb-1">
                    <span className="text-[10px] font-bold uppercase">{stat.label}</span>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className="text-xl font-black text-white">{stat.value}</span>
                </div>
              );
            })}
          </div>

          {/* Business Profile Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0A121E] to-[#071321] border border-[#171C25] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={myProfile?.logoUrl || currentUser.avatarUrl} 
                alt="Brand Logo" 
                className="w-12 h-12 rounded-2xl object-cover border-2 border-[#F20D18]" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">
                    {myProfile?.companyName || `${currentUser.fullName} (Perfil Comercial)`}
                  </h3>
                  {myProfile?.isVerified ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      VERIFICADO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-bold">
                      VERIFICAÇÃO PENDENTE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {myProfile?.description || 'Configure sua presença de marca e catálogo oficial na STRAVA FIGHT.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenEditProfile}
              className="px-4 py-2 rounded-xl bg-[#0D121C] border border-[#171C25] text-white text-xs font-bold hover:border-[#F20D18]/50 hover:bg-white/5 transition-all"
            >
              {myProfile ? t.profile.createOrEdit : t.profile.transformAccount}
            </button>
          </div>

          {/* Active Campaigns Quick List */}
          <div className="bg-[#071321]/60 border border-[#171C25] rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base">Campanhas Recentes</h3>
                <p className="text-xs text-[#94A3B8]">Métricas em tempo real registradas na plataforma</p>
              </div>
              <button
                onClick={() => setActiveTab('campaigns')}
                className="text-xs text-[#F20D18] font-bold hover:underline flex items-center gap-1"
              >
                <span>Ver Todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {campaigns.slice(0, 4).map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-[#0A121E] border border-[#171C25] flex gap-3 hover:border-[#F20D18]/30 transition-all">
                  <img src={c.mediaUrl} alt={c.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs truncate">{c.title}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                          c.status === 'ATIVA' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          c.status === 'AGUARDANDO_APROVACAO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          c.status === 'REPROVADA' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">{c.companyName} • {c.category}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#CBD5E1] pt-2 border-t border-[#171C25]">
                      <span>{c.impressionsCount} views</span>
                      <span className="font-bold text-[#F20D18]">{c.clicksCount} cliques</span>
                      <span>CTR {c.impressionsCount > 0 ? ((c.clicksCount / c.impressionsCount) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CENTRAL DE ANÚNCIOS (CAMPAIGNS)
      ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-white text-lg">Central de Anúncios</h2>
              <p className="text-xs text-[#94A3B8]">Crie, monitore e gerencie a veiculação de campanhas patrocinadas</p>
            </div>
            <button
              onClick={handleOpenCreateCampaign}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Campanha</span>
            </button>
          </div>

          {/* Campaigns Table / Cards */}
          <div className="space-y-3">
            {campaigns.map((camp) => (
              <div 
                key={camp.id}
                className="bg-[#071321]/70 border border-[#171C25] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#F20D18]/40 transition-all shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img src={camp.mediaUrl} alt={camp.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#171C25]" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-white text-sm truncate">{camp.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        camp.status === 'ATIVA' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        camp.status === 'AGUARDANDO_APROVACAO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        camp.status === 'PAUSADA' ? 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/40' :
                        camp.status === 'REPROVADA' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {camp.status}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        ({camp.placement})
                      </span>
                    </div>

                    <p className="text-xs text-[#94A3B8] mt-1 line-clamp-1">{camp.description}</p>
                    
                    {camp.rejectionReason && (
                      <p className="text-[10px] text-rose-400 font-bold mt-1 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
                        ⚠ Motivo da reprovação: {camp.rejectionReason}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[#CBD5E1]">
                      <span>Orçamento: <strong>{formatCurrency(camp.budget)}</strong></span>
                      <span>•</span>
                      <span>Investido: <strong>{formatCurrency(camp.spentBudget)}</strong></span>
                      <span>•</span>
                      <span>Destino: <a href={camp.destinationUrl} target="_blank" rel="noreferrer" className="text-[#F20D18] hover:underline">{camp.destinationUrl.replace('https://', '').slice(0, 24)}...</a></span>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="flex items-center gap-4 py-2 px-3 rounded-xl bg-[#05070B] border border-[#171C25] shrink-0 text-center">
                  <div>
                    <span className="block text-xs font-black text-white">{camp.impressionsCount}</span>
                    <span className="text-[9px] text-[#94A3B8] uppercase">Views</span>
                  </div>
                  <div className="w-px h-6 bg-[#171C25]" />
                  <div>
                    <span className="block text-xs font-black text-[#F20D18]">{camp.clicksCount}</span>
                    <span className="text-[9px] text-[#94A3B8] uppercase">Cliques</span>
                  </div>
                  <div className="w-px h-6 bg-[#171C25]" />
                  <div>
                    <span className="block text-xs font-black text-amber-400">
                      {camp.impressionsCount > 0 ? ((camp.clicksCount / camp.impressionsCount) * 100).toFixed(1) : 0}%
                    </span>
                    <span className="text-[9px] text-[#94A3B8] uppercase">CTR</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  {camp.status === 'ATIVA' && (
                    <button
                      onClick={() => handleTogglePauseCampaign(camp)}
                      className="p-2 rounded-xl bg-[#0D121C] border border-[#171C25] text-amber-400 hover:bg-amber-500/10 transition-colors"
                      title="Pausar veiculação"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  {camp.status === 'PAUSADA' && (
                    <button
                      onClick={() => handleTogglePauseCampaign(camp)}
                      className="p-2 rounded-xl bg-[#0D121C] border border-[#171C25] text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Retomar veiculação"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicateCampaign(camp)}
                    className="p-2 rounded-xl bg-[#0D121C] border border-[#171C25] text-[#94A3B8] hover:text-white transition-colors"
                    title="Duplicar campanha"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PERFIL COMERCIAL (PROFILE)
      ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-[#071321]/60 border border-[#171C25] rounded-3xl overflow-hidden shadow-xl">
            {/* Cover Banner */}
            <div className="h-44 sm:h-56 relative bg-gradient-to-r from-[#071321] to-[#171C25] overflow-hidden">
              <img 
                src={myProfile?.coverUrl || currentUser.coverUrl} 
                alt="Cover" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-transparent" />
            </div>

            {/* Profile Info Header */}
            <div className="p-5 sm:p-7 relative -mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <img 
                  src={myProfile?.logoUrl || currentUser.avatarUrl} 
                  alt="Logo" 
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-[#05070B] shadow-2xl bg-[#0D121C]" 
                />
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {myProfile?.companyName || currentUser.fullName}
                    </h2>
                    {myProfile?.isVerified && (
                      <span className="w-5 h-5 rounded-full bg-[#F20D18] text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#F20D18] font-bold">
                    {myProfile?.category.replace('_', ' ') || 'Perfil Comercial em Configuração'} • {myProfile?.country || 'Brasil'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenEditProfile}
                className="px-4 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Dados Comerciais</span>
              </button>
            </div>

            {/* Details Content */}
            <div className="p-5 sm:p-7 border-t border-[#171C25] grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#94A3B8] mb-1">Sobre a Empresa</h4>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed">
                    {myProfile?.description || 'Nenhuma descrição comercial cadastrada ainda.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-[#94A3B8] mb-1">Modalidades Atendidas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(myProfile?.modalitiesServed || ['Jiu-Jitsu', 'Muay Thai', 'MMA', 'Boxe']).map((m) => (
                      <span key={m} className="px-2.5 py-1 rounded-full bg-[#0D121C] border border-[#171C25] text-xs text-white font-semibold">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="p-4 rounded-2xl bg-[#0A121E] border border-[#171C25] space-y-3">
                <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#F20D18]" />
                  <span>Canais Oficiais</span>
                </h4>

                <div className="space-y-2 text-xs text-[#CBD5E1]">
                  {myProfile?.websiteUrl && (
                    <a href={myProfile.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#F20D18] truncate">
                      <Globe className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span className="truncate">{myProfile.websiteUrl}</span>
                    </a>
                  )}
                  {myProfile?.whatsappNumber && (
                    <a href={`https://wa.me/${myProfile.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-400 hover:underline">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{myProfile.whatsappNumber} (WhatsApp)</span>
                    </a>
                  )}
                  {myProfile?.contactEmail && (
                    <div className="flex items-center gap-2 text-[#94A3B8]">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{myProfile.contactEmail}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#171C25]">
                  <span className="text-[10px] text-[#94A3B8] block">Plano Atual:</span>
                  <span className="text-xs font-black text-amber-400">
                    {COMMERCIAL_PLANS.find((p) => p.id === (myProfile?.planId || 'BUSINESS'))?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PRODUTOS & SERVIÇOS (PRODUCTS)
      ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-white text-lg">Catálogo de Produtos & Serviços</h2>
              <p className="text-xs text-[#94A3B8]">Vitrine oficial integrada às buscas e divulgações da plataforma</p>
            </div>
            <button
              onClick={() => {
                setProdTitle('');
                setProdCategory('EQUIPAMENTOS');
                setProdPrice('199.90');
                setProdDesc('');
                setProdImage('https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80');
                setProdBuyUrl('https://www.stravafight.com');
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Produto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((prod) => (
              <div 
                key={prod.id} 
                className="bg-[#071321]/60 border border-[#171C25] rounded-2xl overflow-hidden hover:border-[#F20D18]/50 transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="h-44 bg-black overflow-hidden relative">
                    <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-black text-white uppercase border border-white/10">
                      {prod.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] text-[#F20D18] font-bold block">{prod.companyName}</span>
                    <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug">{prod.title}</h3>
                    <p className="text-xs text-[#94A3B8] line-clamp-2">{prod.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-[#94A3B8]">Valor</span>
                    <span className="text-base font-black text-white">{formatCurrency(prod.price || 0)}</span>
                  </div>

                  <a
                    href={prod.buyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white text-xs font-black text-center flex items-center justify-center gap-1.5 shadow-md shadow-[#F20D18]/20 hover:brightness-110 transition-all"
                  >
                    <span>Comprar no Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: PATROCÍNIOS & OPORTUNIDADES (SPONSORSHIPS)
      ========================================================================= */}
      {activeTab === 'sponsorships' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-white text-lg">Mural de Patrocínios & Matchmaking</h2>
              <p className="text-xs text-[#94A3B8]">Conecte atletas de destaque, marcas investidoras e eventos de artes marciais</p>
            </div>
            <button
              onClick={() => {
                setOppTitle('');
                setOppModality('Jiu-Jitsu');
                setOppType('PROCURA_ATLETA');
                setOppDesc('');
                setOppReqs('Faixa Azul a Preta\n2 Títulos comprovados\nPostura exemplar');
                setOppSupport('Kit de Kimonos + Taxas de Inscrição');
                setIsOppModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Oportunidade</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div 
                key={opp.id} 
                className="bg-[#071321]/60 border border-[#171C25] rounded-3xl p-5 hover:border-[#F20D18]/40 transition-all flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img src={opp.authorAvatar} alt={opp.authorName} className="w-10 h-10 rounded-xl object-cover border border-[#F20D18]" />
                      <div>
                        <span className="font-bold text-white text-xs block">{opp.authorName}</span>
                        <span className="text-[10px] text-[#94A3B8]">{opp.authorType} • {opp.modality}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black uppercase">
                      {opp.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-white text-sm leading-snug">{opp.title}</h3>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{opp.description}</p>
                  </div>

                  {/* Requirements List */}
                  {opp.requirements && opp.requirements.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[#05070B] border border-[#171C25] space-y-1">
                      <span className="text-[10px] font-bold text-[#F20D18] uppercase">Requisitos:</span>
                      {opp.requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-[#CBD5E1]">
                          <Check className="w-3 h-3 text-[#F20D18] shrink-0" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2 border-t border-[#171C25]">
                    <span>Apoio: <strong className="text-white">{opp.budgetOrSupport}</strong></span>
                    <span>Prazo: <strong className="text-white">{opp.deadline}</strong></span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${opp.contactWhatsApp.replace(/\D/g, '')}?text=Olá! Vi sua oportunidade no mural SF BUSINESS: "${encodeURIComponent(opp.title)}" e gostaria de me candidatar.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white text-xs font-black text-center flex items-center justify-center gap-1.5 hover:brightness-110 shadow-md shadow-[#F20D18]/25"
                  >
                    <span>Candidatar-se via WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: EVENTOS & LUTAS COMERCIAIS (EVENTS)
      ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-white text-lg">Eventos, Lutas & Campeonatos Patrocinados</h2>
              <p className="text-xs text-[#94A3B8]">Divulgue seus cards, venda ingressos e promova inscrições de lutadores</p>
            </div>
            <button
              onClick={() => {
                setEvTitle('');
                setEvModality('MMA');
                setEvDesc('');
                setEvDate('25/04/2026');
                setEvTime('20:00');
                setEvCity('São Paulo, SP');
                setEvVenue('Ginásio do Ibirapuera');
                setEvPrice('70.00');
                setIsEventModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Evento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commercialEvents.map((ev) => (
              <div key={ev.id} className="bg-[#071321]/60 border border-[#171C25] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-[#F20D18]/40 transition-all">
                <div>
                  <div className="h-48 relative bg-black">
                    <img src={ev.bannerUrl} alt={ev.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-black text-white uppercase border border-white/20">
                      {ev.modality}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#F20D18] text-[9px] font-black text-white uppercase">
                      PATROCINADO
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#F20D18] font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.date} às {ev.time}</span>
                      <span>•</span>
                      <span>{ev.city}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-white leading-snug">{ev.title}</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">{ev.description}</p>
                    <p className="text-xs text-[#CBD5E1]">Local: <strong>{ev.venue}</strong></p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-[#171C25] mt-2">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Ingresso a partir de</span>
                    <span className="text-base font-black text-white">{formatCurrency(ev.ticketPrice || 0)}</span>
                  </div>

                  <a
                    href={ev.ticketUrl || 'https://www.stravafight.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white text-xs font-black shadow-md hover:brightness-110 flex items-center gap-1.5"
                  >
                    <span>Garantir Ingresso</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: PLANOS COMERCIAIS (PLANS)
      ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl font-black text-white">{t.plans.title}</h2>
            <p className="text-xs text-[#94A3B8]">
              Potencialize sua marca na maior comunidade esportiva de combate do mundo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {COMMERCIAL_PLANS.map((plan) => {
              const isCurrent = (myProfile?.planId || 'BUSINESS') === plan.id;
              return (
                <div 
                  key={plan.id}
                  className={`rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                    plan.id === 'PREMIUM'
                      ? 'bg-gradient-to-b from-[#141E2E] to-[#0A121E] border-[#F20D18] shadow-2xl shadow-[#F20D18]/15 scale-102'
                      : 'bg-[#071321]/60 border-[#171C25]'
                  }`}
                >
                  <div className="space-y-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F20D18]/20 text-[#F20D18] text-[9px] font-black uppercase">
                        {plan.badge}
                      </span>
                      <h3 className="text-lg font-black text-white mt-2">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-black text-white">
                          {plan.monthlyPrice === 0 ? 'Grátis' : formatCurrency(plan.monthlyPrice)}
                        </span>
                        {plan.monthlyPrice > 0 && <span className="text-xs text-[#94A3B8]"> /mês</span>}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#171C25]">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#CBD5E1]">
                          <Check className="w-3.5 h-3.5 text-[#F20D18] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => alert(`Plano ${plan.name} selecionado com sucesso! Arquitetura pronta para integração com gateway de faturamento.`)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-[#171C25] text-white border border-white/10 cursor-default'
                          : 'bg-[#F20D18] text-white hover:brightness-110 shadow-lg shadow-[#F20D18]/25'
                      }`}
                    >
                      {isCurrent ? 'Plano Ativo' : 'Escolher Plano'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#0A121E] border border-[#171C25] text-center text-xs text-[#94A3B8]">
            <p>
              ℹ️ {t.plans.gatewayNotice}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: MODERAÇÃO ADMIN (ADMIN)
      ========================================================================= */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#0A121E] border border-[#171C25] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#F20D18]" />
              <div>
                <h3 className="font-bold text-white text-sm">Painel de Moderação & Auditoria SF Business</h3>
                <p className="text-xs text-[#94A3B8]">Aprovação prévia obrigatória de campanhas e conferência de perfis</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
              ADMIN MODE
            </span>
          </div>

          {/* Pending Approval Section */}
          <div className="bg-[#071321]/60 border border-[#171C25] rounded-3xl p-5 space-y-4">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Campanhas Aguardando Revisão</span>
              <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black">
                {campaigns.filter((c) => c.status === 'AGUARDANDO_APROVACAO').length}
              </span>
            </h4>

            {campaigns.filter((c) => c.status === 'AGUARDANDO_APROVACAO').length === 0 ? (
              <p className="text-xs text-[#94A3B8] italic p-4 text-center">Nenhuma campanha aguardando revisão no momento.</p>
            ) : (
              <div className="space-y-3">
                {campaigns.filter((c) => c.status === 'AGUARDANDO_APROVACAO').map((camp) => (
                  <div key={camp.id} className="p-4 rounded-2xl bg-[#0A121E] border border-[#171C25] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={camp.mediaUrl} alt={camp.title} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-white text-sm">{camp.title}</span>
                        <p className="text-xs text-[#94A3B8]">{camp.companyName} • {camp.category}</p>
                        <p className="text-xs text-[#CBD5E1] mt-1">{camp.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAdminApproveCampaign(camp)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprovar</span>
                      </button>

                      <button
                        onClick={() => setRejectingCampaignId(camp.id)}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reprovar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div className="bg-[#071321]/60 border border-[#171C25] rounded-3xl p-5 space-y-3">
            <h4 className="font-extrabold text-white text-sm">Registro de Auditoria Administrativa</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-[#05070B] border border-[#171C25] text-xs flex items-center justify-between gap-3">
                  <div>
                    <span className="font-black text-[#F20D18] uppercase text-[10px]">{log.action}</span>
                    <span className="text-white font-bold ml-2">{log.targetTitle}</span>
                    <p className="text-[#94A3B8] text-[11px] mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-[#64748B] shrink-0">
                    {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
      ========================================================================= */}

      {/* 1. Create / Edit Campaign Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0D121C] border border-[#171C25] rounded-3xl p-6 max-w-xl w-full space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#171C25]">
              <h3 className="font-black text-white text-base">Nova Campanha Publicitária</h3>
              <button onClick={() => setIsCampaignModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Nome Interno da Campanha</label>
                <input
                  type="text"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="Ex: Lançamento Coleção 2026"
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Objetivo</label>
                  <select
                    value={campObjective}
                    onChange={(e) => setCampObjective(e.target.value as AdObjective)}
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  >
                    <option value="VENDER_PRODUTO">Vender Produto</option>
                    <option value="DIVULGAR_MARCA">Divulgar Marca</option>
                    <option value="PROMOVER_EVENTO">Promover Evento</option>
                    <option value="VENDER_INGRESSO">Vender Ingresso</option>
                    <option value="DIVULGAR_ASSINATURA">Divulgar Assinatura / Plano</option>
                    <option value="ENCONTRAR_PATROCINADORES">Buscar Patrocinadores</option>
                    <option value="ENCONTRAR_ATLETAS">Recrutar Atletas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Posicionamento</label>
                  <select
                    value={campPlacement}
                    onChange={(e) => setCampPlacement(e.target.value as any)}
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  >
                    <option value="FEED">Feed Principal</option>
                    <option value="REELS">SF Reels</option>
                    <option value="STORY">Stories Patrocinados</option>
                    <option value="ALL">Todos os Formatos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Título do Anúncio (Chamada Principal)</label>
                <input
                  type="text"
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="Ex: Novo Kimono Stealth Pro — Blindado para Guerra"
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Texto Descritivo do Anúncio</label>
                <textarea
                  value={campDescription}
                  onChange={(e) => setCampDescription(e.target.value)}
                  rows={2}
                  placeholder="Benefícios, especificações técnicas e ofertas especiais..."
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Link de Destino (Site Oficial)</label>
                  <input
                    type="url"
                    value={campDestinationUrl}
                    onChange={(e) => setCampDestinationUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Botão de Ação (CTA)</label>
                  <input
                    type="text"
                    value={campCtaLabel}
                    onChange={(e) => setCampCtaLabel(e.target.value)}
                    placeholder="Ex: Comprar com 15% OFF"
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">URL da Imagem Criativa</label>
                <input
                  type="text"
                  value={campMediaUrl}
                  onChange={(e) => setCampMediaUrl(e.target.value)}
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Orçamento Previsto (R$)</label>
                <input
                  type="number"
                  value={campBudget}
                  onChange={(e) => setCampBudget(e.target.value)}
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#171C25]">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveCampaignSubmit(e, false)}
                  className="px-4 py-2 rounded-xl bg-[#0A121E] border border-[#171C25] text-white text-xs font-bold hover:bg-white/5"
                >
                  Salvar Rascunho
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSaveCampaignSubmit(e, true)}
                  className="px-5 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-lg shadow-[#F20D18]/30 hover:brightness-110"
                >
                  Enviar para Aprovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Configure Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0D121C] border border-[#171C25] rounded-3xl p-6 max-w-xl w-full space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#171C25]">
              <h3 className="font-black text-white text-base">Configurar Perfil Comercial</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Nome Comercial da Empresa / Marca</label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Categoria de Atuação</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value as CommercialCategory)}
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  >
                    <option value="MARCA_ESPORTIVA">Marca Esportiva</option>
                    <option value="LOJA_EQUIPAMENTOS">Loja de Equipamentos</option>
                    <option value="ACADEMIA_CT">Academia / CT</option>
                    <option value="ORGANIZADOR_EVENTOS">Organizador de Eventos</option>
                    <option value="PROMOTOR_LUTAS">Promotor de Lutas</option>
                    <option value="ATLETA_PROFISSIONAL">Atleta Profissional</option>
                    <option value="PATROCINADOR">Patrocinador</option>
                    <option value="SERVICO_ESPORTIVO">Serviço Esportivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">País</label>
                  <input
                    type="text"
                    value={compCountry}
                    onChange={(e) => setCompCountry(e.target.value)}
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Descrição / Apresentação Comercial</label>
                <textarea
                  value={compDescription}
                  onChange={(e) => setCompDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Site Oficial</label>
                  <input
                    type="url"
                    value={compWebsite}
                    onChange={(e) => setCompWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">WhatsApp Comercial</label>
                  <input
                    type="text"
                    value={compWhatsapp}
                    onChange={(e) => setCompWhatsapp(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#171C25]">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-lg shadow-[#F20D18]/30 hover:brightness-110"
                >
                  Salvar Perfil Comercial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Rejection Reason Modal */}
      {rejectingCampaignId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0D121C] border border-rose-500/30 rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <h3 className="font-bold text-white text-sm">Justificativa da Reprovação</h3>
            <p className="text-xs text-[#94A3B8]">
              Informe o motivo para que o anunciante possa adequar o conteúdo:
            </p>
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="Ex: Imagem em baixa resolução / Promessa inadequada..."
              rows={3}
              className="w-full bg-[#05070B] border border-[#171C25] rounded-xl p-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingCampaignId(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#94A3B8]"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAdminRejectCampaign(rejectingCampaignId)}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Confirmar Reprovação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0D121C] border border-[#171C25] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#171C25]">
              <h3 className="font-black text-white text-base">Cadastrar Produto / Serviço</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Título do Produto</label>
                <input
                  type="text"
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="Ex: Luva Pro Sparring 16oz"
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Modalidade</label>
                  <input
                    type="text"
                    value={prodModality}
                    onChange={(e) => setProdModality(e.target.value)}
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Descrição</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Link de Compra</label>
                <input
                  type="url"
                  value={prodBuyUrl}
                  onChange={(e) => setProdBuyUrl(e.target.value)}
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#171C25]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#94A3B8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-md hover:brightness-110"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Opportunity Modal */}
      {isOppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0D121C] border border-[#171C25] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#171C25]">
              <h3 className="font-black text-white text-base">Publicar Oportunidade</h3>
              <button onClick={() => setIsOppModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOppSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Título da Oportunidade</label>
                <input
                  type="text"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  placeholder="Ex: Marca Busca Atletas Faixa Marrom e Preta"
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Requisitos (um por linha)</label>
                <textarea
                  value={oppReqs}
                  onChange={(e) => setOppReqs(e.target.value)}
                  rows={3}
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Apoio / Contrapartida Oferecida</label>
                <input
                  type="text"
                  value={oppSupport}
                  onChange={(e) => setOppSupport(e.target.value)}
                  placeholder="Ex: 4 Kimonos/ano + Ajuda de Custo"
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#171C25]">
                <button
                  type="button"
                  onClick={() => setIsOppModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#94A3B8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-md hover:brightness-110"
                >
                  Publicar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Commercial Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0D121C] border border-[#171C25] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#171C25]">
              <h3 className="font-black text-white text-base">Cadastrar Evento Comercial</h3>
              <button onClick={() => setIsEventModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEventSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Título do Evento</label>
                <input
                  type="text"
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  placeholder="Ex: IFC 30: Noite de Campeões"
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Data</label>
                  <input
                    type="text"
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] mb-1">Horário</label>
                  <input
                    type="text"
                    value={evTime}
                    onChange={(e) => setEvTime(e.target.value)}
                    placeholder="20:00"
                    className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] mb-1">Local & Cidade</label>
                <input
                  type="text"
                  value={evVenue}
                  onChange={(e) => setEvVenue(e.target.value)}
                  placeholder="Ex: Ginásio do Maracanãzinho, Rio de Janeiro"
                  className="w-full bg-[#05070B] border border-[#171C25] rounded-xl px-3 py-2 text-xs text-white focus:border-[#F20D18] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#171C25]">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#94A3B8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F20D18] text-white text-xs font-black shadow-md hover:brightness-110"
                >
                  Cadastrar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
