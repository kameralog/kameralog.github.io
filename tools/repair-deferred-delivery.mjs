import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const file='tools/apply-deferred-bindings.mjs',marker='/*deferred-image-delivery-v2*/';
let source=fs.readFileSync(file,'utf8');
if(source.includes(marker)){console.log('Image delivery repair already installed');process.exit(0);}
const blob=createHash('sha1').update('blob '+Buffer.byteLength(source)+String.fromCharCode(0)).update(source).digest('hex');
assert.equal(blob,'843ec8a404f7c556fd1ef44179b7d3bea94d34c8','Deferred installer changed; stop rather than overwrite');
const expression=/^async function checked\(url\)\{[^\n]*\}\r?\n/gm;
assert.equal((source.match(expression)||[]).length,1,'Expected one original image downloader');
const replacement=String.raw`async function checked(input,{label='',fetcher=fetch,wait=ms=>new Promise(r=>setTimeout(r,ms)),decoder=async b=>{const m=await sharp(b,{limitInputPixels:80000000}).metadata();assert(m.width>=300&&m.height>=200,'Image too small');await sharp(b,{limitInputPixels:80000000}).resize(8,8).raw().toBuffer();return {width:m.width,height:m.height};},rounds=3}={}){const urls=[...new Set((Array.isArray(input)?input:[input]).filter(Boolean).flatMap(url=>{const u=new URL(url);assert.equal(u.protocol,'https:');if(u.hostname==='upload.wikimedia.org'&&u.pathname.includes('/commons/thumb/')){const alternate=new URL(u);alternate.hostname='thumb.wikimedia.org';return [u.href,alternate.href];}return [u.href];}))];assert(urls.length,'No image URL');const errors=[];for(let attempt=1;attempt<=rounds;attempt++){for(const url of urls){try{const r=await fetcher(url,{headers:{'User-Agent':'PaintingCatalogueAudit/1.1 (https://github.com/kameralog/painting-audit-data)','Referer':url.includes('wikimedia.org')?'https://commons.wikimedia.org/':'https://www.metmuseum.org/'},signal:AbortSignal.timeout(30000)});const type=r.headers.get('content-type')||'';if(!r.ok||!/^image\//i.test(type)){await r.body?.cancel();throw Error('HTTP '+r.status+'; content-type='+type);}const parts=[];let size=0;for await(const x of r.body){size+=x.length;assert(size<=20000000,'Image exceeds 20 MB');parts.push(x);}const b=Buffer.concat(parts),m=await decoder(b);return {...m,url:r.url||url,sha256:hash(b),bytes:b.length};}catch(e){const message='attempt '+attempt+'; '+url+'; '+e.message;errors.push(message);console.warn('[image '+label+'] '+message);}}if(attempt<rounds)await wait(1500*attempt);}throw Error('Image delivery failed for '+label+'\n'+errors.join('\n'));}`;
source=source.replace(expression,()=>marker+'\n'+replacement+'\n');
const old='const c=await checked(p.image);p.imageWidth=';
assert.equal(source.split(old).length,2,'Image binding call changed');
const next='const c=await checked([p.image,p.zoom],{label:p.key});p.image=c.url;const z=p.zoom===c.url?c:await checked([p.zoom,c.url],{label:p.key+" zoom"});p.zoom=z.url;c.zoom={url:z.url,width:z.width,height:z.height,sha256:z.sha256};p.imageWidth=';
source=source.replace(old,()=>next);
fs.writeFileSync(file,source);
console.log('Installed bounded retries, same-file original fallback, verified display/zoom URLs and HTTP diagnostics');
