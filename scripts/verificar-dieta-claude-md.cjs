// Garantía "no dejarse nada" de la dieta de CLAUDE.md (caso p-mui3grg5ei9, 26 sept 2026).
// Comprueba que CADA línea del CLAUDE.md anterior (tag v-antes-dieta-claude-md) existe tal cual en algún
// archivo nuevo (CLAUDE.md, worker/CLAUDE.md, docs/*.md, .claude/skills/*/SKILL.md). Sale con código 1 si falta alguna.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const viejo = execSync('git show v-antes-dieta-claude-md:CLAUDE.md', { cwd: root, maxBuffer: 1 << 26 }).toString('utf8');

const destinos = ['CLAUDE.md', 'worker/CLAUDE.md'];
for (const d of fs.readdirSync(path.join(root, 'docs'))) destinos.push('docs/' + d);
const skills = path.join(root, '.claude', 'skills');
if (fs.existsSync(skills)) for (const s of fs.readdirSync(skills)) destinos.push('.claude/skills/' + s + '/SKILL.md');

const norm = (l) => l.replace(/\s+$/, '');
const nuevas = new Set();
for (const f of destinos) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const l of fs.readFileSync(p, 'utf8').split(/\r?\n/)) nuevas.add(norm(l));
}

const faltan = [];
viejo.split(/\r?\n/).forEach((l, i) => {
  if (!l.trim()) return;
  if (!nuevas.has(norm(l))) faltan.push([i + 1, l]);
});

const tam = (f) => fs.statSync(path.join(root, f)).size;
console.log('CLAUDE.md nuevo: ' + tam('CLAUDE.md') + ' bytes (antes ' + Buffer.byteLength(viejo) + ')');
if (faltan.length) {
  console.log('FALTAN ' + faltan.length + ' líneas del CLAUDE.md anterior:');
  faltan.slice(0, 40).forEach(([n, l]) => console.log('  L' + n + ': ' + l.slice(0, 120)));
  process.exit(1);
}
console.log('OK: todas las líneas del CLAUDE.md anterior existen en algún archivo nuevo.');
