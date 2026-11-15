import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const gitBlob=s=>createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0').update(s).digest('hex');
const helperText=fs.readFileSync('publish-uffizi-batch1.mjs','utf8');
assert.equal(gitBlob(helperText),'3a4d96c5443e6ccda9fd5cba00bbb7c257d31509');
const prefix=helperText.split('async function main(){')[0].replace('wiki-uffizi-batch1-v1','wiki-uffizi-batch2-v1');
const {read,wrap,getCards,test}=await import('data:text/javascript;base64,'+Buffer.from(prefix+'\nexport {read,wrap,getCards,test};\n').toString('base64'));
const pageBatch={alessandro_allori:101,anton_raphael_mengs:18,bernardino_luini:49,friedrich_amerling:19,aivazovsky:30,philippe_de_champaigne:102,anders_zorn:131,francesco_furini:96,andrea_del_sarto:10,lorenzo_di_credi:42,pontormo:10,vincenzo_foppa:45,fra_filippo_lippi:7};
const expected={7:'01ee7d3788527de5ffb426074ca49928eecea335',10:'7af53477d64e9066b68db2a71d59369d76c81960',18:'5ce2f1f2db8289222382d628491f146ba140a65f',19:'2d6a8fb188a3be71a5946259657940e31f0cbd00',30:'2c20ab42fa7e3676e09a99f7e6db05d64a2aaf02',42:'656690564835132847c274813847ffbc06f14d14',45:'3ef1402ab9fb26f167ad9293c80fcc91233de5f8',49:'725491847f9812f3d338148abe11bb3634362d97',96:'2a802cc0754b0f272d85950c5da085e95f30b174',101:'7f99d9131deb476705e2967f477aa2fb54f1327a',102:'b05d70e634bcbc7183cd77c35112b486286694cc',131:'e739ce3e4203064cf6ae3d05c749cc2b6ef6d633'};
const definitions=`51|Жертвоприношение Исаака|1601|Масло, дерево
52|Автопортрет|около 1555|Масло, дерево
53|Автопортрет|1773
54|Саломея с головой Иоанна Крестителя|1527
55|Дремлющая|около 1840
56|Автопортрет|1874|Масло, холст
57|Пейзаж с призванием святого Петра|около 1657|Масло, холст
58|Автопортрет|1889
59|Аллегория живописи и поэзии|1626|Масло, холст
61|Автопортрет с палитрой|1630–1646|Масло, холст
62|Автопортрет|1618–1620|Масло, холст на дереве
63|Мадонна с гарпиями|1517
64|Благовещение Сан-Галло|около 1512–1514
65|Благовещение с архангелом Михаилом и святым Годенцо|XVI век
66|Благовещение делла Скала|1528
67|Вознесение Богоматери — алтарь Пассерини|1526–1529|Масло, дерево
68|Вознесение Богоматери — алтарь Панчиатики|1522–1525
69|Автопортрет|1528
70|Дама с книгой стихов Петрарки|1528|Масло, дерево
71|Женщина с корзиной веретён|около 1516|Масло, дерево
72|Диспут о Троице|1517
73|Алтарь Валломброзы — четыре святых|1520-е годы
74|Истории Иосифа — вторая панель|1515–1516|Масло, дерево
75|Вознесение Богоматери — алтарь Поппи|1530
76|Не прикасайся ко мне|около 1510
77|Мадонна с Младенцем во славе с шестью святыми|около 1528
78|Пьета со святыми|1523–1524
79|Святое семейство Браччи|1520|Масло, дерево
80|Мадонна с Младенцем, святой Елизаветой и маленьким Иоанном Крестителем|1529
81|Юный Иоанн Креститель|около 1523
82|Истории Иосифа — первая панель|1515–1516|Масло, дерево
83|Поклонение пастухов|около 1510|Масло, дерево
84|Благовещение|1480
85|Венера|1493–1494
87|Футболист. Рисунок|1530-е годы|Рисунок
88|Поклонение волхвов|1519–1520|Масло, дерево
89|Ужин в Эммаусе|1525|Масло, холст
90|Рождество Иоанна Крестителя|около 1526
91|Портрет Козимо Медичи Старшего|около 1518–1520|Масло, дерево
92|Портрет музыканта|1518–1519|Масло, дерево
93|Святой Антоний Аббат|1519
94|Десять тысяч мучеников|1529–1530
95|Мадонна с Младенцем и ангелом|XV век
98|Мадонна с Младенцем и двумя ангелами|около 1460–1465
99|Поклонение Младенцу — алтарь Анналены|около 1453
100|Поклонение Младенцу — алтарь Камальдоли|около 1463|Темпера, дерево`.split('\n').map(line=>{const[n,title,date,medium='']=line.split('|');return {n:+n,title,date,medium};});
const esc=s=>encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
function urls(file,width){const filename=file.replace(/ /g,'_');const hash=createHash('md5').update(filename).digest('hex');const path=hash[0]+'/'+hash.slice(0,2)+'/'+esc(filename);const original='https://upload.wikimedia.org/wikipedia/commons/'+path;const sized=w=>w>=width?original:'https://thumb.wikimedia.org/wikipedia/commons/thumb/'+path+'/'+w+'px-'+esc(filename);return {image:sized(960),zoom:sized(1920)};}
function canonical(s){try{return decodeURIComponent(s||'').replace(/_/g,' ').toLowerCase()}catch{return s||''}}
async function main(){
const reportPath='reports/wiki-batches/batch-002.json',input=fs.readFileSync(reportPath,'utf8');assert.equal(gitBlob(input),'945ad49635d037b6270e92f873e264000280cdb3');const report=JSON.parse(input);assert.equal(report.records.length,50);assert.equal(definitions.length,46);assert.equal(new Set(definitions.map(d=>d.n)).size,46);
const cards=getCards(fs.readFileSync('index.html','utf8')),groups=new Map(),results=[];
for(const d of definitions){const row=report.records.find(r=>r[0]===d.n);assert(row);const[n,id,Q,originalFile,originalWidth,originalHeight]=row;assert(![60,86,96,97].includes(n));const bn=pageBatch[id];assert(bn);const filename='artists-batch-'+bn+'.js';if(!groups.has(filename)){const source=fs.readFileSync(filename,'utf8');assert.equal(gitBlob(source),expected[bn],filename+': changed since review');assert(!source.includes('/*wiki-uffizi-batch2-v1*/'));groups.set(filename,{filename,source,before:read(source,cards),records:[]});}const group=groups.get(filename),artist=group.before[id];assert(artist);const file=n===100?'Lippi, adorazione di camaldoli.jpg':originalFile,width=n===100?1550:originalWidth,height=n===100?1700:originalHeight;const imageSource='https://commons.wikimedia.org/wiki/File:'+esc(file.replace(/ /g,'_'));const key='wiki-uffizi-batch2:'+Q;assert(!(artist.works||[]).some(w=>w.key===key||canonical(w.imageSource)===canonical(imageSource)),'Existing reproduction');let note='Источник репродукции и условия использования указаны в карточке файла.';if(width<600)note+=' Небольшой исходный файл используется без искусственного увеличения.';if(n===55)note+=' Место хранения не указывается: независимая музейная сверка не выполнена.';if(n===57)note+=' Дата фотографии не является датой создания картины.';if(n===87)note+=' Это рисунок, а не живописное полотно.';if(n===89)note+=' Запись №86 относится к тому же произведению и второй карточкой не добавляется.';if(n===95)note+=' Источники расходятся в точной датировке и месте хранения; приведён только XV век, место хранения не утверждается.';const credit=artist.name+'; '+(n===95?'фотография Sailko; ':'')+'Wikimedia Commons; Public domain';const work={key,title:d.title,date:d.date,medium:d.medium,museum:[55,95].includes(n)?'':n===76?'Музей Андреа дель Сарто, Сан-Сальви, Флоренция':'Галереи Уффици, Флоренция',source:imageSource,...urls(file,width),imageSource,license:'Public domain (по карточке конкретного файла Commons)',creditLine:credit,imageWidth:Math.min(960,width),imageHeight:Math.round(height*Math.min(960,width)/width),originalImageWidth:width,originalImageHeight:height,imageVisuallyReviewed:false,imageReviewStatus:'Проверены идентификация по источникам, лицензионные шаблоны и браузерная загрузка; полный визуальный просмотр не подтверждён',look:note+' Репродукция: '+credit+'. Источник: '+imageSource};if(n===57)work.metadataSources=['https://fr.wikipedia.org/wiki/Liste_de_peintures_de_Philippe_de_Champaigne',imageSource];if(n===95)work.metadataSources=['https://www.wikidata.org/wiki/Q3842533',imageSource];group.records.push({number:n,artistId:id,work});results.push({number:n,artistId:id,workId:Q,status:'connected_pending_site_verification',artistPage:'https://kameralog.github.io/games/painting/?artist='+id,file:filename,commonsFile:file,checks:{identitySourceChecked:true,licenseTemplatesChecked:true,browserImageDecoded:true,existingCatalogueChecked:true,fullVisualReview:false},work});}
for(const group of groups.values()){group.next=wrap(group.source,group.records);const after=read(group.next,cards);assert.deepEqual(Object.keys(after),Object.keys(group.before));for(const id of Object.keys(group.before)){const own=group.records.filter(r=>r.artistId===id);if(!own.length){assert.deepEqual(after[id],group.before[id]);continue;}const keys=new Set(own.map(r=>r.work.key));assert.equal(after[id].works.length,(group.before[id].works||[]).length+own.length);assert.deepEqual(after[id].works.filter(w=>!keys.has(w.key)),group.before[id].works||[]);for(const field of Object.keys(group.before[id]))if(!['works','sources','editorialStatus'].includes(field))assert.deepEqual(after[id][field],group.before[id][field]);}}
assert.equal(groups.size,12);assert.equal(results.length,46);assert.equal(new Set(results.map(r=>r.artistId)).size,13);
for(const n of [60,96,97]){const row=report.records.find(r=>r[0]===n);results.push({number:n,artistId:row[1],workId:row[2],commonsFile:row[3],status:'deferred',reason:'Не подтверждено, что кадрирование не затрагивает само произведение; обрезка не объявляется доказанной',checked:{fileFound:true,licenseTemplatesChecked:true,browserImageDecoded:true,fullVisualReview:false},nextAction:'Сравнить с полной репродукцией или музейным изображением; при подтверждении полного изображения подключить без повторного поиска всего батча'});}
results.push({number:86,artistId:'pontormo',workId:'Q111822178',status:'duplicate',duplicateOfNumber:89,duplicateOfWorkId:'Q3664358',reason:'Тот же Ужин в Эммаусе: совпадают автор, название, 1525 год, размеры 230×173 см и категория Commons Supper at Emmaus by Pontormo; для сайта выбрана одна репродукция №89'});results.sort((a,b)=>a.number-b.number);assert.equal(results.length,50);
Object.assign(report,{status:'connected_publication_pending',readyConfirmed:46,newlyConnected:46,duplicatesCount:1,deferredConfirmed:3,sourceChecksPending:0,artistPages:13,sourceFiles:12,liveArtistsJsMatchesMain:false,renderedPagesVerified:false,gameQuestionsChanged:false,inputReportGitBlob:'945ad49635d037b6270e92f873e264000280cdb3',defaultRowStatus:'see_reviewResults',remainingChecks:['live_publication','rendered_artist_pages'],reviewResults:results});delete report.pendingRemainingChecks;report.licenseMetadata='Карточки и лицензионные шаблоны проверены; все выбранные файлы имеют основание Public domain. Для №100 выбран файл Lippi, adorazione di camaldoli.jpg с шаблоном PD-Art.';report.reviewNotes=['Дата фотографии у №57 не использована как дата картины; восстановлено название.', '№95: точная датировка и современное место хранения не утверждаются; сохранены имя художника и кредит фотографа Sailko.', 'Полный визуальный просмотр всех изображений не подтверждён. Попытка обзорного снимка не засчитана как выполненная визуальная проверка.', '№86 — дубль, не нерешённая работа. №60, 96, 97 оставлены отдельно и не блокируют остальные.'];
for(const group of groups.values())fs.writeFileSync(group.filename,group.next);fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');console.log('Connected 46 reproductions on 13 artist pages; one duplicate and three deferred.');
}
test();
if(!process.argv.includes('--self-test'))await main();
