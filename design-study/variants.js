const grounds = [
  { name: 'Pitch', color: '#090909' },
  { name: 'Charcoal', color: '#242424' },
];
const inks = [
  { name: 'Rust', color: '#bc5429' },
  { name: 'Clay', color: '#c16a50' },
  { name: 'Ember', color: '#df702f' },
  { name: 'Ochre', color: '#ca893d' },
];

// Repeat the same four inks on both grounds to isolate the color decisions.
export const variants = grounds.flatMap((ground, row) => inks.map((ink, col) => ({
  id: String(row * inks.length + col + 1).padStart(2, '0'),
  name: `${ink.name} on ${ground.name.toLowerCase()}`,
  ground: ground.name, ink: ink.color, wall: ground.color,
})));

export const getVariant = id => variants.find(variant => variant.id === id) ?? variants[0];
export const getTexture = value => value === 'dual' ? 'dual' : 'single';

export function applyVariant(scene, variant) {
  scene.dataset.variant = variant.id;
  scene.style.setProperty('--ink', variant.ink);
  scene.style.setProperty('--back', variant.wall);
}

export function studyURL(id, texture, gallery = false) {
  const query = new URLSearchParams({ v: getVariant(id).id });
  if (getTexture(texture) === 'dual') query.set('texture', 'dual');
  return gallery ? `./?${query}#preview` : `./study.html?${query}`;
}
