/**
 * Unit class - represents a military unit
 */

class Unit {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.damage = data.damage;
    this.speed = data.speed;
    this.range = data.range;
    this.trait = data.trait;
    this.cost = data.cost;
    this.symbol = data.symbol;
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
      trait: this.trait,
      cost: this.cost,
      symbol: this.symbol,
      isAlive: this.isAlive(),
    };
  }
}

module.exports = Unit;
