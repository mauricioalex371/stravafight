// Tipos do registro de lutadores importados do Sherdog.
// Espelham as tabelas public.fighters e public.fights (snake_case no banco).

export interface Fight {
  id: number;
  result: string | null;          // win | loss | draw | NC
  opponent: string | null;
  opponentUrl: string | null;
  event: string | null;
  eventUrl: string | null;
  eventDate: string | null;        // "Jul / 11 / 2026"
  eventDateIso: string | null;     // "2026-07-11"
  method: string | null;           // "TKO (Punches)"
  referee: string | null;
  round: number | null;
  time: string | null;            // "1:09"
  fightType: string;              // pro | exhibition | amateur
  fightOrder: number;
}

export interface Fighter {
  id: number;
  sherdogId: number;
  sherdogUrl: string | null;
  sherdogSlug: string | null;
  name: string | null;
  nickname: string | null;
  nationality: string | null;
  locality: string | null;
  birthDate: string | null;
  age: number | null;
  imageUrl: string | null;
  height: string | null;
  heightCm: number | null;
  weightLbs: number | null;
  weightKg: number | null;
  association: string | null;
  weightClass: string | null;
  wins: number;
  losses: number;
  draws: number;
  nc: number;
  winKo: number;
  winSub: number;
  winDec: number;
  winKoPct: string | null;
  winSubPct: string | null;
  winDecPct: string | null;
  lossKo: number;
  lossSub: number;
  lossDec: number;
  lossKoPct: string | null;
  lossSubPct: string | null;
  lossDecPct: string | null;
  fights: Fight[];
}
