import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Download, 
  Share2, 
  Flame, 
  Check, 
  Sparkles, 
  Smartphone,
  Square,
  RectangleVertical,
  Sliders,
  Send,
  Zap,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from 'lucide-react';
import { UserProfile, Post } from '../types';
import { 
  OfficialFilterOverlay, 
  generateOfficialFilterImage,
  getModalityIconKey,
  MODALITY_ICON_PRESETS,
  getModalitySvgMarkup
} from './OfficialFilterOverlay';
import { generateUUID } from '../utils/formatters';

interface SfActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onPublishActivity: (post: Post, xpEarned: number) => void;
}

interface ModalityOption {
  id: string;
  name: string;
  kcalPerMinute: number;
}

const MODALITIES: ModalityOption[] = [
  { id: 'jiu-jitsu', name: 'Jiu-Jitsu', kcalPerMinute: 9.6 },
  { id: 'muay-thai', name: 'Muay Thai', kcalPerMinute: 10.8 },
  { id: 'funcional', name: 'Treino Funcional', kcalPerMinute: 9.45 },
  { id: 'boxe', name: 'Boxe', kcalPerMinute: 11.33 },
  { id: 'mma', name: 'MMA', kcalPerMinute: 10.0 },
  { id: 'musculacao', name: 'Musculação', kcalPerMinute: 7.5 },
  { id: 'judo', name: 'Judô', kcalPerMinute: 9.8 },
  { id: 'kickboxing', name: 'Kickboxing', kcalPerMinute: 11.0 },
  { id: 'karate', name: 'Karatê', kcalPerMinute: 9.2 },
  { id: 'taekwondo', name: 'Taekwondo', kcalPerMinute: 9.5 },
  { id: 'capoeira', name: 'Capoeira', kcalPerMinute: 8.8 },
  { id: 'krav-maga', name: 'Krav Maga', kcalPerMinute: 10.2 },
  { id: 'wrestling', name: 'Wrestling / Luta Livre', kcalPerMinute: 10.5 },
  { id: 'corrida', name: 'Corrida', kcalPerMinute: 11.5 },
  { id: 'ciclismo', name: 'Ciclismo', kcalPerMinute: 9.0 },
  { id: 'outros', name: 'Outro Treino', kcalPerMinute: 8.5 },
];

export const OFFICIAL_MODALITY_CONFIGS: Record<string, {
  hours: number;
  minutes: number;
  calories: number;
  photoUrl: string;
  label: string;
}> = {
  'jiu-jitsu': {
    hours: 1,
    minutes: 15,
    calories: 720,
    photoUrl: '/public/assets/aistudio/WhatsApp_Image_2026-11-03_at_02.55.18_ccd3028d.jpeg',
    label: 'Jiu-Jitsu Tatame Oficial'
  },
  'muay-thai': {
    hours: 1,
    minutes: 15,
    calories: 810,
    photoUrl: '/public/assets/aistudio/ref_muay_thai_quad.jpg',
    label: 'Muay Thai Ringue Oficial'
  },
  'funcional': {
    hours: 0,
    minutes: 55,
    calories: 520,
    photoUrl: '/public/assets/aistudio/ref_funcional_quad.jpg',
    label: 'Treino Funcional Kettlebell'
  },
  'boxe': {
    hours: 1,
    minutes: 0,
    calories: 680,
    photoUrl: '/public/assets/aistudio/ref_boxe_quad.jpg',
    label: 'Boxe Sparring Ringue'
  },
  'mma': {
    hours: 1,
    minutes: 25,
    calories: 850,
    photoUrl: '/public/assets/aistudio/ref_mma_quad.jpg',
    label: 'MMA Octógono Oficial'
  }
};

