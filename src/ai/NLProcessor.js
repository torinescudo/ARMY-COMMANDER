/**
 * Natural Language Processor
 * Parses free-form user commands into structured game actions
 * Uses keyword-based semantic understanding (no external API, fully offline)
 */

const Logger = require('../utils/Logger');

// Command keywords mapping
const INTENT_KEYWORDS = {
  send: ['send', 'enviá', 'envío', 'despachá', 'despacho', 'manda', 'mandá'],
  retreat: ['retira', 'retrata', 'huye', 'vuelve', 'regresa', 'atrás'],
  attack: ['ataca', 'atacá', 'carga', 'embiste', 'ataque'],
  defend: ['defiende', 'defiéndete', 'resiste', 'aguanta', 'sostén'],
};

// Unit type aliases
const UNIT_ALIASES = {
  Infantry: [
    'infantry',
    'infantería',
    'infanteria',
    'soldier',
    'soldado',
    'foot',
    'infantryman',
  ],
  Archer: [
    'archer',
    'arquero',
    'bowman',
    'ranged',
    'rango',
    'arco',
  ],
  Cavalry: [
    'cavalry',
    'caballería',
    'caballeria',
    'knight',
    'caballo',
    'horse',
    'mounted',
  ],
  Mage: [
    'mage',
    'mago',
    'wizard',
    'brujo',
    'hechicero',
    'spell',
    'magic',
  ],
  Undead: [
    'undead',
    'muerto',
    'skeleton',
    'zombie',
    'ghost',
    'espectro',
    'muerte',
  ],
};

// Position keywords
const POSITION_KEYWORDS = {
  left: ['left', 'izquierda', 'izq', 'oeste', 'west'],
  right: ['right', 'derecha', 'der', 'este', 'east'],
  center: ['center', 'centro', 'middle', 'centro'],
  top: ['top', 'arriba', 'norte', 'north'],
  bottom: ['bottom', 'abajo', 'sur', 'south'],
  flank: ['flank', 'flanco', 'lateral'],
  front: ['front', 'frente', 'vanguardia'],
  back: ['back', 'atrás', 'retaguardia'],
};

// Urgency indicators (confidence scores)
const URGENCY_KEYWORDS = {
  high: [
    'urgente',
    'urgency',
    'now',
    'ahora',
    'inmediato',
    'immediate',
    'rápido',
    'quick',
    '!',
  ],
  medium: ['soon', 'pronto', 'rápidamente'],
  low: [
    'cuando puedas',
    'cuando sea',
    'si quieres',
    'opcionalmente',
    'optional',
  ],
};

class NLProcessor {
  constructor() {
    this.patterns = [];
    this.buildPatterns();
  }

  /**
   * Build semantic patterns for common command structures
   */
  buildPatterns() {
    // Pattern examples: "send 2 archers left", "give me 3 infantry", etc.
    this.patterns = [
      {
        regex: /(\d+)?\s+(\w+)\s+to\s+(\w+)|(\d+)?\s+(\w+)\s+(.+)/,
        groups: ['count', 'unit_type', 'position'],
      },
    ];
  }

  /**
   * Parse user input into structured command
   * Returns: { intent, unitType, count, position, urgency, confidence, raw }
   */
  parseCommand(text) {
    if (!text || text.trim().length === 0) {
      return {
        intent: null,
        success: false,
        error: 'Empty input',
      };
    }

    const normalized = text.toLowerCase().trim();

    // Extract intent
    const intent = this.extractIntent(normalized);
    if (!intent) {
      return {
        intent: null,
        success: false,
        error: 'Could not determine intent',
      };
    }

    // Extract unit type
    const unitType = this.extractUnitType(normalized);

    // Extract count (default 1)
    const count = this.extractCount(normalized) || 1;

    // Extract position
    const position = this.extractPosition(normalized);

    // Extract urgency
    const urgency = this.extractUrgency(normalized);

    // Calculate confidence
    const confidence =
      (intent ? 0.3 : 0) + (unitType ? 0.3 : 0) + (position ? 0.2 : 0) + (urgency ? 0.2 : 0);

    return {
      intent,
      unitType,
      count,
      position,
      urgency,
      confidence,
      raw: text,
      success: confidence > 0.4, // Need at least intent + unit or position
    };
  }

  /**
   * Extract primary intent from text
   */
  extractIntent(text) {
    // Default to 'send' if units are mentioned
    if (this.extractUnitType(text)) {
      return 'send';
    }

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return intent;
      }
    }
    return null;
  }

  /**
   * Extract unit type from text
   */
  extractUnitType(text) {
    for (const [unitType, aliases] of Object.entries(UNIT_ALIASES)) {
      if (aliases.some((alias) => text.includes(alias))) {
        return unitType;
      }
    }
    return null;
  }

  /**
   * Extract numerical count from text
   */
  extractCount(text) {
    // Look for numbers: "2 archers", "tres soldados", etc.
    const numberMatch = text.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1], 10);
    }

    // Look for word numbers
    const wordNumbers = {
      uno: 1,
      dos: 2,
      tres: 3,
      cuatro: 4,
      cinco: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      a: 1,
      the: 1,
    };

    for (const [word, num] of Object.entries(wordNumbers)) {
      if (text.includes(word)) {
        return num;
      }
    }

    return null;
  }

  /**
   * Extract position/direction from text
   */
  extractPosition(text) {
    for (const [position, keywords] of Object.entries(POSITION_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return position;
      }
    }
    return null;
  }

  /**
   * Extract urgency level (0-1 confidence)
   */
  extractUrgency(text) {
    // Check high urgency
    if (URGENCY_KEYWORDS.high.some((kw) => text.includes(kw))) {
      return 0.9;
    }

    // Check medium urgency
    if (URGENCY_KEYWORDS.medium.some((kw) => text.includes(kw))) {
      return 0.6;
    }

    // Check low urgency
    if (URGENCY_KEYWORDS.low.some((kw) => text.includes(kw))) {
      return 0.2;
    }

    // Default medium
    return 0.5;
  }

  /**
   * Format parsed command as debug string
   */
  debugString(parsed) {
    if (!parsed.success) {
      return `Parse failed: ${parsed.error}`;
    }

    return `Intent: ${parsed.intent} | ${parsed.count}x ${parsed.unitType} → ${parsed.position} (urgency: ${(parsed.urgency * 100).toFixed(0)}%)`;
  }
}

module.exports = NLProcessor;
