import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const auth='<script type="module" src="./player-auth.js" id="painting-player-auth-module"></script>';
const cabinet='<script type="module" src="./player-cabinet.js" id="painting-player-cabinet-module"></script>';
function patch(html,catalog){
 html=html.replace(/<script type="application\/json" id="painting-save-catalog">[\s\S]*?<\/script>\n?/g,'');
 const tags=[auth,cabinet];
 for(const tag of tags){const id=tag.match(/id="([^"]+)"/)[1];const n=html.split('id="'+id+'"').length-1;if(n>1||n===1&&!html.includes(tag))throw Error('Unexpected module '+id);if(!n){if((html.match(/<\/head\s*>/gi)||[]).length!==1)throw Error('Expected one closing head');html=html.replace(/<\/head\s*>/i,tag+'\n</head>');}}
 const data=JSON.stringify(catalog).replaceAll('<','\\u003c');
 return html.replace(/<\/head\s*>/i,()=>'<script type="application/json" id="painting-save-catalog">'+data+'</script>\n</head>');
}
function extract(html,name){const prefix='const '+name+'=';const at=html.indexOf(prefix);if(at<0||html.indexOf(prefix,at+prefix.length)>=0)throw Error('Expected one '+name);const start=at+prefix.length;let depth=0,q=false,esc=false;for(let i=start;i<html.length;i++){const c=html[i];if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')q=false;}else if(c==='"')q=true;else if(c==='['||c==='{')depth++;else if((c===']'||c==='}')&&--depth===0)return JSON.parse(html.slice(start,i+1));}throw Error('Unclosed '+name);}
const sample='<html><head></head><body>unchanged</body></html>';
assert.equal(patch(patch(sample,[]),[]),patch(sample,[]));
assert.ok(!patch(sample,[{name:'</script>'}]).includes('"</script>"'));
assert.throws(()=>patch('<body></body>',[]));
if(!process.argv.includes('--test')){
 const html=fs.readFileSync('index.html','utf8'),CARDS=extract(html,'CARDS'),registry=extract(html,'ARTISTS');
 for(const file of fs.readdirSync('.').filter(n=>/^artists-batch-\d+\.js$/.test(n)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0])){
  const sandbox={CARDS,console,document:{getElementById:()=>null},MutationObserver:class{observe(){}}};sandbox.window=sandbox;sandbox.registerPaintingArtists=b=>Object.assign(registry,b);vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:5000});
 }
 const keys=new Set();
 const catalog=Object.entries(registry).map(([id,a])=>({id,name:a.name||id,latin:a.latin||'',tag:a.tag||'',aliases:a.aliases||[],works:(a.works||[]).filter(w=>w.key).map(w=>{if(keys.has(w.key))throw Error('Duplicate work '+w.key);keys.add(w.key);return {key:w.key,title:w.title||w.originalTitle||w.key,originalTitle:w.originalTitle||''};})}));
 if(!catalog.length)throw Error('Empty catalogue');
 const updated=patch(html,catalog);assert.equal(patch(updated,catalog),updated);
 if(updated!==html)fs.writeFileSync('index.html',updated);
 console.log('Installed cabinet catalogue: '+catalog.length+' artists, '+keys.size+' works.');
}
