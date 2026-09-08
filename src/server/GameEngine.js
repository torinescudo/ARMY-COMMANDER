const Constants = require('../utils/Constants');
const Logger = require('../utils/Logger');
const Random = require('../utils/Random');
const Shop = require('../core/Shop');
const Stress = require('../core/Stress');
const Battle = require('../core/Battle');
const Run = require('../core/Run');
const BattleMap = require('../ui/BattleMap');
const CommanderGenerator = require('../generation/CommanderGenerator');
const CommanderMessageGenerator = require('../generation/CommanderMessageGenerator');
const NLProcessor = require('../ai/NLProcessor');
const CommandInterpreter = require('../ai/CommandInterpreter');

class GameEngine {
  constructor() {
    this.mode = 'intro';
    this.running = false;
    this.frameCount = 0;
    this.lastFrameTime = 0;

    this.shop = null;
    this.stress = null;
    this.commander = null;
    this.battles = [];
    this.currentRun = null;
    this.activeTabIndex = 0;

    this.nextBattleSpawnTime = 0;
    this.waveCounter = 0;

    this.nlProcessor = new NLProcessor();
    this.battleMap = new BattleMap(Constants.BATTLE_MAP_WIDTH, Constants.BATTLE_MAP_HEIGHT);

    this.chatMessages = [];
    this.pendingChatMessages = [];

    this.onStateChange = null;
    this.onChat = null;
  }

  startGame() {
    this.commander = CommanderGenerator.generateCommander();
    this.shop = new Shop();
    this.stress = new Stress();
    this.battles = [];
    this.activeTabIndex = 0;
    this.chatMessages = [];
    this.pendingChatMessages = [];
    this.waveCounter = 0;
    this.currentRun = new Run(this.commander);
    this.nextBattleSpawnTime = Date.now() + Constants.BATTLE_SPAWN_INITIAL_DELAY_MS;
    this.mode = 'hub';
    this.running = true;
    this.lastFrameTime = Date.now();
    Logger.info(`Partida iniciada: ${this.commander.name}`);
  }

  update() {
    if (!this.running || this.mode === 'intro' || this.mode === 'end') return;

    const now = Date.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.shop.updateGold(deltaTime);
    this.updateBattles(deltaTime);
    this.spawnNewBattlesIfNeeded();

    if (this.stress.isGameOver() && this.mode !== 'end') {
      this.endCurrentRun('stress_max');
      return;
    }

    this.frameCount++;
  }

  updateBattles(deltaTime) {
    this.battles.forEach((battle) => {
      battle.update(deltaTime);

      const confirmedIds = battle.getConfirmedUnits();
      confirmedIds.forEach((unitId) => {
        const idx = this.shop.inventory.findIndex((u) => u.id === unitId);
        if (idx !== -1) this.shop.inventory.splice(idx, 1);
      });

      const pendingStress = battle.consumePendingStress();
      if (pendingStress > 0) {
        this.stress.add(pendingStress, `battle_${battle.id}`);
      } else if (pendingStress < 0) {
        this.stress.reduce(Math.abs(pendingStress), `battle_${battle.id}_relief`);
      }
    });

    this.syncBattleChat();

    const finished = this.battles.filter((b) => !b.isActive);
    finished.forEach((battle) => {
      const remaining = battle.consumePendingStress();
      if (remaining > 0) this.stress.add(remaining, `battle_${battle.id}_final`);
      else if (remaining < 0) this.stress.reduce(Math.abs(remaining), `battle_${battle.id}_final_relief`);

      battle.unitDispatchQueue.forEach((d) => this.shop.inventory.push(d.unit));

      if (battle.isLost && this.currentRun) {
        this.currentRun.recordBattle(battle, false);
      } else if (battle.isWon && this.currentRun) {
        this.shop.addGold(battle.goldReward);
        this.currentRun.recordBattle(battle, true);
        this.currentRun.recordWaveCompletion(battle.currentWave, battle.goldReward);
      }
    });

    this.battles = this.battles.filter((b) => b.isActive);

    if (this.activeTabIndex >= this.battles.length) {
      this.activeTabIndex = Math.max(0, this.battles.length - 1);
    }

    if (this.battles.length === 0 && this.mode === 'battle') {
      this.mode = 'hub';
    }
  }

  syncBattleChat() {
    const battle = this.getActiveBattle();
    if (!battle) return;
    const msgs = battle.getRecentMessages(5);
    msgs.forEach((msg) => {
      if (msg.type === 'commander' && !msg._synced) {
        this.addChat(msg.speaker, msg.text, 'urgent');
        msg._synced = true;
      }
    });
  }

