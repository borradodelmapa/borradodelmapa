# CHECKLIST TÉCNICO: Archivos a crear/modificar

**Estado:** MVP FASE 1-3 (Semanas 1-4)

---

## 📁 ESTRUCTURA DE CARPETAS

```
borradodelmapa/
├── index.html (MODIFICAR: añadir pestaña 📚 HISTORIA)
├── app.js (MODIFICAR: Router de pestañas)
├── styles.css (MODIFICAR: Añadir colores de historia)
│
├── js/
│   ├── salma-chat.js (MODIFICAR: Integrar voz)
│   ├── salma-historiadora.js (CREAR: Lógica de historias)
│   ├── salma-multimodal.js (CREAR: Voz + imágenes)
│   ├── timeline-generator.js (CREAR: Canvas para timelines)
│   ├── geolocalization.js (CREAR: Detección de ubicación)
│   └── utils.js (MODIFICAR: Helpers)
│
├── styles/
│   ├── styles.css (MODIFICAR: Existente)
│   └── historia.css (CREAR: Estilos de historia)
│
├── views/
│   ├── historia/ (CREAR carpeta)
│   │   ├── lista.html (lista de historias)
│   │   ├── vista.html (vista detallada)
│   │   └── viaje-temporal.html (modo viaje temporal)
│   └── (resto del proyecto)
│
├── data/
│   └── historias-init.json (CREAR: Historias iniciales para KV)
│
├── worker/
│   └── salma-worker-v2.js (CREAR: Extensión de worker)
│   └── salma-worker-v1-final.js (MANTENER, no tocar)
│
└── docs/
    ├── BRIEF-SALMA-HISTORIADORA-V1.md (este archivo)
    └── ARCHIVO_A_CREAR.md (este documento)
```

---

## 🔧 ARCHIVOS A CREAR (7 NUEVOS)

### 1. `js/salma-historiadora.js`
**Descripción:** Lógica principal del módulo de historias  
**Tamaño estimado:** 400-500 líneas  
**Responsabilidades:**
- Cargar historias desde Firestore/KV
- Renderizar lista de historias
- Manejar búsqueda y filtros
- Navegar entre paradas temporales

**Funciones principales:**
```javascript
async function loadHistories() { }
async function searchHistories(query) { }
async function filterHistoriesByLocation(lat, lng, radius) { }
function renderHistoriesList(histories) { }
function openHistoryDetail(historyId) { }
async function navigateToNextParada(currentParadaIndex) { }
```

---

### 2. `js/salma-multimodal.js`
**Descripción:** Manejo de voz (input/output) + imágenes  
**Tamaño estimado:** 300-400 líneas  
**Responsabilidades:**
- Web Speech API (SpeechRecognition)
- Text-to-Speech (SpeechSynthesis)
- Mostrar imágenes mientras Salma habla
- Manejo de permisos del micrófono

**Funciones principales:**
```javascript
function initVoiceInput() { }
async function startListening() { }
function stopListening() { }
async function salmaSpeak(text, images = []) { }
function displayImagesWhileSpeaking(images) { }
function handleVoiceError(error) { }
```

---

### 3. `js/timeline-generator.js`
**Descripción:** Generar timelines visuales (Canvas)  
**Tamaño estimado:** 200-300 líneas  
**Responsabilidades:**
- Dibujar timeline horizontal en Canvas
- Exportar como PNG
- Social sharing (Instagram, Twitter, WhatsApp)

**Funciones principales:**
```javascript
function generateTimeline(history, style = 'minimalist') { }
function drawAxis(ctx, paradas) { }
function drawEvents(ctx, paradas) { }
async function exportAsPNG(canvas) { }
async function shareTimeline(imageData, platform) { }
```

---

### 4. `js/geolocalization.js`
**Descripción:** Detección de ubicación + historias cercanas  
**Tamaño estimado:** 150-200 líneas  
**Responsabilidades:**
- Pedir permisos de geolocalización
- Obtener posición actual
- Buscar historias cercanas
- Modo Copilot (narración mientras camina)

**Funciones principales:**
```javascript
async function getUserLocation() { }
async function loadNearbyHistories(lat, lng, radius = 5000) { }
async function startCopilotMode(historyId) { }
function updateLocationMarker(lat, lng) { }
```

---

### 5. `styles/historia.css`
**Descripción:** Estilos específicos para pestaña de historia  
**Tamaño estimado:** 300-400 líneas  
**Contenido:**
- Colores (azul/dorado): #2563EB, #F59E0B
- Layouts para lista, detalle, viaje temporal
- Timeline interactivo (scroll horizontal en mobile)
- Cards de paradas
- Modal de personajes históricos

**Componentes CSS:**
```css
.historia-container { }
.historia-list { }
.historia-card { }
.historia-detail { }
.timeline-horizontal { }
.parada-card { }
.personaje-modal { }
.imagen-contextual { }
```

---

### 6. `views/historia/lista.html`
**Descripción:** Vista de listado de historias  
**Tamaño estimado:** 100-150 líneas  
**Contenido:**
- Buscador
- Historias populares
- Filtro por ubicación
- Cargar más

