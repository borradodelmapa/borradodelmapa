// REVISIÓN AUTOMÁTICA DE LAS FICHAS (15 nov 2026, Paco: «fecha de revisión y próxima revisión automática, programada»).
// Caso p-mwfityix43c. Coste: 0 € (no llama a Claude: solo vuelve a leer las fuentes, que son gratis).
//
//   node revisar.mjs              → revisa las fichas cuya próxima revisión ya ha llegado; escribe el informe
//   node revisar.mjs --todas      → revisa todas, toque o no
//   node revisar.mjs --subir      → además sube a la app las fichas renovadas (subir.mjs)
//
// Qué hace con cada ficha:
//   1. Vuelve a leer cada fuente (Wikipedia/Wikivoyage por su API; otras webs, la página).
//   2. Mira si la CITA de cada dato sigue estando, letra por letra, en su fuente.
//   3. · Todas las fuentes respondieron y todas las citas siguen → se renueva: revisada = hoy, próximas revisiones +6/+12 meses.
//      · Alguna cita ya no está (la fuente ha cambiado) → NO se toca la ficha: va al informe para que lo decida Paco.
//      · Alguna fuente no respondió → NO se renueva (nunca decimos «revisado» sin haberlo leído).
//      · Ficha hecha a mano, sin citas → no se puede comprobar sola: va al informe como «revisión a mano».
// Informe: docs/fichas/revision-<fecha>.md. La programa .github/workflows/revisar-fichas.yml (día 1 de cada mes).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const DIR = path.join(RAIZ, 'worker', 'kv', 'fichas');
const args = process.argv.slice(2);
const todas = args.includes('--todas');
const subir = args.includes('--subir');
const UA = 'BorradoDelMapa/1.0 (https://borradodelmapa.com; revision de fichas)';
const hoy = new Date().toISOString().slice(0, 10);
const mas = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x.toISOString().slice(0, 10); };
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‘’‛′`´]/g, "'").replace(/[“”«»]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
const BLOQUES = ['estable', 'cuando', 'fauna', 'sitios', 'normas', 'cambia', 'llegar', 'gente', 'delicado'];

async function leer(url) {
  const m = String(url).match(/^https:\/\/([a-z]+\.wiki(?:pedia|voyage)\.org)\/wiki\/(.+)$/);
  try {
    if (m) {
      const u = `https://${m[1]}/w/api.php?` + new URLSearchParams({ action: 'query', prop: 'extracts', explaintext: '1', redirects: '1', titles: decodeURIComponent(m[2]).replace(/_/g, ' '), format: 'json' });
      const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) return null;
      const p = Object.values((await r.json()).query.pages || {})[0];
      return p && p.extract ? p.extract : null;
    }
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) return null;
    return (await r.text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  } catch (_) { return null; }
}

const ficheros = [];
for (const d of [path.join(DIR, 'auto'), DIR]) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter(x => /^[a-z]{2}_.+\.json$/.test(x))) ficheros.push(path.join(d, f));
}
const filas = [], renovadas = [];
for (const f of ficheros) {
  const fi = JSON.parse(fs.readFileSync(f, 'utf8'));
  const toca = todas || !fi.proxima_revision_cambia || fi.proxima_revision_cambia <= hoy || (fi.proxima_revision_estable && fi.proxima_revision_estable <= hoy);
  if (!toca) continue;
  const datos = BLOQUES.flatMap(b => (fi[b] || []).map(x => ({ b, x })));
  const conCita = datos.filter(d => d.x.cita);
  if (!conCita.length) { filas.push({ fi, estado: '✋ a mano', nota: 'ficha sin citas: hay que revisarla a mano' }); continue; }
  const textos = {};
  for (const [k, s] of Object.entries(fi.fuentes || {})) textos[k] = await leer(s.url);
  const caidas = Object.entries(textos).filter(([, t]) => !t).map(([k]) => k);
  const fuera = conCita.filter(({ x }) => {
    const k = Array.isArray(x.f) ? x.f[0] : x.f;
    return textos[k] && !norm(textos[k]).includes(norm(x.cita));
  });
  if (caidas.length) { filas.push({ fi, estado: '⏸ sin renovar', nota: 'no respondió: ' + caidas.join(', ') }); continue; }
  if (fuera.length) { filas.push({ fi, estado: '⚠ ha cambiado', nota: `${fuera.length} de ${conCita.length} citas ya no están en su fuente`, fuera }); continue; }
  fi.revisada = hoy; fi.proxima_revision_cambia = mas(hoy, 6); fi.proxima_revision_estable = mas(hoy, 12);
  for (const s of Object.values(fi.fuentes || {})) s.leida = hoy;
  fs.writeFileSync(f, JSON.stringify(fi, null, 2) + '\n');
  renovadas.push(fi.ref);
  filas.push({ fi, estado: '✅ renovada', nota: `${conCita.length} citas siguen en su fuente` });
}
const md = [`# Revisión de fichas — ${hoy}`, '',
  `Hecha con \`scripts/fichas/revisar.mjs\` (0 €). ${filas.length} fichas tocaba revisar; ${renovadas.length} renovadas.`, '',
  '| Ficha | Resultado | Detalle |', '|---|---|---|',
  ...filas.map(r => `| ${r.fi.nombre} (${r.fi.ref}) | ${r.estado} | ${r.nota} |`), '',
  ...filas.filter(r => r.fuera).flatMap(r => [`## ${r.fi.nombre}: datos cuya cita ya no está`, '', ...r.fuera.map(({ b, x }) => `- **${b}** · ${x.t || x.maps} — cita: «${x.cita}»`), '']),
  filas.some(r => r.estado !== '✅ renovada') ? 'Lo que no está en ✅ no se ha tocado: lo decide Paco (rehacer la ficha con `generar.mjs`, corregir a mano o dejarla).' : 'Todo en orden.', ''].join('\n');
const salida = path.join(RAIZ, 'docs', 'fichas', `revision-${hoy}.md`);
if (filas.length) { fs.writeFileSync(salida, md); console.log(md); } else console.log('Ninguna ficha tocaba revisar hoy.');
const paises = [...new Set(renovadas.map(r => r.split(':')[0]))];
if (subir && renovadas.length) {
  for (const cc of paises) execSync(`node subir.mjs ${cc}`, { cwd: AQUI, stdio: 'inherit' });
}
// Para el workflow: qué países han renovado alguna ficha (sus páginas de destino se regeneran después).
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `paises=${paises.join(' ')}\n`);
console.log(`\nPaíses con fichas renovadas: ${paises.join(' ') || 'ninguno'}`);
