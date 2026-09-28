# Entorno de pruebas online (Claude Code en la nube) — 28 sept 2026

Paco: "a partir de ahora haz las pruebas en la web online". Las pruebas simuladas no bastan: el 28 sept
pasaban en simulación y fallaban en el móvil (ver "Estado" abajo).

## 1. Configuración que hace Paco (una vez)

### a) Red del entorno
Menú del entorno de la nube (título de la sesión → **Edit** → **Network access**): nivel de acceso más amplio,
o añadir a los dominios permitidos:

```
borradodelmapa.com
salma-api.borradodelmapa-api.workers.dev
identitytoolkit.googleapis.com
securetoken.googleapis.com
firestore.googleapis.com
www.gstatic.com
maps.googleapis.com
maps.gstatic.com
fonts.googleapis.com
fonts.gstatic.com
```

### b) Usuario de prueba (email + contraseña)
La web solo tiene "Entrar con Google" y Google bloquea los logins automáticos. Por eso:
1. Consola de Firebase → **Authentication → Sign-in method** → activar **Email/Password**
   (la web sigue mostrando solo Google; esto solo permite entrar por detrás al usuario de prueba).
2. **Authentication → Users → Add user**: p. ej. `prueba-salma@borradodelmapa.com` + contraseña.

### c) Credenciales en el entorno (NUNCA en el chat ni en el repo)
Mismo menú del entorno → variables de entorno:
- `TEST_EMAIL` = el email del usuario de prueba
- `TEST_PASSWORD` = su contraseña

Las variables y la red nuevas suelen necesitar **sesión nueva**.

## 2. Cómo prueba Claude (en la sesión nueva)
1. Comprobar red: `curl -s -o /dev/null -w "%{http_code}" https://borradodelmapa.com/` → 200.
2. Chromium ya está instalado (Playwright, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; no ejecutar
   `playwright install`). Abrir borradodelmapa.com con viewport de móvil.
3. Entrar con el usuario de prueba desde la consola de la página:
   `await firebase.auth().signInWithEmailAndPassword(process.env.TEST_EMAIL, process.env.TEST_PASSWORD)`
   (se pasa desde Playwright con `page.evaluate`, sin escribir la contraseña en ningún fichero).
4. Pulsar "Nueva", escribir a Salma como un usuario, esperar a que termine y **capturar pantalla** + leer el
   texto final de la burbuja. Eso es lo que ve Paco, no lo que manda el Worker.
5. Antes de cada ronda: decir a Paco cuántos mensajes y el coste estimado (§8).

**Coste (§8):** cada mensaje real gasta Claude (≈2-4 cént.) y Google (0-6 cént.). Ronda de 8 pruebas ≈ 30-60 cént.

## 3. Estado al cerrar la sesión del 28 sept (para seguir)
Worker en producción: `47954335-a73b-4358-bd0c-34ef98bd59eb` (PR #32). Marcha atrás posible:
`912c7a64-cec0-4b10-bca0-241dcafe812b` (PR #31). Estudio y decisiones: `docs/estudio-llamadas-google.md`.

**Funciona (confirmado por Paco en la app):** "¿Cómo te llamas?" sin enlace; "¿Cómo llego a la Alhambra?"
→ respuesta corta con 🗺️ Cómo llegar (atajo sin Claude).

**Falla (Paco, versión 47954335):** "cómo llego a la Alhambra en camper" → consejos pero sin el enlace de la
Alhambra ni la frase "pídemelo"; después "dónde comer en Triana" → sin frase.

**Causa (reproducida en simulación con la lógica del móvil):** no es el Worker, es `salma.js` (evento `done`,
~línea 1926). El móvil solo sustituye el texto en directo por `evt.reply` (la versión final corregida) si:
la final trae un enlace de Maps que el directo no traía, o es 20+ caracteres más larga, o el directo tenía
URLs y la final ninguna. Cuando Salma copia en su texto los enlaces de Maps de buscar_lugar (parkings…),
ninguna se cumple → el móvil enseña el texto en directo y tira la versión final (con el enlace de la Alhambra
y la frase). La frase sí queda en el historial, por eso en el mensaje siguiente el Worker ya no la repite.

**Arreglo propuesto, pendiente del OK de Paco:** en `salma.js`, al llegar `done`, mostrar SIEMPRE `evt.reply`
si es distinto del texto en directo (es la versión buena y la que ya se guarda en el historial). Subir `?v=` de
`salma.js` en `index.html`. No toca el Worker. Probarlo en la web real con el usuario de prueba antes de darlo
por bueno.

**Pendiente después:** entrega 2 (proteger los accesos que llaman a Google sin cuenta: límite por visitante,
narrador con cuenta) — ver `docs/estudio-llamadas-google.md`.
