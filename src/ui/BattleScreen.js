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
const VisualFX = require('./VisualFX');

class BattleScreen extends Screen {
  constructor(renderer, battle) {
    super(renderer);
    this.battle = battle;
    this.battleMap = new BattleMap(Constants.BATTLE_MAP_WIDTH, Constants.BATTLE_MAP_HEIGHT);
    this.lastHp = null;
    this.pulseId = null;
    this.wasActive = true;
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

    const cmd = battleState.commander;
    const hpPercent = cmd.health / cmd.maxHealth;
    const moralePercent = cmd.morale / cmd.maxMorale;

    // Detect damage — flash border red + screen shake
    if (this.lastHp !== null && cmd.health < this.lastHp) {
      const dmg = this.lastHp - cmd.health;
      VisualFX.flashBorder(this.elements.header, 'red', dmg >= 10 ? 500 : 250);
      VisualFX.flashBorder(this.elements.map, 'red', 200);
      if (dmg >= 5) {
        VisualFX.shake(this.elements.map, dmg >= 10 ? 2 : 1, 300);
      }
    }
    this.lastHp = cmd.health;

    // Battle end effects
    if (battleState.isLost && this.wasActive) {
      this.wasActive = false;
      this.pulseId = VisualFX.startPulse(this.elements.header, 'red', 'black', 400);
    } else if (battleState.isWon && this.wasActive) {
      this.wasActive = false;
      this.pulseId = VisualFX.startPulse(this.elements.header, 'green', 'yellow', 300);
    }

    // Critical HP pulse
    if (hpPercent < 0.2 && !battleState.isLost && !battleState.isWon && !this.pulseId) {
      this.pulseId = VisualFX.startPulse(this.elements.map, 'red', 'magenta', 600);
    } else if (hpPercent >= 0.2 && this.pulseId && this.wasActive) {
      VisualFX.stopPulse(this.pulseId);
      this.pulseId = null;
    }

    // Dynamic border color based on battle health
    const borderColor = hpPercent < 0.2 ? 'red'
      : hpPercent < 0.5 ? 'yellow'
      : 'cyan';

    // Update header with dynamic HP coloring
    if (this.elements.header) {
      const hp = `${cmd.health}/${cmd.maxHealth}`;
      const morale = `${cmd.morale}/${cmd.maxMorale}`;
      const waveText = `Oleada {yellow-fg}${battleState.currentWave}/${battleState.maxWaves}{/yellow-fg}`;

      // HP bar with gradient color
      const hpBarLen = 10;
      const hpFilled = Math.round(hpPercent * hpBarLen);
      const hpColor = hpPercent < 0.2 ? 'red' : hpPercent < 0.5 ? 'yellow' : 'green';
      const hpBar = `{${hpColor}-fg}${'█'.repeat(hpFilled)}{/${hpColor}-fg}{gray-fg}${'░'.repeat(hpBarLen - hpFilled)}{/gray-fg}`;

      // Morale bar
      const moraleBarLen = 8;
      const moraleFilled = Math.round(moralePercent * moraleBarLen);
      const moraleColor = moralePercent < 0.3 ? 'red' : 'magenta';
      const moraleBar = `{${moraleColor}-fg}${'█'.repeat(moraleFilled)}{/${moraleColor}-fg}{gray-fg}${'░'.repeat(moraleBarLen - moraleFilled)}{/gray-fg}`;

      this.elements.header.setContent(
        `{${borderColor}-fg}⚔ ${cmd.name}{/${borderColor}-fg} | ${waveText} | HP: ${hpBar} {${hpColor}-fg}${hp}{/${hpColor}-fg} | Moral: ${moraleBar}`
      );

      // Flash border red when HP is critical
      this.elements.header.style.border.fg = borderColor;
    }

    // Update map
    if (this.elements.map) {
      const mapContent = this.battleMap.renderToString(battleState);
      this.elements.map.setContent(mapContent);
      this.elements.map.style.border.fg = borderColor;
    }

    // Update footer with battle status effects
    if (this.elements.footer) {
      const friendlyCount = battleState.friendlyUnits?.length || 0;
      const aliveEnemies = battleState.enemies?.filter((e) => e.isAlive).length || 0;
      const queueCount = battleState.unitsInQueue || 0;

      let statusText = `{${borderColor}-fg}⚔ En combate{/${borderColor}-fg}`;
      let footerBorderColor = 'yellow';

      if (battleState.isLost) {
        statusText = '{red-fg,bold}✕✕✕ DERROTA — El comandante ha caído ✕✕✕{/red-fg,bold}';
        footerBorderColor = 'red';
      } else if (battleState.isWon) {
        statusText = '{green-fg,bold}✦✦✦ VICTORIA — Oleadas repelidas ✦✦✦{/green-fg,bold}';
        footerBorderColor = 'green';
      } else if (!battleState.waveActive) {
        statusText = '{yellow-fg}▸▸ Preparando oleada...{/yellow-fg}';
      } else if (aliveEnemies > friendlyCount * 2) {
        statusText = '{red-fg}⚠ SUPERADOS EN NÚMERO ⚠{/red-fg}';
      }

      this.elements.footer.setContent(
        `{green-fg}Aliados: ${friendlyCount}{/green-fg} | {red-fg}Enemigos: ${aliveEnemies}{/red-fg} | Cola: ${queueCount} | ${statusText}`
      );
      this.elements.footer.style.border.fg = footerBorderColor;
    }
  }

  show() {
    Object.values(this.elements).forEach((el) => { el.show(); });
  }

  hide() {
    Object.values(this.elements).forEach((el) => { el.hide(); });
  }

  destroy() {
    if (this.pulseId) VisualFX.stopPulse(this.pulseId);
    Object.values(this.elements).forEach((el) => { el.destroy(); });
    this.elements = {};
  }

  render() {
    super.render();
  }
}

module.exports = BattleScreen;
