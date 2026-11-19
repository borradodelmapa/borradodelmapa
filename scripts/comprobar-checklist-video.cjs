// Detector de desajustes entre docs/video-checklist.md y salma marketing/india/motor/reglas.cjs (0 €, local).
// Falla (exit 1) si: un ID marcado «motor» no está comprobado en el motor · hay un [ID] o chk('ID') en el motor que la lista no marca «motor» ·
// IDs duplicados · falta el hook o su configuración · una regla no tiene sitio en las fichas de docs/video-fichas/.
// Pasarlo antes de subir cambios de vídeo o de la checklist: node scripts/comprobar-checklist-video.cjs
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const R = path.join(__dirname, '..'), E = [];
const lista = fs.readFileSync(path.join(R, 'docs/video-checklist.md'), 'utf8');
const motor = fs.readFileSync(path.join(R, 'salma marketing/india/motor/reglas.cjs'), 'utf8');
const filas = {}; // id -> comprobación
lista.split(/\r?\n/).forEach(l => { const m = l.match(/^\|\s*([A-Z]\d{1,2})\s*\|.*\|\s*(motor(?: \(pendiente\))?|manual)\s*\|\s*$/); if (m) { if (filas[m[1]]) E.push('ID duplicado en la checklist: ' + m[1]); filas[m[1]] = m[2]; } });
const enMotor = new Set([...motor.matchAll(/\[([A-Z]\d{1,2})\]/g), ...motor.matchAll(/chk\('([A-Z]\d{1,2})'/g)].map(m => m[1]));
Object.entries(filas).forEach(([id, c]) => {
  if (c === 'motor' && !enMotor.has(id)) E.push(id + ' está marcado «motor» pero reglas.cjs no lo comprueba');
  if (c !== 'motor' && enMotor.has(id)) E.push(id + ' está marcado «' + c + '» pero reglas.cjs ya lo comprueba: pasarlo a «motor» en la checklist');
});
enMotor.forEach(id => { if (!filas[id]) E.push('reglas.cjs comprueba [' + id + '] pero ese ID no existe en la checklist'); });
// el aviso automático (hook) tiene que existir y estar configurado
try { const s = JSON.parse(fs.readFileSync(path.join(R, '.claude/settings.json'), 'utf8')); if (!JSON.stringify(s.hooks || {}).includes('hook-video.cjs')) E.push('.claude/settings.json no configura el hook de vídeo'); } catch (e) { E.push('falta o no es válido .claude/settings.json'); }
const h = spawnSync('node', [path.join(R, 'scripts/hook-video.cjs')], { input: JSON.stringify({ prompt: 'monta un vídeo' }), encoding: 'utf8' });
if (h.status !== 0 || !/video-checklist\.md/.test(h.stdout || '')) E.push('scripts/hook-video.cjs no devuelve el aviso de vídeo');
// cada regla tiene su sitio (Paco, 19 nov 2026): en una ficha de docs/video-fichas/ o en la línea MOTOR de la ficha 0
try {
  const dir = path.join(R, 'docs/video-fichas');
  const txt = fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const ids = new Set([...txt.matchAll(/\b([LFNMSPYG]\d{1,2})\b/g)].map(m => m[1]));
  Object.keys(filas).forEach(id => { if (!ids.has(id)) E.push(id + ' no tiene sitio: ponla en su ficha de docs/video-fichas/ o en la línea MOTOR de 0-como-se-trabaja.md'); });
} catch (e) { E.push('falta docs/video-fichas/'); }
const n = Object.keys(filas).length, nm = Object.values(filas).filter(c => c === 'motor').length;
if (E.length) { console.log('❌ checklist de vídeo desajustada:\n- ' + E.join('\n- ')); process.exit(1); }
console.log('✅ checklist de vídeo y motor sincronizados: ' + n + ' reglas (' + nm + ' comprobadas por el motor, ' + (n - nm) + ' manuales) · hook de aviso activo · todas con sitio en las fichas');
