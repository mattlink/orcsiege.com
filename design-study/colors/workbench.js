import { applyVariant, getTexture, getVariant, studyURL, variants } from '../variants.js';

const screen = document.querySelector('#screen');
const options = document.querySelector('#options');
const cards = document.querySelector('#cards');
const picker = document.querySelector('#texture');
let current, texture;

function selectLink(variant, card = false) {
  const link = document.createElement('a');
  link.dataset.choice = variant.id;
  link.setAttribute('aria-label', `${variant.id} ${variant.name}`);
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    change(variant.id, texture);
    if (card) {
      options.querySelector(`[data-choice="${variant.id}"]`).focus({ preventScroll: true });
      document.querySelector('#preview').scrollIntoView({ block: 'start' });
    }
  });
  return link;
}

for (const variant of variants) {
  const option = selectLink(variant);
  option.textContent = variant.id;
  options.append(option);
  const card = selectLink(variant, true);
  card.className = 'card';
  const sample = document.createElement('span');
  const wordmark = document.createElement('span');
  sample.className = 'paint';
  sample.setAttribute('aria-hidden', 'true');
  wordmark.textContent = 'Orc Siege';
  sample.append(wordmark);
  applyVariant(sample, variant);
  const label = document.createElement('small');
  const hexes = document.createElement('span');
  hexes.textContent = `${variant.ink} / ${variant.wall}`;
  label.append(`${variant.id} ${variant.name}`, document.createElement('br'), hexes);
  card.append(sample, label);
  cards.append(card);
}

function select(variant, mode) {
  if (variant.id === current && mode === texture) return;
  current = variant.id;
  texture = picker.value = mode;
  const url = studyURL(current, texture);
  screen.title = `${variant.name}: interactive Orc Siege title`;
  // Keep the workbench selection, not the iframe navigation, in Back/Forward.
  screen.contentWindow.location.replace(new URL(url, location.href).href);
  screen.hidden = false;
  document.querySelector('#open').href = url;
  document.querySelector('#caption').textContent = `${variant.id} ${variant.name} — ${variant.ink} on ${variant.wall}`;
  for (const link of document.querySelectorAll('[data-choice]')) {
    link.href = studyURL(link.dataset.choice, texture, true);
    if (link.dataset.choice === current) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}
function change(id, mode) {
  if (id !== current || mode !== texture) history.pushState(null, '', studyURL(id, mode, true));
  select(getVariant(id), mode);
}
function readLocation() {
  const params = new URLSearchParams(location.search);
  select(getVariant(params.get('v')), getTexture(params.get('texture')));
}
picker.addEventListener('change', () => change(current, getTexture(picker.value)));
window.addEventListener('popstate', readLocation);
readLocation();
