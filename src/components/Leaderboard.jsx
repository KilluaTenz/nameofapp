import { useEffect, useState } from "react";
import { fetchLeaderboard, supabaseConfigured } from "../lib/supabase.js";

export default function Leaderboard({ onBack, localBest, playerName }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [reason, setReason] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabaseConfigured) {
        setStatus("local");
        setRows([
          {
            id: "local",
            player_name: playerName || "You",
            height: localBest || 0,
          },
        ]);
        return;
      }
      const result = await fetchLeaderboard(100);
      if (cancelled) return;
      if (!result.ok) {
        setStatus("error");
        setReason(result.reason);
        return;
      }
      setRows(result.rows);
      setStatus("ok");
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [localBest, playerName]);

  return (
    <div className="overlay">
      <div className="panel">
        <h2>GLOBAL LEADERBOARD</h2>
        {status === "local" && (
          <p className="notice">Showing local best until Supabase keys are set.</p>
        )}
        {status === "error" && <p className="notice">Could not load scores: {reason}</p>}
        <div className="leaderboard">
          <table>
            <thead>
              <tr>
                <th>RANK</th>
                <th>PLAYER</th>
                <th>HEIGHT</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id || i}>
                  <td>{i + 1}</td>
                  <td>{row.player_name}</td>
                  <td>{Math.floor(row.height).toLocaleString()} M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={onBack}>
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}
