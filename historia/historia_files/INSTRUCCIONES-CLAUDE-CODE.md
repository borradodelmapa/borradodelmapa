# INSTRUCCIONES PARA CLAUDE CODE

**Objetivo:** Implementar Salma Historiadora (MVP FASE 1-3) en Borrado del Mapa

**Timeline:** 4 semanas (fases paralelas)

---

## 🎯 ANTES DE EMPEZAR (Checklist)

- [ ] Has leído `BRIEF-SALMA-HISTORIADORA-V1.md` completamente
- [ ] Has revisado `CHECKLIST-ARCHIVOS.md` para entender qué crear
- [ ] Tienes acceso al repo privado de Borrado del Mapa (`github.com/borradodelmapa/borradodelmapa`)
- [ ] Tienes credenciales de Cloudflare Worker y Firebase
- [ ] Has visto `salma-worker-v1-final.js` para entender el Worker actual
- [ ] Comprendes que NO debes quebrar el código existente de viajes

---

## 🚀 PRIMER DÍA (Setup - 4 horas)

### Paso 1: Revisar estado actual
```bash
# Clona el repo (si no lo tienes)
git clone https://github.com/borradodelmapa/borradodelmapa.git
cd borradodelmapa

# Revisa la estructura
tree -L 2 -I 'node_modules'

# Abre index.html y app.js para entender estructura
```

**Qué buscar:**
- `<div id="viajes-tab">` - Tab actual de viajes
- `<div id="salma-tab">` - Tab actual de chat
- `const TAB_ROUTES` en app.js (si existe)
- `salma-chat.js` - entender cómo funciona chat actual

### Paso 2: Crear estructura de carpetas
```bash
mkdir -p js/modules
mkdir -p styles/components
mkdir -p views/historia
mkdir -p data/historias
mkdir -p worker

# Confirma que existen
ls -la js/
ls -la styles/
ls -la views/
```

### Paso 3: Modificar `index.html`

**Ubicación:** `index.html`

**Encuentra esta línea (tab bar actual):**
```html
<div class="tab-bar">
  <button id="tab-viajes" class="tab-button active">🗺️ VIAJES</button>
  <button id="tab-salma" class="tab-button">💬 SALMA</button>
</div>
```

**Reemplaza con:**
```html
<div class="tab-bar">
  <button id="tab-viajes" class="tab-button active">🗺️ VIAJES</button>
  <button id="tab-historia" class="tab-button">📚 HISTORIA</button>
  <button id="tab-salma" class="tab-button">💬 SALMA</button>
</div>
```

**Luego encuentra los tab-content (después del tab-bar):**
```html
<!-- Debería existir algo como: -->
<div id="viajes-tab" class="tab-content active">
  <!-- Contenido de viajes -->
</div>

<div id="salma-tab" class="tab-content">
  <!-- Contenido de Salma -->
</div>
```

**Añade esta nueva pestaña (entre viajes y salma, o al final):**
```html
<div id="historia-tab" class="tab-content">
  <!-- Nuevo contenido de Historia -->
  <div class="historia-container">
    <div class="historia-search-bar">
      <input type="text" id="historia-search" 
             placeholder="Busca un lugar u época..." 
             aria-label="Buscar historias">
    </div>
    <div id="historia-list" class="historia-list">
      <!-- Cargado dinámicamente por JS -->
    </div>
    <div id="historia-detail" class="historia-detail" style="display:none;">
      <!-- Detalle de historia específica -->
    </div>
    <div id="viaje-temporal" class="viaje-temporal" style="display:none;">
      <!-- Modo "viaje temporal" -->
    </div>
  </div>
</div>
```

### Paso 4: Revisar `app.js` actual

**Objetivo:** Entender cómo está estructurado el router actual

**Qué buscar:**
- ¿Cómo maneja tabs el click?
- ¿Existe `TAB_ROUTES` o similar?
- ¿Cómo carga dinámicamente contenido?

**Si existe un sistema de routing limpio, continúa. Si no, tendrás que crear uno.**

### Commit después del Step 1:
```bash
git add index.html
git commit -m "Setup: Añadir pestaña 📚 HISTORIA a tab-bar (UI skeleton)"
```

---

## 📅 SEGUNDO DÍA (Backend - 4 horas)

### Paso 1: Crear `worker/salma-worker-v2.js`

**Ubicación:** `worker/salma-worker-v2.js`

