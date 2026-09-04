import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { anchoredScroll, bindTimelineWheel, dragPosition, MAX_ZOOM, MIN_ZOOM, normalizeZoom } from "../src/timelineInteractions.js";
import { buildTimelineYears, buildYearStops, percentToScroll } from "../src/timelineNavigation.js";

const near = (a, b) => assert.ok(Math.abs(a - b) < 0.000001, `${a} != ${b}`);
const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
const years = [2021, 2022, 2023, 2024, 2025, 2026];
const sections = ["products", "models", "tech"];

test("explicit zoom controls span 40–250% and clamp out-of-range input", () => {
  assert.equal(MIN_ZOOM, .4);
  assert.equal(MAX_ZOOM, 2.5);
  assert.equal(normalizeZoom(-10), .4);
  assert.equal(normalizeZoom(100), 2.5);
  assert.equal(normalizeZoom(NaN), 1);
  assert.equal(normalizeZoom(.3), .4);
  assert.equal(normalizeZoom(2.6), 2.5);
  assert.equal(normalizeZoom(1.1), 1.1);
});

test("zoom preserves the content coordinate beneath the pointer in both axes", () => {
  for (const axisWidth of [48, 206, 276]) {
    for (const fromZoom of [.4, 1, 2.5]) {
      for (const toZoom of [.4, 1, 2.5]) {
        const before = { scrollLeft: 5000, scrollTop: 3000, x: 720, y: 420, axisWidth, fromZoom, toZoom, maxLeft: 100000, maxTop: 100000 };
        const after = anchoredScroll(before);
        near((before.scrollLeft + before.x - axisWidth) / fromZoom, (after.left + before.x - axisWidth) / toZoom);
        near((before.scrollTop + before.y - 36) / fromZoom, (after.top + before.y - 36) / toZoom);
      }
    }
  }
});

test("zoom clamps at content edges and when the full height is visible", () => {
  const before = { scrollLeft: 0, scrollTop: 0, x: 800, y: 400, axisWidth: 276, fromZoom: 1, toZoom: .4, maxLeft: 1000, maxTop: 0 };
  assert.deepEqual(anchoredScroll(before), { left: 0, top: 0 });
  assert.deepEqual(anchoredScroll({ ...before, scrollLeft: 10000, scrollTop: 1000, toZoom: 2.5, maxTop: 300 }), { left: 1000, top: 300 });
});

test("every year and node slot scales with the cards, without scaling the sticky rail", () => {
  for (const axisWidth of [48, 276]) {
    const base = buildTimelineYears(nodes, years, sections, 210, axisWidth);
    for (const zoom of [.4, .65, 1, 1.5, 2.5]) {
      const scaled = buildTimelineYears(nodes, years, sections, 210 * zoom, axisWidth, zoom);
      near(scaled.stageWidth - axisWidth, (base.stageWidth - axisWidth) * zoom);
      for (const [index, marker] of scaled.yearMarkers.entries()) {
        near(marker.firstNodeLeft - axisWidth, (base.yearMarkers[index].firstNodeLeft - axisWidth) * zoom);
        near(marker.width, base.yearMarkers[index].width * zoom);
      }
      for (const viewportWidth of [375, 1440, 2561]) {
        const maxScroll = Math.ceil(scaled.stageWidth) - viewportWidth;
        for (const stop of buildYearStops(scaled.yearMarkers, axisWidth, maxScroll, 1000)) {
          near(percentToScroll(stop.percent, maxScroll), stop.scrollLeft);
          assert.ok(stop.firstNodeLeft - stop.scrollLeft >= axisWidth + 24 - 0.000001);
        }
      }
    }
  }
});

test("drag supports horizontal and vertical pan while tolerating a normal click", () => {
  const origin = { x: 500, y: 400, left: 1000, top: 300 };
  assert.deepEqual(dragPosition(origin, { x: 502, y: 401 }), { left: 998, top: 299, moved: false });
  assert.deepEqual(dragPosition(origin, { x: 550, y: 470 }), { left: 950, top: 230, moved: true });
  assert.deepEqual(dragPosition(origin, { x: 400, y: 300 }), { left: 1100, top: 400, moved: true });
});

