/**
 * ╔══════════════════════════════════════════════╗
 * ║  HubScreen - La Sala del Trono Profanado      ║
 * ╚══════════════════════════════════════════════╝
 *
 * The war room where you choose who leads and who dies.
 * Select your commander, equip your legions, and wait
 * for the abyss to open its first portal.
 */

const Screen = require('./Screen');

class HubScreen extends Screen {
  constructor(renderer) {
    super(renderer);
    this.currentCommander = null;
    this.currentShop = null;
    this.currentStress = null;
    this.callbacks = {};
  }

  create() {
    const dims = this.renderer.getDimensions();
    const halfW = Math.floor(dims.width / 2);

    // Title
    this.elements.title = this.renderer.createBox({
      top: 0,
      left: 0,
      width: dims.width,
      height: 3,
      content: '{center}{magenta-fg}⚰  A R M Y   C O M M A N D E R  ⚰{/magenta-fg}{/center}',
      tags: true,
      border: 'line',
      style: { fg: 'magenta', border: { fg: 'magenta' } },
    });

    // Left: Commander panel
    this.elements.commanderPanel = this.renderer.drawBorderedBox({
      top: 4,
      left: 1,
      width: halfW - 2,
      height: 14,
      label: ' ⚔ Comandante ⚔ ',
      content: 'Invocando...',
      tags: true,
      scrollable: true,
      style: { fg: 'cyan', border: { fg: 'cyan' } },
    });

    // SELECT button
    this.elements.selectBtn = this.renderer.createButton({
      top: 19,
      left: 2,
      width: 14,
      height: 3,
      content: '{center}[SELECCIONAR]{/center}',
      tags: true,
      border: 'line',
      style: {
        fg: 'green',
        border: { fg: 'green' },
        hover: { fg: 'white', bg: 'green' },
      },
    });

    // REROLL button
    this.elements.rerollBtn = this.renderer.createButton({
      top: 19,
      left: 18,
      width: 12,
      height: 3,
      content: '{center}[REINVOCAR]{/center}',
      tags: true,
      border: 'line',
      style: {
        fg: 'yellow',
        border: { fg: 'yellow' },
        hover: { fg: 'white', bg: 'yellow' },
      },
    });

    // Right: Shop panel
    this.elements.shopPanel = this.renderer.drawBorderedBox({
      top: 4,
      left: halfW,
      width: halfW - 2,
      height: 18,
      label: ' ✦ Mercader de Almas ✦ ',
      content: 'Preparando mercancía...',
      tags: true,
      scrollable: true,
      style: { fg: 'yellow', border: { fg: 'yellow' } },
    });

    // Bottom: Info panel
    this.elements.infoPanel = this.renderer.drawBorderedBox({
      top: dims.height - 5,
      left: 1,
      width: dims.width - 2,
      height: 5,
      label: ' ⚰ Estado del Mando ⚰ ',
      content: '',
      tags: true,
      style: { fg: 'green', border: { fg: 'cyan' } },
    });

    // Wire up button click handlers
    this.setupCallbacks();

    // Wire up number keys for buying
    this.renderer.screen.key(['1', '2', '3', '4', '5'], (ch) => {
      const idx = parseInt(ch, 10) - 1;
      if (this.currentShop && this.currentShop.available[idx]) {
        const unitId = this.currentShop.available[idx].id;
        if (this.callbacks.onBuyUnit) {
          this.callbacks.onBuyUnit(unitId);
        }
      }
    });
  }

  setupCallbacks() {
    if (this.elements.selectBtn) {
      this.elements.selectBtn.on('click', () => {
        if (this.callbacks.onSelect) this.callbacks.onSelect();
      });
    }

    if (this.elements.rerollBtn) {
      this.elements.rerollBtn.on('click', () => {
        if (this.callbacks.onReroll) this.callbacks.onReroll();
      });
    }

    // Also support keyboard shortcuts
    this.renderer.screen.key(['s'], () => {
      if (this.callbacks.onSelect) this.callbacks.onSelect();
    });
    this.renderer.screen.key(['r'], () => {
      if (this.callbacks.onReroll) this.callbacks.onReroll();
    });
  }

