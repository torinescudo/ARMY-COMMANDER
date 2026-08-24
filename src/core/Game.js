/**
 * ╔═══════════════════════════════════════════════╗
 * ║  Game - El Corazón del Inframundo              ║
 * ╚═══════════════════════════════════════════════╝
 *
 * The main loop — a heartbeat echoing through
 * every battlefield, every commander's scream,
 * every unit's last breath. You are the puppet master.
 * The stress is real. The death is permanent.
 */

const Constants = require('../utils/Constants');
const Logger = require('../utils/Logger');
const Random = require('../utils/Random');
const Shop = require('./Shop');
const Stress = require('./Stress');
const Battle = require('./Battle');
const Run = require('./Run');
const HubScreen = require('../ui/HubScreen');
const Renderer = require('../ui/Renderer');
const TabManager = require('../ui/TabManager');
const ChatPanel = require('../ui/ChatPanel');
const EndScreen = require('../ui/EndScreen');
const CommanderGenerator = require('../generation/CommanderGenerator');
const CommanderMessageGenerator = require('../generation/CommanderMessageGenerator');
const NLProcessor = require('../ai/NLProcessor');
const CommandInterpreter = require('../ai/CommandInterpreter');

class Game {
  constructor() {
    this.running = true;
    this.paused = false;
    this.currentScreenMode = 'hub'; // 'hub' | 'battle' | 'end'
    this.frameCount = 0;
    this.deltaTime = 0;
    this.lastFrameTime = 0;

    // Core systems
    this.shop = new Shop();
    this.stress = new Stress();
    this.commander = null;
    this.battles = [];

    // Battle spawning
    this.tabManager = null;
    this.nextBattleSpawnTime = 0;
    this.waveCounter = 0;

    // Chat and NL
    this.chatPanel = null;
    this.nlProcessor = new NLProcessor();

    // Run tracking
    this.currentRun = null;

    // UI
    this.renderer = null;
    this.hubScreen = null;
    this.endScreen = null;
  }

  /**
   * Initialize — summon the interface from the void
   */
  initialize() {
    Logger.info('Invocando el Inframundo...');

    this.renderer = new Renderer();

    // Generate initial commander
    this.commander = CommanderGenerator.generateCommander();
    Logger.info(`Comandante invocado: ${this.commander.name}`);

    // Create HUB screen
    this.hubScreen = new HubScreen(this.renderer);
    this.hubScreen.create();

    // Wire up HUB callbacks
    this.hubScreen.registerCallback('onSelect', () => {
      Logger.info(`Comandante seleccionado: ${this.commander.name}`);
      // Selection acknowledged — battles will spawn automatically
    });

    this.hubScreen.registerCallback('onReroll', () => {
      this.commander = CommanderGenerator.generateCommander();
      Logger.info(`Nuevo comandante: ${this.commander.name}`);
    });

    this.hubScreen.registerCallback('onBuyUnit', (unitId) => {
      const success = this.shop.purchaseUnit(unitId);
      if (success) {
        Logger.info(`Unidad adquirida: ${unitId}`);
      } else {
        Logger.warn('Compra fallida (sin oro o inventario lleno)');
      }
    });

    this.hubScreen.update({
      commander: this.commander.getState(),
      shop: this.shop.getState(),
      stress: this.stress.getState(),
    });

    // Create tab manager
    this.tabManager = new TabManager(this.renderer);

    // Create chat panel
    this.chatPanel = new ChatPanel(this.renderer);
    this.chatPanel.create();
    this.chatPanel.registerCallback('onSubmit', (text) => {
      this.handleChatInput(text);
    });

    // Create end screen
    this.endScreen = new EndScreen(this.renderer);
    this.endScreen.create();
    this.endScreen.registerCallback('onNewRun', () => {
      this.restartGame();
    });
    this.endScreen.registerCallback('onExit', () => {
      this.running = false;
    });

    // Wire up global tab switching keys
    this.renderer.screen.key(['tab'], () => {
      if (this.currentScreenMode === 'battle' && this.tabManager.battles.length > 1) {
        const next = (this.tabManager.currentTabIndex + 1) % this.tabManager.battles.length;
        this.tabManager.switchTab(next);
      }
    });

    this.renderer.screen.key(['1', '2', '3', '4', '5'], (ch) => {
      if (this.currentScreenMode === 'battle') {
        const idx = parseInt(ch, 10) - 1;
        this.tabManager.switchTab(idx);
      }
    });

    // Start run
    this.startNewRun();

    // Schedule first battle
    this.nextBattleSpawnTime = Date.now() + Constants.BATTLE_SPAWN_INITIAL_DELAY_MS;

    // Start in hub mode
    this.hubScreen.show();
    this.endScreen.hide();
    this.chatPanel.hide();

    this.lastFrameTime = Date.now();
    Logger.info('El Inframundo despierta');
  }

