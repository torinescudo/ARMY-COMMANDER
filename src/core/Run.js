/**
 * ╔═══════════════════════════════════════════╗
 * ║  Run - La Crónica del Descenso             ║
 * ╚═══════════════════════════════════════════╝
 *
 * Each run is a descent into madness.
 * The chronicle records every wave survived,
 * every soul lost, every coin of cursed gold spent.
 * When it ends, only the numbers remain.
 */

const { nanoid } = require('nanoid');
const Random = require('../utils/Random');

class Run {
  constructor(commander, seed = null) {
    this.id = nanoid();
    this.seed = seed || Random.seededRandom() * 1000000;
    Random.setSeed(this.seed);

    this.startCommander = commander;
    this.startTime = Date.now();
    this.endTime = null;

    // Progress tracking
    this.totalWavesCompleted = 0;
    this.totalBattlesOpened = 0;
    this.totalBattlesWon = 0;
    this.totalBattlesLost = 0;
    this.totalEnemiesKilled = 0;
    this.totalUnitsLost = 0;
    this.totalGoldEarned = 0;

    // Difficulty tracking
    this.currentDifficultyMultiplier = 1;
    this.enemyHealthMultiplier = 1;
    this.enemyDamageMultiplier = 1;

    // Run state
    this.isActive = true;
    this.isWon = false; // Won if reached max waves or specific condition
    this.isFailed = false; // Failed if stress >= 100

    // Battle history
    this.battleHistory = [];
  }

  /**
   * Update run statistics
   */
  recordWaveCompletion(waveNumber, goldReward) {
    this.totalWavesCompleted++;
    this.totalGoldEarned += goldReward;

    // Increase difficulty every 5 waves
    if (this.totalWavesCompleted % 5 === 0) {
      this.currentDifficultyMultiplier += 0.1;
      this.enemyHealthMultiplier = 1 + this.totalWavesCompleted * 0.05;
      this.enemyDamageMultiplier = 1 + this.totalWavesCompleted * 0.03;
    }
  }

  /**
   * Record battle completion
   */
  recordBattle(battle, won) {
    this.totalBattlesOpened++;

    if (won) {
      this.totalBattlesWon++;
    } else {
      this.totalBattlesLost++;
    }

    // Track enemy kills
    const initialEnemyCount = battle.enemies.length;
    const deadEnemies = initialEnemyCount - battle.enemies.filter((e) => e.isAlive()).length;
    this.totalEnemiesKilled += deadEnemies;

    // Track unit losses
    const unitsLost = battle.friendlyUnits.filter((u) => !u.isAlive()).length;
    this.totalUnitsLost += unitsLost;

    this.battleHistory.push({
      id: battle.id,
      commander: battle.commander.name,
      won,
      wave: battle.currentWave,
      enemiesKilled: deadEnemies,
      unitsLost,
      timestamp: Date.now(),
    });
  }

  /**
   * End the run
   */
  endRun(reason = 'unknown') {
    this.isActive = false;
    this.endTime = Date.now();

    if (reason === 'stress_max') {
      this.isFailed = true;
    } else if (reason === 'max_waves') {
      this.isWon = true;
    }
  }

  /**
   * Get run duration in seconds
   */
  getDuration() {
    const end = this.endTime || Date.now();
    return Math.floor((end - this.startTime) / 1000);
  }

  /**
   * Get run statistics
   */
  getStats() {
    return {
      id: this.id,
      seed: this.seed,
      duration: this.getDuration(),
      startTime: this.startTime,
      endTime: this.endTime,
      isActive: this.isActive,
      isWon: this.isWon,
      isFailed: this.isFailed,
      totalWavesCompleted: this.totalWavesCompleted,
      totalBattlesOpened: this.totalBattlesOpened,
      totalBattlesWon: this.totalBattlesWon,
      totalBattlesLost: this.totalBattlesLost,
      totalEnemiesKilled: this.totalEnemiesKilled,
      totalUnitsLost: this.totalUnitsLost,
      totalGoldEarned: this.totalGoldEarned,
      difficultyMultiplier: parseFloat(this.currentDifficultyMultiplier.toFixed(2)),
      battleHistory: this.battleHistory,
    };
  }
}

module.exports = Run;
