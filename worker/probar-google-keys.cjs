/**
 * probar-google-keys.cjs — averigua CUAL de tus claves de Google es la de Places.
 *
 * POR QUE EXISTE: en la cuenta hay varias claves AIzaSy... y desde fuera no se
 * distingue una de otra. Lo unico que las diferencia es que APIs tienen habilitadas
 * y que restricciones llevan. Este script las prueba de verdad contra los cuatro
 * servicios que el Worker necesita y te dice cual vale.
 *
 * Busca claves en api\*.txt y tambien en index.html y mapa-ruta.js (ahi vive la
 * clave del mapa del navegador, que a veces es la misma). Los valores no se
 * imprimen: solo enmascarados.
 *
 * OJO con las restricciones: una clave puede funcionar en el navegador y fallar
 * aqui si esta limitada por "HTTP referrer". El Worker llama desde un servidor, sin
 * referrer, asi que necesita una clave sin esa restriccion (o restringida por API).
 *
 * Uso:
 *   node probar-google-keys.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const API_DIR = path.join(ROOT, 'api');

// Los cuatro servicios de Google que usa el Worker.
const PRUEBAS = [
  {
    nombre: 'Places Text Search',
    critico: true,
    para: 'buscar_lugar y verificacion de paradas',
    url: k => 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
      + '?input=Torre%20de%20Belem&inputtype=textquery&fields=place_id,name&key=' + k,
  },
  {
    nombre: 'Place Details',
    critico: true,
    para: 'horarios, direccion y telefono de cada parada',
    url: k => 'https://maps.googleapis.com/maps/api/place/details/json'
      + '?place_id=ChIJcYH5RKoKGA0Rwx1J&fields=name&key=' + k,
  },
  {
    nombre: 'Directions',
    critico: true,
    para: 'el trazado de la ruta en el mapa',
    url: k => 'https://maps.googleapis.com/maps/api/directions/json'
      + '?origin=38.7223,-9.1393&destination=38.6916,-9.2159&key=' + k,
  },
  {
    nombre: 'Static Maps',
    critico: false,
    para: 'fondo de las postales del diario',
    url: k => 'https://maps.googleapis.com/maps/api/staticmap'
      + '?center=38.72,-9.14&zoom=10&size=100x100&key=' + k,
  },
];

function enmascarar(v) {
  return v.slice(0, 10) + '...' + '*'.repeat(6) + '...' + v.slice(-4);
}

// Recoge claves con formato de Google (AIza + 35 caracteres) de varios ficheros.
function recogerClaves() {
  const encontradas = new Map(); // clave -> [de donde salio]
  const ficheros = [];

  if (fs.existsSync(API_DIR)) {
    for (const f of fs.readdirSync(API_DIR)) {
      if (f.toLowerCase().endsWith('.txt')) ficheros.push(path.join(API_DIR, f));
    }
  }
  for (const f of ['index.html', 'mapa-ruta.js', '404.html']) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) ficheros.push(p);
  }

  for (const f of ficheros) {
    let texto;
    try { texto = fs.readFileSync(f, 'utf8'); } catch (_) { continue; }
    const hits = texto.match(/AIza[0-9A-Za-z_\-]{35}/g) || [];
    for (const h of hits) {
      if (!encontradas.has(h)) encontradas.set(h, []);
      const origen = path.basename(f);
      if (!encontradas.get(h).includes(origen)) encontradas.get(h).push(origen);
    }
  }
  return encontradas;
}

async function probar(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const tipo = res.headers.get('content-type') || '';
    if (!tipo.includes('json')) {
      // Static Maps devuelve una imagen cuando va bien.
      return res.ok ? { ok: true, detalle: 'OK' } : { ok: false, detalle: 'HTTP ' + res.status };
    }
    const j = await res.json();
    if (j.status === 'OK' || j.status === 'ZERO_RESULTS') return { ok: true, detalle: j.status };
    return { ok: false, detalle: j.status + (j.error_message ? ' - ' + j.error_message : '') };
  } catch (e) {
    return { ok: false, detalle: 'fallo de red: ' + e.message };
  }
}

async function main() {
  const claves = recogerClaves();

  if (!claves.size) {
    console.log('\nNo he encontrado ninguna clave con formato de Google (AIza...) en api\\ ni en el codigo.');
    console.log('Sacala de Google Cloud Console > APIs y servicios > Credenciales, y prueba con:');
    console.log('  node probar-google-keys.cjs --clave AIza...');
    return;
  }

  // Permite probar una clave nueva sin guardarla en ningun fichero.
  const iArg = process.argv.indexOf('--clave');
  if (iArg >= 0 && process.argv[iArg + 1]) {
    claves.set(process.argv[iArg + 1], ['pasada por parametro']);
  }

  console.log('\nEncontradas ' + claves.size + ' clave(s) de Google. Probando contra las APIs que usa el Worker.\n');

  const buenas = [];

  for (const [clave, origenes] of claves) {
    console.log('CLAVE ' + enmascarar(clave));
    console.log('  aparece en: ' + origenes.join(', '));
    let criticasOk = 0, criticasTotal = 0;

    for (const p of PRUEBAS) {
      const r = await probar(p.url(clave));
      if (p.critico) { criticasTotal++; if (r.ok) criticasOk++; }
      const marca = r.ok ? 'OK  ' : 'FALLA';
      console.log('  ' + marca + ' ' + p.nombre.padEnd(20) + (r.ok ? '' : r.detalle));
    }

    if (criticasOk === criticasTotal) {
      console.log('  >>> ESTA ES. Sirve para todo lo critico.');
      buenas.push(clave);
    } else {
      console.log('  >>> no sirve (' + criticasOk + ' de ' + criticasTotal + ' servicios criticos)');
    }
    console.log('');
  }

  if (buenas.length) {
    console.log('============================================================');
    console.log('Clave valida: ' + enmascarar(buenas[0]));
    console.log('');
    console.log('Para subirla al Worker, ejecuta esto y pega esa clave:');
    console.log('  npx wrangler secret put GOOGLE_PLACES_KEY -c wrangler.toml');
    console.log('============================================================');
  } else {
    console.log('============================================================');
    console.log('Ninguna de las claves que tienes sirve para Places.');
    console.log('');
    console.log('Lo mas habitual es una de estas dos cosas:');
    console.log('  1. La clave esta restringida por "HTTP referrer" (sitios web).');
    console.log('     El Worker llama desde un servidor y no manda referrer, asi que');
    console.log('     Google la rechaza. Necesitas una sin esa restriccion.');
    console.log('  2. Falta habilitar la API en el proyecto: Places API,');
    console.log('     Directions API, Maps Static API.');
    console.log('');
    console.log('En Google Cloud Console > APIs y servicios > Credenciales, crea una');
    console.log('clave nueva sin restriccion de referrer y pruebala asi:');
    console.log('  node probar-google-keys.cjs --clave AIza...');
    console.log('============================================================');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
