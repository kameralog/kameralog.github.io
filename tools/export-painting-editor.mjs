import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root='games/painting',out='editorial/painting';
const html=fs.readFileSync(root+'/index.html','utf8');
function readConstant(name){
 const match=new RegExp('\\bconst\\s+'+name+'\\s*=\\s*').exec(html);
 assert(match,'Missing '+name);
 const start=match.index+match[0].length;let depth=0,quoted=false,escaped=false;
 for(let i=start;i<html.length;i++){const c=html[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='['||c==='{')depth++;else if((c===']'||c==='}')&&--depth===0)return JSON.parse(html.slice(start,i+1));}
 throw Error('Unclosed '+name);
}
const CARDS=readConstant('CARDS'),registry=readConstant('ARTISTS');
const files=fs.readdirSync(root).filter(n=>/^artists-batch-\d+\.js$/.test(n)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0]);
assert(files.length,'No batches');
const owners=new Map(),baselineIds=Object.keys(registry);
for(const file of files){
 let registered=0;
 const sandbox={CARDS,console,Buffer,URL,document:{getElementById:()=>null},MutationObserver:class{observe(){}}};
 sandbox.window=sandbox;
 sandbox.registerPaintingArtists=batch=>{registered++;for(const [id,a]of Object.entries(batch)){assert(!owners.has(id),'Duplicate batch id '+id);owners.set(id,file);registry[id]=a;}};
 vm.runInNewContext(fs.readFileSync(root+'/'+file,'utf8'),sandbox,{filename:file,timeout:10000});
 assert(registered,'No registration in '+file);
}
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const artists=Object.entries(registry).map(([id,a])=>{
 assert(a&&typeof a.name==='string'&&a.name,'Missing name: '+id);
 return {id,name:a.name,latin:a.latin||'',life:a.life||'',tag:a.tag||'',status:'unresearched',directions:[],synopsis:'',notes:'Импорт существующей карточки. Исследовательское досье ещё не подготовлено.',sourceFile:owners.has(id)?root+'/'+owners.get(id):root+'/index.html',existing:{bio:a.bio||[],technique:a.technique||[],innovation:a.innovation||'',caution:a.caution||'',editorialStatus:a.editorialStatus||''},sources:(a.sources||[]).map(s=>({title:s[0],url:s[1]})),works:(a.works||[]).map(w=>({key:w.key,title:w.title,date:w.date,museum:w.museum,source:w.source})),pendingWorksCount:(a.pendingWorks||[]).length};
}).sort((a,b)=>a.name.localeCompare(b.name,'ru'));
assert(artists.length&&new Set(artists.map(a=>a.id)).size===artists.length);
fs.mkdirSync(out+'/records',{recursive:true});
for(const a of artists){assert(a.id!=='.'&&a.id!=='..','Unsafe id');fs.writeFileSync(out+'/records/'+encodeURIComponent(a.id)+'.json',JSON.stringify(a,null,2)+'\n');}
fs.writeFileSync(out+'/catalogue.json',JSON.stringify({schemaVersion:1,kind:'source-catalogue',sourceCommit,artists})+'\n');
let researchDossiersAvailable=0;
if(fs.existsSync(out+'/research/manifest.json')){
 const manifest=JSON.parse(fs.readFileSync(out+'/research/manifest.json','utf8'));assert.equal(manifest.schemaVersion,1);const seen=new Set;
 for(const path of manifest.packages){assert(/^[a-zA-Z0-9_-]+\.json$/.test(path));const pack=JSON.parse(fs.readFileSync(out+'/research/'+path,'utf8'));assert.equal(pack.schemaVersion,1);for(const d of pack.artists){assert(Object.hasOwn(registry,d.id)&&!seen.has(d.id));seen.add(d.id);assert(d.synopsis&&d.directions.length&&d.sources.length);for(const f of d.facts||[])for(const n of f.refs||[])assert(Number.isInteger(n)&&n>=1&&n<=d.sources.length);}}
 researchDossiersAvailable=seen.size;
 const loader=fs.readFileSync(out+'/research-loader.js','utf8');new vm.Script(loader);
 const page=out+'/index.html',before=fs.readFileSync(page,'utf8'),tag='<script defer src="research-loader.js"></script>';
 if(!before.includes(tag)){assert.equal((before.match(/<\/html>/gi)||[]).length,1);const after=before.replace(/<\/html>/i,tag+'\n</html>');assert.equal(after.replace(tag+'\n',''),before);fs.writeFileSync(page,after);}
}
fs.writeFileSync(out+'/summary.json',JSON.stringify({schemaVersion:1,sourceCommit,artists:artists.length,batches:files.length,baselineArtists:baselineIds.length,works:artists.reduce((n,a)=>n+a.works.length,0),researchDossiersGenerated:0,researchDossiersAvailable},null,2)+'\n');
const indexes=[];for(let i=0;i<artists.length;i+=100){const path='index-'+String(i/100).padStart(3,'0')+'.json';indexes.push(path);fs.writeFileSync(out+'/'+path,JSON.stringify(artists.slice(i,i+100).map(a=>({id:a.id,name:a.name,path:'records/'+encodeURIComponent(a.id)+'.json'})),null,2)+'\n');}
fs.writeFileSync(out+'/manifest.json',JSON.stringify({schemaVersion:1,sourceCommit,count:artists.length,indexes},null,2)+'\n');
console.log(JSON.stringify({artists:artists.length,batches:files.length,sourceCommit,researchDossiersAvailable}));
