/* Nicolai's Central Park runners: the same run and somersault sheets with his loafers repainted as navy
   knit running shoes with a white midsole and a white collar (shoes/paint.py). Worn only in the final
   chapter, and on the home screen when Central Park is picked. */
(function () {
  "use strict";
  var atlas = new Image(), flip = new Image(), n = 0;
  var ready = function () { if (++n === 2 && window.LR_SHOES_APPLY) window.LR_SHOES_APPLY(); };
  atlas.onload = ready; flip.onload = ready;
  atlas.src = "assets/original-17.webp"; flip.src = "assets/original-18.webp";
  window.LR_SHOES = {
    atlas: atlas, flip: flip,
    ok: function () { return atlas.complete && atlas.naturalWidth > 0 && flip.complete && flip.naturalWidth > 0; }
  };
})();
