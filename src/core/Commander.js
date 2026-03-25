/**
 * ╔═══════════════════════════════════════════╗
 * ║  Commander - Los Generales Caídos          ║
 * ╚═══════════════════════════════════════════╝
 *
 * Once noble. Now cursed. Each commander bears
 * the Marks of Destiny — traits that define
 * how they lead, how they fight, and how they die.
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

  /**
   * The Marks of Destiny — buffs drawn from the commander's cursed traits
   */
  getBuffs() {
    const buffs = { damage: 1, defense: 1, morale: 1 };

    if (this.traits.includes('Brutal'))    buffs.damage += 0.2;
    if (this.traits.includes('Estratega')) buffs.defense += 0.3;
    if (this.traits.includes('Leal'))      buffs.morale += 0.3;
    if (this.traits.includes('Noble'))     buffs.morale += 0.15;
    if (this.traits.includes('Vengativo')) buffs.damage += 0.15;
    if (this.traits.includes('Temerario')) buffs.damage += 0.1;

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
