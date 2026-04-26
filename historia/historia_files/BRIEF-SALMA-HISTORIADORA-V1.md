# BRIEF: SALMA HISTORIADORA - Integración en Borrado del Mapa

**Fecha:** Abril 2026  
**Proyecto:** Añadir módulo de Historia + Comunidad a borradodelmapa.com  
**Owner:** Paco  
**Stack:** HTML/CSS/JS vanilla + Firebase + Cloudflare Worker  

---

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Transformar Borrado del Mapa de "planificador de viajes" a "planificador de viajes + historiador digital".

**Cambio principal:** Añadir 2 nuevas pestañas (📚 HISTORIA + mejoras a 💬 SALMA) sin tocar 🗺️ VIAJES.

**MVP Timeline:** 4 semanas (fases 1-3 del roadmap)

---

## 🎯 ESPECIFICACIONES DE PRODUCTO

### TAB BAR (3 pestañas)

```
┌────────────────────────────────────┐
│ 🗺️ VIAJES | 📚 HISTORIA | 💬 SALMA │
└────────────────────────────────────┘
```

| Pestaña | Función | Estado | Prioridad |
|---------|---------|--------|-----------|
| 🗺️ VIAJES | Viajes + hoteles + transporte (ACTUAL) | Mantener sin cambios | N/A |
| 📚 HISTORIA | Rutas temporales, viajes en el tiempo | NUEVO | P0 |
| 💬 SALMA | Chat libre multimodal | Mejorar existente | P0 |

---

## 📚 PESTAÑA 1: HISTORIA (Nueva)

### Funcionalidad

**Nivel 1: Listado de historias**

```
Buscador: "Busca un lugar u época..."
─────────────────────────────────────

POPULARES AHORA:
├─ 🏛️ Vietnam (1862-1975)
│  └─ Colonialismo → Independencia
├─ 🏯 Hanoi medieval (1000-1400)
│  └─ Reino de Dai Viet
├─ 🕌 Bangkok: Siam a Tailandia (1600-2000)
│  └─ Dinástico, guerras, modernidad
└─ 📚 VER TODAS LAS HISTORIAS (100+ disponibles)
```

**Nivel 2: Vista de historia**

Cuando user toca una historia:

```
┌─────────────────────────────────────┐
│ 🏛️ VIETNAM: Colonia a Nación        │
│    (1862-1975)                      │
├─────────────────────────────────────┤
│                                     │
│ [Foto histórica + actual]           │
│                                     │
│ Salma: "Vietnam tiene una historia  │
│ de resistencia brutal..."           │
│                                     │
│ [Timeline horizontal interactivo]   │
│ 1862 ◆─ 1954 ◆─ 1964 ◆─ 1975 ◆   │
│                                     │
│ [PARADAS TEMPORALES]                │
│ ▶ 1862: Invasión francesa           │
│ ▶ 1910: Hanoi colonial              │
│ ▶ 1954: Guerra de independencia     │
│ ▶ 1973: Vietnam del Sur en guerra   │
│ ▶ 1975: Caída de Saigón             │
│                                     │
│ [BOTONES]                           │
│ [▶ INICIAR VIAJE TEMPORAL]          │
│ [💬 Preguntar a Salma]             │
│ [📊 Crear timeline visual]          │
│                                     │
└─────────────────────────────────────┘
```

**Nivel 3: Modo "Viaje Temporal"**

Cuando user toca "INICIAR VIAJE TEMPORAL":

