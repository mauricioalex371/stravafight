import React, { useState, useMemo } from 'react';
import { Search, Heart, X, Play, MapPin, Users, Trophy, Shield, Briefcase, Sparkles } from 'lucide-react';
import { Post, Reel } from '../types';
import { SearchService, SearchResultItem } from '../services/searchService';
import { getThumbnailUrl } from '../utils/imageOptimizer';

interface ExploreViewProps {
  posts: Post[];
  reels: Reel[];
  onSelectPost: (post: Post) => void;
  onSelectReel: (reel: Reel) => void;
  onNavigateView?: (view: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts,
  reels,
  onSelectPost,
  onSelectReel,
  onNavigateView
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('TUDO');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  const categories = [
    'TUDO',
    'Jiu-Jitsu',
    'Muay Thai',
    'MMA',
    'Boxe',
    'Judô',
    'Finalizações',
    'Nocautes',
    'Academias',
    'Professores'
  ];

  // Global search hits from multi-entity search service
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    SearchService.search(searchQuery, 'TUDO', activeCategory).then((results) => {
      if (!cancelled) setSearchResults(results);
    });

    return () => { cancelled = true; };
  }, [searchQuery, activeCategory]);

  // Combined explore grid items for the visual feed
  const combinedItems = useMemo(() => [
    ...reels.map((r) => ({ type: 'reel' as const, id: r.id, mediaUrl: r.videoUrl, title: r.caption, author: r.authorUsername, likes: r.likesCount, data: r })),
    ...posts.map((p) => ({ type: 'post' as const, id: p.id, mediaUrl: p.mediaUrl, title: p.caption, author: p.authorUsername, likes: p.likesCount, data: p }))
  ], [posts, reels]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeCategory === 'TUDO') return matchesSearch;
      return matchesSearch && (
        item.title.toLowerCase().includes(activeCategory.toLowerCase()) ||
        (item.type === 'post' && item.data.authorModality.toLowerCase().includes(activeCategory.toLowerCase()))
      );
    });
  }, [combinedItems, searchQuery, activeCategory]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-12">
      {/* Top Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar atletas, mestres, golpes, academias, eventos..."
          className="w-full min-h-[46px] pl-11 pr-10 rounded-2xl bg-[#0D121C] border border-[#171C25] text-white text-xs placeholder:text-[#64748B] focus:border-[#F20D18] focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categories chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`min-h-[34px] px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-[#F20D18] text-white shadow-md shadow-[#F20D18]/20'
                : 'bg-[#0D121C] border border-[#171C25] text-[#94A3B8] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Multi-Entity Instant Results (Shown when user searches) */}
      {searchQuery.trim().length > 0 && searchResults.length > 0 && (
        <div className="p-4 bg-[#071321]/80 border border-[#171C25] rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#171C25]">
            <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F20D18]" />
              <span>Resultados Encontrados ({searchResults.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {searchResults.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'POST') onSelectPost(item.payload);
                  else if (item.routeView && onNavigateView) onNavigateView(item.routeView);
                }}
                className="p-2.5 rounded-2xl bg-[#0D121C] border border-[#171C25] hover:border-[#F20D18]/50 flex items-center gap-3 cursor-pointer transition-all"
              >
                {item.imageUrl ? (
                  <img
                    src={getThumbnailUrl(item.imageUrl, 'micro')}
                    alt={item.title}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#171C25]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#171C25] flex items-center justify-center shrink-0 text-[#F20D18]">
                    <Trophy className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">{item.title}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F20D18]/20 text-[#F20D18] font-black uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#94A3B8] truncate">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty Search State */}
      {searchQuery.trim().length > 0 && searchResults.length === 0 && filteredItems.length === 0 && (
        <div className="p-8 text-center bg-[#071321]/50 border border-[#171C25] rounded-3xl space-y-2">
          <Shield className="w-10 h-10 text-[#64748B] mx-auto" />
          <h4 className="text-sm font-bold text-white">Nenhum resultado encontrado</h4>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Não encontramos atletas, golpes ou academias com o termo "{searchQuery}". Tente buscar por "Jiu-Jitsu", "Uarlei", "Kimono" ou "MMA".
          </p>
        </div>
      )}

      {/* Explore Grid (3 columns) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {filteredItems.map((item, idx) => {
          const isSpanTwo = idx % 7 === 1; // Varied heights
          return (
            <div
              key={item.id + idx}
              onClick={() => {
                if (item.type === 'reel') onSelectReel(item.data);
                else onSelectPost(item.data);
              }}
              className={`relative group bg-black overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer ${
                isSpanTwo ? 'row-span-2 aspect-[9/16]' : 'aspect-square'
              }`}
            >
              <img 
                src={item.mediaUrl} 
                alt={item.title} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />

              {/* Reel / Video indicator icon */}
              <div className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white">
                <Play className="w-3 h-3 fill-white" />
              </div>

              {/* Hover overlay with likes & author */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                <p className="text-[11px] font-bold truncate">@{item.author}</p>
                <div className="flex items-center gap-1 text-[10px] text-[#CBD5E1] mt-0.5">
                  <Heart className="w-3 h-3 fill-white text-white" />
                  <span>{item.likes}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
