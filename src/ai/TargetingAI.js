/**
 * ╔══════════════════════════════════════════╗
 * ║  TargetingAI - El Ojo del Depredador      ║
 * ╚══════════════════════════════════════════╝
 *
 * Each unit type sees the battlefield differently.
 * Infantry clashes with infantry. Archers hunt the dangerous.
 * Cavalry charges the nearest. Mages seek the clustered.
 */

/**
 * Choose target based on unit type and available enemies
 */
function chooseTarget(unit, enemies) {
  if (!unit || !enemies || enemies.length === 0) return null;

  const alive = enemies.filter((e) => e.isAlive());
  if (alive.length === 0) return null;

  switch (unit.type) {
    case 'Infantry':
      // Infantry duels other infantry, or picks weakest
      const infantry = alive.filter((e) => e.type === 'Infantry');
      return infantry.length > 0 ? getNearest(unit, infantry) : getNearest(unit, alive);

    case 'Archer':
      // Archers prioritize highest-damage threats
      return alive.reduce((best, e) => (e.damage > best.damage ? e : best));

    case 'Cavalry':
      // Cavalry charges the nearest — blind rage
      return getNearest(unit, alive);

    case 'Mage':
      // Mages target highest combined threat (damage + speed)
      return alive.reduce((best, e) => {
        const eThreat = e.damage + e.speed;
        const bThreat = best.damage + best.speed;
        return eThreat > bThreat ? e : best;
      });

    case 'Undead':
    default:
      return getNearest(unit, alive);
  }
}

/**
 * Get nearest entity by Euclidean distance
 */
function getNearest(unit, targets) {
  if (!targets || targets.length === 0) return null;

  return targets.reduce((nearest, t) => {
    return distance(unit, t) < distance(unit, nearest) ? t : nearest;
  });
}

/**
 * Euclidean distance (handles undefined x/y gracefully)
 */
function distance(a, b) {
  const ax = a.x || 0;
  const ay = a.y || 0;
  const bx = b.x || 0;
  const by = b.y || 0;
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if unit can reach target (within range)
 */
function isInRange(unit, target) {
  if (!unit || !target) return false;
  return distance(unit, target) <= (unit.range || 1);
}

/**
 * Get all enemies within attack range
 */
function getEnemiesInRange(unit, enemies) {
  return enemies.filter((e) => isInRange(unit, e) && e.isAlive());
}

/**
 * Get nearby allies within radius
 * FIX: operator precedence bug — was `!ally.hp > 0` (always false)
 */
function getNearbyAllies(unit, allies, radius = 10) {
  return allies.filter((ally) => {
    if (ally.id === unit.id || ally.hp <= 0) return false;
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
