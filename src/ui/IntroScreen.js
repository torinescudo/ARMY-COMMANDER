const Screen = require('./Screen');
const VisualFX = require('./VisualFX');

const STUDIO_LOGO = [
  '',
  '              {green-fg,bold}╔═══════════════════════════════════════╗{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}                                       {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {green-fg}  ██████   █     █{/green-fg}                  {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {green-fg} █        █ █   █ █{/green-fg}                 {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {green-fg} █  ███  █   █ █   █{/green-fg}                {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {green-fg} █    █  █████ █████{/green-fg}                {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {green-fg}  ████   █   █ █   █{/green-fg}                {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}                                       {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {yellow-fg}█     █  ████  ████  █   █  ████{/yellow-fg}  {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {yellow-fg}█     █ █    █ █   █ ██ ██ █{/yellow-fg}      {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {yellow-fg}█  █  █ █    █ ████  █ █ █  ███{/yellow-fg}   {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {yellow-fg}█ █ █ █ █    █ █  █  █   █     █{/yellow-fg}  {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}  {yellow-fg} █   █   ████  █   █ █   █ ████{/yellow-fg}   {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}║{/green-fg,bold}                                       {green-fg,bold}║{/green-fg,bold}',
  '              {green-fg,bold}╚═══════════════════════════════════════╝{/green-fg,bold}',
  '',
];

const GAME_TITLE = [
  '   {red-fg,bold}▄▀▄ ▄▀▄ ▄▀▄ ▄   ▄   ▄▀▀   ▄▀▄ ▄▀▄ ▄▀▄ ▄▀▄ ▄▀▄ ▄   ▄ ▄▀▄ ▄▀▀ ▄▀▄{/red-fg,bold}',
  '   {red-fg,bold}█▀█ █▀▄ █▀█ ▀▄▀   █   █    █ █ █▀█ █▀█ █▀█ █▀█ █▀▄ █ █ █ █▀▀ █▀▄{/red-fg,bold}',
  '   {red-fg,bold}█ █ █ █ █ █  █     ▀▄▀  ▀▀  ▀▀  █ █ █ █ █ █ █ █ █ █ ▀▄▀ ▀▄▀ ▀▀▀ █ █{/red-fg,bold}',
];

const GAME_TITLE_ALT = [
  '',
  '       {magenta-fg}╔══════════════════════════════════════════════════╗{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {red-fg,bold}  █████  ████  █   █ █   █      {/red-fg,bold}                {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {red-fg,bold}  █   █ █   █ ██ ██  █ █       {/red-fg,bold}                {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {red-fg,bold}  █████ ████  █ █ █   █        {/red-fg,bold}                {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {red-fg,bold}  █   █ █  █  █   █   █        {/red-fg,bold}                {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {red-fg,bold}  █   █ █   █ █   █   █        {/red-fg,bold}                {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg}                                                  {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {cyan-fg,bold} ██████ ████ █   █ █   █  █████ █   █ ████  ████ ████{/cyan-fg,bold} {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {cyan-fg,bold} █     █   █ ██ ██ ██ ██ █   █ ██  █ █   █ █    █   █{/cyan-fg,bold}{magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {cyan-fg,bold} █     █   █ █ █ █ █ █ █ █████ █ █ █ █   █ ███  ████{/cyan-fg,bold} {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {cyan-fg,bold} █     █   █ █   █ █   █ █   █ █  ██ █   █ █    █  █{/cyan-fg,bold} {magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}║{/magenta-fg} {cyan-fg,bold} ██████ ████ █   █ █   █ █   █ █   █ ████  ████ █   █{/cyan-fg,bold}{magenta-fg}║{/magenta-fg}',
  '       {magenta-fg}╚══════════════════════════════════════════════════╝{/magenta-fg}',
  '',
];

const LORE_LINES = [
  '{gray-fg}En las profundidades del mundo olvidado...{/gray-fg}',
  '{gray-fg}donde los ejércitos caídos aguardan un nuevo señor...{/gray-fg}',
  '{magenta-fg}los gusanos de la guerra despiertan.{/magenta-fg}',
  '',
  '{red-fg}El estrés del mando consume. La muerte es permanente.{/red-fg}',
  '{yellow-fg}Cada orden es un pacto. Cada silencio, una condena.{/yellow-fg}',
  '',
  '{cyan-fg,bold}Tú eres el Army Commander.{/cyan-fg,bold}',
  '{magenta-fg}¿Sobrevivirás al asedio de los condenados?{/magenta-fg}',
];

const MENU_OPTIONS = [
  { key: 'n', label: 'NUEVA PARTIDA', color: 'green' },
  { key: 'c', label: 'CONTINUAR', color: 'yellow' },
  { key: 'x', label: 'SALIR', color: 'red' },
];

