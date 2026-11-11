import fs from 'node:fs';
import vm from 'node:vm';

let html=fs.readFileSync('index.html','utf8');
function jsonAt(prefix){
  const at=html.indexOf(prefix);
  if(at<0||html.indexOf(prefix,at+prefix.length)>=0)throw Error('Expected one '+prefix);
  const start=at+prefix.length;
  let depth=0,quoted=false,escaped=false;
  for(let i=start;i<html.length;i++){
    const c=html[i];
    if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}
    else if(c==='"')quoted=true;
    else if(c==='['||c==='{')depth++;
    else if((c===']'||c==='}')&&--depth===0)return {start,end:i+1,value:JSON.parse(html.slice(start,i+1))};
  }
  throw Error('Unclosed '+prefix);
}
const CARDS=jsonAt('const CARDS=').value;
const registry={...jsonAt('const ARTISTS=').value};
for(const file of fs.readdirSync('.').filter(n=>/^artists-batch-\d+\.js$/.test(n)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0])){
  const sandbox={CARDS,console,document:{getElementById:()=>null},MutationObserver:class{observe(){}}};
  sandbox.window=sandbox;
  sandbox.registerPaintingArtists=batch=>Object.assign(registry,batch);
  vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:5000});
}
const normalize=s=>String(s).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replaceAll('ё','е').replace(/[^\p{L}\p{N}]/gu,'');
const lookup=new Map();
for(const [id,a] of Object.entries(registry))for(const name of [a.name,a.latin,...(a.aliases||[])])if(name){
  const n=normalize(name);
  if(lookup.has(n)&&lookup.get(n)!==id)lookup.set(n,null);else if(!lookup.has(n))lookup.set(n,id);
}
const sections=[{"id":"quattro","title":"Кватроченто","names":["Паоло Уччелло","Андреа Мантенья","Доменико Гирландайо"],"existing":true},{"id":"cinque","title":"Чинквеченто","names":["Микеланджело","Джорджоне","Корреджо"],"existing":true},{"id":"northern","title":"Северное Возрождение","names":["Иероним Босх","Питер Брейгель Старший"],"existing":true},{"id":"baroque","title":"Барокко","names":["Артемизия Джентилески","Антонис ван Дейк","Жорж де Латур"],"existing":true},{"id":"dutch17","title":"Голландская живопись XVII века","names":["Франс Халс","Питер де Хох","Юдит Лейстер"],"existing":true},{"id":"impression","title":"Импрессионизм","names":["Огюст Ренуар","Эдгар Дега","Альфред Сислей","Мэри Кассат"],"existing":true},{"id":"realism","title":"Реализм XIX века","names":["Илья Репин","Валентин Серов"],"existing":true},{"id":"symbolism","title":"Символизм","names":["Михаил Врубель","Кузьма Петров-Водкин"],"existing":true},{"id":"surrealism","title":"Сюрреализм","names":["Сальвадор Дали","Рене Магритт","Макс Эрнст","Жоан Миро"],"note":"Раздел объединяет существующие карточки художников, указанных в таблице для сюрреализма."},{"id":"dada","title":"Дадаизм","names":["Макс Эрнст"],"note":"Дадаизм выделен отдельно от нео-дада. Карточка художника может относиться и к другим направлениям."},{"id":"neo_dada","title":"Нео-дада","names":["Роберт Раушенберг","Джаспер Джонс"],"note":"Нео-дада выделено отдельно от дадаизма; связанные направления не отождествляются."},{"id":"constructivism","title":"Конструктивизм","names":["Александр Родченко","Эль Лисицкий"],"note":"Лисицкий может одновременно оставаться в разделе супрематизма: связи между разделами не исключают друг друга."},{"id":"rayonism","title":"Лучизм","names":["Михаил Ларионов","Наталья Гончарова"],"note":"Раздел о лучизме не заменяет более широкий обзор русского авангарда и не сводит всё творчество Гончаровой к одному направлению."},{"id":"russian_avantgarde","title":"Русский авангард","names":["Михаил Ларионов","Наталья Гончарова"],"note":"Обзорный раздел, а не обозначение одного универсального стиля."},{"id":"jack_of_diamonds","title":"«Бубновый валет»","names":["Пётр Кончаловский"],"note":"Раздел художественного объединения, а не название единого стиля."},{"id":"mexican_muralism","title":"Мексиканский мурализм","names":["Диего Ривера","Хосе Клементе Ороско","Давид Альфаро Сикейрос"],"note":"Раздел объединяет существующие карточки художников, указанных в таблице для мексиканского мурализма."},{"id":"american_realism20","title":"Американский реализм XX века","names":["Эдвард Хоппер","Эндрю Уайет"],"note":"Этот раздел отделён от реализма XIX века."},{"id":"british_figurative_postwar","title":"Послевоенная британская фигуративная живопись","names":["Фрэнсис Бэкон","Люсьен Фрейд"],"note":"Обзорный раздел: творчество этих художников не объявляется единым универсальным стилем."},{"id":"superflat","title":"Superflat","names":["Такаси Мураками"],"note":"Раздел объединяет существующие карточки художников, указанных в таблице для Superflat."},{"id":"contemporary_photo_abstraction","title":"Современная живопись: фотография и абстракция","names":["Герхард Рихтер"],"note":"Обзорный раздел: творчество Рихтера не ограничивается фотореализмом."}];
const area=jsonAt('const DATA=');
const data=area.value;
let created=0,added=0;
for(const section of sections){
  const found=[];
  for(const name of section.names){
    const id=lookup.get(normalize(name));
    if(!id){console.log('Skip (no unambiguous artist card): '+name);continue;}
    if(!found.some(x=>x.id===id))found.push({id,artist:registry[id]});
  }
  if(!found.length)continue;
  let target=Object.hasOwn(data,section.id)?section.id:Object.keys(data).find(k=>normalize(data[k].title)===normalize(section.title));
  if(!target&&section.existing)throw Error('Existing guide section not found: '+section.title);
  if(!target){
    target=section.id;
    data[target]={title:section.title,group:'modern_contexts',registryOnly:true,overview:section.note,development:'',features:[],meta:{dates:'',names:[],extra:section.note,kind:'Художники с готовыми карточками'},sources:[]};
    created++;
  }
  const c=data[target];
  c.meta.links??={};
  for(const {id,artist} of found){
    if(!c.meta.names.some(n=>lookup.get(normalize(n))===id)){
      c.meta.names.push(artist.name);added++;
    }
    for(const n of c.meta.names)if(lookup.get(normalize(n))===id)c.meta.links[n]=id;
  }
  if(c.registryOnly){
    const seen=new Set(c.sources.map(x=>x[1]));
    for(const {artist}of found)for(const source of artist.sources||[])if(!seen.has(source[1])){c.sources.push(source);seen.add(source[1]);}
  }
}
const catalogueToPlace=`gillis_van_coninxloo hendrick_van_steenwyck_the_elder tobias_verhaecht joos_de_momper jan_van_ravesteyn floris_van_dijck roelant_savery jan_pynas pieter_lastman jan_porcellis hendrick_avercamp arent_arentsz esaias_van_de_velde nicolaes_eliasz_pickenoy floris_van_schooten moyses_van_wtenbrouck daniel_seghers nicolaes_moeyaert dirck_hals cornelis_vroom jacob_pynas roelof_koets nicolaes_gillis cornelis_van_poelenburgh willem_claesz_heda jan_jansz_den_uyl thomas_de_keyser jan_van_goyen pieter_claesz pieter_codde willem_duyster adriaen_van_utrecht jacob_duck johannes_verspronck anthonie_palamedesz susanna_van_steenwijck simon_de_vlieger aert_van_der_neer hendrick_van_steenwyck_the_younger dirck_van_delen pieter_quast jan_jansz_treck hendrick_martensz_sorgh herman_saftleven jan_miense_molenaer jan_asselijn bartholomeus_van_der_helst bartholomeus_van_bassen jan_both ludolf_de_jongh jan_pauwel_gillemans_the_elder jan_philip_van_thielen jan_van_den_hecke_the_elder philips_wouwerman philips_koninck aelbert_cuyp nicolaes_berchem cornelis_de_man egbert_van_der_poel hendrick_dubbels isack_van_ostade allart_van_everdingen pieter_boel jan_lingelbach paulus_potter jan_van_de_cappelle karel_dujardin alexander_coosemans job_berckheyde pieter_van_roestraten ludolf_bakhuizen esaias_boursse cornelis_de_heem willem_van_de_velde_the_younger frederick_de_moucheron jacob_ochtervelt eglon_hendrik_van_der_neer gaspar_peeter_verbruggen_the_elder frans_van_mieris_the_elder jean_baptiste_monnoyer adriaen_van_de_velde jan_van_der_heyden gerrit_berckheyde meindert_hobbema frans_van_cuyck_de_myerhop david_de_coninck jan_wijnants quiringh_van_brekelenkam abraham_storck jan_verkolje daniel_vosmaer willem_van_de_velde_the_elder reinier_nooms bonaventura_peeters_the_elder jean_baptiste_belin_de_fontenay chagall giacometti`.trim().split(/\s+/);
if(catalogueToPlace.length!==97||new Set(catalogueToPlace).size!==97)throw Error('Expected 97 distinct artist IDs');
const manneristIds=new Set('gillis_van_coninxloo hendrick_van_steenwyck_the_elder tobias_verhaecht joos_de_momper roelant_savery'.split(' '));
const baroqueIds=new Set('daniel_seghers adriaen_van_utrecht hendrick_van_steenwyck_the_younger jan_pauwel_gillemans_the_elder jan_philip_van_thielen jan_van_den_hecke_the_elder pieter_boel alexander_coosemans cornelis_de_heem gaspar_peeter_verbruggen_the_elder jean_baptiste_monnoyer frans_van_cuyck_de_myerhop david_de_coninck bonaventura_peeters_the_elder jean_baptiste_belin_de_fontenay'.split(' '));
const placementSections={school_of_paris:{title:'Парижская школа',dates:'Первая половина XX века',overview:'Парижская школа — историческая художественная среда, а не единый стиль. Художники разных стран, работавшие в Париже, развивали собственные версии модернизма. Марк Шагал соединял парижские пластические открытия с памятью о Витебске и собственным языком образов. Его творчество нельзя целиком объявлять сюрреализмом.',sources:[['Метрополитен-музей: Парижская школа','https://www.metmuseum.org/essays/school-of-paris'],['Филадельфийский художественный музей: Шагал и его круг','https://www.philamuseum.org/exhibitions/paris-through-the-window-marc-chagall-and-his-circle']]},european_figurative_postwar:{title:'Послевоенная европейская фигуративная живопись',dates:'Середина 1940-х — 1960-е; обзорный контекст',overview:'Обзорный раздел, не название единой школы. В послевоенной живописи Альберто Джакометти фигура и портрет становятся исследованием восприятия, расстояния и присутствия модели. Его участие в сюрреализме в начале 1930-х — отдельный этап: сюрреалистическая биография не делает все поздние портреты сюрреалистическими. Этот контекст не ограничен британской живописью.',sources:[['Музей Гуггенхайма в Бильбао: Альберто Джакометти','https://www.guggenheim-bilbao.eus/en/the-collection/artists/giacometti-alberto-2']]}};
for(const [id,info]of Object.entries(placementSections))if(!Object.hasOwn(data,id)){
 data[id]={title:info.title,group:'modern_contexts',registryOnly:true,overview:info.overview,development:'',features:[],meta:{dates:info.dates,names:[],links:{},extra:info.overview,kind:'Художники с готовыми карточками'},sources:info.sources};created++;
}
function bindCatalogueArtist(sectionId,artistId){
 const c=data[sectionId],a=registry[artistId];
 if(!c||!a)throw Error('Unresolved explicit artist binding: '+sectionId+' / '+artistId);
 c.meta.links??={};
 const matching=c.meta.names.filter(n=>c.meta.links[n]===artistId||normalize(n)===normalize(a.name)||lookup.get(normalize(n))===artistId);
 if(!matching.length){c.meta.names.push(a.name);matching.push(a.name);added++;}
 for(const name of matching){if(c.meta.links[name]&&c.meta.links[name]!==artistId)throw Error('Conflicting artist binding: '+name);c.meta.links[name]=artistId;}
 if(c.registryOnly){const seen=new Set(c.sources.map(s=>s[1]));for(const source of a.sources||[])if(!seen.has(source[1])){c.sources.push(source);seen.add(source[1]);}}
}
const explicitBindings=catalogueToPlace.map(id=>[id==='chagall'?'school_of_paris':id==='giacometti'?'european_figurative_postwar':manneristIds.has(id)?'mannerism':baroqueIds.has(id)?'baroque':'dutch17',id]);
explicitBindings.push(['dutch17','cornelis_de_heem']);
for(const [sectionId,artistId]of explicitBindings)bindCatalogueArtist(sectionId,artistId);
for(const [sectionId,artistId]of explicitBindings)if(!Object.values(data[sectionId].meta.links||{}).includes(artistId))throw Error('Artist remained unbound: '+artistId);
html=html.slice(0,area.start)+JSON.stringify(data)+html.slice(area.end);
const marker='/*guide-registry-sections-v1*/';
if(!html.includes(marker)){
  const anchor='function card(k,c){';
  if(html.split(anchor).length!==2)throw Error('Guide card renderer not found exactly once');
  const extra="/*guide-registry-sections-v1*/\nfunction guideArtist(n,c){const id=c.meta.links?.[n];if(!id)return escape(n);const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('artist',id);return `<a class=\"artist-link\" href=\"${escape(u.href)}\">${escape(n)}</a>`}\nfunction registryCard(k,c){return `<details class=\"guide-plus-card\"><summary><span>${escape(c.title)}</span><small>Художники раздела</small></summary><div class=\"guide-plus-body\"><p>${escape(c.overview)}</p><h3>${escape(c.meta.kind)}</h3><ul class=\"gp-artists\">${c.meta.names.map(n=>`<li>${guideArtist(n,c)}</li>`).join('')}</ul><p class=\"fine\">Раздел показывает имеющиеся страницы художников, включая страницы без встроенных репродукций. Он не добавляет вопросы и не меняет атрибуции работ в игре.</p>${c.sources.length?`<details class=\"gp-sources\"><summary>Источники карточек художников</summary>${c.sources.map(([t,u])=>`<a href=\"${escape(u)}\" target=\"_blank\" rel=\"noopener\">${escape(t)}</a>`).join('')}</details>`:''}</div></details>`}\n";
  html=html.replace(anchor,()=>extra+anchor+'if(c.registryOnly)return registryCard(k,c);');
  const old='${c.meta.names.map(n=>`<li>${escape(n)}</li>`).join(\'\')}';
  if(html.split(old).length!==2)throw Error('Artist list renderer not found exactly once');
  html=html.replace(old,()=> '${c.meta.names.map(n=>`<li>${guideArtist(n,c)}</li>`).join(\'\')}');
  const draw='function draw(){';
  if(html.split(draw).length!==2)throw Error('Guide draw function not found exactly once');
  html=html.replace(draw,"groupTitles.modern_contexts='Направления, объединения и обзорные разделы';\n"+draw);
}
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(match[1].trim())new vm.Script(match[1]);
fs.writeFileSync('index.html',html);
console.log(`Guide updated: ${created} new sections, ${added} artist entries; ${Object.keys(registry).length} existing artist cards. No artist cards created.`);
