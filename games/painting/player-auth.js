const root = document.createElement('section');
root.id = 'painting-account';
const shadow = root.attachShadow({mode:'open'});
shadow.innerHTML = `<style>
:host{position:fixed;right:12px;bottom:12px;z-index:10000;font:15px system-ui;color:#202020}button,input{font:inherit}button{cursor:pointer;padding:9px 13px;border:1px solid #bbb;border-radius:9px;background:#fff;color:#202020}button:disabled{opacity:.55;cursor:wait}dialog{width:min(390px,calc(100vw - 48px));max-height:80vh;overflow:auto;border:1px solid #bbb;border-radius:16px;padding:20px;color:#202020;background:#fff}dialog::backdrop{background:#0007}input{box-sizing:border-box;display:block;width:100%;padding:10px;margin:6px 0 14px;border:1px solid #aaa;border-radius:8px}label{display:block}h2{margin:0 0 14px}p{line-height:1.45}.row{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.notice{white-space:pre-wrap;overflow-wrap:anywhere}#open{box-shadow:0 2px 12px #0002}#close{float:right}small{display:block;line-height:1.4}
</style>
<button id="open" type="button">Вход / профиль</button>
<dialog aria-labelledby="title"><button id="close" type="button" aria-label="Закрыть">×</button><h2 id="title">Аккаунт игрока</h2>
<p id="status" role="status" class="notice">Подключаем вход…</p>
<div id="guest" hidden><button id="google" type="button">Войти через Google</button>
<p>Или по почте:</p><form id="form"><label>Электронная почта<input id="email" type="email" autocomplete="email" required maxlength="254"></label><label>Пароль<input id="password" type="password" autocomplete="current-password" required></label><label id="repeat-label" hidden>Повтор пароля<input id="repeat" type="password" autocomplete="new-password"></label><button id="submit" type="submit">Войти</button></form>
<div class="row"><button id="mode" type="button">Создать аккаунт</button><button id="reset" type="button">Забыли пароль?</button></div><small>Используйте отдельный пароль для игры, не пароль от почтового ящика.</small></div>
<div id="member" hidden><p id="identity" class="notice"></p><p id="verified"></p><div class="row"><button id="verify" type="button">Отправить подтверждение почты</button><button id="refresh" type="button">Я подтвердил почту</button><button id="logout" type="button">Выйти</button></div><small>На общем устройстве выходите из аккаунта после игры.</small></div>
<p id="message" class="notice" role="status" aria-live="polite"></p><small>Можно закрыть это окно и играть без входа. Облачные статистика и избранное будут подключены следующим этапом.</small></dialog>`;
document.body.append(root);
const $ = id => shadow.getElementById(id);
const dialog = shadow.querySelector('dialog');
$('open').onclick = () => dialog.showModal();
$('close').onclick = () => dialog.close();
let registration = false, busy = false;
function message(text){$('message').textContent=text;}
function render(user){
  $('status').textContent=user?'Вы вошли в аккаунт.':'Войдите или создайте аккаунт.';
  $('guest').hidden=!!user; $('member').hidden=!user;
  $('open').textContent=user?'Мой профиль':'Вход / профиль';
  $('identity').textContent=user?(user.displayName||user.email||'Игрок'):'';
  $('verified').textContent=user?(user.emailVerified?'Почта подтверждена.':'Почта пока не подтверждена.'):'';
  $('verify').hidden=!user||user.emailVerified;
  $('refresh').hidden=!user||user.emailVerified;
  if(!user){$('password').value='';$('repeat').value='';}
}
const errors={
 'auth/invalid-credential':'Не удалось войти. Проверьте почту и пароль.',
 'auth/invalid-email':'Проверьте адрес электронной почты.',
 'auth/email-already-in-use':'Не удалось создать аккаунт. Попробуйте вход или восстановление пароля.',
 'auth/weak-password':'Пароль не соответствует требованиям проекта. Используйте не менее 8 символов.',
 'auth/password-does-not-meet-requirements':'Пароль не соответствует требованиям проекта.',
 'auth/too-many-requests':'Слишком много попыток. Повторите позже.',
 'auth/popup-blocked':'Браузер заблокировал окно Google. Разрешите всплывающие окна для сайта.',
 'auth/popup-closed-by-user':'Вход через Google отменён.',
 'auth/cancelled-popup-request':'Окно входа уже открыто.',
 'auth/network-request-failed':'Нет соединения с сервисом входа. Попробуйте позже.',
 'auth/unauthorized-domain':'Домен сайта не разрешён в настройках Firebase.',
 'auth/operation-not-allowed':'Этот способ входа пока не включён в Firebase.',
 'auth/account-exists-with-different-credential':'Для этого адреса используется другой способ входа. Попробуйте его.'
};
async function run(task){if(busy)return;busy=true;message('');shadow.querySelectorAll('button:not(#close):not(#open)').forEach(b=>b.disabled=true);try{await task();}catch(e){message(errors[e.code]||'Не удалось выполнить действие. Попробуйте позже.');console.warn('Painting auth:',e.code||e.name);}finally{busy=false;shadow.querySelectorAll('button').forEach(b=>b.disabled=false);}}
try{
 const [{initializeApp},A]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js')]);
 const app=initializeApp({apiKey:'AIzaSyDMZ_-N0r6ncckJM02_Pwt2KNryhijZSlM',authDomain:'painting-game-7c7e1.firebaseapp.com',projectId:'painting-game-7c7e1',storageBucket:'painting-game-7c7e1.firebasestorage.app',messagingSenderId:'1031610471416',appId:'1:1031610471416:web:f9f1119759e02936bbbc0d'},'painting-player');
 const auth=A.getAuth(app); auth.languageCode='ru';
 try{await A.setPersistence(auth,A.browserLocalPersistence);}catch{await A.setPersistence(auth,A.inMemoryPersistence);message('Браузер не разрешает сохранять вход. Сессия действует до закрытия страницы.');}
 A.onAuthStateChanged(auth,render,()=>{$('status').textContent='Сервис входа временно недоступен. Игра доступна без входа.';});
 $('mode').onclick=()=>{registration=!registration;$('repeat-label').hidden=!registration;$('repeat').required=registration;$('password').autocomplete=registration?'new-password':'current-password';$('submit').textContent=registration?'Зарегистрироваться':'Войти';$('mode').textContent=registration?'У меня уже есть аккаунт':'Создать аккаунт';message('');};
 $('google').onclick=()=>run(async()=>{await A.signInWithPopup(auth,new A.GoogleAuthProvider());message('Вход выполнен.');});
 $('form').onsubmit=e=>{e.preventDefault();run(async()=>{
 const email=$('email').value.trim(),password=$('password').value;
 if(registration){
  if(password.length<8){message('Используйте пароль не короче 8 символов.');return;}
  if(password!==$('repeat').value){message('Пароли не совпадают.');return;}
  const result=await A.createUserWithEmailAndPassword(auth,email,password);
  $('password').value='';$('repeat').value='';
  try{await A.sendEmailVerification(result.user);message('Аккаунт создан. Письмо для подтверждения отправлено. Проверьте также папку «Спам».');}catch{message('Аккаунт создан, но письмо не отправилось. Нажмите «Отправить подтверждение почты» позже.');}
 }else{await A.signInWithEmailAndPassword(auth,email,password);$('password').value='';message('Вход выполнен.');}
 });};
 $('reset').onclick=()=>run(async()=>{const email=$('email').value.trim();if(!email||!$('email').checkValidity()){message('Введите корректный адрес в поле электронной почты.');$('email').focus();return;}await A.sendPasswordResetEmail(auth,email);message('Если для этого адреса доступно восстановление, придёт письмо с инструкцией. Проверьте также папку «Спам».');});
 $('verify').onclick=()=>run(async()=>{if(!auth.currentUser)return;await A.sendEmailVerification(auth.currentUser);message('Письмо для подтверждения отправлено.');});
 $('refresh').onclick=()=>run(async()=>{if(!auth.currentUser)return;await A.reload(auth.currentUser);await auth.currentUser.getIdToken(true);render(auth.currentUser);message(auth.currentUser.emailVerified?'Почта подтверждена.':'Подтверждение пока не получено. Откройте ссылку в письме и повторите проверку.');});
 $('logout').onclick=()=>run(async()=>{await A.signOut(auth);message('Вы вышли из аккаунта.');});
}catch(e){$('status').textContent='Не удалось подключить вход. Игра остаётся доступна без регистрации.';console.warn('Painting auth init:',e.code||e.name);}
