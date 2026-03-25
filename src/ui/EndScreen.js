/**
 * EndScreen - Game Over / Run Complete screen
 */

const Screen = require('./Screen');

class EndScreen extends Screen {
  constructor(renderer) {
    super(renderer);
    this.runStats = null;
    this.selectedOption = 0;
  }

  /**
   * Create UI elements
   */
  create() {
    const dims = this.renderer.getDimensions();

    // Main display box
    this.elements.main = this.renderer.createBox({
      parent: this.renderer.screen,
      top: 2,
      left: Math.floor(dims.width * 0.1),
      width: Math.floor(dims.width * 0.8),
      height: dims.height - 6,
      border: 'line',
      scrollable: true,
      tags: true,
      style: {
        fg: 'white',
      },
    });

    // Buttons
    this.elements.newRunBtn = this.renderer.createButton({
      parent: this.renderer.screen,
      top: dims.height - 4,
      left: Math.floor(dims.width * 0.2),
      width: 15,
      height: 3,
      content: '{center}[NEW RUN]{/center}',
      border: 'line',
      style: {
        fg: 'cyan',
      },
    });

    this.elements.exitBtn = this.renderer.createButton({
      parent: this.renderer.screen,
      top: dims.height - 4,
      left: Math.floor(dims.width * 0.65),
      width: 15,
      height: 3,
      content: '{center}[EXIT]{/center}',
      border: 'line',
      style: {
        fg: 'cyan',
      },
    });
  }

  /**
   * Update with run statistics
   */
  update(runStats) {
    this.runStats = runStats;
    this.renderStats();
  }

  /**
   * Render statistics to screen
   */
  renderStats() {
    if (!this.runStats || !this.elements.main) return;

    const stats = this.runStats;
    const duration = Math.floor(stats.duration / 60); // minutes

    let content = '';

    // Title
    if (stats.isWon) {
      content += '{yellow}╔════════════════════════════════════╗{/yellow}\n';
      content += '{yellow}║   ✓ RUN COMPLETED - VICTORY! ✓      ║{/yellow}\n';
      content += '{yellow}╚════════════════════════════════════╝{/yellow}\n\n';
    } else if (stats.isFailed) {
      content += '{red}╔════════════════════════════════════╗{/red}\n';
      content += '{red}║      ✕ GAME OVER - STRESS MAX ✕     ║{/red}\n';
      content += '{red}╚════════════════════════════════════╝{/red}\n\n';
    } else {
      content += '{cyan}╔════════════════════════════════════╗{/cyan}\n';
      content += '{cyan}║          ⚰ GAME OVER ⚰            ║{/cyan}\n';
      content += '{cyan}╚════════════════════════════════════╝{/cyan}\n\n';
    }

    // Statistics
    content += '{cyan}═══ RUN STATISTICS ═══{/cyan}\n';
    content += `Duration: {green}${duration}m${stats.duration % 60}s{/green}\n`;
    content += `Seed: {gray}${stats.seed}{/gray}\n\n`;

    content += '{cyan}═══ BATTLES ═══{/cyan}\n';
    content += `Battles Opened: {yellow}${stats.totalBattlesOpened}{/yellow}\n`;
    content += `Victories: {green}${stats.totalBattlesWon}{/green}\n`;
    content += `Defeats: {red}${stats.totalBattlesLost}{/red}\n\n`;

    content += '{cyan}═══ COMBAT ═══{/cyan}\n';
    content += `Waves Completed: {green}${stats.totalWavesCompleted}{/green}\n`;
    content += `Enemies Defeated: {yellow}${stats.totalEnemiesKilled}{/yellow}\n`;
    content += `Units Lost: {red}${stats.totalUnitsLost}{/red}\n\n`;

    content += '{cyan}═══ RESOURCES ═══{/cyan}\n';
    content += `Total Gold Earned: {green}${stats.totalGoldEarned}g{/green}\n`;
    content += `Final Difficulty: {yellow}${stats.difficultyMultiplier}x{/yellow}\n\n`;

    // Recent battles
    if (stats.battleHistory && stats.battleHistory.length > 0) {
      content += '{cyan}═══ RECENT BATTLES ═══{/cyan}\n';

      const recent = stats.battleHistory.slice(-5);
      recent.forEach((battle, idx) => {
        const status = battle.won ? '{green}WON{/green}' : '{red}LOST{/red}';
        content += `[${idx + 1}] ${battle.commander} Wave ${battle.wave} - ${status} (${battle.enemiesKilled} kills, ${battle.unitsLost} lost)\n`;
      });
    }

    content += '\n{gray}Press [NEW RUN] or [EXIT]{/gray}';

    this.elements.main.setContent(content);
  }

  /**
   * Render screen
   */
  render() {
    super.render();
  }
}

module.exports = EndScreen;
