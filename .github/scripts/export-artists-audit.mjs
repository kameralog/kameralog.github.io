import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const input=process.argv[2]||'reports/painting-artists.json';
const output=process.argv[3]||'reports/painting-artists';
const r=JSON.parse(fs.readFileSync(input,'utf8'));
if(r.version!==1||!['ok','conflicts','incomplete'].includes(r.status))throw Error('Unsupported audit report');
for(const key of ['artists','sources','errors','conflicts'])if(!Array.isArray(r[key]))throw Error('Missing '+key);
if(r.artists.length!==r.counts.records)throw Error('Record count mismatch');
if(new Set(r.artists.map(a=>a.id)).size!==r.counts.uniqueIds)throw Error('Unique count mismatch');
const limit=9000,files=[],parts=[];
const encode=x=>JSON.stringify(x)+'\n';
const hash=s=>createHash('sha256').update(s).digest('hex');
function split(kind,items){
 let chunk=[],number=0;
 function flush(){if(!chunk.length)return;const file=kind+'-'+String(++number).padStart(3,'0')+'.json';const text=encode({version:1,sourceCommit:r.sourceCommit,kind,items:chunk});if(Buffer.byteLength(text)>limit)throw Error('Oversized '+file);parts.push({kind,file,count:chunk.length,bytes:Buffer.byteLength(text),sha256:hash(text)});files.push({file,text});chunk=[];}
 for(const item of items){const next=[...chunk,item];if(Buffer.byteLength(encode({version:1,sourceCommit:r.sourceCommit,kind,items:next}))>limit)flush();chunk.push(item);if(Buffer.byteLength(encode({version:1,sourceCommit:r.sourceCommit,kind,items:chunk}))>limit)throw Error('One record exceeds part size: '+kind);}
 flush();
}
split('artists',r.artists);split('sources',r.sources);split('errors',r.errors);split('conflicts',r.conflicts);
const summary={version:1,status:r.status,sourceCommit:r.sourceCommit,counts:r.counts,errorCount:r.errors.length,conflictCount:r.conflicts.length,maxPartBytes:limit,parts};
const index=encode(summary);
if(Buffer.byteLength(index)>limit)throw Error('Index exceeds readable size');
fs.mkdirSync(output,{recursive:true});
for(const {file,text} of files)fs.writeFileSync(path.join(output,file),text);
for(const file of fs.readdirSync(output))if(/^(artists|sources|errors|conflicts)-\d+\.json$/.test(file)&&!files.some(x=>x.file===file))fs.unlinkSync(path.join(output,file));
fs.writeFileSync(path.join(output,'index.json'),index);
console.log(JSON.stringify({status:r.status,records:r.counts.records,parts:parts.length,indexBytes:Buffer.byteLength(index),maxPartBytes:Math.max(0,...parts.map(p=>p.bytes))}));
