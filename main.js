#!/usr/bin/env node

/**
 * ARMY COMMANDER - Entry point
 * Terminal-based RTS/Roguelike hybrid game
 */

const Game = require('./src/core/Game');

// Create and run game
const game = new Game();

try {
  game.initialize();
  game.run();
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
}
