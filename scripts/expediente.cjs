// EXPEDIENTE DE UN PAÍS → datos para la web (16 nov 2026, Paco: «haz ahora lo del expediente en la página del país»).
// El expediente (docs/paises/<país>-expediente.md, PLANTILLA-expediente.md) es la ÚNICA lista de fuentes del país.
// «Conoce <país>» (scripts/paises/<país>/intro.json) es el resumen para la web y cita el expediente con `f: [1, 3]` en cada
// apartado (los [F#] del expediente). build-destinos.js pinta esas fuentes desde aquí; ya no se copian a mano en intro.json.
// comprobar-pais.cjs avisa si una cita no existe o si el expediente ha cambiado después que intro.json.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const MES = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, sept: 9, oct: 10, nov: 11, dic: 12 };

function leerExpediente(paisSlug) {
  const f = path.join(ROOT, 'docs', 'paises', `${paisSlug}-expediente.md`);
  if (!fs.existsSync(f)) return null;
  const md = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  // Fuentes: «## Fuentes (consultadas el 13 nov 2026)» y líneas «- [F1] Título: https://… · https://…»
  const cab = /^## Fuentes[^\n]*/m.exec(md);
  let consultado = null;
  const fuentes = {};
  if (cab) {
    const m = /(\d{1,2})\s+(?:de\s+)?([a-z]+)\.?\s+(?:de\s+)?(\d{4})/i.exec(cab[0]);
    const mes = m && (MES[m[2].toLowerCase().slice(0, 4)] || MES[m[2].toLowerCase().slice(0, 3)]);
    if (mes) consultado = `${m[3]}-${String(mes).padStart(2, '0')}`;
    const resto = md.slice(cab.index + cab[0].length).split(/\n## /)[0];
    for (const l of resto.split('\n')) {
      const x = /^\s*-\s*\[F(\d+)\]\s*(.+)$/.exec(l);
      if (!x) continue;
      const urls = (x[2].match(/https?:\/\/[^\s)·]+/g) || []).map((u) => u.replace(/[.,;]+$/, ''));
      // Título = lo que va antes de la primera URL (sin rutas internas `…` ni cursivas *…*)
      const t = x[2].replace(/\s*\(`[^`]*`\)/g, '').replace(/`[^`]*`/g, '').split(/:?\s*https?:\/\//)[0].replace(/\*/g, '').replace(/[\s·:]+$/, '').trim();
      fuentes[+x[1]] = { n: +x[1], t, urls };
    }
  }
  const em = /\*\*Estado:\*\*\s*([^\n]+)|\*\*Estado:\s*([^*\n]+)\*\*/.exec(md) || [];
  const estado = (em[1] || em[2] || '').trim();
  return { file: path.relative(ROOT, f).replace(/\\/g, '/'), consultado, fuentes, estado, aprobado: /aprobado/i.test(estado) && !/pendiente de aprobaci/i.test(estado) };
}

module.exports = { leerExpediente };
