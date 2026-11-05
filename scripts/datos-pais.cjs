// DATOS DE LA WEB POR PAÍS (5 nov 2026, pieza 1 de «CHATS DE PAÍS» en docs/sistemas.md).
// Cada país tiene su carpeta scripts/paises/<slug-del-país>/ y SOLO escribe ahí, así dos chats de país nunca tocan el mismo fichero:
//   intro.json          «Conoce <país>» de destinos/<país>.html (sale del expediente aprobado; antes scripts/paises-intro.json)
//   sitios-extra.json   { "<slug-del-sitio>": {…} } bloque «Sobre…», avisos y diario de cada sitio (antes destinos-extra.json)
//   sitios-nuevos.json  { "cc": "ph", "sitios": [ … ] } sitios que se añaden a la lista del KV (antes destinos-nuevos.json)
//   historias.js        module.exports = [ {…}, … ] entradas del blog del país (antes dentro de blog-viajes-data.js)
//   rutas.json          [ {…} ] «Rutas completas» del blog (guías públicas; antes blog-rutas.json)
// «orden» (historias y rutas) = posición en el blog: menor sale antes. Lo nuevo, el siguiente número libre (de 10 en 10).
// Lo leen build-destinos.js, build-blog-viajes.js, barra-pais.cjs y publicar-episodio.cjs a través de este módulo. No leerlos a mano.
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, 'paises');

const paises = () => (fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((d) => fs.statSync(path.join(DIR, d)).isDirectory()).sort() : []);
const json = (pais, f) => { const p = path.join(DIR, pais, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
const porOrden = (a, b) => (a.orden ?? Infinity) - (b.orden ?? Infinity);

function introPaises() { const o = {}; for (const p of paises()) { const x = json(p, 'intro.json'); if (x) o[p] = x; } return o; }
function extraSitios() { const o = {}; for (const p of paises()) Object.assign(o, json(p, 'sitios-extra.json') || {}); return o; }
function sitiosNuevos() { const o = {}; for (const p of paises()) { const x = json(p, 'sitios-nuevos.json'); if (x) o[x.cc] = (o[x.cc] || []).concat(x.sitios); } return o; }
function rutasBlog() { return paises().flatMap((p) => json(p, 'rutas.json') || []).sort(porOrden); }
function historias() {
  return paises().flatMap((p) => {
    const f = path.join(DIR, p, 'historias.js');
    if (!fs.existsSync(f)) return [];
    delete require.cache[require.resolve(f)];
    return require(f);
  }).sort(porOrden);
}

module.exports = { paises, introPaises, extraSitios, sitiosNuevos, rutasBlog, historias, DIR };
