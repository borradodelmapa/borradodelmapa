// Diarios de viaje del blog. Desde el 5 nov 2026 cada entrada vive en la carpeta de SU PAÍS: scripts/paises/<país>/historias.js
// (ver scripts/datos-pais.cjs). Este fichero solo guarda las series y junta las entradas de todos los países por «orden».
// Los textos salen de la voz de cada vídeo (salma marketing/*/cfg-*.json) y de docs/serie-asia-fuentes.md,
// docs/serie-vietnam-cap1.md, -cap2.md y -hilos.md. Dato nuevo = fuente anotada allí primero.
// El generador es scripts/build-blog-viajes.js (npm: node scripts/build-blog-viajes.js).

const SERIES = {
  'Tailandia en moto': { sub: 'Chiang Mai, el Triángulo de Oro, la carretera de las 762 curvas y el bucle de Mae Hong Son, en moto. Y un especial de Muay Thai en Ko Samui.' },
  'Vietnam': { sub: 'De mil años de resistencia a Hồ Chí Minh: cinco capítulos y un documental para entender el país antes de recorrerlo.' },
  'Pueblos borrados del mapa': { sub: 'Pueblos, oficios y costumbres que están desapareciendo, contados con datos y fuentes. Y cómo visitarlos con respeto.' },
  'Conoce cada país': { sub: 'La introducción de cada país: geografía, historia y culturas para entender lo que vas a ver. Con fuentes.' },
  'Guías': { sub: 'Nuestras guías de viaje, día a día, con la historia de cada sitio.' },
};

const caps = require('./datos-pais.cjs').historias();
caps.SERIES = SERIES;
module.exports = caps;
