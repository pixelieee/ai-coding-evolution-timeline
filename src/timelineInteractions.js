export const MIN_ZOOM = 0.4;
export const MAX_ZOOM = 2.5;
export const DRAG_THRESHOLD = 4;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function normalizeZoom(value) {
  return Number.isFinite(value) ? clamp(value, MIN_ZOOM, MAX_ZOOM) : 1;
}

// The rail and year ruler stay unscaled; everything beyond them scales
// around the pointer's content coordinate, not around the whole page.
export function anchoredScroll({ scrollLeft, scrollTop, x, y, axisWidth, fromZoom, toZoom, maxLeft, maxTop }) {
  const ratio = toZoom / fromZoom;
  return {
    left: clamp(axisWidth + (scrollLeft + x - axisWidth) * ratio - x, 0, Math.max(0, maxLeft)),
    top: clamp(36 + (scrollTop + y - 36) * ratio - y, 0, Math.max(0, maxTop)),
  };
}

export function dragPosition(origin, point) {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return { left: origin.left - dx, top: origin.top - dy, moved: Math.hypot(dx, dy) >= DRAG_THRESHOLD };
}

export function shouldCollapseAxis(event, collapsed) {
  if (collapsed || event.defaultPrevented || event.button !== 0) return false;
  const target = event.target;
  return Boolean(target.closest(".timeline-band"))
    && !target.closest(".band-axis, a, input, select, textarea, button:not(.milestone-node)");
}

export function bindTimelineWheel(viewport) {
  const onWheel = (event) => {
    // Leave ordinary mouse/trackpad scrolling and browser zoom native.
    // Only the explicit Shift + wheel shortcut needs a custom mapping.
    if (event.defaultPrevented || !event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest("input, select, textarea, a, button:not(.milestone-node)")) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
    const delta = (event.deltaX || event.deltaY) * unit;
    const left = clamp(viewport.scrollLeft + delta, 0, Math.max(0, viewport.scrollWidth - viewport.clientWidth));
    if (left === viewport.scrollLeft) return;
    event.preventDefault();
    viewport.scrollLeft = left;
  };
  // Non-passive only so Shift + wheel can pan without also scrolling vertically.
  viewport.addEventListener("wheel", onWheel, { passive: false });
  return () => viewport.removeEventListener("wheel", onWheel);
}
