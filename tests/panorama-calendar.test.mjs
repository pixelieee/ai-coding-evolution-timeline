import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { matchesCalendarDate } from "../src/calendarDates.js";
import { getPublishedDate } from "../src/nodeSources.js";
import { getLatestTimelineNode, buildLaneStops } from "../src/timelineNavigation.js";
import { buildMonthStops } from "../src/monthNavigation.js";

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
const layouts = ["products", "models", "tech"].map((id) => ({
  id, nodes: nodes.filter((node) => node.section === id).map((node, index) => ({ ...node, lane: index % 4, left: 340 + index * 280 })),
}));

test("both views use the same calendar panel with no legacy month-button fallback", () => {
  const menus = app.match(/<RefinementMenu\b[^\n]+/g);
  assert.equal(menus.length, 2);
  assert.ok(menus.every((menu) => menu.includes("calendar={{ value:")));
  assert.match(menus[0], /value: libraryDate, onChange: setLibraryDate, dates: calendarDates/);
  assert.match(menus[1], /value: panoramaDate, onChange: selectPanoramaDate, dates: panoramaCalendarDates/);
  assert.match(app, /refinement-panel calendar-panel/);
  assert.match(app, /<ArchiveCalendar \{\.\.\.calendar\} \/>/);
  assert.doesNotMatch(app, /精细筛选|月份与发展阶段|month-grid|getNodeMonths|setMonth\(/);
  assert.doesNotMatch(css, /month-grid/);
});

test("panorama date matching, release dots and reset share the current category/search/stage scope", () => {
  const candidates = app.slice(app.indexOf("const panoramaCandidates"), app.indexOf("const libraryPageCount"));
  assert.match(candidates, /matchesSearch\(node, query\)/);
  assert.match(candidates, /node.section === section/);
  assert.match(candidates, /getDevelopmentStage\(node\).id === developmentStage/);
  assert.match(candidates, /panoramaCalendarDates = useMemo\(\(\) => panoramaCandidates.map\(getPublishedDate\)/);
  assert.match(app, /panoramaCandidates.filter\(\(node\) => matchesCalendarDate\(getPublishedDate\(node\), panoramaDate\)\)/);
  assert.match(app, /if \(viewMode === "index"\) setLibraryDate\(""\); else setPanoramaDate\(""\)/);
  assert.match(app, /aria-live="polite">\{panoramaMatches.size\}/);
});

test("year, month and exact-day filters constrain current, lane and month-ruler destinations", () => {
  for (const selection of ["2024", "2025-04", "2025-04-22"]) {
    for (const visible of [layouts, layouts.filter((layout) => layout.id === "products")]) {
      const candidates = visible.flatMap((layout) => layout.nodes).filter((node) => matchesCalendarDate(getPublishedDate(node), selection));
      assert.ok(candidates.length > 0);
      const matches = new Set(candidates.map((node) => node.id));
      const latest = getLatestTimelineNode(visible, matches, getPublishedDate);
      assert.equal(latest.date, candidates.map(getPublishedDate).sort().at(-1));
      const stops = [...buildLaneStops(visible, matches, getPublishedDate).values(), ...buildMonthStops(visible, matches, getPublishedDate, 340, 30000)];
      assert.ok(stops.length > 0);
      for (const stop of stops) {
        assert.ok(matches.has(stop.node.id));
        assert.ok(matchesCalendarDate(stop.date, selection));
      }
    }
  }
});

test("empty dates provide no false navigation destinations and clearing restores all dates", () => {
  const matches = new Set(nodes.filter((node) => matchesCalendarDate(getPublishedDate(node), "2020-01-01")).map((node) => node.id));
  assert.equal(matches.size, 0);
  assert.equal(getLatestTimelineNode(layouts, matches, getPublishedDate), null);
  assert.equal(buildLaneStops(layouts, matches, getPublishedDate).size, 0);
  assert.deepEqual(buildMonthStops(layouts, matches, getPublishedDate, 340, 30000), []);
  assert.equal(nodes.filter((node) => matchesCalendarDate(getPublishedDate(node), "")).length, 192);
});
