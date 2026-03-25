/**
 * Main Game class - orchestrates the game loop and state
 */

const Constants = require('../utils/Constants');
const Logger = require('../utils/Logger');
const Shop = require('./Shop');
const Stress = require('./Stress');
const HubScreen = require('../ui/HubScreen');
const Renderer = require('../ui/Renderer');
const CommanderGenerator = require('../generation/CommanderGenerator');

class Game {
  constructor() {
    this.running = true;
    this.paused = false;
    this.currentScreen = 'hub'; // 'hub' | 'battle'
    this.frameCount = 0;
    this.deltaTime = 0;
    this.lastFrameTime = 0;

    // Game systems
    this.shop = new Shop();
    this.stress = new Stress();
    this.commander = null; // Selected commander
    this.battles = []; // Active battles (Phase 2+)
    this.inventory = []; // Player inventory (alias to shop.inventory)

    // UI
    this.renderer = null;
    this.hubScreen = null;
  }

  /**
   * Initialize the game
   */
  initialize() {
    Logger.info('Initializing game...');

    // Create renderer
    this.renderer = new Renderer();

    // Generate initial commander
    this.commander = CommanderGenerator.generateCommander();
    Logger.info('Generated commander:', this.commander.name);

    // Create HUB screen
    this.hubScreen = new HubScreen(this.renderer);
    this.hubScreen.create();
    this.hubScreen.update({
      commander: this.commander.getState(),
      shop: this.shop.getState(),
      stress: this.stress.getState(),
    });

    this.lastFrameTime = Date.now();
    Logger.info('Game initialized');
  }

  /**
   * Main game loop
   */
  run() {
    Logger.info('Starting game loop...');

    const loop = () => {
      if (!this.running) {
        this.cleanup();
        return;
      }

      try {
        const now = Date.now();
        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        if (!this.paused) {
          this.update(this.deltaTime);
          this.render();
        }

        this.frameCount++;

        // Schedule next frame
        setTimeout(loop, Constants.TICK_RATE_MS);
      } catch (error) {
        Logger.error('Error in game loop:', error);
        this.running = false;
      }
    };

    // Start the loop
    loop();
  }

  /**
   * Update game state
   */
  update(deltaTimeMs) {
    // Update shop (passive gold regen)
    this.shop.updateGold(deltaTimeMs);

    // Check game over condition
    if (this.stress.isGameOver()) {
      this.running = false;
      Logger.info('Game Over! Stress reached maximum');
    }

    // Update current screen
    if (this.currentScreen === 'hub') {
      this.updateHubScreen();
    }
  }

  /**
   * Update HUB screen state
   */
  updateHubScreen() {
    this.hubScreen.update({
      commander: this.commander.getState(),
      shop: this.shop.getState(),
      stress: this.stress.getState(),
    });
  }

  /**
   * Render current screen
   */
  render() {
    if (this.currentScreen === 'hub') {
      this.hubScreen.render();
    }
  }

  /**
   * Handle input (from HUB screen)
   */
  handleInput(inputData) {
    if (this.currentScreen === 'hub') {
      this.handleHubInput(inputData);
    }
  }

  /**
   * Handle HUB screen input
   */
  handleHubInput(inputData) {
    switch (inputData.action) {
      case 'reroll':
        this.commander = CommanderGenerator.generateCommander();
        Logger.info('Rerolled commander:', this.commander.name);
        break;

      case 'select':
        Logger.info('Selected commander:', this.commander.name);
        // TODO: In Phase 2, transition to battle screen
        break;

      case 'buyUnit':
        const success = this.shop.purchaseUnit(inputData.unitId);
        if (success) {
          Logger.info('Purchased unit:', inputData.unitId);
        } else {
          Logger.warn('Failed to purchase unit');
        }
        break;
    }
  }

  /**
   * Cleanup on exit
   */
  cleanup() {
    Logger.info('Cleaning up...');
    if (this.renderer) {
      this.renderer.destroy();
    }
  }

  /**
   * Get game state (for debugging)
   */
  getState() {
    return {
      frameCount: this.frameCount,
      running: this.running,
      paused: this.paused,
      currentScreen: this.currentScreen,
      commander: this.commander?.getState(),
      shop: this.shop.getState(),
      stress: this.stress.getState(),
    };
  }
}

module.exports = Game;
