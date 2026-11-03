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
  id: 'usr_me',
  username: 'mauricioalex',
  fullName: 'Maurício Alex',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
  bio: 'Atleta de Jiu-Jitsu & Muay Thai | Treino duro, mente calma 🥋🥊 | “Esforço que transforma, luta que evolui.”',
  role: 'Atleta',
  location: 'São Paulo, SP - Brasil',
  modalities: [
    { modality: 'Jiu-Jitsu', belt: 'Faixa Marrom' },
    { modality: 'Muay Thai', belt: 'Prajiad Azul Escuro' },
    { modality: 'Boxe', belt: 'Avançado' }
  ],
  affiliatedAcademyName: 'UBF Team Parque Indiano',
  affiliatedAcademyId: 'acad_ubf_01',
  isVerified: true,
  followersCount: 1420,
  followingCount: 480,
  friendsCount: 126,
  postsCount: 38,
  streakDays: 14,
  totalCheckIns: 86,
  xpPoints: 3450,
  beltRankSocial: 'Faixa Marrom SF (Nível 4)',
  badges: ['badge_streak_7', 'badge_first_roll', 'badge_sparring_warrior', 'badge_tatame_hero']
};

// Initial Stories
const DEFAULT_STORIES: Story[] = [
  {
    id: 'story_me',
    userId: 'usr_me',
    username: 'Seu story',
    userFullName: 'Maurício Alex',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    hasUnread: false,
    items: [
      {
        id: 's_item_1',
        mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        timestamp: 'há 2h',
        caption: 'Treino de competição hoje foi insano! 10 rounds de 6min. 🔥'
      }
    ]
  },
  {
    id: 'story_uarlei',
    userId: 'usr_uarlei',
    username: 'mestre.uarlei',
    userFullName: 'Mestre Uarlei Silva',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    hasUnread: true,
    items: [
      {
        id: 's_item_2',
        mediaUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        timestamp: 'há 4h',
        caption: 'Tatame pronto para a aula das 19h30! Oss!'
      }
    ]
  },
  {
    id: 'story_amanda',
    userId: 'usr_amanda',
    username: 'amanda_bjj',
    userFullName: 'Amanda Souza',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    hasUnread: true,
    items: [
      {
        id: 's_item_3',
        mediaUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        timestamp: 'há 6h',
        caption: 'Ajuste de pegada no estrangulamento cruzado da guarda fechada.'
      }
    ]
  },
  {
    id: 'story_carlos',
    userId: 'usr_carlos',
    username: 'carlos_mma',
    userFullName: 'Carlos Gracie Silva',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    hasUnread: true,
    items: [
      {
        id: 's_item_4',
        mediaUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        timestamp: 'há 8h',
        caption: 'Bate-saco com caneleira. Foco no quadril!'
      }
    ]
  },
  {
    id: 'story_beatriz',
    userId: 'usr_beatriz',
    username: 'beatriz_thai',
    userFullName: 'Beatriz Muay Thai',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    hasUnread: true,
    items: [
      {
        id: 's_item_5',
        mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        timestamp: 'há 11h',
        caption: 'Clinch e joelhada. Força no core!'
      }
    ]
  }
];

