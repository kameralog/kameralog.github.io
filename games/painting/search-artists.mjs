import fs from 'node:fs';
import vm from 'node:vm';
let html=fs.readFileSync('index.html','utf8');
const runtime=String.raw`/*artist-search:start*/
function artistSearchNormalize(value){return String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('ru').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
function artistMatchRanges(text,terms){
  let normalized='',offset=0;const starts=[],ends=[];
  for(const char of text){
    const value=char.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('ru').replace(/[^\p{L}\p{N}]+/gu,' ');
    for(let i=0;i<value.length;i++){normalized+=value[i];starts.push(offset);ends.push(offset+char.length);}
    if(!value&&ends.length)ends[ends.length-1]=offset+char.length;
    offset+=char.length;
  }
  const ranges=[];
  for(const term of new Set(terms))if(term)for(let i=normalized.indexOf(term);i!==-1;i=normalized.indexOf(term,i+1))ranges.push([starts[i],ends[i+term.length-1]]);
  ranges.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const merged=[];
  for(const range of ranges){const last=merged[merged.length-1];if(last&&range[0]<=last[1])last[1]=Math.max(last[1],range[1]);else merged.push(range);}
  return merged;
}
function highlightArtistCard(card,terms){
  const walker=document.createTreeWalker(card,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())if(!walker.currentNode.parentElement.closest('script,style,mark'))nodes.push(walker.currentNode);
  for(const node of nodes){
    const text=node.nodeValue,ranges=artistMatchRanges(text,terms);if(!ranges.length)continue;
    const fragment=document.createDocumentFragment();let last=0;
    for(const [start,end]of ranges){fragment.append(document.createTextNode(text.slice(last,start)));const mark=document.createElement('mark');mark.className='artist-search-hit';mark.textContent=text.slice(start,end);fragment.append(mark);last=end;}
    fragment.append(document.createTextNode(text.slice(last)));node.replaceWith(fragment);
  }
  return card;
}
function mountArtistSearch(){
  const root=document.getElementById('artist-area');
  if(!root||root.classList.contains('artist-page')||root.querySelector('#artist-search'))return;
  const intro=[...root.querySelectorAll('p.ar-muted')].find(p=>p.textContent.trim()==='Это ориентиры для сопоставления, а не исчерпывающие определения каждого автора.');
  if(!intro)return;
  const original=[];
  for(let n=intro.nextSibling;n;n=n.nextSibling)original.push(n);
  const tools=document.createElement('div');
  tools.className='artist-search-tools';
  tools.innerHTML='<input id="artist-search" type="search" placeholder="Художник, стиль или эпоха" aria-label="Поиск по художникам, стилям и эпохам" aria-controls="artist-search-results" autocomplete="off"><p id="artist-search-count" class="ar-muted" role="status" aria-live="polite"></p><p id="artist-search-empty" class="ar-muted" hidden>Ничего не найдено. Попробуй другое имя, стиль или эпоху.</p><div id="artist-search-results" class="ar-grid" hidden></div>';
  intro.after(tools);
  const list=document.createElement('div');
  list.id='artist-search-full-list';
  tools.after(list);
  list.append(...original);
  const input=tools.querySelector('input'),results=tools.querySelector('#artist-search-results');
  const index=new Map();
  for(const card of list.querySelectorAll('.ar-card')){
    const id=card.querySelector('a[data-artist]')?.dataset.artist;
    const key=id||card,a=ARTISTS[id]||{};
    const section=card.closest('section');
    const headings=[...section?.children||[]].filter(n=>/^H[23]$/.test(n.tagName)).map(n=>n.textContent);
    const parentHeadings=[...section?.parentElement?.children||[]].filter(n=>n.tagName==='H2').map(n=>n.textContent);
    const text=artistSearchNormalize([a.name,a.latin,a.life,a.tag,...(a.aliases||[]),...headings,...parentHeadings,card.textContent].join(' '));
    if(index.has(key))index.get(key).text+=' '+text;
    else index.set(key,{card,text});
  }
  function filter(){
    const terms=artistSearchNormalize(input.value).split(' ').filter(Boolean),active=terms.length>0;
    const matches=active?[...index.values()].filter(item=>terms.every(term=>item.text.includes(term))):[];
    list.hidden=active;
    results.hidden=!active||matches.length===0;
    results.replaceChildren(...matches.map(item=>highlightArtistCard(item.card.cloneNode(true),terms)));
    tools.querySelector('#artist-search-count').textContent=active?'Найдено художников: '+matches.length+' из '+index.size:'Всего художников: '+index.size;
    tools.querySelector('#artist-search-empty').hidden=!active||matches.length>0;
  }
  input.addEventListener('input',filter);
  input.addEventListener('search',filter);
  filter();
}
const showListBeforeSearch=showList;
showList=function(...args){showListBeforeSearch(...args);mountArtistSearch()};
/*artist-search:end*/
`;
const marker=/\/\*artist-search:start\*\/[\s\S]*?\/\*artist-search:end\*\/\n?/;
if(marker.test(html))html=html.replace(marker,()=>runtime);
else{
  const anchor='function imageURLs(w,big=false){';
  if(html.split(anchor).length!==2)throw Error('Artist imageURLs anchor changed');
  html=html.replace(anchor,()=>runtime+anchor);
}
const style='<style id="artist-search-style">#artist-area .artist-search-tools{margin:24px 0}#artist-area #artist-search{display:block;width:100%;max-width:740px;box-sizing:border-box}#artist-area .artist-search-tools p{margin:10px 0}#artist-area #artist-search-results{margin-top:20px}#artist-area [hidden]{display:none!important}#artist-area mark.artist-search-hit{background:#d2df98;color:#15200d;border-radius:3px;padding:0 .05em;box-decoration-break:clone;-webkit-box-decoration-break:clone}</style>';
const existing=/<style id="artist-search-style">[\s\S]*?<\/style>/;
if(existing.test(html))html=html.replace(existing,()=>style);
else{
  if(!html.includes('</head>'))throw Error('Missing head');
  html=html.replace('</head>',()=>style+'</head>');
}
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(match[1].trim())new vm.Script(match[1]);
fs.writeFileSync('index.html',html);
console.log('Artist search installed with highlighted matches in result cards.');
