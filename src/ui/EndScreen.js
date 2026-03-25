/**
 * ╔═══════════════════════════════════════════╗
 * ║  EndScreen - El Epitafio del Comandante    ║
 * ╚═══════════════════════════════════════════╝
 *
 * The tombstone where your run is carved in stone.
 * Every number tells a story of blood and gold.
 */

const Screen = require('./Screen');

class EndScreen extends Screen {
  constructor(renderer) {
    super(renderer);
    this.runStats = null;
    this.callbacks = {};
  }

  create() {
    const dims = this.renderer.getDimensions();

    // Main stats box
    this.elements.main = this.renderer.createBox({
      top: 1,
      left: Math.floor(dims.width * 0.05),
      width: Math.floor(dims.width * 0.9),
      height: dims.height - 6,
      border: 'line',
      scrollable: true,
      tags: true,
      label: ' ⚰ Epitafio ⚰ ',
      style: { fg: 'white', border: { fg: 'magenta' } },
    });

    // NEW RUN button
    this.elements.newRunBtn = this.renderer.createButton({
      top: dims.height - 4,
      left: Math.floor(dims.width * 0.15),
      width: 18,
      height: 3,
      content: '{center}[NUEVA PARTIDA]{/center}',
      tags: true,
      border: 'line',
      style: {
        fg: 'green',
        border: { fg: 'green' },
        hover: { fg: 'white', bg: 'green' },
      },
    });

    // EXIT button
    this.elements.exitBtn = this.renderer.createButton({
      top: dims.height - 4,
      left: Math.floor(dims.width * 0.6),
      width: 12,
      height: 3,
      content: '{center}[SALIR]{/center}',
      tags: true,
      border: 'line',
      style: {
        fg: 'red',
        border: { fg: 'red' },
        hover: { fg: 'white', bg: 'red' },
      },
    });

    // Wire up buttons
    if (this.elements.newRunBtn) {
      this.elements.newRunBtn.on('click', () => {
        if (this.callbacks.onNewRun) this.callbacks.onNewRun();
      });
    }

    if (this.elements.exitBtn) {
      this.elements.exitBtn.on('click', () => {
        if (this.callbacks.onExit) this.callbacks.onExit();
      });
    }

    // Keyboard shortcuts
    this.renderer.screen.key(['n'], () => {
      if (this.callbacks.onNewRun) this.callbacks.onNewRun();
    });
    this.renderer.screen.key(['x'], () => {
      if (this.callbacks.onExit) this.callbacks.onExit();
    });
  }

  registerCallback(event, fn) {
    this.callbacks[event] = fn;
  }

  update(runStats) {
    this.runStats = runStats;
    this.renderStats();
  }

  renderStats() {
    if (!this.runStats || !this.elements.main) return;

    const s = this.runStats;
    const mins = Math.floor(s.duration / 60);
    const secs = s.duration % 60;

    let c = '';

    // Header
    if (s.isFailed) {
      c += '{red-fg}';
      c += '  ╔═══════════════════════════════════╗\n';
      c += '  ║    ✕  GAME OVER — ESTRÉS MÁXIMO  ✕   ║\n';
      c += '  ║  La presión del mando te ha destruido  ║\n';
      c += '  ╚═══════════════════════════════════╝\n';
      c += '{/red-fg}\n';
    } else if (s.isWon) {
      c += '{yellow-fg}';
      c += '  ╔═══════════════════════════════════╗\n';
      c += '  ║  ✦  VICTORIA — LOS MUERTOS CAEN  ✦   ║\n';
      c += '  ║   Has sobrevivido al asedio infernal   ║\n';
      c += '  ╚═══════════════════════════════════╝\n';
      c += '{/yellow-fg}\n';
    } else {
      c += '{cyan-fg}';
      c += '  ╔═══════════════════════════════════╗\n';
      c += '  ║         ⚰  FIN DE PARTIDA  ⚰        ║\n';
      c += '  ╚═══════════════════════════════════╝\n';
      c += '{/cyan-fg}\n';
    }

    // Run info
    c += `{cyan-fg}Duración:{/cyan-fg} {white-fg}${mins}m ${secs}s{/white-fg}\n`;
    c += `{cyan-fg}Semilla:{/cyan-fg}  {gray-fg}${Math.floor(s.seed)}{/gray-fg}\n\n`;

    // Battles
    c += '{magenta-fg}═══ BATALLAS ═══{/magenta-fg}\n';
    c += `  Abiertas:  {yellow-fg}${s.totalBattlesOpened}{/yellow-fg}\n`;
    c += `  Victorias: {green-fg}${s.totalBattlesWon}{/green-fg}\n`;
    c += `  Derrotas:  {red-fg}${s.totalBattlesLost}{/red-fg}\n\n`;

    // Combat
    c += '{magenta-fg}═══ COMBATE ═══{/magenta-fg}\n';
    c += `  Oleadas completadas:  {green-fg}${s.totalWavesCompleted}{/green-fg}\n`;
    c += `  Enemigos derrotados:  {yellow-fg}${s.totalEnemiesKilled}{/yellow-fg}\n`;
    c += `  Unidades perdidas:    {red-fg}${s.totalUnitsLost}{/red-fg}\n\n`;

    // Economy
    c += '{magenta-fg}═══ ORO MALDITO ═══{/magenta-fg}\n';
    c += `  Oro acumulado:  {yellow-fg}${s.totalGoldEarned}g{/yellow-fg}\n`;
    c += `  Dificultad final: {red-fg}${s.difficultyMultiplier}x{/red-fg}\n\n`;

    // Battle history
    if (s.battleHistory && s.battleHistory.length > 0) {
      c += '{magenta-fg}═══ ÚLTIMAS BATALLAS ═══{/magenta-fg}\n';
      s.battleHistory.slice(-5).forEach((b, i) => {
        const status = b.won ? '{green-fg}VICTORIA{/green-fg}' : '{red-fg}DERROTA{/red-fg}';
        c += `  [${i + 1}] ${b.commander} — Oleada ${b.wave} ${status}\n`;
        c += `      {gray-fg}${b.enemiesKilled} enemigos, ${b.unitsLost} caídos{/gray-fg}\n`;
      });
    }

    c += '\n{gray-fg}[N] Nueva Partida   [X] Salir{/gray-fg}';

    this.elements.main.setContent(c);
  }

  render() {
    super.render();
  }
}

module.exports = EndScreen;
