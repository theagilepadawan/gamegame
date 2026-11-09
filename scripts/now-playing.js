/* One title card per page / soundtrack change.
   The existing mixer owns playback and first-interaction recovery. */
(function () {
  "use strict";
  // Display titles supplied by the user. Audio files and playback stay intact.
  const titles = {title: "Why talking to people is a superpower x Mellow Lounge",
    main: "Downtown Good Company", midtown: "Good Company Never Dies",
    park: "Diversified Ballad", contrarian: "Good ol’ Company", gift: "A change of pace"};
  let mixer, timer, revision = 0, shown = "", current = "";
  const card = document.createElement("div");
  card.id = "now-playing"; card.className = "now-playing"; card.hidden = true;
  card.setAttribute("role", "status"); card.setAttribute("aria-live", "polite");
  const record = document.createElement("span"), copy = document.createElement("span");
  const label = document.createElement("span"), title = document.createElement("span");
  record.className = "music-record"; record.setAttribute("aria-hidden", "true");
  // A tiny custom sleeve and grooved record, drawn as vectors for phone DPRs.
  record.innerHTML = '<svg viewBox="0 0 56 56" focusable="false"><defs><linearGradient id="record-sleeve" x2="1" y2="1"><stop stop-color="#f7dcb9"/><stop offset="1" stop-color="#c89567"/></linearGradient><linearGradient id="record-vinyl" x2="1" y2="1"><stop stop-color="#29495c"/><stop offset=".55" stop-color="#071b30"/><stop offset="1" stop-color="#3c5666"/></linearGradient></defs><rect x="3" y="7" width="36" height="43" rx="3" fill="#001538"/><rect x="2" y="5" width="35" height="43" rx="3" fill="url(#record-sleeve)"/><path d="M6 37 13 31 19 34 28 22M6 40h25" fill="none" stroke="#163b4c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 11h23M7 15h14" stroke="#875d44" stroke-width="1.3"/><g class="record-disc"><circle cx="34" cy="29" r="20" fill="url(#record-vinyl)" stroke="#789698" stroke-width=".6"/><g fill="none" stroke="#779694" stroke-opacity=".28" stroke-width=".6"><circle cx="34" cy="29" r="17"/><circle cx="34" cy="29" r="14.5"/><circle cx="34" cy="29" r="12"/></g><path d="M21 17a18 18 0 0 1 14-6M46 41a17 17 0 0 1-12 5" fill="none" stroke="#c3e9ee" stroke-opacity=".24" stroke-width="2"/><circle cx="34" cy="29" r="8" fill="#4ec2e2"/><path d="m30 31 3-5 4 6" fill="none" stroke="#153951" stroke-width="1.5"/><circle cx="34" cy="29" r="1.3" fill="#001538"/></g></svg>';
  copy.className = "music-copy"; label.className = "music-label";
  label.textContent = "Now playing"; title.id = "now-playing-title";
  copy.append(label, title); card.append(record, copy);
  document.querySelector("main").appendChild(card);
  function hide() { clearTimeout(timer); card.hidden = true; }
  function update() {
    if (!mixer) return;
    const key = mixer.activeMusic || mixer.track.__lrKey || "main";
    if (!mixer.musicAudible) { hide(); return; }
    // Return from the Contrarian track merits another title for the main track.
    if (key !== current) { current = key; revision++; }
    const token = revision + ":" + key;
    if (shown === token) return;
    shown = token; title.textContent = titles[key] || "The Long Run";
    card.dataset.track = key;
    // Restart the entrance/dwell animation even when two audible tracks switch.
    card.getAnimations({subtree: true}).forEach(animation => { animation.currentTime = 0; });
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
      for (const method of ["play", "pause", "stop", "toggle", "volumes", "home"]) {
        const original = owner[method];
        owner[method] = function (...args) { const value = original.apply(this, args); queueMicrotask(update); return value; };
      }
    }
  };
  window.addEventListener("lr:audio-state", update);
  window.addEventListener("lr:splash-ended", update);
})();
