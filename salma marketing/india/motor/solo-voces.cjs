const fs=require('fs'),Module=require('module');
const src=fs.readFileSync(__dirname+'/cap4.cjs','utf8').replace(/const \{ build \} = require\('\.\/motor\.cjs'\);/,'').replace(/build\(cfg\)[\s\S]*$/,'module.exports = cfg;');
const m=new Module('cfg');m._compile(src,__dirname+'/cfg-virtual.cjs');const cfg=m.exports;const {voice}=require('./motor.cjs');
(async()=>{let n=0;for(const b of cfg.blocks){if(!b.text||b.who!=='salma')continue;const v=await voice(b.voz||b.text,cfg.voices.salma);n+=v.chars;console.log(b.id,v.chars?'generado '+v.chars:'(en caché)');}console.log('caracteres de Salma generados:',n);})().catch(e=>{console.error('FALLO',e.message);process.exit(1);});
