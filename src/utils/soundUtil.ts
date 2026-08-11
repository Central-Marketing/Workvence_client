let globalAudioCtx: AudioContext | null = null;
let userHasInteracted = false;

const initAudioContextOnGesture = () => {
  if (typeof window === 'undefined') return;
  userHasInteracted = true;
  if (!globalAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      try {
        globalAudioCtx = new AudioCtxClass();
      } catch (e) {
        // Silently ignore audio context creation error
      }
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
};

// Register gesture listeners immediately on client load
if (typeof window !== 'undefined') {
  const events = ['click', 'pointerdown', 'keydown', 'touchstart', 'scroll'];
  const handleGesture = () => {
    initAudioContextOnGesture();
    events.forEach(evt => window.removeEventListener(evt, handleGesture));
  };
  events.forEach(evt => window.addEventListener(evt, handleGesture, { passive: true }));
}

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined' || !userHasInteracted) return null;
  if (!globalAudioCtx) {
    initAudioContextOnGesture();
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
    return null; // Return null while suspended to eliminate Chrome console warnings
  }
  return globalAudioCtx;
};

/**
 * Play a notification chime sound cleanly after user interaction.
 * @param type 'message' | 'notification' | 'general'
 */
export const playNotificationSound = (type: 'message' | 'notification' | 'general' = 'notification') => {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    if (type === 'message') {
      // Pleasant double-chime for incoming message (D5 -> A5)
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08); // A5
      gain2.gain.setValueAtTime(0.2, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } else {
      // Arpeggio chime for general & order notifications (C5 -> E5 -> G5)
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // Silently ignore playback errors
  }
};
