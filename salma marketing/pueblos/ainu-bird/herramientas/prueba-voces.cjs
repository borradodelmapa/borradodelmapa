// Prueba de voz para Isabella Bird (F5: una frase por voz, ~90 caracteres cada una). 22 nov 2026.
const fs=require('fs'),path=require('path');const k=(fs.readFileSync('C:/Users/User/Desktop/salma/api/salma voice.txt','utf8').match(/sk_[A-Za-z0-9]+/)||[])[0];
const TXT='Antes de contarme nada, los ainu me suplicaron que no se lo dijera al Gobierno japonés.';
const V={alice:'Xb7hH8MSUJpSbSDYk0k2',lily:'pFZP5JQG7iQjIQuC4Bku',matilda:'XrExE9yKIg1WjnnlVkGX'};
(async()=>{for(const [n,id] of Object.entries(V)){const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':k,'Content-Type':'application/json'},body:JSON.stringify({text:TXT,model_id:'eleven_v4',language_code:'es',voice_settings:{stability:0.45,similarity_boost:0.85,style:0.3}})});
if(!r.ok){console.log(n,'FALLO',r.status,(await r.text()).slice(0,200));continue}const b=Buffer.from(await r.arrayBuffer());fs.writeFileSync(path.join(__dirname,'..','voces',`bird-prueba-${n}.mp3`),b);console.log(n,'ok',b.length)}})();
