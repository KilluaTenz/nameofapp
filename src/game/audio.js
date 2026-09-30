export function createAudio() {
  let ctx = null;
  let muted = false;
  let lastMilestone = -1;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function beep(freq, dur, type = "square", gain = 0.05) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  return {
    setMuted(v) {
      muted = v;
    },
    isMuted() {
      return muted;
    },
    jump() {
      beep(420, 0.08, "square", 0.04);
      beep(620, 0.06, "square", 0.03);
    },
    land() {
      beep(180, 0.07, "triangle", 0.04);
    },
    spike() {
      beep(140, 0.18, "sawtooth", 0.07);
    },
    zombie() {
      beep(90, 0.22, "sawtooth", 0.07);
    },
    gameOver() {
      beep(220, 0.2, "triangle", 0.05);
      setTimeout(() => beep(140, 0.28, "triangle", 0.05), 90);
    },
    milestone(height) {
      const bucket = Math.floor(height / 100);
      if (bucket === lastMilestone || bucket <= 0) return;
      lastMilestone = bucket;
      beep(520, 0.1, "square", 0.05);
      setTimeout(() => beep(780, 0.12, "square", 0.05), 80);
    },
    resetMilestones() {
      lastMilestone = -1;
    },
  };
}
