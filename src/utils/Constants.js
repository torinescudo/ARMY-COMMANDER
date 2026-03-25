/**
 * Game constants and configuration
 */

const CONSTANTS = {
  // Game loop
  TICK_RATE_MS: 60,
  TARGET_FPS: 16.6,

  // Stress system
  STRESS_MAX: 100,
  STRESS_INITIAL: 0,
  STRESS_GAME_OVER_THRESHOLD: 100,

  // Shop/Economy
  GOLD_INITIAL: 500,
  GOLD_PER_SECOND: 0.5,
  GOLD_MAX_REGEN: 1000,

  // Commander
  COMMANDER_INITIAL_HEALTH: 60,
  COMMANDER_INITIAL_MORALE: 70,
  COMMANDER_INITIAL_LEADERSHIP: 50,

  // Unit types
  UNIT_TYPES: {
    INFANTRY: 'Infantry',
    ARCHER: 'Archer',
    CAVALRY: 'Cavalry',
    MAGE: 'Mage',
    UNDEAD: 'Undead',
  },

  // Unit symbols
  UNIT_SYMBOLS: {
    Infantry: '[I]',
    Archer: '[A]',
    Cavalry: '[C]',
    Mage: '[M]',
    Undead: '[U]',
  },

  // Base unit stats
  UNIT_BASE_STATS: {
    Infantry: { hp: 10, damage: 3, speed: 2, range: 1 },
    Archer: { hp: 5, damage: 8, speed: 4, range: 5 },
    Cavalry: { hp: 12, damage: 5, speed: 5, range: 1 },
    Mage: { hp: 3, damage: 12, speed: 2, range: 6 },
    Undead: { hp: 15, damage: 4, speed: 1, range: 1 },
  },

  // Unit costs (base)
  UNIT_COST_MULTIPLIER: 15,

  // Commander traits
  TRAITS: [
    'Estratega',
    'Brutal',
    'Obstinado',
    'Asustadizo',
    'Maldito',
    'Leal',
    'Temerario',
    'Cauteloso',
    'Vengativo',
    'Noble',
  ],

  // Terminal colors (chalk style)
  COLORS: {
    primary: 'cyan',
    secondary: 'magenta',
    accent: 'white',
    warning: 'red',
    success: 'green',
    danger: 'yellow',
  },

  // UI constants
  UI: {
    MIN_WIDTH: 80,
    MIN_HEIGHT: 24,
    BORDER_STYLE: 'line',
    PADDING: 1,
  },

  // Shop
  SHOP_STOCK_SIZE: 5,
  SHOP_MAX_INVENTORY: 20,

  // Inventory
  INVENTORY_MAX_SIZE: 20,

  // UI Dimensions (relative to screen)
  PANELS: {
    HEADER_HEIGHT: 3,
    COMMANDER_WIDTH: 30,
    COMMANDER_HEIGHT: 12,
    SHOP_WIDTH: 35,
    SHOP_HEIGHT: 14,
    INVENTORY_HEIGHT: 8,
    FOOTER_HEIGHT: 3,
  },
};

module.exports = CONSTANTS;
