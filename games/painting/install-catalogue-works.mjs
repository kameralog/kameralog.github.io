import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const stamp='catalogue-images-177-v1',snapshot='56f79e56736fec0c034ae3ec8644fd3c4a8d50d2';
let html=fs.readFileSync('index.html','utf8');
function area(prefix){
 const at=html.indexOf(prefix);assert(at>=0&&html.indexOf(prefix,at+prefix.length)<0,'Expected one '+prefix);
 const start=at+prefix.length;let depth=0,quoted=false,escaped=false;
 for(let i=start;i<html.length;i++){const c=html[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='{'||c==='[')depth++;else if((c==='}'||c===']')&&--depth===0)return {start,end:i+1,value:JSON.parse(html.slice(start,i+1))};}
 throw Error('Unclosed '+prefix);
}
const cardsArea=area('const CARDS='),CARDS=cardsArea.value,DATA=area('const DATA=').value,GROUPS=area('GROUPS=').value;
const existingExpansion=CARDS.filter(c=>c.expansion===stamp);
if(existingExpansion.length){assert.equal(existingExpansion.length,177,'Partial expansion');assert(existingExpansion.every(c=>c.quiz===true));console.log('177-work expansion already installed');}
else{
 const reports='../../reports/painting-image-audit/';
 const pages=fs.readdirSync(reports).filter(f=>/^candidates-\d+\.json$/.test(f)).sort();
 const candidates=pages.flatMap(f=>{const p=JSON.parse(fs.readFileSync(reports+f,'utf8'));assert.equal(p.snapshot,snapshot,'Audit snapshot changed');return p.rows;}).filter(r=>r.status==='not_found_in_current_base');
 assert.equal(candidates.length,177,'Expected exactly 177 new works');assert.equal(new Set(candidates.map(r=>r.key)).size,177);
 const before=JSON.stringify(CARDS),activeBefore=CARDS.filter(c=>c.quiz===true).length;
 const existingKeys=new Set(CARDS.map(c=>c.key));
 assert(candidates.every(r=>r.image&&!existingKeys.has(r.key)),'Missing image or key collision');
 const registry={...area('const ARTISTS=').value};
 for(const file of fs.readdirSync('.').filter(f=>/^artists-batch-\d+\.js$/.test(f)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0])){
  const sandbox={CARDS,console,document:{getElementById:()=>null},MutationObserver:class{observe(){}}};sandbox.window=sandbox;
  sandbox.registerPaintingArtists=batch=>Object.assign(registry,batch);
  vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:5000});
 }
 const artistLabels={giovanni_battista_tiepolo:'rococo',hubert_robert:'neo',henri_de_toulouse_lautrec:'post',portrait_of_eutyches:'roman_egypt',klimt:'symbolism',munch:'expressionism',antonello_da_messina:'quattro',andrea_del_verrocchio:'quattro',piero_del_pollaiuolo:'quattro',filippino_lippi:'quattro',pietro_perugino:'quattro',andrea_del_castagno:'quattro',domenico_veneziano:'quattro',benozzo_gozzoli:'quattro',cosimo_tura:'quattro',francesco_del_cossa:'quattro',ercole_de_roberti:'quattro',giovanni_bellini:'quattro',gentile_bellini:'quattro',vittore_carpaccio:'quattro',alesso_baldovinetti:'quattro',francesco_bonsignori:'quattro',boccaccio_boccaccino:'cinque',vincenzo_foppa:'quattro',ambrogio_bergognone:'quattro',bernardino_bergognone:'quattro',giovanni_ambrogio_de_predis:'quattro',bernardino_luini:'cinque',lorenzo_lotto:'cinque',bartholomeus_spranger:'mannerism',adam_elsheimer:'baroque'};
 const workLabels={'guide22:li_tang':'northern_song','rijks:SK-A-129':'mannerism','guide:coppo_di_marcovaldo':'duecento','guide:bonaventura_berlinghieri':'duecento'};
 const alternatives={'ng:NG1093':['quattro'],'ng:NG729':['cinque'],'guide23:mokuan':['kamakura'],'aic:16485':['baroque']};
 const notes={'ng:NG1093':'Лондонская версия создавалась в XV и XVI веках; оба столетия засчитываются.','ng:NG729':'Около 1500 года: из-за приблизительной пограничной даты принимаются XV и XVI века.','guide23:mokuan':'Датировка пересекает границу Камакура и Намбокутё; оба периода засчитываются.','guide22:li_tang':'Произведение 1124 года относится к Северной Сун, несмотря на более позднюю деятельность Ли Тана при Южной Сун.','aic:16485':'Венецианская живопись XVIII века: для этой работы принимаются рококо и позднебарочная традиция.'};
 const families={simone_martini:'simone-portable-altarpiece-1326',hasegawa_tohaku:'tohaku-pine-screens',kaiho_yusho:'yusho-seasonal-flowers'};
 const additions=candidates.map(r=>{
  const a=registry[r.artistId];assert(a,'Missing artist '+r.artistId);
  const w=(a[r.bucket]||[]).find(w=>w.key===r.key);assert(w&&w.image===r.image,'Changed work '+r.key);
  let label=workLabels[r.key]||artistLabels[r.artistId];
  if(!label){assert.equal(r.sections.length,1,'Ambiguous section '+r.key);label=r.sections[0].id;}
  const groups=Object.entries(GROUPS).filter(([,g])=>Object.hasOwn(g.choices,label));assert.equal(groups.length,1,'Unknown or ambiguous label '+label);
  const group=groups[0][0],acceptedLabels=alternatives[r.key]||[];
  assert(acceptedLabels.every(k=>k!==label&&Object.hasOwn(GROUPS[group].choices,k)),'Invalid accepted labels '+r.key);
  const credit=w.creditLine||(r.key==='guide:bonaventura_berlinghieri'?'Фото Sailko; версия Tetraktys; Wikimedia Commons; CC BY-SA 4.0':r.key==='guide20:previati'?'Fondazione Cariplo; CC BY-SA 3.0':'');
  let author=w.attribution||a.name;
  if(r.artistId==='portrait_of_eutyches')author='Неизвестный художник; римский Египет';
  if(r.key==='aic:94840')author='Мастерская Рембрандта';
  if(r.key==='cma:122348')author='Рембрандт ван Рейн / мастерская — по музейной записи';
  return {...w,key:r.key,author,artistId:r.artistId,image:r.image,zoom:w.zoom||r.image,label,group,quiz:true,family:w.family||families[r.artistId]||r.key,why:w.look||a.innovation||DATA[label]?.overview||'См. описание произведения в карточке художника.',studyNote:[w.studyNote,notes[r.key],a.caution,credit,w.license?'Права на изображение: '+w.license:'',w.imageSource?'Источник репродукции: '+w.imageSource:'',/CC BY-SA 4/.test(w.license||'')?'Лицензия: https://creativecommons.org/licenses/by-sa/4.0/':'',/CC BY-SA 3/.test(w.license||'')?'Лицензия: https://creativecommons.org/licenses/by-sa/3.0/':''].filter(Boolean).join(' '),creditLine:credit,acceptedLabels,expansion:stamp,classificationBasis:'explicit-work-override-or-reviewed-catalogue-context',imageVisuallyReviewed:false};
 });
 const next=[...CARDS,...additions];assert.equal(next.length,CARDS.length+177);assert.equal(new Set(next.map(c=>c.key)).size,next.length,'Duplicate card keys');
 assert.equal(JSON.stringify(next.slice(0,CARDS.length)),before,'Existing cards changed');assert.equal(next.filter(c=>c.quiz===true).length,activeBefore+177);
 html=html.slice(0,cardsArea.start)+JSON.stringify(next)+html.slice(cardsArea.end);
 console.log(JSON.stringify({added:177,before:CARDS.length,after:next.length,activeBefore,activeAfter:activeBefore+177}));
}
const marker='/*catalogue-177-accepted-answers*/';
if(!html.includes(marker)){
 function once(oldText,newText){assert.equal(html.split(oldText).length,2,'Runtime anchor changed: '+oldText);html=html.replace(oldText,()=>newText);}
 once('function options(c){',marker+'\nfunction catalogue177Correct(c,k){return k===c.label||!!(k&&c.acceptedLabels?.includes(k));}\nfunction options(c){');
 once('q.hidden.some(k=>k===c.label||!q.opts.includes(k))','q.hidden.some(k=>catalogue177Correct(c,k)||!q.opts.includes(k))');
 once("if(k===c.label)cl+=' correct';","if(catalogue177Correct(c,k))cl+=' correct';");
 once("q.answered&&!exam&&k===c.label?","q.answered&&!exam&&catalogue177Correct(c,k)?");
 once('const ok=q.selected===c.label;','const ok=catalogue177Correct(c,q.selected);');
 once('const ok=choice===c.label;','const ok=catalogue177Correct(c,choice);');
 once('x.q.opts.filter(k=>k!==x.c.label)','x.q.opts.filter(k=>!catalogue177Correct(x.c,k))');
}
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(m[1].trim()&&!/^\s*[\[{]/.test(m[1]))new vm.Script(m[1]);
fs.writeFileSync('index.html',html);
