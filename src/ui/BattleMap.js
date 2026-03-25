/**
 * ╔══════════════════════════════════════╗
 * ║  BattleMap - El Campo de los Caídos  ║
 * ╚══════════════════════════════════════╝
 *
 * Renders the ASCII battlefield where the damned clash.
 * Each cell is a grave waiting to be filled.
 */

const Constants = require('../utils/Constants');

class BattleMap {
  constructor(width, height) {
    this.width = width || Constants.BATTLE_MAP_WIDTH;
    this.height = height || Constants.BATTLE_MAP_HEIGHT;
    this.map = [];
    this.createEmpty();
  }

  /**
   * Purge the field — nothing but dust and silence
   */
  createEmpty() {
    this.map = [];
    for (let y = 0; y < this.height; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.map[y][x] = ' ';
      }
    }
  }

  /**
   * Populate the map from battle state, then return colored string
   * This is the main method: call this, get display text.
   */
  renderToString(battleState) {
    this.createEmpty();

    if (!battleState) {
      return this.toColoredString();
    }

    // Draw terrain scatter (dark atmosphere)
    this.drawTerrain();

    // Draw enemies (advancing from the abyss)
    if (battleState.enemies) {
      battleState.enemies.forEach((enemy) => {
        if (enemy.isAlive === true || (typeof enemy.isAlive === 'function' && enemy.isAlive())) {
          const y = Math.floor((enemy.progress / 100) * (this.height - 2));
          const x = Math.min(Math.max(Math.floor(enemy.x || 0), 1), this.width - 2);

          if (y >= 0 && y < this.height - 1) {
            this.setCell(x, y, enemy.symbol || '@');
          }
        }
      });
    }

    // Draw friendly units (defenders of the damned)
    if (battleState.friendlyUnits) {
      battleState.friendlyUnits.forEach((unit, idx) => {
        if (unit.hp > 0) {
          // Use actual x/y if available, else fallback to formation grid
          const ux = unit.x != null ? Math.floor(unit.x) : 8 + (idx % 6) * 8;
          const uy = unit.y != null ? Math.floor(unit.y) : Math.floor(this.height * 0.7) + Math.floor(idx / 6);
          const x = Math.min(Math.max(ux, 1), this.width - 2);
          const y = Math.min(Math.max(uy, 0), this.height - 2);

          this.setCell(x, y, unit.symbol ? unit.symbol[1] || 'U' : '?');
        }
      });
    }

    // Draw base line — the last wall before annihilation
    for (let x = 0; x < this.width; x++) {
      this.setCell(x, this.height - 1, '▔');
    }

    // Draw borders — the walls of the condemned
    for (let y = 0; y < this.height; y++) {
      this.setCell(0, y, '║');
      this.setCell(this.width - 1, y, '║');
    }

    return this.toColoredString();
  }

  /**
   * Scatter atmospheric terrain markers
   */
  drawTerrain() {
    // Sparse terrain for atmosphere
    const markers = ['·', '·', '.', '.', ','];
    for (let i = 0; i < Math.floor(this.width * this.height * 0.03); i++) {
      const x = Math.floor(Math.random() * (this.width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - 1));
      if (this.getCell(x, y) === ' ') {
        this.setCell(x, y, markers[Math.floor(Math.random() * markers.length)]);
      }
    }
  }

  setCell(x, y, char) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.map[y][x] = char;
    }
  }

  getCell(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.map[y][x];
    }
    return ' ';
  }

  toString() {
    return this.map.map((row) => row.join('')).join('\n');
  }

  /**
   * Render with blessed color tags — the battlefield made visible
   */
  toColoredString() {
    const lines = [];

    for (let y = 0; y < this.height; y++) {
      let line = '';
      for (let x = 0; x < this.width; x++) {
        const char = this.map[y][x];

        if (char === '@' || char === '~' || char === '●' || char === '★') {
          line += `{red-fg}${char}{/red-fg}`;
        } else if ('IACMU?'.includes(char)) {
          line += `{green-fg}${char}{/green-fg}`;
        } else if (char === '▔') {
          line += `{yellow-fg}${char}{/yellow-fg}`;
        } else if (char === '║') {
          line += `{cyan-fg}${char}{/cyan-fg}`;
        } else if (char === '·' || char === '.' || char === ',') {
          line += `{black-fg}${char}{/black-fg}`;
        } else {
          line += char;
        }
      }
      lines.push(line);
    }

    return lines.join('\n');
  }
}

module.exports = BattleMap;
