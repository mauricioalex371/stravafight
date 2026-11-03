export type UserRole = 
  | 'Praticante'
  | 'Atleta'
  | 'Professor'
  | 'Mestre'
  | 'Proprietário de Academia'
  | 'Administrador de Academia'
  | 'Administrador Global';

export interface UserModality {
  modality: string;
  belt: string; // Ex: Faixa Preta 2º Dan, Faixa Marrom, Kruang Vermelho/Branco
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  coverUrl?: string;
  bio: string;
  role: UserRole;
  location?: string;
  modalities: UserModality[];
  affiliatedAcademyName?: string;
  affiliatedAcademyId?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  postsCount: number;
  isFriend?: boolean;
  isFollowing?: boolean;
  friendshipStatus?: 'NONE' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'FRIENDS';
  // Gamificação
  streakDays: number;
  totalCheckIns: number;
  xpPoints: number;
  beltRankSocial: string; // Ex: "Faixa Preta SF"
  badges: string[];
}

export interface PostComment {
  id: string;
  postId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likesCount: number;
  hasLiked?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorModality: string;
  authorBelt: string;
  isAuthorVerified: boolean;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  hashtags: string[];
  location?: string;
  taggedAcademy?: string;
  likesCount: number;
  hasLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  hasSaved: boolean;
  createdAt: string;
  comments: PostComment[];
  taggedUsers?: { username: string; name: string }[];
  challengeData?: {
    challengeId: string;
    challengerName: string;
    targetName: string;
    category: string;
    targetRounds?: number;
    status: 'PENDING' | 'ACCEPTED' | 'COMPLETED';
  };
  trainingData?: {
    rounds?: number;
    durationMinutes?: number;
    intensity?: string;
    xpGained?: number;
  };
  activityData?: {
    modality: string;
    durationFormatted: string;
    durationMinutes: number;
    calories?: number;
    isCaloriesEstimated?: boolean;
    textPosition: 'top' | 'center' | 'bottom';
    aspectRatio: '9:16' | '4:5' | '1:1';
    hasOfficialFilter: boolean;
  };
}

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  timestamp: string;
  caption?: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userFullName: string;
  userAvatar: string;
  hasUnread: boolean;
  items: StoryItem[];
}

export interface Reel {
  id: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  authorModality: string;
  authorBelt: string;
  isAuthorVerified: boolean;
  videoUrl: string;
  caption: string;
  hashtags: string[];
  audioTrack: string;
  likesCount: number;
  hasLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  hasSaved: boolean;
  isFollowingAuthor: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'post_share';
  postSnippet?: {
    id: string;
    author: string;
    mediaUrl: string;
    caption: string;
  };
  timestamp: string;
  isRead: boolean;
}

export interface DirectConversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOnline?: boolean;
    lastActive?: string;
    modality?: string;
    belt?: string;
  };
  tab: 'primary' | 'general' | 'requests';
  unreadCount: number;
  lastMessage: {
    text: string;
    timestamp: string;
    senderId: string;
    isRead: boolean;
  };
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  senderModality: string;
  senderBelt: string;
  mutualFriendsCount: number;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface NotificationItem {
  id: string;
  type: 
    | 'LIKE' 
    | 'COMMENT' 
    | 'FRIEND_REQUEST' 
    | 'FRIEND_ACCEPT' 
    | 'FOLLOW' 
    | 'ACADEMY_INVITE' 
    | 'STREAK_MILESTONE'
    | 'EVENT_REMINDER'
    | 'CHALLENGE_INVITE'
    | 'CHALLENGE_ACCEPTED'
    | 'CHALLENGE_DECLINED';
  actorName: string;
  actorAvatar: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  targetId?: string;
  challengeId?: string;
  challengeMeta?: {
    category: string;
    modality: string;
    targetRounds?: number;
    proposedDate?: string;
  };
}

export interface CombatChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerUsername: string;
  challengerAvatar: string;
  challengerBelt: string;
  targetId: string;
  targetName: string;
  targetUsername: string;
  targetAvatar: string;
  targetBelt: string;
  title: string;
  modality: string;
  category: 'SPARRING' | 'ROUNDS_META' | 'SEMANA_STREAK' | 'ROLA_TECNICO';
  targetRounds?: number;
  proposedDate?: string;
  location?: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  createdAt: string;
  completedAt?: string;
  winnerNotes?: string;
}

