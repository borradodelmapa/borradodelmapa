// Entradas del blog de Nepal (ver scripts/datos-pais.cjs). «orden» = posición en el blog: menor sale antes.
const W = (t, u) => ({ t, u });

module.exports = [
  // Short 9:16 · Pueblos T2 · montaje: salma marketing/pueblos/mustang (v9, ULTIMA) · guion: docs/pueblos-ep-mustang-guion-direccion.md · textos: pueblos/mustang/textos-short.md
  // YouTube jue 3 dic 2026 (T36: cada vídeo con su entrada). Sin precio del permiso: las fuentes de 2026 no coinciden.
  {
    orden: 172,
    slug: 'mustang-nepal-secretos-del-himalaya-10000-cuevas',
    fecha: '2026-12-03',
    serie: 'Pueblos borrados del mapa',
    cap: 'Nepal',
    pais: 'Nepal',
    titulo: 'Mustang, secretos del Himalaya: 10.000 cuevas',
    resumen: 'En los acantilados de Mustang, en Nepal, hay unas diez mil cuevas excavadas, y la región estuvo cerrada a los extranjeros hasta 1992. Pegado al Tíbet, tuvo rey hasta 2008 y aún practica el entierro celeste.',
    video: 'pueblos-mustang.mp4',
    realidad: 'Capítulo documental narrado por Salma con fotos de Wikimedia Commons y vídeo de dron con licencia libre (autores al final). No hemos estado en Mustang: cada dato sale de las fuentes que citamos.',
    creditosDe: 'salma marketing/pueblos/mustang',
    creditosExtra: [['Vídeo: BK1, «Upper Mustang Drone View»', 'CC BY', 'https://www.youtube.com/watch?v=WR0VArckBCc']],
    fotos: { portada: 'W15', galeria: [
      ['W12', 'Paisaje del Alto Mustang, en Chhoser.'],
      ['W122', 'Chhoser, en el Alto Mustang.'],
      ['W488', 'Monjes ante un monasterio de Lo Manthang.'],
      ['W449', 'De camino a Lo Manthang.'],
      ['W902', 'El cañón hacia la cueva de Chungsi.'],
      ['W493', 'Una pintora en Lo Manthang.'],
    ] },
    cifras: [['10.000', 'Cuevas excavadas'], ['1992', 'Cerrado a extranjeros hasta'], ['1380', 'Fundación de Lo Manthang']],
    story: {
      portada: 'W455',
      slides: [
        { foto: 'W15', h: '10.000 cuevas', t: 'En los acantilados de Mustang, en Nepal, hay unas diez mil cuevas excavadas.', credito: ['Nabin K. Sapkota', 'CC BY-SA 4.0'] },
        { foto: 'W455', h: 'Cerrado hasta 1992', t: 'Mustang estuvo cerrado a los extranjeros hasta 1992.', credito: ['Anton Gutmann', 'CC BY-SA 4.0'] },
        { foto: 'W481', h: 'Lo Manthang', t: 'Pegado al Tíbet, su capital amurallada se fundó en 1380. Tuvo rey hasta 2008.', credito: ['Gerd Eichmann', 'CC BY-SA 4.0'] },
        { foto: 'W126', h: 'Tumbas', t: 'Las cuevas más antiguas eran tumbas de hace más de dos mil años.', credito: ['Nabin K. Sapkota', 'CC BY-SA 4.0'] },
        { foto: 'W493', h: 'Manuscritos', t: 'Las cuevas también guardaban manuscritos budistas y bon, iluminados a mano.', credito: ['Gerd Eichmann', 'CC BY-SA 4.0'] },
        { foto: 'W902', h: 'Para entrar', t: 'El Alto Mustang es zona restringida: hace falta un permiso especial y un guía con licencia.', credito: ['Jean-Marie Hullot', 'CC BY 2.0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'Un reino cerrado', foto: ['W455', 'Una mujer con ropa tradicional tibetana.'], p: [
        '**Mustang**, en el norte de Nepal, estuvo **cerrado a los extranjeros hasta 1992**. Está pegado al Tíbet, y su capital amurallada, **Lo Manthang**, se fundó en **1380**. Tuvo rey hasta **2008**, cuando Nepal abolió la monarquía.',
      ], enlaces: [['Alto Mustang', '/destinos/upper-mustang-nepal.html'], ['Nepal', '/destinos/nepal.html']] },
      { h: 'Diez mil cuevas', foto: ['W126', 'Cuevas en las paredes de roca de Chhoser, en el Alto Mustang.'], p: [
        'En sus acantilados hay **unas diez mil cuevas** excavadas a mano. Las más antiguas eran **tumbas de hace más de dos mil años**. Otras se usaron como casas, almacenes o lugares de meditación.',
        'Y guardaban algo más: **manuscritos budistas y bon**, iluminados a mano.',
      ] },
      { h: 'El entierro celeste', foto: ['W901', 'Un buitre leonado del Himalaya en vuelo, en el oeste de Nepal.'], p: [
        'En Mustang aún se practica el **entierro celeste**: el cuerpo de los muertos se deja a los buitres.',
      ] },
      { h: 'Mustang hoy', foto: ['W481', 'Lo Manthang desde un tejado.'], p: [
        'Hoy le llega una **carretera desde China**. Para entrar en el Alto Mustang hace falta un **permiso especial** y un **guía con licencia**. No damos el precio del permiso: las fuentes de 2026 no coinciden, así que confírmalo antes de ir.',
      ], enlaces: [['Alto Mustang', '/destinos/upper-mustang-nepal.html']] },
    ],
    cierre: 'Datos de noviembre de 2026: confírmalos antes de ir.',
    nota: 'Datos revisados en noviembre de 2026. Las «diez mil cuevas» son una estimación que repiten las fuentes; no hay un recuento exacto.',
    fuentes: [
      W('Wikipedia: Upper Mustang', 'https://en.wikipedia.org/wiki/Upper_Mustang'),
      W('Wikipedia: Mustang Caves', 'https://en.wikipedia.org/wiki/Mustang_Caves'),
      W('National Geographic: las cuevas de Mustang', 'https://www.nationalgeographic.com/adventure/article/110301-himalayas-caves-defleshed-skeletons-science-nepal-mustang'),
    ],
  },
];