function wheelHarness() {
  let listener;
  let listenerOptions;
  const viewport = {
    clientHeight: 600, clientWidth: 800, scrollWidth: 5000, scrollLeft: 400, scrollTop: 200,
    addEventListener(type, fn, options) { assert.equal(type, "wheel"); listener = fn; listenerOptions = options; },
    removeEventListener(type, fn) { assert.equal(type, "wheel"); assert.equal(fn, listener); listener = null; },
  };
  const cleanup = bindTimelineWheel(viewport);
  const fire = (overrides = {}) => {
    let prevented = false;
    const event = { deltaX: 0, deltaY: 100, deltaMode: 0, clientX: 500, clientY: 450, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, target: { closest: () => null }, preventDefault() { prevented = true; }, ...overrides };
    listener(event);
    return prevented;
  };
  return { viewport, fire, cleanup, get options() { return listenerOptions; }, get listener() { return listener; } };
}

test("ordinary wheel and trackpad scrolling are left native, never converted into zoom", () => {
  const h = wheelHarness();
  for (const deltaMode of [0, 1, 2]) {
    for (const deltaY of [-120, -2, 0, 2, 120]) {
      assert.equal(h.fire({ deltaMode, deltaY }), false);
      assert.equal(h.fire({ deltaMode, deltaY, deltaX: 50 }), false);
    }
  }
  assert.equal(h.viewport.scrollLeft, 400);
  assert.equal(h.viewport.scrollTop, 200);
});

test("Shift + wheel pans horizontally and normalizes pixel, line, and page units", () => {
  const h = wheelHarness();
  assert.deepEqual(h.options, { passive: false });
  assert.equal(h.fire({ shiftKey: true }), true);
  assert.equal(h.viewport.scrollLeft, 500);
  h.fire({ shiftKey: true, deltaX: 50, deltaY: 2 });
  assert.equal(h.viewport.scrollLeft, 550);
  h.fire({ shiftKey: true, deltaMode: 1, deltaY: 3 });
  assert.equal(h.viewport.scrollLeft, 598);
  h.fire({ shiftKey: true, deltaMode: 2, deltaY: 1 });
  assert.equal(h.viewport.scrollLeft, 1398);
  h.fire({ shiftKey: true, deltaY: -100 });
  assert.equal(h.viewport.scrollLeft, 1298);
  assert.equal(h.viewport.scrollTop, 200);
  h.cleanup();
  assert.equal(h.listener, null);
});

test("browser modifier gestures, pinch, and already-handled wheel events stay untouched", () => {
  const h = wheelHarness();
  for (const key of ["ctrlKey", "metaKey", "altKey", "defaultPrevented"]) {
    assert.equal(h.fire({ [key]: true, deltaY: -2 }), false);
    assert.equal(h.fire({ [key]: true, shiftKey: true, deltaY: -2 }), false);
  }
  assert.equal(h.viewport.scrollLeft, 400);
  assert.equal(h.viewport.scrollTop, 200);
});

test("wheel ignores controls instead of hijacking their normal behavior", () => {
  const h = wheelHarness();
  for (const shiftKey of [false, true]) {
    assert.equal(h.fire({ shiftKey, target: { closest: () => ({}) } }), false);
  }
  assert.equal(h.viewport.scrollLeft, 400);
  assert.equal(h.viewport.scrollTop, 200);
});

test("horizontal shortcuts clamp to the canvas edges without trapping wheel input there", () => {
  const h = wheelHarness();
  assert.equal(h.fire({ shiftKey: true, deltaY: -1000 }), true);
  assert.equal(h.viewport.scrollLeft, 0);
  assert.equal(h.fire({ shiftKey: true, deltaY: -100 }), false);
  assert.equal(h.fire({ shiftKey: true, deltaY: 10000 }), true);
  assert.equal(h.viewport.scrollLeft, 4200);
  assert.equal(h.fire({ shiftKey: true, deltaY: 100 }), false);
  assert.equal(h.fire({ shiftKey: true, deltaY: 0 }), false);
  h.viewport.scrollWidth = h.viewport.clientWidth;
  h.viewport.scrollLeft = 0;
  assert.equal(h.fire({ shiftKey: true }), false);
});

test("the canvas binds scroll-only wheel handling and keeps explicit zoom controls", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /bindTimelineWheel\(viewport\)/);
  assert.doesNotMatch(app, /zoomFromWheel|滚轮缩放/);
  assert.match(app, /滚轮上下滚动/);
  assert.match(app, /onClick=\{\(\) => changeZoom\(-1\)\}/);
  assert.match(app, /onClick=\{\(\) => changeZoom\(1\)\}/);
  assert.match(app, /className="zoom-slider"/);
  assert.match(app, /onClick=\{\(\) => zoomTo\(1\)\}/);
});