**Contenido base:**
```javascript
// Rutas para HISTORIA
// NO toques salma-worker-v1-final.js — este es nuevo

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Rutas nuevas para historia
    if (url.pathname.startsWith('/api/history/')) {
      return handleHistoryRequest(request, env);
    }
    
    if (url.pathname.startsWith('/api/timeline/')) {
      return handleTimelineRequest(request, env);
    }
    
    // Resto del router...
    return new Response('Not Found', { status: 404 });
  }
};

async function handleHistoryRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/history/', '');
  
  // GET /api/history/search?q=vietnam
  if (path.includes('search')) {
    const q = url.searchParams.get('q');
    // TODO: buscar en KV historias que contengan 'q'
    return Response.json([]);
  }
  
  // GET /api/history/nearby?lat=21.0285&lng=105.8542&radius=5000
  if (path.includes('nearby')) {
    const lat = parseFloat(url.searchParams.get('lat'));
    const lng = parseFloat(url.searchParams.get('lng'));
    const radius = parseInt(url.searchParams.get('radius')) || 5000;
    
    // TODO: buscar en KV historias con location cercana
    return Response.json([]);
  }
  
  // GET /api/history/{id}
  const historyId = path.split('/')[0];
  if (historyId) {
    // TODO: buscar historia específica en KV
    return Response.json({});
  }
  
  return Response.json({ error: 'Not found' }, { status: 404 });
}

async function handleTimelineRequest(request, env) {
  if (request.method === 'POST') {
    const data = await request.json();
    // TODO: generar timeline (Canvas en frontend, aquí solo metadata)
    return Response.json({ status: 'ok' });
  }
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
```

### Paso 2: Crear Firestore collections

**Accede a Firestore Console:**
```
https://console.firebase.google.com → Tu proyecto Borrado del Mapa
```

**Crea colección:** `histories`
- Crea documentos manuales O
- Importa desde `historias-init.json`

**Estructura esperada:**
```
histories/
├─ vietnam-1862-1975 { title, description, paradas: [], ... }
├─ hanoi-1000-years { ... }
├─ thailand-siam-1600-2000 { ... }
└─ french-revolution-1789 { ... }
```

### Paso 3: Cargar historias en KV

**Conecta a Cloudflare Wrangler:**
```bash
# Si tienes wrangler instalado
wrangler kv:namespace list

# Deberías ver SALMA_KV (o similar)
```

**Sube historias a KV:**
```bash
# Lee archivo historias-init.json
cat data/historias-init.json | jq '.[]' | while read -r history; do
  HISTORY_ID=$(echo $history | jq -r '.id')
  # Para cada historia, sube a KV:
  # wrangler kv:key put --namespace-id=<id> "$HISTORY_ID" "$history"
done

# O hazlo manualmente en Cloudflare Dashboard
# KV > SALMA_KV > "Add binding"
```

### Commit después del Step 2:
```bash
git add worker/salma-worker-v2.js
git commit -m "Backend: Crear rutas /api/history/* y /api/timeline/*"
```

---

## 🎨 TERCERO Y CUARTO DÍA (Frontend - 8 horas)

### Paso 1: Crear `styles/historia.css`

**Ubicación:** `styles/historia.css`

**Contenido inicial (ya tienes estructura, expande):**
```css
/* VARIABLES DE COLOR */
:root {
  --color-historia: #2563EB;
  --color-historia-light: #DBEAFE;
  --color-historia-dark: #1E40AF;
  --color-historia-accent: #F59E0B;
}

/* CONTENEDOR PRINCIPAL */
.historia-container {
  max-width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* SEARCH BAR */
.historia-search-bar {
  display: flex;
  gap: 0.5rem;
}

#historia-search {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-historia);
  border-radius: 0.5rem;
  font-size: 1rem;
}

/* LISTA DE HISTORIAS */
.historia-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.historia-card {
  background: white;
  border: 1px solid var(--color-historia-light);
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.historia-card:hover {
  border-color: var(--color-historia);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.historia-card h3 {
  color: var(--color-historia);
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
}

.historia-card p {
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0;
}

/* DETAIL VIEW */
.historia-detail {
  background: white;
  border: 1px solid var(--color-historia-light);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.historia-detail h2 {
  color: var(--color-historia);
  margin-top: 0;
}

/* TIMELINE */
.timeline-horizontal {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem 0;
  scroll-behavior: smooth;
}

.timeline-event {
  flex-shrink: 0;
  padding: 1rem;
  background: var(--color-historia-light);
  border-left: 4px solid var(--color-historia);
  border-radius: 0.25rem;
  cursor: pointer;
  min-width: 150px;
}

.timeline-event.active {
  background: var(--color-historia);
  color: white;
}

/* VIAJE TEMPORAL */
.viaje-temporal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.parada-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.parada-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* MOBILE RESPONSIVE */
@media (max-width: 768px) {
  .historia-list {
    grid-template-columns: 1fr;
  }
  
  .parada-image {
    max-height: 200px;
  }
}
```

