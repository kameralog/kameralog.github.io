// Film text is available in Russian, English, Turkish, Persian and Hebrew.
const translations = {
 fa:["Golubev-Linetsky","Kameralog","","","","","","","","زبان‌ها","",""],
 he:["Golubev-Linetsky","Kameralog","","","","","","","","שפות","",""],
 tr:["Golubev-Linetsky","Kameralog","Eser","Deneysel belgesel","Kısa kurmaca film","Medya hazır nesnesi","","","","Diller","Videoyu oynat","Video yüklenemedi."],
 ru:["Голубев-Линецкий","Фильмы и видео","Работа","Документальный экспериментальный фильм","Короткометражный художественный фильм","Медиальный реди-мейд","Здесь будет короткое описание работы.","Макет. Названия, годы и видео условные.","В плеерах: тестовый фрагмент, 8 секунд, без звука.","Язык","Воспроизвести тестовое видео","Не удалось загрузить тестовое видео."],
 en:["Golubev-Linetsky","Films and video","Work","Experimental documentary","Fiction short film","Media readymade","A short description of the work will appear here.","Prototype. Titles, years and videos are placeholders.","Players contain an 8-second silent test clip.","Language","Play test video","The test video could not be loaded."],
 zh:["Golubev-Linetsky","电影与影像","作品","实验纪录片","剧情短片","媒介现成品","此处将显示作品简介。","页面原型。标题、年份和视频均为占位内容。","播放器内为8秒无声测试片段。","语言","播放测试视频","无法加载测试视频。"],
 es:["Golubev-Linetsky","Cine y vídeo","Obra","Documental experimental","Cortometraje de ficción","Readymade mediático","Aquí aparecerá una breve descripción de la obra.","Prototipo. Títulos, años y vídeos provisionales.","Los reproductores contienen una prueba de 8 segundos sin sonido.","Idioma","Reproducir vídeo de prueba","No se pudo cargar el vídeo de prueba."],
 ar:["Golubev-Linetsky","أفلام وفيديو","عمل","فيلم وثائقي تجريبي","فيلم روائي قصير","عمل جاهز من الوسائط","سيظهر هنا وصف موجز للعمل.","نموذج أولي. العناوين والسنوات والفيديوهات مؤقتة.","تحتوي المشغلات على مقطع تجريبي صامت مدته 8 ثوانٍ.","اللغة","تشغيل الفيديو التجريبي","تعذّر تحميل الفيديو التجريبي."],
 fr:["Golubev-Linetsky","Films et vidéo","Œuvre","Documentaire expérimental","Court métrage de fiction","Ready-made médiatique","Une brève description de l’œuvre figurera ici.","Maquette. Titres, années et vidéos provisoires.","Les lecteurs contiennent un essai muet de 8 secondes.","Langue","Lire la vidéo de test","La vidéo de test n’a pas pu être chargée."],
 pt:["Golubev-Linetsky","Filmes e vídeo","Obra","Documentário experimental","Curta-metragem de ficção","Readymade mediático","Aqui ficará uma breve descrição da obra.","Protótipo. Títulos, anos e vídeos provisórios.","Os leitores contêm um teste de 8 segundos sem som.","Idioma","Reproduzir vídeo de teste","Não foi possível carregar o vídeo de teste."],
 de:["Golubev-Linetsky","Filme und Video","Arbeit","Experimenteller Dokumentarfilm","Kurzspielfilm","Mediales Readymade","Hier folgt eine kurze Beschreibung der Arbeit.","Entwurf. Titel, Jahre und Videos sind Platzhalter.","Die Player enthalten einen stummen Testclip von 8 Sekunden.","Sprache","Testvideo abspielen","Das Testvideo konnte nicht geladen werden."],
 hi:["Golubev-Linetsky","फ़िल्म और वीडियो","कृति","प्रयोगात्मक वृत्तचित्र","लघु कथा फ़िल्म","मीडिया रेडीमेड","यहाँ कृति का संक्षिप्त विवरण होगा।","प्रारूप। शीर्षक, वर्ष और वीडियो अस्थायी हैं।","प्लेयर में 8 सेकंड का मूक परीक्षण वीडियो है।","भाषा","परीक्षण वीडियो चलाएँ","परीक्षण वीडियो लोड नहीं हो सका।"],
 bn:["Golubev-Linetsky","চলচ্চিত্র ও ভিডিও","কাজ","নিরীক্ষামূলক প্রামাণ্যচিত্র","স্বল্পদৈর্ঘ্য কাহিনিচিত্র","মিডিয়া রেডিমেড","এখানে কাজটির সংক্ষিপ্ত বিবরণ থাকবে।","খসড়া। শিরোনাম, সাল ও ভিডিও অস্থায়ী।","প্লেয়ারে ৮ সেকেন্ডের নির্বাক পরীক্ষামূলক ভিডিও রয়েছে।","ভাষা","পরীক্ষামূলক ভিডিও চালান","পরীক্ষামূলক ভিডিও লোড করা যায়নি।"],
 ja:["Golubev-Linetsky","映画と映像","作品","実験的ドキュメンタリー","短編劇映画","メディア・レディメイド","ここに作品の短い説明が入ります。","試作版。題名、年、映像は仮のものです。","プレーヤーには8秒間の無音テスト映像が入っています。","言語","テスト映像を再生","テスト映像を読み込めませんでした。"],
 be:["Голубеў-Лінецкі","Фільмы і відэа","Праца","Дакументальны эксперыментальны фільм","Кароткаметражны мастацкі фільм","Медыяльны рэды-мэйд","Тут будзе кароткае апісанне працы.","Макет. Назвы, гады і відэа ўмоўныя.","У плэерах: тэставы фрагмент, 8 секунд, без гуку.","Мова","Прайграць тэставае відэа","Не ўдалося загрузіць тэставае відэа."],
 uk:["Голубєв-Лінецький","Фільми та відео","Робота","Документальний експериментальний фільм","Короткометражний ігровий фільм","Медіальний реді-мейд","Тут буде короткий опис роботи.","Макет. Назви, роки та відео умовні.","У програвачах: тестовий фрагмент, 8 секунд, без звуку.","Мова","Відтворити тестове відео","Не вдалося завантажити тестове відео."],
 kk:["Golubev-Linetsky","Фильмдер мен бейне","Жұмыс","Эксперименттік деректі фильм","Қысқаметражды көркем фильм","Медиалық реди-мейд","Мұнда жұмыстың қысқаша сипаттамасы болады.","Макет. Атаулар, жылдар мен бейнелер шартты.","Ойнатқыштарда: 8 секундтық дыбыссыз сынақ үзіндісі.","Тіл","Сынақ бейнесін ойнату","Сынақ бейнесін жүктеу мүмкін болмады."],
 ky:["Golubev-Linetsky","Тасмалар жана видео","Иш","Эксперименталдык даректүү тасма","Кыска метраждуу көркөм тасма","Медиалык реди-мейд","Бул жерде иштин кыскача сүрөттөмөсү болот.","Макет. Аталыштар, жылдар жана видеолор шарттуу.","Ойноткучтарда: үнсүз 8 секунддук сыноо үзүндүсү.","Тил","Сыноо видеосун ойнотуу","Сыноо видеосун жүктөө мүмкүн болгон жок."],
 uz:["Golubev-Linetsky","Filmlar va video","Ish","Eksperimental hujjatli film","Qisqa metrajli badiiy film","Media redimeyd","Bu yerda ishning qisqacha tavsifi bo‘ladi.","Maket. Nomlar, yillar va videolar shartli.","Pleyerlarda: 8 soniyalik ovozsiz sinov lavhasi.","Til","Sinov videosini ijro etish","Sinov videosini yuklab bo‘lmadi."],
 tg:["Golubev-Linetsky","Филмҳо ва видео","Кор","Филми мустанади таҷрибавӣ","Филми кӯтоҳметражи бадеӣ","Реди-мейди медиавӣ","Дар ин ҷо тавсифи кӯтоҳи кор ҷой мегирад.","Тарҳ. Номҳо, солҳо ва видеоҳо шартӣ мебошанд.","Дар плеерҳо: порчаи санҷишии бесадо, 8 сония.","Забон","Видеои санҷиширо пахш кунед","Боргирии видеои санҷишӣ муяссар нашуд."],
 tk:["Golubev-Linetsky","Filmler we wideo","Iş","Synag dokumental filmi","Gysga metražly çeper film","Media redimeýd","Bu ýerde işiň gysgaça beýany bolar.","Taslama. Atlar, ýyllar we wideolar şertli.","Pleýerlerde: 8 sekuntlyk sessiz synag bölegi.","Dil","Synag wideosyny oýnat","Synag wideosyny ýükläp bolmady."],
 az:["Golubev-Linetsky","Filmlər və video","İş","Eksperimental sənədli film","Qısametrajlı bədii film","Media redimeydi","Burada işin qısa təsviri olacaq.","Maket. Adlar, illər və videolar şərtidir.","Pleyerlərdə: 8 saniyəlik səssiz sınaq fraqmenti.","Dil","Sınaq videosunu oynat","Sınaq videosunu yükləmək mümkün olmadı."],
 hy:["Golubev-Linetsky","Ֆիլմեր և տեսանյութեր","Աշխատանք","Փորձարարական վավերագրական ֆիլմ","Կարճամետրաժ խաղարկային ֆիլմ","Մեդիա ռեդի-մեյդ","Այստեղ կլինի աշխատանքի կարճ նկարագրությունը։","Նախատիպ։ Անվանումները, տարեթվերը և տեսանյութերը պայմանական են։","Նվագարկիչներում՝ 8 վայրկյան տևողությամբ անձայն փորձնական հատված։","Լեզու","Դիտել փորձնական տեսանյութը","Չհաջողվեց բեռնել փորձնական տեսանյութը։"],
 ro:["Golubev-Linetsky","Filme și video","Lucrare","Documentar experimental","Scurtmetraj de ficțiune","Readymade media","Aici va apărea o scurtă descriere a lucrării.","Machetă. Titlurile, anii și videoclipurile sunt provizorii.","Playerele conțin un fragment de test de 8 secunde, fără sunet.","Limbă","Redă videoclipul de test","Videoclipul de test nu a putut fi încărcat."],
 ka:["Golubev-Linetsky","ფილმები და ვიდეო","ნამუშევარი","ექსპერიმენტული დოკუმენტური ფილმი","მოკლემეტრაჟიანი მხატვრული ფილმი","მედია რედიმეიდი","აქ იქნება ნამუშევრის მოკლე აღწერა.","მაკეტი. სათაურები, წლები და ვიდეოები პირობითია.","პლეერებში: 8-წამიანი უხმო საცდელი ფრაგმენტი.","ენა","საცდელი ვიდეოს დაკვრა","საცდელი ვიდეო ვერ ჩაიტვირთა."]
};
Object.entries(additionalLocales).forEach(([code,locale])=>{
 translations[code]=[code==="vep"?"Голубев-Линецкий":"Golubev-Linetsky","Kameralog","","","","","","","",locale.language,"",""];
});
const playerLabels={
 ru:{play:"Смотреть",copy:"Копировать",copied:"Скопировано",manual:"Выделите и скопируйте адрес выше.",close:"Закрыть плеер",help:"Если видео не открывается, воспользуйтесь ссылкой Vimeo под фильмом. ",error:"Плеер недоступен. Откройте ссылку Vimeo под фильмом."},
 en:{play:"Play",copy:"Copy",copied:"Copied",manual:"Select and copy the address above.",close:"Close player",help:"If the video does not load, use the Vimeo link below. ",error:"Player unavailable. Open the Vimeo link below."},
 tr:{play:"İzle",copy:"Kopyala",copied:"Kopyalandı",manual:"Yukarıdaki adresi seçip kopyalayın.",close:"Oynatıcıyı kapat",help:"Video açılmazsa aşağıdaki Vimeo bağlantısını kullanın. ",error:"Oynatıcı kullanılamıyor. Aşağıdaki Vimeo bağlantısını açın."},
 fa:{play:"تماشا",copy:"کپی",copied:"کپی شد",manual:"نشانی بالا را انتخاب و کپی کنید.",close:"بستن پخش‌کننده",help:"اگر ویدیو باز نشد، از پیوند Vimeo زیر فیلم استفاده کنید. ",error:"پخش‌کننده در دسترس نیست. پیوند Vimeo زیر فیلم را باز کنید."},
 he:{play:"צפייה",copy:"העתקה",copied:"הועתק",manual:"יש לבחור ולהעתיק את הכתובת שלמעלה.",close:"סגירת הנגן",help:"אם הסרטון אינו נפתח, השתמשו בקישור Vimeo שמתחת לסרט. ",error:"הנגן אינו זמין. פתחו את קישור Vimeo שמתחת לסרט."}
};
function labels(code=language.value){return additionalLocales[code]?.controls||playerLabels[additionalLocales[code]?.fallback||code]||playerLabels.en}
const language = document.querySelector("#language");
const panel=document.querySelector("#language-panel");
const opener=document.querySelector(".language-open");
const closer=document.querySelector(".language-close");
const search=document.querySelector("#language-search");
const languageList=document.querySelector("#language-list");
Array.from(language.options).forEach(option=>{
 const li=document.createElement("li"),button=document.createElement("button");
 button.type="button";button.textContent=option.textContent;button.lang=option.value;button.dir="auto";
 button.dataset.lang=option.value;button.setAttribute("aria-current",String(option.value==="ru"));
 button.addEventListener("click",()=>{setLanguage(option.value);closePanel()});
 li.append(button);languageList.append(li);
});
function closePanel(){
 const wasOpen=panel.classList.contains("open");
 panel.classList.remove("open");document.body.classList.remove("language-panel-open");
 panel.removeAttribute("role");panel.removeAttribute("aria-modal");
 opener.setAttribute("aria-expanded","false");
 search.value="";
 languageList.querySelectorAll("li").forEach(li=>li.hidden=false);
 document.querySelector("#no-languages").hidden=true;
 if(wasOpen)opener.focus();
}
opener.addEventListener("click",()=>{
 panel.classList.add("open");document.body.classList.add("language-panel-open");
 panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");
 opener.setAttribute("aria-expanded","true");search.focus();
});
closer.addEventListener("click",closePanel);
document.addEventListener("keydown",event=>{
 if(!panel.classList.contains("open"))return;
 if(event.key==="Escape"){closePanel();return}
 if(event.key==="Tab"){
  const focusable=Array.from(panel.querySelectorAll("button,input")).filter(el=>el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
});
const mq=matchMedia("(max-width:900px)");
mq.addEventListener("change",()=>{if(!mq.matches)closePanel()});
search.addEventListener("input",()=>{
 const q=search.value.trim().toLocaleLowerCase();
 let matches=0;
 languageList.querySelectorAll("li").forEach(li=>{
  const button=li.querySelector("button"),code=button.dataset.lang;
  let translated="";
  try{translated=new Intl.DisplayNames([language.value==="vep"?"ru":language.value],{type:"language"}).of(code)}catch{}
  li.hidden=!`${button.textContent} ${code} ${translated} ${additionalLocales[code]?.aliases||""}`.toLocaleLowerCase().includes(q);
  if(!li.hidden)matches++;
 });
 document.querySelector("#no-languages").hidden=matches>0;
});
function setLanguage(code) {
 const t=translations[code]||translations.ru;
 const extra=additionalLocales[code];
 document.documentElement.lang=code;
 const rtl=["ar","fa","he"].includes(code);
 document.querySelector(".page").dir=rtl?"rtl":"ltr";
 panel.dir=rtl?"rtl":"ltr";
 document.title=t[0];
 document.querySelector("#artist").textContent=t[0];
 document.querySelector("#discipline").textContent="Kameralog";
 document.querySelector("#language-label").textContent="languages";
 document.querySelector("#language-heading").textContent="languages";
 search.placeholder=extra?.search||({ru:"Найти язык",tr:"Dil ara",fa:"جستجوی زبان",he:"חיפוש שפה"})[code]||"Search languages";
 search.setAttribute("aria-label",search.placeholder);
 panel.querySelector("nav").setAttribute("aria-label","languages");
 opener.textContent="languages";
 closer.setAttribute("aria-label",extra?.close||({ru:"Закрыть",tr:"Kapat",fa:"بستن",he:"סגירה"})[code]||"Close");
 document.querySelector("#no-languages").textContent=extra?.empty||({ru:"Ничего не найдено",tr:"Sonuç bulunamadı",fa:"نتیجه‌ای یافت نشد",he:"לא נמצאו תוצאות"})[code]||"No matches";
 const note=document.querySelector("#locale-note");
 note.textContent=extra?.notice||"";note.hidden=!note.textContent;
 languageList.querySelectorAll("button").forEach(button=>button.setAttribute("aria-current",String(button.dataset.lang===code)));
 document.querySelectorAll(".work").forEach((article,i)=>{
  const film=films[i],effectiveCode=extra?.fallback||code,textLang=Object.hasOwn(film,effectiveCode)?effectiveCode:"en",suffix=textLang[0].toUpperCase()+textLang.slice(1);
  const title=film[textLang]||film.en;
  const heading=article.querySelector("h2");
  heading.textContent=title;heading.lang=textLang;
  article.querySelector(".creation-date").textContent=film["date"+suffix];
  article.querySelector(".creation-city").textContent=film["city"+suffix];
  article.querySelector(".creation").lang=textLang;
  const subtitle=article.querySelector(".film-subtitle");
  subtitle.textContent=film["subtitle"+suffix]||"";
  subtitle.lang=textLang;subtitle.hidden=!subtitle.textContent;
  article.querySelector(".play").setAttribute("aria-label",`${labels(code).play}: ${title}`);
  const iframe=article.querySelector("iframe");if(iframe)iframe.title=title;
  if(iframe)article.querySelector(".video-status").firstChild.textContent=labels(code).help;
  const reset=article.querySelector(".close-player");
  if(reset)reset.textContent=labels(code).close;
  article.querySelector(".copy-link").textContent=labels(code).copy;
  article.querySelector(".source-status").textContent="";
 });
 document.querySelector(".skip").textContent=t[1];
 document.querySelector("#works").setAttribute("aria-label",t[1]);
 language.value=code;
}
language.addEventListener("change",()=>setLanguage(language.value));
const works=document.querySelector("#works");
films.forEach((film,index)=>{
 const article=document.createElement("article");
 article.className="work";article.id=`film-${film.id}`;
 article.innerHTML=`
  <div class="player" style="aspect-ratio:${film.ratio}">
   <img class="poster" src="./assets/vimeo-${film.id}.jpg" alt="" width="1280" height="${film.ratio==="4 / 3"?"960":"720"}" ${index?"loading=\"lazy\"":"fetchpriority=\"high\""} decoding="async">
   <button class="play" aria-label="Смотреть: ${film.ru}"><span aria-hidden="true">▶</span></button>
  </div>
  <div class="caption">
   <div class="work-heading"><h2 id="title-${film.id}">${film.ru}</h2><p class="film-subtitle" ${film.subtitleRu?"":"hidden"}>${film.subtitleRu||""}</p>${film.alternate?`<p class="alternate" lang="de">${film.alternate}</p>`:""}<p class="creation"><span class="creation-date">${film.dateRu}</span><span class="creation-city">${film.cityRu}</span></p></div>
   <div class="work-text">
    <div class="film-meta"><span class="duration">${film.duration}</span>
     <details class="source"><summary>Vimeo</summary><div class="source-body">
      <a href="https://vimeo.com/${film.id}" target="_blank" rel="noopener noreferrer">https://vimeo.com/${film.id}</a>
      <button class="copy-link" type="button">Копировать</button><p class="source-status" role="status"></p>
     </div></details>
    </div>
   </div>
  </div>
  <p class="video-status" role="status"></p>`;
 works.append(article);
 const player=article.querySelector(".player"),button=article.querySelector(".play");
 button.addEventListener("click",()=>{
  const existing=player.querySelector("iframe");if(existing)return;
  document.querySelectorAll(".vimeo-embed").forEach(frame=>frame.contentWindow?.postMessage({method:"pause"},"https://player.vimeo.com"));
  const frame=document.createElement("iframe");
  frame.className="vimeo-embed";frame.title=article.querySelector("h2").textContent;
  frame.src=`https://player.vimeo.com/video/${film.id}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
  frame.allow="autoplay; fullscreen; picture-in-picture; encrypted-media";
  frame.allowFullscreen=true;frame.referrerPolicy="strict-origin-when-cross-origin";
  button.hidden=true;player.append(frame);
  const status=article.querySelector(".video-status");
  status.textContent=labels().help;
  const reset=document.createElement("button");
  reset.className="close-player";reset.type="button";reset.textContent=labels().close;
  reset.addEventListener("click",()=>{frame.remove();button.hidden=false;status.textContent="";button.focus()});
  status.append(reset);
  frame.addEventListener("load",()=>frame.contentWindow?.postMessage({method:"addEventListener",value:"play"},"https://player.vimeo.com"));
  frame.addEventListener("error",()=>{article.querySelector(".video-status").textContent=labels().error});
 });
 article.querySelector(".copy-link").addEventListener("click",async()=>{
  const status=article.querySelector(".source-status");
  try{await navigator.clipboard.writeText(`https://vimeo.com/${film.id}`);status.textContent=labels().copied}
  catch{status.textContent=labels().manual}
 });
});
window.addEventListener("message",event=>{
 if(event.origin!=="https://player.vimeo.com")return;
 let data;try{data=typeof event.data==="string"?JSON.parse(event.data):event.data}catch{return}
 if(data?.event==="play"){
  document.querySelectorAll(".vimeo-embed").forEach(frame=>{if(frame.contentWindow!==event.source)frame.contentWindow?.postMessage({method:"pause"},"https://player.vimeo.com")});
 }
});
const requested=new URLSearchParams(location.search).get("lang");
setLanguage(requested&&translations[requested]?requested:"ru");
