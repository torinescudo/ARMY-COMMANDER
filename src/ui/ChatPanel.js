/**
 * ChatPanel - displays commander messages and handles input
 */

const Screen = require('./Screen');

class ChatPanel extends Screen {
  constructor(renderer) {
    super(renderer);
    this.messages = []; // Array of { speaker, text, timestamp, type }
    this.maxMessages = 100;
    this.inputBuffer = '';
    this.callbacks = {};
  }

  /**
   * Create UI elements
   */
  create() {
    const dims = this.renderer.getDimensions();
    const chatHeight = Math.floor(dims.height * 0.3);

    // Message history
    this.elements.history = this.renderer.createBox({
      parent: this.renderer.screen,
      top: Math.floor(dims.height * 0.65),
      left: 0,
      width: dims.width,
      height: chatHeight - 2,
      border: 'line',
      label: ' CHAT ',
      scrollable: true,
      tags: true,
      style: {
        fg: 'cyan',
      },
    });

    // Input field
    this.elements.input = this.renderer.createBox({
      parent: this.renderer.screen,
      top: dims.height - 4,
      left: 0,
      width: dims.width,
      height: 4,
      border: 'line',
      focusable: true,
      label: ' INPUT ',
      content: '{cyan}> _{/cyan}',
      tags: true,
      style: {
        fg: 'white',
      },
    });

    // Setup input key handling
    this.setupInput();
  }

  /**
   * Setup input field key handlers
   */
  setupInput() {
    if (this.elements.input) {
      this.elements.input.key(['enter'], () => {
        if (this.callbacks.onSubmit) {
          this.callbacks.onSubmit(this.inputBuffer);
        }
        this.inputBuffer = '';
        this.updateInput();
      });

      // Allow typing
      this.elements.input.on('keypress', (ch, key) => {
        if (key.name === 'backspace') {
          this.inputBuffer = this.inputBuffer.slice(0, -1);
        } else if (ch && ch.length === 1 && !key.ctrl && !key.meta) {
          this.inputBuffer += ch;
        }
        this.updateInput();
      });
    }
  }

  /**
   * Update input display
   */
  updateInput() {
    if (this.elements.input) {
      const display = this.inputBuffer.length > 50
        ? this.inputBuffer.slice(-50)
        : this.inputBuffer;

      this.elements.input.setContent(`{cyan}> {/cyan}${display}_{gray}${' '.repeat(Math.max(0, 50 - display.length))}{/gray}`);
    }
  }

  /**
   * Add message to chat
   */
  addMessage(speaker, text, type = 'normal', urgency = 0.5) {
    this.messages.push({
      speaker,
      text,
      type, // 'normal', 'urgent', 'response', 'system'
      urgency,
      timestamp: Date.now(),
    });

    // Keep only recent messages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }

    this.updateHistory();
  }

  /**
   * Update message history display
   */
  updateHistory() {
    if (!this.elements.history) return;

    let content = '';

    // Show last 15 messages
    const recent = this.messages.slice(-15);

    recent.forEach((msg) => {
      const color = this.getMessageColor(msg.type, msg.urgency);
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();

      if (msg.type === 'system') {
        content += `{gray}[${timestamp}]{/gray} {yellow}${msg.text}{/yellow}\n`;
      } else if (msg.speaker === 'You' || msg.speaker === 'Player') {
        content += `{green}[${timestamp}] You:{/green} ${msg.text}\n`;
      } else {
        content += `{${color}}[${timestamp}] ${msg.speaker}:{/${color}} ${msg.text}\n`;
      }
    });

    this.elements.history.setContent(content || '{gray}Chat ready...{/gray}');
  }

  /**
   * Get color for message based on type and urgency
   */
  getMessageColor(type, urgency) {
    switch (type) {
      case 'urgent':
        return urgency > 0.7 ? 'red' : 'yellow';
      case 'response':
        return 'green';
      case 'system':
        return 'gray';
      default:
        return 'cyan';
    }
  }

  /**
   * Register callback functions
   */
  registerCallback(event, fn) {
    this.callbacks[event] = fn;
  }

  /**
   * Clear chat history
   */
  clear() {
    this.messages = [];
    this.inputBuffer = '';
    this.updateHistory();
    this.updateInput();
  }

  /**
   * Get last N messages
   */
  getRecent(count = 10) {
    return this.messages.slice(-count);
  }

  /**
   * Update display
   */
  update(state) {
    // Can be updated with battle state for context
  }

  /**
   * Render
   */
  render() {
    super.render();
  }
}

module.exports = ChatPanel;
