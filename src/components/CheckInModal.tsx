import React, { useState } from 'react';
import { X, Flame, Sparkles, CheckCircle2, Shield, Camera, Award } from 'lucide-react';
import { UserProfile, TrainingCheckIn } from '../types';
import { generateUUID } from '../utils/formatters';

interface CheckInModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onCompleteCheckIn: (checkIn: TrainingCheckIn, xpEarned: number) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  currentUser,
  onClose,
  onCompleteCheckIn
}) => {
  const [modality, setModality] = useState(currentUser.modalities[0]?.modality || 'Jiu-Jitsu');
  const [duration, setDuration] = useState('90');
  const [rounds, setRounds] = useState('8');
  const [intensity, setIntensity] = useState<'LEVE' | 'MODERADO' | 'GUERRA' | 'COMPETIÇÃO'>('GUERRA');
  const [notes, setNotes] = useState('');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80');

  const modalitiesList = [
    'Jiu-Jitsu',
    'Muay Thai',
    'MMA',
    'Boxe',
    'Judô',
    'Wrestling',
    'Kickboxing',
    'Capoeira',
    'Karatê',
    'Taekwondo',
    'Preparação Física Tatame'
  ];

  const presetPhotos = [
    { label: 'Kimono Tatame', url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80' },
    { label: 'Luvas & Sparring', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80' },
    { label: 'Treino Competição', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80' },
    { label: 'Faixas & Tatame', url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationNum = parseInt(duration, 10) || 60;
    const roundsNum = parseInt(rounds, 10) || 5;

    // XP calculation: 100 base + 10 per round + 50 for GUERRA/COMPETIÇÃO
    let xp = 100 + (roundsNum * 5);
    if (intensity === 'GUERRA' || intensity === 'COMPETIÇÃO') xp += 50;

    const checkIn: TrainingCheckIn = {
      id: generateUUID(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      modality,
      durationMinutes: durationNum,
      rounds: roundsNum,
      intensity,
      notes: notes.trim() || `Treino concluído de ${modality}! ${roundsNum} rounds de ${intensity.toLowerCase()}. Oss!`,
      mediaUrl,
      createdAt: new Date().toISOString(),
      xpEarned: xp
    };

    onCompleteCheckIn(checkIn, xp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F20D18] to-[#FF4A0F] flex items-center justify-center shadow-glow-red">
              <Flame className="w-5 h-5 text-white fill-white animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">Check-in de Treino</h2>
              <p className="text-[11px] text-[#94A3B8]">Mantenha seu Tatame Streak ativo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Streak & XP banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#171C25] via-[#071321] to-[#171C25] border border-[#F20D18]/30 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-[#F20D18] fill-[#F20D18]" />
            <div>
              <p className="text-xs font-bold text-white">Sequência Atual</p>
              <p className="text-[11px] text-[#94A3B8]">{currentUser.streakDays} dias seguidos</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider block">Recompensa</span>
            <span className="text-sm font-black text-white">+150 XP de Faixa</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Modality Selection */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
              Modalidade Praticada
            </label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs font-semibold focus:border-[#F20D18] focus:outline-none"
            >
              {modalitiesList.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Duration & Rounds */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
                Duração (minutos)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="10"
                max="300"
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs font-bold focus:border-[#F20D18] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
                Rounds / Rolas
              </label>
              <input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                min="1"
                max="30"
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs font-bold focus:border-[#F20D18] focus:outline-none"
              />
            </div>
          </div>

          {/* Intensity selector */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
              Intensidade do Treino
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['LEVE', 'MODERADO', 'GUERRA', 'COMPETIÇÃO'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensity(lvl)}
                  className={`min-h-[40px] rounded-xl text-[10px] font-black tracking-wide transition-all ${
                    intensity === lvl
                      ? 'bg-[#F20D18] text-white shadow-md shadow-[#F20D18]/30 scale-102'
                      : 'bg-[#05070B] border border-[#171C25] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Photo presets or URL */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
              Foto do Tatame
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {presetPhotos.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setMediaUrl(preset.url)}
                  className={`h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative ${
                    mediaUrl === preset.url ? 'border-[#F20D18] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
              Relato / Ajustes Técnicos
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino forte de passagem de guarda e armlock invertido..."
              className="w-full p-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[#F20D18]/30 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Check-in & Publicar no Feed</span>
          </button>
        </form>
      </div>
    </div>
  );
};
