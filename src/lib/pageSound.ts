/**
 * Som de folha virando, sintetizado na hora (ruído filtrado com envelope curto).
 * Não precisa de arquivo e respeita a política de autoplay: só toca depois do
 * primeiro gesto da pessoa na página.
 */
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let unlocked = false;

function context() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function noiseBuffer(audio: AudioContext) {
  if (noise) return noise;
  const length = Math.floor(audio.sampleRate * 0.6);
  noise = audio.createBuffer(1, length, audio.sampleRate);
  const data = noise.getChannelData(0);
  // Ruído rosa aproximado: mais grave que o branco, soa como papel.
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
  }
  return noise;
}

/** Liga o áudio no primeiro clique ou tecla. */
export function armPageSound() {
  if (unlocked || typeof window === "undefined") return;
  const unlock = () => {
    unlocked = true;
    context()?.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export function playPageFlip() {
  const audio = context();
  if (!audio || !unlocked || audio.state !== "running") return;
  const now = audio.currentTime;
  const source = audio.createBufferSource();
  source.buffer = noiseBuffer(audio);
  source.playbackRate.value = 0.94 + Math.random() * 0.12;

  // Varredura de banda: o "fffp" de uma folha passando.
  const band = audio.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(900, now);
  band.frequency.exponentialRampToValueAtTime(3800, now + 0.22);
  band.frequency.exponentialRampToValueAtTime(1600, now + 0.42);

  const high = audio.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 180;

  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.32, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  source.connect(band).connect(high).connect(gain).connect(audio.destination);
  source.start(now);
  source.stop(now + 0.5);
}
