import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Users, CheckCircle, Plus, Search, Tag } from 'lucide-react';
import { CombatEvent } from '../types';

interface EventsViewProps {
  events: CombatEvent[];
  onRegisterEvent: (eventId: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onRegisterEvent
}) => {
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [search, setSearch] = useState('');

  const types = ['TODOS', 'CAMPEONATO', 'SEMINÁRIO', 'AULÃO', 'WORKSHOP'];

  const filteredEvents = events.filter((e) => {
    const matchesType = filterType === 'TODOS' || e.type === filterType;
    const matchesSearch = 
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase()) ||
      e.modalities.some((m) => m.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-12 select-none">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#071321] via-[#0D121C] to-[#171C25] border border-[#F20D18]/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#05070B] border-2 border-[#F20D18] flex items-center justify-center p-2 shadow-glow-red">
            <Trophy className="w-6 h-6 text-[#F20D18]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              Eventos & Campeonatos
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Descubra torneios oficiais, seminários técnicos e aulões da comunidade STRAVA FIGHT
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`min-h-[34px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === t
                ? 'bg-[#F20D18] text-white shadow-md'
                : 'bg-[#071321] text-[#94A3B8] border border-[#171C25] hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div 
            key={evt.id}
            className="rounded-3xl bg-[#071321]/60 border border-[#171C25] overflow-hidden hover:border-[#F20D18]/40 transition-all flex flex-col shadow-sm"
          >
            {/* Banner */}
            <div className="h-40 bg-black relative overflow-hidden">
              <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071321] to-transparent" />
              <span className="absolute top-3 left-3 text-[10px] font-black uppercase text-[#05070B] bg-[#F20D18] px-2 py-0.5 rounded-full shadow-md">
                {evt.type}
              </span>
              <span className="absolute bottom-3 right-3 text-xs font-black text-white bg-black/70 px-2.5 py-1 rounded-xl border border-white/10">
                {evt.registrationPrice}
              </span>
            </div>

            {/* Info Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-black text-white leading-snug">{evt.title}</h3>
                <p className="text-[11px] text-[#F20D18] font-bold mt-0.5">{evt.organizer}</p>
                <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">{evt.description}</p>

                <div className="space-y-1.5 mt-3 pt-3 border-t border-[#171C25] text-xs text-[#94A3B8]">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#F20D18]" />
                    <span>{evt.date} às {evt.time}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F20D18]" />
                    <span>{evt.location} • {evt.city}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#F20D18]" />
                    <span>{evt.registeredCount} atletas já inscritos</span>
                  </p>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  onRegisterEvent(evt.id);
                  alert(`Inscrição confirmada para "${evt.title}"! Os detalhes foram salvos na sua conta.`);
                }}
                className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#F20D18] to-[#D90812] text-white font-black text-xs flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-95 transition-all shadow-md shadow-[#F20D18]/25"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Inscrever-se no Evento</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
