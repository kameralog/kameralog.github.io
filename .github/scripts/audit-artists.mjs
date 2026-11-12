import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const args=process.argv.slice(2);
function option(key){const i=args.indexOf(key);if(i<0)return null;if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing '+key);return args[i+1];}
const root=path.resolve(option('--root')||'.'),dir=path.join(root,'games/painting');
const errors=[],sources=[],rows=[];
const norm=s=>String(s).normalize('NFKC').toLowerCase().replaceAll('ё','е').replace(/\s+/g,' ').trim();
function read(file){const data=fs.readFileSync(file);sources.push({file:path.relative(root,file).split(path.sep).join('/'),sha:createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex')});return data.toString('utf8');}
let CARDS=[];
try{
 const html=read(path.join(dir,'index.html')),m=/\bconst\s+CARDS\s*=\s*\[/.exec(html);
 if(!m)throw Error('CARDS not found');
 const start=m.index+m[0].length-1;let depth=0,quoted=false,escaped=false,end=-1;
 for(let i=start;i<html.length;i++){const c=html[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='[')depth++;else if(c===']'&&--depth===0){end=i+1;break;}}
 if(end<0)throw Error('Unclosed CARDS');CARDS=JSON.parse(html.slice(start,end));
}catch(e){errors.push('index.html: '+e.message);}
const candidate=option('--candidate'),candidatePath=candidate?path.resolve(candidate):null;
const files=fs.readdirSync(dir).filter(n=>/^artists-batch-\d+\.js$/.test(n)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0]);
if(!files.length)errors.push('No batches');
function load(file,isCandidate=false){
 const label=isCandidate?'candidate:'+path.basename(file):path.relative(root,file).split(path.sep).join('/');let calls=0;
 const sandbox={CARDS,console:{log(){},warn(){},error(){}},document:{getElementById:()=>null},MutationObserver:class{observe(){}}};sandbox.window=sandbox;
 sandbox.registerPaintingArtists=batch=>{calls++;for(const [id,a]of Object.entries(batch)){if(!a||typeof a!=='object')throw Error('Invalid artist '+id);rows.push({id,name:a.name||'',latin:a.latin||'',aliases:[...new Set([a.name,a.latin,...(a.aliases||[])].filter(Boolean).map(String))],file:label,candidate:isCandidate});}};
 try{vm.runInNewContext(isCandidate?fs.readFileSync(file,'utf8'):read(file),sandbox,{filename:label,timeout:5000});if(!calls)throw Error('No registered artists');}catch(e){errors.push(label+': '+e.message);}
}
for(const name of files){const file=path.join(dir,name);if(file!==candidatePath)load(file);}
const baseline=rows.length;
if(candidatePath)load(candidatePath,true);
const ids=new Map(),aliases=new Map(),conflicts=[];
for(const a of rows){if(ids.has(a.id))conflicts.push({type:'id',value:a.id,first:ids.get(a.id),second:{id:a.id,file:a.file}});else ids.set(a.id,{id:a.id,file:a.file});
 for(const value of new Set(a.aliases.map(norm))){if(!value)continue;const first=aliases.get(value);if(first&&first.id!==a.id)conflicts.push({type:'alias',value,first,second:{id:a.id,file:a.file}});else if(!first)aliases.set(value,{id:a.id,file:a.file});}}
let sourceCommit=null;try{sourceCommit=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
const report={version:1,status:errors.length?'incomplete':conflicts.length?'conflicts':'ok',sourceCommit,sources,counts:{batchFiles:files.length,baselineRecords:baseline,records:rows.length,uniqueIds:ids.size,candidateRecords:rows.filter(a=>a.candidate).length},errors,conflicts,artists:rows};
const text=JSON.stringify(report)+'\n',out=option('--out');
if(out){fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});fs.writeFileSync(out,text);}else process.stdout.write(text);
console.error(JSON.stringify({status:report.status,...report.counts,conflicts:conflicts.length,errors:errors.length}));
process.exitCode=report.status==='ok'?0:1;
