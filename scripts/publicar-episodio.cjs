// PUBLICAR UN EPISODIO (pasos 9 y 10 del protocolo de docs/video-checklist.md): deja listo TODO lo que sale del vídeo, sin publicar nada.
// Uso: node scripts/publicar-episodio.cjs <slug-del-blog>          p. ej. filipinas-sagada-ataudes-colgantes
// Lee la entrada de scripts/blog-viajes-data.js (con creditosDe = carpeta del episodio) y el vídeo de <carpeta>/ULTIMA/, y:
//  1. comprueba que ULTIMA es la exportación en CALIDAD MÁXIMA («★ Exportar para publicar» del editor);
//  2. hace el vídeo ligero de la web (salma marketing/ligeras-portada/) y la portada del blog (blog/viajes/img/);
//  3. regenera el blog (scripts/build-blog-viajes.js) y pasa el comprobador de páginas (comprobar-nada-atras.cjs);
//  4. escribe el paquete de textos para redes (P6/P9/P2) en ULTIMA/: textos-redes.json (lo usa Claude para programar en Metricool) y textos-redes.txt (para leer).
// Subir el blog a la web y programar en redes NO lo hace este script: son públicos y van con el OK de Paco (⏸ del protocolo).
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const FF = path.join(ROOT, 'salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const SITE = 'https://borradodelmapa.com';
const slug = process.argv[2];
if (!slug) { console.error('Uso: node scripts/publicar-episodio.cjs <slug-del-blog>'); process.exit(1); }
const caps = require('./blog-viajes-data.js');
const c = caps.find((x) => x.slug === slug);
if (!c) { console.error('No hay entrada con slug «' + slug + '» en scripts/blog-viajes-data.js'); process.exit(1); }
if (!c.creditosDe) { console.error('La entrada no tiene creditosDe (carpeta del episodio)'); process.exit(1); }
const EP = path.join(ROOT, c.creditosDe), U = path.join(EP, 'ULTIMA');
const paso = (n, t) => console.log(`\n${n}. ${t}`);
const run = (args, cwd = ROOT) => { const r = spawnSync(args[0], args.slice(1), { cwd, encoding: 'utf8', maxBuffer: 1e9 }); if (r.status) { console.error(r.stdout, r.stderr); throw new Error('falló: ' + args.join(' ').slice(0, 120)); } return r.stdout; };

// 1 · versión final
paso(1, 'Versión final (ULTIMA)');
const ver = fs.readFileSync(path.join(U, 'VERSION.txt'), 'utf8').trim();
const mp4 = fs.readdirSync(U).find((f) => f.endsWith('.mp4')), png = fs.readdirSync(U).find((f) => f.endsWith('PORTADA.png'));
console.log('  ' + ver);
if (!/CALIDAD MÁXIMA/.test(ver)) console.log('  ⚠ No es la exportación en calidad máxima: pulsa «★ Exportar para publicar» en el editor antes de subirlo a redes.');

// 2 · vídeo ligero + portada del blog
paso(2, 'Vídeo ligero para la web y portada del blog');
const ligero = path.join(ROOT, 'salma marketing/ligeras-portada', c.video);
run([FF, '-v', 'error', '-y', '-i', path.join(U, mp4), '-map', '0:v:0', '-map', '0:a', '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', ligero]);
run([FF, '-v', 'error', '-y', '-i', path.join(U, png), '-vf', 'scale=640:-2', '-q:v', '4', path.join(ROOT, 'blog/viajes/img', slug + '.jpg')]);
console.log('  ' + path.relative(ROOT, ligero) + ' · ' + (fs.statSync(ligero).size / 1e6).toFixed(1) + ' MB');

// 3 · blog + comprobador
paso(3, 'Blog regenerado y comprobado');
console.log('  ' + run(['node', 'scripts/build-blog-viajes.js']).trim().split('\n').pop());
console.log('  ' + run(['node', 'scripts/comprobar-nada-atras.cjs']).trim().split('\n').pop());

// 4 · paquete de textos para redes
paso(4, 'Textos para redes');
const blogUrl = `${SITE}/blog/viajes/${slug}`;
const sal = path.join(EP, 'salida');
const tiempos = fs.readdirSync(sal).filter((f) => f.endsWith('-tiempos.json')).map((f) => path.join(sal, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const usadas = [...new Set(JSON.parse(fs.readFileSync(tiempos, 'utf8')).flatMap((b) => b.shots || []).filter((x) => /^[WH]\d+$/.test(x)))];
const atr = {}; fs.readFileSync(path.join(EP, 'fotos', 'ATRIBUCIONES.txt'), 'utf8').split('\n').filter(Boolean).forEach((l) => { const p = l.split(' · '); atr[p[0]] = { autor: p[2], lic: p[3] }; });
const autores = [...new Set(usadas.filter((id) => atr[id]).map((id) => `${atr[id].autor || 'autor desconocido'} (${atr[id].lic})`))];
const R = c.redes || {};
const limpio = (s) => String(s).replace(/\*\*/g, '').replace(/\*/g, '');
const datos = (R.datos || c.ficha.slice(0, 2)).map((f) => '• ' + limpio(f)).join('\n');
const tags = R.hashtags || ['#' + (c.pais || '').toLowerCase().replace(/\s/g, ''), '#pueblosborradosdelmapa', '#viajes'];
const descripcion = `${limpio(c.resumen)}\n\nTodo el episodio, con fuentes y la guía para ir: ${blogUrl}\n\nPara viajar:\n${datos}\n(${limpio(c.nota)})\n\n${tags.join(' ')}`;
// Sonidos con licencia que piden nombrar al autor (CC BY…): <carpeta>/sonidos/ATRIBUCIONES.txt, líneas «archivo · título · autor · licencia · url» de Freesound o Wikimedia Commons
const fSon = path.join(EP, 'sonidos', 'ATRIBUCIONES.txt');
const sonidos = fs.existsSync(fSon) ? [...new Set(fs.readFileSync(fSon, 'utf8').split('\n').map((l) => l.split(' · ')).filter((p) => p.length >= 5 && /freesound|wikimedia/.test(p[4]) && /^CC/.test(p[3])).map((p) => `${p[2]} (${p[3]}, ${/freesound/.test(p[4]) ? 'Freesound' : 'Wikimedia Commons'})`))] : [];
// Vídeos de archivo con licencia libre (F10): <carpeta>/videos/ATRIBUCIONES.txt, líneas «archivos · título · autor · licencia · url» (las demás líneas son notas)
const fVid = path.join(EP, 'videos', 'ATRIBUCIONES.txt');
const videos = fs.existsSync(fVid) ? [...new Set(fs.readFileSync(fVid, 'utf8').split('\n').map((l) => l.split(' · ')).filter((p) => p.length >= 5 && /^https?:/.test(p[4].trim()) && /^CC/.test(p[3])).map((p) => `${p[2]} (${p[3].replace(' (YouTube)', '')}, ${/youtube/.test(p[4]) ? 'YouTube' : 'Wikimedia Commons'})`))] : [];
const comentario = `🗺️ Crea tu ruta gratis con Salma: borradodelmapa.com\n📖 El episodio ampliado: ${blogUrl}\n📷 Fotos: ${autores.join(' · ')} — Wikimedia Commons.${videos.length ? `\n🎥 Vídeo: ${videos.join(' · ')}.` : ''}${sonidos.length ? `\n🔊 Sonido: ${sonidos.join(' · ')}.` : ''}`;
const paquete = {
  episodio: slug, video: path.relative(ROOT, path.join(U, mp4)), version: ver, blog: blogUrl,
  youtube: { title: (R.tituloYT || c.titulo).slice(0, 100), description: descripcion, tags: tags.map((t) => t.replace('#', '')), type: 'short', madeForKids: false, isAiGeneratedContent: true },
  tiktok: { text: `${R.tituloTT || c.titulo} 🌏\n${limpio(c.resumen)}\n${tags.join(' ')}`, isAigc: true },
  primerComentario: comentario,
  pendiente: 'Programar en Metricool (YouTube + TikTok) con el OK de Paco; el vídeo necesita una URL pública (ver docs/serie-pueblos-borrados.md).',
};
fs.writeFileSync(path.join(U, 'textos-redes.json'), JSON.stringify(paquete, null, 1));
fs.writeFileSync(path.join(U, 'textos-redes.txt'), `YOUTUBE · título\n${paquete.youtube.title}\n\nYOUTUBE · descripción\n${descripcion}\n\nTIKTOK · texto\n${paquete.tiktok.text}\n\nPRIMER COMENTARIO (fijado)\n${comentario}\n`);
console.log('  ' + path.relative(ROOT, path.join(U, 'textos-redes.txt')) + ` · ${autores.length} autores en el comentario fijado`);
console.log('\nListo para el ⏸ de Paco: ver el blog en local, leer textos-redes.txt y dar el OK para subir el blog y programar en redes.');
