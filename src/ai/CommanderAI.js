/**
 * ╔═══════════════════════════════════════════════╗
 * ║  CommanderAI - La Voluntad del General Caído    ║
 * ╚═══════════════════════════════════════════════╝
 *
 * The commander's traits shape how units are positioned.
 * A Brutal general charges blindly. An Estratega forms lines.
 * A coward retreats before the wave arrives.
 */

const TargetingAI = require('./TargetingAI');
const Constants = require('../utils/Constants');

/**
 * Update unit positions based on commander traits
 */
function updatePositions(commander, friendlyUnits, enemies) {
  if (!commander || !friendlyUnits || friendlyUnits.length === 0) return;

  const traits = commander.traits || [];
  const hasEstrategist = traits.includes('Estratega');
  const hasBrutal = traits.includes('Brutal');
  const isCowardly = traits.includes('Asustadizo');

  friendlyUnits.forEach((unit) => {
    if (!unit || unit.hp <= 0) return;

    if (hasEstrategist) {
      positionStrategic(unit, friendlyUnits, enemies);
    } else if (hasBrutal) {
      positionAggressive(unit, enemies);
    } else if (isCowardly) {
      positionDefensive(unit, friendlyUnits, enemies);
    } else {
      positionBalanced(unit, friendlyUnits);
    }
  });
}

function positionStrategic(unit, friendlyUnits, enemies) {
  const nearbyAllies = TargetingAI.getNearbyAllies(unit, friendlyUnits, 15);

  // Form coherent lines — cluster near allies
  if (nearbyAllies.length > 0) {
    const centerX = nearbyAllies.reduce((s, u) => s + (u.x || 0), unit.x || 0) / (nearbyAllies.length + 1);
    const centerY = nearbyAllies.reduce((s, u) => s + (u.y || 0), unit.y || 0) / (nearbyAllies.length + 1);
    moveToward(unit, centerX, centerY, unit.speed * 0.3);
  }

  // Type-specific positioning
  if (unit.type === 'Archer') {
    moveToward(unit, unit.x || 0, Constants.BATTLE_MAP_HEIGHT * 0.8, unit.speed * 0.2);
  } else if (unit.type === 'Cavalry') {
    moveToward(unit, unit.x || 0, Constants.BATTLE_MAP_HEIGHT * 0.5, unit.speed * 0.2);
  }
}

function positionAggressive(unit, enemies) {
  if (!enemies || enemies.length === 0) return;

  const aliveEnemies = enemies.filter((e) => e.isAlive());
  if (aliveEnemies.length === 0) return;

  const nearest = TargetingAI.getNearest(unit, aliveEnemies);
  if (nearest) {
    moveToward(unit, nearest.x || 0, nearest.y || 0, unit.speed * 0.4);
  }
}

function positionDefensive(unit, friendlyUnits, enemies) {
  const aliveEnemies = enemies.filter((e) => e.isAlive());
  const threatLevel = aliveEnemies.reduce((s, e) => s + e.damage, 0);
  const allyStrength = friendlyUnits.reduce((s, u) => s + (u.hp > 0 ? u.damage : 0), 0);

  if (threatLevel > allyStrength * 1.5) {
    // Outnumbered — retreat toward base
    moveToward(unit, unit.x || 0, Constants.BATTLE_MAP_HEIGHT * 0.85, unit.speed * 0.3);
  }
}

function positionBalanced(unit, friendlyUnits) {
  const nearbyAllies = TargetingAI.getNearbyAllies(unit, friendlyUnits, 12);

  if (nearbyAllies.length > 0) {
    const avgY = nearbyAllies.reduce((s, u) => s + (u.y || 0), unit.y || 0) / (nearbyAllies.length + 1);
    moveToward(unit, unit.x || 0, avgY, unit.speed * 0.2);
  }
}

/**
 * Move unit toward target coordinates (clamped to map)
 */
function moveToward(unit, targetX, targetY, speed) {
  const ux = unit.x || 0;
  const uy = unit.y || 0;
  const dx = targetX - ux;
  const dy = targetY - uy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0.5) {
    const moveD = Math.min(speed, dist);
    unit.x = Math.max(0, Math.min(Constants.BATTLE_MAP_WIDTH - 1, ux + (dx / dist) * moveD));
    unit.y = Math.max(0, Math.min(Constants.BATTLE_MAP_HEIGHT - 1, uy + (dy / dist) * moveD));
  }
}

function getMoraleBuff(commander, friendlyCount, enemyCount) {
  let buff = 1;
  if (commander.traits.includes('Leal')) buff += 0.2;
  if (commander.traits.includes('Brutal')) buff += 0.1;
  if (commander.traits.includes('Noble')) buff += 0.15;
  if (enemyCount > friendlyCount * 2) buff -= 0.3;
  if (commander.traits.includes('Vengativo') && enemyCount > friendlyCount) buff += 0.25;
  return buff;
}

module.exports = {
  updatePositions,
  getMoraleBuff,
};
