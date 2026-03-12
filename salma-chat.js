window.SALMA_API = "https://salma-api.paco-defoto.workers.dev";
let salmaHistory = [];

function salmaToggle() {
  const chat = document.getElementById("salma-chat");
  chat.classList.toggle("open");
  if (chat.classList.contains("open")) document.getElementById("salma-input").focus();
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function salmaAddMsg(text, who) {
  const container = document.getElementById("salma-messages");
  const div = document.createElement("div");
  div.className = "salma-msg " + who;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function salmaRenderRoute(reply) {
  const container = document.getElementById("salma-messages");
  
  // Intentar extraer JSON de la respuesta
  let humanText = "";
  let routeData = null;
  
  // Primero intentar parsear directamente (cuando viene de data.route)
  try {
    const directParse = JSON.parse(reply);
    if (directParse && directParse.stops) {
      routeData = directParse;
    }
  } catch(e) {
    // No es JSON puro, buscar dentro del texto
  }
  
  // Si no se parseó directamente, buscar JSON embebido en texto
  if (!routeData) {
    const jsonMatch = reply.match(/\{[\s\S]*"stops"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        routeData = JSON.parse(jsonMatch[0]);
        humanText = reply.substring(0, reply.indexOf(jsonMatch[0])).trim();
      } catch(e) {
        // JSON no válido, mostrar como texto
      }
    }
  }
  
  // Mostrar texto humano si existe
  if (humanText) {
    const textDiv = document.createElement("div");
    textDiv.className = "salma-msg bot";
    textDiv.textContent = humanText;
    container.appendChild(textDiv);
  }
  
  // Si hay ruta, renderizar tarjetas
  if (routeData && routeData.stops && routeData.stops.length > 0) {
    const routeDiv = document.createElement("div");
    routeDiv.className = "salma-route-card";
    
    let stopsHTML = routeData.stops.map(function(stop) {
      const typeIcons = {city:'🏙',town:'🏘',nature:'🌿',beach:'🏖',mountain:'⛰',temple:'🛕',viewpoint:'📸',route:'🛤',activity:'🎯',other:'📍'};
      const icon = typeIcons[stop.type] || '📍';
      const name = escapeHTML(stop.name || '');
      const desc = escapeHTML(stop.description || '');
      const day = stop.day ? 'Día ' + stop.day : '';
      const mapsUrl = stop.lat && stop.lng ? 'https://www.google.com/maps?q=' + stop.lat + ',' + stop.lng : '';
      
      return '<div style="padding:10px 0;border-bottom:1px solid rgba(212,160,23,.15);">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
          '<span style="font-size:16px;">' + icon + '</span>' +
          '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:#d4a017;letter-spacing:.1em;">' + day + '</span>' +
        '</div>' +
        '<div style="font-size:14px;font-weight:600;color:#fff;margin-bottom:3px;">' + name + '</div>' +
        '<div style="font-size:12px;color:rgba(245,240,232,.7);line-height:1.5;">' + desc + '</div>' +
        (mapsUrl ? '<a href="' + mapsUrl + '" target="_blank" rel="noopener" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:#d4a017;text-decoration:none;margin-top:4px;display:inline-block;">VER EN MAPA →</a>' : '') +
      '</div>';
    }).join('');
    
    const title = escapeHTML(routeData.title || 'Tu ruta');
    const summary = routeData.summary ? '<div style="font-size:12px;color:rgba(245,240,232,.65);margin-bottom:10px;line-height:1.5;">' + escapeHTML(routeData.summary) + '</div>' : '';
    const duration = routeData.duration_days ? routeData.duration_days + ' días' : '';
    const budget = routeData.budget_level && routeData.budget_level !== 'sin_definir' ? ' · ' + routeData.budget_level : '';
    
    let tipsHTML = '';
    if (routeData.tips && routeData.tips.length > 0) {
      tipsHTML = '<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(212,160,23,.2);">' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:#d4a017;letter-spacing:.12em;margin-bottom:6px;">CONSEJOS</div>' +
        routeData.tips.map(function(tip) { return '<div style="font-size:12px;color:rgba(245,240,232,.7);line-height:1.5;margin-bottom:4px;">• ' + escapeHTML(tip) + '</div>'; }).join('') +
      '</div>';
    }
    
    routeDiv.innerHTML = 
      '<div style="background:#111111;border:1px solid rgba(212,160,23,.3);border-radius:14px;padding:14px;max-width:92%;margin-top:8px;">' +
        '<div style="font-family:\'Inter Tight\',sans-serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:4px;">' + title + '</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:#d4a017;letter-spacing:.14em;margin-bottom:8px;">' + duration + budget + '</div>' +
        summary +
        stopsHTML +
        tipsHTML +
        '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button onclick="salmaGuardarRuta()" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;background:#d4a017;color:#0a0908;border:none;border-radius:10px;padding:8px 14px;cursor:pointer;font-weight:700;letter-spacing:.1em;">GUARDAR RUTA</button>' +
          '<button onclick="salmaAddMsg(\'Quiero cambiar algo de la ruta\',\'user\');salmaSend(\'Quiero ajustar la ruta que me propusiste\')" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;background:transparent;color:#d4a017;border:1px solid rgba(212,160,23,.3);border-radius:10px;padding:8px 14px;cursor:pointer;letter-spacing:.1em;">AJUSTAR</button>' +
        '</div>' +
      '</div>';
    
    container.appendChild(routeDiv);
    
    // Guardar datos de la última ruta para poder guardarla
    window._salmaLastRoute = routeData;
  }
  
  container.scrollTop = container.scrollHeight;
}

function salmaGuardarRuta() {
  if (!window._salmaLastRoute) { window.showToast('No hay ruta para guardar'); return; }
  
  // Acceder a Firebase desde scope global
  var user = window._fbAuth ? window._fbAuth.currentUser : null;
  var firedb = window._fbDb;
  
  
  if (!user || !firedb) { 
    // Cerrar el chat de Salma para que no tape el modal de registro
    var chat = document.getElementById("salma-chat");
    if (chat) chat.classList.remove("open");
    
    // Abrir modal de registro
    if (typeof window.openModal === 'function') window.openModal('register');
    window.showToast('Regístrate para guardar tu ruta'); 
    return; 
  }
  
  var r = window._salmaLastRoute;
  var ruta = {
    nombre: r.title || 'Mi ruta',
    destino: r.region || r.country || '',
    dias: r.duration_days || 0,
    desc: r.summary || '',
    itinerarioIA: JSON.stringify(r),
    pois: (r.stops || []).map(function(s, i) {
      return { id: i+1, name: s.name, type: s.type, note: s.description, day: s.day || 1, lat: s.lat, lng: s.lng };
    }),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    published: false
  };
  
  
  firedb.collection('users').doc(user.uid).collection('maps').add(ruta)
    .then(function(docRef) {
      window._salmaLastRoute = null;
      window.showToast('¡Ruta guardada en tu dashboard! ✓');
      // Delay para que Firestore propague
      setTimeout(function() {
        if (window.loadUserMaps) window.loadUserMaps();
      }, 500);
    })
    .catch(function(e) { 
      window.showToast('Error al guardar: ' + e.message); 
      console.error('salmaGuardarRuta error:', e); 
    });
}
window.salmaGuardarRuta = salmaGuardarRuta;

async function salmaSend(overrideMsg) {
  if (window.salmaRateLimitCanSend && !window.salmaRateLimitCanSend()) return;
  const input = document.getElementById("salma-input");
  const msg = overrideMsg || input.value.trim();
  if (!msg) return;

  if (!overrideMsg) {
    salmaAddMsg(msg, "user");
    input.value = "";
  }
  input.disabled = true;

  const typing = salmaAddMsg("Salma está creando tu ruta...", "typing");

  try {
    const res = await fetch(window.SALMA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, history: salmaHistory })
    });
    const data = await res.json();
    typing.remove();

    // DEBUG — borrar después de confirmar que funciona

    if (data.reply) {
      // El Worker ahora envía data.route como JSON separado
      if (data.route && data.route.stops) {
        // Mostrar texto humano
        salmaAddMsg(data.reply, "bot");
        // Renderizar la ruta visualmente
        salmaRenderRoute(JSON.stringify(data.route));
      } else if (data.reply.includes('"stops"')) {
        // Fallback: parsear JSON del texto (compatibilidad)
        salmaRenderRoute(data.reply);
      } else {
        salmaAddMsg(data.reply, "bot");
      }
      // Guardar en historial el texto completo para contexto
      const fullReply = data.route ? data.reply + "\n---JSON---\n" + JSON.stringify(data.route) : data.reply;
      salmaHistory.push({ role: "user", content: msg });
      salmaHistory.push({ role: "assistant", content: fullReply });
      if (salmaHistory.length > 20) salmaHistory = salmaHistory.slice(-20);
    } else {
      salmaAddMsg("Uy, algo ha fallado. ¿Puedes repetir?", "bot");
    }
  } catch (err) {
    typing.remove();
    salmaAddMsg("No puedo conectar ahora mismo. Inténtalo en un momento.", "bot");
  }

  input.disabled = false;
  input.focus();
}

