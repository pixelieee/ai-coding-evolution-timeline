import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const app = read("../src/App.jsx");
const css = read("../src/styles.css");

test("phones render a separate vertical timeline instead of the wide desktop canvas", () => {
  assert.match(app, /const isMobileTimeline = viewportWidth <= 760/);
  assert.match(app, /isMobileTimeline \? \(\s*<div className="mobile-timeline"/);
  assert.match(app, /mobileTimelineGroups\.map/);
  assert.match(app, /mobile-timeline-entry/);
  assert.doesNotMatch(app, /placeholder=\{`搜索 \$\{nodes\.length\} 个节点`\}/);
});

test("mobile timeline keeps search, category and date controls in a compact filter grid", () => {
  assert.match(css, /\.panorama-toolbar \{ display: none; \}/);
  assert.match(css, /\.panorama-filterbar \{ display: grid; grid-template-columns: minmax\(0,1fr\) 44px;/);
  assert.match(css, /\.track-chips \{ grid-column: 1 \/ -1; grid-row: 2;[^}]*grid-template-columns: repeat\(4,minmax\(0,1fr\)\)/);
});

test("mobile year navigation stays visible while a compact chronological list scrolls", () => {
  assert.match(css, /\.panorama-page\.mobile-timeline-page \{ grid-template-rows: auto minmax\(0,1fr\); \}/);
  assert.match(css, /\.mobile-year-nav \{ position: sticky;[^}]*grid-auto-flow: column/);
  assert.match(css, /\.mobile-year-group > header \{ position: sticky;/);
  assert.match(css, /\.mobile-timeline-card \{[^}]*grid-template-columns: 34px minmax\(0,1fr\) 17px/);
  assert.match(css, /\.detail-drawer\.over-panorama \{ bottom: 61px; \}/);
});