```
┌─────────────────────────────────────┐
│ 🏛️ VIETNAM 1862: LLEGADA FRANCESA  │
├─────────────────────────────────────┤
│                                     │
│ [Foto Hanoi 1862]                   │
│                                     │
│ Salma (narración): "Estamos en 1862.│
│ Los franceses acaban de conquistar  │
│ Cochinchina. Vietnam está dividido  │
│ entre tres reinos..."               │
│                                     │
│ [DOCUMENTOS HISTÓRICOS]             │
│ 📄 Tratado de Saigón (1862)        │
│ 📄 Diario de viajero francés       │
│ 🗣️ Testimonio: aldeano vietnamita   │
│                                     │
│ [PERSONAJES PARA PREGUNTAR]         │
│ 👤 Napoleón III                    │
│ 👤 Tự Đức (emperador vietnamita)   │
│ 👤 Soldado francés (anónimo)       │
│                                     │
│ [CHAT CON PERSONAJE]                │
│ "💬 Pregunta a Napoleón III"       │
│                                     │
│ [SIGUIENTE PARADA] ▶                │
│ → 1910: Hanoi colonial              │
│                                     │
└─────────────────────────────────────┘
```

### Datos necesarios (KV)

**KV Nivel 2B: Historias por lugar**

Estructura:

```json
{
  "key": "history:vietnam:1862-1975",
  "value": {
    "id": "vietnam-1862-1975",
    "title": "Vietnam: Colonia a Nación",
    "description": "Historia de resistencia vietnamita contra Francia y EEUU",
    "thumbnail": "url_image",
    "duration_minutes": 45,
    "paradas": [
      {
        "year": 1862,
        "title": "Invasión francesa",
        "subtitle": "Conquista de Cochinchina",
        "content": "...",
        "images": ["url1", "url2"],
        "documents": ["treaty.pdf"],
        "characters": ["Napoleon III", "Tu Duc"],
        "location": {
          "place_name": "Saigon",
          "lat": 10.7769,
          "lng": 106.6933
        }
      },
      // ... más paradas
    ],
    "related_histories": ["hanoi-medieval", "thailand-siam"]
  }
}
```

### Búsqueda por geolocalización

Cuando user abre app (en 💬 SALMA):
- Detectar ubicación del user
- Buscar historias con `location.lat/lng` cercanas (radio 5km)
- Mostrar en interfaz: "📚 Historias cerca de ti"

---

## 💬 PESTAÑA 2: SALMA (Mejorado)

### Multimodal (Voz + Visión)

**Entrada (User):**
- 🎤 Transcripción de voz (Web Speech API)
- ⌨️ Texto tradicional
- [Ambos funcionan en paralelo]

**Salida (Salma):**
- 🗣️ Respuesta en voz sintetizada (TTS)
- 👀 Imágenes contextuales mientras habla
- 📹 Videos opcionales (15-30 seg)
- 💬 Opción: desactivar voz, solo texto

**Estructura del prompt:**

Nuevo system prompt que incluya:

```
Eres Salma, historiadora + asistente de viajes.

CAPACIDADES:
- Responder sobre CUALQUIER tema
- Modo historia: narrar épocas con detalle
- Modo viaje: aconsejar sobre destinos
- Sugerir imágenes/videos que ilustren tu respuesta

FORMATO DE RESPUESTA:
{
  "text": "Respuesta en texto",
  "voice_enabled": true,
  "images": [
    {
      "url": "...",
      "caption": "Cleopatra busto del Museo Británico"
    }
  ],
  "videos": [
    {
      "url": "...",
      "duration_seconds": 30,
      "caption": "Construcción de la Bastilla (recreación)"
    }
  ],
  "follow_up": "¿Quieres saber más sobre esto?"
}
```

### Sugerencias contextuales

En 💬 SALMA:

```
SUGERENCIAS RÁPIDAS (según contexto):
├─ Si user pregunta sobre lugar geolocalizado:
│  "📚 Hay historia de este lugar"
│  [Botón que abre historia si existe]
│
└─ Si user está en ruta de viaje:
   "📍 Las paradas de tu ruta tienen historias"
   [Filtro: solo historias de mis paradas]
```

---

## 🗺️ INTEGRACIONES: Ruta Híbrida

Cuando user crea/abre ruta en 🗺️ VIAJES:

```
Parada: Hanoi Old Quarter
├─ [VIAJE] Hotel, transporte, horarios
└─ [HISTORIA] Auto-link
   └─ "📚 Hanoi: 1000 años de historia"
      [Botón para leer]
```