  switchScreenMode(mode) {
    if (mode === this.currentScreenMode) return;

    // Hide current
    switch (this.currentScreenMode) {
      case 'hub':
        this.hubScreen.hide();
        break;
      case 'battle':
        this.tabManager.hide();
        this.chatPanel.hide();
        break;
      case 'end':
        this.endScreen.hide();
        break;
    }

    this.currentScreenMode = mode;

    // Show new
    switch (mode) {
      case 'hub':
        this.hubScreen.show();
        break;
      case 'battle':
        this.tabManager.show();
        this.chatPanel.show();
        break;
      case 'end':
        this.endScreen.show();
        break;
    }
  }

  /**
   * The eternal loop — every tick, the dead advance
   */
  run() {
    Logger.info('Iniciando ciclo de juego...');

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
          try {
            this.update(this.deltaTime);
          } catch (error) {
            Logger.error('Fatal error in update:', error);
            this.running = false;
            return;
          }

          try {
            this.render();
          } catch (error) {
            Logger.error('Render error (continuing):', error);
          }
        }

        this.frameCount++;
        setTimeout(loop, Constants.TICK_RATE_MS);
      } catch (error) {
        Logger.error('Fatal error in game loop:', error);
        this.running = false;
      }
    };

    loop();
  }

  /**
   * Update — the pulse of war
   */
  update(deltaTimeMs) {
    // Economy ticks
    this.shop.updateGold(deltaTimeMs);

    // Update all active battles
    this.updateBattles(deltaTimeMs);

    // Spawn new battles
    this.spawnNewBattlesIfNeeded();

    // Game over check
    if (this.stress.isGameOver() && this.currentScreenMode !== 'end') {
      this.endCurrentRun('stress_max');
      return;
    }

    // Update current screen
    switch (this.currentScreenMode) {
      case 'hub':
        this.hubScreen.update({
          commander: this.commander.getState(),
          shop: this.shop.getState(),
          stress: this.stress.getState(),
        });
        break;

      case 'battle':
        this.updateBattleScreens();
        break;

      case 'end':
        // End screen is static after initial render
        break;
    }
  }

  /**
   * Update all active battles — consume their stress
   */
  updateBattles(deltaTimeMs) {
    this.battles.forEach((battle) => {
      battle.update(deltaTimeMs);

      // Remove confirmed units from inventory (they've arrived at the battle)
      const confirmedUnitIds = battle.getConfirmedUnits();
      confirmedUnitIds.forEach((unitId) => {
        const idx = this.shop.inventory.findIndex((u) => u.id === unitId);
        if (idx !== -1) this.shop.inventory.splice(idx, 1);
      });

      // Sync stress from battle to game (continuous)
      const pendingStress = battle.consumePendingStress();
      if (pendingStress > 0) {
        this.stress.add(pendingStress, `battle_${battle.id}`);
      } else if (pendingStress < 0) {
        this.stress.reduce(Math.abs(pendingStress), `battle_${battle.id}_relief`);
      }
    });

    // Handle finished battles
    const finished = this.battles.filter((b) => !b.isActive);
    finished.forEach((battle) => {
      // Consume any remaining stress before removing battle
      const remainingStress = battle.consumePendingStress();
      if (remainingStress > 0) {
        this.stress.add(remainingStress, `battle_${battle.id}_final`);
      } else if (remainingStress < 0) {
        this.stress.reduce(Math.abs(remainingStress), `battle_${battle.id}_final_relief`);
      }

      // Return unconfirmed units (still in dispatch queue) back to inventory
      battle.unitDispatchQueue.forEach((dispatch) => {
        this.shop.inventory.push(dispatch.unit);
      });

      if (battle.isLost && this.currentRun) {
        this.currentRun.recordBattle(battle, false);
        Logger.info(`⚰ Batalla perdida: ${battle.commander.name}`);
      } else if (battle.isWon && this.currentRun) {
        this.shop.addGold(battle.goldReward);
        this.currentRun.recordBattle(battle, true);
        this.currentRun.recordWaveCompletion(battle.currentWave, battle.goldReward);
        Logger.info(`✦ Victoria: ${battle.commander.name} — +${battle.goldReward}g`);
      }

      this.tabManager.removeBattle(battle.id);
    });

    this.battles = this.battles.filter((b) => b.isActive);

    // If all battles ended and we're in battle mode, return to hub
    if (this.battles.length === 0 && this.currentScreenMode === 'battle') {
      this.switchScreenMode('hub');
    }
  }

  /**
   * Update battle screen displays
   */
  updateBattleScreens() {
    const states = this.battles.map((b) => b.getState());
    this.tabManager.updateAllTabs(states);

    // Update chat with messages from active battle
    const activeBattle = this.tabManager.getActiveBattle();
    if (activeBattle) {
      const msgs = activeBattle.getRecentMessages(5);
      // Sync new messages to chat panel
      msgs.forEach((msg) => {
        if (msg.type === 'commander' && !msg._synced) {
          this.chatPanel.addMessage(msg.speaker, msg.text, 'urgent', 0.8);
          msg._synced = true;
        }
      });
    }
  }

  /**
   * Spawn new battles from the abyss
   */
  spawnNewBattlesIfNeeded() {
    const now = Date.now();

    if (this.tabManager.battles.length >= Constants.BATTLE_MAX_CONCURRENT) return;
    if (now < this.nextBattleSpawnTime) return;

    // Chance increases with waves completed
    const chance = Math.min(0.5 + this.waveCounter * 0.05, 0.9);
    if (Random.seededRandom() < chance) {
      this.openNewBattle();
    }

    // Schedule next spawn check
    const minI = Constants.BATTLE_SPAWN_MIN_INTERVAL_MS;
    const maxI = Constants.BATTLE_SPAWN_MAX_INTERVAL_MS;
    this.nextBattleSpawnTime = now + minI + Random.seededRandom() * (maxI - minI);
  }

  /**
   * Open a new battle — another portal to hell
   */
  openNewBattle() {
    const battleCommander = CommanderGenerator.generateCommander();
    const battle = new Battle(battleCommander);
    this.battles.push(battle);

    const added = this.tabManager.addBattle(battle);
    if (!added) {
      this.battles.pop();
      return;
    }

    this.stress.add(Constants.STRESS_PER_NEW_BATTLE, `new_battle_${battle.id}`);
    battle.startWave();

    // Switch to battle view
    this.switchScreenMode('battle');

    Logger.info(`Nueva batalla: ${battleCommander.name}`);
  }

  /**
   * Handle chat input — parse NL and execute
   */
  handleChatInput(text) {
    const activeBattle = this.tabManager.getActiveBattle();
    if (!activeBattle) {
      this.chatPanel.addMessage('Sistema', 'No hay batalla activa', 'system');
      return;
    }

    // Show player message
    this.chatPanel.addMessage('Tú', text);
    activeBattle.addMessage('Tú', text, 'player');

    // Parse with NL processor
    const parsed = this.nlProcessor.parseCommand(text);

    if (!parsed.success) {
      this.chatPanel.addMessage('Sistema', `No entendido: ${parsed.error}`, 'system');
      return;
    }

    // Interpret → validate → execute
    const action = CommandInterpreter.interpret(parsed, this, activeBattle.id);
    const validation = CommandInterpreter.validate(action, this);

    if (!validation.valid) {
      this.chatPanel.addMessage('Sistema', validation.error, 'system');
      return;
    }

    const result = CommandInterpreter.execute(action, this);
    if (result.success) {
      this.chatPanel.addMessage('Sistema', result.message, 'system');
      activeBattle.answerRequest();

      // Commander responds
      const response = CommanderMessageGenerator.generateResponseToAction(
        action, activeBattle.commander
      );
      this.chatPanel.addMessage(activeBattle.commander.name, response, 'response');
      activeBattle.addMessage(activeBattle.commander.name, response, 'response');
    } else {
      this.chatPanel.addMessage('Sistema', `Fallo: ${result.error}`, 'system');
    }
  }

  /**
   * Send units to a battle
   */
  sendUnitsToBattle(units, battleId, distance = 0) {
    const battle = this.battles.find((b) => b.id === battleId);
    if (!battle) return;

    battle.sendUnits(units, distance);
    Logger.info(`${units.length} unidades enviadas a batalla ${battleId}`);
  }

  /**
   * Render the appropriate screen
   */
  render() {
    switch (this.currentScreenMode) {
      case 'hub':
        this.hubScreen.render();
        break;
      case 'battle':
        this.tabManager.render();
        break;
      case 'end':
        this.endScreen.render();
        break;
    }
  }

  /**
   * Start a new run — reset the realm
   */
  startNewRun(seed = null) {
    this.currentRun = new Run(this.commander, seed);
    this.waveCounter = 0;
    Logger.info(`Nueva partida. Semilla: ${Math.floor(this.currentRun.seed)}`);
  }

  /**
   * End current run — the final toll
   */
  endCurrentRun(reason = 'unknown') {
    if (!this.currentRun) return;

    this.currentRun.endRun(reason);
    this.switchScreenMode('end');
    this.endScreen.update(this.currentRun.getStats());

    Logger.info(`Partida terminada: ${reason}`);
  }

  /**
   * Restart — rise from the ashes
   */
  restartGame() {
    this.stress = new Stress();
    this.shop = new Shop();
    this.commander = CommanderGenerator.generateCommander();
    this.battles = [];
    this.tabManager.battles = [];
    this.tabManager.screens = [];
    this.tabManager.currentTabIndex = 0;
    this.chatPanel.clear();
    this.switchScreenMode('hub');
    this.startNewRun();
    this.nextBattleSpawnTime = Date.now() + Constants.BATTLE_SPAWN_INITIAL_DELAY_MS;

    Logger.info('El Inframundo renace');
  }

  /**
   * Cleanup on exit
   */
  cleanup() {
    Logger.info('Cerrando las puertas del abismo...');
    if (this.renderer) this.renderer.destroy();
  }

  /**
   * Get full game state (debug)
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
      run: this.currentRun?.getStats(),
    };
  }
}

module.exports = Game;
