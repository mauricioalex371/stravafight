import {
  UserProfile,
  Post,
  Story,
  Reel,
  DirectConversation,
  ChatMessage,
  FriendRequest,
  NotificationItem,
  TrainingCheckIn,
  AchievementBadge,
  Student,
  ClassEntity,
  AttendanceRecord,
  MonthlyFee,
  CashTransaction,
  TrialStudent,
  AcademyInfo,
  CombatEvent,
  CombatChallenge
} from '../types';
import { generateUUID, getTodayDateBR, getCurrentMonthYear } from '../utils/formatters';

const STORAGE_KEYS = {
  CURRENT_USER: 'sf_current_user',
  POSTS: 'sf_posts',
  STORIES: 'sf_stories',
  REELS: 'sf_reels',
  CONVERSATIONS: 'sf_conversations',
  MESSAGES: 'sf_messages',
  FRIEND_REQUESTS: 'sf_friend_requests',
  NOTIFICATIONS: 'sf_notifications',
  CHECK_INS: 'sf_check_ins',
  ACHIEVEMENTS: 'sf_achievements',
  ACADEMY_INFO: 'sf_academy_info',
  STUDENTS: 'sf_students',
  CLASSES: 'sf_classes',
  ATTENDANCE: 'sf_attendance',
  FEES: 'sf_fees',
  CASH: 'sf_cash',
  TRIALS: 'sf_trials',
  EVENTS: 'sf_events',
  CHALLENGES: 'sf_challenges',
};

// Initial Current User
const DEFAULT_CURRENT_USER: UserProfile = {
  id: 'usr_first',
  username: 'primeiro_usuario',
  fullName: 'Primeiro Usuário',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
  bio: 'Bem-vindo ao STRAVA FIGHT! 🥋🔥',
  role: 'Atleta',
  location: 'Brasil',
  modalities: [],
  affiliatedAcademyName: '',
  affiliatedAcademyId: '',
  isVerified: false,
  followersCount: 0,
  followingCount: 0,
  friendsCount: 0,
  postsCount: 0,
  streakDays: 0,
  totalCheckIns: 0,
  xpPoints: 0,
  beltRankSocial: 'Iniciante SF',
  badges: []
};

// Initial Stories
const DEFAULT_STORIES: Story[] = [
];

// Initial Posts Feed
const DEFAULT_POSTS: Post[] = [
];

// Initial Reels
const DEFAULT_REELS: Reel[] = [
];

// Initial Direct Conversations (matching screenshots img4 & img3)
const DEFAULT_CONVERSATIONS: DirectConversation[] = [
];

// Initial Messages for Mestre Uarlei
const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
};

// Initial Friend Requests
const DEFAULT_FRIEND_REQUESTS: FriendRequest[] = [
];

// Initial Notifications
const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_welcome',
    type: 'STREAK_MILESTONE',
    actorName: 'STRAVA FIGHT',
    actorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    text: 'Bem-vindo ao STRAVA FIGHT! 🥋🔥 Comece seu primeiro treino.',
    timestamp: 'Agora',
    isRead: false
  }
];

// Initial Challenges
const DEFAULT_CHALLENGES: CombatChallenge[] = [
];

// Initial Achievements
const DEFAULT_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'badge_welcome',
    name: 'Guerreiro Iniciante',
    icon: '🥋',
    description: 'Complete seu primeiro check-in.',
    isUnlocked: false,
    xpValue: 100
  },
  {
    id: 'badge_first_roll',
    name: 'Primeiro Rola',
    icon: '🤼',
    description: 'Primeiro treino registrado.',
    isUnlocked: false,
    xpValue: 100
  },
  {
    id: 'badge_streak_7',
    name: 'Fogo no Tatame',
    icon: '🔥',
    description: '7 dias consecutivos de treino.',
    isUnlocked: false,
    xpValue: 350
  }
];

// SF Academy Initial Data (Preserving UBF Team Management Schema)
const DEFAULT_ACADEMY: AcademyInfo = {
  id: 'acad_new',
  name: '',
  masterName: '',
  logoUrl: '/icon.png',
  address: '',
  phone: '',
  modalities: [],
  description: '',
  isConfigured: false,
  lastBackupDate: new Date().toISOString()
};

const DEFAULT_STUDENTS: Student[] = [
];

const DEFAULT_CLASSES: ClassEntity[] = [
];

const DEFAULT_FEES: MonthlyFee[] = [
];

const DEFAULT_CASH: CashTransaction[] = [
];

const DEFAULT_TRIALS: TrialStudent[] = [
];

