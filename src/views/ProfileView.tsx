import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Clapperboard, 
  Bookmark, 
  Trophy, 
  ShieldCheck, 
  Edit3, 
  Share2, 
  Flame, 
  Award, 
  MapPin, 
  Check, 
  X,
  Plus,
  Swords,
  CheckCircle2,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { UserProfile, Post, Reel, AchievementBadge, CombatChallenge } from '../types';
import { FollowersService, NotificationsService } from '../services/supabase';
import { EditProfileModal } from '../components/EditProfileModal';

interface ProfileViewProps {
  user: UserProfile;
  currentUserId?: string; // Added to know if viewing own profile
  posts: Post[];
  reels: Reel[];
  achievements: AchievementBadge[];
  challenges?: CombatChallenge[];
  onOpenAcademy: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onSelectPost: (post: Post) => void;
  onSelectReel: (reel: Reel) => void;
  onOpenCreateChallenge?: () => void;
  onCompleteChallenge?: (id: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  currentUserId,
  posts,
  reels,
  achievements,
  challenges = [],
  onOpenAcademy,
  onUpdateProfile,
  onSelectPost,
  onSelectReel,
  onOpenCreateChallenge,
  onCompleteChallenge
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'challenges' | 'saved' | 'achievements'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Edit form state
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location || '');
  const [primaryBelt, setPrimaryBelt] = useState(user.modalities[0]?.belt || 'Faixa Marrom');
  const [primaryModality, setPrimaryModality] = useState(user.modalities[0]?.modality || 'Jiu-Jitsu');

  const isOwnProfile = currentUserId === user.id;

