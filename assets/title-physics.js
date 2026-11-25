// Weighted-letter simulation from mattl.ink's Pocket poltergeists study.
function noise(index, salt) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
export const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const limitVelocity = (body, maximum = 560) => {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed > maximum) { body.vx *= maximum / speed; body.vy *= maximum / speed; }
};

export function createWorld(homes, width, height, text) {
  const characters = Array.from(text);
  return {
    width, height, scale: 1, spread: 14, lift: -25, shift: 28, time: 0, active: false,
    pointer: { x: width * 0.45, y: height * 0.48, vx: 0, vy: 0, age: 10, sampleTime: null },
    drag: null,
    bodies: homes.map((home, index) => {
      const radius = characters[index]?.trim() === '' ? 0 : characters[index] === '.' ? 5 : 10;
      return {
        x: home.x, y: home.y, hx: home.x, hy: home.y, vx: 0, vy: 0,
        angle: 0, angularVelocity: 0, blend: 0,
        mass: 0.7 + noise(index, 11) * 1.1,
        radius, baseRadius: radius,
      };
    }),
  };
}

export function resetPointer(world) {
  Object.assign(world.pointer, { vx: 0, vy: 0, age: 10, sampleTime: null });
}

// Event-time kinematics, not raw event counts. Fresh entry never produces a kick.
export function samplePointer(world, x, y, seconds, interact = true) {
  const pointer = world.pointer;
  x = clamp(x, 28, Math.max(28, world.width - 28));
  y = clamp(y, 55, Math.max(55, world.height - 48));
  const previous = { x: pointer.x, y: pointer.y };
  const gap = pointer.sampleTime === null ? Infinity : seconds - pointer.sampleTime;
  if (gap > 0.15 || gap <= 0) {
    pointer.vx = pointer.vy = 0;
  } else {
    const dt = Math.max(gap, 1 / 240);
    const vx = clamp((x - pointer.x) / dt, -1400, 1400);
    const vy = clamp((y - pointer.y) / dt, -1400, 1400);
    const smoothing = 1 - Math.exp(-dt * 55);
    const nextX = pointer.vx + (vx - pointer.vx) * smoothing;
    const nextY = pointer.vy + (vy - pointer.vy) * smoothing;
    pointer.vx = nextX;
    pointer.vy = nextY;
  }
  Object.assign(pointer, { x, y, age: 0, sampleTime: seconds });
  if (world.active && interact && gap > 0 && gap <= 0.15) brush(world, previous, pointer);
}

// Swept contact catches a fast pointer crossing a letter between input events.
export function brush(world, start, end) {
  const dx = end.x - start.x, dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared < 0.1) return;
  const speed = Math.min(1100, Math.hypot(end.vx, end.vy));
  for (const [index, body] of world.bodies.entries()) {
    if (body.radius === 0 || world.drag?.index === index) continue;
    const t = clamp(((body.x - start.x) * dx + (body.y - start.y) * dy) / lengthSquared, 0, 1);
    let nx = body.x - (start.x + dx * t), ny = body.y - (start.y + dy * t);
    const distance = Math.hypot(nx, ny);
    const reach = body.radius + 17;
    if (distance > reach) continue;
    if (distance < 0.01) { nx = -dy; ny = dx; }
    const normal = Math.max(Math.hypot(nx, ny), 0.01);
    const contact = Math.min(1, Math.sqrt(lengthSquared) / (reach * 0.7));
    const force = (1 - distance / reach) * (18 + speed * 0.17) * contact;
    nudge(world, index, nx / normal * force + end.vx * 0.06 * contact, ny / normal * force + end.vy * 0.06 * contact);
  }
}

export function nudge(world, index, impulseX, impulseY) {
  const body = world.bodies[index];
  if (!body || body.radius === 0) return;
  body.vx += impulseX / body.mass;
  body.vy += impulseY / body.mass;
  body.angularVelocity += (impulseX - impulseY) * 0.08 / body.mass;
  limitVelocity(body);
}

export function grab(world, index, x, y) {
  const body = world.bodies[index];
  if (!body || body.radius === 0) return;
  world.drag = { index, offsetX: body.x - x, offsetY: body.y - y };
  body.vx = body.vy = 0;
}
export function moveGrab(world, x, y) {
  if (!world.drag) return;
  const body = world.bodies[world.drag.index];
  body.x = clamp(x + world.drag.offsetX, 24, world.width - 24);
  body.y = clamp(y + world.drag.offsetY, 56, world.height - 48);
  body.vx = world.pointer.vx * 0.65;
  body.vy = world.pointer.vy * 0.65;
  limitVelocity(body, 460);
}
export function release(world) {
  if (!world.drag) return;
  const body = world.bodies[world.drag.index];
  // A stationary release should not fling using stale gesture velocity.
  if (world.pointer.age > 0.1) body.vx = body.vy = 0;
  world.drag = null;
}

