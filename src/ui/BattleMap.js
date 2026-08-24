/**
 * ╔══════════════════════════════════════╗
 * ║  BattleMap - El Campo de los Caídos  ║
 * ╚══════════════════════════════════════╝
 *
 * Renders the ASCII battlefield where the damned clash.
 * Each cell is a grave waiting to be filled.
 */

const Constants = require('../utils/Constants');
const Random = require('../utils/Random');

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
    this.enemyDamageStates = {};
    if (battleState.enemies) {
      battleState.enemies.forEach((enemy) => {
        if (enemy.isAlive === true || (typeof enemy.isAlive === 'function' && enemy.isAlive())) {
          const y = Math.floor((enemy.progress / 100) * (this.height - 2));
          const x = Math.min(Math.max(Math.floor(enemy.x || 0), 1), this.width - 2);

          if (y >= 0 && y < this.height - 1) {
            const symbol = enemy.symbol || '@';
            this.setCell(x, y, symbol);
            // Track HP state for coloring
            const hpPercent = enemy.hp / enemy.maxHp;
            this.enemyDamageStates[`${x},${y}`] = hpPercent;
          }
        }
      });
    }

    // Draw friendly units (defenders of the damned)
    this.friendlyDamageStates = {};
    if (battleState.friendlyUnits) {
      battleState.friendlyUnits.forEach((unit, idx) => {
        if (unit.hp > 0) {
          const ux = unit.x != null ? Math.floor(unit.x) : 8 + (idx % 6) * 8;
          const uy = unit.y != null ? Math.floor(unit.y) : Math.floor(this.height * 0.7) + Math.floor(idx / 6);
          const x = Math.min(Math.max(ux, 1), this.width - 2);
          const y = Math.min(Math.max(uy, 0), this.height - 2);

          const symbol = unit.symbol ? unit.symbol[1] || 'U' : '?';
          this.setCell(x, y, symbol);
          // Track HP state for coloring
          const hpPercent = unit.hp / (unit.maxHp || unit.hp);
          this.friendlyDamageStates[`${x},${y}`] = hpPercent;
        }
      });
    }

    // Draw base line — the last wall before annihilation
    for (let x = 0; x < this.width; x++) {
      this.setCell(x, this.height - 1, '▔');
    }

    // Draw borders
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
    // FIX: Use seeded random for reproducible terrain
    const markers = ['·', '·', '.', '.', ','];
    for (let i = 0; i < Math.floor(this.width * this.height * 0.03); i++) {
      const x = Math.floor(Random.seededRandom() * (this.width - 2)) + 1;
      const y = Math.floor(Random.seededRandom() * (this.height - 1));
      if (this.getCell(x, y) === ' ') {
        this.setCell(x, y, Random.pickRandom(markers));
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
        const key = `${x},${y}`;

        // Enemy units — color based on HP
        if (char === '@' || char === '~' || char === '●' || char === '★') {
          const hp = this.enemyDamageStates && this.enemyDamageStates[key];
          if (hp !== undefined && hp < 0.3) {
            line += `{red-fg}${char}{/red-fg}`;
          } else {
            line += `{red-fg,bold}${char}{/red-fg,bold}`;
          }
        // Friendly units — color based on HP (green -> yellow -> red)
        } else if ('IACMU?'.includes(char)) {
          const hp = this.friendlyDamageStates && this.friendlyDamageStates[key];
          if (hp !== undefined && hp < 0.25) {
            line += `{red-fg,bold}${char}{/red-fg,bold}`;
          } else if (hp !== undefined && hp < 0.5) {
            line += `{yellow-fg,bold}${char}{/yellow-fg,bold}`;
          } else {
            line += `{green-fg,bold}${char}{/green-fg,bold}`;
          }
        } else if (char === '▔') {
          line += `{yellow-fg}${char}{/yellow-fg}`;
        } else if (char === '║') {
          line += `{magenta-fg}${char}{/magenta-fg}`;
        } else if (char === '·' || char === '.' || char === ',') {
          line += `{gray-fg}${char}{/gray-fg}`;
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
