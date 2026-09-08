/* ═══════════════════════════════════════════
 *  Army Commander — Web Client
 *  Game Worms Studio
 * ═══════════════════════════════════════════ */

const STUDIO_LOGO = [
  '         ╔═══════════════════════════════════════╗',
  '         ║                                       ║',
  '         ║    ██████   █     █                    ║',
  '         ║   █        █ █   █ █                   ║',
  '         ║   █  ███  █   █ █   █                  ║',
  '         ║   █    █  █████ █████                  ║',
  '         ║    ████   █   █ █   █                  ║',
  '         ║                                       ║',
  '         ║  █     █  ████  ████  █   █  ████     ║',
  '         ║  █     █ █    █ █   █ ██ ██ █         ║',
  '         ║  █  █  █ █    █ ████  █ █ █  ███      ║',
  '         ║  █ █ █ █ █    █ █  █  █   █     █     ║',
  '         ║   █   █   ████  █   █ █   █ ████      ║',
  '         ║                                       ║',
  '         ╚═══════════════════════════════════════╝',
];

const GAME_TITLE = [
  '  ╔══════════════════════════════════════════════════╗',
  '  ║  █████  ████  █   █ █   █                       ║',
  '  ║  █   █ █   █ ██ ██  █ █                        ║',
  '  ║  █████ ████  █ █ █   █                         ║',
  '  ║  █   █ █  █  █   █   █                         ║',
  '  ║  █   █ █   █ █   █   █                         ║',
  '  ║                                                  ║',
  '  ║  ██████ ████ █   █ █   █  █████ █   █ ████  ████║',
  '  ║  █     █   █ ██ ██ ██ ██ █   █ ██  █ █   █ █   █║',
  '  ║  █     █   █ █ █ █ █ █ █ █████ █ █ █ █   █ ████ ║',
  '  ║  █     █   █ █   █ █   █ █   █ █  ██ █   █ █  █ ║',
  '  ║  ██████ ████ █   █ █   █ █   █ █   █ ████  █   █║',
  '  ╚══════════════════════════════════════════════════╝',
];

const LORE_LINES = [
  { text: 'En las profundidades del mundo olvidado...', cls: '' },
  { text: 'donde los ejércitos caídos aguardan un nuevo señor...', cls: '' },
  { text: 'los gusanos de la guerra despiertan.', cls: 'lore-highlight' },
  { text: '', cls: '' },
  { text: 'El estrés del mando consume. La muerte es permanente.', cls: 'lore-danger' },
  { text: 'Cada orden es un pacto. Cada silencio, una condena.', cls: 'lore-warn' },
  { text: '', cls: '' },
  { text: 'Tú eres el Army Commander.', cls: 'lore-accent' },
  { text: '¿Sobrevivirás al asedio de los condenados?', cls: 'lore-highlight' },
];

// ═══ CONNECTION ═══
let ws = null;
let gameState = null;
let selectedMenu = 0;
const menuActions = ['start_game', 'continue', 'exit'];

