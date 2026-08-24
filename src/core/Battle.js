/**
 * ╔════════════════════════════════════════════╗
 * ║  Battle - El Asedio de los Condenados       ║
 * ╚════════════════════════════════════════════╝
 *
 * Each Battle is a pocket of hell: waves of the damned
 * crash against your defenses while your commander
 * screams for reinforcements through the fog of war.
 */

const { nanoid } = require('nanoid');
const EnemyWaveGenerator = require('../generation/EnemyWaveGenerator');
const TargetingAI = require('../ai/TargetingAI');
const CommanderAI = require('../ai/CommanderAI');
const Random = require('../utils/Random');
const CommanderMessageGenerator = require('../generation/CommanderMessageGenerator');
const Constants = require('../utils/Constants');
const Logger = require('../utils/Logger');

class Battle {
  constructor(commander, battleId = null) {
    this.id = battleId || nanoid();
    this.commander = commander;
    this.createdAt = Date.now();

    // The living and the dead
    this.friendlyUnits = [];
    this.enemies = [];

    // Wave progression
    this.currentWave = 1;
    this.maxWaves = 10;
    this.waveActive = false;
    this.waveStartTime = 0;
    this.waveCooldown = 3000; // 3s between waves

    // Battle state
    this.isActive = true;
    this.isLost = false;
    this.isWon = false;

    // Map dimensions
    this.mapWidth = Constants.BATTLE_MAP_WIDTH;
    this.mapHeight = Constants.BATTLE_MAP_HEIGHT;
    this.baseProgress = 100;

    // Rewards and stress
    this.goldReward = 0;
    this.pendingStress = 0; // Accumulated stress to apply to Game

    // Unit arrival queue (distance mechanic)
    this.unitDispatchQueue = [];
    this.confirmedArrivalIds = [];

    // Chat system
    this.messages = [];
    this.lastMessageTime = Date.now();
    this.messageInterval = 8000;
    this.pendingRequest = false;
    this.requestTime = 0;
    this.lastStressTick = 0; // Prevent per-frame stress

    Logger.debug(`Battle ${this.id} forjada para ${commander.name}`);
  }

  /**
   * Unleash the next wave from the abyss
   */
  startWave() {
    if (this.currentWave > this.maxWaves) {
      this.isWon = true;
      this.isActive = false;
      return;
    }

    this.waveActive = true;
    this.waveStartTime = Date.now();
    this.enemies = EnemyWaveGenerator.generateWave(this.currentWave);

    // Assign initial positions (spread across top of map)
    this.enemies.forEach((enemy, idx) => {
      enemy.x = 5 + (idx % 8) * 6;
      enemy.y = 0;
      enemy.progress = 0;
    });

    Logger.debug(`Batalla ${this.id}: Oleada ${this.currentWave} — ${this.enemies.length} enemigos emergen`);
  }

  /**
   * Send units into the fray. Distance = delay before arrival.
   */
  sendUnits(units, distance = 0) {
    const Unit = require('./Unit');
    const delayMs = distance * 500;

    units.forEach((unit) => {
      const clone = new Unit(unit);
      clone.x = 8 + Math.floor(Random.seededRandom() * (this.mapWidth - 16));
      clone.y = Math.floor(this.mapHeight * 0.7) + Math.floor(Random.seededRandom() * 2);

      this.unitDispatchQueue.push({
        unit: clone,
        arrivalTime: Date.now() + delayMs,
      });
    });

    Logger.debug(`Batalla ${this.id}: ${units.length} unidades despachadas, llegan en ${delayMs}ms`);
  }

  /**
   * Main update — the heartbeat of carnage
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // Process unit arrivals
    this.processArrivals();

    // Update chat system
    this.updateChat();

    // Check wave completion
    if (this.waveActive && this.enemies.every((e) => !e.isAlive())) {
      this.completeWave();
    }

    // Start next wave after cooldown
    if (!this.waveActive && this.currentWave <= this.maxWaves) {
      if (Date.now() - this.waveStartTime > this.waveCooldown) {
        this.startWave();
      }
    }

    // === COMBAT PHASE ===

    // Enemy movement toward base
    this.enemies.forEach((enemy) => {
      if (enemy.isAlive()) {
        enemy.moveTowardBase(deltaTime);

        if (enemy.hasReachedBase(this.baseProgress)) {
          this.commander.takeDamage(5);
          enemy.hp = 0;
          this.pendingStress += 5;
        }
      }
    });

    // Friendly units attack enemies (type-aware targeting)
    this.friendlyUnits.forEach((unit) => {
      if (unit.hp > 0) {
        const target = TargetingAI.chooseTarget(unit, this.enemies);
        if (target && TargetingAI.isInRange(unit, target)) {
          target.takeDamage(unit.damage);
        }
      }
    });

    // === CRITICAL FIX: Enemies attack friendly units back ===
    this.enemies.forEach((enemy) => {
      if (enemy.isAlive() && this.friendlyUnits.length > 0) {
        const aliveUnits = this.friendlyUnits.filter((u) => u.hp > 0);
        if (aliveUnits.length > 0) {
          // Enemies target the nearest friendly unit
          const target = TargetingAI.getNearest(enemy, aliveUnits);
          if (target && TargetingAI.isInRange(enemy, target)) {
            target.hp = Math.max(0, target.hp - enemy.damage);
          }
        }
      }
    });

    // Remove dead friendly units
    this.friendlyUnits = this.friendlyUnits.filter((u) => u.hp > 0);

    // Commander AI positions surviving units
    CommanderAI.updatePositions(this.commander, this.friendlyUnits, this.enemies);

    // Check if commander fell
    if (!this.commander.isAlive()) {
      this.lose();
    }
  }

  /**
   * Process queued unit arrivals
   */
  processArrivals() {
    const now = Date.now();
    const arrived = this.unitDispatchQueue.filter((d) => d.arrivalTime <= now);
    arrived.forEach((dispatch) => {
      this.friendlyUnits.push(dispatch.unit);
      this.confirmedArrivalIds.push(dispatch.unit.id);
    });
    this.unitDispatchQueue = this.unitDispatchQueue.filter((d) => d.arrivalTime > now);
  }

