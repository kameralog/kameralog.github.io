const host=document.createElement('section');
host.id='painting-cabinet';
const s=host.attachShadow({mode:'open'});
s.innerHTML=`<style>:host{position:fixed;right:12px;bottom:62px;z-index:9999;font:15px system-ui;color:#222}button,input{font:inherit}button{padding:8px 12px;cursor:pointer;border:1px solid #aaa;border-radius:8px;background:white;color:#222}button:disabled{opacity:.5;cursor:wait}dialog{width:min(760px,calc(100vw - 48px));max-height:80vh;overflow:auto;border:1px solid #aaa;border-radius:16px;padding:20px;background:white;color:#222}dialog::backdrop{background:#0007}.row{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}input{box-sizing:border-box;width:100%;padding:10px}article{border-top:1px solid #ddd;padding:12px 0}p{line-height:1.45}a{color:#235e8b}#close{float:right}[hidden]{display:none!important}button.save-state{min-height:46px;transition:opacity .24s ease,background-color .24s ease,border-color .24s ease}button.save-state:disabled{cursor:wait}button.save-state[data-save-state=saved]:disabled{opacity:.78;cursor:default;border-color:#8b9a66!important;background:#252d1f!important;color:#d2df98!important}@media(prefers-reduced-motion:reduce){button.save-state{transition:none}}</style><button id="open">Мой кабинет</button><dialog aria-labelledby="heading"><button id="close" aria-label="Закрыть">×</button><h2 id="heading">Мой кабинет</h2><p id="status" role="status" aria-live="polite">Подключаем кабинет…</p><div id="tools" hidden><div class="row"><button data-tab="savedArtists">Мои художники</button><button data-tab="favoriteWorks">Избранные картины</button><button data-tab="catalog">Добавить из каталога</button><button id="refresh">Обновить</button></div><input id="search" type="search" placeholder="Поиск по художнику или названию картины" aria-label="Поиск в каталоге" hidden><div id="list"></div><button id="more" hidden>Показать ещё</button></div><p id="msg" role="status" aria-live="polite"></p></dialog>`;
document.body.append(host);
const $=id=>s.getElementById(id),dialog=s.querySelector('dialog');
let user=null,db=null,F=null,tab='savedArtists',epoch=0,cursor=null,rows=[],busy=false,loading=false;
const catalog=JSON.parse(document.getElementById('painting-save-catalog')?.textContent||'[]');
const artists=new Map(catalog.map(a=>[a.id,a]));
function say(t){$('msg').textContent=t;}
function link(id,label){const a=document.createElement('a');const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('artist',id);a.href=u.href;a.textContent=label;return a;}
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b;}
function status(){ $('tools').hidden=!user||!db;$('status').textContent=user?'Личные сохранения: '+(user.displayName||user.email||'Игрок'):'Чтобы сохранять, войдите через кнопку «Вход / профиль».';}
function key(kind,id){return encodeURIComponent(id);}
function reference(uid,kind,id){return F.doc(db,'players',uid,kind,key(kind,id));}
function error(e){return e.code==='permission-denied'?'База не разрешает доступ. Проверьте правила Firestore для players/{uid}.':'Не удалось связаться с базой. Проверьте соединение и повторите.';}
const savedKinds=['savedArtists','favoriteWorks'];
const savedIds={savedArtists:new Set(),favoriteWorks:new Set()},checked={savedArtists:false,favoriteWorks:false},pending=new Set();
let accountVersion=0,stopSaved=[];
function token(kind,id){return kind+':'+id;}
function paintSave(b,animate=false){
 const kind=b.dataset.saveKind,id=b.dataset.saveId,waiting=pending.has(token(kind,id));
 const done=savedIds[kind].has(id),checking=!!user&&!checked[kind];
 const next=waiting?'pending':done?'saved':checking?'checking':'idle';
 const previous=b.dataset.saveState;
 b.dataset.saveState=next;b.disabled=next!=='idle';
 b.textContent=waiting?'Сохраняем…':done?(kind==='savedArtists'?'Сохранен':'В избранном'):checking?'Проверяем…':kind==='savedArtists'?'Сохранить художника':'В избранные картины';
 if(animate&&done&&!waiting&&previous!=='saved'&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches&&b.animate)b.animate([{opacity:.35},{opacity:.78}],{duration:240,easing:'ease-out'});
}
function paintSaves(animateToken){for(const b of s.querySelectorAll('button[data-save-kind]'))paintSave(b,token(b.dataset.saveKind,b.dataset.saveId)===animateToken);}
function saveButton(kind,artist,work){const b=button('',()=>save(kind,artist,work));b.className='save-state';b.dataset.saveKind=kind;b.dataset.saveId=key(kind,work?work.key:artist.id);paintSave(b);return b;}
function watchSaved(){
 accountVersion++;for(const stop of stopSaved)stop();stopSaved=[];pending.clear();
 for(const kind of savedKinds){savedIds[kind].clear();checked[kind]=false;}
 paintSaves();if(!user||!db||!F)return;
 const version=accountVersion,uid=user.uid;
 for(const kind of savedKinds)stopSaved.push(F.onSnapshot(F.collection(db,'players',uid,kind),{includeMetadataChanges:true},snapshot=>{
  if(version!==accountVersion||user?.uid!==uid||snapshot.metadata.fromCache||snapshot.metadata.hasPendingWrites)return;
  savedIds[kind]=new Set(snapshot.docs.map(d=>d.id));checked[kind]=true;paintSaves();
 },e=>{if(version!==accountVersion||user?.uid!==uid)return;checked[kind]=true;paintSaves();say(error(e));}));
}
async function save(kind,artist,work){
 if(!user||!db||!F){say('Сначала войдите через «Вход / профиль».');return;}
 const uid=user.uid,stamp=epoch,version=accountVersion,id=work?work.key:artist.id,encoded=key(kind,id),tag=token(kind,encoded);
 if(savedIds[kind].has(encoded)){paintSaves();return;}
 if(busy||pending.has(tag)){say('Дождитесь завершения предыдущей операции.');return;}
 busy=true;pending.add(tag);paintSaves();say('Сохраняем…');
 try{
  await F.setDoc(reference(uid,kind,id),work?{artistId:artist.id,workKey:work.key}:{artistId:artist.id});
  if(version===accountVersion&&user?.uid===uid){savedIds[kind].add(encoded);pending.delete(tag);paintSaves(tag);if(stamp===epoch)say('Сохранено в вашем кабинете.');}
 }catch(e){if(version===accountVersion&&user?.uid===uid&&stamp===epoch)say(error(e));}
 finally{busy=false;if(version===accountVersion){pending.delete(tag);paintSaves();}}
}
async function remove(kind,id){
 if(!user||busy)return;const uid=user.uid,stamp=epoch,version=accountVersion;busy=true;say('Удаляем…');
 try{await F.deleteDoc(F.doc(db,'players',uid,kind,id));if(version===accountVersion&&user?.uid===uid){savedIds[kind].delete(id);paintSaves();if(stamp===epoch){rows=rows.filter(r=>r.id!==id);drawSaved();say('Удалено.');}}}
 catch(e){if(version===accountVersion&&stamp===epoch)say(error(e));}finally{busy=false;}
}
function article(artist,work){const el=document.createElement('article');el.append(link(artist.id,work?work.title||work.key:artist.name));if(work){const p=document.createElement('p');p.textContent=artist.name;el.append(p);}return el;}
function drawSaved(){
 $('list').replaceChildren();
 if(!rows.length){$('list').textContent='Здесь пока ничего нет. Откройте «Добавить из каталога».';return;}
 for(const r of rows){const a=artists.get(r.artistId),w=a?.works.find(w=>w.key===r.workKey);let el;
  if(a){el=article(a,tab==='favoriteWorks'?(w||{title:'Работа больше не найдена в каталоге',key:r.workKey}):null);}
  else{el=document.createElement('article');el.textContent='Художник больше не найден в каталоге: '+r.artistId;}
  el.append(button('Удалить из сохранённого',()=>remove(tab,r.id)));$('list').append(el);
 }
}
async function load(more=false){
 if(!user||!db||tab==='catalog'||loading)return;
 const uid=user.uid,stamp=epoch,kind=tab;loading=true;$('more').disabled=true;say('Загружаем…');
 try{const constraints=[F.orderBy(F.documentId()),F.limit(50)];if(more&&cursor)constraints.push(F.startAfter(cursor));
 const result=await F.getDocsFromServer(F.query(F.collection(db,'players',uid,kind),...constraints));
 if(stamp!==epoch||user?.uid!==uid||tab!==kind)return;
 const next=result.docs.map(d=>({...d.data(),id:d.id}));rows=more?rows.concat(next):next;cursor=result.docs.at(-1)||null;
 $('more').hidden=result.size<50;drawSaved();say('Загружено сохранений: '+rows.length+'.');
 }catch(e){if(stamp===epoch)say(error(e));}finally{if(stamp===epoch){loading=false;$('more').disabled=false;}}
}
function drawCatalog(){
 const terms=$('search').value.toLocaleLowerCase('ru').trim().split(/\s+/).filter(Boolean);
 $('list').replaceChildren();let count=0,shown=0;
 for(const a of catalog){
  const matches=text=>terms.every(t=>text.toLocaleLowerCase('ru').includes(t));
  if(matches([a.name,a.latin,a.tag,...(a.aliases||[])].join(' '))){count++;if(shown++<30){const el=article(a);el.append(saveButton('savedArtists',a));$('list').append(el);}}
  for(const w of a.works)if(matches([a.name,w.title,w.originalTitle].join(' '))){count++;if(shown++<30){const el=article(a,w);el.append(saveButton('favoriteWorks',a,w));$('list').append(el);}}
 }
 say(count?'Найдено: '+count+'. Показаны первые '+Math.min(count,30)+'. Уточните поиск, чтобы сузить список.':'Ничего не найдено.');
}
function select(next){epoch++;loading=false;tab=next;rows=[];cursor=null;$('list').replaceChildren();$('more').hidden=true;$('search').hidden=tab!=='catalog';if(tab==='catalog')drawCatalog();else load();}
$('open').onclick=()=>{dialog.showModal();status();if(user&&db)select(tab);};
$('close').onclick=()=>dialog.close();
s.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>select(b.dataset.tab));
$('search').oninput=drawCatalog;$('refresh').onclick=()=>select(tab);$('more').onclick=()=>load(true);
try{
 const [App,A,Fire]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js')]);
 let app;for(let i=0;i<100;i++){app=App.getApps().find(a=>a.name==='painting-player');if(app)break;await new Promise(r=>setTimeout(r,200));}
 if(!app)throw Error('Auth app unavailable');F=Fire;db=F.getFirestore(app);
 A.onAuthStateChanged(A.getAuth(app),u=>{epoch++;user=u;rows=[];cursor=null;$('list').replaceChildren();$('more').hidden=true;say('');status();watchSaved();if(dialog.open&&user)select(tab);});
}catch(e){$('status').textContent='Кабинет временно недоступен. Игра и отдельное окно входа остаются доступны.';}
