const scene = document.querySelector('.scene');
const params = new URLSearchParams(location.search);
const archived = scene.dataset.round === 'framed';
const site = scene.hasAttribute('data-site');
const layouts = site ? await import('./layouts.js?v=center-stack') : null;
const meta = document.querySelector('meta[name="theme-color"]');
const updateTheme = () => { meta.content = getComputedStyle(scene).getPropertyValue('--back').trim(); };

let current;
function setLayout(input) {
  const settings = layouts.readSettings(input);
  const key = JSON.stringify(settings);
  if (key === current) return false;
  current = key;
  layouts.applyLayout(scene, settings);
  updateTheme();
  return true;
}
if (site) setLayout(Object.fromEntries(params));
else {
  const { applyVariant, getVariant, getTexture, studyURL } = await import(archived ? './framed/variants.js' : './variants.js');
  const variant = getVariant(params.get('v'));
  scene.dataset.texture = archived ? 'legacy' : getTexture(params.get('texture'));
  applyVariant(scene, variant);
  document.title = `${variant.name} · Orc Siege`;
  updateTheme();
  const browse = document.querySelector('#all-studies');
  browse.href = archived ? `./?v=${variant.id}#preview` : studyURL(variant.id, scene.dataset.texture, true);
  browse.hidden = window.parent !== window;
}

const { layout, setPaused } = await import('../assets/title-motion.js');
if (site && window.parent !== window) {
  for (const link of scene.querySelectorAll('.site-nav a')) {
    link.target = '_blank';
    link.rel = 'noopener';
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== layouts.settingsMessage) return;
    const { settings, paused } = event.data;
    if (!settings || typeof settings !== 'object') return;
    if (setLayout(settings)) layout();
    if (typeof paused === 'boolean' && paused !== (scene.dataset.paused === 'true')) setPaused(paused);
  });
  parent.postMessage({ type: layouts.readyMessage }, location.origin);
}