// Initial Posts Feed
const DEFAULT_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'usr_uarlei',
    authorName: 'Mestre Uarlei Silva',
    authorUsername: 'mestre.uarlei',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    authorModality: 'Jiu-Jitsu & MMA',
    authorBelt: 'Faixa Preta 3º Dan',
    isAuthorVerified: true,
    mediaUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Mais um dia de dedicação pura no tatame da UBF Team. Não existe atalho para quem busca a maestria na arte suave. A consistência diária vence qualquer talento sem disciplina. Oss a todos os guerreiros!',
    hashtags: ['#JiuJitsu', '#ArteSuave', '#UBFTeam', '#StravaFight', '#EsforcoQueTransforma'],
    location: 'UBF Team Parque Indiano - SP',
    taggedAcademy: 'UBF Team Parque Indiano',
    likesCount: 184,
    hasLiked: false,
    commentsCount: 23,
    sharesCount: 12,
    savesCount: 19,
    hasSaved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    comments: [
      {
        id: 'c1',
        postId: 'post_1',
        authorUsername: 'mauricioalex',
        authorName: 'Maurício Alex',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        text: 'Treino de hoje foi sensacional mestre! Posição da passagem de guarda funcionou perfeitamente no rola.',
        createdAt: 'há 30m',
        likesCount: 5
      },
      {
        id: 'c2',
        postId: 'post_1',
        authorUsername: 'amanda_bjj',
        authorName: 'Amanda Souza',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        text: 'Oss mestre! Amanhã tô firme na aula das 18h.',
        createdAt: 'há 20m',
        likesCount: 2
      }
    ],
    trainingData: {
      rounds: 8,
      durationMinutes: 90,
      intensity: 'GUERRA',
      xpGained: 150
    }
  },
  {
    id: 'post_2',
    authorId: 'usr_amanda',
    authorName: 'Amanda Souza',
    authorUsername: 'amanda_bjj',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    authorModality: 'Jiu-Jitsu',
    authorBelt: 'Faixa Roxa',
    isAuthorVerified: true,
    mediaUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=900&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Foco total no Paulista que se aproxima! Ajustando os detalhes da guarda De La Riva e raspagem de gancho. 14 dias invicta de treinos pelo STRAVA FIGHT! 🔥🥋',
    hashtags: ['#BJJWomen', '#DeLaRiva', '#Competicao', '#Tatame', '#FocoNoOuro'],
    location: 'Centro de Treinamento SP',
    likesCount: 312,
    hasLiked: true,
    commentsCount: 41,
    sharesCount: 18,
    savesCount: 37,
    hasSaved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    comments: [
      {
        id: 'c3',
        postId: 'post_2',
        authorUsername: 'carlos_mma',
        authorName: 'Carlos Gracie Silva',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        text: 'Tá voando Amanda! Ouro com certeza.',
        createdAt: 'há 1h',
        likesCount: 4
      }
    ]
  },
  {
    id: 'post_3',
    authorId: 'usr_beatriz',
    authorName: 'Beatriz Muay Thai',
    authorUsername: 'beatriz_thai',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    authorModality: 'Muay Thai & Kickboxing',
    authorBelt: 'Instrutora Kruang Vermelho',
    isAuthorVerified: false,
    mediaUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Sequência de hoje: direto + cruzado + low kick na coxa + clinch com joelho reto. Muay Thai tradicional com respeito e técnica apurada. Sawadee Kaa!',
    hashtags: ['#MuayThai', '#Kickboxing', '#Striking', '#Sparring', '#StravaFight'],
    location: 'Academia Thai Warrior',
    likesCount: 220,
    hasLiked: false,
    commentsCount: 16,
    sharesCount: 9,
    savesCount: 15,
    hasSaved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    comments: []
  }
];

// Initial Reels
const DEFAULT_REELS: Reel[] = [
  {
    id: 'reel_1',
    authorId: 'usr_carlos',
    authorUsername: 'carlos_mma',
    authorName: 'Carlos Gracie Silva',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    authorModality: 'MMA & Wrestling',
    authorBelt: 'Faixa Preta',
    isAuthorVerified: true,
    videoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=720&auto=format&fit=crop&q=80',
    caption: 'Takedown rápido saindo do jab falso. Timing é tudo no MMA! Treino de sprawl e single leg. #Wrestling #MMA #Quedas #StravaFight',
    hashtags: ['#MMA', '#Wrestling', '#Takedown', '#FightTech'],
    audioTrack: 'Áudio original — Som do Tatame & Impacto',
    likesCount: 1820,
    hasLiked: false,
    commentsCount: 94,
    sharesCount: 120,
    savesCount: 310,
    hasSaved: false,
    isFollowingAuthor: false
  },
  {
    id: 'reel_2',
    authorId: 'usr_amanda',
    authorUsername: 'amanda_bjj',
    authorName: 'Amanda Souza',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    authorModality: 'Jiu-Jitsu',
    authorBelt: 'Faixa Roxa',
    isAuthorVerified: true,
    videoUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=720&auto=format&fit=crop&q=80',
    caption: 'Raspagem de guarda borboleta com armdrag. Simples, eficiente e direto ao ponto. Quem aí usa no rola? 🦋🥋',
    hashtags: ['#ButterflyGuard', '#Raspagem', '#JiuJitsu', '#BJJ'],
    audioTrack: 'Brazilian Jiu-Jitsu Beat (Instrumental)',
    likesCount: 3410,
    hasLiked: true,
    commentsCount: 158,
    sharesCount: 304,
    savesCount: 820,
    hasSaved: true,
    isFollowingAuthor: true
  },
  {
    id: 'reel_3',
    authorId: 'usr_beatriz',
    authorUsername: 'beatriz_thai',
    authorName: 'Beatriz Muay Thai',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    authorModality: 'Muay Thai',
    authorBelt: 'Kruang Vermelho',
    isAuthorVerified: false,
    videoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=720&auto=format&fit=crop&q=80',
    caption: 'Esquiva de direto com contra-ataque de cotovelo giratório! Precisão cirúrgica no sparring. 🥊🔥',
    hashtags: ['#MuayThai', '#ElbowStrike', '#Sparring', '#StravaFight'],
    audioTrack: 'Traditional Thai Boxing Music — Sarama',
    likesCount: 940,
    hasLiked: false,
    commentsCount: 42,
    sharesCount: 88,
    savesCount: 140,
    hasSaved: false,
    isFollowingAuthor: false
  }
];

