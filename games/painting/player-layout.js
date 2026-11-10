const page=document.body.dataset.playerCabinet==='page';
async function waitFor(fn){for(let i=0;i<150;i++){const value=fn();if(value)return value;await new Promise(r=>setTimeout(r,200));}throw Error('Interface not ready');}
let accountButton;
if(page){
 accountButton=document.getElementById('account-button');
 const host=await waitFor(()=>document.getElementById('painting-cabinet'));
 const s=host.shadowRoot;
 const style=document.createElement('style');
 style.textContent=':host{position:static!important;display:block!important;font:inherit!important;color:inherit!important}dialog[open]{position:static!important;display:block!important;width:100%!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;overflow:visible!important;background:transparent!important;color:inherit!important}#open,#close,h2{display:none!important}#tools>.row{gap:10px}#list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:16px}article{background:#fff;border:1px solid #d5d8ca!important;border-radius:12px;padding:18px!important}#search{margin:16px 0}button{border-radius:10px}';
 s.append(style);document.getElementById('cabinet-content').append(host);
 s.getElementById('open').click();
 const d=s.querySelector('dialog');d.close();d.show();
 d.addEventListener('cancel',e=>e.preventDefault());
 const hashes={savedArtists:'artists',favoriteWorks:'works',catalog:'catalog'};
 const tabs=[...s.querySelectorAll('[data-tab]')];
 tabs.forEach(b=>b.addEventListener('click',()=>{const hash=hashes[b.dataset.tab];if(location.hash!=='#'+hash)location.hash=hash;}));
 function applyHash(){const b=tabs.find(b=>hashes[b.dataset.tab]===location.hash.slice(1));if(b)b.click();}
 window.addEventListener('hashchange',applyHash);applyHash();
 function fixLinks(){for(const a of s.querySelectorAll('a[href]')){const old=new URL(a.href);if(old.searchParams.has('artist')){const u=new URL('./',location.href);u.searchParams.set('artist',old.searchParams.get('artist'));if(a.href!==u.href)a.href=u.href;}}}
 new MutationObserver(fixLinks).observe(s,{childList:true,subtree:true});fixLinks();
}else{
 const artistsButton=await waitFor(()=>[...document.querySelectorAll('button,a,[role="button"]')].find(el=>el.textContent.trim()==='Художники'&&el.getClientRects().length));
 accountButton=document.createElement('button');accountButton.type='button';accountButton.id='painting-account-nav';
 accountButton.className=artistsButton.className;accountButton.classList.remove('active','selected');accountButton.style.cssText=artistsButton.style.cssText;
 accountButton.style.minWidth='120px';accountButton.style.whiteSpace='nowrap';accountButton.textContent='Логин';
 artistsButton.after(accountButton);
 const row=artistsButton.parentElement;
 if(['flex','inline-flex'].includes(getComputedStyle(row).display)){row.style.justifyContent='flex-end';row.style.flexWrap='wrap';}
 document.getElementById('painting-cabinet')?.remove();
}
const authHost=await waitFor(()=>document.getElementById('painting-account'));
const authUI=authHost.shadowRoot;
const hide=document.createElement('style');hide.textContent='#open{display:none!important}dialog{color-scheme:dark;background:#1d1d1b!important;color:#eeeae2!important;border:1px solid #373732!important;border-radius:18px!important;font:16px/1.6 system-ui!important}button,input{background:#151515!important;color:#eeeae2!important;border:1px solid #373732!important;border-radius:10px!important}button:hover{border-color:#d8a7a0!important}p,small{color:#b7b3aa!important}button:focus-visible,input:focus-visible{outline:2px solid #d8bd83;outline-offset:3px}';authUI.append(hide);
const choices=document.createElement('div');choices.className='row';
const enter=document.createElement('button'),register=document.createElement('button');enter.type=register.type='button';enter.textContent='Войти';register.textContent='Зарегистрироваться';choices.append(enter,register);
authUI.querySelector('#guest').prepend(choices);
function choose(create){const active=authUI.getElementById('submit').textContent==='Зарегистрироваться';if(active!==create)authUI.getElementById('mode').click();authUI.getElementById('email').focus();}
enter.onclick=()=>choose(false);register.onclick=()=>choose(true);
let currentUser=null;
accountButton.textContent='Логин';
accountButton.onclick=()=>{if(currentUser&&!page){location.href=new URL('./cabinet.html',location.href).href;}else{authUI.getElementById('open').click();}};
try{
 const [App,A]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js')]);
 const app=await waitFor(()=>App.getApps().find(a=>a.name==='painting-player'));
 A.onAuthStateChanged(A.getAuth(app),u=>{const wasGuest=!currentUser;currentUser=u;accountButton.textContent=u?(page?'Аккаунт / выход':'Мой кабинет'):'Логин';if(u&&wasGuest&&authUI.querySelector('dialog').open)authUI.querySelector('dialog').close();});
}catch{accountButton.title='Сервис входа временно недоступен';}
if(page)import('./player-notes.js').catch(()=>{const p=document.createElement('p');p.textContent='Не удалось загрузить оформление и заметки. Обновите страницу.';document.getElementById('cabinet-content').append(p);});
