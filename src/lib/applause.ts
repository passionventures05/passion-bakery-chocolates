/**
 * The applause for the launch ceremony: plays public/applause.wav the instant the curtains open and the poppers pop.
 *
 * Browsers only allow sound after the visitor has tapped / clicked / pressed a key on the page, so `armApplause()`
 * downloads the file in the background and unlocks the audio on the first such gesture. If the visitor never
 * touches the page before the curtains open, the celebration simply plays silently.
 */

const APPLAUSE_URL = "/applause.wav";
const VOLUME = 1;
const UNLOCK_EVENTS = ["pointerup", "touchend", "click", "keydown"] as const;

let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let bytes: Promise<ArrayBuffer | null> | null = null;
let decoded: Promise<AudioBuffer | null> | null = null;
let playing: AudioBufferSourceNode | null = null;
let pending = false;
let token = 0;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  gain = ctx.createGain();
  gain.gain.value = VOLUME;
  gain.connect(ctx.destination);
  return ctx;
}

/** Downloads the applause file in the background so it is ready to play instantly. */
function preload() {
  if (typeof window === "undefined" || bytes) return;
  bytes = fetch(APPLAUSE_URL)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null);
}

/** Decodes the downloaded file (once). */
function loadBuffer(c: AudioContext): Promise<AudioBuffer | null> {
  if (!decoded) {
    preload();
    decoded = bytes!
      .then((b) => (b ? new Promise<AudioBuffer>((res, rej) => c.decodeAudioData(b, res, rej)) : null))
      .catch(() => null);
  }
  return decoded;
}

/** Call from a tap / click / key press. */
function unlock() {
  const c = getContext();
  if (!c) return;
  void loadBuffer(c);
  if (c.state !== "running") {
    void c.resume().catch(() => {});
    // a silent blip: some phones only unlock audio after something has actually been played
    try {
      const b = c.createBuffer(1, 1, 22050);
      const s = c.createBufferSource();
      s.buffer = b;
      s.connect(c.destination);
      s.start(0);
    } catch {
      /* ignore */
    }
  }
}

/** Starts downloading the applause and unlocks sound on the visitor's first tap / key press. Returns a cleanup function. */
export function armApplause(): () => void {
  preload();
  const remove = () => UNLOCK_EVENTS.forEach((e) => window.removeEventListener(e, onGesture));
  const onGesture = () => {
    unlock();
    if (ctx && ctx.state === "running") remove();
  };
  UNLOCK_EVENTS.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
  return remove;
}

/** Plays the applause now (call at the same moment as the poppers). */
export function playApplause() {
  const c = getContext();
  if (!c || !gain || playing || pending) return;
  pending = true;
  const mine = ++token;
  const begin = () =>
    loadBuffer(c).then((buf) => {
      pending = false;
      if (!buf || mine !== token || !gain) return;
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(gain);
      src.onended = () => {
        if (playing === src) playing = null;
      };
      src.start();
      playing = src;
    });
  if (c.state === "running") void begin();
  else c.resume().then(begin, () => (pending = false));
}

/** Stops the applause (used if the page is left early). */
export function stopApplause() {
  token++;
  pending = false;
  try {
    playing?.stop();
  } catch {
    /* ignore */
  }
  playing = null;
}
