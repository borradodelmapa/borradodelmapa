// LARGO 16:9 «Tailandia 2 · el norte en moto» (encargo T3.2, 15 nov 2026; sale el mar 8 dic). Por preguntas (N13), viaje real de Paco contado por Salma (N12), con N14.
// El TEXTO sale tal cual de docs/tailandia-2-norte-en-moto-guion-n14.md (líneas **S:**, en orden; guion v4 aprobado por Paco «OK LEÍDO»). Aquí solo van las imágenes.
// Fotos: las del bucle (5-10 feb 2026, móvil de Paco), elegidas con las hojas d05/d06/d0810/loop/dia0207 y copiadas por tailandia-largos/T2/preparar-fotos.cjs;
// encuadre fijo 16:9 foto a foto (T2/recorte16.cjs) y QUIETAS (M12): sin kb, el único movimiento es el énfasis en los datos. Clips: T2/cortar-clips.cjs. Mapas: mapa-tailandia.cjs (0 €).
// Uso: SOLO_TEXTO=1 node tailandia-2.cjs (letras, sin gastar) | CACHE_PLANOS="E:/tmp-motor/cache-planos" WORK_BASE="E:/tmp-motor" node tailandia-2.cjs
const fs = require('fs');
const { build, vozEnCache, voice } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const ROOT = 'C:/Users/User/Desktop/salma', TL = ROOT + '/salma marketing/tailandia-largos', T2 = TL + '/T2';
const textos = fs.readFileSync(ROOT + '/docs/tailandia-2-norte-en-moto-guion-n14.md', 'utf8').split(/\r?\n/).filter(l => l.startsWith('**S:** ')).map(l => l.slice(7).trim());
if (textos.length !== 42) throw new Error('el guion tiene ' + textos.length + ' frases de Salma; esta configuración espera 42');
const usados = new Set();
const uso = a => { if (usados.has(a)) throw new Error('imagen repetida (M3): ' + a); usados.add(a); return a; };
const W = (n, sc = 'GP', o = {}) => { if (!process.env.SOLO_TEXTO && !fs.existsSync(`${T2}/fotos16/W${n}.jpg`)) throw new Error('falta la foto W' + n); return { a: 'W' + n, sc, ...o }; };
const E = { enfasis: true }; // N14 (10): zoom de énfasis, solo en los datos importantes
// Pronunciación (N8): el subtítulo sigue bien escrito
const PR = [['Chiang Mai', 'Chiang Mái'], ['Mae Hong Son', 'Mae Jong Son'], ['Mae Sariang', 'Mae Sariáng'], ['Ban Rak Thai', 'Ban Rak Tái'], ['Khun Yuam', 'Kun Yuam'], ['Doi Inthanon', 'Doi Intanón'], ['Inthawichayanon', 'Intauichayanón'], ['Koh Samui', 'Ko Samúi'], ['Muay Thai', 'Muai Tai'], ['bahts', 'bats']];
const voz = t => PR.reduce((s, [a, b]) => s.split(a).join(b), t);
const A = { MOTO: { src: 'SFX_th-moto', db: -30 }, CIUDAD: { src: 'SFX_th-ciudad', db: -30 }, AGUA: { src: 'SFX_th-cascada', db: -30 }, VI: { src: 'SFX_viento-libre', db: -36 }, PAJ: { src: 'SFX_pajaros-libre', db: -36 }, MOTOFUERTE: { src: 'SFX_th-moto', db: -20 }, CALLE2: { src: 'SFX_th-calle', db: -26 } };
// MOTO, CIUDAD, AGUA y CALLE2 = sonido REAL de los vídeos del viaje (S1; th-calle = la calle peatonal de Pai, vídeo n.º 134); viento y pájaros, de banco (S4)
const C = (word, text, sub, dur = 2) => ({ word, text, sub, dur });
const CLIPS = Object.fromEntries(JSON.parse(fs.readFileSync(T2 + '/clips/clips.json', 'utf8')).map(k => [k.clip, k]));
const V = (n, sc = 'GP', o = {}) => { const k = CLIPS[n]; if (!k) throw new Error('no existe el clip ' + n); return { a: 'FILE:' + `${T2}/clips/${n}.mp4`, sc, cap: k.dura - 0.2, ...o }; };
const MAPA = n => ({ a: 'FILE:' + `${TL}/mapas/mapa-${n}.mp4`, sc: 'GP', cap: 5.3, fijo: 5.3 });
// [imágenes candidatas, opciones]. Cada frase usa tantas como pida su duración (tope ~3,5 s por imagen); desde = el plano entra al decir ese trozo (N7); fijas = se usan todas.
const P = [
  /*0 gancho*/[[V('curvas-a'), W(1, 'GP', { desde: 'Seis días', ...E }), V('lago-niebla', 'GP', { desde: 'Y un pueblo chino' })], { id: 'g0', amb: A.MOTO, fijas: true, cifra: [C('Mil', '1.864', 'CURVAS', 2.4)] }],
  /*1*/[[W(4), W(3, 'PM', { desde: 'La hice entera' })], { id: 'g1', amb: A.VI, fijas: true, pause: 0.6 }],
  /*2 bucle*/[[W(6), W(5)], { id: 'bucle', preg: ['¿QUÉ ES EL BUCLE?'], amb: A.VI }],
  /*3*/[[MAPA('norte'), W(7, 'PM', { desde: 'por dos carreteras' })], { amb: A.VI, fijas: true, cifra: [C('vuelve', 'IDA', 'Y VUELTA', 2)] }],
  /*4*/[[V('foso'), W(8), W(9)], { amb: A.CIUDAD, cifra: [C('noventa', '1296', 'FUNDACIÓN DE CHIANG MAI', 2.2)] }],
  /*5*/[[W(10)], { amb: A.VI }],
  /*6 días*/[[W(11), W(12)], { id: 'dias', preg: ['¿CUÁNTOS DÍAS?'], amb: A.VI, cifra: [C('cinco', 'CON PRISA,', 'NO', 2)] }],
  /*7*/[[W(13, 'GP', { desde: 'Pai' }), V('lago-tarde', 'GP', { desde: 'el lago' }), W(16, 'GP', { desde: 'Mae Sariang' })], { amb: A.VI, fijas: true }],
  /*8*/[[W(17), W(2, 'PM')], { amb: A.CIUDAD }],
  /*9 carné*/[[W(18), W(19)], { id: 'carne', preg: ['¿QUÉ CARNÉ HACE FALTA?'], amb: A.CIUDAD }],
  /*10*/[[W(20), W(23, 'PM')], { amb: A.VI, fijas: true, cifra: [C('internacional', 'PERMISO', 'INTERNACIONAL', 2.4)] }],
  /*11*/[[W(21)], { amb: A.MOTO }],
  /*12*/[[W(22, 'PM'), W(69, 'GP', { desde: 'haz fotos', ...E })], { amb: A.CIUDAD, fijas: true, cifra: [C('fotos', 'FOTOS', 'ANTES DE SALIR', 2.2)] }],
  /*13*/[[V('carretera-c')], { amb: A.MOTO }],
  /*14 curvas*/[[V('curvas-b'), W(26), W(25)], { id: 'curvas', preg: ['¿CÓMO SON LAS CURVAS?'], amb: A.MOTOFUERTE, cifra: [C('kilómetros', '762 CURVAS', 'SOLO HASTA PAI', 2.4)] }],
  /*15*/[[W(35)], { amb: A.MOTO }],
  /*16*/[[V('pista'), W(27, 'PM')], { amb: A.MOTO, cifra: [C('atención', 'SIN', 'PRISA', 2)] }],
  /*17*/[[W(28)], { amb: A.VI }],
  /*18 Pai*/[[V('pai-atardecer'), W(30, 'PM')], { id: 'pai', preg: ['¿QUÉ HAY EN PAI?'], amb: A.VI }],
  /*19*/[[V('calle-noche'), W(31, 'PM'), W(33, 'GP', { desde: 'De día' })], { amb: A.CALLE2, fijas: true }],
  /*20*/[[W(29), W(34)], { amb: A.MOTO, cifra: [C('japonés', 'CARRETERA', 'DE GUERRA', 2.2)] }],
  /*21*/[[W(36, 'PM'), W(37)], { amb: A.CIUDAD }],
  /*22 pueblo chino*/[[W(38), W(39), V('lago-barcas'), W(40)], { id: 'chino', preg: ['¿UN PUEBLO CHINO?'], amb: A.PAJ, pause: 1.0 }],
  /*23*/[[W(14), W(41), W(42)], { amb: A.PAJ, pause: 0.8, cifra: [C('cuarenta', '1949', 'LLEGAN LOS SOLDADOS', 2.2)] }],
  /*24*/[[W(43), W(44), W(45)], { amb: A.PAJ, pause: 0.8, cifra: [C('ochenta', 'NOMBRE TAILANDÉS', 'AÑOS 80', 2.4)] }],
  /*25*/[[V('niebla-2'), W(46, 'PM', { desde: 'y monjes' })], { amb: A.PAJ, fijas: true, pause: 1.0 }],
  /*26*/[[W(49)], { amb: A.PAJ, pause: 1.2 }],
  /*27 kayán*/[[V('kayan-calle'), W(50)], { id: 'kayan', preg: ['¿Y LOS KAYÁN?'], amb: A.PAJ, pause: 1.2, cifra: [C('kayán', 'SE LLAMAN', 'KAYÁN', 2.4)] }],
  /*28*/[[W(51), W(52)], { amb: A.PAJ, pause: 1.2, cifra: [C('tercio', '1/3', 'DESPLAZADO', 2.2)] }],
  /*29*/[[W(53)], { amb: A.PAJ, pause: 1.2 }],
  /*30*/[[V('kayan-casas'), W(54, 'GP', { desde: 'Si vas con agencia' })], { amb: A.PAJ, fijas: true, pause: 1.0, cifra: [C('cuenta', 'POR TU', 'CUENTA', 2.2)] }],
  /*31*/[[W(55)], { amb: A.VI }],
  /*32*/[[W(56), V('rio-sariang', 'PM')], { amb: A.MOTO }],
  /*33 dónde acaba*/[[W(58), W(15)], { id: 'acaba', preg: ['¿DÓNDE ACABA?'], amb: A.VI }],
  /*34*/[[W(59), W(60), V('cascada-2'), W(71, 'PM')], { amb: A.AGUA, cifra: [C('quinientos', '2.565 M', 'EL TECHO DE TAILANDIA', 2.4), C('cenizas', 'AQUÍ DESCANSA', 'UN REY', 2.2)] }],
  /*35*/[[W(61, 'GP', E)], { amb: A.AGUA, cifra: [C('trescientos', '300 BAHTS', 'POR EXTRANJERO', 2.2)] }],
  /*36*/[[V('elefante-2'), W(62, 'PP')], { amb: A.PAJ, cifra: [C('montar', 'ELEFANTES', 'SIN MONTAR', 2.2)] }],
  /*37*/[[W(63)], { amb: A.PAJ }],
  /*38 cuándo*/[[W(64), W(65)], { id: 'cuando', preg: ['¿CUÁNDO IR?'], amb: A.AGUA }],
  /*39*/[[W(66), W(67)], { amb: A.VI, cifra: [C('diciembre', 'NORTE', 'NOV-DIC', 2.2)] }],
  /*40*/[[W(68, 'PP', E), W(57)], { amb: A.CIUDAD, cifra: [C('depósito', 'DEPÓSITO', 'LLENO', 2)] }],
  /*41 cierre*/[[V('lago'), W(70, 'GP', { desde: 'El diez' })], { id: 'cierre', amb: A.PAJ, fijas: true, pause: 1.0, cifra: [C('diez', '10 DIC', 'MUAY THAI EN KOH SAMUI', 3)] }],
];
if (P.length !== textos.length) throw new Error('reparto de imágenes: ' + P.length + ' frente a ' + textos.length + ' frases');
let idn = 0;
const limpia = w => w.replace(/[.,:;¿?¡!«»]/g, '');
// Reparto de planos por tiempo (M2), igual que en tailandia-1.cjs
const reparto = (text, vz, al, shots) => { const D = al.en[al.en.length - 1] + 0.6, n = shots.length; if (n === 1) return shots.map(({ cap, fijo, ...s }) => s);
  const dur = shots.map(() => 0), libre = new Set(shots.map((_, i) => i)); let resto = D;
  for (;;) { const m = resto / libre.size, pasa = [...libre].filter(i => shots[i].fijo || (shots[i].cap || 99) < m); if (!pasa.length) { for (const i of libre) dur[i] = m; break; } for (const i of pasa) { dur[i] = shots[i].fijo || shots[i].cap; resto -= dur[i]; libre.delete(i); } if (!libre.size) break; }
  const words = text.split(' '), sp = vz.split(' '), posV = [], posT = []; let p = 0, pt = 0; for (let q = 0; q < words.length; q++) { posV.push(p); posT.push(pt); p += (sp[q] || '').length + 1; pt += words[q].length + 1; }
  const tw = q => al.st[Math.min(posV[q], al.st.length - 1)] + 0.3; const out = [shots[0]]; let t = 0, qPrev = 0;
  for (let j = 1; j < n; j++) { t += dur[j - 1]; let best = -1, bd = 1e9, bf = '';
    for (let q = qPrev + 1; q < words.length; q++) { const d = Math.abs(tw(q) - t); if (d >= bd) continue; let fr = ''; for (let k = 1; q + k <= words.length; k++) { fr = words.slice(q, q + k).join(' '); if (text.indexOf(fr) === posT[q]) break; fr = ''; } if (fr) { bd = d; best = q; bf = fr; } }
    if (best < 0) throw new Error('no puedo colocar el plano ' + j + ' de «' + text.slice(0, 30) + '»'); out[j] = { ...shots[j], from: bf }; qPrev = best; t = tw(best); }
  return out.map(({ cap, fijo, ...s }) => s); };
