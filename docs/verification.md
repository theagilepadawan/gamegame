# Release verification — 2 November 2026

`npm test` passed against the self-contained release HTML using Playwright 1.56.1 and Chromium 154.0.8037.57.

- Story/Endless menus and four leaderboard categories; no Daily or separate Contrarian entry.
- Stable Story terrain and isolation from the saved Endless seed.
- Retry, chapter unlocks, Trond unlock, fund-history reveal, and Next chapter defaults through keyboard and gamepad input.
- Fresh-profile chapter locks, keyboard navigation, touch swiping and layouts down to 568×320.
- 1,452 scenery camera/mode/viewport cases, covering finite Story routes and the Endless continuation without returning to the original landmark painting.
- Actual Pixi, direct WebGL and forced Canvas scene captures on desktop and mobile viewport sizes, with no JavaScript or failed asset requests.
- Visual review of all district joins and full-motion Central Park leaves/lake effects.
- All 40 original asset hashes unchanged; standalone fonts and assets load without external requests; Contrarian starts and ends offline.
- ZIP CRC validation and byte-for-byte comparison of its HTML with the tested release.

Tested HTML SHA-256:

```
5075f78b06b3e0e68b9dddae50e87ca94a44b4e22053ffd486f8cf1b7e46adc4
```

The reusable checks are in `tests/`; checksums for the HTML and playable ZIP are in `release/SHA256SUMS.txt`. Browser tests emulate mobile viewports and controller input; these results are Chromium checks, not a claim of physical-device or cross-browser certification.
