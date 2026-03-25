/**
 * ╔═══════════════════════════════════════════╗
 * ║  Enemy - Los Hijos del Vacío               ║
 * ╚═══════════════════════════════════════════╝
 *
 * They emerge from the darkness in endless waves.
 * No names worth remembering, no mercy worth giving.
 * Each one a vessel of destruction marching toward your base.
 */

class Enemy {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type; // 'Infantry', 'Archer', 'Cavalry', etc.
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.damage = data.damage;
    this.speed = data.speed;
    this.range = data.range;
    this.symbol = data.symbol;

    // Position in battle
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.progress = data.progress || 0; // 0-100, progress toward base
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp;
  }

  isAlive() {
    return this.hp > 0;
  }

  /**
   * Move enemy toward player base
   * Increases progress counter
   */
  moveTowardBase(deltaTime, baseSpeed = 1) {
    const movement = (baseSpeed * this.speed * deltaTime) / 1000;
    this.progress += movement;
  }

  /**
   * Check if enemy reached player base
   */
  hasReachedBase(baseProgress = 100) {
    return this.progress >= baseProgress;
  }

  getState() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      hp: this.hp,
      maxHp: this.maxHp,
      damage: this.damage,
      speed: this.speed,
      range: this.range,
      symbol: this.symbol,
      x: this.x,
      y: this.y,
      progress: this.progress,
      isAlive: this.isAlive(),
    };
  }
}

module.exports = Enemy;
