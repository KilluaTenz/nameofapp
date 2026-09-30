import { useEffect, useRef } from "react";
import { createGame } from "../game/gameLoop.js";
import { VIEW_HEIGHT, VIEW_WIDTH } from "../game/constants.js";

export default function GameCanvas({ active, paused, audio, onGameOver, onFrame, onDebug, onEscape }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const hooksRef = useRef({ audio, onGameOver, onFrame, onDebug, onEscape });
  hooksRef.current = { audio, onGameOver, onFrame, onDebug, onEscape };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = VIEW_WIDTH * dpr;
      canvas.height = VIEW_HEIGHT * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const game = createGame(canvas, {
      audio: hooksRef.current.audio,
      onGameOver: (h) => hooksRef.current.onGameOver(h),
      onFrame: (stats, height, debug) => hooksRef.current.onFrame(stats, height, debug),
      onDebug: (d) => hooksRef.current.onDebug(d),
      onEscape: () => hooksRef.current.onEscape(),
    });
    gameRef.current = game;
    if (active && !paused) game.start();

    return () => {
      window.removeEventListener("resize", resize);
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    if (active && !paused) {
      if (game.isPaused()) game.resume();
      else if (!game.isRunning()) game.start();
    } else if (active && paused) {
      game.pause();
    } else {
      game.stop();
    }
  }, [active, paused]);

  return <canvas ref={canvasRef} />;
}