// Initial Direct Conversations (matching screenshots img4 & img3)
const DEFAULT_CONVERSATIONS: DirectConversation[] = [
  {
    id: 'conv_uarlei',
    otherUser: {
      id: 'usr_uarlei',
      name: 'Mestre Uarlei Silva',
      username: 'mestre.uarlei',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      isOnline: true,
      lastActive: 'Online agora',
      modality: 'Jiu-Jitsu & MMA',
      belt: 'Faixa Preta 3º Dan'
    },
    tab: 'primary',
    unreadCount: 1,
    lastMessage: {
      text: 'Maurício, você vai puxar o aquecimento com a turma das 19h30 hoje?',
      timestamp: '16:33',
      senderId: 'usr_uarlei',
      isRead: false
    }
  },
  {
    id: 'conv_amanda',
    otherUser: {
      id: 'usr_amanda',
      name: 'Amanda Souza',
      username: 'amanda_bjj',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      isOnline: false,
      lastActive: 'há 15m',
      modality: 'Jiu-Jitsu',
      belt: 'Faixa Roxa'
    },
    tab: 'primary',
    unreadCount: 0,
    lastMessage: {
      text: 'Valeu pelo treino de ontem! O sparring foi excelente.',
      timestamp: '14:20',
      senderId: 'usr_me',
      isRead: true
    }
  },
  {
    id: 'conv_carlos',
    otherUser: {
      id: 'usr_carlos',
      name: 'Carlos Gracie Silva',
      username: 'carlos_mma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      isOnline: true,
      lastActive: 'Online',
      modality: 'MMA',
      belt: 'Faixa Preta'
    },
    tab: 'general',
    unreadCount: 0,
    lastMessage: {
      text: 'Bora marcar aquele camp em dezembro?',
      timestamp: 'Ontem',
      senderId: 'usr_carlos',
      isRead: true
    }
  },
  {
    id: 'conv_beatriz',
    otherUser: {
      id: 'usr_beatriz',
      name: 'Beatriz Muay Thai',
      username: 'beatriz_thai',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      isOnline: false,
      lastActive: 'há 2h',
      modality: 'Muay Thai',
      belt: 'Kruang Vermelho'
    },
    tab: 'requests',
    unreadCount: 1,
    lastMessage: {
      text: 'Olá Maurício! Vi seu perfil no STRAVA FIGHT, você treina em qual academia?',
      timestamp: 'Ontem',
      senderId: 'usr_beatriz',
      isRead: false
    }
  }
];

// Initial Messages for Mestre Uarlei
const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  conv_uarlei: [
    {
      id: 'msg_1',
      conversationId: 'conv_uarlei',
      senderId: 'usr_me',
      text: 'Mestre, boa tarde! Consegui confirmar os 8 alunos na turma de competição.',
      timestamp: '16:30',
      isRead: true
    },
    {
      id: 'msg_2',
      conversationId: 'conv_uarlei',
      senderId: 'usr_uarlei',
      text: 'TOPPPPPP! Excelente notícia.',
      timestamp: '16:31',
      isRead: true
    },
    {
      id: 'msg_3',
      conversationId: 'conv_uarlei',
      senderId: 'usr_uarlei',
      text: 'Vamos fazer foco específico em passagem de guarda e defesa de triângulo hoje.',
      timestamp: '16:32',
      isRead: true
    },
    {
      id: 'msg_4',
      conversationId: 'conv_uarlei',
      senderId: 'usr_uarlei',
      text: 'Maurício, você vai puxar o aquecimento com a turma das 19h30 hoje?',
      timestamp: '16:33',
      isRead: false
    }
  ]
};

