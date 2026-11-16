import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const REPORT_COMMIT='5f1ceacc059f7f69a4bd36a104da4bceeda23823';
const REPORT_BLOB='9e27201bc1c764cbf086fd14abbf545c923de7e6';
const SPECS=[
 ['mina_carlson_bredberg_self_portrait','mina_carlson_bredberg',['Mina Carlson-Bredberg','Wilhelmina Bredberg','Wilhelmina Carlson-Bredberg']],
 ['hellqvist_visby','carl_gustaf_hellqvist',['Carl Gustaf Hellqvist','Karl Gustaf Hellqvist']],
 ['kronberg_romeo_juliet','julius_kronberg',['Julius Kronberg','Johan Julius Ferdinand Kronberg']],
 ['birger_montmartre','hugo_birger',['Hugo Birger','Hugo Birger Pettersson']],
 ['backmansson_astrom','hugo_backmansson',['Hugo Backmansson','Hugo Karlovich Backmansson']],
 ['rosenberg_winter_sunset','edward_rosenberg',['Edward Rosenberg','Edvard Rosenberg','Axel Edward Johan Rosenberg','Axel Edvard Johan Rosenberg']],
 ['westman_skagen','edvard_westman',['Edvard Westman','Gustaf Edvard Westman']],
 ['cederstrom_charles_xii','gustaf_cederstrom',['Gustaf Cederström','Gustaf Olof Cederström']],
 ['wallander_signhild','josef_wilhelm_wallander',['Josef Wilhelm Wallander','Wilhelm Wallander','Vilhelm Wallander','Joseph Wilhelm Wallander']],
 ['troili_self_portrait','uno_troili',['Uno Troili','Gustaf Uno Troili','Gustav Uno Troili']]
];
const norm=s=>String(s||'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function plain(s){return String(s||'').replace(/<div\b[^>]*display:\s*none[^>]*>[\s\S]*?<\/div>/gi,'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ').trim();}
function literal(html,prefix){const at=html.indexOf(prefix);if(at<0)throw Error('Missing '+prefix);let start=at+prefix.length;while(/\s/.test(html[start]||'')&&start<html.length)start++;let depth=0,quoted=false,escaped=false;for(let i=start;i<html.length;i++){const c=html[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='{'||c==='[')depth++;else if((c==='}'||c===']')&&--depth===0)return JSON.parse(html.slice(start,i+1));}throw Error('Unclosed '+prefix);}
function commonsName(value){try{const u=new URL(value);if(u.hostname!=='commons.wikimedia.org'||!u.pathname.startsWith('/wiki/File:'))return null;return decodeURIComponent(u.pathname.slice(6)).replaceAll('_',' ').toLowerCase();}catch{return null;}}
function buildRows(report,registry,cards){
 const existing=Object.entries(registry),works=[...cards,...existing.flatMap(([id,a])=>[...(a.works||[]),...(a.pendingWorks||[])].map(w=>({...w,owner:id})))],keys=new Set(works.map(w=>w.key).filter(Boolean));
 return report.rows.map(row=>{
  const spec=SPECS.find(s=>s[0]===row.id);if(!spec)throw Error('Unexpected target '+row.id);
  const [inputId,artistId,names]=spec,m=row.metadata||{},meta=m.extmetadata||{},key=Number.isInteger(m.pageid)?'painting159_commons_'+m.pageid:null;
  const wanted=new Set(names.map(norm));
  const matches=existing.filter(([id,a])=>id===artistId||[a.name,a.latin,...a.aliases||[]].filter(Boolean).some(n=>wanted.has(norm(n)))).map(([id,a])=>({id,name:a.name,latin:a.latin}));
  const file=commonsName(m.descriptionURL),duplicates=works.filter(w=>m.pageid&&(w.commonsPageId===m.pageid||file&&[w.source,w.imageSource].some(u=>commonsName(u)===file))).map(w=>({owner:w.owner||null,key:w.key||null,title:w.title||null}));
  const fields=Object.fromEntries(Object.entries(meta).filter(([k])=>!['ObjectName','Categories','DateTime','Assessments','CommonsMetadataExtension'].includes(k)));
  return {id:inputId,proposedArtistId:artistId,checkedNames:names,status:row.status,input:row.input,checks:row.checks,native:row.native,metadata:{pageid:m.pageid,title:m.title,descriptionURL:m.descriptionURL,originalURL:m.originalURL,mime:m.mime,width:m.width,height:m.height,extmetadata:fields,wikitext:m.wikitext,normalized:m.normalized,redirects:m.redirects},audit:{existingArtistMatches:matches,proposedWorkKey:key,keyCollision:key?keys.has(key):null,existingSourceMatches:duplicates},identityReviewed:false,rightsReviewed:false,imageVisuallyReviewed:false,readyToCommit:false};
 });
}
function selfTest(){
 assert.equal(new Set(SPECS.map(s=>s[1])).size,10);
 assert.equal(literal('const CARDS=[{"key":"x"}];','const CARDS=')[0].key,'x');
 assert.equal(norm('Gustaf Cederström'),norm('Gustaf Cederstrom'));
 assert.equal(plain('<b>A</b><div style="display: none;">hidden</div>'),'A');
 const row={id:SPECS[0][0],status:'passed',input:{},checks:[],metadata:{pageid:123,descriptionURL:'https://commons.wikimedia.org/wiki/File:Test.jpg',extmetadata:{LicenseShortName:{value:'Public domain'}},wikitext:'FULL TEXT'}};
 const out=buildRows({rows:[row]},{existing:{latin:'Wilhelmina Bredberg',works:[{key:'painting159_commons_123',source:'https://commons.wikimedia.org/wiki/File:Test.jpg'}]}},[])[0];
 assert.equal(out.audit.existingArtistMatches.length,1);assert.equal(out.audit.keyCollision,true);assert.equal(out.audit.existingSourceMatches.length,1);assert.equal(out.metadata.wikitext,'FULL TEXT');assert.equal(out.readyToCommit,false);
 console.log(JSON.stringify({selfTest:'passed',checks:['JSON-literal','accent-normalization','hidden-text','alias-match','key-collision','source-duplicate','full-wikitext','no-automatic-approval']}));
}
if(process.argv.includes('--self-test')){selfTest();process.exit(0);}
const raw=execFileSync('git',['show',REPORT_COMMIT+':reports/painting-browser/latest.json'],{maxBuffer:20000000});
const sha=createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex');if(sha!==REPORT_BLOB)throw Error('Unexpected archived report blob');
const report=JSON.parse(raw);if(report.runId!=='43867812458'||report.sourceCommit!=='5ccb4171154a53f3d3252405ad3a630f2f0ceed8')throw Error('Wrong browser run');
if(report.rows.length!==10||new Set(report.rows.map(r=>r.id)).size!==10)throw Error('Expected ten distinct targets');
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const directory='games/painting',html=fs.readFileSync(path.join(directory,'index.html'),'utf8'),cards=literal(html,'const CARDS='),registry=literal(html,'const ARTISTS=');
const modules=fs.readdirSync(directory).filter(f=>/^artists-batch-\d+\.js$/.test(f)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0]);
for(const file of modules){const sandbox={CARDS:cards,console,document:{getElementById:()=>null},MutationObserver:class{observe(){}}};sandbox.window=sandbox;sandbox.registerPaintingArtists=b=>Object.assign(registry,b);vm.runInNewContext(fs.readFileSync(path.join(directory,file),'utf8'),sandbox,{filename:file,timeout:5000});}
const rows=buildRows(report,registry,cards),folder='reports/painting-browser/159';
const payloads=rows.map((row,i)=>{const file='row-'+String(i).padStart(3,'0')+'.json',content=JSON.stringify({sourceReportCommit:REPORT_COMMIT,sourceReportBlob:REPORT_BLOB,browserRunId:report.runId,auditSnapshot:sourceCommit,...row},null,2)+'\n';if(Buffer.byteLength(content)>28000)throw Error('Row too large for connector: '+file);return {file,content,row};});
const summary={schemaVersion:1,status:'extracted_not_editorially_approved',sourceReportCommit:REPORT_COMMIT,sourceReportBlob:REPORT_BLOB,browserRunId:report.runId,browserStatus:report.status,browserSmokePassed:report.browserSmokePassed,auditSnapshot:sourceCommit,modules:modules.length,artists:Object.keys(registry).length,cards:cards.length,counts:{selected:rows.length,passed:rows.filter(r=>r.status==='passed').length,failed:rows.filter(r=>r.status==='failed').length,pending:rows.filter(r=>r.status==='pending').length},identityReviewed:false,rightsReviewed:false,imageVisuallyReviewed:false,readyToCommit:false,rows:payloads.map(({file,row:r})=>({id:r.id,path:folder+'/'+file,status:r.status,proposedArtistId:r.proposedArtistId,canonicalFile:r.metadata.title,pageid:r.metadata.pageid,artist:plain(r.metadata.extmetadata.Artist?.value),date:plain(r.metadata.extmetadata.DateTimeOriginal?.value),licenseDeclared:plain(r.metadata.extmetadata.LicenseShortName?.value),dimensions:(r.checks||[]).map(c=>({role:c.role,ok:c.ok,width:c.width,height:c.height})),...r.audit}))};
if(Buffer.byteLength(JSON.stringify(summary,null,2))>28000)throw Error('Summary too large for connector');
fs.mkdirSync(folder,{recursive:true});for(const f of fs.readdirSync(folder))if(/^row-\d{3}\.json$/.test(f)||f==='summary.json')fs.unlinkSync(path.join(folder,f));
for(const p of payloads)fs.writeFileSync(path.join(folder,p.file),p.content);
fs.writeFileSync(path.join(folder,'summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({browserStatus:report.status,counts:summary.counts,artistConflicts:rows.filter(r=>r.audit.existingArtistMatches.length).map(r=>r.id),keyConflicts:rows.filter(r=>r.audit.keyCollision).map(r=>r.id),sourceDuplicates:rows.filter(r=>r.audit.existingSourceMatches.length).map(r=>r.id),applicationModified:false}));
