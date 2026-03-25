/**
 * ╔══════════════════════════════════════════╗
 * ║  Constants - Las Leyes del Inframundo     ║
 * ╚══════════════════════════════════════════╝
 *
 * Immutable laws that govern the realm of the damned.
 * Change these at your peril — the balance of death is fragile.
 */

const CONSTANTS = {
  // ═══ GAME LOOP ═══
  TICK_RATE_MS: 60,

  // ═══ STRESS — La Presión del Mando ═══
  STRESS_MAX: 100,
  STRESS_INITIAL: 0,
  STRESS_GAME_OVER_THRESHOLD: 100,
  STRESS_PER_NEW_BATTLE: 2,
  STRESS_PER_BASE_BREACH: 5,
  STRESS_PER_BATTLE_LOST: 10,
  STRESS_RELIEF_PER_WAVE: 5,
  STRESS_RELIEF_PER_VICTORY: 15,
  STRESS_PER_UNANSWERED_TICK: 1,   // Every 3s unanswered
  STRESS_UNANSWERED_INTERVAL_MS: 3000,

  // ═══ ECONOMY — El Oro Maldito ═══
  GOLD_INITIAL: 500,
  GOLD_PER_SECOND: 0.5,
  GOLD_MAX: 2000,

  // ═══ COMMANDER — Los Generales Caídos ═══
  COMMANDER_INITIAL_HEALTH: 60,
  COMMANDER_INITIAL_MORALE: 70,
  COMMANDER_INITIAL_LEADERSHIP: 50,

  // ═══ UNIT TYPES — Las Legiones ═══
  UNIT_TYPES: {
    INFANTRY: 'Infantry',
    ARCHER: 'Archer',
    CAVALRY: 'Cavalry',
    MAGE: 'Mage',
    UNDEAD: 'Undead',
  },

  UNIT_SYMBOLS: {
    Infantry: '[I]',
    Archer: '[A]',
    Cavalry: '[C]',
    Mage: '[M]',
    Undead: '[U]',
  },

  UNIT_BASE_STATS: {
    Infantry: { hp: 10, damage: 3, speed: 2, range: 2 },
    Archer:   { hp: 5,  damage: 8, speed: 4, range: 6 },
    Cavalry:  { hp: 12, damage: 5, speed: 5, range: 2 },
    Mage:     { hp: 3,  damage: 12, speed: 2, range: 7 },
    Undead:   { hp: 15, damage: 4, speed: 1, range: 2 },
  },

  UNIT_COST_MULTIPLIER: 15,

  // ═══ TRAITS — Marcas del Destino ═══
  TRAITS: [
    'Estratega',    // +30% positioning
    'Brutal',       // +20% damage
    'Obstinado',    // Ignores bad orders
    'Asustadizo',   // Morale drops fast
    'Maldito',      // Buffs from negative/sarcasm
    'Leal',         // Responds well to positive motivation
    'Temerario',    // Charges without fear
    'Cauteloso',    // Careful positioning
    'Vengativo',    // Extra damage when losing
    'Noble',        // Morale buff to all units
  ],

  // ═══ BATTLE MAP — El Campo de los Caídos ═══
  BATTLE_MAP_WIDTH: 50,
  BATTLE_MAP_HEIGHT: 12,
  BATTLE_BASE_PROGRESS: 100,

  // ═══ SHOP — El Mercader de Almas ═══
  SHOP_STOCK_SIZE: 5,
  INVENTORY_MAX_SIZE: 20,

  // ═══ BATTLE SPAWNING — Las Puertas del Abismo ═══
  BATTLE_SPAWN_INITIAL_DELAY_MS: 8000,
  BATTLE_SPAWN_MIN_INTERVAL_MS: 3000,
  BATTLE_SPAWN_MAX_INTERVAL_MS: 8000,
  BATTLE_MAX_CONCURRENT: 5,
  BATTLE_WAVES_PER_BATTLE: 10,
  BATTLE_WAVE_COOLDOWN_MS: 3000,

  // ═══ DIFFICULTY — La Escalada del Horror ═══
  DIFFICULTY_HP_SCALE_PER_WAVE: 0.05,
  DIFFICULTY_DMG_SCALE_PER_WAVE: 0.03,
  DIFFICULTY_MULTIPLIER_STEP: 0.1,
  DIFFICULTY_STEP_EVERY_N_WAVES: 5,

  // ═══ UI — La Interfaz del Tormento ═══
  UI: {
    MIN_WIDTH: 80,
    MIN_HEIGHT: 24,
    BORDER_STYLE: 'line',
    PADDING: 1,
  },

  // ═══ COLORS — Paleta de la Oscuridad ═══
  COLORS: {
    primary: 'cyan',
    secondary: 'magenta',
    accent: 'white',
    warning: 'yellow',
    danger: 'red',
    success: 'green',
    muted: 'gray',
    lore: 'magenta',
  },
};

module.exports = CONSTANTS;
