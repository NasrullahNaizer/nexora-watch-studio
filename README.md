# NEXORA — Smartwatch Face Studio
Created by Nasrullah. A browser-based watch-face designer and PNG exporter for the Haylou Watch 2 Pro. Vanilla HTML/CSS/JS, no dependencies, no backend.

## Status
Written but **not yet tested in a browser or on a watch**. Open it, click through every control, and report problems.

| Feature | State |
|---|---|
| Live digital/analog preview, colours, layout | Implemented |
| Photo upload, fit/zoom/move | Implemented |
| Save / load / rename / delete (localStorage) | Implemented |
| PNG export (720×840) | Implemented |
| Bluetooth connect (shows device name only) | Implemented, needs real-device check |
| Sending a face to the watch | **Not implemented** |

Battery, steps and heart rate are simulated. The 720×840 export size is an assumed aspect ratio, not a verified screen spec.

## Why there is no watch upload
The Watch 2 Pro's BLE services, transfer protocol and face format are not publicly documented. Nothing was invented. To add upload, capture and document the official app's transfer first (for example Android HCI snoop logs), then implement it, likely in an Android companion app, since Web Bluetooth is unavailable on iOS and Firefox.

## Deploy on GitHub Pages
1. Put `index.html`, `styles.css`, `app.js`, `README.md` in the repo root on `main`.
2. Repo **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
3. Open `https://nasrullahnaizer.github.io/nexora-watch-studio/`. Bluetooth requires HTTPS, which Pages provides.

Saved designs live in this browser's local storage only and do not sync across devices.
