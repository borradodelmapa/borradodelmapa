# 🚀 QUICK START - Salma Historiadora

**TL;DR:** Estás aquí → Pasas a Claude Code → Implementa MVP en 4 semanas

---

## 📦 QUÉ TIENES

4 documentos listos para Claude Code:

1. **BRIEF-SALMA-HISTORIADORA-V1.md** ← El qué y por qué
2. **CHECKLIST-ARCHIVOS.md** ← Qué crear y modificar
3. **INSTRUCCIONES-CLAUDE-CODE.md** ← Paso a paso (muy detallado)
4. **historias-init.json** ← Datos iniciales (5-10 historias)

---

## 🎯 EL PLAN EN 30 SEGUNDOS

```
SEMANA 1: Setup
  ✓ Modificar index.html (añadir pestaña 📚)
  ✓ Crear estructura carpetas
  ✓ Setup Firestore + KV

SEMANA 2-3: Frontend Historia
  ✓ Crear js/salma-historiadora.js
  ✓ Crear styles/historia.css
  ✓ Crear views/historia/*.html
  ✓ Implementar búsqueda + viaje temporal

SEMANA 3-4: Multimodal + Extras
  ✓ Crear js/salma-multimodal.js (voz)
  ✓ Crear js/geolocalization.js (ubicación)
  ✓ Timeline compartible (Canvas)
  ✓ Testing y pulido

RESULTADO: 3 pestañas funcionales
  🗺️ VIAJES (mantener sin cambios)
  📚 HISTORIA (NUEVO)
  💬 SALMA (mejorado con voz)
```

---

## 📋 ARCHIVOS A CREAR (9 nuevos)

```
js/
├─ salma-historiadora.js      ← Lógica de historias
├─ salma-multimodal.js        ← Voz + imágenes
├─ timeline-generator.js      ← Canvas para timelines
└─ geolocalization.js         ← Detección ubicación

styles/
└─ historia.css               ← Estilos de historia

views/historia/
├─ lista.html                 ← Listado de historias
└─ viaje-temporal.html        ← Modo temporal

data/
└─ historias-init.json        ← Datos iniciales

worker/
└─ salma-worker-v2.js         ← Nuevas rutas API
```

---

## ✏️ ARCHIVOS A MODIFICAR (3 existentes)

```
index.html     ← Añadir pestaña 📚
app.js         ← Añadir router y init
styles.css     ← Importar historia.css
```

---

## 🔗 FLUJO PARA CLAUDE CODE

### Paso 1: Leer documentos
1. Lee **BRIEF** (15 min)
2. Lee **CHECKLIST** (10 min)
3. Lee **INSTRUCCIONES** (30 min)

### Paso 2: Empezar implementación
1. Sigue **INSTRUCCIONES paso a paso**
2. Crea archivos en el orden sugerido
3. Commit después de cada sección

### Paso 3: Testing
1. Abre `index.html` en navegador
2. Prueba cada pestaña
3. Verifica móvil

### Paso 4: Deploy
```bash
git push origin main
```

---

## 🎨 VISUAL DEL RESULTADO

```
ANTES:
┌──────────────────────────┐
│ 🗺️ VIAJES | 💬 SALMA     │
└──────────────────────────┘

DESPUÉS:
┌────────────────────────────────┐
│ 🗺️ VIAJES | 📚 HISTORIA | 💬 SALMA │
└────────────────────────────────┘
```

---

## 💡 CARACTERÍSTICAS MVP

### Pestaña 📚 HISTORIA
- ✅ Listado de historias (Vietnam, Bangkok, Francia, etc)
- ✅ Búsqueda por palabra clave
- ✅ Viaje temporal parada a parada
- ✅ Timeline interactivo
- ✅ Documentos históricos
- ✅ Preguntas a personajes (próximamente)

### Pestaña 💬 SALMA (mejorada)
- ✅ Chat libre (como ahora)
- ✅ Input voz (micrófono)
- ✅ Output voz (narración de Salma)
- ✅ Imágenes contextuales mientras narra
- ✅ Sugerencias de historias cercanas (geo)

### Extras
- ✅ Timeline compartible (redes sociales)
- ✅ Ruta Híbrida (historias auto-linkeadas a paradas de viaje)
- ✅ Geolocalización: "Historias cerca de ti"

---

## 🔑 KEY DETAILS

**Stack:** Vanilla JS (no frameworks)  
**Base de datos:** Firebase Firestore + Cloudflare KV  
**Worker:** Nuevo Worker v2 (NO tocar v1)  
**Mobile first:** Responsive desde el inicio  
**No quebrar:** Mantener 100% compatible con viajes existentes  

---

## 📞 PREGUNTAS FRECUENTES

**¿Tengo acceso al repo?**  
Sí. GitHub: `borradodelmapa/borradodelmapa` (privado)

**¿Cuánto tarda?**  
MVP: 4 semanas (2 horas/día promedio)  
Fases 4-5 (comunidad + pago): 3 semanas más

**¿Qué si algo se quiebra?**  
Git revert, pregunta a Paco, continúa.

**¿Necesito ElevenLabs para voz?**  
No. Web Speech API es suficiente (gratis, nativo del navegador).

**¿Y después del MVP?**  
Queda FASE 4-5 (comunidad + monetización), pero es código más avanzado.

---

## ✅ ANTES DE PASAR A CLAUDE CODE

- [ ] Has leído todos estos documentos
- [ ] Entiendes la arquitectura (Firestore + Worker + Frontend)
- [ ] Sabes qué archivos crear/modificar
- [ ] Tienes acceso a repo + Firebase + Cloudflare
- [ ] ¿Listo? → Abre Claude Code y empieza

---

## 🚦 STATUS

```
📋 Brief:            ✅ LISTO
📂 Estructura:       ✅ DEFINIDA
📝 Historias:        ✅ PLANTILLA LISTA
🔧 Code Structure:   ✅ DETALLADA
🚀 Ready for Code:   ✅ 100%

Siguiente: PASAR A CLAUDE CODE
```

---

## 🎯 AL TERMINAR

Tendrás:

✅ Borrado del Mapa con 3 pestañas funcionales  
✅ Salma como historiadora conversacional  
✅ Voz + imágenes + timelines compartibles  
✅ Geolocalización inteligente  
✅ Sin quebrar código existente  
✅ MVP listo para usuarios  

---

## 🎪 LO CHULO DEL PROYECTO

- **Diferenciador único:** Nadie hace "viajes en el tiempo" + "historias conversacionales" + "voz" + "en un lugar real"
- **Salma como marca:** Ya tienes identidad (andaluza, personal, viajera)
- **Monetización lista:** Bundles + comunidad + viajes
- **Sin competencia directa:** Humy es educativo, Nibble es podcasts, tú eres "viajero historiador"

---

**¡Listo! Siguiente paso: Claude Code 🚀**
