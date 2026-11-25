export const variants = [
  { id: '01', name: 'Gatehouse', ink: '#bb5529', wall: '#18191a', wood: '#665043', material: 'Smoked oak', layout: 'Centered plaque', note: 'A broad, pegged oak surround and a centered title. The most direct translation of Pocket poltergeists into a game landing page.' },
  { id: '02', name: 'Charcoal Press', ink: '#bf5c32', wall: '#0f1012', wood: '#333132', material: 'Charred ash', layout: 'Compact square', note: 'Nearly black timber, a tight square recess, and a thin beveled edge. The orange reads like ink stamped into charcoal.' },
  { id: '03', name: 'The Lintel', ink: '#c26335', wall: '#1d1f21', wood: '#594738', material: 'Oiled walnut', layout: 'Wide / left set', note: 'A low, wide title screen with the wordmark set left. The empty right side gives the loose letters room to spill into.' },
  { id: '04', name: 'Reliquary', ink: '#bf562c', wall: '#161617', wood: '#76614e', material: 'Timeworn oak', layout: 'Portrait / stacked', note: 'A tall case with a diamond inlay and the title on two lines. It feels more like a found object than a conventional game logo.' },
  { id: '05', name: 'Half-lap', ink: '#c15b2c', wall: '#212020', wood: '#72513a', material: 'Rough-cut timber', layout: 'Broad / low set', note: 'Rails extend past the uprights like a hand-built frame. The title sits low at rest, leaving a pocket of dark space for the letters to rise into.' },
  { id: '06', name: 'Silvergrain', ink: '#be5c32', wall: '#242629', wood: '#74716b', material: 'Weathered graywood', layout: 'Wide / centered', note: 'Pale gray grain and a thin inner rule give the burnt orange a cooler contrast. Less tavern sign, more print in a gallery.' },
  { id: '07', name: 'Ironbound', ink: '#ca6436', wall: '#101113', wood: '#534034', material: 'Walnut and iron', layout: 'Deep-set plaque', note: 'Forged corners grip a dark timber frame. The title sits deep in the recess, like the first thing lit inside a gate.' },
  { id: '08', name: 'Door in the Dark', ink: '#b9542b', wall: '#08090a', wood: '#443b33', material: 'Blackened beams', layout: 'Tall / low stacked', note: 'A top beam, dark uprights, and a nearly invisible sill. The stacked title hangs low in a threshold that seems to recede into the page.' },
];

export const getVariant = id => variants.find(variant => variant.id === id) ?? variants[0];

export function applyVariant(scene, variant) {
  scene.dataset.variant = variant.id;
  for (const name of ['ink', 'wall', 'wood']) scene.style.setProperty(`--${name}`, variant[name]);
}

// The live scene and the eight stills share the same physical frame construction.
export const hardware = '<span class="timber north"></span><span class="timber east"></span><span class="timber south"></span><span class="timber west"></span><span class="joint nw"></span><span class="joint ne"></span><span class="joint sw"></span><span class="joint se"></span>';
