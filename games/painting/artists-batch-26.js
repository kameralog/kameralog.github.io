(()=>{'use strict';
const C='https://commons.wikimedia.org/wiki/',batch={};
const rows=[
['portrait_of_eutyches','Портрет мальчика Евтиха','Portrait of the Boy Eutyches','100–150 н. э.','Римский Египет · фаюмские погребальные портреты',
'Анонимный мастер. Страница о памятнике, а не о художнике: имя автора неизвестно.',
'Энкаустика по дереву: краска с воском, 38 × 19 см. Портрет вставлялся в погребальные пелены мумии.',
'Фаюмские портреты соединяют греко-римскую портретную живопись с египетским погребальным обрядом. Это не отдельное «направление», а категория вещей по назначению.',
'Энкаустика|Погребальное назначение|Греческая надпись|Портретная условность|Анонимный мастер',
'Надпись называет мальчика Евтихом, вольноотпущенником Касания, по записи Метрополитен-музея. Неясно, относится ли греческое «я подписал» к художнику или к акту освобождения. Не принимай изображение за документальный снимок: портрет мог быть идеализирован.',
'https://www.metmuseum.org/art/collection/search/547951','Портрет мальчика Евтиха','100–150 н. э.','Метрополитен-музей, Нью-Йорк','Энкаустика по дереву; 38 × 19 см','Portrait of the Boy Eutyches - Metmuseum 18.9.2.jpg',
'Рассмотри лицо и золотой декор: восковая краска даёт плотную, почти скульптурную поверхность. Затем прочитай подпись и сравни два возможных смысла «я подписал». Репродукция: Метрополитен-музей / Wikimedia Commons, PD-Art.'],
['funerary_portrait_of_aline','Портрет Алины (Aline) из Хавары','Funerary portrait of Aline','около 24 н. э. или 107 н. э.','Римский Египет · Хавара · фаюмские портреты',
'Анонимный мастер. Портрет найден Рихардом фон Кауфманом в Хаваре в 1892 году в погребении, названном по надписи на стеле: Алина, она же Тенос, дочь Ирода, умерла в возрасте 35 лет на 10-м году правления.',
'Темпера по льняной ткани. В погребении было восемь мумий; три из них имели живописные портреты: Алины и двух девочек.',
'Погребение показывает, что живописные портреты и бумажные маски использовались одной семьёй в одной могиле.',
'Темпера по ткани|Фронтальный взгляд|Ожерелье и туника|Лиловые полосы одежды|Греческая надпись на стеле',
'Датировка спорна: десятый год правления Тиберия (24 н. э.) считается более вероятным, но возможен и 107 год (Адриан). Размеры в источниках расходятся: 40 × 32,5 см у Википедии, 42,5 × 32,5 см в записи берлинского музея (ÄM 11411). Нельзя проверить, портрет это конкретной женщины или идеализированный образ.',
'https://en.wikipedia.org/wiki/Tomb_of_Aline',null,null,null,null,null,
'Пока без репродукции: условия публикации фотографии берлинского музея не проверены.'],
['tepantitla_tlalocan','Тепантитла: роспись «Тлалокан»','Tepantitla, Tlalocan mural','около 225–650 н. э.','Теотиуакан · настенная роспись жилого комплекса',
'Памятник, а не художник. Комплекс Тепантитла был заселён примерно между 225 и 650 годами н. э.; роспись находится в главном помещении.',
'Фреска. Композиция в двух наложенных регистрах, соответствующих разным планам мира, по описанию INAH.',
'Роспись показывает, как в Теотиуакане изобразительный язык служил жилому и ритуальному пространству, а не только храму.',
'Фреска на стене|Два регистра|Жилой комплекс|Спорное толкование|Подлинник на месте',
'Классическое прочтение (Касо) — рай Тлалока. Археолог INAH предлагает иное: сцена на земле, аграрный праздник. Не подавай «рай Тлалока» как установленный факт. Подлинник нельзя показать как музейный экспонат: копии в музеях — реконструкции.',
'https://visitateotihuacan.inah.gob.mx/en/explore/tlalocan/',null,null,null,null,null,
'Пока без репродукции: права на фотографию не проверены.']
];
for(const [id,name,latin,life,tag,bio,technique,innovation,features,caution,source,title,date,museum,medium,file,look] of rows){
const sources=[['Основной источник',source]],works=[];
if(file){const imageSource=C+'File:'+encodeURIComponent(file);sources.push(['Репродукция и сведения о правах',imageSource]);works.push({key:'guide26:'+id,title,originalTitle:latin,date,museum,medium,source,image:C+'Special:FilePath/'+encodeURIComponent(file)+'?width=800',zoom:C+'Special:FilePath/'+encodeURIComponent(file),imageSource,license:'Public domain / PD-Art according to Commons',look});}
batch[id]={name,latin,life,tag,aliases:[name,latin],bio:[bio],technique:[technique],innovation,features:features.split('|'),caution,sources,works,editorialStatus:file?'illustrated':'text_only_image_rights_pending'};}
batch.funerary_portrait_of_aline.aliases.push('Алина','Aline','Tomb of Aline');
batch.portrait_of_eutyches.aliases.push('Евтих','Eutyches');
if(typeof window.registerPaintingArtists!=='function')throw Error('Painting artist registry unavailable');
window.registerPaintingArtists(batch);
const byName=new Map(Object.values(batch).map(a=>[a.name,a])),host=document.getElementById('view');
function fixHeading(){const page=document.getElementById('artist-area'),a=byName.get(page?.querySelector('h1')?.textContent);if(!a)return;for(const h of page.querySelectorAll('h2')){if(h.textContent==='Пять работ: рассмотри и сравни')h.textContent=a.works.length?'Одна работа: рассмотри внимательно':'Памятник: смотри источники';if(!a.works.length&&h.textContent==='Пять признаков для внимательного взгляда')h.textContent='Пять ориентиров для проверки';}}
if(host){new MutationObserver(fixHeading).observe(host,{childList:true,subtree:true});fixHeading();}
})();
