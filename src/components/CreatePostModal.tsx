import React, { useState, useRef } from 'react';
import { 
  X, 
  Image, 
  Video, 
  CheckCircle, 
  Tag, 
  MapPin, 
  Upload, 
  Trash2, 
  RotateCcw, 
  UserPlus,
  Play,
  Film
} from 'lucide-react';
import { UserProfile, Post } from '../types';
import { generateUUID } from '../utils/formatters';
import { SupabaseBridge } from '../services/supabaseClient';

interface CreatePostModalProps {
  currentUser: UserProfile;
  friendsList?: { id: string; name: string; username: string; avatar: string }[];
  onClose: () => void;
  onPublishPost: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  friendsList = [
    { id: 'f1', name: 'Mestre Uarlei Silva', username: 'mestre.uarlei', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
    { id: 'f2', name: 'Amanda Souza', username: 'amanda_bjj', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
    { id: 'f3', name: 'Carlos Gracie Silva', username: 'carlos_mma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
    { id: 'f4', name: 'Beatriz Lima', username: 'beatriz_thai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
  ],
  onClose,
  onPublishPost
}) => {
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string>('https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&auto=format&fit=crop&q=80');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [fileName, setFileName] = useState<string>('tatame_treino.jpg');
  const [isUploading, setIsUploading] = useState(false);

  const [modality, setModality] = useState(currentUser.modalities[0]?.modality || 'Jiu-Jitsu');
  const [belt, setBelt] = useState(currentUser.modalities[0]?.belt || 'Faixa Marrom');
  const [location, setLocation] = useState(currentUser.affiliatedAcademyName || 'UBF Team Parque Indiano');
  const [hashtags, setHashtags] = useState('#JiuJitsu #StravaFight #ArtesMarciais');

  // Tagged People
  const [taggedUsers, setTaggedUsers] = useState<{ username: string; name: string }[]>([]);
  const [isTaggingOpen, setIsTaggingOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickTags = ['#JiuJitsu', '#MuayThai', '#MMA', '#Boxe', '#Sparring', '#NoGi', '#TatameStreak', '#Finalizacao'];

  const presetPhotos = [
    { label: 'Jiu-Jitsu Rola', url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&auto=format&fit=crop&q=80', type: 'image' as const },
    { label: 'Sparring Boxe', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&auto=format&fit=crop&q=80', type: 'image' as const },
    { label: 'Treino de Força', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80', type: 'image' as const },
    { label: 'Drills de Tatame', url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=900&auto=format&fit=crop&q=80', type: 'image' as const },
  ];

  // Handle native file selection from camera / gallery / PC
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setFileName(file.name);
      const isVideo = file.type.startsWith('video');
      setMediaType(isVideo ? 'video' : 'image');

      // Use the Supabase-ready upload bridge
      const url = await SupabaseBridge.uploadMedia(file, 'post-media');
      setMediaUrl(url);
    } catch (err) {
      console.error(err);
      alert('Falha ao processar arquivo selecionado.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl('');
    setFileName('');
  };

  const toggleTagUser = (user: { username: string; name: string }) => {
    if (taggedUsers.some((u) => u.username === user.username)) {
      setTaggedUsers(taggedUsers.filter((u) => u.username !== user.username));
    } else {
      setTaggedUsers([...taggedUsers, user]);
    }
  };

  const handleAddHashtag = (tag: string) => {
    if (!hashtags.includes(tag)) {
      setHashtags((prev) => `${prev} ${tag}`.trim());
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;
    if (!mediaUrl) {
      alert('Selecione uma foto ou vídeo para sua publicação.');
      return;
    }

    const tagsArray = hashtags
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.startsWith('#'));

    const newPost: Post = {
      id: generateUUID(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      authorModality: modality,
      authorBelt: belt,
      isAuthorVerified: currentUser.isVerified,
      mediaUrl,
      mediaType,
      caption: caption.trim(),
      hashtags: tagsArray.length > 0 ? tagsArray : ['#StravaFight', '#EsforcoQueTransforma'],
      location: location.trim(),
      taggedAcademy: currentUser.affiliatedAcademyName,
      taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      likesCount: 1,
      hasLiked: true,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      hasSaved: false,
      createdAt: new Date().toISOString(),
      comments: []
    };

    onPublishPost(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-4">
          <h2 className="text-base font-black text-white">Criar Publicação</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">
          {/* Author snippet */}
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.fullName}
              className="w-10 h-10 rounded-full object-cover border border-[#F20D18]" 
            />
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                <span>{currentUser.fullName}</span>
                {currentUser.isVerified && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F20D18] text-white flex items-center justify-center text-[8px] font-black">✓</span>
                )}
              </p>
              <p className="text-[11px] text-[#94A3B8]">@{currentUser.username}</p>
            </div>
          </div>

          {/* Caption text */}
          <div>
            <textarea
              required
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Compartilhe seu treino, técnica aprendida ou conquista no tatame..."
              className="w-full p-3 rounded-2xl bg-[#05070B] border border-[#171C25] text-white text-xs placeholder:text-[#64748B] focus:border-[#F20D18] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Media Preview & Native Gallery Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#CBD5E1] uppercase tracking-wide flex items-center gap-1.5">
                <Image className="w-4 h-4 text-[#F20D18]" />
                <span>Foto ou Vídeo da Publicação</span>
              </label>

              {/* Native Device File Input Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-[#F20D18] hover:underline flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Escolher da Galeria / Arquivos</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Media Preview Box */}
            {mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-[#171C25] group">
                {mediaType === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <Film className="w-10 h-10 text-[#F20D18] mb-1" />
                      <span className="text-xs font-bold">Vídeo Selecionado</span>
                    </div>
                  </div>
                ) : (
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                )}

                {/* Remove & Replace buttons overlay */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm"
                    title="Substituir Mídia"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Trocar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-700 text-[10px] font-bold backdrop-blur-sm"
                    title="Remover Mídia"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {fileName && (
                  <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white truncate max-w-[200px]">
                    {fileName}
                  </span>
                )}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#171C25] hover:border-[#F20D18] rounded-2xl p-6 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-xs font-bold text-white">Toque para selecionar foto ou vídeo</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Suporta fotos da galeria, câmera ou vídeos de treino</p>
              </div>
            )}

            {/* Presets shortcut */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Ou escolha fotos rápidas de tatame:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {presetPhotos.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setMediaUrl(preset.url);
                      setMediaType(preset.type);
                      setFileName(preset.label);
                    }}
                    className={`h-12 rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative ${
                      mediaUrl === preset.url ? 'border-[#F20D18] scale-102 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-center font-bold text-white truncate p-0.5">
                      {preset.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tag Friends / People (Solicitado no prompt) */}
          <div className="p-3 rounded-2xl bg-[#05070B] border border-[#171C25] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#CBD5E1]">
                <UserPlus className="w-4 h-4 text-[#F20D18]" />
                <span>Marcar Pessoas no Treino ({taggedUsers.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTaggingOpen(!isTaggingOpen)}
                className="text-[11px] font-bold text-[#F20D18] hover:underline"
              >
                {isTaggingOpen ? 'Fechar Lista' : '+ Adicionar'}
              </button>
            </div>

            {/* Tagged Chips */}
            {taggedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {taggedUsers.map((u) => (
                  <span
                    key={u.username}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#171C25] text-white text-[10px] font-bold border border-[#F20D18]/30"
                  >
                    <span>@{u.username}</span>
                    <button type="button" onClick={() => toggleTagUser(u)} className="hover:text-[#F20D18]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Selection Dropdown */}
            {isTaggingOpen && (
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#171C25] max-h-32 overflow-y-auto no-scrollbar">
                {friendsList.map((f) => {
                  const isTagged = taggedUsers.some((u) => u.username === f.username);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleTagUser({ username: f.username, name: f.name })}
                      className={`p-1.5 rounded-xl text-left flex items-center gap-2 transition-all ${
                        isTagged ? 'bg-[#F20D18]/20 border border-[#F20D18]' : 'bg-[#0D121C] border border-[#171C25] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={f.avatar} alt={f.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="truncate text-[10px]">
                        <p className="font-bold text-white truncate">{f.name}</p>
                        <p className="text-[#94A3B8]">@{f.username}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Hashtags */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
              Hashtags de Luta
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {quickTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAddHashtag(t)}
                  className="px-2 py-0.5 rounded-lg bg-[#05070B] border border-[#171C25] text-[#94A3B8] text-[10px] font-bold hover:text-white hover:border-[#F20D18]"
                >
                  +{t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#JiuJitsu #StravaFight"
              className="w-full min-h-[38px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
            />
          </div>

          {/* Modality & Belt */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] mb-1 uppercase tracking-wide">
                Modalidade
              </label>
              <input
                type="text"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                placeholder="Ex: Jiu-Jitsu"
                className="w-full min-h-[38px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] mb-1 uppercase tracking-wide">
                Graduação / Faixa
              </label>
              <input
                type="text"
                value={belt}
                onChange={(e) => setBelt(e.target.value)}
                placeholder="Ex: Faixa Marrom"
                className="w-full min-h-[38px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1 uppercase tracking-wide">
              Localização / Academia
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: UBF Team Parque Indiano"
              className="w-full min-h-[38px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
            />
          </div>

          {/* Publish Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full min-h-[46px] rounded-2xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[#F20D18]/30 mt-4 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isUploading ? 'Processando Mídia...' : 'Publicar no Feed STRAVA FIGHT'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
