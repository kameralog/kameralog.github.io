(()=>{'use strict';
const PREFIX='coordination/painting-editor/inbox/';
const encode=text=>{let s='';for(const n of new TextEncoder().encode(text))s+=String.fromCharCode(n);return btoa(s)};
const decode=obj=>{if(!obj||obj.encoding!=='base64')throw Error('GitHub не вернул содержимое файла');return new TextDecoder().decode(Uint8Array.from(atob(obj.content.replace(/\s/g,'')),c=>c.charCodeAt(0)))};
async function hash(text){return [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
function brief(a,d,dossier){return {id:a.id,name:a.name,status:d.status,mainDirection:String(d.customDirection||'').trim()||(dossier?.directions||[]).find(x=>x.id===d.selectedDirection)?.title||'',customDirection:String(d.customDirection||''),selectedDirection:String(d.selectedDirection||''),synopsis:String(d.synopsis||''),researchNote:String(d.researchNote||''),editorRevision:d.revision||0,dossierRevision:dossier?.revision||0,sources:dossier?.sources||a.sources||[],facts:dossier?.facts||[],evidence:dossier?.evidence||[],warnings:dossier?.warnings||[]}}
async function deliver(p,api){
 if(!p||await hash(p.text)!==p.hash||p.path!==PREFIX+p.hash+'.json')throw Error('Сохранённый пакет повреждён');
 const endpoint='contents/'+p.path;let commit;
 const existing=await api(endpoint+'?ref=main');
 if(existing){if(decode(existing)!==p.text)throw Error('Конфликт: существующий файл отличается. Перезапись запрещена.');const history=await api('commits?sha=main&per_page=1&path='+encodeURIComponent(p.path));commit=history?.[0]?.sha;}
 else {const result=await api(endpoint,'PUT',{message:'Submit '+p.kind+' ('+p.count+' artists)',branch:'main',content:encode(p.text)});commit=result?.commit?.sha;}
 if(!/^[0-9a-f]{40}$/.test(commit||''))throw Error('GitHub не подтвердил коммит. Повторите проверку пакета.');
 const stored=await api(endpoint+'?ref='+commit);if(decode(stored)!==p.text)throw Error('Запись не подтверждена повторным чтением. Повторите проверку.');
 return {commit,path:p.path,url:'https://github.com/kameralog/kameralog.github.io/commit/'+commit};
}
if(typeof module!=='undefined')module.exports={brief,hash,encode,decode,deliver};
if(typeof document==='undefined')return;
let busy=false;
const nav=document.querySelector('nav'),button=[...nav.querySelectorAll('button')].find(b=>b.disabled&&b.textContent.includes('Отправка в GitHub'));
if(!button)return;button.disabled=false;button.textContent='Отправить копирайтеру';
const dialog=document.createElement('dialog');dialog.style.cssText='width:min(850px,94vw);max-height:90vh;overflow:auto;border:1px solid #87988d;border-radius:10px;padding:22px';
dialog.append(make('h2','Отправка редакционного пакета в GitHub'));
dialog.append(make('p','Репозиторий: kameralog/kameralog.github.io · main. Записываются только новые файлы в coordination/painting-editor/inbox/. Репозиторий публичный: синопсисы и замечания будут доступны всем. Статьи сайта не публикуются.'));
const kind=document.createElement('select');for(const [value,text]of [['approved','Утверждённые задания'],['research','Запросы на доисследование']]){const o=make('option',text);o.value=value;kind.append(o)}dialog.append(kind);
const prepare=make('button','Подготовить предпросмотр'),resume=make('button','Проверить / повторить незавершённую отправку'),close=make('button','Закрыть');dialog.append(prepare,resume,close);
const preview=make('pre');preview.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-height:300px;overflow:auto;background:#f4f2ed;padding:12px';
const full=document.createElement('details');full.append(make('summary','Полное содержимое отправляемого файла'),preview);dialog.append(full);
const description=make('p','Сначала подготовьте пакет. Повторно отправленные неизменённые версии исключаются.');dialog.append(description);
const help=make('a','Как создать ограниченный ключ GitHub');help.href='github-send-help.html';help.target='_blank';help.rel='noopener noreferrer';dialog.append(help);
const label=make('label','Ключ GitHub — только для этой отправки. В чат не присылать.');const token=document.createElement('input');token.type='password';token.autocomplete='off';token.spellcheck=false;dialog.append(label,token);
const consent=document.createElement('input');consent.type='checkbox';consent.style.width='auto';const consentLabel=make('label');consentLabel.append(consent,' Подтверждаю состав пакета и публичную запись в указанный репозиторий.');dialog.append(consentLabel);
const send=make('button','Записать этот пакет в GitHub');send.disabled=true;dialog.append(send);const result=make('p');result.setAttribute('role','status');dialog.append(result);document.body.append(dialog);
let selected=null;
function persist(){localStorage.setItem(KEY,JSON.stringify(local))}
function display(p){selected=p;preview.textContent=p.text;const data=JSON.parse(p.text);description.textContent=p.count+' художников: '+data.artists.map(a=>a.name).join(', ')+'. Файл: '+p.path;consent.checked=false;send.disabled=false;result.textContent='Предпросмотр готов. При записи ключ отправляется только на api.github.com и не сохраняется приложением.';}
button.onclick=()=>{if(busy)return;selected=null;send.disabled=true;token.value='';consent.checked=false;preview.textContent='';result.textContent='';resume.disabled=!local.githubPending;dialog.showModal()};
close.onclick=()=>{if(!busy){token.value='';dialog.close()}};dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();else token.value=''});
resume.onclick=()=>{try{if(!local.githubPending)throw Error('Нет незавершённой отправки');display(local.githubPending)}catch(e){result.textContent=e.message}};
prepare.onclick=async()=>{try{
 if(local.githubPending)throw Error('Есть неподтверждённый пакет. Сначала нажмите «Проверить / повторить незавершённую отправку», чтобы не создать дубликат.');
 const target=kind.value,receipts=local.githubReceipts||{},entries=[];
 for(const a of catalogue){const d=local.drafts[a.id];if(!d||d.status!==target)continue;const b=brief(a,d,local.dossiers[a.id]);if(target==='approved'&&(!b.mainDirection||!b.synopsis.trim()))throw Error('Неполное задание: '+a.name);if(target==='research'&&!b.mainDirection&&!b.researchNote.trim())throw Error('Нет вопроса для '+a.name);const fingerprint=await hash(JSON.stringify(b));if(receipts[target+':'+a.id]?.fingerprint===fingerprint)continue;entries.push({brief:b,fingerprint});}
 if(!entries.length)throw Error('Новых заданий этого типа нет. Уже отправленные неизменённые версии не дублируются.');
 if(entries.length>50)throw Error('В пакете больше 50 заданий. Используйте экспорт для резервной копии; массовую отправку свыше 50 подключим отдельно.');
 const payload={schemaVersion:1,kind:target==='approved'?'approved-editorial-briefs':'research-requests',sourceCommit:meta.sourceCommit||null,submittedAt:new Date().toISOString(),artists:entries.map(e=>e.brief)};
 const text=JSON.stringify(payload,null,2)+'\n';if(/github_pat_|gh[pousr]_/.test(text))throw Error('В тексте обнаружен возможный секрет. Удалите его из задания.');if(new TextEncoder().encode(text).length>800000)throw Error('Пакет слишком большой для безопасного чтения через Contents API');
 const digest=await hash(text);display({path:PREFIX+digest+'.json',hash:digest,text,kind:payload.kind,target,count:entries.length,entries:entries.map(e=>({id:e.brief.id,fingerprint:e.fingerprint}))});
 }catch(e){result.textContent=e.message}};
send.onclick=async()=>{
 if(busy||!selected)return;if(!consent.checked){result.textContent='Подтвердите состав и публичную запись.';return}
 let credential=token.value.trim();token.value='';if(!credential.startsWith('github_pat_')){result.textContent='Нужен fine-grained ключ GitHub. Инструкция по ссылке выше.';return}
 const p=selected;busy=true;send.disabled=true;prepare.disabled=true;resume.disabled=true;close.disabled=true;kind.disabled=true;let verified=null;
 try{
 local.githubPending=p;persist();
 const api=async(path,method='GET',body)=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);try{const response=await fetch('https://api.github.com/repos/kameralog/kameralog.github.io/'+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+credential,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal,redirect:'error',cache:'no-store'});if(response.status===404&&method==='GET')return null;if(!response.ok)throw Error('GitHub HTTP '+response.status+'. Проверьте срок ключа, репозиторий и право Contents: write.');return await response.json()}finally{clearTimeout(timer)}};
 result.textContent='Проверяю наличие пакета, записываю при необходимости и читаю результат обратно…';
 verified=await deliver(p,api);
 local.githubReceipts||={};for(const e of p.entries)local.githubReceipts[p.target+':'+e.id]={fingerprint:e.fingerprint,commit:verified.commit,path:p.path,sentAt:new Date().toISOString()};delete local.githubPending;persist();
 result.replaceChildren(make('span','Запись подтверждена: '+p.count+' заданий. Коммит '));const link=make('a',verified.commit.slice(0,7));link.href=verified.url;link.target='_blank';link.rel='noopener noreferrer';result.append(link);say('Пакет отправлен в GitHub, коммит '+verified.commit.slice(0,7)+'. Статьи сайта не изменены.');selected=null;
 }catch(e){result.textContent=verified?'GitHub подтвердил запись, коммит '+verified.commit+', но квитанция не сохранилась в браузере: '+e.message:'Подтверждения отправки нет. Правки сохранены; пакет оставлен для повторной проверки. '+e.message;}
 finally{credential='';busy=false;prepare.disabled=false;resume.disabled=!local.githubPending;close.disabled=false;kind.disabled=false;send.disabled=!selected;}
};
const oldRender=render;render=function(...args){oldRender(...args);const a=catalogue.find(a=>a.id===local.current);if(!a)return;const receipts=Object.values(local.githubReceipts||{}).filter(r=>r&&r.path);if(receipts.length){const note=make('small','Последние подтверждённые отправки доступны в резервной копии (githubReceipts). После изменения задания его можно отправить повторно.');$('#editor').append(note)}};
})();
