import fs from 'node:fs';
import vm from 'node:vm';
const path='games/painting/index.html';
const tag='<script defer src="artist-articles.js" data-painting-mini-wiki="v1"></script>';
const original=fs.readFileSync(path,'utf8');
if(!original.includes('data-save-artist=')||!original.includes('class="ar-copy"'))throw Error('Artist renderer changed; refusing installation');
const data=JSON.parse(fs.readFileSync('games/painting/artist-articles.json','utf8'));
if(data.schemaVersion!==1||Object.keys(data.articles).sort().join(',')!=='caravaggio,vasily_kandinsky')throw Error('Expected two pilot articles');
for(const a of Object.values(data.articles)){if(!a.sections.length||!a.sources.length)throw Error('Empty article');for(const [title,url]of a.sources)if(!title||!url.startsWith('https://'))throw Error('Invalid source');for(const s of a.sections){if(!s.title||!s.paragraphs.length)throw Error('Empty section');for(const p of s.paragraphs)if(!p.text||!p.refs.length||p.refs.some(n=>!Number.isInteger(n)||n<1||n>a.sources.length))throw Error('Invalid paragraph source');}}
new vm.Script(fs.readFileSync('games/painting/artist-articles.js','utf8'));
let result=original;
if(!original.includes(tag)){
 if(original.includes('data-painting-mini-wiki='))throw Error('Different mini-wiki installation already exists');
 if((original.match(/<\/body>/gi)||[]).length!==1)throw Error('Expected one closing body');
 result=original.replace(/<\/body>/i,tag+'\n</body>');
 if(result.replace(tag+'\n','')!==original)throw Error('Unexpected modification outside insertion');
}
for(const m of result.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
if(process.argv.includes('--test')){console.log('Article schema, source references, JS syntax and additive installation checked');}else if(result!==original){fs.writeFileSync(path,result);console.log('Installed article loader; original page content preserved');}else console.log('Article loader already installed');
