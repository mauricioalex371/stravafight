import { supabase, isSupabaseReady } from '../lib/supabase';
import { Fighter, Fight } from '../types/fighter';

// Mapeia uma linha do banco (snake_case) -> Fighter (camelCase), igual ao DbService.
function mapFighter(data: any, fights: any[]): Fighter {
  return {
    id: data.id,
    sherdogId: data.sherdog_id,
    sherdogUrl: data.sherdog_url,
    sherdogSlug: data.sherdog_slug,
    name: data.name,
    nickname: data.nickname,
    nationality: data.nationality,
    locality: data.locality,
    birthDate: data.birth_date,
    age: data.age,
    imageUrl: data.image_url,
    height: data.height,
    heightCm: data.height_cm,
    weightLbs: data.weight_lbs,
    weightKg: data.weight_kg,
    association: data.association,
    weightClass: data.weight_class,
    wins: data.wins ?? 0,
    losses: data.losses ?? 0,
    draws: data.draws ?? 0,
    nc: data.nc ?? 0,
    winKo: data.win_ko ?? 0,
    winSub: data.win_sub ?? 0,
    winDec: data.win_dec ?? 0,
    winKoPct: data.win_ko_pct,
    winSubPct: data.win_sub_pct,
    winDecPct: data.win_dec_pct,
    lossKo: data.loss_ko ?? 0,
    lossSub: data.loss_sub ?? 0,
    lossDec: data.loss_dec ?? 0,
    lossKoPct: data.loss_ko_pct,
    lossSubPct: data.loss_sub_pct,
    lossDecPct: data.loss_dec_pct,
    fights: (fights || []).map(mapFight),
  };
}

function mapFight(data: any): Fight {
  return {
    id: data.id,
    result: data.result,
    opponent: data.opponent,
    opponentUrl: data.opponent_url,
    event: data.event,
    eventUrl: data.event_url,
    eventDate: data.event_date,
    eventDateIso: data.event_date_iso,
    method: data.method,
    referee: data.referee,
    round: data.round,
    time: data.time,
    fightType: data.fight_type ?? 'pro',
    fightOrder: data.fight_order ?? 0,
  };
}

export class FighterService {
  // Busca o registro completo (cartel + histórico) de um lutador pelo sherdog_id.
  static async getBySherdogId(sherdogId: number): Promise<Fighter | null> {
    if (!isSupabaseReady()) return null;
    try {
      const { data: fighter, error } = await supabase
        .from('fighters')
        .select('*')
        .eq('sherdog_id', sherdogId)
        .single();
      if (error || !fighter) return null;

      const { data: fights } = await supabase
        .from('fights')
        .select('*')
        .eq('fighter_id', fighter.id)
        .order('fight_order', { ascending: true });

      return mapFighter(fighter, fights);
    } catch {
      return null;
    }
  }

  // Busca pelo nome (lista de lutadores cadastrados).
  static async searchByName(name: string): Promise<Fighter[]> {
    if (!isSupabaseReady()) return [];
    try {
      const { data, error } = await supabase
        .from('fighters')
        .select('*')
        .ilike('name', `%${name}%`)
        .limit(20);
      if (error || !data) return [];
      return data.map((f) => mapFighter(f, []));
    } catch {
      return [];
    }
  }

  // Pega o registro vinculado a um perfil (o perfil tem sherdog_id).
  static async getForProfile(profileSherdogId: number | null | undefined): Promise<Fighter | null> {
    if (!profileSherdogId) return null;
    return FighterService.getBySherdogId(profileSherdogId);
  }
}
