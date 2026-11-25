// Voz del guion v2 (OK de Paco: «Hazlo», 22 nov 2026). BIRD = Alice (+ tono bajado con ffmpeg), SALMA = SALMA_DOC (voces.cjs).
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const k=(fs.readFileSync('C:/Users/User/Desktop/salma/api/salma voice.txt','utf8').match(/sk_[A-Za-z0-9]+/)||[])[0];
const {SALMA_DOC}=require('C:/Users/User/Desktop/salma/salma marketing/india/motor/voces.cjs');
const BIRD={id:'Xb7hH8MSUJpSbSDYk0k2',model:'eleven_v4',lang:'es',vs:{stability:0.45,similarity_boost:0.85,style:0.3}};
const FF='C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const L=[
['01','B','Antes de contarme nada, los ainu me suplicaron que no se lo dijera al Gobierno japonés.'],
['02','S','Aun así… acabó escribiéndolo en un libro.'],
['03','S','Se yamaba Isabela Bird. Enferma desde niña, los médicos le recetaron viajar. Acabó recorriendo medio mundo.'],
['04','B','Me imploraron que intercediera ante el Gobierno. Japón les había prohibido su tatuaje.'],
['05','S','Le pidieron que no lo supiera el Gobierno. Lo publicó en Londres. ¿Hizo lo correcto?'],
['06','S','Sin conocerla de nada, la metieron en casa de su jefe.'],
['07','B','La madre del jefe reñía a su nieto por contarme demasiado.'],
['08','S','Tenía un motivo.'],
['09','B','Decía que eso traería daño a su pueblo.'],
['10','B','Sus voces son más suaves y dulces que nada que haya oído.'],
['11','S','Sin embargo… en ese mismo párrafo los yamó «niños adultos».'],
['12','S','La prohibición siguió. La última con el tatuaje completo murió en mil novecientos noventa y ocho.'],
['13','S','Lo que le suplicaron que no supiera el Gobierno… hoy se lee traducido al japonés.'],
];
(async()=>{let chars=0;for(const [n,who,text] of L){const v=who==='B'?BIRD:SALMA_DOC;const out=path.join(__dirname,'..','voces','guion',`${n}-${who==='B'?'bird':'salma'}.mp3`);
if(fs.existsSync(out)){console.log(n,'ya estaba');continue}
const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':k,'Content-Type':'application/json'},body:JSON.stringify({text,model_id:v.model,language_code:v.lang||'es',voice_settings:v.vs})});
if(!r.ok){console.log(n,'FALLO',r.status,(await r.text()).slice(0,200));continue}chars+=text.length;
const raw=out.replace('.mp3','-raw.mp3');fs.writeFileSync(who==='B'?raw:out,Buffer.from(await r.arrayBuffer()));
if(who==='B')execFileSync(FF,['-v','error','-y','-i',raw,'-af','asetrate=44100*0.89,aresample=44100,atempo=1/0.89*0.97,equalizer=f=180:t=q:w=1:g=3',out]);
console.log(n,who,'ok')}console.log('caracteres',chars)})();
