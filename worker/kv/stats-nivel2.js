/**
 * Estado de generación Nivel 2 (Destinos)
 * Uso: node stats-nivel2.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'output-nivel2');
const countriesFile = path.join(__dirname, 'countries.json');
const progressFile = path.join(__dirname, 'progress-nivel2.json');

const countries = JSON.parse(fs.readFileSync(countriesFile, 'utf-8'));

let progress = { completed: [], failed: [] };
try {
  progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
} catch {}

const generated = fs.existsSync(outputDir)
  ? fs.readdirSync(outputDir).filter(f => f.endsWith('.json'))
  : [];

let totalDestinos = 0;
let totalKeywords = 0;
const stats = [];

for (const file of generated) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf-8'));
    const numDest = data.destinos?.length || 0;
    const numKw = data.destinos?.reduce((s, d) => s + (d.keywords?.length || 0), 0) || 0;
    totalDestinos += numDest;
    totalKeywords += numKw;
    stats.push({ code: data.codigo, name: data.pais, destinos: numDest, keywords: numKw });
  } catch {}
}

console.log(`\n🌍 Salma Knowledge Base — Estado Nivel 2 (Destinos)\n`);
console.log(`   Total países:       ${countries.length}`);
console.log(`   Países generados:   ${generated.length}`);
console.log(`   Pendientes:         ${countries.length - progress.completed.length}`);
console.log(`   Fallidos:           ${progress.failed.length}`);
console.log(`   Total destinos:     ${totalDestinos}`);
console.log(`   Total keywords:     ${totalKeywords}`);
console.log(`   Progreso:           ${Math.round((progress.completed.length / countries.length) * 100)}%\n`);

if (stats.length > 0) {
  console.log(`── Países generados ──`);
  for (const s of stats) {
    console.log(`   ${s.code} — ${s.name}: ${s.destinos} destinos, ${s.keywords} keywords`);
  }
  console.log('');
}

// Mostrar ejemplo de un destino
if (stats.length > 0) {
  const sampleFile = generated[0];
  const sampleData = JSON.parse(fs.readFileSync(path.join(outputDir, sampleFile), 'utf-8'));
  const spot = sampleData.destinos?.[0];
  if (spot) {
    console.log(`── Ejemplo: ${spot.nombre} (${sampleData.pais}) ──`);
    console.log(`   Tipo:         ${spot.tipo}`);
    console.log(`   Días:         ${spot.dias_recomendados}`);
    console.log(`   Descripción:  ${spot.descripcion?.substring(0, 100)}...`);
    console.log(`   Cómo llegar:  ${spot.como_llegar?.substring(0, 100)}...`);
    console.log(`   Consejo:      ${spot.consejo_local?.substring(0, 100)}...`);
    console.log(`   Keywords:     ${spot.keywords?.join(', ')}`);
    console.log('');
  }
}

if (progress.failed.length > 0) {
  console.log(`── Fallidos ──`);
  progress.failed.forEach(f => console.log(`   ${f.code}: ${f.error}`));
  console.log('');
}

// Estimación de costes
const pending = countries.length - progress.completed.length;
if (pending > 0) {
  const tokensPerCall = 4000;
  const costPer1kOutput = 0.015; // Sonnet output
  const totalCost = (pending * tokensPerCall * costPer1kOutput) / 1000;
  console.log(`── Coste estimado para ${pending} países pendientes ──`);
  console.log(`   ~${(pending * tokensPerCall / 1000).toFixed(0)}K tokens output`);
  console.log(`   ~$${totalCost.toFixed(2)} USD\n`);
}
