import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildTimelineYears, buildYearStops, getYearScrollLeft, percentToScroll, scrollToPercent, SCRUBBER_THUMB_SIZE, YEAR_LABEL_WIDTH } from "../src/timelineNavigation.js";

const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
const years = [2021, 2022, 2023, 2024, 2025, 2026];
const sectionIds = ["products", "models", "tech"];
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} != ${expected}`);
const layout = (axisWidth = 276, size = 38) => buildTimelineYears(nodes, years, sectionIds, size + 8 + 144 + 20, axisWidth);

test("year markers preserve the existing node-density layout and share its first-node anchor", () => {
  const { yearMarkers, stageWidth } = layout();
  assert.equal(yearMarkers.length, 6);
  let left = 276 + 42;
  for (const marker of yearMarkers) {
    const count = Math.max(...sectionIds.map((section) => nodes.filter((node) => node.year === marker.year && node.section === section).length));
    assert.equal(marker.left, left);
    assert.equal(marker.firstNodeLeft, left + 34);
    assert.equal(marker.width, Math.max(620, count * 210 + 72));
    left += marker.width;
  }
  assert.equal(stageWidth, left + 120);
});

test("every year click and slider tick land at the same first node past the rail", () => {
  for (const axisWidth of [48, 206, 276]) {
    for (const size of [38 * 0.8, 38, 38 * 1.16, 38 * 1.25 * 1.16]) {
      for (const viewportWidth of [375, 760, 1440, 2561]) {
        const { yearMarkers, stageWidth } = layout(axisWidth, size);
        const maxScroll = Math.ceil(stageWidth) - viewportWidth;
        const stops = buildYearStops(yearMarkers, axisWidth, maxScroll, viewportWidth - 150);
        for (const stop of stops) {
          const fromClick = getYearScrollLeft(stop, axisWidth, maxScroll);
          const fromScrub = percentToScroll(stop.percent, maxScroll);
          near(fromClick, fromScrub);
          near(stop.firstNodeLeft - fromClick, axisWidth + 24);
        }
      }
    }
  }
});

test("2026 is marked at its first node, not at the slider end", () => {
  const { yearMarkers, stageWidth } = layout();
  const stops = buildYearStops(yearMarkers, 276, stageWidth - 2561, 2300);
  const lastYear = stops.at(-1);
  assert.ok(lastYear.percent > 65 && lastYear.percent < 80);
  assert.notEqual(lastYear.percent, 100);
  const intervals = stops.slice(1).map((stop, index) => stop.percent - stops[index].percent);
  assert.ok(intervals.at(-1) > intervals[0] * 5);
});

test("resize updates year percentages even without a scroll event", () => {
  const { yearMarkers, stageWidth } = layout();
  const marker = yearMarkers[4];
  const before = buildYearStops(yearMarkers, 276, stageWidth - 1440, 1280)[4];
  const after = buildYearStops(yearMarkers, 276, stageWidth - 2561, 2300)[4];
  assert.notEqual(before.percent, after.percent);
  near(before.scrollLeft, after.scrollLeft);
  near(percentToScroll(after.percent, stageWidth - 2561), getYearScrollLeft(marker, 276, stageWidth - 2561));
});

test("year ticks align with the thumb center rather than the input's outer width", () => {
  const { yearMarkers, stageWidth } = layout();
  for (const inputWidth of [260, 600, 1280, 2300]) {
    const trackWidth = inputWidth - SCRUBBER_THUMB_SIZE;
    for (const stop of buildYearStops(yearMarkers, 276, stageWidth - 1440, trackWidth)) {
      const tickX = SCRUBBER_THUMB_SIZE / 2 + trackWidth * stop.percent / 100;
      const thumbCenterX = SCRUBBER_THUMB_SIZE / 2 + (inputWidth - SCRUBBER_THUMB_SIZE) * stop.percent / 100;
      near(tickX, thumbCenterX);
    }
  }
});

test("crowded year labels stagger without moving their real scroll positions", () => {
  const { yearMarkers, stageWidth } = layout();
  for (const trackWidth of [220, 320, 600, 1200, 2300]) {
    const stops = buildYearStops(yearMarkers, 276, stageWidth - 1440, trackWidth);
    for (const stop of stops) {
      near(stop.percent, scrollToPercent(stop.scrollLeft, stageWidth - 1440));
      for (const other of stops.filter((item) => item.year > stop.year && item.row === stop.row)) {
        assert.ok((other.percent - stop.percent) / 100 * trackWidth >= YEAR_LABEL_WIDTH + 6 - 0.000001);
      }
    }
    if (trackWidth === 220) assert.ok(stops.some((stop) => stop.row > 0));
    if (trackWidth === 2300) assert.ok(stops.every((stop) => stop.row === 0));
  }
});

test("zero range, overscroll, and percentage endpoints remain bounded", () => {
  assert.equal(scrollToPercent(200, 0), 0);
  assert.equal(percentToScroll(50, -100), 0);
  assert.equal(scrollToPercent(-20, 100), 0);
  assert.equal(scrollToPercent(200, 100), 100);
  assert.equal(percentToScroll(-20, 100), 0);
  assert.equal(percentToScroll(120, 100), 100);
  assert.equal(getYearScrollLeft({ firstNodeLeft: 20 }, 276, 100), 0);
  assert.equal(getYearScrollLeft({ firstNodeLeft: 5000 }, 276, 100), 100);
  const { yearMarkers } = layout();
  assert.ok(buildYearStops(yearMarkers, 276, 0, 0).every((stop) => stop.percent === 0 && stop.scrollLeft === 0));
});
