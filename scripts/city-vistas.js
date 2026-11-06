/* Restore the approved v1.6 Midtown opening vista without changing the native
   venue streets later in the route. Every source retains its original pixels. */
(function () {
  "use strict";
  var paths = {
    atmosphere: "assets/city-vistas-v20/dry-city-atmosphere.webp",
    landmarks: "assets/city-vistas-v20/landmark-panorama.webp",
    glass: "assets/city-vistas-v20/glass-canyon.webp",
    library: "assets/city-vistas-v20/library-frontage.webp",
    tree: "assets/city-vistas-v20/city-plane-tree.webp"
  };
  var images = {}, allImages = [], atmosphere = null;
  Object.keys(paths).forEach(function (key) {
    var image = new Image(); image.decoding = "async"; image.src = paths[key];
    images[key] = image; allImages.push(image);
  });
  function loaded(image) { return !!(image && image.complete && image.naturalWidth); }
  function atmosphereSource() {
    if (atmosphere || !loaded(images.atmosphere)) return atmosphere;
    // Copy the approved painting 1:1, then continue only its dry asphalt into
    // the lower coverage pad. Native skyline/sidewalk pixels remain exact.
    var original = images.atmosphere, canvas = document.createElement("canvas");
    canvas.width = original.naturalWidth; canvas.height = original.naturalHeight + 192;
    var ctx = canvas.getContext("2d"); ctx.drawImage(original, 0, 0);
    ctx.save(); ctx.translate(0, original.naturalHeight * 2); ctx.scale(1, -1);
    ctx.drawImage(original, 0, original.naturalHeight - 192, original.naturalWidth, 192,
      0, original.naturalHeight - 192, original.naturalWidth, 192); ctx.restore();
    atmosphere = canvas; return canvas;
  }
  function wrap(base) {
    if (!base || base.cityVistas) return base;
    function layout(id, distance, W, H, mode) {
      var scene = base.layout(id, distance, W, H, mode);
      if (id !== "midtown") return scene;
      var scale = scene.artScale, scroll = scene.scroll, y = scene.worldTransform.y;
      var firstRetained = scene.blocks.find(function (block) { return block.sourceIndex === 4; });
      var boundary = firstRetained ? firstRetained.worldX : 3840 * scale;
      // The complete current street beginning with the cast-iron block stays
      // intact, including its join into Joju and every later venue entrance.
      var retained = scene.panels.filter(function (panel) {
        return panel.kind === "join" ? panel.sourceIndex >= 3 : panel.sourceIndex >= 4;
      });
      var layers = [];
      function add(key, x, top, width, height, extra) {
        if (x + width <= 0 || x >= W) return;
        var original = images[key], nativeWidth = original.naturalWidth, paintedHeight = original.naturalHeight;
        var nativeHeight = paintedHeight + (key === "atmosphere" ? 192 : 0);
        layers.push(Object.assign({id:"midtown:v16:" + key,kind:"city-vista",vistaSource:key,
          sourceIndex:-10,sourceFilename:paths[key].split("/").pop(),original:false,mirrored:false,
          x:x,y:top,width:width,height:height,sourceWidth:nativeWidth,sourceHeight:nativeHeight,
          nativeWidth:nativeWidth,nativeHeight:nativeHeight,paintedHeight:paintedHeight,sourceOffsetY:0},extra || {}));
      }
      if (scroll < boundary + 120 * scale) {
        var curb = y + 1304 * scale;
        // The dry atmosphere is intentionally broad and calm. Its painted
        // curb shares the same registration as every near architectural base.
        add("atmosphere", -Math.min(scroll * .025, W * .18), y,
          W * 1.18, 1304 * scale * 1216 / 823, {depthRate:.025,viewportAtmosphere:true});
        var landmarkWidth = 2280 * scale, landmarkScale = landmarkWidth / 1536;
        add("landmarks", 800 * scale - scroll * .82, curb - 891 * landmarkScale,
          landmarkWidth, 1024 * landmarkScale, {uniqueLandmarks:true,depthRate:.82,worldX:800*scale});
        add("glass", -scroll, y + 27 * scale, 1024 * scale, 1536 * scale);
        add("library", 2760 * scale - scroll, y + 157 * scale, 1024 * scale, 1536 * scale);
      }
      layers = layers.concat(retained);
      if (scroll < boundary + 220 * scale) {
        // A real street tree masks the one transition into the retained city;
        // no venue, façade, or sign is alpha-blended into another building.
        var treeHeight = 1450 * scale, treeWidth = treeHeight * 2 / 3;
        var treeX = boundary - 256 * scale - scroll;
        if (treeX + treeWidth / 2 > 0 && treeX - treeWidth / 2 < W) {
          layers.push({id:"midtown:v16:transition-tree",kind:"city-vista",vistaSource:"tree",sourceIndex:-10,
            sourceFilename:"city-plane-tree.webp",sourceWidth:1024,sourceHeight:1536,nativeWidth:1024,nativeHeight:1536,paintedHeight:1536,sourceOffsetY:0,
            original:false,mirrored:false,x:treeX-treeWidth/2,y:y+1304*scale-treeHeight*1450/1536,
            width:treeWidth,height:treeHeight});
        }
      }
      return Object.assign({},scene,{panels:layers,layers:layers,cityVistas:true,
        vistaReference:"v1.6.0 / a551054",vistaBoundary:boundary,retainedVenueSources:[5,8,11,14]});
    }
    function source(id,panel,original) {
      if (panel.kind !== "city-vista") return base.source(id,panel,original);
      if (panel.vistaSource === "atmosphere") return atmosphereSource();
      return loaded(images[panel.vistaSource]) ? images[panel.vistaSource] : null;
    }
    return {
      cityVistas:true,images:base.images.concat(allImages),layout:layout,source:source,
      get ready(){return base.ready && allImages.every(loaded);},
      release:function(){if(base.release)base.release();},
      draw2d:function(ctx,id,original,distance,W,H,mode){
        layout(id,distance,W,H,mode).panels.forEach(function(panel){var image=source(id,panel,original);if(image)ctx.drawImage(image,panel.x,panel.y,panel.width,panel.height);});return true;
      },
      inspect:function(id,distance,W,H,mode){return Object.assign({},base.inspect(id,distance,W,H,mode),layout(id,distance,W,H,mode));}
    };
  }
  window.LR_CITY_VISTAS = {wrap:wrap,images:allImages,sourceImage:function(key){return images[key];},get ready(){return allImages.every(loaded);}};
})();
