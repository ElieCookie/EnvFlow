let debugHeaders = [];

if (typeof chrome !== "undefined") {
  chrome.storage.sync.get(["debugHeaders"], (result) => {
    if (result.debugHeaders) {
      debugHeaders = result.debugHeaders;
      updateRules();
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.debugHeaders) {
      debugHeaders = changes.debugHeaders.newValue || [];
      updateRules();
    }
  });
}

function updateRules() {
  const rules = buildDebugHeaderRules(debugHeaders);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1),
    addRules: rules,
  });
}

function buildDebugHeaderRules(headers) {
  return headers
    .filter((header) => header.enabled && header.name && header.value)
    .map((header, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          {
            header: "X-Debug",
            operation: "set", // set the header value
            value: header.value,
          },
        ],
      },
      condition: {
        urlFilter: "*.dev.*",
        resourceTypes: [
          "main_frame",
          "sub_frame",
          "stylesheet",
          "script",
          "image",
          "font",
          "object",
          "xmlhttprequest",
          "ping",
          "csp_report",
          "media",
          "websocket",
          "webtransport",
          "webbundle",
          "other",
        ],
      },
    }));
}

if (typeof module !== "undefined") {
  module.exports = { buildDebugHeaderRules };
}
