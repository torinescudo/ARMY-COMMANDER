/**
 * ╔════════════════════════════════════════════╗
 * ║  Shop - El Mercader de Almas                ║
 * ╚════════════════════════════════════════════╝
 *
 * Gold buys flesh. Flesh buys time.
 * The merchant cares not for victory or defeat —
 * only that payment is made in cursed coin.
 */

const Constants = require('../utils/Constants');
const UnitGenerator = require('../generation/UnitGenerator');

class Shop {
  constructor() {
    this.gold = Constants.GOLD_INITIAL;
    this.goldPerSecond = Constants.GOLD_PER_SECOND;
    this.inventory = [];
    this.available = [];

    this.generateStock();
  }

  generateStock(count = Constants.SHOP_STOCK_SIZE) {
    this.available = UnitGenerator.generateUnits(count);
  }

  purchaseUnit(unitId) {
    const unitIndex = this.available.findIndex((u) => u.id === unitId);
    if (unitIndex === -1) return false;

    const unit = this.available[unitIndex];
    if (this.gold < unit.cost) return false;
    if (this.inventory.length >= Constants.INVENTORY_MAX_SIZE) return false;

    this.gold -= unit.cost;
    this.inventory.push(unit);

    // Replace sold unit with a new one
    this.available.splice(unitIndex, 1);
    const [newUnit] = UnitGenerator.generateUnits(1);
    this.available.push(newUnit);

    return true;
  }

  addGold(amount) {
    this.gold = Math.min(Constants.GOLD_MAX, this.gold + amount);
  }

  updateGold(deltaTimeMs) {
    const gain = this.goldPerSecond * (deltaTimeMs / 1000);
    this.addGold(gain);
  }

  getState() {
    return {
      gold: Math.floor(this.gold),
      goldPerSecond: this.goldPerSecond,
      goldMax: Constants.GOLD_MAX,
      inventory: this.inventory.map((u) => u.getState()),
      available: this.available.map((u) => u.getState()),
      inventorySize: this.inventory.length,
      maxInventorySize: Constants.INVENTORY_MAX_SIZE,
    };
  }
}

module.exports = Shop;
