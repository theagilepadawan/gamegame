/* Current native storefront details registered inside their street façades.
   Prepared once per source crop; no independent camera, street or façade. */
(function () {
  "use strict";
  const definitions = [
    {id:"opening", panel:3, key:"kabin", rect:[558,610,228,114], path:"assets/venue-details-v111/kabin.webp"},
    {id:"opening", panel:4, key:"lei", rect:[440,622,168,108], path:"assets/venue-details-v111/lei.webp"},
    {id:"midtown", panel:0, key:"joju", rect:[232,876,566,335], path:"assets/venue-details-v111/joju.webp"},
    {id:"midtown", panel:2, key:"omars", rect:[239,933,553,278], path:"assets/venue-details-v111/omars.webp"},
    {id:"midtown", panel:3, key:"gussy", rect:[208,847,691,335], path:"assets/venue-details-v111/gussy.webp"},
    {id:"midtown", panel:5, key:"fifth", rect:[256,870,512,386], path:"assets/venue-details-v111/fifth.webp"}
  ];
  definitions.forEach(entry => { entry.image = new Image(); entry.image.src = entry.path; });
  const find = (id, panel) => definitions.find(entry => entry.id === id && entry.panel === panel);
  window.LR_VENUE_DETAILS = {
    images: definitions.map(entry => entry.image),
    get ready() { return definitions.every(entry => entry.image.complete && entry.image.naturalWidth); },
    needed: (id, panel) => !!find(id, panel),
    paint(ctx, id, panel, cropTop) {
      const entry = find(id, panel); if (!entry) return;
      const [x,y,w,h] = entry.rect;
      ctx.save();
      if (id === "opening") ctx.filter = "brightness(.88) saturate(.9)";
      ctx.drawImage(entry.image, x, y - cropTop, w, h);
      ctx.restore();
    },
    inspect: () => definitions.map(({id,panel,key,rect,image}) => ({id,panel,key,rect:rect.slice(),nativeWidth:image.naturalWidth,nativeHeight:image.naturalHeight}))
  };
})();