  /**
   * Get and consume confirmed unit IDs for removal from inventory
   */
  getConfirmedUnits() {
    const ids = this.confirmedArrivalIds.slice();
    this.confirmedArrivalIds = [];
    return ids;
  }

  /**
   * Wave vanquished — collect the spoils
   */
  completeWave() {
    this.waveActive = false;
    this.currentWave++;

    this.goldReward += 50 + 10 * (this.currentWave - 1);
    this.pendingStress -= 5; // Relief

    const healAmount = Math.floor(this.commander.maxHealth * 0.2);
    this.commander.heal(healAmount);

    Logger.debug(`Batalla ${this.id}: Oleada completada. Progreso ${this.currentWave - 1}/${this.maxWaves}`);
  }

  /**
   * The commander has fallen. Darkness wins.
   */
  lose() {
    this.isActive = false;
    this.isLost = true;
    this.pendingStress += 10;

    Logger.debug(`Batalla ${this.id}: DERROTA — ${this.commander.name} ha caído`);
  }

  /**
   * Chat system — commander screams into the void
   */
  updateChat() {
    const now = Date.now();

    // Generate commander message periodically
    if (now - this.lastMessageTime > this.messageInterval) {
      const message = CommanderMessageGenerator.generateMessage(this, this.commander);

      this.messages.push({
        speaker: this.commander.name,
        text: message,
        type: 'commander',
        timestamp: now,
      });
      if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100);
      }

      this.lastMessageTime = now;
      this.pendingRequest = true;
      this.requestTime = now;
    }

    // FIX: Stress penalty for unanswered requests — once per 3 seconds, NOT per frame
    if (this.pendingRequest) {
      const unansweredMs = now - this.requestTime;
      const ticksSince = Math.floor(unansweredMs / 3000);
      const ticksApplied = Math.floor((this.lastStressTick - this.requestTime) / 3000);

      if (ticksSince > ticksApplied && ticksSince > 0) {
        this.pendingStress += 1;
        this.lastStressTick = now;
      }
    }
  }

  addMessage(speaker, text, type = 'normal') {
    this.messages.push({ speaker, text, type, timestamp: Date.now() });
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
    if (type === 'commander') {
      this.pendingRequest = true;
      this.requestTime = Date.now();
      this.lastStressTick = Date.now();
    }
  }

  answerRequest() {
    this.pendingRequest = false;
  }

  getRecentMessages(count = 10) {
    return this.messages.slice(-count);
  }

  /**
   * Consume accumulated stress (called by Game to sync)
   */
  consumePendingStress() {
    const stress = this.pendingStress;
    this.pendingStress = 0;
    return stress;
  }

  getState() {
    return {
      id: this.id,
      commander: this.commander.getState(),
      friendlyUnits: this.friendlyUnits.map((u) => ({
        id: u.id, name: u.name, type: u.type,
        hp: u.hp, maxHp: u.maxHp, damage: u.damage,
        speed: u.speed, range: u.range, symbol: u.symbol,
        x: u.x || 0, y: u.y || 0,
        isAlive: u.hp > 0,
      })),
      enemies: this.enemies.map((e) => e.getState()),
      currentWave: this.currentWave,
      maxWaves: this.maxWaves,
      waveActive: this.waveActive,
      isActive: this.isActive,
      isLost: this.isLost,
      isWon: this.isWon,
      goldReward: this.goldReward,
      pendingStress: this.pendingStress,
      map: null, // Map rendered by BattleMap, not here
      unitsInQueue: this.unitDispatchQueue.length,
      messages: this.getRecentMessages(10),
      pendingRequest: this.pendingRequest,
      createdAt: this.createdAt,
      duration: Date.now() - this.createdAt,
    };
  }
}

module.exports = Battle;
