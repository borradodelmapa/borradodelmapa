# Arquitectura Multi-Agente — Salma

## Problema actual

El worker actual es un monolito: un solo prompt + un solo modelo (gpt-4o-mini) para TODOS los casos.
Esto es subóptimo: una búsqueda de visados no necesita el mismo modelo que generar una ruta de 10 días.

## Propuesta: 4 agentes especializados

```
                    ┌─────────────────────────────────┐
                    │         ROUTER AGENT             │
                    │  Clasifica la intención en <50ms │
                    │  Modelo: gpt-4o-mini (5 tokens)  │
                    └────────────┬────────────────────┘
                                 │
          ┌──────────┬──────────┼──────────┬──────────┐
          ▼          ▼          ▼          ▼          ▼
      [KV-DIRECT] [INFO]    [ROUTE]   [SERVICE]  [EMERGENCY]
      0 tokens   Haiku     Sonnet    gpt-4o-mini  Sonnet
      <50ms      ~1s       ~10s      ~3s          ~5s
```

### Agente 0 — KV Direct (0 coste)
- Trigger: pregunta factual con país identificado en KV
- Ejemplos: visados, moneda, emergencias, clima, coste
- Fuente: `tryKVDirectAnswer()` — ya implementado
- Sin llamada a IA

### Agente 1 — Info (Claude Haiku)
- Trigger: preguntas de información sin ruta, sin servicio
- Ejemplos: "qué ver en X", "cuándo ir a Y", "qué comer en Z"
- Modelo: claude-haiku-4-5 (~3x más barato que Sonnet)
- Max tokens: 1500
- Sin tools

### Agente 2 — Route (Claude Sonnet o gpt-4o-mini)
- Trigger: petición de ruta con A+B+C+D
- Modelo: claude-sonnet-4-6 (mejor para rutas coherentes) o gpt-4o-mini (más barato)
- Max tokens: 6000
- Tools: buscar_foto, buscar_web
- Post-process: KV enrichment + coords verify

### Agente 3 — Service (gpt-4o-mini)
- Trigger: vuelos, hoteles, coches, restaurantes
- Modelo: gpt-4o-mini
- Max tokens: 3000
- Tools: buscar_vuelos, buscar_hotel, buscar_coche, buscar_restaurante

### Agente 4 — Emergency (Claude Sonnet)
- Trigger: emergencias, accidentes, robos, salud
- Modelo: claude-sonnet-4-6 (más fiable para situaciones críticas)
- Max tokens: 2000
- Sin tools (velocidad)

## Implementación

### Fase 1: Router (ya implementable)
El router es una función `classifyIntent()` que categoriza el mensaje:

```javascript
function classifyIntent(message, history, kvData) {
  // Orden de prioridad:
  if (isEmergency(message))     return 'emergency';
  if (isServiceRequest(message)) return 'service';
  if (isRouteRequest(message, history)) {
    if (hasAllRouteParams(message, history)) return 'route';
    return 'route_missing_params'; // pregunta C+D
  }
  if (kvData && tryKVDirectAnswer(message, kvData)) return 'kv_direct';
  return 'info';
}
```

### Fase 2: Model selector
```javascript
const MODEL_MAP = {
  kv_direct:           null,               // sin modelo
  info:                'claude-haiku-4-5', // barato
  route:               'claude-sonnet-4-6',// calidad
  service:             'gpt-4o-mini',      // rápido
  emergency:           'claude-sonnet-4-6',// fiable
  route_missing_params: 'gpt-4o-mini',     // 1 pregunta
};
```

### Fase 3: Token limits por agente
```javascript
const TOKEN_MAP = {
  info:      1500,
  route:     6000,
  service:   3000,
  emergency: 2000,
};
```

## Ahorro estimado

Distribución esperada de requests:
- 40% info → Haiku (~3x más barato que gpt-4o-mini)
- 20% kv_direct → 0 coste
- 25% service → gpt-4o-mini (igual que ahora)
- 10% route → Sonnet (más caro, pero solo 10%)
- 5% emergency → Sonnet

Coste actual (100% gpt-4o-mini):
- 1000 requests × ~1500 tokens promedio × $0.15/1M = **$0.225/día**

Con multi-agente:
- KV direct: 200 × $0 = $0
- Info (Haiku): 400 × 1500t × $0.025/1M = $0.015
- Service (gpt-4o): 250 × 2000t × $0.15/1M = $0.075
- Route (Sonnet): 100 × 5000t × $3/1M = $0.30
- Emergency (Sonnet): 50 × 1500t × $3/1M = $0.225

Total estimado: ~**$0.12-0.15/día** (ahorro ~35-45%)

## Estado de implementación

| Componente | Estado | Notas |
|---|---|---|
| `classifyIntent()` | ✅ Existe (disperso) | Refactorizar en función limpia |
| `tryKVDirectAnswer()` | ✅ Implementado | Funciona en producción |
| KV enrichment | ✅ Implementado | Post-proceso de rutas |
| Model selector | ❌ Pendiente | Todo usa gpt-4o-mini |
| Token limits por agente | ❌ Pendiente | Fijo en 6000/3000 |
| Haiku para info | ❌ Pendiente | |
| Sonnet para rutas | ❌ Pendiente | Valorar coste/calidad |

## Próximos pasos (para Paco aprobar)

1. Crear `classifyIntent()` limpia en el worker
2. Añadir lógica de selección de modelo según intent
3. Ajustar token limits
4. A/B test: Haiku vs gpt-4o-mini para info (calidad similar, precio diferente)
