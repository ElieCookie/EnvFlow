const path = require("path");
const manifest = require("../../debug-header-extension/manifest.json");
const {
  buildDebugHeaderRules,
} = require("../../debug-header-extension/background");
const {
  buildDebugHeadersForActiveEnvironment,
  escapeHtml,
} = require("../../debug-header-extension/popup");
const {
  debugHeaderExtensionDir,
} = require("../../src/browser-extension/paths");

class DebugHeaderExtensionDriver {
  setup() {}

  clearMocks() {
    jest.clearAllMocks();
  }

  buildRules(headers) {
    return buildDebugHeaderRules(headers);
  }

  buildDebugHeaders(environments, activeEnvironment) {
    return buildDebugHeadersForActiveEnvironment(
      environments,
      activeEnvironment,
    );
  }

  escapeHtml(text) {
    return escapeHtml(text);
  }

  getManifest() {
    return manifest;
  }

  getExtensionDir() {
    return debugHeaderExtensionDir();
  }

  expectedExtensionDir() {
    return path.join(__dirname, "..", "..", "debug-header-extension");
  }
}

module.exports = { DebugHeaderExtensionDriver };
