/**
 * ╔════════════════════════════════════════════╗
 * ║  Stress - La Presión del Mando              ║
 * ╚════════════════════════════════════════════╝
 *
 * The weight of command. Every unanswered scream,
 * every lost battle, every breach in the wall
 * adds to the crushing burden. At 100, you break.
 */

const Constants = require('../utils/Constants');

class Stress {
  constructor() {
    this.current = Constants.STRESS_INITIAL;
    this.max = Constants.STRESS_MAX;
    this.log = [];
  }

  add(amount, reason = 'unknown') {
    this.current = Math.min(this.max, this.current + amount);
    this.log.push({ action: 'add', amount, reason, total: this.current });
  }

  reduce(amount, reason = 'unknown') {
    this.current = Math.max(0, this.current - amount);
    this.log.push({ action: 'reduce', amount, reason, total: this.current });
  }

  isGameOver() {
    return this.current >= Constants.STRESS_GAME_OVER_THRESHOLD;
  }

  getPercentage() {
    return (this.current / this.max) * 100;
  }

  getState() {
    return {
      current: Math.round(this.current),
      max: this.max,
      percentage: Math.round(this.getPercentage()),
      isGameOver: this.isGameOver(),
    };
  }
}

module.exports = Stress;
