// (Lo usa la GitHub Action "Mapas del vídeo"; antes se ejecutaba a mano en .mapas/.)
// Descarga el relieve (AWS Terrain Tiles, terrarium) de España+Portugal+Baleares+Canarias z0-12 y lo empaqueta en
// varios .bin de <=280 MB (wrangler sube como mucho ~300 MB por archivo) + un índice JSON {z/x/y: [parte, offset, largo]}.
const fs=require('fs');
const boxes=[[-9.6,35.9,4.45,43.95],[-18.3,27.55,-13.3,29.5]];
const lx=(lon,z)=>Math.floor((lon+180)/360*2**z),ly=(lat,z)=>{const r=lat*Math.PI/180;return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*2**z)};
const S=new Set();for(const bb of boxes)for(let z=0;z<=12;z++)for(let x=lx(bb[0],z);x<=lx(bb[2],z);x++)for(let y=ly(bb[3],z);y<=ly(bb[1],z);y++)S.add(z+'/'+x+'/'+y);
const L=[...S];const MAX=280e6;
(async()=>{const bufs=new Array(L.length);let next=0,fail=0,done=0;
  const lane=async()=>{while(next<L.length){const k=next++;for(let t=0;t<4;t++){try{const r=await fetch('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/'+L[k]+'.png');if(!r.ok)throw new Error(r.status);bufs[k]=Buffer.from(await r.arrayBuffer());break;}catch(e){if(t===3)fail++;else await new Promise(r=>setTimeout(r,500*(t+1)));}}
    if(++done%2000===0)console.log(done,'/',L.length);}};
  await Promise.all(Array.from({length:12},lane));
  const idx={};let part=0,off=0,parts=[[]];
  L.forEach((key,k)=>{const b=bufs[k];if(!b)return;if(off+b.length>MAX){part++;off=0;parts.push([]);}idx[key]=[part,off,b.length];parts[part].push(b);off+=b.length;});
  parts.forEach((p,i)=>fs.writeFileSync(`terreno-es-pt-${i}.bin`,Buffer.concat(p)));
  fs.writeFileSync('terreno-es-pt.json',JSON.stringify({formato:'terrarium',minzoom:0,maxzoom:12,partes:parts.length,tiles:idx}));
  console.log('ok',Object.keys(idx).length,'trozos en',parts.length,'partes','fallos',fail);})();
