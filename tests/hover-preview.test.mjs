import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHoverDismissal, HOVER_DISMISS_DELAY } from "../src/hoverPreview.js";

function setup() {
  let now = 0;
  let nextId = 0;
  let closed = 0;
  let retained = false;
  const pending = new Map();
  const controller = createHoverDismissal(() => { closed += 1; }, {
    shouldKeepOpen: () => retained,
    setTimer: (callback, delay) => { const id = nextId++; pending.set(id, { callback, due: now + delay }); return id; },
    clearTimer: (id) => pending.delete(id),
  });
  return {
    ...controller,
    get closed() { return closed; },
    get pending() { return pending.size; },
    retain(value) { retained = value; },
    advance(duration) {
      now += duration;
      for (const [id, timer] of pending) if (timer.due <= now) { pending.delete(id); timer.callback(); }
    },
  };
}

test("leaving a source allows time to cross the gap, then closes outside both surfaces", () => {
  const card = setup();
  card.schedule();
  assert.equal(card.closed, 0);
  card.advance(HOVER_DISMISS_DELAY - 1);
  assert.equal(card.closed, 0);
  card.advance(1);
  assert.equal(card.closed, 1);
});

test("entering the preview or returning to its source cancels delayed closure", () => {
  const card = setup();
  card.schedule();
  card.advance(150);
  card.cancel();
  card.advance(1000);
  assert.equal(card.closed, 0);
  card.schedule();
  card.advance(100);
  card.cancel();
  card.advance(1000);
  assert.equal(card.closed, 0);
  assert.equal(card.pending, 0);
});

test("old-node timers cannot dismiss a new preview, and repeated exits keep just one timer", () => {
  const card = setup();
  card.schedule();
  card.cancel(); // Entering another milestone.
  card.advance(1000);
  assert.equal(card.closed, 0);
  card.schedule();
  card.advance(100);
  card.schedule();
  assert.equal(card.pending, 1);
  card.advance(HOVER_DISMISS_DELAY - 1);
  assert.equal(card.closed, 0);
  card.advance(1);
  assert.equal(card.closed, 1);
});

test("keyboard focus retains the preview until focus leaves both surfaces", () => {
  const card = setup();
  card.retain(true);
  card.schedule();
  card.advance(1000);
  assert.equal(card.closed, 0);
  card.retain(false);
  card.schedule();
  card.advance(1000);
  assert.equal(card.closed, 1);
});

test("explicit dismissal ignores retained focus and cleanup prevents late state updates", () => {
  const card = setup();
  card.retain(true);
  card.schedule();
  card.dismiss();
  assert.equal(card.closed, 1);
  card.advance(1000);
  assert.equal(card.closed, 1);
  card.schedule();
  card.cancel(); // Component unmount.
  card.advance(1000);
  assert.equal(card.closed, 1);
});

test("preview accepts pointers across both gap placements and exposes real accessible actions", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(css, /\.global-milestone-tooltip \{[^}]*pointer-events: auto/);
  assert.match(css, /\.global-milestone-tooltip::after \{[^}]*height: 20px/);
  assert.match(css, /\.global-milestone-tooltip.below::after \{ bottom: 100%/);
  assert.match(css, /\.global-milestone-tooltip.above::after \{ top: 100%/);
  assert.equal((app.match(/onPointerLeave=\{leaveHoverCard\}/g) || []).length, 2);
  assert.match(app, /onBlur=\{leaveHoverCard\}/);
  assert.match(app, /onPointerEnter=\{hoverDismissal.cancel\}/);
  assert.match(app, /onFocusCapture=\{hoverDismissal.cancel\}/);
  assert.match(app, /onBlurCapture=\{leaveHoverCard\}/);
  assert.match(app, /event.key !== "Tab"/);
  assert.match(app, /onKeyDown=\{handleHoverCardKeyDown\}/);
  const preview = app.slice(app.indexOf('<aside ref={hoverTooltipRef}'));
  assert.match(preview, /role="dialog" aria-modal="false" aria-labelledby="milestone-preview-title"/);
  assert.doesNotMatch(preview, /aria-hidden="true"/);
  assert.match(preview, /<button type="button" onClick=\{openHoverDetails\}/);
  assert.match(preview, /<a href=\{hoverResearch.url\} target="_blank" rel="noopener noreferrer"/);
  assert.match(app, /setSelected\(hoverCard.node\)/);
  assert.match(app, /useEffect\(\(\) => \(\) => hoverDismissal.cancel\(\), \[hoverDismissal\]\)/);
});
