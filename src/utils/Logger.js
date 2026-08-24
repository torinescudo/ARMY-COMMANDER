/**
 * ╔═══════════════════════════════════════════╗
 * ║  Logger - El Escriba de las Tinieblas      ║
 * ╚═══════════════════════════════════════════╝
 *
 * Every event in the abyss is recorded.
 * Writes to a log file to avoid corrupting the blessed terminal.
 */

const fs = require('fs');
const path = require('path');

const DEBUG = process.env.DEBUG === 'true';
const LOG_FILE = path.join(process.cwd(), 'army-commander.log');

let logStream = null;

function getStream() {
  if (!logStream) {
    logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
  }
  return logStream;
}

function write(level, message, data) {
  const timestamp = new Date().toISOString();
  const line = data
    ? `${timestamp} [${level}] ${message} ${typeof data === 'object' ? JSON.stringify(data) : data}\n`
    : `${timestamp} [${level}] ${message}\n`;
  getStream().write(line);
}

const Logger = {
  debug: (message, data) => {
    if (DEBUG) write('DEBUG', message, data);
  },

  info: (message, data) => {
    write('INFO', message, data);
  },

  warn: (message, data) => {
    write('WARN', message, data);
  },

  error: (message, data) => {
    write('ERROR', message, data);
  },

  close: () => {
    if (logStream) {
      logStream.end();
      logStream = null;
    }
  },
};

module.exports = Logger;
