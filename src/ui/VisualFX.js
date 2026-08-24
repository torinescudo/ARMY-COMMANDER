/**
 * ╔═══════════════════════════════════════════╗
 * ║  VisualFX - El Pulso del Inframundo        ║
 * ╚═══════════════════════════════════════════╝
 *
 * Screen effects: flash, pulse, shake simulation.
 * Makes the game feel alive even in a terminal.
 */

class VisualFX {
  constructor() {
    this.effects = [];
    this.flashState = null;
  }

  /**
   * Flash a border color on an element, then revert
   */
  flashBorder(element, color, durationMs = 300) {
    if (!element || !element.style || !element.style.border) return;
    const originalColor = element.style.border.fg;
    element.style.border.fg = color;

    setTimeout(() => {
      if (element.style && element.style.border) {
        element.style.border.fg = originalColor;
      }
    }, durationMs);
  }

  /**
   * Flash text content briefly
   */
  flashContent(element, flashText, originalText, durationMs = 400) {
    if (!element) return;
    element.setContent(flashText);
    setTimeout(() => {
      if (element.setContent) {
        element.setContent(originalText);
      }
    }, durationMs);
  }

  /**
   * Pulse border between two colors (for ongoing alerts)
   */
  startPulse(element, colorA, colorB, intervalMs = 500) {
    if (!element || !element.style || !element.style.border) return null;

    let toggle = false;
    const id = setInterval(() => {
      if (!element.style || !element.style.border) {
        clearInterval(id);
        return;
      }
      element.style.border.fg = toggle ? colorA : colorB;
      toggle = !toggle;
    }, intervalMs);

    return id;
  }

  stopPulse(pulseId) {
    if (pulseId) clearInterval(pulseId);
  }

  /**
   * Generate damage flash text for the header
   */
  getDamageIndicator(damage) {
    if (damage >= 10) return '{red-fg,bold,blink}  ▓▓▓ DAÑO CRÍTICO ▓▓▓  {/red-fg,bold,blink}';
    if (damage >= 5) return '{red-fg,bold}  ▒▒ DAÑO ▒▒  {/red-fg,bold}';
    return '{yellow-fg}  ░ golpe ░  {/yellow-fg}';
  }

  /**
   * Generate stress indicator for the UI
   */
  getStressIndicator(stressPercent) {
    if (stressPercent >= 90) return '{red-fg,bold,blink}⚠ COLAPSO INMINENTE ⚠{/red-fg,bold,blink}';
    if (stressPercent >= 75) return '{red-fg,bold}⚠ ESTRÉS CRÍTICO{/red-fg,bold}';
    if (stressPercent >= 50) return '{yellow-fg}⚠ Tensión alta{/yellow-fg}';
    if (stressPercent >= 25) return '{yellow-fg}Bajo presión{/yellow-fg}';
    return '{green-fg}Estable{/green-fg}';
  }

  /**
   * Get dynamic color for a health percentage
   */
  getHpColor(percent) {
    if (percent <= 0.15) return 'red';
    if (percent <= 0.3) return 'red';
    if (percent <= 0.5) return 'yellow';
    if (percent <= 0.75) return 'green';
    return 'green';
  }

  /**
   * Generate a styled HP bar with gradient effect
   */
  renderHpBar(current, max, length = 12) {
    const percent = Math.max(0, current / max);
    const filled = Math.round(percent * length);
    const empty = length - filled;
    const color = this.getHpColor(percent);

    const fullBlocks = '█'.repeat(filled);
    const emptyBlocks = '░'.repeat(empty);

    return `{${color}-fg}${fullBlocks}{/${color}-fg}{gray-fg}${emptyBlocks}{/gray-fg}`;
  }

  /**
   * Screen shake — offset an element briefly, then snap back
   */
  shake(element, intensity = 1, durationMs = 200) {
    if (!element) return;
    const origLeft = element.left;
    const origTop = element.top;

    element.left = origLeft + intensity;
    setTimeout(() => {
      if (element.left !== undefined) element.left = origLeft - intensity;
    }, durationMs / 4);
    setTimeout(() => {
      if (element.left !== undefined) element.left = origLeft + Math.ceil(intensity / 2);
    }, durationMs / 2);
    setTimeout(() => {
      if (element.left !== undefined) {
        element.left = origLeft;
        element.top = origTop;
      }
    }, durationMs);
  }

  /**
   * Vignette effect — dim border when HP is critical
   */
  getVignetteChars(hpPercent) {
    if (hpPercent < 0.15) return { h: '▓', v: '▓' };
    if (hpPercent < 0.3) return { h: '▒', v: '▒' };
    if (hpPercent < 0.5) return { h: '░', v: '░' };
    return { h: '═', v: '║' };
  }

  /**
   * Wave completion celebration text
   */
  getVictoryBanner() {
    return [
      '{green-fg,bold}',
      '  ╔═══════════════════════════════════╗',
      '  ║  ✦ ✦ ✦  OLEADA REPELIDA  ✦ ✦ ✦  ║',
      '  ╚═══════════════════════════════════╝',
      '{/green-fg,bold}',
    ].join('\n');
  }

  /**
   * Defeat banner
   */
  getDefeatBanner() {
    return [
      '{red-fg,bold}',
      '  ╔═══════════════════════════════════╗',
      '  ║  ✕ ✕ ✕   DERROTA TOTAL   ✕ ✕ ✕  ║',
      '  ║    El comandante ha caído...      ║',
      '  ╚═══════════════════════════════════╝',
      '{/red-fg,bold}',
    ].join('\n');
  }
}

module.exports = new VisualFX();
