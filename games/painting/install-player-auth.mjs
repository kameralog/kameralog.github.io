import fs from 'node:fs';
import assert from 'node:assert/strict';
const tag='<script type="module" src="./player-auth.js" id="painting-player-auth-module"></script>';
function patch(html){
  const count=(html.match(/id="painting-player-auth-module"/g)||[]).length;
  if(count>1)throw Error('Duplicate auth module');
  if(count===1){if(!html.includes(tag))throw Error('Unexpected auth module tag');return html;}
  if((html.match(/<\/head\s*>/gi)||[]).length!==1)throw Error('Expected one head closing tag');
  return html.replace(/<\/head\s*>/i,tag+'\n</head>');
}
const sample='<html><head><title>Test</title></head><body>unchanged</body></html>';
assert.equal(patch(patch(sample)),patch(sample));
assert.equal(patch(sample).replace(tag+'\n',''),sample);
assert.throws(()=>patch('<body>no head</body>'));
if(!process.argv.includes('--test')){
 const html=fs.readFileSync('index.html','utf8');
 const result=patch(html);
 if(result!==html)fs.writeFileSync('index.html',result);
 console.log('Auth module installed; other HTML content preserved.');
}
