import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export const POLICY='image-discovery-v3';
const UA='PaintingImageDiscovery/1.0 (https://github.com/kameralog/kameralog.github.io)';
const OUT='reports/painting-image-discovery',TTL=7*86400000;
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const plain=x=>String(x||'').replace(/<[^>]*>/g,' ').replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replace(/\s+/g,' ').trim();
export function canonical(value){try{const u=new URL(value);u.hash='';u.hostname=u.hostname.replace(/^www\./,'');return u.hostname+decodeURIComponent(u.pathname).replace(/\/$/,'')+u.search;}catch{return '';}}
export function imageIdentity(value){try{const u=new URL(value);if(u.hostname==='upload.wikimedia.org')u.pathname=u.pathname.replace('/thumb/','/').replace(/(\/[^/]+)\/[^/]+px-[^/]+$/,'$1');return canonical(u.href);}catch{return '';}}
export function jsonValue(html,name){
 const matches=[...html.matchAll(new RegExp('(?<![\\w$])'+name+'\\s*=\\s*(?=[\\[{])','g'))];assert.equal(matches.length,1,'Expected one '+name);
 const start=matches[0].index+matches[0][0].length;let depth=0,quoted=false,escaped=false;
 for(let i=start;i<html.length;i++){const c=html[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='['||c==='{')depth++;else if((c===']'||c==='}')&&--depth===0)return JSON.parse(html.slice(start,i+1));}throw Error('Unclosed '+name);
}
export function inventory(root='.'){
 const base=path.join(root,'games/painting'),html=fs.readFileSync(path.join(base,'index.html'),'utf8'),cards=jsonValue(html,'CARDS'),registry=jsonValue(html,'ARTISTS');
 assert(Array.isArray(cards));const owners=new Map(Object.keys(registry).map(id=>[id,'index.html'])),registered=new Set();
 const files=fs.readdirSync(base).filter(f=>/^artists-batch-\d+\.js$/.test(f)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0]);
 for(const file of files){let count=0;const sandbox={CARDS:cards,console,document:{getElementById:()=>null},MutationObserver:class{observe(){}}};sandbox.window=sandbox;sandbox.registerPaintingArtists=batch=>{for(const[id,a]of Object.entries(batch)){assert(!registered.has(id),'Duplicate batch artist '+id);registered.add(id);registry[id]=a;owners.set(id,file);count++;}};vm.runInNewContext(fs.readFileSync(path.join(base,file),'utf8'),sandbox,{filename:file,timeout:5000});assert(count,'No registration in '+file);}
 const tasks=new Map(),known=[],existingKeys=new Set(),existingSources=new Set(),existingImages=new Set();
 function add(w,a,ref){
  if(w.image&&String(w.image).trim()){known.push({...w,artistId:a?.id||w.artistId||null});if(w.key)existingKeys.add(w.key);if(canonical(w.source))existingSources.add(canonical(w.source));if(imageIdentity(w.image))existingImages.add(imageIdentity(w.image));return;}
  const identity=w.key?'key:'+w.key:canonical(w.source)?'source:'+canonical(w.source):ref;
  let t=tasks.get(identity);if(!t){t={kind:'work',identity,key:w.key||'',title:w.title||w.originalTitle||'',originalTitle:w.originalTitle||'',source:w.source||'',museum:w.museum||'',artistId:a?.id||w.artistId||null,artist:a?.name||w.author||'',aliases:a?[a.latin,a.name,...(a.aliases||[])].filter(Boolean):[w.author].filter(Boolean),date:w.date||'',refs:[]};tasks.set(identity,t);}
  t.refs.push(ref);if(a){t.artistId=a.id;t.artist=a.name;t.aliases=[...new Set([a.latin,a.name,...(a.aliases||[])].filter(Boolean))];}if(!t.source)t.source=w.source||'';if(!t.originalTitle)t.originalTitle=w.originalTitle||'';
 }
 for(const c of cards)add(c,c.artistId&&registry[c.artistId]?{...registry[c.artistId],id:c.artistId}:null,'index.html:CARDS:'+c.key);
 let withoutImages=0;
 for(const[id,a]of Object.entries(registry)){
  const all=[];for(const bucket of ['works','pendingWorks']){assert(!a[bucket]||Array.isArray(a[bucket]),'Invalid '+bucket);for(const[wIndex,w]of (a[bucket]||[]).entries()){all.push(w);add(w,{...a,id},owners.get(id)+':'+bucket+':'+(w.key||wIndex));}}
  if(!all.some(w=>w.image&&String(w.image).trim())){withoutImages++;tasks.set('artist:'+id,{kind:'artist',identity:'artist:'+id,artistId:id,artist:a.name||id,aliases:[...new Set([a.latin,a.name,...(a.aliases||[])].filter(Boolean))],key:'',title:'',originalTitle:'',source:'',refs:[owners.get(id)],date:''});}
 }
 const queue=[...tasks.values()].map(t=>({...t,id:hash({policy:POLICY,kind:t.kind,identity:t.identity,title:t.title,originalTitle:t.originalTitle,source:t.source,aliases:t.aliases,artistId:t.artistId,date:t.date,museum:t.museum||''})}));
 let snapshot=null;try{snapshot=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
 return {queue,known,existingKeys,existingSources,existingImages,snapshot,counts:{artists:Object.keys(registry).length,batchFiles:files.length,baseRecords:cards.length,missingWorks:queue.filter(t=>t.kind==='work').length,artistsWithoutImages:withoutImages}};
}
const allowed=new Set(['api.artic.edu','www.artic.edu','artic.edu','openaccess-api.clevelandart.org','openaccess-cdn.clevelandart.org','commons.wikimedia.org','upload.wikimedia.org']);
export function allowedURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port&&!['443'].includes(u.port)||!allowed.has(u.hostname))throw Error('URL outside allowed image/API hosts');return u;}
export class Budget extends Error{}
export class Network{
 constructor({fetcher=fetch,maxRequests=180,seconds=720,interval=1200,sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){this.fetcher=fetcher;this.maxRequests=maxRequests;this.deadline=Date.now()+seconds*1000;this.interval=interval;this.sleep=sleep;this.requests=0;this.last=new Map();}
 async request(value,headers={}){
  let u=allowedURL(value);for(let redirects=0,attempt=0;;){
   if(this.requests>=this.maxRequests||Date.now()>=this.deadline)throw new Budget('Request/time budget exhausted');
   const delay=Math.max(0,(this.last.get(u.hostname)||0)+this.interval-Date.now());if(Date.now()+delay>=this.deadline)throw new Budget('Time budget exhausted');if(delay)await this.sleep(delay);
   this.last.set(u.hostname,Date.now());this.requests++;
   let response;try{response=await this.fetcher(u.href,{headers:{'User-Agent':UA,...headers},redirect:'manual',signal:AbortSignal.timeout(Math.max(1,Math.min(12000,this.deadline-Date.now())))});}catch(e){if(attempt++<2&&Date.now()+1000<this.deadline){await this.sleep(1000);continue;}throw e;}
   if(response.status>=300&&response.status<400){const location=response.headers.get('location');await response.body?.cancel();if(!location||redirects++>=3)throw Error('Invalid redirect');u=allowedURL(new URL(location,u).href);continue;}
   if([429,500,502,503,504].includes(response.status)&&attempt++<2){const wait=Math.min(3000,Math.max(1000,Number(response.headers.get('retry-after'))*1000||1000));await response.body?.cancel();if(Date.now()+wait>=this.deadline)throw new Budget('Time budget exhausted');await this.sleep(wait);continue;}
   if(!response.ok){await response.body?.cancel();throw Error('HTTP '+response.status);}return response;
  }
 }
 async bytes(response,limit,partial=false){const reader=response.body.getReader(),chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;const left=limit-size;if(value.length>left){if(!partial)throw Error('Response too large');chunks.push(value.subarray(0,left));size+=left;break;}chunks.push(value);size+=value.length;if(partial&&size>=32)break;}return Buffer.concat(chunks.map(c=>Buffer.from(c)));}finally{await reader.cancel().catch(()=>{});}}
 async json(url){const r=await this.request(url,{Accept:'application/json'}),j=JSON.parse((await this.bytes(r,3*1024*1024)).toString('utf8'));if(j.error)throw Error('API error: '+(j.error.code||j.error.message||'unknown'));if(j.warnings)throw Error('API warning; response requires review');return j;}
 async probe(url){const r=await this.request(url,{Range:'bytes=0-65535'}),mime=(r.headers.get('content-type')||'').split(';')[0].toLowerCase(),b=await this.bytes(r,65536,true);const jpeg=b[0]===255&&b[1]===216&&b[2]===255,png=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),gif=b.subarray(0,6).toString().match(/^GIF8[79]a$/),webp=b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP';return {ok:/^image\//.test(mime)&&!!(jpeg||png||gif||webp),mime,bytesInspected:b.length,checkedAt:new Date().toISOString()};}
}
const cc0={status:'documented_open',name:'CC0',url:'https://creativecommons.org/publicdomain/zero/1.0/',obligations:[]};
export function commonsRights(meta){
 const get=k=>plain(meta[k]?.value),name=get('LicenseShortName'),url=get('LicenseUrl'),restriction=get('Restrictions');
 const by=/^CC BY(?:-SA)? [1-4]\.0$/.test(name),pd=['Public domain','CC0','CC0 1.0','Public Domain Mark'].includes(name);
 const validURL=/^https?:\/\/creativecommons\.org\/(licenses\/by(?:-sa)?\/[1-4]\.0\/|publicdomain\/(zero|mark)\/1\.0\/)/.test(url);
 const author=get('Artist'),credit=get('Credit');
 const open=(by||pd)&&(!by||validURL&&!!author)&&!restriction;
 return {status:open?'documented_open':'unclear',name,url,author,credit,restrictions:restriction,obligations:by?['attribution','indicate_changes',...(name.includes('-SA')?['share_alike']:[])]:[],note:'Machine-readable source claim; not a legal or visual review.'};
}
function endpoint(base,params){const u=new URL(base);for(const[k,v]of Object.entries(params))u.searchParams.set(k,String(v));return u.href;}
export function direct(t){
 if(t.kind!=='work')return null;
 let u;try{u=new URL(t.source);}catch{}
 const a=t.key.match(/^aic:(\d+)$/)||u?.hostname.replace(/^www\./,'')==='artic.edu'&&u.pathname.match(/^\/artworks\/(\d+)/);
 if(a){const sourceId=u?.hostname.replace(/^www\./,'')==='artic.edu'?u.pathname.match(/^\/artworks\/(\d+)/)?.[1]:null;return {provider:'aic',id:a[1],conflict:!!u&&(u.hostname.replace(/^www\./,'')!=='artic.edu'||!!sourceId&&sourceId!==a[1])};}
 const c=t.key.match(/^cma:(\d+)$/)||u?.hostname.replace(/^www\./,'')==='clevelandart.org'&&u.pathname.match(/^\/art\/([^/]+)/);
 return c?{provider:'cma',id:decodeURIComponent(c[1]),conflict:!!u&&u.hostname.replace(/^www\./,'')!=='clevelandart.org'}:null;
}
function aicCandidate(j,t,exact=false){const d=j.data;if(!d?.id||!d.image_id||!j.config?.iiif_url)return null;const image=j.config.iiif_url.replace(/\/$/,'')+'/'+encodeURIComponent(d.image_id)+'/full/843,/0/default.jpg';allowedURL(image);return {provider:'aic',objectId:String(d.id),title:d.title||'',artist:d.artist_display||d.artist_title||'',date:d.date_display||'',source:'https://www.artic.edu/artworks/'+d.id,image,zoom:j.config.iiif_url.replace(/\/$/,'')+'/'+encodeURIComponent(d.image_id)+'/full/1686,/0/default.jpg',width:d.thumbnail?.width||null,height:d.thumbnail?.height||null,exact,rights:d.is_public_domain===true?{...cc0,evidence:'Art Institute API is_public_domain=true; open-access image policy'}:{status:'unclear',name:'',url:'',obligations:[]},creditLine:d.credit_line||'',identityBasis:exact?'museum_object_id':'search_result'};}
function cmaCandidate(d,t,exact=false){const image=d?.images?.web?.url||d?.images?.print?.url;if(!image)return null;allowedURL(image);return {provider:'cma',objectId:String(d.id),title:d.title||'',artist:(d.creators||[]).map(x=>x.description||x.name).filter(Boolean).join('; '),date:d.creation_date||'',source:d.url||'',image,zoom:d.images?.print?.url||image,width:Number(d.images?.web?.width)||null,height:Number(d.images?.web?.height)||null,exact,rights:d.share_license_status==='CC0'?{...cc0,evidence:'Cleveland API share_license_status=CC0'}:{status:'unclear',name:d.share_license_status||'',url:'',obligations:[]},creditLine:d.image_credit||d.creditline||'',identityBasis:exact?'museum_object_id_or_accession':'search_result'};}
export function sourceInMetadata(source,meta){const expected=canonical(source);if(!expected)return false;const raw=Object.values(meta).map(x=>String(x?.value||'')).join(' ').replaceAll('&amp;','&');return (raw.match(/https?:\/\/[^\s<>"']+/g)||[]).some(url=>canonical(url)===expected);}
function commonsCandidate(p,t){const i=p.imageinfo?.[0];if(!i?.url)return null;allowedURL(i.url);let image=i.thumburl||i.url;try{allowedURL(image);}catch{image=i.url;}const meta=i.extmetadata||{},rights=commonsRights(meta);return {provider:'commons',objectId:p.title,title:plain(meta.ObjectName?.value)||p.title,artist:plain(meta.Artist?.value),source:i.descriptionurl||'',image,zoom:i.url,width:i.thumbwidth||i.width,height:i.thumbheight||i.height,sha1:i.sha1||'',exact:false,sourceLinkMatch:sourceInMetadata(t.source,meta),identityBasis:sourceInMetadata(t.source,meta)?'same_museum_link_in_file_metadata':'search_result',rights,creditLine:[rights.author,rights.credit].filter(Boolean).join('; '),partial:/\b(detail|crop|cropped|fragment)\b/i.test(p.title),evidence:Object.fromEntries(['LicenseShortName','LicenseUrl','Artist','Credit','Source','Restrictions','ObjectName'].map(k=>[k,String(meta[k]?.value||'')]))};}
export async function discover(t,net,{probe=true,existingImages=new Set(),existingKeys=new Set(),existingSources=new Set(),known=[]}={}){
 const candidates=[],sources=[],errors=[];
 for(const w of known){if(t.kind==='work'&&(t.key&&w.key===t.key||canonical(t.source)&&canonical(t.source)===canonical(w.source))||t.kind==='artist'&&w.artistId===t.artistId){candidates.push({provider:'local',objectId:w.key||'',title:w.title||w.originalTitle||'',artist:w.author||'',source:w.source||'',image:w.image,zoom:w.zoom||w.image,exact:false,identityBasis:'existing_catalogue_reference',rights:{status:'unclear',name:w.license||'',url:'',obligations:[],note:'Existing record; rights not reverified.'},creditLine:w.creditLine||''});}}
 async function attempt(name,fn){try{const result=await fn();sources.push({name,complete:true});for(const c of result.filter(Boolean))candidates.push(c);}catch(e){sources.push({name,complete:false});errors.push({source:name,error:e.message});if(e instanceof Budget)throw e;}}
 const query=t.kind==='work'?[t.originalTitle||t.title,t.aliases[0]||t.artist].filter(Boolean).join(' '):t.aliases[0]||t.artist;
 const fields='id,title,image_id,is_public_domain,artist_display,artist_title,date_display,thumbnail,credit_line';
 let budget=false;
 try{
  const d=direct(t);
  if(d)await attempt('museum-direct',async()=>{
   if(d.conflict)throw Error('Work key and museum source conflict');
   const j=await net.json(d.provider==='aic'?'https://api.artic.edu/api/v1/artworks/'+encodeURIComponent(d.id)+'?fields='+fields:'https://openaccess-api.clevelandart.org/api/artworks/'+encodeURIComponent(d.id));
   const same=d.provider==='aic'?String(j.data?.id)===d.id:String(j.data?.id)===d.id||j.data?.accession_number===d.id;if(!same)throw Error('Museum object identity mismatch');
   if(d.provider==='cma'&&t.source){let source;try{source=new URL(t.source);}catch{}const accession=source?.pathname.match(/^\/art\/([^/]+)/)?.[1];if(accession&&decodeURIComponent(accession)!==j.data.accession_number)throw Error('Museum accession and source conflict');}return [d.provider==='aic'?aicCandidate(j,t,true):cmaCandidate(j.data,t,true)];
  });
  if(t.kind!=='work'||!t.source||d?.provider==='aic')await attempt('aic-search',async()=>{const j=await net.json(endpoint('https://api.artic.edu/api/v1/artworks/search',{q:query,'query[term][is_public_domain]':true,limit:2,fields:'id'})),out=[];if(!Array.isArray(j.data))throw Error('Invalid AIC search response');for(const x of j.data){const detail=await net.json('https://api.artic.edu/api/v1/artworks/'+encodeURIComponent(x.id)+'?fields='+fields);out.push(aicCandidate(detail,t,false));}return out;});
  if(t.kind!=='work'||!t.source||d?.provider==='cma')await attempt('cma-search',async()=>{const j=await net.json(endpoint('https://openaccess-api.clevelandart.org/api/artworks/',{q:query,cc0:true,has_image:1,limit:2}));if(!Array.isArray(j.data))throw Error('Invalid CMA search response');return j.data.map(x=>cmaCandidate(x,t,false));});
  if(t.kind==='work'&&t.source)await attempt('commons-source-link',async()=>{const j=await net.json(endpoint('https://commons.wikimedia.org/w/api.php',{action:'query',format:'json',formatversion:2,generator:'search',gsrnamespace:6,gsrsearch:'"'+t.source.replaceAll('"','')+'"',gsrlimit:5,prop:'imageinfo',iiprop:'url|size|sha1|extmetadata',iiurlwidth:1000}));const out=[];for(const p of j.query?.pages||[]){try{const c=commonsCandidate(p,t);if(c&&c.sourceLinkMatch)out.push(c);}catch(e){errors.push({source:'commons-file',file:p.title||'',error:e.message});}}return out;});
  await attempt('commons-search',async()=>{const q=[t.kind==='work'?t.originalTitle||t.title:'',t.aliases[0]||t.artist].filter(Boolean).join(' ');const j=await net.json(endpoint('https://commons.wikimedia.org/w/api.php',{action:'query',format:'json',formatversion:2,generator:'search',gsrnamespace:6,gsrsearch:q,gsrlimit:10,prop:'imageinfo',iiprop:'url|size|sha1|extmetadata',iiurlwidth:1000}));const out=[];for(const p of j.query?.pages||[]){try{const c=commonsCandidate(p,t);if(c)out.push(c);}catch(e){errors.push({source:'commons-file',file:p.title||'',error:e.message});}}return out;});
 }catch(e){if(e instanceof Budget)budget=true;else throw e;}
 const unique=new Map();for(const c of candidates){if(t.kind==='work'&&t.source){if(c.provider==='commons'){c.identityTier=c.sourceLinkMatch?'museum_link_candidate':'unverified_search_candidate';if(!c.sourceLinkMatch)c.identityBasis='unverified_search_result';}if(['aic','cma'].includes(c.provider)&&!c.exact&&canonical(c.source)!==canonical(t.source))continue;}const id=imageIdentity(c.zoom||c.image);if(!unique.has(id)||c.exact&&!unique.get(id).exact||c.sourceLinkMatch&&!unique.get(id).sourceLinkMatch)unique.set(id,c);}
 for(const c of unique.values()){
  c.duplicateExisting=existingImages.has(imageIdentity(c.image))||existingImages.has(imageIdentity(c.zoom))||existingSources.has(canonical(c.source));
  c.caution=[c.partial?'File name indicates a fragment/crop; preserve this note.':'',c.identityTier==='unverified_search_candidate'?'No matching museum link: artist, work and museum identity are NOT confirmed; keep only for separate review.':''].filter(Boolean).join(' ');
  let permitted=true;try{allowedURL(c.image);}catch{permitted=false;}
  if(probe&&!budget&&permitted){try{c.probe={...await net.probe(c.image),performed:true};}catch(e){c.probe={ok:false,error:e.message};errors.push({source:c.provider+'-image',error:e.message});if(e instanceof Budget)budget=true;}}else c.probe={ok:null,performed:false,reason:!permitted?'outside_probe_allowlist':!probe?'disabled':'budget_exhausted'};
  c.status=t.kind==='artist'?'artist_proposal':c.exact&&c.rights.status==='documented_open'&&c.probe.ok===true?'exact_candidate':c.exact&&c.rights.status==='documented_open'?'image_unverified':c.rights.status==='unclear'?'rights_unclear':'needs_identity_review';
 }
 return {policy:POLICY,taskId:t.id,probeRequested:probe,attemptedAt:Date.now(),status:budget||errors.length?'incomplete':unique.size?'candidates':'no_candidates_in_checked_results',budget,sources,errors,candidates:[...unique.values()],searchScope:'AIC/CMA only for matching museum or unscoped tasks; Commons exact source-link search plus title/artist search. Commons candidates with matching museum links and unverified search candidates are retained in distinct identity tiers; neither is visually confirmed. Up to 10 title/artist results are checked. No exhaustive-world-search claim.',visualReviewPerformed:false,gameFilesModified:false};
}
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageHref=x=>{try{return escape(allowedURL(x).href);}catch{return '';}};
const href=x=>{try{const u=new URL(x);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?escape(u.href):'';}catch{return '';}};
export function csvCell(x){let s=typeof x==='object'?JSON.stringify(x):String(x??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function render(inv,cache){
 const rows=inv.queue.map(task=>({task,result:cache.entries[task.id]||null})),cols=['taskKind','artist','workKey','workTitle','taskStatus','provider','candidateTitle','image','source','identityBasis','license','licenseURL','creditLine','candidateStatus','duplicateExisting','httpImageVerified'];
 cols.push('errors','searchScope','licenseObligations');
 const csv=[cols];for(const{task:t,result:r}of rows){if(!r?.candidates?.length)csv.push([t.kind,t.artist,t.key,t.title,r?.status||'not_processed','','','','','','','','','','','',r?.errors||[],r?.searchScope||'',[]]);else for(const c of r.candidates)csv.push([t.kind,t.artist,t.key,t.title,r.status,c.provider,c.title,c.image,c.source,c.identityBasis,c.rights.name,c.rights.url,c.creditLine,c.status,c.duplicateExisting,c.probe?.ok===true,r.errors,r.searchScope,c.rights.obligations||[]]);}
 const owners=new Map();for(const row of rows)for(const c of row.result?.candidates||[]){const key=imageIdentity(c.image);if(!owners.has(key))owners.set(key,new Set());owners.get(key).add(row.task.id);}
 for(const row of rows)for(const c of row.result?.candidates||[])c.sharedCandidateTasks=[...(owners.get(imageIdentity(c.image))||[])].filter(id=>id!==row.task.id);
 const body=rows.map(({task:t,result:r})=>'<details><summary>'+escape([t.kind,t.artist,t.title||t.key,r?.status||'not_processed'].join(' · '))+'</summary><p>Requested source: <a rel="noopener noreferrer" href="'+href(t.source)+'">'+escape(t.source)+'</a></p><p>'+escape(JSON.stringify(r?.errors||[]))+'</p>'+(r?.candidates||[]).map(c=>'<article><a target="_blank" rel="noopener noreferrer" href="'+href(c.source)+'">'+(imageHref(c.image)?'<img loading="lazy" referrerpolicy="no-referrer" src="'+imageHref(c.image)+'" alt="Candidate reproduction">':'Preview unavailable for this host')+'</a><h3>'+escape(c.title)+'</h3><p>'+escape(c.status+' · '+c.identityBasis)+'</p><p>'+escape(c.creditLine)+'</p><p><a target="_blank" rel="noopener noreferrer" href="'+href(c.rights.url)+'">'+escape(c.rights.name||'Rights unclear')+'</a></p><p>'+escape(c.caution)+'</p><p>HTTP image check: '+escape(JSON.stringify(c.probe))+'</p><p>Already present by URL: '+escape(c.duplicateExisting)+'</p><p>Also found for other targets: '+escape(c.sharedCandidateTasks.length)+'</p></article>').join('')+'</details>').join('\n');
 return {json:{policy:POLICY,snapshot:inv.snapshot,counts:inv.counts,rows,gameFilesModified:false,visualReviewPerformed:false},csv:'\ufeff'+csv.map(r=>cols.map((_,i)=>csvCell(r[i])).join(',')).join('\r\n')+'\r\n',html:'<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Поиск репродукций — кандидаты</title><style>body{font:16px/1.5 system-ui;max-width:1100px;margin:auto;padding:24px;background:#131611;color:#eee}a{color:#d2df98}details{border:1px solid #58664b;padding:12px;margin:12px 0}article{display:inline-block;vertical-align:top;width:290px;margin:12px;overflow-wrap:anywhere}img{max-width:100%;height:220px;object-fit:contain}summary{cursor:pointer}</style><h1>Поиск репродукций</h1><p>Только кандидаты. Лицензия — заявление источника, не юридическое заключение. Визуальная проверка не выполнена. Ошибка поиска не означает отсутствия изображения. Файлы игры не изменялись.</p><p>'+escape(JSON.stringify(inv.counts))+'</p>'+body+'</html>'};
}
export function reusable(result,now=Date.now(),requireProbe=false){return (!requireProbe||result?.probeRequested===true)&&result?.policy===POLICY&&['candidates','no_candidates_in_checked_results'].includes(result.status)&&Number.isFinite(result.attemptedAt)&&now>=result.attemptedAt&&now-result.attemptedAt<TTL;}
export async function run({root='.',limit=10,scope='all',inventoryOnly=false,probe=true,refresh=false,net=new Network()}={}){
 assert(Number.isInteger(limit)&&limit>=1&&limit<=25,'Limit must be 1..25');assert(['all','works','artists'].includes(scope));
 const inv=inventory(root),output=path.join(root,OUT);fs.mkdirSync(output,{recursive:true});let cache={policy:POLICY,entries:{}};try{const c=JSON.parse(fs.readFileSync(path.join(output,'cache.json'),'utf8'));if(c.policy===POLICY&&c.entries&&typeof c.entries==='object')cache=c;}catch{}
 const active=new Set(inv.queue.map(t=>t.id));for(const k of Object.keys(cache.entries))if(!active.has(k)||cache.entries[k]?.taskId!==k)delete cache.entries[k];
 const save=()=>{const f=path.join(output,'cache.json');fs.writeFileSync(f+'.tmp',JSON.stringify(cache));fs.renameSync(f+'.tmp',f);};
 const queue=inv.queue.filter(t=>scope==='all'||scope===(t.kind==='work'?'works':'artists')).filter(t=>refresh||!reusable(cache.entries[t.id],Date.now(),probe)).sort((a,b)=>(cache.entries[a.id]?.attemptedAt||0)-(cache.entries[b.id]?.attemptedAt||0));
 let processed=0;if(!inventoryOnly)for(const t of queue.slice(0,limit)){const result=await discover(t,net,{probe,existingImages:inv.existingImages,existingKeys:inv.existingKeys,existingSources:inv.existingSources,known:inv.known});cache.entries[t.id]=result;processed++;save();if(result.budget)break;}
 save();const report=render(inv,cache),summary={...inv.counts,snapshot:inv.snapshot,scope,processedThisRun:processed,httpRequests:net.requests,remainingDue:queue.filter(t=>!reusable(cache.entries[t.id],Date.now(),probe)).length,inventoryOnly,remainingAllDue:inv.queue.filter(t=>!reusable(cache.entries[t.id],Date.now(),probe)).length,gameFilesModified:false};
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report.json,null,2));fs.writeFileSync(path.join(output,'candidates.csv'),report.csv);fs.writeFileSync(path.join(output,'report.html'),report.html);fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(summary,null,2));return summary;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
 try{console.log(JSON.stringify(await run({limit:Number(get('--limit','10')),scope:get('--scope','all'),inventoryOnly:args.includes('--inventory'),probe:!args.includes('--no-probe'),refresh:args.includes('--refresh')}),null,2));}catch(e){console.error('Image discovery failed:',e.message);process.exitCode=1;}
}