// Hero integration: enviar desde el input del hero y abrir el chat
function salmaHeroSend() {
  const heroInput = document.getElementById("salma-hero-input");
  const msg = heroInput.value.trim();
  if (!msg) return;
  
  // Abrir el chat de Salma
  const chat = document.getElementById("salma-chat");
  if (!chat.classList.contains("open")) chat.classList.add("open");
  
  // Poner el mensaje en el chat y enviar
  salmaAddMsg(msg, "user");
  heroInput.value = "";
  
  // Disparar el envío
  const salmaInput = document.getElementById("salma-input");
  salmaInput.value = msg;
  salmaSend(msg);
}
window.salmaHeroSend = salmaHeroSend;

function salmaHeroQuick(text) {
  document.getElementById("salma-hero-input").value = text;
  salmaHeroSend();
}
window.salmaHeroQuick = salmaHeroQuick;

// ===== DEMOS PRE-GENERADAS =====
const HERO_DEMOS = {
  japan: {
    title: "Japón cultural",
    emoji: "🏯",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=400&fit=crop&q=80",
    duration: 7,
    budget: "medio",
    summary: "Una semana recorriendo lo mejor de la cultura japonesa: desde los templos milenarios de Kioto hasta el bullicio futurista de Tokio, pasando por la serenidad de Nara y la historia de Hiroshima.",
    region: "Honshū",
    country: "Japón",
    stops: [
      {day:1, name:"Tokio · Shinjuku & Shibuya", type:"city", description:"Aterrizaje y primer impacto. Cruce de Shibuya, Golden Gai, ramen en Fuunji.", lat:35.6895, lng:139.6917},
      {day:2, name:"Tokio · Asakusa & Akihabara", type:"temple", description:"Senso-ji al amanecer, mercado de Ameyoko, tarde en Akihabara.", lat:35.7148, lng:139.7967},
      {day:3, name:"Hakone", type:"nature", description:"Escapada al lago Ashi con vistas al Fuji. Onsen tradicional. Tren de montaña.", lat:35.2325, lng:139.1070},
      {day:4, name:"Kioto · Higashiyama", type:"temple", description:"Fushimi Inari al amanecer (sin gente), barrio de las geishas de Gion, templo Kiyomizu-dera.", lat:34.9671, lng:135.7727},
      {day:5, name:"Kioto · Arashiyama", type:"nature", description:"Bosque de bambú, puente Togetsukyo, templo Tenryu-ji. Tarde en el barrio de Nishiki.", lat:35.0094, lng:135.6674},
      {day:6, name:"Nara", type:"temple", description:"Parque de los ciervos, Gran Buda de Todai-ji, santuario Kasuga Taisha entre farolillos de piedra.", lat:34.6851, lng:135.8048},
      {day:7, name:"Hiroshima & Miyajima", type:"city", description:"Memorial de la Paz, cúpula Genbaku, ferry a Miyajima para ver el torii flotante al atardecer.", lat:34.3955, lng:132.4596}
    ],
    tips: [
      "Compra el Japan Rail Pass de 7 días: amortizas el shinkansen Tokio-Kioto en un solo trayecto.",
      "Fushimi Inari a las 6am. A las 9 hay colas de 200 personas.",
      "Come en konbinis (7-Eleven, Lawson): onigiri a 1€ y calidad que no existe en otro país.",
      "Lleva efectivo. Muchos sitios en Kioto y Nara no aceptan tarjeta.",
      "Septiembre-noviembre o marzo-mayo. Evita agosto: calor extremo y obon."
    ],
    tags: ["cultural", "templos", "gastronomía", "tren"]
  },
  thailand: {
    title: "Tailandia low cost",
    emoji: "🏖️",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=400&fit=crop&q=80",
    duration: 10,
    budget: "bajo",
    summary: "10 días con presupuesto mochilero por lo mejor de Tailandia: templos de Bangkok, ruinas de Ayutthaya, selva de Chiang Mai y playas del sur. Todo por menos de 30€/día.",
    region: "Central y Sur",
    country: "Tailandia",
    stops: [
      {day:1, name:"Bangkok · Khao San & Templos", type:"city", description:"Gran Palacio, Wat Pho (buda reclinado), Wat Arun al atardecer. Pad thai callejero por 1€.", lat:13.7563, lng:100.5018},
      {day:2, name:"Bangkok · Chatuchak & Chinatown", type:"city", description:"Mercado de fin de semana más grande del mundo. Noche en Yaowarat (Chinatown).", lat:13.7999, lng:100.5535},
      {day:3, name:"Ayutthaya", type:"temple", description:"Antigua capital del reino de Siam. Alquila bici y recorre las ruinas UNESCO. Tren desde Bangkok por 0,50€.", lat:14.3532, lng:100.5689},
      {day:4, name:"Chiang Mai · Casco antiguo", type:"temple", description:"Wat Phra Singh, Wat Chedi Luang, mercado nocturno de Sunday Walking Street.", lat:18.7883, lng:98.9853},
      {day:5, name:"Chiang Mai · Doi Suthep", type:"mountain", description:"Templo dorado en la montaña con vistas. Tarde en Nimmanhaemin para cafés.", lat:18.8048, lng:98.9218},
      {day:6, name:"Chiang Rai · Templo Blanco", type:"temple", description:"Wat Rong Khun (templo blanco), Casa Negra, mercado nocturno local.", lat:19.8244, lng:99.7632},
      {day:7, name:"Krabi · Ao Nang", type:"beach", description:"Base para las islas. Playa de Railay en longtail boat, escalada en karsts.", lat:8.0473, lng:98.8365},
      {day:8, name:"Koh Phi Phi", type:"beach", description:"Maya Bay, snorkel en Shark Point, mirador de la isla. Alojamiento desde 8€.", lat:7.7407, lng:98.7784},
      {day:9, name:"Koh Lanta", type:"beach", description:"Playas largas sin masificar. Long Beach al atardecer. Comida local baratísima.", lat:7.6500, lng:99.0400},
      {day:10, name:"Bangkok · Regreso", type:"city", description:"Vuelo interno Krabi-Bangkok. Último paseo por Khao San. Mango sticky rice de despedida.", lat:13.7563, lng:100.5018}
    ],
    tips: [
      "Presupuesto real: 25-35€/día incluyendo alojamiento, comida y transporte interno.",
      "Vuelos internos con AirAsia o Nok Air: Bangkok-Chiang Mai por 15-25€ si reservas con antelación.",
      "Come en puestos callejeros, nunca en restaurantes turísticos. El pad thai de la calle es mejor y cuesta 1€.",
      "Hostales por 5-8€/noche. En las islas sube a 10-15€ en temporada alta.",
      "Mejor época: noviembre a febrero. Evita abril: 40°C y Songkran (todo cerrado)."
    ],
    tags: ["mochilero", "playas", "templos", "low cost"]
  },
  iceland: {
    title: "Islandia road trip",
    emoji: "🌋",
    image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=400&fit=crop&q=80",
    duration: 12,
    budget: "medio-alto",
    summary: "La Ring Road completa en 12 días: volcanes, glaciares, auroras boreales, aguas termales y paisajes que parecen de otro planeta. El road trip definitivo.",
    region: "Ring Road (Ruta 1)",
    country: "Islandia",
    stops: [
      {day:1, name:"Reikiavik", type:"city", description:"Hallgrímskirkja, puerto viejo, Harpa. Alquiler del 4x4. Hot dog en Bæjarins Beztu.", lat:64.1466, lng:-21.9426},
      {day:2, name:"Círculo Dorado", type:"nature", description:"Þingvellir (fisura tectónica), Geysir, cascada Gullfoss. El día más clásico de Islandia.", lat:64.3271, lng:-20.1199},
      {day:3, name:"Seljalandsfoss & Skógafoss", type:"nature", description:"Dos cascadas espectaculares. Puedes caminar detrás de Seljalandsfoss. Playa negra de Reynisfjara.", lat:63.6156, lng:-19.9886},
      {day:4, name:"Vík & Reynisfjara", type:"beach", description:"Playa de arena negra con columnas de basalto. Acantilados de Dyrhólaey. Paisaje lunar.", lat:63.4186, lng:-19.0060},
      {day:5, name:"Skaftafell & Jökulsárlón", type:"nature", description:"Glaciar Vatnajökull, laguna glaciar con icebergs. Diamond Beach al atardecer.", lat:64.0784, lng:-16.1756},
      {day:6, name:"Fiordos del Este", type:"nature", description:"La parte menos turística. Carreteras entre fiordos, pueblos pesqueros de 50 habitantes.", lat:64.9139, lng:-13.8589},
      {day:7, name:"Egilsstaðir & Borgarfjörður", type:"town", description:"Lago Lagarfljót, colonia de frailecillos en Borgarfjörður eystri (jun-ago).", lat:65.2538, lng:-14.3948},
      {day:8, name:"Mývatn", type:"nature", description:"Lago volcánico, pseudocráteres, cuevas de lava Grjótagjá, baños termales de Mývatn.", lat:65.6035, lng:-16.9964},
      {day:9, name:"Húsavík & Dettifoss", type:"nature", description:"Capital del whale watching. Dettifoss: la cascada más potente de Europa.", lat:65.9539, lng:-17.3383},
      {day:10, name:"Akureyri", type:"city", description:"Capital del norte. Jardín botánico, iglesia Akureyrarkirkja, ballenas en Eyjafjörður.", lat:65.6835, lng:-18.0878},
      {day:11, name:"Península de Snæfellsnes", type:"nature", description:"Kirkjufell (montaña más fotografiada), volcán Snæfellsjökull, pueblo de Arnarstapi.", lat:64.7539, lng:-23.6262},
      {day:12, name:"Blue Lagoon & Reikiavik", type:"activity", description:"Último baño en la Blue Lagoon. Devolver coche. Cena de despedida en Grillið.", lat:63.8804, lng:-22.4495}
    ],
    tips: [
      "Alquila un 4x4 obligatoriamente. Muchas F-roads requieren tracción total y los seguros no cubren sedanes en grava.",
      "Presupuesto: 80-120€/día para dos personas (coche + gasolina + camping/guesthouses + comida).",
      "Septiembre: posibilidad de auroras boreales + días largos + menos turistas que en verano.",
      "Lleva comida del supermercado Bónus (cerdo rosa). Comer fuera en Islandia cuesta 25-40€ por persona.",
      "El tiempo cambia cada 15 minutos. Viste en capas y lleva siempre chubasquero."
    ],
    tags: ["road trip", "naturaleza", "volcanes", "glaciares", "auroras"]
  }
};

