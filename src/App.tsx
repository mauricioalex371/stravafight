import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StorageService } from './services/storageService';
import { LikesService, CommentsService, FollowersService, NotificationsService, MessagesService } from './services/supabase';
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
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AuthScreen } from './components/AuthScreen';
import { SignupFlow } from './components/SignupFlow';

// Immediate primary view
import { FeedView } from './views/FeedView';

// Dynamic code-splitting for secondary views
const InicioPage = React.lazy(() => import('./pages/InicioPage').then((m) => ({ default: m.InicioPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const CadastroPage = React.lazy(() => import('./pages/CadastroPage').then((m) => ({ default: m.CadastroPage })));
const ExploreView = React.lazy(() => import('./views/ExploreView').then((m) => ({ default: m.ExploreView })));
const ReelsView = React.lazy(() => import('./views/ReelsView').then((m) => ({ default: m.ReelsView })));
const DirectInboxView = React.lazy(() => import('./views/DirectInboxView').then((m) => ({ default: m.DirectInboxView })));
const ProfileView = React.lazy(() => import('./views/ProfileView').then((m) => ({ default: m.ProfileView })));
const AcademyView = React.lazy(() => import('./views/AcademyView').then((m) => ({ default: m.AcademyView })));
const BusinessView = React.lazy(() => import('./views/BusinessView').then((m) => ({ default: m.BusinessView })));
const FriendsView = React.lazy(() => import('./views/FriendsView').then((m) => ({ default: m.FriendsView })));
const EventsView = React.lazy(() => import('./views/EventsView').then((m) => ({ default: m.EventsView })));
const InstitutionalView = React.lazy(() => import('./views/InstitutionalView').then((m) => ({ default: m.InstitutionalView })));
const AdminPanel = React.lazy(() => import('./views/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const AuthCallbackView = React.lazy(() => import('./views/AuthCallbackView').then((m) => ({ default: m.AuthCallbackView })));

// Dynamic code-splitting for heavy modals
const SfActivityModal = React.lazy(() => import('./components/SfActivityModal').then((m) => ({ default: m.SfActivityModal })));
const StoryViewerModal = React.lazy(() => import('./components/StoryViewerModal').then((m) => ({ default: m.StoryViewerModal })));
const CheckInModal = React.lazy(() => import('./components/CheckInModal').then((m) => ({ default: m.CheckInModal })));
const CreatePostModal = React.lazy(() => import('./components/CreatePostModal').then((m) => ({ default: m.CreatePostModal })));
const CommentsModal = React.lazy(() => import('./components/CommentsModal').then((m) => ({ default: m.CommentsModal })));
const ShareModal = React.lazy(() => import('./components/ShareModal').then((m) => ({ default: m.ShareModal })));
const NotificationsModal = React.lazy(() => import('./components/NotificationsModal').then((m) => ({ default: m.NotificationsModal })));
const CreateChallengeModal = React.lazy(() => import('./components/CreateChallengeModal').then((m) => ({ default: m.CreateChallengeModal })));

import { generateUUID, getTodayDateBR, getCurrentMonthYear } from './utils/formatters';
import { Sparkles, PlusSquare, X, Flame, Swords } from 'lucide-react';

const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-pulse">
    <div className="w-10 h-10 rounded-full border-2 border-[#171C25] border-t-[#F20D18] animate-spin mb-3 shadow-lg shadow-[#F20D18]/20" />
    <span className="text-xs font-black tracking-widest text-[#94A3B8] uppercase">STRAVA FIGHT</span>
    <span className="text-[10px] text-[#475569] font-semibold mt-1">Carregando tatame...</span>
  </div>
);


export default function App() {
  // Check if accessing admin panel or OAuth callback
  useEffect(() => {
    if (window.location.pathname === '/secret') {
      setCurrentView('admin');
      setAppState('main');
    } else if (window.location.pathname === '/auth/callback') {
      // OAuth callback will be handled by AuthCallbackView component
      return;
    }
  }, []);

  // App State Flow
  const [appState, setAppState] = useState<'splash' | 'onboarding' | 'auth' | 'signup' | 'main'>('splash');
  const [isFirstTime, setIsFirstTime] = useState(() => {
    const hasSeenOnboarding = localStorage.getItem('sf_seen_onboarding');
    const hasAccount = localStorage.getItem('sf_current_user');
    return !hasSeenOnboarding && !hasAccount;
  });

  const [currentView, setCurrentView] = useState<string>('feed');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sf-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(StorageService.getCurrentUser());
  const [posts, setPosts] = useState<Post[]>(StorageService.getPosts());
  const [stories, setStories] = useState<Story[]>(StorageService.getStories());
  const [reels, setReels] = useState<Reel[]>(StorageService.getReels());
  const [conversations, setConversations] = useState<DirectConversation[]>(StorageService.getConversations());
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(StorageService.getFriendRequests());
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageService.getNotifications());
  const [achievements, setAchievements] = useState<AchievementBadge[]>(StorageService.getAchievements());
  const [events, setEvents] = useState<CombatEvent[]>(StorageService.getEvents());
  const [challenges, setChallenges] = useState<CombatChallenge[]>(StorageService.getChallenges());

  // Handlers for App Flow
  const handleSplashComplete = () => {
    if (isFirstTime) {
      setAppState('onboarding');
    } else {
      const hasAccount = localStorage.getItem('sf_current_user');
      if (hasAccount) {
        setAppState('main');
      } else {
        setAppState('auth');
      }
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('sf_seen_onboarding', 'true');
    setAppState('auth');
  };

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const handleLogin = () => {
    // Simulate login - in real app would authenticate
    setAppState('main');
  };

  const handleGoToSignup = (email: string, password: string) => {
    setAuthEmail(email);
    setAuthPassword(password);
    setAppState('signup');
  };

  const handleSignupComplete = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    StorageService.saveCurrentUser(newUser);
    setAppState('main');
  };

  const handleBackFromSignup = () => {
    setAppState('auth');
  };

  // SF Academy State (Preserving and expanding UBF Team)
  const [academyInfo, setAcademyInfo] = useState<AcademyInfo>(StorageService.getAcademyInfo());
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [classes, setClasses] = useState<ClassEntity[]>(StorageService.getClasses());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(StorageService.getAttendance());
  const [fees, setFees] = useState<MonthlyFee[]>(StorageService.getFees());
  const [cash, setCash] = useState<CashTransaction[]>(StorageService.getCash());
  const [trials, setTrials] = useState<TrialStudent[]>(StorageService.getTrials());

  // Modals
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isSfActivityModalOpen, setIsSfActivityModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [challengeTargetUsername, setChallengeTargetUsername] = useState<string | undefined>(undefined);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [activeSharePost, setActiveSharePost] = useState<Post | null>(null);

  // Wave 1: Sincronizar estado de likes dos posts
  useEffect(() => {
    const syncLikes = async () => {
      if (posts.length > 0 && currentUser.id) {
        const postIds = posts.map(p => p.id);
        const likesMap = await LikesService.checkMultipleLikes(postIds, currentUser.id);
        
        const updated = posts.map(post => ({
          ...post,
          hasLiked: likesMap.get(post.id) || false
        }));
        
        setPosts(updated);
      }
    };

    syncLikes();
  }, []); // Executa apenas uma vez no mount
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileCreateMenuOpen, setIsMobileCreateMenuOpen] = useState(false);
  const [gamificationBanner, setGamificationBanner] = useState<string | null>(null);

  // Synchronize messages when conversation changes
  useEffect(() => {
    if (activeConvId) {
      setMessages(StorageService.getMessages(activeConvId));
    }
  }, [activeConvId]);

  // Theme management
  useEffect(() => {
    localStorage.setItem('sf-theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Reload all data (e.g. after backup restore)
  const handleReloadAll = () => {
    setCurrentUser(StorageService.getCurrentUser());
    setChallenges(StorageService.getChallenges());
    setAcademyInfo(StorageService.getAcademyInfo());
    setStudents(StorageService.getStudents());
    setClasses(StorageService.getClasses());
    setAttendance(StorageService.getAttendance());
    setFees(StorageService.getFees());
    setCash(StorageService.getCash());
    setTrials(StorageService.getTrials());
  };

  // 1. Social Interactions: Likes & Saves
  const handleToggleLikePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.hasLiked;
    
    // Atualização otimista na UI
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const nextLiked = !p.hasLiked;
        return {
          ...p,
          hasLiked: nextLiked,
          likesCount: nextLiked ? p.likesCount + 1 : p.likesCount - 1
        };
      }
      return p;
    });
    setPosts(updated);

    // Operação real no Supabase
    try {
      if (wasLiked) {
        await LikesService.unlikePost(postId, currentUser.id);
      } else {
        await LikesService.likePost(postId, currentUser.id);
        // Notificar autor (se não for o próprio usuário)
        if (post.authorId !== currentUser.id) {
          await NotificationsService.notifyLike(post.authorId, currentUser.id, postId);
        }
      }
    } catch (error) {
      console.error('[App] Erro ao curtir/descurtir:', error);
      // Reverter UI em caso de erro
      setPosts(posts);
    }
  };

  const handleToggleSavePost = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          hasSaved: !p.hasSaved,
          savesCount: p.hasSaved ? p.savesCount - 1 : p.savesCount + 1
        };
      }
      return p;
    });
    setPosts(updated);
    StorageService.savePosts(updated);
  };

  const handleToggleLikeReel = (reelId: string) => {
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        const nextLiked = !r.hasLiked;
        return {
          ...r,
          hasLiked: nextLiked,
          likesCount: nextLiked ? r.likesCount + 1 : r.likesCount - 1
        };
      }
      return r;
    });
    setReels(updated);
    StorageService.saveReels(updated);
  };

  const handleToggleSaveReel = (reelId: string) => {
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        return { ...r, hasSaved: !r.hasSaved };
      }
      return r;
    });
    setReels(updated);
    StorageService.saveReels(updated);
  };

  const handleFollowAuthor = (authorId: string) => {
    const updated = reels.map((r) => {
      if (r.authorId === authorId) {
        return { ...r, isFollowingAuthor: !r.isFollowingAuthor };
      }
      return r;
    });
    setReels(updated);
    StorageService.saveReels(updated);
  };

  // 2. Publish Post & Check-In
  const handlePublishPost = (newPost: Post) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    StorageService.savePosts(updated);

    // Update current user post count
    const updatedUser: UserProfile = {
      ...currentUser,
      postsCount: currentUser.postsCount + 1
    };
    setCurrentUser(updatedUser);
    StorageService.saveCurrentUser(updatedUser);
    setCurrentView('feed');
  };

  const handleCompleteCheckIn = (checkIn: TrainingCheckIn, xpEarned: number) => {
    const newStreak = currentUser.streakDays + 1;
    const newXP = currentUser.xpPoints + xpEarned;
    const newCheckIns = currentUser.totalCheckIns + 1;

    // Determine Rank
    let rank = currentUser.beltRankSocial;
    if (newXP >= 4500) rank = 'Faixa Preta SF (Nível 5)';
    else if (newXP >= 3000) rank = 'Faixa Marrom SF (Nível 4)';
    else if (newXP >= 1800) rank = 'Faixa Roxa SF (Nível 3)';
    else if (newXP >= 800) rank = 'Faixa Azul SF (Nível 2)';

    const updatedUser: UserProfile = {
      ...currentUser,
      streakDays: newStreak,
      totalCheckIns: newCheckIns,
      xpPoints: newXP,
      beltRankSocial: rank
    };
    setCurrentUser(updatedUser);
    StorageService.saveCurrentUser(updatedUser);

    // Create Feed Post for this Check-in
    const autoPost: Post = {
      id: generateUUID(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      authorModality: checkIn.modality,
      authorBelt: currentUser.modalities[0]?.belt || 'Faixa Marrom',
      isAuthorVerified: currentUser.isVerified,
      mediaUrl: checkIn.mediaUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      mediaType: 'image',
      caption: checkIn.notes,
      hashtags: ['#StravaFight', `#${checkIn.modality.replace(/\s+/g, '')}`, '#TatameStreak', '#EsforcoQueTransforma'],
      location: currentUser.affiliatedAcademyName || 'Centro de Treinamento',
      taggedAcademy: currentUser.affiliatedAcademyName,
      likesCount: 1,
      hasLiked: true,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      hasSaved: false,
      createdAt: new Date().toISOString(),
      comments: [],
      trainingData: {
        rounds: checkIn.rounds,
        durationMinutes: checkIn.durationMinutes,
        intensity: checkIn.intensity,
        xpGained: xpEarned
      }
    };

    handlePublishPost(autoPost);

    // Show achievement banner
    setGamificationBanner(`Treino Registrado! 🔥 +${xpEarned} XP • ${newStreak} dias de Tatame Streak!`);
    setTimeout(() => setGamificationBanner(null), 5000);
  };

  const handlePublishSfActivity = (activityPost: Post, xpEarned: number) => {
    handlePublishPost(activityPost);
    const newStreak = currentUser.streakDays + 1;
    const newXP = currentUser.xpPoints + xpEarned;
    const newCheckIns = currentUser.totalCheckIns + 1;

    let rank = currentUser.beltRankSocial;
    if (newXP >= 4500) rank = 'Faixa Preta SF (Nível 5)';
    else if (newXP >= 3000) rank = 'Faixa Marrom SF (Nível 4)';
    else if (newXP >= 1800) rank = 'Faixa Roxa SF (Nível 3)';
    else if (newXP >= 800) rank = 'Faixa Azul SF (Nível 2)';

    const updatedUser: UserProfile = {
      ...currentUser,
      streakDays: newStreak,
      totalCheckIns: newCheckIns,
      xpPoints: newXP,
      beltRankSocial: rank
    };
    setCurrentUser(updatedUser);
    StorageService.saveCurrentUser(updatedUser);

    setGamificationBanner(`SF Activity Publicada com Filtro Oficial! 🔥 +${xpEarned} XP • ${newStreak} dias de Streak!`);
    setTimeout(() => setGamificationBanner(null), 5000);
  };

  // 3. Comments & Direct Messages
  const handleAddComment = async (postId: string, comment: any) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Atualização otimista
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, comment]
        };
      }
      return p;
    });
    setPosts(updated);
    if (activeCommentsPost?.id === postId) {
      setActiveCommentsPost(updated.find((p) => p.id === postId) || null);
    }

    // Operação real no Supabase
    try {
      const result = await CommentsService.createComment(postId, currentUser.id, comment.text);
      if (result.success && result.comment) {
        // Notificar autor do post (se não for o próprio usuário)
        if (post.authorId !== currentUser.id) {
          await NotificationsService.notifyComment(post.authorId, currentUser.id, postId);
        }
      } else {
        // Reverter em caso de erro
        setPosts(posts);
        if (activeCommentsPost?.id === postId) {
          setActiveCommentsPost(post);
        }
      }
    } catch (error) {
      console.error('[App] Erro ao criar comentário:', error);
      setPosts(posts);
    }
  };

  const handleSendMessage = (convId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: generateUUID(),
      conversationId: convId,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    StorageService.saveMessages(convId, updatedMessages);

    // Update conversation last message
    const updatedConvs = conversations.map((c) => {
      if (c.id === convId) {
        return {
          ...c,
          lastMessage: {
            text,
            timestamp: newMsg.timestamp,
            senderId: currentUser.id,
            isRead: true
          }
        };
      }
      return c;
    });
    setConversations(updatedConvs);
    StorageService.saveConversations(updatedConvs);
  };

  const handleReplyStory = (username: string, text: string) => {
    const targetConv = conversations.find((c) => c.otherUser.username === username) || conversations[0];
    if (targetConv) {
      handleSendMessage(targetConv.id, `Respondendo ao story: "${text}"`);
    }
  };

  const handleSendPostToConversation = (convId: string, post: Post) => {
    const newMsg: ChatMessage = {
      id: generateUUID(),
      conversationId: convId,
      senderId: currentUser.id,
      text: `Compartilhou uma publicação do STRAVA FIGHT de @${post.authorUsername}`,
      mediaType: 'post_share',
      postSnippet: {
        id: post.id,
        author: post.authorUsername,
        mediaUrl: post.mediaUrl,
        caption: post.caption
      },
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };
    const existing = StorageService.getMessages(convId);
    const updated = [...existing, newMsg];
    StorageService.saveMessages(convId, updated);
    if (activeConvId === convId) {
      setMessages(updated);
    }
    alert('Publicação compartilhada com sucesso!');
    setActiveSharePost(null);
  };

  // 4. Friend Requests
  const handleAcceptRequest = (reqId: string) => {
    const req = friendRequests.find((r) => r.id === reqId);
    if (req) {
      setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
      StorageService.saveFriendRequests(friendRequests.filter((r) => r.id !== reqId));
      setCurrentUser((prev) => ({ ...prev, friendsCount: prev.friendsCount + 1 }));
      alert(`Você e ${req.senderName} agora são amigos e parceiros de tatame!`);
    }
  };

  const handleRejectRequest = (reqId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    StorageService.saveFriendRequests(friendRequests.filter((r) => r.id !== reqId));
  };

  // 4.1. Combat Challenges Handlers
  const handleCreateChallenge = (newChallenge: CombatChallenge) => {
    StorageService.addChallenge(newChallenge);
    setChallenges(StorageService.getChallenges());

    // Automatically publish challenge announcement post on feed (as requested in the prompt)
    const challengePost: Post = {
      id: generateUUID(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      authorModality: newChallenge.modality,
      authorBelt: currentUser.modalities[0]?.belt || 'Faixa Marrom',
      isAuthorVerified: currentUser.isVerified,
      mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80',
      mediaType: 'image',
      caption: `⚔️ DESAFIO DE TATAME LANÇADO! Acabei de desafiar @${newChallenge.targetUsername} para: "${newChallenge.title}". ${newChallenge.notes || ''}`,
      hashtags: ['#DesafioStravaFight', '#Sparring', `#${newChallenge.modality.replace(/\s+/g, '')}`, '#Tatame'],
      location: newChallenge.location || currentUser.affiliatedAcademyName,
      taggedUsers: [{ username: newChallenge.targetUsername, name: newChallenge.targetName }],
      challengeData: {
        challengeId: newChallenge.id,
        challengerName: newChallenge.challengerName,
        targetName: newChallenge.targetName,
        category: newChallenge.category,
        targetRounds: newChallenge.targetRounds,
        status: 'PENDING'
      },
      likesCount: 1,
      hasLiked: true,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      hasSaved: false,
      createdAt: new Date().toISOString(),
      comments: []
    };
    handlePublishPost(challengePost);

    setGamificationBanner(`⚔️ Desafio enviado para @${newChallenge.targetUsername}! Acompanhe no seu perfil.`);
    setTimeout(() => setGamificationBanner(null), 5000);
  };

  const handleAcceptChallenge = (challengeId: string) => {
    StorageService.updateChallengeStatus(challengeId, 'ACCEPTED');
    const updatedChallenges = StorageService.getChallenges();
    setChallenges(updatedChallenges);

    const chal = updatedChallenges.find((c) => c.id === challengeId);

    // Mark notification as read
    const updatedNotifs = notifications.map((n) => n.challengeId === challengeId ? { ...n, isRead: true } : n);
    setNotifications(updatedNotifs);
    StorageService.saveNotifications(updatedNotifs);

    // Reward XP for accepting challenge
    const newXP = currentUser.xpPoints + 50;
    setCurrentUser((prev) => ({ ...prev, xpPoints: newXP }));
    StorageService.saveCurrentUser({ ...currentUser, xpPoints: newXP });

    // Publish acceptance tracking post on feed
    if (chal) {
      const acceptPost: Post = {
        id: generateUUID(),
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatarUrl,
        authorModality: chal.modality,
        authorBelt: currentUser.modalities[0]?.belt || 'Faixa Marrom',
        isAuthorVerified: currentUser.isVerified,
        mediaUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: `⚔️ DESAFIO DE TATAME ACEITO! @${chal.challengerUsername} vs @${chal.targetUsername} confirmaram o desafio: "${chal.title}". Foco no treino e respeito mútuo no tatame!`,
        hashtags: ['#DesafioAceito', '#Sparring', '#StravaFight', '#Guerra'],
        location: chal.location,
        taggedUsers: [
          { username: chal.challengerUsername, name: chal.challengerName },
          { username: chal.targetUsername, name: chal.targetName }
        ],
        challengeData: {
          challengeId: chal.id,
          challengerName: chal.challengerName,
          targetName: chal.targetName,
          category: chal.category,
          targetRounds: chal.targetRounds,
          status: 'ACCEPTED'
        },
        likesCount: 3,
        hasLiked: true,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        hasSaved: false,
        createdAt: new Date().toISOString(),
        comments: []
      };
      handlePublishPost(acceptPost);
    }

    setGamificationBanner('⚔️ Desafio Aceito! +50 XP de Tatame.');
    setTimeout(() => setGamificationBanner(null), 5000);
  };

  const handleDeclineChallenge = (challengeId: string) => {
    StorageService.updateChallengeStatus(challengeId, 'DECLINED');
    setChallenges(StorageService.getChallenges());

    const updatedNotifs = notifications.map((n) => n.challengeId === challengeId ? { ...n, isRead: true } : n);
    setNotifications(updatedNotifs);
    StorageService.saveNotifications(updatedNotifs);
  };

  const handleCompleteChallenge = (challengeId: string) => {
    StorageService.updateChallengeStatus(challengeId, 'COMPLETED');
    const updatedChallenges = StorageService.getChallenges();
    setChallenges(updatedChallenges);

    const chal = updatedChallenges.find((c) => c.id === challengeId);

    // Reward +200 XP and advance Streak
    const newXP = currentUser.xpPoints + 200;
    const newStreak = currentUser.streakDays + 1;
    const updatedUser = {
      ...currentUser,
      xpPoints: newXP,
      streakDays: newStreak
    };
    setCurrentUser(updatedUser);
    StorageService.saveCurrentUser(updatedUser);

    if (chal) {
      const completedPost: Post = {
        id: generateUUID(),
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatarUrl,
        authorModality: chal.modality,
        authorBelt: currentUser.modalities[0]?.belt || 'Faixa Marrom',
        isAuthorVerified: currentUser.isVerified,
        mediaUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop&q=80',
        mediaType: 'image',
        caption: `🏆 DESAFIO CONCLUÍDO NO TATAME! Finalizamos o ${chal.title} com sucesso! Muito aprendizado e respeito. Oss!`,
        hashtags: ['#DesafioConcluido', '#Guerreiros', '#StravaFight', '#TatameStreak'],
        location: chal.location,
        taggedUsers: [
          { username: chal.challengerUsername, name: chal.challengerName },
          { username: chal.targetUsername, name: chal.targetName }
        ],
        challengeData: {
          challengeId: chal.id,
          challengerName: chal.challengerName,
          targetName: chal.targetName,
          category: chal.category,
          targetRounds: chal.targetRounds,
          status: 'COMPLETED'
        },
        likesCount: 5,
        hasLiked: true,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        hasSaved: false,
        createdAt: new Date().toISOString(),
        comments: []
      };
      handlePublishPost(completedPost);
    }

    setGamificationBanner('🏆 Desafio Concluído! +200 XP e Tatame Streak ampliado! 🔥');
    setTimeout(() => setGamificationBanner(null), 5000);
  };

  // 5. SF Academy Handlers
  const handleSaveStudent = (std: Student) => {
    const idx = students.findIndex((s) => s.id === std.id);
    let updated: Student[];
    if (idx >= 0) {
      updated = [...students];
      updated[idx] = std;
    } else {
      updated = [std, ...students];
    }
    setStudents(updated);
    StorageService.saveStudents(updated);

    // If new student, auto-generate first fee
    if (idx < 0 && std.status === 'ATIVO') {
      const currentMY = getCurrentMonthYear();
      const [m, y] = currentMY.split('/');
      const dueDateStr = `${String(std.dueDay).padStart(2, '0')}/${m}/${y}`;
      const newFee: MonthlyFee = {
        id: generateUUID(),
        academyId: academyInfo.id,
        studentId: std.id,
        studentName: std.name,
        monthYear: currentMY,
        dueDate: dueDateStr,
        amount: std.monthlyFee,
        amountPaid: 0,
        status: 'PENDENTE'
      };
      const updatedFees = [...fees, newFee];
      setFees(updatedFees);
      StorageService.saveFees(updatedFees);
    }
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    StorageService.saveStudents(updated);
  };

  const handleSaveClass = (cls: ClassEntity) => {
    const idx = classes.findIndex((c) => c.id === cls.id);
    let updated: ClassEntity[];
    if (idx >= 0) {
      updated = [...classes];
      updated[idx] = cls;
    } else {
      updated = [...classes, cls];
    }
    setClasses(updated);
    StorageService.saveClasses(updated);
  };

  const handleDeleteClass = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    StorageService.saveClasses(updated);
  };

  const handleRecordAttendance = (
    classId: string,
    studentId: string,
    date: string,
    status: 'PRESENTE' | 'FALTA'
  ) => {
    const existingIdx = attendance.findIndex(
      (a) => a.classId === classId && a.studentId === studentId && a.date === date
    );
    let updated: AttendanceRecord[];
    if (existingIdx >= 0) {
      updated = [...attendance];
      updated[existingIdx] = { ...updated[existingIdx], status };
    } else {
      const newRecord: AttendanceRecord = {
        id: generateUUID(),
        academyId: academyInfo.id,
        classId,
        studentId,
        date,
        status
      };
      updated = [...attendance, newRecord];
    }
    setAttendance(updated);
    StorageService.saveAttendance(updated);
  };

  // Payment Confirmation -> Direct entry into Cash without duplicate!
  const handleRegisterPayment = (
    fee: MonthlyFee,
    amountPaid: number,
    method: 'PIX' | 'DINHEIRO' | 'CARTAO' | 'OUTRO',
    notes?: string
  ) => {
    const today = getTodayDateBR();

    // 1. Create Cash Entry
    const cashEntry: CashTransaction = {
      id: generateUUID(),
      academyId: academyInfo.id,
      type: 'ENTRADA',
      category: 'Mensalidades',
      description: `Mensalidade ${fee.monthYear} - ${fee.studentName}`,
      amount: amountPaid,
      date: today,
      paymentMethod: method,
      feeId: fee.id,
      createdAt: Date.now()
    };
    const updatedCash = [cashEntry, ...cash];
    setCash(updatedCash);
    StorageService.saveCash(updatedCash);

    // 2. Mark Fee as PAGO
    const updatedFee: MonthlyFee = {
      ...fee,
      amountPaid,
      status: 'PAGO',
      paymentMethod: method,
      paidDate: today,
      notes: notes || fee.notes
    };
    const updatedFees = fees.map((f) => (f.id === fee.id ? updatedFee : f));
    setFees(updatedFees);
    StorageService.saveFees(updatedFees);
  };

  const handleGenerateMonthFees = () => {
    const currentMY = getCurrentMonthYear();
    const [m, y] = currentMY.split('/');
    const activeStds = students.filter((s) => s.status === 'ATIVO');
    let count = 0;
    const newFees: MonthlyFee[] = [];

    for (const s of activeStds) {
      const exists = fees.some((f) => f.studentId === s.id && f.monthYear === currentMY);
      if (!exists) {
        const dueDateStr = `${String(s.dueDay).padStart(2, '0')}/${m}/${y}`;
        const nf: MonthlyFee = {
          id: generateUUID(),
          academyId: academyInfo.id,
          studentId: s.id,
          studentName: s.name,
          monthYear: currentMY,
          dueDate: dueDateStr,
          amount: s.monthlyFee,
          amountPaid: 0,
          status: 'PENDENTE'
        };
        newFees.push(nf);
        count++;
      }
    }

    if (count > 0) {
      const updated = [...fees, ...newFees];
      setFees(updated);
      StorageService.saveFees(updated);
      alert(`${count} mensalidades do mês ${currentMY} geradas com sucesso!`);
    } else {
      alert(`Todas as mensalidades do mês ${currentMY} já estavam geradas.`);
    }
  };

  const handleAddTransaction = (t: CashTransaction) => {
    const updated = [t, ...cash];
    setCash(updated);
    StorageService.saveCash(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = cash.filter((c) => c.id !== id);
    setCash(updated);
    StorageService.saveCash(updated);
  };

  const handleSaveTrial = (t: TrialStudent) => {
    const updated = [t, ...trials.filter((item) => item.id !== t.id)];
    setTrials(updated);
    StorageService.saveTrials(updated);
  };

  const handleConvertTrialToStudent = (t: TrialStudent) => {
    const newStudent: Student = {
      id: generateUUID(),
      academyId: academyInfo.id,
      name: t.name,
      phone: t.phone,
      birthDate: '',
      isMinor: false,
      modality: t.modality,
      graduation: 'Iniciante / Branca',
      monthlyFee: 140,
      dueDay: 10,
      notes: `Convertido de aula experimental realizada em ${t.scheduledDate}.`,
      status: 'ATIVO',
      createdAt: Date.now()
    };
    handleSaveStudent(newStudent);

    const updatedTrial: TrialStudent = { ...t, status: 'CONVERTIDA' };
    const updatedTrials = trials.map((item) => (item.id === t.id ? updatedTrial : item));
    setTrials(updatedTrials);
    StorageService.saveTrials(updatedTrials);
  };

  const handleDeleteTrial = (id: string) => {
    const updated = trials.filter((t) => t.id !== id);
    setTrials(updated);
    StorageService.saveTrials(updated);
  };

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotificationsCount = notifications.filter((n) => 
    n.id && 
    n.createdAt && 
    !n.isRead && 
    n.userId === currentUser.id
  ).length;

  // Special Routes (must render before state checks)
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallbackView />;
  }

  // Check if user wants to access auth routes
  const isAuthRoute = ['/inicio', '/login', '/cadastro'].includes(window.location.pathname);
  
  if (isAuthRoute) {
    return (
      <BrowserRouter>
        <React.Suspense fallback={<ViewLoadingFallback />}>
          <Routes>
            <Route path="/inicio" element={<InicioPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/cadastro" element={<CadastroPage onSignup={handleGoToSignup} />} />
            <Route path="*" element={<Navigate to="/inicio" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    );
  }

  // Render App State Flow
  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (appState === 'auth') {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onSignup={handleGoToSignup}
      />
    );
  }

  if (appState === 'signup') {
    return (
      <SignupFlow
        email={authEmail}
        password={authPassword}
        onComplete={handleSignupComplete}
        onBack={handleBackFromSignup}
      />
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-[#05070B] text-white flex flex-col font-sans selection:bg-[#F20D18] selection:text-white overflow-x-hidden w-full max-w-full dark:bg-[#05070B] dark:text-white light:bg-gray-50 light:text-gray-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenDirect={() => {
          setActiveConvId(undefined);
          setCurrentView('direct');
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAcademy={() => setCurrentView('academy')}
        onOpenCheckIn={() => setIsCheckInModalOpen(true)}
        onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
        onNavigate={(view) => setCurrentView(view)}
        currentView={currentView}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Gamification Floating Banner */}
      {gamificationBanner && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#F20D18] text-white px-5 py-2.5 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 border-2 border-white/20">
          <Flame className="w-4 h-4 fill-white animate-bounce" />
          <span>{gamificationBanner}</span>
        </div>
      )}

      {/* Main Body Layout (Desktop Sidebar + Center View) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex overflow-x-hidden">
        <Sidebar
          currentView={currentView}
          onChangeView={setCurrentView}
          currentUser={currentUser}
          unreadMessagesCount={unreadMessagesCount}
          onOpenCheckIn={() => setIsCheckInModalOpen(true)}
          onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
          onOpenSfActivity={() => setIsSfActivityModalOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-5 overflow-y-auto max-w-full overflow-x-hidden">
          <React.Suspense fallback={<ViewLoadingFallback />}>
            {currentView === 'feed' && (
            <FeedView
              currentUser={currentUser}
              stories={stories}
              posts={posts}
              events={events}
              onOpenStory={(idx) => setActiveStoryIdx(idx)}
              onOpenCheckIn={() => setIsCheckInModalOpen(true)}
              onOpenSfActivity={() => setIsSfActivityModalOpen(true)}
              onOpenComments={(post) => setActiveCommentsPost(post)}
              onOpenShare={(post) => setActiveSharePost(post)}
              onToggleLike={handleToggleLikePost}
              onToggleSave={handleToggleSavePost}
              onNavigateUser={(user) => {
                if (user === currentUser.username) setCurrentView('profile');
              }}
              onNavigateView={setCurrentView}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              posts={posts}
              reels={reels}
              onSelectPost={(post) => setActiveCommentsPost(post)}
              onSelectReel={() => setCurrentView('reels')}
            />
          )}

          {currentView === 'reels' && (
            <ReelsView
              reels={reels}
              currentUser={currentUser}
              onToggleLike={handleToggleLikeReel}
              onToggleSave={handleToggleSaveReel}
              onOpenComments={() => {
                if (posts[0]) setActiveCommentsPost(posts[0]);
              }}
              onOpenShare={() => {
                if (posts[0]) setActiveSharePost(posts[0]);
              }}
              onFollowAuthor={handleFollowAuthor}
              onNavigateUser={() => setCurrentView('profile')}
            />
          )}

          {currentView === 'direct' && (
            <DirectInboxView
              currentUser={currentUser}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              user={currentUser}
              currentUserId={currentUser.id}
              posts={posts}
              reels={reels}
              achievements={achievements}
              challenges={challenges}
              onOpenAcademy={() => setCurrentView('academy')}
              onUpdateProfile={(updated) => {
                setCurrentUser(updated);
                StorageService.saveCurrentUser(updated);
              }}
              onSelectPost={(post) => setActiveCommentsPost(post)}
              onSelectReel={() => setCurrentView('reels')}
              onOpenCreateChallenge={() => {
                setChallengeTargetUsername(undefined);
                setIsCreateChallengeOpen(true);
              }}
              onCompleteChallenge={handleCompleteChallenge}
            />
          )}

          {currentView === 'business' && (
            <BusinessView
              currentUser={currentUser}
              onNavigateView={setCurrentView}
            />
          )}

          {currentView === 'academy' && (
            <AcademyView
              academyInfo={academyInfo}
              students={students}
              classes={classes}
              attendance={attendance}
              fees={fees}
              cash={cash}
              trials={trials}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onSaveClass={handleSaveClass}
              onDeleteClass={handleDeleteClass}
              onRecordAttendance={handleRecordAttendance}
              onRegisterPayment={handleRegisterPayment}
              onGenerateMonthFees={handleGenerateMonthFees}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onSaveTrial={handleSaveTrial}
              onConvertTrialToStudent={handleConvertTrialToStudent}
              onDeleteTrial={handleDeleteTrial}
              onReloadAllData={handleReloadAll}
            />
          )}

          {currentView === 'friends' && (
            <FriendsView
              currentUser={currentUser}
              friendRequests={friendRequests}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onOpenDirectChat={(username) => {
                const conv = conversations.find((c) => c.otherUser.username === username);
                if (conv) setActiveConvId(conv.id);
                setCurrentView('direct');
              }}
              onNavigateUser={() => setCurrentView('profile')}
              onChallengeFriend={(username) => {
                setChallengeTargetUsername(username);
                setIsCreateChallengeOpen(true);
              }}
            />
          )}

          {currentView === 'events' && (
            <EventsView
              events={events}
              onRegisterEvent={(id) => {
                setEvents((prev) =>
                  prev.map((e) => (e.id === id ? { ...e, registeredCount: e.registeredCount + 1 } : e))
                );
              }}
            />
          )}

          {currentView === 'institutional' && (
            <InstitutionalView
              onGoToSocial={() => setCurrentView('feed')}
              onGoToAcademy={() => setCurrentView('academy')}
            />
          )}

          {currentView === 'admin' && (
            <AdminPanel />
          )}
          </React.Suspense>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Matching img1) */}
      <BottomNav
        currentView={currentView}
        onChangeView={setCurrentView}
        currentUser={currentUser}
        onOpenCreateMenu={() => setIsMobileCreateMenuOpen(true)}
      />

      {/* Mobile Create Action Drawer */}
      {isMobileCreateMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-sm bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#171C25]">
              <h3 className="text-sm font-black text-white">Criar na STRAVA FIGHT</h3>
              <button onClick={() => setIsMobileCreateMenuOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setIsMobileCreateMenuOpen(false);
                setIsSfActivityModalOpen(true);
              }}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#F20D18]/30 border border-white/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>SF Activity • Filtro Oficial de Treino</span>
            </button>

            <button
              onClick={() => {
                setIsMobileCreateMenuOpen(false);
                setIsCheckInModalOpen(true);
              }}
              className="w-full min-h-[44px] px-4 rounded-2xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs flex items-center justify-center gap-2 hover:border-[#F20D18]"
            >
              <Flame className="w-4 h-4 text-[#F20D18]" />
              <span>Check-in de Treino Diário (+150 XP)</span>
            </button>

            <button
              onClick={() => {
                setIsMobileCreateMenuOpen(false);
                setChallengeTargetUsername(undefined);
                setIsCreateChallengeOpen(true);
              }}
              className="w-full min-h-[44px] px-4 rounded-2xl bg-[#171C25] border border-[#F20D18]/40 text-white font-bold text-xs flex items-center justify-center gap-2 hover:border-[#F20D18]"
            >
              <Swords className="w-4 h-4 text-[#F20D18]" />
              <span>Lançar Desafio de Sparring / Treino</span>
            </button>

            <button
              onClick={() => {
                setIsMobileCreateMenuOpen(false);
                setIsCreatePostModalOpen(true);
              }}
              className="w-full min-h-[44px] px-4 rounded-2xl bg-[#05070B] border border-[#171C25] text-white font-bold text-xs flex items-center justify-center gap-2 hover:border-[#F20D18]"
            >
              <PlusSquare className="w-4 h-4 text-[#F20D18]" />
              <span>Publicação com Foto ou Vídeo</span>
            </button>
          </div>
        </div>
      )}

      <React.Suspense fallback={null}>
        {/* SF Activity Modal (Official Photo Filter) */}
        {isSfActivityModalOpen && (
        <SfActivityModal
          isOpen={isSfActivityModalOpen}
          currentUser={currentUser}
          onClose={() => setIsSfActivityModalOpen(false)}
          onPublishActivity={handlePublishSfActivity}
        />
      )}

      {/* Story Viewer Modal */}
      {activeStoryIdx !== null && (
        <StoryViewerModal
          stories={stories}
          initialStoryIndex={activeStoryIdx}
          onClose={() => setActiveStoryIdx(null)}
          onReply={handleReplyStory}
        />
      )}

      {/* Check-In Modal (Gamification) */}
      {isCheckInModalOpen && (
        <CheckInModal
          currentUser={currentUser}
          onClose={() => setIsCheckInModalOpen(false)}
          onCompleteCheckIn={handleCompleteCheckIn}
        />
      )}

      {/* Create Post Modal */}
      {isCreatePostModalOpen && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setIsCreatePostModalOpen(false)}
          onPublishPost={handlePublishPost}
        />
      )}

      {/* Create Challenge Modal (SF Challenge) */}
      {isCreateChallengeOpen && (
        <CreateChallengeModal
          currentUser={currentUser}
          friendsList={[
            { id: 'f1', name: 'Mestre Uarlei Silva', username: 'mestre.uarlei', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', modality: 'Jiu-Jitsu & MMA', belt: 'Faixa Preta 3º Dan' },
            { id: 'f2', name: 'Amanda Souza', username: 'amanda_bjj', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', modality: 'Jiu-Jitsu', belt: 'Faixa Roxa' },
            { id: 'f3', name: 'Carlos Gracie Silva', username: 'carlos_mma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', modality: 'MMA', belt: 'Faixa Preta' },
            { id: 'f4', name: 'Beatriz Lima', username: 'beatriz_thai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', modality: 'Muay Thai', belt: 'Kruang Vermelho' }
          ]}
          preselectedFriendUsername={challengeTargetUsername}
          onClose={() => setIsCreateChallengeOpen(false)}
          onCreateChallenge={handleCreateChallenge}
        />
      )}

      {/* Comments Sheet Modal */}
      {activeCommentsPost && (
        <CommentsModal
          post={activeCommentsPost}
          currentUser={currentUser}
          onClose={() => setActiveCommentsPost(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* Share Modal */}
      {activeSharePost && (
        <ShareModal
          post={activeSharePost}
          conversations={conversations}
          onClose={() => setActiveSharePost(null)}
          onSendToConversation={handleSendPostToConversation}
        />
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <NotificationsModal
          currentUserId={currentUser.id}
          onClose={() => setIsNotificationsOpen(false)}
          onSelectNotification={(n) => {
            setIsNotificationsOpen(false);
            if (n.type === 'FRIEND_REQUEST') setCurrentView('friends');
            else if (n.type === 'LIKE' || n.type === 'COMMENT') setCurrentView('feed');
            else if (n.type === 'CHALLENGE_INVITE' || n.type === 'CHALLENGE_ACCEPTED') setCurrentView('profile');
          }}
          onAcceptChallenge={handleAcceptChallenge}
          onDeclineChallenge={handleDeclineChallenge}
        />
      )}
      </React.Suspense>
    </div>

  );
}
