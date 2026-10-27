// ¿Se ha quedado alguna página atrás? (27 oct 2026, Paco: «que no vuelva a pasar de dejarse cosas atrás»)
//
//   node scripts/comprobar-nada-atras.cjs      → 0 € · lee los archivos del repo · sale con error si algo no cuadra
//
// La web tiene piezas que viven en muchas páginas a la vez (CLAUDE.md §9): styles.css, destinos.css, paginas.css,
// el aviso «Instala la app» (instalar-app.js), el menú de abajo y el favicon. Cada sesión arreglaba lo que veía y el
// resto se quedaba atrás (páginas en styles.css 186, 187 y 190 a la vez; aviso de instalar en 0 de 1.793 destinos).
// Este script lo mira TODO de una vez: cada página pública y las constantes de los generadores.
// Lo pasa también GitHub en cada subida (.github/workflows/nada-atras.yml): si falla, llega un correo.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const leer = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// No son páginas de la web: carpetas de trabajo y motores que la app abre dentro de un iframe o que redirigen.
const CARPETAS_FUERA = /^(backups|salma marketing|guias-generadas|docs|scripts|worker|mockups|\.claude|\.github|node_modules)\//;
const NO_SON_PAGINAS = new Set([
  'video.html', 'viaje-fotos.html',   // motores del vídeo/álbum, van dentro de la app (fotos-viaje.js)
  'muestra-video.html',               // muestra interna del vídeo
  'tu-mundo.html', 'qr.html',         // solo redirigen
  'voice-test.html',                  // prueba de voz
]);

const paginas = execSync('git ls-files -z -- "*.html"', { cwd: ROOT, maxBuffer: 64 << 20 }).toString('utf8')
  .split('\0').filter(Boolean)
  .filter((f) => !CARPETAS_FUERA.test(f) && !NO_SON_PAGINAS.has(f) && fs.existsSync(path.join(ROOT, f)));

const fallos = [];
const versiones = {};   // pieza → { versión → [páginas] }
const PIEZAS = ['styles.css', 'destinos.css', 'paginas.css', 'instalar-app.js'];

for (const f of paginas) {
  const h = leer(f);
  for (const p of PIEZAS) {
    const re = new RegExp(p.replace('.', '\\.') + '(\\?v=(\\d+))?["\']', 'g');
    let m;
    while ((m = re.exec(h))) {
      const v = m[2] || 'SIN ?v=';
      ((versiones[p] = versiones[p] || {})[v] = versiones[p][v] || []).push(f);
    }
  }
  if (!h.includes('instalar-app.js')) fallos.push(`${f}: no lleva el aviso «Instala la app» (instalar-app.js)`);
  if (f !== 'index.html' && !h.includes('app-bottom-bar')) fallos.push(`${f}: no lleva el menú de abajo (app-bottom-bar)`);
  if (!h.includes('favicon')) fallos.push(`${f}: no lleva el favicon`);
}

// Cada pieza, UNA sola versión en toda la web
const unica = {};
for (const [p, porV] of Object.entries(versiones)) {
  const vs = Object.keys(porV);
  if (vs.length === 1) { unica[p] = vs[0]; continue; }
  const mayor = vs.filter((v) => /^\d+$/.test(v)).sort((a, b) => b - a)[0];
  unica[p] = mayor;
  for (const v of vs) {
    if (v === mayor) continue;
    const ej = porV[v].slice(0, 3).join(', ') + (porV[v].length > 3 ? ` y ${porV[v].length - 3} más` : '');
    fallos.push(`${p}?v=${v} en ${porV[v].length} páginas (lo vigente es ?v=${mayor}): ${ej}`);
  }
}

// La app (index.html) manda: styles.css de las demás páginas = el de index.html
const vIndex = (leer('index.html').match(/styles\.css\?v=(\d+)/) || [])[1];
if (vIndex && unica['styles.css'] !== vIndex) fallos.push(`styles.css: index.html va en ?v=${vIndex} y el resto de páginas en ?v=${unica['styles.css']}`);

// Los generadores tienen que escribir lo mismo que ya está en las páginas (si no, la próxima vez se vuelve atrás)
const constante = (archivo, nombre) => { const m = leer(archivo).match(new RegExp('const ' + nombre + '\\s*=\\s*(\\d+)')); return m && m[1]; };
const comparar = (archivo, nombre, pieza, debe) => {
  const v = constante(archivo, nombre);
  if (v == null) fallos.push(`${archivo}: no encuentro la constante ${nombre}`);
  else if (debe && v !== debe) fallos.push(`${archivo}: ${nombre} = ${v} pero ${pieza} va en ?v=${debe}`);
};
comparar('scripts/build-destinos.js', 'APP_CSS_V', 'styles.css', vIndex);
comparar('scripts/build-destinos.js', 'DESTINOS_CSS_V', 'destinos.css', unica['destinos.css']);
comparar('scripts/build-blog-viajes.js', 'CSS_V', 'styles.css', vIndex);
for (const archivo of ['scripts/build-destinos.js']) {
  const vs = [...leer(archivo).matchAll(/instalar-app\.js\?v=(\d+)/g)].map((m) => m[1]);
  if (!vs.length) fallos.push(`${archivo}: no pone el aviso «Instala la app» en las páginas que genera`);
  for (const v of new Set(vs)) if (v !== unica['instalar-app.js']) fallos.push(`${archivo}: escribe instalar-app.js?v=${v} pero las páginas van en ?v=${unica['instalar-app.js']}`);
}

console.log(`Páginas revisadas: ${paginas.length}`);
for (const p of PIEZAS) if (unica[p]) console.log(`  ${p}?v=${unica[p]}`);
if (fallos.length) {
  console.log(`\n❌ ${fallos.length} cosas se han quedado atrás:`);
  for (const x of fallos.slice(0, 60)) console.log('  - ' + x);
  if (fallos.length > 60) console.log(`  … y ${fallos.length - 60} más`);
  process.exitCode = 1;
} else {
  console.log('\n✅ Nada se ha quedado atrás');
}
