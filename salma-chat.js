/* SALMA CHAT
   Maneja conversación, generación de rutas y guardado
*/

let salmaConversation = [];
let lastSalmaRoute = null;

function $(id){
  return document.getElementById(id);
}

/* ===============================
   ENVIAR MENSAJE A SALMA
================================*/

async function enviarMensajeSalma(){

  const input = $("salma-hero-input");
  if(!input) return;

  const text = input.value.trim();

  if(!text) return;

  input.value = "";

  addUserMessage(text);

  try{

    const res = await fetch("/api/salma",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        message:text,
        conversation:salmaConversation
      })
    });

    const data = await res.json();

    if(!data) return;

    salmaConversation.push({
      role:"user",
      content:text
    });

    salmaConversation.push({
      role:"assistant",
      content:data.text || ""
    });

    addSalmaMessage(data.text || "");

    if(data.route){
      renderRoute(data.route);
      lastSalmaRoute = data.route;
      window._salmaLastRoute = data.route;
    }

  }catch(e){

    console.error(e);

    if(window.showToast){
      window.showToast("Error con SALMA");
    }

  }

}

/* ===============================
   MENSAJES CHAT
================================*/

function addUserMessage(text){

  const chat = $("salma-chat");

  if(!chat) return;

  const msg = document.createElement("div");

  msg.className = "salma-user-msg";

  msg.innerText = text;

  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;

}

function addSalmaMessage(text){

  const chat = $("salma-chat");

  if(!chat) return;

  const msg = document.createElement("div");

  msg.className = "salma-msg";

  msg.innerHTML = text;

  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;

}

/* ===============================
   MOSTRAR RUTA
================================*/

function renderRoute(route){

  const container = $("salma-route");

  if(!container) return;

  let html = "";

  html += `<div class="salma-route-header">`;
  html += `<h2>${route.title || "Ruta"}</h2>`;
  html += `<div class="salma-route-meta">${route.duration_days || 0} días · ${route.country || ""}</div>`;
  html += `</div>`;

  if(route.summary){
    html += `<p class="salma-route-summary">${route.summary}</p>`;
  }

  if(Array.isArray(route.stops)){

    html += `<div class="salma-route-stops">`;

    route.stops.forEach((stop,i)=>{

      html += `
      <div class="salma-stop">

        <div class="salma-stop-num">
          ${i+1}
        </div>

        <div class="salma-stop-content">

          <div class="salma-stop-title">
            ${stop.name || stop.headline || "Parada"}
          </div>

          ${
            stop.description
            ? `<div class="salma-stop-desc">${stop.description}</div>`
            : ""
          }

          ${
            stop.lat && stop.lng
            ? `<a href="https://www.google.com/maps?q=${stop.lat},${stop.lng}" target="_blank">Abrir en Google Maps</a>`
            : ""
          }

        </div>

      </div>
      `;

    });

    html += `</div>`;

  }

  html += `
  <div class="salma-route-actions">

    <button onclick="salmaGuardarRuta()">
      Guardar ruta
    </button>

  </div>
  `;

  container.innerHTML = html;

}

/* ===============================
   GUARDAR RUTA
================================*/

async function salmaGuardarRuta(){

  try{

    if(!window._salmaLastRoute){

      if(window.showToast){
        window.showToast("No hay ruta para guardar");
      }

      return;

    }

    if(typeof window.saveRoute !== "function"){

      if(window.showToast){
        window.showToast("Sistema de guardado no disponible");
      }

      return;

    }

    if(window.showToast){
      window.showToast("Guardando ruta...");
    }

    const raw = window._salmaLastRoute;

    const routeToSave = {

      nombre: raw.title || "Mi ruta",
      titulo: raw.title || "Mi ruta",

      destino: raw.country || "",

      dias: raw.duration_days || 0,

      desc: raw.summary || "",

      summary: raw.summary || "",

      raw_route: raw,

      pois: Array.isArray(raw.stops)
        ? raw.stops.map((s,i)=>{

          return {

            id: s.id || ("stop_"+(i+1)),

            name: s.name || s.headline || "Parada",

            description: s.description || "",

            type: s.type || "other",

            day: s.day || 1,

            lat: s.lat || null,

            lng: s.lng || null,

            mapsUrl:
              s.lat && s.lng
                ? "https://www.google.com/maps?q="+s.lat+","+s.lng
                : ""

          };

        })
        : []

    };

    await window.saveRoute(routeToSave);

    if(window.showToast){
      window.showToast("Ruta guardada ✓");
    }

  }catch(e){

    console.error(e);

    if(window.showToast){
      window.showToast("Error guardando ruta");
    }

  }

}

window.salmaGuardarRuta = salmaGuardarRuta;

/* ===============================
   ENTER PARA ENVIAR
================================*/

document.addEventListener("keydown",function(e){

  if(e.key === "Enter"){

    const input = $("salma-hero-input");

    if(document.activeElement === input){
      enviarMensajeSalma();
    }

  }

});
