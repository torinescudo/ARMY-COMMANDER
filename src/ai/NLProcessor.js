/**
 * ╔══════════════════════════════════════════════╗
 * ║  NLProcessor - El Oráculo de los Comandos     ║
 * ╚══════════════════════════════════════════════╝
 *
 * Translates the words of the living into orders
 * that move legions across the damned battlefield.
 * Fully offline — no gods required.
 */

// Intent keywords (bilingual)
const INTENT_KEYWORDS = {
  send: [
    'send', 'enviá', 'envía', 'envio', 'envío', 'despacha', 'despachá',
    'manda', 'mandá', 'dale', 'give', 'pon', 'coloca', 'deploy',
  ],
  retreat: [
    'retreat', 'retira', 'retírate', 'huye', 'vuelve', 'regresa',
    'atrás', 'back', 'flee', 'withdraw',
  ],
  attack: [
    'attack', 'ataca', 'atacá', 'carga', 'embiste', 'ataque',
    'charge', 'assault', 'push',
  ],
  defend: [
    'defend', 'defiende', 'defiéndete', 'resiste', 'aguanta',
    'sostén', 'hold', 'protect', 'guard',
  ],
};

// Unit type aliases (bilingual)
const UNIT_ALIASES = {
  Infantry: [
    'infantry', 'infantería', 'infanteria', 'soldier', 'soldado',
    'foot', 'melee', 'cuerpo',
  ],
  Archer: [
    'archer', 'arquero', 'bowman', 'ranged', 'arco', 'flecha',
    'arrow', 'tirador',
  ],
  Cavalry: [
    'cavalry', 'caballería', 'caballeria', 'knight', 'caballo',
    'horse', 'mounted', 'jinete',
  ],
  Mage: [
    'mage', 'mago', 'wizard', 'brujo', 'hechicero', 'spell',
    'magic', 'magia', 'caster',
  ],
  Undead: [
    'undead', 'muerto', 'skeleton', 'zombie', 'ghost', 'espectro',
    'muerte', 'no-muerto', 'esqueleto',
  ],
};

// Position keywords (bilingual)
const POSITION_KEYWORDS = {
  left: ['left', 'izquierda', 'izq', 'oeste', 'west'],
  right: ['right', 'derecha', 'der', 'este', 'east'],
  center: ['center', 'centro', 'middle', 'medio'],
  top: ['top', 'arriba', 'norte', 'north', 'up'],
  bottom: ['bottom', 'abajo', 'sur', 'south', 'down'],
  flank: ['flank', 'flanco', 'lateral', 'lado'],
  front: ['front', 'frente', 'vanguardia', 'forward', 'adelante'],
  back: ['back', 'atrás', 'retaguardia', 'rear', 'detrás'],
};

// Urgency indicators
const URGENCY_KEYWORDS = {
  high: [
    'urgente', 'urgent', 'now', 'ahora', 'inmediato', 'immediate',
    'rápido', 'quick', 'ya', '!',
  ],
  medium: ['soon', 'pronto', 'rápidamente', 'fast'],
  low: ['cuando puedas', 'when possible', 'si quieres', 'opcional', 'optional'],
};

// Number words — complete bilingual
const WORD_NUMBERS = {
  // Spanish
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

class NLProcessor {
  constructor() {}

  /**
   * Parse user input into structured command
   */
  parseCommand(text) {
    if (!text || text.trim().length === 0) {
      return { intent: null, success: false, error: 'Entrada vacía' };
    }

    const normalized = text.toLowerCase().trim();

    // Extract all components
    const unitType = this.extractUnitType(normalized);
    const intent = this.extractIntent(normalized, unitType);
    const count = this.extractCount(normalized) || 1;
    const position = this.extractPosition(normalized);
    const urgency = this.extractUrgency(normalized);

    if (!intent) {
      return { intent: null, success: false, error: 'No se pudo determinar la orden' };
    }

    // Confidence: how much info we extracted
    const confidence =
      (intent ? 0.3 : 0) +
      (unitType ? 0.3 : 0) +
      (position ? 0.2 : 0) +
      (count > 1 ? 0.1 : 0) +
      0.1; // base confidence for having an intent

    return {
      intent,
      unitType,
      count,
      position,
      urgency,
      confidence,
      raw: text,
      success: confidence >= 0.4,
    };
  }

  extractIntent(text, hasUnitType) {
    // Check explicit intent keywords first
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return intent;
      }
    }

    // If unit type was detected, default to 'send'
    if (hasUnitType) return 'send';

    // If a number is present, likely a send command
    if (this.extractCount(text)) return 'send';

    return null;
  }

  extractUnitType(text) {
    for (const [unitType, aliases] of Object.entries(UNIT_ALIASES)) {
      if (aliases.some((alias) => text.includes(alias))) {
        return unitType;
      }
    }
    return null;
  }

  extractCount(text) {
    // FIX: Use word boundaries for digit match to avoid matching digits inside words
    const digitMatch = text.match(/\b(\d+)\b/);
    if (digitMatch) return parseInt(digitMatch[1], 10);

    // Word number match — split ensures exact word matching (no substring false positives)
    const words = text.split(/\s+/);
    for (const word of words) {
      if (WORD_NUMBERS[word] !== undefined) {
        return WORD_NUMBERS[word];
      }
    }

    return null;
  }

  extractPosition(text) {
    for (const [position, keywords] of Object.entries(POSITION_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return position;
      }
    }
    return null;
  }

  extractUrgency(text) {
    if (URGENCY_KEYWORDS.high.some((kw) => text.includes(kw))) return 0.9;
    if (URGENCY_KEYWORDS.medium.some((kw) => text.includes(kw))) return 0.6;
    if (URGENCY_KEYWORDS.low.some((kw) => text.includes(kw))) return 0.2;
    return 0.5;
  }

  debugString(parsed) {
    if (!parsed.success) return `Fallo: ${parsed.error}`;
    return `Orden: ${parsed.intent} | ${parsed.count}x ${parsed.unitType || '?'} → ${parsed.position || '?'} (urgencia: ${(parsed.urgency * 100).toFixed(0)}%)`;
  }
}

module.exports = NLProcessor;
