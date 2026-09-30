import { PLAYER, PLATFORM_TYPES } from "./constants.js";

let nextId = 1;
function id() {
  return nextId++;
}

export function resetIds() {
  nextId = 1;
}

export function createPlayer(x, y) {
  return {
    x,
    y,
    width: PLAYER.width,
    height: PLAYER.height,
    vx: 0,
    vy: 0,
    grounded: false,
    alive: true,
    coyote: 0,
    groundPlatform: null,
    squash: 1,
    facing: 1,
    deathCause: null,
  };
}

export function createPlatform({
  x,
  y,
  width,
  height = 16,
  type = PLATFORM_TYPES.NORMAL,
  moveAxis = "x",
  moveAmp = 0,
  moveSpeed = 0,
  movePhase = 0,
}) {
  return {
    id: id(),
    x,
    y,
    width,
    height,
    type,
    baseX: x,
    baseY: y,
    moveAxis,
    moveAmp,
    moveSpeed,
    movePhase,
    lastX: x,
    lastY: y,
    breakTimer: 0,
    broken: false,
    visible: 1,
  };
}

export function createSpike(x, y, width = 22, height = 16, platform = null) {
  return {
    id: id(),
    x,
    y,
    width,
    height,
    platformId: platform ? platform.id : null,
    offsetX: platform ? x - platform.x : 0,
    offsetY: platform ? y - platform.y : 0,
  };
}

export function createZombie(x, y, platform, speed) {
  return {
    id: id(),
    x,
    y: y - 26,
    width: 24,
    height: 26,
    vx: 0,
    speed,
    dir: Math.random() < 0.5 ? -1 : 1,
    detectRange: 180 + Math.random() * 40,
    platformId: platform ? platform.id : null,
    bob: Math.random() * Math.PI * 2,
  };
}

export function createParticle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 40 + Math.random() * 180;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 40,
    life: 0.35 + Math.random() * 0.35,
    max: 0.7,
    color,
    size: 2 + Math.random() * 3,
  };
}
