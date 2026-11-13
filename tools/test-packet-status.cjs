const assert=require('node:assert/strict');
const c=require('../editorial/painting/github-packet-status.js');
const hash='a'.repeat(64),commit='b'.repeat(40),entry={packetHash:hash,sourcePath:'coordination/painting-editor/inbox/'+hash+'.json',sourceCommit:commit,count:30,manifestPath:'coordination/painting-editor/packets/'+hash+'/manifest.json',verified:true};
const data={schemaVersion:1,verificationVersion:1,packetCount:1,totalArtists:30,packets:[entry]},empty={schemaVersion:1,verificationVersion:1,packetCount:0,totalArtists:0,packets:[]},receipt={path:entry.sourcePath,commit,sentAt:'2026-11-13T17:20:33Z'};
const response=(value,status=200)=>({ok:status>=200&&status<300,status,json:async()=>value});
(async()=>{
assert.equal(c.validate(data),data);assert(c.match(data,receipt));assert(!c.match(data,{...receipt,commit:'c'.repeat(40)}));assert.equal(c.lastReceipt({bad:{path:'x',commit:'bad',sentAt:'bad'},good:receipt}),receipt);
assert.throws(()=>c.validate({...data,totalArtists:31}));assert.throws(()=>c.validate({...data,packetCount:2,packets:[entry,entry],totalArtists:60}));assert.throws(()=>c.validate({...data,packets:[{...entry,verified:false}]}));
let calls=[];const first=await c.load(async(url,options)=>{calls.push(url);assert.equal(options.credentials,'omit');return response(data)},'https://kameralog.github.io',receipt);assert.equal(calls.length,1);assert.equal(first.source,'исходный JSON GitHub');assert(calls.every(x=>!x.includes('api.github.com')));
calls=[];const fallback=await c.load(async url=>{calls.push(url);return url.startsWith('https://raw.')?response(null,403):response(data)},'https://kameralog.github.io',receipt);assert.equal(calls.length,2);assert.equal(fallback.source,'копия на сайте');assert(c.match(fallback.data,receipt));assert(calls.every(x=>!x.includes('api.github.com')));
const stale=await c.load(async()=>response(empty),'https://kameralog.github.io',receipt);assert(!c.match(stale.data,receipt));
const newer=await c.load(async url=>response(url.startsWith('https://raw.')?empty:data),'https://kameralog.github.io',receipt);assert.equal(newer.source,'копия на сайте');assert(c.match(newer.data,receipt));
await assert.rejects(()=>c.load(async()=>response(null,403),'https://kameralog.github.io',receipt),/HTTP 403/);
const invalid=await c.load(async url=>response(url.startsWith('https://raw.')?{...data,totalArtists:99}:data),'https://kameralog.github.io',receipt);assert.equal(invalid.source,'копия на сайте');
console.log(JSON.stringify({passed:true,checks:['index validation','receipt matching','invalid receipt','bad counts','duplicates','unverified packet','raw JSON','no REST requests','403 fallback','stale index not confirmed','fresher website copy','both sources denied','invalid primary fallback']}));
})().catch(error=>{console.error(error);process.exit(1)});
