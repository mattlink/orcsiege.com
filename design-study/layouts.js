import { variants } from './variants.js';

export const layouts = [
  { id: '01', name: 'Bookends', note: 'Title top-left, links bottom-left. The original layout reference.' },
  { id: '02', name: 'Beside the title', note: 'Two links stacked directly to the right, with their top edge aligned to the title.' },
  { id: '03', name: 'Split header', note: 'Title top-left and a single row of links at the opposite end of the header.' },
  { id: '04', name: 'Index', note: 'A short vertical link list directly beneath the top-left title.' },
  { id: '05', name: 'Right rail', note: 'Title top-left, links stacked halfway down the right edge.' },
  { id: '06', name: 'Diagonal', note: 'Title top-left, links together at the lower-right corner.' },
  { id: '07', name: 'Reverse diagonal', note: 'Title top-right, links stacked at the lower-left corner.' },
  { id: '08', name: 'Center stack', note: 'Title and links together as a small island in the middle of the page.' },
  { id: '09', name: 'Center bookends', note: 'Centered title at the top, centered links all the way at the bottom.' },
  { id: '10', name: 'Low left', note: 'The previous homepage: a deeper inset, with the links just below the title.', inset: 160 },
  { id: '11', name: 'Midline', note: 'Title left, stacked links right, both halfway down the page.' },
  { id: '12', name: 'Two corners', note: 'Centered title, with Classic at bottom-left and About at bottom-right.' },
];
export const defaultLayout = '08';
export const getLayout = id => layouts.find(layout => layout.id === id) ?? layouts.find(layout => layout.id === defaultLayout);
export const defaultPalette = '05';
export const getPalette = id => variants.find(palette => palette.id === id) ?? variants.find(palette => palette.id === defaultPalette);
export const sliders = {
  size: { min: 34, max: 76, initial: 52, label: 'Title size' },
  inset: { min: 12, max: 192, initial: 24, label: 'Page inset' },
  gap: { min: 6, max: 40, initial: 18, label: 'Link gap' },
};
export const settingsMessage = 'orcsiege:layout-settings';
export const readyMessage = 'orcsiege:layout-ready';

const initialValue = (layout, key) => layout[key] ?? sliders[key].initial;

export function readSettings(value = {}) {
  const layout = getLayout(value.layout);
  const settings = { layout: layout.id, v: getPalette(value.v).id };
  for (const [key, range] of Object.entries(sliders)) {
    const raw = value[key];
    const number = (typeof raw === 'string' && raw.trim()) || typeof raw === 'number' ? Number(raw) : NaN;
    settings[key] = Number.isFinite(number) ? Math.min(range.max, Math.max(range.min, Math.round(number))) : initialValue(layout, key);
  }
  return settings;
}

// Untouched knobs follow the selected layout's preset; manual edits carry over.
export function switchLayout(input, id) {
  const settings = readSettings(input);
  const previous = getLayout(settings.layout);
  const next = getLayout(id);
  for (const key of Object.keys(sliders)) {
    if (settings[key] === initialValue(previous, key)) settings[key] = initialValue(next, key);
  }
  return { ...settings, layout: next.id };
}

export function layoutURL(input, gallery = false) {
  const settings = readSettings(input);
  const layout = getLayout(settings.layout);
  const params = new URLSearchParams({ layout: settings.layout, v: settings.v });
  for (const key of Object.keys(sliders)) if (settings[key] !== initialValue(layout, key)) params.set(key, settings[key]);
  return `${gallery ? './' : './study.html'}?${params}`;
}

export function applyLayout(element, input) {
  const settings = readSettings(input);
  const palette = getPalette(settings.v);
  element.dataset.layout = settings.layout;
  element.dataset.variant = settings.v;
  element.style.setProperty('--back', palette.wall);
  element.style.setProperty('--ink', palette.ink);
  for (const key of Object.keys(sliders)) element.style.setProperty(`--${key}`, `${settings[key]}px`);
}