```html
<div id="historia-tab" class="tab-content">
  <div class="historia-search">
    <input type="text" id="historia-search-input" 
           placeholder="Busca un lugar u época...">
  </div>
  
  <div class="historia-list">
    <!-- Renderizado dinámico por JS -->
  </div>
</div>
```

---

### 7. `views/historia/viaje-temporal.html`
**Descripción:** Vista de viaje temporal (parada a parada)  
**Tamaño estimado:** 150-200 líneas  
**Contenido:**
- Foto de parada
- Narración de Salma
- Documentos históricos
- Selección de personajes
- Chat con personaje
- Botón siguiente parada

```html
<div id="viaje-temporal-container" class="viaje-temporal">
  <div class="viaje-temporal-header">
    <h2 id="parada-titulo"></h2>
  </div>
  
  <div class="viaje-temporal-content">
    <img id="parada-imagen" src="" alt="">
    <div id="parada-naracion" class="naracion"></div>
    
    <div class="documentos-section">
      <!-- Documentos históricos -->
    </div>
    
    <div class="personajes-section">
      <!-- Selección de personajes -->
    </div>
  </div>
  
  <button id="btn-siguiente-parada">Siguiente ▶</button>
</div>
```

---

## ✏️ ARCHIVOS A MODIFICAR (3)

### 1. `index.html`
**Líneas a modificar:** ~50  
**Cambios:**
- Añadir pestaña 📚 HISTORIA al tab bar
- Añadir container para 📚 HISTORIA
- Mantener estructura existente de 🗺️ y 💬

```html
<!-- ANTES -->
<div class="tab-bar">
  <button id="tab-viajes">🗺️ VIAJES</button>
  <button id="tab-salma">💬 SALMA</button>
</div>

<!-- DESPUÉS -->
<div class="tab-bar">
  <button id="tab-viajes">🗺️ VIAJES</button>
  <button id="tab-historia">📚 HISTORIA</button>
  <button id="tab-salma">💬 SALMA</button>
</div>

<!-- NUEVO TAB CONTENT -->
<div id="historia-tab" class="tab-content">
  <!-- Cargado por JS -->
</div>
```

**Archivo:** `/index.html`  
**Priority:** P0 (bloqueante)

---

### 2. `app.js`
**Líneas a modificar:** ~100-150  
**Cambios:**
- Router: manejar 3 pestañas en lugar de 2
- Cargar módulo de historias
- Inicializar geolocalización en Salma
- Eventos de pestañas

```javascript
// Router de pestañas
const TAB_ROUTES = {
  'tab-viajes': { id: 'viajes-tab', module: null },
  'tab-historia': { id: 'historia-tab', module: 'salmaHistoriadora' },
  'tab-salma': { id: 'salma-tab', module: 'salmaChat' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initHistoria(); // NUEVO
  initSalmaMultimodal(); // NUEVO
});

function initTabs() {
  document.querySelectorAll('.tab-bar button').forEach(btn => {
    btn.addEventListener('click', (e) => switchTab(e.target.id));
  });
}

function switchTab(tabId) {
  // Mostrar/ocultar contenido de pestaña
  // Cargar módulo si necesario
}
```

**Archivo:** `/app.js`  
**Priority:** P0 (bloqueante)

---

