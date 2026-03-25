/**
 * Stress tracking system
 */

const Constants = require('../utils/Constants');

class Stress {
  constructor() {
    this.current = Constants.STRESS_INITIAL;
    this.max = Constants.STRESS_MAX;
    this.log = [];
  }

  /**
   * Add stress with reason
   */
  add(amount, reason = 'unknown') {
    this.current = Math.min(this.max, this.current + amount);
    this.log.push({
      action: 'add',
      amount,
      reason,
      timestamp: Date.now(),
      total: this.current,
    });
  }

  /**
   * Reduce stress with reason
   */
  reduce(amount, reason = 'unknown') {
    this.current = Math.max(0, this.current - amount);
    this.log.push({
      action: 'reduce',
      amount,
      reason,
      timestamp: Date.now(),
      total: this.current,
    });
  }

  /**
   * Check if game over
   */
  isGameOver() {
    return this.current >= Constants.STRESS_GAME_OVER_THRESHOLD;
  }

  /**
   * Get current stress percentage (0-100)
   */
  getPercentage() {
    return (this.current / this.max) * 100;
  }

  /**
   * Get stress state
   */
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