const frase = (text, shots, o = {}, al) => { idn++; const words = text.split(/\s+/); const vz = voz(text);
  for (const s of shots) if (s.desde && !text.includes(s.desde)) throw new Error(`«${s.desde}» no está en la frase ${idn}: ${text.slice(0, 40)}`);
  if (al && !o.fijas) { const D = al.en[al.en.length - 1] + 0.6, n = Math.max(1, Math.min(shots.length, Math.ceil(D / 3.5))); shots = shots.slice(0, n); } // tope ~3,5 s por imagen
  shots.forEach(x => uso(x.a.replace(/^FILE:/, ''))); shots = al ? reparto(text, vz, al, shots) : shots.map(({ cap, fijo, ...s }) => s);
  { const p0 = P[idn - 1][0]; if (al && p0.length === 1 && p0[0].cap && al.en[al.en.length - 1] + 0.6 > p0[0].cap + 0.3) console.log(`⚠ el plano único de «${text.slice(0, 30)}…» pide ${(al.en[al.en.length - 1] + 0.6).toFixed(1)} s y su clip da ${p0[0].cap.toFixed(1)}`); }
  shots = shots.map(({ desde, ...x }) => (desde ? { ...x, from: desde } : x));
  for (const c of o.cifra || []) if (!words.some(w => limpia(w) === c.word)) throw new Error(`la cifra «${c.text}» busca «${c.word}» y no está en: ${text.slice(0, 40)}`);
  const cifra = [...(o.preg ? [C(limpia(words[0]), o.preg[0], o.preg[1] || '', 1.6)] : []), ...(o.cifra || [])];
  return { id: o.id || 'f' + idn, who: 'salma', scene: !!o.preg || idn <= 2, sceneEnd: true, pause: o.pause ?? 0.3, amb: { ...(o.amb || A.VI), ss: (idn % 4) * 2 }, text, ...(vz !== text ? { voz: vz } : {}), shots, ...(cifra.length ? { cifra } : {}) }; };
