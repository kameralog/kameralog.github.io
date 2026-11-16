import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const HOSTS=new Set(['commons.wikimedia.org','upload.wikimedia.org','thumb.wikimedia.org','api.smk.dk','iip-thumb.smk.dk']);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function safeURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||!HOSTS.has(u.hostname))throw Error('URL not allowed: '+value);return u.href;}
function validate(data){
 if(data.schemaVersion!==1||!Array.isArray(data.items)||!data.items.length||data.items.length>50)throw Error('Expected schemaVersion=1 and 1..50 items');
 const ids=new Set();for(const x of data.items){if(typeof x.id!=='string'||!/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(x.id)||ids.has(x.id))throw Error('Invalid/duplicate id');ids.add(x.id);
  if(x.file){if(typeof x.file!=='string'||!x.file.startsWith('File:')||x.file.length>300||/[|\u0000-\u001f]/.test(x.file))throw Error('Invalid Commons filename');}
  else{safeURL(x.image);if(x.zoom)safeURL(x.zoom);}
 }return data;
}
function canonical(title,query){const map=new Map([...(query.normalized||[]),...(query.redirects||[])].map(x=>[x.from.replaceAll('_',' '),x.to.replaceAll('_',' ')]));let s=title.replaceAll('_',' ');const seen=new Set();while(map.has(s)){if(seen.has(s))throw Error('Redirect cycle');seen.add(s);s=map.get(s);}return s;}
function selfTest(){
 assert(safeURL('https://upload.wikimedia.org/a.jpg'));for(const u of ['http://upload.wikimedia.org/a','https://127.0.0.1/a','https://upload.wikimedia.org.evil.test/a','https://x:y@upload.wikimedia.org/a'])assert.throws(()=>safeURL(u));
 const item={id:'sample',file:'File:Example.jpg'};assert.equal(validate({schemaVersion:1,items:[item]}).items.length,1);assert.throws(()=>validate({schemaVersion:1,items:[item,item]}));
 assert.equal(canonical('File:a_b.jpg',{normalized:[{from:'File:a b.jpg',to:'File:A b.jpg'}],redirects:[{from:'File:A b.jpg',to:'File:Final.jpg'}]}),'File:Final.jpg');
 console.log(JSON.stringify({selfTest:'passed',checks:['https-host-allowlist','credentials-blocked','schema','duplicate-ids','canonical-redirects']}));
}
if(process.argv.includes('--self-test')){selfTest();process.exit(0);}
const OUT=path.resolve(process.env.REPORT_DIR||path.join(ROOT,'output/painting-browser'));
fs.mkdirSync(OUT,{recursive:true});
const report={schemaVersion:1,status:'not_run',sourceCommit:process.env.GITHUB_SHA||null,runId:process.env.GITHUB_RUN_ID||null,startedAt:new Date().toISOString(),browserSmokePassed:false,identityReviewed:false,rightsReviewed:false,imageVisuallyReviewed:false,rows:[],errors:[]};
function save(){report.updatedAt=new Date().toISOString();const done=report.rows.filter(x=>x.status!=='pending');report.counts={selected:report.rows.length,completed:done.length,passed:done.filter(x=>x.status==='passed').length,failed:done.filter(x=>x.status==='failed').length};const p=path.join(OUT,'report.json');fs.writeFileSync(p+'.tmp',JSON.stringify(report,null,2)+'\n');fs.renameSync(p+'.tmp',p);}
let browser;
try{
 const base=path.join(ROOT,'tools/painting-browser'),input=fs.realpathSync(path.resolve(ROOT,process.env.INPUT_MANIFEST||'tools/painting-browser/targets.json'));
 if(!input.startsWith(base+path.sep)||!input.endsWith('.json'))throw Error('Manifest must be JSON inside tools/painting-browser');
 const raw=fs.readFileSync(input,'utf8');if(Buffer.byteLength(raw)>200000)throw Error('Manifest too large');const manifest=validate(JSON.parse(raw));
 const limitText=process.env.INPUT_LIMIT||'10';if(!/^[1-9][0-9]?$/.test(limitText)||Number(limitText)>50)throw Error('Limit must be 1..50');
 const items=manifest.items.slice(0,Number(limitText));report.manifest=path.relative(ROOT,input);report.manifestSha256=(await import('node:crypto')).createHash('sha256').update(raw).digest('hex');report.totalInManifest=manifest.items.length;report.selectionComplete=items.length===manifest.items.length;
 report.rows=items.map(x=>({id:x.id,input:x,status:'pending',checks:[],identityReviewed:false,rightsReviewed:false,imageVisuallyReviewed:false}));save();
 if(process.argv.includes('--prepare'))process.exit(0);
 const {chromium}=await import('playwright');report.playwrightVersion=JSON.parse(fs.readFileSync(new URL('./node_modules/playwright/package.json',import.meta.url),'utf8')).version;
 browser=await chromium.launch({headless:true});report.browserVersion=browser.version();const context=await browser.newContext({viewport:{width:1000,height:760},acceptDownloads:false,serviceWorkers:'block'});
 await context.route('**/*',route=>{try{safeURL(route.request().url());return route.continue();}catch{return route.abort();}});
 const smoke=await context.newPage();const dims=await smoke.evaluate(async()=>{const im=new Image();im.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="3"/>');await im.decode();return [im.naturalWidth,im.naturalHeight];});assert.deepEqual(dims,[2,3]);await smoke.close();report.browserSmokePassed=true;report.status='running';save();
 const deadline=Date.now()+8*60*1000;
 async function api(titles,width){
  const u=new URL('https://commons.wikimedia.org/w/api.php');u.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',redirects:'1',prop:'imageinfo|revisions',iiprop:'url|size|mime|extmetadata',iiurlwidth:String(width),rvprop:'content',rvslots:'main',titles:titles.join('|')});
  for(let attempt=0;attempt<2;attempt++){
   if(Date.now()>deadline)throw Error('Metadata time budget exceeded');
   const res=await fetch(u,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'PaintingLibraryVerifier/1.0 (https://github.com/kameralog/kameralog.github.io)'}});
   if([429,503].includes(res.status)&&attempt===0){const wait=Number(res.headers.get('retry-after')||2);if(!Number.isFinite(wait)||wait>60)throw Error('Commons rate limited; retry later');await pause(Math.max(1,wait)*1000);continue;}
   if(!res.ok)throw Error('Commons HTTP '+res.status);const text=await res.text();if(Buffer.byteLength(text)>8000000)throw Error('API response too large');const d=JSON.parse(text);if(d.error||!d.query?.pages)throw Error('Commons API error: '+JSON.stringify(d.error));return d;
  }throw Error('Commons request failed');
 }
 const prepared=new Map(),commons=items.filter(x=>x.file);
 for(let n=0;n<commons.length;n+=20){
  const group=commons.slice(n,n+20),titles=group.map(x=>x.file);const small=await api(titles,1280);await pause(400);const large=await api(titles,2560);
  for(const x of group){const p=small.query.pages.find(p=>p.title===canonical(x.file,small.query)),q=large.query.pages.find(p=>p.title===canonical(x.file,large.query));const a=p?.imageinfo?.[0],b=q?.imageinfo?.[0];
   if(!a){prepared.set(x.id,{error:'Commons file missing or without imageinfo',canonical:p?.title||null});continue;}
   if(!Number.isInteger(a.width)||!Number.isInteger(a.height)||a.width<1||a.height<1){prepared.set(x.id,{error:'Invalid native image dimensions'});continue;}
   const image=a.thumburl||a.url;let zoom=b?.thumburl||b?.url||image;if(a.mime==='image/tiff'&&zoom===a.url)zoom=image;
   prepared.set(x.id,{image,zoom,native:[a.width,a.height],metadata:{pageid:p.pageid,title:p.title,descriptionURL:a.descriptionurl,originalURL:a.url,mime:a.mime,width:a.width,height:a.height,extmetadata:a.extmetadata,wikitext:p.revisions?.[0]?.slots?.main?.content??null,normalized:small.query.normalized||[],redirects:small.query.redirects||[]}});
  }await pause(400);
 }
 const cache=new Map();let screenshots=0;
 async function decode(url,index,screenshot){
  safeURL(url);if(cache.has(url))return {...cache.get(url),reused:true};let result;
  for(let attempt=1;attempt<=2;attempt++){
   if(Date.now()>deadline)throw Error('Image time budget exceeded');
   const page=await context.newPage();let http=null,finalURL=null,mime=null;page.on('response',r=>{if(r.request().resourceType()==='image'){http=r.status();finalURL=r.url();mime=r.headers()['content-type']||null;}});
   try{
    await page.setContent('<style>body{margin:0;background:#eee;display:grid;place-items:center;height:100vh}img{max-width:960px;max-height:720px;object-fit:contain}</style>');
    const natural=await page.evaluate(async url=>{const im=new Image();document.body.append(im);im.src=url;let timer;try{await Promise.race([im.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Decode timeout')),20000);})]);if(!im.naturalWidth||!im.naturalHeight)throw Error('Zero natural dimensions');return {width:im.naturalWidth,height:im.naturalHeight};}finally{clearTimeout(timer);}},url);
    if(http===null||http<200||http>=300||!mime?.toLowerCase().startsWith('image/'))throw Error('Unexpected image response: '+http+' '+mime);
    result={ok:true,url,finalURL,http,mime,...natural,attempt};
    if(screenshot&&screenshots<10){screenshots++;const name=String(index).padStart(3,'0')+'-image.png';try{await page.screenshot({path:path.join(OUT,name)});result.screenshot=name;}catch(e){result.screenshotError=String(e);}}break;
   }catch(e){result={ok:false,url,finalURL,http,mime,attempt,error:String(e)};}finally{await page.close();}
   if(http===429||Date.now()>deadline)break;await pause(1000);
  }cache.set(url,result);return result;
 }
 for(let index=0;index<items.length;index++){
  if(Date.now()>deadline)throw Error('Run time budget exceeded; remaining rows are pending');const x=items[index],row=report.rows[index],p=x.file?prepared.get(x.id):x;
  if(p?.error){row.status='failed';row.error=p.error;save();continue;}
  row.metadata=p.metadata||null;const native=p.native||null;row.native=native;
  for(const role of ['image','zoom']){try{const result=await decode(p[role]||p.image,index,role==='image');if(result.ok&&native&&(result.width>native[0]||result.height>native[1])){result.ok=false;result.error='Decoded derivative exceeds native dimensions';}row.checks.push({role,...result});}catch(e){row.checks.push({role,ok:false,error:String(e)});}save();if(row.checks.at(-1)?.http===429){row.status='failed';save();throw Error('Image host rate limited; remaining rows not run');}await pause(250);}
  row.status=row.checks.length===2&&row.checks.every(c=>c.ok)?'passed':'failed';save();
 }
 report.status=report.rows.every(r=>r.status==='passed')?'passed_selected_targets':'failed';
}catch(e){report.status='failed';report.errors.push(String(e));}
finally{if(browser)await browser.close().catch(e=>report.errors.push(String(e)));if(report.errors.length)report.status='failed';save();const summary='## Painting browser verification\n\nStatus: '+report.status+'\n\n'+JSON.stringify(report.counts)+'\n\nSource: '+report.sourceCommit+'\n\nThis checks technical image decoding only. Identity, rights, visual review, Pages publication and game rounds are not approved.\n';fs.writeFileSync(path.join(OUT,'summary.md'),summary);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);}
if(report.status!=='passed_selected_targets')process.exitCode=1;
