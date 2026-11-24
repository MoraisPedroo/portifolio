/**
 * Som de folha de revista virando, montado amostra por amostra a partir do que
 * se ouve numa virada de papel couché:
 *  1. o estalo curto de quando os dedos levantam a folha (grãos agudos);
 *  2. o "fuuu" do ar passando, com o tremular do papel (ruído filtrado que
 *     acelera e muda de timbre);
 *  3. a folha assentando do outro lado (um "flap" abafado e um toque grave).
 * Cada virada sorteia uma das variações, anda da direita para a esquerda no
 * estéreo e passa por uma sala curta, para não soar igual nem seco.
 * Só toca depois do primeiro gesto da pessoa na página (regra de autoplay).
 */
let ctx: AudioContext | null = null;
let dryIn: AudioNode | null = null;
let roomIn: AudioNode | null = null;
let variants: AudioBuffer[] = [];
let lastVariant = -1;
let unlocked = false;

const VARIANTS = 5;

function context() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Filtro de variáveis de estado: passa-baixa e passa-banda com corte que muda no tempo. */
function makeFilter(sampleRate: number) {
  let low = 0;
  let band = 0;
  return (input: number, cutoff: number, q: number) => {
    const f = 2 * Math.sin((Math.PI * Math.min(cutoff, sampleRate / 6)) / sampleRate);
    low += f * band;
    const high = input - low - q * band;
    band += f * high;
    return { low, band, high };
  };
}

export function renderFlip(audio: Pick<BaseAudioContext, "sampleRate" | "createBuffer">) {
  const sr = audio.sampleRate;
  const duration = rand(0.78, 0.92);
  const length = Math.floor(sr * duration);
  const mono = new Float32Array(length);

  // Pontos da virada (em segundos).
  const peak = duration * rand(0.3, 0.36); // ar passando mais rápido
  const land = duration * rand(0.6, 0.66); // folha assenta
  const brightness = rand(0.85, 1.2);

  // 2. Ar + tremular: ruído rosa em passa-banda que sobe e desce.
  const swish = makeFilter(sr);
  const body = makeFilter(sr);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let phase = Math.random() * Math.PI * 2;
  for (let i = 0; i < length; i++) {
    const t = i / sr;
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    const pink = (b0 + b1 + b2 + white * 0.1848) * 0.2;

    // Envelope suave: cresce até o pico e morre antes do pouso.
    const rise = Math.min(1, t / peak);
    const env = t < peak ? Math.pow(rise, 1.8) : Math.exp(-(t - peak) / (0.11 * brightness));
    // O papel tremula mais rápido no meio da virada.
    const flutterHz = 7 + 16 * Math.sin(Math.min(1, t / land) * Math.PI);
    phase += (2 * Math.PI * flutterHz) / sr;
    const flutter = 1 + 0.28 * Math.sin(phase) + 0.12 * Math.sin(phase * 2.7);
    const cutoff = (420 + 2300 * Math.pow(env, 0.8)) * brightness;
    const s = swish(pink, cutoff, 1.15);
    const b = body(pink, 260 + 500 * env, 1.4);
    mono[i] += (s.band * 1.25 + b.low * 0.35) * env * flutter * 0.9;
  }

  // 1 e 3. Grãos agudos: muitos ao levantar a folha, alguns no meio, um punhado no pouso.
  const grains = new Float32Array(length);
  const addGrains = (from: number, to: number, count: number, gain: number) => {
    for (let g = 0; g < count; g++) {
      const start = Math.floor(sr * rand(from, to));
      const len = Math.floor(sr * rand(0.0015, 0.007));
      const amp = gain * rand(0.25, 1);
      for (let k = 0; k < len && start + k < length; k++) {
        grains[start + k] += (Math.random() * 2 - 1) * amp * Math.exp(-k / (len * 0.3));
      }
    }
  };
  addGrains(0, 0.09, Math.round(rand(10, 16)), 0.32);
  addGrains(0.09, land - 0.05, Math.round(rand(6, 10)), 0.12);
  addGrains(land - 0.01, land + 0.05, Math.round(rand(5, 8)), 0.22);
  const crackle = makeFilter(sr);
  for (let i = 0; i < length; i++) mono[i] += crackle(grains[i], 4200 * brightness, 0.9).high * 0.55;

  // 3. Pouso: "flap" abafado e um toque grave curto.
  const flap = makeFilter(sr);
  const landAt = Math.floor(sr * land);
  for (let i = landAt; i < length; i++) {
    const t = (i - landAt) / sr;
    const noise = Math.random() * 2 - 1;
    const muffled = flap(noise, 900, 1.2).low;
    mono[i] += muffled * Math.exp(-t / 0.028) * 0.75;
    mono[i] += Math.sin(2 * Math.PI * 95 * t) * Math.exp(-t / 0.035) * 0.16;
  }

  // Entrada e saída sem clique; normaliza o pico.
  let max = 0;
  for (let i = 0; i < length; i++) {
    const fadeIn = Math.min(1, i / (sr * 0.004));
    const fadeOut = Math.min(1, (length - i) / (sr * 0.06));
    mono[i] *= fadeIn * fadeOut;
    max = Math.max(max, Math.abs(mono[i]));
  }

  // Estéreo: a folha passa da direita para a esquerda.
  const buffer = audio.createBuffer(2, length, sr);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const scale = max > 0 ? 0.9 / max : 1;
  for (let i = 0; i < length; i++) {
    const pan = 0.45 - 0.9 * Math.min(1, i / (sr * land)); // +0.45 → -0.45
    const angle = ((pan + 1) * Math.PI) / 4;
    left[i] = mono[i] * scale * Math.cos(angle);
    right[i] = mono[i] * scale * Math.sin(angle);
  }
  return buffer;
}