const CAPIS = [['g0', '1.864 curvas en moto'], ['bucle', '¿Qué es el bucle de Mae Hong Son?'], ['dias', '¿Cuántos días hacen falta?'], ['carne', '¿Qué carné hace falta?'], ['curvas', '¿Cómo son las curvas?'], ['pai', '¿Qué hay en Pai?'], ['chino', 'Ban Rak Thai, un pueblo chino'], ['kayan', '¿Y los kayán?'], ['acaba', 'Khun Yuam y Doi Inthanon'], ['cuando', '¿Cuándo ir?']];
const nuevas = textos.filter(t => !vozEnCache(voz(t), SALMA_DOC));
console.log(`VOZ: ${textos.length} frases, ${textos.reduce((a, t) => a + voz(t).length, 0)} caracteres · por generar ${nuevas.length} frases, ${nuevas.reduce((a, t) => a + voz(t).length, 0)} caracteres`);
if (process.env.SOLO_TEXTO) { P.forEach((p, i) => frase(textos[i], p[0], p[1])); console.log('reparto y desde: bien'); process.exit(0); }
const blocks = [];
blocks.push({ id: 'app', video: ROOT + '/salma marketing/pueblos/comun/clip-app-16x9.mp4', fixed: 5.9, amb: { ...A.PAJ, db: -40, ss: 0 } });
// MÚSICA POR TRAMOS (S5): «Fading Shoreline», la de T3.1. Sin música en las curvas (moto real), en Ban Rak Thai, con los kayán ni en Khun Yuam (guion: ritmo lento y sin música en lo humano).
const VOZ = (de, a, ss, db = -10) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.4 }, ss, db, fi: 1.5, fo: 1.5, voz: 1 });
const musica = { src: 'SFX_fading-shoreline', ratio: 3, trozos: [VOZ('g0', 'g1', 16), VOZ('dias', 'f13', 48), VOZ('pai', 'f22', 24), VOZ('cuando', 'cierre', 66), { de: { b: 'app' }, a: { b: 'app', finB: 1, off: 0.3 }, ss: 150, db: -10, fi: 1, fo: 1.2 }] };
const cfg = {
  titulo: 'TAILANDIA · EL NORTE EN MOTO', formato: '16:9', id: 'tailandia-2-v3', out: T2 + '/salida', ultima: T2 + '/ULTIMA', ultimaNombre: 'asi-es-el-norte-de-tailandia-en-moto', fotosSerie: T2 + '/fotos16',
  look: 'portra', counter: 'TAILANDIA', voices: { salma: SALMA_DOC }, musica, sintonia: { src: 'SFX_sintonia-pueblos', db: -8, dbVoz: -14, mapas: true }, rotuloSegs: 4,
  seguir: [{ en: 'dias', texto: 'Si te está gustando, suscríbete' }, { en: 'chino', texto: 'Hay más documentales: suscríbete' }, { en: 'cuando', texto: 'Guárdalo y compártelo' }],
  cardSecs: 8, voiceDb: { salma: -25 }, duckRatio: 5, gap: { same: 0.3, change: 0.6 },
  portada: { png: TL + '/caratulas-y18/ENTREGA/T3.2-norte-en-moto-caratula-1920.png' }, // carátula aprobada por Paco (14 nov): mapa con relieve y «1.864 CURVAS»
  descartes: { M10: 'borrador: los subtítulos EN se hacen cuando Paco apruebe el montaje (Y10)' },
  card: { l1: 'TAILANDIA', l2: 'EL NORTE EN MOTO', l3: 'Basado en un viaje real', l4: 'ÚNETE · SUSCRÍBETE', l5: 'Borrado del Mapa' },
  blocks,
};
(async () => {
  const frases = []; for (let i = 0; i < textos.length; i++) { const v = await voice(voz(textos[i]), SALMA_DOC); frases.push(frase(textos[i], P[i][0], P[i][1], v.al)); }
  blocks.unshift(...frases);
  console.log('PLANOS', blocks.reduce((a, b) => a + (b.shots || []).length, 0));
  await build(cfg);
  const t = JSON.parse(fs.readFileSync(`${T2}/salida/${cfg.id}-tiempos.json`, 'utf8')); const mm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const lin = CAPIS.map(([id, ti], i) => `${i === 0 ? '0:00' : mm(t.find(x => x.id === id).t0)} ${ti}`); fs.writeFileSync(`${T2}/capitulos.txt`, lin.join('\n') + '\n'); console.log('CAPÍTULOS\n' + lin.join('\n'));
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