  // Check if following this user
  useEffect(() => {
    if (!currentUserId || isOwnProfile) return;
    
    const checkFollowStatus = async () => {
      try {
        const following = await FollowersService.isFollowing(currentUserId, user.id);
        setIsFollowing(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [currentUserId, user.id, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!currentUserId || isOwnProfile || isFollowLoading) return;

    setIsFollowLoading(true);
    const previousState = isFollowing;

    try {
      // Optimistic update
      setIsFollowing(!isFollowing);

      if (isFollowing) {
        await FollowersService.unfollowUser(currentUserId, user.id);
      } else {
        await FollowersService.followUser(currentUserId, user.id);
        // Notify the user they got a new follower
        await NotificationsService.notifyFollow(user.id, currentUserId);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Rollback on error
      setIsFollowing(previousState);
      alert('Erro ao atualizar seguidor. Tente novamente.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const userPosts = posts.filter((p) => p.authorId === user.id || p.authorUsername === user.username);
  const savedPosts = posts.filter((p) => p.hasSaved);

  const highlights = [
    { label: 'Campeonatos', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80' },
    { label: 'Graduação', img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=200&auto=format&fit=crop&q=80' },
    { label: 'Sparring', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&auto=format&fit=crop&q=80' },
    { label: 'Tatame', img: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=200&auto=format&fit=crop&q=80' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      fullName: fullName.trim() || user.fullName,
      bio: bio.trim(),
      location: location.trim(),
      modalities: [
        { modality: primaryModality, belt: primaryBelt },
        ...user.modalities.slice(1)
      ]
    };
    onUpdateProfile(updated);
    setIsEditModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-20 md:pb-12 select-none">
      {/* Profile Header (Matching img5) */}
      <div className="p-4 sm:p-6 bg-[#071321]/60 border border-[#171C25] rounded-3xl shadow-sm">
        <div className="flex items-start justify-between gap-4">
          {/* Avatar with Tatame ring */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-[#F20D18] to-[#FF4A0F]">
              <img 
                src={user.avatarUrl} 
                alt={user.fullName} 
                className="w-full h-full rounded-full object-cover border-2 border-[#05070B]" 
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#F20D18] text-white p-1 rounded-full shadow-md" title="Streak ativo">
              <Flame className="w-3.5 h-3.5 fill-white" />
            </div>
          </div>

          {/* Stats Grid (Matching img5: posts, followers, following) */}
          <div className="flex-1 flex justify-around items-center pt-2 text-center">
            <div>
              <p className="text-base sm:text-lg font-black text-white">{userPosts.length}</p>
              <p className="text-[10px] sm:text-xs text-[#94A3B8]">posts</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-white">{user.followersCount}</p>
              <p className="text-[10px] sm:text-xs text-[#94A3B8]">seguidores</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-white">{user.followingCount}</p>
              <p className="text-[10px] sm:text-xs text-[#94A3B8]">seguindo</p>
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-[#F20D18] flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-[#F20D18]" />
                <span>{user.streakDays}d</span>
              </p>
              <p className="text-[10px] sm:text-xs text-[#94A3B8]">streak</p>
            </div>
          </div>
        </div>

        {/* Bio & Martial Arts Details */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm sm:text-base font-black text-white">{user.fullName}</h2>
            {user.isVerified && (
              <span className="w-4 h-4 rounded-full bg-[#F20D18] text-white flex items-center justify-center text-[9px] font-black">✓</span>
            )}
            <span className="text-xs text-[#94A3B8] font-medium">@{user.username}</span>
          </div>

          {/* Belts & Modalities */}
          <div className="flex flex-wrap gap-1.5 py-1">
            {user.modalities.map((m, idx) => (
              <span 
                key={idx}
                className="text-[10px] font-bold text-[#F20D18] bg-[#F20D18]/10 border border-[#F20D18]/30 px-2 py-0.5 rounded-full"
              >
                {m.modality}: {m.belt}
              </span>
            ))}
          </div>

          {/* Bio text */}
          <p className="text-xs text-[#E2E8F0] leading-relaxed whitespace-pre-line pt-1">
            {user.bio}
          </p>

          {/* Location & Academy */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#94A3B8] pt-1">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F20D18]" />
                {user.location}
              </span>
            )}
            {user.affiliatedAcademyName && (
              <span className="flex items-center gap-1 text-[#CBD5E1]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F20D18]" />
                {user.affiliatedAcademyName}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons (Matching img5: Editar perfil, Compartilhar, Gerenciar Academia, Desafio) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#171C25]">
          {isOwnProfile ? (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="min-h-[38px] px-3 rounded-xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:border-[#F20D18] active:scale-95 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#F20D18]" />
                <span>Editar perfil</span>
              </button>

              {onOpenCreateChallenge && (
                <button
                  onClick={onOpenCreateChallenge}
                  className="min-h-[38px] px-3 rounded-xl bg-[#171C25] border border-[#F20D18]/40 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:border-[#F20D18] active:scale-95 transition-all"
                >
                  <Swords className="w-3.5 h-3.5 text-[#F20D18]" />
                  <span>Desafio Sparring</span>
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://stravafight.com/${user.username}`);
                  alert('Link do seu perfil copiado!');
                }}
                className="min-h-[38px] px-3 rounded-xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:border-[#F20D18] active:scale-95 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Compartilhar</span>
              </button>

              <button
                onClick={onOpenAcademy}
                className="col-span-2 sm:col-span-1 min-h-[38px] px-3 rounded-xl bg-[#F20D18] text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-[#d90812] active:scale-95 transition-all shadow-md shadow-[#F20D18]/25"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>SF Academy</span>
              </button>
            </>
          ) : (
            <>
              {/* Follow/Unfollow Button for other profiles */}
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`col-span-2 min-h-[38px] px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                  isFollowing
                    ? 'bg-[#0D121C] border border-[#171C25] text-white hover:border-[#F20D18]'
                    : 'bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white shadow-md shadow-[#F20D18]/25 hover:opacity-95'
                } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Seguindo</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Seguir</span>
                  </>
                )}
              </button>

              {onOpenCreateChallenge && (
                <button
                  onClick={onOpenCreateChallenge}
                  className="min-h-[38px] px-3 rounded-xl bg-[#171C25] border border-[#F20D18]/40 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:border-[#F20D18] active:scale-95 transition-all"
                >
                  <Swords className="w-3.5 h-3.5 text-[#F20D18]" />
                  <span>Desafiar</span>
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://stravafight.com/${user.username}`);
                  alert('Link do perfil copiado!');
                }}
                className="min-h-[38px] px-3 rounded-xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:border-[#F20D18] active:scale-95 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Compartilhar</span>
              </button>
            </>
          )}
        </div>

        {/* Story Highlights (Matching img5) */}
        <div className="mt-5 pt-3 border-t border-[#171C25]">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
            {highlights.map((h, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                <div className="w-14 h-14 rounded-full p-0.5 border-2 border-[#171C25] group-hover:border-[#F20D18] transition-colors">
                  <img src={h.img} alt={h.label} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-[10px] text-[#CBD5E1] font-medium">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segmented Profile Tabs (Matching img5: Grid, Reels, Desafios, Saved, Gamification) */}
      <div className="flex border-b border-[#171C25] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'posts' ? 'border-[#F20D18] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline">Publicações</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'reels' ? 'border-[#F20D18] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          <span className="hidden sm:inline">SF Reels</span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'challenges' ? 'border-[#F20D18] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4 text-[#F20D18]" />
          <span>Desafios ({challenges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'saved' ? 'border-[#F20D18] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="hidden sm:inline">Salvos</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'achievements' ? 'border-[#F20D18] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#F59E0B]" />
          <span className="hidden sm:inline">Conquistas</span>
        </button>
      </div>

      {/* Tab 1: Posts Grid (Matching img5) */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {userPosts.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-[#94A3B8] bg-[#071321]/40 rounded-3xl border border-[#171C25]">
              <p className="text-xs font-bold text-white mb-1">Nenhuma publicação ainda</p>
              <p className="text-[11px]">Compartilhe seus treinos e evolução no tatame.</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="aspect-square bg-black rounded-xl overflow-hidden cursor-pointer relative group"
              >
                <img 
                  src={post.mediaUrl} 
                  alt={post.caption} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: SF Reels Grid */}
      {activeTab === 'reels' && (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {reels.map((reel) => (
            <div 
              key={reel.id}
              onClick={() => onSelectReel(reel)}
              className="aspect-[9/16] bg-black rounded-xl overflow-hidden cursor-pointer relative group"
            >
              <img 
                src={reel.videoUrl} 
                alt={reel.caption} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white font-bold drop-shadow">
                <Clapperboard className="w-3 h-3 text-[#F20D18]" />
                <span>{reel.likesCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Desafios de Tatame (SF Challenges) */}
      {activeTab === 'challenges' && (
        <div className="space-y-3">
          {challenges.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8] bg-[#071321]/40 rounded-3xl border border-[#171C25] p-6">
              <Swords className="w-10 h-10 text-[#F20D18] mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-white mb-1">Nenhum desafio ativo</p>
              <p className="text-[11px] max-w-xs mx-auto mb-4">
                Desafie seus amigos de tatame para um sparring amigável ou uma meta de rounds!
              </p>
              {onOpenCreateChallenge && (
                <button
                  onClick={onOpenCreateChallenge}
                  className="min-h-[40px] px-4 rounded-xl bg-[#F20D18] text-white font-black text-xs inline-flex items-center gap-2 hover:bg-[#d90812]"
                >
                  <Swords className="w-4 h-4" />
                  <span>Lançar Primeiro Desafio</span>
                </button>
              )}
            </div>
          ) : (
            challenges.map((chal) => {
              const isAccepted = chal.status === 'ACCEPTED';
              const isPending = chal.status === 'PENDING';
              const isCompleted = chal.status === 'COMPLETED';

              return (
                <div
                  key={chal.id}
                  className={`p-4 rounded-3xl border transition-all ${
                    isAccepted
                      ? 'bg-[#071321] border-[#F20D18]/50 shadow-md shadow-[#F20D18]/10'
                      : isCompleted
                      ? 'bg-[#071321]/60 border-[#10B981]/40'
                      : 'bg-[#071321]/40 border-[#171C25]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#F20D18] bg-[#F20D18]/15 px-2 py-0.5 rounded border border-[#F20D18]/30">
                      {chal.category === 'SPARRING' ? '🥊 SPARRING TÉCNICO' : '🥋 DESAFIO DE TATAME'}
                    </span>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isAccepted
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                        : isCompleted
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/40'
                        : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                    }`}>
                      {isAccepted ? '⚔️ EM ANDAMENTO' : isCompleted ? '✓ CONCLUÍDO' : '⏳ AGUARDANDO ACEITE'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white leading-tight mb-2">
                    {chal.title}
                  </h4>

                  {/* Combatants VS Bar */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#05070B] border border-[#171C25] mb-3">
                    <div className="flex items-center gap-2">
                      <img src={chal.challengerAvatar} alt={chal.challengerName} className="w-9 h-9 rounded-full object-cover border border-[#F20D18]" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[140px]">{chal.challengerName}</p>
                        <p className="text-[10px] text-[#F20D18]">{chal.challengerBelt}</p>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-[#171C25] text-white font-black text-[10px] border border-white/10">
                      VS
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div className="text-right">
                        <p className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[140px]">{chal.targetName}</p>
                        <p className="text-[10px] text-[#F20D18]">{chal.targetBelt}</p>
                      </div>
                      <img src={chal.targetAvatar} alt={chal.targetName} className="w-9 h-9 rounded-full object-cover border border-[#F20D18]" />
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#94A3B8] mb-3">
                    {chal.targetRounds && <span>Meta: <strong className="text-white">{chal.targetRounds} Rounds</strong></span>}
                    {chal.proposedDate && <span>Data: <strong className="text-white">{chal.proposedDate}</strong></span>}
                    {chal.location && <span>Local: <strong className="text-white">{chal.location}</strong></span>}
                  </div>

                  {chal.notes && (
                    <p className="text-xs text-[#CBD5E1] bg-[#05070B]/60 p-2.5 rounded-xl border border-white/5 mb-3 italic">
                      "{chal.notes}"
                    </p>
                  )}

                  {/* Complete Challenge button */}
                  {isAccepted && onCompleteChallenge && (
                    <button
                      onClick={() => onCompleteChallenge(chal.id)}
                      className="w-full min-h-[38px] rounded-xl bg-gradient-to-r from-[#10B981] to-[#0ea372] text-black font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-[#10B981]/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir Desafio de Treino (+200 XP de Tatame)</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Salvos */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {savedPosts.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-[#94A3B8] bg-[#071321]/40 rounded-3xl border border-[#171C25]">
              <Bookmark className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-xs font-bold text-white mb-1">Nenhum item salvo</p>
              <p className="text-[11px]">Salve publicações técnicas e treinos para consultar depois.</p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="aspect-square bg-black rounded-xl overflow-hidden cursor-pointer relative group"
              >
                <img 
                  src={post.mediaUrl} 
                  alt={post.caption} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Conquistas & Gamificação (Tatame Streak & SF Belt Rank) */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {/* XP & Level Status */}
          <div className="p-4 rounded-3xl bg-[#071321]/80 border border-[#F20D18]/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-black uppercase text-[#F20D18] tracking-wider">
                  Graduação Social STRAVA FIGHT
                </span>
                <h3 className="text-lg font-black text-white">{user.beltRankSocial}</h3>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[#F59E0B]">{user.xpPoints}</span>
                <span className="text-xs text-[#94A3B8] font-bold ml-1">XP Total</span>
              </div>
            </div>

            {/* Progress bar to next belt level */}
            <div className="w-full h-2.5 bg-[#05070B] rounded-full overflow-hidden border border-[#171C25] mt-2">
              <div className="h-full bg-gradient-to-r from-[#F20D18] to-[#F59E0B] w-[75%]" />
            </div>
            <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1 font-semibold">
              <span>Faixa Marrom SF (3.000 XP)</span>
              <span>Próximo nível: Faixa Preta SF (4.500 XP)</span>
            </div>
          </div>

          {/* Badges List */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-white tracking-wider px-1">
              Medalhas de Tatame ({achievements.filter((a) => a.isUnlocked).length}/{achievements.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {achievements.map((badge) => (
                <div 
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    badge.isUnlocked
                      ? 'bg-[#071321]/60 border-[#F20D18]/40 shadow-sm'
                      : 'bg-[#05070B]/50 border-[#171C25] opacity-50'
                  }`}
                >
                  <div className="text-2xl p-2 rounded-xl bg-[#0D121C] border border-[#171C25] shrink-0">
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white truncate">{badge.name}</h5>
                      <span className="text-[10px] font-black text-[#F59E0B]">+{badge.xpValue} XP</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                      {badge.description}
                    </p>
                    {badge.isUnlocked && badge.unlockedAt && (
                      <p className="text-[9px] text-[#10B981] font-bold mt-1">
                        Desbloqueado em {badge.unlockedAt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updates) => {
          const updated: UserProfile = {
            ...user,
            ...updates
          };
          onUpdateProfile(updated);
        }}
      />
    </div>
  );
};
