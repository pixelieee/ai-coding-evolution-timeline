import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const app = read("../src/App.jsx");
const css = read("../src/styles.css");
const verdict = read("../src/VerdictBoard.jsx");

test("phones render a separate vertical timeline instead of the wide desktop canvas", () => {
  assert.match(app, /const isMobileTimeline = viewportWidth <= 760/);
  assert.match(app, /isMobileTimeline \? \(\s*<div ref=\{mobileTimelineRef\} className="mobile-timeline"/);
  assert.match(app, /mobileTimelineGroups\.map/);
  assert.match(app, /mobile-timeline-entry/);
  assert.doesNotMatch(app, /placeholder=\{`搜索 \$\{nodes\.length\} 个节点`\}/);
});

test("mobile timeline keeps search, category and date controls in a compact filter grid", () => {
  assert.match(css, /\.panorama-toolbar \{ display: none; \}/);
  assert.match(css, /\.panorama-filterbar \{ display: grid; grid-template-columns: minmax\(0,1fr\) 44px 44px;/);
  assert.match(css, /\.track-chips \{ grid-column: 1 \/ -1; grid-row: 2;[^}]*grid-template-columns: repeat\(4,minmax\(0,1fr\)\)/);
});

test("mobile year navigation stays visible while a compact chronological list scrolls", () => {
  assert.match(css, /\.panorama-page\.mobile-timeline-page \{ grid-template-rows: auto minmax\(0,1fr\); \}/);
  assert.match(css, /\.mobile-year-nav \{ position: sticky;[^}]*grid-auto-flow: column/);
  assert.match(css, /\.mobile-year-group > header \{ position: sticky;/);
  assert.match(css, /\.mobile-timeline-card \{[^}]*grid-template-columns: 34px minmax\(0,1fr\) 17px/);
  assert.match(css, /\.detail-drawer\.over-panorama \{ bottom: 61px; \}/);
});

test("mobile timeline controls collapse into a single explicit restore bar", () => {
  assert.match(app, /mobilePanoramaControlsCollapsed/);
  assert.match(app, /className=\{`mobile-top-panel \$\{mobilePanoramaControlsCollapsed \? "collapsed" : ""\}`\}/);
  assert.match(app, /展开筛选与年份/);
  assert.match(app, /className="mobile-controls-collapse"/);
  assert.match(css, /\.mobile-top-panel\.collapsed,\.verdict-top-panel\.collapsed \{ min-height: 36px;/);
  assert.match(css, /\.mobile-controls-expand \{ width: 100%; height: 36px;/);
  assert.doesNotMatch(css, /\.mobile-top-panel:not\(\.collapsed\) \+ \.mobile-timeline/);
});

test("mobile timeline scrolls internally, auto-collapses controls and cannot expose body whitespace", () => {
  assert.match(app, /onScroll=\{handleMobileTimelineScroll\}/);
  assert.match(app, /nextScrollTop > mobileControlsAutoCollapseAfterRef\.current/);
  assert.match(app, /timeline\.scrollTo\(\{/);
  assert.doesNotMatch(app, /scrollIntoView\(\{ behavior: window\.matchMedia/);
  assert.match(app, /document\.body\.classList\.toggle\("mobile-panorama-lock", lockMobilePanorama\)/);
  assert.match(css, /body\.mobile-panorama-lock \{ position: fixed; inset: 0;[^}]*overflow: hidden;/);
});

test("mobile verdict header collapses and its evidence box is compact", () => {
  assert.match(verdict, /mobileHeaderCollapsed/);
  assert.match(verdict, /展开介绍与分类/);
  assert.match(css, /\.verdict-method \{ min-width: 0; min-height: 0; grid-template-columns: 20px minmax\(0,1fr\);[^}]*padding: 12px;/);
  assert.match(css, /\.verdict-top-panel\.collapsed/);
});
