/**
 * ╔═══════════════════════════════════════════╗
 * ║  Renderer - El Espejo del Abismo           ║
 * ╚═══════════════════════════════════════════╝
 *
 * The terminal is your window into darkness.
 * Blessed be the framework that renders the damned.
 */

const blessed = require('blessed');

class Renderer {
  constructor() {
    this.screen = blessed.screen({
      mouse: true,
      title: '⚰ ARMY COMMANDER ⚰',
      smartCSR: true,
      fullUnicode: true,
      style: {
        bg: 'black',
        border: { fg: 'cyan' },
      },
    });

    // Global exit — only Ctrl+C (q/escape conflict with chat input)
    this.screen.key(['C-c'], () => process.exit(0));
  }

  createBox(options) {
    return blessed.box({
      parent: this.screen,
      ...options,
      style: {
        border: { fg: 'cyan' },
        ...options.style,
      },
    });
  }

  createText(options) {
    return blessed.box({
      parent: this.screen,
      ...options,
    });
  }

  createButton(options) {
    return blessed.box({
      parent: this.screen,
      mouse: true,
      clickable: true,
      tags: true,
      ...options,
      style: {
        border: { fg: 'cyan' },
        focus: { fg: 'white', bg: 'blue' },
        hover: { fg: 'white', bg: 'blue' },
        ...options.style,
      },
    });
  }

  drawBorderedBox(options) {
    return this.createBox({
      border: 'line',
      ...options,
    });
  }

  render() {
    this.screen.render();
  }

  destroy() {
    this.screen.destroy();
  }

  getDimensions() {
    return {
      width: this.screen.width,
      height: this.screen.height,
    };
  }
}

module.exports = Renderer;
