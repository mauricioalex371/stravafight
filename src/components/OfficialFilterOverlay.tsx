import React from 'react';

export type ModalityCategory = 
  | 'jiu-jitsu'
  | 'muay-thai'
  | 'boxe'
  | 'mma'
  | 'funcional'
  | 'musculacao'
  | 'corrida'
  | 'ciclismo'
  | 'judo'
  | 'karate'
  | 'taekwondo'
  | 'outros';

export interface OfficialFilterData {
  modality: string;
  durationFormatted: string; // e.g. "1h 15min"
  calories: number;
  positionOffset?: number; // percentage offset -20 to +20
  scaleMultiplier?: number; // 0.8 to 1.3
  iconVariant?: string; // allows specific variant override
}

/**
 * Normalizes modality name into an icon category
 */
export function getModalityIconKey(modality: string): ModalityCategory {
  const norm = (modality || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (norm.includes('jiu') || norm.includes('bjj')) return 'jiu-jitsu';
  if (norm.includes('muay') || norm.includes('thai')) return 'muay-thai';
  if (norm.includes('boxe') || norm.includes('boxing')) return 'boxe';
  if (norm.includes('mma') || norm.includes('vale')) return 'mma';
  if (norm.includes('funcional') || norm.includes('cross')) return 'funcional';
  if (norm.includes('muscula') || norm.includes('peso') || norm.includes('hipertrofia')) return 'musculacao';
  if (norm.includes('corrida') || norm.includes('run') || norm.includes('caminhada')) return 'corrida';
  if (norm.includes('cicl') || norm.includes('bike') || norm.includes('pedal')) return 'ciclismo';
  if (norm.includes('judo')) return 'judo';
  if (norm.includes('karate')) return 'karate';
  if (norm.includes('taekwondo') || norm.includes('tkd')) return 'taekwondo';
  return 'outros';
}

/**
 * Available icon styles for modalities
 */
export const MODALITY_ICON_PRESETS: Record<string, { id: string; name: string }[]> = {
  'jiu-jitsu': [
    { id: 'bjj-belt', name: 'Faixa com Nó Oficial' }
  ],
  'muay-thai': [
    { id: 'default', name: 'Chute & Luva Oficial' },
    { id: 'muay-thai-mongkhon', name: 'Mongkhon Sagrado' }
  ],
  'funcional': [
    { id: 'default', name: 'Kettlebell Oficial' }
  ],
  'boxe': [
    { id: 'default', name: 'Par de Luvas Oficial' },
    { id: 'boxe-strike', name: 'Golpe Cruzado' }
  ],
  'mma': [
    { id: 'default', name: 'Octógono Grade Oficial' },
    { id: 'mma-gloves-pair', name: 'Par Luvas 4oz MMA' }
  ]
};

/**
 * High-definition, pure white line vector SVG matching the professional aesthetic of Strava Fight
 */
export function getModalitySvgMarkup(category: ModalityCategory, variant?: string): string {
  switch (category) {
    case 'jiu-jitsu':
      // Jiu-Jitsu Tied Belt (exact match to reference image: double loop, central knot, hanging rank end)
      return `
        <svg viewBox="0 0 120 75" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <!-- Belt Loop Oval (Outer and Inner) -->
          <ellipse cx="60" cy="22" rx="48" ry="15" stroke="white" stroke-width="4.2" />
          <ellipse cx="60" cy="22" rx="40" ry="10" stroke="white" stroke-width="2" opacity="0.4" />
          
          <!-- Central Tied Knot -->
          <rect x="52" y="14" width="16" height="16" rx="4" fill="white" stroke="white" stroke-width="1" />
          <line x1="53" y1="22" x2="67" y2="22" stroke="#05070B" stroke-width="2.5" />
          
          <!-- Hanging Left End with Rank Bar -->
          <path d="M54 28 L38 58 L48 62 L60 30" fill="white" stroke="white" stroke-width="2" />
          <!-- Black Rank Bar on tip -->
          <path d="M38 58 L42 50 L52 54 L48 62 Z" fill="#05070B" stroke="#05070B" stroke-width="1" />
          <!-- White rank stripe lines -->
          <line x1="41" y1="52" x2="44" y2="54" stroke="white" stroke-width="2" />
          <line x1="43" y1="56" x2="46" y2="58" stroke="white" stroke-width="2" />
          
          <!-- Hanging Right End -->
          <path d="M66 28 L82 58 L72 62 L58 30" fill="white" stroke="white" stroke-width="2" />
        </svg>
      `;

    case 'boxe':
      if (variant === 'boxe-strike') {
        return `
          <svg viewBox="0 0 120 75" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
            <path d="M30 38 C30 20 48 16 60 26 C70 34 68 50 58 60 L44 62 C32 58 26 50 30 38 Z" stroke="white" stroke-width="3.5" />
            <path d="M40 30 C34 32 32 42 42 46" stroke="white" stroke-width="2.5" />
            <rect x="18" y="32" width="14" height="20" rx="3" stroke="white" stroke-width="2.8" />
            <line x1="20" y1="42" x2="30" y2="42" stroke="white" stroke-width="2" />
            <path d="M74 24 L84 16" stroke="white" stroke-width="3" />
            <path d="M78 40 L92 40" stroke="white" stroke-width="3.5" />
            <path d="M74 56 L84 64" stroke="white" stroke-width="3" />
          </svg>
        `;
      }
      // Official Boxe Reference: Two Boxing Gloves side by side tilted inward with cuffs and thumb pockets
      return `
        <svg viewBox="0 0 120 75" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <!-- Left Glove -->
          <g transform="translate(18, 6)">
            <path d="M22 6 C17 1 7 3 4 12 C1 20 4 30 11 36 L18 37 C23 35 26 26 25 18 C25 13 24 10 22 6 Z" stroke="white" stroke-width="3.2" />
            <path d="M10 14 C6 15 5 21 10 26" stroke="white" stroke-width="2.4" />
            <rect x="12" y="37" width="12" height="13" rx="2" stroke="white" stroke-width="2.8" />
            <line x1="13" y1="43" x2="23" y2="43" stroke="white" stroke-width="1.8" />
            <line x1="14" y1="27" x2="18" y2="29" stroke="white" stroke-width="1.6" />
          </g>

          <!-- Right Glove -->
          <g transform="translate(62, 6)">
            <path d="M18 6 C23 1 33 3 36 12 C39 20 36 30 29 36 L22 37 C17 35 14 26 15 18 C15 13 16 10 18 6 Z" stroke="white" stroke-width="3.2" />
            <path d="M30 14 C34 15 35 21 30 26" stroke="white" stroke-width="2.4" />
            <rect x="16" y="37" width="12" height="13" rx="2" stroke="white" stroke-width="2.8" />
            <line x1="17" y1="43" x2="27" y2="43" stroke="white" stroke-width="1.8" />
            <line x1="26" y1="27" x2="22" y2="29" stroke="white" stroke-width="1.6" />
          </g>
        </svg>
      `;

    case 'muay-thai':
      if (variant === 'muay-thai-mongkhon') {
        // Sacred Mongkhon Headpiece
        return `
          <svg viewBox="0 0 120 75" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
            <ellipse cx="60" cy="24" rx="34" ry="11" stroke="white" stroke-width="3.8" />
            <path d="M60 13 L60 4 L64 4 L64 13" fill="white" stroke="white" stroke-width="1.5" />
            <path d="M62 4 C72 -2 78 4 88 1" stroke="white" stroke-width="3" />
            <circle cx="88" cy="1" r="3" fill="white" />
            <path d="M38 42 C34 32 24 32 18 42 C14 50 20 60 28 64 L36 62 C40 56 42 48 38 42 Z" stroke="white" stroke-width="3" />
            <path d="M82 42 C86 32 96 32 102 42 C106 50 100 60 92 64 L84 62 C80 56 78 48 82 42 Z" stroke="white" stroke-width="3" />
          </svg>
        `;
      }
      // Official Muay Thai Reference: Nak Muay Kicking Fighter + Boxing Glove outline side by side
      return `
        <svg viewBox="0 0 120 75" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <!-- Nak Muay Kicking Fighter (standing on one leg, chambered high kick) -->
          <g transform="translate(10, 4)">
            <!-- Head -->
            <circle cx="26" cy="12" r="5" stroke="white" stroke-width="2.6" />
            <!-- Torso & High Kick Leg -->
            <path d="M26 17 L25 35 L36 32 L54 18" stroke="white" stroke-width="3.2" />
            <!-- Kicking Foot Extended -->
            <path d="M54 18 L62 14" stroke="white" stroke-width="3.8" />
            <!-- Standing Leg Planted -->
            <path d="M25 35 L23 54 L29 62" stroke="white" stroke-width="3.2" />
            <!-- Guard Arms & Gloves -->
            <path d="M26 21 L34 18 L40 25" stroke="white" stroke-width="2.6" />
            <circle cx="40" cy="25" r="2.8" fill="white" />
            <path d="M26 21 L18 25 L14 33" stroke="white" stroke-width="2.6" />
            <circle cx="14" cy="33" r="2.8" fill="white" />
          </g>

          <!-- Boxing Glove on Right -->
          <g transform="translate(68, 14)">
            <path d="M18 8 C24 2 34 3 38 12 C41 19 38 27 33 32 L27 33 C22 32 18 25 18 18 C18 14 17 12 18 8 Z" stroke="white" stroke-width="2.8" />
            <path d="M28 15 C32 16 34 21 29 26" stroke="white" stroke-width="2.2" />
            <rect x="22" y="33" width="13" height="11" rx="2" stroke="white" stroke-width="2.6" />
            <line x1="23" y1="38" x2="34" y2="38" stroke="white" stroke-width="1.8" />
            <line x1="25" y1="24" x2="29" y2="26" stroke="white" stroke-width="1.5" />
          </g>
        </svg>
      `;

    case 'mma':
      if (variant === 'mma-gloves-pair') {
        return `
          <svg viewBox="0 0 120 75" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
            <rect x="22" y="24" width="28" height="18" rx="4" stroke="white" stroke-width="3" />
            <rect x="24" y="16" width="5" height="9" rx="1.5" stroke="white" stroke-width="2" />
            <rect x="31" y="15" width="5" height="10" rx="1.5" stroke="white" stroke-width="2" />
            <rect x="38" y="15" width="5" height="10" rx="1.5" stroke="white" stroke-width="2" />
            <rect x="45" y="17" width="5" height="8" rx="1.5" stroke="white" stroke-width="2" />
            <rect x="24" y="42" width="24" height="14" rx="2" stroke="white" stroke-width="2.6" />
            <rect x="70" y="24" width="28" height="18" rx="4" stroke="white" stroke-width="3" />
            <rect x="72" y="17" width="5" height="8" rx="1.5" stroke="white" stroke-width="2" />
            <rect x="79" y="15" width="5" height="10" rx="1.5" stroke="white" stroke-width="2" />
            <rect x="86" y="15" width="5" height="10" rx="1.5" stroke="white" stroke-width="2" />
            <rect x="93" y="16" width="5" height="9" rx="1.5" stroke="white" stroke-width="2" />
            <rect x="72" y="42" width="24" height="14" rx="2" stroke="white" stroke-width="2.6" />
          </svg>
        `;
      }
      // Official MMA Reference: Octagon Cage with Wire Mesh Grid (Chain-Link Fence)
      return `
        <svg viewBox="0 0 120 75" fill="none" stroke="white" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <defs>
            <clipPath id="mma-oct-clip">
              <polygon points="46,8 74,8 96,25 96,50 74,67 46,67 24,50 24,25" />
            </clipPath>
          </defs>

          <!-- Chain-Link Cage Mesh Grid inside Octagon -->
          <g clip-path="url(#mma-oct-clip)" opacity="0.85">
            <!-- Vertical Wires -->
            <line x1="30" y1="4" x2="30" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="36" y1="4" x2="36" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="42" y1="4" x2="42" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="48" y1="4" x2="48" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="54" y1="4" x2="54" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="60" y1="4" x2="60" y2="72" stroke="white" stroke-width="1.6" />
            <line x1="66" y1="4" x2="66" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="72" y1="4" x2="72" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="78" y1="4" x2="78" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="84" y1="4" x2="84" y2="72" stroke="white" stroke-width="1.4" />
            <line x1="90" y1="4" x2="90" y2="72" stroke="white" stroke-width="1.4" />

            <!-- Horizontal Wires -->
            <line x1="20" y1="16" x2="100" y2="16" stroke="white" stroke-width="1.4" />
            <line x1="20" y1="23" x2="100" y2="23" stroke="white" stroke-width="1.4" />
            <line x1="20" y1="30" x2="100" y2="30" stroke="white" stroke-width="1.4" />
            <line x1="20" y1="37" x2="100" y2="37" stroke="white" stroke-width="1.6" />
            <line x1="20" y1="44" x2="100" y2="44" stroke="white" stroke-width="1.4" />
            <line x1="20" y1="51" x2="100" y2="51" stroke="white" stroke-width="1.4" />
            <line x1="20" y1="58" x2="100" y2="58" stroke="white" stroke-width="1.4" />
          </g>

          <!-- Heavy Outer Octagon Cage Frame -->
          <polygon points="46,8 74,8 96,25 96,50 74,67 46,67 24,50 24,25" stroke="white" stroke-width="3.6" fill="none" />
        </svg>
      `;

    case 'funcional':
      // Official Kettlebell Reference: Clean contoured cast iron bell with ergonomic handle
      return `
        <svg viewBox="0 0 120 75" fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <!-- Handle Outer Arc -->
          <path d="M44 30 C44 14 76 14 76 30" stroke="white" stroke-width="3.6" fill="none" />
          <!-- Handle Inner Arc -->
          <path d="M51 30 C51 21 69 21 69 30" stroke="white" stroke-width="2.6" fill="none" />
          <!-- Bell Body Contour -->
          <path d="M44 30 C34 35 34 58 46 65 L74 65 C86 58 86 35 76 30 Z" stroke="white" stroke-width="3.6" fill="none" />
          <!-- Flat Resting Base -->
          <line x1="46" y1="65" x2="74" y2="65" stroke="white" stroke-width="3.6" />
        </svg>
      `;

    case 'musculacao':
      // Olympic Dumbbell with Calibrated Weight Plates
      return `
        <svg viewBox="0 0 120 85" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <!-- Steel Knurled Center Bar -->
          <rect x="42" y="39" width="36" height="8" rx="2" fill="white" stroke="white" stroke-width="1" />
          <line x1="50" y1="41" x2="50" y2="45" stroke="#05070B" stroke-width="1.5" />
          <line x1="55" y1="41" x2="55" y2="45" stroke="#05070B" stroke-width="1.5" />
          <line x1="60" y1="41" x2="60" y2="45" stroke="#05070B" stroke-width="1.5" />
          <line x1="65" y1="41" x2="65" y2="45" stroke="#05070B" stroke-width="1.5" />
          <line x1="70" y1="41" x2="70" y2="45" stroke="#05070B" stroke-width="1.5" />
          <!-- Left Plates -->
          <rect x="32" y="20" width="10" height="46" rx="3.5" stroke="white" stroke-width="3.5" />
          <rect x="20" y="26" width="10" height="34" rx="3" stroke="white" stroke-width="3.5" />
          <rect x="11" y="32" width="7" height="22" rx="2" stroke="white" stroke-width="2.5" />
          <!-- Right Plates -->
          <rect x="78" y="20" width="10" height="46" rx="3.5" stroke="white" stroke-width="3.5" />
          <rect x="90" y="26" width="10" height="34" rx="3" stroke="white" stroke-width="3.5" />
          <rect x="102" y="32" width="7" height="22" rx="2" stroke="white" stroke-width="2.5" />
        </svg>
      `;

    case 'judo':
      // Judogi Crossed Lapels & Obi Belt
      return `
        <svg viewBox="0 0 120 85" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <path d="M40 18 L60 52 L80 18" stroke="white" stroke-width="4.5" />
          <path d="M30 24 L60 62 L90 24" stroke="white" stroke-width="2.5" opacity="0.6" />
          <rect x="44" y="52" width="32" height="12" rx="3" fill="white" />
          <path d="M52 64 L42 80 L50 82 L60 64" fill="white" stroke="white" stroke-width="2" />
          <path d="M68 64 L78 80 L70 82 L60 64" fill="white" stroke="white" stroke-width="2" />
        </svg>
      `;

    case 'karate':
      // Karate Clenched Fist (Seiken) with Belt
      return `
        <svg viewBox="0 0 120 85" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <rect x="42" y="24" width="36" height="26" rx="6" stroke="white" stroke-width="3.8" fill="none" />
          <line x1="51" y1="24" x2="51" y2="40" stroke="white" stroke-width="2.5" />
          <line x1="60" y1="24" x2="60" y2="40" stroke="white" stroke-width="2.5" />
          <line x1="69" y1="24" x2="69" y2="40" stroke="white" stroke-width="2.5" />
          <path d="M40 42 C40 50 54 50 64 48" stroke="white" stroke-width="3" />
          <rect x="44" y="50" width="32" height="16" rx="2" stroke="white" stroke-width="3.2" />
          <line x1="44" y1="58" x2="76" y2="58" stroke="white" stroke-width="2" />
        </svg>
      `;

    case 'taekwondo':
      // Taekwondo Flying Kick
      return `
        <svg viewBox="0 0 120 85" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <circle cx="36" cy="22" r="7" stroke="white" stroke-width="3.5" />
          <path d="M38 29 L50 45 L74 36 L102 24" stroke="white" stroke-width="4.2" />
          <path d="M102 24 L112 20" stroke="white" stroke-width="5" />
          <path d="M50 45 L42 66 L34 76" stroke="white" stroke-width="3.8" />
          <path d="M44 34 L62 30 L70 38" stroke="white" stroke-width="3" />
          <path d="M44 34 L32 38 L24 48" stroke="white" stroke-width="3" />
        </svg>
      `;

    case 'corrida':
      // Speed Runner Track
      return `
        <svg viewBox="0 0 120 85" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <circle cx="68" cy="18" r="7" stroke="white" stroke-width="3.5" />
          <path d="M62 26 L52 46" stroke="white" stroke-width="4" />
          <path d="M52 46 L70 54 L82 72" stroke="white" stroke-width="4.2" />
          <path d="M52 46 L34 52 L20 48" stroke="white" stroke-width="4.2" />
          <path d="M58 32 L44 36 L34 26" stroke="white" stroke-width="3.5" />
          <path d="M58 32 L76 34 L88 46" stroke="white" stroke-width="3.5" />
          <line x1="16" y1="28" x2="30" y2="28" stroke="white" stroke-width="2.5" />
          <line x1="12" y1="36" x2="24" y2="36" stroke="white" stroke-width="2.5" />
        </svg>
      `;

    case 'ciclismo':
      // Aerodynamic Bicycle
      return `
        <svg viewBox="0 0 120 85" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <circle cx="32" cy="50" r="18" stroke="white" stroke-width="3.5" />
          <circle cx="88" cy="50" r="18" stroke="white" stroke-width="3.5" />
          <polygon points="32,50 60,50 78,28 50,28" stroke="white" stroke-width="3.5" />
          <line x1="60" y1="50" x2="48" y2="22" stroke="white" stroke-width="3.5" />
          <path d="M78 28 L82 18 L90 18" stroke="white" stroke-width="3.5" />
          <path d="M42 22 L54 22" stroke="white" stroke-width="4" />
        </svg>
      `;

    default:
      // Crossed Combat Strike Swords/Symbol
      return `
        <svg viewBox="0 0 100 80" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
          <circle cx="50" cy="40" r="26" stroke="white" stroke-width="3.5" />
          <path d="M38 28 L62 52" stroke="white" stroke-width="3.5" />
          <path d="M62 28 L38 52" stroke="white" stroke-width="3.5" />
          <circle cx="50" cy="40" r="7" fill="white" />
        </svg>
      `;
  }
}

/**
 * EXACT REPLICA OF THE STRAVA FIGHT STORY REFERENCE IMAGE:
 * - Exercício (label)
 * - Jiu-Jitsu / Boxe / Muay Thai / MMA (prominent bold)
 * - Duração (label)
 * - 1h 15min (prominent bold)
 * - Calorias (label)
 * - 720 kcal (prominent bold)
 * - [White Belt / Gloves / MMA 4oz Icon] positioned in lower third
 * - STRAVA FIGHT (at the bottom)
 */
export const OfficialFilterOverlay: React.FC<{
  data: OfficialFilterData;
  className?: string;
}> = ({
  data,
  className = ''
}) => {
  const { 
    modality = 'Jiu-Jitsu', 
    durationFormatted = '1h 15min', 
    calories = 720,
    positionOffset = 0,
    scaleMultiplier = 1.0,
    iconVariant
  } = data;

  const iconKey = getModalityIconKey(modality);
  const svgMarkup = getModalitySvgMarkup(iconKey, iconVariant);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none flex flex-col justify-between items-center select-none z-20 px-6 py-10 sm:py-12 ${className}`}
      style={{ 
        fontFamily: "'Montserrat', sans-serif",
        transform: `translateY(${positionOffset}%) scale(${scaleMultiplier})`,
        transformOrigin: 'center center'
      }}
    >
      {/* Soft Vignette for 100% legibility on any photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/60 pointer-events-none -z-10" />

      {/* UPPER-TO-MIDDLE SECTION: The 3 Core Metrics */}
      <div className="flex flex-col items-center text-center w-full pt-4 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* 1. EXERCÍCIO + MODALIDADE */}
        <div className="flex flex-col items-center leading-none">
          <span 
            className="text-white font-semibold text-sm sm:text-base tracking-wide mb-1 opacity-95"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95)' }}
          >
            Exercício
          </span>
          <h1 
            className="text-white font-extrabold tracking-tight text-3xl sm:text-5xl"
            style={{ textShadow: '0 4px 16px rgba(0,0,0,0.95), 0 0 25px rgba(0,0,0,0.6)' }}
          >
            {modality}
          </h1>
        </div>

        {/* 2. DURAÇÃO + TEMPO TOTAL */}
        <div className="flex flex-col items-center leading-none">
          <span 
            className="text-white font-semibold text-sm sm:text-base tracking-wide mb-1 opacity-95"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95)' }}
          >
            Duração
          </span>
          <div 
            className="text-white font-black tracking-tight text-4xl sm:text-6xl"
            style={{ textShadow: '0 4px 18px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.65)' }}
          >
            {durationFormatted}
          </div>
        </div>

        {/* 3. CALORIAS + GASTO CALÓRICO */}
        <div className="flex flex-col items-center leading-none">
          <span 
            className="text-white font-semibold text-sm sm:text-base tracking-wide mb-1 opacity-95"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95)' }}
          >
            Calorias
          </span>
          <div 
            className="text-white font-black tracking-tight text-4xl sm:text-6xl"
            style={{ textShadow: '0 4px 18px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.65)' }}
          >
            {calories} kcal
          </div>
        </div>

      </div>

      {/* LOWER SECTION: White Vector Element + STRAVA FIGHT */}
      <div className="flex flex-col items-center text-center w-full pb-2 sm:pb-4 space-y-4 sm:space-y-6">
        
        {/* High-Definition Vector Icon Element */}
        <div 
          className="w-28 h-18 sm:w-36 sm:h-22 flex items-center justify-center filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />

        {/* STRAVA FIGHT */}
        <div 
          className="text-white font-black tracking-[0.16em] text-2xl sm:text-3xl uppercase"
          style={{ textShadow: '0 3px 14px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.7)' }}
        >
          STRAVA FIGHT
        </div>

      </div>
    </div>
  );
};

/**
 * High-Resolution 1080p Canvas Generator
 */
export async function generateOfficialFilterImage(options: {
  imageSrc: string;
  modality: string;
  durationFormatted: string;
  calories: number;
  aspectRatio: '9:16' | '4:5' | '1:1';
  positionOffset?: number;
  iconVariant?: string;
}): Promise<string> {
  const { 
    imageSrc, 
    modality = 'Jiu-Jitsu', 
    durationFormatted = '1h 15min', 
    calories = 720, 
    aspectRatio = '9:16',
    positionOffset = 0,
    iconVariant
  } = options;

  let width = 1080;
  let height = 1920;
  if (aspectRatio === '4:5') {
    width = 1080;
    height = 1350;
  } else if (aspectRatio === '1:1') {
    width = 1080;
    height = 1080;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Load User Photo
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });

  // Calculate cover crop
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = width / height;
  let renderWidth = width;
  let renderHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > targetRatio) {
    renderHeight = height;
    renderWidth = height * imgRatio;
    offsetX = (width - renderWidth) / 2;
  } else {
    renderWidth = width;
    renderHeight = width / imgRatio;
    offsetY = (height - renderHeight) / 2;
  }

  // Draw background photo (full bleed, clear and crisp)
  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);

  // Soft darkening gradient overlay for high contrast
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
  grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.18)');
  grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Pre-load icon image
  const iconKey = getModalityIconKey(modality);
  const rawSvg = getModalitySvgMarkup(iconKey, iconVariant);
  const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rawSvg);
  const iconImg = new Image();
  await new Promise<void>((resolve) => {
    iconImg.onload = () => resolve();
    iconImg.onerror = () => resolve();
    iconImg.src = svgDataUrl;
  });

  // Setup text styles & drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const yShift = (positionOffset / 100) * height;

  // 1. EXERCÍCIO
  ctx.font = '600 36px "Montserrat", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('Exercício', width / 2, height * 0.13 + yShift);

  ctx.font = '800 84px "Montserrat", sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(modality, width / 2, height * 0.19 + yShift);

  // 2. DURAÇÃO
  ctx.font = '600 36px "Montserrat", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('Duração', width / 2, height * 0.28 + yShift);

  ctx.font = '900 96px "Montserrat", sans-serif';
  ctx.letterSpacing = '-1px';
  ctx.fillText(durationFormatted, width / 2, height * 0.35 + yShift);

  // 3. CALORIAS
  ctx.font = '600 36px "Montserrat", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('Calorias', width / 2, height * 0.44 + yShift);

  ctx.font = '900 96px "Montserrat", sans-serif';
  ctx.letterSpacing = '-1px';
  ctx.fillText(`${calories} kcal`, width / 2, height * 0.51 + yShift);

  // 4. HIGH-DEF ICON ELEMENT
  const iconWidth = 260;
  const iconHeight = 160;
  ctx.drawImage(
    iconImg,
    width / 2 - iconWidth / 2,
    height * 0.72 + yShift,
    iconWidth,
    iconHeight
  );

  // 5. STRAVA FIGHT BRANDING
  ctx.font = '900 56px "Montserrat", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('STRAVA FIGHT', width / 2, height * 0.88 + yShift);

  ctx.restore();

  return canvas.toDataURL('image/png', 0.98);
}
