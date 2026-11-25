import { advance, createWorld, grab, moveGrab, nudge, release, resetPointer, samplePointer } from './title-physics.js';
import { motionBounds } from './title-bounds.js';

const scene = document.querySelector('.scene');
const archived = scene.dataset.round === 'framed';
const site = scene.hasAttribute('data-site');
const texture = scene.dataset.texture ?? 'single';
scene.dataset.texture = texture;
const frame = document.querySelector('.frame');
const field = document.querySelector('.playfield');
const title = document.querySelector('.title');
const layer = document.querySelector('.letter-layer');
const wake = document.querySelector('#wake');
const pause = document.querySelector('#pause');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const words = [...title.children];
const text = words.map(word => word.textContent).join(' ');
const measure = document.createElement('canvas').getContext('2d');

let world, units = 1, size = 48, raf = null, last = null;
let hovered = false, held = false, paused = false, visible = true;
let pointerId = null, suppressClick = 0;

const letters = Array.from(text, (character, index) => {
  if (character === ' ') return null;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'title-letter';
  button.tabIndex = -1;
  button.setAttribute('aria-label', `Letter ${character}, position ${index + 1}: arrow keys or Space to nudge`);
  const primary = document.createElement('span');
  const secondary = texture === 'single' ? null : document.createElement('span');
  if (secondary) secondary.className = 'bastarda';
  for (const glyph of secondary ? [primary, secondary] : [primary]) {
    glyph.textContent = character;
    glyph.setAttribute('aria-hidden', 'true');
    button.append(glyph);
  }
  button.addEventListener('keydown', event => {
    const directions = { ArrowLeft: [-145, 0], ArrowRight: [145, 0], ArrowUp: [0, -145], ArrowDown: [0, 145] };
    if (!(event.key in directions) || !canMove()) return;
    event.preventDefault();
    held = true;
    setActive();
    nudge(world, index, ...directions[event.key]);
  });
  button.addEventListener('click', event => {
    if (event.detail !== 0 || !canMove()) return;
    held = true;
    setActive();
    nudge(world, index, 35, -150);
  });
  layer.append(button);
  return { button, primary, secondary };
});

export function layout() {
  const resting = title.getBoundingClientRect();
  if (site) {
    const links = [...scene.querySelectorAll('.site-nav a')].map(link => link.getBoundingClientRect());
    const bounds = motionBounds(resting, scene.getBoundingClientRect(), links);
    const origin = frame.getBoundingClientRect();
    Object.assign(field.style, {
      left: `${bounds.left - origin.left}px`, top: `${bounds.top - origin.top}px`,
      width: `${bounds.right - bounds.left}px`, height: `${bounds.bottom - bounds.top}px`,
    });
  }
  const rect = field.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  drop();
  // Side B has room for a spring return even in the narrowest Lintel. Give the
  // simulation that same minimum space, then map its coordinates back to CSS px.
  units = Math.max(1, 300 / rect.height, 280 / rect.width);
  const style = getComputedStyle(title);
  size = parseFloat(style.fontSize);
  if (measure) measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const widthOf = value => measure?.measureText(value).width ?? value.length * size * .52;
  const homes = [];
  for (const [ordinal, word] of words.entries()) {
    const bounds = word.getBoundingClientRect();
    const value = word.textContent;
    const left = bounds.left - rect.left + (getComputedStyle(word).textAlign === 'center' ? (bounds.width - widthOf(value)) / 2 : 0);
    const centerY = bounds.top - rect.top + bounds.height / 2;
    if (ordinal) homes.push({ x: (left - size * .08) * units, y: centerY * units });
    Array.from(value).forEach((character, index) => {
      const start = widthOf(value.slice(0, index));
      const end = widthOf(value.slice(0, index + 1));
      homes.push({ x: (left + (start + end) / 2) * units, y: centerY * units });
      const { button } = letters[homes.length - 1];
      button.style.width = `${Math.max(size * .46, end - start, 22)}px`;
      button.style.height = `${Math.max(size * .84, 25)}px`;
      button.style.fontSize = `${size}px`;
    });
  }
  world = createWorld(homes, rect.width * units, rect.height * units, text);
  world.spread = Math.min(archived ? 18 : 9, world.width * .019);
  if (!archived) world.lift = site && resting.top - rect.top > rect.bottom - resting.bottom ? -32 * units : 32 * units;
  if (site) world.shift = resting.left - rect.left > rect.right - resting.right ? -28 : 28;
  world.scale = Math.min(1.35, size * units / 60);
  for (const body of world.bodies) body.radius *= Math.max(.9, size * units * .022);
  setActive();
  render();
}
const canMove = () => world && !paused && !preference.matches;

