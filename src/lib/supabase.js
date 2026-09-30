import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon && !String(url).includes("your-project"));

export const supabase = supabaseConfigured ? createClient(url, anon) : null;

export async function saveScore(playerName, height) {
  if (!supabase) return { ok: false, reason: "not-configured" };
  const name = (playerName || "Cube Climber").slice(0, 24);
  const { error } = await supabase.from("player_scores").insert({
    player_name: name,
    height: Math.floor(height),
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function fetchLeaderboard(limit = 100) {
  if (!supabase) return { ok: false, rows: [], reason: "not-configured" };
  const { data, error } = await supabase
    .from("player_scores")
    .select("id, player_name, height, created_at")
    .order("height", { ascending: false })
    .limit(limit);
  if (error) return { ok: false, rows: [], reason: error.message };
  return { ok: true, rows: data || [] };
}