function openHeroDemo(key) {
  const demo = HERO_DEMOS[key];
  if (!demo) return;
  
  const modal = document.getElementById('hero-demo-modal');
  const content = document.getElementById('hero-demo-content');
  
  var typeIcons = {city:'🏙',town:'🏘',nature:'🌿',beach:'🏖',mountain:'⛰',temple:'🛕',viewpoint:'📸',route:'🛤',activity:'🎯',other:'📍'};
  
  // Stops HTML
  var stopsHTML = demo.stops.map(function(s) {
    var icon = typeIcons[s.type] || '📍';
    var mapsUrl = 'https://www.google.com/maps?q=' + s.lat + ',' + s.lng;
    return '<div style="display:flex;gap:12px;padding:14px 0;border-bottom:1px solid rgba(212,160,23,.1);">' +
      '<div style="min-width:32px;text-align:center;">' +
        '<span style="font-size:20px;">' + icon + '</span>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:8px;color:var(--dorado);margin-top:2px;">DÍA ' + s.day + '</div>' +
      '</div>' +
      '<div style="flex:1;">' +
        '<div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:3px;">' + s.name + '</div>' +
        '<div style="font-size:13px;color:rgba(245,240,232,.7);line-height:1.6;">' + s.description + '</div>' +
        '<a href="' + mapsUrl + '" target="_blank" rel="noopener" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);text-decoration:none;margin-top:4px;display:inline-block;">VER EN MAPA →</a>' +
      '</div>' +
    '</div>';
  }).join('');
  
  // Tips HTML
  var tipsHTML = demo.tips.map(function(t) {
    return '<div style="font-size:13px;color:rgba(245,240,232,.7);line-height:1.6;margin-bottom:6px;">• ' + t + '</div>';
  }).join('');
  
  // Tags HTML
  var tagsHTML = demo.tags.map(function(t) {
    return '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;padding:5px 10px;border:1px solid rgba(212,160,23,.25);border-radius:999px;color:var(--dorado);">' + t + '</span>';
  }).join('');
  
  content.innerHTML = 
    // Foto cabecera con overlay y título
    '<div style="position:relative;width:100%;height:220px;background:url(\'' + demo.image + '\') center/cover;">' +
      '<div style="position:absolute;inset:0;background:linear-gradient(to top,#111 0%,rgba(17,17,17,.4) 50%,rgba(0,0,0,.2) 100%);"></div>' +
      '<button onclick="document.getElementById(\'hero-demo-modal\').style.display=\'none\'" style="position:absolute;top:14px;right:14px;background:rgba(0,0,0,.5);border:none;color:#fff;font-size:20px;width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);">✕</button>' +
      '<div style="position:absolute;bottom:18px;left:24px;right:24px;">' +
        '<div style="font-family:\'Inter Tight\',sans-serif;font-size:28px;font-weight:700;color:#fff;line-height:1.1;text-shadow:0 2px 12px rgba(0,0,0,.5);">' + demo.emoji + ' ' + demo.title + '</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);letter-spacing:.14em;margin-top:6px;">' + demo.duration + ' DÍAS · ' + demo.country.toUpperCase() + ' · ' + demo.budget.toUpperCase() + '</div>' +
      '</div>' +
    '</div>' +
    // Mapa
    '<div id="hero-demo-map" style="width:100%;height:220px;background:#0a0a09;border-top:1px solid rgba(212,160,23,.12);"></div>' +
    // Contenido
    '<div style="padding:24px;">' +
      '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + demo.summary + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px;">' + tagsHTML + '</div>' +
      // Stops
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:8px;">ITINERARIO · ' + demo.stops.length + ' PARADAS</div>' +
      stopsHTML +
      // Tips
      '<div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(212,160,23,.15);">' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:10px;">CONSEJOS DE SALMA</div>' +
        tipsHTML +
      '</div>' +
      // CTA
      '<div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(212,160,23,.15);text-align:center;">' +
        '<div style="font-size:15px;color:rgba(245,240,232,.7);margin-bottom:12px;">¿Quieres algo así para tu viaje?</div>' +
        '<button onclick="document.getElementById(\'hero-demo-modal\').style.display=\'none\';document.getElementById(\'salma-hero-input\').focus();" style="background:#d4a017;color:#0a0908;border:none;border-radius:14px;padding:14px 28px;font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;letter-spacing:.14em;cursor:pointer;">CREAR MI RUTA CON SALMA →</button>' +
      '</div>' +
    '</div>';
  
  modal.style.display = 'block';
  
  // Inicializar mapa Leaflet
  setTimeout(function() {
    var mapEl = document.getElementById('hero-demo-map');
    if (!mapEl || mapEl._leaflet_id) return;
    
    var center = [demo.stops[Math.floor(demo.stops.length/2)].lat, demo.stops[Math.floor(demo.stops.length/2)].lng];
    var demoMap = L.map('hero-demo-map', {zoomControl:false, scrollWheelZoom:false}).setView(center, 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:18}).addTo(demoMap);
    
    // Ruta
    var coords = demo.stops.map(function(s) { return [s.lat, s.lng]; });
    L.polyline(coords, {color:'#d4a017', weight:2, opacity:.7, dashArray:'8,6'}).addTo(demoMap);
    
    // Markers
    demo.stops.forEach(function(s) {
      var icon = L.divIcon({
        html:'<div style="background:#d4a017;border-radius:50%;width:10px;height:10px;box-shadow:0 0 0 3px rgba(212,160,23,.3);"></div>',
        className:'', iconSize:[10,10], iconAnchor:[5,5]
      });
      L.marker([s.lat, s.lng], {icon:icon}).addTo(demoMap)
        .bindTooltip(s.name, {permanent:false, direction:'right'});
    });
    
    // Fit bounds
    demoMap.fitBounds(coords, {padding:[30,30]});
  }, 150);
}
window.openHeroDemo = openHeroDemo;

// Hero input: Enter para enviar
document.getElementById("salma-hero-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); salmaHeroSend(); }
});

document.getElementById("salma-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); salmaSend(); }
});

// Expose to global scope for HTML onclick handlers
window.salmaToggle = salmaToggle;
window.salmaSend = salmaSend;
window.salmaAddMsg = salmaAddMsg;
window.salmaRenderRoute = salmaRenderRoute;
