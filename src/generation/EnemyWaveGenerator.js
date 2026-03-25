/**
 * ╔═══════════════════════════════════════════════╗
 * ║  EnemyWaveGenerator - El Forjador de Oleadas   ║
 * ╚═══════════════════════════════════════════════╝
 *
 * From the darkness they come. Each wave darker,
 * more numerous, more relentless than the last.
 */

const { nanoid } = require('nanoid');
const Constants = require('../utils/Constants');
const Random = require('../utils/Random');
const Enemy = require('../core/Enemy');

// Enemy archetypes — the faces of death
const ENEMY_TEMPLATES = {
  Infantry: { hp: 8,  damage: 2, speed: 1.5, range: 2, symbol: '@' },
  Archer:   { hp: 4,  damage: 6, speed: 3,   range: 5, symbol: '~' },
  Cavalry:  { hp: 10, damage: 4, speed: 4,   range: 2, symbol: '●' },
};

const ENEMY_ADJECTIVES = [
  'Gótico', 'Abismal', 'Torturado', 'Maligno', 'Funesto',
  'Tenebroso', 'Profano', 'Condenado', 'Sangriento', 'Aullante',
];

/**
 * Generate a single enemy of a specific type
 */
function generateEnemy(type, waveNumber) {
  const template = ENEMY_TEMPLATES[type];
  if (!template) return null;

  const id = nanoid();
  const adjective = Random.pickRandom(ENEMY_ADJECTIVES);
  const name = `${type} ${adjective}`;

  // Difficulty scales with wave
  const scale = 1 + waveNumber * Constants.DIFFICULTY_HP_SCALE_PER_WAVE;
  const dmgScale = 1 + waveNumber * Constants.DIFFICULTY_DMG_SCALE_PER_WAVE;

  return new Enemy({
    id,
    name,
    type,
    hp: Math.round(template.hp * scale),
    damage: Math.round(template.damage * dmgScale),
    speed: template.speed,
    range: template.range,
    symbol: template.symbol,
    x: 0, // Will be set by Battle.startWave()
    y: 0,
    progress: 0,
  });
}

/**
 * Generate a complete wave — the composition of the damned
 */
function generateWave(waveNumber) {
  const enemies = [];

  // Composition scales with wave number
  const infantryCount = Math.floor(3 + waveNumber * 0.5);
  const archerCount = Math.floor(1 + waveNumber * 0.3);
  const cavalryCount = Math.floor(waveNumber * 0.15);

  for (let i = 0; i < infantryCount; i++) {
    enemies.push(generateEnemy('Infantry', waveNumber));
  }
  for (let i = 0; i < archerCount; i++) {
    enemies.push(generateEnemy('Archer', waveNumber));
  }
  for (let i = 0; i < cavalryCount; i++) {
    enemies.push(generateEnemy('Cavalry', waveNumber));
  }

  return enemies.filter(Boolean);
}

module.exports = {
  generateWave,
  generateEnemy,
  ENEMY_TEMPLATES,
};
