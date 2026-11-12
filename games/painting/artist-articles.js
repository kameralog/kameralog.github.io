(()=>{'use strict';
const base=new URL('.',document.currentScript.src);
let articles=null;
const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
const link=(label,url)=>{const e=make('a',label);e.href=url;e.target='_blank';e.rel='noopener noreferrer';return e};
function picture(card){
 const source=card?.querySelector('img[data-ar-img]');if(!source)return null;
 const url=source.getAttribute('src');if(!url||!url.startsWith('https://'))return null;
 const figure=make('figure');figure.style.margin='1.5rem 0';
 const img=make('img');img.src=url;img.alt=source.alt;img.loading='lazy';img.style.cssText='display:block;width:100%;max-height:540px;object-fit:contain;background:#161616';
 const caption=make('figcaption',card.querySelector('h3')?.textContent||source.alt);
 const museum=card.querySelector('a[href]');if(museum){caption.append(' — ',link('Музейный источник',museum.href));}
 img.onerror=()=>{img.hidden=true;caption.prepend('Репродукция недоступна. ')};
 figure.append(img,caption);return figure;
}
function mount(){
 const page=document.querySelector('#artist-area.artist-page[data-save-artist]');if(!page||!articles)return;
 const id=page.dataset.saveArtist,a=articles[id];if(!a||page.querySelector('[data-mini-wiki]'))return;
 const before=page.querySelector('.ar-copy');if(!before)return;
 const box=make('article');box.dataset.miniWiki=id;box.className='ar-copy painting-mini-wiki';
 box.append(make('h2','Жизнь и творчество'));
 const cards=[...page.querySelectorAll('.ar-grid .ar-card')];
 const opening=picture(cards[0]);if(opening)box.append(opening);
 for(const [i,section] of a.sections.entries()){
  box.append(make('h3',section.title));
  for(const paragraph of section.paragraphs){const p=make('p',paragraph.text);const refs=make('span');refs.className='ar-muted';for(const n of paragraph.refs){const source=a.sources[n-1];refs.append(' ',link('['+n+']',source[1]));}p.append(refs);box.append(p);}
  if(i===1&&cards[1]){const fig=picture(cards[1]);if(fig)box.append(fig);}
 }
 const sources=make('details');sources.append(make('summary','Источники статьи'));const list=make('ol');for(const [title,url]of a.sources){const li=make('li');li.append(link(title,url));list.append(li);}sources.append(list);box.append(sources);
 page.insertBefore(box,before);
}
const host=document.getElementById('view');if(host)new MutationObserver(mount).observe(host,{childList:true,subtree:true});
fetch(new URL('artist-articles.json',base)).then(r=>{if(!r.ok)throw Error('Article data HTTP '+r.status);return r.json()}).then(data=>{if(data.schemaVersion!==1)throw Error('Unsupported article schema');articles=data.articles;mount()}).catch(e=>console.warn('Painting articles:',e.message));
})();
