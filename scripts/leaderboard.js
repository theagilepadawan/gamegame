/* ==========================================================================
   Leaderboard. Stored on this device today; ready for a shared service.

   To go shared, define before this script runs:
     window.LONG_RUN_LEADERBOARD = { endpoint: "https://<host>/long-run/api" };
   and serve this contract (JSON over HTTPS):
     GET  {endpoint}/boards/{board}/entries?limit=10   -> { entries: Entry[] }   best first
     GET  {endpoint}/boards/{board}/rank?score=1234    -> { rank: number, total: number }
     POST {endpoint}/boards/{board}/entries   body: Entry   -> { rank: number, total: number, entry: Entry }
   Entry = { id, name, score, runner, world, won, seconds, at }   (at = ISO timestamp)
   Active board: "endless". Legacy Story records remain in storage only.
   If the service cannot be reached, the board quietly falls back to this device.
   ========================================================================== */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var CONFIG = window.LONG_RUN_LEADERBOARD || {};
  var KEY = "longrun.leaderboard.v1", NAME_KEY = "longrun.player", MAX = 100;
  var BOARDS = [
    { id: "endless", label: "Endless" }
  ];
  var resolve = function (id) { return BOARDS.some(function (b) { return b.id === id; }) ? id : "endless"; };
  var tabOf = resolve;
  var byScore = function (a, b) { return b.score - a.score || (a.at < b.at ? -1 : 1); };
  var clean = function (n) { return String(n || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 16); };

  /* ---- stores ---------------------------------------------------------- */
  var local = {
    read: function () { try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.v === 1 && d.boards) return d; } catch (e) {} return { v: 1, boards: {} }; },
    write: function (d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} },
    list: function (board, limit) { return Promise.resolve((local.read().boards[board] || []).slice().sort(byScore).slice(0, limit || 10)); },
    rank: function (board, score) { var a = local.read().boards[board] || []; return Promise.resolve({ rank: a.filter(function (e) { return e.score > score; }).length + 1, total: a.length }); },
    submit: function (board, entry) {
      var d = local.read(), a = (d.boards[board] || []).concat([entry]).sort(byScore);
      d.boards[board] = a.slice(0, MAX); local.write(d);
      return Promise.resolve({ rank: a.indexOf(entry) + 1, total: a.length, entry: entry });
    }
  };
  var remote = CONFIG.endpoint ? (function () {
    var base = String(CONFIG.endpoint).replace(/\/$/, "");
    var get = function (path) { return fetch(base + path, { credentials: "include" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
    return {
      list: function (board, limit) { return get("/boards/" + encodeURIComponent(board) + "/entries?limit=" + (limit || 10)).then(function (j) { return (j.entries || []).sort(byScore); }); },
      rank: function (board, score) { return get("/boards/" + encodeURIComponent(board) + "/rank?score=" + encodeURIComponent(score)); },
      submit: function (board, entry) {
        return fetch(base + "/boards/" + encodeURIComponent(board) + "/entries", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
      }
    };
  })() : null;
  var store = {
    shared: !!remote,
    list: function (b, l) { b = resolve(b); return remote ? remote.list(b, l).catch(function () { return local.list(b, l); }) : local.list(b, l); },
    rank: function (b, s) { b = resolve(b); return remote ? remote.rank(b, s).catch(function () { return local.rank(b, s); }) : local.rank(b, s); },
    submit: function (b, e) {
      b = resolve(b);
      var mine = local.submit(b, e); // always keep a copy on this device
      return remote ? remote.submit(b, e).catch(function () { return mine; }) : mine;
    }
  };

  /* ---- dialog ---------------------------------------------------------- */
  var dlg, list, tabs, note, current = "endless", highlight = null;
  function build() {
    dlg = document.createElement("dialog");
    dlg.id = "board-dialog"; dlg.className = "board-dialog"; dlg.setAttribute("aria-labelledby", "board-title");
    dlg.innerHTML =
      '<button type="button" class="close" aria-label="Close leaderboard">×</button>' +
      '<span class="eyebrow">LEADERBOARD</span>' +
      '<h2 id="board-title">The long <span>runners.</span></h2>' +
      '<div class="board-tabs" role="tablist" aria-label="Board"></div>' +
      '<ol class="board-list" aria-live="polite"></ol>' +
      '<p class="board-note"></p>' +
      '<button type="button" class="primary board-done">Back to the city <span aria-hidden="true">→</span></button>';
    $("#stage").appendChild(dlg);
    list = $(".board-list", dlg); tabs = $(".board-tabs", dlg); note = $(".board-note", dlg);
    BOARDS.forEach(function (b) {
      var t = document.createElement("button");
      t.type = "button"; t.setAttribute("role", "tab"); t.dataset.board = b.id; t.textContent = b.label;
      t.addEventListener("click", function () { show(b.id); });
      tabs.appendChild(t);
    });
    $(".close", dlg).addEventListener("click", function () { dlg.close(); });
    $(".board-done", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("close", function () { highlight = null; paintHi(); });
  }
  function fmtDate(iso) { try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch (e) { return ""; } }
  function row(e, i) {
    var li = document.createElement("li");
    li.className = "board-row" + (i < 3 ? " is-top is-top-" + (i + 1) : "") + (highlight && e.id === highlight ? " is-you" : "");
    li.style.setProperty("--i", i);
    var rank = document.createElement("span"); rank.className = "b-rank"; rank.textContent = String(i + 1).padStart(2, "0");
    var av = document.createElement("span"); av.className = "b-avatar"; av.dataset.who = e.runner === "trond" ? "trond" : "nicolai"; av.setAttribute("aria-hidden", "true");
    var who = document.createElement("span"); who.className = "b-who";
    var nm = document.createElement("span"); nm.className = "b-name"; nm.textContent = clean(e.name) || "Anonymous";
    var meta = document.createElement("small"); meta.className = "b-meta";
    meta.textContent = [e.runner === "trond" ? "Trond" : "Nicolai", e.won ? "finished" : null, fmtDate(e.at)].filter(Boolean).join(" · ");
    who.appendChild(nm); who.appendChild(meta);
    var sc = document.createElement("strong"); sc.className = "b-score"; sc.textContent = Number(e.score || 0).toLocaleString("en-GB");
    li.appendChild(rank); li.appendChild(av); li.appendChild(who); li.appendChild(sc);
    return li;
  }
  function show(tab) {
    tab = resolve(tab);
    current = tab;
    [].forEach.call(tabs.children, function (t) { var on = t.dataset.board === tab; t.classList.toggle("selected", on); t.setAttribute("aria-selected", String(on)); });
    var board = resolve(tab);
    list.classList.add("is-loading");
    store.list(board, 10).then(function (entries) {
      list.replaceChildren(); list.classList.remove("is-loading");
      if (!entries.length) {
        var li = document.createElement("li"); li.className = "board-empty";
        li.textContent = "No runs on this board yet. Set the first score.";
        list.appendChild(li);
      } else {
        entries.forEach(function (e, i) { list.appendChild(row(e, i)); });
        var you = $(".is-you", list);
        if (you) setTimeout(function () { you.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 380);
      }
      note.textContent = (store.shared ? "Shared across Norges Bank Investment Management." : "Saved on this device for now.") +
        (tab === "endless" ? " Top 10 across all worlds." : " Top 10 runs in this chapter.");
    });
  }
  function open(tab, hl) {
    if (window.LR_CH && !LR_CH.endlessUnlocked()) return;
    if (!dlg) build();
    highlight = hl || null;
    show(tab || current);
    if (!dlg.open) dlg.showModal();
  }

  /* ---- home: the HI-SCORE panel shows the top of the board and opens it - */
  function homeTab() {
    var m = $("[data-mode].selected"), d = $("[data-district].selected"), mode = m ? m.dataset.mode : "chapter";
    return mode === "chapter" ? resolve(d ? d.dataset.district : "opening") : "endless";
  }
  var hiTimer = 0;
  function paintHi() {
    clearTimeout(hiTimer);
    hiTimer = setTimeout(function () {
      var el = $("#home-hi"); if (!el) return;
      store.list(resolve(homeTab()), 1).then(function (top) {
        var who = $("#home-hi-name");
        if (top[0]) {
          $("strong", el).textContent = String(Math.min(top[0].score, 999999)).padStart(6, "0");
          el.classList.remove("is-empty");
          if (who) who.textContent = clean(top[0].name).toUpperCase();
        } else if (who) who.textContent = "VIEW BOARD";
      });
    }, 30);
  }

  /* ---- results: rank, name, post --------------------------------------- */
  var strip, posted = false, pending = null;
  function buildStrip() {
    var panel = $("#results .panel"), anchor = $(".result-actions", panel) || $("#restart");
    strip = document.createElement("div"); strip.id = "board-strip"; strip.className = "board-strip"; strip.hidden = true;
    strip.innerHTML =
      '<span class="bs-tag"></span>' +
      '<form class="bs-form" novalidate><input class="bs-name" maxlength="16" placeholder="Your name" autocomplete="nickname" enterkeyhint="send" aria-label="Your name for the leaderboard">' +
      '<button type="submit" class="bs-post">Post score</button></form>' +
      '<button type="button" class="secondary bs-view">View leaderboard</button>';
    panel.insertBefore(strip, anchor);
    $(".bs-form", strip).addEventListener("submit", function (ev) { ev.preventDefault(); post(); });
    $(".bs-view", strip).addEventListener("click", function () { open(pending ? tabOf(pending.board) : homeTab(), pending && pending.postedId); });
  }
  function boardFor(s) {
    if (!s) return null;
    if (s.mode === "chapter") return null;
    if (s.mode === "endless" && s.procedural) return "endless";
    return null;
  }
  function onResults(s) {
    var board = boardFor(s), score = s ? Math.floor(s.score || 0) : 0;
    posted = false; pending = board && score > 0 ? { board: board, score: score, snap: s } : null;
    if (!pending) { if (strip) strip.hidden = true; return; }
    if (!strip) buildStrip();
    var entry = pending;
    var input = $(".bs-name", strip), btn = $(".bs-post", strip), tag = $(".bs-tag", strip);
    try { input.value = localStorage.getItem(NAME_KEY) || ""; } catch (e) { input.value = ""; }
    input.disabled = btn.disabled = false; btn.textContent = "Post score";
    strip.classList.remove("is-posted", "is-entry");
    store.rank(board, score).then(function (r) {
      if (pending !== entry) return;
      var top = r.rank <= 10;
      strip.classList.toggle("is-entry", top);
      tag.textContent = (top ? "NEW ENTRY · #" : "BOARD · #") + r.rank;
      strip.hidden = false;
    });
  }
  function post() {
    if (!pending || posted) return;
    var input = $(".bs-name", strip), name = clean(input.value);
    if (!name) { input.focus(); input.classList.add("is-wanted"); setTimeout(function () { input.classList.remove("is-wanted"); }, 600); return; }
    try { localStorage.setItem(NAME_KEY, name); } catch (e) {}
    var s = pending.snap, entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: name, score: pending.score,
      runner: (window.longRun && window.longRun.character) || "nicolai", world: s.seedCode || "", won: !!s.won, seconds: Math.round(s.time || 0), at: new Date().toISOString()
    };
    posted = true; input.disabled = true; $(".bs-post", strip).disabled = true;
    store.submit(pending.board, entry).then(function (r) {
      pending.postedId = entry.id;
      strip.classList.add("is-posted");
      $(".bs-tag", strip).textContent = "POSTED · #" + r.rank;
      $(".bs-post", strip).textContent = "Posted";
      setTimeout(function () { open(tabOf(pending.board), entry.id); }, 350);
    });
  }

  window.LongRunBoard = { open: open, onResults: onResults, paintHi: paintHi, store: store, boards: BOARDS };

  function wire() {
    var hi = $("#home-hi");
    if (hi) hi.addEventListener("click", function () { open(homeTab()); });
    var intro = $("#intro");
    if (intro) new MutationObserver(paintHi).observe(intro, { subtree: true, attributes: true, attributeFilter: ["class"] });
    paintHi();
  }
  if (document.readyState !== "loading") wire(); else addEventListener("DOMContentLoaded", wire);
})();
