import { WORLD_WIDTH, PLATFORM_TYPES } from "./constants.js";
import { generationParams } from "./difficulty.js";
import { createPlatform, createSpike, createZombie } from "./entities.js";

function rand(rng, a, b) {
  return a + rng() * (b - a);
}

function chance(rng, p) {
  return rng() < p;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function createWorldGenerator(seed = Date.now()) {
  const rng = mulberry32(seed);
  let highestY = 0;
  let last = null;

  function reset(startY) {
    highestY = startY;
    last = null;
  }

  function addStartPlatforms(world) {
    const ground = createPlatform({
      x: WORLD_WIDTH / 2 - 160,
      y: startY(),
      width: 320,
      type: PLATFORM_TYPES.NORMAL,
    });
    world.platforms.push(ground);
    last = ground;
    highestY = ground.y;

    for (let i = 0; i < 6; i += 1) {
      generateNext(world, 0);
    }
  }

  function startY() {
    return 420;
  }

  /**
   * Always place a reachable next platform from the previous one.
   * Extra optional platforms may be added as decoys / extra routes.
   */
  function generateNext(world, heightMeters) {
    const p = generationParams(heightMeters);
    const prev = last;
    const dy = rand(rng, p.minGapY, p.maxGapY);
    const y = prev.y - dy;

    let type = PLATFORM_TYPES.NORMAL;
    if (chance(rng, p.movingChance)) type = PLATFORM_TYPES.MOVING;
    else if (chance(rng, p.breakableChance)) type = PLATFORM_TYPES.BREAKABLE;
    else if (chance(rng, p.bouncyChance)) type = PLATFORM_TYPES.BOUNCY;
    else if (chance(rng, p.dangerousChance)) type = PLATFORM_TYPES.DANGEROUS;
    else if (p.minWidth < 95 && chance(rng, 0.35)) type = PLATFORM_TYPES.NARROW;

    let width = rand(rng, p.minWidth, p.maxWidth);
    if (type === PLATFORM_TYPES.NARROW) width = Math.max(64, width * 0.62);
    if (type === PLATFORM_TYPES.MOVING) width = Math.max(70, width * 0.85);

    const maxDx = p.maxDx;
    const dir = chance(rng, 0.5) ? -1 : 1;
    const dx = rand(rng, 20, maxDx) * dir;
    let x = prev.x + prev.width / 2 + dx - width / 2;
    x = Math.max(24, Math.min(WORLD_WIDTH - width - 24, x));

    let moveAmp = 0;
    let moveSpeed = 0;
    let moveAxis = "x";
    let movePhase = rand(rng, 0, Math.PI * 2);
    if (type === PLATFORM_TYPES.MOVING) {
      moveAmp = rand(rng, p.moveAmp * 0.6, p.moveAmp);
      moveSpeed = p.moveSpeed * rand(rng, 0.7, 1.2);
      moveAxis = chance(rng, 0.22) ? "y" : "x";
      if (moveAxis === "y") moveAmp = Math.min(moveAmp, 36);
      x = Math.max(24 + moveAmp, Math.min(WORLD_WIDTH - width - 24 - moveAmp, x));
    }

    const platform = createPlatform({
      x,
      y,
      width,
      type,
      moveAmp,
      moveSpeed,
      moveAxis,
      movePhase,
    });
    world.platforms.push(platform);

    maybeHazards(world, platform, p, heightMeters);
    last = platform;
    highestY = Math.min(highestY, y);

    if (chance(rng, 0.28) && heightMeters > 40) {
      const extraW = rand(rng, p.minWidth * 0.7, p.maxWidth);
      let extraX = chance(rng, 0.5) ? 40 : WORLD_WIDTH - extraW - 40;
      extraX = Math.max(20, Math.min(WORLD_WIDTH - extraW - 20, extraX));
      const extra = createPlatform({
        x: extraX,
        y: y - rand(rng, 10, 28),
        width: extraW,
        type: chance(rng, 0.3) ? PLATFORM_TYPES.MOVING : PLATFORM_TYPES.NORMAL,
        moveAmp: 30,
        moveSpeed: p.moveSpeed * 0.8,
        moveAxis: "x",
        movePhase: rand(rng, 0, Math.PI * 2),
      });
      world.platforms.push(extra);
    }

    return platform;
  }

  function maybeHazards(world, platform, p, heightMeters) {
    if (platform.type === PLATFORM_TYPES.DANGEROUS) return;

    if (chance(rng, p.spikeChance) && platform.width > 90) {
      const count = heightMeters > 1000 ? 2 + Math.floor(rng() * 3) : 1 + Math.floor(rng() * 2);
      for (let i = 0; i < count; i += 1) {
        const sw = 18 + rng() * 8;
        const sx = platform.x + 10 + rng() * Math.max(8, platform.width - sw - 20);
        world.spikes.push(createSpike(sx, platform.y - 14, sw, 14, platform));
      }
    }

    if (chance(rng, p.zombieChance) && platform.width > 100 && platform.type !== PLATFORM_TYPES.BREAKABLE) {
      const zx = platform.x + platform.width * 0.3 + rng() * platform.width * 0.4;
      world.zombies.push(createZombie(zx, platform.y, platform, p.zombieSpeed));
    }
  }

  function generateUntil(world, cameraTop, heightMeters) {
    let guard = 0;
    while (highestY > cameraTop - 1600 && guard < 40) {
      generateNext(world, heightMeters);
      guard += 1;
    }
  }

  return {
    rng,
    reset,
    addStartPlatforms,
    generateUntil,
    startY,
    getHighestY: () => highestY,
  };
}