function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}`);

  ws.onopen = () => console.log('Conectado al servidor');

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'state') {
      gameState = msg.data;
      render(gameState);
    }
    if (msg.type === 'chat') {
      msg.data.forEach(addChatMessage);
    }
  };

  ws.onclose = () => {
    console.log('Desconectado. Reconectando...');
    setTimeout(connect, 2000);
  };
}

function send(obj) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
}

// ═══ SCREENS ═══
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (el) el.classList.add('active');
}

// ═══ RENDER DISPATCHER ═══
function render(state) {
  if (!state) return;
  switch (state.mode) {
    case 'intro': showScreen('intro'); break;
    case 'hub': showScreen('hub'); renderHub(state); break;
    case 'battle': showScreen('battle'); renderBattle(state); break;
    case 'end': showScreen('end'); renderEnd(state); break;
  }
}

// ═══ INTRO ═══
let introAnimated = false;

function animateIntro() {
  if (introAnimated) return;
  introAnimated = true;

  const logoEl = document.getElementById('intro-logo');
  const titleEl = document.getElementById('intro-title');
  const loreEl = document.getElementById('intro-lore');
  const menuEl = document.getElementById('intro-menu');

  logoEl.textContent = '';
  titleEl.textContent = '';
  loreEl.innerHTML = '';
  menuEl.classList.add('hidden');

  let lineIdx = 0;

  function revealLogo() {
    if (lineIdx >= STUDIO_LOGO.length) {
      lineIdx = 0;
      setTimeout(revealTitle, 600);
      return;
    }
    logoEl.textContent += (lineIdx > 0 ? '\n' : '') + STUDIO_LOGO[lineIdx];
    lineIdx++;
    setTimeout(revealLogo, 60);
  }

  function revealTitle() {
    if (lineIdx >= GAME_TITLE.length) {
      lineIdx = 0;
      setTimeout(revealLore, 400);
      return;
    }
    titleEl.textContent += (lineIdx > 0 ? '\n' : '') + GAME_TITLE[lineIdx];
    lineIdx++;
    setTimeout(revealTitle, 50);
  }

  function revealLore() {
    if (lineIdx >= LORE_LINES.length) {
      menuEl.classList.remove('hidden');
      updateMenuSelection();
      return;
    }
    const l = LORE_LINES[lineIdx];
    const div = document.createElement('div');
    if (l.cls) div.className = l.cls;
    div.textContent = l.text || ' ';
    loreEl.appendChild(div);
    lineIdx++;
    setTimeout(revealLore, 250);
  }

  revealLogo();
}

function updateMenuSelection() {
  document.querySelectorAll('.menu-option').forEach((el, i) => {
    el.classList.toggle('selected', i === selectedMenu);
  });
}

// ═══ HUB ═══
function renderHub(state) {
  renderCommander(state.commander);
  renderShop(state.shop);
  renderHubStatus(state.stress, state.commander);
}

function renderCommander(cmd) {
  if (!cmd) return;
  const el = document.getElementById('hub-commander-body');
  const hpBar = makeBar(cmd.health, cmd.maxHealth);
  const moraleBar = makeBar(cmd.morale, cmd.maxMorale, 'magenta');
  const traits = cmd.traits.map(t => `  <span class="c-magenta">•</span> ${t}`).join('\n');

  el.innerHTML =
    `<span class="c-cyan">Nombre:</span> <span class="c-white bold">${esc(cmd.name)}</span>\n\n` +
    `<span class="c-cyan">Marcas del Destino:</span>\n${traits}\n\n` +
    `<span class="c-cyan">Salud:</span>     ${hpBar} ${cmd.health}/${cmd.maxHealth}\n` +
    `<span class="c-cyan">Moral:</span>     ${moraleBar} ${cmd.morale}/${cmd.maxMorale}\n` +
    `<span class="c-cyan">Liderazgo:</span> ${cmd.leadership}/${cmd.maxLeadership}\n\n` +
    `<button class="hub-btn" onclick="send({type:'reroll'})">↻ Reinvocar</button>`;
}

function renderShop(shop) {
  if (!shop) return;
  const el = document.getElementById('hub-shop-body');
  let html =
    `<span class="c-yellow">Oro Maldito:</span> <span class="c-white bold">${shop.gold}g</span> ` +
    `(<span class="c-green">+${shop.goldPerSecond.toFixed(1)}/s</span>)\n` +
    `<span class="c-gray">Inventario: ${shop.inventorySize}/${shop.maxInventorySize}</span>\n\n`;

  if (shop.available) {
    shop.available.forEach((unit, i) => {
      const canBuy = shop.gold >= unit.cost;
      const cls = canBuy ? 'shop-item' : 'shop-item cant-buy';
      html += `<div class="${cls}" ${canBuy ? `onclick="send({type:'buy_unit',unitId:'${unit.id}'})"` : ''}>`;
      html += `<span class="c-cyan">[${i+1}]</span> <span class="bold">${esc(unit.name)}</span> ${unit.symbol || ''}\n`;
      html += `    HP:${unit.hp} DMG:${unit.damage} SPD:${unit.speed} RNG:${unit.range}\n`;
      html += canBuy
        ? `    <span class="c-green">${unit.cost}g</span>`
        : `    <span class="c-red">${unit.cost}g (sin oro)</span>`;
      html += '</div>';
    });
  }

  el.innerHTML = html;
}

function renderHubStatus(stress, cmd) {
  if (!stress) return;
  const el = document.getElementById('hub-status-body');
  const pct = stress.percentage;
  const color = pct > 70 ? 'red' : pct > 40 ? 'yellow' : 'green';
  const bar = makeBar(stress.current, stress.max, color);

  let warning = '';
  if (pct > 80) warning = '\n<span class="c-red bold blink">⚠ ESTRÉS CRÍTICO — ¡El mando se desmorona! ⚠</span>';
  else if (pct > 60) warning = '\n<span class="c-yellow">⚠ Estrés elevado — responde a tus comandantes</span>';

  el.innerHTML =
    `<span class="c-cyan">Estrés:</span> ${bar} <span class="c-${color}">${stress.current}/${stress.max}</span>${warning}\n` +
    `<span class="c-gray">Aguardando la primera grieta dimensional...</span>`;
}

// ═══ BATTLE ═══
function renderBattle(state) {
  renderTabs(state.tabs);
  const battle = state.battles[state.activeTabIndex];
  if (!battle) return;
  renderBattleMap(battle);
  renderBattleInfo(battle);
  renderBattleStatus(state);
  renderChatHistory(state.chatMessages);
}

function renderTabs(tabs) {
  const el = document.getElementById('battle-tabs-body');
  if (!tabs || !el) return;
  el.innerHTML = tabs.map(t => {
    const cls = ['tab-btn'];
    if (t.active) cls.push('active');
    if (t.status === 'critical') cls.push('critical');
    else if (t.status === 'danger') cls.push('danger');
    else if (t.status === 'lost') cls.push('lost');
    else if (t.status === 'won') cls.push('won');
    const icon = t.status === 'lost' ? '✕' : t.status === 'won' ? '✦' : t.status === 'critical' ? '⚠' : '⚔';
    return `<button class="${cls.join(' ')}" onclick="send({type:'switch_tab',index:${t.index}})">${icon} [${t.index+1}] ${esc(t.name)} W:${t.wave}</button>`;
  }).join('');
}

function renderBattleMap(battle) {
  const headerEl = document.getElementById('battle-header');
  const mapEl = document.getElementById('battle-map-body');
  if (!headerEl || !mapEl) return;

  const cmd = battle.commander;
  const hpPct = cmd.health / cmd.maxHealth;
  const hpBar = makeBar(cmd.health, cmd.maxHealth);
  const hpColor = hpPct < 0.2 ? 'red' : hpPct < 0.5 ? 'yellow' : 'cyan';

  headerEl.innerHTML = `<span class="term-dots"><i></i><i></i><i></i></span> ` +
    `<span class="c-${hpColor} bold">⚔ ${esc(cmd.name)}</span> | ` +
    `Oleada <span class="c-yellow">${battle.currentWave}/${battle.maxWaves}</span> | ` +
    `HP: ${hpBar} <span class="c-${hpColor}">${cmd.health}/${cmd.maxHealth}</span>`;

  if (battle.map) {
    mapEl.innerHTML = blessedToHtml(battle.map);
  }
}

function renderBattleInfo(battle) {
  const el = document.getElementById('battle-info-body');
  if (!el) return;

  let html = '<span class="c-green bold">Aliados:</span>\n';
  if (battle.friendlyUnits && battle.friendlyUnits.length > 0) {
    battle.friendlyUnits.forEach(u => {
      if (!u.isAlive) return;
      const hpPct = u.hp / u.maxHp;
      const color = hpPct < 0.25 ? 'red' : hpPct < 0.5 ? 'yellow' : 'green';
      html += ` <span class="c-${color}">${u.symbol || '?'}</span> ${esc(u.name)} ${u.hp}/${u.maxHp}\n`;
    });
  } else {
    html += ' <span class="c-gray">Sin unidades</span>\n';
  }

  html += '\n<span class="c-red bold">Enemigos:</span>\n';
  const aliveEnemies = (battle.enemies || []).filter(e => e.isAlive);
  if (aliveEnemies.length > 0) {
    aliveEnemies.slice(0, 12).forEach(e => {
      const hpPct = e.hp / e.maxHp;
      const color = hpPct < 0.3 ? 'red' : 'red';
      html += ` <span class="c-${color}">${e.symbol || '@'}</span> ${esc(e.name)} ${e.hp}/${e.maxHp}\n`;
    });
    if (aliveEnemies.length > 12) html += ` <span class="c-gray">...y ${aliveEnemies.length - 12} más</span>\n`;
  } else {
    html += ' <span class="c-gray">Ninguno</span>\n';
  }

  html += `\n<span class="c-gray">En cola: ${battle.unitsInQueue || 0}</span>`;
  el.innerHTML = html;
}

function renderBattleStatus(state) {
  const el = document.getElementById('battle-status-body');
  if (!el || !state.stress || !state.shop) return;

  const stress = state.stress;
  const shop = state.shop;
  const sPct = stress.percentage;
  const sColor = sPct > 70 ? 'red' : sPct > 40 ? 'yellow' : 'green';
  const sBar = makeBar(stress.current, stress.max, sColor);

  const battle = state.battles[state.activeTabIndex];
  let statusLine = '<span class="c-cyan">⚔ En combate</span>';
  if (battle) {
    if (battle.isLost) statusLine = '<span class="c-red bold blink">✕✕✕ DERROTA ✕✕✕</span>';
    else if (battle.isWon) statusLine = '<span class="c-green bold">✦✦✦ VICTORIA ✦✦✦</span>';
    else if (!battle.waveActive) statusLine = '<span class="c-yellow">▸▸ Preparando oleada...</span>';
  }

  el.innerHTML =
    `<span class="c-yellow">Oro:</span> <span class="c-white bold">${shop.gold}g</span>\n` +
    `<span class="c-cyan">Estrés:</span> ${sBar}\n` +
    `<span class="c-${sColor}">${stress.current}/${stress.max}</span>\n\n` +
    `${statusLine}\n\n` +
    `<span class="c-gray">Inventario: ${shop.inventorySize}</span>`;
}

// ═══ CHAT ═══
function renderChatHistory(messages) {
  const el = document.getElementById('chat-messages');
  if (!el || !messages) return;

  el.innerHTML = messages.map(m => {
    const time = new Date(m.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const type = m.type || 'normal';
    let speakerCls = 'c-cyan';
    if (type === 'system') speakerCls = 'c-gray';
    else if (type === 'player' || m.speaker === 'Tú') speakerCls = 'c-green';
    else if (type === 'urgent') speakerCls = 'c-red bold';
    else if (type === 'response') speakerCls = 'c-yellow';

    return `<div class="chat-msg ${type}"><span class="time">[${time}]</span> <span class="speaker ${speakerCls}">${esc(m.speaker)}:</span> ${esc(m.text)}</div>`;
  }).join('');

  el.scrollTop = el.scrollHeight;
}

function addChatMessage(msg) {
  const el = document.getElementById('chat-messages');
  if (!el) return;
  const time = new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const type = msg.type || 'normal';
  let speakerCls = 'c-cyan';
  if (type === 'system') speakerCls = 'c-gray';
  else if (type === 'player' || msg.speaker === 'Tú') speakerCls = 'c-green';
  else if (type === 'urgent') speakerCls = 'c-red bold';
  else if (type === 'response') speakerCls = 'c-yellow';

  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.innerHTML = `<span class="time">[${time}]</span> <span class="speaker ${speakerCls}">${esc(msg.speaker)}:</span> ${esc(msg.text)}`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

// ═══ END SCREEN ═══
function renderEnd(state) {
  const el = document.getElementById('end-body');
  if (!el || !state.runStats) return;
  const s = state.runStats;
  const mins = Math.floor(s.duration / 60);
  const secs = s.duration % 60;

  let header;
  if (s.isFailed) {
    header = '<span class="c-red bold">╔══════════════════════════════════════════╗\n' +
             '║   ✕  GAME OVER — ESTRÉS MÁXIMO  ✕       ║\n' +
             '║   La presión del mando te ha destruido   ║\n' +
             '╚══════════════════════════════════════════╝</span>\n';
  } else {
    header = '<span class="c-yellow bold">╔══════════════════════════════════════════╗\n' +
             '║   ✦  VICTORIA — LOS MUERTOS CAEN  ✦     ║\n' +
             '╚══════════════════════════════════════════╝</span>\n';
  }

  el.innerHTML = header + '\n' +
    `<span class="c-cyan">Duración:</span> ${mins}m ${secs}s\n` +
    `<span class="c-cyan">Semilla:</span> <span class="c-gray">${Math.floor(s.seed)}</span>\n\n` +
    `<span class="c-magenta bold">═══ BATALLAS ═══</span>\n` +
    `  Abiertas:  <span class="c-yellow">${s.totalBattlesOpened}</span>\n` +
    `  Victorias: <span class="c-green">${s.totalBattlesWon}</span>\n` +
    `  Derrotas:  <span class="c-red">${s.totalBattlesLost}</span>\n\n` +
    `<span class="c-magenta bold">═══ COMBATE ═══</span>\n` +
    `  Oleadas:   <span class="c-green">${s.totalWavesCompleted}</span>\n` +
    `  Enemigos:  <span class="c-yellow">${s.totalEnemiesKilled}</span>\n` +
    `  Caídos:    <span class="c-red">${s.totalUnitsLost}</span>\n\n` +
    `<span class="c-magenta bold">═══ ORO MALDITO ═══</span>\n` +
    `  Acumulado: <span class="c-yellow">${s.totalGoldEarned}g</span>\n` +
    `  Dificultad: <span class="c-red">${s.difficultyMultiplier}x</span>`;
}

// ═══ UTILITIES ═══
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function makeBar(current, max, color) {
  const len = 12;
  const pct = Math.max(0, Math.min(1, current / max));
  const filled = Math.round(pct * len);
  const barColor = color || (pct < 0.2 ? 'red' : pct < 0.5 ? 'yellow' : 'green');
  let html = '<span class="hp-bar">';
  for (let i = 0; i < len; i++) {
    if (i < filled) {
      const cls = barColor === 'red' ? 'filled crit' : barColor === 'yellow' ? 'filled warn' : 'filled';
      html += `<span class="block ${cls}"></span>`;
    } else {
      html += '<span class="block empty"></span>';
    }
  }
  html += '</span>';
  return html;
}

function blessedToHtml(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\{([\w,\-]+)\}/g, (match, attrs) => {
    if (attrs.startsWith('/')) return '</span>';
    if (attrs === 'center') return '<span style="text-align:center;display:block">';

    const parts = attrs.split(',');
    const classes = [];
    for (const p of parts) {
      if (p.endsWith('-fg')) classes.push('c-' + p.replace('-fg', ''));
      else if (p === 'bold') classes.push('bold');
      else if (p === 'blink') classes.push('blink');
      else if (p === 'inverse') classes.push('inverse');
    }
    return classes.length ? `<span class="${classes.join(' ')}">` : '';
  });

  return html;
}

// ═══ INPUT HANDLING ═══
document.addEventListener('DOMContentLoaded', () => {
  connect();
  animateIntro();

  // Chat input
  const chatInput = document.getElementById('chat-input');
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim()) {
      send({ type: 'command', text: chatInput.value.trim() });
      chatInput.value = '';
    }
  });

  // Intro menu keyboard
  document.addEventListener('keydown', (e) => {
    const introScreen = document.getElementById('screen-intro');
    if (!introScreen.classList.contains('active')) return;

    const menuEl = document.getElementById('intro-menu');
    if (menuEl.classList.contains('hidden')) {
      // Skip animation
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
        skipIntroAnimation();
      }
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      selectedMenu = (selectedMenu - 1 + menuActions.length) % menuActions.length;
      updateMenuSelection();
    } else if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      selectedMenu = (selectedMenu + 1) % menuActions.length;
      updateMenuSelection();
    } else if (e.key === 'Enter') {
      executeMenuAction(menuActions[selectedMenu]);
    } else if (e.key === 'n' || e.key === 'N') {
      executeMenuAction('start_game');
    } else if (e.key === 'c' || e.key === 'C') {
      executeMenuAction('continue');
    } else if (e.key === 'x' || e.key === 'X') {
      executeMenuAction('exit');
    }
  });

  // Hub keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const hubScreen = document.getElementById('screen-hub');
    if (!hubScreen.classList.contains('active')) return;

    if (e.key === 'r' || e.key === 'R') send({ type: 'reroll' });
    if (e.key >= '1' && e.key <= '5') {
      const idx = parseInt(e.key) - 1;
      if (gameState && gameState.shop && gameState.shop.available[idx]) {
        send({ type: 'buy_unit', unitId: gameState.shop.available[idx].id });
      }
    }
  });

  // Battle tab switching
  document.addEventListener('keydown', (e) => {
    const battleScreen = document.getElementById('screen-battle');
    if (!battleScreen.classList.contains('active')) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      if (gameState && gameState.tabs && gameState.tabs.length > 1) {
        const next = ((gameState.activeTabIndex || 0) + 1) % gameState.tabs.length;
        send({ type: 'switch_tab', index: next });
      }
    }
  });

  // End screen buttons
  document.getElementById('btn-new-run').addEventListener('click', () => {
    send({ type: 'restart' });
    introAnimated = false;
    setTimeout(() => animateIntro(), 300);
  });
  document.getElementById('btn-exit').addEventListener('click', () => {
    document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#666;font-family:monospace">Sesión terminada. Cierra esta pestaña.</div>';
  });

  // Menu click handlers
  document.querySelectorAll('.menu-option').forEach((el) => {
    el.addEventListener('click', () => {
      executeMenuAction(el.dataset.action);
    });
    el.addEventListener('mouseenter', () => {
      selectedMenu = Array.from(document.querySelectorAll('.menu-option')).indexOf(el);
      updateMenuSelection();
    });
  });
});

function skipIntroAnimation() {
  const logoEl = document.getElementById('intro-logo');
  const titleEl = document.getElementById('intro-title');
  const loreEl = document.getElementById('intro-lore');
  const menuEl = document.getElementById('intro-menu');

  logoEl.textContent = STUDIO_LOGO.join('\n');
  titleEl.textContent = GAME_TITLE.join('\n');
  loreEl.innerHTML = LORE_LINES.map(l => {
    const div = `<div${l.cls ? ` class="${l.cls}"` : ''}>${l.text || ' '}</div>`;
    return div;
  }).join('');
  menuEl.classList.remove('hidden');
  updateMenuSelection();
}

function executeMenuAction(action) {
  switch (action) {
    case 'start_game':
    case 'continue':
      send({ type: 'start_game' });
      break;
    case 'exit':
      document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#666;font-family:monospace">Sesión terminada. Cierra esta pestaña.</div>';
      break;
  }
}
