import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildLaneStops, getLaneScrollPosition } from "../src/timelineNavigation.js";

const layouts = [
  { id: "products", nodes: [
    { id: "p2", lane: 0, date: "2024-06-01", left: 1800 },
    { id: "p1", lane: 0, date: "2023-03-10", left: 800 },
    { id: "p3", lane: 1, date: "2025-04-01", left: 3200 },
    { id: "p0", lane: 0, date: "2023-03-10", left: 600 },
  ] },
  { id: "models", nodes: [{ id: "m1", lane: 0, date: "2022-05-01", left: 500 }] },
  { id: "tech", nodes: [{ id: "t1", lane: 3, date: "2026-01-01", left: 6000 }] },
];
const matches = new Set(layouts.flatMap((layout) => layout.nodes.map((node) => node.id)));
const getDate = (node) => node.date;

test("lane navigation selects the earliest exact date, then the leftmost tied node", () => {
  const stops = buildLaneStops(layouts, matches, getDate);
  assert.equal(stops.get("products:0").node.id, "p0");
  assert.equal(stops.get("products:1").node.id, "p3");
  assert.equal(stops.get("models:0").node.id, "m1");
  assert.equal(stops.get("tech:3").sectionIndex, 2);
  assert.equal(stops.has("tech:0"), false);
});

test("filters never send a lane jump to a different section or an excluded node", () => {
  const stops = buildLaneStops(layouts, new Set(["p2", "t1"]), getDate);
  assert.equal(stops.size, 2);
  assert.equal(stops.get("products:0").node.id, "p2");
  assert.equal(stops.has("models:0"), false);
  assert.equal(buildLaneStops(layouts, new Set(), getDate).size, 0);
  assert.equal(buildLaneStops([layouts[2]], matches, getDate).get("tech:3").sectionIndex, 0);
});

test("the first node lands 24px beyond the current rail and centers vertically", () => {
  for (const axisWidth of [48, 260, 340]) {
    for (const zoom of [.4, 1, 2.5]) {
      const left = axisWidth + 2000 * zoom;
      const centerY = 1500 * zoom;
      const target = getLaneScrollPosition({ left, centerY, axisWidth, viewportHeight: 600, maxLeft: 12000, maxTop: 6000 });
      assert.equal(left - target.left, axisWidth + 24);
      assert.equal(centerY - target.top, 300);
    }
  }
  assert.deepEqual(getLaneScrollPosition({ left: 0, centerY: 0, axisWidth: 340, viewportHeight: 600, maxLeft: -1, maxTop: -1 }), { left: 0, top: 0 });
  assert.deepEqual(getLaneScrollPosition({ left: 9000, centerY: 9000, axisWidth: 340, viewportHeight: 600, maxLeft: 200, maxTop: 100 }), { left: 200, top: 100 });
});

test("stage navigation is keyboard accessible and does not collapse the rail or change filters", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /onClick=\{\(\) => jumpToLane\(stop\)\} disabled=\{!stop\}/);
  assert.match(app, /aria-current=\{current \? "location" : undefined\}/);
  const handler = app.match(/const jumpToLane = \(stop\) => \{([\s\S]*?)\n  \};/)[1];
  assert.doesNotMatch(handler, /set(?:Section|Month|Query|DevelopmentStage|AxisCollapsed)\(|changeAxis\(/);
  assert.match(handler, /setSelected\(null\)/);
  assert.match(handler, /prefers-reduced-motion/);
});
