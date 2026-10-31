// SINTONÍA de «Pueblos borrados del mapa» — música ORIGINAL por síntesis propia (sin muestras ni terceros, 0 €). Suena en el mapa y en la tarjeta final.
// Uso: node mksintonia.cjs <A|B|C|D|E> <salida.wav> [segundos=9]
//  A · cuerda pulsada pentatónica sobre un bordón grave (viaje, misterio)
//  B · láminas de bambú/gong a lo kulintang sobre bordón (Asia, madera, cercano al batok)
//  C · campana lenta y cuerdas graves (solemne, memoria)
// Todas terminan con dos golpes secos de madera: el eco del sonido del canal (golpes del batok, M13).
const fs = require('fs');
const [V = 'A', out = 'sintonia-' + V + '.wav', durS = '9'] = process.argv.slice(2);
const SR = 44100, DUR = +durS, N = Math.floor(SR * DUR), L = new Float32Array(N), R = new Float32Array(N);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 11; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const add = (i, v, pan = 0.5) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan); R[i] += v * pan; } };
// nota con envolvente de ataque/caída y parciales (timbre)
function nota(t0, m, dur, amp, parc, caida, pan = 0.5, ataque = 0.004) {
  const f = hz(m), i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR, env = Math.min(1, t / ataque) * Math.exp(-caida * t);
    let s = 0; parc.forEach(([mult, a]) => { s += a * Math.sin(2 * Math.PI * f * mult * t); });
    add(i0 + k, amp * env * s, pan);
  }
}
function bordon(m, amp) { // bordón grave con entrada y salida suaves y un leve batido
  const f = hz(m);
  for (let i = 0; i < N; i++) { const t = i / SR, env = Math.min(1, t / 1.5) * Math.min(1, (DUR - t) / 1.8);
    const s = Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 2.003 * t) + 0.25 * Math.sin(2 * Math.PI * f * 3 * t);
    add(i, amp * env * s * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.3 * t)), 0.5); }
}
function madera(t0, amp) { // golpe seco de madera (como el sonido del canal)
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < SR * 0.25; k++) { const t = k / SR, e = Math.exp(-55 * t);
    add(i0 + k, amp * e * (0.7 * Math.sin(2 * Math.PI * 170 * t) + 0.5 * Math.sin(2 * Math.PI * 1350 * t) * Math.exp(-90 * t) + 0.5 * (rnd() * 2 - 1) * Math.exp(-160 * t)), 0.5); }
}
// pentatónica menor en La (A C D E G) — ámbito de Asia sin imitar ninguna pieza concreta
const P = [57, 60, 62, 64, 67, 69, 72, 74, 76];
const PULSADA = [[1, 1], [2, 0.45], [3, 0.2], [4, 0.08]], LAMINA = [[1, 1], [2.76, 0.35], [5.4, 0.12]], CAMPANA = [[1, 1], [2.0, 0.5], [2.92, 0.35], [4.16, 0.2], [5.43, 0.1]];
if (V === 'A') {
  bordon(45, 0.07); bordon(52, 0.035);
  const frase = [[0.6, 4], [1.05, 5], [1.5, 7], [2.4, 6], [2.85, 4], [3.3, 3], [4.4, 4], [4.85, 6], [5.3, 8], [6.4, 7]];
  frase.forEach(([t, i]) => nota(t, P[i], 2.2, 0.16, PULSADA, 2.6, 0.3 + rnd() * 0.4));
} else if (V === 'B') {
  bordon(45, 0.06);
  const frase = [[0.5, 3], [0.8, 4], [1.1, 6], [1.7, 5], [2.0, 4], [2.6, 3], [2.9, 1], [3.5, 3], [4.4, 3], [4.7, 4], [5.0, 6], [5.6, 8], [6.2, 7]];
  frase.forEach(([t, i]) => nota(t, P[i], 1.4, 0.15, LAMINA, 4.2, 0.3 + rnd() * 0.4, 0.002));
  [0.5, 2.6, 4.4].forEach(t => nota(t, 33, 3, 0.12, [[1, 1], [1.5, 0.3], [2.1, 0.15]], 1.1, 0.5, 0.01)); // gong grave
} else if (V === 'D' || V === 'E') {
  // D · solo la madera del batok (Paco, 31 oct: «la madera del batok sí me gusta»; A-C sonaban «de ascensor»): ritmo de golpes que se anima y se para en seco
  // E · lo mismo con un tambor grave por debajo, en los tiempos fuertes
  const golpes = [0.3, 0.72, 1.1, 1.4, 1.95, 2.35, 2.7, 3.0, 3.55, 3.9, 4.2, 4.45, 4.7, 5.15, 5.45, 5.7, 5.9, 6.1];
  golpes.forEach((t, k) => madera(t, 0.32 + 0.12 * (k % 4 === 0) + 0.12 * (t / 6.5)));
  if (V === 'E') [0.3, 1.95, 3.55, 5.15].forEach(t => { const i0 = Math.floor(t * SR);
    for (let k = 0; k < SR * 0.9; k++) { const tt = k / SR, f = 55 + 40 * Math.exp(-18 * tt); add(i0 + k, 0.55 * Math.exp(-4.5 * tt) * Math.sin(2 * Math.PI * f * tt), 0.5); } });
} else {
  bordon(40, 0.06); bordon(47, 0.04); bordon(52, 0.02);
  [[0.8, 5], [2.6, 4], [4.4, 2], [6.0, 4]].forEach(([t, i]) => nota(t, P[i] + 12, 3.4, 0.11, CAMPANA, 1.0, 0.5, 0.003));
}
madera(DUR - 1.6, 0.5); madera(DUR - 1.18, 0.5);
// eco suave (dos repeticiones) y normalización a −1 dBFS
const eco = (buf, d, g) => { const n = Math.floor(d * SR); for (let i = N - 1; i >= n; i--) buf[i] += g * buf[i - n]; };
[L, R].forEach(b => { eco(b, 0.37, 0.28); eco(b, 0.61, 0.18); });
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); const g = 0.89 / (pk || 1);
const buf = Buffer.alloc(44 + N * 4); const w = (s, o) => buf.write(s, o);
w('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); w('WAVE', 8); w('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); w('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4); }
fs.writeFileSync(out, buf); console.log('sintonía', V, '→', out);
