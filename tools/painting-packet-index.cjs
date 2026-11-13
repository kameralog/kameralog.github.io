const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const INBOX='coordination/painting-editor/inbox/',OUT='coordination/painting-editor/packets/',LIMIT=16000;
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const serial=x=>JSON.stringify(x)+'\n';
function validate(p){
 assert.equal(p.schemaVersion,1);assert(['approved-editorial-briefs','research-requests'].includes(p.kind));assert(Array.isArray(p.artists)&&p.artists.length>0&&p.artists.length<=50);
 const ids=new Set;for(const a of p.artists){assert(a&&typeof a.id==='string'&&a.id.length>0&&a.id.length<=256);assert(!ids.has(a.id),'Duplicate artist ID');ids.add(a.id);assert(typeof a.name==='string'&&a.name.trim());
 if(p.kind==='approved-editorial-briefs'){assert.equal(a.status,'approved');assert(typeof a.mainDirection==='string'&&a.mainDirection.trim());assert(typeof a.synopsis==='string'&&a.synopsis.trim());}
 else {assert.equal(a.status,'research');assert((typeof a.mainDirection==='string'&&a.mainDirection.trim())||(typeof a.researchNote==='string'&&a.researchNote.trim()));}}
}
function build(text,sourcePath,sourceCommit){
 const digest=sha(text);assert.equal(sourcePath,INBOX+digest+'.json','Packet path/hash mismatch');assert(/^[a-f0-9]{40}$/.test(sourceCommit));
 const p=JSON.parse(text);validate(p);const files=new Map,entries=[];const {artists,...metadata}=p;
 const put=(name,content)=>{assert(Buffer.byteLength(content)<=LIMIT,'Derived file exceeds readable limit');files.set(name,content)};
 for(const a of artists){const content=serial(a),bytes=Buffer.from(content),digest=sha(bytes),name=digest+'.json';let format='json';
 if(bytes.length<=7500)put(name,content);
 else {format='base64-chunks';const parts=[];for(let offset=0;offset<bytes.length;offset+=8192){const chunk=bytes.subarray(offset,offset+8192),partPath=digest+'/'+String(parts.length).padStart(4,'0')+'.json',body=serial({encoding:'base64',data:chunk.toString('base64')});put(partPath,body);parts.push({path:partPath,sha256:sha(body)});}put(name,serial({encoding:format,bytes:bytes.length,sha256:digest,parts}));}
 entries.push({id:a.id,path:name,format,bytes:bytes.length,sha256:digest,fileSHA256:sha(files.get(name))});}
 const manifest={schemaVersion:1,sourcePath,sourceCommit,sourceSHA256:sha(text),sourceURL:'https://github.com/kameralog/kameralog.github.io/blob/'+sourceCommit+'/'+sourcePath,metadata,count:artists.length,entries};put('manifest.json',serial(manifest));return {digest,files,manifest};
}
function audit(bundle,text){
 const original=JSON.parse(text);validate(original);const m=JSON.parse(bundle.files.get('manifest.json'));assert.equal(m.sourceSHA256,sha(text));assert.equal(m.sourcePath,INBOX+sha(text)+'.json');assert.equal(m.count,original.artists.length);assert.equal(m.entries.length,m.count);const {artists,...metadata}=original;assert.deepEqual(m.metadata,metadata);
 for(let i=0;i<m.entries.length;i++){const e=m.entries[i],stored=bundle.files.get(e.path);assert.equal(e.id,artists[i].id);assert.equal(sha(stored),e.fileSHA256);let bytes;
 if(e.format==='json')bytes=Buffer.from(stored);
 else {assert.equal(e.format,'base64-chunks');const descriptor=JSON.parse(stored);assert.equal(descriptor.encoding,e.format);const chunks=descriptor.parts.map(part=>{const body=bundle.files.get(part.path);assert.equal(sha(body),part.sha256);const v=JSON.parse(body);assert.equal(v.encoding,'base64');return Buffer.from(v.data,'base64')});bytes=Buffer.concat(chunks);assert.equal(sha(bytes),descriptor.sha256);assert.equal(bytes.length,descriptor.bytes);}
 assert.equal(bytes.length,e.bytes);assert.equal(sha(bytes),e.sha256);assert.deepEqual(JSON.parse(bytes.toString('utf8')),artists[i]);}
 for(const value of bundle.files.values())assert(Buffer.byteLength(value)<=LIMIT);return true;
}
function run(root,write=false){
 const git=(...args)=>cp.execFileSync('git',args,{cwd:root,maxBuffer:4*1024*1024});const additions=new Map,packets=[];
 const input=path.join(root,INBOX);for(const name of fs.readdirSync(input).filter(x=>/^[a-f0-9]{64}\.json$/.test(x)).sort()){
 const sourcePath=INBOX+name,text=fs.readFileSync(path.join(root,sourcePath),'utf8');const history=git('log','--diff-filter=A','--format=%H','--',sourcePath).toString().trim().split(/\s+/);const sourceCommit=history.at(-1);assert(/^[a-f0-9]{40}$/.test(sourceCommit),'Source creation commit not found');assert.equal(git('show',sourceCommit+':'+sourcePath).toString(),text,'Original packet was modified after creation');
 const bundle=build(text,sourcePath,sourceCommit);audit(bundle,text);const base=OUT+bundle.digest+'/';for(const [relative,content]of bundle.files){const target=base+relative;if(fs.existsSync(path.join(root,target)))assert.equal(fs.readFileSync(path.join(root,target),'utf8'),content,'Existing derived file conflicts: '+target);additions.set(target,content);}
 packets.push({packetHash:bundle.digest,sourcePath,sourceCommit,count:bundle.manifest.count,manifestPath:base+'manifest.json',verified:true});}
 const index={schemaVersion:1,verificationVersion:1,packetCount:packets.length,totalArtists:packets.reduce((n,p)=>n+p.count,0),sourceSetSHA256:sha(JSON.stringify(packets)),packets};assert(Buffer.byteLength(serial(index))<=LIMIT);additions.set(OUT+'index.json',serial(index));let changed=0;
 for(const [target,content]of additions)if(!fs.existsSync(path.join(root,target))||fs.readFileSync(path.join(root,target),'utf8')!==content)changed++;
 if(write){for(const [target,content]of additions){fs.mkdirSync(path.dirname(path.join(root,target)),{recursive:true});fs.writeFileSync(path.join(root,target),content);}for(const [target,content]of additions)assert.equal(fs.readFileSync(path.join(root,target),'utf8'),content);}
 return {packetCount:index.packetCount,totalArtists:index.totalArtists,files:additions.size,changed,write};
}
module.exports={sha,serial,build,audit,run,INBOX,OUT,LIMIT};
if(require.main===module)console.log(JSON.stringify(run(process.cwd(),process.argv.includes('--write'))));