**Luego añade a `styles.css` principal:**
```css
@import url('./historia.css');
```

### Paso 2: Crear `js/salma-historiadora.js`

**Ubicación:** `js/salma-historiadora.js`

**Contenido base:**
```javascript
/**
 * Salma Historiadora - Módulo de historias
 * Maneja: listado, búsqueda, filtrado, viajes temporales
 */

let historiasCache = [];

// Inicializar cuando se abre pestaña de historia
async function initHistoria() {
  console.log('Inicializando Salma Historiadora...');
  
  // Cargar historias iniciales
  await loadHistories();
  
  // Event listeners
  document.getElementById('historia-search')?.addEventListener('input', handleSearch);
  
  // Si está en tab historia, renderizar lista
  if (document.getElementById('historia-tab')?.classList.contains('active')) {
    renderHistoriasList();
  }
}

// Cargar historias desde backend
async function loadHistories() {
  try {
    // TODO: cambiar URL si está en producción
    const response = await fetch('/api/history/');
    historiasCache = await response.json();
    console.log('Historias cargadas:', historiasCache.length);
  } catch (error) {
    console.error('Error cargando historias:', error);
    historiasCache = [];
  }
}

// Renderizar lista de historias
function renderHistoriasList() {
  const container = document.getElementById('historia-list');
  if (!container) return;
  
  container.innerHTML = historiasCache.map(historia => `
    <div class="historia-card" data-historia-id="${historia.id}">
      <h3>${historia.title}</h3>
      <p>${historia.description}</p>
      <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #9CA3AF;">
        ⏱️ ${historia.duration_minutes} min
      </div>
    </div>
  `).join('');
  
  // Event listeners para cards
  container.querySelectorAll('.historia-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const historiaId = card.getAttribute('data-historia-id');
      openHistoryDetail(historiaId);
    });
  });
}

// Buscar historias
async function handleSearch(e) {
  const query = e.target.value;
  
  if (query.length < 2) {
    renderHistoriasList();
    return;
  }
  
  try {
    const response = await fetch(`/api/history/search?q=${query}`);
    const results = await response.json();
    
    const container = document.getElementById('historia-list');
    container.innerHTML = results.map(historia => `
      <div class="historia-card" data-historia-id="${historia.id}">
        <h3>${historia.title}</h3>
        <p>${historia.description}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error buscando:', error);
  }
}

// Abrir detalle de historia
async function openHistoryDetail(historiaId) {
  const historia = historiasCache.find(h => h.id === historiaId);
  if (!historia) return;
  
  const listContainer = document.getElementById('historia-list');
  const detailContainer = document.getElementById('historia-detail');
  
  // Ocultar lista, mostrar detalle
  listContainer.style.display = 'none';
  detailContainer.style.display = 'block';
  
  // Renderizar detalle
  detailContainer.innerHTML = `
    <button class="btn-back" onclick="backToList()">← Volver</button>
    <h2>${historia.title}</h2>
    <p>${historia.description}</p>
    
    <div class="timeline-horizontal" id="timeline-paradas">
      ${historia.paradas.map((p, i) => `
        <div class="timeline-event ${i === 0 ? 'active' : ''}" 
             data-parada-index="${i}">
          ${p.year}: ${p.title}
        </div>
      `).join('')}
    </div>
    
    <button class="btn-primary" onclick="startViajeTemporal('${historiaId}')">
      ▶ INICIAR VIAJE TEMPORAL
    </button>
    
    <button class="btn-secondary" onclick="showShareTimeline('${historiaId}')">
      📊 Crear timeline visual
    </button>
  `;
  
  // Event listeners para timeline
  detailContainer.querySelectorAll('.timeline-event').forEach(event => {
    event.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-parada-index');
      // TODO: mostrar detalle de parada en modal
    });
  });
}

// Volver a lista
function backToList() {
  document.getElementById('historia-list').style.display = 'grid';
  document.getElementById('historia-detail').style.display = 'none';
}

