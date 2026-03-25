/**
 * Battle class - manages a single battlefield with units and enemies
 */

const { nanoid } = require('nanoid');
const Enemy = require('./Enemy');
const EnemyWaveGenerator = require('../generation/EnemyWaveGenerator');
const TargetingAI = require('../ai/TargetingAI');
const CommanderAI = require('../ai/CommanderAI');
const CommanderMessageGenerator = require('../generation/CommanderMessageGenerator');
const Logger = require('../utils/Logger');

class Battle {
  constructor(commander, battleId = null) {
    this.id = battleId || nanoid();
    this.commander = commander;
    this.createdAt = Date.now();

    // Units and enemies
    this.friendlyUnits = []; // Player-sent units
    this.enemies = []; // Current wave enemies

    // Wave progression
    this.currentWave = 1;
    this.maxWaves = 10;
    this.waveActive = false;
    this.waveStartTime = 0;
    this.waveSpawnDelay = 3000; // 3s between enemy spawns

    // Battle state
    this.isActive = true;
    this.isLost = false;
    this.isWon = false;

    // Map
    this.mapWidth = 60;
    this.mapHeight = 12;
    this.baseProgress = 100; // How far enemies must advance

    // Rewards/penalties
    this.goldReward = 0;
    this.stressChange = 0;

    // Timing for unit arrival (distance mechanic)
    this.unitDispatchQueue = []; // Units pending arrival

    // Chat system
    this.messages = []; // Chat history for this battle
    this.lastMessageTime = 0;
    this.messageInterval = 8000; // 8s between commander messages
    this.pendingRequest = false;
    this.requestTime = 0;

    Logger.debug(`Battle ${this.id} created for commander ${commander.name}`);
  }

  /**
   * Start or spawn next wave
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

    Logger.debug(`Battle ${this.id}: Wave ${this.currentWave} started with ${this.enemies.length} enemies`);
  }

  /**
   * Add friendly units to battle
   * Simulates travel delay based on distance
   */
  sendUnits(units, distance = 0) {
    const delayMs = distance * 50; // 50ms per distance unit

    // Queue for delayed arrival
    units.forEach((unit) => {
      this.unitDispatchQueue.push({
        unit: { ...unit },
        arrivalTime: Date.now() + delayMs,
      });
    });

    Logger.debug(`Battle ${this.id}: ${units.length} units sent, arrive in ${delayMs}ms`);
  }

  /**
   * Main update loop - handles movement, targeting, damage
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // Update chat/messaging
    this.updateChat();

    // Check for wave completion
    if (this.waveActive && this.enemies.every((e) => !e.isAlive())) {
      this.completeWave();
    }

    // Spawn wave if not active
    if (!this.waveActive && this.currentWave <= this.maxWaves) {
      this.startWave();
    }

    // Process unit arrivals
    const now = Date.now();
    const arrivals = this.unitDispatchQueue.filter((d) => d.arrivalTime <= now);
    arrivals.forEach((dispatch) => {
      this.friendlyUnits.push(dispatch.unit);
    });
    this.unitDispatchQueue = this.unitDispatchQueue.filter((d) => d.arrivalTime > now);

    // Update enemy positions
    this.enemies.forEach((enemy) => {
      if (enemy.isAlive()) {
        enemy.moveTowardBase(deltaTime);

        // Check if reached base
        if (enemy.hasReachedBase(this.baseProgress)) {
          this.commander.takeDamage(5); // Damage to commander
          enemy.hp = 0; // Remove enemy
          this.stressChange += 5; // Stress increase
        }
      }
    });

    // Combat: friendly units attack
    this.friendlyUnits.forEach((unit) => {
      if (unit.hp > 0) {
        const target = TargetingAI.chooseTarget(unit, this.enemies);
        if (target && TargetingAI.isInRange(unit, target)) {
          target.takeDamage(unit.damage);
        }
      }
    });

    // Commander AI: position units based on traits
    CommanderAI.updatePositions(this.commander, this.friendlyUnits, this.enemies);

    // Check if commander died
    if (!this.commander.isAlive()) {
      this.lose();
    }
  }

  /**
   * Complete current wave and progress to next
   */
  completeWave() {
    this.waveActive = false;
    this.currentWave++;

    // Rewards
    this.goldReward += 50 * this.currentWave;
    this.stressChange -= 5;

    // Commander regenerates
    const healAmount = Math.floor(this.commander.maxHealth * 0.3);
    this.commander.heal(healAmount);

    Logger.debug(`Battle ${this.id}: Wave completed. Progress ${this.currentWave - 1}/${this.maxWaves}`);
  }