const PRESET_PHOTOS = [
  {
    name: 'Jiu-Jitsu Tatame (Oficial)',
    tag: 'Jiu-Jitsu',
    url: '/public/assets/aistudio/WhatsApp_Image_2026-11-03_at_02.55.18_ccd3028d.jpeg',
  },
  {
    name: 'Muay Thai Ringue (Oficial)',
    tag: 'Muay Thai',
    url: '/public/assets/aistudio/ref_muay_thai_quad.jpg',
  },
  {
    name: 'Treino Funcional (Oficial)',
    tag: 'Funcional',
    url: '/public/assets/aistudio/ref_funcional_quad.jpg',
  },
  {
    name: 'Boxe Sparring (Oficial)',
    tag: 'Boxe',
    url: '/public/assets/aistudio/ref_boxe_quad.jpg',
  },
  {
    name: 'MMA Octógono (Oficial)',
    tag: 'MMA',
    url: '/public/assets/aistudio/ref_mma_quad.jpg',
  },
  {
    name: 'Card 4 em 1 Referência',
    tag: 'Multi-Modalidades',
    url: '/public/assets/aistudio/Muay_Thai__Functional__Boxing__MMA_be71c2a0_2K_d05ede64.jpg',
  }
];

export const SfActivityModal: React.FC<SfActivityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPublishActivity
}) => {
  if (!isOpen) return null;

  // Form states initialized to exact values from the reference image:
  // "Jiu-Jitsu", "1h 15min", "720 kcal"
  const [selectedModality, setSelectedModality] = useState<string>('Jiu-Jitsu');
  const [customModality, setCustomModality] = useState<string>('');
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(15);
  const [calories, setCalories] = useState<number>(720);
  const [isManualCalories, setIsManualCalories] = useState<boolean>(false);
  const [iconVariant, setIconVariant] = useState<string>('default');

  // Photo state (defaults to the exact reference photo)
  const [photoUrl, setPhotoUrl] = useState<string>(PRESET_PHOTOS[0].url);
  const [caption, setCaption] = useState<string>('Treino oficial concluído com disciplina e evolução. “Esforço que transforma, luta que evolui.” #StravaFight #SFActivity');

  // Presentation settings
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '4:5' | '1:1'>('9:16');
  const [verticalOffset, setVerticalOffset] = useState<number>(0);

  // Export states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute duration formatted label: e.g. "1h 15min"
  const computeDurationFormatted = () => {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    }
    if (hours > 0) {
      return `${hours}h 00min`;
    }
    return `${minutes}min`;
  };

  const durationFormatted = computeDurationFormatted();
  const effectiveModality = selectedModality === 'Outro Treino' && customModality ? customModality : selectedModality;

  // Auto calculate calories when hours or minutes change
  useEffect(() => {
    if (!isManualCalories) {
      const totalMinutes = hours * 60 + minutes;
      const option = MODALITIES.find(m => m.name.toLowerCase() === selectedModality.toLowerCase());
      const rate = option ? option.kcalPerMinute : 9.6;
      const estimatedKcal = Math.round(totalMinutes * rate);
      setCalories(estimatedKcal || 720);
    }
  }, [selectedModality, hours, minutes, isManualCalories]);

  // Handle custom file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setExportedImage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate PNG image via canvas matching the exact reference
  const handleGenerateCanvas = async (): Promise<string> => {
    setIsExporting(true);
    try {
      const dataUrl = await generateOfficialFilterImage({
        imageSrc: photoUrl,
        modality: effectiveModality,
        durationFormatted: durationFormatted,
        calories: calories,
        aspectRatio: aspectRatio,
        positionOffset: verticalOffset,
        iconVariant: iconVariant === 'default' ? undefined : iconVariant
      });
      setExportedImage(dataUrl);
      setIsExporting(false);
      return dataUrl;
    } catch (err) {
      setIsExporting(false);
      return photoUrl;
    }
  };

  // Download high-resolution PNG
  const handleDownload = async () => {
    let imgData = exportedImage;
    if (!imgData) {
      imgData = await handleGenerateCanvas();
    }

    const link = document.createElement('a');
    link.href = imgData;
    link.download = `STRAVA-FIGHT-${effectiveModality.replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Share via Web Share API or WhatsApp
  const handleShare = async () => {
    let imgData = exportedImage;
    if (!imgData) {
      imgData = await handleGenerateCanvas();
    }

    const shareTitle = `Treino de ${effectiveModality} • ${durationFormatted} • ${calories} kcal no STRAVA FIGHT`;
    const shareText = `Acabei de concluir ${durationFormatted} de ${effectiveModality} (${calories} kcal) no STRAVA FIGHT! “Esforço que transforma, luta que evolui.” Veja em: https://stravafight.com`;

    if (navigator.share) {
      try {
        const res = await fetch(imgData);
        const blob = await res.blob();
        const file = new File([blob], `stravafight-${effectiveModality.toLowerCase()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            files: [file]
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
          return;
        } else {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: 'https://stravafight.com'
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
          return;
        }
      } catch (e) {
        // Canceled or fallback
      }
    }

    // Fallback: Open WhatsApp
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n${shareText}`)}`;
    window.open(waUrl, '_blank');
  };

  // Publish to STRAVA FIGHT Feed
  const handlePublishToFeed = async () => {
    setIsExporting(true);
    let finalImageUrl = exportedImage;
    if (!finalImageUrl) {
      finalImageUrl = await handleGenerateCanvas();
    }

    const totalMinutes = hours * 60 + minutes;
    const xpEarned = 150 + Math.min(Math.round(calories / 4), 250);

    const newPost: Post = {
      id: generateUUID(),
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatarUrl,
      authorModality: effectiveModality,
      authorBelt: currentUser.modalities[0]?.belt || 'Faixa Preta',
      isAuthorVerified: currentUser.isVerified,
      mediaUrl: finalImageUrl,
      mediaType: 'image',
      caption: caption || `Treino oficial de ${effectiveModality} registrado na STRAVA FIGHT! Duração: ${durationFormatted} • Calorias: ${calories} kcal.`,
      hashtags: [
        '#StravaFight', 
        `#${effectiveModality.replace(/[^a-zA-Z0-9]/g, '')}`, 
        '#FiltroOficial', 
        '#EsforcoQueTransforma',
        '#TatameStreak'
      ],
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
        durationMinutes: totalMinutes,
        rounds: Math.round(totalMinutes / 5),
        intensity: 'Alta',
        xpGained: xpEarned
      },
      activityData: {
        modality: effectiveModality,
        durationFormatted: durationFormatted,
        durationMinutes: totalMinutes,
        calories: calories,
        isCaloriesEstimated: !isManualCalories,
        textPosition: 'center',
        aspectRatio: aspectRatio,
        hasOfficialFilter: true
      }
    };

    setIsExporting(false);
    onPublishActivity(newPost, xpEarned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-5xl max-h-[96vh] bg-[#071321] border border-[#171C25] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#171C25] bg-[#05070B]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F20D18] to-[#FF4A0F] flex items-center justify-center shadow-md shadow-[#F20D18]/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                SF ACTIVITY <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F20D18]/20 text-[#F20D18] border border-[#F20D18]/40">Filtro Oficial STRAVA FIGHT</span>
              </h2>
              <p className="text-[11px] text-[#94A3B8]">
                Composição oficial com foto de fundo, métricas brancas e faixa no tatame
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#94A3B8] hover:text-white hover:bg-[#171C25] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Column has the EXACT full-screen visual from the reference image */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT / CENTER: EXACT REPLICA OF THE STORY VIEW FROM REFERENCE IMAGE */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              
              {/* Aspect Ratio Container (9:16 default like reference image) */}
              <div 
                className={`relative overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl transition-all duration-300 w-full max-w-[340px] sm:max-w-[390px] mx-auto ${
                  aspectRatio === '9:16' 
                    ? 'aspect-[9/16]' 
                    : aspectRatio === '4:5' 
                    ? 'aspect-[4/5]' 
                    : 'aspect-square'
                }`}
              >
                {/* 1. Full Bleed Photo Background */}
                <img
                  src={photoUrl}
                  alt="Treino"
                  className="w-full h-full object-cover"
                />

                {/* 2. Top Right Close Button "✕" Exactly as in the Story Reference Image */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* 3. The Official Overlay: Exercício, Jiu-Jitsu, Duração, 1h 15min, Calorias, 720 kcal, Belt, STRAVA FIGHT */}
                <OfficialFilterOverlay
                  data={{
                    modality: effectiveModality,
                    durationFormatted: durationFormatted,
                    calories: calories,
                    positionOffset: verticalOffset,
                    iconVariant: iconVariant === 'default' ? undefined : iconVariant
                  }}
                />
              </div>

              {/* Quick fine-tune vertical position buttons */}
              <div className="flex items-center gap-2 mt-2 text-xs text-[#94A3B8]">
                <span>Ajuste vertical:</span>
                <button
                  type="button"
                  onClick={() => {
                    setVerticalOffset(prev => Math.max(-15, prev - 3));
                    setExportedImage(null);
                  }}
                  className="p-1 px-2 rounded-lg bg-[#05070B] border border-[#171C25] hover:text-white flex items-center gap-1"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Subir</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerticalOffset(0);
                    setExportedImage(null);
                  }}
                  className="p-1 px-2 rounded-lg bg-[#05070B] border border-[#171C25] hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Padrão</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerticalOffset(prev => Math.min(15, prev + 3));
                    setExportedImage(null);
                  }}
                  className="p-1 px-2 rounded-lg bg-[#05070B] border border-[#171C25] hover:text-white flex items-center gap-1"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Descer</span>
                </button>
              </div>
            </div>

            {/* RIGHT: Intuitive Controls to Customize Data & Photo */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 1. Modality Selector with Custom SVG Icons */}
              <div className="bg-[#05070B] p-4 rounded-2xl border border-[#171C25] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#F20D18]" />
                    Modalidade (Exercício)
                  </label>
                  <span className="text-[10px] text-[#94A3B8] font-bold">Ícones Oficiais SF</span>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto no-scrollbar p-1">
                  {MODALITIES.map((m) => {
                    const isSelected = selectedModality.toLowerCase() === m.name.toLowerCase();
                    const iconKey = getModalityIconKey(m.name);
                    const svgHtml = getModalitySvgMarkup(iconKey);

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModality(m.name);
                          setIconVariant('default');
                          setExportedImage(null);

                          const iconKey = getModalityIconKey(m.name);
                          const officialPreset = OFFICIAL_MODALITY_CONFIGS[iconKey];
                          if (officialPreset) {
                            setHours(officialPreset.hours);
                            setMinutes(officialPreset.minutes);
                            setCalories(officialPreset.calories);
                            setIsManualCalories(true);
                            setPhotoUrl(officialPreset.photoUrl);
                          }
                        }}
                        className={`p-2 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 border ${
                          isSelected
                            ? 'bg-[#F20D18]/15 border-[#F20D18] text-white shadow-md shadow-[#F20D18]/25 scale-[1.02]'
                            : 'bg-[#0D121C] border-[#171C25] text-[#94A3B8] hover:text-white hover:bg-[#171C25]'
                        }`}
                      >
                        <div 
                          className="w-10 h-7 flex items-center justify-center pointer-events-none"
                          dangerouslySetInnerHTML={{ __html: svgHtml }}
                        />
                        <span className="truncate w-full text-[11px] font-bold">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Professional Icon Variant Selector */}
              {MODALITY_ICON_PRESETS[getModalityIconKey(effectiveModality)]?.length > 1 && (
                <div className="bg-[#05070B] p-4 rounded-2xl border border-[#171C25] space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FF4A0F]" />
                    Símbolo / Ícone do Tatame
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MODALITY_ICON_PRESETS[getModalityIconKey(effectiveModality)].map((preset) => {
                      const isSelected = (iconVariant === 'default' && preset === MODALITY_ICON_PRESETS[getModalityIconKey(effectiveModality)][0]) || iconVariant === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setIconVariant(preset.id);
                            setExportedImage(null);
                          }}
                          className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'border-[#F20D18] bg-[#F20D18]/20 text-white shadow-sm'
                              : 'border-[#171C25] bg-[#0D121C] text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          <div 
                            className="w-12 h-8 flex items-center justify-center pointer-events-none"
                            dangerouslySetInnerHTML={{ 
                              __html: getModalitySvgMarkup(getModalityIconKey(effectiveModality), preset.id) 
                            }}
                          />
                          <span className="text-[11px] truncate w-full text-center">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Duration & Calories */}
              <div className="bg-[#05070B] p-4 rounded-2xl border border-[#171C25] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#94A3B8] font-bold uppercase block mb-1 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-[#F20D18]" />
                      Duração
                    </label>
                    <div className="flex gap-1">
                      <select
                        value={hours}
                        onChange={(e) => {
                          setHours(Number(e.target.value));
                          setExportedImage(null);
                        }}
                        className="w-1/2 px-2 py-2 rounded-xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs outline-none"
                      >
                        {[0, 1, 2, 3, 4].map(h => (
                          <option key={h} value={h}>{h}h</option>
                        ))}
                      </select>
                      <select
                        value={minutes}
                        onChange={(e) => {
                          setMinutes(Number(e.target.value));
                          setExportedImage(null);
                        }}
                        className="w-1/2 px-2 py-2 rounded-xl bg-[#0D121C] border border-[#171C25] text-white font-bold text-xs outline-none"
                      >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                          <option key={m} value={m}>{m}m</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#94A3B8] font-bold uppercase block mb-1 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-[#FF4A0F]" />
                      Calorias
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={calories}
                        onChange={(e) => {
                          setCalories(Number(e.target.value) || 0);
                          setIsManualCalories(true);
                          setExportedImage(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#0D121C] border border-[#171C25] text-white font-black text-sm outline-none"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#94A3B8]">
                        kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Photo Background Selector */}
              <div className="bg-[#05070B] p-4 rounded-2xl border border-[#171C25] space-y-2.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#F20D18]" />
                  Fotografia de Fundo
                </label>

                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#F20D18]/25 hover:opacity-95 active:scale-95 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Foto da Galeria</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {PRESET_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      title={preset.name}
                      onClick={() => {
                        setPhotoUrl(preset.url);
                        setExportedImage(null);
                      }}
                      className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        photoUrl === preset.url ? 'border-[#F20D18] scale-105 shadow-md shadow-[#F20D18]/40 ring-2 ring-[#F20D18]/30' : 'border-[#171C25] opacity-75 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1 text-[9px] font-bold text-white text-center truncate">
                        {preset.tag}
                      </div>
                      {photoUrl === preset.url && (
                        <div className="absolute top-1 right-1 bg-[#F20D18] w-4 h-4 rounded-full flex items-center justify-center shadow">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Aspect Ratio & Caption */}
              <div className="bg-[#05070B] p-4 rounded-2xl border border-[#171C25] space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAspectRatio('9:16');
                      setExportedImage(null);
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                      aspectRatio === '9:16'
                        ? 'border-[#F20D18] bg-[#F20D18]/15 text-white'
                        : 'border-[#171C25] bg-[#0D121C] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="text-[11px]">9:16 Stories</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAspectRatio('4:5');
                      setExportedImage(null);
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                      aspectRatio === '4:5'
                        ? 'border-[#F20D18] bg-[#F20D18]/15 text-white'
                        : 'border-[#171C25] bg-[#0D121C] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <RectangleVertical className="w-3.5 h-3.5" />
                    <span className="text-[11px]">4:5 Feed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAspectRatio('1:1');
                      setExportedImage(null);
                    }}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                      aspectRatio === '1:1'
                        ? 'border-[#F20D18] bg-[#F20D18]/15 text-white'
                        : 'border-[#171C25] bg-[#0D121C] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span className="text-[11px]">1:1 Quadrado</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escreva a legenda..."
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0D121C] border border-[#171C25] text-white text-xs focus:border-[#F20D18] outline-none resize-none"
                />
              </div>

              {/* 5. Main Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handlePublishToFeed}
                  className="w-full min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-[#F20D18] to-[#FF4A0F] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#F20D18]/30 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isExporting ? 'Processando Imagem...' : 'Publicar no Feed STRAVA FIGHT (+150 XP)'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleDownload}
                    className="py-2.5 px-3 rounded-xl bg-[#0D121C] border border-[#171C25] hover:border-white text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    {downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Baixado!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-[#94A3B8]" />
                        <span>Baixar Imagem</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleShare}
                    className="py-2.5 px-3 rounded-xl bg-[#0D121C] border border-[#171C25] hover:border-white text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    {shareSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Pronto!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-[#94A3B8]" />
                        <span>Compartilhar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
