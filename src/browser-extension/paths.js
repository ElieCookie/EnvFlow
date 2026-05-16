const path = require('path');

/**
 * Absolute path to the repo-root Chrome MV3 extension (load unpacked).
 * Not invoked by the CLI; for tooling or docs that need a stable path.
 */
function debugHeaderExtensionDir() {
  return path.join(__dirname, '..', '..', 'debug-header-extension');
}

module.exports = { debugHeaderExtensionDir };
