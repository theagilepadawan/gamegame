/* One title card per page / soundtrack change. Playback remains owned by the
   existing mixer: this widget never starts, pauses or duplicates an audio track. */
(function () {
  "use strict";
  // Display titles supplied by the user. Audio files and playback stay intact.
  const titles = {main: "Extended 16-Bit Bitcrushed", midtown: "Good Company Never Dies",
    park: "Diversified Ballad", contrarian: "Good ol’ Company"};
  let mixer, timer, revision = 0, shown = "", current = "";
  const card = document.createElement("div");
  card.id = "now-playing"; card.className = "now-playing"; card.hidden = true;
  card.setAttribute("role", "status"); card.setAttribute("aria-live", "polite");
  const note = document.createElement("span"), title = document.createElement("span");
  note.className = "music-note"; note.textContent = "♪"; note.setAttribute("aria-hidden", "true");
  title.id = "now-playing-title"; card.append(note, title);
  document.querySelector("main").appendChild(card);
  function hide() { clearTimeout(timer); card.hidden = true; }
  function update() {
    if (!mixer) return;
    const key = mixer.activeMusic || mixer.track.__lrKey || "main";
    const audio = mixer.activeMusic ? mixer.musicTracks[mixer.activeMusic] : mixer.track;
    if (!mixer.enabled || mixer.musicVolume <= 0 || !mixer.playing || !audio || audio.paused || audio.ended) { hide(); return; }
    // Return from the Contrarian track merits another title for the main track.
    if (key !== current) { current = key; revision++; }
    const token = revision + ":" + key;
    if (shown === token) return;
    shown = token; title.textContent = titles[key] || "The Long Run";
    card.hidden = false; clearTimeout(timer); timer = setTimeout(hide, 5000);
  }
  window.LR_MUSIC = {
    titles,
    page: function () { revision++; hide(); },
    attach: function (owner) {
      mixer = owner;
      for (const audio of [owner.track, ...Object.values(owner.musicTracks)]) {
        audio.addEventListener("playing", update);
        audio.addEventListener("pause", update);
        audio.addEventListener("ended", update);
      }
      // The WebAudio gain changes do not fire HTMLMediaElement volume events.
      // Observe the mixer once at its API, never in the animation loop.
      for (const method of ["play", "pause", "stop", "toggle", "volumes"]) {
        const original = owner[method];
        owner[method] = function (...args) { const value = original.apply(this, args); queueMicrotask(update); return value; };
      }
    }
  };
})();
