/*ng-wikidata-bindings-v1*/
(()=>{const previous=window.registerPaintingArtists;window.registerPaintingArtists=function(batch){(function patch(batch,patches){for(const p of patches){const a=batch[p.artistId];if(!a)continue;a.works=a.works||[];a.pendingWorks=a.pendingWorks||[];if(a.works.some(w=>w.key===p.key)){if(!a.works.some(w=>w.key===p.key&&w.image===p.image))throw Error('Installed binding differs');continue;}
let old={};if(p.mode==='promote_pending'){const matches=a.pendingWorks.filter(w=>p.pendingKey?w.key===p.pendingKey:w.source===p.source);if(matches.length!==1||matches[0].source!==p.source)throw Error('Pending target changed');old=matches[0];if(old.image)throw Error('Existing image must not be overwritten');a.pendingWorks=a.pendingWorks.filter(w=>w!==old);}else if(p.mode!=='create_work')throw Error('Unknown mode');
const {reason,...original}=old;const w={...original,key:p.key,title:old.title||p.displayTitle||p.title,originalTitle:old.originalTitle||p.originalTitle,date:old.date||p.date,medium:old.medium||p.medium,museum:old.museum||p.museum,source:p.source,look:old.look||p.look||'',image:p.image,zoom:p.zoom,imageSource:p.imageSource,license:p.license,licenseURL:p.licenseURL,creditLine:p.creditLine,imageWidth:p.imageWidth,imageHeight:p.imageHeight,imageVisuallyReviewed:false,identityReviewBasis:p.identityReviewBasis,imageDeliveryStatus:p.imageDeliveryStatus,imageBindingBatch:'ng-wikidata-bindings-v1'};
if(p.attributionQualifier){w.attribution=p.artistId==='ghulam_ali_khan'?'Круг Гулама Али Хана':p.museumCreatorDisplay;w.title+=' — '+w.attribution;}else if(/\s\/\s/.test(p.museumCreatorDisplay||''))w.attribution=p.museumCreatorDisplay;
w.look+=' Репродукция: '+p.creditLine+'. '+(p.licenseURL?'Лицензия: '+p.licenseURL+'. ':'')+'Основная иллюстрация музейного объекта по Wikidata; ручная визуальная проверка не заявляется.';a.sources=a.sources||[];if(p.licenseURL&&!a.sources.some(x=>x[1]===p.licenseURL))a.sources.push(['Лицензия репродукции',p.licenseURL]);a.works.push(w);a.sources=a.sources||[];if(!a.sources.some(x=>x[1]===p.imageSource))a.sources.push(['Репродукция и сведения о правах',p.imageSource]);a.editorialStatus=a.pendingWorks.length?'partially_illustrated':'illustrated';}})(batch,[{"recordId":"918c4c654352b02406f61f51","artistId":"giacomo_ceruti","file":"artists-batch-94.js","fileSha256":"615cf1f83db55a721c1f2348f0c543e9f8a721b402af1290f0a3f33e42e2e876","mode":"promote_pending","pendingKey":"NG4205","key":"NG4205","title":"Портрет священника","source":"https://www.nationalgallery.org.uk/paintings/giacomo-ceruti-portrait-of-a-priest","image":"https://upload.wikimedia.org/wikipedia/commons/0/07/Giacomo_Antonio_Ceruti_%281698-1767%29_-_Portrait_of_a_Priest_-_NG4205_-_National_Gallery.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled","zoom":"https://upload.wikimedia.org/wikipedia/commons/0/07/Giacomo_Antonio_Ceruti_%281698-1767%29_-_Portrait_of_a_Priest_-_NG4205_-_National_Gallery.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original","imageSource":"https://commons.wikimedia.org/wiki/File:Giacomo_Antonio_Ceruti_(1698-1767)_-_Portrait_of_a_Priest_-_NG4205_-_National_Gallery.jpg","license":"Public domain","licenseURL":"","creditLine":"Giacomo Ceruti; Art UK; Public domain","attributionQualifier":"","museumCreatorDisplay":"Giacomo Ceruti","identityReviewBasis":"fresh_wikidata_inventory_museum_creator_and_primary_image","imageDeliveryStatus":"fresh display and zoom HTTP downloads decoded with sharp; no visual review claimed","imageWidth":616,"imageHeight":800}]);return previous.call(window,batch);};try{
(()=>{'use strict';
const B={},N='https://www.nationalgallery.org.uk/paintings/';
function add(id,name,latin,life,aliases,tag,bio,technique,innovation,features,caution,key,title,originalTitle,date,medium,museum,source,look){B[id]={name,latin,life,aliases:[name,latin,...aliases],tag,bio,technique,innovation,features,caution,sources:[[museum+': '+title,source]],works:[],pendingWorks:[{key,title,originalTitle,date,medium,museum,source,look,reason:'Конкретный свободный файл репродукции, его лицензия и кредит не проверены.'}],editorialStatus:'text_only_image_file_and_rights_pending'};}
add('giuseppe_maria_crespi','Джузеппе Мария Креспи','Giuseppe Maria Crespi','1665–1747',[],'Повседневный труд · свободная кисть',
['Мужчина снимает с осла тяжёлую корзину хлебных булочек. Покупатель справа поднимает руку, заказывая три.','Сцена связана с болонской традицией изображения уличных торговцев.'],
['Широкие размашистые мазки придают сцене движение.','Тёплая землистая палитра объединяет фигуры.'],
'Учебный ракурс — связь физического усилия, жеста покупателя и свободного письма.',
['Корзина: найди действие продавца.','Покупатель: прочитай поднятую руку.','Осёл: свяжи животное с перевозкой товара.','Мазок: проследи движение кисти.','Палитра: сравни тёплые землистые тона.'],
'Дата приблизительная. Парная работа — «Музыканты», NG6626; инструменты и персонажей соседнего полотна сюда не переносим.',
'NG6627','Крестьяне с ослами','Peasants with Donkeys','около 1710–1715','Масло на холсте','Национальная галерея, Лондон',N+'giuseppe-maria-crespi-peasants-with-donkeys',
'Как усилие продавца и жест покупателя организуют действие? Сопоставь их с размашистым мазком.');
add('pietro_longhi','Пьетро Лонги','Pietro Longhi','1701–1785',['Пьетро Фалька','Pietro Falca'],'Домашний интерьер · социальный ритуал',
['Хозяйка принимает нарядного посетителя, который кланяется с рукой на сердце.','Слева две служанки работают у вышивальной рамы: домашнее занятие соседствует с галантной встречей.'],
['Разные действия и социальные роли соединены в одном интерьере.','Жест приветствия предлагается сравнить с занятием служанок.'],
'Учебный ракурс — как расположение участников и их действия показывают устройство повседневной жизни.',
['Хозяйка: найди принимающую сторону.','Кавалер: проследи поклон.','Рука: выдели жест у сердца.','Служанки: найди вышивальную раму.','Интерьер: сопоставь два действия.'],
'Имена участников, повод визита и любовная история не установлены. Галантный жест сам по себе не раскрывает отношения персонажей. Фалька — вариант имени того же художника.',
'NG5841','Дама, принимающая кавалера','A Lady receiving a Cavalier','1745–1755','Масло на холсте','Национальная галерея, Лондон',N+'pietro-longhi-a-lady-receiving-a-cavalier',
'Сравни приветствие и работу у рамы. Что видно в жестах, а что было бы догадкой о личных отношениях?');
add('giacomo_ceruti','Джакомо Черути','Giacomo Ceruti','1697–1767',['Иль Питоккетто','Il Pitocchetto'],'Камерный портрет · свет и взгляд',
['Пожилой священник смотрит на зрителя с намёком на улыбку. Его личность неизвестна; духовный сан определяется по одежде.','Картина прежде приписывалась Пьяццетте, но текущая музейная атрибуция — Черути.'],
['Голова и левая рука резко освещены на простом фоне.','Свет подчёркивает черты, а взгляд усиливает ощущение непосредственной встречи.'],
'Учебный ракурс — присутствие человека создаётся не рассказом о его биографии, а светом, взглядом и сдержанной мимикой.',
['Лицо: выдели световой акцент.','Рука: найди второй акцент.','Взгляд: проследи обращение к зрителю.','Улыбка: оцени сдержанность мимики.','Фон: сравни с освещённой фигурой.'],
'Музейная страница расходится сама с собой: заголовок и таблица дают начало 1730-х, пояснение — 1720-е. Конфликт не снимаем произвольным выбором. Прозвище связано с изображениями бедняков, но не устанавливает положение этой модели.',
'NG4205','Портрет священника','Portrait of a Priest','начало 1730-х в таблице; 1720-е в пояснении','Масло на холсте; 99,7 × 78,1 см','Национальная галерея, Лондон',N+'giacomo-ceruti-portrait-of-a-priest',
'Как свет на голове и руке связывается со взглядом? Не заменяй наблюдение выдуманной биографией неизвестного человека.');
add('vittore_ghislandi','Витторе Гисланди','Vittore Ghislandi','1655–1743',['Джузеппе Гисланди','Giuseppe Ghislandi','Фра Гальгарио','Fra Galgario','Fra Vittore Galgario'],'Портрет · свободное письмо и цветовые переходы',
['Эрмитаж относит выбранный «Портрет мальчика» к 1730-м годам.','Музей отмечает широкую свободную манеру и насыщенное сочетание тёмно-синих и бордово-коричневых тонов.'],
['Для плавных переходов на лице художник применял краску пальцами; по описанию Эрмитажа, приём заметен и здесь.','Этот способ работы следует отличать от общего определения «свободный мазок».'],
'Учебный ракурс — связь конкретного способа нанесения краски с мягкостью моделировки лица.',
['Лицо: сравни плавность переходов.','Письмо: найди широкую манеру.','Синий: выдели тёмную цветовую группу.','Коричневый: сопоставь бордовые оттенки.','Техника: отдели локальный приём от всей картины.'],
'Не утверждаем, что весь портрет написан пальцами. Личность мальчика не устанавливаем. Витторе, Джузеппе и Фра Гальгарио — каталожные варианты имени одного художника, а не три автора.',
'ГЭ-5560','Портрет мальчика','Portrait of a Boy','1730-е','Масло на холсте; 67 × 52 см','Государственный Эрмитаж, Санкт-Петербург','https://www.hermitagemuseum.org/digital-collection/32440?lng=en',
'Сравни мягкость лица и широкую манеру письма. Как локальный приём помогает переходам цвета, не определяя технику всей работы?');
add('pietro_rotari','Пьетро Ротари','Pietro Rotari','XVIII век',['Пьетро Антонио Ротари','Pietro Antonio Rotari'],'Портрет · предмет и жест',
['Молодая женщина изображена погрудно; правой рукой она держит книгу перед подбородком.','Книга участвует в позе. Само её наличие ещё не доказывает, что изображён процесс чтения.'],
['Учебное рассматривание связывает предмет, руку и лицо.','Подробности книги и биография модели не подменяются предположениями.'],
'Учебный ракурс — отличие видимого портретного жеста от придуманного рассказа о занятии модели.',
['Книга: найди положение предмета.','Рука: проследи поддержку книги.','Подбородок: сравни расстояние до предмета.','Лицо: соотнеси с жестом.','Поза: отдели наблюдение от предположения о чтении.'],
'Имя модели, название и содержание книги неизвестны. Парная работа — «Молодая женщина», SK-A-3421; цветок в волосах из неё сюда не переносим. В life указан период, не проверенные точные годы жизни.',
'SK-A-3422','Молодая женщина с книгой','A Young Woman with a Book','1756–1762','Масло на холсте; 46 × 35,9 см','Рейксмюсеум, Амстердам','https://www.rijksmuseum.nl/en/collection/object/A-Young-Woman-with-a-Book--feac6ccb50984a5c0ee561de8468b22e',
'Как книга связана с рукой и лицом? Какие детали позволяют говорить о позе, но не подтверждают чтение конкретного текста?');
if(typeof window.registerPaintingArtists!=='function')throw Error('Painting artist registry unavailable');
window.registerPaintingArtists(B);
})();

}finally{window.registerPaintingArtists=previous;}})();
