/**
 * BattleMap - renders ASCII representation of battle
 */

class BattleMap {
  constructor(width, height) {
    this.width = width || 60;
    this.height = height || 12;
    this.map = [];
    this.createEmpty();
  }

  /**
   * Create empty map grid
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
   * Render grid to string for display
   */
  render(battleState) {
    this.createEmpty();

    if (!battleState) {
      return this.toString();
    }

    // Draw enemies (top to bottom based on progress)
    if (battleState.enemies) {
      battleState.enemies.forEach((enemy) => {
        if (enemy.isAlive) {
          // Progress determines Y position (0-100 maps to 0-height)
          const y = Math.floor((enemy.progress / 100) * (this.height - 2));
          const x = Math.min(Math.max(Math.floor(enemy.x), 0), this.width - 1);

          if (y >= 0 && y < this.height - 1) {
            this.setCell(x, y, enemy.symbol || '@');
          }
        }
      });
    }

    // Draw friendly units (positioned in lower area)
    if (battleState.friendlyUnits) {
      battleState.friendlyUnits.forEach((unit, idx) => {
        if (unit.hp > 0) {
          const baseY = Math.floor(this.height * 0.65);
          const y = Math.min(baseY + Math.floor(idx / 4), this.height - 2);
          const x = Math.min(10 + (idx % 4) * 8, this.width - 1);

          this.setCell(x, y, unit.symbol || '[?]');
        }
      });
    }

    // Draw base line
    for (let x = 0; x < this.width; x++) {
      this.setCell(x, this.height - 1, '▔');
    }

    // Draw sides
    for (let y = 0; y < this.height; y++) {
      this.setCell(0, y, '║');
      this.setCell(this.width - 1, y, '║');
    }

    return this.toString();
  }

  /**
   * Set cell value safely
   */
  setCell(x, y, char) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.map[y][x] = char;
    }
  }

  /**
   * Get cell value
   */
  getCell(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.map[y][x];
    }
    return ' ';
  }

  /**
   * Convert map to string for rendering
   */
  toString() {
    return this.map.map((row) => row.join('')).join('\n');
  }

  /**
   * Get map as rendered text with colors
   */
  toColoredString() {
    const lines = [];

    for (let y = 0; y < this.height; y++) {
      let line = '';
      for (let x = 0; x < this.width; x++) {
        const char = this.map[y][x];

        // Simple color mapping
        if (char === '@' || char === '~' || char === '●') {
          // Enemy color
          line += `{red}${char}{/red}`;
        } else if (char === '[' || char.match(/[IACMU]/)) {
          // Friendly unit color
          line += `{green}${char}{/green}`;
        } else if (char === '▔') {
          // Base line
          line += `{yellow}${char}{/yellow}`;
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
