import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const runtime=String.raw`/*registry-visibility:start*/
function appendRegistryArtists(){
  const root=document.getElementById('artist-area');
  if(!root||root.classList.contains('artist-page')||root.querySelector('#registry-extra-artists'))return;
  const intro=[...root.querySelectorAll('p.ar-muted')].find(p=>p.textContent.trim()==='Это ориентиры для сопоставления, а не исчерпывающие определения каждого автора.');
  if(!intro)return;
  const seen=new Set([...root.querySelectorAll('a[data-artist]')].map(a=>a.dataset.artist));
  const entries=Object.entries(ARTISTS).filter(([id,a])=>a&&a.name&&!seen.has(id)).sort((a,b)=>a[1].name.localeCompare(b[1].name,'ru'));
  if(!entries.length)return;
  const section=document.createElement('section');section.id='registry-extra-artists';
  const heading=document.createElement('h2');heading.textContent='Другие художники каталога';section.append(heading);
  const grid=document.createElement('div');grid.className='ar-grid';section.append(grid);
  for(const [id,a]of entries){
    const card=document.createElement('article');card.className='ar-card';
    const title=document.createElement('h3'),link=document.createElement('a');
    const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('artist',id);
    link.href=url.href;link.dataset.artist=id;link.textContent=a.name;title.append(link);card.append(title);
    const meta=document.createElement('p');meta.className='ar-muted';meta.textContent=[a.latin,a.life,a.tag].filter(Boolean).join(' · ');card.append(meta);
    if(a.bio?.[0]){const p=document.createElement('p');p.textContent=a.bio[0];card.append(p);}
    grid.append(card);
  }
  root.append(section);
}
const mountArtistSearchBeforeRegistry=mountArtistSearch;
mountArtistSearch=function(...args){appendRegistryArtists();return mountArtistSearchBeforeRegistry(...args)};
/*registry-visibility:end*/
`;
const additions={cinque:{mariotto_albertinelli:'Мариотто Альбертинелли',rosso_fiorentino:'Россо Фьорентино',sebastiano_del_piombo:'Себастьяно дель Пьомбо',giuseppe_salviati:'Джузеппе Сальвиати',michele_tosini:'Микеле Тозини'},northern:{joachim_patinir:'Йоахим Патинир',quinten_massys:'Квентин Массейс',joos_van_cleve:'Йос ван Клеве',bernaert_van_orley:'Бернарт ван Орлей',pieter_aertsen:'Питер Артсен',joachim_beuckelaer:'Йоахим Бейкелар',jan_sanders_van_hemessen:'Ян Сандерс ван Хемессен',marinus_van_reymerswale:'Маринус ван Реймерсвале',jan_mostaert:'Ян Мостарт',cornelis_engebrechtsz:'Корнелис Энгелбрехтс',geertgen_tot_sint_jans:'Гертген тот Синт Янс',lucas_van_leyden:'Лукас ван Лейден',jacob_cornelisz_van_oostsanen:'Якоб Корнелис ван Остсанен',herri_met_de_bles:'Херри мет де Блес',cornelis_van_haarlem:'Корнелис ван Харлем'}};
function patch(html){
  const prefix='const DATA=',at=html.indexOf(prefix);assert(at>=0&&html.indexOf(prefix,at+prefix.length)<0,'Expected one DATA');
  const start=at+prefix.length;let depth=0,quoted=false,escaped=false,end=-1;
  for(let i=start;i<html.length;i++){const c=html[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='{'||c==='[')depth++;else if((c==='}'||c===']')&&--depth===0){end=i+1;break;}}
  assert(end>start,'Unclosed DATA');const data=JSON.parse(html.slice(start,end));
  for(const [key,artists]of Object.entries(additions)){const section=data[key];assert(section?.meta&&Array.isArray(section.meta.names),'Missing guide section '+key);section.meta.links??={};for(const[id,name]of Object.entries(artists)){if(!section.meta.names.includes(name))section.meta.names.push(name);section.meta.links[name]=id;}}
  html=html.slice(0,start)+JSON.stringify(data)+html.slice(end);
  const marker=/\/\*registry-visibility:start\*\/[\s\S]*?\/\*registry-visibility:end\*\/\n?/;
  if(marker.test(html))html=html.replace(marker,()=>runtime);
  else{const anchor='function imageURLs(w,big=false){';assert.equal(html.split(anchor).length,2,'Image renderer anchor changed');assert(html.includes('/*artist-search:end*/'),'Search installer must run first');html=html.replace(anchor,()=>runtime+anchor);}
  for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(match[1].trim())new vm.Script(match[1]);
  return html;
}
function test(){
  const fixture='<script>const DATA='+JSON.stringify({cinque:{meta:{names:[]}},northern:{meta:{names:[]}}})+';function mountArtistSearch(){};/*artist-search:end*/function imageURLs(w,big=false){}</script>';
  const once=patch(fixture);const linked=JSON.parse(once.slice(once.indexOf('const DATA=')+11,once.indexOf(';function mountArtistSearch')));assert.equal(Object.keys(linked.cinque.meta.links).length,5);assert.equal(Object.keys(linked.northern.meta.links).length,15);assert.equal(patch(once),once);assert.equal((once.match(/registry-visibility:start/g)||[]).length,1);
  class El{constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.classList={contains:()=>false};this.textContent='';}append(...nodes){this.children.push(...nodes)}querySelector(s){return s==='#registry-extra-artists'?this.children.find(x=>x.id==='registry-extra-artists'):null}querySelectorAll(s){return s==='p.ar-muted'?[intro]:s==='a[data-artist]'?[existing]:[]}}
  const root=new El('main'),intro=new El('p'),existing=new El('a');intro.textContent='Это ориентиры для сопоставления, а не исчерпывающие определения каждого автора.';existing.dataset.artist='existing';let calls=0;
  const sandbox={document:{getElementById:()=>root,createElement:t=>new El(t)},location:{href:'https://example.org/games/painting/?old=1#x'},URL,ARTISTS:{existing:{name:'Already listed'},text_only:{name:'<script>not executable</script>',latin:'Text Only',works:[],bio:['Text'],aliases:['alias']},illustrated:{name:'Illustrated',works:[{}]}},mountArtistSearch:()=>{calls++;assert(root.querySelector('#registry-extra-artists'))}};
  vm.createContext(sandbox);vm.runInContext(runtime,sandbox);sandbox.mountArtistSearch();sandbox.mountArtistSearch();assert.equal(root.children.length,1);assert.equal(calls,2);const cards=root.children[0].children[1].children;assert.equal(cards.length,2);const links=cards.map(c=>c.children[0].children[0]);assert(links.some(a=>a.dataset.artist==='text_only'));assert(links.every(a=>new URL(a.href).searchParams.get('artist')===a.dataset.artist));assert(links.some(a=>a.textContent==='<script>not executable</script>'));
  console.log('PASS: syntax, idempotence, 20 guide links, missing artists, text-only artists, duplicate prevention, safe text, query links, search ordering');
}
if(process.argv.includes('--test'))test();else{const html=fs.readFileSync('index.html','utf8');fs.writeFileSync('index.html',patch(html));console.log('Complete registry visible before search indexing; batches 53-56 linked in guide.');}