class IntroScreen extends Screen {
  constructor(renderer) {
    super(renderer);
    this.callbacks = {};
    this.active = false;
    this.selectedIndex = 0;
    this.animPhase = 0;
    this.animTimer = null;
    this.logoRevealed = false;
    this.titleRevealed = false;
    this.loreRevealed = false;
    this.menuRevealed = false;
    this.revealLine = 0;
    this.pulseId = null;
    this.skipAnimation = false;
  }

  create() {
    const dims = this.renderer.getDimensions();

    this.elements.studio = this.renderer.createBox({
      top: 0,
      left: 0,
      width: dims.width,
      height: Math.floor(dims.height * 0.45),
      content: '',
      tags: true,
      style: { fg: 'green', bg: 'black' },
    });

    this.elements.title = this.renderer.createBox({
      top: Math.floor(dims.height * 0.35),
      left: 0,
      width: dims.width,
      height: Math.floor(dims.height * 0.25),
      content: '',
      tags: true,
      style: { fg: 'red', bg: 'black' },
    });

    this.elements.lore = this.renderer.createBox({
      top: Math.floor(dims.height * 0.55),
      left: Math.floor(dims.width * 0.1),
      width: Math.floor(dims.width * 0.8),
      height: Math.floor(dims.height * 0.2),
      content: '',
      tags: true,
      style: { fg: 'gray', bg: 'black' },
    });

    this.elements.menu = this.renderer.createBox({
      top: Math.floor(dims.height * 0.75),
      left: Math.floor(dims.width * 0.2),
      width: Math.floor(dims.width * 0.6),
      height: 7,
      content: '',
      tags: true,
      border: 'line',
      style: { fg: 'cyan', border: { fg: 'magenta' }, bg: 'black' },
    });

    this.elements.footer = this.renderer.createBox({
      top: dims.height - 2,
      left: 0,
      width: dims.width,
      height: 2,
      content: '{center}{gray-fg}Game Worms Studio · v0.1.0 · Terminal RTS × Roguelike{/gray-fg}{/center}',
      tags: true,
      style: { fg: 'gray', bg: 'black' },
    });

    this.setupKeys();
  }

  setupKeys() {
    this.renderer.screen.key(['up', 'k'], () => {
      if (!this.active) return;
      if (!this.menuRevealed) { this.skipToMenu(); return; }
      this.selectedIndex = (this.selectedIndex - 1 + MENU_OPTIONS.length) % MENU_OPTIONS.length;
      this.renderMenu();
    });

    this.renderer.screen.key(['down', 'j'], () => {
      if (!this.active) return;
      if (!this.menuRevealed) { this.skipToMenu(); return; }
      this.selectedIndex = (this.selectedIndex + 1) % MENU_OPTIONS.length;
      this.renderMenu();
    });

    this.renderer.screen.key(['enter', 'return'], () => {
      if (!this.active) return;
      if (!this.menuRevealed) { this.skipToMenu(); return; }
      this.executeSelection();
    });

    this.renderer.screen.key(['n'], () => {
      if (!this.active) return;
      if (!this.menuRevealed) { this.skipToMenu(); return; }
      if (this.callbacks.onNewGame) this.callbacks.onNewGame();
    });

    this.renderer.screen.key(['c'], () => {
      if (!this.active) return;
      if (!this.menuRevealed) { this.skipToMenu(); return; }
      if (this.callbacks.onContinue) this.callbacks.onContinue();
    });

    this.renderer.screen.key(['x'], () => {
      if (!this.active) return;
      if (this.callbacks.onExit) this.callbacks.onExit();
    });

    this.renderer.screen.key(['space', 'escape'], () => {
      if (!this.active) return;
      if (!this.menuRevealed) this.skipToMenu();
    });
  }

  skipToMenu() {
    this.skipAnimation = true;
    this.logoRevealed = true;
    this.titleRevealed = true;
    this.loreRevealed = true;
    this.menuRevealed = true;
    if (this.animTimer) { clearTimeout(this.animTimer); this.animTimer = null; }
    this.renderAll();
  }

  registerCallback(event, fn) {
    this.callbacks[event] = fn;
  }

  executeSelection() {
    const opt = MENU_OPTIONS[this.selectedIndex];
    switch (opt.key) {
      case 'n': if (this.callbacks.onNewGame) this.callbacks.onNewGame(); break;
      case 'c': if (this.callbacks.onContinue) this.callbacks.onContinue(); break;
      case 'x': if (this.callbacks.onExit) this.callbacks.onExit(); break;
    }
  }

