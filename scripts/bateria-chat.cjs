// Batería fija de pruebas del chat en la web real (docs/plan-enlaces-chat.md). Uso: node scripts/bateria-chat.cjs [local|prod]
// Necesita playwright-core (npm i playwright-core en una carpeta aparte o global) y las variables de usuario
// de Windows TEST_EMAIL / TEST_PASSWORD. Nunca escribe la contraseña en ningún sitio. Gasta Claude + Google: avisar a Paco.
const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const fs = require('fs');
const MODO = process.argv[2] || 'prod';
const OUT = require('os').tmpdir() + '/bateria-chat-' + MODO;
fs.mkdirSync(OUT, { recursive: true });
const userVar = n => execSync(`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('${n}','User')"`).toString().trim();
const ALHAMBRA = 'ChIJO7l_l7f8cQ0Rf6IhEu_RjYA';
const API = 'https://salma-api.borradodelmapa-api.workers.dev/';

const UBIC = [
  { nombre: 'sin-gps', geo: null },
  { nombre: 'madrid', geo: { latitude: 40.4168, longitude: -3.7038 } },
  { nombre: 'granada', geo: { latitude: 37.1773, longitude: -3.5986 } },
];
const PREG = [
  { id: 'camper', msg: 'cómo llego a la Alhambra en camper', ok: r => r.links.some(l => l.includes(ALHAMBRA)) && r.links.every(l => !/google\.com\/maps/.test(l) || l.includes(ALHAMBRA)), espera: 'enlace a la Alhambra real y ningún otro de Maps' },
  { id: 'directo', msg: '¿Cómo llego a la Alhambra?', ok: r => r.links.some(l => l.includes(ALHAMBRA)), espera: 'enlace a la Alhambra real' },
  { id: 'triana', msg: 'dónde comer en Triana', ok: r => /pídemelo/.test(r.text) && !r.links.some(l => /google\.com\/maps/.test(l)), espera: 'frase pídemelo y sin enlaces de Maps' },
];

async function unaUbicacion(browser, u, creds) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-ES',
    ...(u.geo ? { geolocation: u.geo, permissions: ['geolocation'] } : {}) });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  if (MODO === 'local') {
    await page.route(x => x.href === API, async route => {
      if (route.request().method() !== 'POST') return route.continue();
      const r = await route.fetch({ url: 'http://localhost:8787/', timeout: 180000 });
      await route.fulfill({ response: r });
    });
  }
  let ok = false;
  for (let t = 0; t < 3 && !ok; t++) {
    try { await page.goto('https://borradodelmapa.com/', { waitUntil: 'domcontentloaded', timeout: 90000 }); ok = true; } catch (e) { console.log('  (reintento carga)'); }
  }
  await page.waitForFunction(() => window.firebase && firebase.auth, null, { timeout: 90000 });
  await page.evaluate(async ({ e, p }) => { await firebase.auth().signInWithEmailAndPassword(e, p); }, creds);
  await page.waitForFunction(() => window.currentUser && window.currentUser.uid, null, { timeout: 90000 });
  await page.getByText('Solo esenciales').click({ timeout: 5000 }).catch(() => {});
  const vers = await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /(salma|app)\.js/.test(s)).map(s => s.split('/').pop()).join(' '));
  const res = [];
  for (const q of PREG) {
    await page.evaluate(() => salma.newChat());
    await page.waitForTimeout(2500);
    let sentLoc = null;
    const onReq = r => { if (r.method() === 'POST' && r.url() === API) { try { sentLoc = JSON.parse(r.postData()).user_location || null; } catch (_) {} } };
    page.on('request', onReq);
    await page.locator('#main-input').fill(q.msg);
    const respP = page.waitForResponse(r => r.url() === API && r.request().method() === 'POST', { timeout: 180000 });
    await page.locator('#main-send').click();
    const resp = await respP;
    await resp.text().catch(() => '');
    await page.waitForTimeout(4000);
    page.off('request', onReq);
    const r = await page.evaluate(() => { const b = [...document.querySelectorAll('.msg-salma')].pop(); return b ? { text: b.innerText, links: [...b.querySelectorAll('a')].map(a => a.href) } : { text: '', links: [] }; });
    await page.locator('.msg-salma').last().screenshot({ path: `${OUT}/${u.nombre}-${q.id}.png` }).catch(() => {});
    fs.writeFileSync(`${OUT}/${u.nombre}-${q.id}.txt`, `${q.msg}\nGPS enviado: ${JSON.stringify(sentLoc)}\n\n${r.text}\n\nENLACES:\n${r.links.join('\n')}\n`);
    const pasa = q.ok(r);
    res.push({ u: u.nombre, q: q.id, pasa, gps: sentLoc ? 'sí' : 'no', maps: r.links.filter(l => /google\.com\/maps/.test(l)).map(l => (l.match(/place_id=([\w-]+)/) || [])[1] || l.slice(0, 60)) });
    console.log(`${pasa ? 'OK  ' : 'MAL '} ${u.nombre.padEnd(8)} ${q.id.padEnd(8)} gps:${sentLoc ? 'sí' : 'no'}  maps:${JSON.stringify(res[res.length - 1].maps)}${pasa ? '' : '   ← esperado: ' + q.espera}`);
  }
  if (errs.length) console.log('  errores JS:', errs);
  await ctx.close();
  return { vers, res };
}

(async () => {
  const creds = { e: userVar('TEST_EMAIL'), p: userVar('TEST_PASSWORD') };
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const todo = [];
  for (const u of UBIC) {
    try { const x = await unaUbicacion(browser, u, creds); if (!todo.length) console.log('scripts:', x.vers); todo.push(...x.res); }
    catch (e) { console.log('FALLO', u.nombre, e.message.split('\n')[0]); }
  }
  console.log(`\nRESULTADO (${MODO}): ${todo.filter(x => x.pasa).length}/${todo.length} OK`);
  await browser.close();
})();
