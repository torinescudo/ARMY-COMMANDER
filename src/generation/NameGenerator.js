/**
 * Dark Goth name generation for commanders and units
 */

const Random = require('../utils/Random');

const DARK_GOTH_ADJECTIVES = [
  'Putrefacto',
  'Espectral',
  'Corrupto',
  'Maldito',
  'Sombrío',
  'Necrófago',
  'Infernal',
  'Venenoso',
  'Profano',
  'Condenado',
  'Sangriento',
  'Torturado',
  'Despiadado',
  'Maligno',
  'Tenebroso',
  'Abismal',
  'Funesto',
  'Siniestro',
  'Monstruoso',
  'Diabólico',
];

const UNIT_TYPES = [
  'Soldado',
  'Arquero',
  'Caballería',
  'Mago',
  'Nigromante',
  'Paladín',
  'Berserker',
  'Pícaro',
  'Sacerdote',
  'Guardián',
];

const COMMANDER_FIRST_NAMES = [
  'Kael',
  'Vex',
  'Morg',
  'Krath',
  'Soryn',
  'Tharn',
  'Valak',
  'Xenos',
  'Shade',
  'Raven',
  'Curse',
  'Drath',
  'Grim',
  'Noir',
  'Hex',
  'Void',
  'Blaze',
  'Storm',
  'Rune',
  'Night',
];

const COMMANDER_LAST_NAMES = [
  'the Cursed',
  'the Damned',
  'the Undying',
  'the Fell',
  'the Dread',
  'the Accursed',
  'the Vile',
  'the Grim',
  'the Wretched',
  'the Eternal',
  'the Void-Touched',
  'the Abyssal',
  'the Forsaken',
  'the Fallen',
  'the Shadowed',
];

/**
 * Generate a unit name (Type + Adjective)
 */
function generateUnitName() {
  const type = Random.pickRandom(UNIT_TYPES);
  const adjective = Random.pickRandom(DARK_GOTH_ADJECTIVES);
  return `${type} ${adjective}`;
}

/**
 * Generate a commander name (First + Last)
 */
function generateCommanderName() {
  const first = Random.pickRandom(COMMANDER_FIRST_NAMES);
  const last = Random.pickRandom(COMMANDER_LAST_NAMES);
  return `${first} ${last}`;
}

module.exports = {
  generateUnitName,
  generateCommanderName,
  DARK_GOTH_ADJECTIVES,
  UNIT_TYPES,
  COMMANDER_FIRST_NAMES,
  COMMANDER_LAST_NAMES,
};
