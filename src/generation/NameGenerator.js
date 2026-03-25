/**
 * ╔═══════════════════════════════════════════╗
 * ║  NameGenerator - El Libro de los Muertos   ║
 * ╚═══════════════════════════════════════════╝
 *
 * Every soul has a name. Every name carries
 * the weight of the darkness that birthed it.
 */

const Random = require('../utils/Random');

const DARK_GOTH_ADJECTIVES = [
  'Putrefacto', 'Espectral', 'Corrupto', 'Maldito', 'Sombrío',
  'Necrófago', 'Infernal', 'Venenoso', 'Profano', 'Condenado',
  'Sangriento', 'Torturado', 'Despiadado', 'Maligno', 'Tenebroso',
  'Abismal', 'Funesto', 'Siniestro', 'Monstruoso', 'Diabólico',
  'Carcomido', 'Marchito', 'Ahogado', 'Aullante', 'Devorador',
];

const UNIT_TYPE_NAMES = [
  'Soldado', 'Arquero', 'Caballería', 'Mago', 'Nigromante',
  'Paladín', 'Berserker', 'Pícaro', 'Sacerdote', 'Guardián',
  'Centinela', 'Verdugo', 'Sicario', 'Invocador', 'Acólito',
];

const COMMANDER_FIRST_NAMES = [
  'Kael', 'Vex', 'Morg', 'Krath', 'Soryn', 'Tharn', 'Valak',
  'Xenos', 'Shade', 'Raven', 'Drath', 'Grim', 'Noir', 'Hex',
  'Void', 'Blaze', 'Storm', 'Rune', 'Night', 'Ash', 'Bane',
  'Thorn', 'Wraith', 'Skull', 'Vile', 'Fang', 'Doom', 'Dirge',
];

const COMMANDER_TITLES = [
  'el Maldito', 'el Condenado', 'el Inmortal', 'el Caído',
  'el Temido', 'el Maldecido', 'el Vil', 'el Sombrío',
  'el Desdichado', 'el Eterno', 'el Tocado por el Vacío',
  'el Abisal', 'el Abandonado', 'el Profanador',
  'el Ensombrecido', 'el Devorador', 'el Sin Nombre',
  'el Portador de la Plaga', 'el Último Suspiro',
];

function generateUnitName() {
  const type = Random.pickRandom(UNIT_TYPE_NAMES);
  const adjective = Random.pickRandom(DARK_GOTH_ADJECTIVES);
  return `${type} ${adjective}`;
}

function generateCommanderName() {
  const first = Random.pickRandom(COMMANDER_FIRST_NAMES);
  const title = Random.pickRandom(COMMANDER_TITLES);
  return `${first} ${title}`;
}

module.exports = {
  generateUnitName,
  generateCommanderName,
  DARK_GOTH_ADJECTIVES,
  UNIT_TYPE_NAMES,
  COMMANDER_FIRST_NAMES,
  COMMANDER_TITLES,
};
