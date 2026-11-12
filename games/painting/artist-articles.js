(()=>{'use strict';
const base=new URL('.',document.currentScript.src);
const kandinsky={
 sources:[
 ['Музей Гуггенхайма: биография','https://www.guggenheim.org/artwork/artist/Vasily-Kandinsky'],
 ['Центр Помпиду: жизнь и творчество','https://mediation.centrepompidou.fr/education/ressources/ENS-kandinsky-mono/ENS-kandinsky-monographie.html'],
 ['Ленбаххаус: биография','https://www.lenbachhaus.de/en/digital/collection-online/person/kandinsky-wassily-7430'],
 ['Музей Гуггенхайма: тексты выставки Around the Circle','https://www.guggenheim.org/wp-content/uploads/2021/10/guggenheim-vasily-kandinsky-around-the-circle-digital-wall-text.pdf'],
 ['Tate: Кандинский, Мюнтер и «Синий всадник»','https://www.tate.org.uk/whats-on/tate-modern/expressionists/exhibition-guide'],
 ['Кандинский: «О духовном в искусстве», «Язык форм и красок»','https://www.wassilykandinsky.ru/book-116-10-48.php'],
 ['Кандинский: «Точка и линия на плоскости»','https://philologos.narod.ru/kandinsky/kandinsky-pl.htm'],
 ['Исследование о Кандинском, пространстве и времени','https://dipot.ulb.ac.be/dspace/bitstream/2013/234939/4/bb4a9884-0c4f-428e-9d99-67eb8514cb2d.txt'],
 ['Баухаус-архив: «Точка и линия на плоскости»','https://www.bauhaus.de/en/research/publications/bauhausbuecher-9-wassily-kandinsky-point-and-line-to-plane/'],
 ['Музей Гуггенхайма: «Композиция VIII»','https://www.guggenheim.org/artwork/1924'],
 ['Музей Тиссена-Борнемисы: Мюнтер и работа в Мурнау','https://www.museothyssen.org/en/collection/artists/munter-gabriele/school-house-murnau'],
 ['Метрополитен-музей: «Импровизация 27»','https://www.metmuseum.org/art/collection/search/488319'],
 ['Кандинский: «О духовном в искусстве», перевод Майкла Сэдлера','https://www.gutenberg.org/cache/epub/5321/pg5321-images.html']
 ],
 figures:[
 {after:-1,title:'Композиция VIII',date:'1923',museum:'Музей Соломона Гуггенхайма, Нью-Йорк',inventory:'37.262',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Kandinsky%20-%20Composition%208%2C%201923.jpg',source:'https://www.guggenheim.org/artwork/1924',imageSource:'https://commons.wikimedia.org/wiki/File:Kandinsky_-_Composition_8,_1923.jpg',credit:'Репродукция: Wikimedia Commons; источник — Музей Гуггенхайма. Public domain / PD-Art по карточке Commons.'},
 {after:1,title:'Картина с тройкой',date:'1911',museum:'Художественный институт Чикаго',inventory:'1931.509',image:'https://www.artic.edu/iiif/2/a17821ca-f5e5-943f-8fe8-1b930bb89064/full/1200,/0/default.jpg',source:'https://www.artic.edu/artworks/8983/painting-with-troika',imageSource:'https://commons.wikimedia.org/wiki/File:Vasily_Kandinsky_-_Painting_with_Troika_-_1931.509_-_Art_Institute_of_Chicago.jpg',credit:'Репродукция: Art Institute of Chicago, CC0 Public Domain Designation. Авторская расписная рама — часть произведения.'},
 {after:4,title:'Жёлтое — красное — синее',date:'1925',museum:'Национальный музей современного искусства, Центр Помпиду, Париж',inventory:'AM 1976-856',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Kandinsky%20-%20Jaune%20Rouge%20Bleu.jpg?width=1280',source:'https://mediation.centrepompidou.fr/education/ressources/ENS-kandinsky-mono/ENS-kandinsky-monographie.html',imageSource:'https://commons.wikimedia.org/wiki/File:Kandinsky_-_Jaune_Rouge_Bleu.jpg',credit:'Фото: Eusebius (Guillaume Piolle), Wikimedia Commons. Public domain / PD-Art по карточке файла; имя фотографа сохранено по его просьбе.'}
 ],
 sections:[
 {title:'Художник и исследователь',paragraphs:[
 {text:'Василий Кандинский был не только художником, но и мыслителем, который пытался понять, как действует искусство. Почему один цвет кажется приближающимся, а другой — уходящим в глубину? Как меняется ощущение от линии, если она изгибается или резко ломается? Может ли картина выражать содержание без узнаваемого сюжета? Эти вопросы он исследовал в живописи, обсуждал со студентами и подробно разбирал в книгах.',refs:[2,9]},
 {text:'К абстракции он пришёл постепенно: писал пейзажи, менял их цвет и рисунок, пока изображённые предметы не перестали определять устройство картины. Его теория складывалась вместе с этой практикой — из наблюдений, опытов и попыток объяснить полученный результат.',refs:[2]}]},
 {title:'От университетской кафедры к живописи',paragraphs:[
 {text:'Кандинский родился в Москве, вырос преимущественно в Одессе, изучал право и экономику в Московском университете и некоторое время преподавал. В 1896 году, почти тридцатилетним, переехал в Мюнхен, чтобы учиться живописи. Занимался у Антона Ажбе и Франца фон Штука, писал городские виды и пейзажи, работал в гравюре.',refs:[1,3]},
 {text:'Позднее он вспоминал впечатление от одного из «Стогов» Моне на московской выставке: узнать изображённый предмет удалось только по каталогу, но сама картина запомнилась. Его поразило, что живопись могла действовать прежде, чем становилось понятно, что именно нарисовано. Это воспоминание записано уже после начала его художественной карьеры — так Кандинский сам объяснял один из истоков своих поисков.',refs:[4]},
 {text:'В Мюнхене он познакомился с художницей Габриеле Мюнтер. Они путешествовали и работали вместе; важным местом стал баварский Мурнау, где рядом с ними писали Алексей Явленский и Марианна Верёвкина. Здесь Кандинский всё свободнее обращался с цветом: дома и холмы ещё оставались узнаваемыми, но их оттенки и очертания уже не должны были точно повторять вид с натуры.',refs:[2,5]}]},
 {title:'Почему жёлтый треугольник — не то же самое, что жёлтый круг',paragraphs:[
 {text:'В книге «О духовном в искусстве», вышедшей на рубеже 1911–1912 годов, Кандинский предлагал сравнить два одинаковых круга — жёлтый и синий. По его наблюдению, жёлтый словно распространялся от центра и приближался к зрителю, а синий, напротив, углублялся и удалялся. Цвет обладал для него не только оттенком, но и направлением движения. Это положения его художественной теории, а не одинаковые для всех людей законы восприятия.',refs:[1,6,13]},
 {text:'Следующий вопрос был практическим: что изменится, если поместить эти цвета в разные формы? Резкость жёлтого, считал Кандинский, усиливается в остроконечном треугольнике; склонность синего к углублению — в круге. Однако он не предлагал художникам пользоваться готовой таблицей «правильных» сочетаний. Противоречие между цветом и формой тоже могло дать нужный результат.',refs:[6]},
 {text:'«Несоответствие между формой и цветом не должно рассматриваться как что-то “негармоничное”, напротив того, это несоответствие открывает новую возможность, а также и гармонию».',quote:true,attribution:'«О духовном в искусстве», раздел «Язык форм и красок».',refs:[6]}]},
 {title:'Музыка, живопись и время',paragraphs:[
 {text:'Музыка интересовала Кандинского не только потому, что могла вызывать переживание без изображения предметов. Она предлагала другой способ организации произведения: через последовательность, длительность, повторение и паузы. Но перенести эти принципы в живопись буквально невозможно. Музыкальное произведение разворачивается во времени: следующий звук появляется после предыдущего, а услышанное сохраняется в памяти и меняет восприятие того, что звучит сейчас. Части картины, напротив, существуют перед зрителем одновременно. Сам Кандинский прямо обозначал это различие в «О духовном в искусстве», хотя и предупреждал, что оно относительно.',refs:[8,13]},
 {text:'Одновременная доступность изображения ещё не означает, что мы воспринимаем его целиком за одно мгновение. Взгляд перемещается, задерживается, возвращается к уже рассмотренному. Здесь и возникает время картины — не заданная продолжительность исполнения, а длительность её рассматривания. Художник может влиять на этот процесс расположением элементов, их повторениями, контрастами и направлениями линий, но не назначает зрителю единственный обязательный маршрут и точный темп.',refs:[8]},
 {text:'В «Точке и линии на плоскости» Кандинский разбирает эту временную сторону изображения на простейших элементах. Точку он называет «наиболее краткой временной формой», а о линии пишет:',refs:[7]},
 {text:'«В линии элемент времени ощутим в значительно большей мере, чем в точке: длительность есть категория временная».',quote:true,attribution:'«Точка и линия на плоскости».',refs:[7]},
 {text:'Протяжённость линии требует другого рассматривания, чем отдельная точка; прямая и кривая тоже по-разному организуют движение взгляда.',refs:[7]},
 {text:'Музыкальные понятия помогали Кандинскому описывать не только устройство картины, но и процесс её восприятия. Повторение элементов создаёт ритм, различия в их размере и направлении меняют движение взгляда. Однако музыка задаёт последовательность и длительность звучания, а картина не определяет, сколько времени зритель будет её рассматривать и в каком порядке обратится к её частям. Кандинский исследовал временную сторону живописи, не приравнивая её к музыке.',refs:[7,8]},
 {text:'В 1911 году Кандинский начал переписываться с композитором Арнольдом Шёнбергом, увидев близость между новой музыкой и собственными опытами. В том же году вместе с Францем Марком организовал первую выставку «Синего всадника», а в 1912-м они выпустили одноимённый альманах. Современная живопись обсуждалась там рядом с музыкой, народным искусством и детскими рисунками. Участников интересовали способы выражения, которые не сводились к академическому мастерству правдоподобного изображения.',refs:[2,5]},
 {text:'Для Кандинского за этим стоял вопрос о назначении искусства. В «О духовном в искусстве» он рассматривал его как средство воздействия на внутреннюю жизнь человека. Отсюда понятие «внутренней необходимости»: художественное решение должно отвечать тому, что требуется выразить, а не только воспроизводить привычный приём. Это было его философское убеждение, определявшее и выбор формы.',refs:[13]},
 {text:'В картинах этого времени ещё можно различить всадников, горы и башни, но линии и цветовые участки всё меньше подчиняются предметным контурам. В «Импровизации 27 (Сад любви II)» 1912 года узнаваемые мотивы сохраняются внутри свободной композиции: чёрная линия может пересекать цвет, а не обводить изображённую вещь. Вопрос, поставленный в книге, здесь получает живописное решение: что может передать само сочетание линий и красок?',refs:[12]}]},
 {title:'Баухаус: исследование становится преподаванием',paragraphs:[
 {text:'После начала Первой мировой войны Кандинский вернулся в Россию. После революции участвовал в организации художественных учреждений, затем уехал в Германию. В 1922 году начал преподавать в Баухаусе — школе, где искусство изучали в связи с архитектурой, ремеслом и устройством предметной среды. Здесь свои наблюдения требовалось не только применять в картинах, но и объяснять студентам, обсуждать и проверять в упражнениях.',refs:[1,2,9]},
 {text:'В книге «Точка и линия на плоскости» 1926 года он продолжил разбирать элементарные средства изображения. Линия рассматривается как след движения точки. Прямая сохраняет одно направление; излом или изгиб позволяют говорить об изменении и взаимодействии сил. Геометрическая фигура интересовала Кандинского не только своим очертанием, но и движением, которое можно в ней почувствовать.',refs:[7,9]},
 {text:'В открывающей статью «Композиции VIII» 1923 года это особенно заметно. Крупный тёмный круг противопоставлен небольшим элементам, диагонали пересекают группы фигур, плотные участки чередуются со свободными. Здесь полезно проследить, какие формы задерживают взгляд, а какие направляют его дальше. Предметного сюжета для такого рассмотрения не требуется.',refs:[10]},
 {text:'«Жёлтое — красное — синее» 1925 года показывает другой вариант той же работы: правильные геометрические фигуры соседствуют с волнистыми линиями и свободными цветовыми образованиями. Кандинский не ограничивал живопись одной системой построения даже тогда, когда подробно анализировал её отдельные элементы.',refs:[2]}]},
 {title:'Работа и разговоры об искусстве',paragraphs:[
 {text:'Габриеле Мюнтер позднее вспоминала годы в Мурнау:',refs:[11]},
 {text:'«Это было чудесное, интересное, счастливое время работы и многочисленных разговоров об искусстве».',quote:true,attribution:'Перевод с английской публикации воспоминания на сайте Музея Тиссена-Борнемисы.',refs:[11]},
 {text:'Эти разговоры важны для понимания его творчества: новые решения возникали не только из чтения и одиночных размышлений, но и из работы рядом с другими художниками, сравнения этюдов и обсуждения того, что получилось. Мюнтер, Явленский и Верёвкина развивали собственные подходы, а не просто следовали за Кандинским.',refs:[5,11]},
 {text:'После закрытия Баухауса в 1933 году Кандинский поселился с женой Ниной во Франции. В поздних картинах строгая геометрия уступала место округлым, разветвлённым формам, напоминающим микроорганизмы. Он умер в Нёйи-сюр-Сен 13 декабря 1944 года.',refs:[1,2]},
 {text:'Кандинский оставил не только картины, но и подробное изложение своих идей. В его книгах вопросы цвета и композиции связаны с размышлениями о восприятии, духовной жизни и назначении искусства. Перед нами художник, который выступал также как мыслитель и исследователь: ему было важно не только найти живописное решение, но и понять, почему оно действует, описать свои наблюдения и предложить их для обсуждения.',refs:[2,9]}]}
 ]
};
let articles=null;
const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
const link=(label,url)=>{const e=make('a',label);e.href=url;e.target='_blank';e.rel='noopener noreferrer';return e};
function picture(card){
 const source=card?.querySelector('img[data-ar-img]');if(!source)return null;
 const url=source.getAttribute('src');if(!url||!url.startsWith('https://'))return null;
 const figure=make('figure');figure.style.margin='1.5rem 0';
 const img=make('img');img.src=url;img.alt=source.alt;img.loading='lazy';img.style.cssText='display:block;width:100%;max-height:540px;object-fit:contain;background:#161616';
 const caption=make('figcaption',card.querySelector('h3')?.textContent||source.alt);
 const museum=card.querySelector('a[href]');if(museum){caption.append(' — ',link('Музейный источник',museum.href));}
 img.onerror=()=>{img.hidden=true;caption.prepend('Репродукция недоступна. ')};
 figure.append(img,caption);return figure;
}
function sourcedPicture(w){
 const figure=make('figure');figure.style.margin='1.5rem 0';
 const caption=make('figcaption',w.title+' · '+w.date+' · '+w.museum+' · '+w.inventory);
 caption.append(' — ',link('Музей',w.source),' · ',link('Репродукция и права',w.imageSource));
 const credit=make('small',w.credit);credit.style.display='block';caption.append(credit);
 const img=make('img');img.alt=w.title+' — Василий Кандинский';img.loading=w.after===-1?'eager':'lazy';img.decoding='async';img.style.cssText='display:block;width:100%;height:auto;max-height:620px;object-fit:contain';
 img.onerror=()=>{img.hidden=true;caption.prepend('Репродукция недоступна. ')};
 img.src=w.image;figure.append(img,caption);return figure;
}
function mount(){
 const page=document.querySelector('#artist-area.artist-page[data-save-artist]');if(!page||!articles)return;
 const id=page.dataset.saveArtist,a=articles[id];if(!a||page.querySelector('[data-mini-wiki]'))return;
 const before=page.querySelector('.ar-copy');if(!before)return;
 const box=make('article');box.dataset.miniWiki=id;box.className='ar-copy painting-mini-wiki';
 box.append(make('h2','Жизнь и творчество'));
 const cards=[...page.querySelectorAll('.ar-grid .ar-card')];
 if(a.figures){for(const w of a.figures.filter(w=>w.after===-1))box.append(sourcedPicture(w));}else{const opening=picture(cards[0]);if(opening)box.append(opening);}
 for(const [i,section] of a.sections.entries()){
  box.append(make('h3',section.title));
  for(const paragraph of section.paragraphs){
   const p=make('p',paragraph.text);const refs=make('span');refs.className='ar-muted';
   for(const n of paragraph.refs){const source=a.sources[n-1];refs.append(' ',link('['+n+']',source[1]));}p.append(refs);
   if(paragraph.quote){const quote=make('blockquote');quote.append(p);if(paragraph.attribution)quote.append(make('small',paragraph.attribution));box.append(quote);}else box.append(p);
  }
  if(a.figures){for(const w of a.figures.filter(w=>w.after===i))box.append(sourcedPicture(w));}else if(i===1&&cards[1]){const fig=picture(cards[1]);if(fig)box.append(fig);}
 }
 const sources=make('details');sources.append(make('summary','Источники статьи'));const list=make('ol');for(const [title,url]of a.sources){const li=make('li');li.append(link(title,url));list.append(li);}sources.append(list);box.append(sources);
 page.insertBefore(box,before);
}
const host=document.getElementById('view');if(host)new MutationObserver(mount).observe(host,{childList:true,subtree:true});
fetch(new URL('artist-articles.json',base)).then(r=>{if(!r.ok)throw Error('Article data HTTP '+r.status);return r.json()}).then(data=>{if(data.schemaVersion!==1)throw Error('Unsupported article schema');articles={...data.articles,vasily_kandinsky:kandinsky};mount()}).catch(e=>console.warn('Painting articles:',e.message));
})();
