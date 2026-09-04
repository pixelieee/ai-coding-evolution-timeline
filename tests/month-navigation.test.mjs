import test from "node:test";
import assert from "node:assert/strict";
import { buildMonthStops, monthPreviewAt, monthTickHeight, monthLensPosition } from "../src/monthNavigation.js";
import { getYearScrollLeft, percentToScroll } from "../src/timelineNavigation.js";

const layouts = [
  { nodes: [
    { id: "a", date: "2025-01-08", left: 800 },
    { id: "b", date: "2025-01-02", left: 500 },
    { id: "c", date: "2025-03-12", left: 1400 },
  ] },
  { nodes: [
    { id: "d", date: "2025-01-02", left: 450 },
    { id: "e", date: "2026-02-12", left: 3000 },
  ] },
];
const all = new Set(["a", "b", "c", "d", "e"]);
const date = (node) => node.date;
const years = [{ year: 2025, percent: 0 }, { year: 2026, percent: 70 }];

test("month ticks use each month's first dated matching node, with stable tie breaks", () => {
  const stops = buildMonthStops(layouts, all, date, 340, 4000);
  assert.deepEqual(stops.map((stop) => stop.key), ["2025-01", "2025-03", "2026-02"]);
  assert.equal(stops[0].node.id, "d");
  assert.equal(stops[0].sectionIndex, 1);
  assert.equal(stops[0].count, 3);
  assert.equal(stops.reduce((sum, stop) => sum + stop.count, 0), 5);
});

test("filters and single-category selection preserve scope and do not invent empty-month events", () => {
  const stops = buildMonthStops([layouts[0]], new Set(["a", "c"]), date, 340, 4000);
  assert.equal(stops[0].node.id, "a");
  assert.equal(stops[0].count, 1);
  assert.equal(stops[0].sectionIndex, 0);
  assert.ok(!stops.some((stop) => stop.month === 2));
  assert.deepEqual(buildMonthStops(layouts, new Set(), date, 340, 4000), []);
});

test("month tick, scrubber percentage and click destination share the exact node anchor", () => {
  for (const axis of [48, 260, 340]) for (const zoom of [.4, 1, 2.5]) {
    const scaled = layouts.map((layout) => ({ nodes: layout.nodes.map((node) => ({ ...node, left: node.left * zoom })) }));
    const maxScroll = 4000 * zoom;
    for (const stop of buildMonthStops(scaled, all, date, axis, maxScroll)) {
      assert.equal(stop.scrollLeft, getYearScrollLeft({ firstNodeLeft: stop.node.left }, axis, maxScroll));
      assert.ok(Math.abs(percentToScroll(stop.percent, maxScroll) - stop.scrollLeft) < 1e-6);
    }
  }
  assert.ok(buildMonthStops(layouts, all, date, 340, 0).every((stop) => stop.percent === 0));
});

test("hover resolves the local year and nearest actual month, including an explicit year label", () => {
  const stops = buildMonthStops(layouts, all, date, 340, 4000);
  assert.deepEqual(monthPreviewAt(stops, years, 10), { year: 2025, month: 1 });
  assert.deepEqual(monthPreviewAt(stops, years, 80), { year: 2026, month: 2 });
  assert.deepEqual(monthPreviewAt(stops, years, 0, 2026), { year: 2026, month: 2 });
  assert.deepEqual(monthPreviewAt([], years, 80), { year: 2026, month: 1 });
  assert.equal(monthPreviewAt([], [], 0), null);
});

test("ruler ticks progressively lengthen near the active month without moving their x positions", () => {
  assert.equal(monthTickHeight(6, 6), 24);
  assert.ok(monthTickHeight(5, 6) > monthTickHeight(4, 6));
  assert.ok(monthTickHeight(4, 6) > monthTickHeight(3, 6));
  assert.equal(monthTickHeight(1, 6), 7);
  assert.equal(monthTickHeight(5, 6), monthTickHeight(7, 6));
});

test("month ruler stays inside the viewport at either edge and on narrow screens", () => {
  for (const width of [320, 760, 1440, 2561]) for (const x of [0, 10, width / 2, width - 10, width]) {
    const result = monthLensPosition(x, 64, width);
    assert.ok(result.left + 64 >= 12);
    assert.ok(result.left + 64 + result.width <= width - 12);
    assert.ok(result.anchor >= 12 && result.anchor <= result.width - 12);
  }
});
