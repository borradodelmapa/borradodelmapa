// Pone a las guías prácticas (blog/*.html, no el índice) el diseño de blog-viajes.css sin tocar su texto:
// añade el <link> a blog-viajes.css y un rótulo «Guía práctica · fecha · N min de lectura». Idempotente.
// Uso: node scripts/restyle-guias.js   (si cambia BV_CSS_V en build-blog-viajes.js, cambiar aquí también)
const fs = require('fs'), path = require('path');
const BV_CSS_V = 3;
const dir = path.join(__dirname, '..', 'blog');
let n = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.html') || f === 'index.html') continue;
  const file = path.join(dir, f);
  let h = fs.readFileSync(file, 'utf8');
  if (!h.includes('class="blog-article"')) continue;
  const link = `<link rel="stylesheet" href="/blog-viajes.css?v=${BV_CSS_V}">`;
  if (/blog-viajes\.css\?v=\d+/.test(h)) h = h.replace(/blog-viajes\.css\?v=\d+/, `blog-viajes.css?v=${BV_CSS_V}`);
  else h = h.replace(/(<link rel="stylesheet" href="\/paginas\.css\?v=\d+">)/, `$1\n${link}`);
  const art = h.slice(h.indexOf('<article'), h.indexOf('</article>'));
  const min = Math.max(1, Math.round(art.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));
  h = h.replace(/<div class="blog-date">([^<]+)<\/div>|<div class="bg-kicker">[\s\S]*?<\/div>/,
    (m, fecha) => {
      const d = fecha || (m.match(/<span>([^<]+)<\/span>/) || [])[1];
      return `<div class="bg-kicker"><b>Guía práctica</b><span>${d}</span><span>${min} min de lectura</span></div>`;
    });
  fs.writeFileSync(file, h); n++;
}
console.log('✔ guías restiladas:', n);