/** Sala pequena: resposta curta e abafada, para o som não ficar seco. */
function roomImpulse(audio: AudioContext) {
  const sr = audio.sampleRate;
  const length = Math.floor(sr * 0.32);
  const impulse = audio.createBuffer(2, length, sr);
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < length; i++) {
      lp += 0.25 * (Math.random() * 2 - 1 - lp);
      data[i] = lp * Math.exp(-i / (sr * 0.06));
    }
  }
  return impulse;
}

function prepare(audio: AudioContext) {
  if (dryIn) return;
  const master = audio.createGain();
  master.gain.value = 0.3;
  const dry = audio.createGain();
  dry.gain.value = 1;
  const room = audio.createConvolver();
  room.buffer = roomImpulse(audio);
  const wet = audio.createGain();
  wet.gain.value = 0.22;
  // Tira o grave abaixo de 70 Hz e o agudo áspero acima de 9 kHz.
  const highpass = audio.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 70;
  const lowpass = audio.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 9000;
  dry.connect(highpass);
  room.connect(wet).connect(highpass);
  highpass.connect(lowpass).connect(master).connect(audio.destination);
  dryIn = dry;
  roomIn = room;
  variants = Array.from({ length: VARIANTS }, () => renderFlip(audio));
}

/** Liga o áudio no primeiro clique, toque ou tecla. */
export function armPageSound() {
  if (unlocked || typeof window === "undefined") return;
  const unlock = () => {
    unlocked = true;
    const audio = context();
    if (!audio) return;
    audio.resume().catch(() => {});
    prepare(audio);
  };
  window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  window.addEventListener("keydown", unlock, { once: true });
}

export function playPageFlip() {
  const audio = context();
  if (!audio || !unlocked || audio.state !== "running") return;
  prepare(audio);
  if (!dryIn || !roomIn || variants.length === 0) return;

  let pick = Math.floor(Math.random() * variants.length);
  if (pick === lastVariant) pick = (pick + 1) % variants.length;
  lastVariant = pick;

  const source = audio.createBufferSource();
  source.buffer = variants[pick];
  source.playbackRate.value = rand(0.96, 1.04);
  const level = audio.createGain();
  level.gain.value = rand(0.85, 1);
  source.connect(level);
  level.connect(dryIn);
  level.connect(roomIn);
  source.start();
}
