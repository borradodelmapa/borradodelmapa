/**
 * restaurar-secrets.cjs — repone en Cloudflare los secrets que tienes en api\*.txt
 *
 * POR QUE EXISTE: los secrets de un Worker son de solo escritura. Cuando el Worker
 * se elimina, se destruyen y no hay forma de recuperarlos desde Cloudflare ni desde
 * un backup del repo. Hay que volver a subirlos uno por uno, y son 15.
 *
 * Este script lee las claves de la carpeta api\ (que esta en .gitignore y nunca sale
 * de tu maquina) y las sube con wrangler. Los valores NO se imprimen: solo se
 * muestran enmascarados para que confirmes que ha cogido la correcta.
 *
 * Usa -c wrangler.toml a proposito: en la raiz del proyecto hay un wrangler.jsonc
 * que wrangler coge por error si no se le dice cual es la config del Worker.
 *
 * Uso:
 *   node restaurar-secrets.cjs             -> solo muestra que haria (no sube nada)
 *   node restaurar-secrets.cjs --subir     -> sube de verdad
 *
 * Si falla con "Invalid access token", la sesion de wrangler ha caducado:
 *   npx wrangler login
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_DIR = path.join(__dirname, '..', 'api');

// fichero en api\  ->  nombre del secret en Cloudflare
const MAPA = [
  ['api antropich salma new.txt', 'ANTHROPIC_API_KEY',   'chat de Salma - SIN ESTA NO FUNCIONA NADA'],
  ['OPEN AI.txt',                 'OPENAI_API_KEY',      'enrich, narrador, panel admin'],
  ['acceso web salma.txt',        'BRAVE_SEARCH_KEY',    'busqueda web'],
  ['API SALMA VUELA.txt',         'DUFFEL_ACCESS_TOKEN', 'vuelos'],
  ['rapid api.txt',               'RAPIDAPI_KEY',        'hoteles y coches'],
  ['salma voice.txt',             'ELEVENLABS_API_KEY',  'voz de Salma'],
  ['SAMA VOZ.txt',                'GOOGLE_TTS_KEY',      'REVISAR: puede no ser esta'],
];

// Saca la credencial del fichero: el token mas largo sin espacios de al menos 20
// caracteres. Los .txt suelen traer notas alrededor de la clave.
function extraerClave(texto) {
  const candidatos = texto
    .split(/\s+/)
    .filter(t => t.length >= 20 && /^[A-Za-z0-9_\-.:+/=]+$/.test(t));
  if (!candidatos.length) return null;
  return candidatos.sort((a, b) => b.length - a.length)[0];
}

function enmascarar(v) {
  if (v.length <= 12) return '*'.repeat(v.length);
  return v.slice(0, 6) + '...' + '*'.repeat(8) + '...' + v.slice(-4) + '  (' + v.length + ' caracteres)';
}

// De un error de execSync saca la linea util de wrangler, que va por stderr. Sin
// esto solo se ve "Command failed" y no se sabe si es la clave, la config o el login.
function errorUtil(e) {
  const bruto = String(e.stderr || '') + String(e.stdout || '');
  const ESC = String.fromCharCode(27);
  const sinColores = bruto.split(new RegExp(ESC + '\\[[0-9;]*m', 'g')).join('');
  const utiles = sinColores
    .split('\n')
    .map(l => l.trim())
    .filter(l => /ERROR|Invalid|failed|code:/i.test(l))
    .slice(0, 2)
    .join(' | ');
  return utiles || String(e.message).split('\n')[0];
}

const subir = process.argv.includes('--subir');
console.log(subir
  ? '\nSUBIENDO SECRETS A CLOUDFLARE\n'
  : '\nSIMULACION - no se sube nada. Anade --subir para hacerlo de verdad.\n');

let ok = 0, fallos = 0, tokenCaducado = false;

for (const [fichero, secret, nota] of MAPA) {
  const ruta = path.join(API_DIR, fichero);
  if (!fs.existsSync(ruta)) {
    console.log('  [ ] ' + secret.padEnd(22) + ' falta el fichero api\\' + fichero);
    fallos++;
    continue;
  }
  const clave = extraerClave(fs.readFileSync(ruta, 'utf8'));
  if (!clave) {
    console.log('  [ ] ' + secret.padEnd(22) + ' no se reconoce ninguna clave en api\\' + fichero + ' - subelo a mano');
    fallos++;
    continue;
  }
  console.log('  [x] ' + secret.padEnd(22) + ' ' + enmascarar(clave));
  console.log('      ' + nota);

  if (!subir) continue;

  try {
    execSync('npx wrangler secret put ' + secret + ' -c wrangler.toml', {
      cwd: __dirname,
      input: clave,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000,
    });
    console.log('      -> subido');
    ok++;
  } catch (e) {
    const msg = errorUtil(e);
    if (/Invalid access token|Not logged in|9109/i.test(msg)) tokenCaducado = true;
    console.log('      -> ERROR: ' + msg);
    fallos++;
  }
}

console.log('');
if (subir) console.log('Subidos: ' + ok + '   Con problemas: ' + fallos);

if (tokenCaducado) {
  console.log('');
  console.log('  ============================================================');
  console.log('  LA SESION DE WRANGLER HA CADUCADO. No es problema de las');
  console.log('  claves. Ejecuta esto y vuelve a lanzar el script:');
  console.log('');
  console.log('     npx wrangler login');
  console.log('     node restaurar-secrets.cjs --subir');
  console.log('  ============================================================');
}

console.log('');
console.log('Estos NO estan en api\\ y hay que sacarlos de su panel:');
console.log('  GOOGLE_PLACES_KEY    Google Cloud Console   <- rutas, fotos y mapas');
console.log('  SERPER_API_KEY       serper.dev             (eventos)');
console.log('  OPENWEATHER_KEY      openweathermap.org     (clima; hay fallback)');
console.log('  STRIPE_SECRET_KEY    dashboard de Stripe    (pagos)');
console.log('  TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER   (SOS)');
console.log('  ADMIN_TOKEN          te lo inventas tu      (panel admin)');
console.log('');
console.log('Comprobar al terminar:  npx wrangler secret list');
