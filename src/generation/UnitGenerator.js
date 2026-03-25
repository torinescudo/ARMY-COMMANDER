/**
 * Procedural unit generation
 */

const { nanoid } = require('nanoid');
const Constants = require('../utils/Constants');
const Random = require('../utils/Random');
const NameGenerator = require('./NameGenerator');
const Unit = require('../core/Unit');

/**
 * Generate a single random unit
 */
function generateUnit() {
  const id = nanoid();
  const type = Random.pickRandom(Object.values(Constants.UNIT_TYPES));
  const name = NameGenerator.generateUnitName();

  // Get base stats for type
  const baseStats = Constants.UNIT_BASE_STATS[type];

  // Apply ±20% variance
  const hp = Random.applyVariance(baseStats.hp, 20);
  const damage = Random.applyVariance(baseStats.damage, 20);
  const speed = Random.applyVariance(baseStats.speed, 20);
  const range = Random.applyVariance(baseStats.range, 20);

  // Calculate cost based on total stats
  const totalStats = hp + damage + speed + range;
  const cost = Math.round(totalStats * Constants.UNIT_COST_MULTIPLIER);

  // Pick a random trait (for future expansion)
  const trait = Constants.TRAITS[Random.randomRange(0, Constants.TRAITS.length - 1)];

  // Get symbol for unit type
  const symbol = Constants.UNIT_SYMBOLS[type] || '[?]';

  const unitData = {
    id,
    name,
    type,
    hp,
    damage,
    speed,
    range,
    trait,
    cost,
    symbol,
  };

  return new Unit(unitData);
}

/**
 * Generate multiple random units
 */
function generateUnits(count) {
  const units = [];
  for (let i = 0; i < count; i++) {
    units.push(generateUnit());
  }
  return units;
}

module.exports = {
  generateUnit,
  generateUnits,
};
