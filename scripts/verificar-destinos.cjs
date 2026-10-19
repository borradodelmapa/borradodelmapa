#!/usr/bin/env node
// scripts/verificar-destinos.cjs — comprobación de PUNTA A PUNTA de las páginas de destino ya publicadas.
// Se pasa SIEMPRE antes de dar una tanda por buena (y tras cada subida). Mira lo que ve Google y lo que ve
// la persona que pulsa «Abrir la guía». Por defecto NO llama a APIs de pago (solo páginas y fotos de la web).
//
// Uso:  node scripts/verificar-destinos.cjs                 (todas las de scripts/destinos-indexables.json con guía)
//       node scripts/verificar-destinos.cjs kathmandu-nepal  (solo esas)
//       --local   lee destinos/*.html del repo en vez de la web publicada
//       --google  ADEMÁS prueba cada foto de Google de la guía en el Worker (/photo): cuesta ~0,007 $ por foto no
//                 cacheada. Avisar a Paco antes (§8).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DOMAIN = 'https://borradodelmapa.com';
const API = 'https://salma-api.borradodelmapa-api.workers.dev';
const args = process.argv.slice(2);
const LOCAL = args.includes('--local'), GOOGLE = args.includes('--google');
let slugs = args.filter(a => !a.startsWith('--'));
const ind = JSON.parse(fs.readFileSync(path.join(__dirname, 'destinos-indexables.json'), 'utf8')).slugs;
if (!slugs.length) slugs = ind.filter(s => s !== 'index' && fs.existsSync(path.join(ROOT, 'worker', 'kv', 'routes-nivel3', s + '.json')));

const status = async (u, opt) => { try { const r = await fetch(u, Object.assign({ redirect: 'follow' }, opt)); return r.status; } catch (_) { return 0; } };
const getHTML = async s => LOCAL ? fs.readFileSync(path.join(ROOT, 'destinos', s + '.html'), 'utf8') : (await fetch(`${DOMAIN}/destinos/${s}.html`)).text();

(async () => {
  let fallos = 0;
  for (const slug of slugs) {
    const errs = [], avisos = [];
    let h = '';
    try { h = await getHTML(slug); } catch (e) { errs.push('no carga la página'); }
    if (h) {
      const g = re => (h.match(re) || [])[1] || '';
      const title = g(/<title>([^<]*)<\/title>/), desc = g(/name="description" content="([^"]*)"/);
      if (!title || title.length > 65) errs.push(`título vacío o largo (${title.length})`);
      if (!desc || desc.length > 160) errs.push(`descripción vacía o larga (${desc.length})`);
      if (/\bIA\b|inteligencia artificial/i.test(title + ' ' + desc + h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' '))) errs.push('menciona «IA» (prohibido en textos públicos)');
      if ((h.match(/<h1[ >]/g) || []).length !== 1) errs.push('no tiene exactamente un h1');
      if (!/name="robots" content="index/.test(h)) errs.push('NO está en index');
      if (!h.includes(`rel="canonical" href="${DOMAIN}/destinos/${slug}.html"`)) errs.push('canonical mal');
      // datos estructurados válidos
      const ld = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
      let tipos = [];
      for (const s of ld) { try { const j = JSON.parse(s.replace(/<\/?script[^>]*>/g, '')); tipos = tipos.concat((j['@graph'] || [j]).map(x => x['@type'])); } catch (_) { errs.push('JSON-LD roto'); } }
      for (const t of ['TouristDestination', 'BreadcrumbList', 'TouristTrip', 'FAQPage']) if (!tipos.includes(t)) errs.push('falta JSON-LD ' + t);
      // imágenes: existen, con alt y tamaño
      const imgs = (h.match(/<img [^>]*src="\/destinos\/img\/[^"]+"[^>]*>/g) || []);
      if (!imgs.length) errs.push('sin fotos');
      let rotas = 0, sinAlt = 0, sinWH = 0;
      for (const i of imgs) {
        const src = (i.match(/src="([^"]+)"/) || [])[1];
        if (!/alt="[^"]+"/.test(i)) sinAlt++;
        if (!/width="\d+"/.test(i) || !/height="\d+"/.test(i)) sinWH++;
        if (LOCAL ? !fs.existsSync(path.join(ROOT, src)) : (await status(DOMAIN + src, { method: 'HEAD' })) !== 200) rotas++;
      }
      if (rotas) errs.push(`${rotas} foto(s) no cargan`);
      if (sinAlt) errs.push(`${sinAlt} foto(s) sin alt`);
      if (sinWH) errs.push(`${sinWH} foto(s) sin ancho/alto`);
      const og = g(/property="og:image" content="([^"]+)"/);
      if (!/destinos\/img\//.test(og)) avisos.push('og:image no es la portada');
      else if (!LOCAL && (await status(og, { method: 'HEAD' })) !== 200) errs.push('og:image no carga');
      if (!h.includes('id="destino-map"')) errs.push('sin mapa');
      if (!h.includes('class="destino-hero destino-hero--foto"')) errs.push('sin portada con foto');
      // paradas de la página y fotos de paradas
      const nPar = (h.match(/class="destino-stop[ "]/g) || []).length;
      const nFoto = (h.match(/destino-stop--foto/g) || []).length;
      if (nPar && nFoto / nPar < 0.5) avisos.push(`solo ${nFoto}/${nPar} paradas con foto`);
      // A DÓNDE LLEVA «ABRIR LA GUÍA» (lo que no se miró la primera vez)
      const cta = (h.match(/href="\/\?ruta=([^"]+)"/) || [])[1];
      if (!cta) errs.push('no hay enlace «Abrir la guía»');
      else {
        const st = await status(`${DOMAIN}/${cta}`);
        if (st !== 200) errs.push(`«Abrir la guía» apunta a /${cta} que da ${st}`);
        // paradas de la guía que se verán SIN foto en la app (photo_ref que falta)
        const rf = path.join(ROOT, 'worker', 'kv', 'routes-nivel3', slug + '.json');
        if (fs.existsSync(rf)) {
          const r = JSON.parse(fs.readFileSync(rf, 'utf8'));
          const sin = r.stops.filter(s => !s.photo_ref);
          if (sin.length) avisos.push(`en la app, ${sin.length}/${r.stops.length} paradas salen sin foto (sin photo_ref): ${sin.map(s => s.name).slice(0, 4).join(', ')}`);
          if (GOOGLE) {
            let muertas = 0;
            for (const s of r.stops.filter(x => x.photo_ref)) if ((await status(`${API}/photo?ref=${encodeURIComponent(s.photo_ref)}`)) !== 200) muertas++;
            if (muertas) errs.push(`en la app, ${muertas} fotos de Google ya no responden (404) → icono gris`);
          }
        }
      }
    }
    fallos += errs.length;
    console.log(`${errs.length ? '❌' : '✅'} ${slug}`);
    errs.forEach(e => console.log('     ❌ ' + e));
    avisos.forEach(e => console.log('     ⚠️  ' + e));
  }
  console.log(fallos ? `\n${fallos} fallo(s). NO dar la tanda por buena.` : '\nTodo en orden en lo que se comprueba aquí. Falta que Paco lo vea en su pantalla (§2).');
  process.exit(fallos ? 1 : 0);
})();
