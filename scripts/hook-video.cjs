// HOOK (UserPromptSubmit): si el mensaje de Paco habla de vídeo, mete en el contexto de la sesión la orden de leer la checklist VIVA.
// No lleva copia del protocolo (cambia mucho): solo apunta a docs/video-checklist.md y dice la fecha de su última actualización.
// Configurado en .claude/settings.json. 0 €, local. Prueba: echo {"prompt":"monta el vídeo"} | node scripts/hook-video.cjs
const fs = require('fs'), path = require('path');
let prompt = '';
try { prompt = String(JSON.parse(fs.readFileSync(0, 'utf8')).prompt || ''); } catch (e) { process.exit(0); }
const TEMAS = /v[ií]deos?\b|\bshorts?\b|\breels?\b|montaje|montar\b|guion t[eé]cnico|gui[oó]n de direcci[oó]n|biblia|documental|tarjeta final|subt[ií]tulos|miniatura|runway|elevenlabs|voz de salma|serie (asia|india|vietnam|tailandia|sin mapa)|cap[ií]tulo \d|\bcap\.? ?\d|mapa animado|aviso de seguir|\bmotor\b.*(v[ií]deo|montaje)/i;
if (!TEMAS.test(prompt)) process.exit(0);
const file = path.join(__dirname, '..', 'docs', 'video-checklist.md');
let ultima = 'no se pudo leer (¿falta el archivo?)';
try {
  const t = fs.readFileSync(file, 'utf8'), i = t.indexOf('## Registro de cambios');
  const fila = t.slice(i).split(/\r?\n/).filter(l => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/Versión/.test(l))[0];
  if (fila) ultima = fila.split('|')[1].trim() + ' — ' + (fila.split('|')[3] || '').trim().slice(0, 140);
} catch (e) { /* sin archivo: el aviso sale igual */ }
console.log([
  'PROTOCOLO DE VÍDEO (aviso automático del repo, no lo ha escrito Paco): este mensaje habla de vídeo.',
  'ANTES de responder o tocar nada: lee ENTERO docs/video-checklist.md (fuente única, se modifica mucho) y pásala punto a punto.',
  'Última actualización de la checklist: ' + ultima,
  'Si Paco decide algo nuevo de vídeo, escríbelo EN ESE ARCHIVO en el mismo turno (sección «Editar esta checklist desde varios chats a la vez»), no solo en el chat.',
  'Nunca digas «listo/arreglado»: «montado — dime qué ves y oyes». Informe de reglas del motor sin ❌ antes de entregar.'
].join('\n'));
