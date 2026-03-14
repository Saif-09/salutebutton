/**
 * Funky sound effects using the Web Audio API — no audio files needed.
 * Handles mobile browser restrictions (suspended AudioContext, iOS quirks).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  // Mobile browsers start AudioContext in "suspended" — resume on user gesture.
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

/**
 * Trigger haptic feedback on supported devices.
 * Uses navigator.vibrate on Android; no-ops on iOS (unsupported).
 */
export function triggerHaptic(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/** Cheerful ascending "pop-bling" for the salute button. */
export function playSaluteSound() {
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    // --- pop oscillator ---
    const pop = ac.createOscillator();
    pop.type = "sine";
    pop.frequency.setValueAtTime(400, now);
    pop.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    pop.frequency.exponentialRampToValueAtTime(1600, now + 0.12);

    const popGain = ac.createGain();
    popGain.gain.setValueAtTime(0.25, now);
    popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    pop.connect(popGain).connect(ac.destination);
    pop.start(now);
    pop.stop(now + 0.15);

    // --- sparkle oscillator ---
    const sparkle = ac.createOscillator();
    sparkle.type = "triangle";
    sparkle.frequency.setValueAtTime(1800, now + 0.06);
    sparkle.frequency.exponentialRampToValueAtTime(2400, now + 0.18);

    const sparkleGain = ac.createGain();
    sparkleGain.gain.setValueAtTime(0.12, now + 0.06);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    sparkle.connect(sparkleGain).connect(ac.destination);
    sparkle.start(now + 0.06);
    sparkle.stop(now + 0.22);
  } catch {
    // Audio not available — silently ignore.
  }
}

/** Gritty descending "buzz-thud" for the disrespect button. */
export function playDisrespectSound() {
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    // --- buzz oscillator ---
    const buzz = ac.createOscillator();
    buzz.type = "sawtooth";
    buzz.frequency.setValueAtTime(500, now);
    buzz.frequency.exponentialRampToValueAtTime(120, now + 0.15);

    const buzzGain = ac.createGain();
    buzzGain.gain.setValueAtTime(0.18, now);
    buzzGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    // distortion for extra grit
    const shaper = ac.createWaveShaper();
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
    }
    shaper.curve = curve;
    shaper.oversample = "4x";

    buzz.connect(shaper).connect(buzzGain).connect(ac.destination);
    buzz.start(now);
    buzz.stop(now + 0.18);

    // --- thud oscillator ---
    const thud = ac.createOscillator();
    thud.type = "sine";
    thud.frequency.setValueAtTime(150, now);
    thud.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    const thudGain = ac.createGain();
    thudGain.gain.setValueAtTime(0.3, now);
    thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    thud.connect(thudGain).connect(ac.destination);
    thud.start(now);
    thud.stop(now + 0.14);
  } catch {
    // Audio not available — silently ignore.
  }
}
