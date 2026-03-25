/**
 * ╔══════════════════════════════════════════╗
 * ║  BattleScreen - Ventana al Inframundo    ║
 * ╚══════════════════════════════════════════╝
 *
 * Each tab is a window into a different hell.
 * The commander screams, the dead advance, and you must choose.
 */

const Screen = require('./Screen');
const BattleMap = require('./BattleMap');
const Constants = require('../utils/Constants');

class BattleScreen extends Screen {
  constructor(renderer, battle) {
    super(renderer);
    this.battle = battle;
    this.battleMap = new BattleMap(Constants.BATTLE_MAP_WIDTH, Constants.BATTLE_MAP_HEIGHT);
  }

  create() {
    const dims = this.renderer.getDimensions();

    // Header: Battle title, wave info, commander health
    this.elements.header = this.renderer.createBox({
      top: 0,
      left: 0,
      width: dims.width,
      height: 3,
      content: '{cyan-fg}Cargando batalla...{/cyan-fg}',
      tags: true,
      border: 'line',
      style: { fg: 'cyan', border: { fg: 'cyan' } },
    });

    // Battle map display
    this.elements.map = this.renderer.createBox({
      top: 3,
      left: 0,
      width: dims.width,
      height: Constants.BATTLE_MAP_HEIGHT + 2,
      content: '',
      tags: true,
      border: 'line',
      label: ' ⚔ Campo de Batalla ⚔ ',
      style: { fg: 'white', border: { fg: 'magenta' } },
    });

    // Footer: unit count, enemies, commands
    this.elements.footer = this.renderer.createBox({
      top: Constants.BATTLE_MAP_HEIGHT + 5,
      left: 0,
      width: dims.width,
      height: 3,
      content: '',
      tags: true,
      border: 'line',
      style: { fg: 'yellow', border: { fg: 'yellow' } },
    });
  }

  /**
   * Update with fresh battle state — repaint the carnage
   */
  update(battleState) {
    if (!battleState) return;

    // Update header
    if (this.elements.header) {
      const cmd = battleState.commander;
      const hp = `${cmd.health}/${cmd.maxHealth}`;
      const morale = `${cmd.morale}/${cmd.maxMorale}`;
      const waveText = `Oleada {yellow-fg}${battleState.currentWave}/${battleState.maxWaves}{/yellow-fg}`;
      const hpColor = cmd.health < cmd.maxHealth * 0.3 ? 'red-fg' : 'green-fg';

      this.elements.header.setContent(
        `{cyan-fg}⚰ ${cmd.name}{/cyan-fg} | ${waveText} | HP: {${hpColor}}${hp}{/${hpColor}} | Moral: {magenta-fg}${morale}{/magenta-fg}`
      );
    }

    // Update map — THE critical fix: render the map with actual state
    if (this.elements.map) {
      const mapContent = this.battleMap.renderToString(battleState);
      this.elements.map.setContent(mapContent);
    }

    // Update footer
    if (this.elements.footer) {
      const friendlyCount = battleState.friendlyUnits?.length || 0;
      const aliveEnemies = battleState.enemies?.filter((e) => e.isAlive).length || 0;
      const queueCount = battleState.unitsInQueue || 0;

      let statusText = '{cyan-fg}En combate{/cyan-fg}';
      if (battleState.isLost) {
        statusText = '{red-fg}⚰ DERROTA — El comandante ha caído ⚰{/red-fg}';
      } else if (battleState.isWon) {
        statusText = '{green-fg}✦ VICTORIA — Oleadas repelidas ✦{/green-fg}';
      } else if (!battleState.waveActive) {
        statusText = '{yellow-fg}Preparando oleada...{/yellow-fg}';
      }

      this.elements.footer.setContent(
        `{green-fg}Aliados: ${friendlyCount}{/green-fg} | {red-fg}Enemigos: ${aliveEnemies}{/red-fg} | Cola: ${queueCount} | ${statusText}`
      );
    }
  }

  render() {
    super.render();
  }
}

module.exports = BattleScreen;
