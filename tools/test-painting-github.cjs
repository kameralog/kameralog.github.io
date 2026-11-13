const assert=require('node:assert/strict');
globalThis.crypto=require('node:crypto').webcrypto;
const core=require('../editorial/painting/github-send.js');
(async()=>{
const a={id:'test',name:'Тест',sources:[]},d={status:'approved',customDirection:'Тема',synopsis:'Синопсис',researchNote:'',revision:2,token:'must-not-be-exported'};
const b=core.brief(a,d,null);assert.equal(b.mainDirection,'Тема');assert(!JSON.stringify(b).includes('must-not-be-exported'));
const text=JSON.stringify({schemaVersion:1,artists:[b]})+'\n',hash=await core.hash(text),p={text,hash,path:'coordination/painting-editor/inbox/'+hash+'.json',kind:'approved-editorial-briefs',count:1};
const sha='a'.repeat(40),file={encoding:'base64',content:core.encode(text)};assert.equal(core.decode(file),text);
let remote=null,writes=0;const api=async(path,method='GET',body)=>{if(method==='PUT'){writes++;remote={encoding:'base64',content:body.content};return {commit:{sha}}}if(path.startsWith('commits?'))return [{sha}];return remote};
assert.equal((await core.deliver(p,api)).commit,sha);assert.equal(writes,1);assert.equal((await core.deliver(p,api)).commit,sha);assert.equal(writes,1);
await assert.rejects(()=>core.deliver({...p,text:'changed'},api),/повреждён/);
await assert.rejects(()=>core.deliver(p,async()=>({encoding:'base64',content:core.encode('different')})),/Конфликт/);
let lostRemote=null,lostWrites=0;const lost=async(path,method='GET',body)=>{if(method==='PUT'){lostWrites++;lostRemote={encoding:'base64',content:body.content};throw Error('Lost response')}if(path.startsWith('commits?'))return [{sha}];return lostRemote};
await assert.rejects(()=>core.deliver(p,lost),/Lost response/);assert.equal((await core.deliver(p,lost)).commit,sha);assert.equal(lostWrites,1);
await assert.rejects(()=>core.deliver(p,async(path,method)=>method==='PUT'?{commit:{sha}}:path.includes('?ref='+sha)?{encoding:'base64',content:core.encode('wrong')}:null),/не подтверждена/);
console.log('Passed: Unicode, field whitelist, first write, idempotent retry, corrupt payload, conflict, lost-response recovery, readback mismatch. No network requests made.');
})().catch(e=>{console.error(e);process.exit(1)});