// Initial Friend Requests
const DEFAULT_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'fr_1',
    senderId: 'usr_felipe',
    senderName: 'Felipe Santos',
    senderUsername: 'felipe_boxer',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    senderModality: 'Boxe',
    senderBelt: 'Campeão Paulista',
    mutualFriendsCount: 8,
    createdAt: 'há 2 horas',
    status: 'PENDING'
  },
  {
    id: 'fr_2',
    senderId: 'usr_lucas',
    senderName: 'Lucas Judoca',
    senderUsername: 'lucas_judo',
    senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    senderModality: 'Judô',
    senderBelt: 'Faixa Preta 1º Dan',
    mutualFriendsCount: 14,
    createdAt: 'há 1 dia',
    status: 'PENDING'
  }
];

// Initial Notifications
const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'LIKE',
    actorName: 'Mestre Uarlei Silva',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    text: 'curtiu seu relato de treino de 10 rounds.',
    timestamp: 'há 15m',
    isRead: false,
    targetId: 'post_1'
  },
  {
    id: 'notif_2',
    type: 'STREAK_MILESTONE',
    actorName: 'STRAVA FIGHT',
    actorAvatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80',
    text: 'Parabéns! Você alcançou 14 dias seguidos de treino no Tatame Streak! 🔥🥋',
    timestamp: 'há 2h',
    isRead: false
  },
  {
    id: 'notif_3',
    type: 'FRIEND_REQUEST',
    actorName: 'Felipe Santos',
    actorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    text: 'enviou uma solicitação de amizade para você.',
    timestamp: 'há 2h',
    isRead: true
  },
  {
    id: 'notif_challenge_1',
    type: 'CHALLENGE_INVITE',
    actorName: 'Carlos Gracie Silva',
    actorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    text: 'desafiou você para: "Desafio de Sparring: 8 Rounds de MMA & Takedowns no Sábado" ⚔️🥊',
    timestamp: 'há 10m',
    isRead: false,
    challengeId: 'chal_carlos_1',
    challengeMeta: {
      category: 'SPARRING',
      modality: 'MMA & Takedowns',
      targetRounds: 8,
      proposedDate: 'Sábado às 10h'
    }
  },
  {
    id: 'notif_4',
    type: 'COMMENT',
    actorName: 'Amanda Souza',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    text: 'comentou na sua publicação: "Técnica perfeita!"',
    timestamp: 'há 5h',
    isRead: true,
    targetId: 'post_2'
  }
];

// Initial Challenges
const DEFAULT_CHALLENGES: CombatChallenge[] = [
  {
    id: 'chal_carlos_1',
    challengerId: 'usr_carlos',
    challengerName: 'Carlos Gracie Silva',
    challengerUsername: 'carlos_mma',
    challengerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    challengerBelt: 'Faixa Preta',
    targetId: 'usr_me',
    targetName: 'Maurício Alex',
    targetUsername: 'mauricioalex',
    targetAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    targetBelt: 'Faixa Marrom',
    title: 'Desafio de Sparring: 8 Rounds de MMA & Takedowns no Sábado',
    modality: 'MMA',
    category: 'SPARRING',
    targetRounds: 8,
    proposedDate: 'Próximo Sábado às 10h',
    location: 'UBF Team Parque Indiano',
    notes: '8 rounds de 3 minutos com caneleira e luva de 14oz. Foco em quedas e trocação técnica.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: 'chal_amanda_1',
    challengerId: 'usr_me',
    challengerName: 'Maurício Alex',
    challengerUsername: 'mauricioalex',
    challengerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    challengerBelt: 'Faixa Marrom',
    targetId: 'usr_amanda',
    targetName: 'Amanda Souza',
    targetUsername: 'amanda_bjj',
    targetAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    targetBelt: 'Faixa Roxa',
    title: 'Meta de Tatame: 50 Rounds no Mês de Novembro',
    modality: 'Jiu-Jitsu',
    category: 'ROUNDS_META',
    targetRounds: 50,
    proposedDate: 'Durante todo o mês de Novembro',
    location: 'UBF Team Parque Indiano',
    notes: 'Desafio de volume de treino para chegar na ponta dos cascos no Paulista!',
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

// Initial Achievements
const DEFAULT_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'badge_first_roll',
    name: 'Primeiro Rola',
    icon: '🥋',
    description: 'Completou o primeiro treino registrado na plataforma.',
    unlockedAt: '15/10/2026',
    isUnlocked: true,
    xpValue: 100
  },
  {
    id: 'badge_streak_7',
    name: 'Fogo no Tatame (7 Dias)',
    icon: '🔥',
    description: 'Manteve 7 dias consecutivos de treinos registrados.',
    unlockedAt: '24/10/2026',
    isUnlocked: true,
    xpValue: 350
  },
  {
    id: 'badge_sparring_warrior',
    name: 'Guerreiro de Sparring',
    icon: '🥊',
    description: 'Registrou mais de 50 rounds de sparring de alta intensidade.',
    unlockedAt: '28/10/2026',
    isUnlocked: true,
    xpValue: 500
  },
  {
    id: 'badge_tatame_hero',
    name: 'Guardião da Academia',
    icon: '🛡️',
    description: 'Fez check-in regular na mesma academia por 30 dias.',
    unlockedAt: '01/11/2026',
    isUnlocked: true,
    xpValue: 600
  },
  {
    id: 'badge_century_rolls',
    name: 'Lenda dos 100 Treinos',
    icon: '👑',
    description: 'Alcance 100 check-ins totais de artes marciais.',
    isUnlocked: false,
    xpValue: 1000
  },
  {
    id: 'badge_multidisciplinary',
    name: 'Polivalente do Combate',
    icon: '⚡',
    description: 'Treine 3 modalidades diferentes na mesma semana.',
    isUnlocked: false,
    xpValue: 400
  }
];

