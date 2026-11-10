// Сборка artists.js из artists-batch-N.js + проверки + правка загрузчика в index.html.
// Запуск из папки games/painting:  node build-artists.mjs        (или --force, чтобы собрать при ошибках)
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const dir = process.cwd();
const force = process.argv.includes('--force');
const files = fs.readdirSync(dir)
  .map(f => f.match(/^artists-batch-(\d+)\.js$/))
  .filter(Boolean)
  .map(m => ({ n: +m[1], name: m[0] }))
  .sort((a, b) => a.n - b.n);

if (!files.length) { console.error('Не найдено ни одного artists-batch-N.js в ' + dir); process.exit(1); }

const errors = [], notes = [];
const norm = s => String(s).toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/\s+/g, ' ').trim();
for (let i = 1; i < files.length; i++) if (files[i].n !== files[i - 1].n + 1) errors.push(`Пропуск в нумерации: после ${files[i - 1].name} идёт ${files[i].name} (загрузчик остановится на пропуске)`);

const ids = new Map(), workKeys = new Map(), aliasOwners = new Map();
let total = 0;

for (const f of files) {
  const code = fs.readFileSync(path.join(dir, f.name), 'utf8');
  try { new vm.Script(code, { filename: f.name }); } catch (e) { errors.push(`${f.name}: синтаксическая ошибка: ${e.message}`); continue; }
  const got = [];
  const sandbox = { console, MutationObserver: class { observe() {} }, document: { getElementById: () => null } };
  sandbox.window = sandbox;
  sandbox.registerPaintingArtists = b => got.push(b);
  vm.createContext(sandbox);
  try { new vm.Script(code, { filename: f.name }).runInContext(sandbox, { timeout: 5000 }); }
  catch (e) { errors.push(`${f.name}: ошибка при выполнении: ${e.message}`); continue; }
  for (const batch of got) for (const [id, a] of Object.entries(batch)) {
    total++;
    if (ids.has(id)) errors.push(`Дубль id «${id}»: ${ids.get(id)} и ${f.name}`); else ids.set(id, f.name);
    for (const w of a.works || []) {
      if (workKeys.has(w.key)) errors.push(`Дубль ключа работы «${w.key}»: ${workKeys.get(w.key)} и ${f.name} (художник ${id})`); else workKeys.set(w.key, f.name);
    }
    const mine = new Set();
    for (const al of a.aliases || []) {
      const k = norm(al);
      if (mine.has(k)) { notes.push(`${f.name}: у «${id}» алиас «${al}» повторяется (безвредно)`); continue; }
      mine.add(k);
      if (aliasOwners.has(k) && aliasOwners.get(k) !== id) errors.push(`Алиас «${al}» у двух разных художников: ${aliasOwners.get(k)} и ${id}`);
      else aliasOwners.set(k, id);
    }
  }
}

console.log(`Файлов: ${files.length}, художников: ${total}, уникальных id: ${ids.size}`);
notes.forEach(n => console.log('  примечание: ' + n));
errors.forEach(e => console.log('  ОШИБКА: ' + e));
if (errors.length && !force) { console.error('\nСборка остановлена. Исправь ошибки или запусти с --force.'); process.exit(1); }

const out = files.map(f => {
  const code = fs.readFileSync(path.join(dir, f.name), 'utf8');
  return `/* ${f.name} */\ntry{\n${code}\n}catch(e){console.error(${JSON.stringify(f.name)},e)}\n`;
}).join('\n');
try { new vm.Script(out, { filename: 'artists.js' }); } catch (e) { console.error('Итоговый artists.js не компилируется: ' + e.message); process.exit(1); }
fs.writeFileSync(path.join(dir, 'artists.js'), out);
console.log(`Записан artists.js (${(Buffer.byteLength(out) / 1024).toFixed(0)} КБ)`);

const htmlPath = path.join(dir, 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  const marker = '/*artists.js-first*/';
  if (html.includes(marker)) console.log('index.html: загрузчик уже переключён на artists.js');
  else if (html.split('loadWave(2);').length === 2) {
    const patch = marker + "(function(){const sc=document.createElement('script');sc.async=true;sc.src=new URL('artists.js',location.href).href;sc.onload=()=>{sc.remove();finishLoading()};sc.onerror=()=>{sc.remove();loadWave(2)};document.head.append(sc)})();";
    fs.writeFileSync(htmlPath, html.replace('loadWave(2);', () => patch));
    console.log('index.html: загрузчик теперь сначала берёт artists.js, а при ошибке — старые пакеты');
  } else console.log('index.html: строка loadWave(2); не найдена один раз — загрузчик не менялся');
}
