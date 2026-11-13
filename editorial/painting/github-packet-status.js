(()=>{'use strict';
const box=make('section');box.className='box';box.id='packet-index-status';
box.append(make('p','Отправка двухэтапная: сначала исходный пакет записывается в GitHub, затем автоматическая проверка создаёт отдельные задания. «Запись подтверждена» не означает, что разбиение уже закончено. Исходники сохраняются без изменений.'));
const check=make('button','Проверить разбиение'),message=make('p','Проверка индекса ещё не выполнена.');message.setAttribute('role','status');box.append(check,message);$('#notice').after(box);let busy=false;
async function refresh(){if(busy)return;busy=true;check.disabled=true;try{
 const response=await fetch('https://api.github.com/repos/kameralog/kameralog.github.io/contents/coordination/painting-editor/packets/index.json?ref=main',{cache:'no-store',credentials:'omit',redirect:'error'});
 if(response.status===404){message.textContent='Индекс разбиения пока не опубликован. Исходные отправки не отменены; повторите проверку после завершения GitHub Actions.';return}
 if(!response.ok)throw Error('GitHub HTTP '+response.status);const file=await response.json();if(file.encoding!=='base64')throw Error('Не удалось прочитать индекс');
 const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0))));if(data.schemaVersion!==1||data.verificationVersion!==1||!Array.isArray(data.packets))throw Error('Неизвестный формат индекса');
 const last=Object.values(local.githubReceipts||{}).filter(r=>r?.path&&r?.sentAt).sort((a,b)=>b.sentAt.localeCompare(a.sentAt))[0];
 if(last){const item=data.packets.find(p=>p.sourcePath===last.path&&p.sourceCommit===last.commit&&p.verified===true);if(!item){message.textContent='Исходная запись '+last.commit.slice(0,7)+' подтверждена, но её разбиения в проверенном индексе ещё нет. Повторите проверку после завершения GitHub Actions.';return}
 message.replaceChildren(make('span','Разбиение последней отправки проверено: '+item.count+' заданий. Исходный коммит '+item.sourceCommit.slice(0,7)+'. '));
 const link=make('a','Открыть индекс партии');link.href='https://github.com/kameralog/kameralog.github.io/blob/main/'+item.manifestPath;link.target='_blank';link.rel='noopener noreferrer';message.append(link);
 }else message.textContent='В индексе проверены '+data.packetCount+' пакетов, '+data.totalArtists+' записей заданий. Локальной квитанции для сопоставления последней отправки нет.';
 }catch(error){message.textContent='Проверка разбиения не завершена: '+error.message+'. Исходные пакеты и ваши правки не изменены.'}finally{busy=false;check.disabled=false}}
check.onclick=refresh;new MutationObserver(()=>{if($('#notice').textContent.startsWith('Пакет отправлен в GitHub'))refresh()}).observe($('#notice'),{childList:true,subtree:true,characterData:true});refresh();
})();
