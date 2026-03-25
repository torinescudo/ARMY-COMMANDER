/**
 * Random utility functions
 * Supports seeded randomness for reproducible runs
 */

let seed = Date.now();

/**
 * Seeded pseudo-random number generator
 * Returns a number between 0 and 1
 */
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

/**
 * Set the seed for reproducibility
 */
function setSeed(newSeed) {
  seed = newSeed;
}

/**
 * Get random integer between min and max (inclusive)
 */
function randomRange(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

/**
 * Get random float between min and max
 */
function randomFloat(min, max) {
  return seededRandom() * (max - min) + min;
}

/**
 * Pick random element from array
 */
function pickRandom(array) {
  if (!Array.isArray(array) || array.length === 0) return null;
  return array[Math.floor(seededRandom() * array.length)];
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick N random elements from array without replacement
 */
function pickRandomN(array, n) {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(n, array.length));
}

/**
 * Random boolean with probability (0-1)
 */
function randomBool(probability = 0.5) {
  return seededRandom() < probability;
}

/**
 * Apply variance to a value (+/- percentage)
 * FIX: use randomFloat instead of randomRange (which floors to int)
 */
function applyVariance(baseValue, variancePercent) {
  const variance = (baseValue * variancePercent) / 100;
  const delta = randomFloat(-variance, variance);
  return Math.max(1, Math.round(baseValue + delta));
}

module.exports = {
  seededRandom,
  setSeed,
  randomRange,
  randomFloat,
  pickRandom,
  shuffle,
  pickRandomN,
  randomBool,
  applyVariance,
};
