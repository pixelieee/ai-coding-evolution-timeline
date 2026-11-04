import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

test("library filters do not add a full-width reset row", () => {
  assert.doesNotMatch(app, /className="reset-button"/);
  assert.doesNotMatch(css, /\.reset-button\s*\{/);
});

test("mobile icon-only controls have one centered layout item", () => {
  assert.match(app, /<Eye size=\{17\} \/><span>查看<\/span>/);
  assert.match(app, /<DownloadSimple size=\{17\} \/><span>下载<\/span>/);
  assert.match(app, /<span className="refinement-label">日期与阶段<\/span>/);
  assert.match(app, /<span className="refinement-count">\{activeCount\}<\/span>/);
  assert.match(css, /\.download-link > span \{ display: none; \}/);
  assert.match(css, /\.refinement-trigger \{ width: 44px; height: 44px; display: grid; place-items: center; gap: 0; padding: 0; \}/);
  assert.match(css, /\.refinement-label \{ display: none; \}/);
  assert.doesNotMatch(css, /\.refinement-trigger > span \{/);
  assert.match(css, /\.theme-toggle svg,\.download-link svg,\.refinement-trigger > svg:first-child,\.icon-button svg \{ display: block; margin: auto; \}/);
});