function show(mode) {
  if (mode !== 'moving' && layer.contains(document.activeElement)) frame.focus({ preventScroll: true });
  frame.dataset.motion = mode;
  layer.hidden = mode !== 'moving';
  for (const letter of letters) if (letter) letter.button.tabIndex = mode === 'moving' && world.active && !paused ? 0 : -1;
}
function setActive() {
  if (wake) {
    wake.textContent = held ? 'Recall title' : 'Wake letters';
    wake.setAttribute('aria-pressed', String(held));
  }
  if (!world) return;
  world.active = hovered || held || pointerId !== null;
  if (preference.matches) show(world.active ? 'still-active' : 'rest');
  else if (!paused && world.active) {
    render();
    show('moving');
  } else if (frame.dataset.motion === 'moving') show('moving');
  else show('rest');
  schedule();
}
function render() {
  world.bodies.forEach((body, index) => {
    const letter = letters[index];
    if (!letter) return;
    letter.button.style.transform = `translate(${body.x / units}px, ${body.y / units}px) translate(-50%, -50%) rotate(${body.angle}deg)`;
    if (texture === 'single') return;
    // In the new study, let the glyphs get moving before changing face. The
    // CSS adds the two isolated alpha masks instead of darkening their overlap.
    const t = Math.max(0, Math.min(1, (body.blend - .20) / .68));
    const blend = archived ? body.blend : t * t * (3 - 2 * t);
    letter.primary.style.opacity = String(1 - blend);
    letter.secondary.style.opacity = String(blend);
  });
}
function schedule() {
  if (raf === null && canMove() && visible && !document.hidden && frame.dataset.motion === 'moving') raf = requestAnimationFrame(tick);
}
function stop() {
  if (raf !== null) cancelAnimationFrame(raf);
  raf = last = null;
}
function tick(now) {
  raf = null;
  if (!canMove() || !visible || document.hidden) { last = null; return; }
  const dt = last === null ? 1 / 60 : Math.min((now - last) / 1000, .05);
  last = now;
  advance(world, dt);
  render();
  if (!world.active && world.bodies.every(body => !body.radius || (Math.hypot(body.x - body.hx, body.y - body.hy) < .2 * units && Math.hypot(body.vx, body.vy) < 1 && Math.abs(body.angle) < .3 && body.blend < .004))) {
    show('rest');
    last = null;
    // Re-arm from exact homes, not residual spring motion.
    for (const body of world.bodies) Object.assign(body, { x: body.hx, y: body.hy, vx: 0, vy: 0, angle: 0, angularVelocity: 0, blend: 0 });
  } else schedule();
}
function point(event) {
  const bounds = field.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * units, y: (event.clientY - bounds.top) * units };
}
function track(event) {
  const at = point(event);
  samplePointer(world, at.x, at.y, event.timeStamp / 1000, canMove());
  return at;
}
function drop() {
  if (pointerId === null) return;
  const id = pointerId;
  pointerId = null;
  const letter = letters[world.drag?.index];
  letter?.button.removeAttribute('data-grabbed');
  release(world);
  if (frame.hasPointerCapture(id)) frame.releasePointerCapture(id);
}
function recall() {
  drop();
  hovered = held = false;
  if (world) resetPointer(world);
  setActive();
}
function toggle() {
  if (paused && !preference.matches) return;
  if (held) recall();
  else { held = true; setActive(); }
}
frame.addEventListener('pointerenter', event => {
  if (event.pointerType === 'touch' || !world) return;
  hovered = true;
  resetPointer(world);
  track(event);
  setActive();
});
frame.addEventListener('pointerleave', () => {
  hovered = false;
  if (pointerId === null && world) resetPointer(world);
  setActive();
});
frame.addEventListener('pointermove', event => {
  if (!canMove() || (pointerId !== null && pointerId !== event.pointerId)) return;
  const at = track(event);
  if (world.drag) {
    moveGrab(world, at.x, at.y);
    render();
  }
});
frame.addEventListener('pointerdown', event => {
  if (!canMove() || pointerId !== null || event.button !== 0) return;
  // The first touch wakes the frame without preventing a page scroll.
  if (event.pointerType === 'touch' && frame.dataset.motion !== 'moving') return;
  const at = point(event);
  let nearest = -1, closest = Infinity;
  world.bodies.forEach((body, index) => {
    if (!letters[index]) return;
    const distance = Math.hypot(body.x - at.x, body.y - at.y);
    if (distance < closest) { nearest = index; closest = distance; }
  });
  if (closest > Math.max(24, size * .50) * units) return;
  event.preventDefault();
  if (event.pointerType === 'touch') held = true;
  track(event);
  grab(world, nearest, at.x, at.y);
  pointerId = event.pointerId;
  if (!archived && document.activeElement !== frame) frame.dataset.pointerFocus = '';
  frame.focus({ preventScroll: true });
  frame.setPointerCapture(pointerId);
  letters[nearest].button.dataset.grabbed = 'true';
  setActive();
});
function endDrag(event) {
  if (pointerId !== event.pointerId) return;
  const bounds = (site ? field : frame).getBoundingClientRect();
  hovered = event.type === 'pointerup' && event.pointerType !== 'touch' && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  drop();
  suppressClick = performance.now() + 350;
  setActive();
}
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) frame.addEventListener(name, endDrag);
frame.addEventListener('click', event => {
  if (event.target.closest('button') || performance.now() < suppressClick) return;
  toggle();
});
frame.addEventListener('blur', () => { delete frame.dataset.pointerFocus; });
frame.addEventListener('keydown', event => {
  delete frame.dataset.pointerFocus;
  if (event.target === frame && [' ', 'Enter'].includes(event.key)) { event.preventDefault(); toggle(); }
  if (site && event.key.toLowerCase() === 'p' && !event.repeat && !preference.matches) setPaused(!paused);
});
wake?.addEventListener('click', toggle);
pause?.addEventListener('click', () => setPaused(!paused));
export function setPaused(value) {
  paused = value;
  scene.dataset.paused = String(paused);
  if (paused) { drop(); stop(); }
  else if (world) resetPointer(world);
  if (pause && wake) {
    pause.textContent = paused ? 'Resume motion' : 'Pause motion';
    pause.setAttribute('aria-pressed', String(paused));
    wake.disabled = paused;
  }
  setActive();
}
document.addEventListener('keydown', event => { if (event.key === 'Escape') recall(); });
function motionPreference() {
  stop();
  drop();
  if (pause && wake) {
    pause.disabled = preference.matches;
    pause.textContent = preference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
    wake.disabled = paused && !preference.matches;
  }
  show('rest');
  layout();
}
preference.addEventListener('change', motionPreference);
window.addEventListener('blur', () => { hovered = false; drop(); setActive(); });
window.addEventListener('pagehide', () => { recall(); stop(); });
window.addEventListener('pageshow', schedule);
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); else stop(); }).observe(frame);
await Promise.allSettled([
  document.fonts.load('400 72px "Jacquard 12"', text),
  ...(texture === 'single' ? [] : [document.fonts.load('400 60px "Jacquarda Bastarda 9"', text)]),
  ...(site ? [document.fonts.load('400 14px "IBM Plex Mono"', 'Orc Siege Classic About')] : []),
]);
motionPreference();
new ResizeObserver(layout).observe(site ? scene : field);
const tools = document.querySelector('.scene-tools');
if (tools) tools.hidden = false;
scene.dataset.ready = 'true';
