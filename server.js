const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const GameEngine = require('./src/server/GameEngine');
const Constants = require('./src/utils/Constants');
const Logger = require('./src/utils/Logger');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const engine = new GameEngine();

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((ws) => {
    if (ws.readyState === 1) ws.send(msg);
  });
}

wss.on('connection', (ws) => {
  Logger.info('Cliente conectado');
  ws.send(JSON.stringify({ type: 'state', data: engine.getState() }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      handleMessage(msg, ws);
    } catch (e) {
      Logger.error('Mensaje inválido', e.message);
    }
  });

  ws.on('close', () => Logger.info('Cliente desconectado'));
});

function handleMessage(msg, ws) {
  switch (msg.type) {
    case 'start_game':
      engine.startGame();
      break;
    case 'command':
      engine.handleCommand(msg.text || '');
      break;
    case 'buy_unit':
      engine.buyUnit(msg.unitId);
      break;
    case 'reroll':
      engine.rerollCommander();
      break;
    case 'switch_tab':
      engine.switchTab(msg.index || 0);
      break;
    case 'restart':
      engine.restart();
      break;
  }
  broadcast({ type: 'state', data: engine.getState() });

  const chat = engine.consumePendingChat();
  if (chat.length > 0) {
    broadcast({ type: 'chat', data: chat });
  }
}

// Game loop
setInterval(() => {
  engine.update();
  broadcast({ type: 'state', data: engine.getState() });

  const chat = engine.consumePendingChat();
  if (chat.length > 0) {
    broadcast({ type: 'chat', data: chat });
  }
}, Constants.TICK_RATE_MS);

server.listen(PORT, () => {
  Logger.info(`Army Commander server en http://localhost:${PORT}`);
  console.log(`\n  ⚰  ARMY COMMANDER  ⚰`);
  console.log(`  Game Worms Studio\n`);
  console.log(`  Servidor: http://localhost:${PORT}`);
  console.log(`  Abre esa URL en tu navegador.\n`);
});