**Lógica:**
1. User crea parada con `place_id` (Google Places)
2. Backend busca en historias: ¿existe historia para este `place_id`?
3. Si existe → muestra en la parada
4. User puede: leer, o filtrar todas sus historias por "mis paradas"

---

## 📊 PROPUESTA 7: Timeline Compartible

**Trigger:** En vista de historia, botón "Crear timeline visual"

```
[BOTÓN] "📊 Crear timeline visual"
  ↓
Canvas genera imagen hermosa:
┌─────────────────────────────────┐
│ VIETNAM: De Colonia a Nación    │
│                                 │
│ 1862 ◆ Invasión francesa        │
│ 1910 ◆ Hanoi colonial           │
│ 1954 ◆ Independencia            │
│ 1975 ◆ Reunificación            │
│                                 │
│ Creado con Salma Historiadora   │
│ borradodelmapa.com              │
└─────────────────────────────────┘
  ↓
Opciones de compartir:
├─ 📸 Instagram (imagen 1080x1350)
├─ 🐦 Twitter (hilo automático)
├─ 📱 WhatsApp (PDF)
└─ 🔗 Copiar link (timeline interactiva online)
```

---

## 💾 ESTRUCTURA FIRESTORE

### Colecciones nuevas

```
firestore
├── histories/ (oficial, creada por Paco)
│   └─ doc_id: {
│      "id": "vietnam-1862-1975",
│      "title": "...",
│      "description": "...",
│      // ... (mismo JSON que KV)
│   }
│
└── community_histories/ (de usuarios, FASE 5)
    └─ doc_id: {
       "author_id": "user123",
       "title": "Revolución Haití",
       "content": "...",
       "price": 0.99,
       "purchases": 3,
       "rating": 4.8,
       "status": "published",
       "stripe_product_id": "prod_...",
       "created_at": timestamp
    }
```

### Relaciones (índices para búsqueda)

```
Index: histories by location
├─ Collection: histories
├─ Fields: location.lat (ASC), location.lng (ASC)
└─ Usado para: búsqueda geolocalizada

Index: community_histories by rating
├─ Collection: community_histories
├─ Fields: rating (DESC), created_at (DESC)
└─ Usado para: ranking de popularidad
```

---

## 🔌 API Worker (Nuevas rutas)

### `/api/history/*`

```
GET /api/history/search?q=vietnam
→ Devuelve historias que coinciden

GET /api/history/{id}
→ Devuelve historia completa + paradas

GET /api/history/nearby?lat=21.0285&lng=105.8542&radius=5000
→ Devuelve historias cercanas (geolocalización)

POST /api/history/{id}/images
→ Devuelve imágenes contextuales para Claude
```

### `/api/timeline/*`

```
POST /api/timeline/generate
{
  "history_id": "vietnam-1862-1975",
  "style": "minimalist",
  "year_from": 1862,
  "year_to": 1975
}
→ Devuelve PNG + URL interactiva
```

### `/api/community/*` (FASE 5)

```
POST /api/community/publish
→ Publica historia de usuario

POST /api/community/purchase
→ Procesa pago vía Stripe

GET /api/community/{id}
→ Devuelve historia de comunidad
```

---

## 🎨 DISEÑO / UX

### Colores y diferenciación

```
🗺️ VIAJES:       Naranja/Marrón (#D97706, #92400e)
📚 HISTORIA:     Azul/Dorado (#2563EB, #F59E0B)
💬 SALMA:        Rosa/Púrpura (#EC4899, #7C3AED)
```

### Tipografía

```
Títulos (h1):    Font-weight 700, size 1.875rem
Subtítulos (h2): Font-weight 600, size 1.5rem
Cuerpo:          Font-weight 400, size 1rem
Etiquetas:       Font-weight 500, size 0.875rem
```

### Iconografía

```
🗺️  Viajes
📚  Historias
💬  Chat/Salma
🎤  Voz
👀  Imágenes
🔗  Enlaces
⏱️  Duración
📍  Ubicación
⭐  Rating
```

---

## 🚀 ROADMAP MVP (4 Semanas)

