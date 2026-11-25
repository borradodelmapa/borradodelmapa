// Y10: que ningún subtítulo EN pise al siguiente (el motor los alinea por frase y el corte en L los solapa). Uso: node arreglar-srt-en.cjs <archivo.srt> [...]
const fs=require('fs');const ms=s=>{const m=s.match(/(\d+):(\d+):(\d+),(\d+)/);return ((+m[1]*60+ +m[2])*60+ +m[3])*1000+ +m[4]};
const fmt=x=>{const h=Math.floor(x/3600000),m=Math.floor(x/60000)%60,s=Math.floor(x/1000)%60,r=x%1000;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(r).padStart(3,'0')}`};
for(const f of process.argv.slice(2)){const b=fs.readFileSync(f,'utf8').replace(/\r/g,'').trim().split(/\n\n+/).map(x=>{const l=x.split('\n');const [a,e]=l[1].split(' --> ');return {a:ms(a),e:ms(e),t:l.slice(2).join('\n')}});
let n=0;for(let i=0;i<b.length-1;i++)if(b[i].e>b[i+1].a-20){b[i].e=b[i+1].a-20;n++}
fs.writeFileSync(f,b.map((x,i)=>`${i+1}\n${fmt(x.a)} --> ${fmt(x.e)}\n${x.t}`).join('\n\n')+'\n');console.log(f.split('/').pop(),'solapes arreglados',n)}
