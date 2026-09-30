import { useCallback, useMemo, useRef, useState } from "react";
import GameCanvas from "./components/GameCanvas.jsx";
import HUD from "./components/HUD.jsx";
import MainMenu from "./components/MainMenu.jsx";
import GameOver from "./components/GameOver.jsx";
import PauseMenu from "./components/PauseMenu.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import DebugPanel from "./components/DebugPanel.jsx";
import { GAME_STATES } from "./game/constants.js";
import { createAudio } from "./game/audio.js";
import { saveScore, supabaseConfigured } from "./lib/supabase.js";

const BEST_KEY = "cube-ascent-best";
const NAME_KEY = "cube-ascent-name";

export default function App() {
  const audio = useMemo(() => createAudio(), []);
  const [state, setState] = useState(GAME_STATES.MENU);
  const [screen, setScreen] = useState("menu");
  const [playerName, setPlayerName] = useState(() => localStorage.getItem(NAME_KEY) || "Cube Climber");
  const [height, setHeight] = useState(0);
  const [lastHeight, setLastHeight] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const [debug, setDebug] = useState(false);
  const [stats, setStats] = useState(null);
  const [muted, setMuted] = useState(false);
  const [runId, setRunId] = useState(0);
  const lastHud = useRef(0);

  const playing = state === GAME_STATES.PLAYING || state === GAME_STATES.PAUSED;
  const paused = state === GAME_STATES.PAUSED;

  const persistBest = (h) => {
    setBest((prev) => {
      const next = Math.max(prev, h);
      localStorage.setItem(BEST_KEY, String(next));
      return next;
    });
  };

  const onPlay = () => {
    localStorage.setItem(NAME_KEY, playerName);
    audio.setMuted(muted);
    setHeight(0);
    setDebug(false);
    setState(GAME_STATES.PLAYING);
    setScreen("play");
    setRunId((n) => n + 1);
  };

  const onGameOver = useCallback(
    async (h) => {
      setLastHeight(h);
      setHeight(h);
      persistBest(h);
      setState(GAME_STATES.GAME_OVER);
      setScreen("over");
      await saveScore(playerName, h);
    },
    [playerName]
  );

  const onFrame = useCallback((frameStats, h, isDebug) => {
    const now = performance.now();
    if (now - lastHud.current > 80) {
      lastHud.current = now;
      setHeight(h);
      setDebug(isDebug);
      if (isDebug) setStats({ ...frameStats });
    }
  }, []);

  const onEscape = useCallback(() => {
    setState((s) => {
      if (s === GAME_STATES.PLAYING) {
        setScreen("pause");
        return GAME_STATES.PAUSED;
      }
      if (s === GAME_STATES.PAUSED) {
        setScreen("play");
        return GAME_STATES.PLAYING;
      }
      return s;
    });
  }, []);

  return (
    <div className="game-root">
      <div className="stage">
        <GameCanvas
          key={runId}
          active={playing}
          paused={paused}
          audio={audio}
          onGameOver={onGameOver}
          onFrame={onFrame}
          onDebug={setDebug}
          onEscape={onEscape}
        />
        {playing && <HUD height={height} best={best} />}
        <div className="top-right">
          <button
            className="icon-btn"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              audio.setMuted(next);
            }}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
        {debug && playing && <DebugPanel stats={stats} show />}
        {screen === "menu" && (
          <MainMenu
            playerName={playerName}
            onNameChange={setPlayerName}
            onPlay={onPlay}
            onLeaderboard={() => setScreen("board")}
            supabaseReady={supabaseConfigured}
          />
        )}
        {screen === "board" && (
          <Leaderboard
            onBack={() => setScreen("menu")}
            localBest={best}
            playerName={playerName}
          />
        )}
        {screen === "pause" && (
          <PauseMenu
            onResume={() => {
              setScreen("play");
              setState(GAME_STATES.PLAYING);
            }}
            onRestart={onPlay}
            onMenu={() => {
              setState(GAME_STATES.MENU);
              setScreen("menu");
            }}
          />
        )}
        {screen === "over" && (
          <GameOver
            height={lastHeight}
            best={Math.max(best, lastHeight)}
            onRetry={onPlay}
            onMenu={() => {
              setState(GAME_STATES.MENU);
              setScreen("menu");
            }}
          />
        )}
      </div>
    </div>
  );
}
