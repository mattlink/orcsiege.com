import { applyVariant, getVariant, hardware, variants } from './variants.js';

const screen = document.querySelector('#screen');
const options = document.querySelector('#options');
const cards = document.querySelector('#cards');
const preview = document.querySelector('#preview');
let current;

function selectLink(variant, className, label) {
  const link = document.createElement('a');
  link.className = className;
  link.href = `./?v=${variant.id}#preview`;
  link.dataset.choice = variant.id;
  link.setAttribute('aria-label', `${variant.id} ${variant.name}${label}`);
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (variant.id !== current) history.pushState(null, '', link.href);
    select(variant);
    if (className === 'card') {
      options.querySelector(`[data-choice="${variant.id}"]`).focus({ preventScroll: true });
      preview.scrollIntoView({ block: 'start' });
    }
  });
  return link;
}

for (const variant of variants) {
  const option = selectLink(variant, 'option', '');
  option.textContent = variant.id;
  options.append(option);
  const card = selectLink(variant, 'card', `: ${variant.material}, ${variant.layout}`);
  card.innerHTML = `<div class="scene" aria-hidden="true"><div class="frame"><div class="playfield"><div class="inlay"></div><div class="title"><span>Orc</span> <span>Siege</span></div></div>${hardware}</div></div>
    <div class="card-title"><span class="spec-id">${variant.id}</span>${variant.name}</div><div class="card-meta">${variant.material} / ${variant.layout}</div>`;
  applyVariant(card.querySelector('.scene'), variant);
  cards.append(card);
}

function select(variant) {
  if (variant.id === current) return;
  current = variant.id;
  const url = `./study.html?v=${variant.id}`;
  screen.title = `${variant.name}: interactive Orc Siege homepage`;
  // Only the outer selection contributes a browser history entry.
  screen.contentWindow.location.replace(new URL(url, location.href).href);
  screen.hidden = false;
  document.querySelector('#open').href = url;
  document.querySelector('#number').textContent = variant.id;
  document.querySelector('#study-name').textContent = variant.name;
  document.querySelector('#study-note').textContent = variant.note;
  const palette = document.querySelector('#palette');
  palette.replaceChildren();
  for (const [label, hex] of [['Ink', variant.ink], ['Field', variant.wall], ['Wood', variant.wood]]) {
    const item = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.className = 'chip';
    swatch.style.setProperty('--chip', hex);
    swatch.setAttribute('aria-hidden', 'true');
    item.append(swatch, `${label} ${hex}`);
    palette.append(item);
  }
  for (const link of document.querySelectorAll('[data-choice]')) {
    if (link.dataset.choice === current) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}
function readLocation() { select(getVariant(new URLSearchParams(location.search).get('v'))); }
window.addEventListener('popstate', readLocation);
readLocation();