import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
let html=await fs.readFile(path.join(root,'index.html'),'utf8');
for(const match of [...html.matchAll(/<script\b[^>]*\bsrc="(scripts\/[^"]+)"[^>]*><\/script>/g)]){
 const source=await fs.readFile(path.join(root,match[1]),'utf8');
 html=html.replace(match[0],()=>`<script>${source.replace(/<\/script/gi,'<\\/script')}</script>`);
}
for(const match of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]){
 const source=await fs.readFile(path.join(root,match[1]),'utf8');
 html=html.replace(match[0],()=>`<style>${source}</style>`);
}
const original=JSON.parse(await fs.readFile(path.join(root,'assets-manifest.json'),'utf8'));
const mimeByPath=new Map(original.map(a=>[a.path,a.mime]));
const types={'.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.mp3':'audio/mpeg','.m4a':'audio/mp4','.wav':'audio/wav','.ogg':'audio/ogg'};
let embedded=0;
for(const file of await fs.readdir(path.join(root,'assets'),{recursive:true})){
 const relative='assets/'+file.replaceAll(path.sep,'/');
 if(!html.includes(relative))continue;
 const full=path.join(root,relative);if(!(await fs.stat(full)).isFile())continue;
 const mime=mimeByPath.get(relative)??types[path.extname(file).toLowerCase()];
 if(!mime)throw new Error(`Unknown embedded asset type: ${relative}`);
 const encoded=`data:${mime};base64,${(await fs.readFile(full)).toString('base64')}`;
 html=html.split(relative).join(encoded);embedded++;
}
const unresolved=[...html.matchAll(/(?:src|href)=["'](?:scripts|assets)\//g)];
if(unresolved.length)throw new Error('Unresolved source/asset URL in standalone');
await fs.mkdir(path.join(root,'release'),{recursive:true});
const output=process.argv[2]??path.join(root,'release/The-Long-Run-NBIM.html');
await fs.writeFile(output,html);
console.log(`${output}: ${Buffer.byteLength(html).toLocaleString()} bytes; ${embedded} embedded assets.`);
