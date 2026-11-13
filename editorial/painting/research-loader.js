(()=>{'use strict';
let loading=false;
const ready=make('button','К готовым синопсисам');document.querySelector('nav').prepend(ready);
ready.onclick=()=>{$('#filter').value='review';const a=list()[0];if(a)local.current=a.id;save();render()};
const originalRender=render;
render=function(...args){originalRender(...args);const a=catalogue.find(a=>a.id===local.current),d=a&&local.dossiers[a.id];if(!d)return;const box=make('details');box.className='box';box.append(make('summary','Подтверждённые факты, свидетельства и ограничения'));for(const f of d.facts||[]){const p=make('p',f.text);for(const n of f.refs||[]){const s=d.sources?.[n-1];if(s){const link=make('a',' ['+n+']');link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';p.append(link)}}box.append(p)}for(const text of d.evidence||[])box.append(make('p',text));if(d.warnings?.length){box.append(make('h3','Что уточнить перед статьёй'));for(const text of d.warnings)box.append(make('p',text))}$('#editor').append(box)};
async function loadResearch(){
 if(loading||!catalogue.length)return;loading=true;
 try{
  const response=await fetch('research/manifest.json',{cache:'no-store'});if(!response.ok)throw Error('manifest HTTP '+response.status);const manifest=await response.json();if(manifest.schemaVersion!==1||!Array.isArray(manifest.packages))throw Error('Неверный индекс досье');
  const incoming=[];for(const path of manifest.packages){if(!/^[a-zA-Z0-9_-]+\.json$/.test(path))throw Error('Недопустимый путь пакета');const r=await fetch('research/'+path,{cache:'no-store'});if(!r.ok)throw Error(path+' HTTP '+r.status);const pack=await r.json();if(pack.schemaVersion!==1||!Array.isArray(pack.artists))throw Error('Неверный пакет '+path);incoming.push(...pack.artists)}
  const seen=new Set;for(const d of incoming){if(seen.has(d.id)||!catalogue.some(a=>a.id===d.id)||!d.synopsis||!Array.isArray(d.directions)||!Array.isArray(d.sources))throw Error('Неверное досье '+d.id);seen.add(d.id)}
  let updated=0;for(const item of incoming){const old=local.dossiers[item.id];if(old&&old._repoRevision>=item.revision)continue;local.dossiers[item.id]={...item,_repoRevision:item.revision};const draft=local.drafts[item.id];if(draft){if(draft.status==='unresearched')draft.status='review';else if(draft.status==='research')draft.status='returned';if(!draft.revision&&!draft.synopsis)draft.synopsis=item.synopsis;}updated++;}
  ready.textContent='К готовым синопсисам ('+catalogue.filter(a=>state(a)==='review').length+')';save();render();say('Исследовательских досье в репозитории: '+incoming.length+'. Обновлено: '+updated+'. Ваши правки сохранены. Остальной каталог ещё без досье.');
 }catch(error){say('Каталог доступен, но загрузка досье не завершена: '+error.message)}finally{loading=false}
}
const originalSync=sync;sync=async function(...args){await originalSync(...args);await loadResearch()};$('#sync').onclick=sync;
const sender=document.createElement('script');sender.src='github-send.js';sender.onerror=()=>say('Не загрузился модуль отправки GitHub. Правки сохранены; обновите страницу после публикации.');document.head.append(sender);
const packetStatus=document.createElement('script');packetStatus.src='github-packet-status.js';packetStatus.onerror=()=>say('Не загрузился статус разбиения. Исходные отправки не отменены; обновите страницу.');document.head.append(packetStatus);
let tries=0;function wait(){if(catalogue.length){loadResearch();return}if(++tries<200)setTimeout(wait,100)}wait();
})();
