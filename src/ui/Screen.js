/**
 * ╔═══════════════════════════════════════════╗
 * ║  Screen - El Lienzo de la Oscuridad        ║
 * ╚═══════════════════════════════════════════╝
 *
 * Every screen is a canvas painted in shadow.
 * The base upon which all visions of the abyss
 * are rendered for mortal eyes.
 */

class Screen {
  constructor(renderer) {
    this.renderer = renderer;
    this.elements = {};
  }

  /**
   * Create UI elements
   * Subclasses should override this
   */
  create() {
    throw new Error('Screen.create() must be implemented by subclass');
  }

  /**
   * Update based on game state
   * Subclasses should override this
   */
  update(state) {
    throw new Error('Screen.update() must be implemented by subclass');
  }

  /**
   * Render the screen
   * Subclasses may override this
   */
  render() {
    this.renderer.render();
  }

  /**
   * Handle input
   * Subclasses may override this
   */
  handleInput(key, data) {
    // Default implementation - override in subclasses
  }
}

module.exports = Screen;
