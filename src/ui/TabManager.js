/**
 * ╔══════════════════════════════════════════╗
 * ║  TabManager - Las Puertas del Infierno    ║
 * ╚══════════════════════════════════════════╝
 *
 * Each tab is a portal to a different battlefield.
 * Switch between them with TAB or 1-5.
 * Every second you're not watching, someone dies.
 */

const BattleScreen = require('./BattleScreen');
const Constants = require('../utils/Constants');
const Logger = require('../utils/Logger');

class TabManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.battles = [];
    this.screens = [];
    this.currentTabIndex = 0;
    this.maxTabs = Constants.BATTLE_MAX_CONCURRENT;
  }

  addBattle(battle) {
    if (this.battles.length >= this.maxTabs) {
      Logger.warn(`Máximo de batallas alcanzado (${this.maxTabs})`);
      return false;
    }

    this.battles.push(battle);
    const screen = new BattleScreen(this.renderer, battle);
    screen.create();
    this.screens.push(screen);

    Logger.info(`Portal abierto. Batallas activas: ${this.battles.length}`);
    return true;
  }

  removeBattle(battleId) {
    const index = this.battles.findIndex((b) => b.id === battleId);
    if (index === -1) return false;

    // Destroy screen elements to avoid orphaned blessed nodes
    const screen = this.screens[index];
    if (screen && screen.destroy) screen.destroy();

    this.battles.splice(index, 1);
    this.screens.splice(index, 1);

    // Ensure currentTabIndex is always valid
    if (this.battles.length === 0) {
      this.currentTabIndex = 0;
    } else if (this.currentTabIndex >= this.battles.length) {
      this.currentTabIndex = this.battles.length - 1;
    }

    Logger.info(`Portal cerrado. Batallas restantes: ${this.battles.length}`);
    return true;
  }

  switchTab(index) {
    if (index < 0 || index >= this.battles.length) return false;
    this.currentTabIndex = index;
    return true;
  }

  getActiveBattle() {
    return this.battles[this.currentTabIndex] || null;
  }

  getActiveScreen() {
    return this.screens[this.currentTabIndex] || null;
  }

  updateAllTabs(battleStates) {
    this.screens.forEach((screen, idx) => {
      if (battleStates[idx]) {
        screen.update(battleStates[idx]);
      }
    });
  }

  getAllBattleStates() {
    return this.battles.map((b) => b.getState());
  }

  /**
   * Render tab header showing all portals
   */
  renderTabHeader() {
    let header = '';
    for (let i = 0; i < this.battles.length; i++) {
      const b = this.battles[i];
      const active = i === this.currentTabIndex;

      // Dynamic color based on battle state
      let color = 'cyan';
      let icon = '⚔';
      if (b.isLost) {
        color = 'red';
        icon = '✕';
      } else if (b.isWon) {
        color = 'green';
        icon = '✦';
      } else {
        const hpPercent = b.commander.health / b.commander.maxHealth;
        if (hpPercent < 0.2) {
          color = 'red';
          icon = '⚠';
        } else if (hpPercent < 0.5) {
          color = 'yellow';
          icon = '!';
        }
      }

      const label = `${icon} [${i + 1}] ${b.commander.name.split(' ')[0]} W:${b.currentWave}`;

      header += active
        ? `{${color}-fg,inverse,bold} ${label} {/${color}-fg,inverse,bold} `
        : `{${color}-fg} ${label} {/${color}-fg} `;
    }
    return header || '{gray-fg}Sin batallas activas{/gray-fg}';
  }

  show() {
    this.screens.forEach((s) => { if (s.show) s.show(); });
  }

  hide() {
    this.screens.forEach((s) => { if (s.hide) s.hide(); });
  }

  render() {
    const activeScreen = this.getActiveScreen();
    if (activeScreen) activeScreen.render();
  }

  getInfo() {
    return {
      totalBattles: this.battles.length,
      currentTab: this.currentTabIndex,
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
