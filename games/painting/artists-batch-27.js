(()=>{'use strict';
const batch={};
const rows=[
['hermione_grammatike','Портрет Гермионы Грамматики','Mummy portrait of Hermione Grammatike','I век н. э.','Римский Египет · Хавара · мумия с портретом',
'Анонимный мастер. Мумию нашёл Флиндерс Питри на кладбище Хавары в январе 1911 года. Греческая надпись рядом с портретом называет имя и профессию: Hermionê Grammatikê. Хранится в Girton College, Кембридж (Lawrence Room).',
'Портрет написан на льне, подготовленном тонким слоем штукатурки; мумия завёрнута в льняные пелены с ромбовидной обмоткой (по каталогу Girton).',
'Редкий случай, когда портрет сохранился на своей мумии вместе с именем и профессией, а не как отдельная доска.',
'Портрет на льне|Греческая надпись|Имя и профессия|Мумия в пеленах|Находка Питри 1911 года',
'«Грамматике» переводят как «учительница» или «образованная дама». В популярных текстах встречается утверждение, что это единственный известный портрет учёной женщины античности: я его не проверял и на странице не использую. Датировка «I век» дана общо, источники называют разные уточнения.',
'https://lrc.girton.cam.ac.uk/object-record.php?get_object_record=1',null,null,null,null,null,
'Пока без репродукции: условия публикации фотографии Girton College не проверены.'],
['cleveland_funerary_portrait_1971_137','Погребальный портрет из Кливленда (1971.137)','Funerary Portrait of a Young Girl','около 25–37 н. э.','Римский Египет · фаюмские погребальные портреты',
'Анонимный мастер. Кливленд называет работу Funerary Portrait of a Young Girl, поздний период Тиберия. Это доска, а не портрет на мумии.',
'Энкаустика по липовому дереву, 39,4 × 17,4 см. Музей датирует портрет по причёске, модной в конце правления Тиберия (14–37 н. э.).',
'По описанию музея, золочёные губы и украшения могли служить преображению духа, а не украшению тела. Одежда и причёска показывают принадлежность к греко-римскому кругу, а погребальный обряд — к египетскому.',
'Энкаустика на липе|Золочёные губы и украшения|Датировка по причёске|Греко-римская одежда|Египетский погребальный обряд',
'Название музея говорит о «молодой девушке», а в описании изображённая названа «женщиной»: возраст я не уточняю. Не путай с кливлендским портретом 1971.136 (энкаустика по льну, 138–192 н. э.).',
'https://www.clevelandart.org/art/1971.137','Погребальный портрет молодой девушки','около 25–37 н. э.','Кливлендский музей искусств','Энкаустика по липовому дереву; 39,4 × 17,4 см','1971.137',
'Рассмотри золочёные губы и украшения: музей связывает их с идеей преображения духа. Затем сравни греко-римскую причёску и одежду с египетским обрядом, ради которого сделана доска.'],
['tetitla_murals','Тетитла: росписи жилого комплекса','Tetitla murals','Теотиуакан, классический период','Теотиуакан · настенная роспись жилого комплекса',
'Памятник, а не художник. Тетитла — большой жилой комплекс на западной стороне зоны: десятки расписанных комнат вокруг дворов.',
'Фреска по влажной штукатурке; изображения часто выстроены ярусами. Среди сюжетов — ягуары, птицы, Великая богиня и повторяющиеся узоры в красном и зелёном (по обзорам).',
'Росписи показывают, что живопись Теотиуакана жила в частных жилищах элиты, а не только в храмах.',
'Жилой комплекс с двориками|Фреска по влажной штукатурке|Ягуары и птицы|Великая богиня|Повторяющиеся узоры',
'Это обзорные сведения из туристических и справочных текстов: официальную страницу INAH проверить не удалось. Идентификация «Великой богини» остаётся предметом споров. Часть росписей утрачена или реконструирована.',
'https://www.mexicocitytourism.org/teotihuacan/',null,null,null,null,null,
'Пока без репродукции: права на фотографии не проверены.'],
['atetelco_white_patio','Атетелько: Белый дворик','Atetelco, White Patio murals','Теотиуакан, классический период','Теотиуакан · настенная роспись жилого комплекса',
'Памятник, а не художник. Комплекс Атетелько расположен к югу от Тетитлы; росписи украшают портики Белого дворика.',
'Фреска. Яркие красные портики вокруг небольшого дворика; фигуры койотов в перьевых уборах и сетчатые ягуары повторяются в процессиях (по обзорам).',
'Росписи Атетелько называют одними из лучше сохранившихся в Теотиуакане; часть восстановлена.',
'Белый дворик|Красные портики|Койоты в перьевых уборах|Сетчатые ягуары|Повторяющиеся процессии',
'Это обзорные сведения из туристических и справочных текстов: официальную страницу INAH проверить не удалось. Часть росписей реконструирована, и отличить подлинный слой от восстановленного по фото нельзя.',
'https://www.ancient-history-sites.com/sites/teotihuacan/',null,null,null,null,null,
'Пока без репродукции: права на фотографии не проверены.']
];
const batchOut={};
for(const [id,name,latin,life,tag,bio,technique,innovation,features,caution,source,title,date,museum,medium,acc,look] of rows){
const sources=[['Основной источник',source]],works=[];
if(acc){works.push({key:'guide27:'+id,title,originalTitle:latin,date,museum,medium,source,image:'https://openaccess-cdn.clevelandart.org/'+acc+'/'+acc+'_web.jpg',zoom:'https://openaccess-cdn.clevelandart.org/'+acc+'/'+acc+'_print.jpg',license:'CC0 по странице Open Access Кливлендского музея',look});}
batchOut[id]={name,latin,life,tag,aliases:[name,latin],bio:[bio],technique:[technique],innovation,features:features.split('|'),caution,sources,works,editorialStatus:acc?'illustrated':'text_only_image_rights_pending'};}
batchOut.tetitla_murals.sources.push(['Справочный обзор Теотиуакана','https://www.ancient-history-sites.com/sites/teotihuacan/']);
batchOut.atetelco_white_patio.sources.push(['Обзор росписей Теотиуакана','https://www.mexicocitytourism.org/teotihuacan/']);
batchOut.hermione_grammatike.aliases.push('Гермиона','Hermione','Hermione Grammatike');
batchOut.tetitla_murals.aliases.push('Тетитла','Tetitla');
batchOut.atetelco_white_patio.aliases.push('Атетелько','Atetelco');
if(typeof window.registerPaintingArtists!=='function')throw Error('Painting artist registry unavailable');
window.registerPaintingArtists(batchOut);
const byName=new Map(Object.values(batchOut).map(a=>[a.name,a])),host=document.getElementById('view');
function fixHeading(){const page=document.getElementById('artist-area'),a=byName.get(page?.querySelector('h1')?.textContent);if(!a)return;for(const h of page.querySelectorAll('h2')){if(h.textContent==='Пять работ: рассмотри и сравни')h.textContent=a.works.length?'Одна работа: рассмотри внимательно':'Памятник: смотри источники';if(!a.works.length&&h.textContent==='Пять признаков для внимательного взгляда')h.textContent='Пять ориентиров для проверки';}}
if(host){new MutationObserver(fixHeading).observe(host,{childList:true,subtree:true});fixHeading();}
})();