  spawnNewBattlesIfNeeded() {
    const now = Date.now();
    if (this.battles.length >= Constants.BATTLE_MAX_CONCURRENT) return;
    if (now < this.nextBattleSpawnTime) return;

    const chance = Math.min(0.5 + this.waveCounter * 0.05, 0.9);
    if (Random.seededRandom() < chance) {
      this.openNewBattle();
    }

    const minI = Constants.BATTLE_SPAWN_MIN_INTERVAL_MS;
    const maxI = Constants.BATTLE_SPAWN_MAX_INTERVAL_MS;
    this.nextBattleSpawnTime = now + minI + Random.seededRandom() * (maxI - minI);
  }

  openNewBattle() {
    if (this.battles.length >= Constants.BATTLE_MAX_CONCURRENT) return;

    const battleCommander = CommanderGenerator.generateCommander();
    const battle = new Battle(battleCommander);
    this.battles.push(battle);
    this.stress.add(Constants.STRESS_PER_NEW_BATTLE, `new_battle_${battle.id}`);
    battle.startWave();
    this.mode = 'battle';
    this.activeTabIndex = this.battles.length - 1;
    Logger.info(`Nueva batalla: ${battleCommander.name}`);
  }

  getActiveBattle() {
    return this.battles[this.activeTabIndex] || null;
  }

  switchTab(index) {
    if (index >= 0 && index < this.battles.length) {
      this.activeTabIndex = index;
    }
  }

  handleCommand(text) {
    const battle = this.getActiveBattle();
    if (!battle) {
      this.addChat('Sistema', 'No hay batalla activa', 'system');
      return;
    }

    this.addChat('Tú', text, 'player');
    battle.addMessage('Tú', text, 'player');

    const parsed = this.nlProcessor.parseCommand(text);
    if (!parsed.success) {
      this.addChat('Sistema', `No entendido: ${parsed.error}`, 'system');
      return;
    }

    const action = CommandInterpreter.interpret(parsed, this, battle.id);
    const validation = CommandInterpreter.validate(action, this);
    if (!validation.valid) {
      this.addChat('Sistema', validation.error, 'system');
      return;
    }

    const result = CommandInterpreter.execute(action, this);
    if (result.success) {
      this.addChat('Sistema', result.message, 'system');
      battle.answerRequest();
      const response = CommanderMessageGenerator.generateResponseToAction(action, battle.commander);
      this.addChat(battle.commander.name, response, 'response');
      battle.addMessage(battle.commander.name, response, 'response');
    } else {
      this.addChat('Sistema', `Fallo: ${result.error}`, 'system');
    }
  }

  buyUnit(unitId) {
    return this.shop.purchaseUnit(unitId);
  }

  rerollCommander() {
    this.commander = CommanderGenerator.generateCommander();
  }

  sendUnitsToBattle(units, battleId, distance) {
    const battle = this.battles.find((b) => b.id === battleId);
    if (battle) battle.sendUnits(units, distance);
  }

  addChat(speaker, text, type) {
    const msg = { speaker, text, type, timestamp: Date.now() };
    this.chatMessages.push(msg);
    if (this.chatMessages.length > 100) this.chatMessages = this.chatMessages.slice(-100);
    this.pendingChatMessages.push(msg);
  }

  consumePendingChat() {
    const msgs = this.pendingChatMessages;
    this.pendingChatMessages = [];
    return msgs;
  }

  endCurrentRun(reason) {
    if (!this.currentRun) return;
    this.currentRun.endRun(reason);
    this.mode = 'end';
    this.running = false;
  }

  restart() {
    this.mode = 'intro';
    this.running = false;
  }

  getState() {
    const state = {
      mode: this.mode,
      frameCount: this.frameCount,
    };

    if (this.mode === 'intro') return state;

    state.commander = this.commander ? this.commander.getState() : null;
    state.shop = this.shop ? this.shop.getState() : null;
    state.stress = this.stress ? this.stress.getState() : null;
    state.activeTabIndex = this.activeTabIndex;

    state.battles = this.battles.map((b) => {
      const bs = b.getState();
      bs.map = this.battleMap.renderToString(bs);
      return bs;
    });

    state.tabs = this.battles.map((b, i) => {
      const hpPct = b.commander.health / b.commander.maxHealth;
      return {
        index: i,
        name: b.commander.name.split(' ')[0],
        wave: b.currentWave,
        active: i === this.activeTabIndex,
        status: b.isLost ? 'lost' : b.isWon ? 'won' : hpPct < 0.2 ? 'critical' : hpPct < 0.5 ? 'danger' : 'normal',
      };
    });

    state.chatMessages = this.chatMessages.slice(-15);

    if (this.mode === 'end' && this.currentRun) {
      state.runStats = this.currentRun.getStats();
    }

    return state;
  }
}

module.exports = GameEngine;
