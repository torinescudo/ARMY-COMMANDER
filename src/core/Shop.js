/**
 * Shop class - manages currency and unit inventory
 */

const Constants = require('../utils/Constants');
const UnitGenerator = require('../generation/UnitGenerator');

class Shop {
  constructor() {
    this.gold = Constants.GOLD_INITIAL;
    this.goldPerSecond = Constants.GOLD_PER_SECOND;
    this.inventory = []; // Player's purchased units
    this.available = []; // Units for sale

    // Initialize shop stock
    this.generateStock();
  }

  /**
   * Generate random units for sale
   */
  generateStock(count = Constants.SHOP_STOCK_SIZE) {
    this.available = UnitGenerator.generateUnits(count);
  }

  /**
   * Purchase a unit from the shop
   */
  purchaseUnit(unitId) {
    const unitIndex = this.available.findIndex((u) => u.id === unitId);
    if (unitIndex === -1) return false;

    const unit = this.available[unitIndex];

    // Check if player has enough gold
    if (this.gold < unit.cost) return false;

    // Check inventory size
    if (this.inventory.length >= Constants.INVENTORY_MAX_SIZE) return false;

    // Deduct gold and add to inventory
    this.gold -= unit.cost;
    this.inventory.push(unit);

    // Remove from shop and regenerate stock
    this.available.splice(unitIndex, 1);
    this.generateStock(1);

    return true;
  }

  /**
   * Add gold to the shop
   */
  addGold(amount) {
    this.gold = Math.min(Constants.GOLD_MAX_REGEN, this.gold + amount);
  }

  /**
   * Update gold (passive regen over time)
   */
  updateGold(deltaTimeMs) {
    const deltaTimeSec = deltaTimeMs / 1000;
    const goldGain = this.goldPerSecond * deltaTimeSec;
    this.addGold(goldGain);
  }

  /**
   * Get shop state for UI
   */
  getState() {
    return {
      gold: Math.floor(this.gold),
      goldPerSecond: this.goldPerSecond,
      goldMax: Constants.GOLD_MAX_REGEN,
      inventory: this.inventory.map((u) => u.getState()),
      available: this.available.map((u) => u.getState()),
      inventorySize: this.inventory.length,
      maxInventorySize: Constants.INVENTORY_MAX_SIZE,
    };
  }
}

module.exports = Shop;
