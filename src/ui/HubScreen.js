/**
 * HUB Screen - Main interface for commander selection and shop
 */

const Screen = require('./Screen');
const Logger = require('../utils/Logger');

class HubScreen extends Screen {
  constructor(renderer) {
    super(renderer);
    this.currentCommander = null;
    this.currentShop = null;
    this.currentStress = null;
    this.callbacks = {};
  }

  /**
   * Create UI elements
   */
  create() {
    const dims = this.renderer.getDimensions();

    // Title/Header
    this.elements.title = this.renderer.createBox({
      parent: this.renderer.screen,
      top: 0,
      left: 0,
      width: dims.width,
      height: 3,
      content: '⚰ ARMY COMMANDER ⚰',
      tags: true,
      style: {
        fg: 'magenta',
        bg: 'black',
      },
      border: 'line',
    });

    // Left panel: Commander info
    this.elements.commanderPanel = this.renderer.drawBorderedBox({
      top: 4,
      left: 1,
      width: Math.floor(dims.width / 2) - 2,
      height: 14,
      label: ' COMMANDER ',
      content: 'Generating...',
      tags: true,
      scrollable: true,
      style: {
        fg: 'cyan',
      },
    });

    // Buttons below commander
    this.elements.selectBtn = this.renderer.createButton({
      parent: this.renderer.screen,
      mouse: true,
      clickable: true,
      top: 19,
      left: 1,
      width: 12,
      height: 3,
      name: 'selectBtn',
      content: '{center}[SELECT]{/center}',
      border: 'line',
      style: {
        fg: 'cyan',
        focus: {
          fg: 'white',
          bg: 'green',
        },
      },
    });

    this.elements.rerollBtn = this.renderer.createButton({
      parent: this.renderer.screen,
      mouse: true,
      clickable: true,
      top: 19,
      left: 15,
      width: 12,
      height: 3,
      name: 'rerollBtn',
      content: '{center}[REROLL]{/center}',
      border: 'line',
      style: {
        fg: 'cyan',
        focus: {
          fg: 'white',
          bg: 'green',
        },
      },
    });

    // Right panel: Shop
    this.elements.shopPanel = this.renderer.drawBorderedBox({
      top: 4,
      left: Math.floor(dims.width / 2),
      width: Math.floor(dims.width / 2) - 2,
      height: 18,
      label: ' SHOP ',
      content: 'Generating...',
      tags: true,
      scrollable: true,
      style: {
        fg: 'yellow',
      },
    });

    // Bottom panel: Info
    this.elements.infoPanel = this.renderer.drawBorderedBox({
      top: Math.floor(dims.height) - 4,
      left: 1,
      width: dims.width - 2,
      height: 4,
      label: ' INFO ',
      content: 'Starting...',
      tags: true,
      style: {
        fg: 'green',
      },
    });

    // Setup button callbacks
    this.setupCallbacks();
  }

  /**
   * Setup button click handlers
   */
  setupCallbacks() {
    if (this.elements.selectBtn) {
      this.elements.selectBtn.on('click', () => {
        if (this.callbacks.onSelect) {
          this.callbacks.onSelect();
        }
      });
    }

    if (this.elements.rerollBtn) {
      this.elements.rerollBtn.on('click', () => {
        if (this.callbacks.onReroll) {
          this.callbacks.onReroll();
        }
      });
    }
  }

  /**
   * Register callback functions
   */
  registerCallback(event, fn) {
    this.callbacks[event] = fn;
  }

  /**
   * Update screen with game state
   */
  update(state) {
    this.currentCommander = state.commander;
    this.currentShop = state.shop;
    this.currentStress = state.stress;

    this.updateCommanderPanel();
    this.updateShopPanel();
    this.updateInfoPanel();
  }

  /**
   * Update commander display
   */
  updateCommanderPanel() {
    if (!this.elements.commanderPanel || !this.currentCommander) return;

    const cmd = this.currentCommander;
    const traitsList = cmd.traits.map((t) => `  • ${t}`).join('\n');

    const content = `
{cyan}Name:{/cyan} ${cmd.name}

{cyan}Traits:{/cyan}
${traitsList}

{cyan}Stats:{/cyan}
  Health: ${cmd.health}/${cmd.maxHealth}
  Morale: ${cmd.morale}/${cmd.maxMorale}
  Leadership: ${cmd.leadership}/${cmd.maxLeadership}
    `;

    this.elements.commanderPanel.setContent(content);
  }

  /**
   * Update shop display
   */
  updateShopPanel() {
    if (!this.elements.shopPanel || !this.currentShop) return;

    const shop = this.currentShop;
    let content = `{yellow}Gold: {/yellow}${shop.gold}g (${shop.goldPerSecond.toFixed(1)}/s)\n\n`;

    if (shop.available && shop.available.length > 0) {
      shop.available.forEach((unit, idx) => {
        content += `{cyan}[${idx + 1}] {/cyan}${unit.name}\n`;
        content += `    HP:${unit.hp} DMG:${unit.damage} SPD:${unit.speed}\n`;
        content += `    {yellow}Cost: ${unit.cost}g{/yellow}`;

        // Add button indicator
        const canBuy = shop.gold >= unit.cost;
        const btnText = canBuy
          ? ' {green}[BUY]{/green}'
          : ' {red}[NO GOLD]{/red}';
        content += `${btnText}\n\n`;
      });
    }

    content += `\n{cyan}Inventory: ${shop.inventorySize}/${shop.maxInventorySize}{/cyan}`;

    this.elements.shopPanel.setContent(content);
  }

  /**
   * Update info panel (stress, etc)
   */
  updateInfoPanel() {
    if (!this.elements.infoPanel || !this.currentStress) return;

    const stress = this.currentStress;
    const stressBar = this.createStressBar(stress.percentage);

    const content = `
{cyan}Stress:{/cyan} ${stressBar} ${stress.current}/${stress.max}
{green}Run Status:{/green} Waiting for first battle...
    `;

    this.elements.infoPanel.setContent(content);
  }

  /**
   * Create a visual stress bar
   */
  createStressBar(percentage) {
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;

    let bar = '';
    for (let i = 0; i < filled; i++) {
      bar += '█';
    }
    for (let i = 0; i < empty; i++) {
      bar += '░';
    }

    return bar;
  }

  /**
   * Render the screen
   */
  render() {
    super.render();
  }
}

module.exports = HubScreen;
