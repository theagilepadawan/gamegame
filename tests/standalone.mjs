import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await fs.readFile(path.join(root,'assets-manifest.json'),'utf8'));
for(const asset of manifest){
  const bytes=await fs.readFile(path.join(root,asset.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,`${asset.path}: original asset changed`);
}
const moduleName=process.env.PLAYWRIGHT_MODULE||'playwright';
const {chromium}=await import(moduleName.startsWith('/')?pathToFileURL(moduleName).href:moduleName);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  const url=process.env.TEST_URL||'http://127.0.0.1:4181/release/The-Long-Run-NBIM.html';
  const external=[],errors=[],failed=[];
  page.on('request',request=>{if(/^https?:/.test(request.url())&&request.url()!==url)external.push(request.url());});
  page.on('requestfailed',request=>failed.push(request.url()));
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url,{waitUntil:'networkidle',timeout:90000});
  await page.waitForFunction(()=>window.longRun&&window.LR_SCENERY?.ready&&window.LR_PROPS?.ready&&window.LR_OFFICE_HOST?.ready&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'),{},{timeout:90000});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.fonts.check('18px "Norges Bank"')),true);
  assert.equal(await page.locator('script[src],link[rel="stylesheet"][href]').count(),0,'Release must embed scripts/styles');
  const scenery=await page.evaluate(()=>LR_SCENERY.images.map(image=>({embedded:image.src.startsWith('data:'),ready:image.complete&&image.naturalWidth>0})));
  const artContract = await page.evaluate(() => ({
    park: NBIMParkScenery.images.length,
    independentVenueImages: LR_SHOPS.images.length,
    opening: LR_SCENERY.inspect('opening', 0, 864, 540, 'chapter').sourceCount,
    midtown: LR_SCENERY.inspect('midtown', 0, 864, 540, 'chapter').sourceCount,
    venues: LR_SHOPS.inspect(0, 864, 540).items.map(item => ({key: item.key, mode: item.renderMode}))
  }));
  assert.deepEqual(artContract, {park: 2, independentVenueImages: 0, opening: 12, midtown: 16,
    venues: ['joju', 'omars', 'gussy', 'fifth'].map(key => ({key, mode: 'painted'}))},
  'Standalone embeds the extended native city streets, unchanged Park and all four integrated venue fronts');
  assert.ok(scenery.length >= 30, 'All 28 city plates and unchanged Park sources are present');
  assert.ok(scenery.every(image=>image.embedded&&image.ready),'Every referenced scenery layer is embedded and decoded');
  const nativeCity = await page.evaluate(() => [...LR_SCENERY.images.slice(0, 12), ...NBIMMidtownScenery.images.slice(0, 16)]
    .map(image => ({width: image.naturalWidth, height: image.naturalHeight})));
  assert.equal(nativeCity.length, 28);
  assert.ok(nativeCity.every(image => image.width === 1024 && image.height === 1536),
    'The downloadable HTML retains every native city plate without build-time downsampling');
  const addedArt=await page.evaluate(()=>[...(window.LR_SHOPS?.images||[]),...(window.LR_PROPS?.images||[]),...(window.LR_OFFICE_HOST?.images||[])].map(image=>({embedded:image.src.startsWith('data:'),ready:image.complete&&image.naturalWidth>0})));
  assert.ok(addedArt.length>=7&&addedArt.every(image=>image.embedded&&image.ready),'Prop and office-host artwork is decoded and embedded in the standalone');
  // Continue through the real Contrarian event after loading with no network.
  await page.context().setOffline(true);
  await page.locator('#start').click();
  await page.waitForFunction(()=>longRun.state==='playing');
  await page.evaluate(()=>{q.invincible=1000;q.beginContrarian();});
  await page.waitForFunction(()=>longRun.snapshot.contrarian);
  await page.evaluate(()=>{q.endContrarian();});
  await page.waitForFunction(()=>!longRun.snapshot.contrarian);
  assert.deepEqual(errors,[]);
  assert.deepEqual(failed,[]);
  assert.deepEqual(external,[],'Standalone game fetched an external resource');
  console.log(`PASS: ${manifest.length} baseline assets unchanged; release fonts, scripts, art and audio load without external requests; Contrarian remains playable offline.`);
}finally{await browser.close();}
