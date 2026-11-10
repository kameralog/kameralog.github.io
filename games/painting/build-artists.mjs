import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('index.html','utf8');
const match=/\bconst\s+CARDS\s*=\s*\[/.exec(html);
if(!match)throw Error('CARDS not found in index.html');
const start=match.index+match[0].length-1;
let depth=0,quoted=false,escaped=false,end=-1;
for(let i=start;i<html.length;i++){
  const c=html[i];
  if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}
  else if(c==='"')quoted=true;
  else if(c==='[')depth++;
  else if(c===']'&&--depth===0){end=i+1;break;}
}
if(end<0)throw Error('Unclosed CARDS array');
const CARDS=JSON.parse(html.slice(start,end));
const files=fs.readdirSync('.').filter(n=>/^artists-batch-\d+\.js$/.test(n)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0]);
if(!files.length)throw Error('No artist batches');
const errors=[],ids=new Map(),keys=new Map(),aliases=new Map();
const norm=s=>String(s).toLowerCase().replaceAll('ё','е').replace(/\s+/g,' ').trim();
let count=0;
for(const file of files){
  const batches=[];
  const sandbox={CARDS,console,document:{getElementById:()=>null},MutationObserver:class{observe(){}}};
  sandbox.window=sandbox;
  sandbox.registerPaintingArtists=b=>batches.push(b);
  try{vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:5000});}
  catch(e){errors.push(`${file}: ${e.message}`);continue;}
  if(!batches.length)errors.push(`${file}: no registered artists`);
  for(const b of batches)for(const [id,a]of Object.entries(b)){
    count++;
    if(ids.has(id))errors.push(`Duplicate id ${id}: ${ids.get(id)}, ${file}`);
    ids.set(id,file);
    for(const w of a.works||[]){
      if(!w.key)errors.push(`Missing work key: ${id}`);
      else if(keys.has(w.key))errors.push(`Duplicate work ${w.key}: ${keys.get(w.key)}, ${id}`);
      else keys.set(w.key,id);
    }
    for(const al of new Set((a.aliases||[]).map(norm))){
      if(aliases.has(al)&&aliases.get(al)!==id)errors.push(`Alias ${al}: ${aliases.get(al)}, ${id}`);
      else aliases.set(al,id);
    }
  }
}
console.log(`Catalogue: ${CARDS.length}; files: ${files.length}; artists: ${count}; unique ids: ${ids.size}`);
if(errors.length){errors.forEach(e=>console.error(e));process.exit(1);}
const out=files.map(f=>`/* ${f} */\n${fs.readFileSync(f,'utf8')}\n;`).join('\n');
new vm.Script(out,{filename:'artists.js'});
const marker='/*artists.js-first*/';
let updated=html;
if(!html.includes(marker)){
  if(html.split('loadWave(2);').length!==2)throw Error('Cannot safely patch loader');
  const patch=marker+"(function(){const sc=document.createElement('script');sc.async=true;sc.src=new URL('artists.js',location.href).href;sc.onload=()=>{sc.remove();finishLoading()};sc.onerror=()=>{sc.remove();loadWave(2)};document.head.append(sc)})();";
  updated=html.replace('loadWave(2);',()=>patch);
}
fs.writeFileSync('artists.js',out);
if(updated!==html)fs.writeFileSync('index.html',updated);
console.log(`Built artists.js: ${Buffer.byteLength(out)} bytes`);
