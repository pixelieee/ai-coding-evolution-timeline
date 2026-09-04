import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import postcss from "postcss";
import { createThemeStore, THEME_STORAGE_KEY, normalizeTheme } from "../src/theme.js";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const css = read("../src/theme.css");
const app = read("../src/App.jsx");
const html = read("../index.html");

function harness({ saved = null, dark = false, blocked = false } = {}) {
  const systemListeners = new Set();
  const storageListeners = new Set();
  let stored = saved;
  const media = {
    matches: dark,
    addEventListener: (type, fn) => systemListeners.add(fn),
    removeEventListener: (type, fn) => systemListeners.delete(fn),
  };
  const browser = {
    matchMedia: () => media,
    localStorage: {
      getItem(key) { assert.equal(key, THEME_STORAGE_KEY); if (blocked) throw Error("blocked"); return stored; },
      setItem(key, value) { assert.equal(key, THEME_STORAGE_KEY); if (blocked) throw Error("blocked"); stored = value; },
    },
    addEventListener: (type, fn) => storageListeners.add(fn),
    removeEventListener: (type, fn) => storageListeners.delete(fn),
  };
  const meta = { content: null, setAttribute(key, value) { this[key] = value; } };
  const page = { documentElement: { dataset: {}, style: {} }, querySelector: () => meta };
  return {
    browser, page, media, meta, systemListeners, storageListeners,
    get saved() { return stored; },
    system(dark) { media.matches = dark; systemListeners.forEach((fn) => fn()); },
    storage(value, key = THEME_STORAGE_KEY) { storageListeners.forEach((fn) => fn({ key, newValue: value })); },
  };
}

test("themes follow the system initially and a valid saved preference takes priority", () => {
  for (const dark of [false, true]) {
    for (const saved of [null, "invalid", "light", "dark"]) {
      const h = harness({ dark, saved });
      const store = createThemeStore(h.browser, h.page);
      const expected = normalizeTheme(saved) || (dark ? "dark" : "light");
      assert.equal(store.getSnapshot(), expected);
      assert.equal(h.page.documentElement.dataset.theme, expected);
      assert.equal(h.page.documentElement.style.colorScheme, expected);
      assert.equal(h.meta.content, expected === "dark" ? "#141516" : "#f5f5f2");
    }
  }
});

test("toggle persists an explicit preference and ignores subsequent OS changes", () => {
  const h = harness();
  const store = createThemeStore(h.browser, h.page);
  let notified = 0;
  const unsubscribe = store.subscribe(() => notified++);
  h.system(true);
  assert.equal(store.getSnapshot(), "dark");
  store.toggle();
  assert.equal(store.getSnapshot(), "light");
  assert.equal(h.saved, "light");
  h.system(false);
  h.system(true);
  assert.equal(store.getSnapshot(), "light");
  assert.equal(notified, 2);
  store.toggle();
  assert.equal(h.saved, "dark");
  assert.equal(createThemeStore(h.browser, h.page).getSnapshot(), "dark", "reload restores the saved choice");
  unsubscribe();
});

test("cross-tab changes synchronize and cleared preferences resume system following", () => {
  const h = harness({ saved: "dark" });
  const store = createThemeStore(h.browser, h.page);
  const unsubscribe = store.subscribe(() => {});
  h.storage("light");
  assert.equal(store.getSnapshot(), "light");
  h.storage("dark", "some-other-preference");
  assert.equal(store.getSnapshot(), "light");
  h.storage(null, null);
  h.system(true);
  assert.equal(store.getSnapshot(), "dark");
  unsubscribe();
});

test("blocked storage still allows toggling and missing media queries default to light", () => {
  const h = harness({ blocked: true, dark: true });
  const store = createThemeStore(h.browser, h.page);
  store.toggle();
  assert.equal(store.getSnapshot(), "light");
  const other = harness();
  delete other.browser.matchMedia;
  const fallback = createThemeStore(other.browser, other.page);
  assert.equal(fallback.getSnapshot(), "light");
  const unsubscribe = fallback.subscribe(() => {});
  fallback.toggle();
  assert.equal(fallback.getSnapshot(), "dark");
  unsubscribe();
});

test("theme subscriptions clean up and survive StrictMode resubscription", () => {
  const h = harness();
  const store = createThemeStore(h.browser, h.page);
  const first = store.subscribe(() => {});
  const second = store.subscribe(() => {});
  assert.equal(h.systemListeners.size, 1);
  assert.equal(h.storageListeners.size, 1);
  first();
  assert.equal(h.systemListeners.size, 1);
  second();
  assert.equal(h.systemListeners.size, 0);
  assert.equal(h.storageListeners.size, 0);
  h.media.matches = true;
  const third = store.subscribe(() => {});
  assert.equal(store.getSnapshot(), "dark");
  third();
  assert.equal(h.systemListeners.size, 0);
});

