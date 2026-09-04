import { getYearScrollLeft, scrollToPercent } from "./timelineNavigation.js";

export function buildMonthStops(layouts, matches, getDate, axisWidth, maxScroll) {
  const groups = new Map();
  layouts.forEach((layout, sectionIndex) => layout.nodes.forEach((node) => {
    if (!matches.has(node.id)) return;
    const date = getDate(node);
    const key = date.slice(0, 7);
    const previous = groups.get(key);
    const count = (previous?.count ?? 0) + 1;
    if (!previous || date < previous.date || (date === previous.date && node.left < previous.node.left)) {
      groups.set(key, { key, year: Number(key.slice(0, 4)), month: Number(key.slice(5)), date, node, sectionIndex, count });
    } else previous.count = count;
  }));
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key)).map((stop) => {
    const scrollLeft = getYearScrollLeft({ firstNodeLeft: stop.node.left }, axisWidth, maxScroll);
    return { ...stop, scrollLeft, percent: scrollToPercent(scrollLeft, maxScroll) };
  });
}

export function monthPreviewAt(stops, years, percent, yearHint) {
  const year = yearHint ?? years.reduce((value, stop) => stop.percent <= percent ? stop.year : value, years[0]?.year);
  if (!year) return null;
  const candidates = stops.filter((stop) => stop.year === year);
  const nearest = candidates.reduce((best, stop) => !best || Math.abs(stop.percent - percent) < Math.abs(best.percent - percent) ? stop : best, null);
  return { year, month: nearest?.month ?? 1 };
}

export function monthTickHeight(month, activeMonth) {
  return 7 + Math.max(0, 1 - Math.abs(month - activeMonth) / 3) * 17;
}

export function monthLensPosition(clientX, rectLeft, viewportWidth) {
  const width = Math.min(360, Math.max(0, viewportWidth - 24));
  const center = Math.max(12 + width / 2, Math.min(viewportWidth - 12 - width / 2, clientX));
  return { width, left: center - rectLeft - width / 2, anchor: Math.max(12, Math.min(width - 12, clientX - center + width / 2)) };
}