  registerCallback(event, fn) {
    this.callbacks[event] = fn;
  }

  update(state) {
    this.currentCommander = state.commander;
    this.currentShop = state.shop;
    this.currentStress = state.stress;

    this.updateCommanderPanel();
    this.updateShopPanel();
    this.updateInfoPanel();
  }

  updateCommanderPanel() {
    if (!this.elements.commanderPanel || !this.currentCommander) return;

    const cmd = this.currentCommander;
    const traitsList = cmd.traits
      .map((t) => `  {magenta-fg}•{/magenta-fg} ${t}`)
      .join('\n');

    const hpBar = this.createBar(cmd.health, cmd.maxHealth, 'green');
    const moraleBar = this.createBar(cmd.morale, cmd.maxMorale, 'magenta');

    const content =
      `{cyan-fg}Nombre:{/cyan-fg} {white-fg}${cmd.name}{/white-fg}\n` +
      `\n` +
      `{cyan-fg}Marcas del Destino:{/cyan-fg}\n` +
      `${traitsList}\n` +
      `\n` +
      `{cyan-fg}Salud:{/cyan-fg}     ${hpBar} ${cmd.health}/${cmd.maxHealth}\n` +
      `{cyan-fg}Moral:{/cyan-fg}     ${moraleBar} ${cmd.morale}/${cmd.maxMorale}\n` +
      `{cyan-fg}Liderazgo:{/cyan-fg} ${cmd.leadership}/${cmd.maxLeadership}\n` +
      `\n` +
      `{gray-fg}[S] Seleccionar  [R] Reinvocar{/gray-fg}`;

    this.elements.commanderPanel.setContent(content);
  }

  updateShopPanel() {
    if (!this.elements.shopPanel || !this.currentShop) return;

    const shop = this.currentShop;
    let content =
      `{yellow-fg}Oro Maldito:{/yellow-fg} {white-fg}${shop.gold}g{/white-fg} ({green-fg}+${shop.goldPerSecond.toFixed(1)}/s{/green-fg})\n` +
      `{gray-fg}Inventario: ${shop.inventorySize}/${shop.maxInventorySize}{/gray-fg}\n\n`;

    if (shop.available && shop.available.length > 0) {
      shop.available.forEach((unit, idx) => {
        const canBuy = shop.gold >= unit.cost;
        const costColor = canBuy ? 'green-fg' : 'red-fg';

        content += `{cyan-fg}[${idx + 1}]{/cyan-fg} ${unit.name} ${unit.symbol || ''}\n`;
        content += `    HP:${unit.hp} DMG:${unit.damage} SPD:${unit.speed} RNG:${unit.range}\n`;
        content += `    {${costColor}}${unit.cost}g{/${costColor}}`;
        content += canBuy ? ' {green-fg}← Pulsa [${idx + 1}]{/green-fg}' : ' {red-fg}(sin oro){/red-fg}';
        content += '\n\n';
      });
    }

    this.elements.shopPanel.setContent(content);
  }

  updateInfoPanel() {
    if (!this.elements.infoPanel || !this.currentStress) return;

    const stress = this.currentStress;
    const stressColor = stress.percentage > 70 ? 'red' : stress.percentage > 40 ? 'yellow' : 'green';
    const stressBar = this.createBar(stress.current, stress.max, stressColor);

    const content =
      `{cyan-fg}Estrés:{/cyan-fg} ${stressBar} ${stress.current}/${stress.max}\n` +
      `{gray-fg}Aguardando la primera grieta dimensional...{/gray-fg}\n` +
      `{gray-fg}Las batallas se abrirán pronto. Prepara tus legiones.{/gray-fg}`;

    this.elements.infoPanel.setContent(content);
  }

  /**
   * Create a visual bar using block characters
   */
  createBar(current, max, color) {
    const barLen = 15;
    const filled = Math.round((current / max) * barLen);
    const empty = barLen - filled;
    return `{${color}-fg}${'█'.repeat(filled)}{/${color}-fg}{gray-fg}${'░'.repeat(empty)}{/gray-fg}`;
  }

  render() {
    super.render();
  }
}

module.exports = HubScreen;