// Gamificação
export interface TrainingCheckIn {
  id: string;
  userId: string;
  userName: string;
  modality: string;
  durationMinutes: number;
  rounds: number;
  notes: string;
  mediaUrl?: string;
  intensity: 'LEVE' | 'MODERADO' | 'GUERRA' | 'COMPETIÇÃO';
  createdAt: string;
  xpEarned: number;
}

export interface AchievementBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  xpValue: number;
}

// SF Academy (Compatibilidade e expansão do sistema anterior)
export type StudentStatus = 'ATIVO' | 'TRANCADO' | 'CANCELADO';

export interface Student {
  id: string;
  academyId?: string;
  name: string;
  phone: string;
  birthDate: string; // dd/mm/aaaa
  isMinor: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  modality: string;
  graduation: string;
  classId?: string;
  monthlyFee: number;
  dueDay: number; // 1 to 31
  notes?: string;
  status: StudentStatus;
  createdAt: number;
}

export interface ClassEntity {
  id: string;
  academyId?: string;
  name: string;
  modality: string;
  level: string;
  instructor: string;
  days: string[]; // e.g. ['Seg', 'Qua', 'Sex']
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxCapacity: number;
}

export interface AttendanceRecord {
  id: string;
  academyId?: string;
  classId: string;
  studentId: string;
  date: string; // yyyy-mm-dd
  status: 'PRESENTE' | 'FALTA';
}

export type FeeStatus = 'PAGO' | 'PENDENTE' | 'ATRASADO';

export interface MonthlyFee {
  id: string;
  academyId?: string;
  studentId: string;
  studentName: string;
  monthYear: string; // mm/aaaa
  dueDate: string; // dd/mm/aaaa
  amount: number;
  amountPaid: number;
  status: FeeStatus;
  paymentMethod?: 'PIX' | 'DINHEIRO' | 'CARTAO' | 'OUTRO';
  paidDate?: string;
  cashTransactionId?: string;
  notes?: string;
}

export type CashType = 'ENTRADA' | 'SAIDA';

export interface CashTransaction {
  id: string;
  academyId?: string;
  type: CashType;
  category: string;
  description: string;
  amount: number;
  date: string; // dd/mm/aaaa
  paymentMethod: string;
  feeId?: string;
  createdAt: number;
}

export interface TrialStudent {
  id: string;
  academyId?: string;
  name: string;
  phone: string;
  modality: string;
  scheduledDate: string; // dd/mm/aaaa
  status: 'AGENDADA' | 'CONVERTIDA';
  notes?: string;
  createdAt: number;
}

export interface AcademyInfo {
  id: string;
  name: string;
  masterName: string;
  logoUrl?: string;
  address: string;
  phone: string;
  modalities: string[];
  description: string;
  isConfigured: boolean;
  pinCode?: string;
  lastBackupDate?: string;
}

export interface CombatEvent {
  id: string;
  title: string;
  type: 'CAMPEONATO' | 'SEMINÁRIO' | 'AULÃO' | 'WORKSHOP';
  organizer: string;
  date: string;
  time: string;
  location: string;
  city: string;
  modalities: string[];
  divisions: string[];
  bannerUrl: string;
  registrationPrice: string;
  isRegistrationOpen: boolean;
  description: string;
  registeredCount: number;
}

export interface SfWorkoutActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  modality: string;
  durationHours: number;
  durationMinutes: number;
  durationFormatted: string; // e.g. "1h 00min" or "45min"
  calories: number;
  isCaloriesEstimated: boolean;
  photoUrl: string;
  exportedImageUrl?: string;
  textPosition: 'top' | 'center' | 'bottom';
  aspectRatio: '9:16' | '4:5' | '1:1';
  createdAt: string;
}

// ==========================================
// SF BUSINESS — GLOBAL COMMERCIAL ECOSYSTEM
// ==========================================

export type CommercialCategory =
  | 'MARCA_ESPORTIVA'
  | 'LOJA_EQUIPAMENTOS'
  | 'ACADEMIA_CT'
  | 'ORGANIZADOR_EVENTOS'
  | 'PROMOTOR_LUTAS'
  | 'ATLETA_PROFISSIONAL'
  | 'PATROCINADOR'
  | 'PROFESSOR_TREINADOR'
  | 'SERVICO_ESPORTIVO'
  | 'OUTROS';

export type CommercialPlanType = 'FREE' | 'BUSINESS' | 'PREMIUM' | 'OFFICIAL_SPONSOR';