// SF Academy Initial Data (Preserving UBF Team Management Schema)
const DEFAULT_ACADEMY: AcademyInfo = {
  id: 'acad_ubf_01',
  name: 'UBF Team Parque Indiano',
  masterName: 'Mestre Uarlei Silva',
  logoUrl: '/icon.png',
  address: 'Rua das Lutas, 150 - Parque Indiano, São Paulo - SP',
  phone: '11988887777',
  modalities: ['Jiu-Jitsu', 'Muay Thai', 'MMA', 'Boxe', 'Wrestling'],
  description: 'Academia de formação de campeões e praticantes dedicados. Esforço que transforma, luta que evolui.',
  isConfigured: true,
  lastBackupDate: new Date().toISOString()
};

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std_1',
    academyId: 'acad_ubf_01',
    name: 'Lucas Ferreira Mendes',
    phone: '11998877665',
    birthDate: '14/05/1998',
    isMinor: false,
    modality: 'Jiu-Jitsu',
    graduation: 'Faixa Azul (2 graus)',
    classId: 'cls_1',
    monthlyFee: 140,
    dueDay: 10,
    status: 'ATIVO',
    notes: 'Treina focado em competição até 76kg.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60
  },
  {
    id: 'std_2',
    academyId: 'acad_ubf_01',
    name: 'Gabriel Ribeiro Silva (Menor)',
    phone: '11977665544',
    birthDate: '22/08/2011',
    isMinor: true,
    guardianName: 'Marcos Silva (Pai)',
    guardianPhone: '11977665544',
    guardianRelationship: 'Pai',
    modality: 'Jiu-Jitsu',
    graduation: 'Faixa Amarela',
    classId: 'cls_2',
    monthlyFee: 120,
    dueDay: 5,
    status: 'ATIVO',
    notes: 'Atestado médico entregue. Ótimo desempenho na guarda.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90
  },
  {
    id: 'std_3',
    academyId: 'acad_ubf_01',
    name: 'Juliana Castro',
    phone: '11988112233',
    birthDate: '03/11/1996', // Aniversariante esta semana!
    isMinor: false,
    modality: 'Muay Thai',
    graduation: 'Prajiad Branco/Vermelho',
    classId: 'cls_3',
    monthlyFee: 130,
    dueDay: 15,
    status: 'ATIVO',
    notes: 'Excelente boxe, treinando clinch.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40
  },
  {
    id: 'std_4',
    academyId: 'acad_ubf_01',
    name: 'Rodrigo Nogueira Rocha',
    phone: '11966554433',
    birthDate: '10/02/1990',
    isMinor: false,
    modality: 'MMA',
    graduation: 'Faixa Roxa',
    classId: 'cls_1',
    monthlyFee: 160,
    dueDay: 10,
    status: 'ATIVO',
    notes: 'Preparação para luta amadora.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120
  }
];

