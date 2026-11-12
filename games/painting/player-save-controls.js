import {saves,connectSaves} from './player-saves.js';
let catalogue=null,cataloguePromise=null,scheduled=false,noticeTimer=0;
const artists=new Map(),works=new Map();
const css=document.createElement('style');css.textContent=`.painting-save-row{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 20px}.painting-save-control{font:inherit;cursor:pointer;border:1px solid #58664b;border-radius:9px;background:#20271b;color:#f2efde;padding:10px 14px;min-height:44px;transition:opacity .24s,background-color .24s}.painting-save-control:focus-visible{outline:3px solid #d2df98;outline-offset:3px}.painting-save-control:disabled{cursor:wait;opacity:.65}.painting-save-control[data-state=saved]{border-color:#8b9a66;color:#d2df98}.painting-save-card{position:relative}.painting-save-card>.painting-save-heart,#artist-area .ar-card>.painting-save-heart{position:absolute;inset:auto 12px auto auto;top:12px;z-index:3;box-sizing:border-box;display:grid!important;place-items:center;width:44px!important;min-width:44px!important;max-width:44px!important;height:44px!important;min-height:44px!important;max-height:44px!important;flex:0 0 44px!important;padding:0!important;margin:0!important;background:#10130eea}.painting-save-heart svg{display:block;width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;pointer-events:none}.painting-save-heart[data-state=saved] svg{fill:currentColor}details.painting-save-card>summary{padding-right:64px}.painting-save-message{font:14px/1.5 system-ui;color:#d2df98;background:#10130e;border:1px solid #58664b;padding:10px 14px;position:sticky;bottom:12px;z-index:20}.painting-save-message:empty{display:none}@media(prefers-reduced-motion:reduce){.painting-save-control{transition:none}}`;document.head.append(css);
async function loadCatalogue(){
 if(catalogue)return catalogue;if(cataloguePromise)return cataloguePromise;
 cataloguePromise=(async()=>{
  const response=await fetch(new URL('./cabinet.html',location.href));if(!response.ok)throw Error('Catalogue unavailable');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');const parsed=JSON.parse(doc.getElementById('painting-save-catalog')?.textContent||'null');
  if(!Array.isArray(parsed)||!parsed.length)throw Error('Invalid catalogue');
  for(const a of parsed){artists.set(a.id,a);for(const w of a.works||[])works.set(w.key,{artist:a,work:w});}catalogue=parsed;return parsed;
 })().catch(e=>{cataloguePromise=null;throw e;});return cataloguePromise;
}
function announce(message,button){const parent=button?.closest('dialog')||document.body;let el=parent.querySelector(':scope > .painting-save-message');if(!el){el=document.createElement('p');el.className='painting-save-message';el.setAttribute('role','status');el.setAttribute('aria-live','polite');parent.append(el);}el.textContent=message;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{el.textContent='';},7000);}
function login(button){const shadow=document.getElementById('painting-account')?.shadowRoot,dialog=shadow?.querySelector('dialog');if(!dialog){announce('Вход ещё подключается. Повторите попытку.',button);return;}if(!shadow.__paintingSaveKeys){shadow.addEventListener('keydown',event=>event.stopPropagation());shadow.__paintingSaveKeys=true;}if(!dialog.open)shadow.getElementById('open').click();const m=shadow.getElementById('message');if(m)m.textContent='Войдите, затем нажмите кнопку сохранения ещё раз.';}
function paint(b,animateToken){
 const kind=b.dataset.saveKind,id=b.dataset.saveId,state=saves.state(kind,id),previous=b.dataset.state;
 if(previous!==state)b.dataset.state=state;
 const disabled=['connecting','checking','pending'].includes(state)||state==='saved'&&kind==='savedArtists';if(b.disabled!==disabled)b.disabled=disabled;
 const heart=b.classList.contains('painting-save-heart');
 const label=state==='saved'?(kind==='savedArtists'?'Сохранен':'Удалить картину из избранного'):state==='pending'?'Обновляем…':['connecting','checking'].includes(state)?'Проверяем…':kind==='savedArtists'?'Добавить в мои художники':'Добавить картину в избранное';
 if(b.getAttribute('aria-label')!==label)b.setAttribute('aria-label',label);
 if(b.title!==label)b.title=label;
 const busy=String(state==='pending');if(b.getAttribute('aria-busy')!==busy)b.setAttribute('aria-busy',busy);
 if(heart){const pressed=String(state==='saved');if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);}
 else if(b.textContent!==label)b.textContent=label;
 if(animateToken===kind+':'+id&&state==='saved'&&previous!=='saved'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)b.animate?.([{opacity:.35},{opacity:1}],{duration:240,easing:'ease-out'});
}
function make(kind,rawId,heart=false){
 const b=document.createElement('button');b.type='button';b.className='painting-save-control'+(heart?' painting-save-heart':'');b.dataset.saveKind=kind;b.dataset.saveRaw=rawId;b.dataset.saveId=encodeURIComponent(rawId);
 if(heart)b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
 b.addEventListener('keydown',e=>e.stopPropagation());
 b.addEventListener('click',async event=>{
  event.preventDefault();event.stopPropagation();
  try{
   await connectSaves();if(!saves.user){login(b);return;}
   if(['pending','checking','connecting'].includes(saves.state(kind,b.dataset.saveId)))return;
   const id=b.dataset.saveRaw,a=kind==='savedArtists'?artists.get(id):works.get(id)?.artist;
   if(!a||kind==='savedArtists'&&a.saveable===false)throw Error('Item unavailable');
   const data=kind==='savedArtists'?{artistId:a.id}:{artistId:a.id,workKey:id};
   const removing=kind==='favoriteWorks'&&saves.state(kind,b.dataset.saveId)==='saved';
   const ok=kind==='favoriteWorks'?await saves.toggle(kind,b.dataset.saveId,data):await saves.add(kind,b.dataset.saveId,data);
   if(ok)announce(kind==='savedArtists'?'Художник сохранен.':removing?'Картина удалена из избранного.':'Картина добавлена в избранное.',b);
  }catch{announce('Не удалось обновить сохранение. Проверьте соединение и повторите.',b);}
 });paint(b);return b;
}
function row(parent,anchor,kind,id){let box=parent.querySelector(':scope > .painting-save-row');if(!box){box=document.createElement('div');box.className='painting-save-row';anchor.after(box);}if(box.firstElementChild?.dataset.saveRaw===id)return;box.replaceChildren(make(kind,id));}
function mountHeart(card,key){if(!card||!works.has(key))return;const old=card.querySelector(':scope > .painting-save-heart');if(old?.dataset.saveRaw===key)return;old?.remove();card.classList.add('painting-save-card');card.append(make('favoriteWorks',key,true));}
async function mount(){
 if(!document.querySelector('#artist-area[data-save-artist],img[data-ar-img],img[data-art-key],img[data-save-work],.catalogcard [data-zoom],dialog[open][data-save-work]'))return;
 try{await loadCatalogue();}catch{return;}
 const area=document.querySelector('#artist-area[data-save-artist]');if(area&&artists.has(area.dataset.saveArtist)){const h=area.querySelector('h1');if(h)row(area,h,'savedArtists',area.dataset.saveArtist);}
 for(const img of document.querySelectorAll('img[data-ar-img],img[data-art-key],img[data-save-work]'))mountHeart(img.closest('article,details.reviewcard,.painting'),img.dataset.arImg||img.dataset.artKey||img.dataset.saveWork);
 for(const target of document.querySelectorAll('.catalogcard [data-zoom]'))mountHeart(target.closest('article.catalogcard'),target.dataset.zoom);
 for(const dialog of document.querySelectorAll('dialog[open][data-save-work]')){const key=dialog.dataset.saveWork;if(!works.has(key))continue;const caption=dialog.querySelector('#zoomCaption,#artist-caption');if(caption)row(dialog,caption.parentElement,'favoriteWorks',key);}
 connectSaves().catch(()=>{});
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});}
saves.subscribe(event=>{for(const b of document.querySelectorAll('.painting-save-control'))paint(b,event.saved);});
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','data-save-work','data-save-artist','data-zoom','data-art-key','data-ar-img']});schedule();