const DEFAULT_EVENTS: CombatEvent[] = [
  {
    id: 'evt_1',
    title: 'Open São Paulo de Jiu-Jitsu Gi & No-Gi',
    type: 'CAMPEONATO',
    organizer: 'Federação Paulista de Lutas & STRAVA FIGHT',
    date: '22/11/2026',
    time: '08:00',
    location: 'Ginásio do Ibirapuera',
    city: 'São Paulo - SP',
    modalities: ['Jiu-Jitsu (Com Kimono)', 'No-Gi (Sem Kimono)'],
    divisions: ['Juvenil', 'Adulto', 'Master 1 a 6 (Todas as Faixas)'],
    bannerUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80',
    registrationPrice: 'R$ 130,00',
    isRegistrationOpen: true,
    description: 'O maior torneio do estado com transmissão ao vivo e pontuação direta no ranking global STRAVA FIGHT.',
    registeredCount: 0
  },
  {
    id: 'evt_2',
    title: 'Seminário Técnico Internacional de Passagem de Guarda',
    type: 'SEMINÁRIO',
    organizer: 'SF Academy & Mestre Uarlei Silva',
    date: '06/12/2026',
    time: '14:00',
    location: 'UBF Team Parque Indiano',
    city: 'São Paulo - SP',
    modalities: ['Jiu-Jitsu'],
    divisions: ['Aberto a todas as graduações'],
    bannerUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&auto=format&fit=crop&q=80',
    registrationPrice: 'R$ 80,00',
    isRegistrationOpen: true,
    description: '3 horas de imersão técnica em passagens modernas de guarda emborcada, toureando e smash pass.',
    registeredCount: 0
  }
];

// High-performance in-memory cache to eliminate repetitive synchronous JSON parsing on every render
const memoryCache = new Map<string, any>();

function getCached<T>(key: string, fallback: T): T {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  try {
    if (typeof localStorage === 'undefined') {
      memoryCache.set(key, fallback);
      return fallback;
    }
    const data = localStorage.getItem(key);
    const parsed = data ? JSON.parse(data) : fallback;
    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    memoryCache.set(key, fallback);
    return fallback;
  }
}

function setCached<T>(key: string, value: T): void {
  memoryCache.set(key, value);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}


// Storage Helper Functions with localStorage & fallbacks
export class StorageService {
  static getCurrentUser(): UserProfile {
    return getCached(STORAGE_KEYS.CURRENT_USER, DEFAULT_CURRENT_USER);
  }

  static saveCurrentUser(user: UserProfile): void {
    setCached(STORAGE_KEYS.CURRENT_USER, user);
  }

  static getPosts(): Post[] {
    return getCached(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
  }

  static savePosts(posts: Post[]): void {
    setCached(STORAGE_KEYS.POSTS, posts);
  }

  static getStories(): Story[] {
    return getCached(STORAGE_KEYS.STORIES, DEFAULT_STORIES);
  }

  static saveStories(stories: Story[]): void {
    setCached(STORAGE_KEYS.STORIES, stories);
  }

  static getReels(): Reel[] {
    return getCached(STORAGE_KEYS.REELS, DEFAULT_REELS);
  }

  static saveReels(reels: Reel[]): void {
    setCached(STORAGE_KEYS.REELS, reels);
  }

  static getConversations(): DirectConversation[] {
    return getCached(STORAGE_KEYS.CONVERSATIONS, DEFAULT_CONVERSATIONS);
  }

  static saveConversations(convs: DirectConversation[]): void {
    setCached(STORAGE_KEYS.CONVERSATIONS, convs);
  }

  static getMessages(convId: string): ChatMessage[] {
    const parsed = getCached<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    return parsed[convId] || [];
  }

  static saveMessages(convId: string, messages: ChatMessage[]): void {
    const parsed = getCached<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, { ...DEFAULT_MESSAGES });
    parsed[convId] = messages;
    setCached(STORAGE_KEYS.MESSAGES, parsed);
  }

  static getFriendRequests(): FriendRequest[] {
    return getCached(STORAGE_KEYS.FRIEND_REQUESTS, DEFAULT_FRIEND_REQUESTS);
  }

  static saveFriendRequests(requests: FriendRequest[]): void {
    setCached(STORAGE_KEYS.FRIEND_REQUESTS, requests);
  }