  startAnimation() {
    this.animPhase = 0;
    this.revealLine = 0;
    this.logoRevealed = false;
    this.titleRevealed = false;
    this.loreRevealed = false;
    this.menuRevealed = false;
    this.skipAnimation = false;

    this.clearAll();
    this.animateStudioLogo();
  }

  clearAll() {
    if (this.elements.studio) this.elements.studio.setContent('');
    if (this.elements.title) this.elements.title.setContent('');
    if (this.elements.lore) this.elements.lore.setContent('');
    if (this.elements.menu) this.elements.menu.setContent('');
    this.renderer.render();
  }

  animateStudioLogo() {
    if (this.skipAnimation) return;
    this.revealLine = 0;
    const reveal = () => {
      if (this.skipAnimation) return;
      if (this.revealLine >= STUDIO_LOGO.length) {
        this.logoRevealed = true;
        this.animTimer = setTimeout(() => this.animateTitle(), 800);
        return;
      }
      const lines = STUDIO_LOGO.slice(0, this.revealLine + 1);
      this.elements.studio.setContent(lines.join('\n'));
      this.renderer.render();
      this.revealLine++;
      this.animTimer = setTimeout(reveal, 80);
    };
    reveal();
  }

  animateTitle() {
    if (this.skipAnimation) return;
    this.revealLine = 0;
    const reveal = () => {
      if (this.skipAnimation) return;
      if (this.revealLine >= GAME_TITLE_ALT.length) {
        this.titleRevealed = true;
        this.animTimer = setTimeout(() => this.animateLore(), 600);
        return;
      }
      const lines = GAME_TITLE_ALT.slice(0, this.revealLine + 1);
      this.elements.title.setContent(lines.join('\n'));
      this.renderer.render();
      this.revealLine++;
      this.animTimer = setTimeout(reveal, 60);
    };
    reveal();
  }

  animateLore() {
    if (this.skipAnimation) return;
    this.revealLine = 0;
    const reveal = () => {
      if (this.skipAnimation) return;
      if (this.revealLine >= LORE_LINES.length) {
        this.loreRevealed = true;
        this.animTimer = setTimeout(() => this.revealMenu(), 500);
        return;
      }
      const lines = LORE_LINES.slice(0, this.revealLine + 1);
      this.elements.lore.setContent('{center}' + lines.join('\n') + '{/center}');
      this.renderer.render();
      this.revealLine++;
      this.animTimer = setTimeout(reveal, 300);
    };
    reveal();
  }

  revealMenu() {
    this.menuRevealed = true;
    this.renderMenu();
    this.pulseId = VisualFX.startPulse(this.elements.menu, 'magenta', 'cyan', 1200);
  }

  renderMenu() {
    if (!this.elements.menu) return;
    let content = '\n';
    MENU_OPTIONS.forEach((opt, idx) => {
      const selected = idx === this.selectedIndex;
      if (selected) {
        content += `  {${opt.color}-fg,bold,inverse}  ▸ [${opt.key.toUpperCase()}] ${opt.label}  {/${opt.color}-fg,bold,inverse}\n`;
      } else {
        content += `    {${opt.color}-fg}  [${opt.key.toUpperCase()}] ${opt.label}  {/${opt.color}-fg}\n`;
      }
    });
    content += '\n{gray-fg}  ↑↓ Navegar  ENTER Seleccionar  SPACE Saltar{/gray-fg}';
    this.elements.menu.setContent(content);
    this.renderer.render();
  }

  renderAll() {
    if (this.elements.studio) this.elements.studio.setContent(STUDIO_LOGO.join('\n'));
    if (this.elements.title) this.elements.title.setContent(GAME_TITLE_ALT.join('\n'));
    if (this.elements.lore) this.elements.lore.setContent('{center}' + LORE_LINES.join('\n') + '{/center}');
    this.renderMenu();
    if (!this.pulseId) {
      this.pulseId = VisualFX.startPulse(this.elements.menu, 'magenta', 'cyan', 1200);
    }
  }

  show() {
    this.active = true;
    Object.values(this.elements).forEach((el) => { el.show(); });
    this.startAnimation();
  }

  hide() {
    this.active = false;
    if (this.animTimer) { clearTimeout(this.animTimer); this.animTimer = null; }
    if (this.pulseId) { VisualFX.stopPulse(this.pulseId); this.pulseId = null; }
    Object.values(this.elements).forEach((el) => { el.hide(); });
  }

  destroy() {
    this.hide();
    Object.values(this.elements).forEach((el) => { el.destroy(); });
    this.elements = {};
  }

  update() {}

  render() {
    super.render();
  }
}

module.exports = IntroScreen;
