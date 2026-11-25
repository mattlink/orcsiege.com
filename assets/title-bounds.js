// Keep the invisible playfield in the viewport and away from clickable links.
// DOMRect-compatible inputs make this independent of the layout renderer.
export function motionBounds(title, area, links = []) {
  let bounds = {
    left: Math.max(area.left, title.left - 72), right: Math.min(area.right, title.right + 128),
    top: Math.max(area.top, title.top - 82), bottom: Math.min(area.bottom, title.bottom + 112),
  };
  const size = box => (box.right - box.left) * (box.bottom - box.top);
  for (const link of links) {
    const block = { left: link.left - 8, right: link.right + 8, top: link.top - 8, bottom: link.bottom + 8 };
    if (block.left >= bounds.right || block.right <= bounds.left || block.top >= bounds.bottom || block.bottom <= bounds.top) continue;
    const cuts = [];
    if (link.left >= title.right) cuts.push({ ...bounds, right: Math.max(title.right, block.left) });
    if (link.right <= title.left) cuts.push({ ...bounds, left: Math.min(title.left, block.right) });
    if (link.top >= title.bottom) cuts.push({ ...bounds, bottom: Math.max(title.bottom, block.top) });
    if (link.bottom <= title.top) cuts.push({ ...bounds, top: Math.min(title.top, block.bottom) });
    if (cuts.length) bounds = cuts.sort((a, b) => size(b) - size(a))[0];
  }
  return bounds;
}
