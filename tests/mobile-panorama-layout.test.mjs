import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const app = read("../src/App.jsx");
const css = read("../src/styles.css");

test("mobile panorama opens with the wide desktop rail collapsed", () => {
  assert.match(app, /useState\(\(\) => typeof window !== "undefined" && window\.innerWidth <= 760\)/);
  assert.match(app, /viewMode === "panorama" && viewportWidth <= 760\) setAxisCollapsed\(true\)/);
  assert.doesNotMatch(app, /placeholder=\{`搜索 \$\{nodes\.length\} 个节点`\}/);
});

test("mobile panorama uses compact year chips and a two-row filter grid", () => {
  assert.match(css, /\.panorama-toolbar \{ display: none; \}/);
  assert.match(css, /\.year-jumps \{ height: 30px !important; display: grid; grid-template-columns: repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(css, /\.panorama-filterbar \{ display: grid; grid-template-columns: minmax\(0,1fr\) 44px;/);
  assert.match(css, /\.track-chips \{ grid-column: 1 \/ -1; grid-row: 2;[^}]*grid-template-columns: repeat\(4,minmax\(0,1fr\)\)/);
});

test("mobile panorama gives the canvas the remaining height and floats compact zoom controls", () => {
  assert.match(css, /\.panorama-workspace \{ position: relative; grid-template-rows: minmax\(0,1fr\); \}/);
  assert.match(css, /\.canvas-tools \{ position: absolute;[^}]*right: 10px; bottom: 10px;/);
  assert.match(css, /\.canvas-footer-meta,\.canvas-gesture-hint,\.scale-label,\.zoom-slider \{ display: none; \}/);
  assert.match(css, /\.detail-drawer\.over-panorama \{ bottom: 61px; \}/);
});