export function collide(world) {
  for (let a = 0; a < world.bodies.length; a++) {
    for (let b = a + 1; b < world.bodies.length; b++) {
      const first = world.bodies[a], second = world.bodies[b];
      if (first.radius === 0 || second.radius === 0) continue;
      const dx = second.x - first.x, dy = second.y - first.y;
      const distance = Math.hypot(dx, dy);
      const overlap = first.radius + second.radius - distance;
      if (overlap <= 0) continue;
      const nx = distance < 0.001 ? 1 : dx / distance;
      const ny = distance < 0.001 ? 0 : dy / distance;
      const inverseA = world.drag?.index === a ? 0 : 1 / first.mass;
      const inverseB = world.drag?.index === b ? 0 : 1 / second.mass;
      const total = inverseA + inverseB;
      if (!total) continue;
      const correction = Math.max(0, overlap - 0.1) * 0.75 / total;
      first.x -= nx * correction * inverseA; first.y -= ny * correction * inverseA;
      second.x += nx * correction * inverseB; second.y += ny * correction * inverseB;
      const relative = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;
      if (relative >= 0) continue;
      const impulse = -1.55 * relative / total;
      first.vx -= impulse * nx * inverseA; first.vy -= impulse * ny * inverseA;
      second.vx += impulse * nx * inverseB; second.vy += impulse * ny * inverseB;
      first.angularVelocity -= impulse * 0.07 * inverseA;
      second.angularVelocity += impulse * 0.07 * inverseB;
    }
  }
}

function floatingTarget(world, index) {
  const body = world.bodies[index];
  const seed = noise(index, 7), time = world.time;
  const center = index - (world.bodies.length - 1) / 2;
  const x = body.hx + center * world.spread + Math.sin(time * 0.7 + seed * 6) * 13 + world.shift * world.scale;
  const y = body.hy + world.lift + Math.sin(time * 0.8 + index * 1.8) * 36;
  return { x: clamp(x, 28, world.width - 28), y: clamp(y, 64, world.height - 58) };
}

export function advance(world, seconds) {
  const elapsed = clamp(seconds, 0, 0.05);
  if (elapsed === 0) return;
  const count = Math.max(1, Math.ceil(elapsed * 120));
  const dt = elapsed / count;
  for (let step = 0; step < count; step++) {
    world.time += dt;
    world.pointer.age += dt;
    for (const [index, body] of world.bodies.entries()) {
      body.blend += ((world.active ? 1 : 0) - body.blend) * (1 - Math.exp(-dt * 7));
      if (world.drag?.index === index) continue;
      const target = world.active ? floatingTarget(world, index) : { x: body.hx, y: body.hy };
      const stiffness = world.active ? 6 : 185;
      const fx = (target.x - body.x) * stiffness;
      const fy = (target.y - body.y) * stiffness;
      // Active bodies have weight and low damping; returning letters use a
      // deliberately mass-normalized spring so every glyph reforms the word.
      const mass = world.active ? body.mass : 1;
      const damping = world.active ? 2.1 : 14;
      body.vx += (fx / mass - damping * body.vx) * dt;
      body.vy += (fy / mass - damping * body.vy) * dt;
      limitVelocity(body);
      body.x += body.vx * dt; body.y += body.vy * dt;
      const desiredAngle = world.active ? clamp(body.vx * 0.06 + Math.sin(world.time + index) * 7, -24, 24) : 0;
      body.angularVelocity += ((desiredAngle - body.angle) * (world.active ? 8 : 160) - body.angularVelocity * (world.active ? 3 : 14)) * dt;
      body.angle += body.angularVelocity * dt;
      if (world.active) {
        if (body.x < 22 || body.x > world.width - 22) { body.x = clamp(body.x, 22, world.width - 22); body.vx *= -0.55; }
        if (body.y < 56 || body.y > world.height - 48) { body.y = clamp(body.y, 56, world.height - 48); body.vy *= -0.55; }
      }
    }
    if (world.active && world.bodies[0]?.blend > 0.35) collide(world);
  }
}
