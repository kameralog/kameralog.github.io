import fs from 'node:fs';
import vm from 'node:vm';
let html=fs.readFileSync('index.html','utf8');
const prefix='const DATA=';
const start=html.indexOf(prefix)+prefix.length;
if(start<prefix.length||html.indexOf(prefix,start)>=0)throw Error('Expected one DATA');
let depth=0,quoted=false,escaped=false,end=-1;
for(let i=start;i<html.length;i++){
  const c=html[i];
  if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}
  else if(c==='"')quoted=true;
  else if(c==='{')depth++;
  else if(c==='}'&&--depth===0){end=i+1;break;}
}
if(end<0)throw Error('Unclosed DATA');
const data=JSON.parse(html.slice(start,end));
const years={byzantine:330,italo_byzantine:1250,gothic:1370,northern:1400,mannerism:1520,baroque:1600,dutch17:1600,classic17:1620,rococo:1715,neo:1750,romantic:1790,biedermeier:1815,hudson_river:1825,realism:1840,preraphaelite:1848,impression:1860,tonalism:1880,post:1880,symbolism:1880,naive:1880,neoimpressionism:1886,italian_divisionism:1890,mir_iskusstva:1898,american_modernism:1900,american_realism20:1900,russian_avantgarde:1905,fauvism:1905,expressionism:1905,cubism:1907,jack_of_diamonds:1910,rayonism:1912,analytical:1914,suprematism:1915,constructivism:1915,dada:1916,de_stijl:1917,mexican_muralism:1920,surrealism:1924,abstract_expressionism:1940,british_figurative_postwar:1945,neo_dada:1954,pop_art:1955,contemporary_photo_abstraction:1960,street_art:1970,kitsch:1998,superflat:2000};
const entries=Object.entries(data);
const sortable=([,c])=>c.group==='europe'||c.group==='modern_contexts';
const ordered=entries.filter(sortable).sort((a,b)=>(years[a[0]]??9999)-(years[b[0]]??9999));
let index=0;
const next=Object.fromEntries(entries.map(entry=>sortable(entry)?ordered[index++]:entry));
for(const [,c]of Object.entries(next))if(c.group==='modern_contexts')c.group='europe';
html=html.slice(0,start)+JSON.stringify(next)+html.slice(end);
const sections=Object.entries(next).map(([id,c])=>({id,title:c.title,group:c.group,names:c.meta.names,links:c.meta.links||{}}));
const helper=`/*chronology-artists:start*/
const CHRONO_SECTIONS=${JSON.stringify(sections)};
function chronologicalArtists(){
  const normalize=s=>String(s).normalize('NFKD').replace(/\\p{M}/gu,'').toLowerCase().replace(/[^\\p{L}\\p{N}]/gu,'');
  const artists=Object.entries(ARTISTS),used=new Set();
  const groups=new Map();
  for(const section of CHRONO_SECTIONS){
    const names=new Set(section.names.map(normalize));
    const ids=new Set(Object.values(section.links));
    const selected=artists.filter(([id,a])=>ids.has(id)||[a.name,a.latin,...(a.aliases||[])].some(n=>n&&names.has(normalize(n))));
    for(const [id]of selected)used.add(id);
    if(selected.length){if(!groups.has(section.group))groups.set(section.group,[]);groups.get(section.group).push({section,selected});}
  }
  const labels={europe:'Эпохи, стили и направления',italian_century:'Италия: столетия',china:'Китай',japan:'Япония',japan_school:'Японские традиции',korea:'Корея',india:'Индия',mesoamerica:'Мезоамерика',egypt:'Египет'};
  let result='<p class="ar-muted">Направления расположены по времени возникновения; их периоды могут перекрываться. Один художник может встречаться в нескольких разделах.</p>';
  for(const [group,items]of groups)result+='<section><h2>'+html(labels[group]||group)+'</h2>'+items.map(({section,selected})=>'<section><h3>'+html(section.title)+'</h3><div class="ar-grid">'+selected.map(([id,a])=>artcard(id,a)).join('')+'</div></section>').join('')+'</section>';
  const other=artists.filter(([id])=>!used.has(id));
  if(other.length)result+='<section><h2>Другие художники</h2><p class="ar-muted">Карточки без привязки к разделам справочника. Сохранён прежний порядок.</p><div class="ar-grid">'+other.map(([id,a])=>artcard(id,a)).join('')+'</div></section>';
  return result;
}
/*chronology-artists:end*/
`;
const marker=/\/\*chronology-artists:start\*\/[\s\S]*?\/\*chronology-artists:end\*\/\n?/;
if(marker.test(html))html=html.replace(marker,()=>helper);
else{
  const anchor='function showList(){';
  if(html.split(anchor).length!==2)throw Error('Artist list function changed');
  html=html.replace(anchor,()=>helper+anchor);
  const grid='<div class="ar-grid">${Object.entries(ARTISTS).map(([id,a])=>artcard(id,a)).join(\'\')}</div>';
  if(html.split(grid).length!==2)throw Error('Artist grid changed');
  html=html.replace(grid,()=> '${chronologicalArtists()}');
}
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(match[1].trim())new vm.Script(match[1]);
fs.writeFileSync('index.html',html);
console.log('Chronological sections shared by guide and artists; Italian centuries and other regional groups preserved.');