export interface CommercialProfile {
  id: string;
  userId: string;
  companyName: string;
  tradingName?: string;
  logoUrl: string;
  coverUrl: string;
  description: string;
  category: CommercialCategory;
  country: string;
  region: string;
  city?: string;
  websiteUrl?: string;
  socialInstagram?: string;
  socialYoutube?: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationDocUrl?: string;
  followersCount: number;
  planId: CommercialPlanType;
  createdAt: string;
  modalitiesServed: string[];
}

export type AdObjective =
  | 'DIVULGAR_MARCA'
  | 'VENDER_PRODUTO'
  | 'DIVULGAR_SERVICO'
  | 'PROMOVER_EVENTO'
  | 'VENDER_INGRESSO'
  | 'CAPTAR_INSCRICOES'
  | 'DIVULGAR_ASSINATURA'
  | 'ENCONTRAR_PATROCINADORES'
  | 'ENCONTRAR_ATLETAS'
  | 'OPORTUNIDADES_PROFISSIONAIS';

export type AdStatus =
  | 'RASCUNHO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADA'
  | 'ATIVA'
  | 'PAUSADA'
  | 'ENCERRADA'
  | 'REPROVADA';

export type AdPlacement = 'FEED' | 'REELS' | 'STORY' | 'ALL';

export interface AdTargetAudience {
  modalities: string[];
  countries: string[];
  regions?: string[];
  ageGroup?: string;
}

export interface AdCampaign {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  name: string;
  objective: AdObjective;
  category: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  destinationUrl: string;
  ctaLabel: string;
  targetAudience: AdTargetAudience;
  startDate: string;
  endDate: string;
  budget: number;
  spentBudget: number;
  status: AdStatus;
  rejectionReason?: string;
  placement: AdPlacement;
  impressionsCount: number;
  reachCount: number;
  clicksCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommercialProduct {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  category: 'ROUPAS' | 'EQUIPAMENTOS' | 'ACESSORIOS' | 'CURSOS' | 'TREINAMENTOS' | 'SERVICOS' | 'ASSINATURAS';
  price?: number;
  currency: string;
  description: string;
  imageUrl: string;
  buyUrl: string;
  contactWhatsApp?: string;
  modality: string;
  isActive: boolean;
  createdAt: string;
}

export interface SponsorshipOpportunity {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorType: 'MARCA' | 'ATLETA' | 'EVENTO' | 'ACADEMIA' | 'PROFISSIONAL';
  title: string;
  modality: string;
  type: 'PROCURA_ATLETA' | 'PROCURA_PATROCINADOR' | 'PROCURA_APOIADOR' | 'PROCURA_PARCEIRO' | 'VAGA_TRABALHO';
  description: string;
  requirements: string[];
  location: string;
  country: string;
  budgetOrSupport?: string;
  deadline: string;
  contactEmail: string;
  contactWhatsApp: string;
  status: 'ABERTA' | 'FECHADA';
  applicationsCount: number;
  createdAt: string;
}

export interface CommercialEventEntity {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerLogo: string;
  title: string;
  modality: string;
  description: string;
  date: string;
  time: string;
  country: string;
  city: string;
  venue: string;
  bannerUrl: string;
  promoVideoUrl?: string;
  athletes?: Array<{ name: string; avatar: string; record?: string; role?: string }>;
  ticketPrice?: number;
  currency?: string;
  ticketUrl?: string;
  registrationUrl?: string;
  isSponsored: boolean;
  interestedCount: number;
  hasInterested?: boolean;
  createdAt: string;
}

export interface AdEventLog {
  id: string;
  campaignId: string;
  eventType: 'IMPRESSION' | 'CLICK' | 'ENGAGEMENT' | 'HIDE' | 'REPORT';
  userId: string;
  timestamp: string;
  placement: string;
}

export interface AdReportComplaint {
  id: string;
  targetId: string;
  targetType: 'CAMPAIGN' | 'PROFILE';
  targetTitle: string;
  reportedBy: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  targetTitle: string;
  details: string;
  timestamp: string;
}

export interface CommercialPlan {
  id: CommercialPlanType;
  name: string;
  badge: string;
  monthlyPrice: number;
  currency: string;
  features: string[];
  maxActiveCampaigns: number;
  analyticsLevel: 'BASIC' | 'ADVANCED' | 'ENTERPRISE';
  prioritySupport: boolean;
  hasSponsoredBadge: boolean;
}

export type BusinessLanguage = 'pt' | 'en' | 'es';

