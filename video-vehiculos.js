// VEHÍCULOS DEL VÍDEO (30 sept 2026, caso p-munccqyuwbt). Módulo compartido por video.html y muestra-vehiculos.html.
// Dos orígenes: modelos de Quaternius (CC0, vendor/mapa/vehiculos/*.glb, licencia en vendor/mapa/LICENCIAS.txt)
// y modelos hechos en código aquí (estilo low-poly parecido). Todos salen normalizados igual:
// morro hacia +Z, apoyados en el suelo (y=0), centrados, y userData.len = largo en unidades del modelo.
import * as THREE from '/vendor/mapa/three/three.module.js';
import { GLTFLoader } from '/vendor/mapa/three/addons/loaders/GLTFLoader.js?v=2';
import { clone as cloneSkinned } from '/vendor/mapa/three/addons/utils/SkeletonUtils.js?v=2';

export const GRUPOS = { carretera: 'POR CARRETERA', otros: 'AIRE, AGUA Y RAÍL', animales: 'A PIE Y CON ANIMALES' };
// yaw: giro extra (radianes) para que el morro del .glb mire a +Z
export const CATALOGO = [
  { id: 'moto', n: 'Moto', g: 'carretera' },
  { id: 'scooter', n: 'Scooter', g: 'carretera' },
  { id: 'coche', n: 'Coche', g: 'carretera' },
  { id: 'suv', n: '4x4', g: 'carretera', glb: 'suv', yaw: 0 },
  { id: 'deportivo', n: 'Deportivo', g: 'carretera', glb: 'deportivo', yaw: 0 },
  { id: 'furgo', n: 'Furgo camper', g: 'carretera' },
  { id: 'autocaravana', n: 'Autocaravana', g: 'carretera' },
  { id: 'bus', n: 'Autobús', g: 'carretera' },
  { id: 'tuktuk', n: 'Tuk-tuk', g: 'carretera' },
  { id: 'tren', n: 'Tren alta velocidad', g: 'otros', glb: 'tren-alta-velocidad', yaw: 0 },
  { id: 'tren-clasico', n: 'Tren clásico', g: 'otros', glb: 'tren-locomotora', yaw: Math.PI },
  { id: 'avion', n: 'Avión', g: 'otros', aire: true },
  { id: 'avioneta', n: 'Avioneta', g: 'otros', aire: true },
  { id: 'ferry', n: 'Ferry', g: 'otros', agua: true },
  { id: 'barca', n: 'Barca', g: 'otros', glb: 'barco', yaw: 0, agua: true },
  { id: 'velero', n: 'Velero', g: 'otros', glb: 'velero', yaw: 0, agua: true },
  { id: 'kayak', n: 'Kayak', g: 'otros', agua: true },
  { id: 'bici', n: 'Bici', g: 'animales' },
  { id: 'senderista', n: 'Senderista', g: 'animales' },
  { id: 'caballo', n: 'Caballo', g: 'animales', glb: 'caballo', yaw: 0 },
  { id: 'caballo-blanco', n: 'Caballo blanco', g: 'animales', glb: 'caballo-blanco', yaw: 0 },
  { id: 'llama', n: 'Llama', g: 'animales', glb: 'llama', yaw: 0 },
  { id: 'camello', n: 'Camello', g: 'animales' },
  { id: 'elefante', n: 'Elefante', g: 'animales' },
];
export const porId = id => CATALOGO.find(v => v.id === id) || CATALOGO[0];

/* ── utilidades de construcción (low-poly, colores planos) ── */
const M = (c, r = .6, mt = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: mt, flatShading: true });
const C = { or: 0xF4630B, blk: 0x1d1f21, gry: 0x8E9194, wht: 0xf2efe8, skin: 0xe0b48f, glass: 0x34495a, tire: 0x222426,
  jean: 0x3c5a86, tan: 0xc8a06a, camel: 0xc9975b, ele: 0x9aa0a6, wood: 0x8a5a35, cream: 0xefe6d2, red: 0xc0392b, blue: 0x2e6fb5, green: 0x4f8a3c, yel: 0xf2c230 };
