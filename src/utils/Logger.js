/**
 * Simple logging utility
 */

const DEBUG = process.env.DEBUG === 'true';

const Logger = {
  debug: (message, data) => {
    if (DEBUG) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },

  info: (message, data) => {
    console.log(`[INFO] ${message}`, data || '');
  },

  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data || '');
  },

  error: (message, data) => {
    console.error(`[ERROR] ${message}`, data || '');
  },
};

module.exports = Logger;
