/**
 * Blessed terminal renderer wrapper
 */

const blessed = require('blessed');
const chalk = require('chalk');

class Renderer {
  constructor() {
    this.screen = blessed.screen({
      mouse: true,
      title: '⚰ ARMY COMMANDER ⚰',
      smartCSR: true,
      style: {
        border: {
          fg: 'cyan',
        },
      },
    });

    // Handle exit
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });
  }

  /**
   * Create a box element
   */
  createBox(options) {
    return blessed.box({
      parent: this.screen,
      ...options,
      style: {
        border: {
          fg: 'cyan',
        },
        ...options.style,
      },
    });
  }

  /**
   * Create a text element
   */
  createText(options) {
    return blessed.box({
      parent: this.screen,
      ...options,
    });
  }

  /**
   * Create a button-like element
   */
  createButton(options) {
    const button = blessed.box({
      parent: this.screen,
      mouse: true,
      clickable: true,
      ...options,
      style: {
        border: {
          fg: options.focused ? 'white' : 'cyan',
        },
        focus: {
          fg: 'white',
          bg: 'blue',
        },
        hover: {
          fg: 'white',
          bg: 'blue',
        },
        ...options.style,
      },
    });

    return button;
  }

  /**
   * Draw a bordered box with a label
   */
  drawBorderedBox(options) {
    const box = this.createBox({
      ...options,
      border: 'line',
      style: {
        border: {
          fg: 'cyan',
        },
      },
    });

    return box;
  }

  /**
   * Clear the screen
   */
  clear() {
    this.screen.destroy();
  }

  /**
   * Render the screen
   */
  render() {
    this.screen.render();
  }

  /**
   * Destroy the renderer
   */
  destroy() {
    this.screen.destroy();
  }

  /**
   * Get screen dimensions
   */
  getDimensions() {
    return {
      width: this.screen.width,
      height: this.screen.height,
    };
  }
}

module.exports = Renderer;