function kit() {
  const g = new THREE.Group();
  const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, typeof mat === 'number' ? M(mat) : mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
  const box = (w, h, d, m, x, y, z, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
  const cyl = (r1, r2, h, m, x, y, z, rx, ry, rz, s = 10) => add(new THREE.CylinderGeometry(r1, r2, h, s), m, x, y, z, rx, ry, rz);
  const sph = (r, m, x, y, z, s = 8) => add(new THREE.SphereGeometry(r, s, Math.max(4, s - 2)), m, x, y, z);
  const wheel = (r, w, x, y, z) => { cyl(r, r, w, C.tire, x, y, z, 0, 0, Math.PI / 2, 14); cyl(r * .55, r * .55, w + .02, C.gry, x, y, z, 0, 0, Math.PI / 2, 10); };
  return { g, add, box, cyl, sph, wheel };
}
function person(k, x, y, z, top = C.or, lean = 0) { k.box(.42, .5, .28, top, x, y + .25, z, lean, 0, 0); k.sph(.2, C.skin, x, y + .68, z + .02, 10); k.box(.36, .12, .3, C.blk, x, y + .82, z, 0, 0, 0); }

const HECHOS = {
  moto() { // la de la muestra v3 (aprobada)
    const grp = new THREE.Group(), S = (c, r = .5, mt = .1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: mt });
    const orange = S(0xF4630B, .45, .15), black = S(0x16181a, .6), chrome = S(0xcfd3d6, .25, .8), skin = S(0xe0b48f, .7), jacket = S(0x23262a, .7), helmet = S(0xffffff, .3, .1);
    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); grp.add(o); };
    const wheel = new THREE.TorusGeometry(.34, .11, 12, 28); add(wheel, black, 0, .45, .72, 0, Math.PI / 2, 0); add(wheel, black, 0, .45, -.72, 0, Math.PI / 2, 0);
    const rim = new THREE.CylinderGeometry(.2, .2, .08, 18); add(rim, chrome, 0, .45, .72, 0, 0, Math.PI / 2); add(rim, chrome, 0, .45, -.72, 0, 0, Math.PI / 2);
    add(new THREE.BoxGeometry(.28, .34, 1.05), black, 0, .62, 0); add(new THREE.BoxGeometry(.42, .3, .62), orange, 0, .98, .22, -.12, 0, 0);
    add(new THREE.BoxGeometry(.34, .14, .7), black, 0, .95, -.36); add(new THREE.BoxGeometry(.3, .22, .5), orange, 0, .86, -.72, .18, 0, 0);
    add(new THREE.CylinderGeometry(.045, .045, .95, 10), chrome, 0, .95, .62, .45, 0, 0); add(new THREE.CylinderGeometry(.035, .035, .78, 10), black, 0, 1.33, .48, 0, 0, Math.PI / 2);
    add(new THREE.BoxGeometry(.32, .22, .12), orange, 0, 1.18, .72, -.35, 0, 0); add(new THREE.CylinderGeometry(.06, .07, .55, 10), chrome, .2, .55, -.45, Math.PI / 2, 0, 0);
    add(new THREE.BoxGeometry(.46, .62, .32), jacket, 0, 1.42, -.16, .35, 0, 0); add(new THREE.SphereGeometry(.2, 18, 14), helmet, 0, 1.86, .02); add(new THREE.BoxGeometry(.3, .1, .08), black, 0, 1.86, .19);
    const arm = new THREE.CylinderGeometry(.07, .07, .55, 8); add(arm, jacket, .2, 1.46, .2, 1.1, 0, 0); add(arm, jacket, -.2, 1.46, .2, 1.1, 0, 0);
    const leg = new THREE.CylinderGeometry(.09, .08, .6, 8); add(leg, jacket, .22, .95, -.1, 1.2, 0, 0); add(leg, jacket, -.22, .95, -.1, 1.2, 0, 0);
    add(new THREE.BoxGeometry(.12, .1, .12), skin, .2, 1.36, .46); add(new THREE.BoxGeometry(.12, .1, .12), skin, -.2, 1.36, .46);
    return grp;
  },
  scooter() { const k = kit(); k.wheel(.24, .16, 0, .24, .62); k.wheel(.24, .16, 0, .24, -.56);
    k.box(.36, .14, .9, C.cream, 0, .36, 0); k.box(.44, .44, .5, C.cream, 0, .6, -.4); k.box(.34, .7, .16, C.cream, 0, .72, .52, -.25);
    k.cyl(.035, .035, .7, C.blk, 0, 1.1, .5, 0, 0, Math.PI / 2); k.box(.38, .12, .55, C.blk, 0, .88, -.36);
    person(k, 0, .94, -.26, C.or, .1); return k.g; },
  coche() { // el de la muestra v3
    const grp = new THREE.Group(), S = (c, r = .5, mt = .1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: mt });
    const orange = S(0xF4630B, .35, .25), black = S(0x16181a, .6), glass = S(0x2a3a48, .15, .6), chrome = S(0xcfd3d6, .25, .8), light = S(0xfff3c4, .3, 0);
    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); grp.add(o); };
    add(new THREE.BoxGeometry(1.7, .55, 3.9), orange, 0, .62, 0); add(new THREE.BoxGeometry(1.5, .5, 2.0), orange, 0, 1.12, -.2);
    add(new THREE.BoxGeometry(1.42, .42, .05), glass, 0, 1.12, .82, -.5, 0, 0); add(new THREE.BoxGeometry(1.42, .4, .05), glass, 0, 1.12, -1.22, .5, 0, 0);
    add(new THREE.BoxGeometry(1.52, .36, 1.7), glass, 0, 1.13, -.2); add(new THREE.BoxGeometry(1.5, .08, 1.9), orange, 0, 1.39, -.2);
    const w = new THREE.CylinderGeometry(.36, .36, .28, 20); [[.82, 1.25], [-.82, 1.25], [.82, -1.25], [-.82, -1.25]].forEach(([x, z]) => { add(w, black, x, .36, z, 0, 0, Math.PI / 2); add(new THREE.CylinderGeometry(.2, .2, .3, 14), chrome, x, .36, z, 0, 0, Math.PI / 2); });
    add(new THREE.BoxGeometry(.35, .14, .05), light, .55, .72, 1.96); add(new THREE.BoxGeometry(.35, .14, .05), light, -.55, .72, 1.96);
    return grp;
  },
  furgo() { const k = kit(); k.box(1.8, 1.0, 4.2, C.or, 0, .9, 0); k.box(1.8, .62, 4.2, C.wht, 0, 1.7, 0); k.box(1.82, .46, .9, C.glass, 0, 1.62, 1.5);
    k.box(1.82, .36, 1.4, C.glass, 0, 1.66, -.6); k.box(1.2, .16, 1.8, C.gry, 0, 2.1, -.3); [[.85, 1.4], [-.85, 1.4], [.85, -1.4], [-.85, -1.4]].forEach(([x, z]) => k.wheel(.38, .28, x, .38, z)); return k.g; },
  autocaravana() { const k = kit(); k.box(2.1, 2.1, 5.6, C.wht, 0, 1.45, -.3); k.box(2.1, 1.3, 1.2, C.wht, 0, 1.05, 2.95); k.box(2.1, .5, 1.8, C.wht, 0, 2.2, 2.2);
    k.box(2.12, .46, .9, C.glass, 0, 1.5, 3.2, -.35); k.box(2.14, .3, 5.6, C.or, 0, .9, -.3); k.box(2.14, .4, 1.0, C.glass, 0, 1.9, -1.2);
    [[.95, 2.6], [-.95, 2.6], [.95, -1.8], [-.95, -1.8]].forEach(([x, z]) => k.wheel(.42, .3, x, .42, z)); return k.g; },
  bus() { const k = kit(); k.box(2.4, 2.6, 9, C.or, 0, 1.75, 0); k.box(2.42, .8, 8.6, C.glass, 0, 2.3, -.1); k.box(2.3, 1.0, .06, C.glass, 0, 2.0, 4.5); k.box(2.4, .1, 9, C.wht, 0, 3.08, 0);
    [[1.05, 3], [-1.05, 3], [1.05, -3], [-1.05, -3]].forEach(([x, z]) => k.wheel(.5, .36, x, .5, z)); return k.g; },
  tuktuk() { const k = kit(); k.wheel(.26, .18, 0, .26, 1.0); k.wheel(.26, .18, .62, .26, -.5); k.wheel(.26, .18, -.62, .26, -.5);
    k.box(1.4, .5, 1.4, C.yel, 0, .62, -.4); k.box(.8, .7, .7, C.yel, 0, .8, .7); k.box(1.46, .1, 2.2, C.blk, 0, 1.72, 0);
    [[.66, .9], [-.66, .9], [.66, -1.05], [-.66, -1.05]].forEach(([x, z]) => k.cyl(.03, .03, .9, C.blk, x, 1.27, z)); k.box(1.3, .5, .3, C.blk, 0, 1.1, -1.0); person(k, 0, .9, .35, C.or); return k.g; },
  avion() { const k = kit(); k.cyl(.55, .55, 6.2, C.wht, 0, 0, 0, Math.PI / 2, 0, 0, 14); k.sph(.55, C.wht, 0, 0, 3.1, 12); k.cyl(.55, .12, 1.4, C.wht, 0, .12, -3.8, Math.PI / 2, 0, 0, 12);
    k.box(7.2, .12, 1.3, C.gry, 0, -.15, .2); k.box(2.6, .1, .8, C.gry, 0, .2, -4.1); k.box(.1, 1.3, 1.0, C.or, 0, .75, -4.1);
    k.cyl(.26, .26, 1.0, C.gry, 1.7, -.45, .5, Math.PI / 2); k.cyl(.26, .26, 1.0, C.gry, -1.7, -.45, .5, Math.PI / 2); k.box(1.1, .1, .06, C.glass, 0, .28, 3.35);
    k.box(.02, .06, 4.8, C.or, .56, .05, 0); k.box(.02, .06, 4.8, C.or, -.56, .05, 0); return k.g; },
  avioneta() { const k = kit(); k.box(.7, .7, 3.2, C.wht, 0, 0, 0); k.box(.72, .4, .9, C.glass, 0, .4, .5); k.box(5.2, .1, 1.0, C.or, 0, .62, .4);
    k.box(1.8, .08, .6, C.or, 0, .1, -1.5); k.box(.08, .8, .6, C.or, 0, .45, -1.5); k.cyl(.2, .2, .3, C.gry, 0, 0, 1.7, Math.PI / 2); k.box(.08, 1.3, .12, C.blk, 0, 0, 1.88); return k.g; },
  ferry() { const k = kit(); k.box(3.2, 1.4, 11, C.wht, 0, .7, 0); k.box(3.22, .35, 11, C.blue, 0, .2, 0); k.box(2.8, 1.2, 6, C.wht, 0, 2.0, -.8); k.box(2.82, .34, 6, C.glass, 0, 2.1, -.8);
    k.box(2.2, .9, 2.4, C.wht, 0, 3.0, .6); k.cyl(.35, .4, 1.3, C.or, 0, 3.7, -2.2); k.box(3.0, .5, 2, C.wht, 0, .95, 5.5); return k.g; },
  kayak() { const k = kit(); k.add(new THREE.SphereGeometry(.5, 10, 6), C.or, 0, .15, 0).scale.set(.7, .4, 4.2); person(k, 0, .25, 0, C.blue);
    k.cyl(.03, .03, 2.2, C.blk, 0, .75, .2, 0, 0, Math.PI / 2 + .3); k.box(.08, .02, .3, C.or, 1.05, 1.06, .2); k.box(.08, .02, .3, C.or, -1.05, .44, .2); return k.g; },
  bici() { const k = kit(); const r = z => k.add(new THREE.TorusGeometry(.32, .05, 6, 16), C.blk, 0, .34, z, 0, Math.PI / 2, 0); r(.55); r(-.55);
    k.cyl(.04, .04, .95, C.or, 0, .62, 0, Math.PI / 2 - .35); k.cyl(.04, .04, .6, C.or, 0, .6, -.3, -.3); k.cyl(.04, .04, .6, C.or, 0, .6, .45, .3);
    k.cyl(.03, .03, .55, C.blk, 0, 1.02, .5, 0, 0, Math.PI / 2); person(k, 0, .9, -.12, C.or, .55); return k.g; },
  senderista() { const k = kit(); k.box(.14, .5, .16, C.jean, .1, .25, .05, .25); k.box(.14, .5, .16, C.jean, -.1, .25, -.05, -.25);
    k.box(.42, .52, .28, C.green, 0, .76, 0); k.box(.36, .5, .22, C.or, 0, .86, -.24); k.sph(.2, C.skin, 0, 1.2, .02, 10);
    k.cyl(.22, .22, .06, C.tan, 0, 1.33, 0, 0, 0, 0, 12); k.cyl(.13, .13, .14, C.tan, 0, 1.4, 0); k.cyl(.02, .02, 1.2, C.wood, .3, .62, .2, .15); return k.g; },
  camello() { const k = kit(); const leg = (x, z) => k.box(.16, 1.2, .16, C.camel, x, .6, z); leg(.28, .9); leg(-.28, .9); leg(.28, -.8); leg(-.28, -.8);
    k.box(.8, .7, 2.2, C.camel, 0, 1.45, 0); k.sph(.45, C.camel, 0, 1.95, .4, 8); k.sph(.4, C.camel, 0, 1.9, -.5, 8);
    k.box(.22, 1.0, .3, C.camel, 0, 2.1, 1.3, -.5); k.box(.3, .3, .6, C.camel, 0, 2.6, 1.62); k.box(.3, .06, .1, C.blk, 0, 2.7, 1.94);
    k.box(.82, .1, .6, C.red, 0, 2.28, -.05); return k.g; },
  elefante() { const k = kit(); const leg = (x, z) => k.cyl(.26, .28, 1.2, C.ele, x, .6, z, 0, 0, 0, 8); leg(.45, .9); leg(-.45, .9); leg(.45, -.9); leg(-.45, -.9);
    k.box(1.5, 1.3, 2.6, C.ele, 0, 1.75, 0); k.box(1.1, 1.0, 1.0, C.ele, 0, 2.1, 1.6); k.cyl(.2, .1, 1.5, C.ele, 0, 1.3, 2.15, -.2, 0, 0, 8);
    k.box(.1, .9, .8, C.ele, .62, 2.2, 1.45, 0, .3, 0); k.box(.1, .9, .8, C.ele, -.62, 2.2, 1.45, 0, -.3, 0); k.cyl(.05, .02, .5, C.cream, .3, 1.55, 2.1, 1.1); k.cyl(.05, .02, .5, C.cream, -.3, 1.55, 2.1, 1.1);
    k.box(1.3, .12, 1.2, C.red, 0, 2.46, 0); return k.g; },
};

