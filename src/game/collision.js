export function aabb(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}

/**
 * Land on a platform only when falling onto its top surface.
 * Uses the previous bottom so high speeds still catch thin platforms.
 */
export function tryLandOnPlatform(player, platform, prevBottom) {
  const feetLeft = player.x + 4;
  const feetRight = player.x + player.width - 4;
  const overlapX = feetRight > platform.x && feetLeft < platform.x + platform.width;
  if (!overlapX) return false;
  if (player.vy < -20) return false;

  const platTop = platform.y;
  const playerBottom = player.y + player.height;
  const wasAbove = prevBottom <= platTop + 12;
  const nowThrough = playerBottom >= platTop && player.y < platTop + platform.height;

  if (wasAbove && nowThrough) {
    player.y = platTop - player.height;
    player.vy = 0;
    player.grounded = true;
    player.groundPlatform = platform;
    return true;
  }
  return false;
}

export function playerHitsHazard(player, hazard) {
  return aabb(player, hazard);
}
