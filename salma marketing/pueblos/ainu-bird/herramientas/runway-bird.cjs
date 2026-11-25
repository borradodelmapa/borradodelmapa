// Recreaciones del short «Isabella Bird y los ainu» (copia de runway-baler.cjs) con Runway (prueba de estilo, 12 nov 2026, OK de Paco).
// imagen: node runway-baler.cjs img <nombre> "<prompt>" [tag=url|archivo ...]   (gen4_image, 8 créditos = 0,08 $)
// vídeo:  node runway-baler.cjs vid <nombre> <imagen.png> "<prompt>" [modelo=gen4_turbo]  (5 s; gen4_turbo 25 créditos, kling3.0_pro 60)
// Todo sale en ../recreaciones/ y cada tarea queda en runway-tareas.log (F5). Se rotula RECREACIÓN y se marca IA al publicar.
const fs = require('fs'), path = require('path');
const key = (fs.readFileSync('C:/Users/User/Desktop/salma/api/runway.txt', 'utf8').match(/key_[A-Za-z0-9]+/) || [])[0];
const LOG = 'C:/Users/User/Desktop/salma/salma marketing/india/runway-pruebas/runway-tareas.log';
const H = { Authorization: 'Bearer ' + key, 'X-Runway-Version': '2024-11-06', 'Content-Type': 'application/json' };
const OUT = path.join(__dirname, '..', 'recreaciones'); fs.mkdirSync(OUT, { recursive: true });
const uri = s => /^https?:/.test(s) ? s : 'data:image/' + (/png$/i.test(s) ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(s).toString('base64');
async function espera(id, dest) {
  for (let i = 0; i < 150; i++) { await new Promise(s => setTimeout(s, 5000)); const t = await (await fetch('https://api.dev.runwayml.com/v1/tasks/' + id, { headers: H })).json();
    if (t.status === 'SUCCEEDED') { const b = Buffer.from(await (await fetch(t.output[0])).arrayBuffer()); fs.writeFileSync(dest, b); console.log('ok', path.basename(dest), b.length); return; }
    if (t.status === 'FAILED' || t.status === 'CANCELLED') { console.log('FALLO', path.basename(dest), t.failure || t.status, t.failureCode || ''); process.exit(1); } }
  console.log('sin terminar', id);
}
(async () => {
  const [tipo, nombre, ...rest] = process.argv.slice(2);
  let url, body, dest, modelo;
  if (tipo === 'img') {
    const [prompt, ...refs] = rest; modelo = process.env.MODEL || 'gen4_image';
    body = { model: modelo, ratio: process.env.RATIO || '1080:1920', promptText: prompt };
    if (refs.length) body.referenceImages = refs.map(r => { const [tag, s] = r.split('='); return { uri: uri(s), tag }; });
    url = 'https://api.dev.runwayml.com/v1/text_to_image'; dest = path.join(OUT, nombre + '.png');
  } else {
    const [img, prompt, m = 'gen4_turbo'] = rest; modelo = m;
    body = { model: m, promptImage: uri(img), promptText: prompt, ratio: process.env.RATIO || (m === 'gen4_turbo' ? '720:1280' : '1080:1920'), duration: Number(process.env.DUR || 5) };
    url = 'https://api.dev.runwayml.com/v1/image_to_video'; dest = path.join(OUT, nombre + '.mp4');
  }
  const r = await fetch(url, { method: 'POST', headers: H, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) { console.log('FALLO', r.status, JSON.stringify(j).slice(0, 400)); process.exit(1); }
  fs.appendFileSync(LOG, `${new Date().toISOString()} ainu-bird ${nombre} ${modelo} ${j.id}\n`); console.log('tarea', j.id);
  await espera(j.id, dest);
})();
