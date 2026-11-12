import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const tag='<script type="module" src="./player-save-controls.js" id="painting-save-controls-module"></script>';
function once(text,from,to){assert.equal(text.split(from).length,2,'Save controls anchor changed: '+from);return text.replace(from,()=>to);}
export function patchMain(source){
 let html=source;
 if(html.includes('id="painting-save-controls-module"')){
  assert.equal(html.split(tag).length,2,'Save module changed');assert(html.includes('data-save-artist="${html(id)}"'));assert(html.includes("dataset.saveWork=c.key"));
 }else{
  html=once(html,'<section id="artist-area" class="artist-page">','<section id="artist-area" class="artist-page" data-save-artist="${html(id)}">');
  html=once(html,'<img id="painting" alt=','<img id="painting" data-save-work="${esc(c.key)}" alt=');
  html=once(html,'data-gallery-token="${esc(c.token)}"','data-gallery-token="${esc(c.token)}" data-save-work="${esc(c.key)}"');
  html=once(html,'function zoom(c){',"function zoom(c){document.getElementById('zoomDialog').dataset.saveWork=c.key;");
  html=once(html,'zoom=function(c){',"zoom=function(c){document.getElementById('zoomDialog').dataset.saveWork=c.key;");
  html=once(html,"el('artist-caption').textContent=","el('artist-dialog').dataset.saveWork=key;el('artist-caption').textContent=");
  html=once(html,'</head>',tag+'\n</head>');
 }
 for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(m[1].trim()&&!/^\s*[\[{]/.test(m[1]))new vm.Script(m[1]);
 return html;
}
function extract(html,name){
 const matches=[...html.matchAll(new RegExp('(?<![\\w$])'+name+'\\s*=\\s*(?=\\[)','g'))];assert.equal(matches.length,1,'Expected one '+name+' array');
 const start=matches[0].index+matches[0][0].length;let depth=0,q=false,escaped=false;
 for(let i=start;i<html.length;i++){const c=html[i];if(q){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')q=false;}else if(c==='"')q=true;else if(c==='[')depth++;else if(c===']'&&--depth===0)return JSON.parse(html.slice(start,i+1));}throw Error('Unclosed '+name);
}
export function extendCatalogue(input,cards,gallery){
 assert(!input.some(a=>a.id==='__painting_catalogue__'&&a.saveable!==false),'Fallback artist id occupied');
 const catalog=JSON.parse(JSON.stringify(input)).filter(a=>a.id!=='__painting_catalogue__'),byId=new Map(catalog.map(a=>[a.id,a])),byWork=new Map(),names=new Map();
 const norm=s=>String(s||'').toLocaleLowerCase('ru').replaceAll('ё','е').trim();
 for(const a of catalog){
  for(const name of new Set([a.name,a.latin,...(a.aliases||[])].map(norm).filter(Boolean))){if(!names.has(name))names.set(name,a.id);else if(names.get(name)!==a.id)names.set(name,null);}
  for(const w of a.works){assert(!byWork.has(w.key),'Duplicate saved work '+w.key);byWork.set(w.key,{a,w});w.author??=a.name;}
 }
 const fallback={id:'__painting_catalogue__',name:'Другие произведения каталога',latin:'',tag:'',aliases:[],saveable:false,works:[]};assert(!byId.has(fallback.id),'Fallback artist id occupied');
 const seenCards=new Set();
 for(const c of [...cards,...gallery]){
  if(!c.key||seenCards.has(c.key))continue;seenCards.add(c.key);
  if(byWork.has(c.key)){const found=byWork.get(c.key);if(c.author)found.w.author=c.author;continue;}
  const a=byId.get(c.artistId)||byId.get(names.get(norm(c.author)))||fallback;
  const w={key:c.key,title:c.title||c.originalTitle||c.key,originalTitle:c.originalTitle||'',author:c.author||a.name};a.works.push(w);byWork.set(w.key,{a,w});
 }
 if(fallback.works.length)catalog.push(fallback);
 return catalog;
}
const helper=`/*shared-saves-cabinet:start*/
function token(kind,id){return kind+':'+id;}
function paintSave(b,animate=false){
 const kind=b.dataset.saveKind,id=b.dataset.saveId,state=saves.state(kind,id),previous=b.dataset.saveState;
 b.dataset.saveState=state==='saved'?'saved':state;b.disabled=['connecting','checking','pending','saved'].includes(state);
 const label=state==='pending'?'Сохраняем…':state==='saved'?(kind==='savedArtists'?'Сохранен':'В избранном'):['connecting','checking'].includes(state)?'Проверяем…':kind==='savedArtists'?'Сохранить художника':'В избранные картины';
 if(b.textContent!==label)b.textContent=label;
 if(animate&&state==='saved'&&previous!=='saved'&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)b.animate?.([{opacity:.35},{opacity:.78}],{duration:240,easing:'ease-out'});
}
function paintSaves(tag){for(const b of s.querySelectorAll('button[data-save-kind]'))paintSave(b,token(b.dataset.saveKind,b.dataset.saveId)===tag);}
function saveButton(kind,artist,work){const b=button('',()=>save(kind,artist,work));b.className='save-state';b.dataset.saveKind=kind;b.dataset.saveId=key(kind,work?work.key:artist.id);paintSave(b);return b;}
function watchSaved(){saves.bind(user,F,db);}
saves.subscribe(event=>{paintSaves(event.saved);if(event.error)say(error(event.error));});
/*shared-saves-cabinet:end*/
`;
const operations=`async function save(kind,artist,work){
 if(!user||!db||!F){say('Сначала войдите через «Вход / профиль».');return;}if(busy)return;
 const uid=user.uid,stamp=epoch;busy=true;
 try{const ok=await saves.add(kind,key(kind,work?work.key:artist.id),work?{artistId:artist.id,workKey:work.key}:{artistId:artist.id});if(ok&&user?.uid===uid&&stamp===epoch)say('Сохранено в вашем кабинете.');}
 catch(e){if(user?.uid===uid&&stamp===epoch)say(error(e));}finally{busy=false;}
}
async function remove(kind,id){
 if(!user||busy)return;const uid=user.uid,stamp=epoch;busy=true;say('Удаляем…');
 try{if(await saves.remove(kind,id)&&user?.uid===uid&&stamp===epoch){rows=rows.filter(r=>r.id!==id);drawSaved();say('Удалено.');}}
 catch(e){if(user?.uid===uid&&stamp===epoch)say(error(e));}finally{busy=false;}
}
`;
export function patchCabinet(source){
 if(source.includes('/*shared-saves-cabinet:start*/')){assert(source.startsWith("import {saves} from './player-saves.js';"));return source;}
 assert.equal(source.split('const savedKinds=').length,2,'Cabinet saved controls changed');
 const start=source.indexOf('const savedKinds='),end=source.indexOf('async function save(',start);assert(end>start);
 let out="import {saves} from './player-saves.js';\n"+source.slice(0,start)+helper+source.slice(end);
 const first=out.indexOf('async function save('),last=out.indexOf('function article(',first);assert(last>first);out=out.slice(0,first)+operations+out.slice(last);
 out=once(out,"if(matches([a.name,a.latin,a.tag,...(a.aliases||[])].join(' ')))", "if(a.saveable!==false&&matches([a.name,a.latin,a.tag,...(a.aliases||[])].join(' ')))");
 out=once(out,"matches([a.name,w.title,w.originalTitle].join(' '))","matches([a.name,w.author,w.title,w.originalTitle].join(' '))");
 out=once(out,"el.append(link(artist.id,work?work.title||work.key:artist.name));", "if(artist.saveable===false){const title=document.createElement('span');title.textContent=work?.title||work?.key||artist.name;el.append(title);}else el.append(link(artist.id,work?work.title||work.key:artist.name));");
 out=once(out,"p.textContent=artist.name;","p.textContent=work.author||artist.name;");
 const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:out,encoding:'utf8'});assert.equal(check.status,0,check.stderr);
 return out;
}
export function prepare(main,cabinet,page){
 const m=/<script type="application\/json" id="painting-save-catalog">([\s\S]*?)<\/script>/g,matches=[...page.matchAll(m)];assert.equal(matches.length,1,'Expected one cabinet catalogue');
 const catalog=extendCatalogue(JSON.parse(matches[0][1]),extract(main,'CARDS'),extract(main,'GALLERY'));
 const nextPage=page.replace(m,()=>'<script type="application/json" id="painting-save-catalog">'+JSON.stringify(catalog).replaceAll('<','\\u003c')+'</script>');
 return {main:patchMain(main),cabinet:patchCabinet(cabinet),page:nextPage,artists:catalog.filter(a=>a.saveable!==false).length,works:catalog.reduce((n,a)=>n+a.works.length,0)};
}
if(!process.argv.includes('--test')){
 const next=prepare(fs.readFileSync('index.html','utf8'),fs.readFileSync('player-cabinet.js','utf8'),fs.readFileSync('cabinet.html','utf8'));
 fs.writeFileSync('index.html',next.main);fs.writeFileSync('player-cabinet.js',next.cabinet);fs.writeFileSync('cabinet.html',next.page);
 console.log('Save controls prepared: '+next.artists+' artists, '+next.works+' unique works.');
}
