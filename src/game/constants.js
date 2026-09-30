export const WORLD_WIDTH = 960;
export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;
export const METERS_PER_PIXEL = 12;

export const PLAYER = {
  width: 28,
  height: 28,
  moveSpeed: 320,
  accel: 2400,
  airAccel: 1800,
  friction: 1800,
  airFriction: 400,
  gravity: 1950,
  jumpForce: -720,
  terminalVelocity: 980,
  coyoteTime: 0.09,
};

export const CULL_BELOW = 900;
export const GENERATE_AHEAD = 1400;

export const GAME_STATES = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
};

export const PLATFORM_TYPES = {
  NORMAL: "normal",
  NARROW: "narrow",
  MOVING: "moving",
  BREAKABLE: "breakable",
  BOUNCY: "bouncy",
  DANGEROUS: "dangerous",
};
