/**
 * CommanderMessageGenerator - generates contextual commander messages
 */

const Random = require('../utils/Random');

// Message templates by trait
const MESSAGE_TEMPLATES = {
  Brutal: [
    '¡Necesito refuerzos AHORA o caemos!',
    '¡Maldición! ¡Oleada pesada al norte!',
    '¡Atacad! ¡Mueran los malditos!',
    '¡Carga! ¡Sin piedad!',
    '¡Defensores! ¡Aguantad!',
    '¡A por ellos! ¡A la carga!',
    '¡Más soldados! ¡Necesito músculo!',
  ],

  Leal: [
    '¿Podrías enviar apoyo cuando puedas?',
    'Resistiremos, pero necesitamos refuerzos...',
    'Mis tropas aguantarán, pero pronto necesitaremos ayuda',
    'Confiamos en ti, jefe',
    'Los enemigos llegan... ¿nos envías refuerzos?',
    'Aguantaremos mientras llegue la ayuda',
    '¿Quizá puedas enviar algunos soldados?',
  ],

  Estratega: [
    'Preciso una formación defensiva al flanco izquierdo',
    'Los enemigos avanzan en orden. Necesito arqueros al frente',
    'Posición táctico: refuerza el centro antes de que se rompan nuestras líneas',
    'Arquería coordenada necesaria en este momento',
    'Envía infantería pesada, los enemigos de rango aumentan',
  ],

  Asustadizo: [
    '¡Hay demasiados! ¡Ayuda!',
    '¡No vamos a aguantar! ¡Refuerzos!',
    '¡Miedo! ¡Envía todo lo que tengas!',
    '¡Por favor! ¡Cualquier cosa nos ayudará!',
    '¡Dios mío! ¡No sobreviviremos solos!',
  ],

  Maldito: [
    '¡Envía tus mejores asesinos! ¡Que beban sangre!',
    'Los malditos enemigos caerán... con tus unidades',
    '¡Más muerte! ¡Más destrucción!',
    'Los enemigos merecen el sufrimiento... envía fuego',
    '¡Que ardan! ¡Que caigan todos!',
  ],

  Temerario: [
    '¡Que vengan! ¡Estaremos aquí!',
    'Podemos solos, pero refuerzos nunca vienen mal',
    '¡Carguemos juntos! ¡Sin miedo!',
    'Les espero. Trae más enemigos',
  ],

  Cauteloso: [
    'Debemos prepararnos con cuidado. Envía tropas defensivas',
    'Analizo sus movimientos... refuerzos de largo alcance serían ideales',
    'Observa. Esperaremos el momento preciso',
    'La defensa es clave aquí',
  ],

  Vengativo: [
    '¡Estos pagan por todo lo perdido!',
    'Cada uno de mis caídos será vengado',
    '¡Más sangre enemiga! ¡Dale!',
  ],

  Noble: [
    'Mantenemos la línea por el reino',
    'Nuestros soldados resisten con honor',
    'Por honor y por la causa. Ayúdanos si puedes',
    'Lucharemos hasta el final',
  ],
};

// Context-based message variations
const WAVE_TEMPLATES = {
  early: 'Primera oleada, nada serio aún pero...',
  mid: 'La presión aumenta... necesitamos más',
  late: '¡OLEADA PESADA! ¡APOYO INMEDIATO!',
  final: '¡ÚLTIMA RESISTENCIA! ¡TODOS LOS REFUERZOS AHORA!',
};

/**
 * Generate a context-aware commander message
 */
function generateMessage(battle, commander) {
  if (!battle || !commander) {
    return 'Sistema... listo para recibir órdenes';
  }

  // Pick primary trait (or use default)
  const primaryTrait = commander.traits[0] || 'Leal';
  const templates = MESSAGE_TEMPLATES[primaryTrait] || MESSAGE_TEMPLATES.Leal;

  // Get wave context
  const waveProgress = battle.currentWave / battle.maxWaves;
  let waveContext = '';

  if (waveProgress < 0.3) {
    waveContext = WAVE_TEMPLATES.early;
  } else if (waveProgress < 0.6) {
    waveContext = WAVE_TEMPLATES.mid;
  } else if (waveProgress < 0.9) {
    waveContext = WAVE_TEMPLATES.late;
  } else {
    waveContext = WAVE_TEMPLATES.final;
  }

  // Pick random base message
  const baseMessage = Random.pickRandom(templates);

  // Combine with context
  if (waveProgress > 0.5 && !baseMessage.includes('!')) {
    // Add urgency marker for mid-late game
    return `${baseMessage} (${waveContext})`;
  }

  return baseMessage;
}

/**
 * Generate morale-based message
 */
function generateMoraleMessage(commander) {
  const morale = commander.morale / commander.maxMorale;

  if (morale < 0.3) {
    return '¡Nos rendimos!';
  } else if (morale < 0.6) {
    return 'Pero... ¿podremos resistir?';
  } else if (morale > 0.9) {
    return '¡Por la victoria!';
  }

  return '';
}

/**
 * Generate contextual response to player action
 */
function generateResponseToAction(action, commander) {
  const trait = commander.traits[0] || 'Leal';

  const responses = {
    Brutal: [
      '¡Excelente! ¡Más refuerzos!',
      '¡Eso es! ¡Destruid a los malditos!',
      '¡Sí! ¡Esa es la manera!',
    ],
    Leal: [
      'Gracias. Con esto sobreviviremos',
      'Agradezco el apoyo',
      'Bien hecho. Resguardaré tu confianza',
    ],
    Estratega: [
      'Buena formación. Aprovecharé cada unidad',
      'Interesante movimiento táctico',
      'Excelente decisión estratégica',
    ],
    Asustadizo: [
      '¡Gracias! ¡Ahora sí podemos!',
      '¡Salvaste la situación!',
      '¡Mi salvador!',
    ],
  };

  const pool = responses[trait] || responses.Leal;
  return Random.pickRandom(pool);
}

/**
 * Generate victory message
 */
function generateVictoryMessage(commander) {
  const trait = commander.traits[0] || 'Leal';

  const messages = {
    Brutal: '¡VICTORIA! ¡Hemos triufado en batalla!',
    Leal: 'Lo logramos... juntos. Gracias por tu apoyo',
    Estratega: 'Táctica perfecta. Victoria completa',
    Asustadizo: 'Ganamos... no puedo creerlo',
    Maldito: 'Sangre, destrucción... y victoria',
    Vengativo: 'Por los caídos. Venganza cumplida',
    Noble: 'Honor a los caídos. Victoria justa',
  };

  return messages[trait] || messages.Leal;
}

/**
 * Generate defeat message
 */
function generateDefeatMessage(commander) {
  const trait = commander.traits[0] || 'Leal';

  const messages = {
    Brutal: '¡Maldición! ¡Hemos caído!',
    Leal: 'Lo siento... no fue suficiente',
    Estratega: 'El plan falló... quizá fue la ejecución',
    Asustadizo: '¡Lo sabía! ¡Sabía que no podríamos!',
    Maldito: 'Derrota maldita...',
    Vengativo: 'No... mi venganza sin cumplir',
    Noble: 'Caemos con honor en el campo de batalla',
  };

  return messages[trait] || messages.Leal;
}

module.exports = {
  generateMessage,
  generateMoraleMessage,
  generateResponseToAction,
  generateVictoryMessage,
  generateDefeatMessage,
};
