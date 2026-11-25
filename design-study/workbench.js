import { applyLayout, getLayout, layoutURL, layouts, readSettings, readyMessage, settingsMessage, sliders, switchLayout } from './layouts.js?v=center-stack';
import { variants } from './variants.js';

const screen = document.querySelector('#screen');
const palette = document.querySelector('#palette');
const pause = document.querySelector('#pause');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const options = document.querySelector('#options');
const cards = document.querySelector('#cards');
const open = document.querySelector('#open');
const caption = document.querySelector('#caption');
const rangeControls = {};
const locationSettings = () => readSettings(Object.fromEntries(new URLSearchParams(location.search)));
let settings = locationSettings();
let ready = false, paused = false;
let stillPalette;

for (const variant of variants) palette.add(new Option(`${variant.id} ${variant.name}`, variant.id));
for (const [key, range] of Object.entries(sliders)) {
  const group = document.createElement('div');
  group.className = 'slider';
  const label = document.createElement('label');
  label.htmlFor = key;
  label.textContent = range.label;
  const input = document.createElement('input');
  input.type = 'range';
  input.id = key;
  input.min = range.min;
  input.max = range.max;
  const output = document.createElement('output');
  output.htmlFor = key;
  // The range has its own accessible value; avoid duplicate live announcements.
  output.setAttribute('aria-hidden', 'true');
  group.append(label, output, input);
  document.querySelector('#sliders').append(group);
  rangeControls[key] = { input, output };
  input.addEventListener('input', () => update({ ...settings, [key]: input.value }));
  input.addEventListener('change', () => save('replaceState'));
}

function selectLink(study, card = false) {
  const link = document.createElement('a');
  link.dataset.choice = study.id;
  link.setAttribute('aria-label', `${study.id} ${study.name}`);
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (study.id !== settings.layout) commit(switchLayout(settings, study.id));
    if (card) {
      options.querySelector(`[data-choice="${study.id}"]`).focus({ preventScroll: true });
      document.querySelector('#preview').scrollIntoView({ block: 'start' });
    }
  });
  return link;
}
for (const study of layouts) {
  const option = selectLink(study);
  option.textContent = study.id;
  options.append(option);
  const card = selectLink(study, true);
  card.className = 'card';
  // Non-interactive stills use the same CSS grid rules as the real landing page.
  const mini = document.createElement('div');
  mini.className = 'mini';
  mini.setAttribute('aria-hidden', 'true');
  mini.innerHTML = `<div class="scene landing" data-layout="${study.id}"><div class="site-grid">
      <div class="frame"><div class="title">Orc Siege</div></div>
      <div class="site-nav"><span class="mock-link">Orc Siege Classic</span><span class="mock-link">About</span></div>
    </div></div>`;
  const label = document.createElement('span');
  label.className = 'card-label';
  label.textContent = `${study.id} ${study.name}`;
  card.append(mini, label);
  cards.append(card);
}

function send() {
  if (ready) screen.contentWindow.postMessage({ type: settingsMessage, settings, paused }, location.origin);
}
function save(method) {
  const url = new URL(layoutURL(settings, true), location.href);
  if (url.href !== location.href) history[method](null, '', url);
}
function update(next) {
  settings = readSettings(next);
  const selected = getLayout(settings.layout);
  palette.value = settings.v;
  for (const [key, { input, output }] of Object.entries(rangeControls)) {
    input.value = settings[key];
    output.value = `${settings[key]} px`;
  }
  const description = `${selected.id} ${selected.name} — ${selected.note}`;
  if (caption.textContent !== description) caption.textContent = description;
  screen.title = `Orc Siege homepage: ${selected.name}`;
  open.href = layoutURL(settings);
  for (const link of document.querySelectorAll('[data-choice]')) {
    link.href = layoutURL(switchLayout(settings, link.dataset.choice), true);
    if (link.dataset.choice === selected.id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  if (stillPalette !== settings.v) {
    for (const scene of cards.querySelectorAll('.landing')) applyLayout(scene, { layout: scene.dataset.layout, v: settings.v });
    stillPalette = settings.v;
  }
  send();
}
function commit(next) { update(next); save('pushState'); }
palette.addEventListener('change', () => commit({ ...settings, v: palette.value }));
window.addEventListener('popstate', () => update(locationSettings()));
document.querySelector('#viewport').addEventListener('change', event => { screen.parentElement.dataset.viewport = event.target.value; });
document.querySelector('#reset').addEventListener('click', () => commit({ layout: settings.layout, v: settings.v }));
function pauseLabel() {
  pause.disabled = preference.matches;
  pause.textContent = preference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
  pause.setAttribute('aria-pressed', String(paused));
}
pause.addEventListener('click', () => { paused = !paused; pauseLabel(); send(); });
preference.addEventListener('change', pauseLabel);
window.addEventListener('message', event => {
  if (event.source !== screen.contentWindow || event.origin !== location.origin || event.data?.type !== readyMessage) return;
  ready = true;
  send();
});
update(settings);
screen.src = layoutURL(settings);
screen.hidden = false;
document.querySelector('.settings').hidden = false;
pauseLabel();