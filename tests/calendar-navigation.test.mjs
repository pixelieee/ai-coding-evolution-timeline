import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calendarDateCounts } from "../src/calendarDates.js";
import { getCalendarTimelineNode, getCurrentScrollPosition } from "../src/timelineNavigation.js";
import { getPublishedDate } from "../src/nodeSources.js";

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
const layouts = ["products", "models", "tech"].map((id) => ({
  id, nodes: nodes.filter((node) => node.section === id).map((node, index) => ({ ...node, left: 340 + index * 280, lane: index % 4 })),
}));

test("every populated calendar date and period has a matching panorama destination", () => {
  for (const visible of [layouts, ...layouts.map((layout) => [layout])]) {
    const candidates = visible.flatMap((layout) => layout.nodes);
    const counts = calendarDateCounts(candidates.map(getPublishedDate));
    const ids = new Set(candidates.map((node) => node.id));
    for (const [selection, count] of Object.entries(counts)) {
      assert.ok(count > 0);
      const stop = getCalendarTimelineNode(visible, ids, selection, getPublishedDate);
      assert.ok(stop);
      assert.ok(getPublishedDate(stop.node).startsWith(selection));
      assert.ok(visible[stop.sectionIndex].nodes.includes(stop.node));
      assert.equal(stop.date, candidates.map(getPublishedDate).filter((date) => date.startsWith(selection)).sort()[0]);
    }
  }
});

test("dates use their first visible node with deterministic leftmost ties", () => {
  const fixture = [{ id: "products", nodes: [
    { id: "later", left: 300, date: "2025-04-23" },
    { id: "right", left: 900, date: "2025-04-22" },
    { id: "left", left: 500, date: "2025-04-22" },
  ] }, { id: "models", nodes: [{ id: "tie", left: 500, date: "2025-04-22" }] }];
  const ids = new Set(fixture.flatMap((layout) => layout.nodes.map((node) => node.id)));
  for (const selection of ["2025-04-22", "2025-04", "2025"]) {
    assert.equal(getCalendarTimelineNode(fixture, ids, selection, (node) => node.date).node.id, "left");
  }
  assert.equal(getCalendarTimelineNode(fixture, new Set(["right"]), "2025-04-22", (node) => node.date).node.id, "right");
  assert.equal(getCalendarTimelineNode([fixture[1]], ids, "2025-04-22", (node) => node.date).sectionIndex, 0);
});

test("empty dates, filtered-out nodes and cleared dates never invent a destination", () => {
  const ids = new Set(nodes.map((node) => node.id));
  assert.equal(getCalendarTimelineNode(layouts, ids, "2020-01-01", getPublishedDate), null);
  assert.equal(getCalendarTimelineNode(layouts, ids, "", getPublishedDate), null);
  assert.equal(getCalendarTimelineNode(layouts, new Set(), "2025", getPublishedDate), null);
  assert.equal(getCalendarTimelineNode([], ids, "2025", getPublishedDate), null);
});

function dateHandler(reducedMotion = false) {
  const effects = {};
  const candidates = layouts.flatMap((layout) => layout.nodes);
  const viewport = {
    clientWidth: 1600, clientHeight: 720, scrollWidth: 40000, scrollHeight: 1600,
    focus: (options) => { effects.focus = options; },
    scrollTo: (options) => { effects.scroll = options; },
  };
  const context = {
    viewportRef: { current: viewport }, panoramaLayouts: layouts, panoramaCandidates: candidates,
    getCalendarTimelineNode, getPublishedDate, getCurrentScrollPosition,
    zoom: 1, singleSectionInset: 0, bandHeight: 460, SECTION_GAP: 8,
    nodeTop: (lane) => lane * 115 + 35, milestoneSize: 38, axisWidth: 340,
    MILESTONE_LABEL_GAP: 10, MILESTONE_LABEL_WIDTH: 210,
    hoverDismissal: { dismiss: () => { effects.dismissed = true; } },
    window: { matchMedia: () => ({ matches: reducedMotion }) },
  };
  for (const key of ["PanoramaDate", "CalendarJump", "Selected", "CurrentJump", "LaneJump", "RefinementsOpen"]) {
    context[`set${key}`] = (value) => { effects[key] = value; };
  }
  const body = app.match(/const selectPanoramaDate = \(value\) => \{([\s\S]*?)\n  \};/)[1];
  const handler = new Function(...Object.keys(context), `return (value) => {${body}};`)(...Object.values(context));
  return { handler, effects };
}

test("date activation closes the panel, marks the destination and scrolls both axes without a drawer", () => {
  for (const reduced of [false, true]) {
    const { handler, effects } = dateHandler(reduced);
    handler("2025-04-22");
    assert.equal(effects.PanoramaDate, "2025-04-22");
    assert.equal(effects.RefinementsOpen, false);
    assert.equal(effects.Selected, null);
    assert.equal(effects.dismissed, true);
    assert.deepEqual(effects.focus, { preventScroll: true });
    assert.equal(effects.CalendarJump.destination.date, "2025-04-22");
    assert.equal(effects.scroll.left, effects.CalendarJump.left);
    assert.equal(effects.scroll.top, effects.CalendarJump.top);
    assert.equal(effects.scroll.behavior, reduced ? "instant" : "smooth");
    // A second date must resolve outside the previous day's filtered results.
    handler("2026-08-28");
    assert.equal(effects.CalendarJump.destination.date, "2026-08-28");
  }
});

test("empty date and clear actions keep the panel open and do not move the panorama", () => {
  for (const selection of ["2020-01-01", ""]) {
    const { handler, effects } = dateHandler();
    handler(selection);
    assert.equal(effects.PanoramaDate, selection);
    assert.equal(effects.CalendarJump, null);
    assert.equal(effects.scroll, undefined);
    assert.equal(effects.RefinementsOpen, undefined);
  }
});

test("dots stay visibly centered without intercepting clicks and destinations get a highlight", () => {
  assert.match(css, /\.calendar-cell i \{[^}]*display: block;[^}]*left: calc\(50% - 2\.5px\); width: 5px; height: 5px;[^}]*background: var\(--calendar-accent\); pointer-events: none/);
  assert.match(app, /isAtCalendar && calendarJump.destination.node.id === node.id/);
  assert.match(app, /className="sr-only" role="status"/);
  const handler = app.match(/const selectPanoramaDate = \(value\) => \{([\s\S]*?)\n  \};/)[1];
  assert.doesNotMatch(handler, /set(?:Zoom|Section|Query|DevelopmentStage|AxisCollapsed|LibraryDate)\(|changeAxis\(/);
});
