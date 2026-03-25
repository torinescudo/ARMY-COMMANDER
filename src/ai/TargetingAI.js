/**
 * Type-aware targeting AI for units
 * Units choose targets based on their type and enemy composition
 */

/**
 * Choose target based on unit type and available enemies
 * Infantry: targets nearest Infantry or weak units
 * Archer: targets highest-damage enemies first
 * Cavalry: charges closest enemies
 * Mage: focuses on groups/high-threat
 * Undead: targets anything (no preference)
 */
function chooseTarget(unit, enemies) {
  if (!unit || !enemies || enemies.length === 0) {
    return null;
  }

  const alive = enemies.filter((e) => e.isAlive());
  if (alive.length === 0) return null;

  switch (unit.type) {
    case 'Infantry':
      // Infantry targets other infantry or lowest range enemies
      const infantry = alive.filter((e) => e.type === 'Infantry');
      if (infantry.length > 0) {
        return getNearest(unit, infantry);
      }
      // Fallback to nearest
      return getNearest(unit, alive);

    case 'Archer':
      // Archers target highest damage enemies (threat priority)
      return alive.reduce((target, enemy) => {
        return enemy.damage > target.damage ? enemy : target;
      });

    case 'Cavalry':
      // Cavalry targets nearest enemy (charge)
      return getNearest(unit, alive);

    case 'Mage':
      // Mages target enemies in groups or highest threat
      return alive.reduce((target, enemy) => {
        const threatScore = enemy.damage + getNearest(unit, alive).speed;
        const currentThreat = target.damage + target.speed;
        return threatScore > currentThreat ? enemy : target;
      });

    case 'Undead':
    default:
      // No preference, just nearest
      return getNearest(unit, alive);
  }
}

/**
 * Get nearest enemy to unit
 */
function getNearest(unit, enemies) {
  if (!enemies || enemies.length === 0) return null;

  return enemies.reduce((nearest, enemy) => {
    const currentDist = distance(unit, nearest);
    const newDist = distance(unit, enemy);
    return newDist < currentDist ? enemy : nearest;
  });
}

/**
 * Calculate distance between two units
 */
function distance(unit1, unit2) {
  const dx = unit1.x - unit2.x;
  const dy = unit1.y - unit2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if unit can reach target
 */
function isInRange(unit, target) {
  if (!unit || !target) return false;
  const dist = distance(unit, target);
  return dist <= unit.range;
}

/**
 * Get all enemies in range
 */
function getEnemiesInRange(unit, enemies) {
  return enemies.filter((e) => isInRange(unit, e) && e.isAlive());
}

/**
 * Get nearby allies (for coordination)
 */
function getNearbyAllies(unit, allies, radius = 10) {
  return allies.filter((ally) => {
    if (ally.id === unit.id || !ally.hp > 0) return false;
    return distance(unit, ally) <= radius;
  });
}

module.exports = {
  chooseTarget,
  getNearest,
  distance,
  isInRange,
  getEnemiesInRange,
  getNearbyAllies,
};
