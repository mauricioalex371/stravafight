import React, { useState } from 'react';
import { X, Swords, Flame, Check, Calendar, MapPin, Users, Shield } from 'lucide-react';
import { UserProfile, CombatChallenge } from '../types';
import { generateUUID } from '../utils/formatters';

interface CreateChallengeModalProps {
  currentUser: UserProfile;
  friendsList: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    modality: string;
    belt: string;
  }[];
  preselectedFriendUsername?: string;
  onClose: () => void;
  onCreateChallenge: (challenge: CombatChallenge) => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  currentUser,
  friendsList,
  preselectedFriendUsername,
  onClose,
  onCreateChallenge
}) => {
  const initialFriend = friendsList.find((f) => f.username === preselectedFriendUsername) || friendsList[0];

  const [selectedFriendId, setSelectedFriendId] = useState(initialFriend?.id || '');
  const [category, setCategory] = useState<'SPARRING' | 'ROUNDS_META' | 'SEMANA_STREAK' | 'ROLA_TECNICO'>('SPARRING');
  const [modality, setModality] = useState('MMA');
  const [targetRounds, setTargetRounds] = useState('8');
  const [proposedDate, setProposedDate] = useState('Próximo Sábado às 10h');
  const [location, setLocation] = useState(currentUser.affiliatedAcademyName || 'UBF Team Parque Indiano');
  const [notes, setNotes] = useState('Bora fazer 8 rounds técnicos de sparring? Foco em timing e trocação limpa! Oss!');

  const friend = friendsList.find((f) => f.id === selectedFriendId) || friendsList[0];

  const categories = [
    { id: 'SPARRING' as const, label: 'Sparring de Combate', icon: '🥊', desc: 'Disputa de rounds com luva e caneleira' },
    { id: 'ROLA_TECNICO' as const, label: 'Rola de Jiu-Jitsu', icon: '🥋', desc: 'Treino de finalização Gi ou No-Gi' },
    { id: 'ROUNDS_META' as const, label: 'Meta de Rounds Coletiva', icon: '🔥', desc: 'Acumular X rounds juntos no mês' },
    { id: 'SEMANA_STREAK' as const, label: 'Desafio Tatame Streak', icon: '⚡', desc: 'Treinar 5 a 7 dias sem faltar' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friend) return;

    let title = '';
    if (category === 'SPARRING') {
      title = `Desafio de Sparring: ${targetRounds} Rounds de ${modality}`;
    } else if (category === 'ROLA_TECNICO') {
      title = `Desafio de Tatame: Rola Técnico de ${modality}`;
    } else if (category === 'ROUNDS_META') {
      title = `Meta Coletiva: ${targetRounds} Rounds no Tatame`;
    } else {
      title = `Desafio Streak: 7 Dias de Treino sem Faltar`;
    }

    const newChallenge: CombatChallenge = {
      id: generateUUID(),
      challengerId: currentUser.id,
      challengerName: currentUser.fullName,
      challengerUsername: currentUser.username,
      challengerAvatar: currentUser.avatarUrl,
      challengerBelt: currentUser.modalities[0]?.belt || 'Faixa Marrom',
      targetId: friend.id,
      targetName: friend.name,
      targetUsername: friend.username,
      targetAvatar: friend.avatar,
      targetBelt: friend.belt,
      title,
      modality,
      category,
      targetRounds: parseInt(targetRounds, 10) || 8,
      proposedDate,
      location,
      notes,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    onCreateChallenge(newChallenge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0D121C] border border-[#171C25] rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#171C25] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F20D18] to-[#990008] flex items-center justify-center shadow-glow-red">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">Lançar Desafio de Tatame</h2>
              <p className="text-[11px] text-[#94A3B8]">Desafio amigável de sparring ou treino com amigos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Friend */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
              Escolher Amigo / Parceiro de Sparring
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto no-scrollbar p-1">
              {friendsList.map((f) => {
                const isSelected = selectedFriendId === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFriendId(f.id)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-[#071321] border-[#F20D18] shadow-md shadow-[#F20D18]/15'
                        : 'bg-[#05070B] border-[#171C25] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={f.avatar} alt={f.name} className="w-9 h-9 rounded-full object-cover border border-[#171C25]" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{f.name}</h4>
                      <p className="text-[10px] text-[#F20D18] truncate font-semibold">{f.belt} • {f.modality}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5 uppercase tracking-wide">
              Tipo de Desafio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    category === cat.id
                      ? 'bg-[#F20D18]/15 border-[#F20D18] shadow-md shadow-[#F20D18]/15'
                      : 'bg-[#05070B] border-[#171C25] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <span className="text-lg block mb-1">{cat.icon}</span>
                  <span className="text-xs font-bold text-white block">{cat.label}</span>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5 leading-snug">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modality & Rounds */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Modalidade</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs font-bold focus:border-[#F20D18] focus:outline-none"
              >
                <option value="MMA">MMA</option>
                <option value="Jiu-Jitsu">Jiu-Jitsu</option>
                <option value="Muay Thai">Muay Thai</option>
                <option value="Boxe">Boxe</option>
                <option value="No-Gi">No-Gi Submission</option>
                <option value="Wrestling">Wrestling</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Meta de Rounds</label>
              <input
                type="number"
                min="1"
                max="50"
                value={targetRounds}
                onChange={(e) => setTargetRounds(e.target.value)}
                className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs font-black focus:border-[#F20D18] focus:outline-none"
              />
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Data / Horário Proposto</label>
              <input
                type="text"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                placeholder="Ex: Sábado às 10h"
                className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Local do Treino</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: UBF Team Parque Indiano"
                className="w-full min-h-[40px] px-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes / Rules */}
          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-1">Recado / Regras Combinadas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino técnico com proteção, sem nocaute, foco no aprendizado mútuo..."
              className="w-full p-3 rounded-xl bg-[#05070B] border border-[#171C25] text-white text-xs focus:border-[#F20D18] focus:outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[#F20D18]/30 mt-2"
          >
            <Swords className="w-4 h-4" />
            <span>Enviar Desafio para @{friend?.username || 'amigo'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
