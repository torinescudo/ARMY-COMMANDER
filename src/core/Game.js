/**
 * Main Game class - orchestrates the game loop and state
 */

const Constants = require('../utils/Constants');
const Logger = require('../utils/Logger');
const Shop = require('./Shop');
const Stress = require('./Stress');
const Battle = require('./Battle');
const HubScreen = require('../ui/HubScreen');
const Renderer = require('../ui/Renderer');
const TabManager = require('../ui/TabManager');
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
    this.selectedCommanderForBattle = null; // Commander to deploy in battle
    this.battles = []; // Active Battle objects
    this.inventory = []; // Player inventory (alias to shop.inventory)

    // Battle management
    this.tabManager = null;
    this.nextBattleSpawnTime = 0;
    this.battleSpawnDelay = 8000; // 8s before first battle
    this.waveCounter = 0;

    // UI
    this.renderer = null;
    this.hubScreen = null;
    this.currentScreenMode = 'hub'; // 'hub' or 'battle'
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

    // Create tab manager for battles
    this.tabManager = new TabManager(this.renderer);

    // Schedule first battle spawn
    this.nextBattleSpawnTime = Date.now() + this.battleSpawnDelay;

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

    // Update all active battles
    this.updateBattles(deltaTimeMs);

    // Spawn new battles randomly
    this.spawnNewBattlesIfNeeded();

    // Check game over condition
    if (this.stress.isGameOver()) {
      this.running = false;
      Logger.info('Game Over! Stress reached maximum');
    }

    // Update current screen
    if (this.currentScreenMode === 'hub') {
      this.updateHubScreen();
    } else if (this.currentScreenMode === 'battle') {
      this.updateBattleScreen();
    }
  }

  /**
   * Update all active battles
   */
  updateBattles(deltaTimeMs) {
    // Update each battle
    this.battles.forEach((battle) => {
      battle.update(deltaTimeMs);
    });

    // Remove completed/lost battles
    const activeBattles = this.battles.filter((b) => b.isActive);
    const finishedBattles = this.battles.filter((b) => !b.isActive);

    finishedBattles.forEach((battle) => {
      if (battle.isLost) {
        this.stress.add(10, `battle_lost_${battle.id}`);
        Logger.info(`Battle lost: ${battle.commander.name}`);
      } else if (battle.isWon) {
        this.shop.addGold(battle.goldReward);
        this.stress.reduce(15, `battle_won_${battle.id}`);
        Logger.info(`Battle won! Gold: +${battle.goldReward}`);
      }

      // Remove from tab manager
      this.tabManager.removeBattle(battle.id);
    });

    this.battles = activeBattles;
  }

  /**
   * Spawn new battles randomly
   */
  spawnNewBattlesIfNeeded() {
    const now = Date.now();

    // Don't spawn if max tabs reached
    if (this.tabManager.battles.length >= this.tabManager.maxTabs) {
      return;
    }

    // Check if time to spawn new battle
    if (now < this.nextBattleSpawnTime) {
      return;
    }

    // Random chance based on wave count
    const chance = Math.min(0.5 + this.waveCounter * 0.05, 0.9);
    if (Math.random() < chance) {
      this.openNewBattle();
    }

    // Schedule next potential spawn
    this.nextBattleSpawnTime = now + (Math.random() * 5000 + 3000); // 3-8s
  }

  /**
   * Open a new battle with a cloned commander
   */
  openNewBattle() {
    // Clone current commander for this battle
    const battleCommander = CommanderGenerator.generateCommander();

    // Create battle
    const battle = new Battle(battleCommander);
    this.battles.push(battle);

    // Add to tab manager
    const added = this.tabManager.addBattle(battle);
    if (!added) {
      this.battles.pop();
      return;
    }

    // Increase stress for new battle
    this.stress.add(2, `new_battle_${battle.id}`);

    // Start first wave
    battle.startWave();

    this.currentScreenMode = 'battle';
    Logger.info(`New battle spawned: ${battleCommander.name}`);
  }

  /**
   * Update battle screen
   */
  updateBattleScreen() {
    const battleStates = this.tabManager.getAllBattleStates();
    this.tabManager.updateAllTabs(battleStates);
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
    if (this.currentScreenMode === 'hub') {
      this.hubScreen.render();
    } else if (this.currentScreenMode === 'battle') {
      this.tabManager.render();
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
   * Send units to a battle
   */
  sendUnitsToBattle(units, battleId, distance = 0) {
    const battle = this.battles.find((b) => b.id === battleId);
    if (battle) {
      battle.sendUnits(units, distance);

      // Remove units from inventory
      units.forEach((unit) => {
        const idx = this.shop.inventory.findIndex((u) => u.id === unit.id);
        if (idx !== -1) {
          this.shop.inventory.splice(idx, 1);
        }
      });

      Logger.info(`Sent ${units.length} units to battle ${battleId}`);
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
      currentScreenMode: this.currentScreenMode,
      commander: this.commander?.getState(),
      shop: this.shop.getState(),
      stress: this.stress.getState(),
      battles: this.battles.map((b) => ({
        id: b.id,
        commander: b.commander.name,
        wave: b.currentWave,
        status: b.isLost ? 'lost' : b.isWon ? 'won' : 'active',
      })),
    };
  }
}

module.exports = Game;
