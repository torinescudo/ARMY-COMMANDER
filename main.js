#!/usr/bin/env node

/**
 * ╔═══════════════════════════════════════════════════════╗
 * ║           ⚰  ARMY COMMANDER  ⚰                       ║
 * ║     Terminal RTS × Roguelike × Dark Goth ASCII        ║
 * ╠═══════════════════════════════════════════════════════╣
 * ║  "En el abismo, cada orden es un pacto con la muerte" ║
 * ╚═══════════════════════════════════════════════════════╝
 *
 * Entry point — the gate opens here.
 * Beyond lies war, madness, and cursed gold.
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
