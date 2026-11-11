const MODES={learn:'Обучение',exam:'Экзамен',review:'Повторение ошибок'};
const TOPICS={europe:'Европа',italian_century:'Италия: столетия',world:'Мировые традиции',all:'Все разделы'};
function valid(p){return p&&p.version===1&&p.quiz==='period'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(p.id)&&Object.hasOwn(MODES,p.mode)&&Object.hasOwn(TOPICS,p.topic)&&Number.isSafeInteger(p.startedAtMs)&&p.startedAtMs>=0&&Number.isSafeInteger(p.endedAtMs)&&p.endedAtMs>=p.startedAtMs&&p.endedAtMs<=8640000000000000&&Number.isInteger(p.answered)&&p.answered>0&&p.answered<=10&&Number.isInteger(p.correct)&&p.correct>=0&&p.correct<=p.answered&&Number.isInteger(p.hints)&&p.hints>=0&&p.hints<=p.answered&&Number.isInteger(p.skipped)&&p.skipped>=0&&p.skipped<=10000;}
function same(a,b){return ['version','quiz','id','mode','topic','startedAtMs','answered','correct','hints','skipped'].every(k=>a[k]===b[k]);}
const isPage=document.body.dataset.paintingStatistics==='page',prefix='painting.round.outbox.v1.';
let user=null,auth=null,db=null,F=null,busy=false,again=false,generation=0,rows=[],cursor=null,more=false,loading=false;
const memory=new Map();
const $=id=>document.getElementById(id);
function status(text){let p=$('stats-status');if(!p){p=document.createElement('p');p.id='stats-status';p.setAttribute('role','status');p.style.cssText='margin:12px 24px;font:13px system-ui;overflow-wrap:anywhere';document.body.append(p)}p.textContent=text;}
function storageKey(uid,id){return prefix+encodeURIComponent(uid)+'.'+id;}
function pending(uid){const all=new Map(memory);try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith(prefix))continue;try{const item=JSON.parse(localStorage.getItem(key));if(item&&valid(item.round)&&typeof item.uid==='string'&&key===storageKey(item.uid,item.round.id))all.set(key,item)}catch{}}}catch{}return [...all.entries()].filter(([,item])=>item.uid===uid);}
function keep(item){const key=storageKey(item.uid,item.round.id);memory.set(key,item);try{localStorage.setItem(key,JSON.stringify(item));return true}catch{return false}}
function forget(key){memory.delete(key);try{localStorage.removeItem(key)}catch{}}
window.PaintingStats=Object.freeze({
 newRun(){try{return {cloudId:crypto.randomUUID(),cloudOwner:user?.uid||null,cloudStartedAt:Date.now()}}catch{return {}}},
 complete(run){try{
  if(!run?.answers?.length)return;
  if(!run.cloudOwner||user?.uid!==run.cloudOwner){status('Раунд сохранён только в локальном прогрессе. Для облачной истории войдите до начала нового раунда.');return}
  const round={version:1,quiz:'period',id:run.cloudId,mode:run.mode,topic:run.topic,startedAtMs:run.cloudStartedAt,endedAtMs:Date.now(),answered:run.answers.length,correct:run.answers.filter(a=>a.correct===true).length,hints:run.answers.filter(a=>a.hint===true).length,skipped:run.skipped.length};
  if(!valid(round)){status('Раунд не отправлен: неподдерживаемые данные. Локальный прогресс игры не изменён.');return}
  const durable=keep({uid:run.cloudOwner,round});
  status(durable?'Результат ожидает отправки в аккаунт, в котором начат раунд.':'Очередь не удалось сохранить в браузере. Не закрывайте страницу до отправки результата.');
  flush();
 }catch{status('Не удалось подготовить облачный результат. Локальная игра продолжает работать.');}}
});
async function flush(){
 if(!user||!db||!navigator.onLine)return;
 if(busy){again=true;return}busy=true;const uid=user.uid;let sent=0;
 try{for(const [key,item]of pending(uid)){
  if(user?.uid!==uid||auth.currentUser?.uid!==uid)break;
  const ref=F.doc(db,'players',uid,'rounds',item.round.id);
  await F.runTransaction(db,async tx=>{
   if(auth.currentUser?.uid!==uid)throw Error('account-changed');
   const found=await tx.get(ref);
   if(found.exists()){if(!same(found.data(),item.round))throw Error('round-conflict');return}
   tx.set(ref,{...item.round,receivedAt:F.serverTimestamp()});
  });
  forget(key);sent++;
 }
 if(user?.uid===uid){const left=pending(uid).length;status(left?'Ожидают отправки: '+left+'.':'Неотправленных раундов этого аккаунта нет.');if(sent&&isPage)load(false);}
 }catch(e){if(user?.uid===uid)status(e.code==='permission-denied'?'База не разрешает запись статистики. Результат оставлен в очереди.':e.message==='round-conflict'?'Обнаружен конфликт ID раунда. Запись не перезаписана.':'Не удалось отправить результат. Он остаётся в очереди; повторите при наличии связи.');}
 finally{busy=false;if(again){again=false;queueMicrotask(flush)}}
}
function draw(){
 if(!isPage)return;
 const list=$('stats-list');list.replaceChildren();
 let answered=0,correct=0,hints=0;
 for(const p of rows){answered+=p.answered;correct+=p.correct;hints+=p.hints;const article=document.createElement('article'),h=document.createElement('h2'),text=document.createElement('p');h.textContent=new Date(p.endedAtMs).toLocaleString('ru-RU');text.textContent=MODES[p.mode]+' · '+TOPICS[p.topic]+' · '+p.correct+' из '+p.answered+' · с подсказкой: '+p.hints+' · пропущено: '+p.skipped;article.append(h,text);list.append(article)}
 $('stats-summary').textContent='Итоги по загруженным раундам'+': '+rows.length+' раундов, '+correct+' из '+answered+' ответов'+(answered?' ('+Math.round(correct/answered*100)+'%)':'')+', с подсказкой: '+hints+'.';
 if(!rows.length)list.textContent='Сохранённых раундов пока нет. История появится после новых игр, начатых с входом в аккаунт.';
 $('stats-more').hidden=!more;
}
async function load(append=false){
 if(!isPage||!user||!db||loading)return;
 const uid=user.uid,stamp=generation;loading=true;$('stats-more').disabled=true;
 try{const constraints=[F.orderBy('endedAtMs','desc'),F.limit(50)];if(append&&cursor)constraints.push(F.startAfter(cursor));
 const snapshot=await F.getDocsFromServer(F.query(F.collection(db,'players',uid,'rounds'),...constraints));
 if(stamp!==generation||user?.uid!==uid)return;
 const data=snapshot.docs.map(d=>d.data()).filter(valid);const combined=append?[...rows,...data]:data;rows=[...new Map(combined.map(p=>[p.id,p])).values()];cursor=snapshot.docs.at(-1)||null;more=snapshot.size===50;$('stats-history-status').textContent='';draw();
 }catch(e){if(stamp===generation)$('stats-history-status').textContent=(e.code==='permission-denied'?'Правила базы не разрешают чтение статистики.':'История сейчас не загружена с сервера. Проверьте соединение и нажмите «Обновить».');}
 finally{if(stamp===generation){loading=false;$('stats-more').disabled=false}}
}
function navigation(){
 const showStatistics=!!user&&document.body.dataset.playerCabinet==='page';
 document.querySelectorAll('[data-statistics-link]').forEach(link=>{link.hidden=!showStatistics});
 const existing=$('painting-statistics-link');
 const account=$('painting-account-nav')||$('stats-account')||document.querySelector('body[data-player-cabinet="page"] main>header nav #account-button');
 if(account?.parentElement&&account.nextElementSibling)account.parentElement.append(account);
 if(!showStatistics){existing?.remove();return}
 if(!account?.parentElement)return;
 let button=existing;
 if(!button){button=document.createElement('button');button.id='painting-statistics-link';button.type='button';button.textContent='Статистика';button.onclick=()=>location.href=new URL('./statistics.html',location.href).href;}
 if(button.parentElement!==account.parentElement||button.nextElementSibling!==account)account.before(button);
}
const navObserver=new MutationObserver(navigation);navObserver.observe(document.body,{childList:true,subtree:true});navigation();
if(isPage){$('stats-more').onclick=()=>load(true);$('stats-refresh').onclick=()=>{flush();load(false)};$('stats-account').onclick=()=>document.getElementById('painting-account')?.shadowRoot?.getElementById('open')?.click();}
window.addEventListener('online',()=>{flush();if(isPage)load(false)});
window.addEventListener('storage',e=>{if(e.key?.startsWith(prefix))flush()});
try{
 const [App,A,Fire]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js')]);
 let app;for(let i=0;i<150;i++){app=App.getApps().find(a=>a.name==='painting-player');if(app)break;await new Promise(r=>setTimeout(r,200))}if(!app)throw Error('auth-not-ready');
 auth=A.getAuth(app);F=Fire;db=F.getFirestore(app);
 const note=document.getElementById('painting-account')?.shadowRoot?.querySelector('dialog>small:last-child');if(note)note.textContent='Можно закрыть окно и продолжить игру. Избранное доступно в кабинете, отправку новых завершённых раундов можно проверить в разделе «Статистика».';
 A.onAuthStateChanged(auth,u=>{generation++;user=u;navigation();document.dispatchEvent(new CustomEvent('painting:stats-owner',{detail:{uid:u?.uid||null}}));rows=[];cursor=null;more=false;loading=false;
  if(isPage){$('stats-list').replaceChildren();$('stats-summary').textContent='';$('stats-more').hidden=true;$('stats-refresh').disabled=!u;}
  if(!u){status('Войдите до начала раунда, чтобы новые результаты сохранялись в облаке.');return}
  status('Аккаунт подключён. Ожидают отправки: '+pending(u.uid).length+'.');flush();if(isPage)load(false);
 });
}catch{status('Облачная статистика временно недоступна. Игра и её локальный прогресс продолжают работать.');}