function shadow(grp, sx, sz) {
  const sh = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: .28, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.scale.set(sx, sz, 1); sh.position.y = .02; grp.add(sh);
}
// normaliza: tumbado a lo largo de Z, centrado, en el suelo; añade sombra; guarda el largo
function normaliza(obj, yaw = 0) {
  const inner = new THREE.Group(); inner.add(obj); obj.rotation.y += yaw;
  // precise=true: en los animales (con esqueleto) mide la pose real, no la malla sin huesos
  const medir = () => { inner.updateMatrixWorld(true); return new THREE.Box3().setFromObject(inner, true); };
  let bb = medir(), s = bb.getSize(new THREE.Vector3());
  if (s.x > s.z * 1.15) { obj.rotation.y += Math.PI / 2; bb = medir(); s = bb.getSize(new THREE.Vector3()); }
  const c = bb.getCenter(new THREE.Vector3()); obj.position.x -= c.x; obj.position.z -= c.z; obj.position.y -= bb.min.y;
  const out = new THREE.Group(); out.add(inner); shadow(out, s.x * .6, s.z * .6);
  out.userData.len = Math.max(s.z, s.x * .8); out.userData.alto = s.y; return out;
}
const loader = new GLTFLoader(), cache = {};
export function crear(id) {
  const v = porId(id);
  if (!cache[v.id]) cache[v.id] = v.glb
    ? new Promise((res, rej) => loader.load(`/vendor/mapa/vehiculos/${v.glb}.glb`, gl => res(gl), undefined, rej))
    : Promise.resolve(null);
  // los animales llevan esqueleto: se clonan con SkeletonUtils (con .clone() normal los huesos se quedan en el original)
  return cache[v.id].then(gl => { const o = normaliza(gl ? cloneSkinned(gl.scene) : HECHOS[v.id](), v.yaw || 0); o.userData.clips = gl ? gl.animations : []; return o; });
}

// miniaturas para el desplegable (se pintan una vez con un renderer aparte)
let thumbR = null;
export async function miniatura(id, w = 160, h = 110) {
  if (!thumbR) { thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); thumbR.setPixelRatio(2); }
  thumbR.setSize(w, h, false);
  const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff, 0x6b7a55, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-3, 8, 4); scene.add(sun);
  const o = await crear(id), k = 3.2 / Math.max(o.userData.len, o.userData.alto); o.scale.setScalar(k); o.rotation.y = Math.PI / 2 - .5; scene.add(o);
  const cam = new THREE.PerspectiveCamera(30, w / h, .05, 100), p = 40 * Math.PI / 180; cam.position.set(0, Math.sin(p) * 10.5, Math.cos(p) * 10.5); cam.lookAt(0, .5, 0);
  thumbR.render(scene, cam); return thumbR.domElement.toDataURL('image/png');
}