### FASE 1: Setup (Semana 1)
- [ ] Crear estructura carpetas
- [ ] Crear Firestore collections
- [ ] Extender KV para historias
- [ ] Actualizar sistema de prompts de Salma

### FASE 2: Histórias básicas (Semanas 2-3)
- [ ] UI: Vista de historia + paradas
- [ ] UI: Timeline interactivo (canvas)
- [ ] Backend: Rutas `/api/history/*`
- [ ] Importar 5-10 historias iniciales (Vietnam, Bangkok, etc)
- [ ] Ruta Híbrida: Auto-link historias a paradas de viajes

### FASE 3: Salma Multimodal + Características (Semana 3-4)
- [ ] Web Speech API: input/output de voz
- [ ] Imágenes contextuales en chat
- [ ] Geolocalización: "Historias cerca de ti"
- [ ] Timeline compartible (Canvas + Social share)

### FASE 4: Pulido (Semana 4)
- [ ] Testing en móvil
- [ ] Performance (Lighthouse)
- [ ] Deploy a producción

---

## 📱 MOBILE-FIRST

Todas las vistas responsive:

```
Desktop (1024px+):
├─ Tab bar en header
├─ 2 columnas (historia + detalles)
└─ Timeline horizontal

Tablet (768px-1023px):
├─ Tab bar en header
├─ Stack vertical adaptado
└─ Timeline deslizable

Mobile (<768px):
├─ Tab bar full-width (bottom)
├─ Stack vertical completo
├─ Imágenes 100% ancho
└─ Timeline deslizable horizontal
```

---

## ⚠️ RESTRICCIONES Y CONSIDERACIONES

### Mantener intacto:
- `index.html` estructura base (solo añadir pestañas)
- `app.js` lógica de viajes (no tocar)
- `salma-worker-v1-final.js` Worker actual (extender, no quebrar)
- Firebase Auth + Firestore setup actual

### Nuevo código:
- `salma-historiadora.js` (módulo de historias)
- `salma-multimodal.js` (voz + imágenes)
- `styles-historia.css` (estilos de historia)
- Rutas Worker nuevas (no conflictuar con existentes)

### Security:
- Historias comunitarias: moderación antes de publicar (FASE 5)
- Pagos: Stripe server-side (no exponer keys en frontend)
- Geolocalización: solo si user concede permisos

### Performance:
- Imágenes: lazy loading, optimización (WebP)
- Canvas: generar timelines asincronía (no bloquear UI)
- KV: caché de 1 semana para historias

---

## ✅ DEFINICIÓN DE HECHO (MVP)

**MVP está completo cuando:**

1. ✅ Pestaña 📚 HISTORIA funciona (lista + vista + paradas)
2. ✅ Salma responde con voz + imágenes en 💬 SALMA
3. ✅ Geolocalización detecta historias cercanas
4. ✅ Rutas de viaje auto-linklean historias
5. ✅ Timeline compartible en redes
6. ✅ Testing en móvil (iPhone + Android)
7. ✅ Performance OK (Lighthouse >80)
8. ✅ Deployed a producción sin quebrar existente

---

## 📞 PREGUNTAS PARA PACO (antes de empezar)

1. ¿Cuántas historias iniciales? (Recomendación: 10-15)
2. ¿Quiénes son los historiadores? (¿Tú solo? ¿Crowdsourced?)
3. ¿Cuál es el flujo de geolocalización? (¿Siempre activa? ¿Solo en tab Salma?)
4. ¿Cómo validamos historias comunitarias en FASE 5? (Manuales o automático?)

---

## 🔗 REFERENCIAS

- **Documento técnico previo:** `documento-tecnico-salma-v2.txt`
- **Worker actual:** `salma-worker-v1-final.js`
- **Informe de fixes:** `INFORME-FIXES-SALMA-WORKER-V2.md`
- **Competencia:** Humy.ai, Nibble, Hello History

---

**Estado:** 🟢 LISTO PARA CÓDIGO  
**Próximo paso:** Pasar a Claude Code con archivos de implementación
