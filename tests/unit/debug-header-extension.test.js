const {
  DebugHeaderExtensionDriver,
} = require("../drivers/debug-header-extension.driver");

describe("debug header extension", () => {
  const driver = new DebugHeaderExtensionDriver();

  beforeEach(() => {
    driver.setup();
  });

  afterEach(() => {
    driver.clearMocks();
  });

  test("builds declarative net request rules for enabled headers", () => {
    expect(
      driver.buildRules([
        { name: "X-Debug", value: "dev-a", enabled: true },
        { name: "X-Debug", value: "dev-b", enabled: false },
      ]),
    ).toEqual([
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "X-Debug",
              operation: "set",
              value: "dev-a",
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
      },
    ]);
  });

  test("ignores incomplete debug headers when building rules", () => {
    expect(
      driver.buildRules([
        { name: "X-Debug", value: "", enabled: true },
        { name: "", value: "dev-a", enabled: true },
        { name: "X-Debug", value: "dev-b", enabled: false },
      ]),
    ).toEqual([]);
  });

  test("builds one active debug header from popup environments", () => {
    expect(
      driver.buildDebugHeaders(
        [
          { id: 1, name: "dev-a" },
          { id: 2, name: "dev-b" },
        ],
        2,
      ),
    ).toEqual([
      {
        name: "X-Debug",
        value: "dev-b",
        enabled: true,
      },
    ]);
  });

  test("builds no debug headers when no popup environment is active", () => {
    expect(
      driver.buildDebugHeaders(
        [
          { id: 1, name: "dev-a" },
          { id: 2, name: "dev-b" },
        ],
        null,
      ),
    ).toEqual([]);
  });

  test("escapes environment names before rendering popup HTML", () => {
    expect(driver.escapeHtml(`dev<&>"'`)).toBe(
      "dev&lt;&amp;&gt;&quot;&#039;",
    );
  });

  test("declares a Manifest V3 extension with required permissions", () => {
    expect(driver.getManifest()).toEqual({
      manifest_version: 3,
      name: "EnvFlow Local Environment",
      version: "1.1.0",
      description:
        "Switch local dev environments by injecting the X-Debug header on selected domains",
      permissions: ["declarativeNetRequest", "storage", "activeTab"],
      host_permissions: ["*://*.dev.clientDomain.com/*"],
      background: {
        service_worker: "background.js",
      },
      action: {
        default_popup: "popup.html",
      },
    });
  });

  test("resolves the unpacked extension directory", () => {
    expect(driver.getExtensionDir()).toBe(driver.expectedExtensionDir());
  });
});
