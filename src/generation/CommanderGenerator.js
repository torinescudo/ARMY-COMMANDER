/**
 * ╔═══════════════════════════════════════════╗
 * ║  CommanderGenerator - La Forja de Líderes  ║
 * ╚═══════════════════════════════════════════╝
 *
 * From the depths, commanders are forged —
 * each one scarred by unique traits, cursed
 * with ambition, and destined for glory or ruin.
 */

const { nanoid } = require('nanoid');
const Constants = require('../utils/Constants');
const Random = require('../utils/Random');
const NameGenerator = require('./NameGenerator');
const Commander = require('../core/Commander');

/**
 * Generate a random commander with procedural traits
 */
function generateCommander() {
  const id = nanoid();
  const name = NameGenerator.generateCommanderName();

  // Pick 3-5 random traits
  const traitCount = Random.randomRange(3, 5);
  const traits = Random.pickRandomN(Constants.TRAITS, traitCount);

  // Base stats with small variation
  const health = Constants.COMMANDER_INITIAL_HEALTH;
  const morale = Random.randomRange(
    Constants.COMMANDER_INITIAL_MORALE - 10,
    Constants.COMMANDER_INITIAL_MORALE + 10
  );
  const leadership = Random.randomRange(
    Constants.COMMANDER_INITIAL_LEADERSHIP - 10,
    Constants.COMMANDER_INITIAL_LEADERSHIP + 10
  );

  const commanderData = {
    id,
    name,
    traits,
    health,
    maxHealth: health,
    morale,
    maxMorale: 100,
    leadership,
    maxLeadership: 100,
  };

  return new Commander(commanderData);
}

module.exports = {
  generateCommander,
};