  static getNotifications(): NotificationItem[] {
    return getCached(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  }

  static saveNotifications(notifs: NotificationItem[]): void {
    setCached(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  static getAchievements(): AchievementBadge[] {
    return getCached(STORAGE_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
  }

  static saveAchievements(badges: AchievementBadge[]): void {
    setCached(STORAGE_KEYS.ACHIEVEMENTS, badges);
  }

  // SF Challenges
  static getChallenges(): CombatChallenge[] {
    return getCached(STORAGE_KEYS.CHALLENGES, DEFAULT_CHALLENGES);
  }

  static saveChallenges(challenges: CombatChallenge[]): void {
    setCached(STORAGE_KEYS.CHALLENGES, challenges);
  }

  static addChallenge(challenge: CombatChallenge): void {
    const all = this.getChallenges();
    this.saveChallenges([challenge, ...all]);
  }

  static updateChallengeStatus(id: string, status: 'ACCEPTED' | 'DECLINED' | 'COMPLETED', notes?: string): void {
    const all = this.getChallenges();
    const updated = all.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status,
          winnerNotes: notes || c.winnerNotes,
          completedAt: status === 'COMPLETED' ? new Date().toISOString() : c.completedAt
        };
      }
      return c;
    });
    this.saveChallenges(updated);
  }

  // SF Academy Methods
  static getAcademyInfo(): AcademyInfo {
    return getCached(STORAGE_KEYS.ACADEMY_INFO, DEFAULT_ACADEMY);
  }

  static saveAcademyInfo(info: AcademyInfo): void {
    setCached(STORAGE_KEYS.ACADEMY_INFO, info);
  }

  static getStudents(): Student[] {
    return getCached(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
  }

  static saveStudents(students: Student[]): void {
    setCached(STORAGE_KEYS.STUDENTS, students);
  }

  static getClasses(): ClassEntity[] {
    return getCached(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
  }

  static saveClasses(classes: ClassEntity[]): void {
    setCached(STORAGE_KEYS.CLASSES, classes);
  }

  static getAttendance(): AttendanceRecord[] {
    return getCached(STORAGE_KEYS.ATTENDANCE, []);
  }

  static saveAttendance(records: AttendanceRecord[]): void {
    setCached(STORAGE_KEYS.ATTENDANCE, records);
  }

  static getFees(): MonthlyFee[] {
    return getCached(STORAGE_KEYS.FEES, DEFAULT_FEES);
  }

  static saveFees(fees: MonthlyFee[]): void {
    setCached(STORAGE_KEYS.FEES, fees);
  }

  static getCash(): CashTransaction[] {
    return getCached(STORAGE_KEYS.CASH, DEFAULT_CASH);
  }

  static saveCash(cash: CashTransaction[]): void {
    setCached(STORAGE_KEYS.CASH, cash);
  }

  static getTrials(): TrialStudent[] {
    return getCached(STORAGE_KEYS.TRIALS, DEFAULT_TRIALS);
  }

  static saveTrials(trials: TrialStudent[]): void {
    setCached(STORAGE_KEYS.TRIALS, trials);
  }

  static getEvents(): CombatEvent[] {
    return getCached(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
  }

  static saveEvents(events: CombatEvent[]): void {
    setCached(STORAGE_KEYS.EVENTS, events);
  }

  // Backup & Import
  static exportCompleteBackup(): string {
    const backup = {
      platform: 'STRAVA FIGHT',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      academyInfo: this.getAcademyInfo(),
      students: this.getStudents(),
      classes: this.getClasses(),
      attendance: this.getAttendance(),
      fees: this.getFees(),
      cash: this.getCash(),
      trials: this.getTrials()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importCompleteBackup(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') return false;

      // Handle both UBF Team v1 legacy format and STRAVA FIGHT v2 format
      if (data.academyInfo) {
        this.saveAcademyInfo(data.academyInfo);
      } else if (data.settings) {
        const convertedAcademy: AcademyInfo = {
          id: 'acad_imported',
          name: data.settings.academyName || 'Academia Importada',
          masterName: data.settings.masterName || 'Mestre',
          address: 'Cadastrada via backup',
          phone: '',
          modalities: ['Jiu-Jitsu', 'Muay Thai', 'Boxe'],
          description: 'Restaurada do sistema de gestão anterior.',
          isConfigured: true,
          pinCode: data.settings.pinCode,
          lastBackupDate: new Date().toISOString()
        };
        this.saveAcademyInfo(convertedAcademy);
      }

      if (Array.isArray(data.students)) this.saveStudents(data.students);
      if (Array.isArray(data.classes)) this.saveClasses(data.classes);
      if (Array.isArray(data.attendance)) this.saveAttendance(data.attendance);
      if (Array.isArray(data.fees)) this.saveFees(data.fees);
      if (Array.isArray(data.cash)) this.saveCash(data.cash);
      if (Array.isArray(data.trials)) this.saveTrials(data.trials);

      return true;
    } catch (e) {
      console.error('Falha ao restaurar backup', e);
      return false;
    }
  }
}
