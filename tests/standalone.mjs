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
  const address=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/release/The-Long-Run-NBIM.html');
  address.searchParams.set('unlock','all');
  const url=address.href;
  const external=[],errors=[],failed=[];
  page.on('request',request=>{if(/^https?:/.test(request.url())&&request.url()!==url)external.push(request.url());});
  page.on('requestfailed',request=>failed.push(request.url()));
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url,{waitUntil:'networkidle',timeout:90000});
  await page.waitForFunction(()=>window.longRun&&window.LR_MENU&&window.LR_SCENERY?.ready&&window.LR_PROPS?.ready&&window.LR_OFFICE_HOST?.ready&&window.LR_VENUE_DETAILS?.ready&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'),{},{timeout:90000});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.fonts.check('18px "Norges Bank"')),true);
  assert.equal(await page.locator('script[src],link[rel="stylesheet"][href]').count(),0,'Release must embed scripts/styles');
  const scenery=await page.evaluate(()=>LR_SCENERY.images.map(image=>({embedded:image.src.startsWith('data:'),ready:image.complete&&image.naturalWidth>0})));
  assert.ok(scenery.every(image=>image.embedded&&image.ready),'Every referenced scenery layer is embedded and decoded');
  const mapArt=await page.evaluate(async()=>{
    const source=document.querySelector('.map-art image').getAttribute('href');
    const image=new Image();image.src=source;await image.decode();
    return {embedded:source.startsWith('data:image/svg+xml;'),width:image.naturalWidth,height:image.naturalHeight};
  });
  assert.ok(mapArt.embedded&&mapArt.width>0&&mapArt.height>0,'Illustrated Manhattan decodes from the embedded SVG');
  const artContract = await page.evaluate(() => ({
    park: NBIMParkScenery.images.length,
    opening: LR_SCENERY.inspect('opening',0,864,540,'chapter').sourceCount,
    midtown: LR_SCENERY.inspect('midtown',0,864,540,'chapter').sourceCount,
    details: LR_VENUE_DETAILS.inspect().map(item=>item.key),
    retired: !!(window.LR_CITY_VISTAS || window.LR_STREET_LIFE || window.LR_STREET_FOUNDATION),
    stone: [LR_SCENERY.foundationImage.naturalWidth,LR_SCENERY.foundationImage.naturalHeight]
  }));
  assert.deepEqual(artContract,{park:2,opening:5,midtown:4,
    details:['kabin','lei','joju','omars','gussy','fifth'],retired:false,stone:[1254,1254]},
    'Complete Downtown paintings and warm complete Midtown paintings with six current native frontage crops');
  const addedArt=await page.evaluate(()=>[...LR_VENUE_DETAILS.images,...LR_PROPS.images,...LR_OFFICE_HOST.images].map(image=>({embedded:image.src.startsWith('data:'),ready:image.complete&&image.naturalWidth>0})));
  assert.ok(addedArt.length>=13&&addedArt.every(image=>image.embedded&&image.ready),'Venue, prop and host artwork is decoded and embedded');
  // Continue through the real Contrarian event after loading with no network.
  await page.context().setOffline(true);
  for(const [runner,chapter] of [['trond','midtown'],['nicolai','opening']]){
    await page.locator(`[data-character="${runner}"]`).click();
    await page.evaluate(chapter=>LR_MENU.focusChapter(chapter),chapter);
    await page.waitForFunction(({runner,chapter})=>LR_MENU.state.runner===runner&&LR_MENU.state.selected===chapter&&!LR_MENU.state.moving,{runner,chapter});
    const avatar=await page.evaluate(async()=>{
      const background=getComputedStyle(document.querySelector('.map-player-figure')).backgroundImage;
      const source=background.slice(5,-2), image=new Image(); image.src=source; await image.decode();
      return {embedded:source.startsWith('data:'),width:image.naturalWidth,height:image.naturalHeight};
    });
    assert.deepEqual(avatar,{embedded:true,width:2688,height:420},`${runner}: complete native map strip works offline`);
  }
  await page.locator('#start').click();
  await page.waitForFunction(()=>longRun.state==='playing');
  await page.evaluate(()=>{q.invincible=1000;q.beginContrarian();});
  await page.waitForFunction(()=>longRun.snapshot.contrarian);
  await page.evaluate(()=>{q.endContrarian();});
  await page.waitForFunction(()=>!longRun.snapshot.contrarian);
  assert.deepEqual(errors,[]);
  assert.deepEqual(failed,[]);
  assert.deepEqual(external,[],'Standalone game fetched an external resource');
  console.log(`PASS: ${manifest.length} baseline assets unchanged; release fonts, scripts, native city art, map runners and audio load without external requests; course/character switching and Contrarian remain playable offline.`);
}finally{await browser.close();}
