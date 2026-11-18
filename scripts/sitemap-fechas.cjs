// FECHAS DE LOS SITEMAPS (18 nov 2026; Estrategia vio en Search Console que sitemap.xml decía «blog 2026-03-27, destinos 2026-10-10»
// y que el blog tenía fechas futuras, como Tuvalu con 2026-11-26). Google usa <lastmod> para saber qué volver a mirar, pero solo
// si es verdad: una fecha de un cambio que no ha pasado (o futura) la acaba ignorando en todo el dominio.
//   fechaArchivo(rel)  → fecha en que cambió de verdad ese fichero: hoy si tiene cambios sin subir; si no, la de su último commit.
//   lastmod(rel, ...)  → la más reciente entre esas fechas y las que se le pasen, nunca después de hoy.
//   actualizarIndice() → sitemap.xml: cada sitemap con la fecha de su URL más reciente (o la del propio fichero si no las lleva).
// Lo llaman build-blog-viajes.js, build-stories.js, build-destinos.js y build-guias.js al escribir su sitemap. 0 €.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const hoy = () => new Date().toISOString().slice(0, 10);
const git = (args) => { try { return execFileSync('git', args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) { return null; } };

const cache = {};
function fechaArchivo(rel) {
  if (rel in cache) return cache[rel];
  let f = null;
  if (fs.existsSync(path.join(ROOT, rel))) {
    // Cambio real = diff con contenido (no vale «git status»: en Windows marca ficheros solo por el final de línea) o fichero nuevo
    const nuevo = git(['ls-files', '--', rel]) === '';
    const cambios = nuevo || (git(['diff', '--numstat', 'HEAD', '--', rel]) || '') !== '';
    f = cambios ? hoy() : (git(['log', '-1', '--format=%cs', '--', rel]) || null);
  }
  return (cache[rel] = f);
}
const tope = (d) => (d && d > hoy() ? hoy() : d);
function lastmod(rel, ...otras) {
  const fs_ = [fechaArchivo(rel), ...otras].filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '')).map(tope).sort();
  return fs_.length ? fs_[fs_.length - 1] : hoy();
}

function actualizarIndice() {
  const f = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(f)) return;
  let s = fs.readFileSync(f, 'utf8');
  s = s.replace(/<sitemap>\s*<loc>https:\/\/borradodelmapa\.com\/([^<]+)<\/loc>\s*<lastmod>[^<]*<\/lastmod>\s*<\/sitemap>/g, (m, hijo) => {
    const p = path.join(ROOT, hijo);
    const fechas = fs.existsSync(p) ? (fs.readFileSync(p, 'utf8').match(/<lastmod>(\d{4}-\d{2}-\d{2})/g) || []).map((x) => x.slice(9)) : [];
    const d = lastmod(hijo, ...fechas);
    return m.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${d}</lastmod>`);
  });
  fs.writeFileSync(f, s);
}

module.exports = { fechaArchivo, lastmod, actualizarIndice, hoy };
if (require.main === module) { actualizarIndice(); console.log(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8')); }
