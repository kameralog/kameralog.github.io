(()=>{'use strict';
const ROOT='coordination/painting-editor/packets/';
function validate(data){
 if(data?.schemaVersion!==1||data.verificationVersion!==1||!Array.isArray(data.packets)||data.packetCount!==data.packets.length)throw Error('Неизвестный или неполный индекс');
 let total=0;const seen=new Set;for(const p of data.packets){if(!/^[a-f0-9]{64}$/.test(p.packetHash||'')||!/^[a-f0-9]{40}$/.test(p.sourceCommit||'')||p.sourcePath!=='coordination/painting-editor/inbox/'+p.packetHash+'.json'||p.manifestPath!==ROOT+p.packetHash+'/manifest.json'||p.verified!==true||!Number.isInteger(p.count)||p.count<1||p.count>50||seen.has(p.packetHash))throw Error('Некорректная запись индекса');seen.add(p.packetHash);total+=p.count;}
 if(data.totalArtists!==total)throw Error('Не совпало число заданий');return data;
}
function lastReceipt(receipts){return Object.values(receipts||{}).filter(r=>typeof r?.path==='string'&&/^[a-f0-9]{40}$/.test(r.commit||'')&&Number.isFinite(Date.parse(r.sentAt))).sort((a,b)=>Date.parse(b.sentAt)-Date.parse(a.sentAt))[0]}
const match=(data,receipt)=>receipt&&data.packets.find(p=>p.sourcePath===receipt.path&&p.sourceCommit===receipt.commit&&p.verified===true);
async function load(fetcher,origin,receipt){
 const candidates=[['https://raw.githubusercontent.com/kameralog/kameralog.github.io/main/'+ROOT+'index.json','исходный JSON GitHub'],[new URL('/'+ROOT+'index.json',origin).href,'копия на сайте']];const errors=[];let stale=null;
 for(const [url,source]of candidates){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const response=await fetcher(url,{cache:'no-store',credentials:'omit',redirect:'error',signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);const data=validate(await response.json()),result={data,source,readAt:Date.now()};if(!receipt||match(data,receipt))return result;stale||=result;}catch(error){errors.push(source+': '+(error.name==='AbortError'?'тайм-аут':error.message))}finally{clearTimeout(timer)}}
 if(stale)return stale;throw Error(errors.join('; '));
}
if(typeof module!=='undefined')module.exports={validate,lastReceipt,match,load};
if(typeof document==='undefined')return;
const box=make('section');box.className='box';box.id='packet-index-status';box.append(make('p','Отправка двухэтапная: исходный пакет записывается в GitHub, затем автоматическая проверка создаёт отдельные задания. Статус читается без ключа из публичного JSON, не через GitHub REST API. Сайт и исходник могут обновляться с задержкой.'));
const check=make('button','Проверить разбиение'),message=make('p','Проверка индекса ещё не выполнена.');message.setAttribute('role','status');box.append(check,message);$('#notice').after(box);
let busy=false,cached=null,cachedKey=null,nextCheck=0;
const clock=t=>new Date(t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
function show(result,receipt,reused){const {data,source,readAt}=result,stamp=' Источник: '+source+', прочитан в '+clock(readAt)+'.'+(reused?' Повторное сетевое чтение доступно после '+clock(nextCheck)+'.':'');
 if(receipt){const item=match(data,receipt);if(!item){message.textContent='Исходная запись '+receipt.commit.slice(0,7)+' подтверждена, но в прочитанном индексе её разбиения ещё нет. Это может быть задержкой обновления; повторно отправлять пакет ради проверки не нужно.'+stamp;return}
 message.replaceChildren(make('span','Разбиение последней отправки проверено: '+item.count+' заданий. Исходный коммит '+item.sourceCommit.slice(0,7)+'. '));const link=make('a','Открыть индекс партии');link.href='https://github.com/kameralog/kameralog.github.io/blob/main/'+item.manifestPath;link.target='_blank';link.rel='noopener noreferrer';message.append(link,make('span',stamp));
 }else message.textContent='В прочитанном индексе проверены '+data.packetCount+' пакетов, '+data.totalArtists+' записей заданий. Локальной квитанции последней отправки нет.'+stamp;
}
async function refresh(){if(busy)return;const receipt=lastReceipt(local.githubReceipts),key=receipt?receipt.path+':'+receipt.commit:'none';
 if(key===cachedKey&&Date.now()<nextCheck){if(cached)show(cached,receipt,true);else message.textContent='Повторная проверка доступна после '+clock(nextCheck)+'. Ключ менять не нужно; исходные пакеты и ваши правки не изменены.';return}
 busy=true;check.disabled=true;cachedKey=key;cached=null;try{const result=await load(fetch,location.origin,receipt);cached=result;nextCheck=Date.now()+30000;show(result,receipt,false)}catch(error){nextCheck=Date.now()+60000;message.textContent='Не удалось прочитать публичный индекс: '+error.message+'. Это не подтверждение ошибки отправки. Пакеты и правки не изменены. Повторная проверка доступна после '+clock(nextCheck)+'.'}finally{busy=false;check.disabled=false}}
check.onclick=refresh;new MutationObserver(()=>{if($('#notice').textContent.startsWith('Пакет отправлен в GitHub'))refresh()}).observe($('#notice'),{childList:true,subtree:true,characterData:true});refresh();
})();
