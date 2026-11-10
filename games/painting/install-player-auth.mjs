import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const auth='<script type="module" src="./player-auth.js" id="painting-player-auth-module"></script>';
const layout='<script type="module" src="./player-layout.js" id="painting-player-layout-module"></script>';
function patch(html){
 html=html.replace(/<script type="application\/json" id="painting-save-catalog">[\s\S]*?<\/script>\n?/g,'').replace(/<script type="module" src="\.\/player-cabinet\.js" id="painting-player-cabinet-module"><\/script>\n?/g,'');
 for(const tag of [auth,layout]){const id=tag.match(/id="([^"]+)"/)[1];const n=html.split('id="'+id+'"').length-1;if(n>1||n===1&&!html.includes(tag))throw Error('Unexpected module '+id);if(!n){if((html.match(/<\/head\s*>/gi)||[]).length!==1)throw Error('Expected one closing head');html=html.replace(/<\/head\s*>/i,()=>tag+'\n</head>');}}
 return html;
}
function extract(html,name){const prefix='const '+name+'=';const at=html.indexOf(prefix);if(at<0||html.indexOf(prefix,at+prefix.length)>=0)throw Error('Expected one '+name);const start=at+prefix.length;let depth=0,q=false,esc=false;for(let i=start;i<html.length;i++){const c=html[i];if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')q=false;}else if(c==='"')q=true;else if(c==='['||c==='{')depth++;else if((c===']'||c==='}')&&--depth===0)return JSON.parse(html.slice(start,i+1));}throw Error('Unclosed '+name);}
function cabinetPage(catalog){const data=JSON.stringify(catalog).replaceAll('<','\\u003c');return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Мой кабинет — Живопись</title><style>
:root{font-family:system-ui,sans-serif;color:#f2efde;background:#131611;color-scheme:dark;min-height:100%}*{box-sizing:border-box}body{margin:0;min-height:100vh;min-height:100dvh;background:#131611}header,main{max-width:1100px;margin:auto;padding:24px}header{border-bottom:1px solid #d5d8ca}header nav{display:flex;justify-content:space-between;gap:16px;align-items:center}h1{font-size:clamp(28px,5vw,42px)}a{color:#36532d}button{font:inherit;padding:10px 14px;border:1px solid #b8c1ac;border-radius:10px;background:#fff;color:#253d20;cursor:pointer}footer{margin-top:40px;color:#5b6355;font-size:14px;line-height:1.5}a:focus-visible,button:focus-visible{outline:3px solid #668d43;outline-offset:3px}
</style><script type="application/json" id="painting-save-catalog">${data}</script><script type="module" src="./player-auth.js"></script><script type="module" src="./player-cabinet.js"></script><script type="module" src="./player-layout.js"></script><script type="module" src="./cabinet-polish.js"></script></head><body data-player-cabinet="page"><header><nav><a href="./">← В игру</a><button id="account-button" type="button">Логин</button></nav><h1>Мой кабинет</h1></header><main><div id="cabinet-content"></div><noscript>Для работы кабинета включите JavaScript.</noscript><footer>Личные сохранения доступны после входа. На общем устройстве выходите из аккаунта после работы.</footer></main></body></html>
`;}
const sample='<html><head></head><body>unchanged</body></html>';
assert.equal(patch(patch(sample)),patch(sample));assert.throws(()=>patch('<body></body>'));
const old=sample.replace('</head>','<script type="application/json" id="painting-save-catalog">[]</script>\n<script type="module" src="./player-cabinet.js" id="painting-player-cabinet-module"></script>\n</head>');
assert.equal(patch(old),patch(sample));assert.ok(!cabinetPage([{name:'</script>'}]).includes('"</script>"'));
assert.equal(cabinetPage([]).split('src="./cabinet-polish.js"').length-1,1);
assert.ok(cabinetPage([]).includes('min-height:100dvh'));
if(!process.argv.includes('--test')){
 const html=fs.readFileSync('index.html','utf8'),CARDS=extract(html,'CARDS'),registry=extract(html,'ARTISTS');
 for(const file of fs.readdirSync('.').filter(n=>/^artists-batch-\d+\.js$/.test(n)).sort((a,b)=>+a.match(/\d+/)[0]-+b.match(/\d+/)[0])){
  const sandbox={CARDS,console,document:{getElementById:()=>null},MutationObserver:class{observe(){}}};sandbox.window=sandbox;sandbox.registerPaintingArtists=b=>Object.assign(registry,b);vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:5000});
 }
 const keys=new Set();
 const catalog=Object.entries(registry).map(([id,a])=>({id,name:a.name||id,latin:a.latin||'',tag:a.tag||'',aliases:a.aliases||[],works:(a.works||[]).filter(w=>w.key).map(w=>{if(keys.has(w.key))throw Error('Duplicate work '+w.key);keys.add(w.key);return {key:w.key,title:w.title||w.originalTitle||w.key,originalTitle:w.originalTitle||''};})}));
 if(!catalog.length)throw Error('Empty catalogue');
 const updated=patch(html);assert.equal(patch(updated),updated);
 if(updated!==html)fs.writeFileSync('index.html',updated);
 const page=cabinetPage(catalog);if(!fs.existsSync('cabinet.html')||fs.readFileSync('cabinet.html','utf8')!==page)fs.writeFileSync('cabinet.html',page);
 console.log('Cabinet page built: '+catalog.length+' artists, '+keys.size+' works.');
}
