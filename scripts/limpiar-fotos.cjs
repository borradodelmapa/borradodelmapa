#!/usr/bin/env node
// scripts/limpiar-fotos.cjs — quita de fotos.json las fotos de «paisaje cercano» que no corresponden a su parada.
// Regla (20 oct 2026, tras ver un pájaro como foto de «Parque Nacional de Chitwan»): una foto cercana solo vale si el título del
// archivo contiene el nombre de la parada (primeras 6 letras de alguna palabra distintiva) o está marcada ok_manual. Mejor sin foto que una equivocada.
// Uso: node scripts/limpiar-fotos.cjs [--aplicar]      (sin --aplicar solo enseña lo que quitaría)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const STOP = new Set(['del', 'las', 'los', 'the', 'and', 'por', 'con', 'park', 'parque', 'nacional', 'national', 'river', 'rio', 'lake', 'temple', 'templo', 'square', 'plaza', 'new', 'old', 'house', 'center', 'centre', 'cultural', 'museum', 'museo']);
function coincide(nombre, fuente) {
  const f = norm(fuente).replace(/[^a-z0-9]/g, '');
  return norm(nombre).split(/[^a-z0-9]+/).filter(t => t.length >= 4 && !STOP.has(t)).some(t => f.includes(t.slice(0, Math.min(t.length, 6))));
}
module.exports = { coincide };
if (require.main === module) {
  const aplicar = process.argv.includes('--aplicar');
  let quitadas = 0, total = 0;
  for (const d of fs.readdirSync(path.join(ROOT, 'destinos', 'img'))) {
    const fj = path.join(ROOT, 'destinos', 'img', d, 'fotos.json'); if (!fs.existsSync(fj)) continue;
    const j = JSON.parse(fs.readFileSync(fj, 'utf8'));
    for (const [n, s] of Object.entries(j.stops || {})) {
      if (!s.cercana) continue; total++;
      if (s.ok_manual || coincide(n, s.fuente)) continue;
      quitadas++; console.log((aplicar ? 'quito ' : 'quitaría ') + d + ' · ' + n + ' ← ' + s.fuente);
      if (aplicar) { try { fs.unlinkSync(path.join(ROOT, 'destinos', 'img', d, s.file)); } catch (_) {} delete j.stops[n]; }
    }
    if (aplicar) fs.writeFileSync(fj, JSON.stringify(j, null, 1));
  }
  console.log(`\n${quitadas} de ${total} fotos de paisaje cercano ${aplicar ? 'quitadas' : 'se quitarían'}.`);
}