test("before-paint theme bootstrap matches the store, including blocked storage", () => {
  const script = html.match(/<script>([\s\S]+?)<\/script>/)?.[1];
  assert.ok(script);
  assert.ok(html.indexOf(script) < html.indexOf('<div id="root">'));
  for (const blocked of [false, true]) for (const dark of [false, true]) for (const saved of [null, "invalid", "light", "dark"]) {
    const h = harness({ blocked, dark, saved });
    runInNewContext(script, { window: h.browser, document: h.page, localStorage: h.browser.localStorage });
    const initial = h.page.documentElement.dataset.theme;
    assert.equal(initial, createThemeStore(h.browser, h.page).getSnapshot());
  }
});

test("header theme switch is keyboard accessible and does not remount either view", () => {
  assert.match(app, /useSyncExternalStore\(themeStore.subscribe, themeStore.getSnapshot/);
  assert.match(app, /<button type="button" className="theme-toggle" role="switch" aria-checked=\{theme === "dark"\} aria-label="深色主题"/);
  assert.match(app, /onClick=\{themeStore.toggle\}/);
  assert.doesNotMatch(app, /key=\{theme\}/);
  const headerStart = app.indexOf('<header className="site-header">');
  const headerEnd = app.indexOf("</header>", headerStart);
  assert.ok(app.indexOf('className="theme-toggle"') > headerStart);
  assert.ok(app.indexOf('className="theme-toggle"') < headerEnd);
  assert.match(read("../src/main.jsx"), /import "\.\/styles.css";\s*import "\.\/theme.css";/);
});

const parsed = postcss.parse(css);
const darkTokens = {};
parsed.walkRules((rule) => {
  if (rule.selector !== ':root[data-theme="dark"]') return;
  rule.walkDecls((decl) => { darkTokens[decl.prop] = decl.value; });
});
const luminance = (hex) => {
  const values = hex.slice(1).match(/../g).map((channel) => parseInt(channel, 16) / 255)
    .map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
};
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);

test("dark title, body, metadata and accent tokens meet 4.5:1 on every surface", () => {
  for (const foreground of ["--ink", "--theme-secondary", "--theme-muted", "--amber", "--products-color", "--models-color", "--tech-color"]) {
    for (const background of ["--theme-page", "--theme-card", "--theme-panel", "--theme-strip", "--theme-hover"]) {
      const ratio = contrast(darkTokens[foreground], darkTokens[background]);
      assert.ok(ratio >= 4.5, `${foreground} on ${background}: ${ratio.toFixed(2)}:1`);
    }
  }
  assert.ok(luminance(darkTokens["--theme-page"]) < luminance(darkTokens["--theme-card"]));
  assert.ok(luminance(darkTokens["--theme-card"]) < luminance(darkTokens["--theme-panel"]));
});

test("dark mode covers both workspaces and every floating surface without changing geometry", () => {
  const selectors = [];
  parsed.walkRules((rule) => {
    if (!rule.selector.startsWith(':root[data-theme="dark"]')) return;
    selectors.push(rule.selector);
    rule.walkDecls((decl) => assert.doesNotMatch(decl.prop, /^(?:font-size|width|height|display|position|transform|padding|margin|overflow)/));
  });
  for (const selector of [".library-node-card", ".milestone-card", ".lane-fields", ".stage-labels", ".archive-calendar", ".calendar-cell.selected", ".global-milestone-tooltip", ".detail-drawer", ".month-lens", ".timeline-navigator", ".canvas-tools", ".view-tabs"]) {
    assert.ok(selectors.some((rule) => rule.includes(selector)), selector);
  }
});

test("dark selected cards retain amber edges and white text, while logos keep their own ink", () => {
  assert.match(css, /:is\(\.library-node-card\.selected,\.milestone-node\.selected \.milestone-card\) \{ color: #fff; background: #111;[^}]*var\(--amber\)/);
  assert.match(css, /\.milestone-node\.selected \.milestone-date\) \{ color: #fff;/);
  assert.match(css, /\.drawer-identity > \.brand-mark \{ background: #fff;/);
  parsed.walkDecls((decl) => {
    assert.ok(!/invert\(/.test(decl.value), "never invert brand assets");
    if (decl.parent.selector?.includes(".brand-mark")) assert.ok(!["color", "fill", "stroke", "filter"].includes(decl.prop));
  });
  for (const match of css.matchAll(/var\((--theme-[\w-]+)\)/g)) assert.ok(darkTokens[match[1]], `missing ${match[1]}`);
});
