import { matchesCalendarDate } from "./calendarDates.js";

const YEAR_MIN_WIDTH = 620;
const FIRST_NODE_OFFSET = 34;
const YEAR_LANDING_INSET = 24;
export const SCRUBBER_THUMB_SIZE = 20;
export const YEAR_LABEL_WIDTH = 52;
export const YEAR_LABEL_ROW_HEIGHT = 24;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Year bands are sized by node density, not by equal calendar intervals.
// Share the first-node coordinate with layout, ruler, and scroll navigation.
export function buildTimelineYears(items, years, sectionIds, step, axisWidth, zoom = 1) {
  let cursor = axisWidth + 42 * zoom;
  const yearMarkers = years.map((year) => {
    const slots = Math.max(1, ...sectionIds.map((section) => items.filter((node) => node.year === year && node.section === section).length));
    const width = Math.max(YEAR_MIN_WIDTH * zoom, slots * step + 72 * zoom);
    const marker = { year, left: cursor, firstNodeLeft: cursor + FIRST_NODE_OFFSET * zoom, width };
    cursor += width;
    return marker;
  });
  return { yearMarkers, stageWidth: cursor + 120 * zoom };
}

export function scrollToPercent(scrollLeft, maxScroll) {
  return maxScroll > 0 ? clamp(scrollLeft / maxScroll * 100, 0, 100) : 0;
}

export function percentToScroll(percent, maxScroll) {
  return clamp(percent, 0, 100) / 100 * Math.max(0, maxScroll);
}

export function getYearScrollLeft(marker, axisWidth, maxScroll) {
  return clamp(marker.firstNodeLeft - axisWidth - YEAR_LANDING_INSET, 0, Math.max(0, maxScroll));
}

export function getLatestTimelineNode(layouts, matches, getDate) {
  let latest = null;
  layouts.forEach((layout, sectionIndex) => {
    layout.nodes.forEach((node) => {
      if (!matches.has(node.id)) return;
      const date = getDate(node);
      if (!latest || date > latest.date || (date === latest.date && node.left > latest.node.left)) {
        latest = { node, date, sectionIndex };
      }
    });
  });
  return latest;
}

export function getCalendarTimelineNode(layouts, candidates, selection, getDate) {
  if (!selection) return null;
  let first = null;
  layouts.forEach((layout, sectionIndex) => {
    layout.nodes.forEach((node) => {
      if (!candidates.has(node.id)) return;
      const date = getDate(node);
      if (!matchesCalendarDate(date, selection)) return;
      if (!first || date < first.date || (date === first.date && node.left < first.node.left)) {
        first = { node, date, sectionIndex };
      }
    });
  });
  return first;
}

export function getCurrentScrollPosition({ left, centerY, cardWidth, axisWidth, viewportWidth, viewportHeight, maxLeft, maxTop }) {
  // Center the complete card in the area not covered by the sticky rail.
  const usableWidth = Math.max(0, viewportWidth - axisWidth);
  return {
    left: clamp(left - axisWidth - Math.max(24, (usableWidth - cardWidth) / 2), 0, Math.max(0, maxLeft)),
    top: clamp(centerY - viewportHeight / 2, 0, Math.max(0, maxTop)),
  };
}

export function buildLaneStops(layouts, matches, getDate) {
  const stops = new Map();
  layouts.forEach((layout, sectionIndex) => {
    layout.nodes.forEach((node) => {
      if (!matches.has(node.id)) return;
      const key = `${layout.id}:${node.lane}`;
      const date = getDate(node);
      const first = stops.get(key);
      if (!first || date < first.date || (date === first.date && node.left < first.node.left)) {
        stops.set(key, { key, node, date, sectionIndex });
      }
    });
  });
  return stops;
}

export function getLaneScrollPosition({ left, centerY, axisWidth, viewportHeight, maxLeft, maxTop }) {
  return {
    left: getYearScrollLeft({ firstNodeLeft: left }, axisWidth, maxLeft),
    top: clamp(centerY - viewportHeight / 2, 0, Math.max(0, maxTop)),
  };
}

export function buildYearStops(markers, axisWidth, maxScroll, trackWidth) {
  const rowEnds = [];
  return markers.map((marker) => {
    const scrollLeft = getYearScrollLeft(marker, axisWidth, maxScroll);
    const percent = scrollToPercent(scrollLeft, maxScroll);
    const x = percent / 100 * Math.max(0, trackWidth);
    // Keep the exact x coordinate even on a small screen; only stagger labels
    // vertically when they would overlap. Tick and thumb positions stay true.
    let row = rowEnds.findIndex((end) => x - YEAR_LABEL_WIDTH / 2 >= end + 6);
    if (row < 0) row = rowEnds.length;
    rowEnds[row] = x + YEAR_LABEL_WIDTH / 2;
    return { ...marker, scrollLeft, percent, row };
  });
}
