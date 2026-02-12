# Talking Point

**Windows only.** A small desktop overlay for meeting notes and bullet points. Paste talking points once, then keep the window on top while you present or record. The overlay is excluded from **entire-screen** sharing (Zoom, Meet, Teams, OBS) so viewers don’t see it.

## Features

- **Transparent overlay** — Frameless, always-on-top window; position and resize as you like.
- **Edit mode** — Toggle with **Ctrl+E** to paste and edit bullet points and meeting notes; toggle back to view-only.
- **Persistent notes** — Notes are saved to disk and restored on next launch.
- **Global hotkeys** — Work even when the app is in the background.
- **Hidden from screen share** — Uses the same Windows API as InvisiWind (`SetWindowDisplayAffinity` / `WDA_EXCLUDEFROMCAPTURE`). When you share your entire screen, the overlay is excluded from the capture. Requires Windows 10 2004 or later.

## Hotkeys

| Shortcut | Action |
|----------|--------|
| **Ctrl+B** | Show or hide the overlay |
| **Ctrl+E** | Toggle edit mode |
| **Ctrl+M** | Enlarge the window |
| **Ctrl+N** | Shrink the window |
| **Ctrl+Arrow** | Move the window |

In edit mode: **Esc** to save and switch back to view mode.

## Run from source

Requires **Windows 10 2004 or later.**

```bash
npm install
npm start
```

Always use `npm start` (or `npx electron .`). Do not run the main script with `node`.

## Build installers

```bash
npm run dist
```

Outputs NSIS installer and portable build in `dist/`.

## Tech

- **Electron** — Main process creates one transparent, frameless, always-on-top `BrowserWindow`.
- **Windows** — `win.setContentProtection(true)` so the overlay is excluded from screen capture.

## License

MIT
