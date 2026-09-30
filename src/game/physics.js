import { PLAYER } from "./constants.js";

export function applyHorizontal(player, input, dt) {
  const accel = player.grounded ? PLAYER.accel : PLAYER.airAccel;
  const friction = player.grounded ? PLAYER.friction : PLAYER.airFriction;

  if (input.left === input.right) {
    if (player.vx > 0) {
      player.vx = Math.max(0, player.vx - friction * dt);
    } else if (player.vx < 0) {
      player.vx = Math.min(0, player.vx + friction * dt);
    }
  } else if (input.left) {
    player.vx -= accel * dt;
  } else if (input.right) {
    player.vx += accel * dt;
  }

  const cap = PLAYER.moveSpeed;
  if (player.vx > cap) player.vx = cap;
  if (player.vx < -cap) player.vx = -cap;
}

export function applyGravity(player, dt, gravityScale = 1) {
  player.vy += PLAYER.gravity * gravityScale * dt;
  if (player.vy > PLAYER.terminalVelocity) {
    player.vy = PLAYER.terminalVelocity;
  }
}

export function tryJump(player, input, audio) {
  const canJump = player.grounded || player.coyote > 0;
  if (input.jumpPressed && canJump && player.alive) {
    player.vy = PLAYER.jumpForce;
    player.grounded = false;
    player.coyote = 0;
    player.groundPlatform = null;
    player.squash = 1.18;
    if (audio) audio.jump();
    return true;
  }
  return false;
}

export function integrate(player, dt) {
  player.x += player.vx * dt;
  player.y += player.vy * dt;
}

export function clampWorld(player, worldWidth) {
  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }
  if (player.x + player.width > worldWidth) {
    player.x = worldWidth - player.width;
    player.vx = 0;
  }
}
