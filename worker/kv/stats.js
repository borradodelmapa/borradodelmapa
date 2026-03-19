/**
 * Muestra el estado de la generación de fichas
 * Uso: node stats.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'output');
const countriesFile = path.join(__dirname, 'countries.json');
const progressFile = path.join(__dirname, 'progress.json');

const countries = JSON.parse(fs.readFileSync(countriesFile, 'utf-8'));

let progress = { completed: [], failed: [] };
try {
  progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
} catch {}

const generated = fs.existsSync(outputDir)
  ? fs.readdirSync(outputDir).filter(f => f.endsWith('.json'))
  : [];

const totalKeywords = generated.reduce((sum, file) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf-8'));
    return sum + (data.keywords?.length || 0);
  } catch { return sum; }
}, 0);

console.log(`\n🌍 Salma Knowledge Base — Estado\n`);
console.log(`   Total países:     ${countries.length}`);
console.log(`   Fichas generadas: ${generated.length}`);
console.log(`   Pendientes:       ${countries.length - progress.completed.length}`);
console.log(`   Fallidos:         ${progress.failed.length}`);
console.log(`   Keywords totales: ${totalKeywords}`);
console.log(`   Progreso:         ${Math.round((progress.completed.length / countries.length) * 100)}%\n`);

if (progress.failed.length > 0) {
  console.log(`── Países fallidos ──`);
  progress.failed.forEach(f => console.log(`   ${f.code}: ${f.error}`));
  console.log('');
}

// Muestra ejemplo de ficha si hay alguna
if (generated.length > 0) {
  const sample = JSON.parse(fs.readFileSync(path.join(outputDir, generated[0]), 'utf-8'));
  console.log(`── Ejemplo: ${sample.pais} ──`);
  console.log(`   Capital:    ${sample.capital}`);
  console.log(`   Moneda:     ${sample.moneda}`);
  console.log(`   Visado ES:  ${sample.visado_espanoles}`);
  console.log(`   Seguridad:  ${sample.seguridad}`);
  console.log(`   Keywords:   ${sample.keywords?.join(', ')}`);
  console.log('');
}
