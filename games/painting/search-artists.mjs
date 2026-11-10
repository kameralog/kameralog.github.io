import fs from 'node:fs';
import vm from 'node:vm';
let html=fs.readFileSync('index.html','utf8');
const runtime="/*artist-search:start*/\nfunction artistSearchNormalize(value){return String(value??'').normalize('NFKD').replace(/\\p{M}/gu,'').toLocaleLowerCase('ru').replace(/[^\\p{L}\\p{N}]+/gu,' ').trim()}\nfunction mountArtistSearch(){\n  const root=document.getElementById('artist-area');\n  if(!root||root.classList.contains('artist-page')||root.querySelector('#artist-search'))return;\n  const intro=[...root.querySelectorAll('p.ar-muted')].find(p=>p.textContent.trim()==='Это ориентиры для сопоставления, а не исчерпывающие определения каждого автора.');\n  if(!intro)return;\n  const tools=document.createElement('div');\n  tools.className='artist-search-tools';\n  tools.innerHTML='<input id=\"artist-search\" type=\"search\" placeholder=\"Художник, стиль или эпоха\" aria-label=\"Поиск по художникам, стилям и эпохам\" autocomplete=\"off\"><p id=\"artist-search-count\" class=\"ar-muted\" role=\"status\" aria-live=\"polite\"></p><p id=\"artist-search-empty\" class=\"ar-muted\" hidden>Ничего не найдено. Попробуй другое имя, стиль или эпоху.</p>';\n  intro.after(tools);\n  const input=tools.querySelector('input');\n  const cards=[...root.querySelectorAll('.ar-card')].map(card=>{\n    const id=card.querySelector('a[data-artist]')?.dataset.artist;\n    const a=ARTISTS[id]||{};\n    const section=card.closest('section');\n    const headings=[...section?.children||[]].filter(n=>/^H[23]$/.test(n.tagName)).map(n=>n.textContent);\n    const parentHeadings=[...section?.parentElement?.children||[]].filter(n=>n.tagName==='H2').map(n=>n.textContent);\n    return {card,id,text:artistSearchNormalize([a.name,a.latin,a.life,a.tag,...(a.aliases||[]),...headings,...parentHeadings,card.textContent].join(' '))};\n  });\n  function filter(){\n    const terms=artistSearchNormalize(input.value).split(' ').filter(Boolean);\n    const ids=new Set();\n    let visible=0;\n    for(const item of cards){item.card.hidden=!terms.every(term=>item.text.includes(term));if(!item.card.hidden){visible++;ids.add(item.id||item.card);}}\n    for(const section of [...root.querySelectorAll('section')].reverse()){\n      const children=[...section.querySelectorAll('.ar-card')];\n      if(children.length)section.hidden=children.every(card=>card.hidden);\n    }\n    tools.querySelector('#artist-search-count').textContent='Найдено художников: '+ids.size+' из '+new Set(cards.map(item=>item.id||item.card)).size;\n    tools.querySelector('#artist-search-empty').hidden=visible>0;\n  }\n  input.addEventListener('input',filter);\n  input.addEventListener('search',filter);\n  filter();\n}\nconst showListBeforeSearch=showList;\nshowList=function(...args){showListBeforeSearch(...args);mountArtistSearch()};\n/*artist-search:end*/\n";
const marker=/\/\*artist-search:start\*\/[\s\S]*?\/\*artist-search:end\*\/\n?/;
if(marker.test(html))html=html.replace(marker,()=>runtime);
else{
  const anchor='function imageURLs(w,big=false){';
  if(html.split(anchor).length!==2)throw Error('Artist imageURLs anchor changed');
  html=html.replace(anchor,()=>runtime+anchor);
}
const style='<style id="artist-search-style">#artist-area .artist-search-tools{margin:24px 0}#artist-area #artist-search{display:block;width:100%;max-width:740px;box-sizing:border-box}#artist-area .artist-search-tools p{margin:10px 0}#artist-area [hidden]{display:none!important}</style>';
const existing=/<style id="artist-search-style">[\s\S]*?<\/style>/;
if(existing.test(html))html=html.replace(existing,()=>style);
else{
  if(!html.includes('</head>'))throw Error('Missing head');
  html=html.replace('</head>',()=>style+'</head>');
}
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(match[1].trim())new vm.Script(match[1]);
fs.writeFileSync('index.html',html);
console.log('Artist search installed: names, aliases, styles and sections.');
