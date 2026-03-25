/**
 * Procedural enemy wave generation
 */

const { nanoid } = require('nanoid');
const Constants = require('../utils/Constants');
const Random = require('../utils/Random');
const Enemy = require('../core/Enemy');

// Enemy unit templates
const ENEMY_TYPES = {
  Infantry: { hp: 8, damage: 2, speed: 1.5, range: 1, symbol: '@' },
  Archer: { hp: 4, damage: 6, speed: 3, range: 4, symbol: '~' },
  Cavalry: { hp: 10, damage: 4, speed: 4, range: 1, symbol: '●' },
};

const ENEMY_ADJECTIVES = [
  'Gótico',
  'Abismal',
  'Torturado',
  'Maligno',
  'Funesto',
  'Tenebroso',
  'Profano',
  'Condenado',
];

/**
 * Generate a random enemy name
 */
function generateEnemyName() {
  const types = Object.keys(ENEMY_TYPES);
  const type = Random.pickRandom(types);
  const adjective = Random.pickRandom(ENEMY_ADJECTIVES);
  return `${type} ${adjective}`;
}

/**
 * Generate a single enemy
 */
function generateSingleEnemy(waveNumber) {
  const id = nanoid();
  const types = Object.keys(ENEMY_TYPES);
  const type = Random.pickRandom(types);
  const baseStats = ENEMY_TYPES[type];

  // Wave scaling: difficulty increases +5% per wave
  const difficultyMultiplier = 1 + (waveNumber * 0.05);

  const hp = Math.round(baseStats.hp * difficultyMultiplier);
  const damage = Math.round(baseStats.damage * difficultyMultiplier);
  const speed = baseStats.speed; // Don't scale speed too much
  const range = baseStats.range;

  const name = generateEnemyName();
  const symbol = baseStats.symbol;

  return new Enemy({
    id,
    name,
    type,
    hp,
    damage,
    speed,
    range,
    symbol,
    x: Math.floor(Math.random() * 60),
    y: 0,
    progress: 0,
  });
}

/**
 * Generate a complete wave of enemies
 * Composition scales with wave number
 */
function generateWave(waveNumber) {
  const enemies = [];

  // Base composition: more infantry, some archers/cavalry
  const infantryCount = Math.floor(3 + waveNumber * 0.5); // 3-8 by wave 10
  const archerCount = Math.floor(1 + waveNumber * 0.3); // 1-4 by wave 10
  const cavalryCount = Math.floor(0 + waveNumber * 0.1); // 0-1 by wave 10

  // Generate infantry
  for (let i = 0; i < infantryCount; i++) {
    const enemy = generateSingleEnemy(waveNumber);
    enemy.type = 'Infantry';
    enemies.push(enemy);
  }

  // Generate archers
  for (let i = 0; i < archerCount; i++) {
    const enemy = generateSingleEnemy(waveNumber);
    enemy.type = 'Archer';
    enemies.push(enemy);
  }

  // Generate cavalry
  for (let i = 0; i < cavalryCount; i++) {
    const enemy = generateSingleEnemy(waveNumber);
    enemy.type = 'Cavalry';
    enemies.push(enemy);
  }

  return enemies;
}

module.exports = {
  generateWave,
  generateSingleEnemy,
  generateEnemyName,
  ENEMY_TYPES,
};
