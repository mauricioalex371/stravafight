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



// ==========================================
// MARKETPLACE & E-COMMERCE
// ==========================================

export type MarketplaceStoreStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface MarketplaceStore {
  id: string;
  owner_id: string;
  commercial_profile_id?: string;
  store_name: string;
  store_slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  commission_rate: number;
  status: MarketplaceStoreStatus;
  is_verified: boolean;
  total_sales: number;
  total_products: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
}

export interface MarketplaceCategory {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export interface MarketplaceProduct {
  id: string;
  store_id: string;
  store_name: string;
  store_logo: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  sku: string;
  base_price: number;
  sale_price?: number;
  currency: string;
  weight_grams: number;
  dimensions_cm: { length: number; width: number; height: number };
  modality: string;
  main_image_url: string;
  gallery_images: string[];
  video_url?: string;
  has_variants: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  status: ProductStatus;
  views_count: number;
  sales_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  attributes: { [key: string]: string }; // {size: "G", color: "Preto"}
  price_adjustment: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface ShippingAddress {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  is_default: boolean;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  store_id: string;
  store_name: string;
}

export interface ShoppingCart {
  id: string;
  user_id: string;
  items: CartItem[];
  subtotal: number;
  items_count: number;
}

export type OrderStatus = 
  | 'PENDING_PAYMENT' 
  | 'PAYMENT_PROCESSING' 
  | 'PAID' 
  | 'PREPARING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  buyer_name: string;
  buyer_avatar: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  coupon_code?: string;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  items: OrderItem[];
  tracking_codes?: { store_id: string; tracking_code: string }[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  store_id: string;
  store_name: string;
  product_id: string;
  product_name: string;
  product_image: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED';

export interface Payment {
  id: string;
  order_id: string;
  payment_provider: 'MERCADO_PAGO' | 'STRIPE';
  provider_payment_id: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  pix_qr_code?: string;
  pix_qr_code_base64?: string;
  boleto_url?: string;
  installments: number;
  failure_reason?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_purchase_amount: number;
  valid_until: string;
  is_active: boolean;
}

export interface ProductReview {
  id: string;
  product_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

// ==========================================
// EVENTOS ESPORTIVOS EXPANDIDOS
// ==========================================

export type SportEventType = 
  | 'CAMPEONATO' 
  | 'SUPER_LUTA' 
  | 'SEMINARIO' 
  | 'WORKSHOP' 
  | 'TREINO_COLETIVO' 
  | 'FESTIVAL' 
  | 'TORNEIO_ABERTO';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface SportEvent {
  id: string;
  organizer_id: string;
  organizer_name: string;
  organizer_logo: string;
  commercial_profile_id?: string;
  title: string;
  slug: string;
  description: string;
  event_type: SportEventType;
  modality: string;
  banner_url: string;
  promo_video_url?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time?: string;
  venue_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  map_coordinates?: { lat: number; lng: number };
  categories: string[];
  rules_url?: string;
  contact_email: string;
  contact_phone?: string;
  registration_open: boolean;
  registration_deadline?: string;
  registration_fee?: number;
  max_participants?: number;
  current_participants: number;
  has_ticketing: boolean;
  ticket_price?: number;
  ticket_url?: string;
  has_live_stream: boolean;
  stream_url?: string;
  status: EventStatus;
  is_featured: boolean;
  views_count: number;
  interested_count: number;
  has_registered?: boolean;
  has_interested?: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar: string;
  category: string;
  team_name?: string;
  registration_number: string;
  payment_status: 'PENDING' | 'PAID' | 'EXEMPT' | 'REFUNDED';
  check_in_status: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'COMPETING' | 'FINISHED';
  check_in_time?: string;
  created_at: string;
}

export interface EventResult {
  id: string;
  event_id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar: string;
  category: string;
  position: number;
  medal: 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTICIPANT';
  points_earned: number;
}

// ==========================================
// TRANSMISSÕES AUTORIZADAS
// ==========================================

export type StreamType = 
  | 'UFC_FIGHT' 
  | 'BELLATOR_FIGHT' 
  | 'CAMPEONATO' 
  | 'SUPER_LUTA' 
  | 'SEMINARIO_LIVE' 
  | 'TREINO_ABERTO' 
  | 'OUTRO';

export type StreamProvider = 'YOUTUBE' | 'TWITCH' | 'VIMEO' | 'CUSTOM_HLS' | 'IFRAME_EMBED';
export type StreamStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export interface AuthorizedStream {
  id: string;
  admin_id: string;
  title: string;
  slug: string;
  description: string;
  stream_type: StreamType;
  modality: string;
  event_date: string;
  event_time: string;
  banner_url: string;
  fight_card?: Array<{
    fighter1: string;
    fighter2: string;
    weight_class: string;
    title_fight: boolean;
  }>;
  stream_provider: StreamProvider;
  stream_url: string;
  embed_code?: string;
  is_live: boolean;
  is_free: boolean;
  requires_subscription: boolean;
  access_rules?: any;
  chat_enabled: boolean;
  countdown_enabled: boolean;
  views_count: number;
  peak_viewers: number;
  status: StreamStatus;
  rights_holder: string;
  license_confirmation: string;
  is_featured: boolean;
  created_at: string;
}

export interface StreamChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  message: string;
  is_pinned: boolean;
  created_at: string;
}
