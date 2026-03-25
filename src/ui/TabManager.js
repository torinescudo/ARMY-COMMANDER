/**
 * TabManager - manages multiple concurrent battles as tabs
 */

const BattleScreen = require('./BattleScreen');
const Logger = require('../utils/Logger');

class TabManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.battles = []; // Active Battle objects
    this.screens = []; // BattleScreen UI elements
    this.currentTabIndex = 0;
    this.maxTabs = 5;
  }

  /**
   * Add a new battle as a new tab
   */
  addBattle(battle) {
    if (this.battles.length >= this.maxTabs) {
      Logger.warn(`Max battles reached (${this.maxTabs}), cannot add new battle`);
      return false;
    }

    this.battles.push(battle);

    // Create screen for this battle
    const screen = new BattleScreen(this.renderer, battle);
    screen.create();
    this.screens.push(screen);

    Logger.info(`Battle added. Total tabs: ${this.battles.length}`);
    return true;
  }

  /**
   * Remove a battle tab
   */
  removeBattle(battleId) {
    const index = this.battles.findIndex((b) => b.id === battleId);
    if (index === -1) return false;

    this.battles.splice(index, 1);
    this.screens.splice(index, 1);

    // Adjust current tab if needed
    if (this.currentTabIndex >= this.battles.length && this.battles.length > 0) {
      this.currentTabIndex = this.battles.length - 1;
    }

    Logger.info(`Battle removed. Remaining tabs: ${this.battles.length}`);
    return true;
  }

  /**
   * Switch to a specific tab (by index or numeric key)
   */
  switchTab(index) {
    if (index < 0 || index >= this.battles.length) {
      Logger.warn(`Invalid tab index: ${index}`);
      return false;
    }

    this.currentTabIndex = index;
    Logger.debug(`Switched to tab ${index}`);
    return true;
  }

  /**
   * Get currently active battle
   */
  getActiveBattle() {
    return this.battles[this.currentTabIndex] || null;
  }

  /**
   * Get currently active screen
   */
  getActiveScreen() {
    return this.screens[this.currentTabIndex] || null;
  }

  /**
   * Update all battle screens
   */
  updateAllTabs(battleStates) {
    this.screens.forEach((screen, idx) => {
      if (battleStates[idx]) {
        screen.update(battleStates[idx]);
      }
    });
  }

  /**
   * Get all battle states
   */
  getAllBattleStates() {
    return this.battles.map((b) => b.getState());
  }

  /**
   * Render tab header (showing which tab is active)
   */
  renderTabHeader() {
    let header = '';

    for (let i = 0; i < this.battles.length; i++) {
      const battle = this.battles[i];
      const isActive = i === this.currentTabIndex;

      const tabLabel = `[${i + 1}] ${battle.commander.name} W:${battle.currentWave}`;
      const stateColor = battle.isLost ? 'red' : battle.isWon ? 'green' : 'cyan';

      if (isActive) {
        header += `{${stateColor},inverse}${tabLabel}{/} `;
      } else {
        header += `{${stateColor}}${tabLabel}{/} `;
      }
    }

    return header || '{cyan}No active battles{/cyan}';
  }

  /**
   * Render active battle (tab switching logic)
   */
  render() {
    const activeScreen = this.getActiveScreen();
    if (activeScreen) {
      activeScreen.render();
    }
  }

  /**
   * Get tab information for debugging
   */
  getInfo() {
    return {
      totalBattles: this.battles.length,
      currentTab: this.currentTabIndex,
      activeBattle: this.getActiveBattle()?.id || 'none',
      battles: this.battles.map((b) => ({
        id: b.id,
        commander: b.commander.name,
        wave: b.currentWave,
        status: b.isLost ? 'lost' : b.isWon ? 'won' : 'active',
      })),
    };
  }
}

module.exports = TabManager;