### 3. `styles.css`
**Líneas a modificar:** ~150-200  
**Cambios:**
- Variables CSS para colores de historia (#2563EB, #F59E0B)
- Tab bar responsive
- Imports de historia.css

```css
/* Variables de color */
:root {
  --color-viajes: #D97706;
  --color-historia: #2563EB;
  --color-salma: #EC4899;
  
  --color-historia-light: #DBEAFE;
  --color-historia-dark: #1E40AF;
}

/* Tab bar */
.tab-bar button.active {
  border-bottom: 3px solid var(--color-viajes);
}

.tab-bar button#tab-historia.active {
  border-bottom-color: var(--color-historia);
}

/* Import estilos de historia */
@import url('./historia.css');
```

**Archivo:** `/styles.css`  
**Priority:** P1 (necesario para UI)

---

## 🗄️ DATOS INICIALES

### 8. `data/historias-init.json`
**Descripción:** Historias iniciales (5-10) para importar a KV  
**Tamaño estimado:** 1000-1500 líneas  
**Formato:** Array de objetos historia

```json
[
  {
    "id": "vietnam-1862-1975",
    "title": "Vietnam: Colonia a Nación",
    "description": "...",
    "thumbnail": "url",
    "duration_minutes": 45,
    "paradas": [
      {
        "year": 1862,
        "title": "Invasión francesa",
        "content": "...",
        "images": ["url1"],
        "characters": ["Napoleon III", "Tu Duc"]
      }
      // ... más paradas
    ]
  }
  // ... más historias
]
```

**Formato:** JSON (importable directamente a Firestore/KV)  
**Priority:** P1 (necesario para datos)

---

## 🔗 WORKER NUEVAS RUTAS

### 9. `worker/salma-worker-v2.js`
**Descripción:** Extensiones al Worker para historias  
**Tamaño estimado:** 300-400 líneas  
**Rutas nuevas:**

```
GET /api/history/search?q=vietnam
POST /api/history/{id}
GET /api/history/nearby?lat=...&lng=...&radius=...
POST /api/timeline/generate
GET /api/community/{id}
```

**Estructura:**
```javascript
// Router de historia
router.get('/api/history/search', handleSearchHistories);
router.post('/api/history/:id', handleGetHistory);
router.get('/api/history/nearby', handleNearbyHistories);
router.post('/api/timeline/generate', handleGenerateTimeline);

async function handleSearchHistories(request) {
  const q = new URL(request.url).searchParams.get('q');
  // Buscar en KV historias que coincidan
}

async function handleNearbyHistories(request) {
  const lat = parseFloat(new URL(request.url).searchParams.get('lat'));
  const lng = parseFloat(new URL(request.url).searchParams.get('lng'));
  const radius = parseInt(new URL(request.url).searchParams.get('radius')) || 5000;
  
  // Buscar historias con location cercana
}
```

**Archivo:** `/worker/salma-worker-v2.js`  
**Priority:** P0 (bloqueante)

---

## 📊 TABLA RESUMEN

| Archivo | Tipo | Líneas | Prioridad | Estado |
|---------|------|--------|-----------|--------|
| `js/salma-historiadora.js` | CREAR | 400 | P0 | ⚪ |
| `js/salma-multimodal.js` | CREAR | 300 | P0 | ⚪ |
| `js/timeline-generator.js` | CREAR | 200 | P1 | ⚪ |
| `js/geolocalization.js` | CREAR | 150 | P1 | ⚪ |
| `styles/historia.css` | CREAR | 350 | P1 | ⚪ |
| `views/historia/lista.html` | CREAR | 100 | P0 | ⚪ |
| `views/historia/viaje-temporal.html` | CREAR | 150 | P0 | ⚪ |
| `data/historias-init.json` | CREAR | 1500 | P1 | ⚪ |
| `worker/salma-worker-v2.js` | CREAR | 400 | P0 | ⚪ |
| `index.html` | MODIFICAR | +50 | P0 | ⚪ |
| `app.js` | MODIFICAR | +150 | P0 | ⚪ |
| `styles.css` | MODIFICAR | +150 | P1 | ⚪ |

**Total líneas de código:** ~4.200 líneas nuevas/modificadas

---

## 🔀 ORDEN DE IMPLEMENTACIÓN

1. **Setup (Día 1-2):**
   - Modificar `index.html` (tab bar)
   - Modificar `app.js` (router)
   - Crear estructura de carpetas

2. **Backend (Día 2-3):**
   - Crear `worker/salma-worker-v2.js`
   - Crear `data/historias-init.json`
   - Setup Firestore collections

3. **Frontend Historia (Día 3-5):**
   - Crear `styles/historia.css`
   - Crear `views/historia/lista.html`
   - Crear `views/historia/viaje-temporal.html`
   - Crear `js/salma-historiadora.js`

4. **Multimodal Salma (Día 5-6):**
   - Crear `js/salma-multimodal.js`
   - Crear `js/geolocalization.js`
   - Integrar en `salma-chat.js`

5. **Extras (Día 6-7):**
   - Crear `js/timeline-generator.js`
   - Testing y pulido
   - Deploy

---

## ✅ DEFINICIÓN DE LISTO PARA CÓDIGO

**Checklist antes de pasar a Claude Code:**

- [x] Brief completo (`BRIEF-SALMA-HISTORIADORA-V1.md`)
- [x] Checklist de archivos (este documento)
- [x] Historias iniciales definidas (Vietnam, Bangkok, Hanoi, etc)
- [x] Esquema Firestore listo
- [x] System prompt de Salma historiadora definido
- [x] Diseño visual (colores, iconografía)
- [x] Stack confirmado (vanilla JS, Firebase, Cloudflare Worker)
- [x] No hay conflictos con código actual
- [x] Performance requirements definidos

---

## 📞 HANDOFF A CLAUDE CODE

**Archivos a pasar:**
1. Este documento (`ARCHIVO_A_CREAR.md`)
2. Brief maestro (`BRIEF-SALMA-HISTORIADORA-V1.md`)
3. `documento-tecnico-salma-v2.txt` (referencia)
4. `salma-worker-v1-final.js` (referencia)

**Instrucciones para Claude Code:**
1. Crear archivos en orden del checklist
2. Modificar archivos existentes (index.html, app.js, styles.css)
3. Importar historias iniciales a Firestore/KV
4. Testing básico en navegador
5. Commit a GitHub con descripción clara

**Comandos útiles:**
```bash
# Ver estructura actual
tree -L 3 --ignore 'node_modules|dist'

# Crear carpetas
mkdir -p js styles views/historia data worker

# Commit
git add . && git commit -m "Añadir Salma Historiadora MVP (FASE 1-3)"
```

---

**Estado Final:** 🟢 LISTO PARA PASAR A CLAUDE CODE
