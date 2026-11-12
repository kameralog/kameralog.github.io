/* Batch 109: research draft. Two reproductions attached; eight works pending.
 * Image redirects, browser rendering and combined registry execution are not verified.
 */
(()=>{'use strict';
const B={};
function add(id,name,latin,aliases,life,title,originalTitle,date,medium,museum,inventoryNumber,source,bio,features,caution){
const w={key:inventoryNumber||'editorial:109:'+id,title,originalTitle,date,medium,museum,source,look:'Вопросы для рассматривания: '+features.join(' '),reason:'Права конкретной репродукции и/или её соответствие выбранной работе ещё не проверены полностью.'};
if(inventoryNumber)w.inventoryNumber=inventoryNumber;
B[id]={name,latin,aliases:[name,latin,...aliases],life,tag:'Художницы XVI–XVIII веков · рабочая карточка',bio,technique:[medium,'Указанные в тексте наблюдения опираются на перечисленные источники; самостоятельный осмотр изображения не заявлен.'],innovation:'Учебный ракурс — сопоставление произведений, материалов и самопредставления; заявление о первенстве не делается.',features,caution,sources:[[museum+': '+title,source]],works:[],pendingWorks:[w],editorialStatus:'RESEARCH_DRAFT_GLOBAL_CHECK_PENDING'};
}
add('sofonisba_anguissola','Софонисба Ангвиссола','Sofonisba Anguissola',['Sofonisba Anguisciola'],'XVI–XVII века','Автопортрет у мольберта','Self-Portrait at the Easel','1556','Масло на холсте; 66 × 57 см','Музей-замок, Ланьцут','916MT','https://nmwa.org/blog/artist-spotlight/5-fast-facts-sofonisba-anguissola/',
['Выбрано изображение художницы у мольберта из музея-замка в Ланьцуте.','На создаваемой картине изображены Мадонна с Младенцем; автопортрет представляет и автора, и её работу.'],
['Мольберт: найди картину внутри картины.','Кисть: проследи действие руки.','Образы: отличи художницу от изображённой Мадонны.','Одежда: сравни поверхности и контуры.','Взгляд: проверь обращение к зрителю.'],
'Не утверждать, что Ангвиссола знала автопортрет Катарины ван Хемессен: WGA прямо отмечает неопределённость. Не подменять другими автопортретами художницы.');
add('lavinia_fontana','Лавиния Фонтана','Lavinia Fontana',[],'XVI–XVII века','Свадебный портрет болонской знатной дамы','Marriage Portrait of a Bolognese Noblewoman (Livia de’ Medici Bandini?)','около 1589','Масло на холсте; 45 1/4 × 35 1/4 дюйма','Национальный музей женщин в искусстве, Вашингтон',null,'https://nmwa.org/art/collection/portrait-noblewoman/',
['Музей связывает одежду, драгоценности и собаку с представлением молодой болонской невесты.','Мех куницы с украшенной головой и лапами показывает богатство; интерпретация свадебного портрета опирается на исследование исторических документов.'],
['Одежда: сравни ткани.','Украшения: найди мелкие детали.','Собака: отличи изображение от символического толкования.','Мех: найди поясное украшение.','Фон: проверь контраст с фигурой.'],
'Ливия де Медичи Бандини — возможная, не установленная идентификация. В названии Commons-файла стоит около 1580; в карточке используем около 1589 по актуальной музейной записи. Музейный снимок имеет кредит Lee Stalsworth, свободные права на него пока не подтверждены.');
add('judith_leyster','Юдит Лейстер','Judith Leyster',['Judita Leystar'],'XVII век','Последняя капля','The Last Drop (The Gay Cavalier)','около 1629 по актуальной музейной карточке','Масло на холсте; размеры уточняются','Музей искусств Филадельфии','Cat. 440','https://www.philamuseum.org/objects/102220',
['Два участника попойки игнорируют скелет с песочными часами и черепом.','По музейному исследованию, скелет был скрыт поздней записью, а расчистка выявила его вновь.'],
['Фигуры: сравни действия.','Скелет: найди атрибуты.','Часы: проверь место в композиции.','Сопоставление: отличи расчистку от старого состояния.','Контекст: отдели музейное толкование от видимых предметов.'],
'На Commons и в подписи старого пресс-релиза встречается около 1639; текущая музейная карточка даёт около 1629. Историческую чёрно-белую репродукцию 1908 года не подставлять вместо восстановленного полотна.');
add('rachel_ruysch','Рахел Рюйш','Rachel Ruysch',['Рахель Рюйш','Rachel Ruijsch','Rachel Pool'],'XVII–XVIII века','Цветы в вазе','Flowers in a Vase','около 1685','Масло на холсте; 57 × 43,5 см','Национальная галерея, Лондон','NG6425','https://www.nationalgallery.org.uk/paintings/rachel-ruysch-flowers-in-a-vase',
['Букет соединяет цветы разных сезонов; музей объясняет такую композицию использованием предварительных рисунков.','Система диагоналей, светлых цветов и тёмного фона поддерживает глубину и форму; среди растений изображены насекомые.'],
['Диагонали: проследи направления.','Пион: найди светлый центр.','Фон: сравни свет и тень.','Насекомые: проверь детали.','Сезоны: отдели историческое объяснение от наблюдения.'],
'Выбран NG6425, не L1208 1716 года и не L1317 1710 года. Найденный Commons-файл имеет только 603 × 800 пикселей; права конкретного файла пока не прочитаны полностью.');
add('clara_peeters','Клара Петерс','Clara Peeters',['Клара Питерс'],'XVII век','Натюрморт с сырами, миндалём и кренделями','Still Life with Cheeses, Almonds and Pretzels','около 1615','Масло на доске; 34,5 × 49,5 см по описанию файла','Маурицхёйс, Гаага','1203','https://www.mauritshuis.nl/en/our-collection/artworks/1203-still-life-with-cheeses-almonds-and-pretzels',
['Музей отмечает фактуры сыров и масла, отражения и след ножа в масле.','Подпись находится на ноже, а в крышке кувшина музей распознаёт маленький автопортрет художницы.'],
['Сыры: сравни поверхности.','Масло: проверь след ножа.','Нож: найди подпись.','Крышка: найди отражение.','Посуда: сравни материалы.'],
'Не переносить на музейную загрузку статус CC0: сайт разрешает некоммерческое использование, коммерческое предлагает согласовывать. Для выбранного Commons-файла прочитана отдельная маркировка PD-Art с юрисдикционной оговоркой. EXIF называет фотографа Margareta Svensson; кредит сохраняется. Не смешивать с натюрмортами Прадо.');
add('michaelina_wautier','Михаэлина Ваутье','Michaelina Wautier',['Michaelina Woutiers','Михелина Ваутье'],'XVII век','Триумф Вакха','The Triumph of Bacchus / Bacchanal','до 1659; выставочная страница: около 1655–1659','Холст; 270 × 354 см по музейной карточке','Музей истории искусств, Вена','GG 3548','https://www.khm.at/en/objectdb/detail/2136/',
['Музей описывает Вакха, которого везут сатиры, и женщину справа, смотрящую за пределы композиции.','В этой женщине музей распознаёт автопортрет художницы; это музейная атрибуция изображённого лица, не произвольное определение по внешности.'],
['Вакх: найди главную фигуру.','Сатиры: проследи действие.','Женщина: найди фигуру справа.','Взгляд: проверь направление.','Масштаб: соотнеси размеры и многофигурную сцену.'],
'Дата в Commons шире музейной датировки; не переносить её автоматически. Кредит © KHM-Museumsverband сам по себе не является свободной лицензией.');
add('elisabetta_sirani','Элизабетта Сирани','Elisabetta Sirani',['Elizabeth Sirani'],'XVII век','Мадонна с Младенцем','Virgin and Child','1663','Масло на холсте; 34 × 27 1/2 дюйма','Национальный музей женщин в искусстве, Вашингтон',null,'https://nmwa.org/art/collection/virgin-and-child/',
['Младенец венчает мать гирляндой роз; Мария склоняет голову к гирлянде.','Музей отмечает густое письмо белого рукава; золотые буквы подписи и даты расположены вдоль шва подушки.'],
['Гирлянда: проследи действие.','Руки: сравни жесты.','Рукав: проверь фактуру.','Подушка: найди надпись.','Фон: сравни с освещёнными фигурами.'],
'В извлечённой странице Sirani Virgin and Child.jpg поле разрешения пусто и текст лицензии не получен. Факт присутствия в Commons не заменяет проверки. Музейный снимок имеет кредит Lee Stalsworth.');
add('fede_galizia','Феде Галиция','Fede Galizia',['Fede Gallizi'],'XVI–XVII века','Портрет Паоло Мориджи','Ritratto di Paolo Morigia','датировка требует сверки: 1592–1595 / 1596 / post 1596','Масло на холсте; высота 88 см, ширина 79 см','Пинакотека Амброзиана, Милан',null,'https://www.lombardiabeniculturali.it/opere-arte/schede/L0060-00029/',
['Амброзиана подтверждает портрет Паоло Мориджи кисти Феде Галиции в своём собрании.','Региональная каталоговая запись описывает фигуру за столом во время письма, но её хронологическое поле и историческое пояснение не согласованы.'],
['Стол: проследи положение фигуры.','Письмо: найди действие.','Предметы: выдели детали.','Надписи: отличи изображение от каталогового описания.','Дата: не выводи её из внешнего вида.'],
'В каталоге указано post 1596, текст упоминает 1596, затем приводит границы 1592–1595. Не выбирать одну дату без пояснения. 110 найден в Commons, музейный номер ещё не подтверждён первичной карточкой. WGA08429 — полный портрет; WGA08430 — деталь.');
add('giovanna_garzoni','Джованна Гарцони','Giovanna Garzoni',[],'XVII век','Натюрморт с чашей цитронов','Still Life with Bowl of Citrons','конец 1640-х','Темпера на пергаменте; 27,6 × 35,6 см','Музей Дж. Пола Гетти, Лос-Анджелес','2001.29','https://www.getty.edu/art/collection/object/108HFW',
['Цитроны с листьями и ветвями наполняют керамическую чашу.','Музей сопоставляет шероховатую кожуру, острые ветви, листья и цветы; перед чашей изображена оса.'],
['Цитроны: сравни формы.','Кожура: проверь фактуру.','Ветви: проследи линии.','Чаша: сравни поверхность.','Оса: найди отдельную деталь.'],
'Это цитроны, не автоматически лимоны. Выбран полный Google Art Project файл, а не отдельная деталь с осой; его лицензия пока не прочитана. Дата 1640 из поискового фрагмента Commons не заменяет музейное «конец 1640-х».');
add('rosalba_carriera','Розальба Каррьера','Rosalba Carriera',[],'XVII–XVIII века','Аллегория живописи','Allegory of Painting','1730-е','Пастель и красный мел на синей бумаге верже, наклеенной на холст; 44,3 × 34,1 см','Национальная галерея искусства, Вашингтон','1939.1.136','https://www.nga.gov/artworks/277-allegory-painting',
['В музейном описании фигура держит кисть и палитру, а за плечом виден край мольберта.','Синий цвет основы участвует в изображении; материал музей классифицирует как пастельный рисунок.'],
['Кисть: найди инструмент.','Палитра: проследи положение руки.','Мольберт: найди край за плечом.','Основа: сравни синий цвет бумаги и одежды.','Взгляд: проверь направление.'],
'Не называть установленным автопортретом и не смешивать с «Девушкой с обезьянкой», «Аллегорией музыки» или «Осенью». Конкретный свободный файл выбранной работы пока не установлен.');
B.sofonisba_anguissola.sources.push(['Дополнительный источник','https://www.wga.hu/html/a/anguisso/sofonisb/selfease.html']);
B.judith_leyster.sources.push(['Дополнительный источник','https://press.philamuseum.org/old-masters-now-celebrating-the-johnson-collection/']);
B.michaelina_wautier.sources.push(['Дополнительный источник','https://www.khm.at/en/exhibitions/michaelina-wautier']);
B.fede_galizia.sources.push(['Дополнительный источник','https://www.ambrosiana.it/en/visit/groups-and-schools/']);
B.giovanna_garzoni.sources.push(['Дополнительный источник','https://www.getty.edu/cona/CONAFullSubject.aspx?subid=700007488']);
function attach(id,file,width,height,mb,credit){const a=B[id],w=a.pendingWorks.pop();delete w.reason;const n=encodeURIComponent(file.replace(/ /g,'_')),u='https://commons.wikimedia.org/wiki/Special:FilePath/'+n;Object.assign(w,{image:u+'?width=1200',zoom:u,imageSource:'https://commons.wikimedia.org/wiki/File:'+n,license:'PD-Art / public domain according to the file description; reuse may be restricted in some jurisdictions',credit,imageWidth:width,imageHeight:height,imageSizeMB:mb,imageDeliveryStatus:'File-page metadata checked; redirects, image bytes and browser rendering not tested'});w.look+=' Кредит репродукции: '+credit+'.';a.works=[w];a.sources.push(['Конкретный файл и права',w.imageSource]);a.editorialStatus='RESEARCH_DRAFT_REPRODUCTION_ATTACHED_DELIVERY_AND_GLOBAL_CHECK_PENDING';}
attach('sofonisba_anguissola','Sofonisba Anguissola, Selvportræt ved staffeliet, 1556, Museum Castle in Łańcut.jpg',6100,7087,24.25,'Софонисба Ангвиссола, «Автопортрет у мольберта», 1556; Музей-замок, Ланьцут, 916MT; Nivaagaards Malerisamling / Mynewsdesk через Wikimedia Commons; PD-Art / public domain');
attach('clara_peeters','Clara Peeters - Still Life with Cheeses, Almonds and Pretzels.jpg',2500,1757,3.68,'Клара Петерс, «Натюрморт с сырами, миндалём и кренделями», около 1615; Mauritshuis, The Hague, 1203; фото Margareta Svensson (EXIF), музейный файл через Wikimedia Commons; PD-Art с юрисдикционной оговоркой');
B.sofonisba_anguissola.sources.push(['Прочитанное описание файла','https://en.wikipedia.org/wiki/File:Sofonisba_Anguissola,_Selvportr%C3%A6t_ved_staffeliet,_1556,_Museum_Castle_in_%C5%81a%C5%84cut.jpg']);
B.clara_peeters.sources.push(['Прочитанное описание файла и PD-Art','https://en.wikipedia.org/wiki/File:Clara_Peeters_-_Still_Life_with_Cheeses,_Almonds_and_Pretzels.jpg']);
function candidate(id,file,status){Object.assign(B[id].pendingWorks[0],{candidateFilePage:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file.replace(/ /g,'_')),candidateStatus:status});}
candidate('lavinia_fontana','Lavinia Fontana - Ritratto di nobildonna (ca. 1580).jpg','File page not read completely; unmodified file selected, not FXD derivative');
candidate('judith_leyster','Judith Leyster, Dutch (active Haarlem and Amsterdam) - The Last Drop (The Gay Cavalier) - Google Art Project.jpg','Licence not read; use restored painting, not 1908 catalogue state');
candidate('rachel_ruysch','Rachel Ruysch - Flowers in a vase - NG 6425.jpg','603 x 800; licence not read');
candidate('michaelina_wautier','Triumph of Bacchus, by Michaelina Woutiers.jpg','Licence not read');
candidate('elisabetta_sirani','Sirani Virgin and Child.jpg','812 x 996; no permission text extracted');
candidate('fede_galizia','Fede Galizia - Portrait of Paolo Morigia - WGA08429.jpg','1000 x 1104; licence not read; chronology unresolved');
candidate('giovanna_garzoni','Giovanna Garzoni (Italian) - Still Life with Bowl of Citrons - Google Art Project.jpg','4289 x 3259; file page inaccessible; licence not read');
if(typeof window.registerPaintingArtists!=='function')throw Error('Painting artist registry unavailable');
window.registerPaintingArtists(B);
})();