// Iniciar viaje temporal
async function startViajeTemporal(historiaId) {
  const historia = historiasCache.find(h => h.id === historiaId);
  if (!historia) return;
  
  // Ocultar detalle, mostrar viaje temporal
  document.getElementById('historia-detail').style.display = 'none';
  document.getElementById('viaje-temporal').style.display = 'block';
  
  // Mostrar primera parada
  mostrarParada(historia, 0);
}

// Mostrar parada específica en viaje temporal
function mostrarParada(historia, paradaIndex) {
  if (paradaIndex >= historia.paradas.length) {
    alert('¡Viaje temporal completado!');
    backToList();
    return;
  }
  
  const parada = historia.paradas[paradaIndex];
  const container = document.getElementById('viaje-temporal');
  
  container.innerHTML = `
    <button class="btn-back" onclick="backToHistoryDetail('${historia.id}')">← Volver</button>
    
    <h2>${parada.year}: ${parada.title}</h2>
    <p class="subtitle">${parada.subtitle}</p>
    
    ${parada.images.length > 0 ? `
      <img src="${parada.images[0].url}" alt="${parada.images[0].caption}" 
           class="parada-image">
      <p class="image-caption">${parada.images[0].caption}</p>
    ` : ''}
    
    <div class="parada-content">
      <h3>La historia</h3>
      <p>${parada.content}</p>
      
      ${parada.documents.length > 0 ? `
        <h3>📄 Documentos</h3>
        <ul>
          ${parada.documents.map(doc => `
            <li><a href="${doc.url}" target="_blank">${doc.title}</a></li>
          `).join('')}
        </ul>
      ` : ''}
      
      ${parada.characters.length > 0 ? `
        <h3>👤 Preguntar a</h3>
        <div>
          ${parada.characters.map(char => `
            <button class="btn-character" onclick="chatWithCharacter('${char}')">
              💬 Preguntar a ${char}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="parada-navigation">
      <button onclick="irAParadaAnterior('${historia.id}', ${paradaIndex})" 
              ${paradaIndex === 0 ? 'disabled' : ''}>
        ← Anterior
      </button>
      <span>${paradaIndex + 1}/${historia.paradas.length}</span>
      <button onclick="irAParadaSiguiente('${historia.id}', ${paradaIndex})">
        Siguiente ▶
      </button>
    </div>
  `;
}

// Navegar paradas
function irAParadaAnterior(historiaId, paradaIndex) {
  const historia = historiasCache.find(h => h.id === historiaId);
  mostrarParada(historia, paradaIndex - 1);
}

function irAParadaSiguiente(historiaId, paradaIndex) {
  const historia = historiasCache.find(h => h.id === historiaId);
  mostrarParada(historia, paradaIndex + 1);
}

// Chatear con personaje histórico
async function chatWithCharacter(characterName) {
  // TODO: integrar con Salma para chatear con personaje
  console.log('Chat con:', characterName);
  alert('Función: Chatear con ' + characterName + ' (próximamente)');
}

// Crear timeline visual
async function showShareTimeline(historiaId) {
  // TODO: generar timeline visual con Canvas
  console.log('Generar timeline para:', historiaId);
  alert('Función: Crear timeline visual (próximamente)');
}

// Volver a detalle de historia
function backToHistoryDetail(historiaId) {
  document.getElementById('viaje-temporal').style.display = 'none';
  document.getElementById('historia-detail').style.display = 'block';
}

// Export para usar en otros módulos
window.initHistoria = initHistoria;
window.loadHistories = loadHistories;
```

### Paso 3: Integrar en `app.js`

**Encuentra dónde se inicializa la app (probablemente `DOMContentLoaded`):**

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Código existente...
  initSalmaChat(); // existente
  
  // NUEVO:
  initHistoria();
  initTabRouter();
});

// NUEVO: Router de pestañas
function initTabRouter() {
  const tabButtons = document.querySelectorAll('.tab-bar button');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Desactivar todos
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Activar seleccionado
      btn.classList.add('active');
      const tabId = btn.id.replace('tab-', '') + '-tab';
      document.getElementById(tabId)?.classList.add('active');
    });
  });
}
```

### Paso 4: Añadir styles a `index.html`

**En `<head>`:**
```html
<link rel="stylesheet" href="styles/historia.css">
```

**En `<body>`, importar scripts (antes de `</body>`):**
```html
<script src="js/salma-historiadora.js"></script>
```

### Commit después del Paso 3:
```bash
git add js/salma-historiadora.js styles/historia.css app.js index.html
git commit -m "Frontend: Implementar pestaña 📚 HISTORIA con búsqueda y viaje temporal"
```

---

## 🔊 QUINTA SEMANA (Multimodal + Extras - 4 horas)

### Paso 1: Crear `js/salma-multimodal.js`

Implementar Web Speech API para voz.

**CÓDIGO SIMPLIFICADO:**
```javascript
// Voz para Salma
class SalmaMultimodal {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
  }
  
  initVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API no soportado en este navegador');
      return;
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.language = 'es-ES';
    this.recognition.continuous = false;
    
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Escuchando...');
    };
    
    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      this.handleUserMessage(transcript);
    };
    
    this.recognition.onerror = (event) => {
      console.error('Error en reconocimiento:', event.error);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
    };
  }
  
  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    }
  }
  
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
  
  async salmaSpeak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // un poco más lento
    utterance.lang = 'es-ES';
    this.synthesis.speak(utterance);
  }
  
  handleUserMessage(text) {
    // Enviar a Salma backend y obtener respuesta
    // TODO: integrar con /api/chat
  }
}

// Inicializar al cargar
const salmaMultimodal = new SalmaMultimodal();
document.addEventListener('DOMContentLoaded', () => {
  salmaMultimodal.initVoiceInput();
});
```

### Paso 2: Crear `js/geolocalization.js`

```javascript
class GeolocalizationManager {
  constructor() {
    this.userLocation = null;
  }
  
  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalización no soportada');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(this.userLocation);
        },
        (error) => reject(error)
      );
    });
  }
  
  async loadNearbyHistories() {
    try {
      const loc = await this.getUserLocation();
      const response = await fetch(
        `/api/history/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=5000`
      );
      return await response.json();
    } catch (error) {
      console.error('Error cargando historias cercanas:', error);
      return [];
    }
  }
}

const geoManager = new GeolocalizationManager();
window.geoManager = geoManager;
```

### Commit:
```bash
git add js/salma-multimodal.js js/geolocalization.js
git commit -m "Feature: Añadir multimodal (voz) y geolocalización"
```

---

## 🧪 TESTING Y DEPLOY (Última sesión)

### Checklist de testing:

```
FRONTEND:
- [ ] Tab bar: ¿Se selecciona pestaña al clickear?
- [ ] Búsqueda: ¿Filtra historias correctamente?
- [ ] Viaje temporal: ¿Navega paradas correctamente?
- [ ] Mobile: ¿Responsive en teléfono?
- [ ] Lighthouse: ¿Performance > 80?

BACKEND:
- [ ] /api/history/search funciona
- [ ] /api/history/{id} devuelve datos
- [ ] /api/history/nearby devuelve cercanas
- [ ] No quebra código existente de viajes

VOZ:
- [ ] Web Speech API inicia al clickear micrófono
- [ ] Salma responde con voz
- [ ] Imágenes aparecen mientras narra
```

### Deploy:

```bash
# Commit final
git add .
git commit -m "MVP: Salma Historiadora implementada (FASE 1-3 completada)"

# Push a GitHub
git push origin main

# Deploy Worker (si es necesario)
wrangler deploy

# Test en producción
# Visita borradodelmapa.com
# Prueba cada pestaña
```

---

## 🎓 NOTAS IMPORTANTES

### Evitar errores comunes:

1. **No toques `salma-worker-v1-final.js`** — Crea v2, no modifiques v1
2. **Mantén estructura de carpetas limpia** — No mezcles código nuevo con existente
3. **Testing en mobile primero** — La app es móvil-first
4. **Commit frecuente** — Cada feature completada
5. **Comunica con Paco** — Si encuentras problema, pregunta primero

### Si algo se quiebra:

```bash
# Revert último commit
git revert HEAD

# O vuelve a versión anterior
git checkout <hash-anterior> -- archivo.js
```

---

## ✅ DEFINICIÓN DE "LISTO PARA PRODUCCIÓN"

- [ ] Las 3 pestañas funcionan (viajes, historia, salma)
- [ ] No se quiebra código existente
- [ ] Responsive en móvil
- [ ] Sin errores en console
- [ ] Testing manual completado
- [ ] Documentación actualizada
- [ ] Todos los commits con mensaje claro

---

## 📞 CONTACTOS

- **Paco:** (propietario del proyecto)
- **Repo:** `github.com/borradodelmapa/borradodelmapa`
- **Status:** MVP FASE 1-3 (resta FASE 4-5 para comunidad + monetización)

---

**¡Buena suerte! 🚀**
