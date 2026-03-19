# 🌍 Salma Knowledge Base — Nivel 1

Generador automático de fichas de viaje para todos los países del mundo.
Alimenta a Salma con conocimiento real de cada destino.

## Estructura

```
salma-knowledge-base/
├── countries.json       ← 195 países con código y nombre
├── generate.js          ← Genera fichas llamando a Claude API
├── upload-kv.js         ← Sube fichas a Cloudflare KV
├── stats.js             ← Muestra progreso de generación
├── .env.example         ← Plantilla de variables de entorno
├── .env                 ← TUS claves (no subir a git)
└── output/              ← Fichas generadas (un JSON por país)
    ├── vn.json
    ├── th.json
    └── ...
```

## Uso rápido

### 1. Configurar

```bash
cp .env.example .env
# Editar .env con tu API key de Anthropic
```

### 2. Generar fichas

```bash
# Ver el prompt sin gastar API
node generate.js --dry-run

# Generar un país de prueba
node generate.js --country vietnam

# Generar TODOS los pendientes (≈195 llamadas, ≈5 min)
node generate.js

# Ver progreso
node stats.js
```

### 3. Subir a Cloudflare KV

```bash
# Primero: crear namespace KV en Cloudflare Dashboard
# Luego: añadir credenciales CF al .env

# Preview sin subir
node upload-kv.js --dry-run

# Subir todo
node upload-kv.js
```

## Coste estimado

- ~195 llamadas × ~1500 tokens output ≈ 300K tokens
- Con Claude Sonnet: ~$0.90 total
- Ejecución única (+ re-ejecución para fallidos)

## Claves KV generadas

| Clave | Contenido |
|-------|-----------|
| `dest:vn:base` | Ficha completa de Vietnam |
| `dest:th:base` | Ficha completa de Tailandia |
| `kw:hanoi` | → `vn` (índice de búsqueda) |
| `kw:bangkok` | → `th` (índice de búsqueda) |

## Siguiente paso: Nivel 2

Para destinos populares, generar bloques detallados:
- `dest:vn:transporte`
- `dest:vn:alojamiento`
- `dest:vn:comida`
- etc.

Estos se generarían con un prompt diferente y más largo, 
inyectando la ficha base como contexto.
