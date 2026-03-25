/**
 * Commander class - represents a commander in the game
 */

class Commander {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.traits = data.traits || [];
    this.health = data.health;
    this.maxHealth = data.maxHealth;
    this.morale = data.morale;
    this.maxMorale = data.maxMorale || 100;
    this.leadership = data.leadership;
    this.maxLeadership = data.maxLeadership || 100;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this.health;
  }

  updateMorale(delta) {
    this.morale = Math.max(0, Math.min(this.maxMorale, this.morale + delta));
    return this.morale;
  }

  isAlive() {
    return this.health > 0;
  }

  getBuffs() {
    // Return stat buffs based on traits (for future implementation)
    const buffs = {
      damage: 1,
      defense: 1,
      morale: 1,
    };

    if (this.traits.includes('Brutal')) {
      buffs.damage += 0.2;
    }
    if (this.traits.includes('Estratega')) {
      buffs.defense += 0.3;
    }
    if (this.traits.includes('Leal')) {
      buffs.morale += 0.3;
    }

    return buffs;
  }

  getState() {
    return {
      id: this.id,
      name: this.name,
      traits: this.traits,
      health: this.health,
      maxHealth: this.maxHealth,
      morale: this.morale,
      maxMorale: this.maxMorale,
      leadership: this.leadership,
      maxLeadership: this.maxLeadership,
      isAlive: this.isAlive(),
    };
  }
}

module.exports = Commander;
