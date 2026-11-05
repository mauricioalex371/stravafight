import React, { useEffect, useState } from 'react';
import { Swords, Trophy, Shield, Activity } from 'lucide-react';
import { FighterService } from '../services/fighterService';
import { Fighter, Fight } from '../types/fighter';

interface Props {
  sherdogId: number | null | undefined;
}

const resultColor = (r: string | null) => {
  if (!r) return 'text-slate-400';
  if (r === 'win') return 'text-emerald-400';
  if (r === 'loss') return 'text-red-400';
  return 'text-amber-400';
};

const FightRow = ({ f }: { f: Fight }) => (
  <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
    <span className={`text-[11px] font-black uppercase w-10 shrink-0 ${resultColor(f.result)}`}>
      {f.result ?? '—'}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white truncate">{f.opponent ?? '—'}</p>
      <p className="text-[11px] text-slate-400 truncate">
        {f.event ?? '—'} · {f.eventDateIso ?? f.eventDate ?? '—'}
      </p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-[11px] font-semibold text-slate-200">{f.method ?? '—'}</p>
      <p className="text-[10px] text-slate-500">R{f.round ?? '—'} · {f.time ?? '—'}</p>
    </div>
  </div>
);

export function FighterRecordCard({ sherdogId }: Props) {
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    FighterService.getBySherdogId(sherdogId ?? null).then((f) => {
      if (active) {
        setFighter(f);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [sherdogId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#171C25] border border-white/5 p-4 animate-pulse">
        <div className="h-4 w-1/2 bg-white/10 rounded mb-3" />
        <div className="h-20 bg-white/5 rounded" />
      </div>
    );
  }
  if (!fighter) return null; // sem registro vinculado: não renderiza nada

  const record = `${fighter.wins}-${fighter.losses}-${fighter.draws}${fighter.nc ? ` (${fighter.nc}NC)` : ''}`;

  return (
    <div className="rounded-2xl bg-[#171C25] border border-white/5 overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-12 h-12 rounded-xl bg-[#0E1117] border border-white/10 flex items-center justify-center shrink-0">
          <Swords className="w-6 h-6 text-[#F20D18]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-white tracking-tight truncate">
            {fighter.name}
            {fighter.nickname ? <span className="text-slate-400 font-semibold"> "{fighter.nickname}"</span> : null}
          </h3>
          <p className="text-[11px] text-slate-400 truncate">
            {[fighter.nationality, fighter.weightClass, fighter.association].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {/* Cartel */}
      <div className="grid grid-cols-3 gap-px bg-white/5">
        <div className="bg-[#171C25] p-3 text-center">
          <Trophy className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white">{fighter.wins}</p>
          <p className="text-[10px] text-slate-400 uppercase">Vitórias</p>
        </div>
        <div className="bg-[#171C25] p-3 text-center">
          <Shield className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white">{fighter.losses}</p>
          <p className="text-[10px] text-slate-400 uppercase">Derrotas</p>
        </div>
        <div className="bg-[#171C25] p-3 text-center">
          <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-black text-white">{record}</p>
          <p className="text-[10px] text-slate-400 uppercase">Cartel</p>
        </div>
      </div>

      {/* Detalhamento de vitórias */}
      <div className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 border-b border-white/5">
        <span>KO/TKO: <b className="text-emerald-400">{fighter.winKo}</b></span>
        <span>Sub: <b className="text-emerald-400">{fighter.winSub}</b></span>
        <span>Dec: <b className="text-emerald-400">{fighter.winDec}</b></span>
      </div>

      {/* Histórico */}
      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Histórico de Lutas</p>
        {fighter.fights.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Sem lutas registradas.</p>
        ) : (
          <div>
            {fighter.fights.slice(0, 8).map((f) => <FightRow key={f.id} f={f} />)}
            {fighter.fights.length > 8 && (
              <p className="text-[11px] text-slate-500 pt-2 text-center">
                +{fighter.fights.length - 8} lutas
              </p>
            )}
          </div>
        )}
        {fighter.sherdogUrl && (
          <a
            href={fighter.sherdogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden"
          >
            fonte
          </a>
        )}
      </div>
    </div>
  );
}

export default FighterRecordCard;
