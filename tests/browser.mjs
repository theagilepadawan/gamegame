import {spawn} from 'node:child_process';
import {access} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env={...process.env};
const moduleName=env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
if(!env.CHROMIUM_PATH){
  try {await access('/usr/bin/chromium');env.CHROMIUM_PATH='/usr/bin/chromium';}
  catch {env.CHROMIUM_PATH=chromium.executablePath();}
}
function run(file){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[file],{cwd:root,env,stdio:'inherit'});
    child.once('error',reject);
    child.once('exit',code=>code===0?resolve():reject(new Error(`${file} exited ${code}`)));
  });
}
let server;
try{
  if(!env.TEST_URL){
    await run('build.mjs');
    server=spawn(process.execPath,['serve.mjs'],{cwd:root,env:{...env,PORT:'0'},stdio:['ignore','pipe','inherit']});
    env.TEST_URL=await new Promise((resolve,reject)=>{
      let output='';
      const timeout=setTimeout(()=>reject(new Error('Test server did not start')),10000);
      server.once('error',reject);
      server.once('exit',code=>reject(new Error(`Test server exited ${code}`)));
      server.stdout.on('data',chunk=>{
        output+=chunk.toString();
        const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);
        if(match){clearTimeout(timeout);resolve(match[0]+'/release/The-Long-Run-NBIM.html');}
      });
    });
  }
  console.log(`Testing ${env.TEST_URL}`);
  // Cohesive scenery replaces the older architectural-layer and exact-wet-
  // painting oracles. One suite covers both cities, venue attachment, full
  // routes, actual jumps/flight, renderer fallbacks and preserved Park pixels.
  // Visibility also checks that foreground slopes leave each venue readable.
  for(const test of ['modes','menu','cohesive-scenery','venue-visibility','responsive-framing','office-host','props','water','gaps','standalone']) await run(`tests/${test}.mjs`);
  console.log('All release browser checks passed.');
}finally{
  server?.kill('SIGTERM');
}
