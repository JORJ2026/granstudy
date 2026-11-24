# Gran’s Study Time — launch build 1.1.0

Static site (no build step). Host the folder as-is on GitHub Pages / Netlify / any HTTPS static host.

## Before you publish
1. HTTPS is required for offline mode & install (GitHub Pages is fine).
2. Every release: bump `VERSION` in `sw.js` **and** `window.GST_VERSION` in `version.js` so users get the update prompt.
3. Optional: add a `sitemap.xml` and `<link rel="canonical">` once the final URL is known.
4. 404.html uses relative paths; on GitHub Pages it works at the site root.

## The 50 launch additions
**Install & offline (1–8)**
1 Web app manifest (+ home-screen shortcuts) · 2 Full icon set (any/maskable/Apple/favicon) · 3 Service worker with offline caching (incl. audio Range support for Safari) · 4 Offline/online banner · 5 “New version ready” update toast · 6 Install-app button (+ iOS how-to) · 7 Manual “Check for updates” · 8 Compressed Bandit audio: WAV → MP3, 12 MB → ~1.4 MB

**Search & sharing (9–14)**
9 Meta description · 10 Open Graph + Twitter cards · 11 Share image (1200×630) · 12 robots.txt · 13 Share button (native share / copy link) · 14 `.nojekyll` + referrer/color-scheme/format-detection meta

**Pages (15–19)**
15 Privacy page · 16 About page · 17 Help & Parents’ guide · 18 Friendly 404 page · 19 Footer navigation + `<noscript>` message

**Settings (20–30)**
20 Settings panel · 21 Global sound off (Math, Practice and Bandit) · 22 Theme: auto/light/dark (applied inside every app) · 23 Text size · 24 Reduce-motion override · 25 Player name + time-of-day greeting · 26 Daily goal · 27 Break reminders · 28 Keep-screen-awake · 29 First-run welcome tour · 30 Full-screen button

**Navigation & polish (31–38)**
31 Deep links (`#math`, `#words`, `#river`) · 32 Back-button support · 33 “Continue where you left off” · 34 Loading screen with timeout + retry · 35 Keyboard shortcuts + shortcut list · 36 Skip link & live-region toasts · 37 Per-app browser tab titles · 38 Portrait-phone rotate hint for Bandit

**Progress (39–43)**
39 Study-time tracking per app · 40 Day streak · 41 Daily-goal ring on home · 42 “My progress” dialog (7-day chart, best streak, Bandit score/trash) · 43 Goal-reached celebration (toast + quack)

**Your data (44–47)**
44 Download backup · 45 Restore backup (validated + confirmed) · 46 Erase everything (confirmed) · 47 Warning when browser blocks saved data

**Reliability (48–50)**
48 Pauses speech/music and time-tracking when the tab is hidden · 49 Error capture from all apps + “Copy diagnostics” panel · 50 Version stamp in footer/About + print stylesheet

## Notes
- All new state lives in `localStorage` keys starting `gst_`; the apps’ own keys are untouched.
- Bandit music loops may have a tiny gap at the loop point (MP3 encoder padding). If it bothers you, swap in `.ogg`/`.m4a`.
- Fonts still load from Google Fonts (described in Privacy). Self-hosting Roboto would remove that.

## 1.1.0 — music
Elk River Bandit now has 21 songs (the original + 20 new synthesized loops). A shuffled deck picks a new song every time a game starts, and no song repeats until all have played. Songs live in `apps/river-bandit/audio/` and are listed in `songList` in `apps/river-bandit/app.js`.
