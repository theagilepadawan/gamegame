/* Current native storefront details registered inside their street façades.
   Prepared once per source crop; no independent camera, street or façade. */
(function () {
  "use strict";
  const definitions = [
    {id:"opening", panel:3, key:"kabin", rect:[558,610,228,114], path:"assets/venue-details-v111/kabin.webp"},
    {id:"opening", panel:4, key:"lei", rect:[440,622,168,108], path:"assets/venue-details-v111/lei.webp"},
    {id:"midtown", panel:1, key:"joju", rect:[454,596,203,126], path:"assets/venue-details-v111/joju.webp"},
    {id:"midtown", panel:1, key:"omars", rect:[1327,610,210,106], path:"assets/venue-details-v111/omars.webp"},
    {id:"midtown", panel:2, key:"gussy", rect:[1075,607,232,115], path:"assets/venue-details-v111/gussy.webp"},
    {id:"midtown", panel:3, key:"fifth", rect:[430,556,184,140], path:"assets/venue-details-v111/fifth.webp"}
  ];
  definitions.forEach(entry => { entry.image = new Image(); entry.image.src = entry.path; });
  const find = (id, panel) => definitions.find(entry => entry.id === id && entry.panel === panel);
  window.LR_VENUE_DETAILS = {
    images: definitions.map(entry => entry.image),
    get ready() { return definitions.every(entry => entry.image.complete && entry.image.naturalWidth); },
    needed: (id, panel) => !!find(id, panel),
    entries: id => definitions.filter(entry => entry.id === id),
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
