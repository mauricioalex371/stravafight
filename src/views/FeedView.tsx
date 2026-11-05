import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Share2, 
  MoreHorizontal, 
  Flame, 
  Shield, 
  Trophy, 
  Plus,
  Sparkles,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Post, Story, UserProfile, CombatEvent, AdCampaign } from '../types';
import { timeAgo } from '../utils/formatters';
import { SponsoredPostCard } from '../components/SponsoredPostCard';
import { BusinessService } from '../services/businessService';
import { ModerationService } from '../services/moderationService';
import { ReportModal } from '../components/ReportModal';
import { RateLimiter } from '../utils/rateLimiter';
import { Briefcase, EyeOff, UserX, Flag } from 'lucide-react';


interface FeedViewProps {
  currentUser: UserProfile;
  stories: Story[];
  posts: Post[];
  events: CombatEvent[];
  onOpenStory: (index: number) => void;
  onOpenCheckIn: () => void;
  onOpenSfActivity?: () => void;
  onOpenComments: (post: Post) => void;
  onOpenShare: (post: Post) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onNavigateUser: (username: string) => void;
  onNavigateView: (view: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  currentUser,
  stories,
  posts,
  events,
  onOpenStory,
  onOpenCheckIn,
  onOpenSfActivity,
  onOpenComments,
  onOpenShare,
  onToggleLike,
  onToggleSave,
  onNavigateUser,
  onNavigateView
}) => {
  const [filterModality, setFilterModality] = useState<string>('TODAS');

  const modalities = ['TODAS', 'Jiu-Jitsu', 'Muay Thai', 'MMA', 'Boxe', 'Judô', 'Wrestling'];

  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => ModerationService.getBlockedUsers(currentUser.id));
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => ModerationService.getHiddenContentIds(currentUser.id));

  // Memoize active feed campaigns to eliminate redundant parsing inside map loop
  const activeAds = useMemo(() => BusinessService.getActiveCampaignsForPlacement('FEED'), []);
  
  // Track impressions for ads already shown
  const impressionsRecorded = useRef<Set<string>>(new Set());

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (blockedUsers.includes(p.authorUsername)) return false;
      if (hiddenIds.includes(p.id)) return false;
      if (filterModality === 'TODAS') return true;
      return p.authorModality.toLowerCase().includes(filterModality.toLowerCase());
    });
  }, [posts, filterModality, blockedUsers, hiddenIds]);

  const handleHidePost = (postId: string) => {
    ModerationService.hideContentForUser(currentUser.id, postId);
    setHiddenIds((prev) => [...prev, postId]);
    setOpenPostMenuId(null);
  };

  const handleBlockUser = (username: string) => {
    ModerationService.blockUser(currentUser.id, username);
    setBlockedUsers((prev) => [...prev, username]);
    setOpenPostMenuId(null);
  };


  return (
    <div className="max-w-6xl mx-auto flex gap-6 pb-20 md:pb-12 overflow-x-hidden w-full">
      {/* Central Social Feed */}
      <div className="flex-1 max-w-xl mx-auto space-y-4 w-full overflow-x-hidden">
        {/* 1. Stories Carousel (Matching img1) */}
        <div className="p-3 bg-[#071321]/50 border-b border-[#171C25] overflow-hidden">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 px-1">
            {stories.map((story, idx) => (
              <div 
                key={story.id}
                onClick={() => onOpenStory(idx)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div className={`relative p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                  story.hasUnread 
                    ? 'story-ring-gradient shadow-glow-subtle' 
                    : idx === 0 
                    ? 'border-2 border-dashed border-[#F20D18]' 
                    : 'border-2 border-[#171C25]'
                }`}>
                  <div className="p-0.5 bg-[#05070B] rounded-full">
                    <img 
                      src={story.userAvatar} 
                      alt={story.username} 
                      loading={idx < 6 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-16 h-16 rounded-full object-cover" 
                    />
                  </div>

                  {idx === 0 && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#F20D18] text-white flex items-center justify-center text-[10px] font-black border border-[#05070B]">
                      +
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-[#CBD5E1] truncate max-w-[68px] text-center font-medium">
                  {story.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-3 -mx-3">
          {modalities.map((m) => {
            const isSelected = filterModality === m;
            return (
              <button
                key={m}
                onClick={() => setFilterModality(m)}
                className={`min-h-[34px] px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#F20D18] text-white shadow-md shadow-[#F20D18]/25'
                    : 'bg-[#0D121C] border border-[#171C25] text-[#94A3B8] hover:text-white'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* 4. Posts Feed */}
        <div className="space-y-4">
          {filteredPosts.map((post, postIdx) => {
            const shouldShowFirstAd = postIdx === 1 && activeAds[0];
            const shouldShowSecondAd = postIdx === 3 && activeAds[1];

            return (
              <React.Fragment key={post.id}>
                <article 
                  className="bg-[#05070B] border-b border-[#1F2937]"
                >
              {/* Post Header */}
              <div className="p-3.5 flex items-center justify-between">
                <div 
                  onClick={() => onNavigateUser(post.authorUsername)}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <img 
                    src={post.authorAvatar} 
                    alt={post.authorName} 
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 rounded-full object-cover border border-[#F20D18]" 
                  />
                  <div>
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="font-bold text-white text-xs">{post.authorUsername}</span>
                      {post.isAuthorVerified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#F20D18] text-white flex items-center justify-center text-[8px] font-black">✓</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#F20D18] font-semibold">
                      {post.authorBelt} • {post.authorModality}
                    </p>
                    {post.location && (
                      <p className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-[#94A3B8]" />
                        <span>{post.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setOpenPostMenuId(openPostMenuId === post.id ? null : post.id)}
                    className="text-[#94A3B8] hover:text-white p-1.5 rounded-full hover:bg-white/10"
                    title="Mais opções"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {openPostMenuId === post.id && (
                    <div className="absolute right-0 top-8 z-30 w-48 bg-[#0D121C] border border-[#171C25] rounded-2xl p-1.5 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => handleHidePost(post.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#CBD5E1] hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>Ocultar publicação</span>
                      </button>

                      {post.authorUsername !== currentUser.username && (
                        <button
                          onClick={() => handleBlockUser(post.authorUsername)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#CBD5E1] hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5 text-amber-500" />
                          <span>Bloquear @{post.authorUsername}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setReportingPost(post);
                          setOpenPostMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#F20D18] hover:bg-[#F20D18]/10 rounded-xl transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5 text-[#F20D18]" />
                        <span>Denunciar publicação</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>


              {/* Post Media (Photo / Video) */}
              <div 
                onDoubleClick={() => onToggleLike(post.id)}
                className="relative bg-black w-full aspect-square flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <img 
                  src={post.mediaUrl} 
                  alt={post.caption}
                  loading={postIdx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={postIdx === 0 ? 'high' : 'auto'}
                  className="w-full h-full object-cover" 
                />


                {/* Official SF Activity Filter Badge */}
                {post.activityData && (
                  <>
                    <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-3 py-1 rounded-xl border border-white/25 text-white flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-[#F20D18]" />
                      <span>SF ACTIVITY • {post.activityData.modality}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white flex items-center gap-2 text-[11px] font-bold shadow-lg">
                      <Flame className="w-3.5 h-3.5 text-[#F20D18] fill-[#F20D18]" />
                      <span>{post.activityData.durationFormatted}</span>
                      {post.activityData.calories && (
                        <>
                          <span className="text-[#64748B]">•</span>
                          <span className="text-[#FF4A0F] font-black">{post.activityData.calories} kcal</span>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Training Metric Overlay Badge */}
                {post.trainingData && !post.activityData && (
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-2 text-[11px] font-bold">
                    <Flame className="w-3.5 h-3.5 text-[#F20D18] fill-[#F20D18]" />
                    <span>{post.trainingData.rounds} Rounds</span>
                    <span className="text-[#64748B]">•</span>
                    <span>{post.trainingData.durationMinutes} min</span>
                    <span className="text-[#64748B]">•</span>
                    <span className="text-[#F20D18] font-black">{post.trainingData.intensity}</span>
                  </div>
                )}
              </div>

              {/* Action Bar (Heart, Comment, Share, Save) */}
              <div className="p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-4 text-white">
                    <button 
                      onClick={() => onToggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-125 ${
                        post.hasLiked ? 'text-[#F20D18]' : 'text-white hover:text-[#F20D18]'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-[#F20D18]' : ''}`} />
                      <span>{post.likesCount}</span>
                    </button>

                    <button 
                      onClick={() => onOpenComments(post)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#F20D18]"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.commentsCount}</span>
                    </button>

                    <button 
                      onClick={() => onOpenShare(post)}
                      className="text-white hover:text-[#F20D18]"
                      title="Compartilhar no Direct"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  <button 
                    onClick={() => onToggleSave(post.id)}
                    className={`transition-colors ${
                      post.hasSaved ? 'text-[#F20D18]' : 'text-white hover:text-[#F20D18]'
                    }`}
                    title={post.hasSaved ? 'Salvo' : 'Salvar publicação'}
                  >
                    <Bookmark className={`w-5 h-5 ${post.hasSaved ? 'fill-[#F20D18]' : ''}`} />
                  </button>
                </div>

                {/* Challenge Banner if post is related to a challenge */}
                {post.challengeData && (
                  <div className="mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-[#F20D18]/20 via-[#071321] to-[#F20D18]/20 border border-[#F20D18]/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚔️</span>
                      <div>
                        <p className="font-black text-white leading-tight">
                          DESAFIO: {post.challengeData.challengerName} VS {post.challengeData.targetName}
                        </p>
                        <p className="text-[10px] text-[#F20D18] font-bold">
                          {post.challengeData.category} • {post.challengeData.targetRounds ? `${post.challengeData.targetRounds} Rounds` : 'Treino de Tatame'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-[#F20D18] text-white px-2 py-0.5 rounded-full">
                      {post.challengeData.status === 'ACCEPTED' ? 'ACEITO' : 'EM DISPUTA'}
                    </span>
                  </div>
                )}

                {/* Caption & Hashtags */}
                <div className="space-y-1 text-xs">
                  <p className="text-white leading-relaxed">
                    <span className="font-bold mr-1.5">{post.authorUsername}</span>
                    <span className="text-[#E2E8F0]">{post.caption}</span>
                  </p>

                  {/* Tagged People in the post */}
                  {post.taggedUsers && post.taggedUsers.length > 0 && (
                    <p className="text-[11px] text-[#94A3B8] font-medium pt-0.5">
                      com{' '}
                      {post.taggedUsers.map((u, i) => (
                        <span 
                          key={u.username}
                          onClick={() => onNavigateUser(u.username)}
                          className="font-bold text-[#CBD5E1] hover:text-[#F20D18] cursor-pointer"
                        >
                          @{u.username}{i < post.taggedUsers!.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                  )}
                  
                  {post.hashtags.length > 0 && (
                    <p className="text-[11px] text-[#F20D18] font-semibold space-x-1.5 pt-0.5">
                      {post.hashtags.map((tag, idx) => (
                        <span key={idx} className="cursor-pointer hover:underline">{tag}</span>
                      ))}
                    </p>
                  )}
                </div>

                {/* View Comments link */}
                {post.comments.length > 0 && (
                  <button 
                    onClick={() => onOpenComments(post)}
                    className="text-[11px] text-[#94A3B8] font-medium hover:text-white mt-1.5 block"
                  >
                    Ver todos os {post.comments.length} comentários
                  </button>
                )}

                {/* Timestamp */}
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider mt-1.5">
                  {timeAgo(post.createdAt)}
                </p>
              </div>
            </article>

            {shouldShowFirstAd && (() => {
              const adId = activeAds[0].id;
              if (!impressionsRecorded.current.has(adId)) {
                BusinessService.recordAdImpression(adId, currentUser.id, 'FEED');
                impressionsRecorded.current.add(adId);
              }
              return (
                <SponsoredPostCard 
                  campaign={activeAds[0]} 
                  currentUser={currentUser} 
                  onNavigateBusiness={() => onNavigateView('business')} 
                />
              );
            })()}
            {shouldShowSecondAd && (() => {
              const adId = activeAds[1].id;
              if (!impressionsRecorded.current.has(adId)) {
                BusinessService.recordAdImpression(adId, currentUser.id, 'FEED');
                impressionsRecorded.current.add(adId);
              }
              return (
                <SponsoredPostCard 
                  campaign={activeAds[1]} 
                  currentUser={currentUser} 
                  onNavigateBusiness={() => onNavigateView('business')} 
                />
              );
            })()}
          </React.Fragment>
        );
      })}
    </div>
  </div>

      {/* Right Column (Desktop Auxiliary) */}
      <div className="hidden lg:block w-72 shrink-0 space-y-4">
        {/* User Card */}
        <div className="p-4 rounded-3xl bg-[#071321]/60 border border-[#171C25]">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.fullName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#F20D18]" 
            />
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">{currentUser.fullName}</h4>
              <p className="text-[11px] text-[#94A3B8]">@{currentUser.username}</p>
              <p className="text-[10px] text-[#F20D18] font-bold">{currentUser.beltRankSocial}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#171C25] text-center">
            <div>
              <p className="text-xs font-black text-white">{currentUser.postsCount}</p>
              <p className="text-[9px] text-[#94A3B8] uppercase">Posts</p>
            </div>
            <div>
              <p className="text-xs font-black text-white">{currentUser.followersCount}</p>
              <p className="text-[9px] text-[#94A3B8] uppercase">Seguidores</p>
            </div>
            <div>
              <p className="text-xs font-black text-white">{currentUser.streakDays}</p>
              <p className="text-[9px] text-[#F20D18] font-black uppercase">Streak</p>
            </div>
          </div>
        </div>

        {/* SF Business Spotlight */}
        <div 
          onClick={() => onNavigateView('business')}
          className="p-4 rounded-3xl bg-gradient-to-br from-[#0B1526] to-[#071321] border border-[#F20D18]/50 hover:border-[#F20D18] cursor-pointer transition-all shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#F20D18]" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">SF Business</h4>
            </div>
            <span className="text-[9px] font-black text-white bg-[#F20D18] px-2 py-0.5 rounded-full shadow-sm">
              COMERCIAL
            </span>
          </div>
          <p className="text-xs text-white font-bold leading-tight">
            Central de Anúncios & Patrocínios
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug">
            Divulgue marcas, venda ingressos de lutas, anuncie equipamentos e contrate atletas.
          </p>
        </div>

        {/* SF Academy Teaser */}
        <div 
          onClick={() => onNavigateView('academy')}
          className="p-4 rounded-3xl bg-gradient-to-br from-[#071321] to-[#0D121C] border border-[#F20D18]/40 hover:border-[#F20D18] cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F20D18]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">SF Academy</h4>
            </div>
            <span className="text-[9px] font-bold text-[#F20D18] bg-[#F20D18]/15 px-2 py-0.5 rounded">
              GERENCIAR
            </span>
          </div>
          <p className="text-xs text-[#CBD5E1] font-bold leading-tight">
            {currentUser.affiliatedAcademyName || 'UBF Team Parque Indiano'}
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug">
            Alunos, controle de chamadas em 1 toque, mensalidades e financeiro integrados.
          </p>
        </div>

        {/* Upcoming Events Widget */}
        <div className="p-4 rounded-3xl bg-[#071321]/60 border border-[#171C25]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F20D18]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Próximos Campeonatos</h4>
            </div>
            <button 
              onClick={() => onNavigateView('events')}
              className="text-[10px] text-[#F20D18] font-bold hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-2.5">
            {events.slice(0, 2).map((evt) => (
              <div 
                key={evt.id}
                onClick={() => onNavigateView('events')}
                className="p-2.5 rounded-2xl bg-[#0D121C] border border-[#171C25] hover:border-[#F20D18]/40 cursor-pointer transition-all"
              >
                <span className="text-[9px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/30">
                  {evt.type}
                </span>
                <h5 className="text-xs font-bold text-white mt-1 leading-tight">{evt.title}</h5>
                <p className="text-[10px] text-[#94A3B8] mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#F20D18]" />
                  <span>{evt.date} • {evt.city}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Report Modal */}
      {reportingPost && (
        <ReportModal
          isOpen={!!reportingPost}
          targetId={reportingPost.id}
          targetType="POST"
          targetAuthorUsername={reportingPost.authorUsername}
          reporterId={currentUser.id}
          reporterUsername={currentUser.username}
          onClose={() => setReportingPost(null)}
          onReportSuccess={() => {
            setHiddenIds((prev) => [...prev, reportingPost.id]);
            setReportingPost(null);
          }}
        />
      )}
    </div>
  );
};

