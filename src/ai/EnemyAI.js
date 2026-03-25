/**
 * Enemy AI - handles enemy movement and targeting
 */

const TargetingAI = require('./TargetingAI');

/**
 * Update enemy behavior (movement, targeting)
 */
function updateEnemyBehavior(enemies, friendlyUnits, deltaTime) {
  enemies.forEach((enemy) => {
    if (!enemy.isAlive()) return;

    // Move toward base (handled in Battle.update)
    // This is for tactical positioning within the map

    // Choose target and move toward it
    const target = chooseTarget(enemy, friendlyUnits);
    if (target && TargetingAI.isInRange(enemy, target)) {
      // Attack handled by Battle
    } else if (target) {
      // Move closer to target
      moveToward(enemy, target, deltaTime);
    }
  });
}

/**
 * Enemy targeting: focus on closest threat or highest damage unit
 */
function chooseTarget(enemy, friendlyUnits) {
  if (!friendlyUnits || friendlyUnits.length === 0) {
    return null;
  }

  const alive = friendlyUnits.filter((u) => u.hp > 0);
  if (alive.length === 0) return null;

  // Archers target highest damage dealers
  if (enemy.type === 'Archer') {
    return alive.reduce((target, unit) => {
      return unit.damage > target.damage ? unit : target;
    });
  }

  // Most enemies target nearest
  return TargetingAI.getNearest(enemy, alive);
}

/**
 * Move enemy toward target unit
 */
function moveToward(enemy, target, deltaTime) {
  const speed = (enemy.speed * deltaTime) / 1000;

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0 && distance > enemy.range) {
    const moveDistance = Math.min(speed, distance);
    enemy.x += (dx / distance) * moveDistance;
    enemy.y += (dy / distance) * moveDistance;
  }
}

/**
 * Get enemy formation position (loose grouping)
 */
function getFormationPosition(enemyIndex, groupSize) {
  const row = Math.floor(enemyIndex / 5);
  const col = enemyIndex % 5;

  return {
    x: col * 12,
    y: row * 3,
  };
}

module.exports = {
  updateEnemyBehavior,
  chooseTarget,
  moveToward,
  getFormationPosition,
};
