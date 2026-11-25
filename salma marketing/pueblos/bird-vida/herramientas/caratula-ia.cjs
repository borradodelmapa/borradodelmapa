// Fondo de carátula de cine para «Diario de grandes viajeros · 2 · Isabella Bird» (Runway gen4_image, 8 créditos = 0,08 $). Paco, 25 nov 2026: «hazlo cinematográfico». Recreación (L1, excepción Bird del 22 nov): se marca IA (P1).
// Es una ILUSTRACIÓN (no una foto real): se marca como contenido con IA en la red (P1) y no se usa dentro del vídeo como si fuera Tuvalu.
// Uso: node caratula-ia.cjs <nombre> <referencia.jpg|-> "<prompt>"   → caratulas/ia/<nombre>.png ; cada tarea queda en runway-tareas.log
const fs = require('fs'), path = require('path');
const key = (fs.readFileSync('C:/Users/User/Desktop/salma/api/runway.txt', 'utf8').match(/key_[A-Za-z0-9]+/) || [])[0];
const LOG = 'C:/Users/User/Desktop/salma/salma marketing/india/runway-pruebas/runway-tareas.log';
const H = { Authorization: 'Bearer ' + key, 'X-Runway-Version': '2024-11-06', 'Content-Type': 'application/json' };
const OUT = path.join(__dirname, '..', 'caratula', 'ia'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const [nombre, ref, prompt, modelo = 'gen4_image', ratio = '1920:1080'] = process.argv.slice(2);
  const body = { model: modelo, ratio, promptText: prompt };
  if (ref && ref !== '-') body.referenceImages = [{ uri: 'data:image/jpeg;base64,' + fs.readFileSync(ref).toString('base64'), tag: 'isabella' }];
  const r = await fetch('https://api.dev.runwayml.com/v1/text_to_image', { method: 'POST', headers: H, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) { console.log('FALLO', r.status, JSON.stringify(j).slice(0, 400)); process.exit(1); }
  fs.appendFileSync(LOG, `${new Date().toISOString()} bird-vida-caratula ${nombre} ${modelo} ${j.id}\n`); console.log('tarea', j.id);
  for (let i = 0; i < 90; i++) { await new Promise(s => setTimeout(s, 4000)); const t = await (await fetch('https://api.dev.runwayml.com/v1/tasks/' + j.id, { headers: H })).json();
    if (t.status === 'SUCCEEDED') { const b = Buffer.from(await (await fetch(t.output[0])).arrayBuffer()); fs.writeFileSync(path.join(OUT, nombre + '.png'), b); console.log('ok', nombre, b.length); return; }
    if (t.status === 'FAILED' || t.status === 'CANCELLED') { console.log('FALLO', nombre, t.failure || t.status, t.failureCode || ''); process.exit(1); } }
  console.log('sin terminar', nombre, j.id);
})();