  /**
   * Battle lost (commander died)
   */
  lose() {
    this.isActive = false;
    this.isLost = true;
    this.stressChange += 10;

    Logger.debug(`Battle ${this.id}: LOST - Commander fell`);
  }

  /**
   * Get rendered map for display
   */
  getMap() {
    const map = [];

    // Create empty map
    for (let y = 0; y < this.mapHeight; y++) {
      map[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        map[y][x] = ' ';
      }
    }

    // Draw enemies (advancing from top)
    this.enemies.forEach((enemy) => {
      const y = Math.floor((enemy.progress / this.baseProgress) * (this.mapHeight - 1));
      const x = Math.floor(Math.random() * this.mapWidth);

      if (y >= 0 && y < this.mapHeight && x >= 0 && x < this.mapWidth) {
        map[y][x] = enemy.symbol || '@';
      }
    });

    // Draw friendly units (in battle)
    this.friendlyUnits.forEach((unit, idx) => {
      const y = Math.floor(this.mapHeight * 0.7) + (idx % 3);
      const x = 10 + idx * 6;

      if (y >= 0 && y < this.mapHeight && x >= 0 && x < this.mapWidth) {
        map[y][x] = unit.symbol || '[?]';
      }
    });

    // Draw base line at bottom
    for (let x = 0; x < this.mapWidth; x++) {
      map[this.mapHeight - 1][x] = '▔';
    }

    return map;
  }

  /**
   * Update chat system - generate messages periodically
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

      this.lastMessageTime = now;
      this.pendingRequest = true;
      this.requestTime = now;
    }

    // Increase stress if request unanswered for too long
    if (this.pendingRequest && now - this.requestTime > 3000) {
      this.stressChange += 1; // 1 stress per 3s unanswered
    }
  }

  /**
   * Send a commander message to chat
   */
  addMessage(speaker, text, type = 'normal') {
    this.messages.push({
      speaker,
      text,
      type,
      timestamp: Date.now(),
    });

    if (type === 'commander') {
      this.pendingRequest = true;
      this.requestTime = Date.now();
    }
  }

  /**
   * Mark pending request as answered
   */
  answerRequest() {
    this.pendingRequest = false;
  }

  /**
   * Get recent chat messages
   */
  getRecentMessages(count = 10) {
    return this.messages.slice(-count);
  }

  /**
   * Get battle state for UI rendering
   */
  getState() {
    return {
      id: this.id,
      commander: this.commander.getState(),
      friendlyUnits: this.friendlyUnits.map((u) => u.getState()),
      enemies: this.enemies.map((e) => e.getState()),
      currentWave: this.currentWave,
      maxWaves: this.maxWaves,
      waveActive: this.waveActive,
      isActive: this.isActive,
      isLost: this.isLost,
      isWon: this.isWon,
      goldReward: this.goldReward,
      stressChange: this.stressChange,
      map: this.getMap(),
      unitsInQueue: this.unitDispatchQueue.length,
      messages: this.getRecentMessages(10),
      pendingRequest: this.pendingRequest,
      createdAt: this.createdAt,
      duration: Date.now() - this.createdAt,
    };
  }
}

module.exports = Battle;
