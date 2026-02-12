# Talking Point

A small desktop overlay for meeting notes and bullet points. Paste talking points once, then keep the window on top while you present or record.

## Features

- **Transparent overlay** — Frameless, always-on-top window; position and resize as you like.
- **Edit mode** — Toggle with **Ctrl+E** to paste and edit bullet points and meeting notes; toggle back to view-only.
- **Persistent notes** — Notes are saved to disk and restored on next launch.
- **Global hotkeys** — Work even when the app is in the background.
- **Hidden from screen share (Windows)** — Uses the Windows API equivalent of InvisiWind (`SetWindowDisplayAffinity` / `WDA_EXCLUDEFROMCAPTURE`) via Electron `setContentProtection(true)`.
- **Hidden from screen share (macOS + Zoom)** — Best-effort: the app marks its window as “not shareable”; **Zoom must have “Advanced capture with window filtering” enabled** (see [Interview Coder’s Zoom note](https://www.interviewcoder.co/help?section=shows-when-sharing)). This is not guaranteed for every capture app on macOS.

## Hotkeys

| Shortcut | Action |
|----------|--------|
| **Ctrl+Q** | Quit the app |
| **Ctrl+B** | Show or hide the overlay |
| **Ctrl+Shift+D** | Toggle click-through (clicks pass through overlay to apps behind; use again to interact with overlay) |
| **Ctrl+E** | Toggle edit mode |
| **Ctrl+M** | Enlarge the window |
| **Ctrl+N** | Shrink the window |
| **Ctrl+Arrow** | Move the window |

In edit mode: **Esc** to save and switch back to view mode. To edit notes while click-through is on, press **Ctrl+Shift+D** first to turn it off.

## For users: download and install

1. **Download** the installer (e.g. `Talking Point Setup 1.0.0.exe`) from the release or your download link.
2. **Run** the .exe. Windows may show a SmartScreen prompt — choose “More info” then “Run anyway” if you trust the publisher.
3. **Follow the wizard**: pick an install location (or keep the default), then finish. The app is installed with a Start Menu shortcut and optional Desktop shortcut.
4. **Launch** Talking Point from the Start Menu or Desktop. Use **Ctrl+B** to show or hide the overlay.
5. **Uninstall** anytime via Settings → Apps → Talking Point → Uninstall (or Add or remove programs).

Windows invisibility requires **Windows 10 2004 or later** (64-bit).

## Build installers (developers)

### Windows

```bash
npm install
npm run dist
```

The installer is written to `dist/Talking Point Setup 1.0.0.exe` (version from `package.json`). That single file includes the app and everything needed; users only need to download and run it.

### macOS

Build the native addon + DMG/ZIP:

```bash
npm install
npm run native:mac
npm run dist:mac
```

**Why is the installer large?** Electron bundles Chromium and Node.js (~120–180 MB), so even a small app produces a ~150–200 MB installer. The build is configured to exclude docs, source maps, and markdown to trim a few MB. To get a much smaller app you’d need a different stack (e.g. Tauri).

## Tech

- **Electron** — Main process creates one transparent, frameless, always-on-top `BrowserWindow`.
- **Windows** — `win.setContentProtection(true)` so the overlay is excluded from screen capture.

## License

MIT
