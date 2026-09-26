# Arquitectura Firebase y reglas de Firestore

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

## Arquitectura Firebase

- **Auth**: Email/contraseña + Google Sign-In + WebAuthn/fingerprint (parcial — solo recuerda email)
- **Firestore colecciones**:

| Colección | Acceso | Contenido |
|-----------|--------|-----------|
| `users/{uid}` | Owner read/write, **salvo** `premium_until`, `isPremium`, `coins_saldo`, `rutas_gratis_usadas` (solo el Worker, desde 21 sept 2026) | Perfil: name, email, isPremium, coins_saldo, rutas_gratis_usadas, avatarURL, sos_config, copilot_data |
| `users/{uid}/maps/{mapId}` | Owner only | Guías guardadas (itinerarioIA, slug, published, enriched, photos, notes) |
| `users/{uid}/fotos/{fotoId}` | Owner only | Galería de fotos (url, r2Key, albumId) |
| `users/{uid}/albumes/{albumId}` | Owner only | Álbumes de fotos |
| `users/{uid}/notas/{notaId}` | Owner only | Notas (texto, tipo, countryCode, fechaRecordatorio, files, completado) |
| `users/{uid}/pins/{pinId}` | Owner only | Pins del diario |
| `users/{uid}/map_pins/{pinId}` | Owner only | Pins de foto→mapa y tap sheet |
| `users/{uid}/travel_docs/{docId}` | Owner only | Documentos del viajero (name, category, files, expiresAt, notes) |
| `users/{uid}/paises/{paisId}` | Owner only | Legacy — migrado automáticamente a notas |
| `public_guides/{slug}` | Read: public / Write: auth (⚠ SIN ownership check) | Guías públicas SEO |
| `config/salma-prompt` | Read: auth / Write: blocked | Prompt dinámico (gestionado via Worker admin) |
| `admin_logs/{logId}` | Auth required | Logs de uso del Worker |
| `url_validation_incidents/{id}` | Read: auth / Create: auth (solo alta) | Sustituciones de enlaces Maps rotos (Bloque E) |
| `beta_feedback/{id}` | Read: auth / Create: auth (solo alta) | Feedback de testers: nota + logs del panel 🐛 + versión, mandado desde `POST /beta-feedback` |
| `shared_routes/{id}` | Read: auth / Write: solo el dueño | Ruta compartida desde el botón Compartir de la vista de itinerario — a diferencia de `public_guides`, exige login para verse. Mismo id que la guía en `users/{uid}/maps/`. **Regla YA DESPLEGADA (comprobado 21 sept 2026 leyendo `shared_routes/prueba-lectura` con sesión: devuelve "no existe" sin `permission-denied`; se publicó con el `firebase deploy` del paso 1 de pagos, que sube el fichero entero).** |

- **Regla importante**: `const db` solo se inicializa en `app.js`, nunca duplicado
- Firebase se inicializa en el `<head>` del `index.html`

### Firestore Rules actuales

```
users/{userId}/**              → read/write: auth.uid == userId
public_guides/{slug}           → read: true, write: auth != null (⚠ sin ownership)
config/{doc}/**                → read: auth, write: false
admin_logs/{logId}             → read/write: auth
url_validation_incidents/{id}  → read: auth, create: auth (solo alta, sin editar/borrar)
beta_feedback/{id}             → read: auth, create: auth (solo alta, sin editar/borrar)
shared_routes/{id}             → read: auth, create/update/delete: solo el dueño (uid) — DESPLEGADA (comprobado 21 sept 2026)
```

---


