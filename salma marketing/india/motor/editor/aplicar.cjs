// Aplica las elecciones del editor (overrides.json) a la configuración del capítulo. Lo usan cap4.cjs (al montar) y server.cjs (al estimar coste): una sola copia.
const path = require('path');
// El clon de Paco dice la «ll» como argentino (sh): se le escribe con «y» (calle → caye). El subtítulo sigue con el texto bien escrito.
const pron = t => t.replace(/ll/g, 'y').replace(/Ll/g, 'Y').replace(/LL/g, 'Y');
module.exports = (cfg, ov) => {
  cfg.id += '-editor';
  cfg.blocks.forEach(b => {
    (ov.shots && ov.shots[b.id] || []).forEach((a, k) => { if (a && b.shots[k] && b.shots[k].a !== a) { b.shots[k].a = a; delete b.shots[k].ss; } });
    (ov.ss && ov.ss[b.id] || []).forEach((v, k) => { if (v != null && b.shots[k] && /^(V|RW)/.test(b.shots[k].a)) b.shots[k].ss = v; });
    if (ov.amb && ov.amb[b.id] && b.amb) b.amb.src = ov.amb[b.id];
    const nt = ov.text && ov.text[b.id];
    if (nt && b.text && nt.trim() && nt !== b.text) {
      b.text = nt.trim(); b.voz = pron(b.text);
      const w = b.text.split(' ');
      (b.shots || []).forEach((s, k) => { if (s.from && !b.text.includes(s.from)) { const i = Math.min(w.length - 1, Math.round(k / b.shots.length * w.length)); s.from = w.slice(i, i + 3).join(' '); } });
      if (b.cifra && !b.text.includes(b.cifra.word)) delete b.cifra;
    }
    const au = ov.audio && ov.audio[b.id]; if (au && b.text) b.audioPropio = path.join(__dirname, 'uploads', au);
  });
  return cfg;
};
