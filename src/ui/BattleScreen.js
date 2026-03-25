/**
 * BattleScreen - displays a single active battle
 */

const Screen = require('./Screen');
const BattleMap = require('./BattleMap');

class BattleScreen extends Screen {
  constructor(renderer, battle) {
    super(renderer);
    this.battle = battle;
    this.battleMap = new BattleMap(60, 12);
    this.lastUpdate = 0;
  }

  /**
   * Create UI elements for this battle
   */
  create() {
    const dims = this.renderer.getDimensions();

    // Header: Battle title and wave info
    this.elements.header = this.renderer.createBox({
      parent: this.renderer.screen,
      top: 0,
      left: 0,
      width: dims.width,
      height: 2,
      content: `Battle ${this.battle.id.slice(0, 8)} | Wave ${this.battle.currentWave}/${this.battle.maxWaves}`,
      tags: true,
      style: {
        fg: 'cyan',
      },
      border: 'line',
    });

    // Battle map
    this.elements.map = this.renderer.createBox({
      parent: this.renderer.screen,
      top: 3,
      left: 0,
      width: dims.width,
      height: 14,
      content: 'Loading battle...',
      tags: true,
      scrollable: false,
      style: {
        fg: 'white',
      },
      border: 'line',
    });

    // Footer: Unit count, commands
    this.elements.footer = this.renderer.createBox({
      parent: this.renderer.screen,
      top: dims.height - 4,
      left: 0,
      width: dims.width,
      height: 4,
      content: 'Units: 0 | Enemies: 0 | /send <unit> <direction>',
      tags: true,
      style: {
        fg: 'yellow',
      },
      border: 'line',
    });
  }

  /**
   * Update battle display
   */
  update(battleState) {
    if (!battleState) return;

    this.battle = battleState;

    // Update header
    if (this.elements.header) {
      const commander = battleState.commander;
      const health = `${commander.health}/${commander.maxHealth}`;
      const content = `{cyan}Battle ${battleState.id.slice(0, 8)} | Wave {yellow}${battleState.currentWave}/${battleState.maxWaves}{/yellow} | ${commander.name} HP: {red}${health}{/red}{/cyan}`;
      this.elements.header.setContent(content);
    }

    // Update map
    if (this.elements.map) {
      const mapContent = this.battleMap.toColoredString();
      this.elements.map.setContent(mapContent);
    }

    // Update footer
    if (this.elements.footer) {
      const friendlyCount = battleState.friendlyUnits?.length || 0;
      const enemyCount = battleState.enemies?.length || 0;
      const queueCount = battleState.unitsInQueue || 0;

      let statusText = 'Ready';
      if (battleState.isLost) {
        statusText = '{red}LOST - Commander fell{/red}';
      } else if (battleState.isWon) {
        statusText = '{green}WON - All waves cleared{/green}';
      } else if (!battleState.waveActive) {
        statusText = '{yellow}Wave preparing...{/yellow}';
      }

      const content = `{cyan}Units: {green}${friendlyCount}{/green} | Enemies: {red}${enemyCount}{/red} | Queue: ${queueCount} | Status: ${statusText}{/cyan}`;
      this.elements.footer.setContent(content);
    }
  }

  /**
   * Get current battle object
   */
  getBattle() {
    return this.battle;
  }

  /**
   * Render this screen
   */
  render() {
    super.render();
  }
}

module.exports = BattleScreen;
