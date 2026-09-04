import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getLatestTimelineNode, getCurrentScrollPosition } from "../src/timelineNavigation.js";
import { getPublishedDate } from "../src/nodeSources.js";

const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
const sections = ["products", "models", "tech"];
const layouts = sections.map((id) => ({ id, nodes: nodes.filter((node) => node.section === id).map((node, index) => ({ ...node, left: index * 280 })) }));

test("current uses the latest publication date, not the rightmost layout slot", () => {
  const result = getLatestTimelineNode(layouts, new Set(nodes.map((node) => node.id)), getPublishedDate);
  assert.equal(result.date, nodes.map(getPublishedDate).sort().at(-1));
  assert.equal(result.node.title, "GPT-6 Astra");
  assert.equal(result.sectionIndex, 1);
});

test("current respects selected categories and matching search/month/stage IDs", () => {
  for (const layout of layouts) {
    const candidates = layout.nodes.filter((node) => getPublishedDate(node).slice(5, 7) === "05");
    const result = getLatestTimelineNode([layout], new Set(candidates.map((node) => node.id)), getPublishedDate);
    assert.equal(result.date, candidates.map(getPublishedDate).sort().at(-1));
    assert.equal(result.node.section, layout.id);
    assert.equal(result.sectionIndex, 0);
  }
  const one = nodes[0];
  assert.equal(getLatestTimelineNode(layouts, new Set([one.id]), getPublishedDate).node.id, one.id);
  assert.equal(getLatestTimelineNode(layouts, new Set(), getPublishedDate), null);
  assert.equal(getLatestTimelineNode([], new Set(nodes.map((node) => node.id)), getPublishedDate), null);
});

test("current positioning centers the full card beyond the rail and scrolls vertically", () => {
  for (const zoom of [.4, 1, 2.5]) {
    const cardWidth = 280 * zoom;
    const target = getCurrentScrollPosition({ left: 4000, centerY: 900, cardWidth, axisWidth: 340, viewportWidth: 1600, viewportHeight: 720, maxLeft: 10000, maxTop: 1200 });
    assert.equal(4000 - target.left + cardWidth / 2, 340 + (1600 - 340) / 2);
    assert.equal(target.top, 540);
  }
});

test("current positioning stays bounded on narrow screens and at content edges", () => {
  const viewport = { cardWidth: 280, axisWidth: 260, viewportWidth: 320, viewportHeight: 600, maxLeft: 1000, maxTop: 200 };
  assert.deepEqual(getCurrentScrollPosition({ ...viewport, left: 500, centerY: 400 }), { left: 216, top: 100 });
  assert.deepEqual(getCurrentScrollPosition({ ...viewport, left: 10, centerY: 10 }), { left: 0, top: 0 });
  assert.deepEqual(getCurrentScrollPosition({ ...viewport, left: 4000, centerY: 3000 }), { left: 1000, top: 200 });
  assert.deepEqual(getCurrentScrollPosition({ ...viewport, left: 4000, centerY: 3000, maxLeft: -1, maxTop: -1 }), { left: 0, top: 0 });
});
