/**
 * Commander AI - handles unit positioning and tactical decisions
 * Positioning affected by commander traits
 */

const TargetingAI = require('./TargetingAI');

/**
 * Update unit positions based on commander traits and battle state
 */
function updatePositions(commander, friendlyUnits, enemies) {
  if (!commander || !friendlyUnits || friendlyUnits.length === 0) {
    return;
  }

  // Get trait modifiers
  const traits = commander.traits || [];
  const hasEstrategist = traits.includes('Estratega');
  const hasBrutal = traits.includes('Brutal');
  const isCowardly = traits.includes('Asustadizo');

  friendlyUnits.forEach((unit) => {
    if (!unit || unit.hp <= 0) return;

    // Base positioning logic
    if (hasEstrategist) {
      // Smart positioning: form lines, concentrate fire
      positionStrategic(unit, friendlyUnits, enemies);
    } else if (hasBrutal) {
      // Aggressive: charge toward enemies
      positionAggressive(unit, friendlyUnits, enemies);
    } else if (isCowardly) {
      // Defensive: retreat when outnumbered
      positionDefensive(unit, friendlyUnits, enemies);
    } else {
      // Default: balanced positioning
      positionBalanced(unit, friendlyUnits, enemies);
    }
  });
}

/**
 * Strategic positioning: form defensive lines, concentrate fire
 */
function positionStrategic(unit, friendlyUnits, enemies) {
  // Group units by type to form coherent lines
  const nearbyAllies = TargetingAI.getNearbyAllies(unit, friendlyUnits, 15);

  // Move toward center of formation
  if (nearbyAllies.length > 0) {
    const centerX = nearbyAllies.reduce((sum, u) => sum + u.x, unit.x) / (nearbyAllies.length + 1);
    const centerY = nearbyAllies.reduce((sum, u) => sum + u.y, unit.y) / (nearbyAllies.length + 1);

    moveToward(unit, centerX, centerY, unit.speed);
  }

  // Position based on type
  if (unit.type === 'Archer') {
    // Archers stay back
    unit.y = Math.max(unit.y - unit.speed, 3);
  } else if (unit.type === 'Cavalry') {
    // Cavalry in front
    unit.y = Math.min(unit.y + unit.speed, 10);
  }
}

/**
 * Aggressive positioning: charge toward enemies
 */
function positionAggressive(unit, friendlyUnits, enemies) {
  if (enemies.length === 0) return;

  // Charge toward nearest enemy
  const nearest = TargetingAI.getNearest(unit, enemies);
  if (nearest) {
    moveToward(unit, nearest.x, nearest.y, unit.speed * 1.5);
  }
}

/**
 * Defensive positioning: stay back, defend base
 */
function positionDefensive(unit, friendlyUnits, enemies) {
  // Count enemy threat level
  const threatLevel = enemies.reduce((sum, e) => sum + e.damage, 0);
  const allyStrength = friendlyUnits.reduce((sum, u) => sum + u.damage, 0);

  if (threatLevel > allyStrength * 1.5) {
    // Outnumbered: retreat toward base
    unit.y = Math.min(unit.y + unit.speed, 10);
  } else {
    // Defend but cautious
    unit.y = Math.max(unit.y - unit.speed * 0.5, 5);
  }
}

/**
 * Balanced positioning: stay in mid-field, support nearby units
 */
function positionBalanced(unit, friendlyUnits, enemies) {
  const nearbyAllies = TargetingAI.getNearbyAllies(unit, friendlyUnits, 12);

  if (nearbyAllies.length > 0) {
    // Stay close to allies
    const allyAvgY = nearbyAllies.reduce((sum, u) => sum + u.y, unit.y) / (nearbyAllies.length + 1);
    moveToward(unit, unit.x, allyAvgY, unit.speed * 0.5);
  }

  // Natural defensive line
  unit.y = Math.max(unit.y - unit.speed * 0.3, 4);
}

/**
 * Move unit toward target coordinates
 */
function moveToward(unit, targetX, targetY, speed) {
  const dx = targetX - unit.x;
  const dy = targetY - unit.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    const moveDistance = Math.min(speed, distance);
    unit.x += (dx / distance) * moveDistance;
    unit.y += (dy / distance) * moveDistance;

    // Clamp to bounds
    unit.x = Math.max(0, Math.min(60, unit.x));
    unit.y = Math.max(0, Math.min(12, unit.y));
  }
}

/**
 * Get morale buff based on traits and battle state
 */
function getMoraleBuff(commander, friendlyCount, enemyCount) {
  let buff = 1;

  if (commander.traits.includes('Leal')) {
    buff += 0.2;
  }

  if (commander.traits.includes('Brutal')) {
    buff += 0.1;
  }

  // Morale decreases if heavily outnumbered
  if (enemyCount > friendlyCount * 2) {
    buff -= 0.3;
  }

  return buff;
}

module.exports = {
  updatePositions,
  getMoraleBuff,
  positionStrategic,
  positionAggressive,
  positionDefensive,
  positionBalanced,
};
