/**
 * ╔═══════════════════════════════════════════╗
 * ║  ChatPanel - La Voz de los Condenados      ║
 * ╚═══════════════════════════════════════════╝
 *
 * Through this panel, commanders scream for help.
 * Through this panel, you answer — or you don't.
 * Silence is a choice. And it costs stress.
 */

const Screen = require('./Screen');

class ChatPanel extends Screen {
  constructor(renderer) {
    super(renderer);
    this.messages = [];
    this.maxMessages = 100;
    this.inputBuffer = '';
    this.callbacks = {};
  }

  create() {
    const dims = this.renderer.getDimensions();
    const chatHeight = Math.max(8, Math.floor(dims.height * 0.3));

    // Message history
    this.elements.history = this.renderer.createBox({
      top: dims.height - chatHeight,
      left: 0,
      width: dims.width,
      height: chatHeight - 3,
      border: 'line',
      label: ' ⚰ Voces del Abismo ⚰ ',
      scrollable: true,
      tags: true,
      style: { fg: 'cyan', border: { fg: 'magenta' } },
    });

    // Input field
    this.elements.input = this.renderer.createBox({
      top: dims.height - 3,
      left: 0,
      width: dims.width,
      height: 3,
      border: 'line',
      inputOnFocus: true,
      focusable: true,
      label: ' Orden ',
      content: '{cyan-fg}> {/cyan-fg}_',
      tags: true,
      style: { fg: 'white', border: { fg: 'cyan' } },
    });

    this.setupInput();

    // Auto-focus input
    if (this.elements.input) {
      this.elements.input.focus();
    }
  }

  setupInput() {
    if (!this.elements.input) return;

    this.elements.input.key(['enter'], () => {
      if (this.inputBuffer.trim().length > 0 && this.callbacks.onSubmit) {
        this.callbacks.onSubmit(this.inputBuffer.trim());
      }
      this.inputBuffer = '';
      this.updateInput();
    });

    this.elements.input.on('keypress', (ch, key) => {
      const MAX_INPUT = 200;
      if (key.name === 'backspace') {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
      } else if (ch && ch.length === 1 && !key.ctrl && !key.meta) {
        if (this.inputBuffer.length < MAX_INPUT) {
          this.inputBuffer += ch;
        }
      }
      this.updateInput();
    });
  }

  updateInput() {
    if (!this.elements.input) return;
    const display = this.inputBuffer.length > 60
      ? '...' + this.inputBuffer.slice(-57)
      : this.inputBuffer;
    this.elements.input.setContent(`{cyan-fg}> {/cyan-fg}${display}{gray-fg}_{/gray-fg}`);
  }

  addMessage(speaker, text, type = 'normal', urgency = 0.5) {
    this.messages.push({
      speaker, text, type, urgency,
      timestamp: Date.now(),
    });

    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    this.updateHistory();
  }

  updateHistory() {
    if (!this.elements.history) return;

    let content = '';
    const recent = this.messages.slice(-12);

    recent.forEach((msg) => {
      const time = new Date(msg.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });

      if (msg.type === 'system') {
        content += `{gray-fg}[${time}] ✦ ${msg.text}{/gray-fg}\n`;
      } else if (msg.speaker === 'Tú' || msg.speaker === 'You') {
        content += `{green-fg}[${time}] Tú:{/green-fg} ${msg.text}\n`;
      } else if (msg.type === 'urgent') {
        content += `{red-fg}[${time}] ⚠ ${msg.speaker}:{/red-fg} ${msg.text}\n`;
      } else if (msg.type === 'response') {
        content += `{yellow-fg}[${time}] ${msg.speaker}:{/yellow-fg} ${msg.text}\n`;
      } else {
        content += `{cyan-fg}[${time}] ${msg.speaker}:{/cyan-fg} ${msg.text}\n`;
      }
    });

    this.elements.history.setContent(content || '{gray-fg}Silencio... por ahora.{/gray-fg}');
  }

  registerCallback(event, fn) {
    this.callbacks[event] = fn;
  }

  clear() {
    this.messages = [];
    this.inputBuffer = '';
    if (this.elements.history) this.updateHistory();
    if (this.elements.input) this.updateInput();
  }

  update(state) {
    // Optional: can receive battle state for context
  }

  show() {
    Object.values(this.elements).forEach((el) => { el.show(); });
    if (this.elements.input) this.elements.input.focus();
  }

  hide() {
    Object.values(this.elements).forEach((el) => { el.hide(); });
  }

  render() {
    super.render();
  }
}

module.exports = ChatPanel;
