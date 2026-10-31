// Native Vimeo embeds only; this version never inserts an image over the player.
const catalog=[
 ["animals","394256229"],["die-reise","272842965"],["presentation","885718308"],
 ["zaruyar","1008823051"],["i-tree","955510542"],["me-real","394965048"],
 ["tree-and-water","230300417"],["right-bank","344560705"]
];
const languageNames={
 ru:"Русский",en:"English",zh:"中文",es:"Español",ar:"العربية",fa:"فارسی",he:"עברית",fr:"Français",pt:"Português",de:"Deutsch",
 da:"Dansk",sv:"Svenska",nb:"Norsk (bokmål)",fi:"Suomi",is:"Íslenska",et:"Eesti",lv:"Latviešu",lt:"Lietuvių",vep:"Vepsän kel’",
 tr:"Türkçe",hi:"हिन्दी",bn:"বাংলা",ja:"日本語",be:"Беларуская",uk:"Українська",kk:"Қазақша",ky:"Кыргызча",uz:"O‘zbekcha",
 tg:"Тоҷикӣ",tk:"Türkmençe",az:"Azərbaycanca",hy:"Հայերեն",ro:"Română",ka:"ქართული"
};
const backLabels={ru:"Все работы",en:"All works",zh:"全部作品",es:"Todas las obras",ar:"جميع الأعمال",fa:"همهٔ آثار",he:"כל העבודות",fr:"Toutes les œuvres",pt:"Todos os trabalhos",de:"Alle Arbeiten",da:"Alle værker",sv:"Alla verk",nb:"Alle verk",fi:"Kaikki teokset",is:"Öll verk",et:"Kõik teosed",lv:"Visi darbi",lt:"Visi darbai",tr:"Tüm eserler",hi:"सभी कृतियाँ",bn:"সব কাজ",ja:"すべての作品",be:"Усе працы",uk:"Усі роботи",kk:"Барлық жұмыстар",ky:"Бардык иштер",uz:"Barcha ishlar",tg:"Ҳамаи корҳо",tk:"Ähli işler",az:"Bütün işlər",hy:"Բոլոր աշխատանքները",ro:"Toate lucrările",ka:"ყველა ნამუშევარი",vep:"Все работы"};
const artistNames={ru:"Голубев-Линецкий",be:"Голубеў-Лінецкі",uk:"Голубєв-Лінецький",vep:"Голубев-Линецкий"};
const works=document.querySelector("#works"),panel=document.querySelector("#language-panel"),opener=document.querySelector(".language-open"),search=document.querySelector("#language-search"),list=document.querySelector("#language-list");
const pageSlug=document.body.dataset.film;
let currentLanguage=new URLSearchParams(location.search).get("lang")||"ru";
if(!languageNames[currentLanguage])currentLanguage="ru";
function escapeText(value=""){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}
function filmText(film,code){
 const effective=additionalLocales[code]?.fallback||code;
 const actual=film[effective]?effective:"en";
 const suffix=actual[0].toUpperCase()+actual.slice(1);
 return {title:film[actual],subtitle:film["subtitle"+suffix]||"",date:film["date"+suffix],city:film["city"+suffix],lang:actual};
}
function href(slug){return `./${slug?slug:"index"}.html?lang=${encodeURIComponent(currentLanguage)}`}
// Reserve v22 geometry; enlarge only the accessible copy inside each black plate.
function referenceText(text){
 return `<div class="type-reference" aria-hidden="true"><span class="reference-title">${escapeText(text.title)}</span>${text.subtitle?`<span class="reference-subtitle">${escapeText(text.subtitle)}</span>`:""}</div>`;
}
function fittedText(content,extraClass=""){
 return `<div class="type-fit"><div class="type-content ${extraClass}">${content}</div></div>`;
}
let fittingFrame=0;
function fitTypography(){
 works.querySelectorAll(".type-fit").forEach(box=>{
  const content=box.firstElementChild;
  const fits=()=>content.getBoundingClientRect().height<=box.getBoundingClientRect().height+.1&&content.scrollWidth<=box.clientWidth+1;
  content.style.setProperty("--type-scale","1");
  if(!fits()){
   let low=2/3,high=1;
   for(let i=0;i<12;i++){
    const middle=(low+high)/2;
    content.style.setProperty("--type-scale",String(middle));
    if(fits())low=middle;else high=middle;
   }
   content.style.setProperty("--type-scale",String(low));
  }
  box.classList.add("is-fitted");
 });
}
function scheduleTypographyFit(){
 cancelAnimationFrame(fittingFrame);
 fittingFrame=requestAnimationFrame(fitTypography);
}
function render(){
 const code=currentLanguage,rtl=["ar","he","fa"].includes(code);
 document.documentElement.lang=code;document.documentElement.dir=rtl?"rtl":"ltr";
 document.querySelector("#artist").textContent=artistNames[code]||"Golubev-Linetsky";
 const siteName=code==="ru"?"Камералог":"Kameralog";
 document.querySelector(".wordmark").textContent=siteName;
 document.querySelector(".wordmark").lang=code==="ru"?"ru":"en";
 document.querySelector(".identity").href=href("");
 document.querySelector(".identity").setAttribute("aria-label",code==="ru"?"Камералог — главная страница":"Kameralog — home");
 const galleryHeading=document.querySelector(".gallery-heading");
 if(galleryHeading){galleryHeading.hidden=Boolean(pageSlug);galleryHeading.textContent=`${siteName} — ${artistNames[code]||"Golubev-Linetsky"}`;}
 const note=document.querySelector("#locale-note");
 note.textContent=additionalLocales[code]?.notice||"";note.hidden=!note.textContent;
 list.querySelectorAll("button").forEach(button=>button.setAttribute("aria-current",String(button.dataset.lang===code)));
 search.placeholder=additionalLocales[code]?.search||({ru:"Найти язык",tr:"Dil ara",fa:"جستجوی زبان",he:"חיפוש שפה"})[code]||"Search languages";
 search.setAttribute("aria-label",search.placeholder);
 document.querySelector("#no-languages").textContent=additionalLocales[code]?.empty||({ru:"Ничего не найдено",fa:"نتیجه‌ای یافت نشد",he:"לא נמצאו תוצאות"})[code]||"No matches";
 document.querySelector(".skip").textContent=backLabels[code];
 works.setAttribute("aria-label",backLabels[code]);
 if(!pageSlug){
  works.className="gallery";
  works.innerHTML=films.map((film,i)=>{
   const text=filmText(film,code),slug=catalog[i][0];
   return `<article class="film-card"><a class="film-link" href="${href(slug)}"><div class="still"><img src="./assets/gallery/${slug}.jpg?v=20" alt="" width="960" height="600" ${i>2?'loading="lazy"':'fetchpriority="high"'}></div><div class="card-caption" lang="${text.lang}">${referenceText(text)}${fittedText(`<h2 class="film-title">${escapeText(text.title)}</h2>${text.subtitle?`<p class="film-subtitle">${escapeText(text.subtitle)}</p>`:""}`)}</div></a></article>`;
  }).join("");
  document.title=`${siteName} — ${artistNames[code]||"Golubev-Linetsky"}`;
 }else{
  const index=catalog.findIndex(item=>item[0]===pageSlug);
  if(index<0){works.innerHTML=`<a href="${href("")}">${backLabels[code]}</a>`;return}
  const film=films[index],text=filmText(film,code);
  document.querySelector(".skip").textContent=text.title;
  works.className="detail";
  works.style.setProperty("--ratio",film.ratio);
  works.innerHTML=`<div class="detail-heading" lang="${text.lang}">${referenceText(text)}${fittedText(`<h1>${escapeText(text.title)}</h1>${text.subtitle?`<p class="film-subtitle">${escapeText(text.subtitle)}</p>`:""}`)}</div>
  <div class="player" style="--ratio:${film.ratio}"><iframe src="https://player.vimeo.com/video/${film.id}?autoplay=0&title=0&byline=0&portrait=0&dnt=1" title="${escapeText(text.title)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
  <div class="detail-meta"><div class="metadata-reference type-reference" aria-hidden="true"><p class="reference-creation" lang="${text.lang}" dir="auto">${escapeText(text.city)} · ${escapeText(text.date)}</p><span class="reference-vimeo" dir="ltr">Vimeo</span></div>${fittedText(`<p class="creation" lang="${text.lang}" dir="auto"><span class="creation-city">${escapeText(text.city)}</span><span class="creation-separator"> · </span><span class="creation-date">${escapeText(text.date)}</span></p><a class="vimeo-link" href="https://vimeo.com/${film.id}" target="_blank" rel="noopener noreferrer" dir="ltr">Vimeo</a>`,"metadata-text")}</div>`;
  document.title=`${text.title} — ${siteName}`;
 }
 scheduleTypographyFit();
}
function closeLanguages(restoreFocus=false){panel.hidden=true;opener.setAttribute("aria-expanded","false");if(restoreFocus)opener.focus()}
Object.entries(languageNames).forEach(([code,name])=>{
 const li=document.createElement("li"),button=document.createElement("button");
 button.type="button";button.textContent=name;button.dataset.lang=code;button.lang=code;button.dir="auto";
 button.addEventListener("click",()=>{
  currentLanguage=code;
  const url=new URL(location.href);url.searchParams.set("lang",code);history.replaceState(null,"",url);
  render();closeLanguages(true);
 });li.append(button);list.append(li);
});
opener.addEventListener("click",()=>{
 if(!panel.hidden){closeLanguages();return}
 panel.hidden=false;opener.setAttribute("aria-expanded","true");search.value="";
 list.querySelectorAll("li").forEach(li=>li.hidden=false);
 document.querySelector("#no-languages").hidden=true;search.focus();
});
document.addEventListener("click",event=>{if(!event.target.closest(".language-menu"))closeLanguages()});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeLanguages(true)});
document.addEventListener("focusin",event=>{if(!event.target.closest(".language-menu"))closeLanguages()});
search.addEventListener("input",()=>{
 const query=search.value.trim().toLocaleLowerCase();let count=0;
 list.querySelectorAll("li").forEach(li=>{
  const button=li.querySelector("button"),code=button.dataset.lang;let localized="";
  try{localized=new Intl.DisplayNames([currentLanguage==="vep"?"ru":currentLanguage],{type:"language"}).of(code)}catch{}
  li.hidden=!`${button.textContent} ${code} ${localized} ${additionalLocales[code]?.aliases||""}`.toLocaleLowerCase().includes(query);
  if(!li.hidden)count++;
 });document.querySelector("#no-languages").hidden=count>0;
});
render();
new ResizeObserver(scheduleTypographyFit).observe(works);
document.fonts.ready.then(scheduleTypographyFit);
window.addEventListener("resize",scheduleTypographyFit);
