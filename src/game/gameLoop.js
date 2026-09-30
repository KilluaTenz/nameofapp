import {
  CULL_BELOW,
  METERS_PER_PIXEL,
  PLATFORM_TYPES,
  PLAYER,
  VIEW_HEIGHT,
  WORLD_WIDTH,
} from "./constants.js";
import { aabb, playerHitsHazard, tryLandOnPlatform } from "./collision.js";
import { applyGravity, applyHorizontal, clampWorld, integrate, tryJump } from "./physics.js";
import { createPlayer, createParticle, resetIds } from "./entities.js";
import { createWorldGenerator } from "./proceduralGeneration.js";
import { getDifficulty, getTier } from "./difficulty.js";
import { drawWorld } from "./render.js";

function emptyWorld() {
  return { platforms: [], spikes: [], zombies: [], particles: [], banners: [] };
}

export function createGame(canvas, hooks) {
  const ctx = canvas.getContext("2d");
  const input = {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
  };

  let world = emptyWorld();
  let generator = createWorldGenerator();
  let player = createPlayer(0, 0);
  let camera = { y: 0 };
  let startingY = 0;
  let time = 0;
  let running = false;
  let paused = false;
  let debug = false;
  let raf = 0;
  let lastTs = 0;
  let fps = 60;
  let fpsAcc = 0;
  let fpsFrames = 0;
  let maxHeight = 0;
  let lastLanding = false;
  const stats = {
    fps: 60,
    objects: 0,
    zombies: 0,
    platforms: 0,
    height: 0,
    vx: 0,
    vy: 0,
    x: 0,
    y: 0,
    tier: "EASY",
    difficulty: 1,
  };

  function heightOf(p) {
    return Math.max(0, Math.floor((startingY - p.y) / METERS_PER_PIXEL));
  }

  function spawnBurst(x, y, color, n = 10) {
    for (let i = 0; i < n; i += 1) {
      world.particles.push(createParticle(x, y, color));
    }
  }

  function reset() {
    resetIds();
    world = emptyWorld();
    generator = createWorldGenerator(Date.now());
    startingY = generator.startY() - PLAYER.height;
    player = createPlayer(WORLD_WIDTH / 2 - PLAYER.width / 2, startingY);
    camera.y = player.y - VIEW_HEIGHT * 0.62;
    time = 0;
    maxHeight = 0;
    lastLanding = false;
    generator.addStartPlatforms(world);
    if (hooks.audio) hooks.audio.resetMilestones();
  }

  function kill(cause) {
    if (!player.alive) return;
    player.alive = false;
    player.deathCause = cause;
    player.vx *= 0.3;
    spawnBurst(player.x + player.width / 2, player.y + player.height / 2, cause === "spike" ? "#fb7185" : "#4ade80", 18);
    if (hooks.audio) {
      if (cause === "spike") hooks.audio.spike();
      else if (cause === "zombie") hooks.audio.zombie();
      hooks.audio.gameOver();
    }
    running = false;
    hooks.onGameOver(maxHeight);
  }

  function updateMovingPlatforms() {
    const byId = new Map();
    for (const p of world.platforms) {
      p.lastX = p.x;
      p.lastY = p.y;
      if (p.type === PLATFORM_TYPES.MOVING && !p.broken) {
        const wave = Math.sin(time * p.moveSpeed + p.movePhase) * p.moveAmp;
        if (p.moveAxis === "y") p.y = p.baseY + wave;
        else p.x = p.baseX + wave;
      }
      byId.set(p.id, p);
    }
    for (const s of world.spikes) {
      const plat = byId.get(s.platformId);
      if (!plat) continue;
      s.x = plat.x + s.offsetX;
      s.y = plat.y + s.offsetY;
    }
  }

  function updateBreakables(dt) {
    for (const p of world.platforms) {
      if (p.type !== PLATFORM_TYPES.BREAKABLE) continue;
      if (p.broken) {
        p.visible = Math.max(0, p.visible - dt * 3);
        continue;
      }
      if (player.groundPlatform === p) {
        p.breakTimer += dt;
        if (p.breakTimer > 0.38) {
          p.broken = true;
          player.grounded = false;
          player.groundPlatform = null;
          spawnBurst(p.x + p.width / 2, p.y, "#fdba74", 8);
        }
      } else {
        p.breakTimer = Math.max(0, p.breakTimer - dt);
      }
    }
  }

  function updateZombies(dt) {
    const platformsById = new Map(world.platforms.map((p) => [p.id, p]));
    for (const z of world.zombies) {
      z.bob += dt;
      const plat = platformsById.get(z.platformId);
      const pcx = player.x + player.width / 2;
      const zcx = z.x + z.width / 2;
      const dist = Math.hypot(pcx - zcx, player.y - z.y);
      if (dist < z.detectRange) {
        z.dir = pcx < zcx ? -1 : 1;
        z.vx = z.dir * z.speed * 1.35;
      } else {
        z.vx = z.dir * z.speed;
      }
      z.x += z.vx * dt;
      if (plat) {
        if (z.x < plat.x) {
          z.x = plat.x;
          z.dir = 1;
        }
        if (z.x + z.width > plat.x + plat.width) {
          z.x = plat.x + plat.width - z.width;
          z.dir = -1;
        }
        z.y = plat.y - z.height;
      }
    }
  }

  function updateParticles(dt) {
    world.particles = world.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      return p.life > 0;
    });
    world.banners = world.banners.filter((b) => {
      b.life -= dt * 0.7;
      return b.life > 0;
    });
  }

  function collisions() {
    const prevBottom = player._prevBottom;
    player.grounded = false;
    player.groundPlatform = null;

    for (const p of world.platforms) {
      if (p.broken) continue;
      if (p.type === PLATFORM_TYPES.DANGEROUS && aabb(player, p)) {
        kill("hazard");
        return;
      }
      if (tryLandOnPlatform(player, p, prevBottom)) {
        if (p.type === PLATFORM_TYPES.BOUNCY) {
          player.vy = PLAYER.jumpForce * 1.28;
          player.grounded = false;
          player.groundPlatform = null;
          spawnBurst(player.x + 14, player.y + player.height, "#86efac", 6);
        } else {
          const dx = p.x - p.lastX;
          player.x += dx;
          const dy = p.y - p.lastY;
          player.y += dy;
        }
      }
    }

    if (player.grounded && !lastLanding && hooks.audio) hooks.audio.land();
    lastLanding = player.grounded;

    for (const s of world.spikes) {
      if (playerHitsHazard(player, s)) {
        kill("spike");
        return;
      }
    }
    for (const z of world.zombies) {
      if (playerHitsHazard(player, z)) {
        kill("zombie");
        return;
      }
    }
  }

  function cull(heightMeters) {
    const limit = camera.y + VIEW_HEIGHT + CULL_BELOW;
    world.platforms = world.platforms.filter((p) => p.y < limit);
    world.spikes = world.spikes.filter((s) => s.y < limit);
    world.zombies = world.zombies.filter((z) => z.y < limit);
    generator.generateUntil(world, camera.y, heightMeters);
  }

  function maybeMilestone(h) {
    if (h > 0 && h % 1000 === 0) {
      world.banners.push({ text: `${h.toLocaleString()} M!`, life: 1 });
      if (hooks.audio) hooks.audio.milestone(h);
    } else if (h > 0 && h % 100 === 0) {
      world.banners.push({ text: `${h.toLocaleString()} M!`, life: 1 });
      if (hooks.audio) hooks.audio.milestone(h);
    }
  }

  function update(dt) {
    if (!player.alive) return;
    time += dt;
    if (player.squash > 1) player.squash = Math.max(1, player.squash - dt * 2.4);

    updateMovingPlatforms();
    player._prevBottom = player.y + player.height;

    applyHorizontal(player, input, dt);
    if (input.left && !input.right) player.facing = -1;
    if (input.right && !input.left) player.facing = 1;

    const jumped = tryJump(player, input, hooks.audio);
    if (!player.grounded) {
      player.coyote = Math.max(0, player.coyote - dt);
      applyGravity(player, dt, jumped ? 1 : 1);
    } else {
      player.coyote = PLAYER.coyoteTime;
    }

    integrate(player, dt);
    clampWorld(player, WORLD_WIDTH);
    collisions();
    updateBreakables(dt);
    updateZombies(dt);
    updateParticles(dt);

    if (player.y > camera.y + VIEW_HEIGHT + 40) {
      kill("fall");
    }

    const targetCam = player.y - VIEW_HEIGHT * 0.62;
    camera.y += (targetCam - camera.y) * Math.min(1, dt * 8);
    if (player.y < camera.y + VIEW_HEIGHT * 0.28) {
      camera.y = player.y - VIEW_HEIGHT * 0.28;
    }

    const h = heightOf(player);
    if (h > maxHeight) {
      const prevBucket100 = Math.floor(maxHeight / 100);
      const newBucket100 = Math.floor(h / 100);
      maxHeight = h;
      if (newBucket100 > prevBucket100) maybeMilestone(newBucket100 * 100);
    }

    cull(maxHeight);
    input.jumpPressed = false;
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / 960;
    const scaleY = canvas.height / 540;
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    drawWorld(ctx, {
      player,
      camera,
      platforms: world.platforms,
      spikes: world.spikes,
      zombies: world.zombies,
      particles: world.particles,
      banners: world.banners,
      debug,
      heightMeters: maxHeight,
      time,
    });
  }

  function tick(ts) {
    raf = requestAnimationFrame(tick);
    if (!lastTs) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dt > 0.05) dt = 0.05;

    fpsAcc += dt;
    fpsFrames += 1;
    if (fpsAcc >= 0.4) {
      fps = Math.round(fpsFrames / fpsAcc);
      fpsAcc = 0;
      fpsFrames = 0;
    }

    if (running && !paused) update(dt);
    else updateParticles(dt * 0.2);
    render();

    stats.fps = fps;
    stats.x = player.x;
    stats.y = player.y;
    stats.vx = player.vx;
    stats.vy = player.vy;
    stats.height = maxHeight;
    stats.platforms = world.platforms.length;
    stats.zombies = world.zombies.length;
    stats.objects = world.platforms.length + world.spikes.length + world.zombies.length;
    stats.tier = getTier(maxHeight);
    stats.difficulty = getDifficulty(maxHeight);
    hooks.onFrame(stats, maxHeight, debug);
  }

  function key(e, down) {
    const k = e.code;
    if (k === "ArrowLeft" || k === "KeyA") input.left = down;
    if (k === "ArrowRight" || k === "KeyD") input.right = down;
    if (k === "Space" || k === "ArrowUp" || k === "KeyW") {
      if (down && !input.jump) input.jumpPressed = true;
      input.jump = down;
      if (down) e.preventDefault();
    }
    if (down && k === "F3") {
      debug = !debug;
      e.preventDefault();
      hooks.onDebug(debug);
    }
    if (down && k === "Escape") {
      hooks.onEscape();
    }
  }

  const onDown = (e) => key(e, true);
  const onUp = (e) => key(e, false);

  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);

  reset();
  raf = requestAnimationFrame(tick);

  return {
    start() {
      reset();
      running = true;
      paused = false;
      lastTs = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    },
    isRunning() {
      return running;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
      lastTs = 0;
    },
    stop() {
      running = false;
    },
    isPaused() {
      return paused;
    },
    isDebug() {
      return debug;
    },
    setDebug(v) {
      debug = v;
    },
    getHeight() {
      return maxHeight;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    },
  };
}