const DEFAULT_CLASSES: ClassEntity[] = [
  {
    id: 'cls_1',
    academyId: 'acad_ubf_01',
    name: 'Jiu-Jitsu Adulto Noite (Avançado & Competição)',
    modality: 'Jiu-Jitsu',
    level: 'Graduados',
    instructor: 'Mestre Uarlei Silva',
    days: ['Seg', 'Qua', 'Sex'],
    startTime: '19:30',
    endTime: '21:00',
    maxCapacity: 30
  },
  {
    id: 'cls_2',
    academyId: 'acad_ubf_01',
    name: 'Jiu-Jitsu Kids & Juvenil',
    modality: 'Jiu-Jitsu',
    level: 'Iniciante e Intermediário',
    instructor: 'Mestre Uarlei Silva',
    days: ['Ter', 'Qui'],
    startTime: '17:30',
    endTime: '18:30',
    maxCapacity: 20
  },
  {
    id: 'cls_3',
    academyId: 'acad_ubf_01',
    name: 'Muay Thai Tradicional Noite',
    modality: 'Muay Thai',
    level: 'Todos os Níveis',
    instructor: 'Prof. Felipe Santos',
    days: ['Seg', 'Qua', 'Sex'],
    startTime: '18:30',
    endTime: '19:30',
    maxCapacity: 25
  }
];

const DEFAULT_FEES: MonthlyFee[] = [
  {
    id: 'fee_1',
    academyId: 'acad_ubf_01',
    studentId: 'std_1',
    studentName: 'Lucas Ferreira Mendes',
    monthYear: '11/2026',
    dueDate: '10/11/2026',
    amount: 140,
    amountPaid: 0,
    status: 'PENDENTE'
  },
  {
    id: 'fee_2',
    academyId: 'acad_ubf_01',
    studentId: 'std_2',
    studentName: 'Gabriel Ribeiro Silva (Menor)',
    monthYear: '11/2026',
    dueDate: '05/11/2026',
    amount: 120,
    amountPaid: 0,
    status: 'PENDENTE'
  },
  {
    id: 'fee_3',
    academyId: 'acad_ubf_01',
    studentId: 'std_3',
    studentName: 'Juliana Castro',
    monthYear: '10/2026',
    dueDate: '15/10/2026',
    amount: 130,
    amountPaid: 130,
    status: 'PAGO',
    paidDate: '14/10/2026',
    paymentMethod: 'PIX'
  },
  {
    id: 'fee_4',
    academyId: 'acad_ubf_01',
    studentId: 'std_4',
    studentName: 'Rodrigo Nogueira Rocha',
    monthYear: '10/2026',
    dueDate: '10/10/2026',
    amount: 160,
    amountPaid: 0,
    status: 'ATRASADO'
  }
];

const DEFAULT_CASH: CashTransaction[] = [
  {
    id: 'cash_1',
    academyId: 'acad_ubf_01',
    type: 'ENTRADA',
    category: 'Mensalidades',
    description: 'Mensalidade 10/2026 - Juliana Castro',
    amount: 130,
    date: '14/10/2026',
    paymentMethod: 'PIX',
    feeId: 'fee_3',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18
  },
  {
    id: 'cash_2',
    academyId: 'acad_ubf_01',
    type: 'ENTRADA',
    category: 'Venda de Kimonos e Produtos',
    description: 'Kimono Branco Trançado A2 + Faixa',
    amount: 380,
    date: '20/10/2026',
    paymentMethod: 'PIX',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12
  },
  {
    id: 'cash_3',
    academyId: 'acad_ubf_01',
    type: 'SAIDA',
    category: 'Material e Limpeza Tatame',
    description: 'Desinfetante bactericida hospitalar para tatame',
    amount: 145,
    date: '25/10/2026',
    paymentMethod: 'PIX',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
  }
];

const DEFAULT_TRIALS: TrialStudent[] = [
  {
    id: 'trial_1',
    academyId: 'acad_ubf_01',
    name: 'Marcelo Pires',
    phone: '11987654321',
    modality: 'Jiu-Jitsu',
    scheduledDate: '04/11/2026',
    status: 'AGENDADA',
    notes: 'Quer iniciar na arte suave para perder peso e defesa pessoal.',
    createdAt: Date.now() - 1000 * 60 * 60 * 12
  }
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
    registeredCount: 342
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
    registeredCount: 45
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
