# EnvFlow debug header (Chrome extension)

Same role as **sun-cli** `debug-header-extension`: a **Manifest V3** browser extension that adds an **X-Debug** header via `declarativeNetRequest` so you can target a named dev environment on shared dev hostnames.

This is **not** wired into `sun` / `bin/sun.js` (sun-cli does not register a CLI command for it either). Install it manually in Chrome or Arc.

## Installation

1. Open Chrome or Arc.
2. Go to `chrome://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Choose this folder: **`debug-header-extension`** (inside your EnvFlow clone).

## Configure hostnames

Edit **`manifest.json`** `host_permissions` for your domains. Edit **`background.js`** `condition.urlFilter` if your URL pattern is not `*.dev.*`.

## Usage

1. Click the extension icon.
2. Add environment names (e.g. `local`, `dev-123`).
3. **Activate** one; requests matching the rules get `X-Debug: <name>`.
